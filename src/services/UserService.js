import ApiService from './ApiService';

class UserService {
  async list() {
    return await ApiService.getUsers();
  }
  
  async get(id) {
    return await ApiService.getUser(id);
  }
  
  async create(data) {
    return await ApiService.createUser(data);
  }
  
  async delete(id) {
    return await ApiService.deleteUser(id);
  }
  
  async update(id, data) {
    return await ApiService.updateUser(id, data);
  }

  async createWithFile(formData) {
    return await ApiService.createUserWithFile(formData);
  }

  async updateWithFile(id, formData) {
    return await ApiService.updateUserWithFile(id, formData);
  }
}

export default UserService;
