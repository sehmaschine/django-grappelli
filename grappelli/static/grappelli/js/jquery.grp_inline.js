/**
 * GRAPPELLI INLINES
 * jquery-plugin for inlines (stacked and tabular)
 */


(function($) {
    $.fn.grp_inline = function(options) {
        var defaults = {
            prefix: "form",                         // The form prefix for your django formset
            addText: "add another",                 // Text for the add link
            deleteText: "remove",                   // Text for the delete link
            addCssClass: "grp-add-handler",             // CSS class applied to the add link
            removeCssClass: "grp-remove-handler",       // CSS class applied to the remove link
            deleteCssClass: "grp-delete-handler",       // CSS class applied to the delete link
            emptyCssClass: "grp-empty-form",            // CSS class applied to the empty row
            formCssClass: "grp-dynamic-form",           // CSS class applied to each form in a formset
            predeleteCssClass: "grp-predelete",
            onBeforeInit: function(form) {},        // Function called before a form is initialized
            onBeforeAdded: function(inline) {},     // Function called before a form is added
            onBeforeRemoved: function(form) {},     // Function called before a form is removed
            onBeforeDeleted: function(form) {},     // Function called before a form is deleted
            onAfterInit: function(form) {},         // Function called after a form has been initialized
            onAfterAdded: function(form) {},        // Function called after a form has been added
            onAfterRemoved: function(inline) {},    // Function called after a form has been removed
            onAfterDeleted: function(form) {}       // Function called after a form has been deleted
        };
        options = $.extend(defaults, options);
        
        return this.each(function() {
            var inline = $(this); // the current inline node
            var totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS");
            // set autocomplete to off in order to prevent the browser from keeping the current value after reload
            totalForms.attr("autocomplete", "off");
            // init inline and add-buttons
            initInlineForms(inline, options);
            initAddButtons(inline, options);
            // button handlers
            addButtonHandler(inline.find("a." + options.addCssClass), options);
            removeButtonHandler(inline.find("a." + options.removeCssClass), options);
            deleteButtonHandler(inline.find("a." + options.deleteCssClass), options);
        });
    };
    
    updateFormIndex = function(elem, options, replace_regex, replace_with) {
        elem.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
            var node = $(this),
                node_id = node.attr('id'),
                node_name = node.attr('name'),
                node_for = node.attr('for'),
                node_href = node.attr("href");
            if (node_id) { node.attr('id', node_id.replace(replace_regex, replace_with)); }
            if (node_name) { node.attr('name', node_name.replace(replace_regex, replace_with)); }
            if (node_for) { node.attr('for', node_for.replace(replace_regex, replace_with)); }
            if (node_href) { node.attr('href', node_href.replace(replace_regex, replace_with)); }
        });
    };
    
    initInlineForms = function(elem, options) {
        elem.find("div.grp-module").each(function() {
            var form = $(this);
            // callback
            options.onBeforeInit(form);
            // add options.formCssClass to all forms in the inline
            // except table/theader/add-item
            if (form.attr('id') !== "") {
                form.not("." + options.emptyCssClass).not(".grp-table").not(".grp-thead").not(".add-item").addClass(options.formCssClass);
            }
            // add options.predeleteCssClass to forms with the delete checkbox checked
            form.find("li.grp-delete-handler-container input").each(function() {
                if ($(this).attr("checked") && form.hasClass("has_original")) {
                    form.toggleClass(options.predeleteCssClass);
                }
            });
            // callback
            options.onAfterInit(form);
        });
    };
    
    initAddButtons = function(elem, options) {
        var totalForms = elem.find("#id_" + options.prefix + "-TOTAL_FORMS");
        var maxForms = elem.find("#id_" + options.prefix + "-MAX_NUM_FORMS");
        var addButtons = elem.find("a." + options.addCssClass);
        // hide add button in case we've hit the max, except we want to add infinitely
        if ((maxForms.val() !== '') && (maxForms.val()-totalForms.val()) <= 0) {
            hideAddBottons(elem, options);
        }
    };
    
    addButtonHandler = function(elem, options) {
        elem.bind("click", function() {
            var inline = elem.parents(".grp-group"),
                totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS"),
                maxForms = inline.find("#id_" + options.prefix + "-MAX_NUM_FORMS"),
                addButtons = inline.find("a." + options.addCssClass),
                empty_template = inline.find("#" + options.prefix + "-empty");
            // callback
            options.onBeforeAdded(inline);
            // create new form
            var index = parseInt(totalForms.val(), 10),
                form = empty_template.clone(true);
            form.removeClass(options.emptyCssClass)
                .attr("id", empty_template.attr('id').replace("-empty", index))
                .insertBefore(empty_template)
                .addClass(options.formCssClass);
            // update form index
            var re = /__prefix__/g;
            updateFormIndex(form, options, re, index);
            // update total forms
            totalForms.val(index + 1);
            // hide add button in case we've hit the max, except we want to add infinitely
            if ((maxForms.val() !== 0) && (maxForms.val() !== "") && (maxForms.val() - totalForms.val()) <= 0) {
                hideAddBottons(inline, options);
            }
            // callback
            options.onAfterAdded(form);
        });
    };
    
    removeButtonHandler = function(elem, options) {
        elem.bind("click", function() {
            var inline = elem.parents(".grp-group"),
                form = $(this).parents("." + options.formCssClass).first(),
                totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS"),
                maxForms = inline.find("#id_" + options.prefix + "-MAX_NUM_FORMS");
            // callback
            options.onBeforeRemoved(form);
            // remove form
            form.remove();
            // update total forms
            var index = parseInt(totalForms.val(), 10);
            totalForms.val(index - 1);
            // show add button in case we've dropped below max
            if ((maxForms.val() !== 0) && (maxForms.val() - totalForms.val()) > 0) {
                showAddButtons(inline, options);
            }
            // update form index (for all forms)
            var re = /-\d+-/g,
                i = 0;
            inline.find("." + options.formCssClass).each(function() {
                updateFormIndex($(this), options, re, "-" + i + "-");
                i++;
            });
            // callback
            options.onAfterRemoved(inline);
        });
    };
    
    deleteButtonHandler = function(elem, options) {
        elem.bind("click", function() {
            var deleteInput = $(this).prev(),
                form = $(this).parents("." + options.formCssClass).first();
            // callback
            options.onBeforeDeleted(form);
            // toggle options.predeleteCssClass and toggle checkbox
            if (form.hasClass("has_original")) {
                form.toggleClass(options.predeleteCssClass);
                if (deleteInput.attr("checked")) {
                    deleteInput.removeAttr("checked");
                } else {
                    deleteInput.attr("checked", 'checked');
                }
            }
            // callback
            options.onAfterDeleted(form);
        });
    };
    
    hideAddBottons = function(elem, options) {
        var addButtons = elem.find("a." + options.addCssClass);
        addButtons.hide().parents('.grp-add-item').hide();
    };
    
    showAddButtons = function(elem, options) {
        var addButtons = elem.find("a." + options.addCssClass);
        addButtons.show().parents('.grp-add-item').show();
    };
    
})(grp.jQuery);
