<template>
    <div class="pb-4 pt-4 overflow-x-auto">
        <div class="flex flex-nowrap gap-1 min-w-max">
            <!-- Aman Business -->
            <el-select v-model="localFilters.amanBusiness" placeholder="Select Aman Business" clearable filterable
                class="w-48" @change="emitFilter">
                <el-option label="Select Aman Business" value="" />
                <el-option label="With Aman Business" value="with" />
                <el-option label="Without Aman Business" value="without" />
            </el-select>
            <el-select v-model="localFilters.zone" placeholder="Select Zone" filterable clearable class="w-48"
                @change="fetchRegions">
                <el-option label="Select Zone" />
                <el-option v-for="item in zones" :key="item" :label="item" :value="item" />
            </el-select>



            <el-select v-model="localFilters.region" placeholder="Select Region" filterable clearable class="w-48"
                @change="fetchAreas">
                <el-option label="Select Region" />
                <el-option v-for="item in regions" :key="item" :label="item" :value="item" />
            </el-select>

            <el-select v-model="localFilters.area" placeholder="Select Area" filterable clearable class="w-48"
                @change="fetchTerritories">
                <el-option label="Select Area" />
                <el-option v-for="item in areas" :key="item" :label="item" :value="item" />
            </el-select>

            <el-select v-model="localFilters.territory" placeholder="Select Territory" filterable clearable class="w-48"
                @change="fetchThanas">
                <el-option label="Select Territory " />
                <el-option v-for="item in territories" :key="item" :label="item" :value="item" />
            </el-select>
            <el-select v-model="localFilters.thana" placeholder="Select Thana" filterable clearable class="w-48"
                @change="fetchDealers">
                <el-option label="Select Thana " />
                <el-option v-for="item in thanas" :key="item" :label="item" :value="item" />
            </el-select>


            <el-select v-model="localFilters.dealer" placeholder="Select Dealer" filterable clearable class="w-48"
                @change="emitFilter">
                <el-option label="Select Dealer " />
                <el-option v-for="item in dealers" :key="item" :label="item" :value="item" />
            </el-select>
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

// Load Zones initially
axios.post('http://127.0.0.1:8000/api/market/market-zone').then(res => {
    zones.value = res.data
    fetchRegions()
    fetchAreas()
    fetchTerritories()
    fetchThanas()
    fetchDealers()
})


const fetchRegions = async () => {

    regions.value = []
    areas.value = []


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
