import { spawn } from 'child_process';
import { writeFile } from 'fs';
import csv from '@fast-csv/parse';
import { dirname } from 'path';
import { startOfDay } from 'date-fns';
import currency from 'currency.js';
import path from 'path';

import CashFlow from './charts/CashFlow.js';
import Expenses from './charts/Expenses.js';
import Investments from './charts/Investments.js';
import Numbers from './charts/Numbers.js';
import NetWorth from './charts/NetWorth.js';

const cwd = dirname(process.argv[1]);

const log = (...args: any[]) => {
  console.log(...args);
  return args;
};

const hledger = (args: string[]): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const rows = [];
    const parseCSV = csv
      .parse({ headers: true })
      .on('error', reject)
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows));
    const child = spawn('hledger', [
      '-f',
      path.join(cwd, '../../main.ledger'),
      '-f',
      path.join(cwd, '../../future.ledger'),
      ...args
    ]);
    let error = '';
    child.stderr.on('data', (data) => (error += data));
    child.stderr.on('end', () => {
      if (error) {
        reject(error);
      }
    });
    child.stdout.pipe(parseCSV);
  });

const exportTransactions = async () => {
  log('exporting transactions...');
  const transactions = await hledger(['register', '--value=then,SEK', '--output-format=csv']).then(
    (rows) =>
      rows.map((row: any) => {
        const { date, account, amount } = row;
        const amountParts = amount.split(' ');
        return {
          date: startOfDay(new Date(date)),
          account,
          amount: currency(amountParts[0])
        };
      })
  );
  log(`${transactions.length} transactions exported`);
  return transactions;
};

const exportBalances = async () => {
  log('exporting balances...');
  const balances = await hledger([
    'balance',
    '--value=end,SEK',
    '--daily',
    '--historical',
    '--output-format=csv',
    '--layout=tidy'
  ]).then((rows) =>
    rows.map((row: any) => {
      const { account, period, value } = row;
      return {
        account,
        date: startOfDay(new Date(period)),
        amount: currency(value)
      };
    })
  );
  log(`${balances.length} balances exported`);
  return balances;
};

const writeJSON = (data: any, path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    writeFile(path, JSON.stringify(data), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

const exec = async (fn: Function, args: any[], path: string) => {
  log(`writing ${path}`);
  const data = fn(...args);
  await writeJSON(data, path);
  return;
};

await Promise.all([exportBalances(), exportTransactions()]).then(([balances, transactions]) => {
  Promise.all([
    exec(NetWorth, [balances], path.join(cwd, '../src/charts/NetWorth/data.json')),
    exec(CashFlow, [transactions], path.join(cwd, '../src/charts/CashFlow/data.json')),
    exec(Expenses, [transactions], path.join(cwd, '../src/charts/Expenses/data.json')),
    exec(
      Investments,
      [balances, transactions],
      path.join(cwd, '../src/charts/Investments/data.json')
    ),
    exec(Numbers, [balances, transactions], path.join(cwd, '../src/charts/Numbers/data.json'))
  ]).then(() => {
    console.log('all done');
  });
});
