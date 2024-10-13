import sys
import json
import requests

def get_track_features(track_id, access_token):
    url = f'https://api.spotify.com/v1/audio-features/{track_id}'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(json.dumps({'error': f'Error: {response.status_code}', 'message': response.text}))
        return None

def get_recommendations(seed_tracks, access_token, limit=10):
    url = 'https://api.spotify.com/v1/recommendations'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    params = {
        'seed_tracks': seed_tracks,
        'limit': limit
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(json.dumps({'error': f'Error: {response.status_code}', 'message': response.text}))
        return None

def main():
    if len(sys.argv) != 3:
        print(json.dumps({'error': 'Invalid arguments', 'message': 'Usage: python spotify_ai.py <track_id> <access_token>'}))
        return

    track_id = sys.argv[1]
    access_token = sys.argv[2]

    track_features = get_track_features(track_id, access_token)
    if not track_features:
        return

    recommendations = get_recommendations(track_id, access_token)
    if not recommendations:
        return

    result = {
        'track_features': track_features,
        'recommendations': recommendations
    }
    print(json.dumps(result))

if __name__ == '__main__':
    main()
