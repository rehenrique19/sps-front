import UserService from '../../services/UserService';

// Mock ApiService
jest.mock('../../services/ApiService', () => ({
  getUsers: jest.fn(),
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  createUserWithFile: jest.fn(),
  updateUserWithFile: jest.fn(),
}));

const ApiService = require('../../services/ApiService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  describe('list', () => {
    it('deve listar usuários', async () => {
      const mockUsers = [{ id: 1, name: 'Test' }];
      ApiService.getUsers.mockResolvedValue(mockUsers);

      const result = await userService.list();
      
      expect(ApiService.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('deve tratar erro na listagem', async () => {
      ApiService.getUsers.mockRejectedValue(new Error('Network error'));

      await expect(userService.list()).rejects.toThrow('Network error');
    });
  });

  describe('get', () => {
    it('deve buscar usuário por ID', async () => {
      const mockUser = { id: 1, name: 'Test' };
      ApiService.getUser.mockResolvedValue(mockUser);

      const result = await userService.get(1);
      
      expect(ApiService.getUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('deve criar usuário', async () => {
      const userData = { name: 'Test', email: 'test@test.com' };
      const mockUser = { id: 1, ...userData };
      ApiService.createUser.mockResolvedValue(mockUser);

      const result = await userService.create(userData);
      
      expect(ApiService.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('deve atualizar usuário', async () => {
      const userData = { name: 'Updated' };
      const mockUser = { id: 1, ...userData };
      ApiService.updateUser.mockResolvedValue(mockUser);

      const result = await userService.update(1, userData);
      
      expect(ApiService.updateUser).toHaveBeenCalledWith(1, userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('deve deletar usuário', async () => {
      ApiService.deleteUser.mockResolvedValue();

      await userService.delete(1);
      
      expect(ApiService.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  describe('createWithFile', () => {
    it('deve criar usuário com arquivo', async () => {
      const formData = new FormData();
      const mockUser = { id: 1, name: 'Test' };
      ApiService.createUserWithFile.mockResolvedValue(mockUser);

      const result = await userService.createWithFile(formData);
      
      expect(ApiService.createUserWithFile).toHaveBeenCalledWith(formData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateWithFile', () => {
    it('deve atualizar usuário com arquivo', async () => {
      const formData = new FormData();
      const mockUser = { id: 1, name: 'Updated' };
      ApiService.updateUserWithFile.mockResolvedValue(mockUser);

      const result = await userService.updateWithFile(1, formData);
      
      expect(ApiService.updateUserWithFile).toHaveBeenCalledWith(1, formData);
      expect(result).toEqual(mockUser);
    });
  });
});