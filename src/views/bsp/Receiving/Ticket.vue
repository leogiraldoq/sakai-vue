<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import moment from 'moment';
    
    import { jsPDF } from "jspdf";
    import domtoimage from "dom-to-image";
    import ReceiveService from '@/service/ReceiveService';
    import MessageService from '@/service/MessageService';
    
    
    const props = defineProps(['data']);
    const emit = defineEmits(['deleteTicket']);
    const action = ref(props.data.action);
    const ticket = props.data.ticket;
    const ticketToPrint = ref(null);
    const formTicket = reactive({
        receiveId: ticket.id_receive,
        ticket: null
    });
    const pdfPrintDialog = ref(false);
    const pdfs = reactive({
        ticket: null,
        stickers: null
    });
    const showDelete = ref(false);
    const webSocketPrinter = ref(null);
    const wsStickersData = reactive({
        file: ticket.print.stickers,
        printer: 'Stickers',
        orientation: 'Landscape',
        file_name: ticket.follow_number+"Sticker"
    });
    const wsTicketsData = reactive({
        file: ticket.print.ticket,
        printer: 'EPSON TM-T88V ReceiptE4',
        orientation: "Portrait",
        file_name: ticket.follow_number+"Ticket"
    })
    
    onMounted( async ()=>{
        if(action.value === "create"){
            await createTicketToPrint();
        }else if (action.value === "delete") {
            showDelete.value = true;
        }
        webSocketPrinter.value = new WebSocket("ws://localhost:8765");
            webSocketPrinter.value.onopen = () => {
                console.log("WebSocket conected");
            }
    });
    
    async function createTicketToPrint(){
        await domtoimage.toPng(ticketToPrint.value).then((imageData) => {
            const pdf = new jsPDF("p","in",[4,11]);
            pdf.addImage(imageData,"PNG",0.3,0.05,4,11);
            var pdfOut = pdf.output('blob');
            var reader = new FileReader();
            reader.onloadend = () => {
                formTicket.ticket = reader.result
                //saveTicket();
            }
            reader.readAsDataURL(pdfOut);
        });
        
    }
    
    function parseDate(date){
        return moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
    
    /*async function saveTicket(){
        const messageService = new MessageService();
        try {
            wsTicketsData.file = formTicket.ticket.replace('data:application/pdf;base64,','');
            printTicket();
            const receiveService = new ReceiveService();
            const resTicket = await receiveService.upserTicket(formTicket);
            
            pdfs.ticket = formTicket.ticket
            pdfs.stickers = 'data:application/pdf;base64,'+ticket.stickers;
            
        } catch (e) {
            console.log(e)
            messageService.errorMessage(e)
        }
    }*/
    
    /*function convertBlobPdf(base64File){
        const byteCharacters = atob(base64File);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++){
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray],{ type: 'application/pdf'});
    }*/
    
    async function printTicket(){
        if (webSocketPrinter.value.readyState  === 1) {
            webSocketPrinter.value.send(JSON.stringify(wsTicketsData));
        }
    }
    
    async function printStickers(){
        if (webSocketPrinter.value.readyState  === 1) {
            webSocketPrinter.value.send(JSON.stringify(wsStickersData));
        }
    }
    
    function yesDelete(idReceive){
        console.log(idReceive);
        emit('deleteTicket',ticket.id_receive);
    }
    
    const showPhoto = ref(false);
</script>

<template>
    <div class="grid justify-content-center align-items-center ticketFont" ref="ticketToPrint" id="ticketToPrint">
        <div class="col-12"><h5>More actions recieve # {{ticket.follow_number}}</h5></div>
        <div class="col-12 text-center">
            <img src="/layout/images/logoBlueStarPacking.png" alt="Blue Star Packing" class="w-10"/>
            <b>Receiving Receipt # {{ticket.follow_number}}</b><br/>
            <small>1316 STANFORD AV. UNIT -A LOS ANGELES CA 90021</small><br/>
            <small>PHONE (562)835-2515 and (323)274-8378</small><br/>
            <small>bluestarpacking@gmail.com</small><br/>
            <small>www.bluestarpackingla.com</small><br/>
            <p><b>Store:</b> {{ticket.shipper.name}}<br/>
                <b>Customer:</b> {{ticket.customer.name}}<br/>
                <b>Date receive:</b> {{parseDate(ticket.created_at)}}</p>
            <p>Resume receive:</p>
            <table class="text-center mb-2 ml-1 ticketFont">
                <tr>
                    <th>Boutique</th>
                    <th>Quant</th>
                    <th>Prod</th>
                    <th>Size</th>
                    <th>WT(Lbs)</th>
                </tr>
                <tr v-for="(resume,tR) in ticket.receive_details" :key="tR">
                    <td>{{resume.boutiques.name}}</td>
                    <td>{{resume.quantity_box}}</td>
                    <td>{{resume.boxes.products.name}}</td>
                    <td>{{resume.boxes.dimensions}}</td>
                    <td>{{resume.weight_box}}</td>
                </tr>
            </table>
            <p><b>Received By:</b> {{ticket.user.employee.names}}</p>
            <p class="ticketFont"><b>Important Notice:</b> Blue Star Packing INC, is not responsable for lost or damage pieces, on any kind of merchandise. This receipt is valid only packages as in boxes or bags and not by pieces. Merchandise in all packages and boxes are subject to revision after delivery date and therfore will not be counted upon delivery. Stores will be notified in the event of missing or damage pieces. Blue Star Packing it is not responsible fro any kind of nerchandise after 30 days of the date printed on this receip. Thank you!</p>
        </div>
        <div class="col-12">
            <Button label="Yes Delete" size="small" severity="danger" icon="pi pi-trash" class="w-full" @click="yesDelete(ticket.id_receive)"/>
            <Button label="Print Ticket" icon="pi pi-print" severity="info" @click="printTicket()" class="w-full"/>
            <Button label="Print Stickers" icon="pi pi-print" outlined severity="info" @click="printStickers()" class="w-full"/>
            <Button label="Who deliver?" icon="pi pi-photo" severity="help" @click="showPhoto=true" class="w-full"/>
        </div>
    </div>
    <Dialog v-model:visible="showPhoto" modal header="Photo deliver" :style="{ width: 'auto' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <Image :src="ticket.photo" alt="Who deliver" preview />
    </Dialog>
    
    
</template>

<style scoped>
    
    
    table,tr,th,td{
        border: 1px solid black;
        border-collapse: collapse;
    }
    .ticketFont {
        font-size: 11px;
    }

</style>
















