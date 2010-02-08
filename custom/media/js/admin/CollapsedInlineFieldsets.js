$(document).ready(function(){
    
    /// INLINE ELEMENTS
    /// collapsible elements for stacked inlines
    $('div.inline-stacked div.inline-related').each(function(i) {
        $(this).addClass("collapsed");
        $(this).find('h3:first').attr("class", "collapse-toggle");
    });
    $('div.inline-stacked div.inline-related h3.collapse-toggle').bind("click", function(){
        $(this).parent().toggleClass('collapsed');
        $(this).parent().toggleClass('collapse-closed');
        $(this).parent().toggleClass('collapse-open');
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
        $(this).parent().toggleClass('collapse-closed');
        $(this).parent().toggleClass('collapse-open');
    });
    
    /// OPEN STACKEDINLINE WITH ERRORS (onload)
    $('div.inline-stacked div.inline-related').find('div[class*="errors"]:first').each(function(){
        $(this).parents('div.inline-related').removeClass("collapse-closed");
        $(this).parents('div.inline-related').removeClass("collapsed");
        $(this).parents('div.inline-related').addClass("collapse-open");
        $(this).parents('div.inline-stacked').removeClass("collapse-closed");
        $(this).parents('div.inline-stacked').removeClass("collapsed");
        $(this).parents('div.inline-stacked').addClass("collapse-open");
    });
    
    /// OPEN TABULARINLINE WITH ERRORS (onload)
    $('div.inline-tabular').find('div[class*="error"]:first').each(function(i) {
        $(this).parents('div.inline-tabular').removeClass("collapse-closed");
        $(this).parents('div.inline-tabular').removeClass("collapsed");
        $(this).parents('div.inline-tabular').addClass("collapse-open");
    });
    
    /// FIELDSETS WITHIN STACKED INLINES
    $('div.inline-related').find('fieldset[class*="collapse-closed"]').each(function() {
        $(this).addClass("collapsed");
        $(this).find('h4:first').addClass("collapse-toggle");
    });
    $('div.inline-related').find('fieldset[class*="collapse-open"]').each(function() {
        $(this).find('h4:first').addClass("collapse-toggle");
    });
    $('h4.collapse-toggle').bind("click", function(e){
        $(this).parent().toggleClass('collapsed');
        $(this).parent().toggleClass('collapse-closed');
        $(this).parent().toggleClass('collapse-open');
    });
    
});
