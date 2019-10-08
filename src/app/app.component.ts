import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AuthProvider } from '../providers/auth/auth';
import { FcmProvider } from '../providers/fcm/fcm';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    private auth: AuthProvider,
    private fcmProvider: FcmProvider
  ) {
    platform.ready().then(() => {
      this.rootPage = this.auth.isLoggedIn() ? 'TabsPage' : 'LoginPage';
      console.log(platform.width(), platform.height(), window.innerHeight)

      if (this.auth.isLoggedIn() && platform.is('cordova')) {
        this.fcmProvider.getToken();
      }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
