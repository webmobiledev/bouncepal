import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class RecommendProvider {

  constructor(
    public http: HttpClient,
    private _afDB: AngularFireDatabase
  ) {
    
  }

  addRecommend(data) {
    return this._afDB.list('recommend').push(data);
  }

  getRecommends() {
    return this._afDB.list('recommend').valueChanges();
  }
}
