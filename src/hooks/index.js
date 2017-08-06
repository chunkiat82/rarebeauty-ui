import api from './../api';
import db from '../data/database';

export async function handleCalendarWebhook(headers) {
  const changes = await api({
    action: 'calendarListDelta',
  });

  changes.forEach(item => {
    if (item.status === 'cancelled') {
      handleCancel(item);
    } else if (item.status === 'confirmed') {
      handleUpsert(item);
    } else {
      console.log('unhandled status');
    }
  });

  // handle cancel
  // handle change
  console.log(changes);
}

async function handleCancel(item) {
  await db.remove(`event:${item.id}`);
}

async function handleUpsert(item) {
  if (item.id.indexOf('_') !== 0) {
    await db.upsert(`event:${item.id}`, item);
  } else {
    console.log(`item.id =${item.id} ignored`);
  }
}

const functionToCall = {
  cancelled: handleCancel,
  confirmed: handleUpsert,
};

export default handleCalendarWebhook;
