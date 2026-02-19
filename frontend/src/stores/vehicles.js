import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useVehicleStore = defineStore('vehicles', {
  state: () => ({
    vehicles: [],
    currentVehicle: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchVehicles(customerId = null, search = '') {
      this.loading = true;
      try {
        const params = {};
        if (customerId) params.customerId = customerId;
        if (search) params.search = search;
        
        const response = await api.get('/api/vehicles', { params });
        this.vehicles = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch vehicles';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchVehicle(id) {
      this.loading = true;
      try {
        const response = await api.get(`/api/vehicles/${id}`);
        this.currentVehicle = response.data;
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch vehicle';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async createVehicle(vehicleData) {
      this.loading = true;
      try {
        const response = await api.post('/api/vehicles', vehicleData);
        this.vehicles.push(response.data);
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create vehicle';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateVehicle(id, vehicleData) {
      this.loading = true;
      try {
        const response = await api.put(`/api/vehicles/${id}`, vehicleData);
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
          this.vehicles[index] = response.data;
        }
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update vehicle';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteVehicle(id) {
      this.loading = true;
      try {
        await api.delete(`/api/vehicles/${id}`);
        this.vehicles = this.vehicles.filter(v => v.id !== id);
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete vehicle';
        throw this.error;
      } finally {
        this.loading = false;
      }
    }
  }
});
