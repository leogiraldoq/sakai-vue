<script setup>
    import { ref, reactive, computed, onBeforeMount } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength, maxLength, email } from '@vuelidate/validators';
    import { FilterMatchMode } from 'primevue/api';
    import { useRouter } from 'vue-router';
    
    import MessageService from '@/service/MessageService';
    import PickUpCompaniesService from '@/service/PickUpCompaniesService';
    
    const router = useRouter();
    const pickupcompanyservice = new PickUpCompaniesService();
    const pickUpCompany = ref(null);
    const filtersPickupTable = ref(null);
    const loading = ref(true);
    
    const initFilters = () =>{
        filtersPickupTable.value = {
            global: { value:null, matchMode: FilterMatchMode.CONTAINS },
            name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            status: { value:null, matchMode: FilterMatchMode.EQUALS},
        };
    };
    
    onBeforeMount(()=>{
        initFilters();
        getPickUpCompanies();
    });

    async function getPickUpCompanies(){
        await pickupcompanyservice.getList().then((data) => {
            loading.value = false;
            pickUpCompany.value = data.data;
        });

    }

    const formPickUpCompanyCreate = reactive({
        name: '',
    });
    
    const rulesPickUpCompanyCreate = computed( () => ({
        name: { required, minLength: minLength(2), maxLength: maxLength(20) }
    }));
    const vPickUpCreate$ = useVuelidate(rulesPickUpCompanyCreate,formPickUpCompanyCreate);
    
    async function createPickUpCompany(){
        const messageservice = new MessageService();
        try{
            const validationPickUpCreate = await vPickUpCreate$.value.$validate();
            if(!validationPickUpCreate){
                return;
            }
            let newPickUpCompany = await pickupcompanyservice.create(formPickUpCompanyCreate);
            await messageservice.successMessageSimple(newPickUpCompany.message,"Ok!");
            pickUpCompany.value.push(newPickUpCompany.data);
            Object.assign(formPickUpCompanyCreate,{
               name: '' 
            });
        }catch(e){
            messageservice.errorMessage(e);
        }
    }
    
</script>

<template>
    <div class="grid">
        <div class="col-12 md:col-6">
            <Card>
                <template #title>Pick-up Companies</template>
                <template #content>
                    <DataTable 
                        v-model:filters="filtersPickupTable" 
                        :value="pickUpCompany" 
                        paginator 
                        :rows="4"
                        showGridlines
                        dataKey="id_pick_up_company" 
                        :loading="loading"
                        :globalFilterFields="['name']"
                    >
                        <template #header>
                            <div class="flex justify-content-start">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search"/>
                                    <InputText v-model="filtersPickupTable['global'].value" placeholder="Keyword search" class=" w-full" />
                                </span>
                            </div>
                        </template>
                        <template #empty> No pick-up companies found.</template>
                        <template #loading>Loading pick-up companies data. Please wait.</template>
                        <Column field="name" header="Name" style="min-width: auto">
                            <template #body="{ data }">
                                {{ data.name }}
                            </template>
                        </Column>
                        <Column field="active" header="Status" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem'}" style="min-width: auto">
                            <template #body="{ data }" class='text-bold align-content-center'>
                                <slot v-if='data.active == 1'>
                                    <i class="pi pi-check-circle text-green-900"></i>
                                </slot>
                                <slot v-if='data.active == 0'>
                                    <i class="pi pi-times-circle text-red-900"></i>
                                </slot>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
        
        <div class="col-12 md:col-6">
            <Card>
                <template #title>Create Pick-up Company</template>
                <template #content>
                    <form ref="formPickUpCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="inpPickUpName" :class="{'p-error': vPickUpCreate$.name.$error}">Name:</label>
                            <InputText 
                                id="inpPickUpName" 
                                type="text" 
                                v-model="formPickUpCompanyCreate.name"
                                aria-describedby="inpPickUpName-help"
                                :class="{'p-invalid':vPickUpCreate$.name.$error}"
                            />
                            <small id="inpPickUpName-help" class="p-error" v-if="vPickUpCreate$.name.$error">{{ vPickUpCreate$.name.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <Button type="submit" label="Create pick-up company" class="w-full p-3 text-l" @click.prevent="createPickUpCompany()"></Button>
                        </div>
                    </form>
                </template>
            </Card>
            
        </div>
    </div>
</template>