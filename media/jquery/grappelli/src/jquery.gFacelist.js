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
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            input:    ui._createElement('input',{ns: 'search'})
                        .addClass('vM2MAutocompleteSearchField'), 
            browse:  ui._createElement('button',     {ns: 'browse', attr:{href: ui.options.related_url, title: 'Browse'}}) 
        };
        
        ui.dom.rawfield.val(ui.dom.rawfield.val().replace(/\[|\]/g, ''));
        ui.dom.wrapper.append(ui.dom.input, ui.dom.facelist).insertAfter(ui.element);

        if (ui.options.browse) {
            ui.dom.browse.insertAfter(ui.dom.input)
                .bind('click.browse', function(){
                    return ui._browse(this); 
                });
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
                ui._message();
            }
        });

        // load initial data
        if (ui.options.initial_data) {
            $.each(ui.options.initial_data, function(k, v) {
                ui._addItem({label:v, id: k});
            });
            ui._message();
        }
        // TODO: find out proper css fix
        ui.element.parent().find('.add-another').css('margin-top', '-24px').css('margin-left', '6px');
    },

    addVal: function (i) {
        this._addItem(i);
        this._message();
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
        var ui, cnt;
        var ui = this;
        if (ui.options.message) {
            if (!msg) {
                cnt = ui.dom.facelist.find('.ui-gFacelist-item').length;
                msg = $.format(ui.options.messageFormat[cnt > 1 && 1 || 0], cnt);
            }
            //ui.dom.message.html(msg);
            return msg;
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
                });

            if (ui.options.message) {
                button.hover(function() {
                    ui._message($.format(ui.options.hoverFormat, $(this).text()));
                }, function() {
                    ui._message();
                });
            }

            ui._addId(data.id);
            ui.dom.ac.val('');
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
    // functional options
    browse:   true,
    message:  true,
    messageFormat: ['<b>{0:d}</b> selected item', '<b>{0:d}</b> selected items'],
    hoverFormat:   'Click to remove <b>{0:s}</b>',
    noItemFormat:  'No item selected',
    autocomplete: {
        highlight:  true,
        browse:     false, // Using Autocomplete's browse becomes too messy ..
        throbber:   false,
        minChars:   1,
        maxResults: 20,
    }
};

})(jQuery);
