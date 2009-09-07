$(function(){
    // Always focus first field of a form OR the search input
    $('form .form-row:eq(0)')
        .find('input, select, textarea, button').eq(0)
        .add('#searchbar').focus();

    $('.module.filter .filterset h3.form-row').bind('click.grappelli', function(){
        $(this).next().toggle();
    });
});

// ACTIONS

$.widget('ui.gActions', {
    _init: function() {
        var ui = this;
        $('#action-toggle').show().bind('click.grappelli', function(){
            ui.element.find('.result-list input.action-select').attr('checked', $(this).attr('checked'));
        
        });
    }
});


// BOOKMARKS

$.widget('ui.gBookmarks', {
         
    _init: function() {
        var ui  = this;
        var url = ui.options.url +'?path='+ window.location.pathname +' #bookmarks > li';
        
        this.showMethod = this.options.effects && 'slideDown' || 'show';
        this.hideMethod = this.options.effects && 'slideUp' || 'hide';

        $("li#toggle-bookmarks-listing.enabled")
            .live("mouseover", function(){ ui.show("#bookmarks-listing:hidden"); });
        
        $('#toggle-bookmark-add').live("click", function() { return ui.add(); });
        $('#bookmark-add-cancel').live("click", function() { return ui.cancel(); });
        ui.element.load(url);
    },

    show: function(el) {
        var ui = this;
        $(el)[ui.showMethod]();
        $("#bookmarks").one("mouseleave", function(){ 
            ui.hide("#bookmarks-listing:visible"); 
        });
    },

    hide: function(el) {
        $(el)[this.hideMethod]();
    },

    cancel: function() {
        this.hide("#bookmark-add");
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    add: function() {
        $("#bookmark-title").val($('h1').text());
        $("#bookmark-path").val(window.location.pathname);
        $("#toggle-bookmarks-listing").removeClass('enabled');
        this.show("#bookmark-add");
        return false;
    }
});

$.ui.gBookmarks.defaults = {
    url: '/grappelli/bookmark/get/',
    effects: false
};

// CHANGELIST

$.widget('ui.gChangelist', {
    _init: function() {
        var ui = this;
          
        this.table   = ui.element.find('table');
        this.content = ui.element;
        
        // TICKET #11447: td containing a.add-another need.nowrap
        $('table a.add-another').parent('td').addClass('nowrap');

        $('.filterset h3').click(function() {
            $(this).parent()
                .toggleClass('collapse-closed')
                .toggleClass('collapse-open').end()
                .next().next().toggle();
        });
        $('input.search-fields-verbose').click(function() {
            $(this).val('').removeClass("search-fields-verbose");
        });
    
        // SUBMIT FORM WITHOUT "RUN"-BUTTON
        $('div.actions select').change(function(){
            if ($(this).val()) {
                $('div.changelist-content form').submit();
            }
        });

        $(window).resize(function(){ ui.redraw(); });
        ui.redraw();
    },

    /// CHANGELIST functions
    /// in order to prevent overlapping between the result-list
    /// and the sidebar, we insert a horizontal scrollbar instead.
    redraw: function() {
        var ui = this;
        var tw = ui.table.outerWidth();
        var cw = ui.content.outerWidth();

        if (tw > cw) {
            $('#changelist.module.filtered').css('padding-right', 227);
            $('.changelist-content').css('min-width', (tw + 1) +'px');
            $('#changelist-filter').css('border-right', '15px solid #fff');
        }
        if (tw < cw) {
            $('#changelist.module.filtered').css('padding-right', 210);
            $('.changelist-content').css('min-width', 'auto');
            $('#changelist-filter').css('border-right', 0);
        }
    }
});
