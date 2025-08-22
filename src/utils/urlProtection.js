/**
 * Proteção de URLs em modo desenvolvimento
 */

class URLProtection {
  constructor() {
    this.isDevMode = process.env.NODE_ENV === 'development';
    if (this.isDevMode) {
      this.init();
    }
  }

  init() {
    this.protectConsole();
    this.protectNetworkRequests();
  }

  protectConsole() {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const filtered = this.filterSensitiveData(args);
      originalLog.apply(console, filtered);
    };

    console.error = (...args) => {
      const filtered = this.filterSensitiveData(args);
      originalError.apply(console, filtered);
    };
  }

  protectNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      
      if (typeof url === 'string' && url.includes('localhost')) {
        console.log(`🔒 API Request: ${this.maskURL(url)}`);
      }
      
      return originalFetch.apply(window, args);
    };
  }

  filterSensitiveData(args) {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return this.maskSensitiveStrings(arg);
      }
      if (typeof arg === 'object') {
        return this.maskSensitiveObject(arg);
      }
      return arg;
    });
  }

  maskSensitiveStrings(str) {
    return str
      .replace(/localhost:\d+/g, '***:***')
      .replace(/Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, 'Bearer ***')
      .replace(/password['":\s]*['"]\w+['"]/gi, 'password: "***"')
      .replace(/\/users\/\d+/g, '/users/***')
      .replace(/\/auth\/login/g, '/auth/***')
      .replace(/email['":\s]*['"][^'"]+['"]/gi, 'email: "***@***.***"');
  }

  maskSensitiveObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const masked = { ...obj };
    if (masked.password) masked.password = '***';
    if (masked.token) masked.token = '***';
    if (masked.email) masked.email = masked.email.replace(/(.{2}).*(@.*)/, '$1***$2');
    if (masked.name) masked.name = masked.name.replace(/(.{2}).*/, '$1***');
    if (masked.id) masked.id = '***';
    
    return masked;
  }

  maskURL(url) {
    return url.replace(/localhost:\d+/g, '***:***');
  }
}

const urlProtection = new URLProtection();
export default urlProtection;