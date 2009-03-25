// Handles related-objects functionality: lookup link for raw_id_fields
// and Add Another links.

function html_unescape(text) {
    // Unescape a string that was escaped using django.utils.html.escape.
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&amp;/g, '&');
    return text;
}

function showRelatedObjectLookupPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^lookup_/, '');
    // IE doesn't like periods in the window name, so convert temporarily.
    name = name.replace(/\./g, '___');
    var href;
    if (triggeringLink.href.search(/\?/) >= 0) {
        href = triggeringLink.href + '&pop=1';
    } else {
        href = triggeringLink.href + '?pop=1';
    }
    var win = window.open(href, name, 'height=600,width=900,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
}

function dismissRelatedLookupPopup(win, chosenId) {
    var name = win.name.replace(/___/g, '.');
    var elem = document.getElementById(name);
    if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
        elem.value += ',' + chosenId;
    } else {
        document.getElementById(name).value = chosenId;
        document.getElementById(name).focus();
    }
    win.close();
}

function showAddAnotherPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^add_/, '');
    name = name.replace(/\./g, '___');
    href = triggeringLink.href
    if (href.indexOf('?') == -1) {
        href += '?_popup=1';
    } else {
        href  += '&_popup=1';
    }
    var win = window.open(href, name, 'height=600,width=900,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
}

function dismissAddAnotherPopup(win, newId, newRepr) {
    // newId and newRepr are expected to have previously been escaped by
    // django.utils.html.escape.
    newId = html_unescape(newId);
    newRepr = html_unescape(newRepr);
    var name = win.name.replace(/___/g, '.');
    var elem = document.getElementById(name);
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
        elem = document.getElementById(toId);
        var o = new Option(newRepr, newId);
        SelectBox.add_to_cache(toId, o);
        SelectBox.redisplay(toId);
    }
    win.close();
}

// ADDED: SHOW OBJECT_REPR WHEN FOREIGNKEY CHANGES
var ADMIN_MEDIA_URL = '/admin/media/';
var CHAR_MAX_LENGTH = 30;

function RelatedLookup(obj) {
    link = obj.next();
    text = obj.next().next();
    var app_label = link.attr('href').split('/')[3];
    var model_name= link.attr('href').split('/')[4];
    
    text.text('loading ...');
    
    // get object
    $.get('/grappelli/related_lookup/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
        item = data;
        text.text('');
        if (item) {
            if (item.length > CHAR_MAX_LENGTH) {
                text.text(decodeURI(item.substr(0, CHAR_MAX_LENGTH) + " ..."));
            } else {
                text.text(decodeURI(item));
            }
        }
    });
}

$(document).ready(function(){
    
    $("input.vForeignKeyRawIdAdminField").each(function() {
        // insert empty text-elements after all empty foreignkeys
        if ($(this).val() == "") {
            $(this).next().after('&nbsp;<strong></strong>');
        }
    });
    
    $("input.vForeignKeyRawIdAdminField").bind("change focus", function() {
        RelatedLookup($(this));
    });
});


