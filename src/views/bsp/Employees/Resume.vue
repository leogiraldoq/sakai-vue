<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { ref, onBeforeMount } from 'vue';

import EmployeesService from '@/service/EmployeesService';
import MessageService from '@/service/MessageService';

const employees = ref(null);
const filtersEmployees = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        names: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        title: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });
const loading = ref(true);

const employeesService = new EmployeesService();
const messageService = new MessageService();

onBeforeMount(async () => {
    await employeesService.listAll().then((data) => (employees.value = data.data));
    loading.value=false;
});

const initFilters = () => {
    filtersEmployees.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        names: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        title: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    };
};

const clearFilter = () => {
    initFilters();
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Employees</h5>
                <DataTable
                    :value="employees"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :rows="10"
                    dataKey="id_employee"
                    :rowHover="true"
                    v-model:filters="filtersEmployees"
                    filterDisplay="menu"
                    :loading="loading"
                    :filters="filtersEmployees"
                    responsiveLayout="scroll"
                    :globalFilterFields="['names']"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2" @click="clearFilter()" size="small"/>
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filtersEmployees['global'].value" placeholder="Keyword Search" style="width: 100%" />
                            </span>
                        </div>
                    </template>
                    <template #empty> No employees found. </template>
                    <template #loading> Loading employees data. Please wait. </template>
                    
                    <Column field="names" header="Names" filterField="names" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.names }} {{ data.last_names }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by names" />
                        </template>
                    </Column>
                    
                    <Column header="Title" filterField="title" style="min-width: 7rem">
                        <template #body="{ data }">
                            {{ data.title }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by title" />
                        </template>
                        <template #filterclear="{ filterCallback }">
                            <Button type="button" icon="pi pi-times" @click="filterCallback()" class="p-button-secondary"></Button>
                        </template>
                        <template #filterapply="{ filterCallback }">
                            <Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
                        </template>
                    </Column>
                    
                    <Column header="Phone" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.phone }}
                        </template>
                    </Column>
                    
                    <Column header="Email" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.email }}
                        </template>
                    </Column>

                    <Column header="User" filterField="users.username" style="min-width: 8rem">
                        <template #body="{ data }">
                            <slot v-if='data.user'>
                                {{data.user.username}}
                            </slot>
                            <slot v-else> <p class='text-red-500'>No user create</p></slot>
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" />
                        </template>
                    </Column>
                    
                    <Column field="status" header="Status" :filterMenuStyle="{ width: '12rem' }" style="min-width: 5rem">
                        <template #body="{ data }" class='text-bold align-content-center'>
                            <slot v-if='data.active == 1'>
                                <i class="pi pi-check-circle text-green-900"></i>
                            </slot>
                            <slot v-if='data.active == 0'>
                                <i class="pi pi-times-circle text-red-900"></i>
                            </slot>
                        </template>
                        <template #filter="{ filterModel }">
                            <Dropdown v-model="filterModel.value" :options="statuses" placeholder="Any" class="p-column-filter" :showClear="true">
                                <template #value="slotProps">
                                    <span :class="'customer-badge status-' + slotProps.value" v-if="slotProps.value">{{ slotProps.value }}</span>
                                    <span v-else>{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <span :class="'customer-badge status-' + slotProps.option">{{ slotProps.option }}</span>
                                </template>
                            </Dropdown>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

::v-deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
