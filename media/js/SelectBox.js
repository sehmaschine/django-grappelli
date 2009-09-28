/*
var SelectBox = {
    cache: {},
    init: function(id) {
        var box = $('#'+ id).get(0);
        var node;
        SelectBox.cache[id] = [];
        var cache = SelectBox.cache[id];
        for (var i = 0; (node = box.options[i]); i++) {
            cache.push({value: node.value, text: node.text, displayed: 1});
        }
    },
    redisplay: function(id) {
        // Repopulate HTML select box from cache
        var box = $('#'+ id).find('option').remove().end();
        for (var i = 0, j = SelectBox.cache[id].length; i < j; i++) {
            var node = SelectBox.cache[id][i];
            if (node.displayed) {
                $('<option />').val(node.value).text(node.text).appendTo(box);
            }
        }
    },
    filter: function(id, text) {
        // Redisplay the HTML select box, displaying only the choices containing ALL
        // the words in text. (It's an AND search.)
        var tokens = text.toLowerCase().split(/\s+/);
        var node, token;
        for (var i = 0; (node = SelectBox.cache[id][i]); i++) {
            node.displayed = 1;
            for (var j = 0; (token = tokens[j]); j++) {
                if (node.text.toLowerCase().indexOf(token) == -1) {
                    node.displayed = 0;
                }
            }
        }
        SelectBox.redisplay(id);
    },
    delete_from_cache: function(id, value) {
        var node, delete_index = null;
        for (var i = 0; (node = SelectBox.cache[id][i]); i++) {
            if (node.value == value) {
                delete_index = i;
                break;
            }
        }
        var j = SelectBox.cache[id].length - 1;
        for (var i = delete_index; i < j; i++) {
            SelectBox.cache[id][i] = SelectBox.cache[id][i+1];
        }
        SelectBox.cache[id].length--;
    },
    add_to_cache: function(id, option) {
        SelectBox.cache[id].push({value: option.value, text: option.text, displayed: 1});
    },
    cache_contains: function(id, value) {
        // Check if an item is contained in the cache
        var node;
        for (var i = 0; (node = SelectBox.cache[id][i]); i++) {
            if (node.value == value) {
                return true;
            }
        }
        return false;
    },
    move: function(from, to) {
        $('#'+ from).find('option').each(function(){
            var $opt = $(this);
            if ($opt.attr('selected') && SelectBox.cache_contains(from, $opt.val())) {
                SelectBox.add_to_cache(to, {value: $opt.val(), text: $opt.text(), displayed: 1});
                SelectBox.delete_from_cache(from, $opt.val());
            }
        });
        SelectBox.redisplay(from);
        SelectBox.redisplay(to);
    },
    move_all: function(from, to) {
        $('#'+ from).find('option').each(function(){
            var $opt = $(this);
            if (SelectBox.cache_contains(from, $opt.val())) {
                SelectBox.add_to_cache(to, {value: $opt.val(), text: $opt.text(), displayed: 1});
                SelectBox.delete_from_cache(from, $opt.val());
            }
        });
        SelectBox.redisplay(from);
        SelectBox.redisplay(to);
    },
    sort: function(id) {
        SelectBox.cache[id].sort( function(a, b) {
            a = a.text.toLowerCase();
            b = b.text.toLowerCase();
            try {
                if (a > b) return 1;
                if (a < b) return -1;
            }
            catch (e) {} // silently fail on IE 'unknown' exception
            return 0;
        } );
    },
    select_all: function(id) {
        $('#'+ id +' option').attr('selected', 'selected');
    }
}
*/
