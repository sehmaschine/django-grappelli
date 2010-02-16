tinyMCEPopup.requireLangPack();

var action, dom = tinyMCEPopup.editor.dom;

function insertTable() {
    var formObj = document.forms[0];
    var inst = tinyMCEPopup.editor, dom = inst.dom;
    
    var cols = 2, rows = 1, className;
    var html = '', elm;
    
    tinyMCEPopup.restoreSelection();
    
    elm = dom.getParent(inst.selection.getNode(), 'table');
    
    // Get form data
    className = formObj.elements['class'].options[formObj.elements['class'].selectedIndex].value;
    id = formObj.elements['id'].value;
    
    // Update table
    if (action == "update") {
        inst.execCommand('mceBeginUndoLevel');
        
        dom.setAttrib(elm, 'class', className);
        dom.setAttrib(elm, 'id', id);
        
        inst.addVisual();
        
        inst.nodeChanged();
        inst.execCommand('mceEndUndoLevel');
        
        tinyMCEPopup.close();
        return true;
    }
    
    // Create new table
    html += '<table';
    html += makeAttrib('id', id);
    html += makeAttrib('class', className);
    html += '>';
    html += "<tr>";
    for (var x=0; x<cols; x++) {
        if (!tinymce.isIE)
            html += '<td><br mce_bogus="1"/></td>';
        else
            html += '<td></td>';
    }
    html += "</tr>";
    html += "</table>";
    
    inst.execCommand('mceBeginUndoLevel');
    inst.execCommand('mceInsertContent', false, html);
    inst.addVisual();
    inst.execCommand('mceEndUndoLevel');
    
    tinyMCEPopup.close();
}

function makeAttrib(attrib, value) {
    var formObj = document.forms[0];
    var valueElm = formObj.elements[attrib];
    
    if (typeof(value) == "undefined" || value == null) {
        value = "";
        if (valueElm)
            value = valueElm.value;
    }
    
    if (value == "")
        return "";
    
    // XML encode it
    value = value.replace(/&/g, '&amp;');
    value = value.replace(/\"/g, '&quot;');
    value = value.replace(/</g, '&lt;');
    value = value.replace(/>/g, '&gt;');
    
    return ' ' + attrib + '="' + value + '"';
}

function init() {
    tinyMCEPopup.resizeToInnerSize();
    
    grid_templates = tinyMCEPopup.editor.getParam("grid_templates", false);
    alert(grid_templates);
    
    var cols = 2, rows = 2;
    var className = "";
    var id = "";
    var inst = tinyMCEPopup.editor, dom = inst.dom;
    var formObj = document.forms[0];
    var elm = dom.getParent(inst.selection.getNode(), "table");
    
    action = tinyMCEPopup.getWindowArg('action');
    
    if (!action)
        action = elm ? "update" : "insert";
        
    if (elm && action != "insert") {
        cols = 2;
        rows = 1;
        
        className = tinymce.trim(dom.getAttrib(elm, 'class').replace(/mceItem.+/g, ''));
        id = dom.getAttrib(elm, 'id');
        
        action = "update";
        formObj.insert.value = inst.getLang('update');
    }
    
    addClassesToList('class', "table_styles");
    
    // Update form
    selectByValue(formObj, 'class', className, true, true);
    formObj.id.value = id;
    
    // Disable some fields in update mode
    if (action == "update") {
        formObj.class.disabled = true;
    }
    
}

tinyMCEPopup.onInit.add(init);
