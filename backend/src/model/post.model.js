import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    image: String,

    caption: String,

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text: String,
        createdAt: Date
    }]
});
const postmodel = mongoose.model("Post", postSchema);
export default postmodel;
