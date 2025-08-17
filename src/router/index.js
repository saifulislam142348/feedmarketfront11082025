import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        title: 'dashboard - Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/region',
      name: 'Region',
      component: () => import('../views/RegionView.vue'),
      meta: {
        title: 'Region - Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/area',
      name: 'Area',
      component: () => import('../views/AreaView.vue'),
      meta: {
        title: 'Area- Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/territory',
      name: 'Territory',
      component: () => import('../views/TerritoryView.vue'),
      meta: {
        title: 'Territory- Aman Group Ltd.',
        requiresAuth: true
      }
    },

    {
      path: '/sale-quantity',
      name: 'saleQty',
      component: () => import('../views/saleQtyView.vue'),
      meta: {
        title: 'SpName- Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/distributor-quantity',
      name: 'DistributorQty',
      component: () => import('../views/DistributorQty.vue'),
      meta: {
        title: 'SpName- Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/distributor-name',
      name: 'distributorName',
      component: () => import('../views/DistributorView.vue'),
      meta: {
        title: 'Distributor- Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/sales-officer',
      name: 'salesOfficer',
      component: () => import('../views/SpNameView.vue'),
      meta: {
        title: 'Distributor- Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/sales-officer-graph',
      name: 'salesOfficerGraph',
      component: () => import('../views/SalesOfficerGraph.vue'),
      meta: {
        title: 'Distributor- Aman Group Ltd.',
        requiresAuth: true
      }
    },
    {
      path: '/import',
      name: 'importJson',
      component: () => import('../components/ImportJson.vue'),
      meta: {
        title: 'Import - Aman Group Ltd.',
        requiresAuth: true // Add this to routes that need auth
      }
    },{
      path: '/import-graph',
      name: 'importGraphJson',
      component: () => import('../components/ImportGraphJson.vue'),
      meta: {
        title: 'Import - Aman Group Ltd.',
        requiresAuth: true // Add this to routes that need auth
      }
    }
  ],
})



router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  document.title = to.meta.title || 'Aman Group Ltd.'

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && auth.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})
export default router
