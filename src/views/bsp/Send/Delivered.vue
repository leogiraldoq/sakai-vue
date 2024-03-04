<script setup>
    import { ref,reactive,computed,onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import moment from 'moment';
    
    import SendService from '@/service/SendService';
    import UsersService from '@/service/UsersService'; 
    import MessageService from '@/service/MessageService';
    
    const route = useRoute();
    const customerId = ref(route.params.id);
    const whoaim = ref(null);
    const userService = new UsersService();
    const sendService = new SendService();
    const customerDeliverData = ref([]);
    
    
    onMounted( async ()=>{
        await userService.me().then((res) => (whoaim.value = res.data));
        await sendService.customerToDelivery(customerId.value).then((res)=>(customerDeliverData.value = res.data));
        
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
    
    
    
    
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Delivery by <b>{{ whoaim.nameEmploye }}</b></template>
                <template #content>
                    <div class="grid">
                        <div class="col-12 md:col-6 text-center">
                            <img src="/layout/images/logoBlueStarPacking.png" alt="Blue Star Packing" class="w-10"/>
                            <b>Shipping Receipt # {{ticket.follow_number}}</b><br/>
                            <small>1316 STANFORD AV. UNIT -A LOS ANGELES CA 90021</small><br/>
                            <small>PHONE (562)835-2515 and (323)274-8378</small><br/>
                            <small>bluestarpacking@gmail.com</small><br/>
                            <small>www.bluestarpackingla.com</small><br/>
                            <p>
                                <b>Customer:</b> {{ticket.customer.name}}<br/>
                                <b>Date shipped:</b> {{parseDate(ticket.created_at)}}<br/>
                                <b>Shipped By:</b> {{whoaim.nameEmploye}}
                            </p>
                            <p>Resume shipped:</p>
                            <table class="text-center mb-2 ml-1 ticketFont">
                                <tr>
                                    <th>Quant</th>
                                    <th>Store</th>
                                    <th>Prod</th>
                                    <th>Size</th>
                                    <th>WT(Lbs)</th>
                                </tr>
                                <tr v-for="(resume,tR) in ticket.receive_details" :key="tR">
                                    <td>{{resume.quantity_box}}</td>
                                    <td>{{resume.boutiques.name}}</td>
                                    <td>{{resume.boxes.products.name}}</td>
                                    <td>{{resume.boxes.dimensions}}</td>
                                    <td>{{resume.weight_box}}</td>
                                </tr>
                            </table>
                            <p class="ticketFont">
                                <b>Important Notice:</b> Your satisfaction is our motivation to be the best in the Los Angeles Fashion District Area... Your merchandise was handled with the best quality standars by the highly qualified personnel of our company... Feel free to contact us for any questions, complains or suggestions. To customer service +1 (323) 274-8378 Monday to Friday from 10 AM to 5 PM Pacific time or Visit our website wwww.bluestarpackingla.com. Thank You... We apreciate your bussines... BlueStar Packing INC. is not responsable for any kind of items or merchandise after 30 days.<br/>
                                <b>Our purpouse is your satisfaction...</b>
                            </p>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>