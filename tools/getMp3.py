import requests
import re

url = "https://uppbeat.io/browse/music/jazzy-beats"  # URL of the page to scrape
response = requests.get(url)

# Find all URLs that start with "https://cdn.uppbeat.io/audio-files" and end with ".mp3"
mp3_urls = re.findall(r'https://cdn\.uppbeat\.io/audio-files.*?\.mp3', response.text)

# Create a list to store the MP3 URLs
mp3_list = mp3_urls

# Print the list of MP3 URLs (optional, for verification)
print("Found {} MP3 URLs:".format(len(mp3_list)))
mp3_array = ["'" + url + "'" for url in mp3_list]
print("[")
print(",\n".join(mp3_array))
print("]")
