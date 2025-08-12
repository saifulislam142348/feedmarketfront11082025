<template>
  <div class="p-6  mx-auto">
    <!-- Filter Controls -->
    <div class="mb-6">
      <div class="inline-flex flex-wrap gap-4 items-center">
        <!-- Navigation -->
        <router-link to="/sale-quantity"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-xl shadow-md transition text-sm font-semibold">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 17v-6h13M3 17h6m-6 0v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
          </svg>
          Sale Person Wise Monthly Qty
        </router-link>

        <router-link to="/distributor-quantity"
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-5 rounded-xl shadow-md transition text-sm font-semibold">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h4l3-3 3 3h4v10H3z" />
          </svg>
          Distributor Wise Monthly Qty
        </router-link>

        <!-- Year Dropdown -->
        <div class="flex items-center gap-4">
          <!-- Year Dropdown -->
          <el-select v-model="year" placeholder="Select Year" clearable filterable @change="fetchData" class="w-32">
            <el-option :value="null" label="All Years" />
            <el-option v-for="y in availableYears" :key="y" :label="y.toString()" :value="y" />
          </el-select>

          <!-- Month Dropdown -->
          <el-select v-model="agent" placeholder="Select Distributor" clearable filterable @change="fetchData"
            class="w-32">
            <el-option :value="null" label="All Distributor" />
            <el-option v-for="m in distributors" :key="m.name" :label="m.name" :value="m.name" />
          </el-select>

          <!-- Zone Dropdown -->
          <el-select v-model="sales_officer" placeholder="Select Sales" clearable filterable @change="fetchData"
            class="w-32">
            <el-option :value="null" label="All Sales Person" />
            <el-option v-for="z in saleOfficers" :key="z" :label="z" :value="z" />
          </el-select>
        </div>


      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border rounded shadow">
      <table class="min-w-full table-fixed border-collapse text-sm">
        <thead class="bg-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th class="px-4 py-2 border border-blue-700 text-left">SL</th>
            <th class="px-4 py-2 border border-blue-700 text-left">Sale Person</th>
            <th class="px-4 py-2 border border-blue-700 text-center">Year</th>
            <th v-for="month in months" :key="month" class="px-4 py-2 border border-blue-700 text-center capitalize">
              {{ month }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="row.sales_officer + '-' + row.year"
            :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">

            <td class="px-4 py-2 border border-gray-300 font-semibold text-gray-800">{{ index + 1 }}</td>
            <td class="px-4 py-2 border border-gray-300 font-semibold text-gray-800">{{ row.sales_officer ?? "Sales Person" }}</td>
            <td class="px-4 py-2 border border-gray-300 text-center">{{ row.year }}</td>
            <td v-for="month in months" :key="month" class="px-4 py-2 border border-gray-300 text-right font-mono">
              {{ formatNumber(row.months[month]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const data = ref([])
const distributors = ref([])
const saleOfficers = ref([])
const agent = ref(null)
const sales_officer = ref(null)

const year = ref(null)
const availableYears = [2022, 2023, 2024, 2025]
import { ElSelect, ElOption } from 'element-plus' // optional if using `<script setup>`

const months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]

function formatNumber(value) {
  return value?.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) || '0'
}


const fetchPersons = async () => {
  // Reset before fetching
  distributors.value = []
  saleOfficers.value = []

  try {
    // Fetch distributor & salesperson lists in parallel
    const [proNames, salesNames] = await Promise.all([
      axios.post('http://127.0.0.1:8000/api/market/distributor_name-by-territory'),
      axios.post('http://127.0.0.1:8000/api/market/sales_officer-by-territory'),
    ])

    distributors.value = proNames.data || []
    saleOfficers.value = salesNames.data || []

    // If you want to preselect the first item:
    // agent.value = distributors.value[0] || null
    // selectedSalesperson.value = saleOfficers.value[0] || null

  } catch (error) {
    console.error('Error fetching persons:', error)
    distributors.value = []
    saleOfficers.value = []
  }
}

async function fetchData() {
  try {
    const params = new URLSearchParams()
    if (year.value) params.append('year', year.value)
    if (agent.value) params.append('agent', agent.value)
    if (sales_officer.value) params.append('sales_officer', sales_officer.value)

    const query = params.toString()
    const url = `http://127.0.0.1:8000/api/market/sale-person-wise-monthly-saleQty${query ? `?${query}` : ''}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

    const json = await res.json()
    data.value = json || []
  } catch (e) {
    console.error('Failed to fetch data:', e)
    data.value = []
  }
}


onMounted(fetchPersons)
onMounted(fetchData)
</script>

<style scoped>
th,
td {
  white-space: nowrap;
}
</style>
