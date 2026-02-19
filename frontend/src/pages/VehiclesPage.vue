<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Vehicles</h1>
      <button v-if="canManage" @click="showModal = true" class="btn btn-success">
        + New Vehicle
      </button>
    </div>
    
    <div v-if="loading" class="loading">Loading vehicles...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-else-if="vehicles.length === 0" class="empty-state">
      <div class="empty-state-text">No vehicles found</div>
    </div>
    
    <div v-else class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>VIN</th>
            <th>Year</th>
            <th>Make/Model</th>
            <th>Owner</th>
            <th>License Plate</th>
            <th v-if="canManage">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in vehicles" :key="vehicle.id">
            <td>{{ vehicle.vin }}</td>
            <td>{{ vehicle.year }}</td>
            <td>{{ vehicle.make }} {{ vehicle.model }}</td>
            <td>{{ vehicle.first_name }} {{ vehicle.last_name }}</td>
            <td>{{ vehicle.license_plate || '-' }}</td>
            <td v-if="canManage" class="table-actions">
              <button @click="editVehicle(vehicle)" class="btn btn-primary">Edit</button>
              <button @click="deleteVehicleConfirm(vehicle)" class="btn btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Vehicle Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">{{ isEditing ? 'Edit Vehicle' : 'New Vehicle' }}</div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Customer *</label>
            <select v-model="form.customerId" class="form-select" required>
              <option value="">Select Customer</option>
              <option v-for="customer in allCustomers" :key="customer.id" :value="customer.id">
                {{ customer.first_name }} {{ customer.last_name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">VIN *</label>
            <input v-model="form.vin" type="text" class="form-input" maxlength="17" required />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Year *</label>
              <input v-model="form.year" type="number" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Make *</label>
              <input v-model="form.make" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Model *</label>
              <input v-model="form.model" type="text" class="form-input" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Color</label>
              <input v-model="form.color" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">License Plate</label>
              <input v-model="form.licensePlate" type="text" class="form-input" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea v-model="form.notes" class="form-textarea"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-success" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save' }}
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
import { useVehicleStore } from '@/stores/vehicles';
import { useCustomerStore } from '@/stores/customers';
import { useAuthStore } from '@/stores/auth';

const vehicleStore = useVehicleStore();
const customerStore = useCustomerStore();
const authStore = useAuthStore();

const vehicles = computed(() => vehicleStore.vehicles);
const loading = computed(() => vehicleStore.loading);
const error = computed(() => vehicleStore.error);
const canManage = computed(() => authStore.canManageCustomers);
const allCustomers = computed(() => customerStore.customers);

const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const currentVehicleId = ref(null);

const form = ref({
  customerId: '',
  vin: '',
  year: new Date().getFullYear(),
  make: '',
  model: '',
  color: '',
  licensePlate: '',
  notes: ''
});

const resetForm = () => {
  form.value = {
    customerId: '',
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    color: '',
    licensePlate: '',
    notes: ''
  };
  currentVehicleId.value = null;
  isEditing.value = false;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const editVehicle = (vehicle) => {
  form.value = {
    customerId: vehicle.customer_id,
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    color: vehicle.color || '',
    licensePlate: vehicle.license_plate || '',
    notes: vehicle.notes || ''
  };
  currentVehicleId.value = vehicle.id;
  isEditing.value = true;
  showModal.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      await vehicleStore.updateVehicle(currentVehicleId.value, form.value);
    } else {
      await vehicleStore.createVehicle(form.value);
    }
    closeModal();
  } catch (err) {
    alert(err);
  } finally {
    submitting.value = false;
  }
};

const deleteVehicleConfirm = async (vehicle) => {
  if (confirm(`Delete vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
    try {
      await vehicleStore.deleteVehicle(vehicle.id);
    } catch (err) {
      alert(err);
    }
  }
};

onMounted(() => {
  vehicleStore.fetchVehicles();
  customerStore.fetchCustomers();
});
</script>
