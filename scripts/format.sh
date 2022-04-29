#!/usr/bin/env bash

[[ -z "${1}" ]] && echo "Usage: $0 file.ledger" && exit 1

TMP_FILE=$(mktemp)

hledger -f "${1}" print >"$TMP_FILE"

cp "$TMP_FILE" "${1}"
