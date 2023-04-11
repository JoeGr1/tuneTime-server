require("dotenv").config();
const express = require("express");
const knex = require("knex")(require("./knexfile"));
// const session = require("express-session");
const querystring = require("querystring");
const app = express();
const PORT = process.env.PORT || 9090;
const axios = require("axios");
const { response } = require("express");
require("dotenv").config();

const cors = require("cors");
const { get } = require("http");

app.use(cors());

app.use(express.json());

let session = null;
// let profile;

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(express.json);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const scope =
  "user-read-recently-played user-read-currently-playing playlist-read-collaborative user-read-playback-state user-read-private user-read-email";

app.get("/login", (req, res) => {
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/auth/spotify/callback", (req, res) => {
  // Get the code from the URL
  const code = req.query.code || null;

  // Setup the body of the POST request to /api/token
  const authBody = {
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code: code,
  };

  // Setup the headers of the POST request to /api/token
  const authHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
  };

  // Execute the POST requset to /api/token
  const getToken = async () => {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify(authBody),
        { headers: authHeaders }
      );

      // Set the session, based on the response from /api/token
      session = response.data;

      // Setup the header for the GET request to /v1/me
      const profileHeader = {
        Authorization: `Bearer ${session.access_token}`,
      };

      try {
        const response = await axios.get("https://api.spotify.com/v1/me", {
          headers: profileHeader,
        });

        // Create a new variable to store the profile
        const sessionProfile = response.data;

        // Set the session to equal what it was before (i.e. the result of POST /api/token)
        // as well as the profile
        session = { ...session, sessionProfile };
      } catch (error) {
        console.log(error);
      }

      res.redirect(`${process.env.CLIENT_FEED_URL}`);
    } catch (error) {
      console.log(error);
    }
  };

  getToken();
});

app.get("/get-session", (req, res) => {
  res.status(200).json(session);
});

app.get("/currently-playing", (req, res) => {
  let access_token = session.data.access_token;
  console.log(access_token);
  const currentlyPlayingHeader = {
    Authorization: `Bearer ${access_token}`,
  };
  const getCurrent = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: currentlyPlayingHeader }
      );
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  getCurrent();
});

app.get("/api/get-recommended/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const userPosts = await knex("posts").where("spotify_id", "=", userId);

    const seed_artists = userPosts.map((post, i) => {
      if (i <= 2) {
        return post.artist_id;
      } else {
        return;
      }
    });

    const seed_tracks = userPosts.map((post, i) => {
      if (i <= 2) {
        return post.song_id;
      } else {
        return;
      }
    });

    let seed_genre;

    const genreHeaders = {
      Authorization: `Bearer ${session.access_token}`,
    };

    const getSeedGenre = async () => {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/artists/${seed_artists[2]}`,
          { headers: genreHeaders }
        );
        console.log(response.data.genres);
        seed_genre =
          (response.data.genres && response.data.genres[0]) || "hip-hop";
      } catch (error) {
        console.log(error);
        res.status(500).json(`Could Not Retreive Users Recommnded`);
      }
    };
    await getSeedGenre();

    const headers = {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };

    const data = {
      seed_artists: seed_artists,
      seed_tracks: seed_tracks,
      seed_genres: seed_genre,
      limit: 10,
    };

    const getRecommended = async () => {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/recommendations`,
          {
            headers,
            params: data,
          }
        );
        res.status(200).json(response.data.tracks);
      } catch (error) {
        console.log(error);
        res.status(500).json(`Could Not Retreive Users Recommnded`);
      }
    };

    await getRecommended();
  } catch (err) {
    console.log(err);
    res.status(500).json(`Could Not Retreive Users Recommnded`);
  }
});

const usersRoutes = require("./routes/users");
app.use("/api/users", usersRoutes);

const postsRoutes = require("./routes/posts");
app.use("/api/posts", postsRoutes);

const folllowingRoutes = require("./routes/following");
app.use("/api/following", folllowingRoutes);

const commentsRoutes = require("./routes/comments");
app.use("/api/comments", commentsRoutes);

app.listen(PORT, () => {
  console.log(`Express App is listening to PORT: ${PORT}`);
});

// // ------------ potnetnial add widget to posts

// // cryyently getting server error (spotiy error, could be axios request error though)

// app.get("/get-widget/:songid", async (req, res) => {
//   const songId = req.params.songid;

//   try {
//     const response = await axios.get(
//       `https://embed.spotify.com/oembed/?url=spotify:track:${songId}`
//     );
//     console.log(response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json("Error Fetching Widget");
//   }
// });
// // back end
//   // -------------------

// -----------refresh token for longer use

// // app.get("/refresh_token", (req, res) => {
// //   const { refresh_token } = req.query;

// //   const refreshBody = {
// //     // grant_type: "client_credentials",
// //     grant_type: "refresh_token",
// //     refresh_token: refresh_token,
// //   };

// //   // console.log(authBody);

// //   // console.log(typeof CLIENT_SECRET);

// //   const refreshHeaders = {
// //     "Content-Type": "application/x-www-form-urlencoded",
// //     Authorization:
// //       "Basic " +
// //       Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
// //   };

// //   // console.log(authHeaders);

// //   const postRefresh = async () => {
// //     try {
// //       const response = await axios.post(
// //         "https://accounts.spotify.com/api/token",
// //         querystring.stringify(refreshBody),
// //         { headers: refreshHeaders }
// //       );

// //       console.log(response);

// //       res.send(response);
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   postRefresh();
// // });
