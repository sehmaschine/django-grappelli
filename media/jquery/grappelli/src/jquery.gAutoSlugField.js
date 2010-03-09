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
        var ui  = this; 
        ui.mode = ui.element.attr('rel') && 'mirror' || 'standalone';
        ui.dom  = {
            preview: $('<span class="ui-gAutoSlugField-preview">test</span>'),
            input: $('<input maxlength="50" type="text" class="ui-gAutoSlugField vTextField" />')
        };

        if (ui.mode == 'mirror') {
            ui.dom.input = $('#id_'+ ui.element.attr('rel'));
        }
        else {
            ui.element.hide();
            ui.dom.preview.insertAfter(ui.element);
            if (ui.element.attr('maxlength')) {
                ui.dom.input.attr('maxlength', ui.element.attr('maxlength'));
            }
            ui.dom.input.insertBefore(ui.element);
        }

        ui.dom.input.delayedObserver(function(e){
            ui._refresh(e, true);
        }, ui.options.delay);
    },
    
    _refresh: function(e, fromSource) {
        var ui, val;
        ui  = this;
        val = $.slugify(ui.dom.input.val());
        if (ui.mode == 'standalone') {
            ui.dom.preview.text(val);
        }
        ui.element.val(val);
    }
});

$.ui.gAutoSlugField.defaults = {
    delay: 0.8
};

})(jQuery);
