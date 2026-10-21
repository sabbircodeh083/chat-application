const User = require("../../model/People");
const path = require("path");
const { unlink } = require("fs");

const addUser = async (user, cb) => {
  try {
    const newUser = new User(user);
    const result = await newUser.save();
    cb(false, null);
  } catch (err) {
    console.log(err);
    cb(true, err);
  }
};

const getAllUsers = async (cb) => {
  try {
    const result = await User.find();
    cb(false, null);
    return result;
  } catch (err) {
    console.log(err);
    cb(true, err);
  }
};

const removeUser = async (userId, cb) => {
  try {
    const result = await User.findByIdAndDelete({ _id: userId });
    if (result.avatar) {
      unlink(
        path.join(
          __dirname,
          `../../public/uploads/avatars/${result.avatar}`,
          (err) => {
            console.log(err);
            cb(true, err);
          },
        ),
      );
    }
    cb(false, null);
  } catch (err) {
    console.log(err);
    cb(true, err);
  }
};
module.exports = { addUser, getAllUsers, removeUser };
