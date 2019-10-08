import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { GroupModel } from '../../models/group.model';
import { GroupProvider } from '../../providers/group/group';
import { SurveyProvider } from '../../providers/survey/survey';
import { SurveyModel } from '../../models/survey.model';
import { AuthProvider } from '../../providers/auth/auth';
import { AuthModel } from '../../models/auth.model';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  private subs = [];
  public groups: GroupModel[] = [];
  public group = '';
  surveys: SurveyModel[] = [];
  showComment = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private groupProvider: GroupProvider,
    private loadingCtrl: LoadingController,
    private surveyProvider: SurveyProvider,
    private authProvider: AuthProvider
  ) {
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }
  
  ionViewDidEnter() {
    const loading = this.loadingCtrl.create();
    loading.present();
    this.subs.push(this.groupProvider.getAllGroups().subscribe(changes => {
      this.groups = [];
      changes.forEach(c => this.groups.push({id: c.payload.key, ...c.payload.val()}));
      loading.dismiss();
      if (this.groups.length > 0) {
        this.group = this.groups[0].id;
        this.selectGroup();
      }
    }));
  }

  ionViewDidLeave() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  selectGroup() {
    let loading = this.loadingCtrl.create();
    loading.present();
    if (this.group) {
      this.surveyProvider.getSurveysByGroup(this.group).then((res: any) => {
        this.surveys = [];
        res.forEach(r => {
          this.surveys.push({
            id: r.payload.key,
            ...r.payload.val()
          });
        });
        this.surveys.sort((a, b) => {
          if (new Date(a.created_at).getTime() < new Date(b.created_at).getTime()) {
            return 1;
          } else if (new Date(a.created_at).getTime() > new Date(b.created_at).getTime()) {
            return -1;
          }
          return 0;
        });
        loading.dismiss();
      });
    }
  }

  addSurvey() {
    this.navCtrl.setRoot('SurveyAddPage');
  }
}
