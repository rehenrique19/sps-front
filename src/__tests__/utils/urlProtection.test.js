import { maskUrl, maskToken } from '../../../src/utils/urlProtection';

describe('URL Protection Utils', () => {
  describe('maskUrl', () => {
    test('should mask localhost URLs in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = maskUrl('http://localhost:3001/api/users');
      expect(result).toBe('http://***:****/api/users');

      process.env.NODE_ENV = originalEnv;
    });

    test('should not mask URLs in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const url = 'http://localhost:3001/api/users';
      const result = maskUrl(url);
      expect(result).toBe(url);

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle non-localhost URLs', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const url = 'https://api.example.com/users';
      const result = maskUrl(url);
      expect(result).toBe(url);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('maskToken', () => {
    test('should mask JWT tokens in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = maskToken('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      expect(result).toBe('Bearer ***');

      process.env.NODE_ENV = originalEnv;
    });

    test('should not mask tokens in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const result = maskToken(token);
      expect(result).toBe(token);

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle non-Bearer tokens', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const token = 'Basic dXNlcjpwYXNz';
      const result = maskToken(token);
      expect(result).toBe(token);

      process.env.NODE_ENV = originalEnv;
    });
  });
});