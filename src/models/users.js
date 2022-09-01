const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Input the correct Email");
        }
      },
    },
    isSuperUser: {
      type: Boolean,
      default: false,
    },
    dateOfJoin: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot include password");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.tokens;
  delete userObject.password;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_KEY, {
    expiresIn: "1 days",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// model methords
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to fetch user");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password didn't match");
  }

  return user;
};

//Hashing
userSchema.pre("save", async function (next) {
  // Need to be a standard function cuz 'this' binding
  //making this as user for accessing individual instances
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre("insertMany", async function (next, docs) {
  if (Array.isArray(docs) && docs.length) {
    const hashedUsers = docs.map(async (user) => {
      return await new Promise((resolve, reject) => {
        bcrypt
          .genSalt(10)
          .then((salt) => {
            let password = user.password.toString();
            bcrypt
              .hash(password, salt)
              .then((hash) => {
                user.password = hash;
                resolve(user);
              })
              .catch((e) => {
                reject(e);
              });
          })
          .catch((e) => {
            reject(e);
          });
      });
    });
    docs = await Promise.all(hashedUsers);
    next();
  } else {
    return next(new Error("User list should not be empty")); // lookup early return pattern
  }
});

// userSchema.pre("remove", async function (req, res, next) {
//   const user = this;
//   await ToDo.deleteMany({ owner: user._id });

//   next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
