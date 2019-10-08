import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupAddPage } from './group-add';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    GroupAddPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupAddPage),
    PipesModule
  ]
})
export class GroupAddPageModule {}
