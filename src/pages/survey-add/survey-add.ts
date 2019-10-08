import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController, AlertController, ToastController, Platform } from 'ionic-angular';
import { GroupProvider } from '../../providers/group/group';
import { GroupModel } from '../../models/group.model';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { ImagePickerOptions, ImagePicker } from '@ionic-native/image-picker';
import { SurveyProvider } from '../../providers/survey/survey';
import { File } from '@ionic-native/file';

@IonicPage()
@Component({
  selector: 'page-survey-add',
  templateUrl: 'survey-add.html',
})
export class SurveyAddPage {
  groups: GroupModel[] = [];
  group: GroupModel;
  message = '';
  errors = {};
  image = '';
  subs = [];
  answers = [];
  answer = '';
  surveyTypes = ['Review', 'Recommendation', 'Question', 'Poll'];
  type = 'Review';
  pollImg1 = '';
  pollImg2 = '';
  imageType = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private groupProvider: GroupProvider,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private surveyProvider: SurveyProvider,
    private toastCtrl: ToastController,
    private file: File,
    private platform: Platform
  ) {
    
  }

  ionViewDidEnter() {
    const loading = this.loadingCtrl.create();
    loading.present();
    this.subs.push(this.groupProvider.getAllGroups().subscribe(changes => {
      this.groups = [];
      changes.forEach(c => this.groups.push({id: c.payload.key, ...c.payload.val()}));
      if (this.groups.length > 0) {
        this.group = this.groups[0];
      }
      loading.dismiss();
    }));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveyAddPage');
  }

  ionViewDidLeave() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  removeErrors(key) {
    delete this.errors[key];
  }

  addAnswer() {
    this.answers.push(this.answer);
    this.answer = '';
  }

  delete(index) {
    this.answers.splice(index, 1);
  }

  showButtons(type = 0) {
    this.imageType = type;
    if (this.platform.is('cordova')) {
      const actionSheet = this.actionSheetCtrl.create({
        title: 'Select an image for survey',
        buttons: [
          {
            text: 'Select an image from Gallery',
            role: 'destructive',
            handler: () => {
              this.getImage(type);
            }
          },{
            text: 'Take a photo by Camera',
            handler: () => {
              this.takePhoto(type);
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
        title: 'Select an image for survey',
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

  takePhoto(type) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
      let fileName = imageData.split('/').pop();
      let path = imageData.indexOf('file://') > -1 ? imageData.substring(0, imageData.lastIndexOf("/") + 1) : 'file://' + imageData.substring(0, imageData.lastIndexOf("/") + 1);
      this.file.readAsDataURL(path, fileName).then(base64File => {
        switch (type) {
          case 0:
            this.image = base64File;
          break;
          case 1:
            this.pollImg1 = base64File;
            this.removeErrors('poll');
          break;
          case 2:
            this.pollImg2 = base64File;
            this.removeErrors('poll');
          break;
        }
      }).catch((err) => {
        console.log('Error reading file', err);
        if (imageData) {
          switch (type) {
            case 0:
              this.image = 'data:image/jpeg;base64,' + imageData;
            break;
            case 1:
              this.pollImg1 = 'data:image/jpeg;base64,' + imageData;
              this.removeErrors('poll');
            break;
            case 2:
              this.pollImg2 = 'data:image/jpeg;base64,' + imageData;
              this.removeErrors('poll');
            break;
          }
        }
      });
    }, (err) => {
    });
  }

  getImage(type) {
    const options: ImagePickerOptions = {
      maximumImagesCount: 1,
      quality: 100
    };
    this.imagePicker.getPictures(options).then((results) => {
      let fileName = results[0].split('/').pop();
      let path = results[0].indexOf('file://') > -1 ? results[0].substring(0, results[0].lastIndexOf("/") + 1) : 'file://' + results[0].substring(0, results[0].lastIndexOf("/") + 1);
      this.file.readAsDataURL(path, fileName).then(base64File => {
        switch (type) {
          case 0:
            this.image = base64File;
          break;
          case 1:
            this.pollImg1 = base64File;
            this.removeErrors('poll');
          break;
          case 2:
            this.pollImg2 = base64File;
            this.removeErrors('poll');
          break;
        }
      }).catch((err) => {
          console.log('Error reading file', err);
      });
    }, (err) => { });
  }

  save() {
    if (this.message === '' && (this.type !== 'Poll')) {
      this.errors['message'] = 'This field is required';
      return;
    }

    if (!this.group) {
      this.errors['group'] = 'Group is required';
      return;
    }

    if ((!this.pollImg1 || !this.pollImg2) && this.type === 'Poll') {
      this.errors['poll'] = 'Images are required';
      return;
    }

    if (this.type === 'Question' && this.answers.length === 0) {
      return;
    }

    const loading = this.loadingCtrl.create();
    loading.present();
    this.surveyProvider.createSurvey({
      message: this.message,
      created_at: new Date().toISOString(),
      image: this.image,
      groupId: this.group.id,
      userId: localStorage.getItem('userId'),
      type: this.type,
      answers: this.answers,
      poll1Img: this.pollImg1,
      poll2Img: this.pollImg2,
    }).then(res => {
      loading.dismiss();
      this.navCtrl.setRoot('SurveyPage');
      this.toastCtrl.create({
        duration: 1500,
        message: 'Survey has been created successfully'
      });
    });
  }

  readFile() {
    const files = document.querySelector('#file-input[type="file"]')['files'];
    if (files && files[0]) {
      const reader= new FileReader();
      const that = this;
      reader.addEventListener("load", function(e) {
        switch (that.imageType) {
          case 0:
            that.image = e.target['result'];
          break;
          case 1:
            that.pollImg1 = e.target['result'];
            that.removeErrors('poll');
          break;
          case 2:
            that.pollImg2 = e.target['result'];
            that.removeErrors('poll');
          break;
        }
      }); 
      reader.readAsDataURL( files[0] );
    }
  }
}
