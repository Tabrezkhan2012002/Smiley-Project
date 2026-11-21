import postmodel from "../../model/post.model.js";
import Usermodel from "../../model/user.model.js";
import uploadcloudinary from "../../utilities/Cloudinary.js";
export const createPost = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image",
            });
        }


        const user = await Usermodel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const result = await uploadcloudinary(req.file.path, "Post");
        console.log("req.user =", req.user);

        const post = await postmodel.create({
            user: req.user.id,
            image: result.secure_url,
            caption: req.body.caption
        });

        console.log("Saved post =", post);

        res.status(201).json(post);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to edit this post" });
        }

        post.caption = req.body.caption ?? post.caption;
        post.image = req.body.image ?? post.image;

        await post.save();

        res.status(200).json(post);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const user = await Usermodel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        await post.deleteOne();

        res.status(200).json({ message: "Deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Like / Unlike a post (toggle)
export const toggleLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.some(
            (userId) => userId.toString() === req.userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (userId) => userId.toString() !== req.userId
            );
        } else {
            post.likes.push(req.userId);
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likesCount: post.likes.length,
            likes: post.likes
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (!req.body.text || !req.body.text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const comment = {
            user: req.userId,
            text: req.body.text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json(post.comments[post.comments.length - 1]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete a comment from a post
export const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // only comment author or post owner can delete
        if (
            comment.user.toString() !== req.userId &&
            post.user.toString() !== req.userId
        ) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        comment.deleteOne();
        await post.save();

        res.status(200).json({ message: "Comment deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}