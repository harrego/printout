const { Post } = require("./post")
const { Auth } = require("./auth")

function setup(db) {
    db.prepare(`CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date_published DATETIME NOT NULL,
        date_updated DATETIME,
        author_name TEXT,
        body TEXT,
        body_type TEXT,
        summary TEXT,
        link TEXT
    )`).run()

    db.prepare(`CREATE TABLE IF NOT EXISTS auth (
        token TEXT PRIMARY KEY,
        date_issued DATETIME NOT NULL
    )`).run()
}
exports.setup = setup

function insertPost(db, post) {
    const postJson = post.json
    db.prepare(`INSERT INTO posts (
        id,
        title,
        date_published,
        date_updated,
        author_name,
        body,
        body_type,
        summary,
        link
    ) VALUES (
        @id,
        @title,
        @date_published,
        @date_updated,
        @author_name,
        @body,
        @body_type,
        @summary,
        @link
    )`).run(postJson)
}
exports.insertPost = insertPost

function serializePostRow(row) {
    const post = new Post(row.title, new Date(row.date_published))
    post.id = row.id
    if (post.dateUpdated) {
        post.dateUpdated = new Date(row.date_updated)
    }
    post.authorName = row.author_name
    post.body = row.body
    post.bodyType = row.body_type
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

function insertAuthToken(db, auth) {
    const authJson = auth.json
    db.prepare("INSERT INTO auth (token, date_issued) VALUES (@token, @date_issued)").run(authJson)
}
exports.insertAuthToken = insertAuthToken

function serializeAuthRow(row) {
    const auth = new Auth()
    auth.token = row.token
    auth.dateIssued = new Date(row.date_issued)
    return auth
}
function getAuthFromToken(db, token) {
    const row = db.prepare("SELECT * FROM auth WHERE token = ?").get(token)
    if (row == null) {
        return null
    }
    return serializeAuthRow(row)
}
exports.getAuthFromToken = getAuthFromToken