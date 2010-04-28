(function($) {
    
    function initializeFlexibleLayout(content) {
        $('#content').addClass('content-flexible');
        $(content).find('.span-flexible').next('.column').parent().addClass('layout-flexible-grid');
        $(content).find('.column').next('.span-flexible').parent().addClass('layout-grid-flexible');
        $(content).append('<br clear="all" />');
        // Layout Flexible + Grid
        if ($(content).hasClass('layout-flexible-grid')) {
            var SpanGrid = $(content).find('.span-flexible').next('.column').outerWidth();
            var PaddingRight = SpanGrid + 20;
            var MarginRight = - SpanGrid - 20;
            $(content).css({
                'padding-right': PaddingRight
            });
            $(content).find('.span-flexible').next('.column').css({
                'margin-right': -10000
            });
        }
        // Layout Grid + Flexible
        if ($(content).hasClass('layout-grid-flexible')) {
            var SpanGrid = $(content).find('.span-flexible').prev('.column').outerWidth();
            var PaddingLeft = SpanGrid + 20;
            var MarginLeft = - SpanGrid - 20;
            $(content).css({
                'padding-left': PaddingLeft
            });
            $(content).find('.span-flexible').prev('.column').css({
                'margin-left': MarginLeft
            });
        }
    };
    
    function HorizontalOverflow(content) {
        var TableWidth = $(content).find('table').outerWidth();
        var SpanFlexibleWidth = $(content).find('.span-flexible').outerWidth();
        if (TableWidth > SpanFlexibleWidth) {
            $(content).find('.span-flexible').css({
                'min-width' : TableWidth + 1 + 'px'
            });
            $(content).find('.span-flexible').next('.column').css({
                'border-right' : '20px solid transparent'
            });
        }
        if (TableWidth < SpanFlexibleWidth) {
            $(content).find('.span-flexible').css({
                'min-width': 'auto'
            });
        }
    };
    
    function ModifyTableElements() {
        // UGLY HACK: add no-wrap to table-elements
        // should be there already.
        $('.changelist-results a.add-another').parent().addClass('nowrap');
    };
    
    $(document).ready(function() {
        initializeFlexibleLayout('.container-flexible');
        
        // jQuery UI Datepicker
        // $(".vDateField").datepicker({
        //     showOn: 'button', 
        //     buttonImageOnly: false, 
        //     buttonText: ''
        // });
        
        $('.toggle-filter').click(function(){
            $(this).toggleClass('selected');
            $('.filter-container').toggle();
        });
        
        $(".filter_choice").change(function(){
            location.href = $(this).val();
        });
        
        if ($("input.action-select").length > 0) {
            $("input.action-select").actions();
        }
        // hide the last coll if its an editable list
        // because this coll has just the hidden input with the id (breaks ui)
        
        if ($("#changelist").hasClass("editable")) {
            // UGLY HACK: add th for thead when list_editables are activated.
            // why is the th missing anyway??? f*ck.
            $(".changelist-results tr").each(function() {
                $(this).find("td:last").hide();
            });
        }
        
        $("div#filter h2").click(function() {
            $(this).next().toggle();
        })
        
        $("h4#filter-handler").click(function() {
            $("div#filters").toggle();
        })
        
        $("a#search-handler").click(function() {
            $("div.search-container").toggle();
        })
        
        $("input#action-toggle").click(function() {
            var selected = $("input[name='_selected_action']:checked").length;
            if (selected) {
                $("div#footer_submit").hide();
                $("div#footer_actions").show();
            } else {
                $("div#footer_submit").hide();
                $("div#footer_actions").hide();
            }
        })
        
        $("input[name='_selected_action']").click(function() {
            var selected = $("input[name='_selected_action']:checked").length;
            if (selected) {
                $("div#submit").hide();
            } else {
                $("div#submit").hide();
            }
        })
        $("input[name!='_selected_action'][id!='action-toggle']").click(function() {
            $("div#submit").show();
        })
        
        $("a.cancel-link").click(function() {
            $("div#submit").hide();
        })
        
        $("a.toggle-filters").click(function() {
            $(".filter-pulldown").toggle();
        })
        
    });
    
    $(window).resize(function(){
        HorizontalOverflow('.container-flexible');
    });
    window.onload = function () {
        HorizontalOverflow('.container-flexible');
    }
})(jQuery.noConflict());
