/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.string("id").primary();
      table.string("user_name").notNullable().index();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("posts", (table) => {
      table.string("id").primary();
      table.string("user_id").notNullable();
      table.string("user_name").notNullable().index();
      table.text("song_name").notNullable();
      table.text("artist_name").notNullable();
      table.text("album_name").notNullable();
      table.text("album_cover").notNullable();
      table.text("song_duration").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .foreign("user_name")
        .references("user_name")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    })
    .createTable("following", (table) => {
      table.string("user_id").notNullable().index();
      table.string("following_id").notNullable().index();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .foreign("following_id")
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    })
    .createTable("comments", (table) => {
      table.increments("id").primary();
      table.string("post_id").notNullable().index();
      table.string("user_id").notNullable().index();
      table.string("user_name").notNullable().index();
      table.text("content").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table
        .foreign("post_id")
        .references("id")
        .inTable("posts")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .foreign("user_name")
        .references("user_name")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("comments")
    .dropTable("following")
    .dropTable("posts")
    .dropTable("users");
};
