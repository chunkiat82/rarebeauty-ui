export function getEvent(fetch) {
  return async eventId => {
    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `
                {event(id: "${eventId}"){
                    id,                    
                    name,
                    mobile,
                    start,
                    end,
                    serviceIds,
                    resourceName
                }}`,
      }),
    });
    const { data } = await resp.json();
    return (data && data.event) || { error: 'Event Not Found' };
  };
}

export function patchEvent(fetch) {
  return async (eventId, status) => {
    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation($id: String!, $status:String!) {
          updateEventStatus(id:$id, status:$status) {
                    id,
                    status,
                }
            }`,
        variables: JSON.stringify({
          id: eventId,
          status,
        }),
      }),
    });
    const { data } = await resp.json();
    return data || { error: 'Event Not Found' };
  };
}

export default { getEvent, patchEvent };
