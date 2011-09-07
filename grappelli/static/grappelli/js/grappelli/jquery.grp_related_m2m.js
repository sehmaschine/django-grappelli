/**
 * GRAPPELLI RELATED M2M
 * m2m lookup
 */

(function($){
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.grp_related_m2m.defaults, options);
            return this.each(function() {
                var $this = $(this);
                // add placeholder
                $this.next().after(options.placeholder);
                // change lookup class
                $this.next().addClass("m2m");
                // lookup
                lookup_id($this, options); // lookup when loading page
                $this.bind("change focus keyup blur", function() { // id-handler
                    lookup_id($this, options);
                });
            });
        }
    };
    
    $.fn.grp_related_m2m = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.grp_related_m2m');
        };
        return false;
    };
    
    var lookup_id = function(elem, options) {
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: grappelli.get_app_label(elem),
            model_name: grappelli.get_model_name(elem)
        }, function(data) {
            values = $.map(data, function (a) { return a.label; });
            elem.next().next().text(values.join(", "));
        });
    };
    
    $.fn.grp_related_m2m.defaults = {
        placeholder: '&nbsp;<strong></strong>',
        repr_max_length: 30,
        lookup_url: ''
    };
    
})(django.jQuery);