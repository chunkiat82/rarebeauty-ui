import moment from 'moment';
import { argv } from 'yargs';
import functions from './functions';

function processArguments() {
  const options = argv;
  const startDT = moment(argv.start);
  const endDT = moment(startDT).add(argv.duration, 'minutes');

  return Object.assign({}, options, {
    startDT: startDT.toISOString(),
    endDT: argv.duration ? endDT.toISOString() : null,
    action: functions[argv.action] || functions.listEvents,
  });
}

// eslint-disable-next-line no-shadow
export default async function main(argv) {
  const options = processArguments(argv);
  const results = await options.action(options);
  return results;
}
