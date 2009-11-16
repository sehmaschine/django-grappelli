$(document).ready(function(){
    
    /// add predelete class (only necessary in case of errors)
    $('div.inline-group').find('input[name*="DELETE"]:checked').each(function(i) {
        $(this).parents('div.inline-related').addClass('predelete');
    });
    
    // BUTTONS (STACKED INLINE)
    $('div.inline-stacked a.closehandler').bind("click", function(){
        $(this).parents('div.inline-stacked').addClass('collapsed');
        $(this).parents('div.inline-stacked').addClass('collapse-closed');
        $(this).parents('div.inline-stacked').removeClass('collapse-open');
        $(this).parents('div.inline-stacked').find('div.inline-related').addClass('collapsed');
        $(this).parents('div.inline-stacked').find('div.inline-related').addClass('collapse-closed');
        $(this).parents('div.inline-stacked').find('div.inline-related').removeClass('collapse-open');
    });
    $('div.inline-stacked a.openhandler').bind("click", function(){
        $(this).parents('div.inline-stacked').removeClass('collapsed');
        $(this).parents('div.inline-stacked').removeClass('collapse-closed');
        $(this).parents('div.inline-stacked').addClass('collapse-open');
        $(this).parents('div.inline-stacked').find('div.inline-related').removeClass('collapsed');
        $(this).parents('div.inline-stacked').find('div.inline-related').removeClass('collapse-closed');
        $(this).parents('div.inline-stacked').find('div.inline-related').addClass('collapse-open');
    });
    
    /// function for cleaning up added items
    function new_item_cleanup(new_item) {
        /// remove error-lists and error-classes
        new_item.find('ul.errorlist').remove();
        new_item.find('div[class*="errors"]').removeClass("errors");
        /// remove delete-button
        /// temporary deactivated, because reordering does not work
        /// new_item.find('a.deletelink').remove();
        /// new_item.find('a.viewsitelink').remove();
        /// tinymce
        new_item.find('span.mceEditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            new_item.find('#' + id).css('display', '');
            tinyMCE.execCommand("mceAddControl", true, id);
        });
        /// clear all form-fields (within form-cells)
        new_item.find(':input').val('');
        /// clear related/generic lookups
        new_item.find("strong").text("");
        return new_item;
    }
    
    /// ADDHANDLER
    $('div.inline-group a.addhandler').bind("click", function(){
        var inlinegroup = $(this).parents('div.inline-group');
        //var new_item = inlinegroup.find('div.inline-related:last').clone(true).insertAfter('div.inline-related:last', inlinegroup);
        var new_item = inlinegroup.find('div.inline-related:last').clone(true).appendTo(inlinegroup.find('div.items:first'));
        var items = inlinegroup.find('div.inline-related').length;
        /// change header
        new_item.find('h3:first').html("<b>" + new_item.find('h3:first').text().split("#")[0] + "#" + parseInt(items) + "</b>");
        /// set TOTAL_FORMS to number of items
        inlinegroup.find('input[id*="TOTAL_FORMS"]').val(parseInt(items));
        /// replace IDs, NAMEs, HREFs & FORs ...
        new_item.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
            if ($(this).attr('id')) {
                $(this).attr('id', $(this).attr('id').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
            }
            if ($(this).attr('name')) {
                $(this).attr('name', $(this).attr('name').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
            }
            if ($(this).attr('for')) {
                $(this).attr('for', $(this).attr('for').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
            }
            if ($(this).attr('href')) {
                $(this).attr('href', $(this).attr('href').replace(/-\d+-/g, "-" + parseInt(items - 1) + "-"));
            }
        });
        /// remove calendars and clocks, re-init
        if (typeof(DateTimeShortcuts)!="undefined") {
            $('a[id^="calendarlink"]').parent().remove();
            $('a[id^="clocklink"]').parent().remove();
            DateTimeShortcuts.init();
        }
        /// do cleanup
        new_item = new_item_cleanup(new_item);
    });
    
    /// DELETEHANDLER
    $('div.inline-group input[name*="DELETE"]').hide();
    $('div.inline-group a.deletelink').bind("click", function() {
        $(this).prev(':checkbox').attr('checked', !$(this).prev(':checkbox').attr('checked'));
        $(this).parents('div.inline-related').toggleClass('predelete');
    });
    
});

