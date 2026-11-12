import re
import sys
import requests


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else ""
    if not url:
        print("Usage: python tools/getMp3.py <url>", file=sys.stderr)
        sys.exit(1)

    response = requests.get(url, timeout=15)
    response.raise_for_status()

    # Find all URLs that start with "https://cdn.uppbeat.io/audio-" and end with ".mp3"
    mp3_urls = re.findall(r"https://cdn\.uppbeat\.io/audio-.*?\.mp3", response.text)

    print(f"Found {len(mp3_urls)} MP3 URLs:")
    mp3_array = [f"'{u}'" for u in mp3_urls]
    print("[")
    print(",\n".join(mp3_array))
    print("]")


if __name__ == "__main__":
    main()
