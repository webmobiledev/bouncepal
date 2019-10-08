import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, Platform } from 'ionic-angular';
import { ImagePickerOptions, ImagePicker } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file';
import { SurveyProvider } from '../../providers/survey/survey';
import { FcmProvider } from '../../providers/fcm/fcm';

@IonicPage()
@Component({
  selector: 'page-support',
  templateUrl: 'support.html',
})
export class SupportPage {
  description = '';
  image = '';
  errors = {};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private actionSheetCtrl: ActionSheetController,
    private imagePicker: ImagePicker,
    private file: File,
    private surveyProvider: SurveyProvider,
    private toastCtrl: ToastController,
    private fcmProvider: FcmProvider,
    private platform: Platform
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SupportPage');
  }

  showButtons() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Select an image for support',
      buttons: [
        {
          text: 'Select an image from Gallery',
          role: 'destructive',
          handler: () => {
            if (this.platform.is('cordova')) {
              this.getImage();
            } else {
              document.getElementById('file-input').click();
            }
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

  save() {
    if (!this.description) {
      this.errors['description'] = 'Description is required';
      return;
    }

    const toast = this.toastCtrl.create({
      message: 'You reported a problem successfully.',
      duration: 3000
    });
    this.surveyProvider.addSupport({
      userId: localStorage.getItem('userId'),
      description: this.description,
      image: this.image,
      created_at: new Date().toISOString()
    }).then(res => {
      toast.present();
      this.description = '';
      this.image = '';
    });
  }

  removeErrors(key) {
    delete this.errors[key];
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
