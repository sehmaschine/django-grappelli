(function($) {
    $.fn.change_list = function(opts) {
        var options = $.extend({}, $.fn.change_list.defaults, opts),
            actionCheckboxes = $(options.actionCheckboxes);
        
        checker = function(checked) {
            if (checked) {
                showQuestion();
            } else {
                reset();
            }
            actionCheckboxes.attr("checked", checked).parent().parent().toggleClass(options.selectedClass, checked);
        };
        
        updateCounter = function() {
            var count = actionCheckboxes.filter(":checked").length;
            
            if (count > 0) {
                $(options.actionContainer).show();
            } else {
                $(options.actionContainer).hide();
            }
            
            if ($(options.actionContainer).find("span._acnt").length > 0) {
                $(options.actionContainer).find("span._acnt").html(count);
            } else {
                var actionCounter = $(options.actionContainer).find("span.action-counter"),
                    text = actionCounter.html();
                actionCounter.html('<span class="_acnt">' + count + '</span>' + text.substring(1));
            }
            
            $(options.allToggle).attr("checked", function() {
                if (count == actionCheckboxes.length) {
                    value = true;
                    showQuestion();
                } else {
                    value = false;
                    clearAcross();
                }
                return value;
            });
        };
        
        showQuestion = function() {
            $(options.acrossClears).hide();
            $(options.acrossQuestions).show();
            $(options.allContainer).hide();
        };
        
        showClear = function() {
            $(options.acrossClears).show();
            $(options.allContainer).show();
            
            $(options.acrossQuestions).hide();
            $(options.counterContainer).hide();
            
            $(options.actionContainer).toggleClass(options.selectedClass);
        };
        
        reset = function() {
            $(options.acrossClears).hide();
            $(options.acrossQuestions).hide();
            $(options.allContainer).hide();
            $(options.counterContainer).show();
        };
        
        clearAcross = function() {
            reset();
            $(options.acrossInput).val(0);
            $(options.actionContainer).removeClass(options.selectedClass);
        };
        
        clearSelection = function() {
            $(options.allToggle).attr("checked", false);
            clearAcross();
            checker(false);
            updateCounter();
        };
        
        initializeFlexibleLayout = function(content) {
            var SpanGrid,
                PaddingRight,
                MarginRight;
            $('#content').addClass('content-flexible');
            $(content).find('.span-flexible').next('.column').parent().addClass('layout-flexible-grid');
            $(content).find('.column').next('.span-flexible').parent().addClass('layout-grid-flexible');
            $(content).append('<br clear="all" />');
            // Layout Flexible + Grid
            if ($(content).hasClass('layout-flexible-grid')) {
                SpanGrid = $(content).find('.span-flexible').next('.column').outerWidth();
                PaddingRight = SpanGrid + 20;
                MarginRight = - SpanGrid - 20;
                $(content).css({
                    'padding-right': PaddingRight
                });
                $(content).find('.span-flexible').next('.column').css({
                    'margin-right': -10000
                });
            }
            // Layout Grid + Flexible
            if ($(content).hasClass('layout-grid-flexible')) {
                SpanGrid = $(content).find('.span-flexible').prev('.column').outerWidth();
                PaddingLeft = SpanGrid + 20;
                MarginLeft = - SpanGrid - 20;
                $(content).css({
                    'padding-left': PaddingLeft
                });
                $(content).find('.span-flexible').prev('.column').css({
                    'margin-left': MarginLeft
                });
            }
        };

        HorizontalOverflow = function(content) {
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

        ModifyTableElements = function() {
            // UGLY HACK: add no-wrap to table-elements
            // should be there already.
            $('.changelist-results a.add-another').parent().addClass('nowrap');
        };
        
        initFilter = function() {
            $("a.toggle-filters").click(function() {
                $(".filter-pulldown").toggle();
                $("#filters").toggleClass("open");
            });

            $(".filter_choice").change(function(){
                location.href = $(this).val();
            });
            
            var filter_choice = $(".filter_choice");
            
            for (var i = 0; i < filter_choice.length; i++) {
                if (!$(filter_choice[i]).find(':first-child').attr('selected')) {
                    $("#filters").addClass('selected');
                }
            }
        };
        
        initLayout = function() {
            initializeFlexibleLayout('.container-flexible');

            $(window).resize(function(){
                HorizontalOverflow('.container-flexible');
            });

            //window.onload = function () {
                HorizontalOverflow('.container-flexible');
            //};
        };
        
        showSubmitFooter = function() {
            
            $("div#submit").show();
            
            // need to uncheck all actions checkboxes and update counter
            // (actions are not working if you want to edit items in the change_list)
            
            actionCheckboxes.attr("checked", false);
            clearSelection();
        };
        
        // Show counter by default
        $(options.counterContainer).show();
        
        $(options.allToggle).show().click(function() {
            checker($(this).attr("checked"));
            updateCounter();
        });
        
        $("div.changelist-actions li.question a").click(function(event) {
            event.preventDefault();
            $(options.acrossInput).val(1);
            showClear();
        });
        
        $("div.changelist-actions li.clear-selection a").click(function(event) {
            event.preventDefault();
            clearSelection();
        });
        
        lastChecked = null;
        actionCheckboxes.click(function(event) {
            if (!event) {
                event = window.event;
            }
            var target = event.target ? event.target : event.srcElement;
            if (lastChecked && $.data(lastChecked) != $.data(target) && event.shiftKey == true) {
                var inrange = false;
                $(lastChecked).attr("checked", target.checked).parent().parent().toggleClass(options.selectedClass, target.checked);
                actionCheckboxes.each(function() {
                    if ($.data(this) == $.data(lastChecked) || $.data(this) == $.data(target)) {
                        inrange = (inrange) ? false : true;
                    }
                    if (inrange) {
                        $(this).attr("checked", target.checked)
                            .parent().parent().toggleClass(options.selectedClass, target.checked);
                    }
                });
            }
            $(target).parent().parent().toggleClass(options.selectedClass, target.checked);
            lastChecked = target;
            updateCounter();
        });
        
        $(options.actionSelect).attr("autocomplete", "off").change(function(evt){
            $(this).parents("form").submit();
        });
        
        initLayout();
        
        initFilter();
        
        // hide the last coll if its an editable list
        // because this coll has just the hidden input with the id (breaks ui)
        if ($("#changelist").hasClass("editable")) {
            // UGLY HACK: add th for thead when list_editables are activated.
            // why is the th missing anyway??? f*ck.
            $(".changelist-results tr").each(function() {
                $(this).find("td:last").hide();
            });
        }
        
        $("input.action-select, input#action-toggle, a.cancel-link").click(function() {
            $("div#submit").hide();
        });
        
        //var edit_inlines = $("input[name!='_selected_action'][id!='action-toggle'][id!='searchbar']");
        //edit_inlines.focus(showSubmitFooter);
        // safari (5) needs this because focus event doesn't work on checkboxes (anymore)
        //edit_inlines.end().find(":checkbox").click(showSubmitFooter);
        $("input[name!='_selected_action'][id!='action-toggle'][id!='searchbar']").click(showSubmitFooter);
        $("select[class!='filter_choice'][name!='action']").click(showSubmitFooter);
        // FilebrowseField's button
        $("a.fb_show").click(showSubmitFooter);
        
        $("td input.vForeignKeyRawIdAdminField, td input.vFileBrowseField, td a.add-another").each(function() {
            $(this).parent().addClass('nowrap');
        });
        
        // Check state of checkboxes and reinit state if needed
        actionCheckboxes.filter(":checked").each(function(i) {
            $(this).parent().parent().toggleClass(options.selectedClass);
            updateCounter();
            if ($(options.acrossInput).val() == 1) {
                showClear();
            }
        });
        
        if (!$("input#searchbar").val()) {
            $("input#searchbar").val(options.initialSearchVal);
        }
        $("input#searchbar").focus(function(){
            if ($(this).val() == options.initialSearchVal) {
                $(this).val("");
            }
        });
        
        $("input#searchbar").blur(function(){
            if (!$(this).val()) {
                $(this).val(options.initialSearchVal);
            }
        });
        
    };
    
    /* Setup plugin defaults */
    $.fn.change_list.defaults = {
        actionCheckboxes: "input.action-select",
        actionContainer: "div.changelist-actions",
        counterContainer: "li.action-counter",
        allContainer: "div.changelist-actions li.all",
        acrossInput: "div.changelist-actions input.select-across",
        acrossQuestions: "div.changelist-actions li.question",
        acrossClears: "div.changelist-actions li.clear-selection",
        allToggle: "#action-toggle",
        selectedClass: "selected",
        actionSelect: "div.changelist-actions select",
        initialSearchVal: "Search"
    };
})(django.jQuery);

