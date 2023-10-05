import payload from 'payload';
import path from 'path';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { generateContactFormSubmission, generateMailingListSubmission } from '../data/forms/submissionGenerator';
import { getHomeData } from '../data/pages/homeData';
import { getHomeDataDE } from '../data/pages/homeDataDE';
import { getHomeDataES } from '../data/pages/homeDataES';
import { getVideoSeriesData } from '../data/pages/videoSeriesData';
import { getCaseStudiesData } from '../data/pages/caseStudiesData';
import { contactFormData } from '../data/forms/contactFormData';
import { mailingListFormData } from '../data/forms/mailingListFormData';
import { generateTsInterfacesData } from '../data/posts/generateTsInterfacesData';
import { whiteLabelAdminUIData } from '../data/posts/whiteLabelAdminUIData';
import { buildWebsiteData } from '../data/posts/buildWebsiteData';
import { introducingPayloadData } from '../data/posts/introducingPayloadData';
import { futurePostData } from '../data/posts/futurePostData'
import { mainMenuData } from '../data/mainMenu/mainMenuData';
import type { Form, MainMenu, Page, Post } from 'payload/generated-types'

export async function seed() {
  try {
    payload.logger.info(`Seeding database...`);

    const mediaDir = path.resolve(__dirname, '../../media');
    if (fs.existsSync(mediaDir)) {
      fs.rmSync(path.resolve(__dirname, '../../media'), { recursive: true });
    }

    await seedData();
    payload.logger.info(`Seed Complete.`);
  } catch (error) {
    console.error(error);
    payload.logger.error('Error seeding database.');
  }
}

export async function reset() {
  try {
    payload.logger.info(`Resetting database...`);

    const mediaDir = path.resolve(__dirname, '../../media');
    if (fs.existsSync(mediaDir)) {
      fs.rmSync(path.resolve(__dirname, '../../media'), { recursive: true });
    }

    await dropDB();
    await seedData();
    payload.logger.info(`Reset Complete.`);
  } catch (error) {
    console.error(error);
    payload.logger.error('Error resetting database.');
  }
}

async function dropDB() {
  const client = await MongoClient.connect(process.env.MONGO_URL);
  const db = client.db(new URL(process.env.MONGO_URL).pathname.substring(1));
  await db.dropDatabase();
}

async function seedData() {
  const { id: demoUserId } = await payload.create({
    collection: 'users',
    data: {
      name: 'Demo User',
      email: 'demo@payloadcms.com',
      password: 'demo',
    },
  });

  const { id: imageId } = await payload.create({
    collection: 'media',
    data: {
      alt: 'Payload',
    },
    filePath: path.resolve(__dirname, './payload.jpg'),
  });

  // Page - Home
  const homeData = getHomeData(imageId, demoUserId);
  const homeDataDE = getHomeDataDE(imageId, demoUserId);
  const homeDataES = getHomeDataES(imageId, demoUserId);

  const { id: homeDocId } = await payload.create({
    collection: 'pages',
    // @ts-expect-error
    data: homeData,
  });



  // Page - Video Series
  await payload.create({
    collection: 'pages',
    // @ts-expect-error
    data: getVideoSeriesData(imageId, demoUserId, homeDocId),
  });

  // Page - Case Studies
  const { id: caseStudiesDocId } = await payload.create({
    collection: 'pages',
    // @ts-expect-error
    data: getCaseStudiesData(imageId, demoUserId, homeDocId),
  });

  // Main Menu
  await payload.updateGlobal({
    slug: 'mainMenu',
    data: mainMenuData(homeDocId, caseStudiesDocId) as unknown as MainMenu,
  });

  await payload.update({
    collection: 'pages',
    id: homeDocId,
    locale: 'de',
    data: homeDataDE
  });

  await payload.update({
    collection: 'pages',
    id: homeDocId,
    locale: 'es',
    data: homeDataES
  });

  // Forms - Contact
  const contactForm = await payload.create({
    collection: 'forms',
    data: contactFormData() as unknown as Form,
  });

  // Forms - Mailing List
  const mailingListForm = await payload.create({
    collection: 'forms',
    data: mailingListFormData() as unknown as Form,
  });

  // Generate form submissions
  const contactFormSubmissions = [...Array(5)].map(_ => {
    return payload.create({
      collection: 'form-submissions',
      data: generateContactFormSubmission(contactForm.id),
    });
  });

  await Promise.all(contactFormSubmissions);

  const mailingListSubmissions = [...Array(5)].map(_ => {
    return payload.create({
      collection: 'form-submissions',
      data: generateMailingListSubmission(mailingListForm.id),
    });
  });

  await Promise.all(mailingListSubmissions);

  // Create Categories
  const [newsCategory, featureCategory, tutorialCategory] = await Promise.all([
    payload.create({
      collection: 'categories',
      data: {
        name: 'news',
      },
    }),
    payload.create({
      collection: 'categories',
      data: {
        name: 'feature',
      },
    }),
    payload.create({
      collection: 'categories',
      data: {
        name: 'tutorial',
      },
    }),
  ]);

  const ignorePromise = await payload.create({
    collection: 'categories',
    data: {
      name: 'announcements',
      archived: true,
    },
  });

  await payload.create({
    collection: 'posts',
    data: generateTsInterfacesData(demoUserId, featureCategory.id, imageId) as unknown as Post,
  });

  await payload.create({
    collection: 'posts',
    data: whiteLabelAdminUIData(demoUserId, tutorialCategory.id, imageId) as unknown as Post,
  });

  await payload.create({
    collection: 'posts',
    data: buildWebsiteData(demoUserId, tutorialCategory.id, imageId) as unknown as Post,
  });

  await payload.create({
    collection: 'posts',
    data: introducingPayloadData(demoUserId, newsCategory.id, imageId) as unknown as Post,
  });

  await payload.create({
    collection: 'posts',
    data: futurePostData(demoUserId, newsCategory.id, imageId) as unknown as Post,
  });

  await payload.create({
    collection: 'cms',
    data: {
      pageName: "home_page",
      key: "key_key",
      value: {
        default: "abc",
        systemValue: "xyz",
        xyz: "aaaa"
      }
    },
  });

  var arr = Array.from(Array(10).keys())
  payload.logger.info(`seeding cms start...`);
  console.time('----->>>>seeding------->');
  for (let index = 0; index < arr.length; index++) {
  // arr.forEach(async (index) => {

    // // Perform any Local API operations here
    const oldContentCms = await payload.find({
      collection: 'content_cms',
      where: {
        pageName: {
          equals: 'LandingPage',
        },
        key: {
          equals: `text_${index}`,
        }
      }
    });
    if (oldContentCms.docs.length == 0) {
      const { id: cmsDocId } = await payload.create({
        collection: 'content_cms',
        data: {
          pageName: 'LandingPage',
          key: `text_${index}`,
          systemValue: `hello text_${index}`,
        },
      });

      const cmsDataDE = {
        pageName: 'LandingPage',
        key: `text_${index}`,
        systemValue: `hello DE text_${index}`
      };

      // if (index != 5) {
      //   await payload.update({
      //     collection: 'content_cms',
      //     id: cmsDocId,
      //     locale: 'de',
      //     data: cmsDataDE
      //   });
      // }

      if (index != 1) {
        await payload.update({
          collection: 'content_cms',
          id: cmsDocId,
          locale: 'de',
          data: cmsDataDE
        });
      }

    } else {
      let element = oldContentCms.docs[0]
      let newData = element;
      newData.systemValue = `hello new text_${index}`,

      await payload.update({
        collection: 'content_cms',
        id: element.id,
        data: newData
      });
      payload.logger.info(`update............: ${index}`);
    }
    if (index % 1000 == 0) {
      // console.log("index: ", index);
      payload.logger.info(`index: ${index}`);
    }
  // });

  }
  console.log("size: ", arr.length);
  
  console.timeEnd('----->>>>seeding------->');

  // // Perform any Local API operations here
  // const data = await payload.find({
  //   collection: 'cms',
  //   // where: {} // optional
  // });
  // console.log("res size: ", data.docs.length);
  // console.time('----->>>>update------->');
  // data.docs.forEach(async (element) => {  

  //   let newData = element;
  //   newData.value["extraKey"] = "extraValue"

  //   await payload.update({
  //     collection: 'cms',
  //     id: element.id,
  //     data: newData
  //   });
  // })
  // console.timeEnd('----->>>>update------->'); 

  // //////////////////////////////////////////////////////////

  // add juri specific data
  //  -> add/update 'jurisdiction_content_cms' data and update 'content_cms' data

  // console.time('----->>>>insert------->');

  // // Perform any Local API operations here
  // const jurisdictionContentCms = await payload.find({
  //   collection: 'jurisdiction_content_cms',
  //   where: {
  //     orgId: {
  //       equals: 'ORG#00101',
  //     },
  //     pageName: {
  //       equals: 'LandingPage',
  //     },
  //     key: {
  //       equals: 'text_1',
  //     },
  //     language: {
  //       equals: 'en',
  //     }
  //   }
  // });
  // console.log("jurisdictionContentCms len: ", jurisdictionContentCms.docs.length);

  // if (jurisdictionContentCms.docs.length > 0) {
  //   // entry exists - update
  //   console.log("jurisdictionContentCms - entry exists - update");
  //   let element = jurisdictionContentCms.docs[0]
    
  //   let newData = element;
  //   newData.value = 'updated hello text_1';

  //   await payload.update({
  //     collection: 'jurisdiction_content_cms',
  //     id: element.id,
  //     data: newData
  //   });
  //   // now as this was already existed, no need to update 'content_cms'
  //   console.log("jurisdictionContentCms - now as this was already existed, no need to update 'content_cms'");
  // } else {
  //   // not exist - create
  //   console.log("jurisdictionContentCms - not exist - create");
  //   const newJurisdictionContentCms = await payload.create({
  //     collection: 'jurisdiction_content_cms',
  //     data: {
  //       orgId: 'ORG#00101',
  //       pageName: 'LandingPage',
  //       key: 'text_1',
  //       value: 'new newly added hello text_1',
  //       language: 'en'
  //     },
  //   });
  //   console.log("jurisdictionContentCms - new - create - id", newJurisdictionContentCms.id);
  //   // find and update 'content_cms'. --> id will be availabe from ui, but for now we are doing query
  //   // Perform any Local API operations here
  //   const ContentCms = await payload.find({
  //     collection: 'content_cms',
  //     where: {
  //       pageName: {
  //         equals: 'LandingPage',
  //       },
  //       key: {
  //         equals: 'text_1',
  //       }
  //     }
  //   });
  //   console.log("find ContentCms len: ", ContentCms.docs.length);
  //   if (ContentCms.docs.length > 0) {
  //     // entry exists - update
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - update");
  //     let element = ContentCms.docs[0]
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - element - ", JSON.stringify(element));
  //     let newJurisdictionValue = element.jurisdictionValue || undefined;
  //     if (newJurisdictionValue) {
  //       newJurisdictionValue.push(newJurisdictionContentCms.id);
  //     } else {
  //       newJurisdictionValue = [newJurisdictionContentCms.id]
  //     }
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

  //     let newData = element;
  //     newData.jurisdictionValue = newJurisdictionValue;
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - newData - ", newData);

  //     const update = await payload.update({
  //       collection: 'content_cms',
  //       id: element.id,
  //       data: newData
  //     });
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - updated ", JSON.stringify(update));
  //   } else {
  //     // something not good - wrong attempt.
  //     console.log("something not good - wrong attempt");
  //   }
  // }
  // console.timeEnd('----->>>>insert------->');

  // // -----------------------------------------------

  // console.time('----->>>>insert------->');

  // // Perform any Local API operations here
  // const jurisdictionContentCms = await payload.find({
  //   collection: 'jurisdiction_content_cms',
  //   where: {
  //     orgId: {
  //       equals: 'ORG#00104',
  //     },
  //     pageName: {
  //       equals: 'LandingPage',
  //     },
  //     key: {
  //       equals: 'text_5',
  //     },
  //     language: {
  //       equals: 'en',
  //     }
  //   }
  // });
  // console.log("jurisdictionContentCms len: ", jurisdictionContentCms.docs.length);

  // if (jurisdictionContentCms.docs.length > 0) {
  //   // entry exists - update
  //   console.log("jurisdictionContentCms - entry exists - update");
  //   let element = jurisdictionContentCms.docs[0]
    
  //   let newData = element;
  //   newData.value = 'updated hello text_5';

  //   await payload.update({
  //     collection: 'jurisdiction_content_cms',
  //     id: element.id,
  //     data: newData
  //   });
  //   // now as this was already existed, no need to update 'content_cms'
  //   console.log("jurisdictionContentCms - now as this was already existed, no need to update 'content_cms'");
  // } else {
  //   // not exist - create
  //   console.log("jurisdictionContentCms - not exist - create");
  //   const newJurisdictionContentCms = await payload.create({
  //     collection: 'jurisdiction_content_cms',
  //     data: {
  //       orgId: 'ORG#00104',
  //       pageName: 'LandingPage',
  //       key: 'text_5',
  //       value: 'x',
  //       language: 'custom_es'
  //       // locale: 'es',
  //     },
  //   });

  //   // const cmsJSDataDE = {
  //   //   orgId: 'ORG#00104',
  //   //   pageName: 'LandingPage',
  //   //   key: 'text_5',
  //   //   value: 'new newly added ESSSSSS text_5',
  //   // };

  //   // await payload.update({
  //   //   collection: 'jurisdiction_content_cms',
  //   //   id: newJurisdictionContentCms.id,
  //   //   locale: 'es',
  //   //   data: cmsJSDataDE
  //   // });

  //   console.log("jurisdictionContentCms - new - create - id", newJurisdictionContentCms.id);
  //   // find and update 'content_cms'. --> id will be availabe from ui, but for now we are doing query
  //   // Perform any Local API operations here
  //   const ContentCms = await payload.find({
  //     collection: 'content_cms',
  //     where: {
  //       pageName: {
  //         equals: 'LandingPage',
  //       },
  //       key: {
  //         equals: 'text_5',
  //       }
  //     }
  //   });
  //   console.log("find ContentCms len: ", ContentCms.docs.length);
  //   if (ContentCms.docs.length > 0) {
  //     // entry exists - update
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - update");
  //     let element = ContentCms.docs[0]
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - element - ", JSON.stringify(element));
  //     let newJurisdictionValue = element.jurisdictionValue || undefined;
  //     if (newJurisdictionValue) {
  //       newJurisdictionValue.push(newJurisdictionContentCms.id);
  //     } else {
  //       newJurisdictionValue = [newJurisdictionContentCms.id]
  //     }
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

  //     let newData = element;
  //     newData.jurisdictionValue = newJurisdictionValue;
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - newData - ", newData);

  //     const update = await payload.update({
  //       collection: 'content_cms',
  //       id: element.id,
  //       data: newData
  //     });
  //     console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - updated ", JSON.stringify(update));
  //   } else {
  //     // something not good - wrong attempt.
  //     console.log("something not good - wrong attempt");
  //   }
  // }
  // console.timeEnd('----->>>>insert------->');

  // //////////////////////////////////////////////////////////

// get cms data

// console.log("--- find ----");

// // ['en', 'es', 'de']
// let languageToFilter = 'custom_es'
// let orgIdToFilter = 'ORG#00104';

// // // Perform any Local API operations here
// const ContentCms = await payload.find({
//   collection: 'content_cms',
//   where: {
//     pageName: {
//       equals: 'LandingPage',
//     }
//   },
//   // depth: 0,
//   locale: languageToFilter
// });
// console.log("find ContentCms.docs.length : ", ContentCms.docs.length  );

// for (let index = 0; index < ContentCms.docs.length; index++) {
//   const element = ContentCms.docs[index];
//   if (element.jurisdictionValue){
//     const filteredEntries = element.jurisdictionValue.filter(entry => entry.orgId === orgIdToFilter && entry.language === languageToFilter);
//     // const filteredEntries = element.jurisdictionValue.filter(entry => entry.orgId === orgIdToFilter);
//     console.log("filteredEntries: ", filteredEntries);
    
//     if (filteredEntries.length > 0) {
//       element.systemValue = filteredEntries[0].value
//     }
//   }
//   console.log("\n CMS: ", {index}, JSON.stringify(element), "\n");
// }
}


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}