import LoginDTO from '../../dto/LoginDTO';

describe('LoginDTO', () => {
  describe('constructor', () => {
    it('should sanitize email correctly', () => {
      const dto = new LoginDTO('  TEST@EXAMPLE.COM  ', 'password');
      expect(dto.email).toBe('test@example.com');
    });

    it('should handle invalid email input', () => {
      const dto = new LoginDTO(null, 'password');
      expect(dto.email).toBe('');
    });

    it('should not sanitize password', () => {
      const dto = new LoginDTO('test@example.com', '  password123  ');
      expect(dto.password).toBe('  password123  ');
    });
  });

  describe('validate', () => {
    it('should validate correct credentials', () => {
      const dto = new LoginDTO('test@example.com', 'password123');
      const result = dto.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing email', () => {
      const dto = new LoginDTO('', 'password123');
      const result = dto.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email é obrigatório');
    });

    it('should return errors for missing password', () => {
      const dto = new LoginDTO('test@example.com', '');
      const result = dto.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha é obrigatória');
    });

    it('should return errors for invalid email format', () => {
      const dto = new LoginDTO('invalid-email', 'password123');
      const result = dto.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email inválido');
    });
  });

  describe('toPayload', () => {
    it('should return correct payload', () => {
      const dto = new LoginDTO('test@example.com', 'password123');
      const payload = dto.toPayload();
      
      expect(payload).toEqual({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});