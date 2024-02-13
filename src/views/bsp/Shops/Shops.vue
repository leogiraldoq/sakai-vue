<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';

    import ShippersService from '@/service/ShippersService';
    import MessageService from '@/service/MessageService';    

    const shipperService = new ShippersService();
    
    const shopList = ref(null);
    
    onMounted(async()=>{
      await shipperService.getAll().then((res)=>(shopList.value = res.data));
      console.log(shopList.value);
    });
    
    const loadingCreate = ref(false);
    const newShop = reactive({
        name: '',
        contactName: '',
        contactNumber: '',
        email: ''
    });
    const rulesNewShop = computed(()=>({
       name: {required,minLength:minLength(2),maxLength:maxLength(250)},
    }));
    const vNewShop$ = useVuelidate(rulesNewShop,newShop);
    async function createShop(){
        const messageService = new MessageService();
        try {
            loadingCreate.value = true;
            const validation = await vNewShop$.value.$validate();
            if (!validation){
                loadingCreate.value = false;
                return;
            }
            let shop = await shipperService.create(newShop);
            shopList.value.push(shop.data);
            await messageService.successMessageSimple(shop.message,"Ok!");
            Object.assign(newShop,{
                name: '',
                contactName: '',
                contactNumber: '',
                email: ''
            });
            vNewShop$.value.$reset();
            loadingCreate.value = false;
        } catch (e) {
            loadingCreate.value = false;
            messageService.errorMessage(e);        
        }
    }
</script>
<template>
    <div class="grid">
        <div class="col-12 md:col-8">
            <Card>
                <template #title>Resume</template>
                <template #content>
                    <DataTable 
                        :value="shopList"
                        paginator 
                        :rows="7"
                    >
                        <template #empty> Shops not found.</template>
                        <template #loading>Loading shops data. Please wait.</template>
                        <Column field="name" header="Name"></Column>
                        <Column field="contact_name" header="Contact Name"></Column>
                        <Column field="contact_number" header="Phone"></Column>
                        <Column field="email" header="Email"></Column>
                        <Column field="active" header="Status">
                            <template #body="{ data }" class='text-bold align-content-center'>
                                <slot v-if='data.active == 1'>
                                    <i class="pi pi-check-circle text-green-900"></i>
                                </slot>
                                <slot v-if='data.active == 0'>
                                    <i class="pi pi-times-circle text-red-900"></i>
                                </slot>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
            
        </div>
        <div class="col-12 md:col-4">
            <Card>
                <template #title>Create</template>
                <template #content>
                    <form ref="formCreateShop" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="inpShopName" :class="{'p-error': vNewShop$.name.$error}">Shop Name:</label>
                            <InputText 
                                id="inpShopName"
                                v-model="newShop.name" 
                                aria-describedby="inpShopName-help"
                            />
                            <small id="inpShopName-help" class="p-error" v-if="vNewShop$.name.$error">{{ vNewShop$.name.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <label for="inpShopContactName">Contact Name:</label>
                            <InputText 
                                id="inpShopContactName"
                                v-model="newShop.contactName" 
                                aria-describedby="inpShopContactName-help"
                            />
                            <small id="inpShopContactName-help"></small>
                        </div>
                        <div class="field col-12">
                            <label for="inpShopContactNumber">Contact Number:</label>
                            <InputText 
                                id="inpShopContactNumber"
                                v-model="newShop.contactNumber" 
                                aria-describedby="inpShopContactNumber-help"
                            />
                            <small id="inpShopContactNumber-help"></small>
                        </div>
                        <div class="field col-12">
                            <label for="inpShopEmail">Email:</label>
                            <InputText 
                                id="inpShopEmail"
                                v-model="newShop.email" 
                                aria-describedby="inpShopEmail-help"
                            />
                            <small id="inpShopEmail-help"></small>
                        </div>
                    </form>
                </template>
                <template #footer>
                    <Button icon="pi pi-save" label="Create shop" @click="createShop()" severity="success" :loading="loadingCreate" class="w-full" />
                </template>
            </Card>
        </div>
    </div>
        
</template>