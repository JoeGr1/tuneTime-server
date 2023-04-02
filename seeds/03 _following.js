const followingData = require("../seed_data/followingData");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("following").del();
  await knex("following").insert(followingData);
};
