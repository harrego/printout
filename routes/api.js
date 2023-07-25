const express = require("express")
const router = express.Router()

const http = require("../src/http")
const dbHelper = require("../src/db")

const { Post } = require("../src/post")
const { Auth } = require("../src/auth")

router.post("/login", async (req, res) => {
    const password = req.body.password
    if (!password || password != "password") {
        res.status(400).send(http.errorBody(http.errors.invalidCredentials))
        return
    }
    const auth = new Auth()
    try {
        const db = req.app.get("db")
        await auth.generateToken()
        dbHelper.insertAuthToken(db, auth)
        res.cookie("token", auth.token, { httpOnly: true })
        res.send({
            success: true,
            token: auth.token
        })
    } catch (err) {
        console.log(err)
        res.status(500).send(http.errorBody(http.errors.unknown))
        return
    }
})

router.use((req, res, next) => {
    function rejectAuthorization() {
        res.clearCookie("token")
        res.status(400).send(http.errorBody(http.errors.invalidAuthorization))
    }
    function reject() {
        res.clearCookie("token")
        res.status(400).send(http.errorBody(http.errors.invalidToken))
    }
    const authHeader = req.get("Authorization")
    if (!authHeader) {
        rejectAuthorization()
        return
    }
    const authSplit = authHeader.split(" ")
    if (authSplit.length != 2) {
        rejectAuthorization()
        return
    }
    const authType = authSplit[0]
    const token = authSplit[1]
    if (authType != "Bearer" || !token || token == "") {
        reject()
        return
    }
    const auth = dbHelper.getAuthFromToken(req.app.get("db"), token)
    if (!auth) {
        reject()
        return
    }
    req.auth = auth
    next()
})

router.get("/info", (req, res) => {
    res.send({
        success: true,
        auth: {
            token: req.auth.token,
            date_issued: req.auth.dateIssued.toISOString()
        }
    })
})

router.get("/posts", (req, res) => {
    const db = req.app.get("db")
    const posts = dbHelper.getRecentPosts(db)
    const jsonPosts = posts.map(post => post.json)
    res.send({
        success: true,
        posts: jsonPosts
    })
})

router.post("/post", (req, res) => {
    function reject(error) {
        res.status(400).send(http.errorBody(error))
    }
    if (!req.body.title) { reject(http.errors.missingTitle); return }
    if (!req.body.body) { reject(http.errors.missingBody); return }
    if (!req.body.body_type) { reject(http.errors.missingBodyType); return }

    const post = new Post(req.body.title)
    if (req.body.body_type == "markdown") {
        post.setMarkdownBody(req.body.body)
    } else {
        reject(http.errors.invalidBodyType)
        return
    }

    if (req.body.id == "" || req.body.id) {
        let id = req.body.id.toLowerCase()
        if (id.length == 0 || !/^[a-z0-9-]+$/g.test(id)) {
            reject(http.errors.invalidId)
            return
        }
        post.id = id
    }
    if (req.body.author_name) { post.authorName = req.body.author_name }
    if (req.body.summary) { post.summary = req.body.summary }
    if (req.body.link) { post.link = req.body.link }

    const db = req.app.get("db")

    const existingPost = dbHelper.getPostFromID(db, post.id)
    if (existingPost) {
        reject(http.errors.duplicateId)
        return
    }

    try {
        dbHelper.insertPost(db, post)
    } catch (err) {
        console.log(err)
        reject(http.errors.databaseError)
        return
    }

    res.send({ success: true, post: post.json })
})

module.exports = router
