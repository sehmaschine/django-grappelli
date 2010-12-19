(function($) {
    
    grappelli.set_dashboard_collapsible = function(elemId, val) {
        this.dashboard.preferences.collapsed = this.dashboard.preferences.collapsed || {};
        this.dashboard.preferences.collapsed[elemId] = val;
        this._set_dashboard_preferences();
    };
    
    grappelli.set_dashboard_positions = function(val) {
        //this.dashboard.preferences.positions = this.dashboard.preferences.positions || [];
        this.dashboard.preferences.positions = val;
        this._set_dashboard_preferences();
    };
    
    grappelli._set_dashboard_preferences = function() {
        $.post(this.dashboard.url, { data: JSON.stringify(this.dashboard.preferences) });
    };
    
    /**
     * called on_inti() of ui.widget.grp_collapsible() (see intialization code on bottom)
     */
    grappelli.init_dashboard_collapsibles = function(elem, options) {
        // set the initial status of the collapsible from dashboard_preferences
        var collapsed = this.dashboard.preferences.collapsed || {};
        var current_status = collapsed[elem.attr("id")];
        
        // no setting no action...
        if (current_status === undefined) return;
        
        // override open/closed status if there is a setting
        if (current_status) {
            elem.removeClass(options.closed_css)
                .addClass(options.open_css);
        } else {
            elem.addClass(options.closed_css)
                .removeClass(options.open_css);
        }
    
    };
    
    grappelli.add_additional_collapsible_handler = function(elem, options) {
        // first we add our custom .keep-open-handler
        elem.find(".keep-open-handler").click(function() {
            elem.find(options.toggle_handler_slctr).click();
        });
        elem.find(".keep-closed-handler").click(function() {
            elem.find(options.toggle_handler_slctr).click();
        });
    
    };
    
    grappelli.init_dashboard_positions = function (column) {
        var positions = this.dashboard.preferences.positions || [];
        for (var i = 0; i < positions.length; i++) {
            if (i == 0) {
                column.prepend($("div#" + positions[i], column));
            } else {
                $(column.children()[i-1]).after($("div#" + positions[i], column));
            }
        }
    };
    
    grappelli.init_dashboard_deletable = function (ui) {
        var disabled = this.dashboard.preferences.disabled || {};
        
        var containers = ui.deletable_containers;
        for (var i = 0; i < containers.length; i++) {
            var current_deletable = $(containers[i]),
                current_status = disabled[current_deletable.attr('id')];
            // no setting no action...
            if (current_status === undefined) continue;
            // hide/show if there is a setting (true/false)
            if (current_status) {
                current_deletable.find(ui.options.deletable_handler_slctr).click();
            }
        }
    };
    
    grappelli.set_dashboard_deletable = function (elemId, val) {
        this.dashboard.preferences.disabled = this.dashboard.preferences.disabled || {};
        this.dashboard.preferences.disabled[elemId] = val;
        this._set_dashboard_preferences();
    };
    
    /**
     * returns height of "tallest" child element of col
     */
    grappelli.getHeightOfTallestModule = function(col) {
        var modules = col.children(),
            max_height = 0,
            module_height,
            module;
            
        for (var i = 0; i < modules.length; i++) {
            module = $(modules[i]);
            if (!module.is(":visible")) continue;
            
            module_height = module.height();
            max_height = module_height > max_height ? module_height : max_height;
        }
        return max_height;
    };

})(django.jQuery);