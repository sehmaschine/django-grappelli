// FIELDSETS
// Finds all fieldsets with class="collapse-closed", collapses them, and gives each
// one a link that uncollapses it.
// Finds all fieldsets with class="collapse-open" and gives each
// one a link that collapses it.

// INLINEGROUPS
// Finds all inlinegroups, collapses them, and gives each
// one a link that uncollapses it.

// INLINERELATED
// Finds all inlinerelated, collapses them, and gives each
// one a link that uncollapses it.

function findForm(node) {
    // returns the node of the form containing the given node
    if (node.tagName.toLowerCase() != 'form') {
        return findForm(node.parentNode);
    }
    return node;
}

var CollapsedFieldsets = {
    collapse_re: /\bcollapse-closed\b/,   // Class of fieldsets that should be closed.
    collapse_open_re: /\bcollapse-open\b/, // Class of fieldsets that should be collapsible, but open at first.
    collapsed_re: /\bcollapsed\b/, // Class that fieldsets get when they're hidden.
    collapsed_class: 'collapsed',
    collapse_class: 'collapse',
    init: function() {
        var fieldsets = document.getElementsByTagName('fieldset');
        var collapsed_seen = false;
        for (var i = 0, fs; fs = fieldsets[i]; i++) {
            // Collapse this fieldset if it has the correct class, and if it
            // doesn't have any errors. (Collapsing shouldn't apply in the case
            // of error messages.)
            if (fs.className.match(CollapsedFieldsets.collapse_re) && !CollapsedFieldsets.fieldset_has_errors(fs)) {
                collapsed_seen = true;
                // Give it an additional class, used by CSS to hide it.
                fs.className += ' ' + CollapsedFieldsets.collapsed_class;
                // (<h2><a id="fieldsetcollapser3" class="collapse-toggle" href="#">Show</a></h2>)
                var collapse_link = document.createElement('h2');
                var h2 = fs.getElementsByTagName('h2')[0];
                collapse_link.className = 'collapse-toggle';
                collapse_link.id = 'fieldsetcollapser' + i;
                collapse_link.onclick = new Function('CollapsedFieldsets.show('+i+'); return false;');
                collapse_link.href = '#';
                //collapse_link.innerHTML = gettext('Show');
                collapse_link.innerHTML = h2.innerHTML;
                //h2_link = document.createElement('h2');
                //h2_link.appendChild(collapse_link);
                fs.replaceChild(collapse_link, h2);
                //h2.appendChild(document.createTextNode(' ('));
                //h2.appendChild(collapse_link);
                //h2.appendChild(document.createTextNode(')'));
            } 
            if (fs.className.match(CollapsedFieldsets.collapse_open_re) && !CollapsedFieldsets.fieldset_has_errors(fs)) {
                collapsed_seen = true;
                // Give it an additional class, used by CSS to hide it.
                fs.className += ' ' + CollapsedFieldsets.collapse_class;
                // (<h2><a id="fieldsetcollapser3" class="collapse-toggle" href="#">Show</a></h2>)
                var collapse_link = document.createElement('h2');
                var h2 = fs.getElementsByTagName('h2')[0];
                collapse_link.className = 'collapse-toggle';
                collapse_link.id = 'fieldsetcollapser' + i;
                collapse_link.onclick = new Function('CollapsedFieldsets.hide('+i+'); return false;');
                collapse_link.href = '#';
                collapse_link.innerHTML = h2.innerHTML;
                fs.replaceChild(collapse_link, h2);
            }
            if (fs.className.match(CollapsedFieldsets.collapse_re) && CollapsedFieldsets.fieldset_has_errors(fs)) {
                collapsed_seen = true;
                // Give it an additional class, used by CSS to hide it.
                fs.className = fs.className.replace(CollapsedFieldsets.collapse_re, 'collapse-open');
                fs.className += ' ' + CollapsedFieldsets.collapse_class;
                // (<h2><a id="fieldsetcollapser3" class="collapse-toggle" href="#">Show</a></h2>)
                var collapse_link = document.createElement('h2');
                var h2 = fs.getElementsByTagName('h2')[0];
                collapse_link.className = 'collapse-toggle';
                collapse_link.id = 'fieldsetcollapser' + i;
                collapse_link.onclick = new Function('CollapsedFieldsets.hide('+i+'); return false;');
                collapse_link.href = '#';
                collapse_link.innerHTML = h2.innerHTML;
                fs.replaceChild(collapse_link, h2);
            }
        }     
        if (collapsed_seen) {
            // Expand all collapsed fieldsets when form is submitted.
            addEvent(findForm(document.getElementsByTagName('fieldset')[0]), 'submit', function() { CollapsedFieldsets.uncollapse_all(); });
        }
    },
    fieldset_has_errors: function(fs) {
        // Returns true if any fields in the fieldset have validation errors.
        var divs = fs.getElementsByTagName('div');
        for (var i=0; i<divs.length; i++) {
            if (divs[i].className.match(/\berrors\b/)) {
                return true;
            }
        }
        return false;
    },
    show: function(fieldset_index) {
        var fs = document.getElementsByTagName('fieldset')[fieldset_index];
        // Remove the class name that causes the "display: none".
        fs.className = fs.className.replace(CollapsedFieldsets.collapsed_re, '');
        // Replace collapse-closed with collapse-open
        fs.className = fs.className.replace(CollapsedFieldsets.collapse_re, 'collapse-open');
        // Toggle the "Show" link to a "Hide" link
        var collapse_link = document.getElementById('fieldsetcollapser' + fieldset_index);
        collapse_link.onclick = new Function('CollapsedFieldsets.hide('+fieldset_index+'); return false;');
    },
    hide: function(fieldset_index) {
        var fs = document.getElementsByTagName('fieldset')[fieldset_index];
        // Add the class name that causes the "display: none".
        fs.className += ' ' + CollapsedFieldsets.collapsed_class;
        // Replace collapse-open with collapse-closed
        fs.className = fs.className.replace(CollapsedFieldsets.collapse_open_re, 'collapse-closed');
        // Toggle the "Hide" link to a "Show" link
        var collapse_link = document.getElementById('fieldsetcollapser' + fieldset_index);
        collapse_link.onclick = new Function('CollapsedFieldsets.show('+fieldset_index+'); return false;');
    },
    uncollapse_all: function() {
        var fieldsets = document.getElementsByTagName('fieldset');
        for (var i=0; i<fieldsets.length; i++) {
            if (fieldsets[i].className.match(CollapsedFieldsets.collapsed_re)) {
                CollapsedFieldsets.show(i);
            }
        }
    }
}

var CollapsedInlineGroups = {
    init: function() {
        var inline_groups = document.getElementsByName('inlinegroup');
        for (var i = 0, ig; ig = inline_groups[i]; i++) {
            ig.className += ' collapsed';
            var collapse_link = document.createElement('h3');
            var h3 = ig.getElementsByTagName('h3')[0];
            collapse_link.className = 'collapse-toggle';
            collapse_link.id = 'inlinegroupcollapser' + i;
            collapse_link.onclick = new Function('CollapsedInlineGroups.show('+i+'); return false;');
            collapse_link.href = '#';
            collapse_link.innerHTML = h3.innerHTML;
            ig.replaceChild(collapse_link, h3);
        }
    },
    show: function(inlinegroup_index) {
        ig = document.getElementsByName('inlinegroup')[inlinegroup_index];
        ig.className = ig.className.replace('collapsed', '');
        inline_related = ig.childNodes;
        for (var i = 0, ir; ir = inline_related[i]; i++) {
            if (ir.nodeName == "DIV") {
                ir.setAttribute("style", 'display: block !important;');
            }
        }
        var collapse_link = document.getElementById('inlinegroupcollapser' + inlinegroup_index);
        collapse_link.onclick = new Function('CollapsedInlineGroups.hide('+inlinegroup_index+'); return false;');
    },
    hide: function(inlinegroup_index) {
        ig = document.getElementsByName('inlinegroup')[inlinegroup_index];
        ig.className += ' collapsed';
        inline_related = ig.childNodes;
        for (var i = 0, ir; ir = inline_related[i]; i++) {
            if (ir.nodeName == "DIV") {
                ir.setAttribute("style", 'display: none !important;');
            }
        }
        var collapse_link = document.getElementById('inlinegroupcollapser' + inlinegroup_index);
        collapse_link.onclick = new Function('CollapsedInlineGroups.show('+inlinegroup_index+'); return false;');
    },
}

var CollapsedInlineRelated = {
    init: function() {
        var inline_related = document.getElementsByName('inlinerelated');
        for (var i = 0, ig; ig = inline_related[i]; i++) {
            ig.className += ' collapsed';
            var collapse_link = document.createElement('h2');
            var h2 = ig.getElementsByTagName('h2')[0];
            collapse_link.className = 'collapse-toggle';
            collapse_link.id = 'inlinerelatedcollapser' + i;
            collapse_link.onclick = new Function('CollapsedInlineRelated.show('+i+'); return false;');
            collapse_link.href = '#';
            collapse_link.innerHTML = h2.innerHTML;
            ig.setAttribute('style', 'display: none !important;');
            ig.replaceChild(collapse_link, h2);
        }
    },
    show: function(inlinerelated_index) {
        var ir = document.getElementsByName('inlinerelated')[inlinerelated_index];
        // Remove the class name that causes the "display: none".
        ir.className = ir.className.replace('collapsed', '');
        // Toggle the "Show" link to a "Hide" link
        var collapse_link = document.getElementById('inlinerelatedcollapser' + inlinerelated_index);
        collapse_link.onclick = new Function('CollapsedInlineRelated.hide('+inlinerelated_index+'); return false;');
        fieldsets = ir.childNodes;
        for (var i = 0, fs; fs = fieldsets[i]; i++) {
            if (fs.nodeName == "FIELDSET") {
                fs.setAttribute("style", 'display: block !important;');
            }
        }
    },
    hide: function(inlinerelated_index) {
        var ir = document.getElementsByName('inlinerelated')[inlinerelated_index];
        // Remove the class name that causes the "display: none".
        ir.className += ' collapsed';
        // Toggle the "Show" link to a "Hide" link
        var collapse_link = document.getElementById('inlinerelatedcollapser' + inlinerelated_index);
        collapse_link.onclick = new Function('CollapsedInlineRelated.show('+inlinerelated_index+'); return false;');
        fieldsets = ir.childNodes;
        for (var i = 0, fs; fs = fieldsets[i]; i++) {
            if (fs.nodeName == "FIELDSET") {
                fs.setAttribute("style", 'display: none !important;');
            }
        }
    },
}

var CollapsedInlineGroupTabular = {
    init: function() {
        var inline_groups = document.getElementsByName('inlinegrouptabular');
        for (var i = 0, ig; ig = inline_groups[i]; i++) {
            ig.className += ' collapsed';
            var collapse_link = document.createElement('h3');
            var h3 = ig.getElementsByTagName('h3')[0];
            collapse_link.className = 'collapse-toggle';
            collapse_link.id = 'inlinegroupcollapser' + i;
            collapse_link.onclick = new Function('CollapsedInlineGroupTabular.show('+i+'); return false;');
            collapse_link.href = '#';
            collapse_link.innerHTML = h3.innerHTML;
            ig.replaceChild(collapse_link, h3);
        }
    },
    show: function(inlinegroup_index) {
        ig = document.getElementsByName('inlinegrouptabular')[inlinegroup_index];
        ig.className = ig.className.replace('collapsed', '');
        inline_related = ig.childNodes[3];
        inline_related.className = inline_related.className.replace('collapsed', '');
        inline_related.setAttribute("style", 'display: block !important;');
        //fieldset = inline_related.childNodes[4];
        //fieldset.setAttribute("style", 'display: block !important;');
        var collapse_link = document.getElementById('inlinegroupcollapser' + inlinegroup_index);
        collapse_link.onclick = new Function('CollapsedInlineGroupTabular.hide('+inlinegroup_index+'); return false;');
    },
    hide: function(inlinegroup_index) {
        ig = document.getElementsByName('inlinegrouptabular')[inlinegroup_index];
        ig.className += ' collapsed';
        inline_related = ig.childNodes;
        for (var i = 0, ir; ir = inline_related[i]; i++) {
            if (ir.nodeName == "DIV") {
                ir.setAttribute("style", 'display: none !important;');
            }
        }
        var collapse_link = document.getElementById('inlinegroupcollapser' + inlinegroup_index);
        collapse_link.onclick = new Function('CollapsedInlineGroupTabular.show('+inlinegroup_index+'); return false;');
    },
}

var CollapsedInlineRelatedTabular = {
    init: function() {
        var inline_related = document.getElementsByName('inlinerelatedtabular');
        for (var i = 0, ig; ig = inline_related[i]; i++) {
            ig.className += ' collapsed';
            ig.setAttribute('style', 'display: none !important;');
        }
    },
}

addEvent(window, 'load', CollapsedFieldsets.init);
addEvent(window, 'load', CollapsedInlineGroups.init);
addEvent(window, 'load', CollapsedInlineRelated.init);
addEvent(window, 'load', CollapsedInlineGroupTabular.init);
addEvent(window, 'load', CollapsedInlineRelatedTabular.init);
