/**
 * Save/remove bookmarks to/from the bookmark menu item and the database
 *
 * @param string url        The current page url path (request.get_full_path)
 * @param string title      The current page title
 * @param string prompt_msg The message to ask for prompting
 * @return void
 */
var process_bookmarks = function(url, title, prompt_msg) {
    var $ = django.jQuery;
    var new_title;
    $('#bookmark-button').live('click', function(e) {
        var submit_url = $("#bookmark-form").attr('action');
        e.preventDefault();
        if ($(this).hasClass('bookmarked')) {
            $(this).removeClass('bookmarked');
            $('#navigation-menu li.bookmark ul li a[href="' + url + '"]').parent().remove();
            if (!$('#navigation-menu li.bookmark ul li').length) {
                $('#navigation-menu li.bookmark ul').remove();
                $('#navigation-menu li.bookmark a span').remove();
                $('#navigation-menu li.bookmark').addClass('disabled');
            }
            //Drop bookmark and switch form
            $.post(submit_url, $("#bookmark-form").serialize(), function(data) {
                $("#bookmark-form").replaceWith(data.replace('**title**', title));
            }, 'html');
        } else {
            new_title = prompt(prompt_msg, title);
            if (!new_title) {
                return;
            }
            $(this).addClass('bookmarked');
            if (!$('#navigation-menu li.bookmark ul').length) {
                $('#navigation-menu li.bookmark a').prepend('<span class="icon"/>');
                $('#navigation-menu li.bookmark').append('<ul/>');
                $('#navigation-menu li.bookmark').removeClass('disabled');
            }
            $('li.bookmark ul').append(
                '<li><a href="' + url + '">' + new_title + '</a></li>'
            );
            $('#bookmark-form input[name=title]').attr('value', new_title);
            // Save bookmark and switch form
            $.post(submit_url, $("#bookmark-form").serialize(), function(data) {
                $("#bookmark-form").replaceWith(data);
            }, 'html');
        }
    });
};
