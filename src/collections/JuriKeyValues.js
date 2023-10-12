// import { CollectionConfig } from 'payload/types';
// const { CollectionConfig } = require('payload/types');


// {
//     "objectId": "123",
//     "key": "header",
//     "value": "header",
//     "description": "desctiption of key ",
//     "page": "landingpage",
//     // "orgId": "orgId",
//     // "languageId": 1
// }

const JuriKeyValues = {
    slug: 'juri_key_value',
    // versioning with drafts enabled tells Payload to save documents to a separate collection in the database and allow publishing
    versions: {
      drafts: true,
    },
    fields: [
      {
        name: 'pageName',
        type: 'text',
        required: true,
        index: true
      },
      {
        name: 'key',
        type: 'text',
        required: true,
        index: true
      },
      {
        name: 'value',
        type: 'text',
        required: true,
        // localized fields are stored as keyed objects to represent 
        // each locale listed in the payload.config.ts. For example: { en: 'English', fe: `French`, es: 'Espanol', ...etc }
        // localized: true,
      },
      {
        name: 'description',
        type: 'text',
      },
      {
        name: 'languages',
        type: 'relationship',
        relationTo: 'languages',
        // allow selection of one or more jurisdiction
        hasMany: true,
      },
    ],
    indexes: [
      {'fields':
        {
          pageName: 1,
          key: 1
        }
      }
    ]
  }
  
  module.exports = JuriKeyValues;
  