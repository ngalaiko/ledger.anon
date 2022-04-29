# ledger

[![Generate charts](https://github.com/ngalaiko/ledger/actions/workflows/generate-charts.yaml/badge.svg)](https://github.com/ngalaiko/ledger/actions/workflows/generate-charts.yaml)
[![Update prices](https://github.com/ngalaiko/ledger/actions/workflows/update-prices.yaml/badge.svg)](https://github.com/ngalaiko/ledger/actions/workflows/update-prices.yaml)

This is a copy of a reposiroty I use too keep track of my personal finances.

Budgetitg strategy: envelopes

future.ledger contains transactions from the future, it's used by ./charts to plot the future
balances

./charts contains a sveltekit app to plot some of the high metics. it generates static pages, so no need
to host a server, any cdn would work

you might want to edit ./charts/scripts to setup your own categoeies and calculations
