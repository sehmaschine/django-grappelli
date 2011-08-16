/**
 * GRAPPELLI AUTOCOMPLETE M2M
 * many-to-many lookup with autocomplete
 */


(function($){
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.grp_autocomplete_m2m.defaults, options);
            return this.each(function() {
                var $this = $(this);
                // build autocomplete wrapper
                $this.parent().wrapInner("<div class='autocomplete-wrapper-m2m'></div>");
                $this.parent().prepend("<ul class='search'><li class='search'><input type='text' class='vTextField' value='' /></li></ul>").prepend("<ul class='repr'></ul>");
                // defaults
                options = $.extend({
                    wrapper_autocomplete: $this.parent(),
                    wrapper_repr: $this.parent().find("ul.repr"),
                    wrapper_search: $this.parent().find("ul.search")
                }, $.fn.grp_autocomplete_m2m.defaults, options);
                // lookup
                lookup_id($this, options);  // lookup when loading page
                lookup_autocomplete($this, options);  // autocomplete-handler
                $this.bind("change focus keyup blur", function() { // id-handler
                    lookup_id($this, options);
                });
            });
        }
    };
    
    $.fn.grp_autocomplete_m2m = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.grp_autocomplete_m2m');
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
    
    var value_add = function(elem, value, options) {
        var values = [];
        if (elem.val()) values = elem.val().split(",");
        values.push(value);
        elem.val(values.join(","));
        return values.join(",");
    };
    
    var value_remove = function(elem, position, options) {
        var values = [];
        if (elem.val()) values = elem.val().split(",");
        values.splice(position,1);
        elem.val(values.join(","));
        return values.join(",");
    };
    
    var repr_add = function(elem, label, options) {
        var repr = $('<li class="repr"></li>');
        var removelink = $('<a class="m2m-remove" href="javascript://">X</a>');
        repr.append("<span>" + label + "</span").append(removelink);
        options.wrapper_repr.append(repr);
        removelink.bind("click", function() { // remove-handler
            var pos = $(this).parent().parent().children("li").index($(this).parent());
            value_remove(elem, pos, options);
            $(this).parent().remove();
        });
        removelink.hover(function() {
            $(this).parent().toggleClass("autocomplete-preremove");
        });
    };
    
    var lookup_autocomplete = function(elem, options) {;
        options.wrapper_search.find("input:first")
            .bind("keydown", function(event) { // don't navigate away from the field on tab when selecting an item
                if (event.keyCode === $.ui.keyCode.TAB && $(this).data("autocomplete").menu.active) {
                    event.preventDefault();
                }
            })
            .bind("focus", function() {
                options.wrapper_autocomplete.addClass("state-focus");
            })
            .bind("blur", function() {
                options.wrapper_autocomplete.removeClass("state-focus");
            })
            .autocomplete({
                minLength: 1,
                position: {my: "left top", at: "left bottom", of: options.wrapper_autocomplete},
                source: function(request, response ) {
                    $.getJSON(options.autocomplete_lookup_url, {
                        term: request.term,
                        app_label: get_app_label(elem, options),
                        model_name: get_model_name(elem, options)
                    }, function(data) {
                        response($.map(data, function(item) {
                            return {label: item.label, value: item.value};
                        }));
                    });
                },
                focus: function() { // prevent value inserted on focus
                    return false;
                },
                select: function(event, ui) { // add repr, add value
                    repr_add(elem, ui.item.label, options);
                    value_add(elem, ui.item.value, options);
                    $(this).val("").focus();
                    return false;
                }
            });
    };
    
    var lookup_id = function(elem, options) {
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: get_app_label(elem, options),
            model_name: get_model_name(elem, options)
        }, function(data) {
            options.wrapper_repr.find("li.repr").remove();
            options.wrapper_search.find("input").val("");
            $.each(data, function(index) {
                repr_add(elem, data[index].label, options);
            });
        });
    };

})(django.jQuery);