/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gFacelist
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gFacelist', {

    options: {
        autoSelector: 'input.ui-gFacelist',

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
    },

    _create: function(){
        var ui = this;
        
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
                ui.dom.wrapper.find('.ui-gAutocomplete-autocomplete');
                div.hide();
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

})(jQuery);
