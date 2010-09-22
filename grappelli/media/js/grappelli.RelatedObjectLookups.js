// TODO: klemens: drop ADMIN_URL

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

// IE doesn't accept periods or dashes in the window name, but the element IDs
// we use to generate popup window names may contain them, therefore we map them
// to allowed characters in a reversible way so that we can locate the correct 
// element when the popup window is dismissed.
function id_to_windowname(text) {
    text = text.replace(/\./g, '__dot__');
    text = text.replace(/\-/g, '__dash__');
    return text;
}

function windowname_to_id(text) {
    text = text.replace(/__dot__/g, '.');
    text = text.replace(/__dash__/g, '-');
    return text;
}

var CHAR_MAX_LENGTH = 30;

// customized from RelatedObjectLoopups.js
function showRelatedObjectLookupPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^lookup_/, '');
    name = id_to_windowname(name);
    var href;
    if (triggeringLink.href.search(/\?/) >= 0) {
        href = triggeringLink.href + '&pop=1';
    } else {
        href = triggeringLink.href + '?pop=1';
    }
    //grappelli custom
    var win = window.open(href, name, 'height=500,width=980,resizable=yes,scrollbars=yes');
    // end
    win.focus();
    return false;
}

// customized from RelatedObjectLoopups.js
function dismissRelatedLookupPopup(win, chosenId) {
    var name = windowname_to_id(win.name);
    var elem = document.getElementById(name);
    if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
        elem.value += ',' + chosenId;
    } else {
        document.getElementById(name).value = chosenId;
    }
    // grappelli custom
    elem.focus();
    // end
    win.close();
}

// customized from RelatedObjectLoopups.js
function showAddAnotherPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^add_/, '');
    name = id_to_windowname(name);
    href = triggeringLink.href;
    if (href.indexOf('?') == -1) {
        href += '?_popup=1';
    } else {
        href  += '&_popup=1';
    }
    var win = window.open(href, name, 'height=500,width=1000,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
}

// customized from RelatedObjectLoopups.js
function dismissAddAnotherPopup(win, newId, newRepr) {
    // newId and newRepr are expected to have previously been escaped by
    // django.utils.html.escape.
    newId = html_unescape(newId);
    newRepr = html_unescape(newRepr);
    var name = windowname_to_id(win.name);
    var elem = document.getElementById(name);
    if (elem) {
        if (elem.nodeName == 'SELECT') {
            var o = new Option(newRepr, newId);
            elem.options[elem.options.length] = o;
            o.selected = true;
        } else if (elem.nodeName == 'INPUT') {
            if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
                elem.value += ',' + newId;
            } else {
                elem.value = newId;
            }
        // NOTE: via http://code.djangoproject.com/attachment/ticket/10191/RelatedObjectLookups-updated.js.patch
        // check if the className contains radiolist - if it's HORIZONTAL, then it won't match if we compare explicitly 
        } else if (elem.className.indexOf('radiolist') > -1) {
            var cnt = elem.getElementsByTagName('li').length;
            var idName = elem.id+'_'+cnt;
            var newLi = document.createElement('li');
            var newLabel = document.createElement('label');
            var newText = document.createTextNode(' '+newRepr);
            try {
                // IE doesn't support settings name, type, or class by setAttribute
                var newInput = document.createElement('<input type=\'radio\' name=\''+name.slice(3)+'\' checked=\'checked\' class=\''+elem.className+'\' />');
            } catch(err) {
                var newInput = document.createElement('input');
                newInput.setAttribute('class', elem.className);
                newInput.setAttribute('type', 'radio');
                newInput.setAttribute('name', name.slice(3));
            }
            newLabel.setAttribute('for', idName);
            newInput.setAttribute('id', idName);
            newInput.setAttribute('value', newId);
            newInput.setAttribute('checked', 'checked');
            newLabel.appendChild(newInput);
            // check if the content being added is a tag - useful for image lists
            if (newRepr.charAt(0) == '<' && newRepr.charAt(newRepr.length-1) == '>') {
                newLabel.innerHTML += newRepr;
            } 
            else { 
                newLabel.appendChild(newText);
            } 
            newLi.appendChild(newLabel);
            elem.appendChild(newLi);
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

(function($) {
    function RelatedLookup(obj) {
        // check if val isn't empty string or the same value as before
        if (obj.val() == obj.data('old_val')) return;
        obj.data('old_val', obj.val());
        
        var link = obj.next();
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];

        var text = obj.next().next();
        if (obj.val() == "") {
            text.text('');
            return;
        }
        
        text.text('loading ...');
        
        // get object
        $.get('/grappelli/lookup/related/', {
            object_id: obj.val(),
            app_label: app_label,
            model_name: model_name
        }, function(data) {
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
        // check if val isn't empty string or the same value as before
        if (obj.val() == obj.data('old_val')) return;
        obj.data('old_val', obj.val());
        
        var link = obj.next();
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];

        var text = obj.next().next();
        if (obj.val() == "") {
            text.text('');
            return;
        }
        
        text.text('loading ...');
        
        // get object
        $.get('/grappelli/lookup/m2m/', {
            object_id: obj.val(),
            app_label: app_label,
            model_name: model_name
        }, function(data) {
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
    
    function GenericLookup(obj, force_update) {
        // check if val isn't empty string or the same value as before
        if (!force_update && obj.val() == obj.data('old_val')) return;
        obj.data('old_val', obj.val());
        
        var text = obj.next().next();
        if (obj.val() == "") {
            text.text("");
            return;
        }
        text.text('loading ...');
        
        var link = obj.next();
        if (link.length == 0) return;
        var spliturl = link.attr('href').split('/');
        var app_label = spliturl[spliturl.length-3];
        var model_name= spliturl[spliturl.length-2];
        
        // get object
        $.get('/grappelli/lookup/related/', {object_id: obj.val(), app_label: app_label, model_name: model_name}, function(data) {
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
        obj.bind("change focus keyup blur", function() {
            RelatedLookup($(this));
        });
    }
    
    function M2MHandler(obj) {
        // related lookup handler
        obj.bind("change focus keyup blur", function() {
            M2MLookup($(this));
        });
    }
    
    function InitObjectID(obj) {
        obj.each(function() {
            var ct = $(this).closest('div[class*="object_id"]').prev().find(':input[name*="content_type"]').val();
            if (ct) {
                var lookupLink = $('<a class="related-lookup"></a>');
                lookupLink.attr('id', 'lookup_'+this.id);
                lookupLink.attr('href', ADMIN_URL + MODEL_URL_ARRAY[ct].app + "/" + MODEL_URL_ARRAY[ct].model + '/?t=id');
                lookupLink.attr('onClick', 'return showRelatedObjectLookupPopup(this);');
                var lookupText = '<strong>&nbsp;</strong>';
                $(this).after(lookupText).after(lookupLink);
                if ($(this).val() != "") {
                    lookupText = GenericLookup($(this));
                }
            }
        });
    }
    
    function InitContentType(obj) {
        obj.bind("change", function() {
            var node = $(this).closest('div[class*="content_type"]').next(),
                lookupLink = node.find('a.related-lookup'),
                obj_id = node.find('input[name*="object_id"]');
            if ($(this).val()) {
                var href = ADMIN_URL + MODEL_URL_ARRAY[$(this).val()].app + "/" + MODEL_URL_ARRAY[$(this).val()].model + '/?t=id';
                if (lookupLink.attr('href')) {
                    lookupLink.attr('href', href);
                } else {
                    lookupLink = $('<a class="related-lookup"></a>');
                    lookupLink.attr('id', 'lookup_' + obj_id.attr('id'));
                    lookupLink.attr('href', ADMIN_URL + MODEL_URL_ARRAY[$(this).val()].app + "/" + MODEL_URL_ARRAY[$(this).val()].model + '/?t=id');
                    lookupLink.attr('onClick', 'return showRelatedObjectLookupPopup(this);');
                    var lookupText = '<strong>&nbsp;</strong>';
                    obj_id.after(lookupText).after(lookupLink);
                }
                GenericLookup(obj_id, true);
            } else {
                obj_id.val('');
                lookupLink.remove();
                node.find('strong').remove();
            }
        });
    }
    
    function GenericHandler(obj) {
        // related lookup handler
        obj.bind("change focus keyup", function() {
            GenericLookup($(this));
        });
    }
    $(document).ready(function() {
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
            // insert empty text-elements after all m2m fields
            $(this).next().after('&nbsp;<strong>&nbsp;</strong>');
            M2MLookup($(this));
        });
        
        RelatedHandler($("input.vForeignKeyRawIdAdminField"));
        M2MHandler($("input.vManyToManyRawIdAdminField"));
        
        InitObjectID($('input[name*="object_id"]'));
        InitContentType($(':input[name*="content_type"]'));
        GenericHandler($('input[name*="object_id"]'));
    });
})(django.jQuery);
