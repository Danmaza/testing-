<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Work Orders</h1>
      <button v-if="canManage" @click="showModal = true" class="btn btn-success">
        + New Work Order
      </button>
    </div>
    
    <div v-if="loading" class="loading">Loading work orders...</div>
    
    <div v-else-if="workOrders.length === 0" class="empty-state">
      <div class="empty-state-text">No work orders found</div>
    </div>
    
    <div v-else class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>WO Number</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Mileage</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="wo in workOrders" :key="wo.id">
            <td><strong>{{ wo.work_order_number }}</strong></td>
            <td>{{ wo.first_name }} {{ wo.last_name }}</td>
            <td>{{ wo.year }} {{ wo.make }} {{ wo.model }}</td>
            <td><span :class="`badge badge-${wo.status.toLowerCase()}`">{{ wo.status }}</span></td>
            <td>{{ wo.mileage || '-' }}</td>
            <td>{{ new Date(wo.created_at).toLocaleDateString() }}</td>
            <td class="table-actions">
              <router-link :to="`/workorders/${wo.id}`">
                <button class="btn btn-primary">View</button>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- New Work Order Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">New Work Order</div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Vehicle *</label>
            <select v-model="form.vehicleId" @change="onVehicleChange" class="form-select" required>
              <option value="">Select Vehicle</option>
              <option v-for="vehicle in allVehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.vin }} - {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Mileage</label>
            <input v-model="form.mileage" type="number" class="form-input" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-textarea"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-success" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Work Order' }}
            </button>
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useWorkOrderStore } from '@/stores/workorders';
import { useVehicleStore } from '@/stores/vehicles';
import { useAuthStore } from '@/stores/auth';

const workOrderStore = useWorkOrderStore();
const vehicleStore = useVehicleStore();
const authStore = useAuthStore();

const workOrders = computed(() => workOrderStore.workOrders);
const loading = computed(() => workOrderStore.loading);
const canManage = computed(() => authStore.canManageCustomers);
const allVehicles = computed(() => vehicleStore.vehicles);

const showModal = ref(false);
const submitting = ref(false);

const form = ref({
  vehicleId: '',
  customerId: '',
  mileage: '',
  description: ''
});

const resetForm = () => {
  form.value = {
    vehicleId: '',
    customerId: '',
    mileage: '',
    description: ''
  };
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const onVehicleChange = () => {
  const vehicle = allVehicles.value.find(v => v.id === parseInt(form.value.vehicleId));
  if (vehicle) {
    form.value.customerId = vehicle.customer_id;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    await workOrderStore.createWorkOrder(form.value);
    closeModal();
  } catch (err) {
    alert(err);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  workOrderStore.fetchWorkOrders();
  vehicleStore.fetchVehicles();
});
</script>
