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

    });

})(jQuery);



