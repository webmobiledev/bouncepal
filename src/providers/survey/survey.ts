import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveyModel } from '../../models/survey.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subject } from 'rxjs';
import { UserGroupRelation } from '../../models/group.model';

@Injectable()
export class SurveyProvider {
  numOfSurveyCalls = 0;
  numOfUserGroupRelations = -1;
  totalSurveys = [];

  constructor(
    public http: HttpClient,
    private afDB: AngularFireDatabase
  ) {
    console.log('Hello SurveyProvider Provider');
  }

  createSurvey(survey: SurveyModel) {
    return this.afDB.list('surveys').push(survey);
  }

  deleteSurvey(surveyId) {
    return this.afDB.object('surveys/' + surveyId).remove();
  }

  getAllSurveys() {
    return this.afDB.list('surveys', ref => ref.orderByChild('userId').equalTo(localStorage.getItem('userId'))).snapshotChanges();
  }

  getSurveysByGroup(groupId) {
    return new Promise((resolve, reject) => {
      const sub = this.afDB.list('surveys', ref => ref.orderByChild('groupId').equalTo(groupId)).snapshotChanges().subscribe(res => {
        sub.unsubscribe();
        const surveys = res.filter(r => r.payload.val().userId === localStorage.getItem('userId'));
        resolve(surveys);
      });
    });
  }

  updateSurvey(survey) {
    return this.afDB.object('surveys/' + survey.id).update(survey);
  }

  getAllSurveysForVote() {
    this.numOfSurveyCalls = 0;
    this.numOfUserGroupRelations = -1;
    this.totalSurveys = [];
    let subject = new Subject();
    const sub1 = this.afDB.list('user_group_relation', ref => ref.orderByChild('userId').equalTo(localStorage.getItem('userId'))).valueChanges().subscribe((relations: UserGroupRelation[]) => {
      sub1.unsubscribe();
      const availableRelations = relations.filter(r => r.status === 'accepted');
      if (availableRelations.length === 0) {
        subject.next([]);
      } else {
        this.numOfUserGroupRelations = availableRelations.length;
        availableRelations.forEach((r: any) => {
          const sub2 = this.afDB.list('surveys', ref => ref.orderByChild('groupId').equalTo(r.groupId)).snapshotChanges().subscribe(surveys => {
            sub2.unsubscribe();
            this.combineSurveys(surveys, subject);
          });
        });
      }
    });
    return subject;
  }

  combineSurveys(surveys, subject) {
    this.numOfSurveyCalls ++;
    this.totalSurveys = this.totalSurveys.concat(surveys);
    if (this.numOfSurveyCalls >= this.numOfUserGroupRelations) {
      subject.next(this.totalSurveys);
    }
  }

  addSupport(support) {
    return this.afDB.list('supports').push(support);
  }
}
