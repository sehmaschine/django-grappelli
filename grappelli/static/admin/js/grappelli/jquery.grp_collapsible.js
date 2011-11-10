/**
 * GRAPPELLI COLLAPSIBLES
 * handles collapsibles,
 * excluding open/closing all elements
 * within a group.
 */

(function($) {
    $.fn.grp_collapsible = function(options){
        var defaults = {
            toggle_handler_slctr: ".collapse-handler:first",
            closed_css: "closed",
            open_css: "open",
            on_init: function() {},
            on_toggle: function() {}
        };
        var opts = $.extend(defaults, options);
        return this.each(function() {
            _initialize($(this), opts);
        });
    };
    var _initialize = function(elem, options) {
        options.on_init(elem, options);
        _register_handlers(elem, options);
    };
    var _register_handlers = function(elem, options) {
        _register_toggle_handler(elem, options);
    };
    var _register_toggle_handler = function(elem, options) {
        elem.children(options.toggle_handler_slctr).click(function() {
            elem.toggleClass(options.closed_css).toggleClass(options.open_css);
        });
    };
})(django.jQuery);