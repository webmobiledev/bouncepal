import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Platform } from 'ionic-angular';
import { GroupProvider } from '../../providers/group/group';
import { GroupModel, UserGroupRelation } from '../../models/group.model';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-group',
  templateUrl: 'group.html',
})
export class GroupPage {
  groups: GroupModel[] = [];
  invitedGroups: UserGroupRelation[] = [];
  subs = [];
  type = 'yourGroups';
  groupCreators = {};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private groupProvider: GroupProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private auth: AuthProvider
  ) {

  }

  ionViewDidLoad() {
    
  }

  ionViewDidLeave() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  ionViewDidEnter() {
    this.getAllInvitedGroups();
    const loading = this.loadingCtrl.create();
    loading.present();
    this.subs.push(this.groupProvider.getAllGroups().subscribe(res => {
      this.groups = [];
      res.forEach(r => {
        this.groups.push({
          id: r.payload.key,
          ...r.payload.val()
        });
      });
      loading.dismiss();
    }));
  }

  add() {
    this.navCtrl.setRoot('GroupAddPage');
  }

  edit(group) {
    this.navCtrl.setRoot('GroupAddPage', group);
  } 

  delete(group: GroupModel) {
    let alert = this.alertCtrl.create({
      subTitle: 'Do you really want to delete this group?',
      buttons: [{
        text: 'Yes',
        handler: () => {
          this.groups = [];
          if (group.group_users) {
            group.group_users.forEach(u => {
              this.groupProvider.deleteUserGroupRelation(u, group.id);
            });
          }
          this.groupProvider.deleteGroup(group.id);
        }
      }, {
        text: 'Cancel',
        handler: () => {
        }
      }]
    })
    alert.present();
  }

  getAllInvitedGroups() {
    let loading = this.loadingCtrl.create();
    loading.present();
    this.groupProvider.getInvitedGroups().then((res: any) => {
      loading.dismiss();
      this.invitedGroups = res;
      res.forEach((r, index) => {
        const sub = this.auth.getUserById(r.create_user).subscribe((u: any) => {
          sub.unsubscribe();
          this.groupCreators[r.id] = u.displayName || u.email || u.phoneNumber;
          console.log(this.groupCreators)
        });
      });
    });
  }

  accept(group: UserGroupRelation) {
    this.groupProvider.accept(group.id).then(() => {
      this.getAllInvitedGroups();
    });
  }

  decline(group: UserGroupRelation) {
    this.groupProvider.decline(group).then(() => {
      this.getAllInvitedGroups();
    });
  }
}
