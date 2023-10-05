import { CollectionConfig } from 'payload/types';
// import CategorySummary from '../components/CategorySummary'

const Cms: CollectionConfig = {
  slug: 'cms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['id', 'pageName', 'key', 'systemValue', 'baseEnglishValue', 'baseGermanValue',
    '0001_english_jurisdictionValue', '0001_german_jurisdictionValue', 'description', 'archived'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  // versioning with drafts enabled tells Payload to save documents to a separate collection in the database and allow publishing
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'pageName',
      type: 'text',
      localized: true,
    },
    {
      name: 'value',
      type: 'json'
    },
    {
      name: 'key',
      type: 'text',
    },
    {
      name: 'systemValue',
      type: 'text',
    },
    {
      name: 'baseEnglishValue',
      type: 'text',
    },
    {
      name: 'baseGermanValue',
      type: 'text',
    },
    {
      name: 'j0001_english_jurisdictionValue',
      type: 'text',
    },
    {
      name: 'j0001_german_jurisdictionValue',
      type: 'text',
    },
    {
      name: 'description',
      type: 'text'
    },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
    //   admin: {
    //     description: 'Archiving filters it from being an option in the posts collection',
    //   },
    },
    // {
    //   name: 'summary',
    //   // ui fields do not impact the database or api, and serve as placeholders for custom components in the admin panel
    //   type: 'ui',
    //   admin: {
    //     position: 'sidebar',
    //     components: {
    //       // this custom component will fetch the posts count for how many posts have this category
    //       Field: CategorySummary,
    //     }
    //   }
    // }
  ],
}

export default Cms;
