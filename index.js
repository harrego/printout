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