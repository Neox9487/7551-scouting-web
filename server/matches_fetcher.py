import requests
import json
import sys

def get_frc_matches_list(event_key, api_key):
    url = f"https://www.thebluealliance.com/api/v3/event/{event_key}/matches/simple"
    headers = {"X-TBA-Auth-Key": api_key.strip()}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        sys.exit(1)

    raw_matches = response.json()
    result_list = []

    for m in raw_matches:
        if m['comp_level'] == 'qm':
            red_teams = [t.replace('frc', '') for t in m['alliances']['red']['team_keys']]
            blue_teams = [t.replace('frc', '') for t in m['alliances']['blue']['team_keys']]
            result_list.append({
                "match": m['match_number'],
                "teams": red_teams + blue_teams
            })

    result_list.sort(key=lambda x: x['match'])
    return result_list

def update_matches_json(data, filename="matches.json"):
    if data:
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"Successfully saved to {filename}")
        except IOError:
            sys.exit(2)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python matches_fetcher.py <EVENT_KEY> <API_KEY>")
        sys.exit(3)
    
    event = sys.argv[1]
    key = sys.argv[2]

    final_data = get_frc_matches_list(event, key)
    if final_data:
        update_matches_json(final_data)