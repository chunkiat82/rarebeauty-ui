// https://developers.google.com/apis-explorer/?hl=en_US#p/
// babel-node cli --action=updateContact --verified=false --resourceName=people/YYY --mobile=XX
const { generatePeopleObj } = require('../utilities/jwt');

async function updateContact(
  { resourceName, mobile, validPhone, appointmentUrl },
  me,
  cb,
) {
  const people = await generatePeopleObj();

  // console.error(`verified=${verified}` !== undefined ? verified : true);
  const defaultResource = {
    etag: me.etag,
    phoneNumbers: me.phoneNumbers,
    userDefined: me.userDefined,
  };

  if (mobile) {
    defaultResource.phoneNumbers = [
      {
        value: `${mobile}`,
        type: 'mobile',
      },
    ];
  }

  if (validPhone) {
    // possible
    defaultResource.userDefined = [
      {
        key: 'validPhone',
        value: validPhone !== undefined ? validPhone : true,
      },
    ];
  }

  if (appointmentUrl || true) {
    // possible
    defaultResource.urls = [
      {
        type: 'appointment',
        value: `https://appointments.soho.sg/customer/${
          resourceName.split('people/')[1]
        }/createAppointment`,
      },
    ];
  }

  people.people.updateContact(
    {
      resourceName,
      updatePersonFields: ['urls'],
      personFields: ['phoneNumbers', 'userDefined', 'urls'],
      resource: defaultResource,
    },
    {},
    cb,
  );
}

export default async function update(options) {
  const { resourceName } = options;
  const people = await generatePeopleObj();

  return new Promise((res, rej) => {
    people.people.get(
      {
        resourceName,
        personFields: ['phoneNumbers', 'userDefined', 'urls'],
      },
      {},
      (err, { data: me }) => {
        // console.log(err || me);
        if (err) {
          rej(err);
        } else {
          updateContact(options, me, (errUpdate, meUpdate) => {
            if (errUpdate) {
              rej(errUpdate);
            } else {
              res(meUpdate);
            }
          });
        }
      },
    );
  });
}
