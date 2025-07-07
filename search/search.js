var tag_list = [];
var tag_dict = {};
var last_tag_dict = {};
var is_online = true;
var search_dir = ".";
var reply_str = "";
var comment_count = 0;

function enter_search(e) {
    if (e.keyCode == 13) {
        search();
    }
};

function search() {
    searchArticle();
    reply_str = "";
    comment_count = 0;
    searchComment(5);
}

function searchURL() {
    if (is_online) {
        is_online = false;
        search_dir = ".";
        $('label#offline-label')[0].style.backgroundColor = 'rgb(61, 151, 186)';
    } else {
        is_online = true;
        search_dir = "."
        $('label#offline-label')[0].style.backgroundColor = 'rgb(169, 182, 231)';
    }
}

function searchArticle() {
    var $input = $('#search-input')
    var $post = $('.POST_LI')
    var $post_count = $('.post_count')

    $.ajax({
        url: search_dir + "/article.json",
        method: 'GET',
        dataType: 'json',
        headers: {
            "accept": "application/json",
            // "Access-Control-Allow-Origin": "*"
        },
        beforeSend: function() {
            $post_count.html('<div id="load"> 文章 loading... </div>');
        },
        complete: function() {
            $("#load").remove();
        },
        success: function(jsonResponse) {
            var jsonData = JSON.parse(JSON.stringify(jsonResponse));
            if (tag_list.length == 0) {
                var articleData = jsonData.article.map(function(item) {
                    return {
                        title: item.title,
                        content: item.post,
                        url: item.id,
                        date: item.date
                    };
                });
                var post_count = 0;
                var post_str = '';
                var keywords = $input.val().trim().toLowerCase().split(/[\s\-]+/);
            
                articleData.forEach(function(data) {
                    var data_title = data.title.toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
                    var data_url = data.url;
                    var index_title = -1;
                    var isMatch = true;
                    var first_occur = -1;
                    keywords.forEach(function(keyword, i) {
                        index_title = data_title.indexOf(keyword);
                        index_content = data_content.indexOf(keyword);
                        if (index_title < 0 && index_content < 0) {
                            isMatch = false;
                        } else {
                            if (index_content < 0) {
                                index_content = 0;
                            }
                            if (i == 0) {
                                first_occur = index_content;
                            }
                        }
                    })
                    if (keywords[0]) {
                        if (isMatch) {
                            post_str += "<li class='article-result-item'><a href='../html/" + data_url + ".html' target='_blank' class='search-result-title'>" + post_count + ". " + data_title + "</a>";
                            var content = data.content.trim().replace(/<[^>]+>/g, "");
                            if (first_occur >= 0) {
                                var start = first_occur - 100;
                                if (start < 0) {
                                    start = 0;
                                }
                                var len = content.length - start;
                                //if (start == 0) {
                                //end = 100;
                                //}
                                if (len > 300) {
                                    len = 300;
                                }
                                var match_content = content.substr(start, len);
                                keywords.forEach(function(keyword) {
                                    var regS = new RegExp(keyword, "gi");
                                    match_content = match_content.replace(regS, "<b class=\"search-keyword\">" + keyword + "</b>");
                                });
                                post_str += "<p class=\"search-result\">" + match_content + "...</p>"
                                post_count += 1;
                            }
                            post_str += "</li>";
                        }
                    }
                });
                $post.html(post_str);
                $post_count.html('<a href="#post_li"> 搜索到 ' + post_count + " 篇文章</a>");
            } else {
                $post.html("");
                $post_count.html("");
            }
        }
    });
}

function searchComment(n) {
    var $input = $('#search-input')
    var $comment = $('.REPLY_LI')
    var $comment_count = $('.comment_count')
    last_tag_dict = {...tag_dict};
    tag_dict = {};

    $.ajax({
        url: search_dir + "/comment" + n + ".json",
        method: 'GET',
        dataType: 'json',
        headers: {
            "accept": "application/json",
            // "Access-Control-Allow-Origin": "*"
        },
        beforeSend: function() {
            $comment_count.html('<div id="load"> 问答 loading...</div>');
        },
        complete: function() {
            $("#load").remove();
        },
        success: function(jsonResponse) {
            var jsonData = JSON.parse(JSON.stringify(jsonResponse));
            var commentData = jsonData.comment.map(function(item) {
                return {
                    id: item.id,
                    title: item.title,
                    nickname: item.comment_name,
                    date: item.date,
                    comment: item.comment,
                    reply: item.reply,
                    tag: item.tag,
                    uuid: item.uuid,
                }
            }).filter(function(el){return Object.keys(el).length != 0});
            var keywords = $input.val().trim().toLowerCase().split(/[\s\-]+/);

            commentData.forEach(function(data) {
                var comment = data.comment.trim().toLowerCase();
                var reply = data.reply.trim().toLowerCase();
                var comment_url = data.id;
                var nickname = data.nickname;
                var uuid = data.uuid;
                var title = data.title;
                var date = data.date
                var index_comment = -1;
                var index_reply = -1;
                // var index_nickname = -1;
                // var index_uuid = -1;
                var isMatch = true;

                keywords.forEach(function(keyword, i) {
                    index_comment = comment.indexOf(keyword);
                    index_reply = reply.indexOf(keyword);
                    // index_nickname = nickname.toLowerCase().indexOf(keyword)
                    // index_uuid = uuid.indexOf(keyword)
                    if (index_comment < 0 && index_reply < 0) {
                        isMatch = false;
                    }
                });

                if (isMatch) {
                    keywords.forEach(function(keyword) {
                        if (keyword != ""){
                            var regS = new RegExp(keyword, "gi");
                            comment = comment.replace(regS, "<b class=\"search-keyword\">" + keyword + "</b>");
                            reply = reply.replace(regS, "<b class=\"search-keyword\">" + keyword + "</b>");
                        }
                    });
                    reply_str += "<div class='LI'><div class='USER'>";
                    reply_str += "<span class='NAME'>" + comment_count + "." + title + " | <a href='../html/" + comment_url + ".html#" + uuid + "' target='_blank'>" + nickname + "</a></span>";
                    reply_str += "<div class='TIME'>" + date + "</div></div>";
                    reply_str += "<div class='SAY'>" + comment.replace('\n','<br><br>') + "</div>"
                    reply_str += "<div class='REPLY'>" + reply.replace('\n','<br><br>') + "</div>"
                    reply_str += "</div></div>";
                    comment_count += 1
                }
            });
            if (n > 0) {
                searchComment(n-1);
            }
            $comment.html(reply_str);
            $comment_count.html('<a href="#reply_li">搜索到 ' + comment_count + " 条问答</a>");
        }
    });
}