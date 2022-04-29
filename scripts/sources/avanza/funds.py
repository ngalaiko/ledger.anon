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
    'Avanza 75': '377804',
}

currencies = {
    'Avanza 75': 'SEK',
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

    identifier = identifiers[symbol]
    currency = currencies[symbol]

    req_instrument = urllib.request.Request(
        'https://www.avanza.se/_api/fund-guide/guide/{}'.format(identifier))
    instrument_data = json.loads(urllib.request.urlopen(req_instrument).read())

    reference_date = date.fromisoformat(
        instrument_data['navDate'].split('T')[0])
    reference_value = Decimal(instrument_data['nav'])

    req_timeseries = urllib.request.Request(
        'https://www.avanza.se/_api/fund-guide/chart/{}/one_year'.format(identifier))
    timeseries_data = json.loads(urllib.request.urlopen(req_timeseries).read())

    def to_map(acc, item):
        acc[date.fromtimestamp(item['x']/1000)] = Decimal.from_float(
            item['y']) / Decimal(100) + Decimal(1)
        return acc

    yield_by_day = functools.reduce(
        to_map, timeseries_data['dataSerie'], {})
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
