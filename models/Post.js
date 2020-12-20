const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  // relation with user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    // refer to other schema (relation)
    ref: "user",
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      text: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
      data: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  data: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", PostSchema);
