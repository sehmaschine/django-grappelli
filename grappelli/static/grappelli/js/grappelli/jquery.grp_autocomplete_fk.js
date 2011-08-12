/**
 * GRAPPELLI RELATED FK
 * foreign-key lookup with autocomplete
 */


(function($){
    $.fn.grp_autocomplete_fk = function(options){
        var defaults = {
            input_field: "<input type='text' class='vAutocompleteField' />",
            search_fields: "",
            autocomplete_lookup_url: '',
            lookup_url: ''
        };
        var opts = $.extend(defaults, options);
        return this.each(function() {
            _initialize($(this), opts);
        });
    };
    var _initialize = function(elem, options) {
        elem.next().next().remove();
        elem.next().after(options.input_field);
        _autocomplete(elem, options);
        _get_fk_repr(elem, options);
        _register_handler(elem, options);
    };
    var _register_handler = function(elem, options) {
        elem.bind("change focus keyup blur", function() {
            _get_fk_repr(elem, options);
        });
    };
    var _autocomplete = function(elem, options) {
        var link = elem.next("a");
        if (link.length === 0) { return; }
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];
        elem.next().next().autocomplete({
            minLength: 1,
            source: function(request, response ) {
                $.ajax({
                    url: options.autocomplete_lookup_url,
                    dataType: "json",
                    data: {
                        app_label: app_label,
                        model_name: model_name,
                        term: request.term
                    },
                    success: function(data) {
                        response($.map(data, function(item) {
                            return {
                                label: item.label,
                                value: item.id
                            }
                        }));
                    }
                });
            },
            select: function(event, ui) {
                $(elem).val(ui.item.value);
                this.value = ui.item.label;
                return false;
            }
        });
    }
    var _get_fk_repr = function(elem, options) {
        var link = elem.next("a");
        if (link.length === 0) { return; }
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];
        var text = elem.next().next();
        $.get(options.lookup_url, {
            object_id: elem.val(),
            app_label: app_label,
            model_name: model_name
        }, function(data) {
            var item = data;
            text.val('');
            if (item) {
                text.val(decodeURI(item));
            }
        });
    };
})(django.jQuery);