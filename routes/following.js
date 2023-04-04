const knex = require("knex")(require("../knexfile"));
const express = require("express");
const router = express.Router();

// post new following userid and following user id

router.post("/", async (req, res) => {
  const { spotify_id, following_id } = req.body;

  if (!spotify_id || !following_id || Object.keys(req.body).length > 2) {
    res.status(400).json({
      error: "true",
      message: "Incomplete POST body",
      requiredProperties: ["spotify_id", "following_id"],
    });
  }
  try {
    const newFollow = req.body;
    await knex("following").insert(newFollow);
    res.status(201).json(newFollow);
  } catch {
    console.log(err);
    res
      .status(500)
      .json(`Could not follow User: ${following_id}, for User: ${spotify_id}`);
  }
});

// delete following user id and following user id
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    await knex("following").where({ spotify_id: userId }).del();
    res.status(200).json(userId).end();
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error Could not find Following List`);
  }
});

module.exports = router;
