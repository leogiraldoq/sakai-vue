<script setup>
    import { ref,reactive,computed,onMounted } from 'vue';
    import { FilterMatchMode, FilterService } from 'primevue/api';
    import moment from 'moment';
    
    import ReceiveService from '@/service/ReceiveService';

    onMounted( async () => {
        const receiveService = new ReceiveService();
        await receiveService.listAll().then((res) => (resumeReceive.value = res.data));
        console.log(resumeReceive.value);
    });
    
    const resumeReceive = ref();
    const formatDate = (date) =>{
        return moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
    const filters = ref({
        global: { value:null, matchMode: FilterMatchMode.CONTAINS },
    });
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Resume receiving</template>
                <template #content>
                    <DataTable 
                        :value="resumeReceive" 
                        sortField="created_at" 
                        :sortOrder="-1" 
                        stripedRows
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[10,20,30,40,50]"
                        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        :globalFilterFields="['receive.follow_number','receive.customer.name','boutiques.name','receive.shipper.name','boxes.describe','receive.user.employee.names','receive.created_at']"
                    >
                        <template #header>
                            <div class="flex col-6 justify-content-end">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search"/>
                                    <InputText v-model="filters['global'].value" placeholder="Search" />
                                </span>
                            </div>
                        </template>
                        <Column field="receive.follow_number" header="Receipt #" sortable></Column>
                        <Column field="receive.customer.name" header="Customer" sortable></Column>
                        <Column field="boutiques.name" header="Boutique" sortable></Column>
                        <Column field="receive.shipper.name" header="Store Name" sortable></Column>
                        <Column field="boxes.describe" header="Product" sortable></Column>
                        <Column field="quantity_box" header="Quantity" sortable></Column>
                        <Column field="boxes.dimensions" header="Size" sortable></Column>
                        <Column field="weight_box" header="Weight (Lbs)" sortable></Column>
                        <Column field="receive.user.employee.names" header="Receibed By" sortable></Column>
                        <Column field="receive.created_at" header="Date receibed" :sortable="true">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.created_at) }}
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
    <h1></h1>
</template>