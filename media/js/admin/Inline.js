$(document).ready(function(){
    
    /// add predelete class (only necessary in case of errors)
    $('div.inline-group').find('input[name*="DELETE"]:checked').each(function(i) {
        $(this).parents('div.inline-related').addClass('predelete');
    });
    
    /// HACK: CHANGE HEIGHT OF INLINE-ITEM TOOLS FOR TABULAR INLINES
    $('div.inline-tabular.sortable ul.inline-item-tools:not(:first)').each(function(){
        height = "height:" + $(this).parent().height() + "px !important;";
        $(this).attr('style', height);
    });
    
    /// function for cleaning up added items
    function new_item_cleanup(new_item) {
        /// remove error-lists and error-classes
        new_item.find('ul.errorlist').remove();
        new_item.find('div[class*="errors"]').removeClass("errors");
        /// remove delete-button and button view on site
        //new_item.find('a.deletelink').remove();
        new_item.find('a.viewsitelink').remove();
        /// clear all form-fields (within form-cells)
        new_item.find(':input').val('');
        /// clear related/generic lookups
        new_item.find("strong").text("");
        return new_item;
    }
    
    /// ADDHANDLER
    $('div.inline-group a.addhandler').bind("click", function(){
        var inlinegroup = $(this).parents('div.inline-group');
        var new_item = inlinegroup.find('div.inline-related:last').clone(true).insertAfter('div.inline-related:last', inlinegroup);
        var items = inlinegroup.find('div.inline-related').length;
        /// set TOTAL_FORMS to number of items
        inlinegroup.find('input[id*="TOTAL_FORMS"]').val(parseInt(items));
        /// replace IDs, NAMEs, HREFs & FORs ...
        $('div.item', new_item).find(':input').each(function() {
            $(this).attr('id', $(this).attr('id').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
            $(this).attr('name', $(this).attr('name').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
        });
        /// do cleanup
        new_item = new_item_cleanup(new_item);
    });
    
    /// DELETEHANDLER
    $('div.inline-group input[name*="DELETE"]').hide();
    $('div.inline-group a.deletelink').bind("click", function() {
        $(this).prev(':checkbox').attr('checked', !$(this).prev(':checkbox').attr('checked'));
        $(this).parents('div.inline-related').toggleClass('predelete');
    });
    
    /// DRAG & DROP
    // $('div.inline-group.sortable div.items').sortable({
    //     axis: 'y',
    //     items: '.inline-related',
    //     handle: '.draghandler',
    //     placeholder: 'placeholder',
    //     //forcePlaceholderSize: true,
    //     tolerance: 'intersect',
    //     appendTo: 'body',
    //     cursor: 'move',
    //     start: function(event, ui) {
    //         $('div.placeholder').html('<div>&nbsp;</div>');
    //     },
    //     helper: function(e, el) {
    //         $("div.sortablehelper").find('h3:first').text(el.find('h3:first').text());
    //         return $("div.sortablehelper")
    //             .clone()
    //             .width(el.width() + 'px')
    //             .height(el.height() + 'px');
    //     },
    //     update: function(e, ui) {
    //         $(this).removeAttr('style');
    //     }
    // });
    
});

