<script setup>
    import { ref,reactive,computed,onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';
    import { FilterMatchMode, FilterService } from 'primevue/api';
    import moment from 'moment';

    import ShippersService from '@/service/ShippersService';
    import CustomerService from '@/service/CustomerService';
    import BoxesService from '@/service/BoxesService';
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
    const boxesOptions = ref([]);
    const boxesItems = ref([]);
    const loadingCreate = ref(false);
    const sideBarTicket = ref(false);
    const todayDate = ref(null);
    var createReceive;
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
    const customerService = new CustomerService();
    const boxService = new BoxesService();
    const boutiqueOne = ref(null);
    
    onMounted(async () => {
       await shipperService.getAll().then((res) => ( shippersOptions.value = res.data ));   
       await customerService.getCustomerAndBoutique().then((res) => (customerOptions.value = res.data));
       await boxService.listAll().then((res) => (boxesOptions.value = res.data));
       await receiveService.queryDetailsPerDate(moment().format('YYYY-M-D')).then((list) => (receiveListPerDate.value = list.data));
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
        console.log(formReceive.customer)
        console.log(formReceive.customer.boutiques.length)
        if(formReceive.customer.boutiques.length == 1){
            boutiqueOne.value = formReceive.customer.boutiques[0];
            formReceive.receive[0].boutique = boutiqueOne.value;
        }
        console.log(formReceive)
        itsProcess();
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
        },250);
    }
    
    const searchBox = (event) =>{
        setTimeout(() =>{
            if(!event.query){
                boxesItems.value = [...boxesOptions.value];
            }else{
                boxesItems.value = boxesOptions.value.filter((box) =>{
                   return box.describe.toLowerCase().startsWith(event.query.toLowerCase()); 
                });
            }
        },250);
    }
    
    function addReceiveBox(c){
        formReceive.receive.push({
                boutique: boutiqueOne.value,
                box: null,
                quantity: 0,
                weight: 0,
                ref:true
        });
        console.log(c+1)
        const element = document.getElementById(c+1);
        console.log(element)
        if (element) {
          element.focus();
        }
    }
    
    function deleteReceiveBox(counter){
        if(formReceive.receive.length > 1){
            formReceive.receive.splice(counter,1);
        }
    }
    
    async function createReceiveBox(){    
        try {
            loadingCreate.value = true;
            const validation = await vFormReceive$.value.$validate();
            if(!validation){
                loadingCreate.value = false;
                return;
            }
            let resReceive = await receiveService.create(formReceive);
            createReceive = resReceive.data.ticket;
            console.log(resReceive.data.resume)
            receiveListPerDate.value.push(resReceive.data.resume);
            //await printJS({printable:createReceive.stickers, type:'pdf',base64:true});
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
            sideBarTicket.value = true;
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
            console.log(e)
            messageService.errorMessage(e);
        }

    }
    
    var width = 350;
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
                                                <th style="width: 10%;">#</th>
                                                <th style="width: 15%;">Quantity</th>
                                                <th style="width: 20%;">Package</th>
                                                <th style="width: 40%;">Boutique</th>
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
                                                        v-model="receive.box" 
                                                        :suggestions="boxesItems"
                                                        optionLabel="describe"
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
                                            <Textarea v-model="formReceive.observations" rows="3" cols="20" />
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
                                    <video id="video" v-show="showVideo" style="width: 100%">Video stream not available.</video>
                                    <canvas id="canvas" v-show="showCanvas"></canvas>
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
                <Ticket :data="createReceive"></Ticket>
            </Sidebar>
        </div>
        <div class="col-12">
            <Card>
                <template #title>
                    Resume Receiving from {{todayDate}}
                </template>
                <template #content>
                    <DataTable 
                        v-model:filters="filtersResume" 
                        :value="receiveListPerDate" 
                        paginator 
                        :rows="10" 
                        dataKey="follow_number"
                        :globalFilterFields="['boutiques.name','receive.customer.name','receive.shipper.name','receive.user.employee.names']"
                    >
                        <template #header>
                            <div class="grid">
                                <div class="col-4 md:col-12 m-0 p-1">
                                    <span class="p-input-icon-left">
                                        <i class="pi pi-search"/>
                                        <InputText v-model="filtersResume['global'].value" placeholder="Keyword search" class="w-15rem"/>
                                    </span>
                                </div>
                                <div class="col-8 md:col-12 m-0 p-1">
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
                        <Column v-for="(col,index) of selectColumns" :field="col.field" :header="col.header" :key="col.field+'_'+index"></Column>
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