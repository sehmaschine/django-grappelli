$.widget('ui.gFacelist', {
    _init: function(){
        var ui = this;

        // erh.. jquery < 1.8 fix: http://dev.jqueryui.com/ticket/4366
        ui.options.autocomplete = $.extend($.ui.gFacelist.defaults.autocomplete, ui.options.autocomplete);

        ui.element.parent().find('p.help').remove();

        ui.dom = {
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}).width(700),
            toolbar:  ui._createElement('div',  {ns: 'toolbar'}).addClass('ui-corner-top ui-state-default'),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            input:    ui._createElement('input',{ns: 'search', attr: {maxlength: ui.options.searchMaxlength}})
                        .addClass('vM2MAutocompleteSearchField').width(100)
        };

        ui.dom.input.wrap('<li />').parent().appendTo(ui.dom.facelist);
        ui.dom.wrapper.append(ui.dom.toolbar, ui.dom.facelist).insertAfter(ui.element)

        if (ui.options.browse) {
            ui.dom.browse = ui._button('browse', {href: '#', title: 'Browse'}),
            ui.dom.toolbar.append(ui.dom.browse)
        }
        if (ui.options.clear) {
            ui.dom.clear = ui._button('clear', {href: '#', title: 'Clear all'}),
            ui.dom.toolbar.append(ui.dom.clear)
        }
        if (ui.options.message) {
            ui.dom.message = ui._createElement('span', {ns: 'message'}).text('No item selected');
            ui.dom.toolbar.append(ui.dom.message);
        }
        
        ui.dom.input.gAutocomplete(ui.options.autocomplete);
        ui.dom.ac = ui.dom.wrapper.find('.ui-gAutocomplete-autocomplete');
        ui.dom.ac
            .bind('focus.gFacelist', function(){ ui.dom.facelist.addClass('focus'); })
            .bind('blur.gFacelist',  function(){ ui.dom.facelist.removeClass('focus'); })

        ui._bind(ui.dom.wrapper, 'click', function(e){ 
            if (!$(e.target).hasClass('ui-gAutocomplete-autocomplete')) {
                $(this).find('input').focus(); 
            }
        });
                          
        ui._bind(ui.dom.ac, 'keydown', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.BACKSPACE:
                    if (!ui.dom.ac.val().length) {
                        ui.dom.input.parent().prev().remove();
                    }
                break;
                case $.ui.keyCode.ENTER:    
                    return false;
                break;
            }
        });

        ui._bind(ui.dom.ac, 'keyup', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.ESCAPE:   
                    ui.dom.ac.val(''); 
                break;
            }
        });
        ui._bind(ui.dom.input, 'complete', function(e){
            if (e.originalEvent.sticky) {
                ui._addItem(); 
                ui._message(); 
            }
        });

    },
    _message: function(msg) {
        var ui = this;
        if (!msg && ui.options.message) {
            var count = ui.dom.facelist.find('.ui-gFacelist-item').length;
            var msg = count > 1 && '{0:d} selected messages' || '{0:d} selected message';
            ui.dom.message.text($.format(msg, count));
        }
    },
    _addItem: function() {
        var ui = this;
        var val = ui.dom.ac.val();
        if (val != '') {
            var label = $('<span />').text(val);
            var button = ui._createElement('li', {ns: 'item'})
                    .html(label)
                    .addClass('ui-corner-all')
                    .bind('click.gFacelist', function(){
                        $(this).remove();
                    })
                    .insertBefore(ui.dom.input.parent());
            ui.dom.ac.val('');
            return button;
        }
    },
    _button: function(ns, attr) {
        var ui = this;
        var at = attr || {};
        var el = ui._createElement('a', {ns: ns, attr: attr })
                .addClass('ui-state-default')
                .hover(function(){ $(this).addClass('ui-state-hover'); }, 
                       function(){ $(this).removeClass('ui-state-hover'); });
        if (ui.options.buttonIcon[ns]) {
            el.append('<span class="ui-icon ui-icon-'+ ui.options.buttonIcon[ns] +'">Add</span>');
        }
        return el;
    },
    _createElement: function(type, options, innerHTML) {
        var ui = this;
        var el = $('<'+ type +' />');
        var op = options || {};
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
    },
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
        browse:     false,
        throbber:   false,
        minChars:   1,
        maxResults: 20,
        width:      100
    }
};

