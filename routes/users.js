const knex = require("knex")(require("../knexfile"));
const express = require("express");
const router = express.Router();

// router.use(express.json());

// POST check user exists/ create user

router.post("/create-user", async (req, res) => {
  const { spotify_id, user_name } = req.body;

  const exists = await knex("users").where({ spotify_id: req.body.spotify_id });

  if (exists.length) {
    const user = { spotify_id: spotify_id, user_name: user_name };
    return res.status(200).json(user);
  }

  if (!spotify_id || !user_name) {
    return res.status(400).json("User must have an Id and Username");
  }

  try {
    const user = { spotify_id: spotify_id, user_name: user_name };
    await knex("users").insert(user);
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error: Could not add User to Database");
  }
});

// get single user by id

router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const getUserProfile = await knex("users").where({ spotify_id: userId });

    if (!userId.length) {
      res.status(404).json(`Could not find user with Spotify_id: ${userId}`);
    }

    res.status(200).json(getUserProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could not fetch User from Database`);
  }
});

//get users by name for search

router.get("/search/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  try {
    const usersBySearch = await knex
      .select("*")
      .from("users")
      .where("user_name", "like", `%${searchTerm}%`);

    if (!usersBySearch.length) {
      res.status(404).json("No mathcing Users");
      return;
    }

    res.status(200).json(usersBySearch);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error Searching for user: ${searchTerm} `);
  }
});

// get list of users that follow a profile (follower list)

router.get("/followers/:spotify_id", async (req, res) => {
  const spotify_id = req.params.spotify_id;
  try {
    const followers = await knex
      .select("*")
      .from("users")
      .join("following", "users.spotify_id", "=", "following.spotify_id")
      .where("following.following_id", spotify_id);

    if (!followers.length) {
      res.status(404).json("No followers found for the user");
      return;
    }

    res.status(200).json(followers);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error getting followers for user: ${spotify_id}`);
  }
});

// get a list of users followed by a profile (following list)

router.get("/following/:spotify_id", async (req, res) => {
  const spotify_id = req.params.spotify_id;
  try {
    const followers = await knex
      .select("*")
      .from("users")
      .join("following", "users.spotify_id", "=", "following.following_id")
      .where("following.spotify_id", spotify_id);

    if (!followers.length) {
      res.status(404).json("No followers found for the user");
      return;
    }

    res.status(200).json(followers);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error getting followers for user: ${spotify_id}`);
  }
});

//delete user by id

router.delete("/:id", async (req, res) => {
  const currentUserId = req.params.id;

  try {
    await knex("users").where({ spotify_id: currentUserId }).del();
    res.status(200).json(currentUserId).end();
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error Could not find Following List`);
  }
});

module.exports = router;
