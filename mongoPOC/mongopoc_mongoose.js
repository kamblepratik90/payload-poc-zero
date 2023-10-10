const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/payload-poc-zero';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const mySchema = new Schema({
  name: 
  {
    type: String,
    index: true 
  },
  email: String,
  status: {
    type: String,
    index: true 
  }
});

const myModel = mongoose.model('sample_mongo_mongoose', mySchema);

async function insertSingleDocument() {

    console.time('----->>>>insertSingleDocument------->');
    const doc = new myModel({ name: 'Alice', email: 'john.doe@example.com', status: 'Active' });
    const result = await doc.save();
    console.log('Inserted a document with ID:', result._id);
    console.timeEnd('----->>>>insertSingleDocument------->');
}

async function insertManyDocuments() {
    console.time('----->>>>initData------->');
    let documents = [
        // { name: 'Alice', email: 'alice@example.com', status: 'Active' },
        // { name: 'Bob', email: 'bob@example.com', status: 'Active' },
        // // ... more documents
    ];
    for (let index = 0; index < TOTAL_ITEMS; index++) {
        // const element = { name: `my_name_${index}`};
        documents.push({"name":`my_name_${index}`, status: 'Active'});
    }
    console.log(documents.length);
    console.timeEnd('----->>>>initData------->');

    console.time('----->>>>insertManyDocuments------->');
    const result = await myModel.insertMany(documents);
    console.timeEnd('----->>>>insertManyDocuments------->');
    console.log('Inserted', result.length, 'documents');
}

async function updateSingleDocument() {

    console.time('----->>>>updateSingleDocument------->');
    // const filter = { name: 'John Doe' };
    // const updateDoc = { $set: { email: 'john.doe@example.com' } };

    // const result = await myModel.updateOne(filter, updateDoc);
    const result = await myModel.updateOne({ name: 'Alice' }, { email: 'updated-alice@example.com' });
    console.timeEnd('----->>>>updateSingleDocument------->');

    console.log('Matched', result.matchedCount, 'document(s) and modified', result.modifiedCount, 'document(s)');
}

async function updateManyDocuments() {

    console.time('----->>>>updateManyDocuments------->');
    const filter = { status: 'Active' }; // Update documents that match this filter
    const updateDoc = { $set: { status: 'Inactive' } }; // Set a new value

    // const result = await collection.updateMany(filter, updateDoc);
    const result = await myModel.updateMany(filter, updateDoc);
    console.timeEnd('----->>>>updateManyDocuments------->');
    console.log('Matched', result.matchedCount, 'document(s) and modified', result.modifiedCount, 'document(s)');
}

async function dropDB() {

    console.time('----->>>>dropcollection------->');
    await myModel.collection.drop();
    console.timeEnd('----->>>>dropcollection------->');
}

const TOTAL_ITEMS = 100000;

async function seedData() {
    try {

        console.time('----->>>>seeding------->');
        console.log("\n");
        await dropDB().catch(console.error);
        console.log("\n");
        await insertSingleDocument().catch(console.error);
        console.log("\n");
        await insertManyDocuments().catch(console.error);
        console.log("\n");
        await updateSingleDocument().catch(console.error);
        console.log("\n");
        await updateManyDocuments().catch(console.error);
        console.timeEnd('----->>>>seeding------->');

    } finally {
        mongoose.connection.close();
    }
}

seedData();