/* Note: the "good" way to implement tinyMCE would be to create a new db field type
 *
 * details = grappelliModels.RichText(...)
 *
 * This would translate into a standard textarea with a distinctive class name
 *
 * The JS would look for that class name and if it founds it it would load
 * dynamically the js required by the editor.
 *
 * That way you can have both standards and rich textarea on the same form
 * and you don't force the programmers to fiddle with JS paths in models.
 *
 * */
//(function($){
function CustomFileBrowser(field_name, url, type, win) {
    
    var cmsURL = "/admin/filebrowser/browse/?pop=2";
    cmsURL = cmsURL + "&type=" + type;
    
    tinyMCE.activeEditor.windowManager.open({
        file: cmsURL,
        width: 980,  // Your dimensions may differ - toy around with them!
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

tinyMCE.init({

    // General
    mode :              'textareas',
    theme :             'advanced',
    skin:               'grappelli',
    dialog_type:        'window',
    browsers:           'gecko,msie,safari,opera',
    editor_deselector : 'mceNoEditor',
    language:           "de",
    relative_urls:      false,
    plugins:            'advimage,advlink,fullscreen,paste,media,searchreplace,grappelli,grappelli_contextmenu,template',
    
    // callbackss
    file_browser_callback: 'CustomFileBrowser',

    // Layout
    width:              758,
    height:             300,
    indentation:        '10px',
    object_resizing:    false,

    // Accessibility
    cleanup_on_startup:     true,
    accessibility_warnings: false,
    remove_trailing_nbsp:   true,
    fix_list_elements :     true,
    remove_script_host:     true,

    // theme_advanced
    theme_advanced_toolbar_location: "top",
    theme_advanced_toolbar_align: "left",
    theme_advanced_statusbar_location: "bottom",
    theme_advanced_buttons1: "formatselect,styleselect,|,bold,italic,underline,|,bullist,numlist,blockquote,|,undo,redo,|,link,unlink,|,image,|,fullscreen,|,grappelli_adv",
    theme_advanced_buttons2: "search,|,pasteword,template,media,charmap,|,code,|,table,cleanup,grappelli_documentstructure",
    theme_advanced_buttons3: "",
    theme_advanced_path: false,
    theme_advanced_blockformats: "p,h2,h3,h4,pre",
    theme_advanced_styles: "[all] clearfix=clearfix;[p] small=small;[img] Image left-aligned=img_left;[img] Image left-aligned (nospace)=img_left_nospacetop;[img] Image right-aligned=img_right;[img] Image right-aligned (nospace)=img_right_nospacetop;[img] Image Block=img_block;[img] Image Block (nospace)=img_block_nospacetop;[div] column span-2=column span-2;[div] column span-4=column span-4;[div] column span-8=column span-8",
    theme_advanced_resizing : true,
    theme_advanced_resize_horizontal : false,
    theme_advanced_resizing_use_cookie : true,
    theme_advanced_styles: "Image left-aligned=img_left;Image left-aligned (nospace)=img_left_nospacetop;Image right-aligned=img_right;Image right-aligned (nospace)=img_right_nospacetop;Image Block=img_block",
    
    // Adv (?)
    advlink_styles: "intern=internal;extern=external",
    advimage_update_dimensions_onchange: true,
    
    // grappelli
    grappelli_adv_hidden: false,
    grappelli_show_documentstructure: 'on',
    
    // templates
    template_templates : [
        {
            title : "2 Spalten, symmetrisch",
            src : "/grappelli/tinymce/templates/2col/",
            description : "Symmetrical 2 Columns."
        },
        {
            title : "2 Spalten, symmetrisch mit Unterteilung",
            src : "/grappelli/tinymce/templates/4col/",
            description : "Asymmetrical 2 Columns: big left, small right."
        },
    ],
    
    // elements
    valid_elements : [
        '-p,','a[href|target=_blank|class]','-strong/-b','-em/-i','-u','-ol',
        '-ul','-li','br','img[class|src|alt=|width|height]','-h2,-h3,-h4','-pre','-blockquote','-code','-div'
    ].join(','),
    extended_valid_elements: [
        'a[name|class|href|target|title|onclick]',
        'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
        'br[clearfix]',
        '-p[class<clearfix?summary?code]',
        'h2[class<clearfix],h3[class<clearfix],h4[class<clearfix]',
        'ul[class<clearfix],ol[class<clearfix]',
        'div[class]',
        'object[align<bottom?left?middle?right?top|archive|border|class|classid'
          + "|codebase|codetype|data|declare|dir<ltr?rtl|height|hspace|id|lang|name"
          + "|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
          + "|onmouseout|onmouseover|onmouseup|standby|style|tabindex|title|type|usemap"
          + "|vspace|width]",
        'param[id|name|type|value|valuetype<DATA?OBJECT?REF]',
        'address'
    ].join(','),
    valid_child_elements : [
        'h1/h2/h3/h4/h5/h6/a[%itrans_na]',       'table[thead|tbody|tfoot|tr|td]',
        'strong/b/p/div/em/i/td[%itrans|#text]', 'body[%btrans|#text]'
    ].join(',')

    // custom cleanup
    // setup: function(ed) {
    //     // Gets executed before DOM to HTML string serialization
    //     ed.onBeforeGetContent.add(function(ed, o) {
    //         // State get is set when contents is extracted from editor
    //         if (o.get) {
    //             // Remove empty paragraphs (because this is bad)
    //             tinymce.each(ed.dom.select('p', o.node), function(n) {
    //                 alert(n.firstChild);
    //                 ed.dom.remove(n);
    //             });
    //             // Remove douple spaces
    //             // o.content = o.content.replace(/<(strong|b)([^>]*)>/g, '');
    //         }
    //     });
    // }
});
//}(jQuery));
