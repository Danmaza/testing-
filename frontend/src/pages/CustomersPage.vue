<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Customers</h1>
      <button v-if="canManage" @click="showModal = true" class="btn btn-success">
        + New Customer
      </button>
    </div>
    
    <div class="search-bar">
      <input
        v-model="searchTerm"
        @input="handleSearch"
        type="text"
        placeholder="Search customers..."
        class="search-input"
      />
    </div>
    
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading customers...</div>
    
    <div v-else-if="customers.length === 0" class="empty-state">
      <div class="empty-state-text">No customers found</div>
      <button v-if="canManage" @click="showModal = true" class="btn btn-primary">
        Add First Customer
      </button>
    </div>
    
    <div v-else class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City, State</th>
            <th v-if="canManage">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>{{ customer.first_name }} {{ customer.last_name }}</td>
            <td>{{ customer.email || '-' }}</td>
            <td>{{ customer.phone || '-' }}</td>
            <td>{{ customer.city }}, {{ customer.state }}</td>
            <td v-if="canManage" class="table-actions">
              <button @click="editCustomer(customer)" class="btn btn-primary">Edit</button>
              <button @click="deleteCustomerConfirm(customer)" class="btn btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Customer Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">{{ isEditing ? 'Edit Customer' : 'New Customer' }}</div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name *</label>
              <input v-model="form.firstName" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Last Name *</label>
              <input v-model="form.lastName" type="text" class="form-input" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input v-model="form.phone" type="tel" class="form-input" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Address</label>
            <input v-model="form.address" type="text" class="form-input" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">City</label>
              <input v-model="form.city" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input v-model="form.state" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Zip Code</label>
              <input v-model="form.zipCode" type="text" class="form-input" />
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
import { useCustomerStore } from '@/stores/customers';
import { useAuthStore } from '@/stores/auth';

const customerStore = useCustomerStore();
const authStore = useAuthStore();

const customers = computed(() => customerStore.customers);
const loading = computed(() => customerStore.loading);
const error = computed(() => customerStore.error);
const canManage = computed(() => authStore.canManageCustomers);

const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const searchTerm = ref('');
const currentCustomerId = ref(null);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: ''
});

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  };
  currentCustomerId.value = null;
  isEditing.value = false;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const editCustomer = (customer) => {
  form.value = {
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    zipCode: customer.zip_code || '',
    notes: customer.notes || ''
  };
  currentCustomerId.value = customer.id;
  isEditing.value = true;
  showModal.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      await customerStore.updateCustomer(currentCustomerId.value, form.value);
    } else {
      await customerStore.createCustomer(form.value);
    }
    closeModal();
  } catch (err) {
    console.error('Failed to save customer:', err);
  } finally {
    submitting.value = false;
  }
};

const deleteCustomerConfirm = async (customer) => {
  if (confirm(`Delete customer ${customer.first_name} ${customer.last_name}?`)) {
    try {
      await customerStore.deleteCustomer(customer.id);
    } catch (err) {
      alert(err);
    }
  }
};

const handleSearch = () => {
  customerStore.fetchCustomers(searchTerm.value);
};

onMounted(() => {
  customerStore.fetchCustomers();
});
</script>
