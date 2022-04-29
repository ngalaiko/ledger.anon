#!/usr/bin/env bash

##
## https://gitlab.com/chrisberkhout/pricehist
## pip3 install pricehist
##

PAIR=""
SOURCE="alphavantage"
DATE_END="$(date +%Y-%m-%d)"
DATE_BEGIN="2018-03-23"
INVERT=''
while [[ $# -gt 0 ]]; do
	case "$1" in
	-i | --invert)
		INVERT='--invert'
		;;
	-b | --begin)
		DATE_BEGIN="$2"
		shift
		;;
	-e | --end)
		DATE_END="$2"
		shift
		;;
	-p | --pair | --symbol)
		PAIR="$2"
		shift
		;;
	-s | --source)
		SOURCE="$2"
		shift
		;;
	*)
		echo "Unknown option: $1"
		exit 1
		;;
	esac
	shift
done

if [[ -z "$PAIR" ]]; then
	echo "No pair specified, use -p or --pair"
	exit 1
fi

pricehist fetch \
	"$SOURCE" \
	"$PAIR" \
	-s "$DATE_BEGIN" \
	-e "$DATE_END" \
	-o ledger \
	$INVERT
