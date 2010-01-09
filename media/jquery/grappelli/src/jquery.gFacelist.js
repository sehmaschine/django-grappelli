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

        ui.element.hide().parent().find('p.help').remove();

        ui.dom = {
            rawfield: ui.element.parent().find('input.vM2MAutocompleteRawIdAdminField').hide(),
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}).width(700),
            toolbar:  ui._createElement('div',  {ns: 'toolbar'}).addClass('ui-corner-top ui-state-default'),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            input:    ui._createElement('input',{ns: 'search', attr: {maxlength: ui.options.searchMaxlength}})
                        .addClass('vM2MAutocompleteSearchField').width(100)
        };
        
        ui.dom.rawfield.val(ui.dom.rawfield.val().replace(/\[|\]/g, ''));
        ui.dom.input.wrap('<li />').parent().appendTo(ui.dom.facelist);
        ui.dom.wrapper.append(ui.dom.toolbar, ui.dom.facelist).insertAfter(ui.element);

        if (ui.options.browse) {
            ui.dom.browse = ui._button('browse', {href: ui.options.related_url, title: 'Browse'})
                .appendTo(ui.dom.toolbar)
                .bind('click.browse', function(){
                    return ui._browse(this); 
                });
        }
        if (ui.options.clear) {
            ui.dom.clear = ui._button('clear', {href: '#', title: 'Clear all'});
            ui.dom.toolbar.append(ui.dom.clear);
        }
        if (ui.options.message) {
            ui.dom.message = ui._createElement('span', {ns: 'message'}).text('No item selected');
            ui.dom.toolbar.append(ui.dom.message);
        }
        
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

        ui._bind(ui.dom.wrapper, 'click', function(e){ 
            if (!$(e.target).hasClass('ui-gAutocomplete-autocomplete')) {
                $(this).find('input').focus(); 
            }
        });
                          
        ui._bind(ui.dom.ac, 'keydown', function(e){
            if (e.keyCode == $.ui.keyCode.BACKSPACE && !ui.dom.ac.val().length) {
                ui.dom.input.parent().prev().remove();
            }
            else if ($.ui.keyCode.ENTER) {
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

    },

    addVal: function (i) {
        this._addItem(i);
    },

    _browse: function(l) {
        var link, href, wm;
        link = $(l);
        href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        wm   = $.wm(href, {height: 600 , width: 920, resizable: true, scrollbars: true});
        wm._data('element', this.element);
        wm.open();
        return false;
    },

    _message: function(msg) {
        var ui = this;
        if (!msg && ui.options.message) {
            var count = ui.dom.facelist.find('.ui-gFacelist-item').length;
            msg = count > 1 && '{0:d} selected items' || '{0:d} selected item';
            ui.dom.message.text($.format(msg, count));
        }
    },

    _removeItem: function (item) {
        var ui = this;
        var el = $(item);
        ui._removeId(el.data('json').id);
        el.remove();
        ui._message(); 
    },

    _addItem: function(data) {
        var ui = this;
        if (data.label != '') {
            var label = $('<span />').text(data.label);
            var button = ui._createElement('li', {ns: 'item'})
                    .html(label)
                    .data('json', data)
                    .addClass('ui-corner-all')
                    .insertBefore(ui.dom.input.parent())
                    .bind('click.gFacelist', function(){
                        ui._removeItem(this);
                    });
            ui._addId(data.id);
            ui.dom.ac.val('');
            ui._message(); 
            return button;
        }
    },

    _addId: function (id) {
        var ui, ids, stack;
        ui    = this;
        ids   = ui.dom.rawfield.val().split(',');
        stack = $.map(ids, function (v){ if (v != '') { return v; } });
        stack.push(id);
        ui.dom.rawfield.val(stack.join(','));
        return ui;
    },

    _removeId: function (id) {
        var ui, ids, stack;
        ui    = this;
        ids   = ui.dom.rawfield.val().replace(/\[|\]/g,'').split(',');
        stack = $.map(ids, function (v){ if (v != id) { return v; } });
        ui.dom.rawfield.val($.format('{0:s}', stack.join(',')));
        return ui;
    },

    _button: function(ns, attr) {
        var ui, el;
        ui = this;
        el = ui._createElement('a', {ns: ns, attr: attr || {} })
                .addClass('ui-state-default')
                .hover(function(){ $(this).addClass('ui-state-hover'); }, 
                       function(){ $(this).removeClass('ui-state-hover'); });
        if (ui.options.buttonIcon[ns]) {
            el.append('<span class="ui-icon ui-icon-'+ ui.options.buttonIcon[ns] +'">Add</span>');
        }
        return el;
    },

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

    _bind: function(element, eventName, callback) {
        var ui = this; 
        element.bind(eventName +'.'+ ui.widgetEventPrefix, function(e){
            return callback.apply(this, [e, ui]);
        });
    }

});

$.ui.gFacelist.defaults = {
    browse:   true,
    clearAll: true,
    message:  true,
    buttonIcon: { // see http://jqueryui.com/themeroller/ for available icons
        browse: 'search', 
        clear:  'closethick',
        add:    'plusthick'
    },
    autocomplete: {
        highlight:  true,
        browse:     false, // Using Autocomplete's browse becomes too messy ..
        throbber:   false,
        minChars:   1,
        maxResults: 20,
        width:      100
    }
};

})(jQuery);
