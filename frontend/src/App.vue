<template>
  <div id="app">
    <nav v-if="authStore.isAuthenticated" class="navbar">
      <div class="navbar-brand">
        <h1>A-OK Transmissions</h1>
      </div>
      <div class="navbar-menu">
        <router-link to="/" class="nav-item">Dashboard</router-link>
        <router-link to="/customers" class="nav-item">Customers</router-link>
        <router-link to="/vehicles" class="nav-item">Vehicles</router-link>
        <router-link to="/workorders" class="nav-item">Work Orders</router-link>
        <router-link to="/invoices" class="nav-item">Invoices</router-link>
        <router-link to="/reports" class="nav-item">Reports</router-link>
      </div>
      <div class="navbar-user">
        <span class="user-info">{{ authStore.user?.fullName }} ({{ authStore.user?.role }})</span>
        <button @click="handleLogout" class="btn btn-logout">Logout</button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style>
/* Main app styles are in assets/style.css */
</style>
