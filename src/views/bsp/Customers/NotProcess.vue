<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    
    import ShipperService from "@/service/ShippersService";
    import MessageService from "@/service/MessageService";
    import CustomerService from '@/service/CustomerService';
    
    const props = defineProps(['data']);
    const customer = props.data;
    const shopsProcess = ref(null);
    const shopsNotProcess = ref(null);
    
    const messageService = new MessageService();
    const shopService = new ShipperService();
    const customerService = new CustomerService();
    
    onMounted(async() => {
       await shopService.listProcessAndNot(customer.id_costumer).then((res)=>{
           shopsProcess.value = res.data.process;
           shopsNotProcess.value = res.data.not_process;
       });
    });
    
    async function removeShopNotProcess(id){
        try {
            const deleteData = reactive({
                customerId: customer.id_costumer,
                idCustomerShopNot: id
            });
            const resDeleteShopNotProcess = await customerService.removeShopNotProcess(deleteData);
            shopsProcess.value = resDeleteShopNotProcess.data.process;
            shopsNotProcess.value = resDeleteShopNotProcess.data.not_process; 
        } catch (e) {
            messageService.errorMessage(e);
        }
    }
    
    async function addShopNotProcess(id){
        try {
            const addNotProcess = reactive({
                customerId: customer.id_costumer,
                shopNoProcess: id
            });
            const resShopNotProcess = await customerService.addShopNotProcess(addNotProcess);
            shopsProcess.value = resShopNotProcess.data.process;
            shopsNotProcess.value = resShopNotProcess.data.not_process;
        } catch (e) {
            messageService.errorMessage(e);
        }

    }
</script>
<template>
    <div class="col-12 p-0">
        <h5>Stores not process for {{customer.name}}</h5>
    </div>
    <Divider />
    
    <div class="col-12 m-0 p-0">
        <p class="font-bold mb-2">Process: </p>
        <DataTable 
            :value="shopsProcess" 
            stripedRows 
            size="small"
            scrollable
            scrollHeight="200px"
        >
            <template #empty>Stores process not found</template>
            <Column field="name" header="Shops"></Column>
            <Column field="id_shipper" header="Add not process" class="text-center">
                <template #body="{data}">
                    <Button icon="pi pi-plus" severity="success" rounded outlined :value="data.id_shipper" @click="addShopNotProcess(data.id_shipper)"/>
                </template>
            </Column>
        </DataTable>
    </div>
    <Divider />
    <div class="col-12 m-0 p-0">
        <p class="font-bold mb-2">Not process: </p>
        <DataTable 
            :value="shopsNotProcess" 
            stripedRows 
            size="small"
            scrollable
            scrollHeight="200px"
        >
            <template #empty>Stores Not process shops not found</template>
            <Column field="shipper.name" header="Shops"></Column>
            <Column field="id" header="Remove" class="text-center">
                <template #body="{data}">
                    <Button icon="pi pi-times" severity="danger" rounded outlined :value="data.id" @click="removeShopNotProcess(data.id)"/>
                </template>
            </Column>
        </DataTable>
    </div>
    
</template>
