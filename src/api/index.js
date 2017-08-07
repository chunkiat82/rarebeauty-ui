import moment from 'moment';
import { argv } from 'yargs';
import functions from './functions';

function processArguments(argv) {
  const options = argv;
  const startDT = moment(argv.start);
  const endDT = moment(startDT).add(argv.duration, 'minutes');

  return Object.assign({}, options, {
    startDT: startDT.toISOString(),
    endDT: endDT.toISOString(),
    action: functions[argv.action] || functions.listEvents,
  });
}

export default async function main(argv) {
  const options = processArguments(argv);
  const results = await options.action(options);
  return results;
}
