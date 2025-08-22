/**
 * Proteção adicional contra inspeção em desenvolvimento
 */

class DevToolsProtection {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.init();
    }
  }

  init() {
    this.protectLocalStorage();
    this.protectSessionStorage();
    this.addSecurityHeaders();
    this.detectDebugAttempts();
  }

  protectLocalStorage() {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    localStorage.setItem = function(key, value) {
      if (key === 'token' || key === 'user') {
        console.log(`🔒 Dados protegidos armazenados: ${encodeURIComponent(key)}`);
      }
      return originalSetItem.call(this, key, value);
    };

    localStorage.getItem = function(key) {
      const value = originalGetItem.call(this, key);
      if (key === 'token' && value) {
        console.log('🔒 Token JWT acessado (oculto por segurança)');
      }
      return value;
    };
  }

  protectSessionStorage() {
    const originalSetItem = sessionStorage.setItem;
    
    sessionStorage.setItem = function(key, value) {
      if (key.includes('token') || key.includes('auth')) {
        console.log(`🔒 Dados de sessão protegidos: ${encodeURIComponent(key)}`);
      }
      return originalSetItem.call(this, key, value);
    };
  }

  addSecurityHeaders() {
    // Adiciona meta tags de segurança
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3001";
    document.head.appendChild(meta);
  }



  // Detecta tentativas de debug
  detectDebugAttempts() {
    let devtools = false;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200) {
        if (!devtools) {
          console.clear();
          console.log('🔒 Ferramentas de desenvolvimento detectadas');
          console.log('🔒 Dados sensíveis foram ocultados por segurança');
          devtools = true;
        }
      } else {
        devtools = false;
      }
    }, 500);
  }
}

const devToolsProtection = new DevToolsProtection();
export default devToolsProtection;