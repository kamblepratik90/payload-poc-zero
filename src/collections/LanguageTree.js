// import { CollectionConfig } from 'payload/types';
// const { CollectionConfig } = require('payload/types');


// {
//     "id": 1,
//     "isDefault": true,
//     "ISOCode": "en",
//     "languageName": "English",
//     "keyValues": [object(0)
//     ],
//     "juridisctionLanguages": [
//         {
//             "OrgId": "123",
//             "LanguageId": "123",
//             "KeyValues": [ object(0)
//             ]
//         }
//     ]
// }

const LanguageTree = {
    slug: 'language_tree',
    // versioning with drafts enabled tells Payload to save documents to a separate collection in the database and allow publishing
    versions: {
      drafts: true,
    },
    fields: [
      {
        name: 'isDefault',
        type: 'text',
        required: true
      },
      {
        name: 'ISOCode',
        type: 'text',
        required: true
      },
      {
        name: 'languageName',
        type: 'text',
        required: true
      },
      {
        name: 'keyValues',
        type: 'relationship',
        relationTo: 'base_key_values',
        // allow selection of one or more jurisdiction
        hasMany: true,
      },
      // this will be a id from 'base_key_values' collection
      // eg -> 
      // "keyValues" : [ 
      //   "6517bd6510cba1fe59df905f"
      // ],
      {
        name: 'juridisctionLanguages',
        type: 'relationship',
        relationTo: 'juri_languages',
        // allow selection of one or more jurisdiction
        hasMany: true,
      }
      // this will be a id from 'juri_languages' collection
      // eg -> 
      // "keyValues" : [ 
      //   "6517bd6510cba1fe59df905f"
      // ]
    ],
    // indexes: [
    //   {'fields':
    //     {
    //       pageName: 1,
    //       key: 1
    //     }
    //   }
    // ]
  }
  
  module.exports = LanguageTree;
  