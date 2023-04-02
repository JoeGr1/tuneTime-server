exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.string("id").primary();
      table.string("user_name").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("posts", (table) => {
      table.increments("id").primary();
      table.string("user_id").unsigned().notNullable();
      table.string("user_name").notNullable();
      table.text("song_name").notNullable();
      table.text("artist_name").notNullable();
      table.text("album_name").notNullable();
      table.text("album_cover").notNullable();
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
      table.string("user_id").unsigned().notNullable();
      table.string("following_id").unsigned().notNullable();
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
      table.string("post_id").unsigned().notNullable();
      table.string("user_id").unsigned().notNullable();
      table.string("user_name").unsigned().notNullable();
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
    .dropTable("following")
    .dropTable("comments")
    .dropTable("posts")
    .dropTable("users");
};
