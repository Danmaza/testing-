import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isOwner: (state) => state.user?.role === 'Owner',
    isServiceAdvisor: (state) => state.user?.role === 'ServiceAdvisor',
    isMechanic: (state) => state.user?.role === 'Mechanic',
    canManageCustomers: (state) => ['Owner', 'ServiceAdvisor'].includes(state.user?.role),
    canVoidInvoice: (state) => state.user?.role === 'Owner',
  },
  
  actions: {
    async login(username, password) {
      try {
        const response = await api.post('/api/auth/login', { username, password });
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return response.data;
      } catch (error) {
        throw error.response?.data?.error || 'Login failed';
      }
    },
    
    async logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    async register(userData) {
      try {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
      } catch (error) {
        throw error.response?.data?.error || 'Registration failed';
      }
    },
    
    async getCurrentUser() {
      try {
        const response = await api.get('/api/auth/me');
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
        return response.data;
      } catch (error) {
        this.logout();
        throw error;
      }
    }
  }
});
