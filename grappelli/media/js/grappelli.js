// Puts the included jQuery into our own namespace
var django = {
    "jQuery": jQuery.noConflict(true)
};

(function($) {
    grappelli.getFormat = function(type) {
        if (type == "date") {
            var format = DATE_FORMAT.toLowerCase().replace(/%\w/g, function(str) {
                str = str.replace(/%/, '');
                return str + str;
            });
        }
        return format;
    };
    
    grappelli.initDateAndTimePicker = function() {
        
        // to get rid of text after DateField (hardcoded in django.admin)
        $('p.datetime').each(function() {
            var text = $(this).html();
            text = text.replace(/^\w*: /, "");
            text = text.replace(/<br>.*: /, "<br>");
            $(this).html(text);
        });
        
        var options = {
            //appendText: '(mm/dd/yyyy)',
            showOn: 'button',
            buttonImageOnly: false,
            buttonText: '',
            dateFormat: grappelli.getFormat('date'),
            showButtonPanel: true,
            showAnim: '',
            // HACK: sets the current instance to a global var.
            // needed to actually select today if the today-button is clicked.
            // see onClick handler for ".ui-datepicker-current"
            beforeShow: function(year, month, inst) {
                grappelli.datepicker_instance = this;
            }
        };
        var dateFields = $("input[class*='vDateField']:not([id*='__prefix__'])");
        dateFields.datepicker(options);
        
        if (typeof IS_POPUP != "undefined" && IS_POPUP) {
            dateFields.datepicker('disable');
        }
        
        // HACK: adds an event listener to the today button of datepicker
        // if clicked today gets selected and datepicker hides.
        // use live() because couldn't find hoock after datepicker generates it's complete dom.
        $(".ui-datepicker-current").live('click', function() {
            $.datepicker._selectDate(grappelli.datepicker_instance);
            grappelli.datepicker_instance = null;
        });
        
        // inti timepicker
        $("input[class*='vTimeField']:not([id*='__prefix__'])").grp_timepicker();
    };
    
    grappelli.initSearchbar = function() {
        var searchbar = $("input#searchbar");
        searchbar.focus();
        
        // var searchbar_tooltip = $('div#searchbar_tooltip');
        // if (searchbar_tooltip.length == 0) return;
        
        
        // searchbar.bind('keydown', function() {
        //     searchbar_tooltip.hide();
        // });
        // searchbar.bind("mouseover", function() {
        //     searchbar_tooltip.show();
        // });
        // searchbar.bind("mouseout", function() {
        //     searchbar_tooltip.hide();
        // });
    };
    
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
    
    $(document).ready(function() {
        // menu in header
        $("div#header .collapse").grp_menu();
        
        if (grappelli.site == "index") {
            
            // it's the dashboard (aka. admin_index)
            var main_column = $("#column_1");
            
            $(".group-tabs").tabs();
            $(".group-accordion").accordion({header: '.group-accordion-header'});
            
            $("div#content").grp_deletable({
                on_init_finished: function(ui) {
                    grappelli.init_dashboard_deletable(ui);
                },
                on_delete: function(elem) {
                    grappelli.set_dashboard_deletable(elem.attr("id"), true);
                    // increase the height of main_column to be a able to 
                    // sort big modules at the end of main_column with ui.sortable()
                    main_column.removeAttr('style'); // delete the old setting first
                    main_column.height(main_column.height() + grappelli.getHeightOfTallestModule(main_column));
                },
                on_undelete: function(elem) {
                    grappelli.set_dashboard_deletable(elem.attr("id"), false);
                    // increase the height of main_column to be a able to 
                    // sort big modules at the end of main_column with ui.sortable()
                    main_column.removeAttr('style'); // delete the old setting first
                    main_column.height(main_column.height() + grappelli.getHeightOfTallestModule(main_column));
                }
            });
            
            // set order of dashboard modules
            grappelli.init_dashboard_positions(main_column);
            
            // make modules sortable
            main_column.sortable({
                // drag&drop the inlines with the drag-handler only
                handle: "a.drag-handler",
                placeholder: 'ui-sortable-placeholder',
                forcePlaceholderSize: true,
                items: "div.draggable",
                axis: "y",
                containment: "parent",
                tolerance: 'pointer',
                start: function(evt, ui) {
                    //ui.item.parent().height(ui.item.parent().height() + ui.placeholder.height());
                    ui.placeholder.addClass(ui.item.attr("class")).removeClass("open, closed")
                        .append(ui.item.children().clone().hide());
                },
                update: function(evt, ui) {
                    grappelli.set_dashboard_positions(main_column.sortable('toArray'));
                },
                stop: function(evt, ui) {
                    //ui.item.parent().removeAttr('style');
                }
            });
            
            // make modules collapsible
            $("div.container-grid div.collapse").grp_collapsible({
                on_init: function(elem, options) {
                    grappelli.init_dashboard_collapsibles(elem, options);
                    grappelli.add_additional_collapsible_handler(elem, options);
                },
                on_toggle: function(elem, options) {
                    // send new preferences to the server
                    grappelli.set_dashboard_collapsible(elem.attr("id"), elem.hasClass(options.open_css));
                    
                    
                    // increase the height of main_column to be a able to 
                    // sort big modules at the end of main_column with ui.sortable()
                    main_column.removeAttr('style'); // delete the old setting first
                    main_column.height(main_column.height() + grappelli.getHeightOfTallestModule(main_column));
                }
            });
            
            // increase the height of main_column to be a able to 
            // sort big modules at the end of main_column with ui.sortable()
            main_column.removeAttr('style'); // delete the old setting first
            main_column.height(main_column.height() + grappelli.getHeightOfTallestModule(main_column));
            
        } else if (grappelli.site == "app_index") {
            // collapsible
            $("div.container-grid div.collapse").grp_collapsible({
                on_init: function(elem, options) {
                    grappelli.add_additional_collapsible_handler(elem, options);
                }
            });
        
        } else if (grappelli.site == "change_list") {
            grappelli.initSearchbar();
            grappelli.initDateAndTimePicker();
        
        } else if (grappelli.site == "change_form") {
            grappelli.initDateAndTimePicker();
            
            // collapsibles
            $("div.container-flexible .collapse").grp_collapsible({
                on_init: function(elem, options) {
                    // open collapse (and all collapse parents)
                    // if errorlist is inside
                    if (elem.find("ul.errorlist").length > 0) {
                        elem.removeClass(options.close_css)
                            .addClass(options.open_class);
                        elem.parents(".collapse")
                            .removeClass(options.close_css)
                            .addClass(options.open_class);
                    }
                }
            });
            
            // collapsible_groups
            $("div.container-flexible div.group").grp_collapsible_group();
            
        }
    });
})(django.jQuery);



