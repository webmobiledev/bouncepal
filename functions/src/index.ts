import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://bouncepal-bd20b.firebaseio.com/'
});

exports.sendNotification = functions.database
    .ref('subscribers/{subscriptionId}')
    .onCreate(async (event: any) => {
    const data = event.params.data();
    const userId = data.userId
    const subscriber = data.subscriberId
    const payload = {
      notification: {
          title: 'New Subscriber',
          body: `${subscriber} is following your content!`,
          icon: 'https://goo.gl/Fz9nrQ'
      }
    }
    const db = admin.firestore()
    const devicesRef = db.collection('devices').where('userId', '==', userId)
    const devices = await devicesRef.get();
    const tokens = [];
    devices.forEach(result => {
      const token = result.data().token;
      tokens.push( token )
    })
    return admin.messaging().sendToDevice(tokens, payload)
});