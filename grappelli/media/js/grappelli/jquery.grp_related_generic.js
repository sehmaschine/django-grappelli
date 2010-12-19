/**
 * GRAPPELLI RELATED FK
 * generic lookup
 */


(function($){
    $.fn.grp_related_generic = function(options){
        var defaults = {
            placeholder: '&nbsp;<strong></strong>',
            repr_max_length: 30,
            lookup_url: '',
        };
        var opts = $.extend(defaults, options);
        return this.each(function() {
            _initialize($(this), opts);
        });
    };
    var _lookup_link = function(id, val) {
        var lookuplink = $('<a class="related-lookup"></a>');
        lookuplink.attr('id', 'lookup_'+id);
        lookuplink.attr('href', "../../../" + MODEL_URL_ARRAY[val].app + "/" + MODEL_URL_ARRAY[val].model + '/?t=id');
        lookuplink.attr('onClick', 'return showRelatedObjectLookupPopup(this);');
        return lookuplink;
    }
    var _initialize = function(elem, options) {
        var ct = elem.closest('div[class*="object_id"]').prev().find(':input[name*="content_type"]');
        if (ct.val()) {
            elem.after(options.placeholder).after(_lookup_link(elem.attr("id"),ct.val()));
        }
        _get_generic_repr(elem, options);
        _register_handler(elem, options);
        _register_ct_handler(ct, options);
    };
    var _register_handler = function(elem, options) {
        elem.bind("change focus keyup blur", function() {
            _get_generic_repr(elem, options);
        });
    };
    var _register_ct_handler = function(elem, options) {
        elem.bind("change", function() {
            _update_lookup(elem, options);
        });
    };
    var _update_lookup = function(elem, options) {
        var obj = elem.closest('div[class*="content_type"]').next().find('input[name*="object_id"]');
        obj.val('');
        obj.next().remove();
        obj.next().remove();
        if (elem.val()) {
            obj.after(options.placeholder).after(_lookup_link(obj.attr('id'),elem.val()));
        }
    };
    var _get_generic_repr = function(elem, options) {
        var link = elem.next();
        if (link.length == 0) return;
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];
        var text = elem.next().next();
        $.get(options.lookup_url, {
            object_id: elem.val(),
            app_label: app_label,
            model_name: model_name
        }, function(data) {
            text.text('');
            if (data) {
                if (data.length > options.repr_max_length) {
                    text.text(decodeURI(data.substr(0,  options.repr_max_length) + " ..."));
                } else {
                    text.text(decodeURI(data));
                }
            }
        });
    };
})(django.jQuery);