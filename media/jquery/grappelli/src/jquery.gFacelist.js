$.widget('ui.gFacelist', {
    _init: function(){
        var ui = this;

        // erh..
        ui.options.autocomplete = $.extend($.ui.gFacelist.defaults.autocomplete, ui.options.autocomplete);

        ui.dom = {
            wrapper:  ui._createElement('div',  {ns: 'wrapper'}).width(700),
            toolbar:  ui._createElement('div',  {ns: 'toolbar'}).addClass('ui-corner-top ui-state-default'),
            facelist: ui._createElement('ul',   {ns: 'facelist'}).addClass('ui-helper-clearfix'),
            browse:   ui._button('browse',      {href: '#', title: 'Browse'}),
            clear:    ui._button('clear',       {href: '#', title: 'Clear all'}),
            message:  ui._createElement('span', {ns: 'message'}).text('No item selected'),
            input:    ui._createElement('input',{ns: 'search', attr: {maxlength: ui.options.searchMaxlength}}).addClass('vM2MAutocompleteSearchField').width(100)
        };


        ui.element.parent().find('p.help').remove();
        ui.dom.input.wrap('<li />').parent().appendTo(ui.dom.facelist);

        ui.dom.wrapper
            .append(ui.dom.toolbar)
            .append(ui.dom.facelist)
            .insertAfter(ui.element)

        ui.dom.toolbar
            .append(ui.dom.browse)
            .append(ui.dom.clear)
            .append(ui.dom.message);
        
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
            }
        });

        ui._bind(ui.dom.ac, 'keyup', function(e){
            switch(e.keyCode) {
                case $.ui.keyCode.ENTER:    
                    ui._addItem(); 
                break;
                case $.ui.keyCode.ESCAPE:   
                    ui.dom.ac.val(''); 
                break;
            }
        });

    },
    _addItem: function() {
        var ui = this;
        var val = ui.dom.ac.val();
        if (val != '') {
            var label = $('<span />').text(val);
            ui.dom.ac.val('');
            return ui._createElement('li', {ns: 'item'})
                    .html(label)
                    .addClass('ui-corner-all')
                    .bind('click.gFacelist', function(){
                        $(this).remove();
                    })
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

