function CustomFileBrowser(field_name, url, type, win) {

    var cmsURL = "/admin/filebrowser/?pop=2";
    cmsURL = cmsURL + "&type=" + type;
    
    tinyMCE.activeEditor.windowManager.open({
        file: cmsURL,
        width: 820,  // Your dimensions may differ - toy around with them!
        height: 500,
        resizable: "yes",
        scrollbars: "yes",
        inline: "no",  // This parameter only has an effect if you use the inlinepopups plugin!
        close_previous: "no",
    }, {
        window: win,
        input: field_name,
        editor_id: tinyMCE.selectedInstance.editorId,
    });
    return false;
}

function CustomCleanup(type, value) {
    switch (type) {
        case "get_from_editor":
            // remove multiple spaces
            value = value.replace(/\s{2,}/g, "&nbsp;");
            // remove multiple breaks
            value = value.replace(/(\<br \/\>){2,}/g, "<br />");
            // remove empty paragraphs
            value = value.replace(/\<p\>\s+\<\/p\>/g, "");
            value = value.replace(/\<p\>\<br \/\>\s\<\/p\>/g, "");
            value = value.replace(/\<p\>\s\<br \/\>\<\/p\>/g, "");
            // remove empty headlines
            value = value.replace(/\<h1\>\s+\<\/h1\>/g, "");
            value = value.replace(/\<h2\>\s+\<\/h2\>/g, "");
            value = value.replace(/\<h3\>\s+\<\/h3\>/g, "");
            value = value.replace(/\<h4\>\s+\<\/h4\>/g, "");
            value = value.replace(/\<h1\>(\&nbsp\;)+\<\/h1\>/g, "");
            value = value.replace(/\<h2\>(\&nbsp\;)+\<\/h2\>/g, "");
            value = value.replace(/\<h3\>(\&nbsp\;)+\<\/h3\>/g, "");
            value = value.replace(/\<h4\>(\&nbsp\;)+\<\/h4\>/g, "");
            // remove headlines with breaks
            value = value.replace(/\<h1\>\<br \/\>\<\/h1\>/g, "");
            value = value.replace(/\<h2\>\<br \/\>\<\/h2\>/g, "");
            value = value.replace(/\<h3\>\<br \/\>\<\/h3\>/g, "");
            value = value.replace(/\<h4\>\<br \/\>\<\/h4\>/g, "");
            // remove empty listelements
            value = value.replace(/\<li\>\s+\<\/li\>/g, "");
            value = value.replace(/\<li\>\s+\<br \/\>\<\/li\>/g, "");
            value = value.replace(/\<li\>\<br \/\>\<\/li\>/g, "");
            value = value.replace(/\<ol\>\s+\<\/ol\>/g, "");
            value = value.replace(/\<ul\>\s+\<\/ul\>/g, "");
    }
    return value;
}

tinyMCE.init({
    mode: "textareas",
    //elements: "summary, body",
    theme: "advanced",
    language: "en",
    skin: "grappelli",
    browsers: "gecko",
    dialog_type: "window",
    object_resizing: true,
    cleanup_on_startup: true,
    forced_root_block: "p",
    remove_trailing_nbsp: true,
    theme_advanced_toolbar_location: "top",
    theme_advanced_toolbar_align: "left",
    theme_advanced_statusbar_location: "none",
    theme_advanced_buttons1: "formatselect,styleselect,bold,italic,underline,bullist,numlist,undo,redo,link,unlink,image,code,template,pasteword,media,youtube,charmap,visualchars,fullscreen",
    theme_advanced_buttons2: "",
    theme_advanced_buttons3: "",
    theme_advanced_path: false,
    theme_advanced_blockformats: "p,h2,h3,h4,div,code,pre,blockquote",
    theme_advanced_styles: "[all] clearfix=clearfix;[p] small=small;[img] Image left-aligned=img_left;[img] Image left-aligned (nospace)=img_left_nospacetop;[img] Image right-aligned=img_right;[img] Image right-aligned (nospace)=img_right_nospacetop;[img] Image Block=img_block;[img] Image Block (nospace)=img_block_nospacetop;[div] column span-2=column span-2;[div] column span-4=column span-4;[div] column span-8=column span-8",
    width: '700',
    height: '200',
    plugins: "advimage,advlink,fullscreen,visualchars,paste,media,template,searchreplace,youtube",
    theme_advanced_styles: "Image left-aligned=img_left;Image left-aligned (nospace)=img_left_nospacetop;Image right-aligned=img_right;Image right-aligned (nospace)=img_right_nospacetop;Image Block=img_block",
    advimage_update_dimensions_onchange: true,
    advlink_styles: "intern=internal;extern=external",
    file_browser_callback: "CustomFileBrowser",
    //cleanup_callback : "CustomCleanup",
    indentation : '10px',
    fix_list_elements : true,
    relative_urls: false,
    remove_script_host : true,
    accessibility_warnings : false,
    template_templates : [
        {
            title : "2 Columns (300px / 300px)",
            src : "/tinymce-templates/snippets/2col/",
            description : "Symmetrical 2 Columns."
        },
        {
            title : "2 Columns (420px / 140px)",
            src : "/tinymce-templates/snippets/2col_left/",
            description : "Asymmetrical 2 Columns: big left, small right."
        },
        {
            title : "2 Columns (140px / 420px)",
            src : "/tinymce-templates/snippets/2col_right/",
            description : "Asymmetrical 2 Columns: small left, big right."
        },
        {
            title : "3 Columns (300px / 300px)",
            src : "/tinymce-templates/snippets/3col/",
            description : "3 Columns."
        },
    ],
    valid_elements : "" +
    "-p," + 
    "a[href|target=_blank|class]," +
    "-strong/-b," +
    "-em/-i," +
    "-u," + 
    "-ol," + 
    "-ul," + 
    "-li," + 
    "br," + 
    "img[class|src|alt=|width|height]," + 
    "-h2,-h3,-h4," + 
    "-pre," +
    "-code," + 
    "-div",
    extended_valid_elements: "" + 
    "a[name|class|href|target|title|onclick]," + 
    "img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]," + 
    "br[clearfix]," + 
    "-p[class<clearfix?summary?code]," + 
    "h2[class<clearfix],h3[class<clearfix],h4[class<clearfix]," + 
    "ul[class<clearfix],ol[class<clearfix]," + 
    "div[class],",
    valid_child_elements : "" + 
    "h1/h2/h3/h4/h5/h6/a[%itrans_na]," + 
    "table[thead|tbody|tfoot|tr|td]," + 
    "strong/b/p/div/em/i/td[%itrans|#text]," + 
    "body[%btrans|#text]",
});


