import currency from 'currency.js';
import { max as maxDate, min as minDate } from 'date-fns';

import {
  not,
  and,
  or,
  negative,
  change,
  perMonth,
  depth,
  accountLike,
  invert
} from './lib/index.js';

export default (transactions: { account: string; amount: currency; date: Date }[]) => {
  const revenue = change(
    transactions
      .filter(
        or(
          accountLike('revenue'),
          and(accountLike('equity'), not(accountLike('equity:conversion')))
        )
      )
      .map(({ account, ...rest }) => ({ ...rest, account: 'income' }))
      .map(depth(1)),
    perMonth
  ).map(invert);

  const expenses = change(
    transactions
      .filter(
        and(or(accountLike('expenses'), accountLike('assets:cash:checking:budgets'))),
        not(accountLike('expenses:Taxes:Income'))
      )
      .map(depth(1)),
    perMonth
  ).map(negative);

  const dates = revenue.concat(expenses).map(({ date }) => date);
  const from = minDate(dates);
  const to = maxDate(dates);
  const amounts = revenue.concat(expenses).map(({ amount }) => amount.value);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const series = [
    {
      name: 'Expenses',
      type: 'column',
      data: expenses.map(({ date, amount }): [number, number] => [date.getTime(), amount.value])
    },
    {
      name: 'Income',
      type: 'column',
      data: revenue.map(({ date, amount }): [number, number] => [date.getTime(), amount.value])
    },
    {
      name: 'Delta',
      type: 'line',
      data: revenue.map(({ date, amount: revenue }, index): [number, number] => {
        const e = expenses[index] ? expenses[index].amount : currency(0);
        return [date.getTime(), revenue.add(e).value];
      })
    },
    {
      name: 'Savings rate',
      type: 'line',
      data: revenue.map(({ date, amount: revenue }, index): [number, number] => {
        const e = expenses[index] ? expenses[index].amount : currency(0);
        return [date.getTime(), revenue.add(e).divide(revenue).multiply(100).value];
      })
    }
  ];
  return { series, min, max, from, to };
};
