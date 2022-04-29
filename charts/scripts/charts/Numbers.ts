import currency from 'currency.js';
import { max, addYears, compareAsc } from 'date-fns';

import { or, and, accountLike, change, depth, invert, perMonth, perDay, not } from './lib/index.js';

export default (
  balances: { account: string; amount: currency; date: Date }[],
  transactions: { account: string; amount: currency; date: Date }[]
) => {
  balances = balances.filter(({ date }) => date.getTime() < new Date().getTime());
  transactions = transactions.filter(({ date }) => date.getTime() < new Date().getTime());

  const dates = balances.map(({ date }) => date);
  const maxDate = max(dates);

  const netWorth = balances
    .filter(accountLike('assets', 'liabilities'))
    .filter(({ date }) => date.getTime() === maxDate.getTime())
    .reduce((acc, cur) => acc.add(cur.amount), currency(0));

  const monthlyIncome = change(
    transactions
      .filter(
        or(
          accountLike('revenue'),
          and(
            accountLike('equity'),
            not(accountLike('equity:conversion')),
            not(accountLike('equity:Refund'))
          )
        )
      )
      .map(({ account, ...rest }) => ({ ...rest, account: 'income' }))
      .map(depth(1)),
    perMonth
  ).map(invert);

  const expenseTransactions = transactions.filter(
    and(accountLike('expenses', 'equity:Refund'), not(accountLike('expenses:Taxes:Income')))
  );

  const monthlyExpense = change(expenseTransactions.map(depth(1)), perMonth).map(invert);

  const rateByMonth = monthlyIncome.slice(-13, -1).map((income) => {
    const expense = monthlyExpense.find((r) => r.date.getTime() === income.date.getTime());
    if (expense) {
      return currency(income.amount, { precision: 4 }).add(expense.amount).divide(income.amount);
    } else {
      return currency(0);
    }
  });

  const savingsRate = rateByMonth
    .reduce((acc, cur) => acc.add(cur), currency(0, { precision: 4 }))
    .divide(rateByMonth.length)
    .multiply(100);

  const yearAgo = addYears(maxDate, -1);

  const dailyExpense = change(
    expenseTransactions.map(depth(1)).filter(({ date }) => compareAsc(date, yearAgo) === 1),
    perDay
  );

  const expenseTransactionsWithoutRent = expenseTransactions.filter(
    not(accountLike('expenses:Rent'))
  );

  const dailyExpenseWithoutRent = change(
    expenseTransactionsWithoutRent
      .map(depth(1))
      .filter(({ date }) => compareAsc(date, yearAgo) === 1),
    perDay
  );

  const averageDailyExpense = dailyExpense
    .reduce((acc, curr) => acc.add(curr.amount), currency(0))
    .divide(dailyExpense.length);

  const averageDailyExpenseWithoutRent = dailyExpenseWithoutRent
    .reduce((acc, curr) => acc.add(curr.amount), currency(0))
    .divide(dailyExpenseWithoutRent.length);

  const liquidAssets = balances
    .filter(accountLike('assets:cash'))
    .filter(({ date }) => date.getTime() === maxDate.getTime())
    .reduce((acc, curr) => acc.add(curr.amount), currency(0));

  const shortRunway = liquidAssets.divide(averageDailyExpense);
  const shortRunwayWithoutRent = liquidAssets.divide(averageDailyExpenseWithoutRent);

  const longRunway = netWorth.divide(averageDailyExpense);
  const longRunwayWithoutRent = netWorth.divide(averageDailyExpenseWithoutRent);

  const fire = averageDailyExpense.multiply(365).multiply(25);
  const fireWithoutRent = averageDailyExpenseWithoutRent.multiply(365).multiply(25);

  return {
    netWorth,
    savingsRate,
    averageDailyExpense,
    averageDailyExpenseWithoutRent,
    liquidAssets,
    shortRunway,
    shortRunwayWithoutRent,
    longRunway,
    longRunwayWithoutRent,
    fire,
    fireWithoutRent
  };
};
