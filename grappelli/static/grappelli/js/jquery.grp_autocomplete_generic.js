/**
 * GRAPPELLI AUTOCOMPLETE GENERIC
 * generic lookup with autocomplete
 */

(function($){
    
    var methods = {
        init: function(options) {
            options = $.extend({}, $.fn.grp_autocomplete_generic.defaults, options);
            return this.each(function() {
                var $this = $(this);
                // build autocomplete wrapper
                if ($(options.content_type).val()) {
                    $this.after(loader).after(remove_link($this.attr('id'))).after(lookup_link($this.attr("id"),$(options.content_type).val()));
                }
                $this.parent().wrapInner("<div class='autocomplete-wrapper-fk'></div>");
                $this.parent().prepend("<input id='" + $this.attr("id") + "-autocomplete' type='text' class='vTextField' value='' />");
                // defaults
                options = $.extend({
                    wrapper_autocomplete: $(this).parent(),
                    input_field: $(this).prev(),
                    remove_link: $this.next().next().hide(),
                    loader: $this.next().next().next().hide()
                }, $.fn.grp_autocomplete_generic.defaults, options);
                // lookup
                lookup_id($this, options);  // lookup when loading page
                lookup_autocomplete($this, options);  // autocomplete-handler
                $this.bind("change focus keyup blur", function() {  // id-handler
                    lookup_id($this, options);
                });
                $(options.content_type).bind("change", function() {  // content-type-handler
                    update_lookup($(this), options);
                });
                // labels
                $("label[for='"+$this.attr('id')+"']").each(function() {
                    $(this).attr("for", $this.attr("id")+"-autocomplete");
                });
            });
        }
    };
    
    $.fn.grp_autocomplete_generic = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.grp_autocomplete_generic');
        };
        return false;
    };
    
    var loader = function() {
        var loader = $('<div class="loader">loader</div>');
        return loader;
    };
    
    var remove_link = function(id) {
        var removelink = $('<a class="related-remove"></a>');
        removelink.attr('id', 'remove_'+id);
        removelink.attr('href', 'javascript://');
        removelink.attr('onClick', 'return removeRelatedObject(this);');
        removelink.hover(function() {
            $(this).parent().toggleClass("autocomplete-preremove");
        });
        return removelink;
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
        obj.prev().val('');
        obj.next().remove();
        obj.next().remove();
        obj.next().remove();
        if ($(elem).val()) {
            obj.after(loader).after(remove_link(obj.attr('id'))).after(lookup_link(obj.attr('id'),$(elem).val()));
            options.remove_link = obj.next().next().hide();
            options.loader = obj.next().next().next().hide();
        }
    };
    
    var lookup_autocomplete = function(elem, options) {
        options.wrapper_autocomplete.find("input:first")
            .autocomplete({
                minLength: 1,
                delay: 1000,
                source: function(request, response) {
                    $.ajax({
                        url: options.autocomplete_lookup_url,
                        dataType: 'json',
                        data: "term=" + request.term + "&app_label=" + grappelli.get_app_label(elem) + "&model_name=" + grappelli.get_model_name(elem) + "&query_string=" + grappelli.get_query_string(elem),
                        beforeSend: function (XMLHttpRequest) {
                            if ($(options.content_type).val()) {
                                options.loader.show();
                            } else {
                                return false;
                            }
                        },
                        success: function(data){
                            response($.map(data, function(item) {
                                return {label: item.label, value: item.value};
                            }));
                        },
                        complete: function (XMLHttpRequest, textStatus) {
                            options.loader.hide();
                        }
                    });
                },
                focus: function() { // prevent value inserted on focus
                    return false;
                },
                select: function(event, ui) {
                    options.input_field.val(ui.item.label);
                    elem.val(ui.item.value);
                    elem.val() ? $(options.remove_link).show() : $(options.remove_link).hide();
                    return false;
                }
            })
            .data("autocomplete")._renderItem = function(ul,item) {
                return $("<li></li>")
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.label + " (" + item.value + ")")
                    .appendTo(ul);
            };
    };
    
    var lookup_id = function(elem, options) {
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: grappelli.get_app_label(elem),
            model_name: grappelli.get_model_name(elem)
        }, function(data) {
            $.each(data, function(index) {
                options.input_field.val(data[index].label);
                elem.val() ? $(options.remove_link).show() : $(options.remove_link).hide();
            });
        });
    };
    
    $.fn.grp_autocomplete_generic.defaults = {
        autocomplete_lookup_url: '',
        lookup_url: '',
        content_type: '',
        object_id: ''
    };
    
})(django.jQuery);