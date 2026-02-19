<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Invoices</h1>
    </div>
    
    <div v-if="loading" class="loading">Loading invoices...</div>
    
    <div v-else-if="invoices.length === 0" class="empty-state">
      <div class="empty-state-text">No invoices found</div>
    </div>
    
    <div v-else class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Work Order</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td><strong>{{ invoice.invoice_number }}</strong></td>
            <td>{{ invoice.work_order_number }}</td>
            <td>{{ invoice.first_name }} {{ invoice.last_name }}</td>
            <td>{{ invoice.make }} {{ invoice.model }}</td>
            <td>${{ invoice.total.toFixed(2) }}</td>
            <td>${{ invoice.total_paid.toFixed(2) }}</td>
            <td>${{ invoice.balance.toFixed(2) }}</td>
            <td><span :class="`badge badge-${invoice.status.toLowerCase()}`">{{ invoice.status }}</span></td>
            <td>{{ new Date(invoice.created_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';

const invoices = ref([]);
const loading = ref(true);

const fetchInvoices = async () => {
  try {
    const response = await api.get('/api/invoices');
    invoices.value = response.data;
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchInvoices();
});
</script>
