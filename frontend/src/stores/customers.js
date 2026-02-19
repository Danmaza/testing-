import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    customers: [],
    currentCustomer: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchCustomers(search = '') {
      this.loading = true;
      try {
        const params = search ? { search } : {};
        const response = await api.get('/api/customers', { params });
        this.customers = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch customers';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCustomer(id) {
      this.loading = true;
      try {
        const response = await api.get(`/api/customers/${id}`);
        this.currentCustomer = response.data;
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch customer';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async createCustomer(customerData) {
      this.loading = true;
      try {
        const response = await api.post('/api/customers', customerData);
        this.customers.push(response.data);
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create customer';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateCustomer(id, customerData) {
      this.loading = true;
      try {
        const response = await api.put(`/api/customers/${id}`, customerData);
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customers[index] = response.data;
        }
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update customer';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteCustomer(id) {
      this.loading = true;
      try {
        await api.delete(`/api/customers/${id}`);
        this.customers = this.customers.filter(c => c.id !== id);
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete customer';
        throw this.error;
      } finally {
        this.loading = false;
      }
    }
  }
});
