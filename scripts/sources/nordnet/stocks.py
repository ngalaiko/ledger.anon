#!/usr/bin/python3

import urllib.request
import json
from datetime import date
import argparse
import sys

url = "https://api.prod.nntech.io/market-data/price-time-series/v2/period/MONTH_1/identifier/{}?resolution=DAY"
identifier = "16121031"

identifiers = {
    'DIS': '16121031',
    'AAPL': '16118139',
    'SAAB': '16100088',
}

currencies = {
    'DIS': 'USD',
    'AAPL': 'USD',
    'SAAB': 'SEK',
}


def main(symbol, begin, end):
    if symbol not in identifiers:
        print("Symbol {} not found".format(symbol))
        sys.exit(1)

    try:
        begin_date = date.fromisoformat(begin)
    except ValueError:
        print("Invalid start date {}".format(begin))
        sys.exit(1)

    try:
        end_date = date.fromisoformat(end)
    except ValueError:
        print("Invalid start date {}".format(end))
        sys.exit(1)

    identifier = identifiers[symbol]
    currency = currencies[symbol]

    contents = urllib.request.urlopen(url.format(identifier)).read()
    data = json.loads(contents)
    for pricePoint in data["pricePoints"]:
        d = date.fromtimestamp(pricePoint["timeStamp"]/1000)
        if d < begin_date:
            continue
        if d > end_date:
            continue
        price = pricePoint["last"]
        print("P {} \"{}\" {} {}".format(d, symbol, price, currency))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--symbol", help="Symbol to fetch")
    parser.add_argument("-b", "--begin", help="Begin date")
    parser.add_argument("-e", "--end", help="End date")
    args = parser.parse_args()
    main(args.symbol, args.begin, args.end)
