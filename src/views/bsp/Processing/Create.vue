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
    const showFormProcess = ref(true);
    const showResumeProcess = ref(false);
    const colorsOptions = ref(Colors);
    const colorsItems = ref();
    const optionsSet = ref([
        { name:'1 piece', value: 1},
        { name:'2 pieces', value: 2},
        { name:'3 pieces', value: 3}
    ]);
    const optionsAddWork = ref([]);
    const formProcessing = reactive({
       preBillId: null,
       shareWork: false,
       stylesProcess:[
           {
               id: null,
               color: null,
               quantity: null,
               set: 1
           }
       ],
       workAdd:[]
    });
    const qrRead = reactive({
       preBillId: null,
       customer: null,
       boutique: null,
       store: null,
       invoiceNum: null,
       total: null,
       instructions: null,
       processing: null
    });

    function displayCamera(){
        showCamera.value = true;
        messageQr.value = [];
        messageProcess.value = [];
        showResultQr.value = false;
        showResumeProcess.value = false;
        showFormProcess.value = true;
        Object.assign(qrRead,{
            preBillId: null,
            customer: null,
            boutique: null,
            store: null,
            invoiceNum: null,
            total: null,
            instructions: null,
            processing: null
        });
    }
    
    const messageQr = ref([]);
    const messageProcess = ref([]);
    async function onDecodeBspQr(qrData){
        try {
            showCamera.value = false;
            const resultQr = await qrService.readQrProcessing(qrData);
            console.log(resultQr)
            if(resultQr.data){
                if(resultQr.data.invoiceNum == null){
                    messageQr.value=[
                        { severity: 'error', content: "This box NOT has invoice created. Contact the manager", id: 1}
                    ];
                } else if(resultQr.data.instructions == null){
                    messageQr.value=[
                        { severity: 'error', content: "The customer <b>"+resultQr.data.customer+"</b> boutique <b>"+resultQr.data.boutique+"</b> NOT has intructions created. Please contact the manager.", id: 1}
                    ];
                }else if(!resultQr.data.processing.process){
                    messageProcess.value=[
                        { severity: 'warn', content: "This order for the customer "+resultQr.data.customer+" boutique "+resultQr.data.boutique+" ITS READY FOR QUALITY REVISION. Please contact the manager.", id: 1}
                    ];
                    showResultQr.value = true;
                    showResumeProcess.value = true;
                    showFormProcess.value = false;
                    Object.assign(qrRead,resultQr.data)
                }else{
                    showResultQr.value = true;
                    saveButtonDisabled.value = false;
                    optionsAddWork.value = resultQr.data.addWork;
                    Object.assign(qrRead,resultQr.data)
                }
            }else{
                messageQr.value=[
                    { severity: 'error', content: "The Qr that you read its corrupt", id: 1}
                ];
            }
        } catch (e) {
            console.log(e)
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
            quantity: null,
            set: 1
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
                        quantity: null,
                        set: 1
                    }
                ],
                workAdd:[]
            });
            Object.assign(qrRead,{
                preBillId: null,
                customer: null,
                boutique: null,
                store: null,
                invoiceNum: null,
                total: null,
                instructions: null,
                processing: null
            });
            saveButtonDisabled.value = true;
            showResultQr.value = false;
            showResumeProcess.value = false;
        } catch (e) {
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
                        <div class="col-12 md:col-6">
                            Processing
                        </div>
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
                                        <span class="text-m">Invoice Number:</span>
                                        <p class="text-xl text-900">{{qrRead.invoiceNum}}</p>
                                    </div>
                                    <div class="col-12 mb-2">
                                        <span class="text-m">Total pieces:</span>
                                        <p class="text-xl text-900">{{qrRead.total}}</p>
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
                        
                        <div class="col-12">
                            <transition-group tag="div">
                                <Message v-for="msg of messageProcess" :severity="msg.severity" :key="msg.id" :closable="false">{{ msg.content }}</Message>
                            </transition-group>
                        </div>
                        
                        <div class="col-12" v-if="showResumeProcess">
                            <DataTable :value="qrRead.processing.resume" showGridlines tableStyle="min-width: 50rem">
                                <Column field="styleId" header="Style Id"></Column>
                                <Column field="stylePieces" header="Pieces"></Column>
                                <Column field="styleSet" header="Set"></Column>
                                <Column field="styleColor" header="Color"></Column>
                                <Column field="workShare" header="Share Work"></Column>
                                <Column field="madeFor" header="Made for"></Column>
                                <Column field="total" header="Total Pieces Work"></Column>
                            </DataTable>
                            <div class="col-12 align-content-end align-items-end" style="text-align: right;">
                                <div>
                                    <h5> Total: <b>{{ qrRead.processing.total }} Pieces Worked</b> </h5>
                                </div>
                            </div>
                        </div>
                        
                        <template v-if="showFormProcess">
                            <div class="col-12 grid" >
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
                                    <div class="col-9">
                                        <table>
                                            <tr>
                                                <th style="width: 10%;">#</th>
                                                <th style="width: 15%;">Style Id</th>
                                                <th style="width: 20%;">Pieces</th>
                                                <th style="width: 40%;">Set</th>
                                                <th style="width: 15%;">Color</th>
                                                <th></th>
                                            </tr>
                                            <tr v-for="(style, sC) in formProcessing.stylesProcess" :key="sC">
                                                <td>{{ sC +1 }}</td>
                                                <td>
                                                    <InputText v-model="style.id" id="inpStyleId" />
                                                </td>
                                                <td>
                                                   <InputNumber v-model="style.quantity" id="inpTotal"/>
                                                </td>
                                                <td>
                                                    <SelectButton v-model="style.set" :options="optionsSet" optionLabel="name" optionValue="value"/>
                                                </td>
                                                <td>
                                                    <template v-if="formProcessing.shareWork">
                                                        <AutoComplete 
                                                          id="autoColor"
                                                          v-model="style.color"
                                                          :suggestions="colorsItems"
                                                          optionLabel="name"
                                                          dropdown
                                                          @complete="searchColors"
                                                        />
                                                    </template>
                                                    <template v-else>
                                                        No Share Work
                                                    </template>
                                                </td>
                                                <td>
                                                    <Button icon="pi pi-trash" @click="removeFormStyle(sC)" severity="danger"/>
                                                </td>
                                            </tr>
                                        </table>
                                        <div class="col-12 md:col-4 mt-5">
                                            <Button icon="pi pi-plus" label="Add style" @click="addFormStyle()" severity="success"/>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-3">
                                        <p style="font-size: 15px;font-weight: bold">Additional work</p>
                                        <Listbox v-model="formProcessing.workAdd" :options="optionsAddWork" multiple optionLabel="name" optionValue="id_add_work"/>
                                    </div>
                                    <div class="col-12">
                                        <Button icon="pi pi-save" label="Save" @click="saveFormStyle()" severity="success" class="w-full"/>
                                    </div>
                                </form>
                            </div>
                        </template>
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
        border: 3px dotted #cccccc;
        text-align: center;
    }

    table {
        border-collapse: collapse;
    }
</style>