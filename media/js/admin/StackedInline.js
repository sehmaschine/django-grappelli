$(document).ready(function(){
    
    /// add predelete class
    $('div.inline-related').find('input[name*="DELETE"]:checked').each(function(i) {
        $(this).parents('div.inline-related').addClass('predelete');
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
        /// clear related/generic lookups
        new_item.find("strong").text("");
        return new_item;
    }
    
    /// ADDHANDLER
    $('div.inline-stacked a.addhandler').bind("click", function(){
        var inlinegroup = $(this).parents('div.inline-stacked');
        var new_item = inlinegroup.find('div.inline-related:last').clone(true).appendTo('div.items', inlinegroup);
        var items = inlinegroup.find('div.inline-related').length;
        /// set TOTAL_FORMS to number of items
        inlinegroup.find('input[id*="TOTAL_FORMS"]').val(parseInt(items));
        /// replace IDs, NAMEs, HREFs & FORs ...
        $('div.form-cell', new_item).find(':input').each(function() {
            $(this).attr('id', $(this).attr('id').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
            $(this).attr('name', $(this).attr('name').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
        });
        /// do cleanup
        new_item = new_item_cleanup(new_item);
    });
    
    /// DELETEHANDLER
    $('div.inline-stacked input[name*="DELETE"]').hide();
    $('div.inline-stacked a.deletelink').bind("click", function() {
        $(this).prev(':checkbox').attr('checked', !$(this).prev(':checkbox').attr('checked'));
        $(this).parents('div.inline-related').toggleClass('predelete');
    });
    
    /// DRAG & DROP
    $('div.inline-stacked.sortable div.items').sortable({
        axis: 'y',
        items: '.inline-related',
        handle: '.draghandler',
        placeholder: 'placeholder',
        forcePlaceholderSize: true,
        tolerance: 'intersect',
        appendTo: 'body',
        cursor: 'move',
        start: function(event, ui) {
            $('div.placeholder').html('<div>&nbsp;</div>');
        },
        helper: function(e, el) {
            //$("div.sortablehelper").find('h3:first').text(el.find('h3:first').text());
            return $("div.sortablehelper")
                .clone()
                .width(el.width() + 'px')
                .height(el.height() + 'px');
        },
        update: function(e, ui) {
            $(this).removeAttr('style');
        }
    });
    
    $("form").submit(function() {
        $('div.inline-stacked.sortable').each(function() {
            var x = 0;
            $(this).find('div.inline-related').each(function(i) {
                $('div.form-cell', this).find(':input').each(function() {
                    $(this).attr('id', $(this).attr('id').replace(/-\d+-/g, "-" + parseInt(i) + "-"));
                    $(this).attr('name', $(this).attr('name').replace(/-\d+-/g, "-" + parseInt(i) + "-"));
                });
            });
        });
    });
    
});

