require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyRoutes = require('./routes/spotify');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/spotify', spotifyRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
