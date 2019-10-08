import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform, ToastController, AlertController } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';
import { tap } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class FcmProvider {

  constructor(
    public http: HttpClient,
    private platform: Platform,
    private firebase: Firebase,
    private alertCtrl: AlertController,
    private afDB: AngularFireDatabase
  ) {
    if (platform.is('cordova')) {
      console.log('aaaaa')
      this.firebase.onNotificationOpen().pipe(
        tap(msg => {
          const alert = alertCtrl.create({
            title: msg.title,
            message: msg.body,
            buttons: ['OK']
          }).present();
        })
      ).subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
    }
  }

  async getToken() {
    let token;
    if (this.platform.is('android')) {
      token = await this.firebase.getToken()
    } 
    if (this.platform.is('ios')) {
      token = await this.firebase.getToken()
      await this.firebase.grantPermission()
    } 
    localStorage.setItem('deviceToken', token);
    return this.saveTokenToFirestore(token);
  }

  public saveTokenToFirestore(token, sound = true) {
    if (!token) return;

    return new Promise((resolve, reject) => {
      this.afDB.object('devices/' + localStorage.getItem('userId')).set({
        device: token,
        userId: localStorage.getItem('userId'),
        updated_at: new Date().toISOString(),
        sound: sound
      }).then(res => {
        resolve('success');
      }).catch(err => {
        reject('failed');
      });
    });
  }

  sendNotification(to, title, message) {  
    let body = {
      "notification": {
        "title": title,
        "body": message,
        "sound": "default",
        "click_action": "FCM_PLUGIN_ACTIVITY",
        "icon": "fcm_push_icon"
      },
      "data": {
        "param1": "value1",
        "param2": "value2"
      },
      "to": to,
      "priority": "high",
      "restricted_package_name": ""
    }
    let options = new HttpHeaders().set('Content-Type', 'application/json');
    this.http.post("https://fcm.googleapis.com/fcm/send", body, {
      headers: options.set('Authorization', 'key=AAAA2DqwHe0:APA91bFQXlJgE7c6o4UIc484T6jcNQrvHSvdcRj7khtz_qiuytlMbTWgaQ3KrOEgjXnmKgr2D5tw3UyTI0hxgXJtDf9wSuqiJ6FMDk6VyXJPtT6g29s9uj0r1EjapDEgbbTN85F0Xb3b8PogbMMmPzDkbpHhcr5yBQ')
    }).subscribe(res => {
      console.log(res)
    }, err => {
      console.log(err)
    });
  }

  getReceiverToken(userId) {
    return this.afDB.object('devices/' + userId).valueChanges();
  }
}
