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

// customized in grappelli.RelatedObjectLoopups.js
//function showRelatedObjectLookupPopup(triggeringLink) {}

// customized in grappelli.RelatedObjectLoopups.js
//function dismissRelatedLookupPopup(win, chosenId) {}

// customized in grappelli.RelatedObjectLoopups.js
//function showAddAnotherPopup(triggeringLink) {}

// customized in grappelli.RelatedObjectLoopups.js
// function dismissAddAnotherPopup(win, newId, newRepr) {}
