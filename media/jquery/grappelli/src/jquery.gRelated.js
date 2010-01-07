/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 */
(function($){

// Abstract base class for gRelated and gGenericRelated

$.RelatedBase = {
    _url: function(k) {
        return this.options.getURL(k);
    },
    _disable: function(state) {
        this.dom.object_id.attr('disabled', state); 
    },

    // This method is called when the "Browse" button is clicked on
    // Related and GenericRelated fields
    _browse: function(link) {
        var link = $(link);
        var href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1';
        var wm   = $.wm(href, {height: 600 , width: 920, resizable: true, scrollbars: true});
        wm._data('element', link.prevAll('input:first'));
        wm.open();
        return false;
    },
    
    // This method is called when the object id field is changed and
    // it updates the label accordingly
    _lookup: function(e){
        var ui   = this;
        var text = ui.dom.text;
        if (ui.dom.link.attr('href')) {
            var app_label  = ui.dom.link.attr('href').split('/').slice(-3,-2);
            var model_name = ui.dom.link.attr('href').split('/').slice(-2,-1);

            if (ui.dom.object_id.val() == '') {
                ui.dom.text.text('');
            }
            else {
                ui.dom.text.text('loading ...');

                var url = ui.options[ui.dom.object_id.hasClass('vManyToManyRawIdAdminField') && 'm2mUrl' || 'url'];
                
                // get object
                $.get(url, {object_id: ui.dom.object_id.val(), app_label: app_label, model_name: model_name}, function(data) {
                    var item = data;
                    //ui.dom.text.text('');
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
            }
        }
    }
};

$.RelatedDefaultsBase = {
    maxTextLength: 32,
    maxTextSuffix: ' ...',
    url: '/grappelli/lookup/related/',
    m2mUrl: '/grappelli/lookup/m2m/',
    getURL: function(k) {
        return MODEL_URL_ARRAY[k] && ADMIN_URL + MODEL_URL_ARRAY[k]  +'/?t=id' || '';
    }
};


$.widget('ui.gRelated', $.extend($.RelatedBase, {
    _init: function() {
        var ui = this;
        ui.dom = {
            object_id: ui.element,
            text: $('<strong />')
        };
        
        ui.element.next('a').attr('onclick', false)
            .bind('click', function(e){
                e.preventDefault();
                return ui._browse(this);
            });
        ui.dom.link = ui.element.next('a');
        if (ui.element.nextAll('strong:first').get(0)) {
            ui.dom.text = ui.element.nextAll('strong:first') 
        }
        else {
            ui.dom.text.insertAfter(ui.dom.link);
        }
        ui.dom.object_id
            .bind('keyup.gRelated focus.gRelated', function(e){
                ui._lookup(e);
            });
    }
}));

$.ui.gRelated.defaults = $.RelatedDefaultsBase;

$.widget('ui.gGenericRelated', $.extend($.RelatedBase, {
    _init: function(){
        var ui = this;

        ui.dom = {
            object_id: ui.element,
            content_type: $('#'+ ui.element.attr('id').replace('object_id', 'content_type')),
            link: $('<a class="related-lookup" />'),
            text: $('<strong />')
        };

        ui._disable(!ui.dom.content_type.val());

        ui.dom.content_type.bind('change.gGenericRelated, keyup.gGenericRelated', function() {
            var $el = $(this);
            var href = ui._url($el.val());
            ui.dom.object_id.val('');
            ui.dom.text.text('');
            ui._disable(!$el.val());
            if ($el.val()) {
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
                ui.dom.object_id.val('');
                ui.dom.object_id.parent().find('.related-lookup, strong').remove();
            }
        });

        ui.dom.object_id.bind('keyup.gGenericRelated focus.gGenericRelated', function(e){
            ui._lookup(e);
        });
    }
}));

$.ui.gGenericRelated.defaults = $.RelatedDefaultsBase

// Used in popup windows to disable default django behaviors
$(function(){

    // Add popup
    $('a[onclick^=return\\ showAddAnotherPopup]')
        .attr('onclick', false).unbind()
        .bind('click', function(e){
            var link = $(this);
            var name = link.attr('id').replace(/^add_/, '');
            var href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + '_popup=1';
            var wm   = $.wm(href, {height: 600 , width: 920, resizable: true, scrollbars: true});
            wm._data('link', link);
            wm._data('id', name);
            wm.open(true);
            e.preventDefault();
            return false;
        });

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
                    return $.dismissRelatedLookupPopup(window);
                }
            });

        $.dismissRelatedLookupPopup = function (win) {
            var wm = opener.jQuery.wm(win.name);
            if (wm) {
                var el  = wm._data('element');
                var pk  = wm._data('pk');
                var lbl = wm._data('newRepr');

                if (el.hasClass('vManyToManyRawIdAdminField') && el.val().length) {
                    el.val($.format('{0:s},{1:s}', el.val(), pk));
                    el.focus();
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



    // Add popup
    if (opener && /_popup/.test(window.location.search)) {
        // newId and newRepr are expected to have previously been escaped by django.utils.html.escape.
        //
        // I can't get rid of this function .. (I could by using the middleware, but it would make it a requirement..)
        // django/contrib/admin/options.py: 
        // return HttpResponse('<script type="text/javascript">opener.dismissAddAnotherPopup(...
        var wm  = opener.jQuery('html').data(window.name)
        var $el = opener.jQuery('#'+ wm['id']);
        opener.dismissAddAnotherPopup = function (w, newId, newRepr) {
            if (wm) {
                if ($el.get(0)) {
                    if ($el.get(0).nodeName == 'SELECT') {
                        var select = $el;
                        var t = $el.attr('id').split(/(\-\d+\-)/); // account for related inlines
                        if (t.length === 3) {
                            var select = $('select[id^="'+ t[0] +'"][id$="'+ t[2] +'"]');
                        }
                        $('<option />').attr('selected', true)
                            .val(newId).appendTo(select)
                            .text($.unescapeHTML(newRepr));
                    } else if ($el.get(0).nodeName == 'INPUT') {
                        $el.val(newId);
                        if ($el.hasClass('vAutocompleteRawIdAdminField')) {
                            $el.prevAll('input.ui-gAutocomplete-autocomplete').val($.unescapeHTML(newRepr))
                        }
                    }
                    $el.focus();
                }
                w.close();
            }
        }
    }

});


})(jQuery);
