/**
 * helper functions for sortable inlines (tabular and stacked)
 */

function reinitDateTimeFields(row) {
    row.find(".vDateField").datepicker({
        //appendText: '(mm/dd/yyyy)',
        showOn: 'button',
        buttonImageOnly: false,
        buttonText: '',
        dateFormat: grappelli.getFormat('date'),
    });
    row.find(".vTimeField").timepicker();
}

function updateSelectFilter(row) {
    // If any SelectFilter widgets were added, instantiate a new instance.
    if (typeof SelectFilter != "undefined"){
        row.find(".selectfilter").each(function(index, value){
          var namearr = value.name.split('-');
          SelectFilter.init(value.id, namearr[namearr.length-1], false, "{% admin_media_prefix %}");
        });
        row.find(".selectfilterstacked").each(function(index, value){
          var namearr = value.name.split('-');
          SelectFilter.init(value.id, namearr[namearr.length-1], true, "{% admin_media_prefix %}");
        });
    }
}

/**
 * reorder of inlines dom
 * works pretty similar to updateFormIndex() of the inline() widget
 * helper function for sortable
 */
function sortable_updateFormIndex(form, idx, prefix) {
    var re = /-\d+-/g;
    form.attr('id', prefix + idx);
    form.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
        var node = django.jQuery(this),
            node_id = node.attr('id'),
            node_name = node.attr('name'),
            node_for = node.attr('for'),
            node_href = node.attr("href");
        
        if (node_id) node.attr('id', node_id.replace(re, "-" + idx + "-"));
        if (node_name) node.attr('name', node_name.replace(re, "-" + idx + "-"));
        if (node_for) node.attr('for', node_for.replace(re, "-" + idx + "-"));
        if (node_href) node.attr('href', node_href.replace(re, "-" + idx + "-"));
    });
}

/**
 * checks if inline form is filled
 * helper function for sortable
 */
function is_form_filled(form) {
    var input_tags = form.find("input"),
        input_tag;
    for (var i = 0; i < input_tags.length; i++) {
        input_tag = django.jQuery(input_tags[i]);
        if (input_tag.val()) {
            if (input_tag.attr("type") == "checkbox" || input_tag.attr("type") == "radio") {
                if (input_tag.attr("checked")) {
                    return true;
                }
            } else if (input_tag.attr("type") != "hidden"){
                return true;
            }
        }
    }
    return false;
}

// updates label of inlines
// to keep them in sequence (#1,#2,#3,...)
function stacked_updateInlineLabel(row) {
    row.parent().find("div.module").find("h3:first").each(function(i) {
        var h3_node = django.jQuery(this);
        h3_node.html(h3_node.html().replace(/(#\d+)/g, "#" + ++i));
    });
}

// init tinymce for new inlines
function reinitTinyMCE(row) {
    row.find("textarea.vLargeTextField").each(function() {
        tinyMCE.execCommand('mceAddControl', false, this.id);
    });
}

// need to remove tinymce form removed inline
function deleteTinyMCE(row) {
    row.find("textarea.vLargeTextField").each(function() {
        if (tinyMCE.getInstanceById(this.id)) {
            tinyMCE.execCommand('mceRemoveControl', false, this.id);
        }
    });
}

function tabular_onAdded(row) {
    reinitDateTimeFields(row);
    updateSelectFilter(row);
}

function stacked_onAdded(row) {
    reinitTinyMCE(row);
    reinitDateTimeFields(row);
    updateSelectFilter(row);
    stacked_updateInlineLabel(row);
}

function stacked_onRemoved(row) {
    stacked_updateInlineLabel(row);
    deleteTinyMCE(row);
}


(function($) {
$.fn.inline = function(options) {
    var defaults = {
        prefix: "form",                     // The form prefix for your django formset
        addText: "add another",             // Text for the add link
        deleteText: "remove",               // Text for the delete link
        addCssClass: "add-handler",         // CSS class applied to the add link
        deleteCssClass: "delete-handler",   // CSS class applied to the delete link
        removeCssClass: "remove-handler",   // CSS class applied to the remove link
        emptyCssClass: "empty-form",         // CSS class applied to the empty row
        formCssClass: "dynamic-form",       // CSS class applied to each form in a formset
        predeleteCssClass: "predelete",
        onAdded: null,                        // Function called each time a new form is added
        onRemoved: null                       // Function called each time a form is deleted
    };
    
    options = $.extend(defaults, options);
    
    return this.each(function() {
        
        var inline = $(this), // the current inline node
            totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS"), // current forms total
            maxForms = inline.find("#id_" + options.prefix + "-MAX_NUM_FORMS"), // max forms in this inline (0 if no limit)
            addButtons = inline.find("a." + options.addCssClass),
            template = inline.find("#" + options.prefix + "-empty"), // the hidden node we copy to create an additional form
            template_id = template.attr('id'),
            template_ready = false,
            /*
            updateElementIndex = function(el, prefix, ndx) {
                var id_regex = new RegExp("(" + prefix + "-\\d+)");
                var replacement = prefix + "-" + ndx;
                if ($(el).attr("for")) {
                    $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
                }
                if (el.id) {
                    el.id = el.id.replace(id_regex, replacement);
                }
                if (el.name) {
                    el.name = el.name.replace(id_regex, replacement);
                }
            },
            */
            initAddButtons = function() {
                if (maxForms.val() == 0 || (maxForms.val() - totalForms.val()) > 0) {
                    addButtons.click(addButtonHandler);
                } else {
                    // hide add-buttons
                    hideAddBottons();
                }
            },
            
            initFormIndex = function(form, nextIndex) {
                var re = /__prefix__/g;
                form.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
                    var node = $(this),
                        node_id = node.attr('id'),
                        node_name = node.attr('name'),
                        node_for = node.attr('for'),
                        node_href = node.attr("href");
                    
                    if (node_id) node.attr('id', node_id.replace(re, nextIndex));
                    if (node_name) node.attr('name', node_name.replace(re, nextIndex));
                    if (node_for) node.attr('for', node_for.replace(re, nextIndex));
                    if (node_href) node.attr('href', node_href.replace(re, nextIndex));
                });
            },
            
            updateFormIndex = function(form, idx) {
                // need to trigger onRemove and 
                // onAdded (on bottom of function) to reinint rows
                if (options.onRemoved) {
                    options.onRemoved(form);
                }
                var re = /-\d+-/g;
                form.attr('id', options.prefix + idx);
                form.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
                    var node = $(this),
                        node_id = node.attr('id'),
                        node_name = node.attr('name'),
                        node_for = node.attr('for'),
                        node_href = node.attr("href");
                    
                    if (node_id) node.attr('id', node_id.replace(re, "-" + idx + "-"));
                    if (node_name) node.attr('name', node_name.replace(re, "-" + idx + "-"));
                    if (node_for) node.attr('for', node_for.replace(re, "-" + idx + "-"));
                    if (node_href) node.attr('href', node_href.replace(re, "-" + idx + "-"));
                });
                if (options.onAdded) {
                    options.onAdded(form);
                }
            },
            
            addButtonHandler = function() {
                // FIXME wrong place to do this
                // choices:
                // 1) create a new event (beforAdded) and try to do this form outside :(
                // 2) add the "editor_deselector" class to the templates textarea
                // ...
                if (!options.template_ready) {
                    if (typeof tinyMCE !== "undefined") {
                        template.find('textarea').each(function(e) {
                            if (tinyMCE.getInstanceById(this.id)) {
                                tinyMCE.execCommand('mceRemoveControl', false, this.id);
                            }
                        });
                    }
                    options.template_ready = true;
                }
                
                var nextIndex = parseInt(totalForms.val(), 10);
                
                // create new from (add it as last)
                var form = template.clone(true);
                
                form.removeClass(options.emptyCssClass)
                    .attr("id", template_id.replace("-empty", nextIndex))
                    .insertBefore(template)
                    .addClass(options.formCssClass);
                    
                initFormIndex(form, nextIndex);
                
                totalForms.val(nextIndex + 1);
                
                // Hide add button in case we've hit the max, except we want to add infinitely
                if ((maxForms.val() != 0) && (maxForms.val() - totalForms.val()) <= 0) {
                    // hide stuff
                    hideAddBottons();
                }
                
                // If a post-add callback was supplied, call it with the added form
                if (options.onAdded) {
                    options.onAdded(form);
                }
                return false;
            },
            
            hideAddBottons = function() {
                addButtons.hide().parents('div.add-item').hide();
            },
            
            showAddButtons = function() {
                addButtons.show().parents('div.add-item').show();
            },
            
            deleteHandler = function() {
                var deleteInput = $(this).prev(),
                    form = deleteInput.parents("." + options.formCssClass).first();
                if (form.hasClass("has_original")) { // toggle delete checkbox and delete css class
                    form.toggleClass(options.predeleteCssClass);
                    if (deleteInput.attr("checked")) {
                        deleteInput.removeAttr("checked");
                    } else {
                        deleteInput.attr("checked", 'checked');
                    }
                }
                return false;
            },
            
            removeHandler = function() {
                var deleteInput = $(this).prev(),
                    form = deleteInput.parents("." + options.formCssClass).first();
                // last one stays
                // else if (totalForms.val() == 1) 
                //    alert("letztes bleibt da!");
                //    return false;
                // remove form
                // Remove the parent form containing this button:
                form.remove();
                // If a post-delete callback was provided, call it with the deleted form:
                if (options.onRemoved) {
                    options.onRemoved(form);
                }
                // Update the TOTAL_FORMS form count.
                var forms = inline.find("." + options.formCssClass);
                totalForms.val(parseInt(totalForms.val(), 10) - 1);
                
                // Show add button again once we drop below max
                if ((maxForms.val() == 0) || (maxForms.val() >= forms.length)) {
                    showAddButtons();
                }
                // Also, update names and ids for all remaining form controls
                // so they remain in sequence:
                var startReplaceAt = form.attr("id");
                startReplaceAt = parseInt(startReplaceAt.replace(options.prefix, ""), 10);
                for (var i = startReplaceAt; i < forms.length; i++) {
                    updateFormIndex($(forms[i]), i);
                }
                return false;
            },
            
            initInlineForms = function() {
                var hasErrors = false;
                //inline.find("div.items div.module").each(function() {
                inline.find("div.module").each(function() {
                    var form = $(this);
                    // add the options.formCssClass to all forms in the inline
                    if (form.attr('id') !== "") {
                        form.not("." + options.emptyCssClass).addClass(options.formCssClass);
                    }
                    // open the form if it has errors
                    if (form.find("ul.errorlist").length > 0) {
                        form.removeClass('closed').addClass('open');
                        // to open the inline
                        hasErrors = true;
                    }
                });
                
                // open the inline if it has forms with errors in it
                if (hasErrors) {
                    inline.removeClass('closed').addClass('open');
                }
            };
        
        // set this to prevent the browser from keeping the current value after reload
        totalForms.attr("autocomplete", "off");
        
        initInlineForms();
        
        initAddButtons();
        
        // delete button
        // toggle the delete-checkbox and add the predelete-class to the row
        inline.find("a." + options.deleteCssClass).click(deleteHandler);
        inline.find("a." + options.removeCssClass).click(removeHandler);
        
        // add options.predeleteCssClass to forms with the delete checkbox checked
        inline.find("li.delete-handler-container input").each(function() {
            var deleteInput = $(this);
            if (deleteInput.attr("checked")) {
                var form = $(deleteInput.parents("." + options.formCssClass).first());
                if (form.hasClass("has_original")) {
                    form.toggleClass(options.predeleteCssClass);
                }
            }
        });
    });
};
})(django.jQuery);
