/**
 * GRAPPELLI EDIT MODE
 * toggle visibility of django-admin-tools dashboard editing featues.
 */

(function($) {
    
    $.widget("ui.grp_admintools_editmode", {
        options: {
            editmode_handler_slctr: "a.edit-dashboard-toggle-handler",
            toggle_items_slctr: ".drag-handler-container, .remove-handler-container, .keep-open-handler-container, .keep-closed-handler-container",
            main_column_slctr: "div#header .collapse"
            editmode_active: false
        },
        
        _create: function() {
            this.editmode_button = this.element.find(this.options.editmode_handler_slctr);
            this.toggle_items = this.elemen.find(this.options.toggle_items_slctr);
            this.main_column = this.element.find(this.options.main_column_slctr);
            
            var self = this;
            
            this.editmode_button.click(function(evt) {
                self._editmode_click_handler();
            });
        },
        
        _editmode_click_handler: function() {
            if (this.options.editmode_active) {
                this.toggle_items.attr("style", "");
                
                // we need to make the 
                this.main_column.removeAttr('style');
                this.main_column.height(this.main_column.height() + grappelli.getHeightOfTallestModule(this.main_column));
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
                this.trash.hide();
            } else {
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
            this.options.onBeforeDelete(container);
            
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
})(django.jQuery);
