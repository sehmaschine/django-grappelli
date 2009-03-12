$(document).ready(function(){
    
    /// INLINE ELEMENTS
    /// collapsible elements for stacked inlines
    $('div[name="inlinerelated"]').each(function(i) {
        /// inlines are closed by default
        $(this).addClass("collapsed");
        /// add collapse-class to the first headline
        $(this).find('h3:first').attr("class", "collapse-toggle");
    });
    $('div[name="inlinerelated"] h3.collapse-toggle').bind("click", function(){
        /// add collapse-handler
        $(this).parent().toggleClass('collapsed');
    });
    
    /// INLINEGROUPS (STACKED & TABULAR)
    $('div.inline-group').each(function() {
        /// inlinegroups are closed by default
        $(this).addClass("collapsed");
        /// add collapse-class to the first headline
        $(this).find('h2:first').attr("class", "collapse-toggle");
    });
    $('div[name="inlinegroup"] h2.collapse-toggle').bind("click", function(){
        /// add collapse-handler for stacked inlines
        $(this).parent().toggleClass('collapsed');
    });
    $('div[name="inlinegrouptabular"] h2.collapse-toggle').bind("click", function(){
        /// add collapse-handler for tabular inlines
        $(this).parent().toggleClass('collapsed');
    });
    
    /// OPEN STACKEDINLINE WITH ERRORS
    $('div[name="inlinerelated"]').find('div[class*="errors"]:first').each(function(){
        /// open inline element
        $(this).parent().parent().toggleClass("collapsed");
    });
    $('div[name="inlinegroup"]').find('div[class*="errors"]:first').each(function(){
        /// open inline group
        $(this).parent().parent().parent().parent().toggleClass("collapsed");
    });
    
    /// OPEN TABULARINLINE WITH ERRORS
    $('div[name="inlinerelatedtabular"]').find('div[class*="error"]:first').each(function(i) {
        /// open inline group
        $(this).parent().parent().parent().parent().toggleClass("collapsed");
    });
    
});
