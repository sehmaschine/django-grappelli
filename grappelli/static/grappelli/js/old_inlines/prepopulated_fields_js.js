(function($, document) {
    "use strict";
    var fields = $('#grapelli-prepopulated-fields-js').data('preopulatedFields');
    $.each(fields, function (index, field){
        var dependencyIds = $.map(
            field.dependencyIds, function(id){ return '#' + id}
        );
        var $field = $(document.getElementById(field.id));
        $field.addClass('prepopulated_field');
        $field.data({
            'dependency_ids': dependencyIds,
            'dependency_list': field.dependencyList,
        })
        $field.prepopulate(
            dependencyIds, field.maxLength === null ? 50 : field.maxLength
        );
    });
})(grp.jQuery, document);
