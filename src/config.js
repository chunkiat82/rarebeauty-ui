if (process.env.BROWSER) {
  throw new Error(
    'Do not import `config.js` from inside the client-side code.',
  );
}

module.exports = {
  // Backend Service
  port: process.env.PORT || 3000,
  // API Gateway
  apiUrl:
    String(process.env.PRODUCTION) === 'true'
      ? `https://${process.env.API_CLIENT_URL}`
      : `http://${process.env.API_CLIENT_URL}`,
  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET || 'SOHO Appointments System' },
  },
  app: {
    workAddress: 'Blk 649B Jurong West Street 61 #03-302 S(642649)',
    workDomain: 'rarebeauty.soho.sg',
    workCalendar: 'Rare Beauty iCal',
    customerURL: 'https://rarebeauty.soho.sg/p/customer',
  },
};
