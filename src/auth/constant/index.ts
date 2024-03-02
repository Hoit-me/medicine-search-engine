export const JWT_OPTIONS = Symbol('JWT_OPTIONS');
export const JWT_SERVICE = Symbol('JWT_SERVICE');
export const PASSWORD_OPTIONS = 'PASSWORD_OPTIONS';
export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');

// AUTH
export const AUTH_LOCAL_SERVICE = Symbol('AUTH_LOCAL_SERVICE');
export const AUTH_KAKAO_SERVICE = Symbol('AUTH_KAKAO_SERVICE');

export const AUTH_STRATEGY = 'AUTH_STRATEGY';

export const AUTH_CACHE_SERVICE = Symbol('AUTH_CACHE_SERVICE');

//OAUTH URL
export const OAUTH_KAKAO_GET_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
export const OAUTH_KAKAO_GET_USER_INFO_URL =
  'https://kapi.kakao.com/v2/user/me';
