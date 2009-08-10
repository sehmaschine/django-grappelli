$(document).ready(function() {
    //$('head', document).append('<link rel="stylesheet" type="text/css" media="screen" href="/media/admin/wymeditor/wymeditor/skins/default/screen.css" />');
    $("textarea").wymeditor({
        //skinPath: "/media/admin/wymeditor/wymeditor/skins/sehmaschine/",
        skinPath: "/media/admin/wymeditor/wymeditor/skins/default/",
        lang: "en",
        logoHtml: '',
        //updateSelector: "input:submit",
        //updateEvent: "click",
        toolsItems: [
            {'name': 'Bold', 'title': 'Strong', 'css': 'wym_tools_strong'}, 
            {'name': 'Italic', 'title': 'Emphasis', 'css': 'wym_tools_emphasis'},
            {'name': 'InsertOrderedList', 'title': 'Ordered_List', 'css': 'wym_tools_ordered_list'},
            {'name': 'InsertUnorderedList', 'title': 'Unordered_List', 'css': 'wym_tools_unordered_list'},
            {'name': 'CreateLink', 'title': 'Link', 'css': 'wym_tools_link'},
            {'name': 'Unlink', 'title': 'Unlink', 'css': 'wym_tools_unlink'},
            {'name': 'InsertImage', 'title': 'Image', 'css': 'wym_tools_image'},
            {'name': 'ToggleHtml', 'title': 'HTML', 'css': 'wym_tools_html'},
            {'name': 'Preview', 'title': 'Preview', 'css': 'wym_tools_preview'},
        ],
        containersItems: [
            {'name': 'p', 'title': 'Paragraph', 'css': 'wym_containers_p'},
            {'name': 'h2', 'title': 'Heading_2', 'css': 'wym_containers_h2'},
            {'name': 'h3', 'title': 'Heading_3', 'css': 'wym_containers_h3'},
            {'name': 'h4', 'title': 'Heading_4', 'css': 'wym_containers_h4'},
            {'name': 'pre', 'title': 'Preformatted', 'css': 'wym_containers_pre'},
        ],
        classesItems: [
            {'name': 'external', 'title': 'Link » extern', 'expr': 'a'},
            {'name': 'summary', 'title': 'Paragraph » Summary', 'expr': 'p'}
        ],
    });
});
