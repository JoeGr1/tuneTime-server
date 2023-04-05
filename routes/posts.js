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
    artist_name,
    album_name,
    album_cover,
    song_duration,
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
    Object.keys(req.body).length > 8
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
      ],
    });
  }

  try {
    const newPost = req.body;
    console.log(newPost);
    await knex("posts").insert(newPost);
    res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not Add post Righ Now`);
  }
});

module.exports = router;
