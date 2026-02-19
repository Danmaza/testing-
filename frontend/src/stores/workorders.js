import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useWorkOrderStore = defineStore('workorders', {
  state: () => ({
    workOrders: [],
    currentWorkOrder: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchWorkOrders(filters = {}) {
      this.loading = true;
      try {
        const response = await api.get('/api/workorders', { params: filters });
        this.workOrders = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch work orders';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchWorkOrder(id) {
      this.loading = true;
      try {
        const response = await api.get(`/api/workorders/${id}`);
        this.currentWorkOrder = response.data;
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch work order';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async createWorkOrder(workOrderData) {
      this.loading = true;
      try {
        const response = await api.post('/api/workorders', workOrderData);
        this.workOrders.unshift(response.data);
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create work order';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateWorkOrder(id, workOrderData) {
      this.loading = true;
      try {
        const response = await api.put(`/api/workorders/${id}`, workOrderData);
        const index = this.workOrders.findIndex(wo => wo.id === id);
        if (index !== -1) {
          this.workOrders[index] = response.data;
        }
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update work order';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateStatus(id, status) {
      this.loading = true;
      try {
        const response = await api.patch(`/api/workorders/${id}/status`, { status });
        const index = this.workOrders.findIndex(wo => wo.id === id);
        if (index !== -1) {
          this.workOrders[index] = response.data;
        }
        this.currentWorkOrder = response.data;
        this.error = null;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update status';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteWorkOrder(id) {
      this.loading = true;
      try {
        await api.delete(`/api/workorders/${id}`);
        this.workOrders = this.workOrders.filter(wo => wo.id !== id);
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete work order';
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
    
    async assignMechanic(workOrderId, mechanicUserId) {
      try {
        await api.post(`/api/workorders/${workOrderId}/mechanics`, { mechanicUserId });
        // Refresh work order
        await this.fetchWorkOrder(workOrderId);
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to assign mechanic';
        throw this.error;
      }
    },
    
    async unassignMechanic(workOrderId, mechanicId) {
      try {
        await api.delete(`/api/workorders/${workOrderId}/mechanics/${mechanicId}`);
        // Refresh work order
        await this.fetchWorkOrder(workOrderId);
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to unassign mechanic';
        throw this.error;
      }
    }
  }
});
