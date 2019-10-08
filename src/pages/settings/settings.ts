import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, LoadingController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { UserModel } from '../../models/auth.model';


@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  user: UserModel = {};
  fbLogin = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private auth: AuthProvider,
    private app: App,
    private loadingCtrl: LoadingController
  ) {
    this.fbLogin = localStorage.getItem('fbToken') ? true : false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  ionViewDidEnter() {
    const loading = this.loadingCtrl.create();
    loading.present();
    this.auth.getUser().then(res => {
      this.user = res;
      loading.dismiss();
    });
  }

  logout() {
    this.auth.logout();
    this.app.getRootNav().setRoot('LoginPage');
  }

  goProfile() {
    this.navCtrl.setRoot('ProfilePage', this.user);
  }

  goPrivacy() {
    this.navCtrl.setRoot('PrivacyPolicyPage');
  }

  goSupport() {
    this.navCtrl.setRoot('SupportPage');
  }
}
