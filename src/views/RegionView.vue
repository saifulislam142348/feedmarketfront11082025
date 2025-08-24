<template>
  <div class="p-6 mx-auto max-w-7xl">
    <h2 class="text-3xl font-bold mb-6">Market Report (Region)</h2>

    <!-- Filters component -->
    <FilterComponent v-model="filters" />

    <div class="overflow-x-auto border rounded shadow mt-4">
      <table class="min-w-full table-fixed border-collapse text-sm">
        <thead class="bg-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th class="border border-blue-700 px-4 py-2 w-1 text-left">SL</th>
            <th class="border border-blue-700 px-4 py-2 w-40 text-left">Company</th>
            <th class="border border-blue-700 px-4 py-2 w-36 text-left">Region</th>
            <th class="border border-blue-700 px-4 py-2 w-32 text-left">Month-Year</th>
            <th class="border border-blue-700 px-4 py-2 w-24 text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in flatData" :key="index" class="hover:bg-gray-100 transition-all">
            <td class="border border-gray-300 px-4 py-2 font-bold text-gray-700">{{ index + 1 }}</td>
            <td class="border border-gray-300 px-4 py-2 font-bold text-gray-700">{{ row.company_name }}</td>
            <td class="border border-gray-300 px-4 py-2 font-semibold text-gray-600">
              <RouterLink :to="{ path: '/area', query: { region: row.region } }" class="py-2 hover:underline">
                {{ row.region }}
              </RouterLink>
            </td>
            <td class="border border-gray-300 px-4 py-2 font-medium">
              {{ capitalize(row.month) }} - {{ row.year }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-right font-mono">
              {{ formatNumber(row.qty) }}
            </td>
          </tr>

          <tr v-if="flatData.length === 0">
            <td class="border border-gray-300 px-4 py-2 text-center" colspan="5">
              Loading Data....
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-2 mt-4">
      <button class="page-btn" :disabled="pagination.current_page === 1" @click="goToPage(pagination.current_page - 1)">
        Prev
      </button>

      <button v-for="page in pages" :key="page" class="page-btn"
        :class="{ 'bg-blue-600 text-white': page === pagination.current_page }" @click="goToPage(page)">
        {{ page }}
      </button>

      <button class="page-btn" :disabled="pagination.current_page === pagination.last_page"
        @click="goToPage(pagination.current_page + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import FilterComponent from '../components/filter/FilterComponent.vue'

const filters = ref({})
const data = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
})
const currentPage = ref(1)

// Helpers
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Fetch data from API with filters and page number
async function fetchData(page = 1) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters.value).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params.append(key, val)
      }
    })
    params.append('page', page)

    const url = `http://127.0.0.1:8000/api/market/region?${params}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const json = await response.json()
    // Update pagination info safely
    console.log('Pagination data:', json)
    pagination.value = {
      current_page: json.currentPage || 1,
      last_page: json.lastPage || 1,
    }

    // Set data based on API shape
    if (Array.isArray(json.nestedData)) {
      data.value = json.nestedData
    } else if (json && Array.isArray(json.data)) {
      data.value = json.data
    } else {
      data.value = []
    }
  } catch (error) {
    console.error('Fetch error:', error)
    data.value = []
  }
}

// Change page handler
function goToPage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    currentPage.value = page
  }
}

// Computed pages array for pagination buttons
const pages = computed(() => {
  const total = pagination.value.last_page || 1
  return Array.from({ length: total }, (_, i) => i + 1)
})

// Flatten nested data to simple rows for the table
const flatData = computed(() => {
  const result = []
  for (const company of data.value) {
    if (!company.regions) continue
    for (const region of company.regions) {
      if (!region.months) continue
      for (const month of region.months) {
        result.push({
          company_name: company.company_name || '',
          region: region.region || '',
          month: month.month || '',
          year: month.year || '',
          qty: month.do_qty || 0,
        })
      }
    }
  }
  return result
})

// Watch filters change, reset page to 1 and fetch new data
watch(filters, () => {
  currentPage.value = 1
  fetchData(1)
}, { deep: true })

// Watch currentPage change and fetch data for that page
watch(currentPage, (page) => {
  fetchData(page)
})

// Initial data fetch
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-btn {
  padding: 0.3rem 0.8rem;
  border-radius: 0.25rem;
  border: 1px solid #3b82f6;
  background-color: white;
  color: #3b82f6;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s, color 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #3b82f6;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
