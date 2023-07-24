const sanitizeHtml = require("sanitize-html")
const marked = require("marked")
const { v4: uuidv4 } = require("uuid")

class Post {
    id = null;
    title = null;
    datePublished = null;
    dateUpdated = null;
    authorName = null;
    content = null;
    contentType = null;
    summary = null;
    link = null;

    constructor(title, datePublished = new Date()) {
        this.title = title
        this.datePublished = datePublished

        const date = datePublished
        const titleId = title
            .trim()
            .toLowerCase()
            .replace(/[\s_]/g, "-")
            .replace(/[^0-9a-z-]/g, "")
        this.id = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${titleId}`
    }

    setMarkdownContent(content) {
        this.content = content
        this.contentType = "markdown"
    }

    getHTMLContent() {
        if (this.contentType == "markdown") {
            const html = sanitizeHtml(marked.parse(this.content))
            return html
        } else {
            return null
        }
    }

    get object() {
        const { ...object } = this
        if (this.datePublished) {
            object.datePublished = this.datePublished.toISOString()
        }
        if (this.dateUpdated) {
            object.dateUpdated = this.dateUpdated.toISOString()
        }
        return object
    }
}
exports.Post = Post