
(function($) {

    $.fn.extend({
        //pass the options variable to the function
        grp_collapsible: function(options) {
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
                open_handler_slctr: ".open-handler",
                close_handler_slctr: ".close-handler",
                toggle_handler_slctr: ".collapse-handler",
                closed_css: "closed",
                open_css: "open",
                on_init: function() {},
                on_toggle: function() {}
            };
            options = $.extend(defaults, options);
            
            return this.each(function() {
                _initialize($(this), options);
            });
        }
    });
    
    var _initialize = function(elem, options) {
        options.on_init(elem, options);
        _register_handlers(elem, options);
    };
    
    var _register_handlers = function(elem, options) {
        _register_toggle_handler(elem, options);
    };
    
    var _register_toggle_handler = function(elem, options) {
        elem.children(options.toggle_handler_slctr).each(function() {
            $(this).click(function() {
                elem.toggleClass(options.closed_css)
                    .toggleClass(options.open_css);
                options.on_toggle(elem, options);
            });
        });
    };
    
})(jQuery);
