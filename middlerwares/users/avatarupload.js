const multer = require("multer");

//internal import
const singleUploaders = require("../../utilites/singleUploaders");

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const AVATAR_TYPE_ERROR =
  "Only .jpg, .jpeg, .png, .webp or .gif images are allowed!";

function avatarUpload(req, res, next) {
  const upload = singleUploaders(
    "avatars",
    ALLOWED_AVATAR_TYPES,
    MAX_AVATAR_SIZE,
    AVATAR_TYPE_ERROR,
  );

  upload.any()(req, res, (err) => {
    if (err) {
      let message = err.message;
      if (err.code === "LIMIT_FILE_SIZE") {
        message = `Image is too large! Maximum allowed size is ${
          MAX_AVATAR_SIZE / (1024 * 1024)
        } MB`;
      }
      res.status(400).json({
        errors: {
          avatar: {
            msg: message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = avatarUpload;
