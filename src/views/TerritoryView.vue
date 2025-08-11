<template>
    <div class="p-6 mx-auto max-w-7xl">
        <h2 class="text-3xl font-bold mb-6">
            Market Report (Territory)
        </h2>

        <FilterComponent v-model="filters" />

        <div class="overflow-x-auto border rounded shadow mt-4">
            <table class="min-w-full table-fixed border-collapse text-sm">
                <thead class="bg-blue-600 text-white sticky top-0 z-10">
                    <tr>
                        <th class="border border-blue-700 px-4 py-2 w-40 text-left">Company</th>
                        <th class="border border-blue-700 px-4 py-2 w-36 text-left">Region</th>
                        <th class="border border-blue-700 px-4 py-2 w-36 text-left">Area</th>
                        <th class="border border-blue-700 px-4 py-2 w-36 text-left">Territory</th>
                        <th class="border border-blue-700 px-4 py-2 w-32 text-left">Month-Year</th>
                        <th class="border border-blue-700 px-4 py-2 w-24 text-right">Qty</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, idx) in flatData" :key="idx" class="hover:bg-gray-100 transition-all">
                        <td class="border border-gray-300 px-4 py-2 font-bold text-gray-700">{{ row.company_name }}</td>
                        <td class="border border-gray-300 px-4 py-2 font-semibold text-gray-600">{{ row.region }}</td>
                        <td class="border border-gray-300 px-4 py-2 font-medium">{{ row.area }}</td>
                        <td class="border border-gray-300 px-4 py-2 font-medium">{{ row.territory }}</td>
                        <td class="border border-gray-300 px-4 py-2 font-medium">{{ capitalize(row.month) }} - {{
                            row.year }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right font-mono">{{ formatNumber(row.qty) }}
                        </td>
                    </tr>

                    <tr v-if="flatData.length === 0">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="6">
                            No data found.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import FilterComponent from '../components/filter/FilterComponent.vue'

const filters = ref({})
const data = ref([])

// Nested থেকে Flat ডেটা তৈরি
const flatData = computed(() => {
    const result = []
    for (const company of data.value) {
        if (!company.regions) continue
        for (const region of company.regions) {
            if (!region.areas) continue
            for (const area of region.areas) {
                if (!area.territories) continue
                for (const territory of area.territories) {
                    if (!territory.months) continue
                    for (const month of territory.months) {
                        result.push({
                            company_name: company.company_name,
                            region: region.region,
                            area: area.area,
                            territory: territory.territory,
                            month: month.month,
                            year: month.year,
                            qty: month.do_qty || 0,
                        })
                    }
                }
            }
        }
    }
    return result
})

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

async function fetchData() {
    try {
        const params = new URLSearchParams()
        Object.entries(filters.value).forEach(([key, val]) => {
            if (val) params.append(key, val)
        })

        const url = `https://feedend.bditfirm.com/api/market/territory?${params.toString()}`
        const response = await fetch(url)
        const json = await response.json()

        if (Array.isArray(json)) {
            data.value = json
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

watch(filters, fetchData, { deep: true })
onMounted(fetchData)
</script>

<style>
thead tr {
    position: sticky;
    top: 0;
    z-index: 10;
}
</style>
