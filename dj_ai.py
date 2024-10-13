import spotipy
from spotipy.oauth2 import SpotifyOAuth
import pyttsx3
import time

# Initialize Spotify API
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id='YOUR_CLIENT_ID',
                                               client_secret='YOUR_CLIENT_SECRET',
                                               redirect_uri='YOUR_REDIRECT_URI',
                                               scope='user-modify-playback-state'))

# Initialize text-to-speech engine
engine = pyttsx3.init()

def play_song(track_uri):
    sp.start_playback(uris=[track_uri])

def speak(text):
    engine.say(text)
    engine.runAndWait()

def dj_session(playlist):
    for track in playlist:
        speak(f"Up next, we have {track['name']} by {track['artist']}.")
        play_song(track['uri'])
        time.sleep(track['duration_ms'] / 1000)  # Wait for the song to finish

if __name__ == "__main__":
    playlist = [
        {'name': 'Song 1', 'artist': 'Artist 1', 'uri': 'spotify:track:TRACK_URI_1', 'duration_ms': 180000},
        {'name': 'Song 2', 'artist': 'Artist 2', 'uri': 'spotify:track:TRACK_URI_2', 'duration_ms': 200000},
    ]
    dj_session(playlist)
