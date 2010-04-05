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
        autoSelector: '.ui-collapsible-opened, .ui-collapsible-closed, ui-collapsible-all-opened, ui-collapsible-all-closed'
    },

    _init: function() {
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
            console.log('test', ui.element.hasClass('ui-collapsible-all-closed'));
            ui[(ui.element.hasClass('ui-collapsible-all-closed') && 'closeAll' || 'openAll')]();
            ui.dom.openAll.bind('click',  function(){ ui.openAll(); });
            ui.dom.closeAll.bind('click', function(){ ui.closeAll(); });
        }

        // Toggle behavior of h2
        ui.element.find('h2:first')
            .addClass('ui-collapsible-toggle')
            .bind('click', function(e){
                ui._onClick.apply(this, [e, ui]); });

        // Errors handling
        var errors = ui.element.find('.errors');
        if (errors) {
            ui.open(errors.parents('.ui-collapsible'));
        }

    },

    /* Triggered when a toggle handle is clicked
     * @e   event
     * @ui  gCollapsible instance
     * */
    _onClick: function(e, ui){
        var parent = $(this).parents('.ui-collapsible:eq(0)');
        if (!parent.get(0)) {
            parent = ui.element;
        }
        ui.toggle(parent);
    },

    /* Toggles collapsible group
     * @el   element
     * */
    toggle: function(el) {
        return this[el.hasClass('ui-collapsible-closed') && 'open' || 'close'](el); 
    },

    /* Opens *all* (including parent group)
     * @el   element
     * */
    openAll: function(el) {
        this.open(this.element); // Make sure group is open first
        this.open(this.element.find('.ui-collapsible'));
    },

    /* Close all (excluding parent group)
     * @el   element
     * */
    closeAll: function(el) {
        this.close(this.element.find('.ui-collapsible'));
    },

    /* Opens a collapsible container
     * @el   element
     * */
    open: function(el) {
        return el.addClass('ui-collapsible-opened')
          .removeClass('ui-collapsible-closed');
    },

    /* Closes a collapsible container
     * @el   element
     * */
    close: function(el) {
        return el.removeClass('ui-collapsible-opened')
          .addClass('ui-collapsible-closed');
    }
});

})(jQuery);
