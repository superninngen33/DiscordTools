import cloudscraper, time
from bs4 import BeautifulSoup
from colorama import Fore, init
init(autoreset=True)

webhook_url = "うえぶふっく"
disboard = "https://disboard.org/ja"
dissoku = "https://dissoku.net/ja"
sent = set()
scraper = cloudscraper.create_scraper()

def drop_it(p, retries=5, retry_wait=2):
    tries = 0
    while tries < retries:
        res = scraper.post(webhook_url, json=p)
        if res.status_code == 429:
            retry_after = int(res.headers.get("Retry-After", 1))
            print(Fore.YELLOW + f"Rate limit hit. Waiting {retry_after} seconds...")
            time.sleep(min(retry_after, retry_wait))
            tries += 1
        elif res.status_code == 204:
            return True
        else:
            print(Fore.RED + f"Webhook send failed. Status: {res.status_code}")
            return False
    print(Fore.RED + "Giving up. Couldn't send.")
    return False

def disboard_links():
    global sent
    try:
        r = scraper.get(disboard)
        if r.status_code == 200:
            soup = BeautifulSoup(r.content, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if "/ja/server/join/" in href:
                    full_url = "https://disboard.org" + href
                    if full_url not in sent:
                        final_url = scraper.get(full_url, allow_redirects=True).url
                        if final_url not in sent:
                            if drop_it({"content": final_url}):
                                print(Fore.GREEN + f"Disboard: {final_url} sent")
                                sent.add(final_url)
                            else:
                                print(Fore.RED + f"Failed to send {final_url}.")
        else:
            print(Fore.RED + f"Disboard page fetch failed. Status: {r.status_code}")
    except Exception as e:
        print(Fore.RED + f"Disboard link fetch error: {e}")

def dissoku_links():
    global sent
    try:
        r = scraper.get(dissoku)
        if r.status_code == 200:
            soup = BeautifulSoup(r.content, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if "https://app.dissoku.net/api/guilds/" in href and href not in sent:
                    final_url = scraper.get(href, allow_redirects=True).url
                    if "This invite may be expired" not in scraper.get(href, allow_redirects=True).text:
                        if final_url not in sent:
                            if drop_it({"content": final_url}):
                                print(Fore.GREEN + f"Dissoku: {final_url} sent")
                                sent.add(final_url)
                            else:
                                print(Fore.RED + f"Failed to send {final_url}.")
        else:
            print(Fore.RED + f"Dissoku page fetch failed. Status: {r.status_code}")
    except Exception as e:
        print(Fore.RED + f"Dissoku link fetch error: {e}")

def do_it_all():
    while True:
        print(Fore.CYAN + "Getting Disboard links...")
        disboard_links()
        print(Fore.CYAN + "Getting Dissoku links...")
        dissoku_links()
        time.sleep(10)

do_it_all()
