var grappelli = {};

(function($) {
    grappelli.collapseHandlerClass = "collapse-handler";
    grappelli.collapsedBlockedClass = "collapse-blocked";
    grappelli.openAllClass = "open-handler";
    grappelli.closeAllClass = "close-handler";
    grappelli.collapseClass = "collapse";
    grappelli.closedClass = "closed";
    grappelli.openClass = "open";
    
    grappelli.collapseHandler = function() {
        if (!$("body").hasClass(grappelli.collapsedBlockedClass)) {
            $(this).parents("." + grappelli.collapseClass).first()
            .toggleClass(grappelli.closedClass)
            .toggleClass(grappelli.openClass);
        }
        return false;
    };
    
    grappelli.addCollapseHandlerClass = function() {
        $("." + this.collapseClass).each(function() {
            var node = $(this).children().first();
            if (node.is("h2") || node.is("h3") || node.is("h4")) {
                node.addClass(grappelli.collapseHandlerClass)
            }
        });
    };
    
    grappelli.registerCollapseHandler = function() {
        $("." + this.collapseHandlerClass).click(this.collapseHandler);
    };
    
    grappelli.registerOpenAllHandler = function() {
        $("." + this.openAllClass).click(this.openAllHandler);
    };
    
    /*
     * Open all
     */
    grappelli.openAllHandler = function() {
        // get .group and not .collapse because it doesn't necessarily have .collapse
        $(this).parents(".group")
                    .removeClass(grappelli.closedClass)
                    .addClass(grappelli.openClass)
                    .find("." + grappelli.collapseClass)
                    .removeClass(grappelli.closedClass)
                    .addClass(grappelli.openClass);
    };
    
    grappelli.registerCloseAllHandler = function() {
        $("." + this.closeAllClass).click(this.closeAllHandler);
    };
    
    /*
     * Close all
     */
    grappelli.closeAllHandler = function() {
        // get .group and not .collapse because it doesn't necessarily have .collapse
        $(this).parents(".group")
                    .find("." + grappelli.collapseClass)
                    .removeClass(grappelli.openClass)
                    .addClass(grappelli.closedClass);
    };
    
    grappelli.initCollapsible = function() {
        grappelli.addCollapseHandlerClass();
        grappelli.registerCollapseHandler();
        
        grappelli.registerOpenAllHandler();
        grappelli.registerCloseAllHandler();
        
        $("." + grappelli.collapseClass + " ul.errorlist").each(function() {
            $(this).parents("." + grappelli.collapseClass)
                .removeClass(grappelli.closedClass)
                .addClass(grappelli.openClass);
        });
    };
    
    grappelli.getFormat = function(type) {
        if (type == "date") {
            var format = DATE_FORMAT.toLowerCase().replace(/%\w/g, function(str) {
                str = str.replace(/%/, '');
                return str + str;
            });
        }
        return format;
    }
    
    grappelli.initDateAndTimePicker = function() {
        var options = {
            //appendText: '(mm/dd/yyyy)',
            showOn: 'button',
            buttonImageOnly: false,
            buttonText: '',
            dateFormat: grappelli.getFormat('date'),
            showAnim: ''
        };
        var dateFields = $("input[class*='vDateField']:not([id*='__prefix__'])");
        dateFields.datepicker(options);
        
        if (typeof IS_POPUP != "undefined" && IS_POPUP) {
            dateFields.datepicker('disable');
        }
        $("input[class*='vTimeField']:not([id*='__prefix__'])").timepicker();
    };
    
    grappelli.initHacks = function() {
        $('p.datetime').each(function() {
            var text = $(this).html();
            text = text.replace(/^\w*: /, "");
            text = text.replace(/<br>.*: /, "<br>");
            $(this).html(text);
        });
    };
    
    // Using window.load instead of document ready for better performances
    // It prevents lots of glitches, like divs that moves around upon loading
    //
    // Use $(document).ready only if you have to deal with images since it will
    // wait for the document to be fully loaded/rendered before running the function
    // while window.load method will run as soon as the DOM/CSS is loaded.
    
    $(window).load(function() {
        // we do the hacks first!
        // because we manipulate dom via innerHTML => loose events
        grappelli.initHacks();
        grappelli.initCollapsible();
        grappelli.initDateAndTimePicker();
    });
})(django.jQuery);
