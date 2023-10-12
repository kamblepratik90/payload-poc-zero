// import { CollectionConfig } from 'payload/types';
// const { CollectionConfig } = require('payload/types');


// {
//     "objectId": "456",
//     "orgId": "ORG_100"
//     "name": "california",
// }

const Organizations = {
    slug: 'organizations',
    // versioning with drafts enabled tells Payload to save documents to a separate collection in the database and allow publishing
    versions: {
      drafts: true,
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        index: true
      },
      {
        name: 'orgId',
        type: 'text',
        required: true,
        index: true
      }
    ]
  }
  
  module.exports = Organizations;
  