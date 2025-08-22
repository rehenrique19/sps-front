import axios from 'axios';
import ApiService from '../../services/ApiService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token',
          user: { id: 1, name: 'John', email: 'john@example.com' }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await ApiService.login('john@example.com', 'password');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_SERVER_URL}/auth/login`,
        { email: 'john@example.com', password: 'password' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Login failed'));

      await expect(ApiService.login('john@example.com', process.env.REACT_APP_TEST_WRONG_PASSWORD || 'wrong')).rejects.toThrow('Login failed');
    });
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockUsers });

      const result = await ApiService.getUsers();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_SERVER_URL}/users`);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = { name: 'John', email: 'john@example.com', type: 'user' };
      const mockResponse = { data: { id: 1, ...userData } };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await ApiService.createUser(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_SERVER_URL}/users`,
        userData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userData = { name: 'John Updated' };
      const mockResponse = { data: { id: 1, ...userData } };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await ApiService.updateUser(1, userData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${process.env.REACT_APP_SERVER_URL}/users/1`,
        userData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await ApiService.deleteUser(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${process.env.REACT_APP_SERVER_URL}/users/1`
      );
    });
  });
});