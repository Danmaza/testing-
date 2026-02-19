<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
    </div>
    
    <div v-if="loading" class="loading">Loading dashboard...</div>
    
    <div v-else>
      <div class="dashboard-grid">
        <div class="stat-card blue">
          <div class="stat-value">{{ summary.activeWorkOrders || 0 }}</div>
          <div class="stat-label">Active Work Orders</div>
        </div>
        
        <div class="stat-card orange">
          <div class="stat-value">{{ summary.outstandingInvoices || 0 }}</div>
          <div class="stat-label">Outstanding Invoices</div>
        </div>
        
        <div class="stat-card green">
          <div class="stat-value">${{ (summary.todayRevenue || 0).toFixed(2) }}</div>
          <div class="stat-label">Today's Revenue</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">${{ (summary.monthRevenue || 0).toFixed(2) }}</div>
          <div class="stat-label">This Month's Revenue</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">Quick Actions</div>
        <div class="card-body">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <router-link to="/customers">
              <button class="btn btn-primary">Manage Customers</button>
            </router-link>
            <router-link to="/vehicles">
              <button class="btn btn-primary">Manage Vehicles</button>
            </router-link>
            <router-link to="/workorders">
              <button class="btn btn-success">View Work Orders</button>
            </router-link>
            <router-link to="/invoices">
              <button class="btn btn-warning">View Invoices</button>
            </router-link>
            <router-link to="/reports">
              <button class="btn btn-secondary">View Reports</button>
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-if="summary.totalOutstanding > 0" class="card">
        <div class="card-header">Outstanding Balance</div>
        <div class="card-body">
          <p style="font-size: 1.3rem;">
            <strong>${{ (summary.totalOutstanding || 0).toFixed(2) }}</strong> in unpaid invoices
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';

const summary = ref({});
const loading = ref(true);

const fetchDashboard = async () => {
  try {
    const response = await api.get('/api/reports/dashboard');
    summary.value = response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});
</script>
