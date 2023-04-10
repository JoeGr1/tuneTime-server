const knex = require("knex")(require("../knexfile"));
const express = require("express");
const router = express.Router();

// get most recent post by following id (feed)

router.get("/feed/:id", async (req, res) => {
  const user_id = req.params.id;

  try {
    const usersFollowing = await knex
      .select("following_id")
      .from("following")
      .where("spotify_id", "=", user_id);

    const followingIds = usersFollowing.map((user) => user.following_id);

    const followingPosts = await knex
      .select("*")
      .from("posts")
      .whereIn("spotify_id", followingIds);

    // Keep track of which post user we've already dealt with
    const usersAlreadyAdded = [];
    const mostRecentPosts = [];

    followingPosts
      .sort((a, b) => b.id - a.id)
      .forEach((post) => {
        if (!usersAlreadyAdded.includes(post.user_name)) {
          mostRecentPosts.push(post);
        }

        usersAlreadyAdded.push(post.user_name);
      });

    // Push the name to the

    res.status(200).json(mostRecentPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not find Users Following Posts`);
  }
});

// get posts by users id (profile && followings profile)

router.get("/:user_id", async (req, res) => {
  const userId = req.params.user_id;

  try {
    const getUserPosts = await knex("posts").where("spotify_id", "=", userId);
    res.status(200).json(getUserPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could Not Retreive Users Posts`);
  }
});

//get single post by id

router.get("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const getPost = await knex("posts").where("id", "=", postId);
    res.status(200).json(getPost);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could Not Retrieve Post`);
  }
});

// post Posts

router.post("/", async (req, res) => {
  const {
    spotify_id,
    user_name,
    song_name,
    song_id,
    preview_url,
    artist_name,
    album_name,
    album_cover,
    song_duration,
    likes,
  } = req.body;

  // Check body of POST request is ONLY what is expected
  if (
    !spotify_id ||
    !user_name ||
    !song_name ||
    !song_id ||
    !preview_url ||
    !artist_name ||
    !album_name ||
    !album_cover ||
    !song_duration ||
    !likes ||
    Object.keys(req.body).length > 10
  ) {
    return res.status(400).json({
      error: "true",
      message: "Incomplete POST body",
      requiredProperties: [
        "spotify_id",
        "user_name",
        "song_name",
        "song_id",
        "preview_url",
        "artist_name",
        "album_name",
        "album_cover",
        "song_duration",
        "likes",
      ],
    });
  }

  try {
    const newPost = {
      spotify_id,
      user_name,
      song_name,
      song_id,
      preview_url,
      artist_name,
      album_name,
      album_cover,
      song_duration,
      likes: Number(likes),
    };
    console.log(newPost);
    await knex("posts").insert(newPost);
    res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not Add post Righ Now`);
  }
});

// check if user has liked post

router.get("/:post_id/liked/:user_id", async (req, res) => {
  const postId = req.params.post_id;
  const spotifyId = req.params.user_id;

  try {
    const result = await knex("likes")
      .where({
        post_id: postId,
        spotify_id: spotifyId,
      })
      .select("id");

    if (result.length > 0) {
      res.status(200).json({ liked: true });
    } else {
      res.status(200).json({ liked: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not retrieve likes for post ${postId}`);
  }
});

// like post
router.post("/:id/like", async (req, res) => {
  const postId = req.params.id;
  const { spotify_id } = req.body;

  try {
    // check if user has already liked the post
    const existingLike = await knex("likes")
      .where("post_id", "=", postId)
      .andWhere("spotify_id", "=", spotify_id)
      .first();

    if (existingLike) {
      return res.status(400).json({
        error: true,
        message: "User has already liked this post",
      });
    }

    // increment likes counter on the post
    await knex("posts").where("id", "=", postId).increment("likes", 1);

    // add like record to database
    await knex("likes").insert({ post_id: postId, spotify_id: spotify_id });

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not like post at this time`);
  }
});

// unlike post
router.post("/:id/unlike", async (req, res) => {
  const postId = req.params.id;
  const { spotify_id } = req.body;

  try {
    // check if user has already liked the post
    const existingLike = await knex("likes")
      .where("post_id", "=", postId)
      .andWhere("spotify_id", "=", spotify_id)
      .first();

    if (!existingLike) {
      return res.status(400).json({
        error: true,
        message: "User has not liked this post yet",
      });
    }

    // decrement likes counter on the post
    await knex("posts").where("id", "=", postId).decrement("likes", 1);

    // remove like record from database
    await knex("likes")
      .where("post_id", "=", postId)
      .andWhere("spotify_id", "=", spotify_id)
      .del();

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not unlike post at this time`);
  }
});

module.exports = router;
