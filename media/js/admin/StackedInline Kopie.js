$(document).ready(function(){
    
    /// BEHAVIOUR
    /// DELETED ITEMS will be moved to the end of the group.
    /// In case of an Error, deleted stay at this position.
    /// EXTRA ITEMS stay at their position, if they are not empty.
    /// In case of an Error, empty extra items are moved to the end of
    /// the list (just before predeleted items).
    
    /// REORDER ON STARTUP (IMPORTANT IN CASE OF ERRORS)
    $('div.inline-stacked.sortable').each(function(i) {
        var items = new Array();
        var predeleted_items_count = $(this).find('input[name*="DELETE"]:checked').length;
        var empty_counter = $(this).find('input[value][id*="order"]').length - predeleted_items_count;
        $('div.inline-related', this).each(function(i) {
            /// if order field is not set (which is for empty items), set the counter
            /// so that these fields are shown before the predeleted_items
            if ($(this).find('input[id*="order"]').val()) {
                var order_value = $(this).find('input[id*="order"]').val();
            } else {
                var order_value = empty_counter;
                empty_counter++;
            }
            $(this).find('input[id*="order"]').val(order_value);
            items[parseInt(order_value)] = $(this);
        });
        items.sort();
        $('div.inline-related', this).remove();
        for (var i = 0; i < items.length; i++) {
            var predelete_flag = $(items[i]).find('input[name*="DELETE"]:checked').length;
            if (predelete_flag) {
                $('.predelete-items', this).append(items[i]);
            } else {
                $('.items', this).append(items[i]);
            }
        }
    });
    
    // BUTTONS (STACKED INLINE)
    $('div.inline-stacked a.closehandler').bind("click", function(){
        $(this).parents('div.inline-stacked').find('div.inline-related').addClass('collapsed');
    });
    $('div.inline-stacked a.openhandler').bind("click", function(){
        $(this).parents('div.inline-stacked').removeClass('collapsed');
        $(this).parents('div.inline-stacked').find('div.inline-related').removeClass('collapsed');
    });
    
    function new_item_cleanup(new_item) {
        /// remove error-lists and error-classes
        new_item.find('ul.errorlist').remove();
        new_item.find('div[class*="errors"]').removeClass("errors");
        /// remove delete-button and button view on site
        new_item.find('a.deletelink').remove();
        new_item.find('a.viewsitelink').remove();
        /// clear all form-fields (within form-cells)
        new_item.find(':input').val('');
        /// tinymce: does not make sense with tabular inlines
        new_item.find('span.mceEditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            new_item.find('#' + id).css('display', '');
            tinyMCE.execCommand("mceAddControl", true, id);
        });
        /// strong elements
        new_item.find("strong").text("");
        /// add collapse-functionality
        new_item.find('h3.collapse-toggle').bind("click", function(e){
            $(this).parent().toggleClass('collapsed');
        });
        /// fk and generic handlers
        RelatedHandler(new_item.find("input.vForeignKeyRawIdAdminField"));
        M2MHandler(new_item.find("input.vManyToManyRawIdAdminField"));
        InitObjectID(new_item.find('input[name*="object_id"]'));
        InitContentType(new_item.find(':input[name*="content_type"]'));
        GenericHandler(new_item.find('input[name*="object_id"]'));
        return new_item;
    }
    
    /// ADDHANDLER
    $('div.inline-stacked a.addhandler').bind("click", function(){
        var inlinegroup = $(this).parents('div.inline-stacked');
        var new_item = inlinegroup.find('div.inline-related:last').clone(true).appendTo('div.items', inlinegroup);
        var items = inlinegroup.find('div.inline-related').length;
        /// change header
        new_item.find('h3:first').html("<b>" + new_item.find('h3:first').text().split("#")[0] + "#" + parseInt(items) + "</b>");
        /// set TOTAL_FORMS to number of items
        inlinegroup.find('input[id*="TOTAL_FORMS"]').val(parseInt(items));
        /// replace IDs, NAMEs, HREFs & FORs ...
        var new_html = new_item.html().replace(/-\d+-/g, "-" + parseInt(items - 1) + "-");
        new_item.html(new_html);
        /// do cleanup
        new_item = new_item_cleanup(new_item);
    });
    
    /// DELETEHANDLER
    $('div.inline-stacked input[name*="DELETE"]').hide();
    $('div.inline-stacked a.deletelink').bind("click", function() {
        $(this).prev('input').attr('checked', !$(this).prev('input').attr('checked'));
        var delete_item = $(this).parents('div.inline-related');
        if (delete_item.parent().hasClass('predelete-items')) {
            /// move from predelete-items to items
            var new_item = delete_item.clone(true).appendTo(delete_item.parent().prev());
        } else {
            /// move from items to predelete-items
            var new_item = delete_item.clone(true).appendTo(delete_item.parent().next());
        }
        delete_item.remove();
    });
    
    /// hide all ORDER inputs and their parent DIV
    $('div.inline-stacked div.form-row.order').hide();
    
    /// DRAG & DROP
    $('div.inline-stacked a.draghandler').mousedown(function() {
        // close all inline-related fieldsets before sorting (only STACKED INLINE)
        $(this).parents('div.items').children('div.inline-related').addClass('collapsed');
    });
    
    $('div.inline-stacked.sortable div.items').sortable({
        axis: 'y',
        items: '.inline-related',
        handle: '.draghandler',
        //placeholder: 'placeholder',
        //forcePlaceholderSize: true,
        //forceHelperSize: true,
        tolerance: 'intersect',
        appendTo: 'body',
        cursor: 'move',
        start: function(event, ui) {
            $('div.ui-sortable-placeholder').html('<div>&nbsp;</div>');
        },
        helper: function(e, el) {
            $("div.sortablehelper").find('h3:first').text(el.find('h3:first').text());
            return $("div.sortablehelper")
                .clone()
                .width(el.width() + 'px')
                .height(el.height() + 'px');
        },
        update: function(e, ui) {
            /// remove display:block, generated by UI sortable
            $(this).removeAttr('style');
        }
    });
    
    // set ORDER_FIELDS on submit
    $("form").submit(function() {
        $('div.inline-stacked.sortable').each(function() {
            var counter = 0;
            var predelete_counter = $(this).find('div.inline-related').length - $(this).find('input[name*="DELETE"]:checked').length;
            $(this).find('div.inline-related').each(function(i) {
                var input_values = "";
                var fields = $(this).find(':input:not([name*="order"])').serializeArray();
                $.each(fields, function(i, field) {
                    input_values += field.value;
                });
                var predelete_flag = $(this).find('input[name*="DELETE"]:checked').length;
                if (input_values == "") {
                    /// clear order-field for empty items
                    $(this).find('input[id*="order"]').val('');
                } else if (predelete_flag) {
                    /// reset order-field for predelete-item
                    $(this).find('input[id*="order"]').val(predelete_counter);
                    predelete_counter = predelete_counter + 1;
                } else {
                    /// reset order-field
                    $(this).find('input[id*="order"]').val(counter);
                    counter = counter + 1;
                }
            });
        });
    });
    
});



