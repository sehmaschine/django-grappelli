$.widget('ui.gRelated', {
    _url: function(k) {
        return this.options.getURL(k);
    },
    _browse: function(link) {
        var link = $(link);
        // IE doesn't like periods in the window name, so convert temporarily.
        var name = link.data('id').replace(/\./g, '___'); 
        var href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        this._win = $.popup(name, href, {
                    height: 600 , width: 920, resizable: true, scrollbars: true});
        return false;
    },
    _init: function(){
        var ui = this;

        ui.dom = {
            object_id:    ui.element,
            content_type: $('#'+ ui.element.attr('id').replace('object_id', 'content_type')),
            link: $('<a class="related-lookup" />'),
            text: $('<strong />'),
        };

        ui.dom.content_type.bind('change.gRelated, keyup.gRelated', function() {
            var $el = $(this);
            var href = ui._url($el.val());
            ui.dom.object_id.val('');
            ui.dom.text.text('');
            if ($el.val()) {
                var link = ui.dom.object_id.next('.related-lookup');
                if (link.get(0)) {
                    link.attr('href', href);
                }
                else {
                    ui.dom.link.insertAfter(ui.dom.object_id)
                        .after(ui.dom.text)
                        .bind('click.gRelated', function(e){
                            e.preventDefault();
                            return ui._browse(this);
                        })
                        .data('id', ui.dom.object_id.attr('id'))
                        .attr({id: 'lookup_'+ ui.dom.object_id.attr('id'), href: href});
                }
            } 
            else {
                ui.dom.object_id.val('');
                ui.dom.object_id.parent().find('.related-lookup, strong').remove();
            }
        });

        ui.dom.object_id.bind('keyup.gRelated focus.gRelated', function(e){
            ui._relatedLookup(e);
        });
    },
    _relatedLookup: function(e){
        var ui   = this;
        var text = ui.dom.text;
        var app_label  = ui.dom.link.attr('href').split('/')[2];
        var model_name = ui.dom.link.attr('href').split('/')[3];
        
        ui.dom.text.text('loading ...');
        
        // get object
        $.get(ui.options.url, {object_id: ui.dom.object_id.val(), app_label: app_label, model_name: model_name}, function(data) {
            var item = data;
            ui.dom.text.text('');
            if (item) {
                var tl = (ui.options.maxTextLength - ui.options.maxTextSuffix.length);
                if (item.length > tl) {
                    var txt = decodeURI(item.substr(0, tl) + ui.options.maxTextSuffix);
                    ui.dom.text.text(txt);
                } else {
                    ui.dom.text.text(decodeURI(item));
                }
            }
        });
    },
    _m2mLookup: function(obj){},
});

$.ui.gRelated.defaults = {
    maxTextLength: 32,
    maxTextSuffix: ' ...',
    url: '/grappelli/related_lookup/',
    m2mUrl: '/grappelli/related_lookup/',
    getURL: function(k) {
        return MODEL_URL_ARRAY[k] && ADMIN_URL + MODEL_URL_ARRAY[k]  +'/?t=id' || '';
    }
};


function dismissRelatedLookupPopup(win, id) {
    var el = $('#'+ win.name.replace(/___/g, '.'));
    el.val((el.hasClass('vManyToManyRawIdAdminField') && el.val())? el.val() += ',' + id: id).focus();
    win.close();
}

function showAddAnotherPopup(link) {
    var link = $(link);
    var name = link.attr('id').replace(/^add_/, '').replace(/\./g, '___');
    var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + 'pop=1';
    win = $.popup(name, href, {height: 600 , width: 920, resizable: true, scrollbars: true});
    win.focus();
    return false;
}
function dismissAddAnotherPopup(win, newId, newRepr) {
    // newId and newRepr are expected to have previously been escaped by
    // django.utils.html.escape.
    console.log(newId, newRepr);
    newId = html_unescape(newId);
    newRepr = html_unescape(newRepr);
    var name = win.name.replace(/___/g, '.');
    var elem = $('#'+ name);
    if (elem) {
        if (elem.nodeName == 'SELECT') {
            var o = new Option(newRepr, newId);
            elem.options[elem.options.length] = o;
            o.selected = true;
        } else if (elem.nodeName == 'INPUT') {
            elem.value = newId;
        }
    } else {
        var toId = name + "_to";
        elem = $('#'+ toId);
        var o = new Option(newRepr, newId);
        SelectBox.add_to_cache(toId, o);
        SelectBox.redisplay(toId);
    }
    win.close();
}
  
$.unescapeHTML = function(str) {
    var div = $('<div />').html(str.replace(/<\/?[^>]+>/gi, ''));
    return div.get(0) ? div.text(): '';
};


/* changes
 * - max length of related lookup text now include the suffix ( ...)
 * - suffix ( ...) of related lookup text is now configurable (maxTextSuffix)
 * - max length of related lookup text is now configurable (maxTextLength)
 * - unescape now works on all characters instead of a limited subset
 *
 * */
