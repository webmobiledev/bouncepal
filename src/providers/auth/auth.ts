import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthModel, UserModel } from '../../models/auth.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Facebook } from '@ionic-native/facebook';
import * as firebase from 'firebase';

@Injectable()
export class AuthProvider {
  windowRef: any;

  constructor(
    public http: HttpClient,
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
    private facebook: Facebook,
  ) {
  }

  isLoggedIn() {
    return localStorage.getItem('token') || localStorage.getItem('fbToken');
  }

  registerUser(user) {
    return this.afDB.object('users/' + user.uid).set({
      phoneNumber: user.phoneNumber,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || ''
    });
  }

  registerUserIfNotExist(user: UserModel) {
    return new Promise((resolve, reject) => {
      const sub = this.afDB.list('users', ref => ref.orderByChild('phoneNumber').equalTo(user.phoneNumber)).snapshotChanges().subscribe(res => {
        sub.unsubscribe();
        if (res[0]) {
          resolve(res[0].key);
        } else {
          this.afDB.list('users').push({
            phoneNumber: user.phoneNumber
          }).then(res => {
            resolve(res.key);
          });
        }
      });
    });
  }

  fbLogin() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.facebook.login(['public_profile', 'email'])
      .then(function(res) {
        if (res.status === 'connected') {
          that.facebook.api("/me?fields=email,id,name,picture", []).then((user) => {
            localStorage.setItem('userId', res.authResponse.userID);
            localStorage.setItem('fbToken', res.authResponse.accessToken);
            that.afDB.object('users/' + res.authResponse.userID).set({
              email: user.email,
              emailVerified: true,
              fullName: user.name,
              photoUrl: user.picture && user.picture.data ? user.picture.data.url : '',
            }).then((dbRes) => {
              resolve({
                success: true,
                userId: res.authResponse.userID
              });
            }).catch((err) => {
              console.log(err)
              reject({
                success: false,
                message: 'Unknown error'
              });
            });
          }).catch(err => {
            console.log(err)
            reject({
              success: false,
              message: 'Unknown error'
            });
          });
        } else {
          reject({
            success: false,
            message: 'You can\'t access to the facebook account'
          });
        }
      }, function(error) {
        reject({
          success: false,
          message: error.message
        });
      });
    });
  }

  logout() {
    // this.afAuth.auth.signOut();
    this.facebook.logout();
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('fbToken');
  }

  resetPassword(email) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  getUser() {
    return new Promise((resolve, reject) => {
      if (this.isLoggedIn()) {
        let sub2 = this.afDB.object('users/' + localStorage.getItem('userId')).valueChanges().subscribe(user => {
          sub2.unsubscribe();
          resolve(user);
        });
      } else {
        reject({
          success: false,
          message: 'User should login'
        })
      }
    });
  }

  getUserById(id) {
    return this.afDB.object('users/' + id).valueChanges();
  }

  getPhoneNumber(userId) {
    return new Promise((resolve, reject) => {
      const sub = this.afDB.object('users/' + userId).valueChanges().subscribe((res: any) => {
        sub.unsubscribe();
        resolve(res.phoneNumber);
      });
    });
  }

  updateUser(data) {
    return new Promise((resolve, reject) => {
      if (this.isLoggedIn()) {
        this.afDB.object('users/' + localStorage.getItem('userId')).update(data).then(status => {
          resolve('success');
        });
      } else {
        reject({
          success: false,
          message: 'User should login'
        })
      }
    });
  }

  sendEmailVerification() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  getAllUsers() {
    return this.afDB.list('users').snapshotChanges();
  }

  changeEmail(email: string) {
    return this.afAuth.auth.currentUser.updateEmail(email);
  }

  changePassword(password: string) {
    return this.afAuth.auth.currentUser.updatePassword(password);
  }
}
