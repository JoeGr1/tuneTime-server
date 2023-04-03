require("dotenv").config();
const express = require("express");
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

const usersRoutes = require("./routes/users");
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Express App is listening to PORT: ${PORT}`);
});

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
