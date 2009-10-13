/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gAutoSlugField
 *  Package: Grappelli
 *  Requies: jquery.slugify.js
 */

$.widget('ui.gAutoSlugField', {
    _refresh: function(e, el) {
        this.element.val($.slugify(el.val()));
    },
    _init: function() {
        var ui = this;
        if (ui.element.attr('rel')) {
            $('#id_'+ ui.element.attr('rel')).bind('keyup.gAutoSlugField', function(e) {
                ui._refresh(e, $(this));
            });
        }
        ui.element.bind('keyup.gAutoSlugField', function(e) {
            ui._refresh(e, $(this));
        });
   }
});
