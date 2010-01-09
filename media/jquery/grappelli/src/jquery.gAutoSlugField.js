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
        ui.element.delayedObserver(function(e){
            ui._refresh(e, $(this));
        }, ui.options.delay);

        if (ui.element.attr('rel')) {
            ui.elementTarget = $('#id_'+ ui.element.attr('rel'));
            ui.elementTarget.bind('keyup.gAutoSlugField', function(e){
                ui._refresh(e, $(this));
            });

            // Initial data
            if (ui.element.val() != $.slugify(ui.elementTarget.val())) {
                ui.element.val($.slugify(ui.elementTarget.val()));
            }
        }
    },
    
    _refresh: function(e, el) {
        var val = $.slugify(el.val());
        if (val != '') {
            this.element.val(val);
        }
    }
});

$.ui.gAutoSlugField.defaults = {
    delay: 0.8
};

})(jQuery);
