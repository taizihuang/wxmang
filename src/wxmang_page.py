import re, datetime, hashlib, sys, os, time, json
import pandas as pd
from mako.template import Template

def gen_index_page(data_dir, template_dir, index_dir):
    article_file = f"{data_dir}/wxmang_article.pkl"
    df_article = pd.read_pickle(article_file)
    art_li = []
    for idx in df_article.index:
        columns = ["art_id", "title", "publish_date"]
        art_id, title, publish_date = df_article.loc[idx, columns]
        art_date = publish_date.split(" ")[0]
        art_li.append((art_id, title, art_date))
    
    index_template_file = f"{template_dir}/wxmang_index.html"
    INDEX = Template(filename=index_template_file)
    html = INDEX.render(art_li=art_li)
    with open(f"{index_dir}/index.html", "w") as f:
        f.write(html)
    print(f"{index_dir}/index.html saved!")

def gen_single_page(art_id, df_article, df_comment, template_dir, html_dir):
    idx = df_article.loc[df_article["art_id"] == art_id].index[0]
    columns = ["title", "author", "publish_date", "content"]
    title, author, art_date, post = df_article.loc[idx, columns]
    post = post.replace("_x000d_", "").replace("_x000D_", "")
    art_li = [(title, author, art_date, post)]

    reply_li = []
    df_comment_id = df_comment.loc[df_comment["art_id"] == art_id]
    df_comment_id = df_comment_id.sort_values(by=["comment_date", "comment_name"])
    df_comment_id = df_comment_id.drop_duplicates(subset=["comment"], keep="first")
    for idx in df_comment_id.index:
        columns = ["comment_name", "comment", "comment_date", "reply_name", "reply", "reply_date"]
        comment_name, comment, comment_date, reply_name, reply, reply_date = df_comment_id.loc[idx, columns]
        uuid = (comment_date+reply_date).replace(" ", "").replace(":","").replace("-", "")
        comment = comment.replace("_x000d_", "").replace("_x000D_", "")
        reply = reply.replace("_x000d_", "").replace("_x000D_", "")
        reply_li.append((uuid, comment, reply, comment_name, comment_date, reply_date))
    
    article_template_file = f"{template_dir}/wxmang_page.html"
    html = Template(filename=article_template_file).render(art_li=art_li, reply_li=reply_li)
    with open(f"{html_dir}/{art_id}.html", "w", encoding="utf8") as f:
        f.write(html)
    print(f"{html_dir}/{art_id}.html saved!")

def gen_all_page(data_dir, template_dir, html_dir):
    article_file = f"{data_dir}/wxmang_article.pkl"
    comment_file = f"{data_dir}/wxmang_comment.pkl"

    df_article = pd.read_pickle(article_file)
    df_comment = pd.read_pickle(comment_file)
    for art_id in df_article["art_id"]:
        gen_single_page(art_id, df_article, df_comment, template_dir, html_dir)

def gen_search_data(data_dir, search_dir):
    article_file = f"{data_dir}/wxmang_article.pkl"
    comment_file = f"{data_dir}/wxmang_comment.pkl"
    df_article = pd.read_pickle(article_file)
    df_comment = pd.read_pickle(comment_file)

    article_list = []
    title_dict = {}
    for idx in df_article.index:
        columns = ["art_id", "title", "publish_date", "content"]
        id, title, publish_date, post = df_article.loc[idx, columns]
        post = post.replace("_x000d_", "").replace("_x000D_", "")
        article_list.append({"id": id, "title": title, "date": publish_date,
                             "post":post})
        title_dict[id] = title
    
    df_comment = df_comment.drop_duplicates(subset=['comment'], keep='first')
    comment_list = []
    for idx in df_comment.index:
        columns = ["art_id", "comment_name", "comment", "comment_date", "reply", "reply_date"]
        art_id, comment_name, comment, comment_date, reply, reply_date = df_comment.loc[idx, columns]
        if art_id in title_dict.keys():
            title = title_dict[art_id]
        else:
            title = art_id
        uuid = (comment_date+reply_date).replace(" ", "").replace(":","").replace("-", "")
        comment = comment.replace("_x000d_", "").replace("_x000D_", "")
        reply = reply.replace("_x000d_", "").replace("_x000D_", "")

        if len(reply) == 0:
            continue
        else:
            pass
        comment_list.append({"id": art_id,
                            "title": title,
                            "comment_name": comment_name,
                            "date": comment_date,
                            "comment": comment,
                            "reply": reply,
                            "uuid": uuid
                            })
    
    article_dict = {"article": article_list}
    with open(f"{search_dir}/article.json", "w") as f:
        f.write(json.dumps(article_dict, indent=4, ensure_ascii=False))
    
    for i in range(6):
        with open(f"{search_dir}/comment{i}.json", "w") as f:
            f.write(json.dumps({"comment": comment_list[(i*6000):(i+1)*6000]},
                               indent=4, ensure_ascii=False))
    print(f"{search_dir}/search.json saved!")

if __name__ == "__main__":
    index_dir       = ".."
    data_dir        = "../data"
    template_dir    = "./templates"
    html_dir        = "../html"
    search_dir      = "../search"

    gen_index_page(data_dir, template_dir, index_dir)
    # gen_all_page(data_dir, template_dir, html_dir)
    # gen_search_data(data_dir, search_dir)