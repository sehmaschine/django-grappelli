/*
// Handles related-objects functionality: lookup link for raw_id_fields
// and Add Another links.



function showAddAnotherPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^add_/, '');
    name = name.replace(/\./g, '___');
    href = triggeringLink.href
    if (href.indexOf('?') == -1) {
        href += '?_popup=1';
    } else {
        href  += '&_popup=1';
    }
    var win = window.open(href, name, 'height=600,width=920,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
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


function M2MHandler(obj) {
    // related lookup handler
    obj.bind("change", function() {
        M2MLookup($(this));
    });
    obj.bind("focus", function() {
        M2MLookup($(this));
    });
}



$(function(){
    
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

*/
