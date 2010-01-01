/*  Author: Maxime Haineault <max@motion-m.ca>
 *  Package: Grappelli
 */
(function($){

// Fail silently if gettext is unavailable
if (typeof(gettext) == 'undefined') {
    function gettext(i) { return i; };
}

$.popup = function(name, href, options) {
    var arr = [];
    var opt = $.extend({width:  600, height: 920, resizable: true, scrollbars: true}, options);
    $.each(opt, function(k, v){ arr.push(k +'='+ v); });
    var win  = window.open(href, name, arr.join(','));
    win.name = name;
    win.focus();
    return win;
};

$.unescapeHTML = function(str) {
    var div = $('<div />').html(str.replace(/<\/?[^>]+>/gi, ''));
    return div.get(0) ? div.text(): '';
};

$(function(){
    
    // Fieldset collapse
    $('.module.collapse-closed h2, .module.collapse-open h2').addClass('collapse-toggle').bind('click.grappelli', function(){
        $(this).parent().toggleClass('collapse-open').toggleClass('collapse-closed');
    });

    // Always focus first field of a form OR the search input
    $('form .form-row:eq(0)')
        .find('input, select, textarea, button').eq(0)
        .add('#searchbar').focus();

    $('.object-tools a[href=history/]').bind('click.grappelli', function(){
        $('<div />').hide().appendTo('body')
            .load($(this).attr('href') +' #content', {}, function(html, rsStatus){
                $(this).dialog({
                    width:  700,
                    title:  $(this).find('h1:first').hide().text(),
                    height: 300        
                }).show();
            })
        return false;
    });
});

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gTimeField
 *  Package: Grappelli
 */
(function($){

$.widget('ui.gTimeField', {
    _init: function() {
        var ui = this;
        ui.dom = {
            picker: $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a href="#" /></p></div>'),
            button: $('<button class="ui-timepicker-trigger" type="button" />'),
        };
        ui.dom.picker.appendTo('body')
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({ display:  'none', position: 'absolute'});

        ui.dom.button
            .bind('click.grappelli', function(){
                ui.toggle(this);
            })
            .insertAfter(ui.element);

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a href="#"></a></li>').find('a')
                .text(button.label).bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    ui.dom.picker.hide();
                    return false;
                }).end()
                .appendTo(ui.dom.picker.find('.timelist'));
        });

        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
        
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    },
    toggle: function(at) {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.hide();
        }
        else {
            ui.show(at);
        }
    },
    show: function(at) {
        var pos = $(at).offset();
        var ui = this;
        $('.clockbox.module:visible').hide();
        ui.dom.picker.show().css({
            top: pos.top - ui.dom.picker.height()/2,
            left: pos.left + 20
        });
        $('body').bind('click.gTimeField', function(e){
            var target = $(e.originalTarget);
            if (!target.hasClass('.clock-title') && !target.hasClass('ui-timepicker-trigger')) {
               ui.hide(); 
            }
        });
    },
    hide: function() {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.dom.picker.hide();
            $('body').unbind('click.gTimeField');
        }
    }
});

$.ui.gTimeField.defaults = {
    mask: '99:99:99', // set to false to disable
    buttons: [
        {label: gettext("Now"), callback: function(e, ui){ 
            return ui.element.val(new Date().getHourMinuteSecond()); 
        }},
        {label: gettext("Midnight"), callback: function(e, ui){ 
            return ui.element.val('00:00:00'); 
        }},
        {label: gettext("6 a.m."), callback: function(e, ui){ 
            return ui.element.val('06:00:00'); 
        }},
        {label: gettext("Noon"), callback: function(e, ui){ 
            return ui.element.val('12:00:00'); 
        }}
    ]
};

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 */
(function($){

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonText:      'Date picker',
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext('Cancel'),
//  buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-calendar.png'
});

$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;
        ui.element.datepicker()
            .parent().find('br').replaceWith('<span class="spacer" />');
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    }
});

$.ui.gDateField.defaults = {
    mask: '9999-99-99', // set to false to disable
};

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gChangelist
 *  Package: Grappelli
 */
(function($){

$.widget('ui.gChangelist', {
    _init: function() {
        var ui = this;
          
        this.table   = ui.element.find('table');
        this.content = ui.element;
        
        // TICKET #11447: td containing a.add-another need.nowrap
        $('table a.add-another').parent('td').addClass('nowrap');

        $('.filterset h3').click(function() {
            $(this).parent()
                .toggleClass('collapse-closed')
                .toggleClass('collapse-open').end()
                .next().next().toggle();
        });
        $('input.search-fields-verbose').click(function() {
            $(this).val('').removeClass("search-fields-verbose");
        });
    
        // SUBMIT FORM WITHOUT "RUN"-BUTTON
        $('div.actions select').change(function(){
            if ($(this).val()) {
                $('div.changelist-content form').submit();
            }
        });

        $(window).resize(function(){ ui.redraw(); });
        ui.redraw();
    },

    /// CHANGELIST functions
    /// in order to prevent overlapping between the result-list
    /// and the sidebar, we insert a horizontal scrollbar instead.
    redraw: function() {
        var ui = this;
        var tw = ui.table.outerWidth();
        var cw = ui.content.outerWidth();

        if (tw > cw) {
            $('#changelist.module.filtered').css('padding-right', 227);
            $('.changelist-content').css('min-width', (tw + 1) +'px');
            $('#changelist-filter').css('border-right', '15px solid #fff');
        }
        if (tw < cw) {
            $('#changelist.module.filtered').css('padding-right', 210);
            $('.changelist-content').css('min-width', 'auto');
            $('#changelist-filter').css('border-right', 0);
        }
    }
});

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gBookmarks
 *  Package: Grappelli
 */
(function($){

$.widget('ui.gBookmarks', {
         
    _init: function() {
        var ui  = this;
        var url = ui.options.url +'?path='+ window.location.pathname +' #bookmarks > li';
        
        this.showMethod = this.options.effects && 'slideDown' || 'show';
        this.hideMethod = this.options.effects && 'slideUp' || 'hide';

        $("li#toggle-bookmarks-listing.enabled")
            .live("mouseover", function(){ ui.show("#bookmarks-listing:hidden"); });
        
        $('#toggle-bookmark-add').live("click", function() { return ui.add(); });
        $('#bookmark-add-cancel').live("click", function() { return ui.cancel(); });
        ui.element.load(url);
    },

    show: function(el) {
        var ui = this;
        $(el)[ui.showMethod]();
        $("#bookmarks").one("mouseleave", function(){ 
            ui.hide("#bookmarks-listing:visible"); 
        });
    },

    hide: function(el) {
        $(el)[this.hideMethod]();
    },

    cancel: function() {
        this.hide("#bookmark-add");
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    add: function() {
        $("#bookmark-title").val($('h1').text());
        $("#bookmark-path").val(window.location.pathname);
        $("#toggle-bookmarks-listing").removeClass('enabled');
        this.show("#bookmark-add");
        return false;
    }
});

$.ui.gBookmarks.defaults = {
    url: BOOKMARKS_URL,
    effects: false
};

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gInlineGroup, gInlineStacked, gInlineTabular
 *  Package: Grappelli
 */
(function($){

$.widget('ui.gInlineGroup', {
    _init: function(){
        var ui = this;
        ui.element.find('input[name*="DELETE"]').hide();
        ui._makeCollapsibleGroups();
        
        // Prevent fields of inserted rows from triggering errors if un-edited
        ui.element.parents('form').bind('submit.gInlineGroup', function(){
            ui.element.find('.inline-related:not(.has_original):not(.has_modifications) div.order :text').val('');
        });
        
        /// ADD HANDLER
        ui.element.find('a.addhandler').bind('click.gInlineGroup', function(e){
            var container = $(this).parents('div.inline-group');
            var lastitem  = container.find('div.inline-related:last');
            var newitem   = lastitem.clone(true).appendTo(container.find('div.items:first'));
            var count     = parseInt(container.find('div.inline-related').length, 10);
            var header    = newitem.find('h3:first');
            e.preventDefault();
            // update new item's header (inline-stacked only)
            if (header.get(0) && container.hasClass('inline-stacked')) {
                header.html("<b>" + $.trim(header.text()).replace(/(\d+)$/, count) + "</b>");
            }
            else {
                header.remove(); // fix layout bug in inline-tabular
            }
            
            /// set TOTAL_FORMS to number of items
            container.find('input[id*="TOTAL_FORMS"]').val(count);
            
            ui._initializeItem(newitem, count);
            return false;
        });
        
        /// DELETEHANDLER
        ui.element.find('a.deletelink').bind("click.gInlineGroup", function() {
            var cp = $(this).prev(':checkbox');
            cp.attr('checked', !cp.attr('checked'));
            $(this).parents('div.inline-related').toggleClass('predelete');
            return false;
        });
        
        // Autodiscover if sortable
        if (ui.element.find('.order').get(0)) {
            ui._makeSortable();
        }
        
        ui.element.find('.addhandler').bind('click.gInlineGroup', function(){
            ui._refreshOrder();
        });
        
        ui._refreshOrder();
    },
    
    _initializeItem: function(el, count){
        
        /// replace IDs, NAMEs, HREFs & FORs ...
        el.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
            var $el = $(this);
            $.each(['id', 'name', 'for', 'href'], function(i, k){
                if ($el.attr(k)) {
                    $el.attr(k, $el.attr(k).replace(/-\d+-/g, '-'+  (count - 1) +'-'));
                }
            });
        });
        
        // destroy and re-initialize datepicker (for some reason .datepicker('destroy') doesn't seem to work..)
        el.find('.vDateField').unbind().removeClass('hasDatepicker').val('')
            .next().remove().end().end()
            .find('.vTimeField').unbind().val('').next().remove();
        
        // date-/timefield
        el.find('.vDateField').gDateField();
        el.find('.vTimeField').gTimeField();
        
        /// remove error-lists and error-classes
        el.find('ul.errorlist').remove().end()
            .find('.errors, .error').removeClass("errors error");
        
        /// tinymce
        el.find('span.mceEditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            el.find('#' + id).css('display', '');
            tinyMCE.execCommand("mceAddControl", true, id);
        });
        
        el.find(':input').val('').end() // clear all form-fields (within form-cells)
            .find("strong").text('');     // clear related/generic lookups
        
        // little trick to prevent validation on un-edited fields
        el.find('input, textarea').bind('keypress.gInlineGroup', function(){
              el.addClass('has_modifications');
          }).end()
          .find('select, :radio, :checkbox').bind('keypress.gInlineGroup', function(){
              el.addClass('has_modifications');
          });
          
        return el;
    },
    
    open: function() {
        return this.element.data('collapsed', false)
            .removeClass('collapse-closed')
            .addClass('collapse-open')
    },
    
    close: function() {
        return this.element.data('collapsed', true)
            .removeClass('collapse-open')
            .addClass('collapse-closed')
    },
    
    toggle: function() {
        return this.is_open() && this.close() || this.open();
    },
    
    is_closed: function() {
        return this.element.data('collapsed');
    },
    
    is_open: function() {
        return !this.is_closed();
    },
    
    is_collapsable: function() {
        return this.element.hasClass('collapse-closed') || this.element.hasClass('collapse-open');
    },
    
    // INLINE GROUPS COLLAPSE (STACKED & TABULAR)
    _makeCollapsibleGroups: function() {
        var ui = this;
        if (ui.is_collapsable()) {
            if (ui.element.hasClass('collapse-closed')) {
                ui.close();
            } 
            else {
                ui.open();
            }
            
            ui.element.find(' > h2').addClass('collapse-toggle')
                .bind("click.gInlineGroup", function(){
                    ui.toggle();
                });
        }
    },
    
    _makeSortable: function() {
        var ui   = this;
        var grip = $('<span class="ui-icon ui-icon-grip-dotted-vertical" />');
        //ui.element.find('.order').hide();
        if (ui.element.hasClass('inline-stacked')) {
            grip.prependTo(ui.element.find('.items .inline-related h3:first-child'));
        }
        else if (ui.element.hasClass('inline-tabular')) {
            grip.prependTo(ui.element.find('.items div.inline-item-tools'));
        }
        ui.element.find('.items')
            .sortable({
            axis: 'y',
            cursor: 'move',
            forcePlaceholderSize: true,
            helper: 'clone',
            opacity: 0.7,
            items: '.inline-related',
            appendTo: ui.element.find('.items'),
            update: function(e, inst){
                ui._refreshOrder();
            }
        });
    },
    
    _refreshOrder: function() {
        var index = 1;
        var ui = this;
        ui.element.find('.order input[type=text]').each(function(){
            $(this).val(index);
            index++;
            
            if (!$(this).parents('.inline-related').hasClass('has_original')) {
                var tools = $(this).parents('.module').find('ul.inline-item-tools');
                if (tools.get(0)) {
                    if (!tools.find('.deletelink').get(0)) {
                        $('<li><a title="Delete Item" class="deletelink" href="#"/></li>').appendTo(tools)
                            .find('a').bind('click.grappelli', function(){
                                $(this).parents('.inline-related').remove();
                                return false;
                            });
                    }
                }
            }
        });
    }
});

$.ui.gInlineGroup.defaults = {
};

// INLINE STACKED 

$.widget('ui.gInlineStacked', {
    _init: function(){
        var ui = this;
        ui._makeCollapsible();
        
        // FIELDSETS WITHIN STACKED INLINES
        /* OBSOLETE ?
        ui.element.find('.inline-related').find('fieldset[class*="collapse-closed"]')
            .addClass("collapsed").find('h4:first').addClass("collapse-toggle").end()
            .find('fieldset[class*="collapse-open"] h4:first').addClass("collapse-toggle")
            .bind("click", function(e){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
        });
        */
    },
    _makeCollapsible: function() {
        var ui = this;
        // COLLAPSE OPEN/CLOSE ALL BUTTONS
        ui.element.find('a.closehandler').bind("click", function(){
            $(this).parents('div.inline-stacked')
                .find('div.inline-related')
                    .removeClass('collapse-open')
                    .addClass('collapsed collapse-closed');
        });
        ui.element.find('a.openhandler').bind("click", function(){
            $(this).parents('div.inline-stacked')
                .find('div.inline-related')
                    .removeClass('collapsed collapse-closed')
                    .addClass('collapse-open');
        });
        
        ui.element.find('.inline-related')
            .addClass("collapsed")
            .find('h3:first-child')
                .addClass('collapse-toggle')
                .bind("click", function(){
                    var p = $(this).parent();
                    if (!p.hasClass('collapsed') && !p.hasClass('collapse-closed')) {
                        p.addClass('collapsed')
                         .addClass('collapse-closed')
                         .removeClass('collapse-open');
                    }
                    else {
                        p.removeClass('collapsed')
                         .removeClass('collapse-closed')
                         .addClass('collapse-open');
                    }
                });
        if (ui.element.hasClass('collapse-open-items')) {
            ui.element.find('.inline-related.collapse-closed.collapsed')
                .removeClass('collapse-closed collapsed').addClass('collapse-open');
        }
        
        /// OPEN STACKEDINLINE WITH ERRORS (onload)
        $('.inline-group:has(.errors)').removeClass('collapse-closed collapsed').addClass('collapse-open');
    },
});
$.ui.gInlineStacked.defaults = {
    collapsible: true,
};

// INLINE TABULAR

$.widget('ui.gInlineTabular', {
    _init: function(){
        var ui = this;
        
        ui.element.find('.inline-related h3:first').remove(); // fix layout bug
        
        /// add predelete class (only necessary in case of errors)
        ui.element.find('input[name*="DELETE"]:checked').each(function(i) {
            $(this).parents('div.inline-related').addClass('predelete');
        });
        
        /// OPEN TABULARINLINE WITH ERRORS (onload)
        ui.element.filter('.inline-tabular').find('div[class*="error"]:first').each(function(i) {
            $(this).parents('div.inline-tabular').removeClass("collapsed");
        });
    },
});

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 *
 *  Binding to old SelectFilter calls.. cannot be removed because the calls are
 *  hardcoded into django's source..
 */
(function($){

var SelectFilter = { 
    init: function(id, name, stacked, admin_media_prefix){ 
        $('#'+id).gSelectFilter({stacked: stacked, name: name});
    }
};

$.widget('ui.gSelectFilter', {
    _cache: {avail: [], chosen: []},
    _init: function() {
        var ui   = this;
        var id   = ui.element.attr('id');

        ui.dom  = {
            wrapper:   $('<div />').appendTo(ui.element.parent()).addClass(ui.options.stacked ? 'selector stacked' : 'selector'),
            available: $('<div />').addClass('selector-available'),
            chooser:   $('<ul />').addClass('selector-chooser'),
            chosen:    $('<div />').addClass('selector-chosen'),
            title1:    $('<h2 />').text(interpolate(gettext('Available %s'), [ui.options.name])),
            title2:    $('<h2 />').text(interpolate(gettext('Chosen %s'), [ui.options.name])),
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

        ui.element.attr({ id: id +'_from', name: ui.options.name + '_old'})
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
    _redraw: function(cid) {
        var ui  = this;
        var cids = cid && [cid] || ['avail', 'chosen'];

        for (var x = 0, y = cids.length; x < y; x++) {
            var cid = cids[x];
            ui._sort(cid);
            ui.dom.select[cid].find('option').remove();
            for (var i = 0, j = ui._cache[cid].length; i < j; i++) {
                var node = ui._cache[cid][i];
                if (node.displayed) {
                    $('<option />').val(node.value).text(node.text).appendTo(ui.dom.select[cid]);
                }
            }
        }
    },
    
    _delete_from_cache: function(cid, value) {
        var ui = this;
        var node, delete_index = null;
        for (var i = 0; (node = ui._cache[cid][i]); i++) {
            if (node.value == value) {
                delete_index = i;
                break;
            }
        }
        var j = ui._cache[cid].length - 1;
        for (var i = delete_index; i < j; i++) {
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
            if ($opt.attr('selected') == true && ui._cache_contains(cid, $opt.val())) {
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
                if (a > b) return 1;
                if (a < b) return -1;
            }
            catch (e) {} // silently fail on IE 'unknown' exception
            return 0;
        } );
    },
    _select_all: function(cid) {
        this.dom.select[cid].find('option').attr('selected', 'selected');
    },
    _filter_key_up: function(e, cid) {
        var ui = this;
        from = ui.dom.select[cid].get(0);
        // don't submit form if user pressed Enter
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            from.selectedIndex = 0;
            ui._move(cid, (cid == 'avail' && 'chosen' || 'avail'));
            from.selectedIndex = 0;
            return false;
        }
        var temp = from.selectedIndex;

        ui.filter(cid, ui.dom.select[cid].prev().find('input').val());
        from.selectedIndex = temp;
        return true;
    },
    _filter_key_down: function(e, cid) {
        var ui = this;
        from = ui.dom.select[cid].get(0);
        // right arrow -- move across
        if ((e.which && e.which == 39) || (e.keyCode && e.keyCode == 39)) {
            var old_index = from.selectedIndex;
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
            from.selectedIndex = (from.selectedIndex == 0) ? from.length - 1 : from.selectedIndex - 1;
        }
        return true;
    },

    // Redisplay the HTML select box, displaying only the choices containing ALL
    // the words in text. (It's an AND search.)
    filter: function(cid, text) {
        var tokens = text.toLowerCase().split(/\s+/);
        var node, token;
        var ui  = this;

        for (var i = 0; (node = ui._cache[cid][i]); i++) {
            node.displayed = 1;
            for (var j = 0; (token = tokens[j]); j++) {
                if (node.text.toLowerCase().indexOf(token) == -1) {
                    node.displayed = 0;
                }
            }
        }
        ui._redraw(cid);
    }
});

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gActions
 *  Package: Grappelli
 */
(function($){

$.widget('ui.gActions', {
    _init: function() {
        var ui = this;
        $('#action-toggle').show().bind('click.grappelli', function(){
            ui.element.find('.result-list input.action-select').attr('checked', $(this).attr('checked'));
        });
    }
});

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gAutocomplete
 *  Package: Grappelli
 *  Todo:
 *   - Caching
 *
 *
 * */
(function($){

$.fn.prevOrLast = function() {
    return $(this).prev().length > 0 && $(this).prev() || $(this).parent().children(':last');
};
$.fn.nextOrFirst = function() {
    return $(this).next().length > 0 && $(this).next() || $(this).parent().children(':first');
};

$.widget('ui.gAutocomplete', {
    _lastRequest: 0,
    _results: [],
    _select_onload: false,
    _lookup: function(id) {
        var ui = this;
        $.get(ui.options.lookup_url, {object_id: id, app_label: 'sites', model_name: 'site'}, function(data) {
            if (data) {
                ui.dom.input.val(decodeURI(data));
            }
        });
    },
    _init: function() {
        var ui = this;
        ui.dom = {
            wrapper: ui._createElement('div',   {ns: 'wrapper'}).addClass('ui-corner-bottom').hide(), 
            results: ui._createElement('ul',    {ns: 'results'}), 
            input:   ui._createElement('input', {ns: 'autocomplete', attr:{type: 'text'}}).addClass('vAutocompleteSearchField'), 
            browse:  ui._createElement('a',     {ns: 'browse', attr:{href: ui.options.related_url, title: 'Browse'}}).addClass('ui-corner-left ui-state-default')
                                                                .append('<span class="ui-icon ui-icon-'+ ui.options.browseIcon +'">Browse</span>'), 
        };
        
        $('[name="'+ ui.element.attr('id') +'"]').bind('updated', function(e){
            ui._lookup($(this).val());
            ui.dom.input.focus();
        });
        ui.element.attr('name', ui.element.attr('id'));

        if (ui.element.val()) {
            ui.dom.input.val(ui.element.val());
        }

        ui.dom.input.insertAfter(ui.element.hide());
        if (ui.options.width) {
            ui.dom.input.width(ui.options.width)
        }
        var width = ui.dom.input.width() 
                        + parseInt(ui.dom.input.css('padding-left').slice(0, -2), 10) 
                        + parseInt(ui.dom.input.css('padding-right').slice(0, -2), 10);
        if (ui.options.browse) {
            var w = ui.dom.input.width();
            ui.dom.browse.insertBefore(ui.dom.input).attr('id', 'lookup_id_'+ ui.element.attr('id'))
                .hover(function(){ $(this).addClass('ui-state-hover'); }, function(){ $(this).removeClass('ui-state-hover'); })
                .bind('click.browse', function(){
                    return showRelatedObjectLookupPopup(this); 
                });

            ui.dom.input
                .css({
                    marginLeft: '-22px', 
                    paddingLeft: '24px', 
                    width: w - 22 +'px'
                })
                .bind('focus.browse', function(){ ui.dom.browse.addClass('focus'); })
                .bind('blur.browse',  function(){ ui.dom.browse.removeClass('focus'); });
            width = width - 23;
        }
        ui.dom.wrapper
            .append(ui.dom.results)
            .insertAfter(ui.dom.input)
            .css({
                //left: ui.dom.input.position().left + ui.dom.wrapper.css('margin-left'), 
                position: 'absolute'
            }).width(width);
        
        ui._bind(ui.dom.input, 'keydown', function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            var noCompletes = [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 8, 9];
            switch(kc) {
                case key.UP:     return ui._select('prev'); break;
                case key.DOWN:   return ui._select('next'); break;
                case key.ENTER:  e.preventDefault(); return ui._choose(); break;
                case key.ESCAPE: return ui._cancel(); break;
                default:
                return true;
                break;
            }
        });

        //ui._bind(ui.dom.input, 'blur', function(){ ui._hideList(); });
        ui.dom.input.delayedObserver(function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            var noCompletes = [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 9];
            switch(kc) {
                default:
                // Option: minChar
                if ($(this).val().length >= ui.options.minChars) { 
                    if ($.inArray(kc, noCompletes) < 0) {
                        ui._autocomplete();
                    }
                }
                else {
                    ui.dom.wrapper.hide();
                    ui._selected().removeClass('selected');
                    if ($(this).val().length == 0) {
                        ui._setVal();
                    }
                }
                return true;
                break;
            }
        }, ui.options.delay);
    },
    _setVal: function(val) {
        var ui = this;
        if (val) {
            $('[name="'+ ui.element.attr('id') +'"]').val(val.id);
            ui.dom.input.val($.format(ui.options.inputFormat, val));
        }
        else {
            $('[name="'+ ui.element.attr('id') +'"]').val('');
            ui.dom.input.val('');
        }
    },
    _createElement: function(type, options) {
        var ui = this;
        var el = $('<'+ type +' />');
        var op = options || {};
        if (op.ns)           { el.addClass(ui.widgetBaseClass +'-'+ op.ns); }
        if (op.attr)         { el.attr(op.attr); }
        return el;
    },
    _bind: function(element, eventName, callback) {
        var ui = this; 
        element.bind(eventName +'.'+ ui.widgetEventPrefix, function(e){
            return callback.apply(this, [e, ui]);
        });
    },
    _callback: function(e, ui) {
    },
    _hideList: function() {
        var ui = this;
        if (ui.dom.wrapper.is(':visible')){
            ui.dom.wrapper.hide();
            $('html').unbind('click.gAutocomplete');
        }
    },
    _showList: function(){
        var ui = this;
        if (ui.dom.wrapper.is(':hidden')){
            ui.dom.wrapper.show();
            $('html').bind('click.gAutocomplete', function(e){
                if (!$(e.target).hasClass('ui-gAutocomplete-autocomplete')) {
                    ui._hideList();
                }
            });
        }
    },
    _select: function(which) {
        var ui = this;
        ui._showList();
        var selected = ui._selected();
        if (selected.length > 0) {
            var li = selected.removeClass('selected')[(which == 'prev' && 'prevOrLast' || 'nextOrFirst')]();
        }
        else {
            var li = ui.dom.results.find((which == 'prev' && 'li:last-child' || 'li:first-child')).addClass('selected');
        }
        li.addClass('selected');
        ui._choose(true);
        return true;
    },
    _selected: function() {
        return this.dom.results.find('li.selected');
    },
    _autocomplete: function() {
        var ui  = this;
        var url = ui.options.backend +'?q='+ ui.dom.input.val();
        var lr  = ++ui._lastRequest;

        // Option: maxResults
        if (ui.options.maxResults) {
            url = url + '&limit='+ ui.options.maxResults;
        }
        // Option: throbber
        if (ui.options.throbber) {
            ui.dom.input.addClass('searching');
        }
        ui._showList();
        $.getJSON(url, function(json, responseStatus){
            // process the request only if it's successful and it's the last sent (avoid race conditions)
            ui.dom.input.removeClass('searching');
            if (responseStatus == 'success' && lr == ui._lastRequest) {
                ui._results = json;
                ui._redraw();
            }
        });
    },
    results: function() {
        return this._results;         
    },
    _choose: function(nonSticky) {
        var ui = this;
        var node = ui.dom.results.find('.selected');
        if (node.data('json')) {
            ui._setVal(node.data('json'));
            if (nonSticky) { // remember value in case of cancel
                ui.dom.input.data('sticky', ui.dom.input.val());
            }
            else {
                ui._hideList();
            }
        }
        else if (node.data('create') && !nonSticky) {
            // create object ..
            if (ui.element.nextAll('.add-another').length) {
                ui.element.nextAll('.add-another').trigger('click');
            }
            // ui._hideList();
        }
        ui.element.trigger($.Event({type: 'complete', sticky: !nonSticky, data: node.data('json')}));
        return false;
    },
    _cancel: function() {
        var ui = this;
        ui.dom.results.find('.selected').removeClass('selected');
        if (ui.dom.input.data('sticky')) {
            ui.dom.input.val(ui.dom.input.data('sticky'));
            ui.dom.input.data('sticky', false);
        }
        ui._hideList();
        return false;
    },
    _redraw: function() {
        var ui = this;
        var rs = ui.options.maxResults && ui._results.slice(0, ui.options.maxResults) || ui._results;
        ui.element.trigger('redraw');
        ui.dom.results.empty();

        if (rs.length > 0) {
            $.each(rs, function(){
                var txt = $.format(ui.options.listFormat, this);
                var li  = ui._createElement('li', {ns: 'result'}).data('json', this).appendTo(ui.dom.results)
                
                // Option: highlight
                if (ui.options.highlight) {
                    li.html(txt.replace(new RegExp("("+ ui.dom.input.val() +")", "gi"),'<b>$1</b>'));
                }
                else {
                    li.text(txt);
                }
                ui.dom.input.removeClass('no-match');
                ui.dom.results.find('.selected').removeClass('selected');
                ui._bind(li, 'mouseover', function() { ui._shiftSelection(this); });
                ui._bind(li, 'click',     function() { ui._shiftSelection(this)._choose(); });
                ui._showList();
            });
        }
        else {
            ui.dom.input.addClass('no-match');
             if (ui.options.create) {
                var li  = ui._createElement('li', {ns: 'result'}).data('create', true);
                li.text(ui.options.createText);
                ui.dom.results.html(li);
                ui._showList();
             }
        }
        ui.element.trigger('redrawn');
    },
    _shiftSelection: function(el) {
        $(el).addClass('selected').siblings().removeClass('selected');
        return this;
    }
});

$.ui.gAutocomplete.getter = ['results'];

$.ui.gAutocomplete.defaults = {
    highlight:  true,
    browse:     true,
    throbber:   true,
    delay:      0.5,
    minChars:   2,
    maxResults: 20,
    width:      false,
    browseIcon: 'search', // see http://jqueryui.com/themeroller/ for available icons
    create:     false, // buggy
    createText: 'Create a new object',
    lookup_url: '/grappelli/lookup/related/'
};

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gFacelist
 *  Package: Grappelli
 */
(function($){

$.widget('ui.gFacelist', {
    _init: function(){
        var ui = this;

        // erh.. jquery UI < 1.8 fix: http://dev.jqueryui.com/ticket/4366
        ui.options.autocomplete = $.extend($.ui.gFacelist.defaults.autocomplete, ui.options.autocomplete);

        ui.element.hide().parent().find('p.help').remove();

        ui.dom = {
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}).width(700),
            toolbar:  ui._createElement('div',  {ns: 'toolbar'}).addClass('ui-corner-top ui-state-default'),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            input:    ui._createElement('input',{ns: 'search', attr: {maxlength: ui.options.searchMaxlength}})
                        .addClass('vM2MAutocompleteSearchField').width(100)
        };

        ui.dom.input.wrap('<li />').parent().appendTo(ui.dom.facelist);
        ui.dom.wrapper.append(ui.dom.toolbar, ui.dom.facelist).insertAfter(ui.element)

        if (ui.options.browse) {
            ui.dom.browse = ui._button('browse', {href: '#', title: 'Browse'}),
            ui.dom.toolbar.append(ui.dom.browse)
        }
        if (ui.options.clear) {
            ui.dom.clear = ui._button('clear', {href: '#', title: 'Clear all'}),
            ui.dom.toolbar.append(ui.dom.clear)
        }
        if (ui.options.message) {
            ui.dom.message = ui._createElement('span', {ns: 'message'}).text('No item selected');
            ui.dom.toolbar.append(ui.dom.message);
        }
        
        ui.dom.input.gAutocomplete(ui.options.autocomplete);
        // hide selected items
        ui.dom.input.bind('redrawn', function(e){
            var rs = ui.dom.input.gAutocomplete('results');
            var ids = $.makeArray(ui.dom.facelist.find('.ui-gFacelist-item').map(function(){
                return $(this).data('json').id
            }));
            var div = $(this).nextAll('div');
            div.find('li').each(function(){
                if ($.inArray($(this).data('json').id, ids) >= 0) {
                    $(this).hide();
                }
            });
            if (div.find('li:visible').length < 1) {
                ui.dom.facelist.find('.ui-gAutocomplete-autocomplete').addClass('no-match');
            }
        });

        ui.dom.ac = ui.dom.wrapper.find('.ui-gAutocomplete-autocomplete');
        ui.dom.ac
            .bind('focus.gFacelist', function(){ ui.dom.facelist.addClass('focus'); })
            .bind('blur.gFacelist',  function(){ ui.dom.facelist.removeClass('focus'); })

        ui._bind(ui.dom.wrapper, 'click', function(e){ 
            if (!$(e.target).hasClass('ui-gAutocomplete-autocomplete')) {
                $(this).find('input').focus(); 
            }
        });
                          
        ui._bind(ui.dom.ac, 'keydown', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.BACKSPACE:
                    if (!ui.dom.ac.val().length) {
                        ui.dom.input.parent().prev().remove();
                    }
                break;
                case $.ui.keyCode.ENTER:    
                    return false;
                break;
            }
        });

        ui._bind(ui.dom.ac, 'keyup', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.ESCAPE:   
                    ui.dom.ac.val(''); 
                break;
            }
        });
        ui._bind(ui.dom.input, 'complete', function(e){
            if (e.originalEvent.sticky) {
                ui._addItem(e.originalEvent.data); 
                ui._message(); 
            }
        });

    },
    _message: function(msg) {
        var ui = this;
        if (!msg && ui.options.message) {
            var count = ui.dom.facelist.find('.ui-gFacelist-item').length;
            var msg = count > 1 && '{0:d} selected messages' || '{0:d} selected message';
            ui.dom.message.text($.format(msg, count));
        }
    },
    _addItem: function(data) {
        var ui = this;
        var val = ui.dom.ac.val();
        if (val != '') {
            var label = $('<span />').text(val);
            var button = ui._createElement('li', {ns: 'item'})
                    .html(label)
                    .data('json', data)
                    .addClass('ui-corner-all')
                    .bind('click.gFacelist', function(){
                        $(this).remove();
                    })
                    .insertBefore(ui.dom.input.parent());
            ui.dom.ac.val('');
            return button;
        }
    },
    _button: function(ns, attr) {
        var ui = this;
        var at = attr || {};
        var el = ui._createElement('a', {ns: ns, attr: attr })
                .addClass('ui-state-default')
                .hover(function(){ $(this).addClass('ui-state-hover'); }, 
                       function(){ $(this).removeClass('ui-state-hover'); });
        if (ui.options.buttonIcon[ns]) {
            el.append('<span class="ui-icon ui-icon-'+ ui.options.buttonIcon[ns] +'">Add</span>');
        }
        return el;
    },
    _createElement: function(type, options, innerHTML) {
        var ui = this;
        var el = $('<'+ type +' />');
        var op = options || {};
        if (type != 'input') { el.addClass('ui-helper-reset'); }
        if (op.ns)           { el.addClass(ui.widgetBaseClass +'-'+ op.ns); }
        if (op.attr)         { el.attr(op.attr); }
        return el;
    },
    _bind: function(element, eventName, callback) {
        var ui = this; 
        element.bind(eventName +'.'+ ui.widgetEventPrefix, function(e){
            return callback.apply(this, [e, ui]);
        });
    },
});
$.ui.gFacelist.defaults = {
    browse:   true,
    clearAll: true,
    message:  true,
    buttonIcon: { // see http://jqueryui.com/themeroller/ for available icons
        browse: 'search', 
        clear:  'closethick',
        add:    'plusthick'
    },
    autocomplete: {
        highlight:  true,
        browse:     false,
        throbber:   false,
        minChars:   1,
        maxResults: 20,
        width:      100
    }
};

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 */
(function($){

// Abstract base class for gRelated and gGenericRelated

$.RelatedBase = {
    _url: function(k) {
        return this.options.getURL(k);
    },
    _disable: function(state) {
        this.dom.object_id.attr('disabled', state); 
    },
    _browse: function(link) {
        var link = $(link);
        // IE doesn't like periods in the window name, so convert temporarily.
        var name = link.data('id').replace(/\./g, '___'); 
        var href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        this._win = $.popup(name, href, {
                    height: 600 , width: 920, resizable: true, scrollbars: true});
        return false;
    },
    _lookup: function(e){
        var ui   = this;
        var text = ui.dom.text;
        if(ui.dom.link.attr('href')) {
            var app_label  = ui.dom.link.attr('href').split('/').slice(-3,-2);
            var model_name = ui.dom.link.attr('href').split('/').slice(-2,-1);

            if (ui.dom.object_id.val() == '') {
                ui.dom.text.text('');
            }
            else {
                ui.dom.text.text('loading ...');

                var url = ui.options[ui.dom.object_id.hasClass('vManyToManyRawIdAdminField') && 'm2mUrl' || 'url'];
                
                // get object
                $.get(url, {object_id: ui.dom.object_id.val(), app_label: app_label, model_name: model_name}, function(data) {
                    var item = data;
                    //ui.dom.text.text('');
                    if (item) {
                        var tl = (ui.options.maxTextLength - ui.options.maxTextSuffix.length);
                        if (item.length > tl) {
                            var txt = decodeURI(item.substr(0, tl) + ui.options.maxTextSuffix);
                            ui.dom.text.text(txt);
                        } else {
                            ui.dom.text.text(decodeURI(item));
                        }
                    }
                });
            }
        }
    }
};

$.RelatedDefaultsBase = {
    maxTextLength: 32,
    maxTextSuffix: ' ...',
    url: '/grappelli/lookup/related/',
    m2mUrl: '/grappelli/lookup/m2m/',
    getURL: function(k) {
        return MODEL_URL_ARRAY[k] && ADMIN_URL + MODEL_URL_ARRAY[k]  +'/?t=id' || '';
    }
};


$.widget('ui.gRelated', $.extend($.RelatedBase, {
    _init: function() {
        var ui = this;
        ui.dom = {
            object_id: ui.element,
            text: $('<strong />')
        };
        ui.dom.link = ui.element.next();
        ui.dom.text.insertAfter(ui.dom.link);
        ui.dom.object_id
            .bind('keyup.gRelated focus.gRelated', function(e){
                ui._lookup(e);
            });
    }
}));

$.ui.gRelated.defaults = $.RelatedDefaultsBase;

$.widget('ui.gGenericRelated', $.extend($.RelatedBase, {
    _init: function(){
        var ui = this;

        ui.dom = {
            object_id: ui.element,
            content_type: $('#'+ ui.element.attr('id').replace('object_id', 'content_type')),
            link: $('<a class="related-lookup" />'),
            text: $('<strong />')
        };

        ui._disable(!ui.dom.content_type.val());

        ui.dom.content_type.bind('change.gGenericRelated, keyup.gGenericRelated', function() {
            var $el = $(this);
            var href = ui._url($el.val());
            ui.dom.object_id.val('');
            ui.dom.text.text('');
            ui._disable(!$el.val());
            if ($el.val()) {
                var link = ui.dom.object_id.next('.related-lookup');
                if (link.get(0)) {
                    link.attr('href', href);
                }
                else {
                    ui.dom.link.insertAfter(ui.dom.object_id)
                        .after(ui.dom.text)
                        .bind('click.gGenericRelated', function(e){
                            e.preventDefault();
                            return ui._browse(this);
                        })
                        .data('id', ui.dom.object_id.attr('id'))
                        .attr({id: 'lookup_'+ ui.dom.object_id.attr('id'), href: href});
                }
            } 
            else {
                ui.dom.object_id.val('');
                ui.dom.object_id.parent().find('.related-lookup, strong').remove();
            }
        });

        ui.dom.object_id.bind('keyup.gGenericRelated focus.gGenericRelated', function(e){
            ui._lookup(e);
        });
    }
}));

$.ui.gGenericRelated.defaults = $.RelatedDefaultsBase

function showRelatedObjectLookupPopup(link) {
    var link = $(link);
    var name = link.attr('id').replace(/^lookup_/, '').replace(/\./g, '___');
    var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + 'pop=1';
    win = $.popup(name, href, {height: 600 , width: 900, resizable: true, scrollbars: true});
    win.focus();
    return false;
}


function dismissRelatedLookupPopup(win, id) {
    var el = $('#'+ win.name.replace(/___/g, '.'));
    if (el.hasClass('vManyToManyRawIdAdminField') && el.val()) {
        el.val($.format('{0:s},{1:s}', el.val(), id));
        el.focus();
    }
    else {
        el.val(id);
        if (el.hasClass('vAutocompleteRawIdAdminField')) {
            el.trigger($.Event({type: 'updated'}));
        }
        else {
            el.focus();
        }
    }
    win.close();
}

function showAddAnotherPopup(link) {
    var link = $(link);
    var name = link.attr('id').replace(/^add_/, '').replace(/\./g, '___');
    var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + '_popup=1';
    win = $.popup(name, href, {height: 600 , width: 920, resizable: true, scrollbars: true});
    win.focus();
    return false;
}

function dismissAddAnotherPopup(win, newId, newRepr) {
    // newId and newRepr are expected to have previously been escaped by django.utils.html.escape.
    var $el  = $('#'+ win.name.replace(/___/g, '.'));
    if ($el.get(0)) {
        if ($el.get(0).nodeName == 'SELECT') {
            var select = $el;
            var t = $el.attr('id').split(/(\-\d+\-)/); // account for related inlines
            if (t.length === 3) {
                var select = $('select[id^="'+ t[0] +'"][id$="'+ t[2] +'"]');
            }
            $('<option />').attr('selected', true)
                .val(newId).appendTo(select)
                .text($.unescapeHTML(newRepr));

        } else if ($el.get(0).nodeName == 'INPUT') {
            $el.val(newId);
        }
        $el.focus();
    }
    win.close();
}


//if (/&pop/.test(window.location.search)) {
//    alert('blah');
//    $('.result-list tbody tr a:first-child')
//        .bind('click.gRelatedBrowse', function(){
//              alert('test');
//              var t = $(this).parents('tr').find('td:first-child :checkbox').val();
//              return false;
//            opener.dismissRelatedLookupPopup(window, '2'); return false;
//        });
//}
//

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gAutoSlugField
 *  Package: Grappelli
 *  Requies: jquery.slugify.js
 */
(function($){

$.widget('ui.gAutoSlugField', {
    _refresh: function(e, el) {
        var val = $.slugify(el.val());
        if (val != '') {
            this.element.val(val);
        }
    },
    _init: function() {
        var ui = this;
        if (ui.element.attr('rel')) {
            $('#id_'+ ui.element.attr('rel')).bind('keyup.gAutoSlugField', function(e) {
                ui._refresh(e, $(this));
            });
        }
         ui.element.delayedObserver(function(e) {
             ui._refresh(e, $(this));
         }, ui.options.delay);
    }
});

$.ui.gAutoSlugField.defaults = {
    delay: 0.8
};

})(jQuery);
(function($){

    var LATIN_MAP = {
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç':
        'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I',
        'Ï': 'I', 'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö':
        'O', 'Ő': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ű': 'U',
        'Ý': 'Y', 'Þ': 'TH', 'ß': 'ss', 'à':'a', 'á':'a', 'â': 'a', 'ã': 'a', 'ä':
        'a', 'å': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó':
        'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ő': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u',
        'û': 'u', 'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y'
    };
    var LATIN_SYMBOLS_MAP = {
        '©':'(c)'
    };
    var GREEK_MAP = {
        'α':'a', 'β':'b', 'γ':'g', 'δ':'d', 'ε':'e', 'ζ':'z', 'η':'h', 'θ':'8',
        'ι':'i', 'κ':'k', 'λ':'l', 'μ':'m', 'ν':'n', 'ξ':'3', 'ο':'o', 'π':'p',
        'ρ':'r', 'σ':'s', 'τ':'t', 'υ':'y', 'φ':'f', 'χ':'x', 'ψ':'ps', 'ω':'w',
        'ά':'a', 'έ':'e', 'ί':'i', 'ό':'o', 'ύ':'y', 'ή':'h', 'ώ':'w', 'ς':'s',
        'ϊ':'i', 'ΰ':'y', 'ϋ':'y', 'ΐ':'i',
        'Α':'A', 'Β':'B', 'Γ':'G', 'Δ':'D', 'Ε':'E', 'Ζ':'Z', 'Η':'H', 'Θ':'8',
        'Ι':'I', 'Κ':'K', 'Λ':'L', 'Μ':'M', 'Ν':'N', 'Ξ':'3', 'Ο':'O', 'Π':'P',
        'Ρ':'R', 'Σ':'S', 'Τ':'T', 'Υ':'Y', 'Φ':'F', 'Χ':'X', 'Ψ':'PS', 'Ω':'W',
        'Ά':'A', 'Έ':'E', 'Ί':'I', 'Ό':'O', 'Ύ':'Y', 'Ή':'H', 'Ώ':'W', 'Ϊ':'I',
        'Ϋ':'Y'
    };
    var TURKISH_MAP = {
        'ş':'s', 'Ş':'S', 'ı':'i', 'İ':'I', 'ç':'c', 'Ç':'C', 'ü':'u', 'Ü':'U',
        'ö':'o', 'Ö':'O', 'ğ':'g', 'Ğ':'G'
    };
    var RUSSIAN_MAP = {
        'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'yo', 'ж':'zh',
        'з':'z', 'и':'i', 'й':'j', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o',
        'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c',
        'ч':'ch', 'ш':'sh', 'щ':'sh', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'yu',
        'я':'ya',
        'А':'A', 'Б':'B', 'В':'V', 'Г':'G', 'Д':'D', 'Е':'E', 'Ё':'Yo', 'Ж':'Zh',
        'З':'Z', 'И':'I', 'Й':'J', 'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O',
        'П':'P', 'Р':'R', 'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Х':'H', 'Ц':'C',
        'Ч':'Ch', 'Ш':'Sh', 'Щ':'Sh', 'Ъ':'', 'Ы':'Y', 'Ь':'', 'Э':'E', 'Ю':'Yu',
        'Я':'Ya'
    };
    var UKRAINIAN_MAP = {
        'Є':'Ye', 'І':'I', 'Ї':'Yi', 'Ґ':'G', 'є':'ye', 'і':'i', 'ї':'yi', 'ґ':'g'
    };
    var CZECH_MAP = {
        'č':'c', 'ď':'d', 'ě':'e', 'ň': 'n', 'ř':'r', 'š':'s', 'ť':'t', 'ů':'u',
        'ž':'z', 'Č':'C', 'Ď':'D', 'Ě':'E', 'Ň': 'N', 'Ř':'R', 'Š':'S', 'Ť':'T',
        'Ů':'U', 'Ž':'Z'
    };
    var POLISH_MAP = {
        'ą':'a', 'ć':'c', 'ę':'e', 'ł':'l', 'ń':'n', 'ó':'o', 'ś':'s', 'ź':'z',
        'ż':'z', 'Ą':'A', 'Ć':'C', 'Ę':'e', 'Ł':'L', 'Ń':'N', 'Ó':'o', 'Ś':'S',
        'Ź':'Z', 'Ż':'Z'
    };
    var LATVIAN_MAP = {
        'ā':'a', 'č':'c', 'ē':'e', 'ģ':'g', 'ī':'i', 'ķ':'k', 'ļ':'l', 'ņ':'n',
        'š':'s', 'ū':'u', 'ž':'z', 'Ā':'A', 'Č':'C', 'Ē':'E', 'Ģ':'G', 'Ī':'i',
        'Ķ':'k', 'Ļ':'L', 'Ņ':'N', 'Š':'S', 'Ū':'u', 'Ž':'Z'
    };

    var ALL_DOWNCODE_MAPS = [];
    ALL_DOWNCODE_MAPS[0] = LATIN_MAP;
    ALL_DOWNCODE_MAPS[1] = LATIN_SYMBOLS_MAP;
    ALL_DOWNCODE_MAPS[2] = GREEK_MAP;
    ALL_DOWNCODE_MAPS[3] = TURKISH_MAP;
    ALL_DOWNCODE_MAPS[4] = RUSSIAN_MAP;
    ALL_DOWNCODE_MAPS[5] = UKRAINIAN_MAP;
    ALL_DOWNCODE_MAPS[6] = CZECH_MAP;
    ALL_DOWNCODE_MAPS[7] = POLISH_MAP;
    ALL_DOWNCODE_MAPS[8] = LATVIAN_MAP;

    var Downcoder = {};
    Downcoder.Initialize = function() {
        if (Downcoder.map) { // already made
            return false;
        }
        Downcoder.map ={};
        Downcoder.chars = '';
        for(var i in ALL_DOWNCODE_MAPS) {
            var lookup = ALL_DOWNCODE_MAPS[i];
            for (var c in lookup) {
                Downcoder.map[c] = lookup[c];
                Downcoder.chars += c;
            }
         }
        Downcoder.regex = new RegExp('[' + Downcoder.chars + ']|[^' + Downcoder.chars + ']+','g');
    }

    var downcode = function(slug) {
        Downcoder.Initialize();
        var downcoded = "";
        var pieces = slug.match(Downcoder.regex);
        if(pieces) {
            for (var i = 0 ; i < pieces.length ; i++) {
                if (pieces[i].length == 1) {
                    var mapped = Downcoder.map[pieces[i]];
                    if (mapped != null) {
                        downcoded += mapped;
                        continue;
                    }
                }
                downcoded += pieces[i];
            }
        }
        else {
            downcoded = slug;
        }
        return downcoded;
    }

    var slugify = function(s, num_chars) {
        // changes, e.g., "Petty theft" to "petty_theft"
        // remove all these words from the string before slugifying
        s = downcode(s);
        removelist = ["a", "an", "as", "at", "before", "but", "by", "for", "from",
                      "is", "in", "into", "like", "of", "off", "on", "onto", "per",
                      "since", "than", "the", "this", "that", "to", "up", "via",
                      "with"];
        r = new RegExp('\\b(' + removelist.join('|') + ')\\b', 'gi');
        s = s.replace(r, '');
        // if downcode doesn't hit, the char will be stripped here
        s = s.replace(/[^-\w\s]/g, '');  // remove unneeded chars
        s = s.replace(/^\s+|\s+$/g, ''); // trim leading/trailing spaces
        s = s.replace(/[-\s]+/g, '-');   // convert spaces to hyphens
        s = s.toLowerCase();             // convert to lowercase
        return s.substring(0, num_chars || 255);// trim to first num_chars chars
    }
    $.slugify = function(){
        return slugify.apply(this, arguments);
    };
    $.fn.slugify = function(text, length) {
        if ($(this).is(':input')) {
            $(this).val($.slugify($(this).val()));
        }
        else {
            $(this).text($.slugify($(this).text()));
        }
    };

})(jQuery);
/*
  jQuery strings - 0.4
  http://code.google.com/p/jquery-utils/
  
  (c) Maxime Haineault <haineault@gmail.com>
  http://haineault.com   

  MIT License (http://www.opensource.org/licenses/mit-license.php)

  Implementation of Python3K advanced string formatting
  http://www.python.org/dev/peps/pep-3101/

  Documentation: http://code.google.com/p/jquery-utils/wiki/StringFormat
  
*/
(function($){
    var strings = {
        strConversion: {
            // tries to translate any objects type into string gracefully
            __repr: function(i){
                switch(this.__getType(i)) {
                    case 'array':case 'date':case 'number':
                        return i.toString();
                    case 'object': // Thanks to Richard Paul Lewis for the fix
                        var o = []; 
                        var l = i.length;
                        for(var x=0;x<l;x++) {
                          o.push(x+': '+this.__repr(i[x]));
                        } 
                        return o.join(', ');                        
                    case 'string': 
                        return i;
                    default: 
                        return i;
                }
            },
            // like typeof but less vague
            __getType: function(i) {
                if (!i || !i.constructor) { return typeof(i); }
                var match = i.constructor.toString().match(/Array|Number|String|Object|Date/);
                return match && match[0].toLowerCase() || typeof(i);
            },
            // Jonas Raoni Soares Silva (http://jsfromhell.com/string/pad)
            __pad: function(str, l, s, t){
                var p = s || ' ';
                var o = str;
                if (l - str.length > 0) {
                    o = new Array(Math.ceil(l / p.length)).join(p).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2)) + str + p.substr(0, l - t);
                }
                return o;
            },
            __getInput: function(arg, args) {
                 var key = arg.getKey();
                switch(this.__getType(args)){
                    case 'object': // Thanks to Jonathan Works for the patch
                        var keys = key.split('.');
                        var obj = args;
                        for(var subkey = 0; subkey < keys.length; subkey++){
                            obj = obj[keys[subkey]];
                        }
                        if (typeof(obj) != 'undefined') {
                            if (strings.strConversion.__getType(obj) == 'array') {
                                return arg.getFormat().match(/\.\*/) && obj[1] || obj;
                            }
                            return obj;
                        }
                        else {
                            // TODO: try by numerical index                    
                        }
                    break;
                    case 'array': 
                        key = parseInt(key, 10);
                        if (arg.getFormat().match(/\.\*/) && typeof args[key+1] != 'undefined') { return args[key+1]; }
                        else if (typeof args[key] != 'undefined') { return args[key]; }
                        else { return key; }
                    break;
                }
                return '{'+key+'}';
            },
            __formatToken: function(token, args) {
                var arg   = new Argument(token, args);
                return strings.strConversion[arg.getFormat().slice(-1)](this.__getInput(arg, args), arg);
            },

            // Signed integer decimal.
            d: function(input, arg){
                var o = parseInt(input, 10); // enforce base 10
                var p = arg.getPaddingLength();
                if (p) { return this.__pad(o.toString(), p, arg.getPaddingString(), 0); }
                else   { return o; }
            },
            // Signed integer decimal.
            i: function(input, args){ 
                return this.d(input, args);
            },
            // Unsigned octal
            o: function(input, arg){ 
                var o = input.toString(8);
                if (arg.isAlternate()) { o = this.__pad(o, o.length+1, '0', 0); }
                return this.__pad(o, arg.getPaddingLength(), arg.getPaddingString(), 0);
            },
            // Unsigned decimal
            u: function(input, args) {
                return Math.abs(this.d(input, args));
            },
            // Unsigned hexadecimal (lowercase)
            x: function(input, arg){
                var o = parseInt(input, 10).toString(16);
                o = this.__pad(o, arg.getPaddingLength(), arg.getPaddingString(),0);
                return arg.isAlternate() ? '0x'+o : o;
            },
            // Unsigned hexadecimal (uppercase)
            X: function(input, arg){
                return this.x(input, arg).toUpperCase();
            },
            // Floating point exponential format (lowercase)
            e: function(input, arg){
                return parseFloat(input, 10).toExponential(arg.getPrecision());
            },
            // Floating point exponential format (uppercase)
            E: function(input, arg){
                return this.e(input, arg).toUpperCase();
            },
            // Floating point decimal format
            f: function(input, arg){
                return this.__pad(parseFloat(input, 10).toFixed(arg.getPrecision()), arg.getPaddingLength(), arg.getPaddingString(),0);
            },
            // Floating point decimal format (alias)
            F: function(input, args){
                return this.f(input, args);
            },
            // Floating point format. Uses exponential format if exponent is greater than -4 or less than precision, decimal format otherwise
            g: function(input, arg){
                var o = parseFloat(input, 10);
                return (o.toString().length > 6) ? Math.round(o.toExponential(arg.getPrecision())): o;
            },
            // Floating point format. Uses exponential format if exponent is greater than -4 or less than precision, decimal format otherwise
            G: function(input, args){
                return this.g(input, args);
            },
            // Single character (accepts integer or single character string). 	
            c: function(input, args) {
                var match = input.match(/\w|\d/);
                return match && match[0] || '';
            },
            // String (converts any JavaScript object to anotated format)
            r: function(input, args) {
                return this.__repr(input);
            },
            // String (converts any JavaScript object using object.toString())
            s: function(input, args) {
                return input.toString && input.toString() || ''+input;
            }
        },

        format: function(str, args) {
            var end    = 0;
            var start  = 0;
            var match  = false;
            var buffer = [];
            var token  = '';
            var tmp    = (str||'').split('');
            for(start=0; start < tmp.length; start++) {
                if (tmp[start] == '{' && tmp[start+1] !='{') {
                    end   = str.indexOf('}', start);
                    token = tmp.slice(start+1, end).join('');
                    if (tmp[start-1] != '{' && tmp[end+1] != '}') {
                        var tokenArgs = (typeof arguments[1] != 'object')? arguments2Array(arguments, 2): args || [];
                        buffer.push(strings.strConversion.__formatToken(token, tokenArgs));
                    }
                    else {
                        buffer.push(token);
                    }
                }
                else if (start > end || buffer.length < 1) { buffer.push(tmp[start]); }
            }
            return (buffer.length > 1)? buffer.join(''): buffer[0];
        },

        calc: function(str, args) {
            return eval(format(str, args));
        },

        repeat: function(s, n) { 
            return new Array(n+1).join(s); 
        },

        UTF8encode: function(s) { 
            return unescape(encodeURIComponent(s)); 
        },

        UTF8decode: function(s) { 
            return decodeURIComponent(escape(s)); 
        },

        tpl: function() {
            var out = '';
            var render = true;
            // Set
            // $.tpl('ui.test', ['<span>', helloWorld ,'</span>']);
            if (arguments.length == 2 && $.isArray(arguments[1])) {
                this[arguments[0]] = arguments[1].join('');
                return $(this[arguments[0]]);
            }
            // $.tpl('ui.test', '<span>hello world</span>');
            if (arguments.length == 2 && $.isString(arguments[1])) {
                this[arguments[0]] = arguments[1];
                return $(this[arguments[0]]);
            }
            // Call
            // $.tpl('ui.test');
            if (arguments.length == 1) {
                return $(this[arguments[0]]);
            }
            // $.tpl('ui.test', false);
            if (arguments.length == 2 && arguments[1] == false) {
                return this[arguments[0]];
            }
            // $.tpl('ui.test', {value:blah});
            if (arguments.length == 2 && $.isObject(arguments[1])) {
                return $($.format(this[arguments[0]], arguments[1]));
            }
            // $.tpl('ui.test', {value:blah}, false);
            if (arguments.length == 3 && $.isObject(arguments[1])) {
                return (arguments[2] == true) 
                    ? $.format(this[arguments[0]], arguments[1])
                    : $($.format(this[arguments[0]], arguments[1]));
            }
        }
    };

    var Argument = function(arg, args) {
        this.__arg  = arg;
        this.__args = args;
        this.__max_precision = parseFloat('1.'+ (new Array(32)).join('1'), 10).toString().length-3;
        this.__def_precision = 6;
        this.getString = function(){
            return this.__arg;
        };
        this.getKey = function(){
            return this.__arg.split(':')[0];
        };
        this.getFormat = function(){
            var match = this.getString().split(':');
            return (match && match[1])? match[1]: 's';
        };
        this.getPrecision = function(){
            var match = this.getFormat().match(/\.(\d+|\*)/g);
            if (!match) { return this.__def_precision; }
            else {
                match = match[0].slice(1);
                if (match != '*') { return parseInt(match, 10); }
                else if(strings.strConversion.__getType(this.__args) == 'array') {
                    return this.__args[1] && this.__args[0] || this.__def_precision;
                }
                else if(strings.strConversion.__getType(this.__args) == 'object') {
                    return this.__args[this.getKey()] && this.__args[this.getKey()][0] || this.__def_precision;
                }
                else { return this.__def_precision; }
            }
        };
        this.getPaddingLength = function(){
            var match = false;
            if (this.isAlternate()) {
                match = this.getString().match(/0?#0?(\d+)/);
                if (match && match[1]) { return parseInt(match[1], 10); }
            }
            match = this.getString().match(/(0|\.)(\d+|\*)/g);
            return match && parseInt(match[0].slice(1), 10) || 0;
        };
        this.getPaddingString = function(){
            var o = '';
            if (this.isAlternate()) { o = ' '; }
            // 0 take precedence on alternate format
            if (this.getFormat().match(/#0|0#|^0|\.\d+/)) { o = '0'; }
            return o;
        };
        this.getFlags = function(){
            var match = this.getString().matc(/^(0|\#|\-|\+|\s)+/);
            return match && match[0].split('') || [];
        };
        this.isAlternate = function() {
            return !!this.getFormat().match(/^0?#/);
        };
    };

    var arguments2Array = function(args, shift) {
        var o = [];
        for (l=args.length, x=(shift || 0)-1; x<l;x++) { o.push(args[x]); }
        return o;
    };
    $.extend(strings);
})(jQuery);
/*
 * Copyright (c) 2007-2008 Josh Bush (digitalbush.com)
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE. 
 */
 
/*
 * Version: 1.1.3
 * Release: 2008-04-16
 */ 
(function($) {

	//Helper Function for Caret positioning
	$.fn.caret=function(begin,end){	
		if(this.length==0) return;
		if (typeof begin == 'number') {
            end = (typeof end == 'number')?end:begin;  
			return this.each(function(){
				if(this.setSelectionRange){
					this.focus();
					this.setSelectionRange(begin,end);
				}else if (this.createTextRange){
					var range = this.createTextRange();
					range.collapse(true);
					range.moveEnd('character', end);
					range.moveStart('character', begin);
					range.select();
				}
			});
        } else {
            if (this[0].setSelectionRange){
				begin = this[0].selectionStart;
				end = this[0].selectionEnd;
			}else if (document.selection && document.selection.createRange){
				var range = document.selection.createRange();			
				begin = 0 - range.duplicate().moveStart('character', -100000);
				end = begin + range.text.length;
			}
			return {begin:begin,end:end};
        }       
	};

	//Predefined character definitions
	var charMap={
		'9':"[0-9]",
		'a':"[A-Za-z]",
		'*':"[A-Za-z0-9]"
	};
	
	//Helper method to inject character definitions
	$.mask={
		addPlaceholder : function(c,r){
			charMap[c]=r;
		}
	};
	
	$.fn.unmask=function(){
		return this.trigger("unmask");
	};
	
	//Main Method
	$.fn.mask = function(mask,settings) {	
		settings = $.extend({
			placeholder: "_",			
			completed: null
		}, settings);		
		
		//Build Regex for format validation
		var re = new RegExp("^"+	
		$.map( mask.split(""), function(c,i){		  		  
		  return charMap[c]||((/[A-Za-z0-9]/.test(c)?"":"\\")+c);
		}).join('')+				
		"$");		

		return this.each(function(){		
			var input=$(this);
			var buffer=new Array(mask.length);
			var locked=new Array(mask.length);
			var valid=false;   
			var ignore=false;  			//Variable for ignoring control keys
			var firstNonMaskPos=null; 
			
			//Build buffer layout from mask & determine the first non masked character			
			$.each( mask.split(""), function(i,c){				
				locked[i]=(charMap[c]==null);				
				buffer[i]=locked[i]?c:settings.placeholder;									
				if(!locked[i] && firstNonMaskPos==null)
					firstNonMaskPos=i;
			});		
			
			function focusEvent(){					
				checkVal();
				writeBuffer();
				setTimeout(function(){
					$(input[0]).caret(valid?mask.length:firstNonMaskPos);					
				},0);
			};
			
			function keydownEvent(e){				
				var pos=$(this).caret();
				var k = e.keyCode;
				ignore=(k < 16 || (k > 16 && k < 32 ) || (k > 32 && k < 41));
				
				//delete selection before proceeding
				if((pos.begin-pos.end)!=0 && (!ignore || k==8 || k==46)){
					clearBuffer(pos.begin,pos.end);
				}	
				//backspace and delete get special treatment
				if(k==8){//backspace					
					while(pos.begin-->=0){
						if(!locked[pos.begin]){								
							buffer[pos.begin]=settings.placeholder;
							if($.browser.opera){
								//Opera won't let you cancel the backspace, so we'll let it backspace over a dummy character.								
								s=writeBuffer();
								input.val(s.substring(0,pos.begin)+" "+s.substring(pos.begin));
								$(this).caret(pos.begin+1);								
							}else{
								writeBuffer();
								$(this).caret(Math.max(firstNonMaskPos,pos.begin));								
							}									
							return false;								
						}
					}						
				}else if(k==46){//delete
					clearBuffer(pos.begin,pos.begin+1);
					writeBuffer();
					$(this).caret(Math.max(firstNonMaskPos,pos.begin));					
					return false;
				}else if (k==27){//escape
					clearBuffer(0,mask.length);
					writeBuffer();
					$(this).caret(firstNonMaskPos);					
					return false;
				}									
			};
			
			function keypressEvent(e){					
				if(ignore){
					ignore=false;
					//Fixes Mac FF bug on backspace
					return (e.keyCode == 8)? false: null;
				}
				e=e||window.event;
				var k=e.charCode||e.keyCode||e.which;						
				var pos=$(this).caret();
								
				if(e.ctrlKey || e.altKey){//Ignore
					return true;
				}else if ((k>=41 && k<=122) ||k==32 || k>186){//typeable characters
					var p=seekNext(pos.begin-1);					
					if(p<mask.length){
						if(new RegExp(charMap[mask.charAt(p)]).test(String.fromCharCode(k))){
							buffer[p]=String.fromCharCode(k);									
							writeBuffer();
							var next=seekNext(p);
							$(this).caret(next);
							if(settings.completed && next == mask.length)
								settings.completed.call(input);
						}				
					}
				}				
				return false;				
			};
			
			function clearBuffer(start,end){
				for(var i=start;i<end&&i<mask.length;i++){
					if(!locked[i])
						buffer[i]=settings.placeholder;
				}				
			};
			
			function writeBuffer(){				
				return input.val(buffer.join('')).val();				
			};
			
			function checkVal(){	
				//try to place charcters where they belong
				var test=input.val();
				var pos=0;
				for(var i=0;i<mask.length;i++){					
					if(!locked[i]){
						buffer[i]=settings.placeholder;
						while(pos++<test.length){
							//Regex Test each char here.
							var reChar=new RegExp(charMap[mask.charAt(i)]);
							if(test.charAt(pos-1).match(reChar)){
								buffer[i]=test.charAt(pos-1);								
								break;
							}									
						}
					}
				}
				var s=writeBuffer();
				if(!s.match(re)){							
					input.val("");	
					clearBuffer(0,mask.length);
					valid=false;
				}else
					valid=true;
			};
			
			function seekNext(pos){				
				while(++pos<mask.length){					
					if(!locked[pos])
						return pos;
				}
				return mask.length;
			};
			
			input.one("unmask",function(){
				input.unbind("focus",focusEvent);
				input.unbind("blur",checkVal);
				input.unbind("keydown",keydownEvent);
				input.unbind("keypress",keypressEvent);
				if ($.browser.msie) 
					this.onpaste= null;                     
				else if ($.browser.mozilla)
					this.removeEventListener('input',checkVal,false);
			});
			input.bind("focus",focusEvent);
			input.bind("blur",checkVal);
			input.bind("keydown",keydownEvent);
			input.bind("keypress",keypressEvent);
			//Paste events for IE and Mozilla thanks to Kristinn Sigmundsson
			if ($.browser.msie) 
				this.onpaste= function(){setTimeout(checkVal,0);};                     
			else if ($.browser.mozilla)
				this.addEventListener('input',checkVal,false);
				
			checkVal();//Perform initial check for existing values
		});
	};
})(jQuery);
/*
 jQuery delayed observer - 0.8
 http://code.google.com/p/jquery-utils/

 (c) Maxime Haineault <haineault@gmail.com>
 http://haineault.com
 
 MIT License (http://www.opensource.org/licenses/mit-license.php)
 
*/

(function($){
    $.extend($.fn, {
        delayedObserver: function(callback, delay, options){
            return this.each(function(){
                var el = $(this);
                var op = options || {};
                el.data('oldval', el.val())
                    .data('delay', delay || 0.5)
                    .data('condition', op.condition || function() { return ($(this).data('oldval') == $(this).val()); })
                    .data('callback', callback)
                    [(op.event||'keyup')](function(e){
                        if (el.data('condition').apply(el)) { return; }
                        else {
                            if (el.data('timer')) { clearTimeout(el.data('timer')); }
                            el.data('timer', setTimeout(function(){
                                el.data('callback').apply(el, [e]);
                            }, el.data('delay') * 1000));
                            el.data('oldval', el.val());
                        }
                    });
            });
        }
    });
})(jQuery);
