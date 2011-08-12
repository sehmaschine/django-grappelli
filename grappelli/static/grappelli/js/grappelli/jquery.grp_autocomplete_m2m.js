/**
 * GRAPPELLI RELATED FK
 * foreign-key lookup with autocomplete
 */


(function($){
    $.fn.grp_autocomplete_m2m = function(options){
        var defaults = {
            input_field: "<div class='autocomplete-wrapper'><ul class='repr'></ul></div>",
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
        // remove djangos object representation
        elem.next().next().remove();
        // add autocomplete input
        //elem.next().after(options.input_field);
        elem.parent().wrapInner(options.input_field);
        // handlers
        _get_m2m_repr(elem, options);
        _autocomplete(elem, options);
        _register_handler(elem, options);
        // elem.next().next().bind("click", function() {
        //     console.log($(this));
        //     return false;
        // });
        $("a.repr-remove").live("click", function(e) {
            var rel = $(this).attr("rel");
            var values = split($(elem).val());
            values = $.grep(values, function(val) { return val != rel; });
            $(this).parent().remove();
            elem.val(values);
        });
    };
    var _register_handler = function(elem, options) {
        elem.bind("change focus keyup blur", function() {
            //elem.val(check(elem.val()));
            _get_m2m_repr(elem, options);
        });
    };
    var clean = function(value) {
        if (value.charAt(0) == ",") value = value.substr(1);
        if (value.charAt(value.length - 1) == ",") value = value.substr(0, value.length-1);
        return value
    };
    var split = function(val) {
        return val.split( /,\s*/ );
    };
    var extractLast = function(term) {
        return split(term).pop();
    };
    var _autocomplete = function(elem, options) {
        var link = elem.next("a");
        if (link.length === 0) { return; }
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];
        var repr_wrapper = elem.next().next();
        repr_wrapper.append("<ul class='search'><li class='search'><input type='text' class='vTextField' value='' /></li></ul>");
        elem.next().next().find("input:first")
            // don't navigate away from the field on tab when selecting an item
            .bind("keydown", function(event) {
                if (event.keyCode === $.ui.keyCode.TAB && $(this).data("autocomplete").menu.active) {
                    event.preventDefault();
                }
            })
            // autocomplete m2m
            .autocomplete({
                minLength: 1,
                position: {
                    my: "left top",
                    at: "left bottom",
                    of: elem.next().next()
                },
                open: function() {
                    $('ul.ui-menu').width(elem.next().next().width());
                },
                source: function(request, response ) {
                    $.getJSON(options.autocomplete_lookup_url, {
                        term: request.term,
                        app_label: app_label,
                        model_name: model_name,
                        filters: "name__icontains",
                        // display: "",
                    }, function(data) {
                        response($.map(data, function(item) {
                            return {
                                label: item.label,
                                value: item.value
                            }
                        }));
                    });
                },
                focus: function() {
                    // prevent value inserted on focus
                    return false;
                },
                select: function(event, ui) {
                    // don´t prevent adding items multiple times since these items are being removed by django anyway
                    var values = $(elem).val().split(",");
                    var value = ui.item.value+='';
                    if ($.inArray(value, values) == -1) {
                        // repr
                        elem.next().next().children("ul.repr").append("<li class='repr'><a class='repr-remove' rel=" + ui.item.value + " href='javascript://'>" + ui.item.label + "</a></li>")
                        // values
                        var values = split($(elem).val());
                        values.push(ui.item.value);
                        values.push("");
                        values = values.join(",");
                        //values = values.substring(0, values.length-1)
                        $(elem).val(clean(values));
                    }
                    $(this).val("");
                    $(this).focus();
                    return false;
                }
        });
    };
    var _get_m2m_repr = function(elem, options) {
        var link = elem.next("a");
        if (link.length === 0) { return; }
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];
        var repr_wrapper = elem.next().next().children("ul.repr");
        $.getJSON(options.lookup_url, {
            object_id: elem.val(),
            app_label: app_label,
            model_name: model_name
        }, function(data) {
            repr_wrapper.find("li.repr").remove();
            $.each(data, function(index) {
                repr_wrapper.append("<li class='repr'><a class='repr-remove' rel=" + data[index].value + " href='javascript://'>" + data[index].label + "</a></li>")
            })
        });
    };
})(django.jQuery);