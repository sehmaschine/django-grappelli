(function($) {
    $(document).ready(function() {
        grappelli.initDateAndTimePicker();
        var data = $('#grapelli-change-list-constants').data();
        var prefix = "form";
        var related_lookup_fields_fk = data.relatedLookupFieldsFk;
        var related_lookup_fields_m2m = data.relatedLookupFieldsM2m;
        var related_lookup_fields_generic = data.relatedLookupFieldsGeneric;
        var autocomplete_fields_fk = data.autocompleteFieldsFk;
        var autocomplete_fields_m2m = data.autocompleteFieldsM2m;
        var autocomplete_fields_generic = data.autocompleteFieldsGeneric;
        $.each(related_lookup_fields_fk, function() {
            $("div.grp-changelist-results")
            .find("input[name^='" + prefix + "'][name$='-" + this + "']")
            .grp_related_fk({lookup_url: data.urlGrpRelatedLookup});
        });
        $.each(related_lookup_fields_m2m, function() {
            $("div.grp-changelist-results")
            .find("input[name^='" + prefix + "'][name$='-" + this + "']")
            .grp_related_m2m({lookup_url: data.urlGrpM2mLookup});
        });
        $.each(related_lookup_fields_generic, function() {
            var content_type = this[0],
                object_id = this[1];
            $("div.grp-changelist-results")
            .find("input[name^='" + prefix + "'][name$='-" + this[1] + "']")
            .each(function() {
                var ct_id = "#id_" + prefix + "-" + $(this).attr("id").split("-")[1] + "-" + content_type,
                    obj_id = "#id_" + prefix + "-" + $(this).attr("id").split("-")[1] + "-" + object_id;
                $(this).grp_related_generic({content_type:ct_id, object_id:obj_id, lookup_url: data.urlGrpRelatedLookup});
            });
        });
        $.each(autocomplete_fields_fk, function() {
            $("div.grp-changelist-results")
            .find("input[name^='" + prefix + "'][name$='-" + this + "']")
            .each(function() {
                $(this).grp_autocomplete_fk({
                    lookup_url: data.urlGrpRelatedLookup,
                    autocomplete_lookup_url: data.urlGrpAutocompleteLookup
                });
            });
        });
        $.each(autocomplete_fields_m2m, function() {
            $("div.grp-changelist-results")
            .find("input[name^='" + prefix + "'][name$='-" + this + "']")
            .each(function() {
                $(this).grp_autocomplete_m2m({
                    lookup_url: data.urlGrpM2mLookup,
                    autocomplete_lookup_url: data.urlGrpAutocompleteLookup
                });
            });
        });
        $.each(autocomplete_fields_generic, function() {
            var content_type = this[0],
                object_id = this[1];
            $("div.grp-changelist-results")
            .find("input[name^='" + prefix + "'][name$='-" + this[1] + "']")
            .each(function() {
                var i = $(this).attr("id").match(/-\d+-/);
                if (i) {
                    var ct_id = "#id_" + prefix + i[0] + content_type,
                        obj_id = "#id_" + prefix + i[0] + object_id;
                    $(this).grp_autocomplete_generic({
                        content_type:ct_id,
                        object_id:obj_id,
                        lookup_url: data.urlGrpRelatedLookup,
                        autocomplete_lookup_url: data.urlGrpAutocompleteLookup
                    });
                }
            });
        });
        // reset actions select box
        $('.grp-changelist-actions select').val(-1);
        // find errors and move (because errors should be below form elements)
        $("ul.errorlist").each(function() {
            $(this).parents("td").append($(this));
        });
        // HACK: get rid of currently/change with URL–fields. F**K!!!
        $('p.url').each(function() {
            $(this).find("a").remove();
            var text = $(this).html();
            text = text.replace(/^\w*: /, "");
            text = text.replace(/<br>.*: /, "");
            $(this).html(text);
        });
        // HACK: remove input types
        var clean_input_types = data.grapelliCleanInputTypes;
        if (clean_input_types == "True") {
            grappelli.cleanInputTypes();
        };
    });
})(grp.jQuery);
