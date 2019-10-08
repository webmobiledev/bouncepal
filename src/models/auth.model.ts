export interface AuthModel {
    password?: string;
    fullName?: string;
    phone?: number;
}

export interface PhoneModel {
    country?: number;
    line?: number;
}

export interface UserModel {
    id?: string;
    email?: string;
    password?: string;
    emailVerified?: boolean;
    displayName?: string;
    userName?: string;
    avatar?: string;
    phoneNumber?: string;
    phoneNumbers?: any;
    photoURL?: string;
}