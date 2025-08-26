<template>
  <div class="pb-4 pt-4 overflow-x-auto">
    <div class="flex flex-nowrap gap-1 min-w-max">

      <!-- Month - Year -->
      <div class="flex flex-col w-48">
        <label for="monthYear" class="text-sm font-medium text-gray-700">Month - Year</label>
        <el-select id="monthYear" v-model="localFilters.month" placeholder="Select Month - Year" filterable
          clearable class="w-full" @change="fetchMonths">
          <el-option v-for="item in months" :key="`${item.month}-${item.year}`"
            :label="`${item.month}-${item.year}`" :value="item.month" />
        </el-select>
      </div>

      <!-- Aman Business -->
      <div class="flex flex-col w-48">
        <label for="amanBusiness" class="text-sm font-medium text-gray-700">Aman Business</label>
        <el-select id="amanBusiness" v-model="localFilters.amanBusiness" placeholder="Select Aman Business"
          clearable filterable class="w-full" @change="emitFilter">
          <el-option label="Select Aman Business" value="" />
          <el-option label="With Aman Business" value="with" />
          <el-option label="Without Aman Business" value="without" />
        </el-select>
      </div>

      <!-- Zone -->
      <div class="flex flex-col w-48">
        <label for="zone" class="text-sm font-medium text-gray-700">Zone</label>
        <el-select id="zone" v-model="localFilters.zone" placeholder="Select Zone" filterable clearable
          class="w-full" @change="fetchRegions">
          <el-option v-for="item in zones" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Region -->
      <div class="flex flex-col w-48">
        <label for="region" class="text-sm font-medium text-gray-700">Region</label>
        <el-select id="region" v-model="localFilters.region" placeholder="Select Region" filterable clearable
          class="w-full" @change="fetchAreas">
          <el-option v-for="item in regions" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Area -->
      <div class="flex flex-col w-48">
        <label for="area" class="text-sm font-medium text-gray-700">Area</label>
        <el-select id="area" v-model="localFilters.area" placeholder="Select Area" filterable clearable
          class="w-full" @change="fetchTerritories">
          <el-option v-for="item in areas" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Territory -->
      <div class="flex flex-col w-48">
        <label for="territory" class="text-sm font-medium text-gray-700">Territory</label>
        <el-select id="territory" v-model="localFilters.territory" placeholder="Select Territory" filterable
          clearable class="w-full" @change="fetchThanas">
          <el-option v-for="item in territories" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Thana -->
      <div class="flex flex-col w-48">
        <label for="thana" class="text-sm font-medium text-gray-700">Thana</label>
        <el-select id="thana" v-model="localFilters.thana" placeholder="Select Thana" filterable clearable
          class="w-full" @change="fetchDealers">
          <el-option v-for="item in thanas" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <!-- Dealer -->
      <div class="flex flex-col w-48">
        <label for="dealer" class="text-sm font-medium text-gray-700">Dealer</label>
        <el-select id="dealer" v-model="localFilters.dealer" placeholder="Select Dealer" filterable clearable
          class="w-full" @change="emitFilter">
          <el-option v-for="item in dealers" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'

// Props & Emits
const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            year: '', zone: '',
            region: '', area: '', territory: '', thana: '',
            dealer: '', month: '', amanBusiness: ''
        }),
    },
})
const emit = defineEmits(['update:modelValue'])

const localFilters = reactive({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
    Object.assign(localFilters, newVal)
})

function emitFilter() {
    emit('update:modelValue', { ...localFilters })
}

// Dropdown data
const zones = ref([])
const regions = ref([])
const areas = ref([])
const territories = ref([])
const thanas = ref([])
const dealers = ref([])
const months = ref([])

// Load Date initially
axios.get('http://127.0.0.1:8000/api/market/market-share-month').then(res => {
    months.value = res.data


    emitFilter()
})
// Load Zones initially
axios.post('http://127.0.0.1:8000/api/market/market-zone').then(res => {
    zones.value = res.data
    fetchRegions()
    fetchAreas()
    fetchTerritories()
    fetchThanas()
    fetchDealers()
})

// Fetch functions (always reset child + emit)
const fetchMonths = async () => {
    emitFilter()
}


const fetchRegions = async () => {

    regions.value = []


    const res = await axios.post('http://127.0.0.1:8000/api/market/market-region-by-zone', { zone: localFilters.zone })
    regions.value = res.data

    emitFilter()
}

const fetchAreas = async () => {

    areas.value = []
    territories.value = []




    const res = await axios.post('http://127.0.0.1:8000/api/market/market-area-by-region', { region: localFilters.region })
    areas.value = res.data

    emitFilter()
}

const fetchTerritories = async () => {

    territories.value = []
    thanas.value = []
    dealers.value = []


    const res = await axios.post('http://127.0.0.1:8000/api/market/market-territory-by-area', { area: localFilters.area })
    territories.value = res.data

    emitFilter()
}

const fetchThanas = async () => {
    localFilters.thana = ''
    localFilters.dealer = ''
    thanas.value = []
    dealers.value = []


    const res = await axios.post('http://127.0.0.1:8000/api/market/market-thana-by-territory', { territory: localFilters.territory })
    thanas.value = res.data

    emitFilter()
}

const fetchDealers = async () => {
    localFilters.dealer = ''
    dealers.value = []
    const res = await axios.post('http://127.0.0.1:8000/api/market/market-retailer-by-thana', { thana: localFilters.thana })
    dealers.value = res.data

    emitFilter()
}
</script>
