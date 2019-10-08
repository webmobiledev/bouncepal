import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmailVerifyPage } from './email-verify';

@NgModule({
  declarations: [
    EmailVerifyPage,
  ],
  imports: [
    IonicPageModule.forChild(EmailVerifyPage),
  ],
})
export class EmailVerifyPageModule {}
