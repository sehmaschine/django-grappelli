/*  Author: Maxime Haineault <max@motion-m.ca>
 *  Package: Grappelli
 *
 *  Todo:
 *
 *   - Caching
 *
 *
 * */
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
    _init: function() {
        var ui = this;
        ui.dom = {
            wrapper: ui._createElement('div',   {ns: 'wrapper'}).addClass('ui-corner-bottom').hide(), 
            results: ui._createElement('ul',    {ns: 'results'}), 
            input:   ui._createElement('input', {ns: 'autocomplete', attr:{type: 'text'}}).addClass('vAutocompleteSearchField'), 
            browse:  ui._createElement('a',     {ns: 'browse', attr:{href: ui.options.related_url, title: 'Browse'}}).addClass('ui-corner-left ui-state-default')
                                                                .append('<span class="ui-icon ui-icon-'+ ui.options.browseIcon +'">Browse</span>'), 
        };
        //<a href="{{ related_url }}{{ url|safe }}" class="related-lookup" title="Browse"><span>Browse</span></a>
        ui.element.bind('focus', function(){
            ui.dom.input.focus();
        });
        ui.dom.input.insertAfter(ui.element.hide());
        if (ui.options.width) {
            ui.dom.input.width(ui.options.width)
        }
        var width = ui.dom.input.width() 
                        + parseInt(ui.dom.input.css('padding-left').slice(0, -2), 10) 
                        + parseInt(ui.dom.input.css('padding-right').slice(0, -2), 10);
        if (ui.options.browse) {
            var w = ui.dom.input.width();
            ui.dom.browse.insertBefore(ui.dom.input).attr('id', 'lookup_id_'+ ui.element.attr('id').slice(7))
                .hover(function(){ $(this).addClass('ui-state-hover'); }, function(){ $(this).removeClass('ui-state-hover'); })
                .bind('click.browse', function(){
                    return showRelatedObjectLookupPopup(this);      
                });
            ui.dom.input.css({marginLeft: '-22px', paddingLeft: '24px', width: w - 22 +'px'})
                .bind('focus.browse', function(){ ui.dom.browse.addClass('focus'); })
                .bind('blur.browse',  function(){ ui.dom.browse.removeClass('focus'); });
            width = width - 23;
        }
        ui.dom.wrapper
            .append(ui.dom.results)
            .insertAfter(ui.dom.input)
            .css({
                left: ui.dom.input.position().left, 
                position: 'absolute'
            }).width(width);
        
        ui._bind(ui.dom.input, 'keydown', function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            var noCompletes = [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 8, 9];
            switch(kc) {
                case key.UP:     return ui._select('prev'); break;
                case key.DOWN:   return ui._select('next'); break;
                case key.ENTER:  ui._choose(); e.preventDefault(); break;
                case key.ESCAPE: return ui._cancel(); break;
                default:
                return true;
                break;
            }
        });

        //ui._bind(ui.dom.input, 'blur', function(){ ui._hideList(); });
        ui.dom.input.delayedObserver(function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            var noCompletes = [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 9];
            switch(kc) {
                default:
                // Option: minChar
                if ($(this).val().length >= ui.options.minChars) { 
                    if ($.inArray(kc, noCompletes) < 0) {
                        ui._autocomplete();
                    }
                }
                else {
                    ui.dom.wrapper.hide();
                    ui._selected().removeClass('selected');
                }
                return true;
                break;
            }
        }, ui.options.delay);
    },
    _createElement: function(type, options) {
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
    _callback: function(e, ui) {
    },
    _hideList: function() {
        var ui = this;
        if (ui.dom.wrapper.is(':visible')){
            ui.dom.wrapper.hide();
            $('html').unbind('click.gAutocomplete');
        }
    },
    _showList: function(){
        var ui = this;
        if (ui.dom.wrapper.is(':hidden')){
            ui.dom.wrapper.show();
            $('html').bind('click.gAutocomplete', function(e){
                if (!$(e.target).hasClass('ui-gAutocomplete-autocomplete')) {
                    ui._hideList();
                }
            });
        }
    },
    _select: function(which) {
        var ui = this;
        ui._showList();
        var selected = ui._selected();
        if (selected.length > 0) {
            var li = selected.removeClass('selected')[(which == 'prev' && 'prevOrLast' || 'nextOrFirst')]();
        }
        else {
            var li = ui.dom.results.find((which == 'prev' && 'li:last-child' || 'li:first-child')).addClass('selected');
        }
        li.addClass('selected');
        ui._choose(true);
        return true;
    },
    _selected: function() {
        return this.dom.results.find('li.selected');
    },
    _autocomplete: function() {
        var ui  = this;
        var url = ui.options.backend +'?q='+ ui.dom.input.val();
        var lr  = ++ui._lastRequest;

        // Option: maxResults
        if (ui.options.maxResults) {
            url = url + '&limit='+ ui.options.maxResults;
        }
        // Option: throbber
        if (ui.options.throbber) {
            ui.dom.input.addClass('searching');
        }
        ui._showList();
        $.getJSON(url, function(json, responseStatus){
            // process the request only if it's successful and it's the last sent (avoid race conditions)
            ui.dom.input.removeClass('searching');
            if (responseStatus == 'success' && lr == ui._lastRequest) {
                ui._results = json;
                ui._redraw();
            }
        });
    },
    _choose: function(nonSticky) {
        var ui = this;
        var node = ui.dom.results.find('.selected');
        ui.dom.input.val($.format(ui.options.inputFormat, $(node).data('json')));
        console.log(node, nonSticky);
        if (nonSticky) {
            ui.dom.input.data('sticky', ui.dom.input.val());
        }
        else {
            console.log($(node).data('json'));
            ui.element.val($(node).data('json').id);
            ui._hideList();
        }
        ui.element.trigger($.Event({type: 'complete', sticky: !nonSticky}));
        return false;
    },
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
    _redraw: function() {
        var ui = this;
        var rs = ui.options.maxResults && ui._results.slice(0, ui.options.maxResults) || ui._results;
        ui.dom.results.empty();

        $.each(rs, function(){
            var txt = $.format(ui.options.listFormat, this);
            var li  = ui._createElement('li', {ns: 'result'}).data('json', this).appendTo(ui.dom.results)
            
            if (ui.options.highlight) {
                li.html(txt.replace(new RegExp("("+ ui.dom.input.val() +")", "gi"),'<b>$1</b>'));
            }
            
            ui.dom.results.find('.selected').removeClass('selected');
            ui._showList();
            
            ui._bind(li, 'mouseover', function() { $(this).addClass('selected').siblings().removeClass('selected'); });
            ui._bind(li, 'click', function() { 
                $(this).addClass('selected').siblings().removeClass('selected');
                console.log(this);
                ui._choose();
            });
        });
    }
});

$.ui.gAutocomplete.defaults = {
    highlight:  true,
    browse:     true,
    throbber:   true,
    delay:      0.5,
    minChars:   2,
    maxResults: 20,
    width:      false,
    browseIcon: 'search', // see http://jqueryui.com/themeroller/ for available icons
};

