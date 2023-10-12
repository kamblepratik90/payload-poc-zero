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

  // await seedCMS();
  
  await upsertOp();

//   await payload.create({
//     collection: 'cms',
//     data: {
//       pageName: "home_page",
//       key: "key_key",
//       value: {
//         default: "abc",
//         systemValue: "xyz",
//         xyz: "aaaa"
//       }
//     },
//   });

//   var arr = Array.from(Array(10).keys())
//   payload.logger.info(`seeding cms start...`);
//   console.time('----->>>>seeding------->');
//   for (let index = 0; index < arr.length; index++) {
//   // arr.forEach(async (index) => {

//     // // Perform any Local API operations here
//     const oldContentCms = await payload.find({
//       collection: 'content_cms',
//       where: {
//         pageName: {
//           equals: 'LandingPage',
//         },
//         key: {
//           equals: `text_${index}`,
//         }
//       }
//     });
//     if (oldContentCms.docs.length == 0) {
//       const { id: cmsDocId } = await payload.create({
//         collection: 'content_cms',
//         data: {
//           pageName: 'LandingPage',
//           key: `text_${index}`,
//           systemValue: `hello text_${index}`,
//         },
//       });

//       const cmsDataDE = {
//         pageName: 'LandingPage',
//         key: `text_${index}`,
//         systemValue: `hello DE text_${index}`
//       };

//       // if (index != 5) {
//       //   await payload.update({
//       //     collection: 'content_cms',
//       //     id: cmsDocId,
//       //     locale: 'de',
//       //     data: cmsDataDE
//       //   });
//       // }

//       if (index != 1) {
//         await payload.update({
//           collection: 'content_cms',
//           id: cmsDocId,
//           locale: 'de',
//           data: cmsDataDE
//         });
//       }

//     } else {
//       let element = oldContentCms.docs[0]
//       let newData = element;
//       newData.systemValue = `hello new text_${index}`,

//       await payload.update({
//         collection: 'content_cms',
//         id: element.id,
//         data: newData
//       });
//       payload.logger.info(`update............: ${index}`);
//     }
//     if (index % 1000 == 0) {
//       // console.log("index: ", index);
//       payload.logger.info(`index: ${index}`);
//     }
//   // });

//   }
//   console.log("size: ", arr.length);
  
//   console.timeEnd('----->>>>seeding------->');

//   // Perform any Local API operations here
//   const data = await payload.find({
//     collection: 'cms',
//     // where: {} // optional
//   });
//   console.log("res size: ", data.docs.length);
//   console.time('----->>>>update------->');
//   data.docs.forEach(async (element) => {  

//     let newData = element;
//     newData.value["extraKey"] = "extraValue"

//     await payload.update({
//       collection: 'cms',
//       id: element.id,
//       data: newData
//     });
//   })
//   console.timeEnd('----->>>>update------->'); 

//   //////////////////////////////////////////////////////////

//   // add juri specific data
//   //  -> add/update 'jurisdiction_content_cms' data and update 'content_cms' data

//   console.time('----->>>>insert------->');

//   // Perform any Local API operations here
//   const jurisdictionContentCms = await payload.find({
//     collection: 'jurisdiction_content_cms',
//     where: {
//       orgId: {
//         equals: 'ORG#00101',
//       },
//       pageName: {
//         equals: 'LandingPage',
//       },
//       key: {
//         equals: 'text_1',
//       },
//       language: {
//         equals: 'en',
//       }
//     }
//   });
//   console.log("jurisdictionContentCms len: ", jurisdictionContentCms.docs.length);

//   if (jurisdictionContentCms.docs.length > 0) {
//     // entry exists - update
//     console.log("jurisdictionContentCms - entry exists - update");
//     let element = jurisdictionContentCms.docs[0]
    
//     let newData = element;
//     newData.value = 'updated hello text_1';

//     await payload.update({
//       collection: 'jurisdiction_content_cms',
//       id: element.id,
//       data: newData
//     });
//     // now as this was already existed, no need to update 'content_cms'
//     console.log("jurisdictionContentCms - now as this was already existed, no need to update 'content_cms'");
//   } else {
//     // not exist - create
//     console.log("jurisdictionContentCms - not exist - create");
//     const newJurisdictionContentCms = await payload.create({
//       collection: 'jurisdiction_content_cms',
//       data: {
//         orgId: 'ORG#00101',
//         pageName: 'LandingPage',
//         key: 'text_1',
//         value: 'new newly added hello text_1',
//         language: 'en'
//       },
//     });
//     console.log("jurisdictionContentCms - new - create - id", newJurisdictionContentCms.id);
//     // find and update 'content_cms'. --> id will be availabe from ui, but for now we are doing query
//     // Perform any Local API operations here
//     const ContentCms = await payload.find({
//       collection: 'content_cms',
//       where: {
//         pageName: {
//           equals: 'LandingPage',
//         },
//         key: {
//           equals: 'text_1',
//         }
//       }
//     });
//     console.log("find ContentCms len: ", ContentCms.docs.length);
//     if (ContentCms.docs.length > 0) {
//       // entry exists - update
//       console.log("jurisdictionContentCms - ContentCms - entry exists - update");
//       let element = ContentCms.docs[0]
//       console.log("jurisdictionContentCms - ContentCms - entry exists - element - ", JSON.stringify(element));
//       let newJurisdictionValue = element.jurisdictionValue || undefined;
//       if (newJurisdictionValue) {
//         newJurisdictionValue.push(newJurisdictionContentCms.id);
//       } else {
//         newJurisdictionValue = [newJurisdictionContentCms.id]
//       }
//       console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

//       let newData = element;
//       newData.jurisdictionValue = newJurisdictionValue;
//       console.log("jurisdictionContentCms - ContentCms - entry exists - newData - ", newData);

//       const update = await payload.update({
//         collection: 'content_cms',
//         id: element.id,
//         data: newData
//       });
//       console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - updated ", JSON.stringify(update));
//     } else {
//       // something not good - wrong attempt.
//       console.log("something not good - wrong attempt");
//     }
//   }
//   console.timeEnd('----->>>>insert------->');

//   // -----------------------------------------------

//   console.time('----->>>>insert------->');

//   // Perform any Local API operations here
//   const jurisdictionContentCms = await payload.find({
//     collection: 'jurisdiction_content_cms',
//     where: {
//       orgId: {
//         equals: 'ORG#00104',
//       },
//       pageName: {
//         equals: 'LandingPage',
//       },
//       key: {
//         equals: 'text_5',
//       },
//       language: {
//         equals: 'en',
//       }
//     }
//   });
//   console.log("jurisdictionContentCms len: ", jurisdictionContentCms.docs.length);

//   if (jurisdictionContentCms.docs.length > 0) {
//     // entry exists - update
//     console.log("jurisdictionContentCms - entry exists - update");
//     let element = jurisdictionContentCms.docs[0]
    
//     let newData = element;
//     newData.value = 'updated hello text_5';

//     await payload.update({
//       collection: 'jurisdiction_content_cms',
//       id: element.id,
//       data: newData
//     });
//     // now as this was already existed, no need to update 'content_cms'
//     console.log("jurisdictionContentCms - now as this was already existed, no need to update 'content_cms'");
//   } else {
//     // not exist - create
//     console.log("jurisdictionContentCms - not exist - create");
//     const newJurisdictionContentCms = await payload.create({
//       collection: 'jurisdiction_content_cms',
//       data: {
//         orgId: 'ORG#00104',
//         pageName: 'LandingPage',
//         key: 'text_5',
//         value: 'x',
//         language: 'custom_es'
//         // locale: 'es',
//       },
//     });

//     // const cmsJSDataDE = {
//     //   orgId: 'ORG#00104',
//     //   pageName: 'LandingPage',
//     //   key: 'text_5',
//     //   value: 'new newly added ESSSSSS text_5',
//     // };

//     // await payload.update({
//     //   collection: 'jurisdiction_content_cms',
//     //   id: newJurisdictionContentCms.id,
//     //   locale: 'es',
//     //   data: cmsJSDataDE
//     // });

//     console.log("jurisdictionContentCms - new - create - id", newJurisdictionContentCms.id);
//     // find and update 'content_cms'. --> id will be availabe from ui, but for now we are doing query
//     // Perform any Local API operations here
//     const ContentCms = await payload.find({
//       collection: 'content_cms',
//       where: {
//         pageName: {
//           equals: 'LandingPage',
//         },
//         key: {
//           equals: 'text_5',
//         }
//       }
//     });
//     console.log("find ContentCms len: ", ContentCms.docs.length);
//     if (ContentCms.docs.length > 0) {
//       // entry exists - update
//       console.log("jurisdictionContentCms - ContentCms - entry exists - update");
//       let element = ContentCms.docs[0]
//       console.log("jurisdictionContentCms - ContentCms - entry exists - element - ", JSON.stringify(element));
//       let newJurisdictionValue = element.jurisdictionValue || undefined;
//       if (newJurisdictionValue) {
//         newJurisdictionValue.push(newJurisdictionContentCms.id);
//       } else {
//         newJurisdictionValue = [newJurisdictionContentCms.id]
//       }
//       console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

//       let newData = element;
//       newData.jurisdictionValue = newJurisdictionValue;
//       console.log("jurisdictionContentCms - ContentCms - entry exists - newData - ", newData);

//       const update = await payload.update({
//         collection: 'content_cms',
//         id: element.id,
//         data: newData
//       });
//       console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - updated ", JSON.stringify(update));
//     } else {
//       // something not good - wrong attempt.
//       console.log("something not good - wrong attempt");
//     }
//   }
//   console.timeEnd('----->>>>insert------->');

//   //////////////////////////////////////////////////////////

// // get cms data

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

async function seedCMS() {

  try {

    console.log("seedCMS.. now......");
    console.time('----->>>>seedCMS------->');

    // seed org

    let orgData = {
      name: "ca",
      orgId: "ORG_100"
    }

    const { id: orgDocId1 } = await payload.create({
      collection: 'organizations',
      data: orgData,
    })

    orgData = {
      name: "wa",
      orgId: "ORG_101"
    }

    const { id: orgDocId2 } = await payload.create({
      collection: 'organizations',
      data: orgData,
    })

    // seed languages

    const langData1 = {
      name: "english",
      ISOCode: "en"
    }

    const { id: langDocId1 } = await payload.create({
      collection: 'languages',
      data: langData1,
    })

    const data = {
      "isDefault": "true", // text, not a boolean
      "ISOCode": langData1.ISOCode,
      "languageName": langData1.name,
    }

    const { id: ltDocId } = await payload.create({
      collection: 'language_tree',
      data: data,
    });

    let ContentCms = await payload.find({
      collection: 'language_tree',
      // where: {
      //   'keyValues.pageName': {
      //     equals: pageToFilter,
      //   }
      // },
      // depth: 2,
      // locale: languageToFilter
    });
    console.timeEnd('----->>>>queryCMS-------->');
    console.log("find ContentCms.docs.length : ", ContentCms.docs.length);

    for (let i = 0; i < ContentCms.docs.length; i++) {
      const parentElement = ContentCms.docs[i];
      for (let index = 0; index < 3; index++) {
        // const element

        const baseKeyData = {
          pageName: "LandingPage",
          key: `key_${index}`,
          value: `value_text_${index}`,
          description: `this is the description for key_${index} and value_text_${index}`,
          languages: [langDocId1]
        }

        const baseKeyValueDoc = await payload.create({
          collection: 'base_key_values',
          data: baseKeyData,
        })

        // update 'language_tree' for 'keyValues'

        let keyValues = parentElement.keyValues || undefined;
        if (keyValues) {
          keyValues.push(baseKeyValueDoc.id);
        } else {
          keyValues = [baseKeyValueDoc.id]
        }
        // console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

        let newData = parentElement;
        newData.keyValues = keyValues;
        // console.log("jurisdictionContentCms - ContentCms - entry exists - newData - ", newData);

        const update = await payload.update({
          collection: 'language_tree',
          id: parentElement.id,
          data: newData
        });
      }
    }
    console.timeEnd('----->>>>seedCMS------->');

    // seed juri specific data


    console.time('----->>>>seedCMS-Juri------->');
    let languageToFilter = "en"
    // // Perform any Local API operations here
    const langTreeCms = await payload.find({
      collection: 'language_tree',
      where: {
        ISOCode: {
          equals: languageToFilter,
        },
        // languages: { in: [ languageToFilter ] },
      },
      // depth: 0,
      // locale: languageToFilter
    });
    console.log("find langTreeCms.docs.length : ", langTreeCms.docs.length);
    for (let i = 0; i < langTreeCms.docs.length; i++) {
      const parentElement = langTreeCms.docs[i];
      console.log("parentElement: ", JSON.stringify(parentElement));
      for (let index = 0; index < parentElement.keyValues.length; index++) {
        // // langTreeCms.docs.forEach(async element => {
        const element = parentElement.keyValues[index];
        console.log("\n -- base --", JSON.stringify(element));
        const juriKeyData = {
          pageName: element.pageName,
          key: element.key,
          value: `juri ${element.value}`,
          description: `this is the description for juri key_${element.key}`,
          languages: [ langDocId1 ]
        }
        console.log("1");
        
        // juri_key_value
        const juriKvDoc = await payload.create({
          collection: 'juri_key_value',
          data: juriKeyData,
        });
        // juri_languages
        const juridata = {
          OrgId: orgDocId1,
          // language: langDocId1,
          keyValues: [juriKvDoc.id]
        }
        console.log("2: ", JSON.stringify(juridata));

        const { id: juriLangDocId } = await payload.create({
          collection: 'juri_languages',
          data: juridata,
        });
        console.log(" 3: juriLangDocId - ", juriLangDocId);

        // update 'language_tree' for juridisctionLanguages data

        // update 'language_tree' for 'keyValues'

        let juriLangData = parentElement.juridisctionLanguages || undefined;
        if (juriLangData) {
          juriLangData.push(juriLangDocId);
        } else {
          juriLangData = [juriLangDocId]
        }
        // console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

        console.log("4:");
        let newData = parentElement;
        newData.juridisctionLanguages = juriLangData

        const update = await payload.update({
          collection: 'language_tree',
          id: parentElement.id,
          data: newData
        });
        console.log("5: ");
        // });
      }
    }
    console.timeEnd('----->>>>seedCMS-Juri------->');

    // console.time('----->>>>queryCMS-Juri------->');
    let pageToFilter = "LandingPage"
    // let orgToFilter = "ORG_100"
    // // // Perform any Local API operations here
    // const juriCms = await payload.find({
    //   collection: 'juri_languages',
    //   where: {
    //     'keyValues.pageName': {
    //       equals: pageToFilter,
    //     }
    //   },
    //   // depth: 2,
    //   // locale: languageToFilter
    // });
    // console.timeEnd('----->>>>queryCMS-Juri------->');
    // console.log("find juriCms.docs.length : ", juriCms.docs.length  );

    // juriCms.docs.forEach(element => {
    //   let printCms = {
    //     orgId: element.OrgId.orgId,
    //     language: element.language.ISOCode,
    //     pageName: element.keyValues.pageName,
    //     key: element.keyValues.key,
    //     value: element.keyValues.value,
    //   }
    //   console.log("\n - juri - ", JSON.stringify(printCms));
    // });





    console.time('----->>>>queryCMS-------->');
    // // Perform any Local API operations here
    const ContentCms = await payload.find({
      collection: 'language_tree',
      // where: {
      //   'keyValues.pageName': {
      //     equals: pageToFilter,
      //   }
      // },
      depth: 5,
      // locale: languageToFilter
    });
    console.timeEnd('----->>>>queryCMS-------->');
    console.log("find ContentCms.docs.length : ", ContentCms.docs.length);

    for (let index = 0; index < ContentCms.docs.length; index++) {
      const element = ContentCms.docs[index];
      console.log("\n language_tree: ", JSON.stringify(element));
    }



    // 2 types of clone - base to new base and base to juri ?
    // clone type one - 1. base to new base
    // clone new language from - base 'en' as 'fr'
    // 1. add new lang
    // 2. filter/get all key values for 'en'
    // 3. add new lnguage for base key-value
    let fromBaseLang = 'en'
    let newBaseLang = 'fr'
    console.time('----->>>>cloneCMS-------->');

    const langData2 = {
      name: "french",
      ISOCode: "fr"
    }

    const { id: langDocId2 } = await payload.create({
      collection: 'languages',
      data: langData2,
    })

    for (let index = 0; index < ContentCms.docs.length; index++) {
      const parentElement = ContentCms.docs[index];
      for (let index = 0; index < parentElement.keyValues.length; index++) {
        const element = parentElement.keyValues[index];
        console.log("\n -- base clone --", JSON.stringify(element));
        const filteredLangOnlyElement = element.languages.filter(entry => entry.ISOCode === 'en');
        console.log("filteredLangOnlyElement: ", filteredLangOnlyElement.length);
        if (filteredLangOnlyElement.length > 0) {
          // add new lang - langDocId2 

          // update 'base_key_values' for 'languages'

          console.log("update clone - newData - old ", element.languages);
          let languages = element.languages || undefined;
          if (languages) {
            languages.push(langDocId2);
          } else {
            languages = [langDocId2]
          }
          // console.log("jurisdictionContentCms - ContentCms - entry exists - newJurisdictionValue - ", newJurisdictionValue);

          let newData = element;
          newData.languages = languages;
          console.log("update clone - newData - languages ", newData.languages);
          console.log("update clone - newData - ", newData);

          let update = await payload.update({
            collection: 'base_key_values',
            id: element.id,
            data: newData
          });
          // updated new lang
          console.log("updated new lang element.id-- ", element.id);
          console.log("updated new lang -- ", update);
        }

      }
    }
    console.timeEnd('----->>>>cloneCMS-------->');

    console.time('----->>>>queryCMS-------->');
    // // Perform any Local API operations here
    ContentCms = await payload.find({
      collection: 'language_tree',
      // where: {
      //   'keyValues.pageName': {
      //     equals: pageToFilter,
      //   }
      // },
      depth: 10,
      // locale: languageToFilter
    });
    console.timeEnd('----->>>>queryCMS-------->');
    console.log("find ContentCms.docs.length : ", ContentCms.docs.length);

    for (let index = 0; index < ContentCms.docs.length; index++) {
      const element = ContentCms.docs[index];
      console.log("\n language_tree: ", JSON.stringify(element));
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

async function upsertOp() {
  
  let sampleData = {
    name: "ca",
    sampleArray: [
      {
        title: "abc"
      }
    ]
  }

  // const { id: sampleDocId1 } = await payload.create({
  //   collection: 'sample',
  //   data: sampleData,
  // })

  console.time(`----->>>>insert_${total_items}------->`);
  // let total = 50000;
  // for (let index = 0; index < total; index++) {
  //   sampleData = {
  //     name: `text_${index}`,
  //     title: `title_${index}`,
  //     sampleArray: [
  //       {
  //         title: `abc${index}`
  //       }
  //     ]
  //   }
  //   await payload.create({
  //     collection: 'sample',
  //     data: sampleData,
  //   })
  //   if (index % 1000 == 0){
  //     payload.logger.info(`current index  ${index},  out of:  ${total} `);
      
  //   }
  // }

  await processArrayInBatches(0)
  
  console.timeEnd(`----->>>>insert_${total_items}------->`);

  console.time(`----->>>>update_${total_items}------->`);
  const result = await payload.update({
    collection: 'sample', // required
    where: {
      // required
      name: { contains: 'text_' },
    },
    data: {
      // required
      name: 'testttt_',
      sampleArray: [
        {
          title: "abcx"
        }
      ]
    }
  })
  console.timeEnd(`----->>>>update_${total_items}------->`);
  console.log(' modified', result.docs.length, 'document(s)');


  console.time('----->>>>querySample-------->');
  // // Perform any Local API operations here
  const ContentCms = await payload.find({
    collection: 'sample',
    where: {
      name: { contains: 'testttt' },
    },
    depth: 10,
    pagination: false
  });
  console.timeEnd('----->>>>querySample-------->');
  console.log("len: ", ContentCms.docs.length);
  

}
const total_items = 100000
const data = Array.from({ length: total_items }, (_, index) => index); // Generate a sample array of 50000 elements
const batchSize = 5000; // Number of elements to process in each batch

const processArrayInBatches = async (startIndex) => {
  const endIndex = Math.min(startIndex + batchSize, data.length);

  // Process the current batch of elements
  const batchPromises = [];
  for (let i = startIndex; i < endIndex; i++) {
    // console.log(data[i]);
    if (data[i] % batchSize == 0){
      payload.logger.info(`current index  ${data[i]},  out of:  ${data.length} `); 
    }
    batchPromises.push(asyncOperation(data[i]));
  }

  // // Wait for the batch to complete
  // await Promise.all(batchPromises);

  // // If there are more elements, process the next batch after a delay
  // if (endIndex < data.length) {
  //   await new Promise((resolve) => setTimeout(resolve, 100)); // Adjust the delay as needed
  //   await processArrayInBatches(endIndex);
  // } else {
  //   console.log('All asynchronous operations completed.');
  // }

  // Wait for all promises to settle
  return Promise.all(batchPromises).then(() => {
    // If there are more elements, process the next batch
    if (endIndex < data.length) {
      return processArrayInBatches(endIndex);
    } else {
      console.log('All asynchronous operations completed.');
      return Promise.resolve();
    }
  });
};

const asyncOperation = async (index) => {
  // Simulate an asynchronous operation, replace this with your actual async logic
  return new Promise((resolve) => {
    let sampleData = {
      name: `text_${index}`,
      title: `title_${index}`,
      sampleArray: [
        {
          title: `abc${index}`
        }
      ]
    }
    payload.create({
      collection: 'sample',
      data: sampleData,
    }).then(() =>{
      resolve(index);
    })
  });
};