import api from './../api';

async function handleCalendarWebhooks(headers) {
  const response = await api({
    action: 'calendarListDelta',
  });
  console.log(response);
  console.log('done with hook');
}

export default {
  handleCalendarWebhook,
};
