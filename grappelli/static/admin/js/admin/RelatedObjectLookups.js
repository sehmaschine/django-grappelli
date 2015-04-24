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

/* new from 18 */
function showAdminPopup(triggeringLink, name_regexp) {
    var name = triggeringLink.id.replace(name_regexp, '');
    name = id_to_windowname(name);
    var href = triggeringLink.href;
    if (href.indexOf('?') == -1) {
        href += '?_popup=1';
    } else {
        href  += '&_popup=1';
    }
    var win = window.open(href, name, 'height=500,width=800,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
}

function showRelatedObjectLookupPopup(triggeringLink) {
    /* grap */
    // var name = triggeringLink.id.replace(/^lookup_/, '');
    // name = id_to_windowname(name);
    // var href;
    // if (triggeringLink.href.search(/\?/) >= 0) {
    //     href = triggeringLink.href + '&_popup=1';
    // } else {
    //     href = triggeringLink.href + '?_popup=1';
    // }
    // // GRAPPELLI CUSTOM: changed width
    // var win = window.open(href, name, 'height=500,width=1000,resizable=yes,scrollbars=yes');
    // win.focus();
    // return false;
    /* end grap */
    /* 18 */
    return showAdminPopup(triggeringLink, /^lookup_/);
    /* end 18 */
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

function showRelatedObjectPopup(triggeringLink) {
    /* grap */
    var name = triggeringLink.id.replace(/^add_/, '');
    name = id_to_windowname(name);
    var href = triggeringLink.href;
    if (href.indexOf('?') == -1) {
        href += '?_popup=1';
    } else {
        href  += '&_popup=1';
    }
    // GRAPPELLI CUSTOM: changed width
    var win = window.open(href, name, 'height=500,width=1000,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
    /* end grap */
    /* 18 */
    var name = triggeringLink.id.replace(/^(change|add|delete)_/, '');
    name = id_to_windowname(name);
    var href = triggeringLink.href;
    var win = window.open(href, name, 'height=500,width=800,resizable=yes,scrollbars=yes');
    win.focus();
    return false;
    /* end 18 */
}

function dismissAddRelatedObjectPopup(win, newId, newRepr) {
    // newId and newRepr are expected to have previously been escaped by
    // django.utils.html.escape.
    newId = html_unescape(newId);
    newRepr = html_unescape(newRepr);
    var name = windowname_to_id(win.name);
    var elem = document.getElementById(name);
    var o;
    if (elem) {
        var elemName = elem.nodeName.toUpperCase();
        if (elemName == 'SELECT') {
            o = new Option(newRepr, newId);
            elem.options[elem.options.length] = o;
            o.selected = true;
        } else if (elemName == 'INPUT') {
            if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
                elem.value += ',' + newId;
            } else {
                elem.value = newId;
            }
            /* grap */
            elem.focus();
            /* end grap */
            /* 18 */
            django.jQuery(elem).trigger('change');
            /* end 18 */
        }
    } else {
        var toId = name + "_to";
        o = new Option(newRepr, newId);
        SelectBox.add_to_cache(toId, o);
        SelectBox.redisplay(toId);
    }
    win.close();
}

/* from 18 */
function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
    objId = html_unescape(objId);
    newRepr = html_unescape(newRepr);
    var id = windowname_to_id(win.name).replace(/^edit_/, '');
    var selectsSelector = interpolate('#%s, #%s_from, #%s_to', [id, id, id]);
    var selects = django.jQuery(selectsSelector);
    selects.find('option').each(function() {
        if (this.value == objId) {
            this.innerHTML = newRepr;
            this.value = newId;
        }
    });
    win.close();
};

function dismissDeleteRelatedObjectPopup(win, objId) {
    objId = html_unescape(objId);
    var id = windowname_to_id(win.name).replace(/^delete_/, '');
    var selectsSelector = interpolate('#%s, #%s_from, #%s_to', [id, id, id]);
    var selects = django.jQuery(selectsSelector);
    selects.find('option').each(function() {
        if (this.value == objId) {
            django.jQuery(this).remove();
        }
    }).trigger('change');
    win.close();
};

showAddAnotherPopup = showRelatedObjectPopup;
dismissAddAnotherPopup = dismissAddRelatedObjectPopup;
