/**
 * Development environment configuration.
 *
 * Why a dedicated environment file?
 * Hardcoding URLs in services makes the build environment-dependent.
 * Angular's fileReplacements config swaps this for environment.prod.ts
 * during production builds, eliminating the need for runtime configuration.
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'AuraEcommerce',
  tokenStorageKey: 'aura_access_token',
  refreshTokenStorageKey: 'aura_refresh_token',
  userStorageKey: 'aura_user',
};
