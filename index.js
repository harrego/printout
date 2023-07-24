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

const db = require("better-sqlite3")("db.sqlite3")
const dbHelper = require("./src/db")
dbHelper.setup(db)

app.set("db", db)

app.post("/login", async (req, res) => {
    const password = req.body.password
    if (!password || password != "password") {
        res.status(400).send(http.errorBody(http.errors.invalidCredentials))
        return
    }
    const auth = new Auth()
    try {
        await auth.generateToken()
        dbHelper.insertAuthToken(db, auth)
        res.cookie("token", auth.token)
        res.redirect("/")
    } catch (err) {
        console.log(err)
        res.status(500).send(http.errorBody(http.errors.unknown))
        return
    }
})

app.get("/logout", (req, res) => {

})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`running on port ${port}`)
})



// var examplePost = new Post("An Example Post")
// examplePost.setMarkdownContent("# example")
// console.log(examplePost.getHTMLContent())
// console.log(examplePost)

// // dbHelper.insertPost(db, examplePost)

// console.log(dbHelper.getRecentPosts(db))