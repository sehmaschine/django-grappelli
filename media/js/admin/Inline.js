$(document).ready(function(){
    
    /// BEHAVIOUR
    /// DELETED ITEMS will be moved to the end of the group.
    /// In case of an Error, deleted stay at this position.
    /// EXTRA ITEMS stay at their position, if they are not empty.
    /// In case of an Error, empty extra items are moved to the end of
    /// the list (just before predeleted items).
    
    /// BUTTONS (STACKED INLINE)
    $('div[name="inlinegroup"] a.closehandler').bind("click", function(){
        $(this).parent().parent().parent().find('div[name="inlinerelated"]').addClass('collapsed');
    });
    $('div[name="inlinegroup"] a.openhandler').bind("click", function(){
        $(this).parent().parent().parent().removeClass('collapsed');
        $(this).parent().parent().parent().find('div[name="inlinerelated"]').removeClass('collapsed');
    });
    
    /// ADDHANDLER
    $('div.inline-group a.addhandler').bind("click", function(){
        var new_item = $(this).parent().parent().parent().find('div.items div.inline-related:last').clone(true).appendTo($(this).parent().parent().parent().children('.items'));
        var items = $(this).parent().parent().parent().find('div.inline-related').length;
        /// change header
        new_item.find('h3:first').html("<b>" + new_item.find('h3:first').text().split("#")[0] + "#" + parseInt(items) + "</b>");
        /// replace IDs, NAMEs, HREFs & FORs ...
        var new_html = new_item.html().replace(/-\d+-/g, "-" + parseInt(items - 1) + "-");
        new_item.html(new_html);
        /// set TOTAL_FORMS to number of items
        new_item.parent().parent().find('input[id*="TOTAL_FORMS"]').val(parseInt(items));
        /// remove error-lists and error-classes
        new_item.find('ul.errorlist').remove();
        new_item.find('div[class*="errors"]').removeClass("errors");
        /// remove delete-button and button view on site
        new_item.find('a.deletelink').remove();
        new_item.find('a.viewsitelink').remove();
        /// tinymce
        new_item.find('span.mceEditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            new_item.find('#' + id).css('display', '');
            tinyMCE.execCommand("mceAddControl", true, id);
        });
        /// foreignkey lookups
        new_item.find("strong").text("");
        new_item.find("input.vForeignKeyRawIdAdminField").bind("change focus", function() {
            RelatedLookup($(this));
        });
        /// add collapse-functionality
        new_item.find('h3.collapse-toggle').bind("click", function(e){
            $(this).parent().toggleClass('collapsed');
        });
    });
    
    /// DELETELINK
    $('div.inline-group input[name*="DELETE"]').hide();
    $('div.inline-related a.deletelink').bind("click", function() {
        $(this).prev('input').attr('checked', !$(this).prev('input').attr('checked'));
        var delete_item = $(this).parent().parent().parent();
        if (delete_item.parent().hasClass('predelete-items')) {
            var new_item = delete_item.clone(true).appendTo(delete_item.parent().prev());
        } else {
            var new_item = delete_item.clone(true).appendTo(delete_item.parent().next());
        }
        delete_item.remove();
    });
    
    /// REORDER
    $('div.sortable').each(function(i) {
        var items = new Array();
        var predeleted_items_count = $(this).find('input[name*="DELETE"]:checked').length;
        var empty_counter = $(this).find('input[value][id*="order"]').length - predeleted_items_count;
        $(this).find('div.inline-related').each(function(i) {
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
        $(this).children('div.inline-related').remove();
        for (var i = 0; i < items.length; i++) {
            var predelete_flag = $(items[i]).find('input[name*="DELETE"]:checked').length;
            if (predelete_flag) {
                $(this).children('.predelete-items').append(items[i]);
            } else {
                $(this).children('.items').append(items[i]);
            }
        }
    });
    
    /// hide all ORDER inputs and their parent DIV
    //$('div[name="inlinerelated"] input[name*="order"]').hide();
    $('div.inline-group div.form-row.order').hide();
    $('div.inline-group div.form-cell.order').hide();
    
    /// DRAG & DROP
    $('div[name="inlinegroup"] a.draghandler').mousedown(function() {
        // close all inline-related fieldsets before sorting (only STACKED INLINE)
        $(this).parent().parent().parent().parent().children('div.inline-related').addClass('collapsed');
    });
    $('div.sortable .items').sortable({
        axis: 'y',
        items: 'div.inline-related',
        handle: '.draghandler',
        placeholder: 'placeholder',
        tolerance: 'intersect',
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
        $('div.sortable').each(function() {
            var counter = 0;
            var predelete_counter = $(this).find('div.inline-related').length - $(this).find('input[name*="DELETE"]:checked').length;
            $(this).find('div.inline-related').each(function(i) {
                var input_values = "";
                var fields = $(this).children('fieldset').find(':input:not([name*="order"])').serializeArray();
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



