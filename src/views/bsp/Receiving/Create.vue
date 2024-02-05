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
                weight: 0
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
                    console.log(box)
                   return box.describe.toLowerCase().startsWith(event.query.toLowerCase()); 
                });
            }
        },250);
    }
    
    function addReceiveBox(){
        formReceive.receive.push({
                box: null,
                quantity: 0,
                weight: 0
           });
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
            receiveListPerDate.value.push(resReceive.data.resume);
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
                        weight: 0
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
        <div class="col-12 md:col-5">
            <Card>
                <template #title>Create Receive</template>
                <template #content>
                    <form ref="formRecieveCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="acCustomer" :class="{'p-error': vFormReceive$.customer.$error}">Customer:</label>
                            <AutoComplete 
                                id="acCustomer"
                                v-model="formReceive.customer"
                                :suggestions="customerItems"
                                optionLabel="name"
                                dropdown
                                aria-describedby="acCustomer-help"
                                @complete="searchCustomers"
                                @change="bringBoutiques"
                            />
                            <small id="acCustomer-help" class="p-error" v-if="vFormReceive$.customer.$error">{{ vFormReceive$.customer.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <label for="acShippers" :class="{'p-error': vFormReceive$.shipper.$error}">Shop Name:</label>
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
                        <div class="field col-12">
                            <label id="txtObservations">Observations:</label>
                            <Textarea v-model="formReceive.observations" rows="3" cols="20" />
                        </div>
                        <div class="col-12">
                            <p class="text-bold">Boxes to receive</p>
                        </div>
                        <div v-for="(receive,cR) in formReceive.receive" :key="cR">
                            <Fieldset :toggleable="true" class="mt-2">
                                <template #legend>
                                    Box Receive # {{cR+1}} <Button icon="pi pi-trash" class="ml-3" @click="deleteReceiveBox(cR)" severity="danger" rounded outlined/>
                                </template>
                                <div class="p-fluid formgrid grid">
                                    <div class="field col-12">
                                        <label>Boutique:</label>
                                        <AutoComplete 
                                            v-model="receive.boutique" 
                                            :suggestions="boutiquesItems"
                                            optionLabel="name"
                                            dropdown
                                            @complete="searchBoutiques"
                                        />
                                    </div>
                                    <div class="field col-12 md:col-6">
                                        <label>Product:</label>
                                        <AutoComplete 
                                            v-model="receive.box" 
                                            :suggestions="boxesItems"
                                            optionLabel="describe"
                                            aria-describedby="acBoxes-help"
                                            @complete="searchBox"
                                        />
                                    </div>
                                    <div class="field col-12 md:col-3">
                                        <label>Quantity:</label>
                                        <InputNumber 
                                            v-model="receive.quantity" 
                                            inputId="integeronly"
                                        />
                                    </div>
                                    <div class="field col-12 md:col-3">
                                        <label>Weight (Lbs):</label>
                                        <InputNumber 
                                            v-model="receive.weight" 
                                            inputId="integeronly"
                                        />
                                    </div>
                                </div>
                            </Fieldset>    
                        </div>
                        <div class="mt-2 col-12">
                            <Button icon="pi pi-plus" label="Add receive box" @click="addReceiveBox" size="small" severity="help" />
                        </div>
                        <div class="col-12 mt-3">
                            <video id="video" v-show="showVideo" style="width: 100%">Video stream not available.</video>
                            <canvas id="canvas" v-show="showCanvas"></canvas>
                            <Button id="startbutton" icon="pi pi-camera" label="Take photo"  severity="success" class="w-full"/>
                        </div>
                        <div class="col-12">
                            <transition-group tag="div">
                                <Message v-for="msg of messageProcess" :severity="msg.severity" :key="msg.id" :closable="false">{{ msg.content }}</Message>
                            </transition-group>
                        </div>
                    </form>
                </template>
                <template #footer>
                    <Button icon="pi pi-save" label="Save Receive" @click="createReceiveBox" severity="success" :loading="loadingCreate" class="w-full" />
                </template>                
            </Card>
            
            <Sidebar v-model:visible="sideBarTicket" position="right" class="w-full md:w-30rem lg:w-20rem">
                <Ticket :data="createReceive"></Ticket>
            </Sidebar>
        </div>
        <div class="col-12 md:col-7">
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
    
</style>