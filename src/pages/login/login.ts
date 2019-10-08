import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import * as firebase from 'firebase';
import { Firebase } from '@ionic-native/firebase';
import { FcmProvider } from '../../providers/fcm/fcm';
declare var window;

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  public loading = null;
  phoneNumber = '';
  appVerifier: any;
  verificationCode = '';
  confirmationResult: any = null;
  isRecaptchaVerified = null;
  isAndroid = true;
  verificationId = null;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public auth: AuthProvider,
    public loadingCtrl: LoadingController,
    public nativeFirebase: Firebase,
    private platform: Platform,
    private fcmProvider: FcmProvider,
  ) {
    if (!this.platform.is('cordova') || this.platform.is('android')) {
      this.isAndroid = true;
    } else {
      this.isAndroid = false;
    }
  }

  ionViewDidLoad() {
    if (this.isAndroid) {
      this.appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
      this.appVerifier.render();
      this.appVerifier.verify().then(res => {
        this.isRecaptchaVerified = res;
      }).catch(err => {
        console.log(err);
      });
    } else {
    }
  }

  login() {
    if (this.isAndroid) {
      this.showLoading();
      firebase.auth().signInWithPhoneNumber('+' + this.phoneNumber, this.appVerifier).then(res => {
        this.hideLoading();
        this.confirmationResult = res;
      }).catch(err => {
        this.hideLoading();
        this.showAlert('Failed', err.message);
      });
    } else {
      this.showLoading();
      window.FirebasePlugin.verifyPhoneNumber('+' + this.phoneNumber, 300, function(credential) {
        this.hideLoading();
        this.verificationId = credential.verificationId;
      }, err => {
        this.hideLoading();
        this.showAlert('Failed', err.message);
      });
    }
  }

  verifyCode() {
    if (this.isAndroid) {
      this.showLoading();
      this.confirmationResult.confirm(this.verificationCode).then(res => {
        this.auth.registerUserIfNotExist({
          phoneNumber: '' + res.user.phoneNumber,
          displayName: res.user.displayName || '',
          email: res.user.email || '',
          photoURL: res.user.photoURL || ''
        }).then((userId: string) => {
          this.hideLoading();
          if (this.platform.is('cordova')) {
            this.fcmProvider.getToken();
          }
          localStorage.setItem('token', res.user.refreshToken);
          localStorage.setItem('userId', userId);
          this.navCtrl.setRoot('TabsPage');
        });
      }).catch(err => {
        this.hideLoading();
        this.showAlert('Failed', err.message);
      });
    } else {
      this.showLoading();
      const signInCredential = firebase.auth.PhoneAuthProvider.credential(this.verificationId, this.verificationCode);
      firebase.auth().signInWithCredential(signInCredential).then(res => {
        this.auth.registerUserIfNotExist({
          phoneNumber: '+' + this.phoneNumber,
          displayName: '',
          email: '',
          photoURL: ''
        }).then((userId: string) => {
          this.hideLoading();
          if (this.platform.is('cordova')) {
            this.fcmProvider.getToken();
          }
          localStorage.setItem('token', res.user.refreshToken);
          localStorage.setItem('userId', userId);
          this.navCtrl.setRoot('TabsPage');
        });
      }).catch(err => {
        this.hideLoading();
        this.showAlert('Failed', err.message);
      });
    }
  }

  loginFB() {
    this.showLoading();
    this.auth.fbLogin().then(res => {
      this.hideLoading();
      this.navCtrl.setRoot('TabsPage');
    }).catch(err => {
      this.hideLoading();
      this.showAlert('Failed', err.message);
    });
  }

  showLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  hideLoading() {
    this.loading.dismiss();
  }

  showAlert(title, message) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
}
