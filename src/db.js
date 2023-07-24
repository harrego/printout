const { Post } = require("./post")

function setup(db) {
    db.prepare(`CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date_published DATETIME NOT NULL,
        date_updated DATETIME,
        author_name TEXT,
        content TEXT,
        content_type TEXT,
        summary TEXT,
        link TEXT
    )`).run()
}
exports.setup = setup

function insertPost(db, post) {
    const postObject = post.object
    db.prepare(`INSERT INTO posts (
        id,
        title,
        date_published,
        date_updated,
        author_name,
        content,
        content_type,
        summary,
        link
    ) VALUES (
        @id,
        @title,
        @datePublished,
        @dateUpdated,
        @authorName,
        @content,
        @contentType,
        @summary,
        @link
    )`).run(postObject)
}
exports.insertPost = insertPost

function serializePostRow(row) {
    const post = new Post(row.title, new Date(row.date_published))
    post.id = row.id
    if (post.dateUpdated) {
        post.dateUpdated = new Date(row.date_updated)
    }
    post.authorName = row.author_name
    post.content = row.content
    post.contentType = row.content_type
    post.summary = row.summary
    post.link = row.link
    return post
}

function getPostFromID(db, id) {
    const postRow = db.prepare(`SELECT * FROM posts WHERE id = ?`, id).get(id)
    if (postRow == null) {
        return null
    }
    return serializePostRow(postRow)
}
exports.getPostFromID = getPostFromID

function getRecentPosts(db, limit = 30) {
    const rows = db.prepare("SELECT * FROM posts ORDER BY date_published DESC LIMIT ?").all(limit)
    const posts = rows.reduce((arr, row) => {
        const serialized = serializePostRow(row)
        if (serialized != null || serialized != undefined) {
            arr.push(serialized)
        }
        return arr
    }, [])
    return posts
}
exports.getRecentPosts = getRecentPosts