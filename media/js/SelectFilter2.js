/*
SelectFilter2 - Turns a multiple-select box into a filter interface.

Different than SelectFilter because this is coupled to the admin framework.

Requires core.js, SelectBox.js and addevent.js.
*/

var SelectFilter = {
    init: function(field_id, field_name, is_stacked, admin_media_prefix) {
        var el = $('#'+ field_id).addClass('filtered');

        el.attr({id: el.attr('id') +'_from', name: el.attr('name') + '_old'})
          .bind('dblclick', function(){
              SelectBox.move(field_id + '_from', field_id + '_to');
          })
          .parents('form').bind('submit.grappelli', function() { 
              SelectBox.select_all(field_id + '_to'); 
          }).end();

        // Remove <p class="info">, because it just gets in the way.
        el.parent().find('p').remove();

        var ui = {
            // <div class="selector"> or <div class="selector stacked">
            selector_div: $('<div />').appendTo(el.parent()).addClass(is_stacked ? 'selector stacked' : 'selector'),
            // <div class="selector-available">
            selector_available: $('<div />').addClass('selector-available'),
            // <ul class="selector-chooser">
            selector_chooser: $('<ul />').addClass('selector-chooser'),
            // <div class="selector-chosen">
            selector_chosen: $('<div />').addClass('selector-chosen')
        };

        ui.selector_available.appendTo(ui.selector_div);

        $('<h2 />').appendTo(ui.selector_available)
            .text(interpolate(gettext('Available %s'), [field_name]));

        var p = $('<p>&nbsp;</p>').appendTo(ui.selector_available).addClass('selector-filter');

        $('<img src="'+ admin_media_prefix  +'img/admin/selector-search.gif" />').prependTo(p);
        $('<input type="text" />').appendTo(p).attr('id', field_id + '_from_input')
            .bind('keydown', function(e){
                SelectFilter.filter_key_up(e, field_id, '_from');
            })
            .bind('keyup', function(e){
                SelectFilter.filter_key_down(e, field_id, '_from');
            });

        el.appendTo(ui.selector_available);

        $('<a href="#" />').appendTo(ui.selector_available).text(gettext('Choose all')).addClass('selector-chooseall')
            .bind('click.grappelli', function(){
                SelectBox.move_all(field_id +'_from',field_id +'_to');
                return false;
            });

        ui.selector_chooser.appendTo(ui.selector_div);
        
        $('<li><a href="#" class="selector-add" /></li>').appendTo(ui.selector_chooser)
            .find('a').text(gettext('Add'))
            .bind('click.grappelli', function(){
                SelectBox.move(field_id + '_from', field_id + '_to');
                return false;
            });
        
        $('<li><a href="#" class="selector-remove" /></li>').appendTo(ui.selector_chooser)
            .find('a').text(gettext('Remove'))
            .bind('click.grappelli', function(){
                SelectBox.move(field_id + '_to', field_id + '_from');
                return false;
            });

        ui.selector_chosen.appendTo(ui.selector_div);

        $('<h2 />').appendTo(ui.selector_chosen)
            .text(interpolate(gettext('Chosen %s'), [field_name]));
        
        var p = $('<p>&nbsp;</p>').appendTo(ui.selector_chosen).addClass('selector-filter');

        $('<img src="'+ admin_media_prefix  +'img/admin/selector-search.gif" />').prependTo(p);
        $('<input type="text" />').appendTo(p).attr('id', field_id + '_to_input')
            .bind('keydown', function(e){
                SelectFilter.filter_key_up(e, field_id, '_to');
            })
            .bind('keyup', function(e){
                SelectFilter.filter_key_down(e, field_id, '_to');
            });

        // to_box
        $('<select multiple="multiple" class="filtered" />').appendTo(ui.selector_chosen)
            .attr({id: field_id + '_to', size: el.attr('size'), name: el.attr('name')})
            .bind('dblclick.grappelli', function(){
                SelectBox.move(field_id + '_to', field_id + '_from');
            });

        $('<a href="#" class="selector-clearall" />').appendTo(ui.selector_chosen)
            .text(gettext('Clear all'))
            .bind('click.grappelli', function(){
                SelectBox.move_all(field_id +'_to', field_id +'_from');
                return false;
            });


        // Set up the JavaScript event handlers for the select box filter interface
        SelectBox.init(field_id + '_from');
        SelectBox.init(field_id + '_to');
        // Move selected from_box options to to_box
        SelectBox.move(field_id + '_from', field_id + '_to');
    },
    filter_key_up: function(event, field_id, type) {
        from = $('#'+ field_id + type).get(0);
        // don't submit form if user pressed Enter
        if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
            from.selectedIndex = 0;
            SelectBox.move(field_id + type, field_id + '_to');
            from.selectedIndex = 0;
            return false;
        }
        var temp = from.selectedIndex;

        SelectBox.filter(field_id + type, $('#'+ field_id + type + '_input').val());
        from.selectedIndex = temp;
        return true;
    },
    filter_key_down: function(event, field_id, type) {
        from = $('#'+ field_id + type);
        // right arrow -- move across
        if ((event.which && event.which == 39) || (event.keyCode && event.keyCode == 39)) {
            var old_index = from.selectedIndex;
            SelectBox.move(field_id + type, field_id + '_to');
            from.selectedIndex = (old_index == from.length) ? from.length - 1 : old_index;
            return false;
        }
        // down arrow -- wrap around
        if ((event.which && event.which == 40) || (event.keyCode && event.keyCode == 40)) {
            from.selectedIndex = (from.length == from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
        }
        // up arrow -- wrap around
        if ((event.which && event.which == 38) || (event.keyCode && event.keyCode == 38)) {
            from.selectedIndex = (from.selectedIndex == 0) ? from.length - 1 : from.selectedIndex - 1;
        }
        return true;
    }
}
