<script setup>
    import { ref, reactive, onMounted } from 'vue';
    
    import TrackingService from '@/service/TrackingService';
    
    const props = defineProps(['data']);
    const boutique = props.data;
    const trackService = new TrackingService();
    const detailsBoutique = ref([]);
    
    onMounted( async ()=>{
       await trackService.detailsBoutiqueProcess(boutique.idBoutique).then((res) => (detailsBoutique.value = res.data.details));
       console.log(detailsBoutique.value)
    });
</script>

<template>
    <DataTable
        :value="detailsBoutique" 
        dataKey="receibeDetails.idReceibeDetails" 
        responsiveLayout="scroll"
        paginator 
        :rows="10" 
        :rowsPerPageOptions="[10,20, 30, 40, 50]"
        stripedRows
        rowHover
    >
        <Column header="Receiving" :sortable="true" class="text-l">
            <template #body="slotProps">
                <b>Store:</b>{{ slotProps.data.receibeDetails.store }}<br/>
                {{ slotProps.data.receibeDetails.quantity }} <b>{{ slotProps.data.receibeDetails.product }}</b> {{ slotProps.data.receibeDetails.size }}<br/>
                <small>{{ slotProps.data.receibeDetails.date }}</small>
            </template>
        </Column>
        <Column field="receibeDetails.preBilling.invoiceNumber" header="Invoice Number" :sortable="true" class="text-l"></Column>
        <Column field="receibeDetails.preBilling.quantity" header="Invoice Pieces" :sortable="true" class="text-l"></Column>
        <Column field="receibeDetails.preBilling.date" header="Invoice Date" :sortable="true" class="text-l"></Column>
        <Column header="Pre Total Cost" :sortable="false" class="text-l">
            <template #body="slotProps">
                $ {{ slotProps.data.receibeDetails.preBilling.totalCost }}
            </template>
        </Column>
        <Column field="receibeDetails.preBilling.processing.totalPieces" header="Processing Pieces" :sortable="false" class="text-l"></Column>
        <Column header="Processing Add Work" :sortable="false" class="text-l">
            <template #body="slotProps">
                $ {{ slotProps.data.receibeDetails.preBilling.processing.totalCostAddWork }}
            </template>
        </Column>    
        <Column header="Total Cost" :sortable="false" class="text-l">
            <template #body="slotProps">
                $ {{ slotProps.data.receibeDetails.preBilling.processing.totalCost }}
            </template>
        </Column>    

        
    </Datatable>
</template>