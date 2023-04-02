const knex = require("knex")(require("../knexfile"));
const express = require("express");
const router = express.Router();

// get most recent post by following id (feed)

// front end axios call

const getFollowingsPosts = async () => {
  try {
    const response = await axios.get("hhtp://localhost:9090/feed", {
      params: { user_id: serverSession.sessionProfile.id },
    });
  } catch (err) {
    console.log(err);
  }
};

router.get("/feed", async (req, res) => {
  const user_id = req.query.user_id;

  try {
    const postsByFollowing = await knex
      .select("posts.*")
      .from("following")
      .join("posts", "following.following_id", "=", "posts.user_id")
      .where("following.user_id", "=", user_id)
      .orderBy("posts.updated_at", "desc")
      .groupBy("posts.user_id");
  } catch (err) {
    console.log(err);
  }
});

// get posts by users id (profile && followings profile)

//get single post by id

// post Posts user id
