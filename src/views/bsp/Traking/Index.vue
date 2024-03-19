<script setup>
    import { ref, reactive, inject, onMounted } from 'vue';
    import { FilterMatchMode } from 'primevue/api';
    
    import MessageService from '@/service/MessageService';
    import TraclingService from '@/service/TrackingService';

    import TrackReceiving from './TrackReceiving.vue'

    const msgService = new MessageService();
    const trackService = new TraclingService();

    const expandedRows = ref([]);
    const generalR = ref([]);
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        styleId: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
        boutique: { value: null, matchMode: FilterMatchMode.CONTAINS },
        store: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    
    onMounted(async () => {
        await trackService.generalResume().then((res) => (generalR.value = res.data));
        console.log(generalR.value);
    });

    function showPreBillingOne(idPreBill){
        console.log(idPreBill)
    }
    
    const columns = ref([
        {field: 'boutique', header: 'Boutique'},
        {field: 'store', header: 'Store'},
        {field: 'workShare', header: 'Share'},
        {field: 'styleColor', header: 'Color'},
    ]);
    const selectedColumns = ref([]);
    const onToggle = (val) => {
        selectedColumns.value = columns.value.filter(col => val.includes(col));
    };
    const datesFilter = ref();
    const moment = inject('moment');
    const datesSend = reactive({
        from: null,
        to: null
    });
    async function filterDates(){
        try {
            if(datesFilter.value !== null){
                datesSend.from = moment(datesFilter.value[0]).format('YYYY-MM-DD');
                datesSend.to = moment(datesFilter.value[1]).format('YYYY-MM-DD');
                const resumeByDate = await processService.listPerUserDate(datesSend);
                if(resumeByDate.data.length>0){
                    processList.value = resumeByDate.data;
                    Object.assign(datesSend,{
                        from: null,
                        to: null
                    });
                }else{
                    msgService.warningMessageSimple("No has result for the search by dates from <b>"+moment(datesFilter.value[0]).format('MMMM Do YYYY')+"</b> to <b>"+moment(datesFilter.value[1]).format('MMMM Do YYYY')+"</b>")
                }
            }else{
                await processService.listPerUser().then((res) => (processList.value = res.data));
            }
        } catch (e) {
            msgService.errorMessage(e)
        }
    }
    
    function morePrebill(idBoutique){
        console.log(idBoutique);
    }
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <div class="grid mt-2">
                        <div class="col-12 md:col-6">
                            Tracking all process
                        </div>
                        <!--<div class="col-12 md:col-4">
                            <span class="p-float-label">
                                <Calendar v-model="datesFilter" selectionMode="range" :manualInput="false" inputId="filter_date" showButtonBar class="w-full" dateFormat="M dd yy"/>
                                <label for="filter_date" class="text-sm text-base">Filter Date</label>
                            </span>
                        </div>
                        <div class="col-12 md:col-2">
                            <Button icon="pi pi-filter" label="Apply Filter" size="small" severity="info" @click="filterDates()" class="w-full"/>
                        </div>-->
                    </div>
                </template>
            </Card>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total pre billing invoice:</span>
                        <div class="text-900 font-medium text-xl">$ {{  }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-green-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{  }} - {{  }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total processing:</span>
                        <div class="text-900 font-medium text-xl">{{  }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-building text-cyan-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-cyan-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{  }} - {{  }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total quality</span>
                        <div class="text-900 font-medium text-xl">{{  }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-orange-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-orange-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{  }} - {{  }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total delivered:</span>
                        <div class="text-900 font-medium text-xl">{{  }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-orange-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-orange-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{  }} - {{  }}</span>
            </div>
        </div>
        <div class="col-12">
            <Card>
                
                <template #content>
                    <div class="col-12">
                        <TabView>
                            <TabPanel header="General">
                                <DataTable 
                                    :value="generalR" 
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
                                    <Column field="totalReceibing" header="Total Receiving" :sortable="true" class="text-center text-l"></Column>
                                    <Column field="totalPrebill" header="Total Pre Billing" :sortable="true" class="text-center text-l"></Column>
                                    <Column field="totalProcessing" header="Total Processing" :sortable="true" class="text-center text-l"></Column>
                                    <Column field="totalQuality" header="Total Quality" :sortable="true" class="text-center text-l"></Column>
                                    <Column field="totalPacking" header="Total Packing" :sortable="true" class="text-center text-l"></Column>

                                    <template #expansion="slotProps">
                                        <div class="p-2 mb-3">
                                            <p class="text-bold text-l">Resume per Boutique customer <b>{{ slotProps.data.nameCustomer }}</b>:</p>
                                            <DataTable :value="slotProps.data.boutique" responsiveLayout="scroll" showGridlines>
                                                <Column field="nameBoutique" header="Boutique" :sortable="true"></Column>
                                                <Column field="totalReceibing" header="Total Receiving">
                                                    <template #body="slotProps">
                                                        {{ slotProps.data.totalReceibing }}
                                                        <Tag icon="pi pi-eye" severity="contrast" value="More" @click="morePrebill(slotProps.data.idBoutique)" class="cursor-pointer"></Tag>
                                                    </template>
                                                </Column>
                                                <Column field="totalPrebill" header="Total Pre Billing">
                                                    <template #body="slotProps">
                                                        {{ slotProps.data.totalPrebill }}
                                                        <Tag icon="pi pi-eye" severity="contrast" value="More" @click="morePrebill(slotProps.data.idBoutique)" class="cursor-pointer"></Tag>
                                                    </template>

                                                </Column>
                                                <Column field="" header="Total Processing">
                                                    <template #body="slotProps">
                                                        {{ slotProps.data.totalProcessing }}
                                                        <Tag icon="pi pi-eye" severity="contrast" value="More" @click="morePrebill(slotProps.data.idBoutique)" class="cursor-pointer"></Tag>
                                                    </template>
                                                </Column>
                                                <Column field="totalQuality" header="Total Quality">
                                                    <template #body="slotProps">
                                                        {{ slotProps.data.totalQuality }}
                                                        <Tag icon="pi pi-eye" severity="contrast" value="More" @click="morePrebill(slotProps.data.idBoutique)" class="cursor-pointer"></Tag>
                                                    </template>
                                                </Column>
                                                <Column field="totalPacking" header="Total Packing">
                                                    <template #body="slotProps">
                                                        {{ slotProps.data.totalPacking }}
                                                        <Tag icon="pi pi-eye" severity="contrast" value="More" @click="morePrebill(slotProps.data.idBoutique)" class="cursor-pointer"></Tag>
                                                    </template>
                                                </Column>
                                            </DataTable>
                                        </div>
                                    </template>
                                </DataTable>
                            </TabPanel>
                            <TabPanel header="Receiving">
                                <TrackReceiving></TrackReceiving>
                            </TabPanel>
                            <TabPanel header="Pre Billing">
                                <p class="m-0">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                                    ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                                </p>
                            </TabPanel>
                            <TabPanel header="Processing">
                                <p class="m-0">
                                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui
                                    officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                                </p>
                            </TabPanel>
                            <TabPanel header="Quality">
                                <p class="m-0">
                                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui
                                    officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                                </p>
                            </TabPanel>
                            <TabPanel header="Packing">
                                <p class="m-0">
                                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui
                                    officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                                </p>
                            </TabPanel>

                        </TabView>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
