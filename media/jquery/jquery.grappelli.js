if (typeof(gettext) == 'undefined') {
    function gettext(i) { return i; };
}

$(function(){
    // Always focus first field of a form OR the search input
    $('form .form-row:eq(0)')
        .find('input, select, textarea, button').eq(0)
        .add('#searchbar').focus();

    $('.module.filter .filterset h3.form-row').bind('click.grappelli', function(){
        $(this).next().toggle();
    });
});

// DATETIME PICKER

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonImageOnly: true,
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext('Cancel'),
    buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-calendar.png'
});

$.widget('ui.gTimeField', {
    _init: function() {
        var ui = this;
        var picker = $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a href="#" /></p></div>')
            .appendTo('body')
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({ display:  'none', position: 'absolute'});

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a href="#"></a></li>').find('a')
                .text(button.label).bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    picker.hide();
                    return false;
                }).end()
                .appendTo(picker.find('.timelist'));
        });

        $('<span><a href="#"><img src="'+ ui.options.buttonImage +'" /></a></span>')
            .insertAfter(ui.element)
            .find('img')
                .attr('alt', gettext('Clock'))
                .attr('title', gettext('Clock')).wrap('<span />').wrap('<a />')
                .bind('click.grappelli', function(){
                    var pos = $(this).offset();
                    if (picker.is(':visible')) {
                        picker.hide();
                        $('body').unbind('click.gTimeField');
                    }
                    else {
                        $('.clockbox.module:visible').hide();
                        picker.show().css({
                            top: pos.top - picker.height()/2,
                            left: pos.left + 20
                        });
                        $('body').bind('click.gTimeField', function(e){
                            var target = $(e.originalTarget);
                            if (!target.hasClass('clock-title')) {
                               picker.hide(); 
                            }
                        });
                    }
                })
                .hover(function(){
                    $(this).attr('src', $(this).attr('src').replace('.png', '-hover.png'));
                }, function(){
                    $(this).attr('src', $(this).attr('src').replace('-hover.png', '.png'));
                }).parent().click(function(){ return false; })
        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
    }         
});

$.ui.gTimeField.defaults = {
    buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-clock.png',
    buttons: [
        {label: 'Maintenant', callback: function(e, ui){ 
            return ui.element.val(new Date().getHourMinuteSecond()); 
        }},
        {label: 'Minuit', callback: function(e, ui){ 
            return ui.element.val('00:00:00'); 
        }},
        {label: '06:00', callback: function(e, ui){ 
            return ui.element.val('06:00:00'); 
        }},
        {label: 'Midi', callback: function(e, ui){ 
            return ui.element.val('12:00:00'); 
        }}
    ]
};

$.widget('ui.gDatetimeField', {
    _init: function() {
        var ui = this;
        ui.element.html(ui.element.find('input'));
       
        // Datepicker

        ui.element.find('.vDateField').datepicker(ui.options.datepicker);
        ui.element.find('img')
            .attr('alt', gettext('Calendar'))
            .attr('title', gettext('Calendar')).wrap('<span />').wrap('<a />')
            .hover(function(){
                $(this).attr('src', $(this).attr('src').replace('.png', '-hover.png'));
            }, function(){
                $(this).attr('src', $(this).attr('src').replace('-hover.png', '.png'));
            }).parent().click(function(){ return false; });

        // Timepicker
        ui.element.find('.vTimeField').gTimeField(ui.options.timepicker);
    }
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


// STACKED INLINES

$.widget('ui.gStackedInline', {
    _init: function(){
        var ui = this;
        ui.element.find('.inline-related')
            .addClass("collapsed")
            .find('h3:first-child')
                .addClass('collapse-toggle')
                .bind("click", function(){
                    var p = $(this).parent();
                    console.log(p);
                    if (!p.hasClass('collapsed') && !p.hasClass('collapse-closed')) {
                        p.addClass('collapsed')
                         .addClass('collapse-closed')
                         .removeClass('collapse-open');
                    }
                    else {
                        p.removeClass('collapsed')
                         .removeClass('collapse-closed')
                         .addClass('collapse-open');
                    }
                });

        /// INLINEGROUPS (STACKED & TABULAR)
        ui.element.filter('.inline-group')
            .filter('.collapse-closed').addClass("collapsed").end()
            .find('h2:first-child').addClass("collapse-toggle")
            .bind("click", function(){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
                });

        /// OPEN STACKEDINLINE WITH ERRORS (onload)
        ui.element.filter('.inline-stacked').find('.inline-related div[class*="errors"]:first').each(function(){
            $(this).parents('div.inline-related').removeClass("collapsed").end()
                   .parents('div.inline-stacked').removeClass("collapsed");
        });

        /// OPEN TABULARINLINE WITH ERRORS (onload)
        ui.element.filter('.inline-tabular').find('div[class*="error"]:first').each(function(i) {
            $(this).parents('div.inline-tabular').removeClass("collapsed");
        });

        // FIELDSETS WITHIN STACKED INLINES
        ui.element.find('.inline-related').find('fieldset[class*="collapse-closed"]')
            .addClass("collapsed").find('h4:first').addClass("collapse-toggle").end()
            .find('fieldset[class*="collapse-open"] h4:first').addClass("collapse-toggle")
            .bind("click", function(e){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
        });
    }
});
