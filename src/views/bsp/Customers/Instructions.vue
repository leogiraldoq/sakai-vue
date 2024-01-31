<script setup>
    import { ref,reactive,computed,onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    
    import CustomerService from '@/service/CustomerService';
    import InstructionsService from '@/service/InstructionsService';
    import MessageService from '@/service/MessageService';
    
    const route = useRoute();
    const customerId = ref(route.params.id);
    const boutiques = ref();
    const boutiquesResume = ref();
    const boutiquesOptions = ref();
    const instructionsClient = reactive({
        customerId: customerId,
        boutiques:[],
        title: null,
        customerInstructions: null,
        sizeTicket:{
            provide: null,
            place: null,
            careLabel:null,
        },
        hangTag: null,
        bagging:{
            provide: null,
            options: null,
        },
        hangers:null,
        stickerSize: null,
        packing:null,
        shipping:null,
        sampleImage:null,
        specialObservations: null
    });
    const customerName = ref(null);
    const instructionsService = new InstructionsService();
    onMounted( async ()=>{
        const customerService = new CustomerService();
        await instructionsService.listPerBoutique(customerId.value).then((res)=>{
            boutiques.value = res.data;
            boutiquesResume.value = res.data.resume;
            customerName.value = res.data.customer;
        });
        console.log(boutiquesResume.value)
        boutiquesOptions.value = boutiques.value.originalResult;
    });
    function convertImage(e){
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
           instructionsClient.sampleImage = reader.result;
        }
        reader.readAsDataURL(file);
    }
    
    async function createInstructions(){
        const messageService = new MessageService();
        try {
            let resCreatedIns = await instructionsService.create(instructionsClient);
            console.log(resCreatedIns.data)
            messageService.successMessageSimple(resCreatedIns.message,"Got it!");
            Object.assign(instructionsClient,{
                boutiques:[],
                title: null,
                customerInstructions: null,
                sizeTicket:{
                    provide: null,
                    place: null,
                    careLabel:null,
                },
                hangTag: null,
                bagging:{
                    provide: null,
                    options: null,
                },
                hangers:null,
                stickerSize: null,
                packing:null,
                shipping:null,
                sampleImage:null,
                specialObservations: null
            });
        } catch (e) {
            messageService.errorMessage(e)        
        }
    }
    
    function showInstructions(value){
        Object.assign(instructionsClient,JSON.parse(value))
    }
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Instructions for customer {{customerName }}</template>
                <template #subtitle></template>
            </Card>
        </div>
        <div class="col-12 md:col-6">
            <Card>
                <template #title>Resume</template>
                <template #content>
                    <div class="grid">
                        <template v-for="resume in boutiquesResume">
                            <div class="col-12 md:col-6" style="text-align: center;align-content: center;">
                                <Card>
                                    <template #header >
                                        <Image :src="resume.sampleImage" style="width: 100%" width="auto" preview />
                                    </template>
                                    <template #subtitle>
                                        {{ resume.title }}
                                    </template>
                                    <template #content>
                                        {{ resume.name }}
                                    </template>
                                    <template #footer>
                                        
                                            <Button icon="pi pi-eye" severity="info" rounded aria-label="Show Instructions" @click="showInstructions(resume.instructions)"/>
                                            <Button icon="pi pi-check" severity="success" rounded aria-label="Principal"/>
                                            <Button icon="pi pi-trash" severity="danger" rounded aria-label="Principal"/>
                                        
                                    </template>
                                </Card>
                            </div>
                        </template>
                    </div>
                </template>
            </Card>
        </div>
        <div class="col-12 md:col-6">
            <Card>
                <template #title>Create</template>
                <template #content>
                    <form ref="formInstructions" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="multiUserProfile">Select the boutiques to apply for this instructions</label>
                            <MultiSelect 
                                v-model="instructionsClient.boutiques"
                                display="chip"
                                :options="boutiquesOptions"
                                optionLabel="name"
                                optionValue="id_boutique"
                                placeholder="Select boutique"
                                id="multiBoutiques"
                            />
                        </div>
                        <div class="field col-12 mt-3">
                            <label for="inpInstructionTitle">Title:</label>
                            <InputText 
                                id="inpInstructionTitle" 
                                type="text" 
                                v-model="instructionsClient.title" 
                            />
                            <small>Text to identify a instructions for customer Ex. Red labels</small>
                        </div>
                        <div class="col-12 mt-3">
                            <label class="font-bold">Customer instructions / Instrucciones del cliente</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.customerInstructions" inputId="ci-1" name="ci-1" value="Mainlabel only / Solo marca" />
                                    <label for="ci-1" class="ml-2">Mainlabel only / Solo marca</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.customerInstructions" inputId="ci-2" name="ci-1" value="Main label W / Marca con talla" />
                                    <label for="ci-2" class="ml-2">Main label W / Marca con talla</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Size ticket / Talla por separado</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.sizeTicket.provide" inputId="st-1" name="st-1" value="Customer provide / Cliente provee" />
                                    <label for="ci-1" class="ml-2">Customer provide / Cliente provee</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.sizeTicket.provide" inputId="st-2" name="st-1" value="Blue Star provide / Blue Star provee" />
                                    <label for="st-2" class="ml-2">Blue Star provide / Blue Star provee</label>
                                </div>
                            </div>
                            <div class="mt-2">
                                <div>
                                    <RadioButton v-model="instructionsClient.sizeTicket.place" inputId="st-3" name="st-2" value="Middle placement / Preparado" />
                                    <label for="st-3" class="ml-2">Middle placement / Preparado</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.sizeTicket.place" inputId="st-4" name="st-2" value="On the side / A un lado" />
                                    <label for="st-4" class="ml-2">On the side / A un lado</label>
                                </div>
                            </div>
                            <div class="mt-2">
                                <div>
                                    <RadioButton v-model="instructionsClient.sizeTicket.careLabel" inputId="st-5" name="st-3" value="Care label / Etiqueta de contenidos" />
                                    <label for="st-5" class="ml-2">Care label / Etiqueta de contenidos</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Hang tag / Carton</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.hangTag" inputId="ht-1" name="ht-1" value="String / Liston" />
                                    <label for="ht-1" class="ml-2">String / Liston</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.hangTag" inputId="ht-2" name="ht-1" value="Plastic / Plastico" />
                                    <label for="ht-2" class="ml-2">Plastic / Plastico</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.hangTag" inputId="ht-3" name="ht-1" value="Metal" />
                                    <label for="ht-3" class="ml-2">Metal</label>
                                </div>

                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Bagging / Embolsar</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.bagging.provide" inputId="b-1" name="b-1" value="Customer provide bags / Cliente provee bolsas" />
                                    <label for="b-1" class="ml-2">Customer provide bags / Cliente provee bolsas</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.bagging.provide" inputId="b-2" name="b-1" value="Blue Star provide bags / Blue Star provee bolsas" />
                                    <label for="b-2" class="ml-2">Blue Star provide bags / Blue Star provee bolsas</label>
                                </div>
                            </div>
                            <div class="mt-2">
                                <div>
                                    <RadioButton v-model="instructionsClient.bagging.options" inputId="b-3" name="b-2" value="By each Pc / Individual" />
                                    <label for="b-3" class="ml-2">By each Pc / Individual</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.bagging.options" inputId="b-4" name="b-2" value="Brake down 6 by pack / Paquete de 6 piezas" />
                                    <label for="b-4" class="ml-2">Brake down 6 by pack / Paquete de 6 piezas</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.bagging.options" inputId="b-5" name="b-2" value="Both Options / Ambas opciones" />
                                    <label for="b-5" class="ml-2">Both Options / Ambas opciones</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Hangers / Ganchos</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.hangers" inputId="h-1" name="h-1" value="Customer provide hanger / Cliente provee ganchos" />
                                    <label for="h-1" class="ml-2">Customer provide hanger / Cliente provee ganchos</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.hangers" inputId="h-2" name="h-1" value="Blue Star provide hanger / Blue Star provee ganchos" />
                                    <label for="h-2" class="ml-2">Blue Star provide hanger / Blue Star provee ganchos</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Sticker size label on bag / Sticker de talla en la bolsa</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.stickerSize" inputId="ss-1" name="ss-1" value="Customer provide size sticker label / Cliente provee sticker de talla" />
                                    <label for="ss-1" class="ml-2">Customer provide size sticker label / Cliente provee sticker de talla</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.stickerSize" inputId="ss-2" name="ss-1" value="Blue Star provide size sticker label / Blue Star provee sticker de talla" />
                                    <label for="ss-2" class="ml-2">Blue Star provide size sticker label / Blue Star provee sticker de talla</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Packing / Empaque (Some fees apply)</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.packing" inputId="p-1" name="p-1" value="Repacking / Reempacado" />
                                    <label for="p-1" class="ml-2">Repacking / Reempacado</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.packing" inputId="p-2" name="p-1" value="Same box / Misma caja" />
                                    <label for="p-2" class="ml-2">Same box / Misma caja</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.packing" inputId="p-3" name="p-1" value="Full tape boxes" />
                                    <label for="p-3" class="ml-2">Full tape boxes</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Shippingmethod / Opciones de envio (Some fees apply)</label>
                            <div>
                                <div>
                                    <RadioButton v-model="instructionsClient.shipping" inputId="sm-1" name="sm-1" value="Loose Boxes / Cajas sueltas" />
                                    <label for="sm-1" class="ml-2">Loose Boxes / Cajas sueltas</label>
                                </div>
                                <div>
                                    <RadioButton v-model="instructionsClient.shipping" inputId="sm-2" name="sm-1" value="Pallets" />
                                    <label for="sm-2" class="ml-2">Pallets</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <label class="font-bold">Sample</label>
                            <div>
                                <input @change="convertImage" type="file" accept="image/*">
                                <div class="mt-2">
                                    <Image :src="instructionsClient.sampleImage" width="100%" preview/>
                                </div>
                            </div>
                        </div>
                        
                        <div class="field col-12 mt-3">
                            <label for="txaInstructionSpecialObs">Special Observations:</label>
                            <Textarea 
                                id="txaInstructionSpecialObs" 
                                rows="3" 
                                v-model="instructionsClient.specialObservations" 
                            />
                        </div>
                    </form>
                </template>
                <template #footer>
                    <div class="field col-12">
                         <Button type="submit" label="Create intsructions" class="w-full p-3" @click.prevent="createInstructions()"></Button>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>