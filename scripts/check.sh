#!/usr/bin/env bash

[[ -z "${1}" ]] && echo "Usage: $0 file.ledger" && exit 1

hledger -f "$1" check \
	--strict \
	parseable \
	balancedwithautoconversion \
	assertions \
	accounts \
	commodities \
	balancednoautoconversion \
	ordereddates
# payees
# uniqueleafnames
