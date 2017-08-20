import moment from 'moment';
import { argv } from 'yargs';
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
    console.log(results);
}

try {
    main(argv);
} catch (err) {
    console.log(err);
}