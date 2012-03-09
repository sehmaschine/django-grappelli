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

function showRelatedObjectLookupPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^lookup_/, '');
    name = id_to_windowname(name);
    var href;
    if (triggeringLink.href.search(/\?/) >= 0) {
        href = triggeringLink.href + '&pop=1';
    } else {
        href = triggeringLink.href + '?pop=1';
    }
    // GRAPPELLI CUSTOM: changed width
    var win = window.open(href, name, 'height=500,width=980,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
}

function dismissRelatedLookupPopup(win, chosenId) {
    var name = windowname_to_id(win.name);
    var elem = document.getElementById(name);
    if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
        elem.value += ',' + chosenId;
    } else {
        document.getElementById(name).value = chosenId;
    }
    // GRAPPELLI CUSTOM: element focus
    elem.focus();
    win.close();
}

// GRAPPELLI CUSTOM
function removeRelatedObject(triggeringLink) {
    var id = triggeringLink.id.replace(/^remove_/, '');
    var elem = document.getElementById(id);
    elem.value = "";
    elem.focus();
}

function showAddAnotherPopup(triggeringLink) {
    var name = triggeringLink.id.replace(/^add_/, '');
    name = id_to_windowname(name);
    href = triggeringLink.href;
    if (href.indexOf('?') == -1) {
        href += '?_popup=1';
    } else {
        href  += '&_popup=1';
    }
    // GRAPPELLI CUSTOM: changed width
    var win = window.open(href, name, 'height=500,width=980,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
}

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
                elem.focus();
            } else {
                elem.value = newId;
                elem.focus();
            }
        // GRAPPELLI CUSTOM
        // NOTE: via http://code.djangoproject.com/ticket/10191
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
            } else {
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
