import currency from 'currency.js';

import { accountLike, groupBy, depth, change, perDay, not, and } from './lib/index.js';

export default (
  balances: { account: string; amount: currency; date: Date }[],
  transactions: { account: string; amount: currency; date: Date }[]
) => {
  balances = balances.filter(({ date }) => date.getTime() < new Date().getTime());
  transactions = transactions.filter(({ date }) => date.getTime() < new Date().getTime());

  const investments = and(
    accountLike('assets:investments'),
    not(accountLike('assets:investments:warrants'))
  );
  const bitcoins = accountLike('assets:crypto:bitcoin');

  const bitcoinBalances = change(balances.filter(bitcoins).map(depth(3)), perDay);
  const investmentBalances = balances.filter(investments);
  const totalBalances = change(
    investmentBalances.concat(bitcoinBalances).map(depth(1)),
    perDay
  ).map((tx) => ({ ...tx, account: 'total' }));
  const allBalances = investmentBalances.concat(bitcoinBalances).concat(totalBalances);

  const investmentsTransactions = transactions.filter(investments);
  const bitcoinTransactions = transactions.filter(bitcoins).map(depth(3));
  const totalTransactions = investmentsTransactions
    .concat(bitcoinTransactions)
    .map(depth(1))
    .map((tx) => ({ ...tx, account: 'total' }));
  const allTransactions = investmentsTransactions
    .concat(bitcoinTransactions)
    .concat(totalTransactions);

  const transactionsByAccount = groupBy(allTransactions, ({ account }) => account);
  const byAccount = groupBy(
    allBalances
      .map(({ account, date, amount }) => {
        if (amount.value === 0) return null;

        const cashflow = transactionsByAccount[account]
          .filter(({ date: txDate }) => txDate <= date)
          .reduce((sum, { amount }) => sum.add(amount), currency(0, { precision: 5 }));
        const diff = currency(amount, { precision: 4 }).subtract(cashflow);
        const roi = cashflow.value === 0 ? currency(0) : diff.divide(cashflow).multiply(100);
        return { account: account.split(':').slice(-2).join(':'), date, roi: roi, absolute: diff };
      })
      .filter((row) => row !== null),
    ({ account }) => account
  );

  const roiSeries = Object.entries(byAccount).map(([account, data]) => ({
    name: account,
    data: data.map(({ date, roi }): [number, number] => [date.getTime(), roi.value])
  }));

  const absoluteSeries = Object.entries(byAccount).map(([account, data]) => ({
    name: account,
    data: data.map(({ date, absolute }): [number, number] => [date.getTime(), absolute.value])
  }));

  return { roiSeries, absoluteSeries };
};
