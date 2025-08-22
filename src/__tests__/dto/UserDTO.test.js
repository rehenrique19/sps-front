import UserDTO from '../../dto/UserDTO';

describe('UserDTO', () => {
  describe('constructor', () => {
    it('should sanitize user data correctly', () => {
      const data = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        type: 'admin',
        password: 'password123'
      };
      
      const dto = new UserDTO(data);
      
      expect(dto.name).toBe('John Doe');
      expect(dto.email).toBe('john@example.com');
      expect(dto.type).toBe('admin');
      expect(dto.password).toBe('password123');
    });

    it('should handle invalid type', () => {
      const data = { type: 'invalid' };
      const dto = new UserDTO(data);
      
      expect(dto.type).toBe('user');
    });

    it('should handle empty data', () => {
      const dto = new UserDTO({});
      
      expect(dto.name).toBe('');
      expect(dto.email).toBe('');
      expect(dto.type).toBe('user');
    });
  });

  describe('validate', () => {
    it('should validate correct user data', () => {
      const dto = new UserDTO({
        name: 'John Doe',
        email: 'john@example.com',
        type: 'user'
      });
      
      const result = dto.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing name', () => {
      const dto = new UserDTO({
        email: 'john@example.com'
      });
      
      const result = dto.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
    });

    it('should return errors for invalid email', () => {
      const dto = new UserDTO({
        name: 'John Doe',
        email: 'invalid-email'
      });
      
      const result = dto.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email inválido');
    });
  });

  describe('toCreatePayload', () => {
    it('should return create payload with password', () => {
      const dto = new UserDTO({
        name: 'John Doe',
        email: 'john@example.com',
        type: 'admin',
        password: 'password123'
      });
      
      const payload = dto.toCreatePayload();
      
      expect(payload).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        type: 'admin',
        password: 'password123'
      });
    });
  });

  describe('toUpdatePayload', () => {
    it('should return update payload without password if not provided', () => {
      const dto = new UserDTO({
        name: 'John Doe',
        email: 'john@example.com',
        type: 'admin'
      });
      
      const payload = dto.toUpdatePayload();
      
      expect(payload).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        type: 'admin'
      });
      expect(payload.password).toBeUndefined();
    });

    it('should include password if provided', () => {
      const dto = new UserDTO({
        name: 'John Doe',
        email: 'john@example.com',
        type: 'admin',
        password: 'newpassword'
      });
      
      const payload = dto.toUpdatePayload();
      
      expect(payload.password).toBe('newpassword');
    });
  });
});