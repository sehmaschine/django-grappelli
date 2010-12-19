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
        // remove bookmark
        if ($(this).hasClass('bookmarked')) {
            $(this).removeClass('bookmarked');
            
            // remove bookmark li and set 
            $('li.bookmark ul li a[href="' + url + '"]').parent().remove();
            $('li.bookmark ul li').last().addClass("last");
            
            if (!$('li.bookmark ul li').length) {
                $('li.bookmark ul').remove();
                $('li.bookmark').addClass('disabled');
            }
            //Drop bookmark and switch form
            $.post(submit_url, $("#bookmark-form").serialize(), function(data) {
                $("#bookmark-form").replaceWith(data.replace('**title**', title));
            }, 'html');
        // add bookmark
        } else {
            new_title = prompt(prompt_msg, title);
            if (!new_title) {
                return;
            }
            $(this).addClass('bookmarked');
            
            var reinit_menu = false;
            
            if (!$('li.bookmark ul').length) {
                $('li.bookmark').append('<ul/>');
                // if the page was loaded with an empty bookmark list
                // a bunch of classes are missing
                $('li.bookmark')
                    .removeClass('disabled')
                    .addClass("collapse parent closed")
                    .find("a")
                    .addClass("parent collapse-handler");
                
                reinit_menu = true;
            }
            
            $('li.bookmark ul').append(
                '<li class="menu-item last"><a href="' + url + '">' + new_title + '</a></li>'
            );
            
            if (reinit_menu) {
                $('div#header .collapse.bookmark').grp_menu();
            }
            
            $('#bookmark-form input[name=title]').attr('value', new_title);
            // Save bookmark and switch form
            $.post(submit_url, $("#bookmark-form").serialize(), function(data) {
                $("#bookmark-form").replaceWith(data);
            }, 'html');
        }
    });
};
