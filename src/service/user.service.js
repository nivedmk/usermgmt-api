const User = require("../models/users");
const fs = require("fs");
const { parse } = require("csv-parse");
const triggerMail = require("../utils/sendInBlue");

async function parsecsv() {
  try {
    const users = await readFile();
    users.forEach((user) => {
      triggerMail(user);
    });
    return await User.insertMany(users);
  } catch (err) {
    return err;
  }
}

function readFile() {
  try {
    return new Promise((resolve, reject) => {
      let users = [];
      fs.createReadStream("./assets/FCT-EMP-LIST.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
          let user = {
            userName: row[0],
            email: row[1],
            dateOfJoin: row[2],
            password: row[3],
            isSuperUser: row[4],
          };
          users.push(user);
        })
        .on("end", function () {
          resolve(users);
        })
        .on("error", function (error) {
          reject(error.message);
        });
    });
    // return users;
  } catch (err) {
    throw new Error(err);
  }
}

async function getAllUsers() {
  return await User.find({});
}

async function findUser(_id) {
  try {
    const user = await User.findById({ _id });

    if (!user) {
      throw new Error("No User found");
    }

    return user;
  } catch (err) {
    throw new Error(err);
  }
}

async function addNewUser(user) {
  try {
    triggerMail(user);
    const res = await new User(user).save();
    const token = await res.generateAuthToken();
    return { user: res, token, message: "SUCCESS" };
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  parsecsv,
  getAllUsers,
  findUser,
  addNewUser,
};
