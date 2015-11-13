(function($) {
    "use strict";
    $(document).ready(function() {
        grappelli.initSearchbar();
        grappelli.initFilter();
        $('.add-another').click(function(e) {
            e.preventDefault();
            showAddAnotherPopup(this);
        });
        $('.related-lookup').click(function(e) {
            e.preventDefault();
            showRelatedObjectLookupPopup(this);
        });
    });
})(grp.jQuery);
