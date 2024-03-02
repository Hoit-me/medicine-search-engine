export const JWT_OPTIONS = Symbol('JWT_OPTIONS');
export const JWT_SERVICE = Symbol('JWT_SERVICE');
export const PASSWORD_OPTIONS = 'PASSWORD_OPTIONS';
export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');

// AUTH
export const AUTH_LOCAL_SERVICE = Symbol('AUTH_LOCAL_SERVICE');
export const AUTH_KAKAO_SERVICE = Symbol('AUTH_KAKAO_SERVICE');
export const AUTH_NAVER_SERVICE = Symbol('AUTH_NAVER_SERVICE');
export const AUTH_GOOGLE_SERVICE = Symbol('AUTH_GOOGLE_SERVICE');

export const AUTH_STRATEGY = 'AUTH_STRATEGY';

export const AUTH_CACHE_SERVICE = Symbol('AUTH_CACHE_SERVICE');

//OAUTH URL
//// KAKAO
export const OAUTH_KAKAO_GET_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
export const OAUTH_KAKAO_GET_USER_INFO_URL =
  'https://kapi.kakao.com/v2/user/me';

//// NAVER
export const OAUTH_NAVER_GET_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
export const OAUTH_NAVER_GET_USER_INFO_URL =
  'https://openapi.naver.com/v1/nid/me';

//// GOOGLE
export const OAUTH_GOOGLE_GET_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const OAUTH_GOOGLE_GET_USER_INFO_URL =
  'https://www.googleapis.com/oauth2/v3/userinfo';
