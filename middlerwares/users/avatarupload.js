const multer = require("multer");

//internal import
const singleUploaders = require("../../utilites/singleUploaders");

function avatarUpload(req, res, next) {
  const upload = singleUploaders(
    "avatars",
    ["image/png", "image/jpeg"],
    100000,
    "Only .jpg, jpeg or .png format allowed!",
  );

  upload.any()(req, res, (err) => {
    if (err) {
      res.status(400).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = avatarUpload;
