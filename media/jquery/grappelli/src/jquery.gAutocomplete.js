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
            $(this).trigger($.Event({type:'keypress', keyCode: 9}));
        });
        ui.dom.input.insertAfter(ui.element.hide());
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
            ui.dom.input.css({marginLeft: '-22px', paddingLeft: '24px'}).width(w - 22)
                .bind('focus.browse', function(){ ui.dom.browse.addClass('focus'); })
                .bind('blur.browse',  function(){ ui.dom.browse.removeClass('focus'); });
            width = width - 23;
        }
        ui.dom.wrapper.width(width)
            .append(ui.dom.results)
            .insertAfter(ui.dom.input)
            .css({
                left: ui.dom.input.position().left, 
                position: 'absolute'
            });
        
        ui._bind(ui.dom.input, 'keypress', function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            var noCompletes = [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 8, 9];
            switch(kc) {
                case key.UP:     return ui._select('prev');
                case key.DOWN:   return ui._select('next');
                case key.ENTER:  return ui._choose();
                case key.ESCAPE: return ui._cancel();
                default:
                return true;
                break;
            }
        });
        ui.dom.input.delayedObserver(function(e){
            var kc = e.keyCode || 0;
            var key = $.ui.keyCode;
            var noCompletes = [106, 107, 108, 109, 110, 111, 13, 16, 17, 188, 190, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 9];
            //console.log(kc);
            switch(kc) {
                default:
                // Option: minChar
                if ($(this).val().length >= ui.options.minChars) { 
                    if ($.inArray(kc, noCompletes) < 0) {
                        ui._autocomplete();
                    }
                }
                return true;
                break;
            }
        }, ui.options.delay);

        //ui.dom.input.val('el').trigger('keypress');
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
    _select: function(which) {
        var ui = this;
        ui.dom.wrapper.show();
        var selected = ui.dom.results.find('li.selected');
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
    _autocomplete: function() {
        var ui  = this;
        var url = ui.options.backend +'?q='+ ui.dom.input.val();
        var lr  = ++ui._lastRequest;
        if (ui.options.maxResults) {
            url = url + '&limit='+ ui.options.maxResults;
        }
        ui.dom.wrapper.show();
        //ui.results.find('li:not(:contains('+ ui.dom.input.val() +'))').hide();
        $.getJSON(url, function(json, responseStatus){
            // process the request only if it's successful and it's the last sent (avoid race conditions)
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
        if (nonSticky) {
            ui.dom.input.data('sticky', ui.dom.input.val());
        }
        else {
            ui.element.val($(node).data('json').id);
            ui.dom.wrapper.hide();
        }
        return false;
    },
    _cancel: function() {
        var ui = this;
        ui.dom.results.find('.selected').removeClass('selected');
        ui.dom.wrapper.hide();
        if (ui.dom.input.data('sticky')) {
            ui.dom.input.val(ui.dom.input.data('sticky'));
            ui.dom.input.data('sticky', false);
        }
        ui.dom.wrapper.hide();
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
            ui.dom.wrapper.show();
            
            ui._bind(li, 'mouseover', function() { $(this).addClass('selected').siblings().removeClass('selected'); });
            ui._bind(li, 'click',     function() { 
                $(this).addClass('selected').siblings().removeClass('selected');
                ui._choose();
            });
        });
    }
});

$.ui.gAutocomplete.defaults = {
    highlight: true,
    browse:   true,
  //mustMatch: false,
  //matchContains: true,
  //cacheLength: 20,
    minChars: 2,
    delay:    0.5,
    browseIcon: 'search', // see http://jqueryui.com/themeroller/ for available icons
};

