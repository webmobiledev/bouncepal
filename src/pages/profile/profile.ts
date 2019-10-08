import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController, ToastController, AlertController, Platform } from 'ionic-angular';
import { UserModel } from '../../models/auth.model';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  user: UserModel = {};
  public form: FormGroup;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private file: File,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authProvider: AuthProvider,
    private toastController: ToastController,
    private alertController: AlertController,
    public platform: Platform
  ) {
    this.user = this.navParams.data;
    this.form = this.formBuilder.group({
      fullName: [this.user.displayName || '', Validators.compose([Validators.minLength(2)])],
      userName: [this.user.userName || '', Validators.compose([Validators.minLength(2)])],
      email: [this.user.email || '', Validators.compose([Validators.email])],
      password: ['', Validators.compose([Validators.minLength(8)])],
      phone: [this.user.phoneNumber || '', Validators.minLength(8)],
      avatar: [this.user.avatar || 'assets/imgs/person.png']
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  changeImage() {
    if (this.platform.is('cordova')) {
      const actionSheet = this.actionSheetCtrl.create({
        title: 'Select an image for your avatar',
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
        title: 'Select an image for your avatar',
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
          this.user.avatar = base64File;
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
          this.user.avatar = base64File;
      }).catch((err) => {
          console.log('Error reading file', err);
      });
    }, (err) => { });
  }

  save() {
    if (this.form.valid) {
      const loading = this.loadingController.create();
      loading.present();
      this.user.email = this.form.value.email;
      this.user.displayName = this.form.value.fullName;
      this.user.userName = this.form.value.userName;
  
      this.authProvider.updateUser(this.user).then(res => {
        this.toastController.create({message: 'Profile has been updated successfully!', duration: 2000}).present();
        loading.dismiss();
      }).catch(err => {
        this.alertController.create({message: err.message, buttons: ['OK']}).present();
        loading.dismiss();
      });
    }
  }

  readFile() {
    const files = document.querySelector('#file-input[type="file"]')['files'];
    if (files && files[0]) {
      const reader= new FileReader();
      const that = this;
      reader.addEventListener("load", function(e) {
        that.user.avatar = e.target['result'];
      }); 
      reader.readAsDataURL( files[0] );
    }
  }
}
