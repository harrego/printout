const { Post } = require("./src/post")
const { Auth } = require("./src/auth")

const express = require("express")
const app = express()

const http = require("./src/http")

const bodyParser = require("body-parser")
app.use(bodyParser.json())

const cookieParser = require("cookie-parser")
app.use(cookieParser())

app.use("/api", require("./routes/api"))
app.use("/feed", require("./routes/feed"))
app.set("view engine", "ejs")

app.use("/static", express.static("static"))

const db = require("better-sqlite3")("db.sqlite3")
const dbHelper = require("./src/db")
dbHelper.setup(db)

app.set("db", db)

app.get("/login", (req, res) => {
    res.render("app/login", {})
})

app.get("/", (req, res) => {
    res.render("app/index", {})
})

app.get("/posts", (req, res) => {
    const db = req.app.get("db")
    var posts = dbHelper.getRecentPosts(db)

    posts.forEach(post => {
        const date = post.datePublished
        const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
        post.datePublishedString = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    })

    res.render("app/posts", { page: "posts", posts: posts })
})

app.get("/new", (req, res) => {
    res.render("app/new", { page: "new" })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`running on port ${port}`)
})