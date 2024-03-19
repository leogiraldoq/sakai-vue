<script setup>
    import { ref, reactive, onMounted } from 'vue';
    
    import MessageService from '@/service/MessageService';
    import TrackingService from '@/service/TrackingService';
    import BillingProcessing from './BillingProcessing.vue'
    import BillingEmployees from './BillingEmployees.vue'


    const msgService = new MessageService();
    const trackService = new TrackingService();
    
    const customerResume = ref([]);
    const expandedRows = ref([]);
    const detailsProcess = ref(false);
    const boutique = ref([]);
    const employeesResume = ref([]);
    const detailsEmployee = ref(false);
    const employee = ref([]);
    
    onMounted( async () =>{
        await trackService.customerPreBillProcessResume().then((res) => (customerResume.value=res.data));
        await trackService.billEmployees().then((res) => (employeesResume.value=res.data));
        console.log(employeesResume);
    });
    
    function bringBoautiqueInfo(data){
        detailsProcess.value = true;
        boutique.value = data
    }
    
    function showResumeEmployee(data){
        employee.value = data;
        detailsEmployee.value = true;
    }
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Billing</template>
            </Card>
        </div>
        <div class="col-12">
            <Card>
                <template #content>
                    <TabView>
                        <TabPanel header="Customer Pieces">
                            <DataTable 
                                    :value="customerResume" 
                                    v-model:expandedRows="expandedRows"  
                                    dataKey="idCustomer" 
                                    responsiveLayout="scroll"
                                    paginator 
                                    :rows="10" 
                                    :rowsPerPageOptions="[10,20, 30, 40, 50]"
                                    stripedRows
                                    rowHover
                                >
                                    <Column :expander="true" headerStyle="min-width: 3rem" />
                                    <Column field="nameCustomer" header="Customers" :sortable="true" class="text-l"></Column>
                                    <Column field="totalPreBillPieces" header="Total Pieces PreBill" :sortable="true" class="text-l"></Column>
                                    <Column field="totalProcessPieces" header="Total Pieces Process" :sortable="true" class="text-l"></Column>
                                    <Column field="totalProcessCharge" header="Total to Charge" :sortable="true" class="text-l">
                                        <template #body="slotProps">
                                            $ {{ slotProps.data.totalProcessCharge }}
                                        </template>
                                    </Column>
                                    <template #expansion="slotProps">
                                        <div class="p-2">
                                            <p class="text-bold text-m">Resume per Boutique customer <b>{{ slotProps.data.nameCustomer }}</b>:</p>
                                            <DataTable :value="slotProps.data.boutique" responsiveLayout="scroll">
                                                <Column field="nameBoutique" header="Boutique" :sortable="true"></Column>
                                                <Column field="totalPreBillPieces" header="Total Pieces Pre Billing"></Column>
                                                <Column field="totalProcessPieces" header="Pieces Processing"></Column>
                                                <Column field="totalProcessCharge" header="To charge">
                                                    <template #body="slotProps">
                                                        $ {{ slotProps.data.totalProcessCharge }}
                                                    </template>
                                                </Column>
                                                <Column field="" header="Actions">
                                                    <template #body="slotProps">
                                                        <Button icon="pi pi-eye" label="View More" severity="help" size="small" rounded @click="bringBoautiqueInfo(slotProps.data)"/>
                                                    </template>
                                                </Column>
                                            </DataTable>
                                        </div>
                                    </template>
                                </DataTable>
                        </TabPanel>
                        <TabPanel header="Employees">
                           <DataTable 
                                :value="employeesResume" 
                                dataKey="idUser" 
                                responsiveLayout="scroll"
                                paginator 
                                :rows="10" 
                                :rowsPerPageOptions="[10,20, 30, 40, 50]"
                                stripedRows
                                rowHover
                            >
                                <Column field="names" header="Employee" :sortable="true" class="text-l"></Column>
                                <Column field="totalPieces" header="Total Pieces Process" :sortable="true" class="text-l"></Column>
                                <Column field="totalBill" header="Total Pay" :sortable="true" class="text-l">
                                    <template #body="slotProps">
                                        $ {{ slotProps.data.totalBill }}
                                    </template>
                                </Column>
                                <Column field="" header="Actions">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-eye" label="View details" severity="help" size="small" rounded @click="showResumeEmployee(slotProps.data)"/>
                                    </template>
                                </Column>
                            </DataTable> 
                        </TabPanel>
                        <TabPanel header="Delivery">
                            <p class="m-0">
                                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
                                culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                            </p>
                        </TabPanel>
                    </TabView>
                </template>
            </Card>
        </div>
        <Dialog v-model:visible="detailsProcess" :style="{ width: '75vw' }" maximizable modal :contentStyle="{ height: '400px' }">
            <template #header>
                <div class="inline-flex align-items-center justify-content-center gap-2">
                    Details pre billing and processing boutique <b>{{ boutique.nameBoutique }}</b>
                </div>
            </template>
            <BillingProcessing
                :data="boutique"
            ></BillingProcessing>
            <template #footer>
                <Button label="Close" icon="pi pi-times" severity="secondary" @click="detailsProcess = false" />
            </template>
        </Dialog>
        
        <Dialog v-model:visible="detailsEmployee" :style="{ width: '75vw' }" maximizable modal :contentStyle="{ height: '400px' }">
            <template #header>
                <div class="inline-flex align-items-center justify-content-center gap-2">
                    Details billing employee <b>{{ employee.names }}</b>
                </div>
            </template>
                <BillingEmployees
                    :employees="employee">
                </BillingEmployees>
            <template #footer>
                <Button label="Close" icon="pi pi-times" severity="secondary" @click="detailsEmployee = false" />
            </template>
        </Dialog>
        
    </div>
</template>
