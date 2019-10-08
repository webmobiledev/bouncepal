import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { RecommendProvider } from '../../providers/recommend/recommend';
declare var google;

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  type = 'map';
  markerData = {};
  showDetails = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private _recommendProvider: RecommendProvider,
    private _loadingCtrl: LoadingController
  ) {
  }

  ionViewDidLoad() {
  }
  
  ionViewDidEnter() {
    this.initMap();
  }

  initMap() {

    const loading = this._loadingCtrl.create();
    loading.present();
    const sub = this._recommendProvider.getRecommends().subscribe((res: any) => {
      loading.dismiss();
      sub.unsubscribe();
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 1,
        center: {lat: 56, lng: -101}
      });
      res.forEach(r => {
        const marker = new google.maps.Marker({position: {lat: r.lat, lng: r.lng}, map: this.map});
        const that = this;
        marker.addListener('click', function() {
          that.markerData = r;
          that.showDetails = true;
          console.log('aaaa')
        });
      });
    });
  }

  add() {
    this.navCtrl.setRoot('RecommendAddPage');
  }

  closeDetail() {
    this.showDetails = false;
  }
}
