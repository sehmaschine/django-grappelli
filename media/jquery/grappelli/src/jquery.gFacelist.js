$.widget('ui.gFacelist', {
    _init: function(){
        var ui = this;

        ui.dom = {
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}).width(700),
            toolbar:  ui._createElement('div',  {ns: 'toolbar'}).addClass('ui-corner-top ui-state-default'),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            browse:   ui._button('browse',      {href: '#', title: 'Browse'}),
            clear:    ui._button('clear',       {href: '#', title: 'Clear'}),
            add:      ui._button('add',         {href: '#', title: 'Add'}),
            message:  ui._createElement('span', {ns: 'message'}).text('No item selected'),
            input:    ui._createElement('input',{ns: 'search', attr: {maxlength: ui.options.searchMaxlength}}).addClass('vM2MAutocompleteSearchField').width(100)
        };

        ui.element.parent().find('p.help').remove();
        ui.dom.input.wrap('<li />').parent().appendTo(ui.dom.facelist);

        // Field focus logic
        ui._bind(ui.dom.input,   'focus', function(){ ui.dom.facelist.addClass('focus'); });
        ui._bind(ui.dom.input,   'blur',  function(){ ui.dom.facelist.removeClass('focus'); });
        ui._bind(ui.dom.wrapper, 'click', function(){ ui.dom.input.addClass('focus').focus(); });

        ui.dom.wrapper
            .append(ui.dom.toolbar)
            .append(ui.dom.facelist)
            .insertAfter(ui.element)

        ui.dom.toolbar
            .append(ui.dom.browse)
            .append(ui.dom.clear)
            .append(ui.dom.add)
            .append(ui.dom.message);
        
        ui._bind(ui.dom.input, 'keypress', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.ENTER:    
                    ui._addItem(); 
                break;
                case $.ui.keyCode.BACKSPACE:
                    if (!ui.dom.input.val().length) {
                        ui.dom.input.parent().prev().remove();
                    }
                break;
            }
        });

        ui._bind(ui.dom.input, 'keyup', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.ESCAPE:   
                    ui.dom.input.val(''); 
                break;
            }
        });

        ui.dom.input.gAutocomplete(ui.options.autocomplete)
    },
    _addItem: function() {
        var ui = this;
        var val = ui.dom.input.val();
        if (val != '') {
            var label = $('<span />').text(val);
            ui.dom.input.val('');
            return ui._createElement('li', {ns: 'item'})
                    .html(label)
                    .addClass('ui-corner-all')
                    .insertBefore(ui.dom.input.parent());
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
    minChars: 2,
    delay:    0.5,
    searchMaxlength: 10,
    buttonIcon: { // see http://jqueryui.com/themeroller/ for available icons
        browse: 'search', 
        clear:  'closethick',
        add:    'plusthick'
    }
};

