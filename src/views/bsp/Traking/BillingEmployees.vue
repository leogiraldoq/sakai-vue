<script setup>
    import { ref,reactive,onMounted } from 'vue';
    import MessageService from '@/service/MessageService';
    import TrackingService from '@/service/TrackingService';
    
    const msgService = new MessageService();
    const trackService = new TrackingService();

    const props = defineProps(['employees']);
    const employeeResume = props.employees;

    
    
</script>
<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total pieces processing</span>
                        <div class="text-900 font-medium text-xl">{{ employeeResume.totalPieces }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-tag text-purple-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-purple-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{  }} - {{  }}</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total pay:</span>
                        <div class="text-900 font-medium text-xl">$ {{ employeeResume.totalBill }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-green-900 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-900 font-medium">Dates:</span><br/>
                <span class="text-500">{{  }} - {{  }}</span>
            </div>
        </div>
        <div class="col-12">
            <DataTable
                :value="employeeResume.billResume" 
                dataKey="employeeResume.billResume.idProcess" 
                responsiveLayout="scroll"
                paginator 
                :rows="10" 
                :rowsPerPageOptions="[10,20, 30, 40, 50]"
                stripedRows
                rowHover
            >
                <Column field="customer" header="Customer" :sortable="true" class="text-l"></Column>
                <Column field="boutique" header="Boutique" :sortable="true" class="text-l"></Column>
                <Column field="styleId" header="Style Id" :sortable="false" class="text-l"></Column>
                <Column header="Total Work" :sortable="false" class="text-l">
                    <template #body="slotProps">
                        <b>{{ slotProps.data.pieces }} Pieces</b> X <b>{{ slotProps.data.set }} Set(s)</b> = <b class="text-l">{{ slotProps.data.totalPiecesSet }} Pieces Work</b>
                    </template>
                </Column>
                <Column field="namesAddWork" header="Additional Work" :sortable="false" class="text-l"></Column>
                <Column header="Cost Additional Work" :sortable="false" class="text-l">
                    <template #body="slotProps">
                        $ {{ slotProps.data.costAddWork }}
                    </template>
                </Column>
                <Column header="Total to pay" :sortable="false" class="text-l">
                    <template #body="slotProps">
                        $ {{ slotProps.data.totalToPay }}
                    </template>
                </Column>
                <Column field="date" header="Date" :sortable="false" class="text-l"></Column>
            </Datatable>
        </div>
    </div>
</template>