$(document).ready(function(){
   /// Dashboard Group-Collapsible
   $('div[class*="group-collapsible collapse-closed"]').each(function() {
       $(this).addClass("collapsed");
       $(this).find('h2:first').addClass("collapse-toggle");
   });
   $('div[class*="group-collapsible collapse-open"]').each(function() {
       $(this).find('h2:first').addClass("collapse-toggle");
   });
   /// Enable/Disable Collapse Function
   $("h2.collapse-toggle a").click(function(){
       $("body").addClass("collapse-hold");
   });
   $('h2.collapse-toggle').bind("click", function(e){
       if (!$("body").hasClass("collapse-hold")) {
           $(this).parent().toggleClass('collapsed');
           $(this).parent().toggleClass('collapse-closed');
           $(this).parent().toggleClass('collapse-open');
       }
   });
});