/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gCollapsible
 *  Package:  Grappelli
 *  Requires: jquery.gCollapsible.js
 *
 *  jslinted - 13 Mar 2010
 *
 *  CSS based collaspible behavior
 *
 *  Classes
 *  =======
 *
 *  collapse-open       ui-collapsible-opened       opened state of a collapsible element
 *  collapse(-closed)   ui-collapsible-closed       closed state of a collapsible element
 *                      ui-collapsible-all-opened   open also sub-element that are collapsible (applies to groups)
 *                      ui-collapsible-all-closed   close also sub-element that are collapsible (applies to groups)
 *
 */
(function($){


$.widget('ui.gCollapsible.js', {
    options: {
        autoSelector: ['.ui-collapsible-opened', '.ui-collapsible-closed', 
                       '.ui-collapsible-all-opened', '.ui-collapsible-all-closed']
                       .join(','),

        // Close all (excluding parent group)
        collapseAll: function(e, ui) {
            ui._trigger('collapse', {
                type:'collapse', 
                data: {element: ui.element.find('.ui-collapsible')}
            }, ui);
        },

        // Opens *all* (including parent group)
        unCollapseAll: function(e, ui) {
            ui._trigger('unCollapse', {
                type:'unCollapse', 
                data: {element: ui.element.find('.ui-collapsible').andSelf()}
            }, ui);
        },

        toggle: function(e, ui) {
            var el = e.data.element;
            var type = el.hasClass('ui-collapsible-closed') && 'unCollapse' || 'collapse';
            ui._trigger(type, {type:type, data: {element: el}}, ui);
        },

        // Opens a collapsible container
        unCollapse: function(e, ui) {
            return e.data.element.addClass('ui-collapsible-opened')
              .removeClass('ui-collapsible-closed');
        },

        // Closes a collapsible container
        collapse: function(e, ui) {
            return e.data.element.removeClass('ui-collapsible-opened')
              .addClass('ui-collapsible-closed');
        }

    },

    _create: function() {
        var ui  = this; 
        ui._isGroup = ui.element.addClass('ui-collapsible').hasClass('group');
        ui.dom  = {
            closeAll: ui.element.find('.ui-collapsible-close-all'),
            openAll:  ui.element.find('.ui-collapsible-open-all')
        };

        if (!ui.element.hasClass('ui-collapsible-closed')) {
            ui.element.addClass('ui-collapsible-opened');
        }

        if (ui._isGroup) {

            // Toggle behavior of h3
            ui.element.find('h3.ui-collapsible-toggle').bind('click', function(e){
                ui._onClick.apply(this, [e, ui]);
            });

            // Toggle behavior of h4
            ui.element.find('.ui-collapsible > h4')
                .addClass('ui-collapsible-toggle')
                .bind('click', function(e){
                    ui._onClick.apply(this, [e, ui]);
                });
           
            // Close/Open all
            ui._trigger(ui.element.hasClass('ui-collapsible-all-closed') 
                        && 'collapseAll' || 'unCollapseAll', {}, ui);

            ui.dom.openAll.bind('click',  function(){ 
                ui._trigger('unCollapseAll', {}, ui);
            });

            ui.dom.closeAll.bind('click', function(){ 
                ui._trigger('collapseAll', {}, ui);
            });
        }

        // Toggle behavior of h2
        ui.element.find('h2:first')
            .addClass('ui-collapsible-toggle')
            .bind('click', function(e){
                ui._onClick.apply(this, [e, ui]); });

        // Errors handling
        var errors = ui.element.find('.errors');
        if (errors) {
            ui.unCollapse(errors.parents('.ui-collapsible'));
        }
    },

    /* Triggers unCollapse event on a specified collapsible DOM element
     * @ el Collapsible element
     * */
    unCollapse: function(el) {
        this._trigger('unCollapse', { type:'unCollapse', data: {element: el}}, this);
    },

    /* Triggers collapse event on a specified collapsible DOM element
     * @ el Collapsible element
     * */
    collapse: function(el) {
        this._trigger('collapse', { type:'collapse', data: {element: el}}, this);
    },

    /* Triggered when a toggle handle is clicked
     * @e   event
     * @ui  gCollapsible instance
     * */
    _onClick: function(e, ui){
        var p = $(this).parents('.ui-collapsible:eq(0)');
        if (!p.get(0)) { p = ui.element; }
        ui._trigger('toggle', {type:'toggle', data: {element: p}}, ui);
    }
});

})(jQuery);
