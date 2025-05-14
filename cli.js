// Load environment variables first
require('./load-env');

// Verify environment loading
const isProd = process.env.NODE_ENV === 'production' || process.env.PRODUCTION === 'true';
const envFile = isProd ? 'env.production' : 'env.local';
console.log(`Using environment from: ${envFile}`);
console.log('Database connection settings:');
console.log('- CBURL:', process.env.CBURL);
console.log('- CB_BUCKET:', process.env.CB_BUCKET);
console.log('- CB_USERNAME:', process.env.CB_USERNAME);

const moment = require('moment-timezone');
const yargs = require('yargs');
const functions = require('./src/api/functions');

// Configure timezone from environment
if (process.env.TZ) {
  moment.tz.setDefault(process.env.TZ);
  console.log(`Using timezone: ${process.env.TZ}`);
}

function processArguments(argv) {
  const options = argv;
  // Default to current date if no start date provided
  const startDT = argv.start ? moment(argv.start) : moment();
  let endDT = argv.end ? moment(argv.end) : null;
  endDT = argv.duration ? moment(startDT).add(argv.duration, 'minutes') : endDT;
  const services = String(argv.services || '').split(',');
  const mobile = String(argv.mobile || '');
  let action = functions.listEvents;
  
  // Apply tenant from environment if specified
  const tenant = argv.tenant || process.env.CB_DEFAULT_TENANT || 'rarebeauty';
  
  if (functions[argv.action]) {
    action = functions[argv.action];
  } else {
    console.error(`action not found = `, functions[argv.action]);
  }

  return Object.assign({}, options, {
    startDT: startDT.toISOString(),
    endDT: endDT ? endDT.toISOString() : null,
    details: true,
    action,
    services,
    mobile,
    tenant,
    context: { tenant }
  });
}

// Change to CommonJS export
function mainExport(argv) {
  const options = processArguments(argv);
  //const results = await options.action(options);
  return results;
}

async function main(argv) {
  try {
    console.log(`Running in ${process.env.NODE_ENV || 'development'} mode`);
    
    const options = processArguments(argv);
    // console.log(options);
    const results = await options.action(options);
    if (results && Array.isArray(results)) {
      if (results.length > 0 && argv.details) {
        if (results[0].start) {
          println(results);
        } else {
          console.log('Array Results:', JSON.stringify(results, null, 2));
        }
        console.log(`Results Length ${results.length}`);
      } else {
        if (argv.pretty) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          console.log(`Results is ${results}`);
        }
      }
    } else {
      console.log('Results:', JSON.stringify(results, null, 2));
    }
    // to kill couchbase bucket
    process.exit();
  } catch (error) {
    console.log('main - ', error);
    process.exit(1);
  }
}

function println(events) {
  if (events.length === 0) {
    console.log('No changed events found.');
  } else {
    console.log(`Upcoming events (${events.length}):`);
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.summary && event.summary.indexOf('-') === 0) continue;
      if (event.start) {
        const start = event.start.dateTime || event.start.date;
        const description =
          (event.description && event.description.split('\n')[0]) ||
          'No Description';
        console.log(
          '%s - %s - %s - %s - %s - %s -%s',
          start,
          event.summary,
          event.status,
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
  main(yargs.argv);
} catch (err) {
  console.log(`running err=${JSON.stringify(err, null, 2)}`);
  process.exit(1);
}

// Export the main function
module.exports = mainExport;
