require("dotenv").config();

const express = require("express");
const querystring = require("querystring");
const app = express();
const PORT = process.env.PORT || 9090;
const axios = require("axios");
const { response } = require("express");
require("dotenv").config();

const cors = require("cors");

app.use(cors());

// app.use(express.json);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const scope =
  "user-read-recently-played user-read-currently-playing playlist-read-collaborative user-read-playback-state";

app.get("/login", (req, res) => {
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/auth/callback", (req, res) => {
  // console.log(req);

  const code = req.query.code || null;
  // console.log(code)

  const authBody = {
    // grant_type: "client_credentials",
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code: code,
  };

  // console.log("here");
  // console.log(authBody.code);

  // console.log(typeof CLIENT_SECRET);

  const authHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
  };

  console.log(authHeaders);

  const getToken = async () => {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify(authBody),
        { headers: authHeaders }
      );

      // console.log(response);

      if (response.status === 200) {
        res.send(JSON.stringify(response.data, null, 2));
      } else {
        res.send(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  getToken();
});

// app.get("/refresh_token", (req, res) => {
//   const { refresh_token } = req.query;

//   const refreshBody = {
//     // grant_type: "client_credentials",
//     grant_type: "refresh_token",
//     refresh_token: refresh_token,
//   };

//   // console.log(authBody);

//   // console.log(typeof CLIENT_SECRET);

//   const refreshHeaders = {
//     "Content-Type": "application/x-www-form-urlencoded",
//     Authorization:
//       "Basic " +
//       Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
//   };

//   // console.log(authHeaders);

//   const postRefresh = async () => {
//     try {
//       const response = await axios.post(
//         "https://accounts.spotify.com/api/token",
//         querystring.stringify(refreshBody),
//         { headers: refreshHeaders }
//       );

//       console.log(response);

//       res.send(response);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   postRefresh();
// });

app.listen(PORT, () => {
  console.log(`Express App is listening to PORT: ${PORT}`);
});
