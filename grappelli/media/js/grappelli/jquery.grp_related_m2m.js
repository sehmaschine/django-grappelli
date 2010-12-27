/**
 * GRAPPELLI RELATED FK
 * m2m lookup
 */


(function($){
    $.fn.grp_related_m2m = function(options){
        var defaults = {
            placeholder: '&nbsp;<strong></strong>',
            repr_max_length: 30,
            lookup_url: ''
        };
        var opts = $.extend(defaults, options);
        return this.each(function() {
            _initialize($(this), opts);
        });
    };
    var _initialize = function(elem, options) {
        elem.next().after(options.placeholder);
        _get_m2m_repr(elem, options);
        _register_handler(elem, options);
    };
    var _register_handler = function(elem, options) {
        elem.bind("change focus keyup blur", function() {
            _get_m2m_repr(elem, options);
        });
    };
    var _get_m2m_repr = function(elem, options) {
        var link = elem.next();
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
            text.text('');
            if (item) {
                if (item.length > options.repr_max_length) {
                    text.text(decodeURI(item.substr(0,  options.repr_max_length) + " ..."));
                } else {
                    text.text(decodeURI(item));
                }
            }
        });
    };
})(django.jQuery);