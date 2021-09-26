export enum CurrentUserRelations {
  CURRENT_USER_REL = 'current-user',
  UPDATE_PROFILE_REL = 'updateProfile',
  CHANGE_PASSWORD_REL = 'changePassword',
  UPLOAD_AVATAR_REL = 'uploadAvatar',
  DELETE_ACCOUNT_REL = 'deleteProfile',
  USER_PREFERENCES_REL = 'user-preferences',
  UPDATE_PREFERENCES_REL = 'updatePreferences',
}

export enum UserManagementRelations {
  USER_MANAGEMENT_REL = 'user-management',
  USER_REL = 'user',
  USERS_REL = 'users',
  USER_PREFERENCES_REL = 'user-preferences',
  USER_MODEL_LIST_REL = 'userModels',
  USER_CREATE_REL = 'create',
  USER_UPDATE_REL = 'update',
  USER_DELETE_REL = 'delete',
}

export enum RoleManagementRelations {
  ROLES_REL = 'roles',
  ROLE_MODEL_LIST_REL = 'roleModels',
}

export enum AuthorityManagementRelations {
  AUTHORITIES_REL = 'authorities',
  AUTHORITY_MODEL_LIST_REL = 'authorityModels',
}

export enum AdministrationRelations {
  ADMINISTRATION_REL = 'administration',
  SERVICE_LOGS_REL = 'service-logs',
  DELETE_SERVICE_LOGS_REL = 'deleteServiceLogs',
}

export enum AuthRelations {
  LOGIN_RELATION = 'login',
  SIGNUP_RELATION = 'signup',
}

export enum ActivationTokenRelations {
  REQUEST_ACTIVATION_TOKEN_REL = 'requestActivationToken',
  ACTIVATE_ACCOUNT_REL = 'activateAccount',
}
