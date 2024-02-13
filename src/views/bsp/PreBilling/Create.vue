<script setup>
    import { ref, reactive } from 'vue';
    import { StreamBarcodeReader } from 'vue-barcode-reader';
    
    import QrService from '@/service/QrService';
    import MessageService from '@/service/MessageService';
    import PreBillingService from '@/service/PreBillingService';

    const msgService = new MessageService();
    const qrService = new QrService();
    const preBillService = new PreBillingService();
    
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
    async function onDecodeBspQr(qrData){
        try {
            showCamera.value = false;
            const resultQr = await qrService.readQrPreBill(qrData);
            if(resultQr.data){
                showResultQr.value = true;
                saveButtonDisabled.value = false;
                Object.assign(qrRead,resultQr.data)
                formInvoice.receiveDetailId = qrRead.id_receive_details;
            }else{
                messageQr.value=[
                    { severity: 'error', content: "The Qr that you read its wrong", id: 1}
                ];
            }
        } catch (e) {
            msgService.errorMessage(e)
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
                            Scan Qr box
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
                    <div class="p-fluid formgrid grid p-0" v-if="showResultQr">
                        <div class="col-12 md:col-2">
                            <h5>General Info</h5>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Received at:</label>
                            <InputText size="small" disabled v-model="qrRead.received_date"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Follow Number:</label>
                            <InputText size="small" disabled v-model="qrRead.follow_number"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Received by:</label>
                            <InputText size="small" disabled v-model="qrRead.receibed_by"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Customer:</label>
                            <InputText size="small" disabled v-model="qrRead.customer"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Boutique:</label>
                            <InputText size="small" disabled v-model="qrRead.boutique"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Store:</label>
                            <InputText size="small" disabled v-model="qrRead.store"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Process:</label>
                            <InputText size="small" disabled v-model="qrRead.process"/>
                        </div>
                        <Divider/>
                        <div class="align-content-center col-12 md:col-1">
                            <h5>Boxes</h5>
                        </div>
                        <div class="field col-12 md:col-2">
                            <label>Total:</label>
                            <InputText size="small" disabled v-model="qrRead.box_quantity"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Type:</label>
                            <InputText size="small" disabled v-model="qrRead.box_type"/>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label>Dimension:</label>
                            <InputText size="small" disabled v-model="qrRead.box_dimensions"/>
                        </div>
                        <div class="field col-12 md:col-2">
                            <label>Weight:</label>
                            <InputText size="small" disabled v-model="qrRead.box_weight"/>
                        </div>
                        <Divider />
                        <div class="col-12">
                            <h5>Invoice information</h5>
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
        <StreamBarcodeReader @decode="onDecodeBspQr"></StreamBarcodeReader>
    </Dialog>
</template>
