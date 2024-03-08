<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    
    import MessageService from '@/service/MessageService';
    import SendService from '@/service/SendService';
    import UsersService from '@/service/UsersService'; 
    import ProfilesModulesService from '@/service/ProfilesModulesService';

    const router = useRouter();
    const msgService = new MessageService();
    const sendService = new SendService();
    const userService = new UsersService();
    const profileService = new ProfilesModulesService();
    
    const boxesToDelivery = ref([]);
    const whoaim = ref(null);
    
    onMounted(async () => {
       await sendService.boxToDelivery().then((res) => (boxesToDelivery.value = res.data));
       await userService.me().then((res) => ( whoaim.value = res.data ));
    });
    
    function showDeliverContent(idCustomer){
        console.log(idCustomer)
        router.push({
           name:'send-deliver-action',
           params: {
               id: idCustomer
           }
        });
    }
    
    
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Customers ready to delivery</template>
                <template #content>
                    <DataTable 
                        :value="boxesToDelivery" 
                        dataKey="customerId" 
                        responsiveLayout="scroll"
                    >
                        <Column field="customers" header="Customer" sortable></Column>
                        <Column field="pickUpCompany" header="Pick Up Company" sortable></Column>
                        <Column field="boxQuantity" header="# Boxes to delivery" :sortable="false"></Column>
                        <Column header="Actions">
                            <template #body="{data}">
                                <span class="p-buttonset">
                                    <Button label="Deliver" icon="pi pi-truck" size="small" severity="help" @click="showDeliverContent(data.customerId)"/>
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>
