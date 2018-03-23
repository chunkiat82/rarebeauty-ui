import moment from 'moment';
import AST from 'auto-sorting-array';

let services = null;

export function queryPastAppointments(fetch) {
  return async personId => {
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

    return personData.person ? personData.person.appointments : [];
  };
}

export function createCalendar(fetch) {
  return async input => {
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
      toBeInformed,
      deposit,
    } = input;

    const dateInput = moment(startDate).format('YYYYMMDD');
    const timeInput = moment(startTime).format('HHmm');

    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation($name: String!, $mobile:String!, $resourceName:String, $start:String!, $serviceIds:[String]!, $duration:Int!, $totalAmount:Float, $additional:Float, $discount:Float, $toBeInformed:Boolean, $deposit:Float) {
                    createAppointment(name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, serviceIds:$serviceIds, duration:$duration, totalAmount:$totalAmount, additional:$additional, discount:$discount, toBeInformed:$toBeInformed, deposit:$deposit ) {
                        id
                        event { 
                            id,
                            resourceName,
                            name,
                            mobile,
                            start,
                            end,
                            serviceIds,
                            informed
                        }
                        transaction {
                            id,
                            items { id, type, name, price },
                            totalAmount,
                            service,
                            product,
                            discount,
                            additional,
                            deposit
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
          toBeInformed,
          deposit,
        }),
      }),
    });

    const { data, errors } = await resp.json();

    return { errors, data };
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
                      additional,
                      deposit
                  } 
              }}`,
      }),
    });
    const { data } = await resp.json();
    // console.log(`data=${JSON.stringify(data, null, 2)}`);
    return data && data.appointment;
  };
}
export function updateAppointment(fetch) {
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
      deposit,
    } = input;

    const dateInput = moment(startDate).format('YYYYMMDD');
    const timeInput = moment(startTime).format('HHmm');

    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation($id: String!, $name: String!, $mobile:String!, $resourceName:String, $start:String!, $serviceIds:[String]!, $duration:Int!, $totalAmount:Float, $additional:Float, $discount:Float, $deposit:Float) {
            updateAppointment(id:$id, name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, serviceIds:$serviceIds, duration:$duration, totalAmount:$totalAmount, additional:$additional, discount:$discount, deposit:$deposit) {
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
                    additional,
                    deposit
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
          deposit,
        }),
      }),
    });

    const { data, errors } = await resp.json();

    return { data, errors };
  };
}

function listServices(fetch) {
  return async () => {
    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `
          {
              services {
                id,
                service,
                duration,
                price,
                followUp,
                count,
                enabled
              }
          }
        `,
      }),
    });
    const { data } = await resp.json();
    return data.services;
  };
}

// uses some weak cache
export function getServices(fetch) {
  return async () => {
    if (services === null) {
      const responseServices = await listServices(fetch)();
      services = new AST(responseServices, 'id');
    }
    return services;
  };
}

export default {
  queryPastAppointments,
  createCalendar,
  listContacts,
  getAppointment,
  updateAppointment,
  getServices,
};
