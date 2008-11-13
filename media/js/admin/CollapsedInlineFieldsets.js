$(document).ready(function(){
    
    /// STACKEDINLINE / INLINERELATED
    $('div[name="inlinerelated"]').each(function(i) {
        $(this).addClass("collapsed");
        $(this).find('h3:first').attr("class", "collapse-toggle");
    });
    $('div[name="inlinerelated"] h3.collapse-toggle').bind("click", function(e){
        $(this).parent().toggleClass('collapsed');
    });
    /// STACKEDINLINE / INLINEGROUPS
    $('div[name="inlinegroup"]').each(function(i) {
        $(this).addClass("collapsed");
        $(this).find('h2:first').attr("class", "collapse-toggle");
    });
    $('div[name="inlinegroup"] h2.collapse-toggle:first').bind("click", function(e){
        $(this).parent().toggleClass('collapsed');
    });
    /// TABULARINLINE
    $('div[name="inlinegrouptabular"]').each(function(i) {
        $(this).addClass("collapsed");
        $(this).find('h2:first').attr("class", "collapse-toggle");
    });
    $('div[name="inlinegrouptabular"] h2.collapse-toggle').bind("click", function(e){
        $(this).parent().toggleClass('collapsed');
    });
    /// OPEN STACKEDINLINE WITH ERRORS
    $('div[name="inlinerelated"]').find('div[class*="errors"]:first').each(function(i) {
        /// toggle each inlinerelated with error-rows inside
        $(this).parent().parent().toggleClass("collapsed");
    });
    $('div[name="inlinegroup"]').find('div[class*="errors"]:first').each(function(i) {
        /// toggle each inlinegroup with error-rows inside
        $(this).parent().parent().parent().toggleClass("collapsed");
    });
    /// OPEN TABULARINLINE WITH ERRORS
    $('div[name="inlinerelatedtabular"]').find('td[class*="error"]:first').each(function(i) {
        /// toggle each inlinerelated with error-rows inside
        $(this).parent().parent().parent().parent().parent().parent().toggleClass("collapsed");
    });
    
});
