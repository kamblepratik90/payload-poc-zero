// import { CollectionConfig } from 'payload/types';
// const { CollectionConfig } = require('payload/types');


// {
//     "objectId": "456",
//     "id": 10,
//     "key": "header",
//     "page": "landingpage",
//     "description": "desctiption of key ",
//     "value": "Welcome to the landing page",
//     "languageId": [
//         1
//     ]
// }

const BaseKeyValues = {
    slug: 'base_key_values',
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
      }
      // this will be a id from 'languages' collection
      // eg -> 
      // "languages" : [ 
      //   "6517bd6510cba1fe59df905f"
      // ]
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
  
  module.exports = BaseKeyValues;
  