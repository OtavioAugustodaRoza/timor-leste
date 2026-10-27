from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
import re

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'images'
ASSETS.mkdir(parents=True, exist_ok=True)
HEADERS = {'User-Agent': 'TimorLesteEducationalAtlas/1.0 (educational web project)'}

def get(url):
    with urlopen(Request(url, headers=HEADERS), timeout=35) as response:
        return response.read()

def download(item):
    name, url = item
    try:
        data = get(url)
        (ASSETS / name).write_bytes(data)
        print(name, len(data), flush=True)
    except Exception as error:
        print(name, str(error), flush=True)

if __name__ == '__main__':
    if '--discover' in __import__('sys').argv:
        for page in ['https://timorleste.tl/', 'https://timorleste.tl/about', 'https://timorleste.tl/experiences/coffee', 'https://timorleste.tl/destinations']:
            try:
                html = get(page).decode('utf-8')
                print(page)
                found = list(dict.fromkeys(re.findall(r'(?:%2Fimages%2F|/images/)([a-zA-Z0-9_./%-]+\.(?:webp|jpg|png))', html)))
                print('\n'.join(found[:30]))
            except Exception as error:
                print(error)
    else:
        urls = [
            ('coast.webp', 'https://timorleste.tl/images/hero-home-mobile-v2.webp'),
            ('dili.webp', 'https://timorleste.tl/images/asean/cristo-rei-aerial.webp'),
            ('atauro.webp', 'https://timorleste.tl/images/mta/atauro/atauro-hero.webp'),
            ('ramelau.webp', 'https://timorleste.tl/images/ramelau.webp'),
            ('jaco.webp', 'https://timorleste.tl/images/jaco-island.webp'),
            ('tais.jpg', 'https://timorleste.tl/images/tais-weaving.jpg'),
            ('uma-lulik.webp', 'https://timorleste.tl/images/asean/uma-lulik-lautem.webp'),
            ('dance.webp', 'https://timorleste.tl/images/gallery/cultural-dance.webp'),
            ('coffee.webp', 'https://timorleste.tl/images/asean/coffee-picking.webp'),
            ('mountains.webp', 'https://timorleste.tl/images/hero-destinations-ridge.webp'),
        ]
        with ThreadPoolExecutor(max_workers=4) as executor:
            list(executor.map(download, urls))
