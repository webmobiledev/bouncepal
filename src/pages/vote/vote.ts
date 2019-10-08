import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { SurveyProvider } from '../../providers/survey/survey';
import { SurveyModel } from '../../models/survey.model';
import { AuthProvider } from '../../providers/auth/auth';
import { AuthModel } from '../../models/auth.model';

@IonicPage()
@Component({
  selector: 'page-vote',
  templateUrl: 'vote.html',
})
export class VotePage {
  surveys: SurveyModel[] = [];
  showComment = false;
  commentMessage = '';
  subs = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private surveyProvider: SurveyProvider,
    private loadingCtrl: LoadingController,
    private authProvider: AuthProvider
  ) {
    
  }

  ionViewDidEnter() {
    const loading = this.loadingCtrl.create();
    loading.present();
    this.subs.push(this.surveyProvider.getAllSurveysForVote().subscribe((res: any) => {
      this.surveys = [];
      res.forEach(r => {
        if (r.payload.val().userId !== localStorage.getItem('userId')) {
          this.surveys.push({
            id: r.key,
            ...r.payload.val()
          });
        }
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
    }));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VotePage');
  }

  ionViewDidLeave() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  vote(type, survey) {
    if (!survey[type + 'Users'] || (survey[type + 'Users'] && survey[type + 'Users'].indexOf(localStorage.getItem('userId')) < 0)) {
      survey[type] = survey[type] ? survey[type] + 1 : 1;
      if (survey[type + 'Users']) {
        survey[type + 'Users'].push(localStorage.getItem('userId'));
      } else {
        survey[type + 'Users'] = [localStorage.getItem('userId')];
      }
      this.surveyProvider.updateSurvey(survey);
    }
  }

  comment(survey: SurveyModel) {
    if (this.commentMessage) {
      const comments = survey.comments ? survey.comments : [];
      comments.push({
        created_at: new Date().toISOString(),
        comment: this.commentMessage,
        userId: localStorage.getItem('userId'),
      });
      survey.comments = comments;
      this.surveyProvider.updateSurvey(survey).then(res => {
        this.showComment = false;
        this.commentMessage = '';
      });
    }
  }

  review(survey, mark) {
    if (!survey['reviewUsers'] || (survey['reviewUsers'] && survey['reviewUsers'].indexOf(localStorage.getItem('userId')) < 0)) {
      if (survey['reviewUsers']) {
        survey['reviewUsers'].push(localStorage.getItem('userId'));
      } else {
        survey['reviewUsers'] = [localStorage.getItem('userId')];
      }
      survey['totalReview'] = survey['totalReview'] ? survey['totalReview'] + mark : mark;
      survey['avgReview'] = survey['totalReview'] / survey['reviewUsers'].length;
      this.surveyProvider.updateSurvey(survey);
    }
  }

  checkIfReviewed(survey) {
    if (survey.reviewUsers && survey.reviewUsers.indexOf(localStorage.getItem('userId')) > -1) {
      return true;
    }
    return false;
  }
}
