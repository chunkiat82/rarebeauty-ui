import moment from 'moment';
import {
  argv
} from 'yargs';
import functions from './src/api/functions';


function processArguments(argv) {
  const options = argv;
  const startDT = moment(argv.start);
  const endDT = moment(startDT).add(argv.duration, 'minutes');

  return Object.assign({}, options, {
    startDT: startDT.toISOString(),
    endDT: argv.duration ? endDT.toISOString() : null,
    details: true,
    action: functions[argv.action] || functions['listEvents'],
  });
}

async function main(argv) {
  const options = processArguments(argv);
  const results = await options.action(options);  
  if (results && Array.isArray(results)) {    
    if (results.length > 0 && argv.details) {
      if (results[0].start) {
        println(results);
      }else {
        console.log(JSON.stringify(results, null, 2));
      }
    } else {
      console.log(`Results is ${results}`);
    }
  } else {
    console.log(JSON.stringify(results, null, 2));
  }
}

function println(events) {
  if (events.length === 0) {
    console.log('No changed events found.');
  } else {
    console.log(`Upcoming events (${events.length}):`);
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.summary.indexOf('-') === 0) continue;
      if (event.start) {
        const start = event.start.dateTime || event.start.date;
        const description =
          (event.description && event.description.split('\n')[0]) ||
          'No Description';
        console.log(
          '%s - %s - %s - %s - %s - %s -%s',
          start,
          event.summary,
          event.id,
          description,
          (event.extendedProperties &&
            event.extendedProperties.shared &&
            event.extendedProperties.shared.services) ||
          'no services',
          (event.extendedProperties &&
            event.extendedProperties.shared &&
            event.extendedProperties.shared.mobile) ||
          '0',
          (event.extendedProperties &&
            event.extendedProperties.shared &&
            event.extendedProperties.shared.reminded) ||
          'false',
          (event.extendedProperties &&
            event.extendedProperties.shared &&
            event.extendedProperties.shared.touchUpReminded) ||
          'false'
        );
      } else {
        console.error(event);
      }
    }
  }
}

try {
  main(argv);
} catch (err) {
  console.log(`running err=${JSON.stringify(err, null, 2)}`);
}
