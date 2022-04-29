#!/usr/bin/env bash

set -eou pipefail

dirname="$(dirname "$0")"

# pricehist
BTCSEK="$dirname/../prices/BTCSEK.prices.ledger"

# nordnet
AAPL="$dirname/../prices/AAPL.prices.ledger"

YESTERDAY="$(date -d "yesterday" +%Y-%m-%d)"

function ft_funds() {
	"$dirname/sources/ft/funds.py" "$@"
}

function nordnet_funds() {
	"$dirname/sources/nordnet/funds.py" "$@"
}

function nordnet_stocks() {
	"$dirname/sources/nordnet/stocks.py" "$@"
}

function pricehist() {
	"$dirname/sources/pricehist.sh" "$@"
}

function last_date() {
	echo $(tail -n 1 "$1" | cut -d ' ' -f 2)
}

function plus_one_day() {
	echo $(date +%Y-%m-%d -d "$1 + 1 day")
}

function next_date() {
	local ld="$(last_date "$1")"
	local nd="$(plus_one_day "$ld")"
	echo "$nd"
}

function update_price() {
	local source="$1"
	local pair="$2"
	local to="$3"

	local last_date="$(last_date "$to")"
	if [[ "$YESTERDAY" == "$last_date" ]]; then
		echo "Skipping $pair, last known price is from $YESTERDAY"
	else
		echo "Updating $pair..."
		$source --symbol "$pair" --begin "$(next_date $to)" --end "$YESTERDAY" >>"$to"
	fi
}

update_price pricehist 'BTC/SEK' "$BTCSEK"

update_price nordnet_stocks 'AAPL' "$AAPL"

echo 'All done!'
