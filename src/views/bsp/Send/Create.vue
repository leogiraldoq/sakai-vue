<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { StreamBarcodeReader } from 'vue-barcode-reader';
    
    import QrService from '@/service/QrService';
    import MessageService from '@/service/MessageService';
    import SendService from '@/service/SendService';
    import ProductsService from '@/service/ProductsService';
    import UsersService from '@/service/UsersService'; 
    import ProfilesModulesService from '@/service/ProfilesModulesService';

    import Echo from 'laravel-echo';
    import Pusher from 'pusher-js';

    const msgService = new MessageService();
    const qrService = new QrService();
    const sendService = new SendService();
    const productService = new ProductsService();
    const userService = new UsersService();
    const profileService = new ProfilesModulesService();

    
    
    const showCamera = ref(false);
    const showResultQr = ref(false);
    const showShippingForm = ref(false)
    const saveButtonDisabled = ref(true);
    const optionsStore = ref([]);
    const itemsStore = ref([]);
    const totalBox = ref(0);
    const optionsRepacking = ref([
        { name: "Same box", value: "Same box / Misma caja"},
        { name: "Repacking", value: "Repacking / Reempacado"}
    ]);
    const prodOptions = ref([]);
    const prodItems = ref([]);
    const boxesOptions = ref([]);
    const boxesItems = ref([]);

    const qrRead = reactive([]);
    const preparePacking = reactive({
        customer: null,
        boutique: null,
        prepare:[]
    });
    const pdfPrintDialog = ref(false);
    const pdfStickers = ref(null);

    const qrReaderBrodcast = ref(null);
    const whoaim = ref(null);
    const usersAuth = ref([]);

    onMounted(async () => {
       await productService.showWithBoxAuto().then((res) => (prodOptions.value = res.data));
       await userService.me().then((res) => { 
            whoaim.value = res.data;
            
            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_PUSHER_KEY,
                cluster: import.meta.env.VITE_PUSHER_CLUSTER,
                encrypted: true
            });

            window.Echo.channel('qr.pack.'+whoaim.value.id_user).listen('Packing', (event) => {
                console.log(JSON.parse(event.data));
                showResult(JSON.parse(event.data));
            });    
        });
        await profileService.getModuleUsers('Packing').then((res) => (usersAuth.value = res.data));
    });

    const searchProd = (event) =>{
        setTimeout(() =>{
            if(!event.query){
                prodItems.value = [...prodOptions.value];
            }else{
                prodItems.value = prodOptions.value.filter((product) =>{
                   return product.name.toLowerCase().startsWith(event.query.toLowerCase()); 
                });
            }
        },100);
    }
    
    const searchBox = (event) =>{
        setTimeout(() =>{
            if(!event.query){
                boxesItems.value = [...boxesOptions.value];
            }else{
                boxesItems.value = boxesOptions.value.filter((box) =>{
                   return box.dimensions.toLowerCase().startsWith(event.query.toLowerCase()); 
                });
            }
        },100);
    }
    
    const searchStore = (event) =>{
        setTimeout(() =>{
            if(!event.query){
                itemsStore.value = [...optionsStore.value];
            }else{
                itemsStore.value = optionsStore.value.filter((store) =>{
                   return store.name.toLowerCase().startsWith(event.query.toLowerCase()); 
                });
            }
        },100);
    }
    
    function bringBox(c){
        console.log(c)
        console.log(preparePacking)
        boxesOptions.value = preparePacking.prepare[c].product.boxes;
    }

    async function onDecodeBspQr(qrData){
        try {
            showCamera.value = false;
            pdfStickers.value = null;
            const resultQr = await qrService.readQrSend(qrData,(!qrReaderBrodcast.value) ? null : qrReaderBrodcast.value.userId);
            if(!qrReaderBrodcast.value){
                showResult(resultQr.data);
            }else{
                msgService.successMessageSimple(resultQr.message+": "+qrReaderBrodcast.value.names,"Got it!");
            }
        } catch (e) {
            console.log(e)
            msgService.errorMessage(e)
        }
    }
    
    function showResult(result){
        if(result){
            if(result.qualityDate !== null){
                if(qrRead.length > 0 ){
                    console.log(result.process.length)
                    if(result.prepare.length == 0){
                        if(result.customerId == qrRead[0].customerId && result.boutiqueId == qrRead[0].boutiqueId){
                            if( existQr(result.id_receive_details) == 0 ){
                                qrRead.push(result);
                                totalBox.value = totalBox.value +result.box_quantity;
                                showResultQr.value = true;
                                showShippingForm.value = true;
                                saveButtonDisabled.value = false;
                            } else {
                                msgService.errorMessageSimple("This qr was read","Got it!");
                            }
                        }else{
                                msgService.errorMessageSimple("The qr that you scan its for the customer <b>"+result.customer+"</b> boutique <b>"+result.boutique+"</b> and you packing customer <b>"+qrRead[0].customer+"</b> boutique <b>"+qrRead[0].boutique+"</b>.","Got it!");
                        }   
                    }else{
                        msgService.errorMessageSimple("This box ITS READY TO DELIBER. Customer <b>"+result.customer+"</b> Boutique <b>"+result.boutique+"</b>. Please contact the manager.","Got it!");
                    }                      
                }else{
                    if(result.prepare.length == 0){
                        qrRead.push(result);
                        totalBox.value = result.box_quantity;
                        showResultQr.value = true;
                        showShippingForm.value = true;
                        saveButtonDisabled.value = false;
                    }else{
                        msgService.errorMessageSimple("This box <b>ITS READY TO DELIVER</b>. Customer <b>"+result.customer+"</b> Boutique <b>"+result.boutique+"</b>. Please contact the manager.","Got it!");
                    }   
                }
            }else{
                msgService.errorMessageSimple("The customer <b>"+result.customer+"</b> boutique <b>"+result.boutique+"</b> NOT HAVE QUALITY PROCESS. Please contact the manager.","Got it!");
            }
        }else{
            msgService.errorMessageSimple("The Qr that you read its wrong","Got it!");
        }
        console.log(qrRead)
    }
    
    function existStore(storeId){
        let strE = 0;
        optionsStore.value.forEach((s)=>{
            if(s.id_shipper == storeId){
                strE = 1;
            }
        });
        return strE;
    }
    
    function existQr (receiveDetailsId) {
        let qrres = 0;
        qrRead.forEach((q)=>{
            if(q.id_receive_details == receiveDetailsId){
                qrres = 1;
            }
        });
        return qrres;
    }
    
    function displayCamera(){
        showCamera.value = true;
    }
    
    function addPreparePack(){
        preparePacking.prepare.push({
            quantity: null,
            product: null,
            type: null,
            weight: null,
            stores:[]
        });
    }
    
    function removePreparePack(counter){
        if(preparePacking.prepare.length > 1){
            preparePacking.prepare.splice(counter,1);
        }
    }
    
    function addPrepare(i){
        if(qrRead[i].action == "Same box / Misma caja"){
            let pro = prodOptions.value.filter((product) =>{
                   return product.id_product == qrRead[i].product.id_product; 
            });
            boxesOptions.value = pro[0].boxes;
            let box = boxesOptions.value.filter((b) =>{
                return b.id_box == qrRead[i].box.id_box; 
            });
            preparePacking.prepare.push({
                quantity: qrRead[i].box_quantity,
                product: pro[0],
                type: box[0],
                weight: qrRead[i].box_weight,
                stores:[qrRead[i].store]
             });
             
        }else{
            if( existStore(qrRead[i].store.id_shipper) == 0 ){
                optionsStore.value.push(qrRead[i].store);
            }
            preparePacking.prepare.push({
                quantity: 1,
                repack: null,
                product: null,
                type: null,
                weight: null,
                stores:[]
            });            
        }
    }
    
    async function savePreparePacking(){
        try {
            preparePacking.customer = qrRead[0].customerId;
            preparePacking.boutique = qrRead[0].boutiqueId;
            const resPrepareSend = await sendService.createPrepare(preparePacking);
            pdfStickers.value = 'data:application/pdf;base64,'+resPrepareSend.data.stickers;
            msgService.successMessageSimple(resPrepareSend.message,"Ok!");
            qrRead.splice(0);
            Object.assign(preparePacking,{
                customer: null,
                boutique: null,
                prepare:[]
            });
            showResultQr.value = false;
            showShippingForm.value = false;
            pdfPrintDialog.value=true;
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
                            Prepare for packing
                        </div>
                        <div class="col-12 md:col-6">
                            <Button icon="pi pi-qrcode" label="Scan Qr" severity="help" @click="displayCamera" size="small" class="w-full" />
                        </div>
                    </div>
                </template>
                <template #content>
                    <div class="p-fluid formgrid grid" v-if="showResultQr">
                        <div class="col-12 grid">
                            <div class="col-12 mb-3">
                                <h5>General Information:</h5>
                            </div>
                            <div class="col-12 md:col-6">
                                <span class="text-m">Customer:</span>
                                <p class="text-3xl text-900">{{qrRead[0].customer}}</p>
                            </div>
                            <div class="col-12 md:col-6">
                                <span class="text-m">Boutique:</span>
                                <p class="text-3xl text-900">{{qrRead[0].boutique}}</p>
                            </div>
                            <div class="col-12 mt-5">
                                <table class="w-full">
                                    <tr>
                                        <th>Store</th>
                                        <th>Product</th>
                                        <th>Size</th>
                                        <th>Quantity</th>
                                        <th>Wt (lbs)</th>
                                        <th>Quality</th>
                                        <th>Instruction</th>
                                        <th>Process</th>
                                        <th>Repack</th>
                                    </tr>
                                    <tr v-for="(pack, cP) in qrRead" :key="cP">
                                        <td>{{ pack.store.name }}</td>
                                        <td>{{ pack.box_type }}</td>
                                        <td>{{ pack.box_dimensions}}</td>
                                        <td>{{ pack.box_quantity}}</td>
                                        <td>{{ pack.box_weight}} (Lbs)</td>
                                        <td>
                                            <span class="text-xs">{{pack.qualityDate}}</span>
                                            <p class="text-s text-900">{{pack.qualityUser}}</p>
                                        </td>
                                        <td>{{ pack.instructions.shipping }}</td>
                                        <td>{{ pack.process}}</td>
                                        <td>
                                            <SelectButton v-model="pack.action" :options="optionsRepacking" optionLabel="name" optionValue="value" @change="addPrepare(cP)"/>
                                        </td>

                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
                    
                    
            <Card v-if="showShippingForm" class="mt-3">
                <template #title>
                    Prepare by <b>{{ whoaim.nameEmploye }}</b>
                </template>
                <template #content>
                    <div class="col-12">
                       <div class="col-12 md:col-6">
                           <p class="text-2xl text-900"><span class="text-l">Total: </span> <b>{{totalBox}} Box(ex)</b></p>
                        </div>
                        <div class="p-fluid formgrid grid">
                            <div class="col-12">
                                <table class="w-full">
                                    <tr>
                                        <th style="width: 5%;">Qnty</th>
                                        <th style="width: 20%;">Product</th>
                                        <th style="width: 15%;">Size</th>
                                        <th style="width: 10%;">WT (Lbs)</th>
                                        <th style="width: 40%;">Stores in box</th>
                                        <th style="width: 10%;">Action</th>
                                    </tr>
                                    <tr v-for="(prepare, cB) in preparePacking.prepare" :key="cB">
                                        <td>
                                            <InputNumber 
                                                v-model="prepare.quantity" 
                                                inputId="integeronly"
                                            />
                                        </td>
                                        <td>
                                            <AutoComplete 
                                                v-model="prepare.product" 
                                                :suggestions="prodItems"
                                                optionLabel="name"
                                                @complete="searchProd"
                                                @item-select="bringBox(cB)"
                                            />
                                        </td>
                                        <td>
                                            <AutoComplete 
                                                v-model="prepare.type" 
                                                :suggestions="boxesItems"
                                                optionLabel="dimensions"
                                                aria-describedby="acBoxes-help"
                                                @complete="searchBox"
                                            />
                                        </td>
                                        <td>
                                            <InputNumber 
                                                v-model="prepare.weight" 
                                                inputId="integeronly"
                                                v-on:keyup.enter="addReceiveBox(cB)"
                                            />
                                        </td>
                                        <td>
                                            <AutoComplete 
                                                v-model="prepare.stores" 
                                                multiple
                                                :suggestions="itemsStore"
                                                optionLabel="name"
                                                @complete="searchStore"
                                            />
                                        </td>
                                        <td>
                                            <Button icon="pi pi-trash" @click="removePreparePack(cB)" severity="danger" />
                                        </td>
                                    </tr>
                                </table>
                                <div class="col-12 md:col-4 mt-5">
                                    <Button icon="pi pi-plus" label="Add style" @click="addPreparePack()" severity="info" />
                                </div>
                                <div class="col-12 mt-5">
                                    <Button icon="pi pi-save" label="Save" @click="savePreparePacking()" severity="success" class="w-full" />
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
    <Dialog v-model:visible="pdfPrintDialog" modal header="Print" :style="{ width: '70rem' }">
        <div class="grid">
            <div class="col-12">
                <iframe :src="pdfStickers" id="pdfStickerFrame" width="100%"></iframe>
            </div>
        </div>
        <template #footer>
            <div class="grid">
                <div class="col-12">
                    <Button label="Print Ticket" icon="pi pi-print" severity="info" autofocus class="w-full"/>
                </div>
            </div>                    
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