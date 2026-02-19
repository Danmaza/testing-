import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/pages/CustomersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('@/pages/VehiclesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workorders',
    name: 'WorkOrders',
    component: () => import('@/pages/WorkOrdersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workorders/:id',
    name: 'WorkOrderDetail',
    component: () => import('@/pages/WorkOrderDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: () => import('@/pages/InvoicesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/pages/ReportsPage.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
