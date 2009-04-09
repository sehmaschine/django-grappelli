$(document).ready(function(){
    
    /// INLINE ELEMENTS
    /// collapsible elements for stacked inlines
    $('div.inline-stacked div.inline-related').each(function(i) {
        $(this).addClass("collapsed");
        $(this).find('h3:first').attr("class", "collapse-toggle");
    });
    $('div.inline-stacked div.inline-related h3.collapse-toggle').bind("click", function(){
        $(this).parent().toggleClass('collapsed');
    });
    
    /// INLINEGROUPS (STACKED & TABULAR)
    $('div.inline-group.collapse-closed').each(function() {
        $(this).addClass("collapsed");
        $(this).find('h2:first').attr("class", "collapse-toggle");
    });
    $('div.inline-group.collapse-open').each(function() {
        $(this).find('h2:first').attr("class", "collapse-toggle");
    });
    $('div.inline-group h2.collapse-toggle').bind("click", function(){
        $(this).parent().toggleClass('collapsed');
    });
    
    /// OPEN STACKEDINLINE WITH ERRORS
    $('div.inline-stacked div.inline-related').find('div[class*="errors"]:first').each(function(){
        $(this).parent().parent().toggleClass("collapsed");
    });
    $('div.inline-stacked').find('div[class*="errors"]:first').each(function(){
        /// open inline group
        $(this).parent().parent().parent().parent().toggleClass("collapsed");
    });
    
    /// OPEN TABULARINLINE WITH ERRORS
    $('div.inline-tabular').find('div[class*="error"]:first').each(function(i) {
        $(this).parents('div.inline-tabular').removeClass("collapsed");
    });
    
});
