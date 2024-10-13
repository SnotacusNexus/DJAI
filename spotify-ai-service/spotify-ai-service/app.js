require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyRoutes = require('./routes/spotify');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 22222;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/spotify', spotifyRoutes);

app.get('/', (req, res) => {
    res.redirect('./api/spotify/');
});
app.listen(PORT, () => {
    console.log(`Spotify AI Playlist Generator listening at http://localhost:${PORT}`);


});