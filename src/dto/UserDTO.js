/**
 * DTO para operações de usuário
 * Valida e sanitiza dados antes do envio para API
 */
class UserDTO {
  constructor(data = {}) {
    this.name = this.sanitizeString(data.name);
    this.email = this.sanitizeEmail(data.email);
    this.type = this.validateType(data.type);
    this.password = data.password; // Não sanitizar senha
  }

  sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().substring(0, 100); // Limitar tamanho
  }

  sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase().substring(0, 100);
  }

  validateType(type) {
    const validTypes = ['user', 'admin', 'super_admin'];
    return validTypes.includes(type) ? type : 'user';
  }

  toCreatePayload() {
    return {
      name: this.name,
      email: this.email,
      type: this.type,
      password: this.password
    };
  }

  toUpdatePayload() {
    const payload = {
      name: this.name,
      email: this.email,
      type: this.type
    };
    
    // Só incluir senha se fornecida
    if (this.password) {
      payload.password = this.password;
    }
    
    return payload;
  }

  validate() {
    const errors = [];
    
    if (!this.name) errors.push('Nome é obrigatório');
    if (!this.email) errors.push('Email é obrigatório');
    if (!this.email.includes('@')) errors.push('Email inválido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default UserDTO;