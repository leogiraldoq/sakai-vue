<script setup>
    import { ref,reactive,computed,onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';
    import { FilterMatchMode, FilterService } from 'primevue/api';
    import moment from 'moment';

    import ShippersService from '@/service/ShippersService';
    import CustomerService from '@/service/CustomerService';
    import ProductsService from '@/service/ProductsService';
    import ReceiveService from '@/service/ReceiveService';
    import MessageService from '@/service/MessageService';

    import Ticket from './Ticket.vue';
    
    const formReceive = reactive({
       user: null,
       shipper: null,
       customer: null,
       observations: null,
       photo: null,
       process:null,
       receive:[
           {
                boutique: null,
                product:null,
                box: null,
                quantity: 0,
                weight: 0,
                ref:false
           }           
       ]
    });
    const rulesformReceive = computed(()=>({
       shipper: {required},
       customer: {required},
    }));
    
    const vFormReceive$ = useVuelidate(rulesformReceive,formReceive);
    
    const shippersOptions = ref([]);
    const shippersItems = ref([]);
    const customerOptions = ref([]);
    const customerItems = ref();
    const boutiquesOptions = ref([]);
    const boutiquesItems = ref([]);
    const prodOptions = ref([]);
    const prodItems = ref([]);

    const boxesOptions = ref([]);
    const boxesItems = ref([]);
    const loadingCreate = ref(false);
    const sideBarTicket = ref(false);
    const todayDate = ref(null);
    const createReceive = reactive({
        action: "create",
        ticket: null
    });
    const receiveListPerDate = ref(null);
    const filtersResume = ref({
        global: {value: null,matchMode: FilterMatchMode.CONTAINS}
    });
    const columns = ref([
        {field:"boxes.dimensions", header:"Size"},
        {field:"weight_box", header:"Weight (Lbs)"},
        {field:"receive.user.employee.names", header:"Receibed by"}
    ]);
    const selectColumns = ref([]);
    
    const receiveService = new ReceiveService();
    const messageService = new MessageService();
    const shipperService = new ShippersService();
    const productService = new ProductsService();
    const customerService = new CustomerService();
    const boutiqueOne = ref(null);
    
    onMounted(async () => {
        await shipperService.getAll().then((res) => ( shippersOptions.value = res.data ));   
        await customerService.getCustomerAndBoutique().then((res) => (customerOptions.value = res.data));
        await productService.showWithBoxAuto().then((res) => (prodOptions.value = res.data));
        await receiveService.queryDetailsAll(moment().format('YYYY-M-D')).then((list) => (receiveListPerDate.value = list.data));
        todayDate.value = moment().format('MMMM Do YYYY');
        initCamera();
    });
    const searchShippers = (event) =>{
        setTimeout(() =>{ 
            if(!event.query){
                shippersItems.value = [...shippersOptions.value];
            }else{
                shippersItems.value = shippersOptions.value.filter((shipper) => {
                    return shipper.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
        },250);
    }
    
    const searchCustomers = (event) => {
        setTimeout(() =>{
            if(!event.query){
                customerItems.value = [...customerOptions.value];
            }else{
                customerItems.value = customerOptions.value.filter((customer) => {
                    return customer.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
        },250);
    }

    const bringBoutiques=(event)=>{
        boutiquesOptions.value = formReceive.customer.boutiques;
        if(formReceive.customer.boutiques.length === 1){
            boutiqueOne.value = formReceive.customer.boutiques[0];
            formReceive.receive[0].boutique = boutiqueOne.value;
        }else{
            formReceive.receive[0].boutique = null
        }
        itsProcess();
    }
    
    function bringBox(cP){
        boxesOptions.value = formReceive.receive[cP].product.boxes;
    }

    const searchBoutiques = (event) => {
        setTimeout(() =>{
            if(!event.query){
                boutiquesItems.value = [...boutiquesOptions.value];
            }else{
                boutiquesItems.value = boutiquesOptions.value.filter((boutique) =>{
                    return boutique.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
        },100);
    }
    
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
    
    function addReceiveBox(c){
        formReceive.receive.push({
                boutique: boutiqueOne.value,
                box: null,
                quantity: 0,
                weight: 0,
                ref:true
        });
    }
    
    function deleteReceiveBox(counter){
        if(formReceive.receive.length > 1){
            formReceive.receive.splice(counter,1);
        }
    }
    
    const webSocketPrinter = ref(null);
    const wsStickersData = reactive({
        file: null,
        printer: 'Stickers',
        orientation: 'Landscape',
        file_name: null
    });
    const wsTicketsData = reactive({
        file: null,
        printer: 'EPSON TM-T88V ReceiptE4',
        orientation: "Portrait",
        file_name: null
    })
    
    async function createReceiveBox(){    
        try {
            loadingCreate.value = true;
            const validation = await vFormReceive$.value.$validate();
            if(!validation){
                loadingCreate.value = false;
                return;
            }
            let resReceive = await receiveService.create(formReceive);
            wsStickersData.file = resReceive.data.ticket.print.stickers;
            wsStickersData.file_name= resReceive.data.ticket.follow_number+"Sticker"
            wsTicketsData.file = resReceive.data.ticket.print.ticket;
            wsTicketsData.file_name = resReceive.data.ticket.follow_number+"Ticket"
            
            receiveListPerDate.value.push(resReceive.data.resume[0]);
            
            webSocketPrinter.value = new WebSocket("ws://localhost:8765");
            webSocketPrinter.value.onopen = async () => {
                await webSocketPrinter.value.send(JSON.stringify(wsStickersData));
                await webSocketPrinter.value.send(JSON.stringify(wsTicketsData));
            }
            await messageService.successMessageSimple(resReceive.message,"Ok!");
            Object.assign(formReceive,{
                user: null,
                shipper: null,
                customer: null,
                observations: null,
                photo: null,
                process:null,
                receive:[
                    {
                        boutique: null,
                        box: null,
                        quantity: 0,
                        weight: 0,
                        ref:false
                    }           
                ]
            });
            vFormReceive$.value.$reset();
            loadingCreate.value = false;
            showVideo.value = true;
            showCanvas.value = false;
            messageProcess.value=null;

        } catch (err) {
            console.log(err)
            messageService.errorMessage(err);
            loadingCreate.value = false;
        }
    }
    
    const onToggle = (val) => {
        selectColumns.value = columns.value.filter(col => val.includes(col));
    }
    
    const messageProcess = ref([]);
    async function itsProcess(){
        try {
            if(formReceive.customer !== null && formReceive.shipper !== null){
                const resShopProcessOrNot = await shipperService.itsProcessOrNot(formReceive.customer.id_costumer,formReceive.shipper.id_shipper);
                if(resShopProcessOrNot.data.length !==0){
                    formReceive.process = "NOT PROCESS";
                    messageProcess.value=[
                        { severity: 'error', content: resShopProcessOrNot.data[0].customer.name+" receiving shop "+resShopProcessOrNot.data[0].shipper.name+" will not process", id: 1}
                    ];
                }else{
                    messageProcess.value=null;
                    formReceive.process = "PROCESS";
                }
            }else{
                messageProcess.value=null;
                formReceive.process = "PROCESS";
            }
        } catch (e) {
            messageService.errorMessage(e);
        }

    }
    
    var width = 500;
    var height = 0;
    var streaming = false;
    
    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;
    
    const showVideo = ref(true);
    const showCanvas = ref(false);
    
    function initCamera(){
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        startbutton = document.getElementById('startbutton');
        navigator.mediaDevices.getUserMedia({video:true, auidio: false})
                .then(function(stream){
                    video.srcObject = stream;
                    video.play()
                })
                .catch(function(err){
                    console.log("camera error:"+err)
                })
            video.addEventListener('canplay',function(ev){
            if(!streaming){
                height = video.videoHeight / (video.videoWidth / width);
                if(isNaN(height)){
                    height = width / (4/3);
                }
                video.setAttribute('width',width);
                video.setAttribute('height',height);
                canvas.setAttribute('width',width);
                canvas.setAttribute('height',height);
                streaming = true;
            }
        },false);
        
        startbutton.addEventListener('click',function(ev){
            takepicture();
            ev.preventDefault();
        },false);
    }
        
    function takepicture(){
        const context = canvas.getContext('2d');
        if (width && height){
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video,0,0,width,height);
            showVideo.value = false;
            showCanvas.value = true;
            formReceive.photo = canvas.toDataURL("image/jpeg",1.0);
        }
    }
    
    
    const deleteRe = reactive({
        id_receive: null
    });
    async function showDeleteReceive(id){
        try{
            let resDelete = await receiveService.bringTicket(id);
            console.log(resDelete)
            createReceive.action = "delete";
            createReceive.ticket = resDelete.data;
            sideBarTicket.value = true;
        }catch(err){
            messageService.errorMessage(err);
        }
    }
    
    async function deleteReceive(idReceive){
        try{
            let resDelete = await receiveService.delete(idReceive,createReceive.ticket.follow_number);
            sideBarTicket.value = false;
            receiveListPerDate.value = resDelete.data
            await messageService.successMessageSimple(resDelete.message,"Ok!");
            Object.assign(createReceive,{
                action: "create",
                ticket: null
            });
        } catch (err) {
            messageService.errorMessage(err);
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
                <template #title>New Receive</template>
                <template #content>
                    <div class="grid-nogutter">
                        <form ref="formRecieveCreate" class="p-fluid formgrid grid">
                            <div class="col-7">
                                <div class="grid">
                                    <div class="field col-6">
                                        <label for="acCustomer" :class="{'p-error': vFormReceive$.customer.$error}">Customer:</label>
                                        <AutoComplete 
                                            id="acCustomer"
                                            v-model="formReceive.customer"
                                            :suggestions="customerItems"
                                            optionLabel="name"
                                            dropdown
                                            aria-describedby="acCustomer-help"
                                            @complete="searchCustomers"
                                            @item-select="bringBoutiques"
                                        />
                                        <small id="acCustomer-help" class="p-error" v-if="vFormReceive$.customer.$error">{{ vFormReceive$.customer.$errors[0].$message }}</small>
                                    </div>
                                    <div class="field col-6">
                                        <label for="acShippers" :class="{'p-error': vFormReceive$.shipper.$error}">Store:</label>
                                        <AutoComplete 
                                            id="acShippers"
                                            v-model="formReceive.shipper" 
                                            :suggestions="shippersItems"
                                            optionLabel="name"
                                            dropdown
                                            aria-describedby="acShippers-help"
                                            @complete="searchShippers"
                                            @change="itsProcess"
                                        />
                                        <small id="acShippers-help" class="p-error" v-if="vFormReceive$.shipper.$error">{{ vFormReceive$.shipper.$errors[0].$message }}</small>
                                    </div>
                                    <div class="col-12 mt-3">
                                        <p>Details Receive</p>
                                        <table>
                                            <tr>
                                                <th style="width: 5%;">#</th>
                                                <th style="width: 10%;">Quantity</th>
                                                <th style="width: 20%;">Product</th>
                                                <th style="width: 20%;">Size</th>
                                                <th style="width: 30%;">Boutique</th>
                                                <th style="width: 15%;">WT (Lbs)</th>
                                                <th></th>
                                            </tr>
                                            <tr v-for="(receive,cR) in formReceive.receive" :key="cR">
                                                <td><b>{{ cR+1 }}</b></td>
                                                <td>
                                                    <InputNumber 
                                                        v-model="receive.quantity" 
                                                        v-bind:id="cR"
                                                        focus="receive.ref"
                                                    />
                                                </td>
                                                <td>
                                                    <AutoComplete 
                                                        v-model="receive.product" 
                                                        :suggestions="prodItems"
                                                        optionLabel="name"
                                                        @complete="searchProd"
                                                        @item-select="bringBox(cR)"
                                                    />
                                                </td>
                                                <td>
                                                    <AutoComplete 
                                                        v-model="receive.box" 
                                                        :suggestions="boxesItems"
                                                        optionLabel="dimensions"
                                                        aria-describedby="acBoxes-help"
                                                        @complete="searchBox"
                                                    />
                                                </td>
                                                <td>
                                                    <AutoComplete 
                                                        v-model="receive.boutique" 
                                                        :suggestions="boutiquesItems"
                                                        optionLabel="name"
                                                        dropdown
                                                        @complete="searchBoutiques"
                                                    />
                                                </td>
                                                <td>
                                                    <InputNumber 
                                                        v-model="receive.weight" 
                                                        inputId="integeronly"
                                                        v-on:keyup.enter="addReceiveBox(cR)"
                                                    />
                                                </td>
                                                <td>
                                                    <Button icon="pi pi-trash" @click="deleteReceiveBox(cR)" severity="danger" rounded outlined tabindex="-1"/>
                                                </td>
                                            </tr>
                                        </table>
                                        <div class="field col-12 mt-3">
                                            <label id="txtObservations">Observations:</label>
                                            <Textarea v-model="formReceive.observations" rows="3" cols="20" tabindex="-1"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="col-12">
                                    <transition-group tag="div">
                                        <Message v-for="msg of messageProcess" :severity="msg.severity" :key="msg.id" :closable="false">{{ msg.content }}</Message>
                                    </transition-group>
                                </div>
                                <div class="col-12 mt-3">
                                    <video id="video" v-show="showVideo" style="width: 100%" tabindex="-1">Video stream not available.</video>
                                    <canvas id="canvas" v-show="showCanvas" tabindex="-1"></canvas>
                                    <Button id="startbutton" icon="pi pi-camera" label="Take photo"  severity="help" class="w-full"/>
                                </div>
                                <div class="col-12 mt-2">
                                    <Button icon="pi pi-save" label="Save and Print" @click="createReceiveBox" severity="success" :loading="loadingCreate" class="w-full" />
                                </div>
                            </div>
                        </form>    
                    </div>
                </template>
            </Card>
            <Sidebar v-model:visible="sideBarTicket" position="right" class="w-full md:w-30rem lg:w-20rem">
                <Ticket 
                    :data="createReceive"
                    @deleteTicket="deleteReceive"
                ></Ticket>
            </Sidebar>
        </div>
        <div class="col-12">
            <Card>
                <template #title>
                    Resume Receiving History
                </template>
                <template #content>
                    <DataTable 
                        v-model:filters="filtersResume" 
                        :value="receiveListPerDate"
                        options="small"
                        paginator 
                        :rows="10" 
                        dataKey="follow_number"
                        :globalFilterFields="['receive.follow_number','boutiques.name','receive.customer.name','receive.shipper.name','receive.user.employee.names']"
                    >
                        <template #header>
                            <div class="grid">
                                <div class="col-12 md:col-6 m-0 p-1">
                                    <span class="p-input-icon-left">
                                        <i class="pi pi-search"/>
                                        <InputText v-model="filtersResume['global'].value" placeholder="Keyword search" class="w-full"/>
                                    </span>
                                </div>
                                <div class="col-12 md:col-6 m-0 p-1">
                                    <MultiSelect 
                                        :modelValue="selectColumns" 
                                        :options="columns" 
                                        optionLabel="header" 
                                        @update:modelValue="onToggle" 
                                        display="chip" 
                                        placeholder="Select columns" 
                                    />
                                </div>
                            </div>
                        </template>
                        <template #empty>No receive data for today</template>
                        <Column field="receive.follow_number" header="Receipt #"></Column>
                        <Column field="receive.shipper.name" header="Store Name"></Column>
                        <Column field="receive.customer.name" header="Customer"></Column>
                        <Column field="boutiques.name" header="Boutiques"></Column>
                        <Column field="boxes.describe" header="Product"></Column>
                        <Column field="quantity_box" header="Qntity" class="text-center"></Column>
                        <Column field="receive.created_at" header="Date" :sortable="true">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.created_at) }}
                            </template>
                        </Column>
                        <Column v-for="(col,index) of selectColumns" :field="col.field" :header="col.header" :key="col.field+'_'+index"></Column>
                        <Column header="Actions">
                            <template #body="{data}">
                                <span class="p-buttonset">
                                    <Button label="Print" size="small" severity="info" icon="pi pi-print" :value="data"/>
                                    <Button label="Delete" size="small" severity="danger" icon="pi pi-trash" @click="showDeleteReceive(data.receive.id_receive)"/>
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
    #video{
        width: 350px;
        height: 260px;
    }
    table, td, th {
        border: 3px dotted #cccccc;
        text-align: center;
    }

    table {
        border-collapse: collapse;
    }
</style>