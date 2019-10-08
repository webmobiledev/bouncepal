import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { SurveyProvider } from '../../providers/survey/survey';
import { SurveyModel } from '../../models/survey.model';

@IonicPage()
@Component({
  selector: 'page-survey',
  templateUrl: 'survey.html',
})
export class SurveyPage {
  surveys: SurveyModel[] = [];
  subs = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private surveyProvider: SurveyProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveyPage');
  }

  ionViewDidEnter() {
    const loading = this.loadingCtrl.create();
    loading.present();
    this.subs.push(this.surveyProvider.getAllSurveys().subscribe(res => {
      this.surveys = [];
      res.forEach(r => {
        this.surveys.push({
          id: r.payload.key,
          ...r.payload.val()
        });
      });
      loading.dismiss();
    }));
  }

  ionViewDidLeave() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  delete(survey) {
    let alert = this.alertCtrl.create({
      subTitle: 'Do you really want to delete this group?',
      buttons: [{
        text: 'Yes',
        handler: () => {
          this.surveys = [];
          this.surveyProvider.deleteSurvey(survey.id);
        }
      }, {
        text: 'Cancel',
        handler: () => {
        }
      }]
    })
    alert.present();
  }

  addSurvey() {
    this.navCtrl.setRoot('SurveyAddPage');
  }
}
