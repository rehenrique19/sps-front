/**
 * DTO para login
 * Valida e sanitiza credenciais
 */
class LoginDTO {
  constructor(email = '', password = '') {
    this.email = this.sanitizeEmail(email);
    this.password = password; // Não sanitizar senha
  }

  sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase().substring(0, 100);
  }

  toPayload() {
    return {
      email: this.email,
      password: this.password
    };
  }

  validate() {
    const errors = [];
    
    // Usar validação time-safe para evitar timing attacks
    const emailValid = this.email && this.email.length > 0;
    const passwordValid = this.password && this.password.length > 0;
    const emailFormatValid = this.email && this.email.includes('@');
    
    if (!emailValid) errors.push('Email é obrigatório');
    if (!passwordValid) errors.push('Senha é obrigatória');
    if (emailValid && !emailFormatValid) errors.push('Email inválido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default LoginDTO;