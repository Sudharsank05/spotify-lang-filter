import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();

const app = express();
app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  }),
);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/login", (req, res) => {
  const scope = "playlist-read-private playlist-read-collaborative";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.REDIRECT_URI,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get("/callback", async (req, res) => {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    const config = {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    };
    const response = await axios.post(url, params.toString(), config);
    const { access_token, refresh_token } = response.data;
    req.session.accesstoken = access_token;
    req.session.refresh_token = refresh_token;
    res.redirect("http://localhost:5173");
    // res.json(response.data);
  } catch (error) {
    console.error("Token exchange failed:", error);
    res.status(500).json({ error: error.message || "Token exchange failed" });
  }
});

app.get('/debug', (req, res) => {
    res.json(req.session)
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
