/**
 * GRAPPELLI COLLAPSIBLES
 * handles collapsibles,
 * excluding open/closing all elements
 * within a group.
 *
 * The toggle is bound once, delegated on the document, so collapsibles that are
 * injected into the page after load (e.g. inline rows fetched by AJAX) work
 * without having to re-run grp_collapsible() on the new markup.
 */

(function($) {
    var _delegated = false;

    $.fn.grp_collapsible = function(options){
        var defaults = {
            toggle_handler_slctr: ".grp-collapse-handler:first",
            closed_css: "grp-closed",
            open_css: "grp-open",
            on_init: function() {},
            on_toggle: function() {}
        };
        var opts = $.extend(defaults, options);
        _register_toggle_handler();
        return this.each(function() {
            var elem = $(this);
            opts.on_init(elem, opts);
            elem.data("grpCollapsibleOnToggle", opts.on_toggle);
        });
    };
    var _register_toggle_handler = function() {
        if (_delegated) { return; }
        _delegated = true;
        $(document).on("click.grp_collapsible", ".grp-collapse > .grp-collapse-handler", function() {
            var handler = $(this);
            // preserve the ".grp-collapse-handler:first" scoping of the old
            // implementation: only the first handler child of a container toggles it
            if (handler.prevAll(".grp-collapse-handler").length) { return; }
            var elem = handler.parent();
            elem.toggleClass("grp-closed").toggleClass("grp-open");
            var on_toggle = elem.data("grpCollapsibleOnToggle");
            if (on_toggle) { on_toggle(elem); }
        });
    };
})(grp.jQuery);
