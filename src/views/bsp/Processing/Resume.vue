<script setup>
    import { ref, reactive, inject, onMounted } from 'vue';
    import { FilterMatchMode } from 'primevue/api';
    
    import MessageService from '@/service/MessageService';
    import ProcessingService from '@/service/ProcessingService';

    const msgService = new MessageService();
    const processService = new ProcessingService();
    
    const processList = ref([]);
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        styleId: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
        boutique: { value: null, matchMode: FilterMatchMode.CONTAINS },
        store: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    
    onMounted(async () => {
        await processService.listPerUser().then((res) => (processList.value = res.data));
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
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <div class="grid mt-2">
                        <div class="col-12 md:col-6">
                            Processing Resume To {{ processList.whoami }}
                        </div>
                        <div class="col-12 md:col-4">
                            <span class="p-float-label">
                                <Calendar v-model="datesFilter" selectionMode="range" :manualInput="false" inputId="filter_date" showButtonBar class="w-full" dateFormat="M dd yy"/>
                                <label for="filter_date" class="text-sm text-base">Filter Date</label>
                            </span>
                        </div>
                        <div class="col-12 md:col-2">
                            <Button icon="pi pi-filter" label="Apply Filter" size="small" severity="info" @click="filterDates()" class="w-full"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total pieces processing</span>
                        <div class="text-900 font-medium text-xl">{{ processList.total }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-tag text-purple-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-purple-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{ processList.from }} - {{ processList.to }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total money earned:</span>
                        <div class="text-900 font-medium text-xl">$ {{ processList.totalCost }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-green-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{ processList.from }} - {{ processList.to }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Customers processing:</span>
                        <div class="text-900 font-medium text-xl">{{ processList.totalCustomers }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-building text-cyan-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-cyan-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{ processList.from }} - {{ processList.to }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Stores processing</span>
                        <div class="text-900 font-medium text-xl">{{ processList.totalStores }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-orange-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-orange-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{ processList.from }} - {{ processList.to }}</span>
            </div>
        </div>
        <div class="col-12">
            <Card>
                <template #title>Resume from {{ processList.from }} to {{ processList.to }}</template>
                <template #content>
                    <div class="col-12">
                        <DataTable v-model:filters="filters" :value="processList.resume" paginator :rows="10" dataKey="idProcess" :globalFilterFields="['customer', 'boutique', 'store','styleId']">
                            <template #header>
                                <div class="flex flex-wrap align-items-start justify-content-start gap-2">
                                    <MultiSelect :modelValue="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle" display="chip" placeholder="Select Columns" />
                                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                                </div>
                            </template>
                            <template #empty> No processing data found. </template>
                            <Column field="customer" header="Customer">
                                <template #body="{ data }">
                                    {{ data.customer }}
                                </template>
                            </Column>
                            <Column field="styleId" header="Style #">
                                <template #body="{ data }">
                                    {{ data.styleId }}
                                </template>
                            </Column>
                            <Column field="stylePieces" header="Pieces">
                                <template #body="{ data }">
                                    {{ data.stylePieces }}
                                </template>
                            </Column>
                            <Column field="styleSet" header="Set">
                                <template #body="{ data }">
                                    {{ data.styleSet }}
                                </template>
                            </Column>
                            <Column field="addWork" header="Aditional">
                                <template #body="{ data }">
                                    {{ data.addWork }}
                                </template>
                            </Column>
                            <Column field="date" header="Date">
                                <template #body="{ data }">
                                    {{ data.date }}
                                </template>
                            </Column>

                            <Column field="total" header="T. Pieces">
                                <template #body="{ data }">
                                    {{ data.total }}
                                </template>
                            </Column>

                            <Column field="cost" header="T. Cost">
                                <template #body="{ data }">
                                    $ {{ data.cost }}
                                </template>
                            </Column>
                            <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header" :key="col.field + '_' + index"></Column>
                            <!--<Column header="Actions">
                                <template #body="{ data }">
                                    <Button label="Update" size="small" severity="warning" @click="showPreBillingOne(data.idProcess)"/>
                                </template>
                            </Column>-->
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
