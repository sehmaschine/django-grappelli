/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gCollapsible
 *  Package:  Grappelli
 *  Requires: jquery.gCollapsible.js
 *
 *  jslinted - 8 Jan 2010
 *
 *  CSS based collaspible behavior
 *
 *  Classes
 *  =======
 *
 *  ui-collapsible              make an element collapsible
 *  ui-collapsible-opened       opened state of a collapsible element
 *  ui-collapsible-closed       closed state of a collapsible element
 *  ui-collapsible-toggle       make an element the toggle element for a parent collapsible
 *  ui-collapsible-open-all     open also sub-element that are collapsible
 *  ui-collapsible-close-all    open also sub-element that are collapsible
 *  ui-collapsible-all-opened   open also sub-element that are collapsible (applies to groups)
 *  ui-collapsible-all-closed   close also sub-element that are collapsible (applies to groups)
 *
 */
(function($){

$.widget('ui.gCollapsible.js', {

    _init: function() {
        var ui  = this; 
        ui._isGroup = ui.element.addClass('ui-collapsible').hasClass('.group');
        ui.dom  = {
            closeAll: ui.element.find('.ui-collapsible-close-all'),
            openAll:  ui.element.find('.ui-collapsible-open-all'),
        };
        if (!ui.element.hasClass('ui-collapsible-closed')) {
            ui.element.addClass('ui-collapsible-opened')
        }
        if (!ui._isGroup) {
            ui.dom.toggle = ui.element.find('.ui-collapsible-toggle');
        }
        else {
            ui.element.children().eq(0)
                .addClass('ui-collapsible-toggle')
                .bind('click', function(e){
                    ui._onClick.apply(this, [e, ui]); });

            // Close/Open all
            ui.dom.openAll.bind('click', function(){
                ui.openAll();
            });

            ui.dom.closeAll.bind('click', function(){
                ui.closeAll();
            });

            if (ui.element.hasClass('ui-collapsible-all-closed')) {
                ui.closeAll();
            }
            else {
                ui.openAll();
            }
        }

        // Errors handling
        var errors = ui.element.find('.errors');
        if (errors) {
            ui.open(errors.parents('.ui-collapsible'));
        }

        // Toggle behavior
        $('h3.ui-collapsible-toggle').live('click', function(e){
            ui._onClick.apply(this, [e, ui]);
        });
    },

    _onClick: function(e, ui){
        var parent = $(this).parents('.ui-collapsible:eq(0)');
        if (!parent.get(0)) {
            parent = ui.element;
        }
        ui.toggle(parent);
    },

    toggle: function(el) {
        return this[el.hasClass('ui-collapsible-closed') && 'open' || 'close'](el); 
    },

    openAll: function(el) {
        this.open(this.element.find('.ui-collapsible'));
    },

    closeAll: function(el) {
        this.close(this.element.find('.ui-collapsible'));
    },

    open: function(el) {
        return el.addClass('ui-collapsible-opened')
          .removeClass('ui-collapsible-closed');
    },

    close: function(el) {
        return el.removeClass('ui-collapsible-opened')
          .addClass('ui-collapsible-closed');
    }
});

$.extend($.ui.gCollapsible, {
    autoSelector: '.ui-collapsible, ui-collapsible-open',
    defaults: {
    }
});
})(jQuery);
