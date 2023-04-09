const knex = require("knex")(require("../knexfile"));
const express = require("express");
const router = express.Router();

// get comments by post id ( with user names )

router.get("/:id", async (req, res) => {
  const postId = req.params.id;
  console.log("here");

  try {
    const getPostsComments = await knex
      .select("*")
      .from("comments")
      .where("post_id", "=", postId);
    res.status(200).json(getPostsComments);
  } catch (error) {
    console.log(error);
    res.status(500).json(`Error Finding commnets for Post:${postId}`);
  }
});

// post comments by post id

router.post("/", async (req, res) => {
  const { post_id, spotify_id, user_name, content } = req.body;

  if (
    !post_id ||
    !spotify_id ||
    !user_name ||
    !content ||
    Object.keys(req.body).length > 4
  ) {
    res.status(400).json({
      error: "true",
      message: "Incomplete POST body",
      requiredProperties: ["post_id", "spotify_id", "user_name", "content"],
    });
  }

  try {
    const newComment = {
      post_id: Number(post_id),
      spotify_id,
      user_name,
      content,
    };
    await knex("comments").insert(newComment);
    res.status(200).json(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).json(`Could not add comment to Post`);
  }
});

// delete comment by comment id

router.delete("/:comment_id", async (req, res) => {
  const commentId = req.params.comment_id;

  try {
    await knex("comments").where("id", "=", commentId).del();
    res.status(200).json(commentId).end();
  } catch (error) {
    console.log(error);
    res.status(200).json(`Error could not find Comment: ${commentId}`);
  }
});

module.exports = router;
