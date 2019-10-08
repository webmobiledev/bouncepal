import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SurveyPage } from './survey';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    SurveyPage,
  ],
  imports: [
    IonicPageModule.forChild(SurveyPage),
    PipesModule
  ],
})
export class SurveyPageModule {}
