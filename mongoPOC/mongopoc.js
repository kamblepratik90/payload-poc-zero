const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const DATABASE_NAME = 'payload-poc-zero';
const COLLECTION_NAME = 'sample_mongo'

async function insertSingleDocument(client, collection) {

    console.time('----->>>>insertSingleDocument------->');
    // const document = { name: 'John Doe', email: 'john@example.com' };
    const document = { name: 'John Doe', status: 'Active'};
    const result = await collection.insertOne(document);
    console.log('Inserted a document with ID:', result.insertedId);
    console.timeEnd('----->>>>insertSingleDocument------->');
}

async function insertManyDocuments(client, collection) {
    console.time('----->>>>initData------->');
    let documents = [
        // { name: 'Alice', email: 'alice@example.com' },
        // { name: 'Bob', email: 'bob@example.com' },
        // // ... more documents
    ];
    for (let index = 0; index < TOTAL_ITEMS; index++) {
        // const element = { name: `my_name_${index}`};
        documents.push({"name":`my_name_${index}`, status: 'Active'});
    }
    console.log(documents.length);
    console.timeEnd('----->>>>initData------->');

    console.time('----->>>>insertManyDocuments------->');
    const result = await collection.insertMany(documents);
    console.timeEnd('----->>>>insertManyDocuments------->');
    console.log('Inserted', result.insertedCount, 'documents');
}

async function updateSingleDocument(client, collection) {

    console.time('----->>>>updateSingleDocument------->');
    const filter = { name: 'John Doe' };
    const updateDoc = { $set: { email: 'john.doe@example.com' } };

    const result = await collection.updateOne(filter, updateDoc);
    console.timeEnd('----->>>>updateSingleDocument------->');

    console.log('Matched', result.matchedCount, 'document(s) and modified', result.modifiedCount, 'document(s)');
}

async function updateManyDocuments(client, collection) {

    console.time('----->>>>updateManyDocuments------->');
    const filter = { status: 'Active' }; // Update documents that match this filter
    const updateDoc = { $set: { status: 'Inactive' } }; // Set a new value

    const result = await collection.updateMany(filter, updateDoc);
    console.timeEnd('----->>>>updateManyDocuments------->');
    console.log('Matched', result.matchedCount, 'document(s) and modified', result.modifiedCount, 'document(s)');
}

async function dropDB(client, collection) {

    console.time('----->>>>dropcollection------->');
    await collection.drop();
    console.timeEnd('----->>>>dropcollection------->');
}

const TOTAL_ITEMS = 100000;

async function seedData() {
    try {
        await mongoClient.connect();
        const collection = mongoClient.db(DATABASE_NAME).collection(COLLECTION_NAME);


        console.time('----->>>>seeding------->');
        console.log("\n");
        await dropDB(mongoClient, collection).catch(console.error);

        // const result = await collection.createIndex({ name: 1 });
        // console.log(`Index created: ${result}`);

        // const result2 = await collection.createIndex({ status: 1 });
        // console.log(`Index created: ${result2}`);

        console.log("\n");
        await insertSingleDocument(mongoClient, collection).catch(console.error);
        console.log("\n");
        await insertManyDocuments(mongoClient, collection).catch(console.error);
        console.log("\n");
        await updateSingleDocument(mongoClient, collection).catch(console.error);
        console.log("\n");
        await updateManyDocuments(mongoClient, collection).catch(console.error);
        console.timeEnd('----->>>>seeding------->');

    } finally {
        await mongoClient.close();
    }
}

seedData();