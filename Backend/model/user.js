import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // NEW PHONE FIELD
    phone: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },

    password: {
      type: String,
      required: true
    },

    confirmpassword: {
      type: String,
      required: true
    },

    terms: {
      type: Boolean,
      default: false
    },

    resetPasswordToken: {
      type: String,
      default: undefined
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;