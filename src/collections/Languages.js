// import { CollectionConfig } from 'payload/types';
// const { CollectionConfig } = require('payload/types');


// {
//     "objectId": "456",
//     "name": "english",
// }

const Languages = {
    slug: 'languages',
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
        name: 'ISOCode',
        type: 'text',
        required: true,
        index: true
      },
    ]
  }
  
  module.exports = Languages;
  