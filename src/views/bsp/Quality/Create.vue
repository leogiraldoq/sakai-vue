<script setup>
    import { ref, reactive } from 'vue';
    import { StreamBarcodeReader } from 'vue-barcode-reader';
    import moment from 'moment';
    
    import QrService from '@/service/QrService';
    import MessageService from '@/service/MessageService';
    import QualityService from '@/service/QualityService';
    
    const msgService = new MessageService();
    const qualityService = new QualityService();
    const qrService = new QrService();
    
    const showCamera = ref(false);
    const showInstructions = ref(false);
    const showResultQr = ref(false);
    const showFormQuality = ref(true);
    const optionsQuality = ref([
        { name: 'Not Aprove', value: 0},
        { name: 'Aprove', value: 1},
    ]);
    const formQuality = reactive({
        idRceiveDetail: null,
        qualityControl:[],
    });
    const qrRead = reactive({
        received_date : null,
        follow_number: null,
        customer: null,
        boutique: null,
        store: null,
        box_type: null,
        box_dimensions: null,
        box_quantity: null,
        box_weight: null,
        receibed_by: null,
        id_receive_details: null,
        instructions: null,
        invoiceNum: null,
        invoiceTotal: null,
        preBillId: null,
        processing: null,
        whoami: null
    });

    function displayCamera(){
        showCamera.value = true;
        messageQr.value = null;
        showInstructions.value = false;
        showResultQr.value = false;
        showFormQuality.value = true;
        messageQr.value = [];
        messageQuality.value = [];
    }
    
    const messageQr = ref([]);
    const messageQuality = ref([]);
    async function onDecodeBspQr(qrData){
       try {
            showCamera.value = false;
            const resultQr = await qrService.readQrQuality(qrData);
            if(resultQr.data){
                if(resultQr.data.processing.process){
                    messageQuality.value=[
                        { severity: 'error', content: "This order for the customer "+resultQr.data.customer+" boutique "+resultQr.data.boutique+" ITS PROCESSING. Please contact the manager.", id: 1}
                    ];
                    showResultQr.value = true;
                    Object.assign(qrRead,resultQr.data)
                    showFormQuality.value = false;
                }else if(resultQr.data.quality.length > 0){
                    let dateQuality = formatDate(resultQr.data.quality[0].created_at)
                    messageQuality.value=[
                        { severity: 'error', content: "The order for the customer "+resultQr.data.customer+" boutique "+resultQr.data.boutique+" has already gone in "+dateQuality+" through the process quality. Please contact the manager.", id: 1}
                    ];
                    showResultQr.value = true;
                    Object.assign(qrRead,resultQr.data)
                    showFormQuality.value = false;
                }else{
                    showResultQr.value = true;
                    Object.assign(qrRead,resultQr.data)
                    showFormQuality.value = true;
                }
            }else{
                messageQr.value=[
                    { severity: 'error', content: "The Qr that you read its corrupt", id: 1}
                ];
            }
            console.log(qrRead)
        } catch (e) {
            console.log(e)
            msgService.errorMessage(e)
        }
    }
    
    function valueFromQuality(c){
        formQuality.idRceiveDetail = qrRead.id_receive_details;
        if(formQuality.qualityControl[c]){
            formQuality.qualityControl[c] = {
                idProcess: qrRead.processing.resume[c].idProcess,
                quality: qrRead.processing.resume[c].q,
            };

        }else{
            formQuality.qualityControl.push({
                idProcess: qrRead.processing.resume[c].idProcess,
                quality: qrRead.processing.resume[c].q,
            });            
        }
        console.log(formQuality)
    }
    
    async function saveFormQuality(){
        try {
            if(formQuality.qualityControl.length !== qrRead.processing.resume.length){
                msgService.errorMessageSimple("You dont aprove all the styles process","Got it!");
                return;
            }
            const quality = await qualityService.create(formQuality);
            msgService.successMessageSimple(quality.message,"Ok!");
            Object.assign(formQuality,[]);
            Object.assign(qrRead,{
                received_date : null,
                follow_number: null,
                customer: null,
                boutique: null,
                store: null,
                box_type: null,
                box_dimensions: null,
                box_quantity: null,
                box_weight: null,
                receibed_by: null,
                id_receive_details: null,
                instructions: null,
                invoiceNum: null,
                invoiceTotal: null,
                preBillId: null,
                processing: null,
                whoami: null
            });
            showResultQr.value = false;
            showFormQuality.value = true;
        } catch (e) {
            console.log(e)
            msgService.errorMessage(e)
        }
    }
    
    const formatDate = (date) =>{
        return moment(date).format('MMM Do YYYY, h:mm:ss a');
    }
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>
                    <div class="grid">
                        <div class="col-12 md:col-6">Quality Control</div>
                        <div class="col-12 md:col-6">
                            <Button icon="pi pi-qrcode" label="Scan Qr" severity="help" @click="displayCamera" size="small" class="w-full"/>
                        </div>
                    </div>
                </template>
                <template #subtitle></template>
                <template #content>
                    <div class="col-12">
                        <transition-group tag="div">
                            <Message v-for="msg of messageQr" :severity="msg.severity" :key="msg.id" :closable="false" ><b>{{ msg.content }}</b></Message>
                        </transition-group>
                    </div>
                    <div class="grid" v-if="showResultQr">
                        <div class="col-12">
                            <h5>General Information</h5>
                            <div class="p-fluid formgrid grid">
                                <div class="col-12 md:col-6">
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Customer:</span>
                                        <p class="text-xl text-900">{{qrRead.customer}}</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Boutique:</span>
                                        <p class="text-xl text-900">{{qrRead.boutique}}</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Store:</span>
                                        <p class="text-xl text-900">{{qrRead.store}}</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Receiving:</span>
                                        <p class="text-xl text-900">{{qrRead.box_quantity}} Box(es), product {{qrRead.box_type}} ({{qrRead.box_dimensions}}), weight {{qrRead.box_weight}} lbs</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Receiving by:</span>
                                        <p class="text-xl text-900">{{qrRead.receibed_by}}</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Invoice Number:</span>
                                        <p class="text-xl text-900">{{qrRead.invoiceNum}}</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Total pieces Invoice:</span>
                                        <p class="text-xl text-900">{{qrRead.invoiceTotal}} pieces</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Total pieces Processed:</span>
                                        <p class="text-xl text-900">{{qrRead.processing.total}} pieces</p>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="field col-12" v-if="qrRead.instructions !== null">
                                        <label>Sample:</label><br/>
                                        <Image :src="qrRead.instructions.sampleImage" width="100%" preview/>
                                        <Button icon="pi pi-eye" label="See instructions" severity="warning" @click="showInstructions = true" size="small" class="w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>    
                </template>
            </Card>
                        
            <Card class="mt-2" v-if="showResultQr">
                <template #title>Process quality by <b>{{ qrRead.whoami }}</b></template>
                <template #content>
                    <div class="col-12">
                        <transition-group tag="div">
                            <Message v-for="msg of messageQuality" :severity="msg.severity" :key="msg.id" :closable="false">{{ msg.content }}</Message>
                        </transition-group>
                    </div>
                    <div class="grid">
                        <div class="col-12">
                            <table class="w-full">
                                <tr>
                                    <th>Style Id</th>
                                    <th>Pieces</th>
                                    <th>Set</th>
                                    <th>Color</th>
                                    <th>Share Work</th>
                                    <th>Made for</th>
                                    <th>Total Pieces Work</th>
                                    <th>Date</th>
                                    <th v-if="showFormQuality">Quality</th>
                                </tr>
                                <tr v-for="(process, cP) in qrRead.processing.resume" :key="cP">
                                    <td>{{process.styleId}}</td>
                                    <td>{{process.stylePieces}}</td>
                                    <td>{{process.styleSet}}</td>
                                    <td>{{process.styleColor}}</td>
                                    <td>{{process.workShare}}</td>
                                    <td>{{process.madeFor}}</td>
                                    <td>{{process.total}}</td>
                                    <td>{{ formatDate(process.created_at) }}</td> 
                                    <td v-if="showFormQuality">
                                        <SelectButton v-model="process.q" :options="optionsQuality" optionLabel="name" optionValue="value" @change="valueFromQuality(cP)"/>
                                    </td>
                                </tr>
                            </table>
                            <div class="col-12 align-content-end align-items-end" style="text-align: right;">
                                <div>
                                    <h5> Total: <b>{{ qrRead.processing.total }} Pieces Worked</b> </h5>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mt-5">
                            <Button icon="pi pi-save" label="Save quality" @click="saveFormQuality()" severity="success" class="w-full" v-if="showFormQuality"/>
                        </div>
                    </div>
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

<style scoped>
    table, td, th {
        border: 2px solid #000000;
        text-align: center;
    }

    td{
        font-size: 18px;
        padding: 10px;
    }
    
    th {
        padding-top: 10px;
        padding-bottom: 10px;
        background-color: #bfbfbf;
        color: black;
    }
    
    table {
        border-collapse: collapse;
    }
</style>