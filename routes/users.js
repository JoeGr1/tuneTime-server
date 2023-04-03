const knex = require("knex")(require("../knexfile"));
const express = require("express");
const router = express.Router();

// get single user by id

//get users by name for search

// front end search axios request

// const searchUsers = async () => {
//   re;
// };

router.get("/search/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  try {
    const usersBySearch = await knex
      .select("*")
      .from("users")
      .where("user_name", "like", `%${searchTerm}%`);
    res.json(usersBySearch);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error Searching for user: ${searchTerm} `);
  }
});

//get users by following_id

//delete user by id

module.exports = router;
