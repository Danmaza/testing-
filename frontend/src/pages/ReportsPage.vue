<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Reports</h1>
    </div>
    
    <div class="card">
      <div class="card-header">Date Range</div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input v-model="startDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input v-model="endDate" type="date" class="form-input" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">Revenue Report</div>
      <div class="card-body">
        <button @click="fetchRevenue" class="btn btn-primary">Generate Report</button>
        
        <div v-if="revenue" style="margin-top: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div>
              <strong>Total Revenue:</strong> ${{ revenue.summary.total_revenue?.toFixed(2) || '0.00' }}
            </div>
            <div>
              <strong>Labor Revenue:</strong> ${{ revenue.summary.labor_revenue?.toFixed(2) || '0.00' }}
            </div>
            <div>
              <strong>Parts Revenue:</strong> ${{ revenue.summary.parts_revenue?.toFixed(2) || '0.00' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">Expense Report (Parts)</div>
      <div class="card-body">
        <button @click="fetchExpenses" class="btn btn-primary">Generate Report</button>
        
        <div v-if="expenses" style="margin-top: 1.5rem;">
          <div>
            <strong>Total Parts Cost:</strong> ${{ expenses.summary.total_cost?.toFixed(2) || '0.00' }}
          </div>
          <div style="margin-top: 1rem;">
            <strong>Parts Used:</strong> {{ expenses.summary.total_parts || 0 }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">Labor Efficiency Report</div>
      <div class="card-body">
        <button @click="fetchLabor" class="btn btn-primary">Generate Report</button>
        
        <div v-if="labor && labor.length > 0" style="margin-top: 1.5rem;">
          <table class="table">
            <thead>
              <tr>
                <th>Mechanic</th>
                <th>Services Worked</th>
                <th>Work Orders</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mech in labor" :key="mech.mechanic_id">
                <td>{{ mech.mechanic_name }}</td>
                <td>{{ mech.services_worked || 0 }}</td>
                <td>{{ mech.work_orders || 0 }}</td>
                <td>{{ (mech.total_hours || 0).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">Service History by VIN</div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Enter VIN</label>
          <input v-model="searchVin" type="text" class="form-input" placeholder="Enter VIN to search" />
        </div>
        <button @click="fetchServiceHistory" class="btn btn-primary">Search</button>
        
        <div v-if="serviceHistory" style="margin-top: 1.5rem;">
          <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
            <strong>Vehicle:</strong> {{ serviceHistory.vehicle.year }} {{ serviceHistory.vehicle.make }} {{ serviceHistory.vehicle.model }}<br/>
            <strong>Owner:</strong> {{ serviceHistory.vehicle.first_name }} {{ serviceHistory.vehicle.last_name }}
          </div>
          
          <div v-if="serviceHistory.history && serviceHistory.history.length > 0">
            <div v-for="wo in serviceHistory.history" :key="wo.id" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 6px;">
              <strong>{{ wo.work_order_number }}</strong> - {{ wo.status }}<br/>
              Mileage: {{ wo.mileage || 'N/A' }} | Date: {{ new Date(wo.created_at).toLocaleDateString() }}<br/>
              Services: {{ wo.serviceLines?.length || 0 }} | Parts: {{ wo.parts?.length || 0 }}
            </div>
          </div>
          <div v-else style="padding: 1rem; color: #999;">
            No service history found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/api/axios';

const startDate = ref('');
const endDate = ref('');
const revenue = ref(null);
const expenses = ref(null);
const labor = ref(null);
const searchVin = ref('');
const serviceHistory = ref(null);

// Set default dates (last 30 days)
const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);
startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
endDate.value = today.toISOString().split('T')[0];

const fetchRevenue = async () => {
  try {
    const response = await api.get('/api/reports/revenue', {
      params: { startDate: startDate.value, endDate: endDate.value }
    });
    revenue.value = response.data;
  } catch (error) {
    alert('Failed to fetch revenue report');
  }
};

const fetchExpenses = async () => {
  try {
    const response = await api.get('/api/reports/expenses', {
      params: { startDate: startDate.value, endDate: endDate.value }
    });
    expenses.value = response.data;
  } catch (error) {
    alert('Failed to fetch expense report');
  }
};

const fetchLabor = async () => {
  try {
    const response = await api.get('/api/reports/labor', {
      params: { startDate: startDate.value, endDate: endDate.value }
    });
    labor.value = response.data;
  } catch (error) {
    alert('Failed to fetch labor report');
  }
};

const fetchServiceHistory = async () => {
  try {
    const response = await api.get(`/api/reports/service-history/${searchVin.value}`);
    serviceHistory.value = response.data;
  } catch (error) {
    alert('Vehicle not found or failed to fetch service history');
  }
};
</script>
