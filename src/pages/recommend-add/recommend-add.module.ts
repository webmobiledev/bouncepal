import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecommendAddPage } from './recommend-add';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RecommendAddPage,
  ],
  imports: [
    IonicPageModule.forChild(RecommendAddPage),
    PipesModule
  ],
})
export class RecommendAddPageModule {}
