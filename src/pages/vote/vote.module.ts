import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VotePage } from './vote';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    VotePage,
  ],
  imports: [
    IonicPageModule.forChild(VotePage),
    PipesModule
  ],
})
export class VotePageModule {}
