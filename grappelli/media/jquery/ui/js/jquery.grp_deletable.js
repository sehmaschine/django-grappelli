
(function($) {

    $.widget("ui.grp_deletable", {
        options: {
            deletable_container_slctr: "div.deletable",
            deletable_handler_slctr: "a.remove-handler",
            undelete_handler_slctr: "a.undelete-handler",
            deletable_title_slctr: ".module_title",
            trash_toggle_slctr: "a.trash-list-toggle-handler",
            trash_slctr: "#trash",
            trash_item_prefix: "trash_",
            trash_container_slcr: ".trash-list-container",
            
            on_init_finished: function() {},
            on_delete: function() {},
            on_undelet: function() {}
        },
        
        _create: function() {
            this.trash_toggle = this.element.find(this.options.trash_toggle_slctr);
            this.trash = this.element.find(this.options.trash_slctr);
            this.trash_container = this.element.find(this.options.trash_container_slcr);
            
            this.deletable_handlers = this.element.find(this.options.deletable_handler_slctr);
            this.deletable_containers = this.element.find(this.options.deletable_container_slctr);
            
            this._register_delete_handler();
            this._register_trash_toggle_handler();
            
            this.options.on_init_finished(this);
            
            if (this.trash.children().length > 0) {
                this.trash_container.show();
            }
            
            var self = this;
            // to close if you click somewhere in the document
            $(document).mousedown(function(evt) {
                self._trash_blur_handler(evt);
            });
        },
        
        _trash_blur_handler: function(evt) {
            if (this.trash.is(":visible")) {
                if ($.contains(this.trash_container[0], evt.target)) {
                    return;
                }
                this.trash.hide();
            }
        },
        
        _register_delete_handler: function() {
            var self = this;
            
            this.deletable_handlers.click(function() {
                self._delete_handler($(this));
            });
        },
        
        _trash_toggle_handler: function() {
            
            if (this.trash.is(":visible")) {
                console.log("_trash_toggle_handler", "hide")
                this.trash.hide();
            } else {
                    console.log("_trash_toggle_handler", "show")
                this.trash.show();
            }
        },
        
        _register_trash_toggle_handler: function() {
            var self = this;
            this.trash_toggle.click(function () {
                self._trash_toggle_handler();
            });
        },
        
        _delete_handler: function(handler) {
            var container = handler.parents(this.options.deletable_container_slctr);
            this.options.on_delete(container);
            
            container.hide();
            
            var trash_item_id = this.options.trash_item_prefix + container.attr('id');
            
            this.trash.append(
                "<li id='" 
                + trash_item_id + "'><a href='javascript://' class='undelete-handler'>"
                + container.find(this.options.deletable_title_slctr).html() + "</a></li>"
            );
            var self = this;
            this.trash.children("#" + trash_item_id).children(".undelete-handler").click(function() {
                self._undelete_handler($(this));
            });
            this.trash_container.show();
        },
        
        _undelete_handler: function(handler) {
            var container = $("#" + handler.parent().attr("id").replace(this.options.trash_item_prefix, ""));
            this.options.on_undelete(container);
            
            container.show();
            
            handler.parent().remove();
            if (this.trash.children().length == 0) {
                this.trash_container.hide();
            }
        }
    });
})(jQuery);
