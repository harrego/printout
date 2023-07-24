const { Post } = require("./src/post")

const db = require("better-sqlite3")("db.sqlite3")
const dbHelper = require("./src/db")
dbHelper.setup(db)

var examplePost = new Post("An Example Post")
examplePost.setMarkdownContent("# example")
console.log(examplePost.getHTMLContent())
console.log(examplePost)

// dbHelper.insertPost(db, examplePost)

console.log(dbHelper.getRecentPosts(db))