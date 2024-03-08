<script setup>
    import { ref,reactive,computed,onBeforeMount,inject } from 'vue';
    import { useRoute,useRouter } from 'vue-router';
    import Vue3Signature from "vue3-signature"
    
    import SendService from '@/service/SendService';
    import UsersService from '@/service/UsersService'; 
    import MessageService from '@/service/MessageService';
    
    const route = useRoute();
    const router = useRouter();
    const customerId = ref(route.params.id);
    const whoaim = reactive({
        nameEmploye: null
    });
    const userService = new UsersService();
    const msgService = new MessageService();
    const sendService = new SendService();
    const customerDeliverData = ref([]);
    const moment = inject('moment');
    const formDelivered = reactive({
        namePickUp: null,
        signPickUp: null,
        photoPickUp: null,
        ticketNum: moment().unix(),
        ticketDate: moment().format('MMMM Do YYYY, h:mm:ss a'),
        pickUpId: null,
        email: null,
        packIds: [],
    });
    const state = reactive({
        count: 0,
        option: {
          penColor: "rgb(0, 0, 0)",
          backgroundColor: "rgb(255,255,255)"
        },
        disabled: false
    });
    onBeforeMount( async ()=>{
        await userService.me().then((res) => (whoaim.nameEmploye = res.data.nameEmploye));
        await sendService.customerToDelivery(customerId.value).then((res)=>(customerDeliverData.value = res.data));
        initCamera()
    });
    
    function convertImage(e){
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
           instructionsClient.sampleImage = reader.result;
        }
        reader.readAsDataURL(file);
    }
    
    function parseDate(date){
        return moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }    
    
    const signaturePickUp = ref(null);
    
    const saveSign = (t) => {
        formDelivered.signPickUp=signaturePickUp.value.save(t)
    }
    const clearSign = () => {
        signaturePickUp.value.clear();
        formDelivered.signPickUp= null;
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
            formDelivered.photoPickUp = canvas.toDataURL("image/jpeg",1.0);
        }
        console.log(formDelivered);
    }
    
    function clearPackToDeliver(pos){
        if(customerDeliverData.value.packing.length > 1){
            customerDeliverData.value.packing.splice(pos,1);
        }
        if(customerDeliverData.value.packIds.length > 1){
            customerDeliverData.value.packIds.splice(pos,1);
        }
        console.log(customerDeliverData.value)
    }
    
    async function saveDelivered(){
        try {
            formDelivered.packIds = customerDeliverData.value.packIds;
            formDelivered.pickUpId = customerDeliverData.value.idPickUp;
            const deliverSave = await sendService.saveDelivered(formDelivered);
            msgService.successMessageSimple(deliverSave.message,"Got it!");
            router.push({name:"senddeliver"});
        } catch (e) {
            msgService.errorMessage(e)        
        }

    }
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Delivery by <b>{{ whoaim.nameEmploye }}</b></template>
            </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-7 xl:col-8">
            <Card>
                <template #title>Form Deliver</template>
                <template #content>
                    <div class="p-fluid formgrid grid mb-5">
                        <div class="field col-12 md:col-6">
                            <label for="inpPickUpByName">Name of person to pick up:</label>
                            <InputText 
                                id="inpPickUpByName" 
                                type="text" 
                                v-model="formDelivered.namePickUp" 
                                aria-describedby="inpPickUpByName-help" 
                            />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="inpEmail">Email of person to pick up:</label>
                            <InputText 
                                id="inpEmail" 
                                type="text" 
                                v-model="formDelivered.email" 
                            />
                        </div>
                        <div class="field col-12 md:col-6 text-center">
                            <label for="inpPickUpByName">Sign of person to pick up:</label>
                            <Vue3Signature ref="signaturePickUp" :sigOption="state.option" style="border-style: solid;" :h="'250px'" class="w-full"></Vue3Signature>
                            <Button label="Save" icon="pi pi-save" size="small" severity="help" @click="saveSign('image/jpeg')"></Button>
                            <Button label="Clear" icon="pi pi-trash" size="small" severity="danger" @click="clearSign('image/jpeg')"></Button>
                        </div>
                        <div class="field col-12 md:col-6 text-center">
                            <label>Photo of person to pick up:</label><br/>
                            <video id="video" v-show="showVideo" style="width: 100%" tabindex="-1">Video stream not available.</video>
                            <canvas id="canvas" v-show="showCanvas" tabindex="-1"></canvas>
                            <Button id="startbutton" icon="pi pi-camera"size="small"  label="Take photo"  severity="help" class="w-full"/>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <Button icon="pi pi-save" label="Deliver" severity="success" class="w-full" @click="saveDelivered()"/>
                </template>
            </Card>

        </div>
        
        <div class="col-12 md:col-6 lg:col-5 xl:col-4">
            <Card>
                <template #title>Ticket Preview</template>
                <template #subtitle>This ticket will send by email after save the form.</template>
                <template #content>
                    <div class="col-12 text-center">
                        <img src="/layout/images/logoBlueStarPacking.png" alt="Blue Star Packing" class="w-8"/><br/>
                        <b>Shipping Receipt # {{ formDelivered.ticketNum }}</b><br/>
                        <small>1316 STANFORD AV. UNIT -A LOS ANGELES CA 90021</small><br/>
                        <small>PHONE (562)835-2515 and (323)274-8378</small><br/>
                        <small>bluestarpacking@gmail.com</small><br/>
                        <small>www.bluestarpackingla.com</small><br/>
                        <p>
                            <b>Customer:</b> {{customerDeliverData.customer}}<br/>
                            <b>Date shipped:</b> {{ formDelivered.ticketDate }}<br/>
                            <b>Shipp By:</b> {{ whoaim.nameEmploye }}
                        </p>
                        <p>Resume shipped:</p>
                        <table class="align-content-center mb-2 ml-1 ticketFont w-full">
                            <tr>
                                <th>Quant</th>
                                <th>Store</th>
                                <th>Prod</th>
                                <th>Size</th>
                                <th>WT(Lbs)</th>
                                <th>Quit</th>
                            </tr>
                            <tr v-for="(pack,pK) in customerDeliverData.packing" :key="pK">
                                <td>{{pack.quantity}}</td>
                                <td>{{pack.store}}</td>
                                <td>{{pack.product}}</td>
                                <td>{{pack.size}}</td>
                                <td>{{pack.weight}}</td>
                                <td>
                                    <Button icon="pi pi-trash" size="small" severity="danger" @click="clearPackToDeliver(pK)" rounded outlined></Button>
                                </td>
                            </tr> 
                        </table>
                        <p>
                            <b>Pick Up Company:</b> {{ customerDeliverData.pickUp }}<br/>
                            <b>Pick Up By:</b> {{ formDelivered.namePickUp }}<br/><br/>
                            <Image :src="formDelivered.signPickUp" width="100%" preview/><br/>
                            <small>Signature</small>
                        </p>
                        <p class="ticketFont text-center">
                            <b>Important Notice:</b> Your satisfaction is our motivation to be the best in the Los Angeles Fashion District Area... Your merchandise was handled with the best quality standars by the highly qualified personnel of our company... Feel free to contact us for any questions, complains or suggestions. To customer service +1 (323) 274-8378 Monday to Friday from 10 AM to 5 PM Pacific time or Visit our website wwww.bluestarpackingla.com. Thank You... We apreciate your bussines... BlueStar Packing INC. is not responsable for any kind of items or merchandise after 30 days.<br/>
                            <b>Our purpouse is your satisfaction...</b>
                        </p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
    table,tr,th,td{
        border: 1px solid black;
        border-collapse: collapse;
    }
</style>


