const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

const generateRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

const generateCodeChallenge = (codeVerifier) => {
    const base64Digest = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64');
    return base64Digest
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};


function getSpotifyRecommendations(trackId, accessToken) {
    return new Promise((resolve, reject) => {
        exec(`python3 ../spotify_ai.py ${trackId} ${accessToken}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(new Error(stderr));
                return;
            }
            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (e) {
                reject(new Error('Failed to parse Python script output'));
            }
        });
    });
}

router.post('/generate-playlist', async(req, res) => {
    const { trackId, accessToken } = req.body;

    if (!trackId || !accessToken) {
        return res.status(400).json({ error: 'Missing trackId or accessToken' });
    }

    try {
        const spotifyData = await getSpotifyRecommendations(trackId, accessToken);
        const playlist = spotifyData.recommendations.tracks.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(artist => artist.name),
            album: track.album.name
        }));
        res.json({
            message: 'Playlist generated successfully',
            seedTrackFeatures: spotifyData.track_features,
            playlist: playlist
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate playlist', message: error.message });
    }
});


router.get('/', (req, res) => {
    // redirect to index.js and show it as /api/spotify
    res.send(body = `
        
      <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotify AI Playlist Generator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 800px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #1DB954;
        }
        
        button {
            background-color: #1DB954;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 5px;
        }
        
        button:hover {
            background-color: #1ed760;
        }
        
        input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
        }
        
        #playlist {
            margin-top: 20px;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Spotify AI Playlist Generator</h1>
        <div id="login">
            <p>Login with your Spotify account to get started:</p>
            <button onclick="login()">Login with Spotify</button>
        </div>
        <div id="loggedin" class="hidden">
            <p>Logged in as: <span id="user-name"></span></p>
            <img id="user-image" src="" alt="Profile Picture" width="50">
            <p>Enter a Spotify track ID to generate a playlist:</p>
            <input type="text" id="track-id" placeholder="Enter Spotify Track ID">
            <button onclick="generatePlaylist()">Generate Playlist</button>
            <div id="playlist" class="hidden">
                <h2>Generated Playlist</h2>
                <ul id="playlist-tracks"></ul>
                <button onclick="createPlaylist()">Create this Playlist on Spotify</button>
            </div>
        </div>
    </div>

    <script>
        const clientId = "";
        const redirectUri = 'https://aidj.ghophernuttz.site/api/spotify/callback.html';
        let accessToken = '';

        function login() {
            const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public user-top-read';
            const authUrl = 'https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent('https://aidj.ghophernuttz.site/api/spotify/callback')}&scope=${encodeURIComponent('user-read-private user-read-email playlist-modify-private playlist-modify-public user-top-read')}';
            location.href = authUrl;
        }

        function handleCallback() {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            accessToken = params.get('access_token');
            if (accessToken) {
                document.getElementById('login').classList.add('hidden');
                document.getElementById('loggedin').classList.remove('hidden');
                fetchUserProfile();
            }
        }

        async function fetchUserProfile() {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            const data = await response.json();
            document.getElementById('user-name').textContent = data.display_name;
            if (data.images.length > 0) {
                document.getElementById('user-image').src = data.images[0].url;
            }
        }

        async function generatePlaylist() {
            const trackId = document.getElementById('track-id').value;
            const response = await fetch('/spotify/generate-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
                body: JSON.stringify({
                    trackId: trackId
                })
            });
            const data = await response.json();
            displayPlaylist(data.playlist);
        }

        function displayPlaylist(playlist) {
            const playlistElement = document.getElementById('playlist');
            const tracksElement = document.getElementById('playlist-tracks');
            tracksElement.innerHTML = '';
            playlist.forEach(track => \`{
                const li = document.createElement('li');
                li.textContent = \${track.name} by \${track.artists.join(', ')};
                tracksElement.appendChild(li);
            }\`);
            playlistElement.classList.remove('hidden');
        }

        async function createPlaylist(tracks) {
            const response = await fetch('/spotify/create-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
                body: JSON.stringify({
                    tracks: /* array of track IDs */ $tracks,
                }),


            });
            const data = await response.json();
            alert('Playlist created! Playlist ID: ' + data.playlistId);
        }

        // Check if we're coming back from auth
        if (window.location.hash) {
            handleCallback();
        }
    </script>
</body>

</html>
      `);
    // res.send('Welcome to the Spotify AI Playlist Generator!');
});
router.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public user-top-read';

    const codeVerifier = generateRandomString(64);
    const codeChallenge = generateCodeChallenge(codeVerifier);

    res.cookie('spotify_auth_state', state);
    res.cookie('spotify_auth_code_verifier', codeVerifier);

    const queryParams = querystring.stringify({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: state,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

router.get('/callback', async(req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
    const storedCodeVerifier = req.cookies ? req.cookies['spotify_auth_code_verifier'] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#error=state_mismatch');
    } else {
        res.clearCookie('spotify_auth_state');

        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
                client_id: clientId,
                code_verifier: storedCodeVerifier,
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            json: true
        };

        try {
            const response = await axios.post(authOptions.url, querystring.stringify(authOptions.form), { headers: authOptions.headers });
            const { access_token, refresh_token } = response.data;

            res.json({ access_token, refresh_token });
        } catch (error) {
            console.error('Error in callback:', error.response ? error.response.data : error.message);
            res.redirect('/#error=invalid_token');
        }
    }
});

router.post('/create-playlist', async(req, res) => {
    const { accessToken, tracks } = req.body;

    if (!accessToken || !tracks || !Array.isArray(tracks)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const userId = userResponse.data.id;

        const playlistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            name: 'AI Generated Playlist',
            description: 'Playlist created by AI based on your preferences',
            public: false
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const playlistId = playlistResponse.data.id;

        await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: tracks.map(track => `spotify:track:${track}`)
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ success: true, playlistId: playlistId });
    } catch (error) {
        console.error('Error creating playlist:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

module.exports = router;