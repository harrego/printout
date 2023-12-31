const sanitizeHtml = require("sanitize-html")
const marked = require("marked")

marked.use({
    mangle: false,
    headerIds: false
})

class Post {
    id = null
    title = null
    datePublished = null
    dateUpdated = null
    authorName = null
    body = null
    bodyType = null
    summary = null
    link = null

    constructor(title, datePublished = new Date()) {
        this.title = title
        this.datePublished = datePublished

        const titleId = title
            .trim()
            .toLowerCase()
            .replace(/[\s_]/g, "-")
            .replace(/[^0-9a-z-]/g, "")
        var date = new Date()
        var day = ("0" + date.getDate()).slice(-2)
        var month = ("0" + (date.getMonth()+1)).slice(-2)
        this.id = `${date.getFullYear()}-${month}-${day}-${titleId}`
    }

    setMarkdownBody(body) {
        this.body = body
        this.bodyType = "markdown"
    }

    getHTMLBody() {
        if (this.bodyType == "markdown") {
            const html = sanitizeHtml(marked.parse(this.body))
            return html
        } else {
            return null
        }
    }

    get json() {
        const json = {
            id: this.id,
            title: this.title,
            date_published: this.datePublished.toISOString(),
            date_updated: null,
            author_name: this.authorName,
            body: this.body,
            body_type: this.bodyType,
            summary: this.summary,
            link: this.link
        }
        if (this.dateUpdated) {
            json.date_updated = this.dateUpdated.toISOString()
        }
        return json
    }
}
exports.Post = Post