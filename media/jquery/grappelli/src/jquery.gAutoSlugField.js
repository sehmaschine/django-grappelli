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
