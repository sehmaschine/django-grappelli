(function($) {
    "use strict";
    $(document).ready(function() {
        var data = $('#grapelli-change-form-actions-constants').data()
        $('.add-another').click(function(e) {
            e.preventDefault();
            showAddAnotherPopup(this);
        });
        $('.related-lookup').click(function(e) {
            e.preventDefault();
            showRelatedObjectLookupPopup(this);
        });

        if (data.adminform === 'True'){
            $('form#' + data.modelName + '_form :input:visible:enabled:first').focus();
        }
    });
})(grp.jQuery);
