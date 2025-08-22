import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = this.getSecureBaseURL();
    this.setupInterceptors();
  }

  getSecureBaseURL() {
    // Oculta URL real em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 API conectada a servidor protegido');
    }
    return process.env.REACT_APP_SERVER_URL;
  }

  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Adicionar proteção CSRF para requests que modificam estado
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
          config.headers['X-CSRF-Token'] = this.generateCSRFToken();
        }
        
        // Oculta informações sensíveis em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          const maskedUrl = config.url?.replace(/localhost:\d+/g, '***:***');
          const maskedData = this.maskSensitiveData(config.data);
          console.log(`🔒 ${config.method?.toUpperCase()} → ${maskedUrl}`);
          if (maskedData && Object.keys(maskedData).length > 0) {
            console.log('🔒 Data:', maskedData);
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Response received from protected endpoint');
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );
  }



  generateCSRFToken() {
    // Gerar token CSRF simples baseado em timestamp e random
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2);
    return `${timestamp}-${random}`;
  }

  maskSensitiveData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const masked = { ...data };
    if (masked.password) masked.password = '***';
    if (masked.token) masked.token = '***';
    if (masked.email) masked.email = masked.email.replace(/(.{2}).*(@.*)/, '$1***$2');
    
    return masked;
  }

  async login(email, password) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Attempting secure authentication...');
    }
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password
    });
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Authentication successful');
    }
    return response.data;
  }

  async getUsers() {
    const response = await axios.get(`${this.baseURL}/users`);
    return response.data;
  }

  async getUser(id) {
    const response = await axios.get(`${this.baseURL}/users/${id}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await axios.post(`${this.baseURL}/users`, userData);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await axios.put(`${this.baseURL}/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id) {
    await axios.delete(`${this.baseURL}/users/${id}`);
  }

  async createUserWithFile(formData) {
    const response = await axios.post(`${this.baseURL}/users`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateUserWithFile(id, formData) {
    const response = await axios.put(`${this.baseURL}/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;