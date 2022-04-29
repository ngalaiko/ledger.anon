import type currency from 'currency.js';

import { accountLike, groupBy, and, not } from './lib/index.js';

export default (balances: { date: Date; account: string; amount: currency }[]) => {
  const allBalances = balances.filter(
    and(
      accountLike('assets', 'liabilities'),
      not(accountLike('assets:cash:checking:budgets')),
      not(accountLike('assets:cash:savings:goals'))
    )
  );
  const balancesByAccount = groupBy(allBalances, ({ account }) => account);
  const series = Object.entries(balancesByAccount).map(([account, balances]) => ({
    name: account.split(':').slice(-2).join(':'),
    data: balances.map(({ date, amount }): [number, number] => [date.getTime(), amount.value])
  }));
  return { series };
};
