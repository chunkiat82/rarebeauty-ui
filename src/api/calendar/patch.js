const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

function patchHandler(res, rej, calendar, options, eventResponse) {

    const {
        calendarId,
        eventId,
        name,
        mobile,
        startDT,
        endDT,
        services,
        reminded,
        apptId
    } = options;

    const patchObject = {
        calendarId,
        eventId,
        resource: eventResponse
    }

    if (startDT && endDT) patchObject.resource.start.dateTime = startDT;
    if (endDT) patchObject.resource.end.dateTime = endDT;

    if (patchObject.resource.extendedProperties === undefined) patchObject.resource.extendedProperties = {};
    if (patchObject.resource.extendedProperties.shared === undefined) patchObject.resource.extendedProperties.shared = {};

    if (mobile) patchObject.resource.extendedProperties.shared.mobile = mobile;
    if (services) {
        patchObject.resource.extendedProperties.shared.services = services.map(item => item.id).join(',');
        patchObject.description = `${services.map(item => item.service).join(',', )}\n\nhttps://rarebeauty.soho.sg/appointment/edit/${apptId}`;
    }
    if (reminded) patchObject.resource.extendedProperties.shared.reminded = reminded;
    if (apptId) {
        patchObject.resource.extendedProperties.shared.uuid = apptId;
        patchObject.resource.extendedProperties.shared.apptId = apptId;
    }


    // console.log(`patchObject=${JSON.stringify(patchObject)}`);
    calendar.events.patch(patchObject, (err, event) => {
        if (err) {
            console.log(
                `There was an error contacting the Calendar service: ${JSON.stringify(err)}`,
            );
            rej(err);
        }
        // console.log(`res(event)=${JSON.stringify(event)}`);
        res(event);
    });
}

module.exports = function patch(options) {

    const {
        calendarId,
        eventId
    } = options;

    if (!calendarId || !eventId) {
        return new Promise((res, rej) => {
            rej('no event patched');
        });
    }

    return new Promise(async (res, rej) => {
        const jwtClient = await generateJWT();
        const calendar = google.calendar({ version: 'v3', auth: jwtClient });
        calendar.events.get({
            calendarId,
            eventId
        }, (err, response) => {
            if (err) {
                rej(err);
            } else {
                patchHandler(res, rej, calendar, options, response);
            }
        });
    });
};
