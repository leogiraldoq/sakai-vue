<script setup>
    import { ref, reactive } from 'vue';
    import { StreamBarcodeReader } from 'vue-barcode-reader';
    import Colors from '@/assets/json/Colors'
    
    import QrService from '@/service/QrService';
    import MessageService from '@/service/MessageService';
    import ProcessingService from '@/service/ProcessingService';
    
    const msgService = new MessageService();
    const processService = new ProcessingService();
    const qrService = new QrService();
    
    const showCamera = ref(false);
    const showInstructions = ref(false);
    const saveButtonDisabled = ref(false);
    const showResultQr = ref(false);
    const colorsOptions = ref(Colors);
    const colorsItems = ref();
    const formProcessing = reactive({
       preBillId: null,
       shareWork: false,
       stylesProcess:[
           {
               id: null,
               color: null,
               quantity: null
           }
       ]
    });
    const qrRead = reactive({
       preBillId: null,
       customer: null,
       boutique: null,
       store: null,
       invoiceNum: null,
       total: null,
       instructions: null
    });

    function displayCamera(){
        showCamera.value = true;
        messageQr.value = null;
    }
    
    const messageQr = ref([]);
    async function onDecodeBspQr(qrData){
        try {
            showCamera.value = false;
            const resultQr = await qrService.readQrProcessing(qrData);
            if(resultQr.data){
                if(resultQr.data.invoiceNum == null){
                    messageQr.value=[
                        { severity: 'error', content: "Not has invoice created", id: 1}
                    ];
                } else if(resultQr.data.instructions == null){
                    messageQr.value=[
                        { severity: 'error', content: "Not has instructions created", id: 2}
                    ];
                }else{
                    showResultQr.value = true;
                    saveButtonDisabled.value = false;
                    Object.assign(qrRead,resultQr.data)
                }
            }else{
                messageQr.value=[
                    { severity: 'error', content: "The Qr that you read its corrupt", id: 1}
                ];
            }
        } catch (e) {
            msgService.errorMessage(e)
        }
    }
    
    const searchColors = (event) =>{
        setTimeout(() =>{
            if(!event.query){
                colorsItems.value = [...colorsOptions.value];
            }else{
                colorsItems.value = colorsOptions.value.filter((color) =>{
                   return color.name.toLowerCase().startsWith(event.query.toLowerCase()); 
                });
            }
        },250);
    }
    
    function addFormStyle(){
        formProcessing.stylesProcess.push({
            id: null,
            color: null,
            quantity: null
        });
    }
    
    function removeFormStyle(counter){
        if(formProcessing.stylesProcess.length > 1){
            formProcessing.stylesProcess.splice(counter,1);
        }
    }
    
    async function saveFormStyle(){
        try {
            let totalProcessPieces = 0;
            formProcessing.stylesProcess.map( t => totalProcessPieces += t.quantity);
            /*if(totalProcessPieces > qrRead.total){
                msgService.errorMessageSimple("The total pieces that you process its <b>MAYOR</b> that the pieces in the invoice, you enter <b>"+totalProcessPieces+"</b> pieces and the invoice said <b>"+qrRead.total+"</b> pieces in total. Check the information or contact the manager.");
            }else if(totalProcessPieces < qrRead.total){
                msgService.errorMessageSimple("The total pieces that you process its <b>MENOR</b> that the pieces in the invoice, you enter <b>"+totalProcessPieces+"</b> pieces and the invoice said <b>"+qrRead.total+"</b> pieces in total. Check the information or contact the manager.");
            } else {*/
                formProcessing.preBillId = qrRead.preBillId;
                const processing = await processService.create(formProcessing);
                msgService.successMessageSimple(processing.message,"Ok!");
                Object.assign(formProcessing,{
                    preBillId: null,
                    shareWork: false,
                    stylesProcess:[
                        {
                            id: null,
                            color: null,
                            quantity: null
                        }
                    ]
                });
                Object.assign(qrRead,{
                    preBillId: null,
                    customer: null,
                    boutique: null,
                    store: null,
                    invoiceNum: null,
                    total: null,
                    instructions: null
                });
                showResultQr.value = false;
                saveButtonDisabled.value = true;
            //}
        } catch (e) {
            console.log(e)
            msgService.errorMessage(e)
        }
    }
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <div class="grid">
                        <div class="col-12 md:col-6">Processing</div>
                        <div class="col-12 md:col-6">
                            <Button icon="pi pi-qrcode" label="Scan Qr" severity="help" @click="displayCamera" size="small" class="w-full"/>
                        </div>
                    </div>
                </template>
                <template #subtitle></template>
                <template #content>
                    <div class="col-12">
                        <transition-group tag="div">
                            <Message v-for="msg of messageQr" :severity="msg.severity" :key="msg.id" :closable="false">{{ msg.content }}</Message>
                        </transition-group>
                    </div>
                    <div class="grid" v-if="showResultQr">
                        <div class="col-12">
                            <h5>General Information</h5>
                            <div class="p-fluid formgrid grid">
                                <div class="col-12 md:col-6">
                                    <div class="field col-12">
                                        <label for="idCustomer">Customer:</label>
                                        <InputText v-model="qrRead.customer" id="idCustomer" disabled size="large"/>
                                    </div>
                                    <div class="field col-12">
                                        <label>Boutique:</label>
                                        <InputText v-model="qrRead.boutique" disabled size="large"/>
                                    </div>
                                    <div class="field col-12">
                                        <label>Store:</label>
                                        <InputText v-model="qrRead.store" disabled size="large"/>                                
                                    </div>
                                    <div class="field col-12">
                                        <label>Invoice Number:</label>
                                        <InputText v-model="qrRead.invoiceNum" disabled size="large"/>                                
                                    </div>
                                    <div class="field col-12">
                                        <label>Total pieces:</label>
                                        <InputText v-model="qrRead.total" disabled size="large"/>                                
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="field col-12">
                                        <label id="inpQntyLabels">Labels you have:</label>
                                        <InputNumber v-model="qrRead.labels" id="inpQntyLabels" size="large"/>
                                    </div>
                                    <div class="field col-12" v-if="qrRead.instructions !== null">
                                        <label>Sample:</label><br/>
                                        <Image :src="qrRead.instructions.sampleImage" width="100%" preview/>
                                        <Button icon="pi pi-eye" label="See instructions" severity="warning" @click="showInstructions = true" size="small" class="w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div class="col-12 grid">
                            <div class='col-12 md:col-6'>
                                <h5>Processing by <b>{{ qrRead.whoami }}</b></h5>
                            </div>
                            <div class="col-12 md:col-6">
                                <div class="flex align-content-center">
                                    <ToggleButton 
                                        v-model="formProcessing.shareWork" 
                                        onLabel="Work share" 
                                        onIcon="pi pi-users"
                                        offLabel="No work share"
                                        offIcon="pi pi-user"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                        <form class="p-fluid formgrid grid">
                            <template v-for="(style, i) in formProcessing.stylesProcess" :key="i">
                                    <div class="col-12 md:col-2">
                                        <p class="text-xl" style="{vertical-align: center;}">Style # {{ i +1 }}:</p>
                                    </div>
                                    <div class="field col-12 md:col-2">
                                        <label for="inpStyleId">Style Id:</label>
                                        <InputText v-model="style.id" id="inpStyleId" />
                                    </div>
                                    <div class="field col-12 md:col-2" v-if="formProcessing.shareWork">
                                        <label for="autoColor">Color:</label>
                                        <AutoComplete 
                                            id="autoColor"
                                            v-model="style.color"
                                            :suggestions="colorsItems"
                                            optionLabel="name"
                                            dropdown
                                            @complete="searchColors"
                                        />
                                    </div>
                                    <div class="field col-12 md:col-2">
                                        <label for="inpTotal">Process pieces:</label>
                                        <InputNumber v-model="style.quantity" id="inpTotal"/>
                                    </div>
                                    <div class="col-12 md:col-3">
                                        <Button icon="pi pi-trash" label="Remove" @click="removeFormStyle(i)" severity="danger" outlined/>
                                    </div>
                                <Divider />
                            </template>
                            <div class="col-12 align-content-end">
                                <div class="col-12 md:col-4">
                                    <Button icon="pi pi-plus" label="Add style" @click="addFormStyle()" severity="success" outlined/>
                                </div>
                            </div>
                        </form>
                        </div>
                    </div>
                </template>
                <template #footer v-if="showResultQr">
                    <Button icon="pi pi-save" label="Save" @click="saveFormStyle()" severity="success" class="w-full"/>
                </template>
            </Card>
        </div>
    </div>
    <Dialog v-model:visible="showCamera" modal header="Camera" position="bottom" :style="{ width: '70vw' }">
        <StreamBarcodeReader @decode="onDecodeBspQr"></StreamBarcodeReader>
    </Dialog>

    <Dialog v-model:visible="showInstructions" modal position="bottom" :style="{ width: '50vw' }" :breakpoints="{'1199px':'75vw','575px':'90vw'}">
        <template #header><h5>Instructions {{ qrRead.customer }} {{ qrRead.boutique }}</h5></template>
        <Image :src="qrRead.instructions.sampleImage" width="100%" preview/><br/>
        <span class="text-xl p-0">Customer Instructions:</span>
        <ul class="list-disc text-m">
            <li>{{ qrRead.instructions.customerInstructions }}</li>
        </ul>

        <p class="text-xl">Size Ticket:</p>
        <ul class="list-disc text-m">
            <li v-if="qrRead.instructions.sizeTicket.provide">{{ qrRead.instructions.sizeTicket.provide }}</li>
            <li v-if="qrRead.instructions.sizeTicket.place">{{ qrRead.instructions.sizeTicket.place }}</li>
            <li v-if="qrRead.instructions.sizeTicket.careLabel">{{ qrRead.instructions.sizeTicket.careLabel }}</li>
        </ul>
        <template v-if="qrRead.instructions.hangTag !== null">
            <p class="text-xl">Hang Tag:</p>
            <ul class="list-disc text-m">
                <li>{{ qrRead.instructions.hangTag }}</li>
            </ul>
        </template>
        <p class="text-xl">Bagging:</p>
        <ul class="list-disc text-m">
            <li v-if="qrRead.instructions.bagging.provide">{{ qrRead.instructions.bagging.provide }}</li>
            <li v-if="qrRead.instructions.bagging.options">{{ qrRead.instructions.bagging.options }}</li>
        </ul>
        <template v-if="qrRead.instructions.hangers !== null">
            <p class="text-xl">Hangers:</p>
            <ul class="list-disc text-m">
                <li>{{ qrRead.instructions.hangers }}</li>
            </ul>
        </template>
        <template v-if="qrRead.instructions.stickerSize !== null">
            <p class="text-xl">Size label on bag:</p>
            <ul class="list-disc text-m">
                <li>{{ qrRead.instructions.stickerSize }}</li>
            </ul>
        </template>
        <template v-if="qrRead.instructions.packing !== null">
            <p class="text-xl">Packing:</p>
            <ul class="list-disc text-m">
                <li>{{ qrRead.instructions.packing }}</li>
            </ul>
        </template>
        <template v-if="qrRead.instructions.specialObservations !== null">
            <p class="text-l">Special observations:</p>
            <ul class="list-disc text-m m-0">
                <li>{{ qrRead.instructions.specialObservations }}</li>
            </ul>
        </template>
    </Dialog>
</template>