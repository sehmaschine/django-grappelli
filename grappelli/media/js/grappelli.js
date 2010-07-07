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
        if (!jQuery("body").hasClass(grappelli.collapsedBlockedClass)) {
            jQuery(this).parents(".collapse").first()
            .toggleClass(grappelli.closedClass)
            .toggleClass(grappelli.openClass);
        }
        return false;
    };
    
    grappelli.addCollapseHandlerClass = function() {
        jQuery("." + this.collapseClass).find("h2:first").addClass(this.collapseHandlerClass);
        jQuery("." + this.collapseClass).find("h3:first").addClass(this.collapseHandlerClass);
        jQuery("." + this.collapseClass).find("h4:first").addClass(this.collapseHandlerClass);
    };
    
    grappelli.registerCollapseHandler = function() {
        jQuery("." + this.collapseHandlerClass).click(this.collapseHandler);
    };
    
    grappelli.registerOpenAllHandler = function() {
        jQuery("." + this.openAllClass).click(this.openAllHandler);
    };
    
    /**
     * Open the collapseble and its child collapsebles
     */
    grappelli.openAllHandler = function() {
        jQuery(this).parents("." + grappelli.collapseClass)
                    .removeClass(grappelli.closedClass)
                    .addClass(grappelli.openClass)
                    .find("." + grappelli.collapseClass)
                    .removeClass(grappelli.closedClass)
                    .addClass(grappelli.openClass);
    };
    
    grappelli.registerCloseAllHandler = function() {
        jQuery("." + this.closeAllClass).click(this.closeAllHandler);
    };
    
    /**
     * Close the collapseble and its child collapsebles
     */
    grappelli.closeAllHandler = function() {
        jQuery(this).parents("." + grappelli.collapseClass)
                    .find("." + grappelli.collapseClass)
                    .removeClass(grappelli.openClass)
                    .addClass(grappelli.closedClass);
    };
    
    grappelli.initCollapseble = function() {
        grappelli.addCollapseHandlerClass();
        grappelli.registerCollapseHandler();
        
        grappelli.registerOpenAllHandler();
        grappelli.registerCloseAllHandler();
    };
    
    grappelli.initDatePicker = function() {
        jQuery(".vDateField").datepicker({
            //appendText: '(mm/dd/yyyy)', 
            showOn: 'button', 
            buttonImageOnly: false,
            buttonText: ''
        });
    };
    
    grappelli.initHacks = function() {
        $('p.datetime').each(function() {
            var text = $(this).html();
            text = text.replace(/^\w*: /, "");
            text = text.replace(/<br>.*: /, "<br>");
            $(this).html(text);
        });
    };
    
    $(document).ready(function() {
        grappelli.initCollapseble();
        grappelli.initDatePicker();
        grappelli.initHacks();
    });
})(django.jQuery);
