import api from './../api';

async function handleCalendarWebhooks(headers) {
  const response = await api({
    action: 'calendarList',
  });
  console.log(response);
}

export default {
  handleCalendarWebhook,
};
