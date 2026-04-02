// Cookie utility for JWT token management
// Using cookies instead of localStorage for better SSR support and security

const TOKEN_COOKIE_NAME = 'nexwallet_token';
const TOKEN_EXPIRY_DAYS = 7;

export const cookieUtils = {
  // Set a cookie with the token
  setToken(token: string): void {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
  },

  // Get the token from cookies
  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === TOKEN_COOKIE_NAME) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },

  // Remove the token cookie
  removeToken(): void {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${TOKEN_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
  },

  // Check if token exists
  hasToken(): boolean {
    return !!this.getToken();
  },
};

export default cookieUtils;
