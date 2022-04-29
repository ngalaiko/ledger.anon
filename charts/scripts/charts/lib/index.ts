import { compareAsc, startOfDay, startOfMonth } from 'date-fns';
import currency from 'currency.js';

export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

type Row = {
  date: Date;
  account: string;
  amount: currency;
};

export const perDay = function <T extends Row>(i: T): number {
  return startOfDay(i.date).getTime();
};

export const perMonth = function <T extends Row>(i: T): number {
  return startOfMonth(i.date).getTime();
};

export const or =
  (...fns: any[]) =>
  (...args: any[]) =>
    fns.reduce((acc, fn) => acc || fn(...args), false);

export const and =
  (...fns: any[]) =>
  (...args: any[]) =>
    fns.reduce((acc, fn) => acc && fn(...args), true);

export const not =
  (f: (...args: any[]) => any) =>
  (...args: any[]) =>
    !f(...args);

export const accountLike = (...likes: string[]) =>
  function <Type extends { account: string }>(accounted: Type): boolean {
    return likes
      .map((like) => accounted.account.startsWith(like))
      .reduce((is, like) => is || like, false);
  };

export const depth = (i: number) =>
  function <Type extends { account: string }>(tx: Type): Type {
    const accountParts = tx.account.split(':');
    return { ...tx, account: accountParts.slice(0, i).join(':') };
  };

export const negative = function <Type extends { amount: currency }>(tx: Type) {
  return { ...tx, amount: tx.amount.value > 0 ? tx.amount.multiply(-1) : tx.amount };
};

export const invert = function <Type extends { amount: currency }>(tx: Type) {
  return { ...tx, amount: tx.amount.multiply(-1) };
};

export const byDateAsc = (a: Row, b: Row) => compareAsc(a.date, b.date);

export const change = function <T extends Row>(transactions: T[], by: (i: T) => number): Row[] {
  const byAccount = groupBy(transactions, (i: T) => i.account);
  return Object.entries(byAccount).flatMap(([account, transactions]) => {
    const transactionsByUnixDate = groupBy(transactions, by);
    return Object.entries(transactionsByUnixDate).map(([unixDate, transactions]): Row => {
      const date = new Date(parseInt(unixDate));
      return {
        account,
        date,
        amount: transactions.reduce((sum, tx) => sum.add(tx.amount), currency(0))
      };
    });
  });
};
