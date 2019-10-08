import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  public form = this.formBuilder.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
  });
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: AuthProvider,
    public alertCtrl: AlertController,
  ) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }

  goLogin() {
    this.navCtrl.setRoot('LoginPage');
  }

  send() {
    this.auth.resetPassword(this.form.value.email).then(res => {
      this.alertCtrl.create({
        title: 'Success!',
        subTitle: 'Reset email has been sent! Please check your email!',
        buttons: ['OK']
      }).present();
    }).catch(err => {
      this.alertCtrl.create({
        title: 'Failed!',
        subTitle: err.message,
        buttons: ['OK']
      }).present();
    });
  }
}
