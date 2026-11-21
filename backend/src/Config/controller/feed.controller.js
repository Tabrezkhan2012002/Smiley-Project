import postmodel from "../../model/post.model.js";
import Usermodel from "../../model/user.model.js";

export const getAllPosts = async (req, res) => {
  try {
    // Current page
    const page = Number(req.query.page) || 1;

    // Number of posts per page
    const limit = 5;


    const skip = (page - 1) * limit;

    // Total posts in database
    const totalPosts = await postmodel.countDocuments();

    // Fetch posts
    const posts = await postmodel
      .find()
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username fullName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Check if more posts exist
    const hasMore = skip + posts.length < totalPosts;

    return res.status(200).json({
      posts,
      currentPage: page,
      totalPosts,
      hasMore,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// Get a single post by ID
export const getprofile = async (req, res) => {

  try {

    const userId = req.params.id;

    const user = await Usermodel.findById(userId);

    const posts = await postmodel.find({

      user: userId

    });

    res.json({

      user,

      posts,

      // followers: user.followers.length

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

}
// Get all posts by a specific user
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}