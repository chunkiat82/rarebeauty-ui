import moment from 'moment';

export function queryPastAppointments(fetch) {
  return async (personId) => {
    const personResponse = await fetch('/graphql', {
      body: JSON.stringify({
        query: `{person(id: "${personId}")
                    {   
                        id, 
                        appointments { id,
                            event{ 
                                id, start, resourceName, serviceIds
                            },
                            transaction { 
                                id,
                                items {
                                    name 
                                }
                            }
                        }
                    }
                }`,
      }),
    });

    const { data: personData } = await personResponse.json();

    // console.log(personData);

    return personData.person.appointments;
  };
}

export function createCalendar(fetch) {
  return async (input) => {
    const {
      duration,
      name,
      mobile,
      resourceName,
      startDate,
      startTime,
      serviceIds,
      totalAmount,
      additional,
      discount,
    } = input;

    const dateInput = moment(startDate).format('YYYYMMDD');
    const timeInput = moment(startTime).format('HHmm');

    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation($name: String!, $mobile:String!, $resourceName:String, $start:String!, $serviceIds:[String]!, $duration:Int!, $totalAmount:Float, $additional:Float, $discount:Float) {
                    createAppointment(name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, serviceIds:$serviceIds, duration:$duration, totalAmount:$totalAmount, additional:$additional, discount:$discount ) {
                        id
                        event { 
                            id,
                            resourceName,
                            name,
                            mobile,
                            start,
                            end,
                            serviceIds
                        }
                        transaction {
                            id,
                            items { id, type, name, price },
                            totalAmount,
                            service,
                            product,
                            discount,
                            additional
                        }
                    }
                }`,
        variables: JSON.stringify({
          name,
          mobile,
          resourceName,
          start: `${dateInput}T${timeInput}`,
          serviceIds,
          duration,
          totalAmount,
          additional,
          discount,
        }),
      }),
    });

    const { data } = await resp.json();

    return data;
  };
}

export function listContacts(fetch) {
  return async () => {
    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: '{contact{name,mobile,display,resourceName}}',
      }),
    });
    const { data } = await resp.json();
    return data.contact;
  };
}

export function getAppointment(fetch) {
  return async apptId => {
    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `
              {appointment(id: "${apptId}"){
                  id,
                  event {
                      id,
                      name
                      mobile,
                      start,
                      end,
                      serviceIds,
                      resourceName
                  },
                  transaction {
                      id,
                      items { id, type, name, price },
                      totalAmount,
                      service,
                      product,
                      discount,
                      additional
                  } 
              }}`,
      }),
    });
    const { data } = await resp.json();
    // console.log(`data=${JSON.stringify(data, null, 2)}`);
    return data.appointment;
  };
}
export function upsertAppointment(fetch) {
  return async input => {
    const {
      duration,
      id,
      name,
      mobile,
      resourceName,
      startDate,
      startTime,
      serviceIds,
      totalAmount,
      additional,
      discount,
    } = input;

    const dateInput = moment(startDate).format('YYYYMMDD');
    const timeInput = moment(startTime).format('HHmm');

    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation($id: String!, $name: String!, $mobile:String!, $resourceName:String, $start:String!, $serviceIds:[String]!, $duration:Int!, $totalAmount:Float, $additional:Float, $discount:Float) {
            updateAppointment(id:$id, name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, serviceIds:$serviceIds, duration:$duration, totalAmount:$totalAmount, additional:$additional, discount:$discount ) {
                id
                event { 
                    id,
                    name
                    mobile,
                    start,
                    end,
                    serviceIds
                }
                transaction {
                    id,
                    items { id, type, name, price },
                   totalAmount,
                    service,
                    product,
                    discount,
                    additional
                }
            }
            }`,
        variables: JSON.stringify({
          id,
          name,
          mobile,
          resourceName,
          start: `${dateInput}T${timeInput}`,
          serviceIds,
          duration,
          totalAmount,
          additional,
          discount,
        }),
      }),
    });

    const { data } = await resp.json();

    return data;
  };
}

export default {
  queryPastAppointments,
  createCalendar,
  listContacts,
  getAppointment,
};
