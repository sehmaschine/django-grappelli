
(function($) {

    $.widget("ui.grp_menu", {
        options: {
            toggle_handler_slctr: ".collapse-handler",
            toggle_css: "collapse-handler",
            closed_css: "closed",
            open_css: "open",
            collapsible_container_slctr: ".collapse",
            menu_container_slctr: "ul",
            on_init: function() {},
            on_toggle: function() {}
        },
        
        _create: function() {
            this.options.on_init(this);
            
            this.toggle = this.element.children(this.options.toggle_handler_slctr).first();
            this.menu = this.element.children(this.options.menu_container_slctr);
            
            this._register_toggle_handler();
            
            var self = this;
            // to close if you click somewhere in the document
            $(document).mousedown(function(evt) {
                self._blur_handler(evt);
            });
        },
        
        _blur_handler: function(evt) {
            if (this.menu.is(":visible")) {
                if ($.contains(this.element[0], evt.target)) {
                    return;
                }
                this.element.toggleClass(this.options.closed_css).toggleClass(this.options.open_css);
            }
        },
        
        _register_toggle_handler: function() {
            var self = this;
            this.toggle.click(function() {
                self._toggle_handler();
            });
            
            // if the item has children you generally open the cildren with the button next to it.
            // open the menu anyways if it has an empty link
            this.element.find('a.parent.item-collapse-handler-container').click(function(){
                var that = $(this);
                if (that.attr('href') == "#") {
                    that.next().click();
                }
            });
            
            // each time a submenu is opened
            this.element.find('a.item-collapse-handler').click(function() {
                // Collapse
                $(this).closest('li.item-collapse').toggleClass("item-closed").toggleClass("item-open");
                // Calculate Menu Height
                var menu = $(this).closest('ul.navigation-menu>li>ul');
                $(menu).removeAttr("style");
                menumaxheight = $(window).height() - 80;
                menuheight = menu.height();
                menuwidth = menu.outerWidth() + 15;
                if (menumaxheight < menuheight) {
                    $(menu).css({
                        "width": menuwidth,
                        "height": menuheight,
                        "max-height": menumaxheight,
                        "overflow-y": "scroll",
                        "overflow-x": "hidden !important"
                    });
                }
                $(window).resize(function() {
                    console.log("jo!!!")
                    // Calculate Menu Height
                    $(menu).removeAttr("style");
                    menumaxheight = $(window).height() - 80;
                    menuheight = menu.height();
                    menuwidth = menu.outerWidth() + 15;
                    if (menumaxheight < menuheight) {
                        $(menu).css({
                            "width": menuwidth,
                            "height": menuheight,
                            "max-height": menumaxheight,
                            "overflow-y": "scroll",
                            "overflow-x": "hidden !important"
                        });
                    }
                });
            });
        },
        
        _toggle_handler: function() {
            this.options.on_toggle(this);
            
            this.element.toggleClass(this.options.closed_css).toggleClass(this.options.open_css);
            
            var that = $(this);
            // close again on blur if it's an menu dropdown from the header (i.e. bookmarks)
            if (that.parent(".menu-item").length 
                || that.parent(".user-options-container").length) {
                
                menu = that.parent('li').children('ul');
                menumaxheight = $(window).height() - 80;
                menuheight = menu.height();
                if (menumaxheight < menuheight) {
                    $(menu).css({
                        "max-height": menumaxheight,
                        "overflow-y": "scroll"
                    });
                }
            }
        }
    });
})(jQuery);
