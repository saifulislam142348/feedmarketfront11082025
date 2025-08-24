<template>
  <div class="pb-4 pt-4 overflow-x-auto">
    <div class="flex flex-nowrap gap-4 min-w-max">

      <!-- Month - Year -->
      <div class="flex flex-col w-48">
        <label for="monthYear" class="text-sm font-medium text-gray-700">Month - Year</label>
        <el-select id="monthYear" v-model="localFilters.month" placeholder="Select Month Year"
          filterable clearable class="w-full" @change="fetchMonths">
          <el-option label="Select MonthYear" value="" />
          <el-option v-for="item in months" :key="item.month"
            :label="item.month + '-' + item.year" :value="item.month" />
        </el-select>
      </div>

      <!-- Company -->
      <div class="flex flex-col w-48">
        <label for="company" class="text-sm font-medium text-gray-700">Company</label>
        <el-select id="company" v-model="localFilters.company" placeholder="Select Company"
          filterable clearable class="w-full" @change="fetchRegions">
          <el-option label="Select Company" />
          <el-option v-for="item in companies" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Region -->
      <div class="flex flex-col w-48">
        <label for="region" class="text-sm font-medium text-gray-700">Region</label>
        <el-select id="region" v-model="localFilters.region" placeholder="Select Region"
          filterable clearable class="w-full" @change="fetchAreas">
          <el-option label="Select Region" />
          <el-option v-for="item in regions" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Area -->
      <div class="flex flex-col w-48">
        <label for="area" class="text-sm font-medium text-gray-700">Area</label>
        <el-select id="area" v-model="localFilters.area" placeholder="Select Area"
          filterable clearable class="w-full" @change="fetchTerritories">
          <el-option label="Select Area" />
          <el-option v-for="item in areas" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Territory -->
      <div class="flex flex-col w-48">
        <label for="territory" class="text-sm font-medium text-gray-700">Territory</label>
        <el-select id="territory" v-model="localFilters.territory" placeholder="Select Territory"
          filterable clearable class="w-full" @change="fetchPersons">
          <el-option label="Select Territory" />
          <el-option v-for="item in territories" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Proprietor Name -->
      <div class="flex flex-col w-48">
        <label for="proprietor" class="text-sm font-medium text-gray-700">Proprietor</label>
        <el-select id="proprietor" v-model="localFilters.agent" placeholder="Select Proprietor"
          filterable clearable class="w-full" @change="emitFilter">
          <el-option label="Select Proprietor" />
          <el-option v-for="item in distributors" :key="item.name" :label="item.name" :value="item.name" />
        </el-select>
      </div>

      <!-- Sales Officer -->
      <div class="flex flex-col w-48">
        <label for="salesOfficer" class="text-sm font-medium text-gray-700">Sales Officer</label>
        <el-select id="salesOfficer" v-model="localFilters.sales_officer" placeholder="Select Sales Officer"
          filterable clearable class="w-full" @change="emitFilter">
          <el-option label="Select Sales Officer" />
          <el-option v-for="item in saleOfficers" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'

// Props + Emits

const years = [2022, 2023, 2024, 2025]

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      year: '', company: '',
      region: '', area: '', territory: '', sales_officer: '', agent: '', month: ''
    }),
  },
})
const emit = defineEmits(['update:modelValue'])

// Reactive local copy
const localFilters = reactive({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  Object.assign(localFilters, newVal)
})

// Emit whenever changed
function emitFilter() {
  emit('update:modelValue', { ...localFilters })
}

// Dropdowns
const months = ref([])
const companies = ref([])
const regions = ref([])
const areas = ref([])
const territories = ref([])
const saleOfficers = ref([])
const distributors = ref([])

// Load Date initially
axios.post('http://127.0.0.1:8000/api/market/marketsetup-month').then(res => {
  months.value = res.data
  if (months.value.length > 0) {
    localFilters.month = months.value[0].month
  }

  emitFilter()
})

// Initial load
axios.post('http://127.0.0.1:8000/api/market/company-data').then(res => {
  companies.value = res.data
  localFilters.company = companies.value[0] || ''
  emitFilter()
  fetchRegions()
  fetchAreas()
  fetchTerritories()
  fetchPersons()
}).catch(err => {
  console.error('Error fetching companies:', err)
  companies.value = []
  regions.value = []
  areas.value = []
  territories.value = []

  saleOfficers.value = []
  distributors.value = []
  emitFilter()

})

const fetchMonths = async () => {


  emitFilter()
}


const fetchRegions = async () => {

  regions.value = []

  const res = await axios.post('http://127.0.0.1:8000/api/market/region-by-company', { company_name: localFilters.company })
  regions.value = res.data

  emitFilter()
}

const fetchAreas = async () => {

  areas.value = []

  const res = await axios.post('http://127.0.0.1:8000/api/market/area-by-region', { region: localFilters.region })
  areas.value = res.data

  emitFilter()
}

const fetchTerritories = async () => {

  territories.value = []

  const res = await axios.post('http://127.0.0.1:8000/api/market/territory-by-area', { area: localFilters.area })
  territories.value = res.data

  emitFilter()
}



const fetchPersons = async () => {
  distributors.value = []
  saleOfficers.value = []

  try {
    const [proNames, salesNames] = await Promise.all([
      axios.post('http://127.0.0.1:8000/api/market/distributor_name-by-territory', { territory: localFilters.territory }),
      axios.post('http://127.0.0.1:8000/api/market/sales_officer-by-territory', { territory: localFilters.territory }),
    ])

    distributors.value = proNames.data
    saleOfficers.value = salesNames.data

    emitFilter()
  } catch (error) {
    console.error('Error fetching persons:', error)
    // Optionally reset arrays or show user error
    distributors.value = []
    saleOfficers.value = []
  }
}

</script>
