/**
 * GRAPPELLI RELATED FK
 * foreign-key lookup
 */

(function($){
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.grp_related_fk.defaults, options);
            return this.each(function() {
                var $this = $(this);
                // remove djangos object representation
                if ($this.next().next() && $this.next().next().attr("class") != "errorlist") {
                    $this.next().next().remove();
                }
                // add placeholder
                $this.next().after(options.placeholder);
                // lookup
                lookup_id($this, options); // lookup when loading page
                $this.bind("change focus keyup blur", function() { // id-handler
                    lookup_id($this, options);
                });
            });
        }
    };
    
    $.fn.grp_related_fk = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.grp_related_fk');
        };
        return false;
    };
    
    var get_app_label = function(elem, options) {
        var link = elem.next("a");
        if (link.length > 0) {
            var url = link.attr('href').split('/');
            return url[url.length-3];
        }
        return false;
    };
    
    var get_model_name = function(elem, options) {
        var link = elem.next("a");
        if (link.length > 0) {
            var url = link.attr('href').split('/');
            return url[url.length-2];
        }
        return false;
    };
    
    var lookup_id = function(elem, options) {
        var text = elem.next().next();
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: get_app_label(elem, options),
            model_name: get_model_name(elem, options)
        }, function(data) {
            text.text(data[0].label);
        });
    };
    
    $.fn.grp_related_fk.defaults = {
        placeholder: '&nbsp;<strong></strong>',
        repr_max_length: 30,
        lookup_url: ''
    };
    
})(django.jQuery);