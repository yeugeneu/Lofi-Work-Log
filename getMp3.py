import requests

url = "" #URL of the page to scrape
response = requests.get(url)

import re

# Find all URLs that start with "https://cdn.uppbeat.io/audio-files" and end with ".mp3"
mp3_urls = re.findall(r'https://cdn\.uppbeat\.io/audio-files.*?\.mp3', response.content.decode('utf-8'))

# Create a list to store the MP3 URLs
mp3_list = mp3_urls

# Print the list of MP3 URLs (optional, for verification)
print(f"Found {len(mp3_list)} MP3 URLs:")
print([f"'{url}'" for url in mp3_list])
print("")
