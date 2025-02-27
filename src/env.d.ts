// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly STRAPI_URL: string;
  readonly PHONE_NUMBER : number;
  readonly PUBLIC_GOOGLE_SITE_KEY: string;
  readonly GOOGLE_SECRET_KEY: string;
  readonly EMAIL_USER: string;
  readonly EMAIL_PASS: string;
  readonly EMAIL_ADMIN_REVIEW: string;
  readonly BASE_URL: string;
  readonly TOKEN_STRAPI: string;
}
