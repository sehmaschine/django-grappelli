(function($){
    
    $.grappelli = {
        urls: {}
    };

    // INIT
    $(function(){

        // Always focus first field of a form OR the search input
        $('form .form-row:eq(0)')
            .find('input, select, textarea, button').eq(0)
            .add('#searchbar').focus();

        // Load bookmarks
        var bookmarksURL = $.grappelli.urls.bookmarks +'?path='+ window.location.pathname;
        $('#bookmarks').load(bookmarksURL +' #bookmarks > li');

        $("li#toggle-bookmarks-listing.enabled").live("mouseover", function(){
            $("#bookmarks-listing").show();
        }).live("mouseout", function(){
            $("#bookmarks-listing").hide();
        });
        $('#toggle-bookmark-add').live("click", function() {
            $("input#bookmark-title").val($('h1').text());
            $("input#bookmark-path").val(window.location.pathname);
            $("#bookmark-add").show();
            $("#toggle-bookmarks-listing").removeClass('enabled');
        });
        $('#bookmark-add-cancel').live("click", function() {
            $("#bookmark-add").hide();
            $("#toggle-bookmarks-listing").toggleClass('enabled');
            return false;
        });

    });

})(jQuery);



