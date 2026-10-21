const uploader = require("../../utilites/multipleUploader");

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_ATTACHMENTS = 5;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ATTACHMENT_TYPE_ERROR =
  "Only .jpg, .jpeg, .png, .webp or .gif images are allowed!";

function attachmentUpload(req, res, next) {
  const upload = uploader(
    "attachments",
    ALLOWED_ATTACHMENT_TYPES,
    MAX_ATTACHMENT_SIZE,
    MAX_ATTACHMENTS,
    ATTACHMENT_TYPE_ERROR,
  );

  // call the middleware function
  upload.any()(req, res, (err) => {
    if (err) {
      let message = err.message;
      if (err.code === "LIMIT_FILE_SIZE") {
        message = `File is too large! Maximum size per file is ${
          MAX_ATTACHMENT_SIZE / (1024 * 1024)
        } MB`;
      } else if (err.code === "LIMIT_FILE_COUNT") {
        message = `Maximum ${MAX_ATTACHMENTS} files can be attached at a time`;
      }

      res.status(400).json({
        errors: {
          attachment: {
            msg: message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = attachmentUpload;
