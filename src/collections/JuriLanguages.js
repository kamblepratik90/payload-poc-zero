// import { CollectionConfig } from 'payload/types';
// const { CollectionConfig } = require('payload/types');


// {
//     "OrgId": "123",
//     "LanguageId": "123",
//     "KeyValues": [ object(0)
//     ]
// }

const JuriLanguages = {
    slug: 'juri_languages',
    // versioning with drafts enabled tells Payload to save documents to a separate collection in the database and allow publishing
    versions: {
      drafts: true,
    },
    fields: [
      // {
      //   name: 'OrgId',
      //   type: 'text',
      //   required: true,
      //   index: true
      // },
      {
        name: 'OrgId',
        type: 'relationship',
        relationTo: 'organizations',
        // allow selection of one or more jurisdiction
        hasMany: false,
      },
      // {
      //   name: 'language',
      //   type: 'relationship',
      //   relationTo: 'languages',
      //   // allow selection of one or more jurisdiction
      //   hasMany: false,
      // },
      // this will be a id from 'jurisdiction_content_cms' collection
      // eg -> // only one
      // "language" : [ 
      //   "6517bd6510cba1fe59df905f"
      // ],
      {
        name: 'keyValues',
        type: 'relationship',
        relationTo: 'juri_key_value',
        // allow selection of one or more jurisdiction
        hasMany: true,
      },
      // this will be a id from 'juri_key_value' collection
      // eg -> // only one
      // "keyValues" : [ 
      //   "6517bd6510cba1fe59df905f"
      // ],
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
  
  module.exports = JuriLanguages;
  