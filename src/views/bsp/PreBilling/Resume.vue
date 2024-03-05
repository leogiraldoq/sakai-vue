<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { FilterMatchMode } from 'primevue/api';
    
    import MessageService from '@/service/MessageService';
    import PreBillingService from '@/service/PreBillingService';

    const msgService = new MessageService();
    const preBillService = new PreBillingService();
    
    const preBillList = ref([]);
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        invoiceNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
        boutique: { value: null, matchMode: FilterMatchMode.CONTAINS },
        store: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    
    onMounted(async () => {
        await preBillService.resume().then((res) => (preBillList.value = res.data));
    });

    function showPreBillingOne(idPreBill){
        console.log(idPreBill)
    }

</script>
<template>
    <div class="card">
        <DataTable v-model:filters="filters" :value="preBillList" paginator :rows="10" dataKey="idPreBill" :globalFilterFields="['invoiceNumber', 'customer', 'boutique', 'store']">
            <template #header>
                <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                    <span class="text-xl text-900 font-bold">Pre Billing Resume</span>
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                </div>
            </template>
            <template #empty> No pre billing found. </template>
            <Column field="customer" header="Customer">
                <template #body="{ data }">
                    {{ data.customer }}
                </template>
            </Column>
            <Column field="boutique" header="Boutique">
                <template #body="{ data }">
                    {{ data.boutique }}
                </template>
            </Column>
            <Column field="store" header="Store">
                <template #body="{ data }">
                    {{ data.store }}
                </template>
            </Column>
            <Column field="totalBox" header="Total Boxes">
                <template #body="{ data }">
                    {{ data.totalBox }} Box(es)
                </template>
            </Column>
            <Column field="invoiceNumber" header="Invoice #">
                <template #body="{ data }">
                    {{ data.invoiceNumber }}
                </template>
            </Column>
            <Column field="totalInvocePieces" header="Total Pieces">
                <template #body="{ data }">
                    {{ data.totalInvocePieces }}
                </template>
            </Column>
            <Column field="receiveDate" header="Receive Date">
                <template #body="{ data }">
                    {{ data.receiveDate }}
                </template>
            </Column>
            <Column header="Actions">
                <template #body="{ data }">
                    <Button label="Update" size="small" severity="warning" @click="showPreBillingOne(data.idPreBill)"/>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
