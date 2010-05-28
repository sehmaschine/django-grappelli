/*  Author: Maxime Haineault <max@motion-m.ca>
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

// Fail silently if gettext is unavailable
if (typeof(gettext) == 'undefined') {
    gettext = function (i) { return i; };
}
if (typeof(console) == 'undefined') {
    console = {
        log: function() {}
    };
}

$.grappelli = (new function(){
    var g = this;
    g._
    g._registy = {};
    g.inst = {};

    g.inst.widgets = {
        init: function (){
            var iterator, w, widgets, parent;
            iterator = function (i, widgetName) {
                w = jQuery.ui[widgetName];
                if (w && w.autoSelector) {
                    if (parent) {
                        jQuery(parent).find(w.autoSelector)[widgetName]();
                    }
                    else {
                        jQuery(w.autoSelector)[widgetName]();
                    }
                }
            };
            if (arguments.length == 0) {
                widgets = $.grappelli.conf.get('widgets');
                parent  = false;
            }
            else if (arguments.length == 1) {
                widgets = arguments[0];
                parent  = false;
            }
            else {
                widgets = arguments[1];
                parent  = arguments[0];
            }
            $.each(widgets, iterator);
        },
        each: function() {
            var parent   = false;
            var iterator = function (i, widgetName) {
                var w = jQuery.ui[widgetName];
                w.widgetName = widgetName;
                if (w && w.autoSelector) {
                    if (parent) {
                        var elements = jQuery(parent).find(w.autoSelector);
                    }
                    else {
                        var elements = jQuery(w.autoSelector);
                    }
                    callback.apply(w, [widgetName, elements]);
                }
            };
            if (arguments.length == 1) {
                var widgets  = $.grappelli.conf.get('widgets');
                var callback = arguments[0];
            }
            else if (arguments.length == 2 && $.isFunction(arguments[1])) {
                var widgets  = arguments[0];
                var callback = arguments[1];
            }
            else if (arguments.length == 2 && !$.isFunction(arguments[1])) {
                var widgets  = $.grappelli.conf.get('widgets');
                var callback = arguments[0];
                var parent   = arguments[1];
            }
            else if (arguments.length == 3 && $.isFunction(arguments[1])) {
                var widgets  = arguments[0];
                var callback = arguments[1];
                var parent = arguments[2];
            }
            $.each(widgets, iterator);
        },
        trigger: function(t, d, widgets){ 
            $.grappelli.widgets.each(
                widgets || $.grappelli.conf.get('widgets'),
                function(widgetName, els) { 
                    if (els.length > 0 && this.events && this.events[t]) {
                        this.events[t].apply(els, [$.Event({type: t, data: d})])
                    }
                });
        },
        /*
         * $.grappelli.widgets.call('destroy', scope)
         * $.grappelli.widgets.call('option', 1, scope)
        call: function() {
            var iterator, w, s, widgets, parent;
            iterator = function (i, widgetName) {
                w = jQuery.ui[widgetName];
                if (w && w.autoSelector) {
                    if (parent) {
                        s = jQuery(parent).find(w.autoSelector);
                    }
                    else {
                        s = jQuery(w.autoSelector);
                    }
                    if (args)
                        s[widgetName](method, args);
                    }
                    else {
                        s[widgetName](method);
                    }
                }
            };
            if (typeof arguments[0] == 'string') {
                parent  = false;
                method  = arguments[0];
                args    = arguments[1] || {};
                widgets = arguments[2] || [];
            }
            else {
                parent  = arguments[0];
                method  = arguments[1];
                args    = arguments[2] || {};
                widgets = arguments[3] || [];
            }
            $.each(widgets, iterator);
        },
        */

    };

    g.inst.conf = {
        extend: function (obj){
            for (var x in obj) {
                if (obj.hasOwnProperty(x)) {
                    g.inst.conf.set(x, obj[x]);
                }
            }
        },
        set: function (k, v){
            return g._registy[k] = v;
        },
        get: function (k, fallback){
            try {
                return g._registy[k];
            }
            catch (e) {
                return fallback || false;
            }
        }
    };

    g.inst.contentTypeExist = function(pk) {
        return g.inst.conf.get('content_types')[pk] && true || false;
    };

    g.inst.contentTypeURL = function(pk) {
        var ct = g.inst.conf.get('content_types')[pk];
        return  [g.inst.conf.get('admin_url'), ct.app, '/', ct.model, '/'].join('');
    };

    g.inst.getMessages = function(url, method, data, callback) {
            var wrapper = $('.messagelist').hide();
            if (!wrapper.get(0)) {
                wrapper = $('<ul class="messagelist" />').hide().insertBefore('#content');
            }
            jQuery[method](url, data || {}, function() {
                if (callback) {
                    callback.apply(this, arguments);
                }
                var tmp = arguments[0].match(/\<ul\sclass="messagelist\s?(\w+?)">(.*)<\/ul>/);
                if (tmp[1]) {
                    wrapper.html(tmp[2]).addClass(tmp[1]).slideDown('fast');
                }
            });
    
    };

    return g.inst;
}());


// Minimal Window Manager
$.extend($.grappelli, {
    window: function () {
        this.defaults = {width:  600, height: 920, resizable: true, scrollbars: true};

        this._data = function (k, v){
            var html  = (opener && opener.jQuery('html') || $('html'));
            var cache = html.data(this.name);
            if (cache) {
                if (k && v) { cache[k] = v; return v; }
                else if (k) { return cache[k] || false; }
                else        { return cache; }
            }
            else {
                return false;
            }
        };

        this._getOptions = function () {
            var a = [];
            $.each(this.options, function(k, v){ 
                a.push(k +'='+ v); 
            });
            return a.join(',');
        };

        this.close = function () {
            this._win.close();
            this._win = false;
        };

        this.open = function (focus) {
            this._win = window.open(this.href, this.name, this._getOptions());
            this._win.name = this.name;
            if (focus) {
                this._win.focus();
            }
            return this._win;
        };
        if (arguments.length > 1) {
            this.href    = arguments[0];
            this.options = $.extend(this.defaults, arguments[1] || {});
            this.name    = 'window-'+ String((new Date()).getTime());
            this._win    = false;
        }
        else {
            this.name = arguments[0];
            var data = (opener && opener.jQuery('html') || $('html')).data(this.name);
            if (data && data.instance) {
                return data.instance;
            }
            else {
                return false;
            }
        }

        (opener && opener.jQuery('html') || $('html')).data(this.name, { instance: this });

        return this;
    }
});

$.unescapeHTML = function(str) {
    var div = $('<div />').html(str.replace(/<\/?[^>]+>/gi, ''));
    return div.get(0) ? div.text(): '';
};

$(function(){
    
    
    // Always focus first field of a form OR the search input
    // TODO: this is most likely broken if the first field is a rich text area ..
    $('form .form-row:eq(0)')
        .find('input, select, textarea, button').eq(0)
        .add('#searchbar').focus();

    $('.object-tools a[href=history/]').bind('click.grappelli', function(){
        $('<div />').hide().appendTo('body')
            .load($(this).attr('href') +' #content', {}, function(html, rsStatus){
                $(this).dialog({
                    width:  700,
                    title:  $(this).find('h1:first').hide().text(),
                    height: 300        
                }).show();
            });
        return false;
    });
    

});

})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gTimeField
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gTimeField', {

    _init: function() {
        var ui = this;
        ui.dom = {
            picker: $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a href="#" /></p></div>'),
            button: $('<button class="ui-timepicker-trigger" type="button" />')
        };
        ui.dom.picker.appendTo('body')
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({ display:  'none', position: 'absolute'});

        ui.dom.button
            .bind('click.grappelli', function(){
                ui.toggle(this);
            })
            .insertAfter(ui.element);

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a href="#"></a></li>').find('a')
                .text(button.label).bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    ui.dom.picker.hide();
                    return false;
                }).end()
                .appendTo(ui.dom.picker.find('.timelist'));
        });

        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
        
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    },

    toggle: function(at) {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.hide();
        }
        else {
            ui.show(at);
        }
    },

    show: function(at) {
        var pos = $(at).offset();
        var ui = this;
        $('.clockbox.module:visible').hide();
        ui.dom.picker.show().css({
            top: pos.top - ui.dom.picker.height()/2,
            left: pos.left + 20
        });
        $('body').bind('click.gTimeField', function(e){
            var target = $(e.originalTarget);
            if (!target.hasClass('.clock-title') && !target.hasClass('ui-timepicker-trigger')) {
               ui.hide(); 
            }
        });
    },

    hide: function() {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.dom.picker.hide();
            $('body').unbind('click.gTimeField');
        }
    }

});

$.extend($.ui.gAutoSlugField, {
    autoSelector: 'input.vTimeField',
    defaults: {
        mask: '99:99:99', // set to false to disable
        buttons: [
            {label: gettext("Now"), callback: function(e, ui){ 
                return ui.element.val(new Date().getHourMinuteSecond()); 
            }},
            {label: gettext("Midnight"), callback: function(e, ui){ 
                return ui.element.val('00:00:00'); 
            }},
            {label: gettext("6 a.m."), callback: function(e, ui){ 
                return ui.element.val('06:00:00'); 
            }},
            {label: gettext("Noon"), callback: function(e, ui){ 
                return ui.element.val('12:00:00'); 
            }}
        ]
    }
});
})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gDateField
 *  Package: Grappelli
 *
 *  jslinted - 9 Mar 2010 (r764)
 */
(function($){

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonText:      ' ',
    duration:        160,
    showAnim:        'slideDown',
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext && gettext('Cancel') || 'Cancel',
    showOtherMonths: true,
    constrainInput:  true,
    defaultDate:     'today',
    isRTL:           $.grappelli.conf.get('rtl')
});


$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;
        console.log('dp init', ui.element);
        ui.element.datepicker().parent()
            // replace BR
            .find('br').replaceWith(ui.options.spacer || '');

        // remove text Date: & Time: (now that's ugly..)
        if (!ui.element.prev().get(0)) {
            try {
                ui.element.parent().get(0).childNodes[0].replaceWholeText('');
                ui.element.parent().get(0).childNodes[3].replaceWholeText('');
            } catch (e) {}
        }
            
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    }
});

$.extend($.ui.gDateField, {
    autoSelector: 'input.vDateField',
    defaults: {
        // set to false to disable input masking
        mask:   '9999-99-99',                   

        // separator between date and time fields
        spacer: '<span class="spacer" />'
    },
    events: {
        nodeCloned: function(e) {
            var parent = e.originalEvent.data.node;
            var nodes  = $($.ui.gDateField.autoSelector, e.originalEvent.data.node);
            if (nodes.length) {
                nodes.parent().find('.ui-datepicker-trigger').remove();
                nodes.removeClass('hasDatepicker').data('datepicker', false);
                nodes.gDateField('destroy').gDateField();
            }
        }
    }
});
})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gChangelist
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

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
            // $('#changelist.module.filtered').css('padding-right', 227);
            // $('.changelist-content').css('min-width', (tw + 1) +'px');
            // $('#changelist-filter').css('border-right', '15px solid #fff');
        }
        if (tw < cw) {
            // $('#changelist.module.filtered').css('padding-right', 210);
            // $('.changelist-content').css('min-width', 'auto');
            // $('#changelist-filter').css('border-right', 0);
        }
    }
});

$.extend($.ui.gChangelist, {
    autoSelector: '.changelist-content',
});
})(jQuery);
/*  Author:  Maxime Haineault <max@motion-m.ca>
 *  widget:  gBookmarks
 *  Package: Grappelli
 *
 *  jslinted - 10 Mar 2010
 */
(function($){

$.widget('ui.gBookmarks', {
         
    _init: function() {
        var ui, url;
        ui  = this;
        url = $.grappelli.conf.get('bookmarks_url') +'?path='+ window.location.pathname +' #bookmarks > li';
        ui.dom = {};

        ui.element.load(url, function(){
            ui._mapDom();
            ui._timeout   = true;
            ui.showMethod = ui.options.effects && 'slideDown' || 'show';
            ui.hideMethod = ui.options.effects && 'slideUp'   || 'hide';

            ui.dom.add.live("click",    function() { return ui.add();    });
            ui.dom.cancel.live("click", function() { return ui.cancel(); });

            $("li#toggle-bookmarks-listing.enabled")
                .live("mouseover", function(){ 
                    ui.show("#bookmarks-listing:hidden"); 
                    $("#bookmarks").one("mouseleave", function(){ 
                        ui.hide("#bookmarks-listing:visible"); 
                    });
                });
        });
    },

    /* Maps the ui.options.ns property to their
     * respective DOM node so that { wrapper: '#bookmarks' }
     * becomes "ui.dom.wrapper" that points to $('#bookmarks')
     **/
    _mapDom: function() {
        var ui, x;
        ui = this;
        for (x in ui.options.ns) {
            // ensure that's not a prototyped property
            if (ui.options.ns.hasOwnProperty(x)) { 
                ui.dom[x] = jQuery(ui.options.ns[x]);
            }
        }
    },

    /*  Show the drop down menu
     *  @speed animation speed, uses options by default
     * */
    show: function(el, speed) {
        var ui = this;
        ui._timeout = false;
        $(el)[ui.showMethod](speed || ui.options.effectsSpeed);
    },

    /* Hide a given menu
     *  @timeout animation timeout, uses options by default
     *  @speed animation speed, uses options by default
     * */
    hide: function(el, timeout, speed) {
        var ui = this;
        ui._timeout = true;
        setTimeout(function(){
            if (ui._timeout) {
                $(el)[ui.hideMethod](speed || ui.options.effectsSpeed);
                ui._timeout = false;
            }
        }, typeof(timeout) == 'undefined' && ui.options.hideTimeout || timeout);
    },

    /* This method is called when the cancel button of
     * the add bookmark form is pressed.
     * */
    cancel: function() {
        var ui = this;
        ui.hide(ui.dom.addWrapper, 0);
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    /* This method is called when the add bookmark 
     * button (+) is pressed
     * */
    add: function() {
        var ui = this;
        var addForm = ui.dom.addWrapper.find('form');

        ui.dom.title.val($('h1').text());
        ui.dom.path.val(window.location.pathname);
        ui.dom.list.removeClass('enabled');
        ui.hide(ui.dom.list, 0, 0);
        ui.show(ui.dom.addWrapper);
        addForm.bind('submit', function(e){
            var $elf = $(this);
            ui.hide(ui.dom.addWrapper, 0, 0);
            setTimeout(function(){
                $.grappelli.getMessages($elf.attr('action'), 
                                        $elf.attr('method').toLowerCase(),
                                        $elf.serialize());
            }, 200);
            return false;             
        });
        return false;
    }
});

$.extend($.ui.gBookmarks, {
    autoSelector: '#bookmarks',
    defaults: {
        // DOM mapping
        ns: {
            wrapper:    '#bookmarks',
            addWrapper: '#bookmark-add',
            add:        '#toggle-bookmark-add',
            cancel:     '#bookmark-add-cancel',
            list:       '#toggle-bookmarks-listing',
            path:       '#bookmark-path',
            title:      '#bookmark-title'
        },

        // Set to false to disable effects or true to enable them
        effects: true,

        // Speed at which effects are applied (in ms)
        effectsSpeed: 80,
        
        // Amount of time (in ms) before hiding the menu.
        //
        // Allowing a small grace period before hiding the menu avoid
        // lots of accidental gestures and makes the menu feels more
        // "solid" for the user. 
        //
        // TL-DR: the menu doesn't feel like it has ADD
        hideTimeout: 500
    }
});
})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gInlineGroup, gInlineStacked, gInlineTabular
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.grappelli.gInlineTabularBase = {
    
    
};
    
$.grappelli.gInlineStackedBase = {
    
    
};
         
$.widget('ui.gInlineGroup', {

    _updateIdentifiers: function(row, index) {
        var ui, attr, attrs, tag, tags, curr, t, x;
        ui   = this;
        attr = {};
        tags = $.map(ui.options.updatedTags, function(tag){
                       t = tag.match(/^(\w+):(.*)$/);
                       attr[t[1]] = t[2] && t[2].split(',') || false;
                       return t[1]; }).join(',');

        row.find(tags).each(function(i, t){
            tag   = t.nodeName.toLowerCase();
            attrs = attr[tag];
            for (x in attrs) {
                curr = attrs[x];
                $(this).attr(curr, $(this).attr(curr).replace(/\-\d+\-/, '-'+ index +'-'));
            }
        });
    },

    _newRow: function() {
        var ui, index, old, row, title;
        ui = this;
        index = ui._totalForms + 1;
        old   = ui._templateRow;
        row   = old.clone(false);
        // Update title for stacked inlines
        if (ui._isStacked) {
            title = row.find('h3:first');
            title.text(title.text().replace(/#\d+/, '#'+ index));
        }
        $.grappelli.widgets.trigger('nodeCloned', {node: row});
        ui._updateIdentifiers(row, ui._totalForms);
        row.insertAfter(ui.getRow(ui._totalForms));
        ui._totalForms = index;
        $.grappelli.widgets.trigger('nodeInserted', {node: row});
//      $.grappelli.widgets.each(function(widgetName, elements) {
//          if (elements.length > 0) {
//              //elements[widgetName]();
//          }
//      }, row);
        //$.grappelli.widgets.call(row, 'destroy', ['gDateField'])
//        $.grappelli.widgets.init(row, ['gDateField', 'gRelated', 'gAutocomplete'])
        return row;
    },

    addFormRow: function() {
        var ui = this;
        var newRow = ui._newRow();
        // initialize within the row scope the plugins 
        // that can't rely on jQuery.fn.live
        //$.grappelli.widgets.init(['gRelated'], newRow);
    },
    
    getRow: function(index) {
        var ui = this;
        return ui.element.find('.items > .module').eq(index - 1);
    },

    _init: function(){
        var ui = this;

        ui._isTabular    = ui.element.hasClass('tabular');
        ui._isStacked    = !ui._isTabular;
        ui._totalForms   = parseInt(ui.element.find('input[name$=-TOTAL_FORMS]').val(), 10);
        ui._initialForms = parseInt(ui.element.find('input[name$=-INITIAL_FORMS]').val(), 10);

        ui = $.extend(ui, $.grappelli[ui._isTabular && 'gInlineTabularBase' || 'gInlineStackedBase']);

        ui.dom = {
            addHandler: ui.element.find('.ui-add-handler'),
        };

        ui.dom.addHandler.bind('click', function(e){
            ui.addFormRow();
        });

        ui._templateRow = ui.getRow(ui._totalForms).clone(false);

        /*
        $.grappelli.widgets.init([], row);
        // Prevent fields of inserted rows from triggering errors if un-edited
        ui.element.parents('form').bind('submit.gInlineGroup', function(){
            ui.element.find('.inline-related:not(.has_original):not(.has_modifications) div.order :text').val('');
        });
        
        /// ADD HANDLER
        ui.element.find('a.ui-add-handler').bind('click.gInlineGroup', function(e){
            var container = $(this).parents('div.inline-group');
            var lastitem  = container.find('div.inline-related:last');
            var newitem   = lastitem.clone(true).appendTo(container.find('div.items:first'));
            var count     = parseInt(container.find('div.inline-related').length, 10);
            var header    = newitem.find('h3:first');
            e.preventDefault();
            // update new item's header (inline-stacked only)
            if (header.get(0) && container.hasClass('inline-stacked')) {
                header.html("<b>" + $.trim(header.text()).replace(/(\d+)$/, count) + "</b>");
            }
            else {
                header.remove(); // fix layout bug in inline-tabular
            }
            
            /// set TOTAL_FORMS to number of items
            container.find('input[id*="TOTAL_FORMS"]').val(count);
            
            ui._initializeItem(newitem, count);
            return false;
        });
        
        /// DELETEHANDLER
        ui.element.find('a.deletelink').bind("click.gInlineGroup", function() {
            var cp = $(this).prev(':checkbox');
            cp.attr('checked', !cp.attr('checked'));
            $(this).parents('div.inline-related').toggleClass('predelete');
            return false;
        });
        
        // Autodiscover if sortable
        if (ui.element.find('.order').get(0)) {
            ui._makeSortable();
        }
        
        ui.element.find('.ui-add-handler').bind('click.gInlineGroup', function(){
            ui._refreshOrder();
        });
        
        ui._refreshOrder();
        */
    },
    /*
    _initializeitem: function(el, count){
        
        /// replace ids, names, hrefs & fors ...
        el.find(':input,span,table,iframe,label,a,ul,p,img').each(function() {
            var $el = $(this);
            $.each(['id', 'name', 'for', 'href'], function(i, k){
                if ($el.attr(k)) {
                    $el.attr(k, $el.attr(k).replace(/-\d+-/g, '-'+  (count - 1) +'-'));
                }
            });
        });
        
        // destroy and re-initialize datepicker (for some reason .datepicker('destroy') doesn't seem to work..)
        el.find('.vdatefield').unbind().removeclass('hasdatepicker').val('')
            .next().remove().end().end()
            .find('.vtimefield').unbind().val('').next().remove();
        
        // date-/timefield
        el.find('.vdatefield').gdatefield();
        el.find('.vtimefield').gtimefield();
        
        /// remove error-lists and error-classes
        el.find('ul.errorlist').remove().end()
            .find('.errors, .error').removeclass("errors error");
        
        /// tinymce
        el.find('span.mceeditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            el.find('#' + id).css('display', '');
            tinymce.execcommand("mceaddcontrol", true, id);
        });
        
        el.find(':input').val('').end() // clear all form-fields (within form-cells)
            .find("strong").text('');     // clear related/generic lookups
        
        // little trick to prevent validation on un-edited fields
        el.find('input, textarea').bind('keypress.ginlinegroup', function(){
              el.addclass('has_modifications');
          }).end()
          .find('select, :radio, :checkbox').bind('keypress.ginlinegroup', function(){
              el.addclass('has_modifications');
          });
          
        return el;
    },
    */
    /*
    _makeSortable: function() {
        var ui   = this;
        var grip = $('<span class="ui-icon ui-icon-grip-dotted-vertical" />');
        //ui.element.find('.order').hide();
        if (ui.element.hasClass('inline-stacked')) {
            grip.prependTo(ui.element.find('.items .inline-related h3:first-child'));
        }
        else if (ui.element.hasClass('inline-tabular')) {
            grip.prependTo(ui.element.find('.items div.inline-item-tools'));
        }
        ui.element.find('.items')
            .sortable({
            axis: 'y',
            cursor: 'move',
            forcePlaceholderSize: true,
            helper: 'clone',
            opacity: 0.7,
            items: '.inline-related',
            appendTo: ui.element.find('.items'),
            update: function(e, inst){
                ui._refreshOrder();
            }
        });
    },
    
    _refreshOrder: function() {
        var index = 1;
        var ui = this;
        ui.element.find('.order input[type=text]').each(function(){
            $(this).val(index);
            index++;
            
            if (!$(this).parents('.inline-related').hasClass('has_original')) {
                var tools = $(this).parents('.module').find('ul.inline-item-tools');
                if (tools.get(0)) {
                    if (!tools.find('.deletelink').get(0)) {
                        $('<li><a title="Delete Item" class="deletelink" href="#"/></li>').appendTo(tools)
                            .find('a').bind('click.grappelli', function(){
                                $(this).parents('.inline-related').remove();
                                return false;
                            });
                    }
                }
            }
        });
    }
    */
});
$.extend($.ui.gInlineGroup, {
    autoSelector: '.group',
    defaults: {
        updatedTags: ['input:id,name', 'select:id,name', 'textarea:id,name', 'label:for'],
    }
});

// INLINE STACKED 

$.widget('ui.gInlineStacked', {
    _init: function(){
        var ui = this;
        // FIELDSETS WITHIN STACKED INLINES
        /* OBSOLETE ?
        ui.element.find('.inline-related').find('fieldset[class*="collapse-closed"]')
            .addClass("collapsed").find('h4:first').addClass("collapse-toggle").end()
            .find('fieldset[class*="collapse-open"] h4:first').addClass("collapse-toggle")
            .bind("click", function(e){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
        });
        */
    }
});

$.extend($.ui.gInlineStacked, {
    autoSelector: '.inline-stacked',
    defaults: {
        collapsible: true
    }
});

// INLINE TABULAR

$.widget('ui.gInlineTabular', {
    _init: function(){
    /*
        var ui = this;
        
        ui.element.find('.inline-related h3:first').remove(); // fix layout bug
        
        /// add predelete class (only necessary in case of errors)
        ui.element.find('input[name*="DELETE"]:checked').each(function(i) {
            $(this).parents('div.inline-related').addClass('predelete');
        });
        
        /// OPEN TABULARINLINE WITH ERRORS (onload)
        ui.element.filter('.inline-tabular').find('div[class*="error"]:first').each(function(i) {
            $(this).parents('div.inline-tabular').removeClass("collapsed");
        });
        */
    }
});

$.extend($.ui.gInlineTabular, {
    autoSelector: '.inline-tabular'
});
})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 *
 *  Binding to old SelectFilter calls.. cannot be removed because the calls are
 *  hardcoded into django's source..
 *
 *  jslinted - 8 Jan 2010
 */

// AARGH.
function addEvent() {
    var method = arguments[2];
    $(function(){ method.call(); });
}

(function($){

// Legacy compatibility
window.SelectFilter = { 
    init: function(id, name, stacked, admin_media_prefix){ 
        $('#'+id).gSelectFilter({stacked: stacked, name: name});
    }
};

$.widget('ui.gSelectFilter', {
    
    _cache: {avail: [], chosen: []},

    _init: function() {
        var id, ui;
        ui = this;
        id = ui.element.attr('id');
        ui.dom  = {
            wrapper:   $('<div />').appendTo(ui.element.parent()).addClass(ui.options.stacked ? 'selector stacked' : 'selector'),
            available: $('<div />').addClass('selector-available'),
            chooser:   $('<ul />').addClass('selector-chooser'),
            chosen:    $('<div />').addClass('selector-chosen'),
            title1:    $('<h2 />').text(interpolate(gettext('Available %s'), [ui.options.name])),
            title2:    $('<h2 />').text(interpolate(gettext('Chosen %s'), [ui.options.name])),
            choseall:  $('<a href="#" />').text(gettext('Choose all')).addClass('selector-chooseall'),
            clearall:  $('<a href="#" />').text(gettext('Clear all')).addClass('selector-clearall'),
            filter1:   $('<p>&nbsp;</p>').addClass('selector-filter'),
            filter2:   $('<p>&nbsp;</p>').addClass('selector-filter'),
            select:    {chosen: $('<select multiple="multiple" class="filtered" />').attr({id: id + '_to', size: ui.element.attr('size'), name: ui.element.attr('name')}), avail: ui.element }
        };
        
        ui.dom.select.chosen.bind('dblclick.gSelectFilter', function(){
            ui._move('chosen', 'avail');
        });

        
        // Fill cache and remove <p class="info">, because it just gets in the way.
        ui.element.parent().find('p').remove().end().addClass('filtered').find('option').each(function(){
            ui._cache[($(this).is(':selected') && 'chosen' || 'avail')]
                .push({value: $(this).val(), text: $(this).text(), displayed: 1});
        });

        ui.dom.wrapper.append(ui.dom.available, ui.dom.chooser, ui.dom.chosen);
        ui.dom.available.append(ui.dom.title1, ui.dom.filter1, ui.element, ui.dom.choseall);
        ui.dom.chosen.append(ui.dom.title2, ui.dom.filter2, ui.dom.select.chosen, ui.dom.clearall);

        ui.dom.choseall.bind('click.gSelectFilter', function(){
            ui._move_all('avail');
            return false;
        });
        
        ui.dom.clearall.bind('click.gSelectFilter', function(){
            ui._move_all('chosen');
            return false;
        });
        
        $('<li><a href="#" class="selector-add" /></li>').appendTo(ui.dom.chooser)
            .find('a').text(gettext('Add'))
            .bind('click.grappelli', function(){
                ui._move('avail');
                return false;
            });
        
        $('<li><a href="#" class="selector-remove" /></li>').appendTo(ui.dom.chooser)
            .find('a').text(gettext('Remove'))
            .bind('click.grappelli', function(){
                ui._move('chosen');
                return false;
            });

        ui.element.attr({ id: id +'_from', name: ui.options.name + '_old'})
            .bind('dblclick.gSelectFilter', function(){
                ui._move('avail');
            })
            .parents('form').bind('submit.gSelectFilter', function() { 
                ui._select_all('chosen'); 
            });
        
        $('<input type="text" />').appendTo(ui.dom.filter1)
            .bind('keydown', function(e){ ui._filter_key_up(e, 'avail'); })
            .bind('keyup',   function(e){ ui._filter_key_down(e, 'avail'); });
        
        $('<input type="text" />').appendTo(ui.dom.filter2)
            .bind('keydown', function(e){ ui._filter_key_up(e, 'chosen'); })
            .bind('keyup',   function(e){ ui._filter_key_down(e, 'chosen'); });

            ui._move('avail');
    },

    // Repopulate HTML select box from cache
    _redraw: function(i) {
        var ui, cids, cid, node, w, x, y, z;
        ui   = this;
        cids = i && [i] || ['avail', 'chosen'];

        for (w = 0, x = cids.length; w < x; w++) {
            cid = cids[w];
            ui._sort(cid);
            ui.dom.select[cid].find('option').remove();
            for (y = 0, z = ui._cache[cid].length; y < z; y++) {
                node = ui._cache[cid][y];
                if (node.displayed) {
                    $('<option />').val(node.value).text(node.text).appendTo(ui.dom.select[cid]);
                }
            }
        }
    },
    
    _delete_from_cache: function(cid, value) {
        var ui, node, delete_index, i, j;
        ui = this;
        for (i = 0; (node = ui._cache[cid][i]); i++) {
            if (node.value == value) {
                delete_index = i;
                break;
            }
        }
        j = ui._cache[cid].length - 1;
        for (i = delete_index; i < j; i++) {
            ui._cache[cid][i] = ui._cache[cid][i+1];
        }
        ui._cache[cid].length--;
    },
    
    _add_to_cache: function(cid, option) {
        var ui = this;
        ui._cache[cid].push({value: option.value, text: option.text, displayed: 1});
    },
    
    _cache_contains: function(cid, value) {
        // Check if an item is contained in the cache
        var node;
        for (var i = 0; (node = this._cache[cid][i]); i++) {
            if (node.value == value) { return true; }
        }
        return false;
    },

    _move: function(cid) {
        var ui = this;
        ui.dom.select[cid].find('option').each(function(){
            var $opt = $(this);
            if ($opt.attr('selected') === true && ui._cache_contains(cid, $opt.val())) {
                ui._add_to_cache((cid == 'avail' && 'chosen' || 'avail'), {value: $opt.val(), text: $opt.text(), displayed: 1});
                ui._delete_from_cache(cid, $opt.val());
            }
        });
        ui._redraw();
    },

    _move_all: function(cid) {
        this.dom.select[cid].find('option').attr('selected', 'true');
        this._move(cid);
    },

    _sort: function(cid) {
        this._cache[cid].sort( function(a, b) {
            a = a.text.toLowerCase();
            b = b.text.toLowerCase();
            try {
                if (a > b) { return 1; }
                if (a < b) { return -1; }
            }
            catch (e) {} // silently fail on IE 'unknown' exception
            return 0;
        } );
    },

    _select_all: function(cid) {
        this.dom.select[cid].find('option').attr('selected', 'selected');
    },

    _filter_key_up: function(e, cid) {
        var ui, from, temp;
        ui   = this;
        from = ui.dom.select[cid].get(0);
        // don't submit form if user pressed Enter
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            from.selectedIndex = 0;
            ui._move(cid, (cid == 'avail' && 'chosen' || 'avail'));
            from.selectedIndex = 0;
            return false;
        }
        temp = from.selectedIndex;

        ui.filter(cid, ui.dom.select[cid].prev().find('input').val());
        from.selectedIndex = temp;
        return true;
    },

    _filter_key_down: function(e, cid) {
        var ui, from, old_index;
        ui = this;
        from = ui.dom.select[cid].get(0);
        // right arrow -- move across
        if ((e.which && e.which == 39) || (e.keyCode && e.keyCode == 39)) {
            old_index = from.selectedIndex;
            ui._move(cid, (cid == 'avail' && 'chosen' || 'avail'));
            from.selectedIndex = (old_index == from.length) ? from.length - 1 : old_index;
            return false;
        }
        // down arrow -- wrap around
        if ((e.which && e.which == 40) || (e.keyCode && e.keyCode == 40)) {
            from.selectedIndex = (from.length == from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
        }
        // up arrow -- wrap around
        if ((e.which && e.which == 38) || (e.keyCode && e.keyCode == 38)) {
            from.selectedIndex = (from.selectedIndex === 0) ? from.length - 1 : from.selectedIndex - 1;
        }
        return true;
    },

    // Redisplay the HTML select box, displaying only the choices containing ALL
    // the words in text. (It's an AND search.)
    filter: function(cid, text) {
        var node, token, tokens, ui, i, j;
        tokens = text.toLowerCase().split(/\s+/);
        ui  = this;

        for (i = 0; (node = ui._cache[cid][i]); i++) {
            node.displayed = 1;
            for (j = 0; (token = tokens[j]); j++) {
                if (node.text.toLowerCase().indexOf(token) == -1) {
                    node.displayed = 0;
                }
            }
        }
        ui._redraw(cid);
    }
});



})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gActions
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gActions', {
    _init: function() {
        var ui = this;
        $('#action-toggle').show().bind('click.grappelli', function(){
            ui.element.find('input.action-select').attr('checked', $(this).attr('checked'));
        });
    }
});

$.extend($.ui.gActions, {
    autoSelector: '#changelist',
});
})(jQuery);
/*  Author:  Maxime Haineault <max@motion-m.ca>
 *  widget:  gAutocomplete
 *  Package: Grappelli
 *  Todo:
 *   - Caching
 *
 *  jslinted - 8 Jan 2010
 * */
(function($){

$.fn.prevOrLast = function() {
    return $(this).prev().length > 0 && $(this).prev() || $(this).parent().children(':last');
};
$.fn.nextOrFirst = function() {
    return $(this).next().length > 0 && $(this).next() || $(this).parent().children(':first');
};

$.widget('ui.gAutocomplete', {

    _lastRequest: 0,
    _results: [],
    _select_onload: false,
    _ignored_chars: [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 9],
    _getUrl: function() {
        var ui = this;
        return [$.grappelli.conf.get('autocomplete_url'), ui.options.app, '/', ui.options.model,'/'].join('');
    },
    _init: function() {
        var ui, width;
        ui = this;
        ui.options = $.extend(ui.options, ui.element.metadata());
        ui.dom = {
            wrapper: ui._createElement('div',    {ns: 'wrapper'}).hide(), 
            results: ui._createElement('ul',     {ns: 'results'}), 
            input:   ui._createElement('input',  {ns: 'autocomplete', attr:{ type: 'text'}}).addClass('vAutocompleteSearchField'), 
            browse:  ui._createElement('button', {ns: 'browse',       attr:{ href: ui.options.related_url, title: 'Browse'}}) 
        };
        
        ui.element.hide().parent().find('.vAutocompleteRawIdAdminField').hide();
        ui.element.attr('name', ui.element.attr('id'));
        ui.dom.input.insertAfter(ui.element);

        // Initial value
        if (ui.element.val()) {
            ui.dom.input.val(ui.element.val());
        }

        width = ui.dom.input.width() + parseInt(ui.dom.input.css('padding-left').slice(0, -2), 10) + parseInt(ui.dom.input.css('padding-right').slice(0, -2), 10);

        if (ui.options.browse) {
            ui.dom.browse.insertAfter(ui.dom.input).attr('id', 'lookup_id_'+ ui.element.attr('id'))
                .hover(function(){ $(this).addClass('ui-state-hover'); }, function(){ $(this).removeClass('ui-state-hover'); })
                .bind('click.browse', function(){
                    return ui._browse(this); 
                });

            ui.dom.input
                .bind('focus.browse', function(){ ui.dom.browse.addClass('focus'); })
                .bind('blur.browse',  function(){ ui.dom.browse.removeClass('focus'); });
        }

        ui.dom.wrapper
            .append(ui.dom.results)
            .insertAfter(ui.dom.input)
            .css('left', ui.dom.input.position().left)
            .width(width);
        
        ui._bind(ui.dom.input, 'keydown', function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            switch(kc) {
                case key.UP:     return ui._select('prev');
                case key.DOWN:   return ui._select('next');
                case key.ENTER:  e.preventDefault(); return ui._choose();
                case key.ESCAPE: return ui._cancel();
                default:
                return true;
            }
        });

        ui.dom.input.delayedObserver(function(e){
            var kc = e.keyCode || 0;
            // Option: minChar
            if ($(this).val().length >= ui.options.minChars) { 
                if ($.inArray(kc, ui._ignored_chars) < 0) {
                    ui._autocomplete();
                }
            }
            else {
                ui.dom.wrapper.hide();
                ui._selected().removeClass('selected');
                if ($(this).val().length === 0) {
                    ui._setVal();
                }
            }
        }, ui.options.delay);
    },

    /* called when the "Browse" button is clicked on
     * Autocomplete fields
     */
    _browse: function(l) {
        var link = $(l);
        var href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        var wm   = $.grappelli.window(href, {height: 600 , width: 920, resizable: true, scrollbars: true});
        wm._data('element', link.prevAll('input:first'));
        wm.open();
        return false;
    },

    /* Set the current widget value
     * @val the value to be set (must be an object that 
     *      contains a "id" and a "label" property)
     **/
    _setVal: function(val) {
        var ui = this;
        if (val) {
            $('[name="'+ ui.element.attr('id') +'"]').val(val.id);
            ui.dom.input.val($.format(ui.options.inputFormat, val));
        }
        else {
            $('[name="'+ ui.element.attr('id') +'"]').val('');
            ui.dom.input.val('');
        }
    },

    /* Creates an HTML fragment
     * @type    the element type (ex: "div", "p", "b"...)
     * @attr    an array of attributes to apply
     **/
    _createElement: function(type, options) {
        var ui = this;
        var el = $('<'+ type +' />');
        var op = options || {};
        if (op.ns)   { el.addClass(ui.widgetBaseClass +'-'+ op.ns); }
        if (op.attr) { el.attr(op.attr); }
        return el;
    },

    /*  Shortcut to bind an event to the
     *  widget element
     **/
    _bind: function(element, eventName, callback) {
        var ui = this; 
        element.bind(eventName +'.'+ ui.widgetEventPrefix, function(e){
            return callback.apply(this, [e, ui]);
        });
    },
    
    /* Hide the autocomplete result list
     **/
    _hideList: function() {
        var ui = this;
        if (ui.dom.wrapper.is(':visible')){
            ui.dom.wrapper.hide();
            $('html').unbind('click.gAutocomplete');
        }
    },

    /* Show the autocomplete result list
     **/
    _showList: function(){
        var ui = this;
        if (ui.dom.wrapper.is(':hidden')){
            ui.dom.wrapper.show();
            ui.dom.input.parents('.form-row').removeClass('errors');
            $('html').bind('click.gAutocomplete', function(e){
                if (!$(e.target).hasClass('ui-gAutocomplete-autocomplete')) {
                    ui._hideList();
                }
            });
        }
    },

    /* Called when a selection has been made
     **/
    _select: function(which) {
        var ui = this;
        var li = false;
        ui._showList();
        var selected = ui._selected();
        if (selected.length > 0) {
            li = selected.removeClass('selected')[(which == 'prev' && 'prevOrLast' || 'nextOrFirst')]();
        }
        else {
            li = ui.dom.results.find((which == 'prev' && 'li:last-child' || 'li:first-child')).addClass('selected');
        }
        li.addClass('selected');
        ui._choose(true);
        return true;
    },
            

    /*  Returns the currently selected "li" element
     **/
    _selected: function() {
        return this.dom.results.find('li.selected');
    },

    /* Called when the input value has been changed.
     * Then updates the results list.
     * */
    _autocomplete: function() {
        var ui  = this;
        var url = ui._getUrl() + ui.options.search_fields +'/?q='+ ui.dom.input.val();
        var lr  = ++ui._lastRequest;

        if (ui.options.maxResults) {
            url = url + '&limit='+ ui.options.maxResults;
        }
        if (ui.options.throbber) {
            ui.dom.input.addClass('searching');
        }
        if (ui.options.browse) {
            ui.dom.browse.attr('disabled', true);
        }
        ui._showList();
        $.getJSON(url, function(json, responseStatus){
            // process the request only if it's successful and it's the last sent (avoid race conditions)
            ui.dom.input.removeClass('searching');
            if (ui.options.browse) {
                ui.dom.browse.attr('disabled', null);
            }
            if (responseStatus == 'success' && lr == ui._lastRequest) {
                ui._results = json;
                ui._redraw();
            }
        });
    },

    /*  Return the cached results list
     **/
    results: function() {
        return this._results;         
    },

    /* Called on key up/down and mouseover
     * */
    _choose: function(nonSticky, mouseClick) {
        var ui = this;
        var node = ui.dom.results.find(mouseClick && '.hover' || '.selected');
        if (node.data('json')) {
            ui._setVal(node.data('json'));
            if (nonSticky) { // remember value in case of cancel
                ui.dom.input.data('sticky', ui.dom.input.val());
            }
            else {
                ui._hideList();
            }
        }
        ui.element.trigger($.Event({type: 'complete', sticky: !nonSticky, data: node.data('json')}));
        return false;
    },


    /* This method is called to cancel a complete operation, for
     * example, if the user presses "Esc" or "Tab" while autocompleting.
     * */
    _cancel: function() {
        var ui = this;
        ui.dom.results.find('.selected').removeClass('selected');
        if (ui.dom.input.data('sticky')) {
            ui.dom.input.val(ui.dom.input.data('sticky'));
            ui.dom.input.data('sticky', false);
        }
        ui._hideList();
        return false;
    },

    /*  This method must be called when a new results list
     *  as been loaded. It will update the autocomplete list
     *  with the new results.
     **/
    _redraw: function() {
        var ui = this;
        var li, item, txt = false;
        var rs = ui.options.maxResults && ui._results.slice(0, ui.options.maxResults) || ui._results;
        var liMouseMove = function() { ui._shiftSelection(item); };
        var liClick = function() { ui._choose(false, true); };
        ui.element.trigger('redraw');
        ui.dom.results.empty();

        if (rs.length > 0) {
            for (var x=0; x<rs.length; x++) {
                item = rs[x];
                txt  = $.format(ui.options.listFormat, item);
                li   = ui._createElement('li', {ns: 'result'}).data('json', item)
                            .hover(function(){ $(this).addClass('hover'); }, 
                                   function(){ $(this).removeClass('hover'); })
                            .appendTo(ui.dom.results);
                            

                // Option: highlight
                if (ui.options.highlight) {
                    li.html(txt.replace(new RegExp("("+ ui.dom.input.val() +")", "gi"),'<b>$1</b>'));
                }
                else {
                    li.text(txt);
                }
                ui.dom.input.removeClass('no-match');
                ui.dom.results.find('.selected').removeClass('selected');
                ui._bind(li, 'mouseover', liMouseMove);
                ui._bind(li, 'click',     liClick);
            }
            ui._showList();
        }
        else {
            ui._hideList();
            ui.dom.input.parents('.form-row').addClass('errors');
        }
        ui.element.trigger('redrawn');
    },
    
    /* Take a LI element, mark it as selected and
     * mark its siblings as not-selected
     * */
    _shiftSelection: function(el) {
        try {
            $(el).addClass('selected').siblings().removeClass('selected');
        } catch(e) {}
        return this;
    }
});

$.extend($.ui.gAutocomplete, {
    autoSelector: 'input.ui-gAutocomplete',
    getter: 'results',
    defaults: {
        // maximum results to show per requests (this is 
        // processed server side)
        maxResults: 4,

        // a short delay is necessary to avoid making a request upon 
        // each keystroke 0.5 (500ms) is recommended.
        delay: 0.5,    

        // highlight matched substrings with <b> tags
        highlight: true,

        // show a browse button
        browse: true,

        // the minimum caracters the field must contain before making
        // a search query
        minChars: 1,
    
        maxResults: 20,
        listFormat: '{id:d} - {label:s}',
        inputFormat: '{label:s}'
    },
    events: {
        nodeCloned: function(e) {
            var parent = e.originalEvent.data.node;
            var nodes  = $($.ui.gAutocomplete.autoSelector, e.originalEvent.data.node);
            if (nodes.length) {
                nodes.gAutocomplete('destroy').gAutocomplete();
            }
        }
    }
});


})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gFacelist
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gFacelist', {

    _init: function(){
        var ui = this;
        // erh.. jquery UI < 1.8 fix: http://dev.jqueryui.com/ticket/4366
        ui.options.autocomplete = $.extend($.ui.gFacelist.defaults.autocomplete, ui.options.autocomplete);
        
        // merge options from server
        ui.options = $.extend(ui.options, ui.element.metadata());

        ui.element.hide().parent().find('p.help').remove();

        ui.dom = {
            rawfield: ui.element.parent().find('input.vM2MAutocompleteRawIdAdminField').hide(),
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            input:    ui._createElement('input',{ns: 'search'})
                        .addClass('vM2MAutocompleteSearchField'), 
            browse:  ui._createElement('button',{ns: 'browse', attr:{href: ui.options.related_url, title: 'Browse'}}) 
        };
        
        ui.dom.rawfield.val(ui.dom.rawfield.val().replace(/\[|\]/g, ''));
        ui.dom.wrapper.append(ui.dom.input, ui.dom.facelist).insertAfter(ui.element);

        if (ui.options.browse) {
            ui.dom.browse.insertAfter(ui.dom.input)
                .bind('click.browse', function(){
                    return ui._browse(this); 
                });
        }
        
        ui.options.autocomplete.app = ui.options.app;
        ui.options.autocomplete.model = ui.options.model;
        ui.options.autocomplete.search_fields = ui.options.search_fields;
        // Overriding because using Autocomplete's browse becomes too messy ..
        ui.options.autocomplete.browse = false;
        ui.dom.input.gAutocomplete(ui.options.autocomplete);
        // remove already selected items from autocomplete results
        ui.dom.input.bind('redrawn', function(e){
            var ids, div;
            ids = $.makeArray(ui.dom.facelist.find('.ui-gFacelist-item').map(function(){
                return $(this).data('json').id;
            }));
            div = $(this).nextAll('div');
            div.find('li').each(function(){
                if ($.inArray($(this).data('json').id, ids) >= 0) {
                    $(this).remove();
                }
            });
            if (div.find('li:visible').length < 1) {
                ui.dom.facelist.find('.ui-gAutocomplete-autocomplete').addClass('no-match');
            }
        });

        ui.dom.ac = ui.dom.wrapper.find('.ui-gAutocomplete-autocomplete');
        ui.dom.ac
            .bind('focus.gFacelist', function(){ ui.dom.facelist.addClass('focus'); })
            .bind('blur.gFacelist',  function(){ ui.dom.facelist.removeClass('focus'); });

        ui._bind(ui.dom.ac, 'keydown', function(e){
            if (e.keyCode == $.ui.keyCode.BACKSPACE && !ui.dom.ac.val().length) {
                ui.dom.input.parent().prev().remove();
            }
            else if (e.keyCode == $.ui.keyCode.ENTER) {
                return false;
            }
        });

        ui._bind(ui.dom.ac, 'keyup', function(e){
            if (e.keyCode == $.ui.keyCode.ESCAPE) {
                ui.dom.ac.val(''); 
            }
        });
        ui._bind(ui.dom.input, 'complete', function(e){
            if (e.originalEvent.sticky) {
                ui._addItem(e.originalEvent.data); 
            }
        });

        // load initial data
        if (ui.options.initial_data) {
            $.each(ui.options.initial_data, function(k, v) {
                ui._addItem({label:v, id: k});
            });
        }
        // TODO: find out proper css fix
        ui.element.parent().find('.add-another').css('margin-top', '-24px').css('margin-left', '6px');
    },

    /* Public method for adding a value
     * instance.gFacelist('addVal', <value>);
     * */
    addVal: function (i) {
        this._addItem(i);
    },

    /* Called when the browse button is clicked
     **/
    _browse: function(l) {
        var link, href, wm;
        link = $(l);
        href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        wm   = $.grappelli.window(href, {height: 600 , width: 920, resizable: true, scrollbars: true});
        wm._data('element', this.element);
        wm.open();
        return false;
    },

    /*  Removes an item from the list
     **/
    _removeItem: function (item) {
        var ui = this;
        var el = $(item);
        ui._removeId(el.data('json').id);
        el.remove();
    },

    /* Add an item to the list and
     * bind necessary events
     **/
    _addItem: function(data) {
        var ui, label, button;
        ui = this;
        if (data.label && data.label != '') {
            label = $('<span />').text(data.label);
            button = ui._createElement('li', {ns: 'item'})
                .html(label)
                .data('json', data)
                .addClass('ui-corner-all')
                .appendTo(ui.dom.facelist)
                .bind('click.gFacelist', function(){
                    ui._removeItem(this);
                }).hide();

            setTimeout(function(){
                button.show();           
            }, ui.options.addItemDelay * 1000);

            ui._addId(data.id);
            ui.dom.ac.val('');
            return button;
        }
    },

    /* Removes an id from the raw field and cache
     **/
    _addId: function (id) {
        var ui, ids, stack;
        ui    = this;
        ids   = ui.dom.rawfield.val().split(',');
        stack = $.map(ids, function (v){ if (v != '') { return v; } });
        stack.push(id);
        ui.dom.rawfield.val(stack.join(','));
        return ui;
    },

    /* Add an id to the raw field and cache
     **/
    _removeId: function (id) {
        var ui, ids, stack;
        ui    = this;
        ids   = ui.dom.rawfield.val().replace(/\[|\]/g,'').split(',');
        stack = $.map(ids, function (v){ if (v != id) { return v; } });
        ui.dom.rawfield.val($.format('{0:s}', stack.join(',')));
        return ui;
    },

    /* Create a DOM element and manage 
     * proper namespacing of class name
     **/
    _createElement: function(type, options, innerHTML) {
        var ui, el, op;
        ui = this;
        el = $('<'+ type +' />');
        op = options || {};
        if (type != 'input') { el.addClass('ui-helper-reset'); }
        if (op.ns)           { el.addClass(ui.widgetBaseClass +'-'+ op.ns); }
        if (op.attr)         { el.attr(op.attr); }
        return el;
    },

    /* Bind an event to an element and
     * manage proper namespacing of event name
     **/
    _bind: function(element, eventName, callback) {
        var ui = this; 
        element.bind(eventName +'.'+ ui.widgetEventPrefix, function(e){
            return callback.apply(this, [e, ui]);
        });
    }
});

$.extend($.ui.gFacelist, {
    autoSelector: 'input.ui-gFacelist',
    defaults: {

        related_url: '',

        // data present at load time (json)
        initial_data: false,

        // Delay before showing a new item (in ms)
        //
        // When an item is selected it's better to 
        // wait a short delay before showing the newly
        // added item. If not, the item gets added before
        // the autocomplete list hides itself and it creates
        // a feeling that nothing happened.
        addItemDelay: 0.2,

        // show browse button
        browse: true,

        // gAutocomplete options
        autocomplete: {}
    }
});
})(jQuery);
/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

// Abstract base class for gRelated and gGenericRelated

$.RelatedBase = {

    /* Returns the browse url
     * @k content type id (pk)
     * outputs: /admin/<app>/<model>/
     * */
    _url: function(k) {
        return $.grappelli.contentTypeExist(k) 
            && $.grappelli.contentTypeURL(k) +'?t=id' || '';
    },

    /* Called when the "Browse" button is clicked 
     * on Related and GenericRelated fields
     */
    _browse: function(l) {
        var ui, link, href, wm;
        link = $(l);
        href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        wm   = $.grappelli.window(href, {height: 600 , width: 980, resizable: true, scrollbars: true});
        wm._data('element', link.prevAll('input:first'));
        wm.open();
        return false;
    },
    
    /* Called when the object id field is changed 
     * and it updates the label accordingly
     */
    _lookup: function(e){
        var ui, app_label, model_name, url, tl, txt, item;
        ui = this;
        if (ui.dom.link.attr('href')) {
            app_label  = ui.dom.link.attr('href').split('/').slice(-3,-2);
            model_name = ui.dom.link.attr('href').split('/').slice(-2,-1);
            if (ui.dom.object_id.val() == '') {
                ui.dom.text.text('');
            }
            else {
                ui.dom.text.text('loading ...');
                url = $.grappelli.conf.get((ui.dom.object_id.hasClass('vManyToManyRawIdAdminField') && 'm2m_related' || 'related') + '_url');
                $.get(url, {object_id: ui.dom.object_id.val(), app_label: app_label, model_name: model_name}, function(data) {
                    item = data;
                    if (item) {
                        tl = (ui.options.maxTextLength - ui.options.maxTextSuffix.length);
                        if (item.length > tl) {
                            txt = decodeURI(item.substr(0, tl) + ui.options.maxTextSuffix);
                            ui.dom.text.text(txt);
                        } else {
                            ui.dom.text.text(decodeURI(item));
                        }
                    }
                });
            }
        }
    }
};

$.RelatedDefaultsBase = {
    maxTextLength: 32,
    maxTextSuffix: ' ...'
};

$.widget('ui.gRelated', $.extend($.RelatedBase, {
    _init: function() {
        var ui = this;
        ui.dom = { object_id: ui.element, text: $('<strong />') };
        
        ui.dom.link = ui.element.next('a').attr('onclick', false)
            .live('click', function(e){
                e.preventDefault();
                return ui._browse(this);
            });
        
        // use existing <strong> element if present
        if (ui.element.nextAll('strong:first').get(0)) {
            ui.dom.text = ui.element.nextAll('strong:first');
        }
        else {
            ui.dom.text.insertAfter(ui.dom.link);
        }

        ui.dom.object_id.bind('keyup.gRelated focus.gRelated', function(e){
            ui._lookup(e);
        }).trigger($.Event({type: 'keyup'})); // load initial data
    }
}));

$.extend($.ui.gRelated, {
    autoSelector: 'input.vForeignKeyRawIdAdminField, input.vManyToManyRawIdAdminField',
    defaults: $.RelatedDefaultsBase
});

$.widget('ui.gGenericRelated', $.extend($.RelatedBase, {
    _init: function(){
        var ui = this;

        ui.options = $.extend($.RelatedDefaultsBase, ui.options);
        ui.dom = {
            object_id: ui.element,
            content_type: $('#'+ ui.element.attr('id').replace('object_id', 'content_type')),
            link: $('<a class="related-lookup" />'),
            text: $('<strong />')
        };

        ui._disable(!ui.dom.content_type.val());

        // Rebuild object ID (input, browse button and label) when content type select is changed
        ui.dom.content_type.bind('change.gGenericRelated, keyup.gGenericRelated', function(e) {
            var el = $(this);
            var href = ui._url(el.val());
            if (e.firstrun) {
                ui.dom.object_id.val('');
                ui.dom.text.text('');
            }
            ui._disable(!el.val());
            if (el.val()) {
                var link = ui.dom.object_id.next('.related-lookup');
                if (link.get(0)) {
                    link.attr('href', href);
                }
                else {
                    ui.dom.link.insertAfter(ui.dom.object_id)
                        .after(ui.dom.text)
                        .bind('click.gGenericRelated', function(e){
                            e.preventDefault();
                            return ui._browse(this);
                        })
                        .data('id', ui.dom.object_id.attr('id'))
                        .attr({id: 'lookup_'+ ui.dom.object_id.attr('id'), href: href});
                }
            } 
            else {
                ui.dom.object_id.val('')
                    .parent().find('.related-lookup, strong').remove();
            }
        }).trigger($.Event({type: 'keyup', firstrun: true})); // load initial data

        // Update when object ID is changed
        ui.dom.object_id.bind('keyup.gGenericRelated focus.gGenericRelated', function(e){
            ui._lookup(e);
        }).trigger($.Event({type: 'keyup'})); // load initial data
    },

    // Disables the object ID input
    _disable: function(state) {
        this.dom.object_id.attr('disabled', state); 
    }
}));

$.extend($.ui.gGenericRelated, {
    autoSelector: 'input[name*="object_id"]',
    defaults: $.RelatedDefaultsBase
});

// Used in popup windows to disable default django behaviors
$(function(){

    // Browse popup
    if (opener && /\?|&pop/.test(window.location.search)) {
        // get rid of actions
        if ($('#action-toggle').get(0)) {
            $('.result-list > table tr td:first-child, .result-list > table tr th:first-child, .actions').hide();
        }
        $('a[onclick^=opener\\.dismissRelatedLookupPopup]')
            .attr('onclick', false)
            .bind('click', function(e){
                var pk = $(this).parents('tr').find('input.action-select').val();
                var wm = opener.jQuery.wm(window.name);
                if (wm) {
                    wm._data('pk', pk);
                    wm._data('newRepr', $(this).text());
                    e.preventDefault();
                    return $.dismissRelatedLookupPopup(wm);
                }
            });

        $.dismissRelatedLookupPopup = function (wm) {
            if (wm) {
                var el  = wm._data('element');
                var pk  = wm._data('pk');
                var lbl = wm._data('newRepr');
                if (el.hasClass('vManyToManyRawIdAdminField') && el.val().length) {
                    el.val($.format('{0:s},{1:s}', el.val(), pk));
                    el.focus();
                }
                else if (el.hasClass('vM2MAutocompleteSearchField')) {
                    el.gFacelist('addVal', {id: pk, label: lbl});
                }
                else {
                    el.val(pk);
                    if (el.hasClass('vAutocompleteSearchField')) {
                        el.trigger($.Event({type: 'updated'}))
                          .parent().find('input.ui-gAutocomplete-autocomplete').val(lbl);
                    }
                    else {
                        el.focus();
                    }
                }
                wm.close();
            }
        };
    }

    // Sort a slect input alphabetically/numerically (TODO: optimize..)
    $.sortSelect = function (select) {
        var s = $(select);
        var l = s.find('option').map(function(o){
            return {label: $(this).text(), value: $(this).val(), selected: $(this).attr('selected') };
        });
        l = l.sort(function(a, b) { return a.label > b.label; });
        s.empty();
        l.each(function() {
            $('<option />').val(this.value).attr('selected', this.selected).appendTo(s).text(this.label);
        });
    };

    // Add popup
    $('a[onclick^=return\\ showAddAnotherPopup]')
        .attr('onclick', false).unbind()
        .bind('click', function(e){
            var link = $(this);
            var name = link.attr('id').replace(/^add_/, '');
            var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + '_popup=1';
            var wm   = $.grappelli.window(href, {height: 600 , width: 980, resizable: true, scrollbars: true});
            wm._data('link', link);
            wm._data('id', name);
            wm.open(true);
            e.preventDefault();
            return false;
        });

    if (opener && /_popup/.test(window.location.search)) {
        // newId and newRepr are expected to have previously been escaped by django.utils.html.escape.
        //
        // I can't get rid of this function .. (I could by using the middleware, but it would make it a requirement..)
        // django/contrib/admin/options.py: 
        // return HttpResponse('<script type="text/javascript">opener.dismissAddAnotherPopup(...
        var wm  = opener.jQuery('html').data(window.name);
        var el = opener.jQuery('#'+ wm.id);

        opener.dismissAddAnotherPopup = function (w, newId, newRepr) {
            if (wm) {
                if (el.get(0)) {
                    var type = el.get(0).nodeName.toLowerCase();
                    if (type == 'select') {
                        var opt = $('<option />').val(newId).text($.unescapeHTML(newRepr));
                        opener.jQuery('a[href='+ el.nextAll('a.add-another').attr('href') + ']').each(function(){
                            var sel = $(this).parent().find('select');
                            var nop = opt.clone();
                            sel.append(nop);
                            if (el.attr('id') == sel.attr('id')) {
                                nop.attr('selected', true);
                            }
                            $.sortSelect(sel);
                        });
                    }
                    else if (type == 'input') {
                        if (el.hasClass('vM2MAutocompleteRawIdAdminField')) {
                            opener.jQuery('#'+ el.attr('id').replace('id_','')).gFacelist('addVal', {id: newId, label: newRepr});
                        }
                        else if (el.hasClass('vAutocompleteRawIdAdminField')) {
                            el.val(newId);
                            el.prevAll('input.ui-gAutocomplete-autocomplete').val($.unescapeHTML(newRepr));
                        }
                        else {
                            el.val(newId);
                        }
                    }
                    el.focus();
                }
                w.close();
            }
        };
    }
});

})(jQuery);
/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gAutoSlugField
 *  Package:  Grappelli
 *  Requires: jquery.gAutoSlugField.js
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gAutoSlugField', {

    _init: function() {
        var ui  = this; 
        ui.mode = ui.element.attr('rel') && 'mirror' || 'standalone';
        ui.dom  = {
            preview: $('<span class="ui-gAutoSlugField-preview">test</span>'),
            input:   $('<input maxlength="50" type="text" class="ui-gAutoSlugField vTextField" />')
        };

        if (ui.mode == 'mirror') {
            ui.dom.input = $('#id_'+ ui.element.attr('rel'));
            // extra security ..
            ui.element.bind('blur', function(e){
                $(this).val($.slugify($(this).val()));
            });
        }
        else {
            ui.element.hide();
            ui.dom.preview.insertAfter(ui.element);
            if (ui.element.attr('maxlength')) {
                ui.dom.input.attr('maxlength', ui.element.attr('maxlength'));
            }
            ui.dom.input.insertBefore(ui.element);
        }

        ui.dom.input.bind('keyup', function(e){
            ui._refresh(e, true);
        });

        ui._refresh(); // sync initial values
    },
    
    _refresh: function() {
        var ui, val;
        ui  = this;
        val = $.slugify(ui.dom.input.val());
        if (ui.mode == 'standalone') {
            if (val == '' && typeof val != 'undefined') {
                ui.dom.preview.hide().text('');
            }
            else {
                ui.dom.preview.show().text(val);
            }
        }
        ui.element.val(val);
    }
});

$.extend($.ui.gAutoSlugField, {
    autoSelector: '.ui-gAutoSlugField',
    defaults: {
        delay: 0.8
    }
});
})(jQuery);
/*  Author:   Maxime Haineault <max@motion-m.ca>
 *  widget:   gCollapsible
 *  Package:  Grappelli
 *  Requires: jquery.gCollapsible.js
 *
 *  jslinted - 13 Mar 2010
 *
 *  CSS based collaspible behavior
 *
 *  Classes
 *  =======
 *
 *  ui-collapsible              make an element collapsible
 *  ui-collapsible-opened       opened state of a collapsible element
 *  ui-collapsible-closed       closed state of a collapsible element
 *  ui-collapsible-toggle       make an element the toggle element for a parent collapsible
 *  ui-collapsible-open-all     open also sub-element that are collapsible
 *  ui-collapsible-close-all    open also sub-element that are collapsible
 *  ui-collapsible-all-opened   open also sub-element that are collapsible (applies to groups)
 *  ui-collapsible-all-closed   close also sub-element that are collapsible (applies to groups)
 *
 */
(function($){

$.widget('ui.gCollapsible.js', {

    _init: function() {
        var ui  = this; 
        ui._isGroup = ui.element.addClass('ui-collapsible').hasClass('.group');
        ui.dom  = {
            closeAll: ui.element.find('.ui-collapsible-close-all'),
            openAll:  ui.element.find('.ui-collapsible-open-all')
        };
        if (!ui.element.hasClass('ui-collapsible-closed')) {
            ui.element.addClass('ui-collapsible-opened');
        }
        if (ui._isGroup) {

            // Toggle behavior of h3
            ui.element.find('h3.ui-collapsible-toggle').bind('click', function(e){
                ui._onClick.apply(this, [e, ui]);
            });
            
            // Toggle behavior of h2
            ui.element.children().eq(0)
                .addClass('ui-collapsible-toggle')
                .bind('click', function(e){
                    ui._onClick.apply(this, [e, ui]); });

            // Close/Open all
            ui[(ui.element.hasClass('ui-collapsible-all-closed') && 'closeAll' || 'openAll')]();
            ui.dom.openAll.bind('click',  function(){ ui.openAll(); });
            ui.dom.closeAll.bind('click', function(){ ui.closeAll(); });
        }
        else {
            ui.dom.toggle = ui.element.find('.ui-collapsible-toggle');
        }

        // Errors handling
        var errors = ui.element.find('.errors');
        if (errors) {
            ui.open(errors.parents('.ui-collapsible'));
        }

    },

    /* Triggered when a toggle handle is clicked
     * @e   event
     * @ui  gCollapsible instance
     * */
    _onClick: function(e, ui){
        var parent = $(this).parents('.ui-collapsible:eq(0)');
        if (!parent.get(0)) {
            parent = ui.element;
        }
        ui.toggle(parent);
    },

    /* Toggles collapsible group
     * @el   element
     * */
    toggle: function(el) {
        return this[el.hasClass('ui-collapsible-closed') && 'open' || 'close'](el); 
    },

    /* Opens *all* (including parent group)
     * @el   element
     * */
    openAll: function(el) {
        this.open(this.element); // Make sure group is open first
        this.open(this.element.find('.ui-collapsible'));
    },

    /* Close all (excluding parent group)
     * @el   element
     * */
    closeAll: function(el) {
        this.close(this.element.find('.ui-collapsible'));
    },

    /* Opens a collapsible container
     * @el   element
     * */
    open: function(el) {
        return el.addClass('ui-collapsible-opened')
          .removeClass('ui-collapsible-closed');
    },

    /* Closes a collapsible container
     * @el   element
     * */
    close: function(el) {
        return el.removeClass('ui-collapsible-opened')
          .addClass('ui-collapsible-closed');
    }
});

$.extend($.ui.gCollapsible, {
    autoSelector: '.ui-collapsible, ui-collapsible-open',
    defaults: {}
});
})(jQuery);
 // jslinted - 8 Jan 2010
 
(function($){

    var LATIN_MAP = {
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç':
        'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I',
        'Ï': 'I', 'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö':
        'O', 'Ő': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ű': 'U',
        'Ý': 'Y', 'Þ': 'TH', 'ß': 'ss', 'à':'a', 'á':'a', 'â': 'a', 'ã': 'a', 'ä':
        'a', 'å': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó':
        'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ő': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u',
        'û': 'u', 'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y'
    };
    var LATIN_SYMBOLS_MAP = {
        '©':'(c)'
    };
    var GREEK_MAP = {
        'α':'a', 'β':'b', 'γ':'g', 'δ':'d', 'ε':'e', 'ζ':'z', 'η':'h', 'θ':'8',
        'ι':'i', 'κ':'k', 'λ':'l', 'μ':'m', 'ν':'n', 'ξ':'3', 'ο':'o', 'π':'p',
        'ρ':'r', 'σ':'s', 'τ':'t', 'υ':'y', 'φ':'f', 'χ':'x', 'ψ':'ps', 'ω':'w',
        'ά':'a', 'έ':'e', 'ί':'i', 'ό':'o', 'ύ':'y', 'ή':'h', 'ώ':'w', 'ς':'s',
        'ϊ':'i', 'ΰ':'y', 'ϋ':'y', 'ΐ':'i',
        'Α':'A', 'Β':'B', 'Γ':'G', 'Δ':'D', 'Ε':'E', 'Ζ':'Z', 'Η':'H', 'Θ':'8',
        'Ι':'I', 'Κ':'K', 'Λ':'L', 'Μ':'M', 'Ν':'N', 'Ξ':'3', 'Ο':'O', 'Π':'P',
        'Ρ':'R', 'Σ':'S', 'Τ':'T', 'Υ':'Y', 'Φ':'F', 'Χ':'X', 'Ψ':'PS', 'Ω':'W',
        'Ά':'A', 'Έ':'E', 'Ί':'I', 'Ό':'O', 'Ύ':'Y', 'Ή':'H', 'Ώ':'W', 'Ϊ':'I',
        'Ϋ':'Y'
    };
    var TURKISH_MAP = {
        'ş':'s', 'Ş':'S', 'ı':'i', 'İ':'I', 'ç':'c', 'Ç':'C', 'ü':'u', 'Ü':'U',
        'ö':'o', 'Ö':'O', 'ğ':'g', 'Ğ':'G'
    };
    var RUSSIAN_MAP = {
        'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'yo', 'ж':'zh',
        'з':'z', 'и':'i', 'й':'j', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o',
        'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c',
        'ч':'ch', 'ш':'sh', 'щ':'sh', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'yu',
        'я':'ya',
        'А':'A', 'Б':'B', 'В':'V', 'Г':'G', 'Д':'D', 'Е':'E', 'Ё':'Yo', 'Ж':'Zh',
        'З':'Z', 'И':'I', 'Й':'J', 'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O',
        'П':'P', 'Р':'R', 'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Х':'H', 'Ц':'C',
        'Ч':'Ch', 'Ш':'Sh', 'Щ':'Sh', 'Ъ':'', 'Ы':'Y', 'Ь':'', 'Э':'E', 'Ю':'Yu',
        'Я':'Ya'
    };
    var UKRAINIAN_MAP = {
        'Є':'Ye', 'І':'I', 'Ї':'Yi', 'Ґ':'G', 'є':'ye', 'і':'i', 'ї':'yi', 'ґ':'g'
    };
    var CZECH_MAP = {
        'č':'c', 'ď':'d', 'ě':'e', 'ň': 'n', 'ř':'r', 'š':'s', 'ť':'t', 'ů':'u',
        'ž':'z', 'Č':'C', 'Ď':'D', 'Ě':'E', 'Ň': 'N', 'Ř':'R', 'Š':'S', 'Ť':'T',
        'Ů':'U', 'Ž':'Z'
    };
    var POLISH_MAP = {
        'ą':'a', 'ć':'c', 'ę':'e', 'ł':'l', 'ń':'n', 'ó':'o', 'ś':'s', 'ź':'z',
        'ż':'z', 'Ą':'A', 'Ć':'C', 'Ę':'e', 'Ł':'L', 'Ń':'N', 'Ó':'o', 'Ś':'S',
        'Ź':'Z', 'Ż':'Z'
    };
    var LATVIAN_MAP = {
        'ā':'a', 'č':'c', 'ē':'e', 'ģ':'g', 'ī':'i', 'ķ':'k', 'ļ':'l', 'ņ':'n',
        'š':'s', 'ū':'u', 'ž':'z', 'Ā':'A', 'Č':'C', 'Ē':'E', 'Ģ':'G', 'Ī':'i',
        'Ķ':'k', 'Ļ':'L', 'Ņ':'N', 'Š':'S', 'Ū':'u', 'Ž':'Z'
    };

    var ALL_DOWNCODE_MAPS = [];
    ALL_DOWNCODE_MAPS[0] = LATIN_MAP;
    ALL_DOWNCODE_MAPS[1] = LATIN_SYMBOLS_MAP;
    ALL_DOWNCODE_MAPS[2] = GREEK_MAP;
    ALL_DOWNCODE_MAPS[3] = TURKISH_MAP;
    ALL_DOWNCODE_MAPS[4] = RUSSIAN_MAP;
    ALL_DOWNCODE_MAPS[5] = UKRAINIAN_MAP;
    ALL_DOWNCODE_MAPS[6] = CZECH_MAP;
    ALL_DOWNCODE_MAPS[7] = POLISH_MAP;
    ALL_DOWNCODE_MAPS[8] = LATVIAN_MAP;

    var Downcoder = {};
    Downcoder.Initialize = function() {
        var c, y, x, lookup;
        if (Downcoder.map) { // already made
            return false;
        }
        Downcoder.map ={};
        Downcoder.chars = '';
        for(x =0; x < ALL_DOWNCODE_MAPS.length; x++) {
            lookup = ALL_DOWNCODE_MAPS[x];
            for (y =0; y < lookup.length;) {
                Downcoder.map[y] = lookup[y];
                Downcoder.chars += c;
            }
         }
        Downcoder.regex = new RegExp('[' + Downcoder.chars + ']|[^' + Downcoder.chars + ']+','g');
    };

    var downcode = function(slug) {
        Downcoder.Initialize();
        var downcoded = "";
        var pieces = slug.match(Downcoder.regex);
        if(pieces) {
            for (var i = 0 ; i < pieces.length ; i++) {
                if (pieces[i].length == 1) {
                    var mapped = Downcoder.map[pieces[i]];
                    if (mapped !== null) {
                        downcoded += mapped;
                        continue;
                    }
                }
                downcoded += pieces[i];
            }
        }
        else {
            downcoded = slug;
        }
        return downcoded;
    };

    var slugify = function(str, num_chars) {
        var s, r, removelist;
        // changes, e.g., "Petty theft" to "petty_theft"
        // remove all these words from the string before slugifying
        s = downcode(str);
        removelist = ["a", "an", "as", "at", "before", "but", "by", "for", "from",
                          "is", "in", "into", "like", "of", "off", "on", "onto", "per",
                          "since", "than", "the", "this", "that", "to", "up", "via",
                          "with"];
        r = new RegExp('\\b(' + removelist.join('|') + ')\\b', 'gi');
        s = s.replace(r, '');
        // if downcode doesn't hit, the char will be stripped here
        s = s.replace(/[^\-\w\s]/g, '');  // remove unneeded chars
        s = s.replace(/^\s+|\s+$/g, ''); // trim leading/trailing spaces
        s = s.replace(/[\-\s]+/g, '-');   // convert spaces to hyphens
        s = s.toLowerCase();             // convert to lowercase
        return s.substring(0, num_chars || 255);// trim to first num_chars chars
    };
    $.slugify = function(){
        return slugify.apply(this, arguments);
    };
    $.fn.slugify = function(text, length) {
        if ($(this).is(':input')) {
            $(this).val($.slugify($(this).val()));
        }
        else {
            $(this).text($.slugify($(this).text()));
        }
    };

})(jQuery);
/*
  jQuery strings - 0.4
  http://code.google.com/p/jquery-utils/
  
  (c) Maxime Haineault <haineault@gmail.com>
  http://haineault.com   

  MIT License (http://www.opensource.org/licenses/mit-license.php)

  Implementation of Python3K advanced string formatting
  http://www.python.org/dev/peps/pep-3101/

  Documentation: http://code.google.com/p/jquery-utils/wiki/StringFormat
  
*/
(function($){
    var strings = {
        strConversion: {
            // tries to translate any objects type into string gracefully
            __repr: function(i){
                switch(this.__getType(i)) {
                    case 'array':case 'date':case 'number':
                        return i.toString();
                    case 'object': // Thanks to Richard Paul Lewis for the fix
                        var o = []; 
                        var l = i.length;
                        for(var x=0;x<l;x++) {
                          o.push(x+': '+this.__repr(i[x]));
                        } 
                        return o.join(', ');                        
                    case 'string': 
                        return i;
                    default: 
                        return i;
                }
            },
            // like typeof but less vague
            __getType: function(i) {
                if (!i || !i.constructor) { return typeof(i); }
                var match = i.constructor.toString().match(/Array|Number|String|Object|Date/);
                return match && match[0].toLowerCase() || typeof(i);
            },
            // Jonas Raoni Soares Silva (http://jsfromhell.com/string/pad)
            __pad: function(str, l, s, t){
                var p = s || ' ';
                var o = str;
                if (l - str.length > 0) {
                    o = new Array(Math.ceil(l / p.length)).join(p).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2)) + str + p.substr(0, l - t);
                }
                return o;
            },
            __getInput: function(arg, args) {
                 var key = arg.getKey();
                switch(this.__getType(args)){
                    case 'object': // Thanks to Jonathan Works for the patch
                        var keys = key.split('.');
                        var obj = args;
                        for(var subkey = 0; subkey < keys.length; subkey++){
                            obj = obj[keys[subkey]];
                        }
                        if (typeof(obj) != 'undefined') {
                            if (strings.strConversion.__getType(obj) == 'array') {
                                return arg.getFormat().match(/\.\*/) && obj[1] || obj;
                            }
                            return obj;
                        }
                        else {
                            // TODO: try by numerical index                    
                        }
                    break;
                    case 'array': 
                        key = parseInt(key, 10);
                        if (arg.getFormat().match(/\.\*/) && typeof args[key+1] != 'undefined') { return args[key+1]; }
                        else if (typeof args[key] != 'undefined') { return args[key]; }
                        else { return key; }
                    break;
                }
                return '{'+key+'}';
            },
            __formatToken: function(token, args) {
                var arg   = new Argument(token, args);
                return strings.strConversion[arg.getFormat().slice(-1)](this.__getInput(arg, args), arg);
            },

            // Signed integer decimal.
            d: function(input, arg){
                var o = parseInt(input, 10); // enforce base 10
                var p = arg.getPaddingLength();
                if (p) { return this.__pad(o.toString(), p, arg.getPaddingString(), 0); }
                else   { return o; }
            },
            // Signed integer decimal.
            i: function(input, args){ 
                return this.d(input, args);
            },
            // Unsigned octal
            o: function(input, arg){ 
                var o = input.toString(8);
                if (arg.isAlternate()) { o = this.__pad(o, o.length+1, '0', 0); }
                return this.__pad(o, arg.getPaddingLength(), arg.getPaddingString(), 0);
            },
            // Unsigned decimal
            u: function(input, args) {
                return Math.abs(this.d(input, args));
            },
            // Unsigned hexadecimal (lowercase)
            x: function(input, arg){
                var o = parseInt(input, 10).toString(16);
                o = this.__pad(o, arg.getPaddingLength(), arg.getPaddingString(),0);
                return arg.isAlternate() ? '0x'+o : o;
            },
            // Unsigned hexadecimal (uppercase)
            X: function(input, arg){
                return this.x(input, arg).toUpperCase();
            },
            // Floating point exponential format (lowercase)
            e: function(input, arg){
                return parseFloat(input, 10).toExponential(arg.getPrecision());
            },
            // Floating point exponential format (uppercase)
            E: function(input, arg){
                return this.e(input, arg).toUpperCase();
            },
            // Floating point decimal format
            f: function(input, arg){
                return this.__pad(parseFloat(input, 10).toFixed(arg.getPrecision()), arg.getPaddingLength(), arg.getPaddingString(),0);
            },
            // Floating point decimal format (alias)
            F: function(input, args){
                return this.f(input, args);
            },
            // Floating point format. Uses exponential format if exponent is greater than -4 or less than precision, decimal format otherwise
            g: function(input, arg){
                var o = parseFloat(input, 10);
                return (o.toString().length > 6) ? Math.round(o.toExponential(arg.getPrecision())): o;
            },
            // Floating point format. Uses exponential format if exponent is greater than -4 or less than precision, decimal format otherwise
            G: function(input, args){
                return this.g(input, args);
            },
            // Single character (accepts integer or single character string). 	
            c: function(input, args) {
                var match = input.match(/\w|\d/);
                return match && match[0] || '';
            },
            // String (converts any JavaScript object to anotated format)
            r: function(input, args) {
                return this.__repr(input);
            },
            // String (converts any JavaScript object using object.toString())
            s: function(input, args) {
                return input.toString && input.toString() || ''+input;
            }
        },

        format: function(str, args) {
            var end    = 0;
            var start  = 0;
            var match  = false;
            var buffer = [];
            var token  = '';
            var tmp    = (str||'').split('');
            for(start=0; start < tmp.length; start++) {
                if (tmp[start] == '{' && tmp[start+1] !='{') {
                    end   = str.indexOf('}', start);
                    token = tmp.slice(start+1, end).join('');
                    if (tmp[start-1] != '{' && tmp[end+1] != '}') {
                        var tokenArgs = (typeof arguments[1] != 'object')? arguments2Array(arguments, 2): args || [];
                        buffer.push(strings.strConversion.__formatToken(token, tokenArgs));
                    }
                    else {
                        buffer.push(token);
                    }
                }
                else if (start > end || buffer.length < 1) { buffer.push(tmp[start]); }
            }
            return (buffer.length > 1)? buffer.join(''): buffer[0];
        },

        calc: function(str, args) {
            return eval(format(str, args));
        },

        repeat: function(s, n) { 
            return new Array(n+1).join(s); 
        },

        UTF8encode: function(s) { 
            return unescape(encodeURIComponent(s)); 
        },

        UTF8decode: function(s) { 
            return decodeURIComponent(escape(s)); 
        },

        tpl: function() {
            var out = '';
            var render = true;
            // Set
            // $.tpl('ui.test', ['<span>', helloWorld ,'</span>']);
            if (arguments.length == 2 && $.isArray(arguments[1])) {
                this[arguments[0]] = arguments[1].join('');
                return $(this[arguments[0]]);
            }
            // $.tpl('ui.test', '<span>hello world</span>');
            if (arguments.length == 2 && $.isString(arguments[1])) {
                this[arguments[0]] = arguments[1];
                return $(this[arguments[0]]);
            }
            // Call
            // $.tpl('ui.test');
            if (arguments.length == 1) {
                return $(this[arguments[0]]);
            }
            // $.tpl('ui.test', false);
            if (arguments.length == 2 && arguments[1] == false) {
                return this[arguments[0]];
            }
            // $.tpl('ui.test', {value:blah});
            if (arguments.length == 2 && $.isObject(arguments[1])) {
                return $($.format(this[arguments[0]], arguments[1]));
            }
            // $.tpl('ui.test', {value:blah}, false);
            if (arguments.length == 3 && $.isObject(arguments[1])) {
                return (arguments[2] == true) 
                    ? $.format(this[arguments[0]], arguments[1])
                    : $($.format(this[arguments[0]], arguments[1]));
            }
        }
    };

    var Argument = function(arg, args) {
        this.__arg  = arg;
        this.__args = args;
        this.__max_precision = parseFloat('1.'+ (new Array(32)).join('1'), 10).toString().length-3;
        this.__def_precision = 6;
        this.getString = function(){
            return this.__arg;
        };
        this.getKey = function(){
            return this.__arg.split(':')[0];
        };
        this.getFormat = function(){
            var match = this.getString().split(':');
            return (match && match[1])? match[1]: 's';
        };
        this.getPrecision = function(){
            var match = this.getFormat().match(/\.(\d+|\*)/g);
            if (!match) { return this.__def_precision; }
            else {
                match = match[0].slice(1);
                if (match != '*') { return parseInt(match, 10); }
                else if(strings.strConversion.__getType(this.__args) == 'array') {
                    return this.__args[1] && this.__args[0] || this.__def_precision;
                }
                else if(strings.strConversion.__getType(this.__args) == 'object') {
                    return this.__args[this.getKey()] && this.__args[this.getKey()][0] || this.__def_precision;
                }
                else { return this.__def_precision; }
            }
        };
        this.getPaddingLength = function(){
            var match = false;
            if (this.isAlternate()) {
                match = this.getString().match(/0?#0?(\d+)/);
                if (match && match[1]) { return parseInt(match[1], 10); }
            }
            match = this.getString().match(/(0|\.)(\d+|\*)/g);
            return match && parseInt(match[0].slice(1), 10) || 0;
        };
        this.getPaddingString = function(){
            var o = '';
            if (this.isAlternate()) { o = ' '; }
            // 0 take precedence on alternate format
            if (this.getFormat().match(/#0|0#|^0|\.\d+/)) { o = '0'; }
            return o;
        };
        this.getFlags = function(){
            var match = this.getString().matc(/^(0|\#|\-|\+|\s)+/);
            return match && match[0].split('') || [];
        };
        this.isAlternate = function() {
            return !!this.getFormat().match(/^0?#/);
        };
    };

    var arguments2Array = function(args, shift) {
        var o = [];
        for (l=args.length, x=(shift || 0)-1; x<l;x++) { o.push(args[x]); }
        return o;
    };
    $.extend(strings);
})(jQuery);
/*
 * Copyright (c) 2007-2008 Josh Bush (digitalbush.com)
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE. 
 */
 
/*
 * Version: 1.1.3
 * Release: 2008-04-16
 */ 
(function($) {

	//Helper Function for Caret positioning
	$.fn.caret=function(begin,end){	
		if(this.length==0) return;
		if (typeof begin == 'number') {
            end = (typeof end == 'number')?end:begin;  
			return this.each(function(){
				if(this.setSelectionRange){
					this.focus();
					this.setSelectionRange(begin,end);
				}else if (this.createTextRange){
					var range = this.createTextRange();
					range.collapse(true);
					range.moveEnd('character', end);
					range.moveStart('character', begin);
					range.select();
				}
			});
        } else {
            if (this[0].setSelectionRange){
				begin = this[0].selectionStart;
				end = this[0].selectionEnd;
			}else if (document.selection && document.selection.createRange){
				var range = document.selection.createRange();			
				begin = 0 - range.duplicate().moveStart('character', -100000);
				end = begin + range.text.length;
			}
			return {begin:begin,end:end};
        }       
	};

	//Predefined character definitions
	var charMap={
		'9':"[0-9]",
		'a':"[A-Za-z]",
		'*':"[A-Za-z0-9]"
	};
	
	//Helper method to inject character definitions
	$.mask={
		addPlaceholder : function(c,r){
			charMap[c]=r;
		}
	};
	
	$.fn.unmask=function(){
		return this.trigger("unmask");
	};
	
	//Main Method
	$.fn.mask = function(mask,settings) {	
		settings = $.extend({
			placeholder: "_",			
			completed: null
		}, settings);		
		
		//Build Regex for format validation
		var re = new RegExp("^"+	
		$.map( mask.split(""), function(c,i){		  		  
		  return charMap[c]||((/[A-Za-z0-9]/.test(c)?"":"\\")+c);
		}).join('')+				
		"$");		

		return this.each(function(){		
			var input=$(this);
			var buffer=new Array(mask.length);
			var locked=new Array(mask.length);
			var valid=false;   
			var ignore=false;  			//Variable for ignoring control keys
			var firstNonMaskPos=null; 
			
			//Build buffer layout from mask & determine the first non masked character			
			$.each( mask.split(""), function(i,c){				
				locked[i]=(charMap[c]==null);				
				buffer[i]=locked[i]?c:settings.placeholder;									
				if(!locked[i] && firstNonMaskPos==null)
					firstNonMaskPos=i;
			});		
			
			function focusEvent(){					
				checkVal();
				writeBuffer();
				setTimeout(function(){
					$(input[0]).caret(valid?mask.length:firstNonMaskPos);					
				},0);
			};
			
			function keydownEvent(e){				
				var pos=$(this).caret();
				var k = e.keyCode;
				ignore=(k < 16 || (k > 16 && k < 32 ) || (k > 32 && k < 41));
				
				//delete selection before proceeding
				if((pos.begin-pos.end)!=0 && (!ignore || k==8 || k==46)){
					clearBuffer(pos.begin,pos.end);
				}	
				//backspace and delete get special treatment
				if(k==8){//backspace					
					while(pos.begin-->=0){
						if(!locked[pos.begin]){								
							buffer[pos.begin]=settings.placeholder;
							if($.browser.opera){
								//Opera won't let you cancel the backspace, so we'll let it backspace over a dummy character.								
								s=writeBuffer();
								input.val(s.substring(0,pos.begin)+" "+s.substring(pos.begin));
								$(this).caret(pos.begin+1);								
							}else{
								writeBuffer();
								$(this).caret(Math.max(firstNonMaskPos,pos.begin));								
							}									
							return false;								
						}
					}						
				}else if(k==46){//delete
					clearBuffer(pos.begin,pos.begin+1);
					writeBuffer();
					$(this).caret(Math.max(firstNonMaskPos,pos.begin));					
					return false;
				}else if (k==27){//escape
					clearBuffer(0,mask.length);
					writeBuffer();
					$(this).caret(firstNonMaskPos);					
					return false;
				}									
			};
			
			function keypressEvent(e){					
				if(ignore){
					ignore=false;
					//Fixes Mac FF bug on backspace
					return (e.keyCode == 8)? false: null;
				}
				e=e||window.event;
				var k=e.charCode||e.keyCode||e.which;						
				var pos=$(this).caret();
								
				if(e.ctrlKey || e.altKey){//Ignore
					return true;
				}else if ((k>=41 && k<=122) ||k==32 || k>186){//typeable characters
					var p=seekNext(pos.begin-1);					
					if(p<mask.length){
						if(new RegExp(charMap[mask.charAt(p)]).test(String.fromCharCode(k))){
							buffer[p]=String.fromCharCode(k);									
							writeBuffer();
							var next=seekNext(p);
							$(this).caret(next);
							if(settings.completed && next == mask.length)
								settings.completed.call(input);
						}				
					}
				}				
				return false;				
			};
			
			function clearBuffer(start,end){
				for(var i=start;i<end&&i<mask.length;i++){
					if(!locked[i])
						buffer[i]=settings.placeholder;
				}				
			};
			
			function writeBuffer(){				
				return input.val(buffer.join('')).val();				
			};
			
			function checkVal(){	
				//try to place charcters where they belong
				var test=input.val();
				var pos=0;
				for(var i=0;i<mask.length;i++){					
					if(!locked[i]){
						buffer[i]=settings.placeholder;
						while(pos++<test.length){
							//Regex Test each char here.
							var reChar=new RegExp(charMap[mask.charAt(i)]);
							if(test.charAt(pos-1).match(reChar)){
								buffer[i]=test.charAt(pos-1);								
								break;
							}									
						}
					}
				}
				var s=writeBuffer();
				if(!s.match(re)){							
					input.val("");	
					clearBuffer(0,mask.length);
					valid=false;
				}else
					valid=true;
			};
			
			function seekNext(pos){				
				while(++pos<mask.length){					
					if(!locked[pos])
						return pos;
				}
				return mask.length;
			};
			
			input.one("unmask",function(){
				input.unbind("focus",focusEvent);
				input.unbind("blur",checkVal);
				input.unbind("keydown",keydownEvent);
				input.unbind("keypress",keypressEvent);
				if ($.browser.msie) 
					this.onpaste= null;                     
				else if ($.browser.mozilla)
					this.removeEventListener('input',checkVal,false);
			});
			input.bind("focus",focusEvent);
			input.bind("blur",checkVal);
			input.bind("keydown",keydownEvent);
			input.bind("keypress",keypressEvent);
			//Paste events for IE and Mozilla thanks to Kristinn Sigmundsson
			if ($.browser.msie) 
				this.onpaste= function(){setTimeout(checkVal,0);};                     
			else if ($.browser.mozilla)
				this.addEventListener('input',checkVal,false);
				
			checkVal();//Perform initial check for existing values
		});
	};
})(jQuery);
/*
 jQuery delayed observer - 0.8
 http://code.google.com/p/jquery-utils/

 (c) Maxime Haineault <haineault@gmail.com>
 http://haineault.com
 
 MIT License (http://www.opensource.org/licenses/mit-license.php)
 
*/

(function($){
    $.extend($.fn, {
        delayedObserver: function(callback, delay, options){
            return this.each(function(){
                var el = $(this);
                var op = options || {};
                el.data('oldval', el.val())
                    .data('condition', op.condition || function() { return ($(this).data('oldval') == $(this).val()); })
                    [(op.event||'keyup')](function(e){
                        if (el.data('condition').apply(el)) { return; }
                        else {
                            if (el.data('timer')) { clearTimeout(el.data('timer')); }
                            el.data('timer', setTimeout(function(){
                                callback.apply(el, [e]);
                            }, (delay || 0.5) * 1000));
                            el.data('oldval', el.val());
                        }
                    });
            });
        }
    });
})(jQuery);
/*
 * Metadata - jQuery plugin for parsing metadata from elements
 *
 * Copyright (c) 2006 John Resig, Yehuda Katz, J�örn Zaefferer, Paul McLanahan
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.metadata.js 3640 2007-10-11 18:34:38Z pmclanahan $
 *
 */

/**
 * Sets the type of metadata to use. Metadata is encoded in JSON, and each property
 * in the JSON will become a property of the element itself.
 *
 * There are four supported types of metadata storage:
 *
 *   attr:  Inside an attribute. The name parameter indicates *which* attribute.
 *          
 *   class: Inside the class attribute, wrapped in curly braces: { }
 *   
 *   elem:  Inside a child element (e.g. a script tag). The
 *          name parameter indicates *which* element.
 *   html5: Values are stored in data-* attributes.
 *          
 * The metadata for an element is loaded the first time the element is accessed via jQuery.
 *
 * As a result, you can define the metadata type, use $(expr) to load the metadata into the elements
 * matched by expr, then redefine the metadata type and run another $(expr) for other elements.
 * 
 * @name $.metadata.setType
 *
 * @example <p id="one" class="some_class {item_id: 1, item_label: 'Label'}">This is a p</p>
 * @before $.metadata.setType("class")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from the class attribute
 * 
 * @example <p id="one" class="some_class" data="{item_id: 1, item_label: 'Label'}">This is a p</p>
 * @before $.metadata.setType("attr", "data")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a "data" attribute
 * 
 * @example <p id="one" class="some_class"><script>{item_id: 1, item_label: 'Label'}</script>This is a p</p>
 * @before $.metadata.setType("elem", "script")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a nested script element
 * 
 * @example <p id="one" class="some_class" data-item_id="1" data-item_label="Label">This is a p</p>
 * @before $.metadata.setType("html5")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a series of data-* attributes
 *
 * @param String type The encoding type
 * @param String name The name of the attribute to be used to get metadata (optional)
 * @cat Plugins/Metadata
 * @descr Sets the type of encoding to be used when loading metadata for the first time
 * @type undefined
 * @see metadata()
 */

(function($) {

$.extend({
  metadata : {
    defaults : {
      type: 'class',
      name: 'metadata',
      cre: /({.*})/,
      single: 'metadata'
    },
    setType: function( type, name ){
      this.defaults.type = type;
      this.defaults.name = name;
    },
    get: function( elem, opts ){
      var settings = $.extend({},this.defaults,opts);
      // check for empty string in single property
      if ( !settings.single.length ) settings.single = 'metadata';
      
      var data = $.data(elem, settings.single);
      // returned cached data if it already exists
      if ( data ) return data;
      
      data = "{}";
      
      var getData = function(data) {
        if(typeof data != "string") return data;
        
        if( data.indexOf('{') < 0 ) {
          data = eval("(" + data + ")");
        }
      }
      
      var getObject = function(data) {
        if(typeof data != "string") return data;
        
        data = eval("(" + data + ")");
        return data;
      }
      
      if ( settings.type == "html5" ) {
        var object = {};
        $( elem.attributes ).each(function() {
          var name = this.nodeName;
          if(name.match(/^data-/)) name = name.replace(/^data-/, '');
          else return true;
          object[name] = getObject(this.nodeValue);
        });
      } else {
        if ( settings.type == "class" ) {
          var m = settings.cre.exec( elem.className );
          if ( m )
            data = m[1];
        } else if ( settings.type == "elem" ) {
          if( !elem.getElementsByTagName ) return;
          var e = elem.getElementsByTagName(settings.name);
          if ( e.length )
            data = $.trim(e[0].innerHTML);
        } else if ( elem.getAttribute != undefined ) {
          var attr = elem.getAttribute( settings.name );
          if ( attr )
            data = attr;
        }
        object = getObject(data.indexOf("{") < 0 ? "{" + data + "}" : data);
      }
      
      $.data( elem, settings.single, object );
      return object;
    }
  }
});

/**
 * Returns the metadata object for the first member of the jQuery object.
 *
 * @name metadata
 * @descr Returns element's metadata object
 * @param Object opts An object contianing settings to override the defaults
 * @type jQuery
 * @cat Plugins/Metadata
 */
$.fn.metadata = function( opts ){
  return $.metadata.get( this[0], opts );
};

})(jQuery);