import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController, Loading, ToastController, Platform } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { UserModel } from '../../models/auth.model';
import { GroupProvider } from '../../providers/group/group';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { GroupModel } from '../../models/group.model';
import { File } from '@ionic-native/file';
import { Contacts } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { FcmProvider } from '../../providers/fcm/fcm';

@IonicPage()
@Component({
  selector: 'page-group-add',
  templateUrl: 'group-add.html',
})
export class GroupAddPage {
  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];
  selectedUsers: string[] = [];
  oldSelectedUsers: string[] = [];
  oldSelectedUserIds: string[] = [];
  name: string = '';
  description = '';
  errors = {};
  image: string = '';
  loading = null;
  searchVal = '';
  groups: GroupModel[] = [];
  title = 'Group Add';
  subs = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private auth: AuthProvider,
    private groupProvider: GroupProvider,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private file: File,
    private platform: Platform,
    private contacts: Contacts,
    private sms: SMS,
    private fcmProvider: FcmProvider
  ) {
    if (platform.is('cordova')) {
      this.sms.hasPermission().then(res => {
        console.log(res);
      });
    }
    if (this.navParams.data && this.navParams.data.id) {
      this.name = this.navParams.data.name;
      this.description = this.navParams.data.description;
      this.image = this.navParams.data.image;
      if (this.navParams.data.group_users) {
        const promises = [];
        this.navParams.data.group_users.forEach(u => {
          this.oldSelectedUserIds.push(u);
          promises.push(this.auth.getPhoneNumber(u));
        });

        Promise.all(promises).then(res => {
          res.forEach(r => {
            this.selectedUsers.push(r);
            this.oldSelectedUsers.push(r);
          });
        });
      }
      this.title = 'Group Edit';
    }
  }

  ionViewDidEnter() {
    let loading = this.loadingCtrl.create();
    loading.present();
    if (this.platform.is('cordova')) {
      this.contacts.find(['displayName', 'name', 'phoneNumbers', 'emails'], {filter: "", multiple: true}).then((res: any) => {
        res.forEach(r => {
          if (!r.displayName) {
            r.displayName = r.name.formatted;
          }
        });
        res.sort((a, b) => {
          if (a.displayName > b.displayName) {
            return 1;
          } else if (a.displayName < b.displayName) {
            return -1;
          }
          return 0;
        });
        this.users = res;
        this.filteredUsers = this.users;
      });
    }

    this.subs.push(this.groupProvider.getAllGroups().subscribe(res => {
      loading.dismiss();
      this.groups = [];
      res.forEach(r => {
        this.groups.push({
          id: r.payload.key,
          ...r.payload.val()
        });
      });
    }));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupAddPage');
  }

  ionViewDidLeave() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  save() {
    if (!this.name) {
      this.errors['name'] = 'Name is required';
      return;
    }

    if (this.navParams.data && this.navParams.data.id) {
      let loading = this.loadingCtrl.create();
      loading.present();

      let promises = [];
      this.selectedUsers.forEach(n => {
        promises.push(this.auth.registerUserIfNotExist({phoneNumber: n}));
        this.sms.hasPermission().then(res => {
          if (res) {
            this.sms.send(n, 'Please login to BouncePal and accept the group invitation.');
          } else {
            const options = {
              android: {
                intent: 'INTENT'
              }
            };
            this.sms.send(n, 'Please login to BouncePal and accept the group invitation.', options).then(res => {
              console.log(res);
            }).catch(err => {
              console.log(err);
            });
          }
        }).catch(err => {
          console.log(err);
        });
      });

      Promise.all(promises).then(ids => {
        this.groupProvider.updateGroup({
          id: this.navParams.data.id,
          name: this.name,
          updated_at: new Date().toISOString(),
          group_users: ids,
          image: this.image,
          create_user: localStorage.getItem('userId'),
          description: this.description
        }).then(res => {
          loading.dismiss();
          this.toastCtrl.create({
            message: 'Group has been updated successfully',
            duration: 1500
          }).present();
          if (this.oldSelectedUserIds.length === 0) {
            ids.forEach(userId => {
              this.groupProvider.createUserGroupRelation({
                groupId: this.navParams.data.id,
                userId: userId,
                status: 'pending',
                created_at: new Date().toISOString(),
                groupName: this.name,
                create_user: localStorage.getItem('userId'),
              })
            });
          }
          this.oldSelectedUserIds.forEach((userId, index) => {
            if (ids.indexOf(userId) < 0) {
              this.groupProvider.deleteUserGroupRelation(userId, this.navParams.data.id);
            }
            if (index === this.oldSelectedUserIds.length - 1) {
              ids.forEach(userId => {
                if (this.oldSelectedUserIds.indexOf(userId) < 0) {
                  this.groupProvider.createUserGroupRelation({
                    groupId: this.navParams.data.id,
                    userId: userId,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    groupName: this.name,
                    create_user: localStorage.getItem('userId'),
                  })
                }
              });
            }
          });
          this.navCtrl.setRoot('GroupPage');
        });
      });
    } else {
      if (this.groups.findIndex(g => g.create_user === localStorage.getItem('userId') && g.name === this.name) > -1) {
        this.errors['name'] = 'Name should be different';
        return;
      }

      let loading = this.loadingCtrl.create();
      loading.present();

      let promises = [];
      this.selectedUsers.forEach(n => {
        promises.push(this.auth.registerUserIfNotExist({phoneNumber: n}));
        this.sms.hasPermission().then(res => {
          if (res) {
            this.sms.send(n, 'Please login to BouncePal and accept the group invitation.');
          } else {
            const options = {
              android: {
                intent: 'INTENT'
              }
            };
            this.sms.send(n, 'Please login to BouncePal and accept the group invitation.', options).then(res => {
              console.log(res);
            }).catch(err => {
              console.log(err);
            });
          }
        }).catch(err => {
          console.log(err);
        });
      });

      Promise.all(promises).then(ids => {
        this.groupProvider.createGroup({
          name: this.name,
          created_at: new Date().toISOString(),
          group_users: ids,
          image: this.image,
          create_user: localStorage.getItem('userId'),
          description: this.description
        }).then(res => {
          loading.dismiss();
          this.toastCtrl.create({
            message: 'Group has been created successfully',
            duration: 1500
          }).present();
          ids.forEach(userId => {
            this.groupProvider.createUserGroupRelation({
              groupId: res.key,
              userId: userId,
              status: 'pending',
              created_at: new Date().toISOString(),
              groupName: this.name,
              create_user: localStorage.getItem('userId'),
            });
            const sub = this.fcmProvider.getReceiverToken(userId).subscribe((res: any) => {
              sub.unsubscribe();
              if (res) {
                this.fcmProvider.sendNotification(res.device, 'Group Invitation', 'You received an invitation to join new group. Please check your invited groups.');
              }
            });
          });
          this.navCtrl.setRoot('GroupPage');
        });
      });
    }
  }

  selectUser(numbers, event) {
    numbers.forEach(n => {
      if (event.checked) {
        if (this.selectedUsers.indexOf(this.getPhoneNumber(n.value)) < 0) {
          this.selectedUsers.push(this.getPhoneNumber(n.value));
        }
      } else {
        if (this.selectedUsers.indexOf(this.getPhoneNumber(n.value)) > -1) {
          this.selectedUsers.splice(this.selectedUsers.indexOf(this.getPhoneNumber(n.value)), 1);
        }
      }
    });
  }

  checkExist(numbers) {
    let isExist = false;
    numbers.forEach(n => {
      if (this.oldSelectedUsers.indexOf(this.getPhoneNumber(n.value)) > -1 || this.selectedUsers.indexOf(this.getPhoneNumber(n.value)) > -1) {
        isExist = true;
      }
    });
    return isExist;
  }

  removeErrors(key) {
    delete this.errors[key];
  }

  showButtons() {
    if (this.platform.is('cordova')) {
      const actionSheet = this.actionSheetCtrl.create({
        title: 'Select an image for group avatar',
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
        title: 'Select an image for group avatar',
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

  getPhoneNumber(number) {
    return '+' + number.split('-').join('').split(' ').join('').split('(').join('').split(')').join('');
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(u => u.displayName.toLowerCase().indexOf(this.searchVal.toLowerCase()) > -1);
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
