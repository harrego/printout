const express = require("express")
const router = express.Router()

const dbHelper = require("../src/db")

const url = "http://localhost:3000"

router.get("/:token/atom.xml", (req, res) => {
    function reject() {
        res.status(404).send("<p>no auth</p>")
    }
    const token = req.params.token
    if (!token) {
        reject()
        return
    }
    const auth = dbHelper.getAuthFromToken(req.app.get("db"), token)
    if (!auth) {
        reject()
        return
    }

    const db = req.app.get("db")
    var lastUpdated = null
    const posts = dbHelper.getRecentPosts(db).map(post => {
        if (lastUpdated == null) {
            lastUpdated = post.dateUpdated || post.datePublished
        }
        if (post.dateUpdated && post.dateUpdated > lastUpdated) {
            lastUpdated = post.dateUpdated
        } else if (post.datePublished > lastUpdated) {
            lastUpdated = post.datePublished
        }

        const data = post.json
        data.link = `${url}/post/${data.id}`
        data.body_html = post.getHTMLBody()
        return data
    })
    const render = {
        feed: {
            name: "Feed Name",
            author: "Feed Author",
            link: `${url}/feed/${token}/atom.xml`,
            last_updated: lastUpdated.toISOString(),
            icon_url: `${url}/static/icon.png`
        },
        posts: posts
    }

    res.set("Content-Type", "application/atom+xml; charset=utf-8")
    res.render("atom", render)
})


module.exports = router
