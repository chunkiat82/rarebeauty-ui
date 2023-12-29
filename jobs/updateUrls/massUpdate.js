import cli from './tempCli';

const contacts = require('./urlcontacts.json');

const INCREMENT = 10;

async function main(j) {
  const promises = [];
  let count = 0;
  let i = Number(j);
  // get contacts length
  // take 20 requests a minute then run again
  while (count < INCREMENT && i < contacts.length) {
    if (contacts[i].urls === null) {
      console.log('contact', contacts[i]);
      promises.push(
        cli({
          action: 'updateContact',
          resourceName: contacts[i].resourceName,
          appointmentUrl: 'anything',
        }),
      );
      count++;
    }
    if (count === INCREMENT) {
      setTimeout(() => {
        main(j + INCREMENT);
      }, 61000);
      break;
    }
    i++;
  }
  console.log('PROMISES LENGTH', promises.length);
  console.log('count', count);
  console.log('INCREMENT', INCREMENT);
  await Promise.all(promises);
}
console.log('job starting');
main(0);
