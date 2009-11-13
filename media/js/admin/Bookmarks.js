$(document).ready(function(){
    
    $("li#toggle-bookmarks-listing.enabled").live("mouseover", function(){
        $("#bookmarks-listing").show();
    }).live("mouseout", function(){
        $("#bookmarks-listing").hide();
    });
    $('#toggle-bookmark-add').live("click", function() {
        $("input#bookmark-title").val($('h1').text());
        $("input#bookmark-path").val(escape(window.location.pathname + window.location.search));
        $("#bookmark-add").show();
        $("#toggle-bookmarks-listing").removeClass('enabled');
    });
    $('#bookmark-add-cancel').live("click", function() {
        $("#bookmark-add").hide();
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    });
    
});