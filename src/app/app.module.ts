import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { AngularFireModule } from 'angularfire2';
import { FIREBASE_CONFIG } from '../providers/config';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { GroupProvider } from '../providers/group/group';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { SurveyProvider } from '../providers/survey/survey';
import { Contacts } from '@ionic-native/contacts';
import { Facebook } from '@ionic-native/facebook';
import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { FcmProvider } from '../providers/fcm/fcm';
import { SMS } from '@ionic-native/sms';
import { Firebase } from '@ionic-native/firebase';
import { RecommendProvider } from '../providers/recommend/recommend';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    GroupProvider,
    SurveyProvider,
    Contacts,
    Facebook,
    File,
    Camera,
    ImagePicker,
    FcmProvider,
    SMS,
    Firebase,
    RecommendProvider
  ]
})
export class AppModule {}
