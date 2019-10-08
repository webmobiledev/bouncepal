import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  tabs = [
    {page: 'HomePage', icon: 'home', title: 'Home'},
    {page: 'VotePage', icon: 'md-thumbs-up', title: 'Answer'},
    {page: 'GroupPage', icon: 'people', title: 'Group'},
    {page: 'SurveyPage', icon: 'information-circle', title: 'Survey'},
    {page: 'MapPage', icon: 'map', title: 'Map'},
    {page: 'SettingsPage', icon: 'settings', title: 'Settings'},
  ];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }
}
