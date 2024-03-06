<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { StreamBarcodeReader } from 'vue-barcode-reader';
    
    import QrService from '@/service/QrService';
    import MessageService from '@/service/MessageService';
    import PreBillingService from '@/service/PreBillingService';
    import UsersService from '@/service/UsersService';
    import ProfilesModulesService from '@/service/ProfilesModulesService';
    
    import Echo from 'laravel-echo';
    import Pusher from 'pusher-js';
    
   

    const msgService = new MessageService();
    const qrService = new QrService();
    const preBillService = new PreBillingService();
    const userService = new UsersService();
    const profileService = new ProfilesModulesService();
    
    const showCamera = ref(false);
    const showResultQr = ref(false);
    const saveButtonDisabled = ref(true);
    const formInvoice = reactive({
        receiveDetailId: null,
        invoiceNumber: null,
        invoicesTotal: null,
        invoicesQuantityStyles: null,
        invoicesDocument: null
    });
    const qrRead = reactive({
        received_date : null,
        follow_number: null,
        customer: null,
        boutique: null,
        store: null,
        process: null,    
        box_type: null,
        box_dimensions: null,
        box_quantity: null,
        box_weight: null,
        receibed_by: null,
        special_observations: null,
        id_receive_details: null,
        id_receibed_user_id: null,
    });
    const messageQr = ref([]);
    const qrReaderBrodcast = ref(null);
    
    const whoaim = ref(null);
    const usersAuth = ref([]);
    
    
    onMounted(async () => {
        await userService.me().then((res) => { 
            whoaim.value = res.data;
            
            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_PUSHER_KEY,
                cluster: import.meta.env.VITE_PUSHER_CLUSTER,
                encrypted: true
            });

            window.Echo.channel('qr.prebill.'+whoaim.value.id_user).listen('PreBilling', (event) => {
                showQrResult(JSON.parse(event.data));
            });    
        });   
        await profileService.getModuleUsers('Pre Billing').then((res) => (usersAuth.value = res.data));
    });
    
    async function onDecodeBspQr(qrData){
        try {
            showCamera.value = false;
            console.log(qrReaderBrodcast.value)
            const resultQr = await qrService.readQrPreBill(qrData,(!qrReaderBrodcast.value) ? null : qrReaderBrodcast.value.userId);
            if(!qrReaderBrodcast.value){
                showQrResult(resultQr.data);
            }else{
                msgService.successMessageSimple(resultQr.message+": "+qrReaderBrodcast.value.names,"Got it!");
            }
        } catch (e) {
            msgService.errorMessage(e)
        }
    }
    
    function showQrResult(result){
        console.log(result)
        if(result){
            if(result.instructions !== null){
                showResultQr.value = true;
                saveButtonDisabled.value = false;
                Object.assign(qrRead,result)
                formInvoice.receiveDetailId = qrRead.id_receive_details;                    
            }else{
                messageQr.value=[
                    { severity: 'error', content: "The customer <b>"+result.customer+"</b> boutique <b>"+result.boutique+"</b> NOT has intructions created. Please contact the manager.", id: 1}
                ];
            }
        }else{
            messageQr.value=[
                { severity: 'error', content: "The Qr that you read its wrong", id: 1}
            ];
        }
    }
    
    
    function displayCamera(){
        showResultQr.value = false;
        messageQr.value = null;
        showCamera.value = true;
    }
    
    async function saveFormInvoice(){
        try {
            const preBillRes = await preBillService.create(formInvoice);
            msgService.successMessageSimple(preBillRes.message,"Got it!");
            Object.assign(formInvoice,{
                receiveDetailId: null,
                invoiceNumber: null,
                invoicesTotal: null,
                invoicesQuantityStyles: null,
                invoicesDocument: null
            });
            Object.assign(qrRead,{
                received_date : null,
                follow_number: null,
                customer: null,
                boutique: null,
                store: null,
                process: null,    
                box_type: null,
                box_dimensions: null,
                box_quantity: null,
                box_weight: null,
                receibed_by: null,
                special_observations: null,
                id_receive_details: null,
                id_receibed_user_id: null,
            })
            showResultQr.value = false;
            saveButtonDisabled.value = true;

        } catch (e) {
            msgService.errorMessage(e);        
        }
    }

</script> 
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            Pre-Billing
                        </div>
                        <div class="col-12 md:col-6">
                            <Button icon="pi pi-qrcode" label="Scan Qr" severity="help" @click="displayCamera" size="small" class="w-full"/>
                        </div>
                    </div>
                </template>
                <template #content>
                    <div class="col-12">
                        <transition-group tag="div">
                            <Message v-for="msg of messageQr" :severity="msg.severity" :key="msg.id" :closable="false">{{ msg.content }}</Message>
                        </transition-group>
                    </div>
                    <div class="p-fluid formgrid grid p-0 col-12" v-if="showResultQr">
                        <div class="col-12 md:col-6">
                            <div class="col-12">
                                <h5>General Information:</h5>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Received at:</span>
                                <p class="text-xl text-900">{{qrRead.received_date}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Follow Number:</span>
                                <p class="text-xl text-900">{{qrRead.follow_number}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Received by:</span>
                                <p class="text-xl text-900">{{qrRead.receibed_by}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Customer:</span>
                                <p class="text-xl text-900">{{qrRead.customer}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Boutique:</span>
                                <p class="text-xl text-900">{{qrRead.boutique}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Store:</span>
                                <p class="text-xl text-900">{{qrRead.store}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Process:</span>
                                <p class="text-xl text-900">{{qrRead.process}}</p>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="col-12">
                                <h5>Boxes Information:</h5>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Total:</span>
                                <p class="text-xl text-900">{{qrRead.box_quantity}} Box(es)</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Product:</span>
                                <p class="text-xl text-900">{{qrRead.box_type}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Size:</span>
                                <p class="text-xl text-900">{{qrRead.box_dimensions}}</p>
                            </div>
                            <div class="col-12">
                                <span class="text-m">Weight:</span>
                                <p class="text-xl text-900">{{qrRead.box_weight}}</p>
                            </div>
                        </div>
                        <Divider />
                        <div class="col-12">
                            <h5>Invoice information by {{ whoaim.nameEmploye }}</h5>
                            <div class="p-fluid formgrid grid">
                                <div class="field col-12 md:col-4">
                                    <label for="inpInvoiceNumber">Invoice Number:</label>
                                    <InputNumber v-model="formInvoice.invoiceNumber" id="inpInvoiceNumber" :useGrouping="false"/>
                                </div>
                                <!--<div class="col-12 md:col-4">
                                    <label for="inpQuantityStyles">Quantity Styles:</label>
                                    <InputNumber v-model="formInvoice.invoicesQuantityStyles" id="inpQuantityStyles" :useGrouping="false"/>
                                </div>-->
                                <div class="field col-12 md:col-4">
                                    <label for="inpTotal">Total pieces:</label>
                                    <InputNumber v-model="formInvoice.invoicesTotal" id="inpTotal" :useGrouping="false"/>
                                </div>
                                <div class="field col-12 md:col-4">
                                    <Button icon="pi pi-save" label="Save Invoices" severity="success" @click="saveFormInvoice()" class="w-full" :disabled="saveButtonDisabled"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        
    </div>
    <Dialog v-model:visible="showCamera" modal header="Camera" position="bottom" :style="{ width: '70vw' }" :draggable="false">
        <div class="grid">
            <div class="field col-12 text-center">
                <label for="acBrodcast">Broadcast to:</label><br>
                <Dropdown id="acBrodcast" v-model="qrReaderBrodcast" :options="usersAuth" showClear optionLabel="names" placeholder="Select a user" class="w-full md:w-14rem" />
            </div>
        </div>
        <StreamBarcodeReader @decode="onDecodeBspQr"></StreamBarcodeReader>
    </Dialog>
</template>
