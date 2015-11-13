(function($) {
    "use strict";
    $(document).ready(function() {
        var data = $("#grapelli-change-form-constants").data()
        grappelli.initDateAndTimePicker();
        $("#grp-content-container .grp-group").grp_collapsible_group();
        $("#grp-content-container .grp-collapse").grp_collapsible({
            on_init: function(elem, options) {
                // open collapse (and all collapse parents) in case of errors
                if (elem.find("ul.errorlist").length > 0) {
                    elem.removeClass("grp-closed")
                        .addClass("grp-open");
                    elem.parents(".grp-collapse")
                        .removeClass("grp-closed")
                        .addClass("grp-open");
                }
            }
        });
        var related_lookup_fields_fk = data.relatedLookupFieldsFk;
        var related_lookup_fields_m2m = data.relatedLookupFieldsM2m;
        var related_lookup_fields_generic = data.relatedLookupFieldsGeneric;
        var autocomplete_fields_fk = data.autocompleteFieldsFk;
        var autocomplete_fields_m2m = data.autocompleteFieldsM2m;
        var autocomplete_fields_generic = data.autocompleteFieldsGeneric;
        $.each(related_lookup_fields_fk, function() {
            $("#id_" + this).grp_related_fk({lookup_url: data.urlGrpRelatedLookup});
        });
        $.each(related_lookup_fields_m2m, function() {
            $("#id_" + this).grp_related_m2m({lookup_url: data.urlGrpM2mLookup});
        });
        $.each(related_lookup_fields_generic, function() {
            var content_type = "#id_" + this[0],
                object_id = "#id_" + this[1];
            $(object_id).grp_related_generic({content_type:content_type, object_id:object_id, lookup_url: data.urlGrpRelatedLookup});
        });
        $.each(autocomplete_fields_fk, function() {
            $("#id_" + this).grp_autocomplete_fk({
                lookup_url: data.urlGrpRelatedLookup,
                autocomplete_lookup_url: data.urlGrpAutocompleteLookup
            });
        });
        $.each(autocomplete_fields_m2m, function() {
            $("#id_" + this).grp_autocomplete_m2m({
                lookup_url: data.urlGrpM2mLookup,
                autocomplete_lookup_url: data.urlGrpAutocompleteLookup
            });
        });
        $.each(autocomplete_fields_generic, function() {
            var content_type = "#id_" + this[0],
                object_id = "#id_" + this[1];
            $(object_id).grp_autocomplete_generic({
                content_type:content_type,
                object_id:object_id,
                lookup_url: data.urlGrpRelatedLookup,
                autocomplete_lookup_url: data.urlGrpAutocompleteLookup
            });
        });
        $("a#grp-open-all").bind("click", function(){
            $("#grp-content .grp-collapse-handler").each(function() {
                $(this).parent(".grp-collapse").removeClass("grp-closed").addClass("grp-open");
            });
        });
        $("a#grp-close-all").bind("click", function(){
            $("#grp-content .grp-collapse-handler").each(function() {
                $(this).parent(".grp-collapse").removeClass("grp-open").addClass("grp-closed");
            });
        });
        // HACK: get rid of currently/change with URL–fields. F**K!!!
        $('p.url').each(function() {
            $(this).find("a").remove();
            var text = $(this).html();
            text = text.replace(/^\w*: /, "");
            text = text.replace(/<br>.*: /, "");
            $(this).html(text);
        });
        // HACK: rearrange inlines
        $('div.grp-group').each(function() {
            var placeholder = $("fieldset.placeholder."+$(this).attr("id"));
            if (placeholder.length) {
                $(placeholder).replaceWith($(this));
            }
        });
        // HACK: remove input types
        var clean_input_types = data.grapelliCleanInputTypes;
        if (clean_input_types == "True") {
            grappelli.cleanInputTypes();
        };
    });
})(grp.jQuery);
