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

const urlPrefix = "printout"
const url = `http://localhost:3000/${urlPrefix}`

app.set("urlPrefix", urlPrefix)
app.set("url", url)

app.set("db", db)

app.get("/login", (req, res) => {
    res.render("app/login", {})
})

app.use((req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        res.redirect("/login")
        return
    }
    const auth = dbHelper.getAuthFromToken(req.app.get("db"), token)
    if (!auth) {
        res.clearCookie("token")
        res.redirect("/login")
    }
    next()
})

app.get("/", (req, res) => {
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

app.get("/feed", (req, res) => {
    const token = req.cookies.token
    const feedLink = `${url}/feed/${token}/atom.xml`
    res.render("app/feed", { page: "feed", feed_link: feedLink })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`running on port ${port}`)
})