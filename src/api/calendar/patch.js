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
                        extendedProperties: {
                            shared: {
                                services: services.map(item => item.id).join(','),
                                uuid: apptId,
                                apptId
                            },
                        },
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

        if (mobile) {
            patchObject.resource.extendedProperties = {
                shared: { mobile },
            };
        }

        if (reminded) {
            if (
                patchObject.resource.extendedProperties &&
                patchObject.resource.extendedProperties.shared
            ) {
                patchObject.resource.extendedProperties.shared.reminded =
                    reminded === 'true';
            } else {
                patchObject.resource.extendedProperties = {
                    shared: { reminded },
                };
            }
        }

        calendar.events.patch(patchObject, (err, event) => {
            if (err) {
                console.log(
                    `There was an error contacting the Calendar service: ${JSON.stringify(err)}`,
                );
                rej(err);
            }
            res(event);
        });
    });
};
