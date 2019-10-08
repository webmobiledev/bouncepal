import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ActionSheetController, Platform } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RecommendProvider } from '../../providers/recommend/recommend';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file';
declare var google;

@IonicPage()
@Component({
  selector: 'page-recommend-add',
  templateUrl: 'recommend-add.html',
})
export class RecommendAddPage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('auto') autoInput: ElementRef;
  map: any;
  autocompleteService: any;
  placesService: any;
  autocompleteText: string;
  predictions = [];
  form: FormGroup;
  errors = {};
  image = '';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private _fb: FormBuilder,
    private _loadingCtrl: LoadingController,
    private _recommendProvider: RecommendProvider,
    private _toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    public camera: Camera,
    public imagePicker: ImagePicker,
    public file: File,
    public platform: Platform
  ) {
    this.form = _fb.group({
      title: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
      lat: ['', Validators.compose([Validators.required])],
      lng: ['', Validators.compose([Validators.required])],
      location: ['']
    });
  }

  ionViewDidLoad() {
    var latLng = new google.maps.LatLng(-34.9290, 138.6010);
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.autocompleteService =  new google.maps.places.AutocompleteService();
    this.placesService =  new google.maps.places.PlacesService(this.map);
  }

  save() {
    if (!this.form.value.title) {
      this.errors['title'] = 'Title is required';
      return;
    }
    if (!this.form.value.description) {
      this.errors['description'] = 'Description is required';
      return;
    }
    if (!this.form.value.lat) {
      this.errors['location'] = 'Select a location';
      return;
    }
    if (this.form.valid) {
      const loading = this._loadingCtrl.create();
      loading.present();
      this._recommendProvider.addRecommend({
        ...this.form.value,
        created_at: new Date().toISOString(),
        userId: localStorage.getItem('userId'),
        image: this.image
      }).then(res => {
        loading.dismiss();
        this._toastCtrl.create({
          message: 'Added a recommendation successfully!',
          duration: 3000
        }).present();
        this.navCtrl.setRoot('MapPage');
      }, err => {
        loading.dismiss();
      });
    }
  }

  removeErrors(key) {
    delete this.errors[key];
  }

  onInput($event) {
    this.removeErrors('location');
    let val = $event.target.value;
    if (val && val.length > 0){
      var q = {
        input : val,
        types : ['geocode']
      };

      let loading = this._loadingCtrl.create();
      loading.present();
      this.autocompleteService.getQueryPredictions(q , (res) =>{
        loading.dismiss();
        this.predictions = res;
      });
    } else {
      this.predictions = [];
      this.form.patchValue({location: ''});
    }
  }

  onCancel($event) {

  }

  detail(event){
    this.placesService.getDetails({placeId : event.place_id}, (details, status)=>{
      let geo = details.geometry.location;
      let mapOptions = {
        center: geo,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      const marker = new google.maps.Marker({position: {lat: geo.lat(), lng: geo.lng()}, map: this.map});
      this.form.patchValue({
        location: details.formatted_address,
        lat: geo.lat(),
        lng: geo.lng()
      });
      this.predictions = [];
    })
  }

  showButtons() {
    if (this.platform.is('cordova')) {
      const actionSheet = this.actionSheetCtrl.create({
        title: 'Select an image for recommendation',
        buttons: [
          {
            text: 'Select an image from Gallery',
            role: 'destructive',
            handler: () => {
              this.getImage();
            }
          },{
            text: 'Take a photo by Camera',
            handler: () => {
              this.takePhoto();
            }
          },{
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      actionSheet.present();
    } else {
      const actionSheet = this.actionSheetCtrl.create({
        title: 'Select an image for recommendation',
        buttons: [
          {
            text: 'Select an image from your desktop',
            role: 'destructive',
            handler: () => {
              document.getElementById('file-input').click();
            }
          },{
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      actionSheet.present();
    }
  }

  takePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
      let fileName = imageData.split('/').pop();
      let path = imageData.indexOf('file://') > -1 ? imageData.substring(0, imageData.lastIndexOf("/") + 1) : 'file://' + imageData.substring(0, imageData.lastIndexOf("/") + 1);
      this.file.readAsDataURL(path, fileName).then(base64File => {
          this.image = base64File;
      }).catch((err) => {
          console.log('Error reading file', err);
      });
    }, (err) => {
    });
  }

  getImage() {
    const options: ImagePickerOptions = {
      maximumImagesCount: 1,
      quality: 100
    };
    this.imagePicker.getPictures(options).then((results) => {
      let fileName = results[0].split('/').pop();
      let path = results[0].indexOf('file://') > -1 ? results[0].substring(0, results[0].lastIndexOf("/") + 1) : 'file://' + results[0].substring(0, results[0].lastIndexOf("/") + 1);
      this.file.readAsDataURL(path, fileName).then(base64File => {
          this.image = base64File;
      }).catch((err) => {
          console.log('Error reading file', err);
      });
    }, (err) => { });
  }

  readFile() {
    const files = document.querySelector('#file-input[type="file"]')['files'];
    if (files && files[0]) {
      const reader= new FileReader();
      const that = this;
      reader.addEventListener("load", function(e) {
        that.image = e.target['result'];
      }); 
      reader.readAsDataURL( files[0] );
    }
  }
}
