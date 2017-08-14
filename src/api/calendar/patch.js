const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = function patch(options) {

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

    if (!calendarId || !eventId) {
        return new Promise((res, rej) => {
            rej('no event patched');
        });
    }

    return new Promise(async (res, rej) => {
        const jwtClient = await generateJWT();
        const calendar = google.calendar({ version: 'v3', auth: jwtClient });
        const patchObject = Object.assign(
            {},
            {
                calendarId,
                eventId,
                resource: {
                    calendarId,
                    resource: {
                        start: { dateTime: startDT },
                        end: { dateTime: endDT },
                        summary: name,
                        location: 'Home',
                        status: 'confirmed',                        
                        attendees: [
                            {
                                displayName: name,
                                comment: mobile,
                                email: `test@soho.sg`,
                            },
                        ],
                        description: `${services.map(item => item.service).join(',', )}\n\nhttps://rarebeauty.soho.sg/appointment/edit/${apptId}`,
                    },
                },
            },
        );

        if (patchObject.resource.extendedProperties === undefined) patchObject.resource.extendedProperties = {};
        if (patchObject.resource.extendedProperties.shared === undefined ) patchObject.resource.extendedProperties.shared = {};

        if (mobile) patchObject.resource.extendedProperties.shared.mobile = mobile;
        if (services) patchObject.resource.extendedProperties.shared.services = services.map(item => item.id).join(',');
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
    });
};
