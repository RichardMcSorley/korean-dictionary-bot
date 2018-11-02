const firebase = require('./firebase');
const db = firebase.database;
const DBResource = process.env.NODE_ENV === 'development'? `TestKoreanDictionaryTerms` : 'KoreanDictionaryTerms';

module.exports.sendTermToDB = async (term) => {
    const dbRef = await db.ref(`${DBResource}`);
    return await dbRef.once('value', async function (snapshot) {
        if (await snapshot.hasChild(term)) {
            //already exists, add
            const oldValue = await snapshot.child(term).val().count
            return await dbRef.child(term)
                .update({count: oldValue + 1});
        } else {
            return await dbRef.child(term)
                .set({ count: 1 });
        }
    });
}
module.exports.getTermsFromDB = async () => {
    const eventref = db.ref(DBResource);
    const snapshot = await eventref.once('value');
    const value = snapshot.val();
    return value;
}

module.exports.resetTermsOnDB = async () => {
    const dbRef = db.ref(`${DBResource}`);
    dbRef
    .set({});
}