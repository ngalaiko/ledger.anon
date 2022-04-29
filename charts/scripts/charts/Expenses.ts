import { addMonths, endOfMonth, startOfMonth, min, max } from 'date-fns';
import currency from 'currency.js';

import { or, perMonth, change, groupBy, accountLike, byDateAsc } from './lib/index.js';

export default (transactions: { account: string; amount: currency; date: Date }[]) => {
  const allTransactions = change(
    transactions
      .filter(or(accountLike('expenses'), accountLike('assets:cash:checking:budgets')))
      .map(({ account, ...rest }) => ({
        account: account.startsWith('expenses')
          ? account.split(':')[1]
          : account.split(':').slice(-1)[0],
        ...rest
      })),
    perMonth
  );

  const dates = allTransactions.map(({ date }) => date);
  const minDate = min(dates);
  const maxDate = max(dates);

  const allTransactionsByCategory = groupBy(allTransactions, ({ account }) => account);

  const series = Object.entries(allTransactionsByCategory).map(([category, transactions]) => {
    // fill in missing months with 0
    for (
      let month = startOfMonth(minDate);
      month.getTime() <= endOfMonth(maxDate).getTime();
      month = startOfMonth(addMonths(month, 1))
    ) {
      const haveTransactions = transactions.some(({ date }) => date.getTime() === month.getTime());
      if (!haveTransactions) {
        transactions.push({
          account: category,
          date: month,
          amount: currency(0)
        });
      }
    }
    return {
      name: category,
      type: 'column',
      data: transactions
        .sort(byDateAsc)
        .map(({ date, amount }): [number, number] => [date.getTime(), amount.value])
    };
  });
  return { series };
};
