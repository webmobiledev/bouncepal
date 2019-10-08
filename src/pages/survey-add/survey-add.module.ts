import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SurveyAddPage } from './survey-add';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SurveyAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SurveyAddPage),
    PipesModule
  ],
})
export class SurveyAddPageModule {}
