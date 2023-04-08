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
  console.log(req.body);
  console.log(typeof req.body.likes);
  const {
    spotify_id,
    user_name,
    song_name,
    song_id,
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
    !artist_name ||
    !album_name ||
    !album_cover ||
    !song_duration ||
    !likes ||
    Object.keys(req.body).length > 9
  ) {
    return res.status(400).json({
      error: "true",
      message: "Incomplete POST body",
      requiredProperties: [
        "spotify_id",
        "user_name",
        "song_name",
        "song_id",
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

// like/unlike post

router.put("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await knex("posts").where("id", "=", postId).first();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { liked } = req.body;

    if (liked) {
      post.likes += 1;
    } else {
      post.likes -= 1;
    }

    await knex("posts").where("id", "=", postId).update({
      likes: post.likes,
    });

    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not Update Post Right Now`);
  }
});

module.exports = router;
