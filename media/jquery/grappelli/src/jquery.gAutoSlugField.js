/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gAutoSlugField
 *  Package:  Grappelli
 *  Requires: jquery.slugify.js
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gAutoSlugField', {

    _init: function() {
        var ui = this; 

        if (ui.element.attr('rel')) {
            ui.elementTarget = $('#id_'+ ui.element.attr('rel'));
            ui.elementTarget.bind('keyup.gAutoSlugField', function(e){
                ui._refresh(e);
            });

            // Initial data
            if (ui.element.val() != $.slugify(ui.elementTarget.val())) {
                ui.element.val($.slugify(ui.elementTarget.val()));
            }
        }
        ui.element.delayedObserver(function(e){
            ui._refresh(e, true);
        }, ui.options.delay);
    },
    
    _refresh: function(e, fromSource) {
        var ui, val;
        ui  = this;
        val = $.slugify((!ui.elementTarget || fromSource) && ui.element.val() || ui.elementTarget.val());
        ui.element.val(val);
    }
});

$.ui.gAutoSlugField.defaults = {
    delay: 0.8
};

})(jQuery);
