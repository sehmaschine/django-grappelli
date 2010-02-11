/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gAutoSlugField
 *  Package:  Grappelli
 *  Requires: jquery.slugify.js
 *
 *  jslinted - 8 Jan 2010
 */
(function($) {

    $.widget('ui.gAutoSlugField', {

        ignore: {6:6,9:9,13:13,16:16,27:27,35:35,36:36,37:37,38:38,39:39,40:40},

        _init: function() {
            var ui = this;

            var fieldIds = ui.element.attr('rel').split(',');
            var selector = '';
            for (var i in fieldIds) selector += '#id_' + fieldIds[i] + ',';
            var fields = $(selector);

            ui._bindSlugField(fields, ui.element);
            ui._bindSlugField(ui.element, ui.element);
        },

        _bindSlugField: function(fields, element) {
            var ui = this;
            var timer = null;
            fields.bind('keyup.gAutoSlugField', function(ev) {
                if (ui.ignore[ev.keyCode]) return;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    ui._refresh(element, fields)
                }, (ui.options.delay * 1000));
            });
        },

        _getSlugValue: function(fields, length) {
            var slugValue = '';
            fields.each(function(i, el) {
                var newValue = $.slugify($(el).val(), length);
                if (slugValue.length > 0 && newValue.length > 0) slugValue += '_';
                slugValue += newValue;
            });
            return slugValue;
        },

        _refresh: function(element, fields) {
            element.val(this._getSlugValue(fields, element.attr('maxlength')));
        }
    });

    $.ui.gAutoSlugField.defaults = {
        delay: 0.5
    };

})(jQuery);
