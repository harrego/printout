const errors = {
    unknown: {
        code: 0,
        title: "Unknown Error",
        body: "An unknown error has occured."
    },
    invalidCredentials: {
        code: 1,
        title: "Invalid Credentials",
        body: "Invalid credentials were provided."
    },
    invalidToken: {
        code: 2,
        title: "Invalid Token",
        body: "An invalid token was provided."
    },
    invalidAuthorization: {
        code: 3,
        title: "Invalid Authentication",
        body: "Invalid authentication header."
    },
    missingTitle: {
        code: 4,
        title: "Missing Title",
        body: "Post is missing a required title."
    },
    missingBody: {
        code: 5,
        title: "Missing Body",
        body: "Post is missing a required body."
    },
    missingBodyType: {
        code: 6,
        title: "Missing Body Type",
        body: "Post is missing a required body type."
    },
    invalidBodyType: {
        code: 7,
        title: "Invalid Body Type",
        body: "Unsupported body type."
    },
    databaseError: {
        code: 8,
        title: "Database Error",
        body: "An unknown database error occurred."
    },
    duplicateId: {
        code: 9,
        title: "Duplicate ID",
        body: "Post with ID already exists."
    },
    invalidId: {
        code: 10,
        title: "Invalid ID",
        body: "Post ID should only contain alphanumeric characters and dashes."
    }
}
exports.errors = errors

function errorBody(error = undefined) {
    if (error == undefined) {
        error = errors.unknown
    }
    return {
        success: false,
        error: error
    }
}
exports.errorBody = errorBody