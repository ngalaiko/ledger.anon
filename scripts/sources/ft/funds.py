#!/usr/bin/python3

from urllib import request, parse
import json
from datetime import date
import argparse
import sys
import functools
from decimal import Decimal, getcontext

url = "https://markets.ft.com/data/chartapi/series"

identifiers = {
    'Avanza Zero': '535694304',
    'Nordea Nora Three': '123954123',
}

currencies = {
    'Avanza Zero': 'SEK',
    'Nordea Nora Three': 'SEK',
}


def main(symbol, begin_date, end):
    if symbol not in identifiers:
        print("Symbol {} not found".format(symbol))
        sys.exit(1)

    try:
        begin_date = date.fromisoformat(begin_date)
    except ValueError:
        print("Invalid start date {}".format(begin_date))
        sys.exit(1)

    try:
        end_date = date.fromisoformat(end)
    except ValueError:
        print("Invalid start date {}".format(end))
        sys.exit(1)

    identifier = identifiers[symbol]
    currency = currencies[symbol]

    payload = {
        "days": 193,
        "dataNormalized": False,
        "dataPeriod": "Day",
        "dataInterval": 1,
        "realtime": False,
        "yFormat": "0.###",
        "timeServiceFormat": "JSON",
        "rulerIntradayStart": 26,
        "rulerIntradayStop": 3,
        "rulerInterdayStart": 10957,
        "rulerInterdayStop": 365,
        "returnDateType": "ISO8601",
        "elements": [
            {
                "Label": "821e5d4a",
                "Type": "price",
                "Symbol": identifier,
                "OverlayIndicators": [],
                "Params":{}
            }
        ]
    }

    req = request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    })
    contents = request.urlopen(req).read()
    data = json.loads(contents)

    def convert_date(d):
        return date.fromisoformat(d.split('T')[0])

    dates = map(convert_date, data['Dates'])

    def filter_close(d):
        return d['Type'] == 'Close'

    close_series = filter(filter_close, data['Elements'][0]['ComponentSeries'])
    values = list(close_series)[0]['Values']

    for i, d in enumerate(dates):
        if d < begin_date:
            continue
        if d > end_date:
            continue
        print("P {} \"{}\" {} {}".format(d, symbol, values[i], currency))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--symbol", help="Symbol to fetch")
    parser.add_argument("-b", "--begin", help="Begin date")
    parser.add_argument("-e", "--end", help="End date")
    args = parser.parse_args()
    main(args.symbol, args.begin, args.end)
