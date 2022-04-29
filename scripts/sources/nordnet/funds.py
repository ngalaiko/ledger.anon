#!/usr/bin/python3

import urllib.request
import json
from datetime import date
import argparse
import sys
import functools
from decimal import Decimal, getcontext

getcontext().prec = 6

identifiers = {
    'Nordnet Index USA': '17299781',
    'Nordnet Index Europa': '17297333',
    'Nordnet Index Global': '17299780',
    'Nordnet Indeksfond Norge': '16801605',
    'AMF Aktiefond Nordamerika': '16800983',
}

currencies = {
    'Nordnet Index USA': 'SEK',
    'Nordnet Index Europa': 'SEK',
    'Nordnet Index Global': 'SEK',
    'Nordnet Indeksfond Norge': 'NOK',
    'AMF Aktiefond Nordamerika': 'SEK',
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
        print("Invalid end date {}".format(end))
        sys.exit(1)

    def get_cookies():
        req = urllib.request.Request(
            'https://www.nordnet.se/marknaden/fondlistor')
        set_cookie_headers = urllib.request.urlopen(
            req).info().get_all('Set-Cookie')

        def get_cookie_value(header):
            return header.split(';')[0]
        return '; '.join(map(get_cookie_value, set_cookie_headers))

    identifier = identifiers[symbol]
    currency = currencies[symbol]
    cookies = get_cookies()

    req_instrument = urllib.request.Request('https://www.nordnet.se/api/2/instruments/{}'.format(identifier),
                                            headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Cookie': cookies,
        'Host': 'www.nordnet.se',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        'client-id': 'NEXT',
        'ntag': '1adfcef7-38c7-4a5a-b467-dcab9b3f02df',
    }
    )
    instrument_data = json.loads(urllib.request.urlopen(req_instrument).read())

    reference_date = date.fromisoformat(instrument_data[0]['last_nav_date'])
    reference_value = Decimal(instrument_data[0]['last_nav'])

    req_timeseries = urllib.request.Request('https://www.nordnet.se/api/2/instruments/{}/fund/timeseries?period=y1'.format(identifier),
                                            headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Cookie': cookies,
        'Host': 'www.nordnet.se',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        'client-id': 'NEXT',
        'ntag': '1adfcef7-38c7-4a5a-b467-dcab9b3f02df',
    }
    )
    timeseries_data = json.loads(urllib.request.urlopen(req_timeseries).read())

    def to_map(acc, item):
        acc[date.fromtimestamp(item['time']/1000)] = Decimal.from_float(
            item['percentage_yield']) / Decimal(100) + Decimal(1)
        return acc

    yield_by_day = functools.reduce(
        to_map, timeseries_data[0]['yield_points'], {})
    reference_percentage = yield_by_day[reference_date]
    zero_value = reference_value / reference_percentage

    def calc_absolute(date, percentage):
        return zero_value * percentage

    absolute_by_day = {k: calc_absolute(k, v) for k, v in yield_by_day.items()}

    def sort_second(item):
        return item[1]

    for on_day in absolute_by_day.items():
        day = on_day[0]
        value = on_day[1]
        if day < begin_date:
            continue
        if day > end_date:
            continue
        print("P {} \"{}\" {} {}".format(day, symbol, value, currency))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--symbol", help="Symbol to fetch")
    parser.add_argument("-b", "--begin", help="Begin date")
    parser.add_argument("-e", "--end", help="End date")
    args = parser.parse_args()
    main(args.symbol, args.begin, args.end)
