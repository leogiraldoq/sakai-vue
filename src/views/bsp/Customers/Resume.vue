<script setup>
    import {ref, reactive, onBeforeMount } from "vue";
    import { useRouter } from 'vue-router';

    import NotProcess from './NotProcess.vue';
    
    import CustomerService from "@/service/CustomerService";
    
    const customers = ref([]);
    const expandRowsBoutiques = ref();
    const router = useRouter();
    const showSidebarNotProcess = ref(false); 
    const dataNotProcess = ref(null);
    
    onBeforeMount(async ()=>{
        const customerService = new CustomerService();
        await customerService.listAll().then( (data) => (customers.value = data.data));
    })
    
    function showInstructions(idCustomer){
        router.push({
           name:'customers-intructions',
           params: {
               id: idCustomer
           }
        });
    }
    
    function showNotProcess(customer){
        dataNotProcess.value = customer;
        showSidebarNotProcess.value = true;
    }
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <h5>Customers</h5>
                </template>
                <template #content>
                    <DataTable 
                    :value="customers" 
                    v-model:expandedRows="expandRowsBoutiques" 
                    dataKey="id_costumer" 
                    responsiveLayout="scroll"
                >
                    <Column :expander="true" headerStyle="min-width: 3rem" />
                    <Column field="name" header="Name" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="pick_up_company.name" header="Pick Up Company" :sortable="false">
                        <template #body="slotProps">
                            {{ slotProps.data.pick_up_company.name }}
                        </template>
                    </Column>
                    <Column field="labels" header="# Labels" :sortable="false">
                        <template #body="slotProps">
                            {{ slotProps.data.labels }}
                        </template>
                    </Column>
                    <Column header="Actions">
                        <template #body="{data}">
                            <span class="p-buttonset">
                                <Button label="Update" size="small" severity="warning" outlined/>
                                <Button label="Delete" size="small" severity="danger"  outlined/>
                                <Button label="Add labels" size="small" severity="success" outlined/>
                                <Button label="Not Process" size="small" severity="secondary" outlined @click="showNotProcess(data)"/>
                                <Button label="Instructions" size="small" severity="info" outlined @click="showInstructions(data.id_costumer)"/>
                            </span>
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <div class="p-1">
                            <p class="text-bold">Boutiques:</p>
                            <DataTable :value="slotProps.data.boutiques" responsiveLayout="scroll" class>
                                <Column field="name" header="Name" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.name }}
                                    </template>
                                </Column>
                                <Column field="city" header="City">
                                    <template #body="slotProps">
                                        {{ slotProps.data.city }}
                                    </template>
                                </Column>
                                <Column field="address" header="Address">
                                    <template #body="slotProps">
                                        {{ slotProps.data.address }}
                                    </template>
                                </Column>
                                <Column field="final_destination" header="Final Destination">
                                    <template #body="slotProps">
                                        {{ slotProps.data.final_destination }}
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </template>
                </DataTable>
                </template>
            </Card>
        </div>
    </div>
    <Sidebar v-model:visible="showSidebarNotProcess" position="right" class="w-full md:w-30rem lg:w-20rem">
       <NotProcess :data="dataNotProcess"></NotProcess>
    </Sidebar>
</template>
    
