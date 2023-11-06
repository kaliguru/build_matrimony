"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
class Users {
    constructor(id, firstName, middleName, lastName, contactNo, email, gender, password, imageId, isPasswordSet, isDisabled, isVerified, isActive, isDelete, createdDate, modifiedDate, createdBy, modifiedBy, roleId, role, token) {
        this.id = id;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.contactNo = contactNo;
        this.email = email;
        this.gender = gender;
        this.password = password;
        this.imageId = imageId;
        this.isPasswordSet = isPasswordSet;
        this.isDisabled = isDisabled;
        this.isVerified = isVerified;
        this.isActive = isActive;
        this.isDelete = isDelete;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
        this.createdBy = createdBy;
        this.modifiedBy = modifiedBy;
        this.roleId = roleId;
        this.role = role;
        this.token = token;
    }
}
exports.Users = Users;
