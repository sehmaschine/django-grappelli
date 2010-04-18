/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 *
 *  Binding to old SelectFilter calls.. cannot be removed because the calls are
 *  hardcoded into django's source..
 *
 *  jslinted - 8 Jan 2010
 */

// AARGH.
function addEvent() {
    var method = arguments[2];
    $(function(){ method.call(); });
}

(function($){

// Legacy compatibility
window.SelectFilter = { 
    init: function(id, name, stacked, admin_media_prefix){ 
        $('#'+id).gSelectFilter({stacked: stacked, name: name});
    }
};

$.widget('ui.gSelectFilter', {
    
    _cache: {avail: [], chosen: []},

    _create: function() {
        var id, ui;
        ui = this;
        id = ui.element.attr('id');
        ui.dom  = {
            wrapper:   $('<div />').appendTo(ui.element.parent()).addClass(ui.option('stacked') ? 'selector stacked' : 'selector'),
            available: $('<div />').addClass('selector-available'),
            chooser:   $('<ul />').addClass('selector-chooser'),
            chosen:    $('<div />').addClass('selector-chosen'),
            title1:    $('<h2 />').text(interpolate(gettext('Available %s'), [ui.option('name')])),
            title2:    $('<h2 />').text(interpolate(gettext('Chosen %s'), [ui.option('name')])),
            choseall:  $('<a href="#" />').text(gettext('Choose all')).addClass('selector-chooseall'),
            clearall:  $('<a href="#" />').text(gettext('Clear all')).addClass('selector-clearall'),
            filter1:   $('<p>&nbsp;</p>').addClass('selector-filter'),
            filter2:   $('<p>&nbsp;</p>').addClass('selector-filter'),
            select:    {chosen: $('<select multiple="multiple" class="filtered" />').attr({id: id + '_to', size: ui.element.attr('size'), name: ui.element.attr('name')}), avail: ui.element }
        };
        
        ui.dom.select.chosen.bind('dblclick.gSelectFilter', function(){
            ui._move('chosen', 'avail');
        });

        
        // Fill cache and remove <p class="info">, because it just gets in the way.
        ui.element.parent().find('p').remove().end().addClass('filtered').find('option').each(function(){
            ui._cache[($(this).is(':selected') && 'chosen' || 'avail')]
                .push({value: $(this).val(), text: $(this).text(), displayed: 1});
        });

        ui.dom.wrapper.append(ui.dom.available, ui.dom.chooser, ui.dom.chosen);
        ui.dom.available.append(ui.dom.title1, ui.dom.filter1, ui.element, ui.dom.choseall);
        ui.dom.chosen.append(ui.dom.title2, ui.dom.filter2, ui.dom.select.chosen, ui.dom.clearall);

        ui.dom.choseall.bind('click.gSelectFilter', function(){
            ui._move_all('avail');
            return false;
        });
        
        ui.dom.clearall.bind('click.gSelectFilter', function(){
            ui._move_all('chosen');
            return false;
        });
        
        $('<li><a href="#" class="selector-add" /></li>').appendTo(ui.dom.chooser)
            .find('a').text(gettext('Add'))
            .bind('click.grappelli', function(){
                ui._move('avail');
                return false;
            });
        
        $('<li><a href="#" class="selector-remove" /></li>').appendTo(ui.dom.chooser)
            .find('a').text(gettext('Remove'))
            .bind('click.grappelli', function(){
                ui._move('chosen');
                return false;
            });

        ui.element.attr({ id: id +'_from', name: ui.option('name') + '_old'})
            .bind('dblclick.gSelectFilter', function(){
                ui._move('avail');
            })
            .parents('form').bind('submit.gSelectFilter', function() { 
                ui._select_all('chosen'); 
            });
        
        $('<input type="text" />').appendTo(ui.dom.filter1)
            .bind('keydown', function(e){ ui._filter_key_up(e, 'avail'); })
            .bind('keyup',   function(e){ ui._filter_key_down(e, 'avail'); });
        
        $('<input type="text" />').appendTo(ui.dom.filter2)
            .bind('keydown', function(e){ ui._filter_key_up(e, 'chosen'); })
            .bind('keyup',   function(e){ ui._filter_key_down(e, 'chosen'); });

            ui._move('avail');
    },

    // Repopulate HTML select box from cache
    _redraw: function(i) {
        var ui, cids, cid, node, w, x, y, z;
        ui   = this;
        cids = i && [i] || ['avail', 'chosen'];

        for (w = 0, x = cids.length; w < x; w++) {
            cid = cids[w];
            ui._sort(cid);
            ui.dom.select[cid].find('option').remove();
            for (y = 0, z = ui._cache[cid].length; y < z; y++) {
                node = ui._cache[cid][y];
                if (node.displayed) {
                    $('<option />').val(node.value).text(node.text).appendTo(ui.dom.select[cid]);
                }
            }
        }
    },
    
    _delete_from_cache: function(cid, value) {
        var ui, node, delete_index, i, j;
        ui = this;
        for (i = 0; (node = ui._cache[cid][i]); i++) {
            if (node.value == value) {
                delete_index = i;
                break;
            }
        }
        j = ui._cache[cid].length - 1;
        for (i = delete_index; i < j; i++) {
            ui._cache[cid][i] = ui._cache[cid][i+1];
        }
        ui._cache[cid].length--;
    },
    
    _add_to_cache: function(cid, option) {
        var ui = this;
        ui._cache[cid].push({value: option.value, text: option.text, displayed: 1});
    },
    
    _cache_contains: function(cid, value) {
        // Check if an item is contained in the cache
        var node;
        for (var i = 0; (node = this._cache[cid][i]); i++) {
            if (node.value == value) { return true; }
        }
        return false;
    },

    _move: function(cid) {
        var ui = this;
        ui.dom.select[cid].find('option').each(function(){
            var $opt = $(this);
            if ($opt.attr('selected') === true && ui._cache_contains(cid, $opt.val())) {
                ui._add_to_cache((cid == 'avail' && 'chosen' || 'avail'), {value: $opt.val(), text: $opt.text(), displayed: 1});
                ui._delete_from_cache(cid, $opt.val());
            }
        });
        ui._redraw();
    },

    _move_all: function(cid) {
        this.dom.select[cid].find('option').attr('selected', 'true');
        this._move(cid);
    },

    _sort: function(cid) {
        this._cache[cid].sort( function(a, b) {
            a = a.text.toLowerCase();
            b = b.text.toLowerCase();
            try {
                if (a > b) { return 1; }
                if (a < b) { return -1; }
            }
            catch (e) {} // silently fail on IE 'unknown' exception
            return 0;
        } );
    },

    _select_all: function(cid) {
        this.dom.select[cid].find('option').attr('selected', 'selected');
    },

    _filter_key_up: function(e, cid) {
        var ui, from, temp;
        ui   = this;
        from = ui.dom.select[cid].get(0);
        // don't submit form if user pressed Enter
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            from.selectedIndex = 0;
            ui._move(cid, (cid == 'avail' && 'chosen' || 'avail'));
            from.selectedIndex = 0;
            return false;
        }
        temp = from.selectedIndex;

        ui.filter(cid, ui.dom.select[cid].prev().find('input').val());
        from.selectedIndex = temp;
        return true;
    },

    _filter_key_down: function(e, cid) {
        var ui, from, old_index;
        ui = this;
        from = ui.dom.select[cid].get(0);
        // right arrow -- move across
        if ((e.which && e.which == 39) || (e.keyCode && e.keyCode == 39)) {
            old_index = from.selectedIndex;
            ui._move(cid, (cid == 'avail' && 'chosen' || 'avail'));
            from.selectedIndex = (old_index == from.length) ? from.length - 1 : old_index;
            return false;
        }
        // down arrow -- wrap around
        if ((e.which && e.which == 40) || (e.keyCode && e.keyCode == 40)) {
            from.selectedIndex = (from.length == from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
        }
        // up arrow -- wrap around
        if ((e.which && e.which == 38) || (e.keyCode && e.keyCode == 38)) {
            from.selectedIndex = (from.selectedIndex === 0) ? from.length - 1 : from.selectedIndex - 1;
        }
        return true;
    },

    // Redisplay the HTML select box, displaying only the choices containing ALL
    // the words in text. (It's an AND search.)
    filter: function(cid, text) {
        var node, token, tokens, ui, i, j;
        tokens = text.toLowerCase().split(/\s+/);
        ui  = this;

        for (i = 0; (node = ui._cache[cid][i]); i++) {
            node.displayed = 1;
            for (j = 0; (token = tokens[j]); j++) {
                if (node.text.toLowerCase().indexOf(token) == -1) {
                    node.displayed = 0;
                }
            }
        }
        ui._redraw(cid);
    }
});

})(jQuery);
