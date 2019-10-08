import { HttpClient } from '@angular/common/http';
import { Injectable, group } from '@angular/core';
import { GroupModel, UserGroupRelation } from '../../models/group.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorage } from 'angularfire2/storage';
import { merge } from 'rxjs/operators';

@Injectable()
export class GroupProvider {

  constructor(
    public http: HttpClient,
    public afDB: AngularFireDatabase,
    public afStorage: AngularFireStorage
  ) {
  }

  createGroup(group: GroupModel) {
    return this.afDB.list('groups').push(group);
  }

  updateGroup(group: GroupModel) {
    return this.afDB.object('groups/' + group.id).update(group);
  }

  deleteGroup(groupId) {
    return this.afDB.object('groups/' + groupId).remove();
  }

  accept(id) {
    return this.afDB.object('user_group_relation/' + id).update({status: 'accepted'});
  }

  decline(group: UserGroupRelation) {
    return new Promise((resolve, reject) => {
      this.afDB.object('user_group_relation/' + group.id).remove().then(() => {
        const sub = this.afDB.object('groups/' + group.groupId).valueChanges().subscribe((res: GroupModel) => {
          sub.unsubscribe();
          const groupUsers = res.group_users.splice(res.group_users.indexOf(group.userId), 1);
          this.afDB.object('groups/' + group.groupId).update({group_users: groupUsers}).then(() => {
            resolve('success');
          });
        });
      });
    });
  }

  getAllGroups() {
    return this.afDB.list('groups', ref => ref.orderByChild('create_user').equalTo(localStorage.getItem('userId'))).snapshotChanges();
  }

  getGroupById(id) {
    return this.afDB.list('groups/' + id).valueChanges();
  }

  getInvitedGroups() {
    return new Promise((resolve, reject) => {
      const sub = this.afDB.list('user_group_relation', ref => ref.orderByChild('userId').equalTo(localStorage.getItem('userId'))).snapshotChanges().subscribe(res => {
        const groups = [];
        const pendingGroupRelations = res.filter(r => r.payload.val().status === 'pending');
        pendingGroupRelations.forEach(r => {
          groups.push({
            id: r.key,
            ...r.payload.val()
          });
        });
        resolve(groups);
        sub.unsubscribe();
      });
    });
  }
  
  createUserGroupRelation(relation: UserGroupRelation) {
    return this.afDB.list('user_group_relation').push(relation);
  }

  addGroupToUser(group: GroupModel, userId: string) {
    return this.afDB.object('users/' + userId).update({groups: group});
  }

  deleteUserGroupRelation(userId, groupId) {
    return new Promise((resolve, reject) => {
      const sub = this.afDB.list('user_group_relation', ref => ref.orderByChild('userId').equalTo(userId)).snapshotChanges().subscribe(res => {
        const filteredRelations = res.filter(r => r.payload.val().groupId === groupId);
        filteredRelations.forEach(r => {
          this.afDB.object('user_group_relation/' + r.key).remove();
        });
        resolve('success');
        sub.unsubscribe();
      });
    });
  }

  uploadImage(path: string) {
    return this.afStorage.upload('/upload', path);
  }
}
