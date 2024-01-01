import moment from 'moment';
// import { argv } from 'yargs';
import functions from './functions';

// context is included in argv
function processArguments(argv) {
  const startDT = moment(argv.start);
  const endDT = moment(startDT).add(argv.duration, 'minutes');
  const action = functions[argv.action] || functions.listEvents;
  const context = argv.context;
  return {
    action,
    options: Object.assign({}, argv, {
      startDT: startDT.toISOString(),
      endDT: argv.duration ? endDT.toISOString() : null,
      context,
    }),
  };
}

// eslint-disable-next-line no-shadow
export default async function main(argv) {
  const { action, options } = processArguments(argv);
  try {
    const results = await action(options);
    return results;
  } catch (err) {
    console.error('api error', err);
    throw err;
  }
}
