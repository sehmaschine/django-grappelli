/**
 * GRAPPELLI RELATED FK
 * generic lookup
 */

(function($){
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.grp_related_generic.defaults, options);
            return this.each(function() {
                var $this = $(this);
                // add placeholder
                if ($(options.content_type).val()) {
                    $this.after(options.placeholder).after(lookup_link($this.attr("id"),$(options.content_type).val()));
                }
                // lookup
                lookup_id($this, options); // lookup when loading page
                $this.bind("change focus keyup blur", function() { // id-handler
                    lookup_id($this, options);
                });
                $(options.content_type).bind("change", function() { // content-type-handler
                    update_lookup($(this), options);
                });
            });
        }
    };
    
    $.fn.grp_related_generic = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.grp_related_generic');
        };
        return false;
    };
    
    var lookup_link = function(id, val) {
        var lookuplink = $('<a class="related-lookup"></a>');
        lookuplink.attr('id', 'lookup_'+id);
        lookuplink.attr('href', "../../../" + MODEL_URL_ARRAY[val].app + "/" + MODEL_URL_ARRAY[val].model + '/?t=id');
        lookuplink.attr('onClick', 'return showRelatedObjectLookupPopup(this);');
        return lookuplink;
    };
    
    var update_lookup = function(elem, options) {
        var obj = $(options.object_id);
        obj.val('');
        obj.next().remove();
        obj.next().remove();
        if ($(elem).val()) {
            obj.after(options.placeholder).after(lookup_link(obj.attr('id'),$(elem).val()));
        }
    };
    
    var lookup_id = function(elem, options) {
        var text = elem.next().next();
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: grappelli.get_app_label(elem),
            model_name: grappelli.get_model_name(elem)
        }, function(data) {
            text.text(data[0].label);
        });
    };
    
    $.fn.grp_related_generic.defaults = {
        placeholder: '&nbsp;<strong></strong>',
        repr_max_length: 30,
        lookup_url: '',
        content_type: '',
        object_id: ''
    };
    
})(django.jQuery);