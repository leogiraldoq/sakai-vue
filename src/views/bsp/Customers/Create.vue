<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, email, numeric } from '@vuelidate/validators';
    import { useRouter } from 'vue-router';
    
    import MessageService from '@/service/MessageService';
    import PickUpCompaniesService from '@/service/PickUpCompaniesService';
    import CustomerService from '@/service/CustomerService';
    
    const router = useRouter();
    const pickUpOptions = ref([]);
    const showUpsAccount = ref(false);
    
    onMounted( async ()=> {
        const pickupcompanyservice = new PickUpCompaniesService();
        await pickupcompanyservice.getList().then( (data) => (pickUpOptions.value = data.data));
        
    });
    
    const formCreateCustomer = reactive({
        name: '',
        pickUpCompanyId: null,
        upsNumberAccount:'',
        boutiques: [
            {
                name:'',
                address:'',
                city:'',
                final_destination:'',
                contacts:[
                    {
                        contact_name:'',
                        phone: '',
                        email:''
                    }
                ]
            }
        ]  
    });
    
    const rulesCustomerCreate = computed(()=>({
       name: { required, minLength: minLength(3), maxLength: maxLength(50)},
       pickUpCompanyId: { required,numeric },
       upsNumberAccount: { numeric },
       boutiques:{
           $each: helpers.forEach({
                name: { required, minLength: minLength(3), maxLength: maxLength(50) },
                address: { required, minLength: minLength(7), maxLength: maxLength(255) },
                city: { required, minLength: minLength(3), maxLength: maxLength(50) },
                contacts:{
                    $each: helpers.forEach({
                        contact_name: { required, minLength: minLength(5), maxLength: maxLength(50) },
                        phone: { required, minLength: minLength(13), maxLength: maxLength(15) },
                        email: { required, email },
                    })
                }
           })
       }
    }));
    const valCosCreate$ = useVuelidate(rulesCustomerCreate,formCreateCustomer);
    
    function onChangeVerify(){
        if(this.formCreateCustomer.pickUpCompanyId === null || this.formCreateCustomer.pickUpCompanyId === ''){
            this.showUpsAccount = false;
        } else {
            if ((this.pickUpOptions.find((o) => o.id_pick_up_company === this.formCreateCustomer.pickUpCompanyId).name === "UPS")){
                this.showUpsAccount = true;
            }else{
                this.showUpsAccount = false;
            }
        }    
    }
    
    function addFormBoutique(){
        formCreateCustomer.boutiques.push({
            name:'',
            address: '',
            city:'',
            final_destination:'',
            contacts:[
                {
                    contact_name:'',
                    phone: '',
                    email:''
                }
            ]   
        });
    }
    
    function removeFormBoutique(cBoutique){
        if( formCreateCustomer.boutiques.length > 1 ){
            formCreateCustomer.boutiques.splice(cBoutique,1);
        }
    }
    
    function addFormBoutiqueContact(cContact){
        formCreateCustomer.boutiques[cContact].contacts.push({
            contact_name:'',
            phone: '',
            email:''        
        });
    }
    
    function removeFormBoutiqueConatct(cBoutique,cContact){
        if( formCreateCustomer.boutiques[cBoutique].contacts.length > 1 ){
            formCreateCustomer.boutiques[cBoutique].contacts.splice(cContact,1);
        }
    }
    
    async function createCustomer(){
        const messageService = new MessageService();
        try{
            const validationCustomer = await valCosCreate$.value.$validate();
            const customerservice = new CustomerService();
            let customerCreate = await customerservice.create(this.formCreateCustomer);
            await messageService.successMessage(this.router,customerCreate.message,'customers',"Create other customert","Go to customer list");
            Object.assign(this.formCreateCustomer,{
                name: '',
                pickUpCompanyId: null,
                upsNumberAccount:'',
                boutiques: [
                    {
                        name:'',
                        address:'',
                        city:'',
                        final_destination:'',
                        contacts:[
                            {
                                contact_name:'',
                                phone: '',
                                email:''
                            }
                        ]
                    }
                ]  
            });
        }catch(e){
            console.log(e)
            messageService.errorMessage(e);
        }
    }
    
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <Card>
                <template #title>Create Customers, Boutiques and Contacts</template>
            </Card>
        </div>
        <div class="col-12 md:col-6">
            <Card>
            <template #title>Customer General Information</template>
            <template #content>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <label for="inpCustomerName" :class="{'p-error': valCosCreate$.name.$error}">Name:</label>
                        <InputText 
                            id="inpCustomerName" 
                            type="text" 
                            v-model="formCreateCustomer.name" 
                            aria-describedby="formCreateCustomer-help" 
                            :class="{'p-invalid': valCosCreate$.name.$error}"
                        />
                        <small id="formCreateCustomer-help" class="p-error" v-if="valCosCreate$.name.$error">{{ valCosCreate$.name.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12">
                        <label for="dpdCustomerPickUpCompany" :class="{'p-error': valCosCreate$.pickUpCompanyId.$error}">Pick-Up Company:</label>
                        <Dropdown
                            id="dpdCustomerPickUpCompany"
                            showClear
                            placeholder="Select"
                            v-model="formCreateCustomer.pickUpCompanyId" 
                            :options="pickUpOptions" 
                            optionLabel="name"
                            optionValue="id_pick_up_company"
                            aria-describedby="dpdCustomerPickUpCompany-help"
                            @change="onChangeVerify()"
                            :class="{'p-invalid': valCosCreate$.pickUpCompanyId.$error}"
                        />
                        <small id="dpdCustomerPickUpCompany-help" class="p-error" v-if="valCosCreate$.pickUpCompanyId.$error">{{ valCosCreate$.pickUpCompanyId.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12" v-if="showUpsAccount">
                        <label for="inpCustomerUpsAccount" :class="{'p-error': valCosCreate$.upsNumberAccount.$error}">UPS Account:</label>
                        <InputText 
                            id="inpCustomerUpsAccount" 
                            type="text" 
                            v-model="formCreateCustomer.upsNumberAccount" 
                            aria-describedby="inpCustomerUpsAccount-help" 
                            :class="{'p-invalid': valCosCreate$.upsNumberAccount.$error}"
                        />
                        <small id="inpCustomerUpsAccount-help" class="p-error" v-if="valCosCreate$.upsNumberAccount.$error">{{ valCosCreate$.upsNumberAccount.$errors[0].$message }}</small>
                    </div>
                </div>
            </template>
            <template #footer>
                <Button icon="pi pi-star-fill" type="submit" label="Create Customer" size="small" class="w-full" @click.prevent="createCustomer()"/>
            </template>
            </Card>
        </div>
        <div class="col-12 md:col-6">
            <Card>
                <template #title>Boutiques</template>
                <template #subtitle>Add boutiques for the customer</template>
                <template #content>
                    <template v-for="(boutique,cB) in formCreateCustomer.boutiques" :key="cB" >
                        <Fieldset :toggleable="true" class="mt-2">
                            <template #legend class="bg-green">
                                Boutique # {{cB+1}} <Button icon="pi pi-trash" class="ml-3" @click="removeFormBoutique(cB)" severity="danger" rounded outlined/>
                            </template>
                            <div class="p-fluid formgrid grid">
                                <div class="field col-12 md:col-6">
                                    <label>Name:</label>
                                    <InputText  
                                        type="text" 
                                        v-model="boutique.name"
                                    />
                                </div>
                                <div class="field col-12 md:col-6">
                                    <label for="inpBoutiquecity">City:</label>
                                    <InputText  
                                        type="text" 
                                        v-model="boutique.city"
                                    />
                                </div>
                                <div class="field col-12">
                                    <label for="inpBoutiqueaddress">Address:</label>
                                    <InputText  
                                        id=""
                                        type="text" 
                                        v-model="boutique.address"
                                    />                                                
                                </div>
                                <div class="field col-12">
                                    <label>Final destination:</label>
                                    <InputText  
                                        id=""
                                        type="text" 
                                        v-model="boutique.final_destination"
                                    />                                                
                                </div>

                                <div class="col-12 mt-3">
                                    <Card>
                                        <template #title>Contacts</template>
                                        <template #subtitle>Contacts from Boutique # {{cB+1}}, add all you want to notificate for the state for this boxes and merchandasing</template>
                                        <template #content>
                                            <Accordion :activeIndex="0">
                                                <AccordionTab v-for="(contact,cC) in boutique.contacts" :key="cC">
                                                    <template #header>
                                                        <span class="flex align-items-center gap-2 w-full">
                                                            <span class="font-bold white-space-nowrap">Contact # {{cC+1}}</span>
                                                            <Button icon="pi pi-trash" class="ml-3" @click="removeFormBoutiqueConatct(cB,cC)" severity="danger" rounded outlined/>
                                                        </span>
                                                    </template>
                                                    <div class="p-fluid formgrid grid">
                                                        <div class="field col-12">
                                                            <label>Names:</label>
                                                            <InputText  
                                                                type="text" 
                                                                v-model="contact.contact_name"
                                                            />
                                                        </div>
                                                        <div class="field col-12">
                                                            <label for="inpBoutiqueContactPhone">Phone:</label>
                                                            <InputText  
                                                                type="text" 
                                                                v-model="contact.phone"
                                                            />
                                                        </div>
                                                        <div class="field col-12">
                                                            <label for="inpBoutiqueContactEmail">Email:</label>
                                                            <InputText  
                                                                type="text" 
                                                                v-model="contact.email"
                                                            />
                                                        </div>
                                                    </div>
                                                </AccordionTab>
                                            </Accordion>
                                        </template>
                                        <template #footer>
                                            <Button icon="pi pi-user-plus" label="Add Contact" @click="addFormBoutiqueContact(cB)" size="small" severity="secondary"/>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </Fieldset>
                    </template>
                </template>
                <template #footer>
                    <Button icon="pi pi-plus" label="Add Boutique" severity="success" @click="addFormBoutique()" size="small" class="w-full"/>
                </template>
            </Card>
        </div>
    </div>
</template>