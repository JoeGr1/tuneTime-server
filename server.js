require("dotenv").config();
const express = require("express");
const querystring = require("querystring");
const app = express();
const PORT = process.env.PORT || 9090;
const axios = require("axios");
const { response } = require("express");
require("dotenv").config();

const cors = require("cors");
const { get } = require("http");

app.use(cors());

let session = null;
let profile;

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
  const code = req.query.code || null;

  const authBody = {
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code: code,
  };

  const authHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
  };

  const getToken = async () => {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify(authBody),
        { headers: authHeaders }
      );

      session = response;

      if (response.status === 200) {
        res.redirect(`${process.env.CLIENT_FEED_URL}`);
      } else {
        res.send(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProfile = async () => {
    const profileheader = {
      Authorization: `Bearer ${session.data.access_token}`,
    };

    try {
      const response = await axios.post(
        "https://api.spotify.com/v1/me",
        querystring.stringify(authBody),
        { headers: authHeaders }
      );

      if (response.status === 200) {
        res.redirect(`${process.env.CLIENT_FEED_URL}`);
        console.log(response);
      } else {
        res.send(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  getToken();
  console.log(session);
  // getProfile();
});

app.get("/get-tokens", (req, res) => {
  try {
    res.status(200).json(session.data);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: `Could not fetch tokens from session`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Express App is listening to PORT: ${PORT}`);
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
      console.log("here we are");
      console.log(response.status);
      console.log(response.data);
    } catch (err) {
      console.log("error here");
      console.log(err);
    }
  };

  getCurrent();
});

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
