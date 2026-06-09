/**
 * Production environment configuration.
 *
 * The apiUrl is read from a build-time environment variable in CI/CD.
 * For now, it points to a placeholder — update during deployment.
 */

export const environment = {
  production: true,
  apiUrl: 'https://auraecommerce-exfk.onrender.com/api',
  appName: 'AuraEcommerce',
  tokenStorageKey: 'aura_access_token',
  refreshTokenStorageKey: 'aura_refresh_token',
  userStorageKey: 'aura_user',
};
