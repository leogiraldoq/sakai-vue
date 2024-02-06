<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import moment from 'moment';
    
    import printJS from 'print-js';
    import { jsPDF } from "jspdf";
    import domtoimage from "dom-to-image";
    import ReceiveService from '@/service/ReceiveService';
    import MessageService from '@/service/MessageService';
    
    
    const props = defineProps(['data']);
    const ticket = props.data;
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
    onMounted( async ()=>{
        await domtoimage.toPng(ticketToPrint.value).then((imageData) => {
            const pdf = new jsPDF("p","in",[4,11]);
            pdf.addImage(imageData,"PNG",0.07,0.05,4,11);
            var pdfOut = pdf.output('blob');
            var reader = new FileReader();
            reader.onloadend = () => {
                formTicket.ticket = reader.result
                saveTicket();
            }
            reader.readAsDataURL(pdfOut)
            console.log(formTicket.ticket)
        });
        
    });
    
    function parseDate(date){
        return moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
    
    async function saveTicket(){
        const messageService = new MessageService();
        try {
            const receiveService = new ReceiveService();
            const resTicket = await receiveService.upserTicket(formTicket);
            pdfs.ticket = resTicket.data.ticket;
            pdfs.stickers = 'data:application/pdf;base64,'+resTicket.data.stickers;
            console.log(pdfs)
            pdfPrintDialog.value = true;
        } catch (e) {
            console.log(e)
            messageService.errorMessage(e)
        }
    }
    
    function convertBlobPdf(base64File){
        console.log(base64File)
        const byteCharacters = atob(base64File);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++){
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray],{ type: 'application/pdf'});
    }
    
    async function printTicket(){
        var printIframeTicket = document.getElementById('pdfTicketFrame');
        if(printIframeTicket){
           await printIframeTicket.contentWindow.print();
        } else {
            console.log(printIframeTicket);
        }
    }
    
    async function printStickers(){
        let printIframeStickers = document.getElementById('pdfStickersFrame');
        if(printIframeStickers){
            await printIframeStickers.contentWindow.print();
        } else {
            console.log(printIframeStickers);
        }
    }
</script>

<template>
    <div class="grid justify-content-center align-items-center text-black-alpha-90" ref="ticketToPrint" id="ticketToPrint">
        <div class="col-12 text-center">
            <img src="/layout/images/logoBlueStarPacking.png" alt="Blue Star Packing" class="w-10"/>
            <b>Receiving Receipt # {{ticket.follow_number}}</b><br/>
            <small>1316 STANFORD AV. UNIT -A LOS ANGELES CA 90021</small><br/>
            <small>PHONE (562)835-2515 and (323)274-8378</small><br/>
            <small>bluestarpacking@gmail.com</small><br/>
            <small>www.bluestarpackingla.com</small><br/>
            <p><b>Shipper:</b> {{ticket.shipper.name}}<br/>
                <b>Customer:</b> {{ticket.customer.name}}<br/>
                <b>Date receive:</b> {{parseDate(ticket.created_at)}}</p>
            <p>Resume receive:</p>
            <table class="text-center text-sm mb-2">
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
                    <td>{{resume.boxes.describe}}</td>
                    <td>{{resume.boxes.dimensions}}</td>
                    <td>{{resume.weight_box}}</td>
                </tr>
            </table>
            <p><b>Received By:</b> {{ticket.user.employee.names}}</p>
            <p class="text-sm"><b>Important Notice:</b> Blue Star Packing INC, is not responsable for lost or damage pieces, on any kind of merchandise. This receipt is valid only packages as in boxes or bags and not by pieces. Merchandise in all packages and boxes are subject to revision after delivery date and therfore will not be counted upon delivery. Stores will be notified in the event of missing or damage pieces. Blue Star Packing it is not responsible fro any kind of nerchandise after 30 days of the date printed on this receip. Thank you!</p>
        </div>
    </div>
    <Dialog :visible="pdfPrintDialog" modal header="Print" :style="{ width: '25rem' }">
        <div class="grid">
            <div class="col-6">
                <iframe :src="pdfs.ticket" id="pdfTicketFrame" width="100%"></iframe>
            </div>
            <div class="col-6">
                <iframe :src="pdfs.stickers" id="pdfStickersFrame" width="100%"></iframe>
            </div>
        </div>
        <template #footer>
            <Button label="Print Ticket" icon="pi pi-print" severity="info" @click="printTicket()"/>
            <Button label="Print Stickers" icon="pi pi-print" outlined severity="info" @click="printStickers()" autofocus />
        </template>
    </Dialog>
</template>

<style scoped>
    table,tr,th,td{
        border: 1px dotted black;
        border-collapse: collapse;
    }
</style>