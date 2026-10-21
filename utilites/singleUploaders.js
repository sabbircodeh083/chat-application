//external import
const path = require("path");
const multer = require("multer");
const create = require("http-errors");

//internal import

const uploader = function (subfolder, fileTypes, fileSize, errorMessage) {
  const filedirectory = path.join(
    __dirname,
    `../public/uploads/${subfolder}`,
  );

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, filedirectory);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .split(" ")
          .join("_")
          .toLowerCase() +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: fileSize,
    },
    fileFilter: (req, file, cb) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(create(errorMessage));
      }
    },
  });

  return upload;
};

module.exports = uploader;
