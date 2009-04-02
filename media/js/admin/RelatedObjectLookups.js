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
        document.getElementById(name).focus();
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

var CHAR_MAX_LENGTH = 30;

function RelatedLookup(obj) {
    var link = obj.next();
    var text = obj.next().next();
    var app_label = link.attr('href').split('/')[2];
    var model_name= link.attr('href').split('/')[3];
    
    text.text('loading ...');
    
    // get object
    $.get('/grappelli/related_lookup/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
        var item = data;
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

function M2MLookup(obj) {
    var link = obj.next();
    var text = obj.next().next();
    var app_label = link.attr('href').split('/')[2];
    var model_name= link.attr('href').split('/')[3];
    
    text.text('loading ...');
    
    // get object
    $.get('/grappelli/m2m_lookup/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
        var item = data;
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

function GenericLookup(obj) {
    var link = obj.next();
    var text = obj.next().next();
    var app_label = link.attr('href').split('/')[2];
    var model_name= link.attr('href').split('/')[3];
    
    text.text('loading ...');
    
    // get object
    $.get('/grappelli/related_lookup/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
        var item = data;
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

function RelatedHandler(obj) {
    // related lookup handler
    obj.bind("change", function() {
        RelatedLookup($(this));
    });
    obj.bind("focus", function() {
        RelatedLookup($(this));
    });
}

function M2MHandler(obj) {
    // related lookup handler
    obj.bind("change", function() {
        M2MLookup($(this));
    });
    obj.bind("focus", function() {
        M2MLookup($(this));
    });
}

function InitObjectID(obj) {
    obj.each(function() {
        var ct = $(this).parent().prev().find(':input[name*="content_type"]').val();
        if (ct) {
            var lookupLink = $('<a class="related-lookup">&nbsp;&nbsp;</a>');
            lookupLink.attr('id', 'lookup_'+this.id);
            lookupLink.attr('href', ADMIN_URL + MODEL_URL_ARRAY[ct] + '/?t=id');
            lookupLink.attr('onclick', 'return showRelatedObjectLookupPopup(this);');
            var lookupText = '<strong>&nbsp;</strong>';
            $(this).after(lookupText).after(lookupLink);
            if ($(this).val() != "") {
                var lookupText = GenericLookup($(this));
            }
        }
    });
}

function InitContentType(obj) {
    obj.bind("change", function() {
        if ($(this).val()) {
            var href = ADMIN_URL + MODEL_URL_ARRAY[$(this).val()] + "/?t=id";
            var lookupLink = $(this).parent().next().find('a.related-lookup');
            var obj_id = $(this).parent().next().find('input[name*="object_id"]');
            if (lookupLink.attr('href')) {
                lookupLink.attr('href', href);
            } else {
                var lookupLink = $('<a class="related-lookup">&nbsp;&nbsp;</a>');
                lookupLink.attr('id', 'lookup_'+obj_id.attr('id'));
                lookupLink.attr('href', ADMIN_URL + MODEL_URL_ARRAY[$(this).val()] + '/?t=id');
                lookupLink.attr('onclick', 'return showRelatedObjectLookupPopup(this);');
                var lookupText = '<strong>&nbsp;</strong>';
                $(this).parent().next().find('input[name*="object_id"]').after(lookupText).after(lookupLink);
            }
        } else {
            $(this).parent().next().find('input[name*="object_id"]').val('');
            $(this).parent().next().find('a.related-lookup').remove();
            $(this).parent().next().find('strong').remove();
        }
    });
}

function GenericHandler(obj) {
    // related lookup handler
    obj.bind("change", function() {
        GenericLookup($(this));
    });
    obj.bind("focus", function() {
        GenericLookup($(this));
    });
}

$(document).ready(function(){
    
    // change related-lookups in order to get the right URL.
    $('a.related-lookup').each(function() {
       href = $(this).attr('href').replace('../../../', ADMIN_URL);
       $(this).attr('href', href);
    });
    
    // related lookup setup
    $("input.vForeignKeyRawIdAdminField").each(function() {
        // insert empty text-elements after all empty foreignkeys
        if ($(this).val() == "") {
            $(this).next().after('&nbsp;<strong></strong>');
        }
    });
    
    // m2m lookup setup
    $("input.vManyToManyRawIdAdminField").each(function() {
        // insert empty text-elements after all empty foreignkeys
        if ($(this).val() == "") {
            $(this).next().after('&nbsp;<strong>&nbsp;</strong>');
        }
    });
    
    RelatedHandler($("input.vForeignKeyRawIdAdminField"));
    M2MHandler($("input.vManyToManyRawIdAdminField"));
    InitObjectID($('input[name*="object_id"]'));
    InitContentType($(':input[name*="content_type"]'));
    GenericHandler($('input[name*="object_id"]'));
    
});


