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
            input:   $('<input maxlength="50" type="text" class="ui-gAutoSlugField vTextField" />')
        };

        if (ui.mode == 'mirror') {
            ui.dom.input = $('#id_'+ ui.element.attr('rel'));
            // extra security ..
            ui.element.bind('blur', function(e){
                $(this).val($.slugify($(this).val()));
            });
        }
        else {
            ui.element.hide();
            ui.dom.preview.insertAfter(ui.element);
            if (ui.element.attr('maxlength')) {
                ui.dom.input.attr('maxlength', ui.element.attr('maxlength'));
            }
            ui.dom.input.insertBefore(ui.element);
        }

        ui.dom.input.bind('keyup', function(e){
            ui._refresh(e, true);
        });

        ui._refresh(); // sync initial values
    },
    
    _refresh: function() {
        var ui, val;
        ui  = this;
        val = $.slugify(ui.dom.input.val());
        if (ui.mode == 'standalone') {
            if (val == '' && typeof val != 'undefined') {
                ui.dom.preview.hide().text('');
            }
            else {
                ui.dom.preview.show().text(val);
            }
        }
        ui.element.val(val);
    }
});

$.ui.gAutoSlugField.defaults = {
    delay: 0.8
};

})(jQuery);
