// import { CollectionConfig } from 'payload/types';
// import CategorySummary from '../components/CategorySummary'

const Sample = {
    slug: 'sample',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['id', 'pageName', 'key', 'systemValue', 'baseEnglishValue', 'baseGermanValue',
            '0001_english_jurisdictionValue', '0001_german_jurisdictionValue', 'description', 'archived'],
        group: 'Content',
    },
    access: {
        read: () => true,
    },
    // // versioning with drafts enabled tells Payload to save documents to a separate collection in the database and allow publishing
    // versions: {
    //     drafts: true,
    // },
    timestamps: false,
    fields: [
        {
            name: 'name',
            type: 'text',
            // localized: true,
            index: true
        },
        {
            name: 'title',
            type: 'text',
            // localized: true,
        },
        {
            name: 'sampleArray', // required
            type: 'array', // required
            fields: [
                // required
                {
                  name: 'title',
                  type: 'text',
                },
              ]
        }
    ],
}

module.exports = Sample;
