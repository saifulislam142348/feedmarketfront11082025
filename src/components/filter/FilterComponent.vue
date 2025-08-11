<template>
  <div class="pb-4 pt-4 overflow-x-auto">
    <div class="flex flex-nowrap gap-4 min-w-max">

      <!-- Year -->
      <el-select v-model="localFilters.month" placeholder="Select Month Year" filterable class="w-48"
        @change="fetchMonths">
        <el-option label="Select MonthYear" value="" />
        <el-option v-for="item in months" :key="item.month" :label="item.month + '-' + item.year" :value="item.month" />
      </el-select>

      <!-- Company -->
      <el-select v-model="localFilters.company" placeholder="Select Company" filterable class="w-48"
        @change="fetchRegions">
        <el-option label="Select Company" />
        <el-option v-for="item in companies" :key="item" :label="item" :value="item" />
      </el-select>



      <!-- Region -->
      <el-select v-model="localFilters.region" placeholder="Select Region" filterable class="w-48" @change="fetchAreas">
        <el-option label="Select Region" />
        <el-option v-for="item in regions" :key="item" :label="item" :value="item" />
      </el-select>

      <!-- Area -->
      <el-select v-model="localFilters.area" placeholder="Select Area" filterable class="w-48"
        @change="fetchTerritories">
        <el-option label="Select territory" />
        <el-option v-for="item in areas" :key="item" :label="item" :value="item" />
      </el-select>

      <!-- Territory -->
      <el-select v-model="localFilters.territory" placeholder="Select Territory" filterable class="w-48"
        @change="fetchPersons">
        <el-option label="Select Territory" />
        <el-option v-for="item in territories" :key="item" :label="item" :value="item" />
      </el-select>


      <!-- SP Name -->
      <el-select v-model="localFilters.agent" placeholder="Select proprietor_name" filterable class="w-48"
        @change="emitFilter">
        <el-option label="Select Proprieter" />
        <el-option v-for="item in distributors" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>

      <!-- Distributor -->
      <el-select v-model="localFilters.sales_officer" placeholder="Select sales_officer" filterable class="w-48"
        @change="emitFilter">
        <el-option label="Select Sales Officer" />
        <el-option v-for="item in saleOfficers" :key="item" :label="item" :value="item" />
      </el-select>
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
axios.post('https://feedend.bditfirm.com/api/market/marketsetup-month').then(res => {
  months.value = res.data
  if (months.value.length > 0) {
    localFilters.month = months.value[0].month
  }

  emitFilter()
})

// Initial load
axios.post('https://feedend.bditfirm.com/api/market/company-data').then(res => {
  companies.value = res.data
  localFilters.company = companies.value[0] || ''
  localFilters.region = ''
  localFilters.area = ''
  localFilters.territory = ''
  localFilters.sales_officer = ''
  localFilters.proprietor_name = ''
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
  localFilters.region = ''
  regions.value = []

  const res = await axios.post('https://feedend.bditfirm.com/api/market/region-by-company', { company_name: localFilters.company })
  regions.value = res.data

  emitFilter()
}

const fetchAreas = async () => {
  localFilters.area = ''
  areas.value = []

  const res = await axios.post('https://feedend.bditfirm.com/api/market/area-by-region', { region: localFilters.region })
  areas.value = res.data

  emitFilter()
}

const fetchTerritories = async () => {
  localFilters.territory = ''
  territories.value = []

  const res = await axios.post('https://feedend.bditfirm.com/api/market/territory-by-area', { area: localFilters.area })
  territories.value = res.data

  emitFilter()
}



const fetchPersons = async () => {
  distributors.value = []
  saleOfficers.value = []

  try {
    const [proNames, salesNames] = await Promise.all([
      axios.post('https://feedend.bditfirm.com/api/market/distributor_name-by-territory', { territory: localFilters.territory }),
      axios.post('https://feedend.bditfirm.com/api/market/sales_officer-by-territory', { territory: localFilters.territory }),
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
