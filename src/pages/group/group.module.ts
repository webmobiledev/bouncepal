import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupPage } from './group';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    GroupPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupPage),
    PipesModule
  ],
})
export class GroupPageModule {}
