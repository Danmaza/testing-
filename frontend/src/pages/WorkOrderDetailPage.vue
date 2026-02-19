<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Work Order Detail</h1>
      <router-link to="/workorders">
        <button class="btn btn-secondary">← Back to Work Orders</button>
      </router-link>
    </div>
    
    <div v-if="loading" class="loading">Loading work order...</div>
    
    <div v-else-if="workOrder">
      <div class="card">
        <div class="card-header">Work Order {{ workOrder.work_order_number }}</div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div>
              <strong>Status:</strong>
              <span :class="`badge badge-${workOrder.status.toLowerCase()}`" style="margin-left: 0.5rem;">
                {{ workOrder.status }}
              </span>
            </div>
            <div><strong>Mileage:</strong> {{ workOrder.mileage || 'Not recorded' }}</div>
            <div><strong>Customer:</strong> {{ workOrder.first_name }} {{ workOrder.last_name }}</div>
            <div><strong>Vehicle:</strong> {{ workOrder.year }} {{ workOrder.make }} {{ workOrder.model }}</div>
            <div><strong>VIN:</strong> {{ workOrder.vin }}</div>
            <div><strong>Created:</strong> {{ new Date(workOrder.created_at).toLocaleString() }}</div>
          </div>
          <div v-if="workOrder.description" style="margin-top: 1rem;">
            <strong>Description:</strong>
            <p>{{ workOrder.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">Service Lines</div>
        <div class="card-body">
          <div v-if="workOrder.serviceLines && workOrder.serviceLines.length > 0">
            <div v-for="line in workOrder.serviceLines" :key="line.id" style="border-bottom: 1px solid #ddd; padding: 1rem 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>{{ line.description }}</strong>
                  <span :class="`badge badge-${line.status.toLowerCase()}`" style="margin-left: 0.5rem;">
                    {{ line.status }}
                  </span>
                </div>
                <div>
                  Rate: ${{ line.labor_rate }}/hr | Est: {{ line.estimated_hours }}hrs
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center" style="padding: 2rem; color: #999;">
            No service lines added yet
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">Parts Used</div>
        <div class="card-body">
          <div v-if="workOrder.parts && workOrder.parts.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="part in workOrder.parts" :key="part.id">
                  <td>{{ part.part_number }}</td>
                  <td>{{ part.description }}</td>
                  <td>{{ part.quantity }}</td>
                  <td>${{ part.cost_at_time_of_use }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center" style="padding: 2rem; color: #999;">
            No parts used yet
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">Assigned Mechanics</div>
        <div class="card-body">
          <div v-if="workOrder.mechanics && workOrder.mechanics.length > 0">
            <div v-for="mechanic in workOrder.mechanics" :key="mechanic.id" style="margin-bottom: 0.5rem;">
              {{ mechanic.full_name }} ({{ mechanic.username }})
            </div>
          </div>
          <div v-else class="text-center" style="padding: 2rem; color: #999;">
            No mechanics assigned yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useWorkOrderStore } from '@/stores/workorders';

const route = useRoute();
const workOrderStore = useWorkOrderStore();

const workOrder = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    workOrder.value = await workOrderStore.fetchWorkOrder(route.params.id);
  } catch (error) {
    console.error('Failed to load work order:', error);
  } finally {
    loading.value = false;
  }
});
</script>
