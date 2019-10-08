"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://bouncepal-bd20b.firebaseio.com/'
});
exports.sendNotification = functions.database
    .ref('subscribers/{subscriptionId}')
    .onCreate((event) => __awaiter(this, void 0, void 0, function* () {
    const data = event.params.data();
    const userId = data.userId;
    const subscriber = data.subscriberId;
    const payload = {
        notification: {
            title: 'New Subscriber',
            body: `${subscriber} is following your content!`,
            icon: 'https://goo.gl/Fz9nrQ'
        }
    };
    const db = admin.firestore();
    const devicesRef = db.collection('devices').where('userId', '==', userId);
    const devices = yield devicesRef.get();
    const tokens = [];
    devices.forEach(result => {
        const token = result.data().token;
        tokens.push(token);
    });
    return admin.messaging().sendToDevice(tokens, payload);
}));
//# sourceMappingURL=index.js.map