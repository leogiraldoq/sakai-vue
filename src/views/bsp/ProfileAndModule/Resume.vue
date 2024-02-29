v<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { ref, onBeforeMount } from 'vue';
import ProfilesModulesService from '@/service/ProfilesModulesService';

//Init Services
const profilemodulesservice = new ProfilesModulesService();

const profilesModules = ref(null);
const expandedRows = ref([]);

onBeforeMount(() => {
    profilemodulesservice.getAllProfiles().then((data) => (profilesModules.value = data.data));
});

const expandAll = () => {
    expandedRows.value = profilemodulesservice.value.filter((pm) => pm.id_profile);
};
const collapseAll = () => {
    expandedRows.value = null;
};

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Profiles & Modules permissions</h5>
                <DataTable 
                    :value="profilesModules" 
                    v-model:expandedRows="expandedRows" 
                    dataKey="id_profile" 
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div>
                            <Button icon="pi pi-plus" label="Expand All" @click="expandAll" class="mr-2 mb-2" size="small"/>
                            <Button icon="pi pi-minus" label="Collapse All" @click="collapseAll" class="mb-2" size="small"/>
                        </div>
                    </template>
                    <Column :expander="true" headerStyle="min-width: 3rem" />
                    <Column field="name" header="Profiles" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="profile_description" header="Description" :sortable="false">
                        <template #body="slotProps">
                            {{ slotProps.data.description }}
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <div class="p-2">
                            <p class="text-bold">Can access to modules:</p>
                            <DataTable :value="slotProps.data.modules" responsiveLayout="scroll">
                                <Column field="module_name" header="Module" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.module_name }}
                                    </template>
                                </Column>
                                <Column field="create" header="Create">
                                    <template #body="slotProps">
                                        <slot v-if='slotProps.data.pivot.create == 1'>
                                            <i class="pi pi-check-circle text-green-900"></i>
                                        </slot>
                                        <slot v-if='slotProps.data.pivot.create == 0'>
                                            <i class="pi pi-times-circle text-red-900"></i>
                                        </slot>
                                    </template>
                                </Column>
                                <Column field="update" header="Update">
                                    <template #body="slotProps">
                                        <slot v-if='slotProps.data.pivot.update == 1'>
                                            <i class="pi pi-check-circle text-green-900"></i>
                                        </slot>
                                        <slot v-if='slotProps.data.pivot.update == 0'>
                                            <i class="pi pi-times-circle text-red-900"></i>
                                        </slot>
                                    </template>
                                </Column>
                                <Column field="read" header="Read">
                                    <template #body="slotProps">
                                        <slot v-if='slotProps.data.pivot.read == 1'>
                                            <i class="pi pi-check-circle text-green-900"></i>
                                        </slot>
                                        <slot v-if='slotProps.data.pivot.read == 0'>
                                            <i class="pi pi-times-circle text-red-900"></i>
                                        </slot>
                                    </template>
                                </Column>
                                <Column field="delete" header="Delete">
                                    <template #body="slotProps">
                                        <slot v-if='slotProps.data.pivot.delete == 1'>
                                            <i class="pi pi-check-circle text-green-900"></i>
                                        </slot>
                                        <slot v-if='slotProps.data.pivot.delete == 0'>
                                            <i class="pi pi-times-circle text-red-900"></i>
                                        </slot>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </template>
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
