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

var CollapsedFiltersets = {
    collapse_re: /\bcollapse-closed\b/,   // Class of fieldsets that should be closed.
    collapse_open_re: /\bcollapse-open\b/, // Class of fieldsets that should be collapsible, but open at first.
    collapsed_re: /\bcollapsed\b/, // Class that fieldsets get when they're hidden.
    collapsed_class: 'collapsed',
    collapse_class: 'collapse',
    init: function() {
        var filtersets = document.getElementsByTagName('div');
        var collapsed_seen = false;
        for (var i = 0, fs; fs = filtersets[i]; i++) {
            // Collapse this fieldset if it has the correct class, and if it
            // doesn't have any errors. (Collapsing shouldn't apply in the case
            // of error messages.)
            if (fs.className.match(CollapsedFiltersets.collapse_re)) {
                alert(fs);
                collapsed_seen = true;
                // Give it an additional class, used by CSS to hide it.
                fs.className += ' ' + CollapsedFiltersets.collapsed_class;
                // (<h2><a id="fieldsetcollapser3" class="collapse-toggle" href="#">Show</a></h2>)
                var collapse_link = document.createElement('h3');
                var h3 = fs.getElementsByTagName('h3')[0];
                collapse_link.className = 'collapse-toggle';
                collapse_link.id = 'filtersetcollapser' + i;
                collapse_link.onclick = new Function('CollapsedFiltersets.show('+i+'); return false;');
                collapse_link.href = '#';
                //collapse_link.innerHTML = gettext('Show');
                collapse_link.innerHTML = h3.innerHTML;
                //h2_link = document.createElement('h2');
                //h2_link.appendChild(collapse_link);
                fs.replaceChild(collapse_link, h3);
                //h2.appendChild(document.createTextNode(' ('));
                //h2.appendChild(collapse_link);
                //h2.appendChild(document.createTextNode(')'));
            } 
        }     
        if (collapsed_seen) {
            // Expand all collapsed fieldsets when form is submitted.
            addEvent(findForm(document.getElementsByTagName('fieldset')[0]), 'submit', function() { CollapsedFiltersets.uncollapse_all(); });
        }
    },
    show: function(fieldset_index) {
        var fs = document.getElementsByTagName('div')[fieldset_index];
        // Remove the class name that causes the "display: none".
        fs.className = fs.className.replace(CollapsedFiltersets.collapsed_re, '');
        // Replace collapse-closed with collapse-open
        fs.className = fs.className.replace(CollapsedFiltersets.collapse_re, 'collapse-open');
        // Toggle the "Show" link to a "Hide" link
        var collapse_link = document.getElementById('filtersetcollapser' + fieldset_index);
        collapse_link.onclick = new Function('CollapsedFiltersets.hide('+fieldset_index+'); return false;');
    },
    hide: function(fieldset_index) {
        var fs = document.getElementsByTagName('div')[fieldset_index];
        // Add the class name that causes the "display: none".
        fs.className += ' ' + CollapsedFiltersets.collapsed_class;
        // Replace collapse-open with collapse-closed
        fs.className = fs.className.replace(CollapsedFiltersets.collapse_open_re, 'collapse-closed');
        // Toggle the "Hide" link to a "Show" link
        var collapse_link = document.getElementById('filtersetcollapser' + fieldset_index);
        collapse_link.onclick = new Function('CollapsedFiltersets.show('+fieldset_index+'); return false;');
    },
    uncollapse_all: function() {
        var fieldsets = document.getElementsByTagName('div');
        for (var i=0; i<fieldsets.length; i++) {
            if (fieldsets[i].className.match(CollapsedFiltersets.collapsed_re)) {
                CollapsedFiltersets.show(i);
            }
        }
    }
}


addEvent(window, 'load', CollapsedFiltersets.init);
