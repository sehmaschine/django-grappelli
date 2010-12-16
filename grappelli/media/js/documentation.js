(function($) {
    $(document).ready(function(){
        // Correct the position of anchors (because "#header" & "#breadcrumbs" have a "position:fixed")
        $('.table-of-contents a').click(function(){
            var myReference = ".rte " + $(this).attr('href');
            // if collapsible
            var myParentCollapsible = $(myReference).parent().parent();
            if ($(myParentCollapsible).hasClass('closed')){
                $(myParentCollapsible).toggleClass('open').toggleClass('closed');
            }
            // anchor offset
            var targetOffset = $(myReference).offset().top;
            $('html,body').scrollTop(targetOffset - 60);
            return(false);
        })
        // Remove emtpy elements: wrkaround for problem reported in django-ticket #11817
        $('.rte h4:empty').remove();
        $('.rte p:empty').remove();
        $('.rte hr').remove();
    });
})(django.jQuery);