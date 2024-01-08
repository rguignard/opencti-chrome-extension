export const searchIndicator = async (observable: any, storage: any) => {
    let query = {
        query: `query  {
          indicators(filters: { 
                mode :and,
                filters:[
                  {
                    key: "name",
                    values: ["` + observable.value + `"],
                    operator: eq,
                    mode: or
                  }
                ],
                filterGroups:[]
              }
           ) {
          edges {
            node {
              name
              id
              x_opencti_score
              indicator_types
              objectLabel {
                edges {
                  node {
                    id
                    value
                    color
                  }
                }
              } 
              stixCoreRelationships{
                edges{
                  node{
                    to{
                      ... on Campaign {
                          id
                          name
                          entity_type
                      }
                      ... on Indicator {
                          id
                          name
                          entity_type
                      }
                      ... on Infrastructure {
                          id
                          name
                          entity_type
                      }
                      ... on IntrusionSet {
                          id
                          name
                          entity_type
                      }
                      ... on Malware {
                          id
                          name
                          entity_type
                      }
                      ... on ThreatActorGroup {
                          id
                          name
                          entity_type
                      }
                      ... on ThreatActorIndividual {
                          id
                          name
                          entity_type
                      }
                      ... on ThreatActor {
                          id
                          name
                          entity_type
                      }
                      ... on Tool {
                          id
                          name
                          entity_type
                      }
                      ... on Vulnerability {
                          id
                          name
                          entity_type
                      }
                      ... on Incident {
                          id
                          name
                          entity_type
                      }
                      ... on Event {
                          id
                          name
                          entity_type
                      }
                      ... on Case {
                          id
                          name
                          entity_type
                      }
                    }
                  }
                }
              }
              reports{
                edges{
                  node{
                    id
                    name
                  }
                }
              }
            }
          }
         }
        }`
    };
    let resp = await sendGraphQLRequest(storage['opencti_url'], storage['opencti_token'], query);
    if (resp && resp.hasOwnProperty("errors")) {
        console.log(resp['errors']);
        throw Error(resp['errors']['message']);
    }
    return resp
}

export const searchVulnerability = async (observable: any, storage: any) => {
    let query = {
        query: `query  {
          vulnerabilities(filters: { 
                mode :and,
                filters:[
                  {
                    key: "name",
                    values: ["` + observable.value + `"],
                    operator: eq,
                    mode: or
                  }
                ],
                filterGroups:[]
              }
           ) {
          edges {
            node {
              name
              id
              objectLabel {
                edges {
                  node {
                    id
                    value
                    color
                  }
                }
              } 
              stixCoreRelationships{
                edges{
                  node{
                    to{
                      ... on Campaign {
                          id
                          name
                          entity_type
                      }
                      ... on Indicator {
                          id
                          name
                          entity_type
                      }
                      ... on Infrastructure {
                          id
                          name
                          entity_type
                      }
                      ... on IntrusionSet {
                          id
                          name
                          entity_type
                      }
                      ... on Malware {
                          id
                          name
                          entity_type
                      }
                      ... on ThreatActorGroup {
                          id
                          name
                          entity_type
                      }
                      ... on ThreatActorIndividual {
                          id
                          name
                          entity_type
                      }
                      ... on ThreatActor {
                          id
                          name
                          entity_type
                      }
                      ... on Tool {
                          id
                          name
                          entity_type
                      }
                      ... on Vulnerability {
                          id
                          name
                          entity_type
                      }
                      ... on Incident {
                          id
                          name
                          entity_type
                      }
                      ... on Event {
                          id
                          name
                          entity_type
                      }
                      ... on Case {
                          id
                          name
                          entity_type
                      }
                    }
                  }
                }
              }
              reports{
                edges{
                  node{
                    id
                    name
                  }
                }
              }
            }
          }
         }
        }`
    };
    let resp = await sendGraphQLRequest(storage['opencti_url'], storage['opencti_token'], query);
    if (resp && resp.hasOwnProperty("errors")) {
        console.log(resp['errors']);
        throw Error(resp['errors']['message']);
    }
    return resp
}

export const healthCheck = async (url: string, token: string) => {
    let query = {
        query: `query  {
        intrusionSets(filters: { 
        mode :and,
        filters:[],
        filterGroups:[]
      }, first: 1)
          {
          edges{
            node{
              id
              description
            }
          }
         }
      }`
    };
    let resp = await sendGraphQLRequest(url, token, query);
    if (resp && resp.hasOwnProperty("errors")) {
        console.log(resp['errors']);
        throw Error(resp['errors']['message']);
    }
}

const sendGraphQLRequest = (url: string, token: string, query: any) => new Promise<any>((resolve, reject) => {
    const headers = new Headers({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
    });
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    };

    fetch(url + "/graphql", requestOptions)
        .then(response => response.json())
        .then(result => {
            resolve(result);
        })
        .catch((err) => reject(err));
})
