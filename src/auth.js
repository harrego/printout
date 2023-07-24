const crypto = require("crypto")

class Auth {
    token = null;
    dateIssued = null;

    constructor() {
        this.dateIssued = new Date()
    }

    generateToken() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(48, (err, buffer) => {
                if (err) {
                    reject(err)
                    return
                } else {
                    this.token = buffer.toString("hex")
                    resolve()  
                }
            })
        })
    }

    get json() {
        const json = {
            token: this.token,
            date_issued: this.dateIssued.toISOString()
        }
        return json
    }
}
exports.Auth = Auth