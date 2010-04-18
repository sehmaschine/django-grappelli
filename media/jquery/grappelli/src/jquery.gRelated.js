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
            app_label  = ui.dom.link.attr('href').split('/').slice(-3,-2)[0];
            model_name = ui.dom.link.attr('href').split('/').slice(-2,-1)[0];
            if (ui.dom.object_id.val() == '') {
                ui.dom.text.text('');
            }
            else {
                ui.dom.text.text('loading ...');
                url = $.grappelli.conf.get((ui.dom.object_id.hasClass('vManyToManyRawIdAdminField') && 'm2m_related' || 'related') + '_url');
                $.get(url, {object_id: ui.dom.object_id.val(), app_label: app_label, model_name: model_name}, function(data, status) {
                    item = data;
                    if (item && status == 'success') {
                        tl = (ui.option('maxTextLength') - ui.option('maxTextSuffix').length);
                        if (item.length > tl) {
                            txt = decodeURI(item.substr(0, tl) + ui.option('maxTextSuffix'));
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

    options: $.extend($.RelatedDefaultsBase, {
        autoSelector: 'input.vForeignKeyRawIdAdminField, input.vManyToManyRawIdAdminField',
    }),

    _create: function() {
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

$.widget('ui.gGenericRelated', $.extend($.RelatedBase, {
    
    options: $.extend($.RelatedDefaultsBase, {
        autoSelector: 'input[name*="object_id"]'
    }),

    _create: function(){
        var ui = this;
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
            alert('test');
            var link = $(this);
            var name = link.attr('id').replace(/^add_/, '');
            var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + 'pop=1';
            var wm   = $.grappelli.window(href, {height: 600 , width: 980, resizable: true, scrollbars: true});
            wm._data('link', link);
            wm._data('id', name);
            wm.open(true);
            e.preventDefault();
            return false;
        });

    // small layout fix ..
    if ($.browser.mozilla) {
        $('a[onclick^=return\\ showRelatedObjectLookupPopup]').css('top', '-1px')
    }

    $('a[onclick^=return\\ showRelatedObjectLookupPopup]')
        .attr('onclick', false).unbind()
        .bind('click', function(e){
            var link = $(this);
            var name = link.attr('id').replace(/^add_/, '');
            var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + 'pop=1';
            var wm   = $.grappelli.window(href, {height: 600 , width: 980, resizable: true, scrollbars: true});
            wm._data('link', link);
            wm._data('id', name);
            wm.open(true);
            e.preventDefault();
            return false;
        });

    if (opener && /pop/.test(window.location.search)) {
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
