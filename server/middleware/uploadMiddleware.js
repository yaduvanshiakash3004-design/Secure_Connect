// ======================================================
// SecureConnect
// File Upload Middleware
// Developed By : Akash Yadav
// ======================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads"
);

// Create uploads folder automatically
if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        cb
    ) {

        cb(
            null,
            uploadDirectory
        );

    },

    filename: function (
        req,
        file,
        cb
    ) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            );

        const extension =
            path.extname(
                file.originalname
            );

        cb(
            null,
            uniqueName + extension
        );

    }

});

// ======================================================
// ALLOWED FILE TYPES
// ======================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedTypes = [

        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",

        // PDF
        "application/pdf",

        // Text
        "text/plain",

        // Word
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        // Excel
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        // PowerPoint
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Unsupported file type"
            ),
            false
        );

    }

};

// ======================================================
// MULTER
// Maximum file size: 10 MB
// ======================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            10 * 1024 * 1024

    }

});

// ======================================================
// EXPORT
// ======================================================

module.exports = upload;