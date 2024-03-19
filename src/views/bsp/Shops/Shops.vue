<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';

    import ShippersService from '@/service/ShippersService';
    import MessageService from '@/service/MessageService';    

    const shipperService = new ShippersService();
    const messageService = new MessageService();
    const shopList = ref(null);
    
    onMounted(async()=>{
      await shipperService.getAll().then((res)=>(shopList.value = res.data));
    });
    
    const loadingCreate = ref(false);
    const newShop = reactive({
        id: null,
        name: null,
        contactName: null,
        contactNumber: null,
        email: null
    });
    const rulesNewShop = computed(()=>({
       name: {required,minLength:minLength(2),maxLength:maxLength(250)},
    }));
    
    const vNewShop$ = useVuelidate(rulesNewShop,newShop);
    const actionCreate = ref(true);
    const actionUpdate = ref(false);
    const listPos =ref(0);
    async function createShop(){
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
        } catch (e) {
            messageService.errorMessage(e);        
        }
    }
    
    function bringUpdateData(store){
        listPos.value = shopList.value.indexOf(store);
        newShop.id = store.id_shipper;
        newShop.name = store.name;
        newShop.contactName = store.contact_name;
        newShop.contactNumber = store.contact_number;
        newShop.email = store.email
        actionCreate.value = false;
        actionUpdate.value = true;
    }
    
    async function updateShop(){
        try {
            const validation = await vNewShop$.value.$validate();
            if (!validation){
                loadingCreate.value = false;
                return;
            }
            let shopUpdate = await shipperService.update(newShop);
            shopList.value[listPos.value] = shopUpdate.data
            await messageService.successMessageSimple(shopUpdate.message,"Ok!");
            Object.assign(newShop,{
                id: null,
                name: null,
                contactName: null,
                contactNumber: null,
                email: null
            });
            vNewShop$.value.$reset();
            actionCreate.value = true;
            actionUpdate.value = false;
            listPos.value = 0;
        } catch (e) {
            messageService.errorMessage(e);        
        }
    }
    
    async function statusShop(store){
        try {
            listPos.value = shopList.value.indexOf(store);
            let shopUpdate = await shipperService.delete(store.id_shipper,(store.active == 0 ? 1 : 0));
            shopList.value[listPos.value] = shopUpdate.data
            await messageService.successMessageSimple(shopUpdate.message,"Ok!");
            Object.assign(newShop,{
                id: null,
                name: null,
                contactName: null,
                contactNumber: null,
                email: null
            });
            vNewShop$.value.$reset();
            listPos.value = 0;
        } catch (e) {
            messageService.errorMessage(e);        
        }
    }
</script>
<template>
    <div class="grid">
        <div class="col-12 md:col-8">
            <Card>
                <template #title>Stores Resume</template>
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
                        <Column header="Actions">
                            <template #body="{data}">
                                <span class="p-buttonset">
                                    <Button label="Update" icon="pi pi-pencil" severity="warning" size="small" outlined @click="bringUpdateData(data)"/>
                                    <template v-if='data.active == 1'>
                                        <Button label="Delete" icon="pi pi-trash" severity="danger" size="small" outlined @click="statusShop(data)"/>
                                    </template>
                                    <template v-else>
                                        <Button label="Active" icon="pi pi-check" severity="success" size="small" outlined @click="statusShop(data)"/>
                                    </template>
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
            
        </div>
        <div class="col-12 md:col-4">
            <Card>
                <template #title>Create Store</template>
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
                    <Button icon="pi pi-save" label="Create store" @click="createShop()" severity="success" class="w-full" v-show="actionCreate"/>
                    <Button icon="pi pi-pencil" label="Update store" @click="updateShop()" severity="info" class="w-full" v-show="actionUpdate"/>
                </template>
            </Card>
        </div>
    </div>
        
</template>