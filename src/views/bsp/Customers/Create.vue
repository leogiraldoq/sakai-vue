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
    const countIn = ref(0);
    const messageService = new MessageService();
    
    onMounted( async ()=> {
        const pickupcompanyservice = new PickUpCompaniesService();
        await pickupcompanyservice.getList().then( (data) => (pickUpOptions.value = data.data));
        
    });
    
    const formCreateCustomer = reactive({
        name: null,
        pickUpCompanyId: null,
        upsNumberAccount: null,
        g_contact_name: null,
        g_phone: null,
        g_email: null,
        g_reemail: null,
        boutiques: [
            {
                name: null,
                address: null,
                city: null,
                final_destination: null,
                contacts:[
                    {
                        contact_name: null,
                        phone: null,
                        email: null,
                        reemail: null

                    }
                ]
            }
        ]  
    });
    
    const rulesCustomerCreate = computed(()=>({
       name: { required, minLength: minLength(3), maxLength: maxLength(50)},
       pickUpCompanyId: { required,numeric },
       upsNumberAccount: { numeric },
       g_contact_name: { required,minLength: minLength(4), maxLength: maxLength(50) },
       g_phone: { required},
       g_email: { required, email },
       g_reemail: { required, email },
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
        if(formCreateCustomer.pickUpCompanyId === null || formCreateCustomer.pickUpCompanyId === ''){
            showUpsAccount.value = false;
        } else {
            if ((pickUpOptions.value.find((o) => o.id_pick_up_company === formCreateCustomer.pickUpCompanyId).name === "UPS")){
                showUpsAccount.value = true;
            }else{
                showUpsAccount.value = false;
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
                    email:'',
                    reemail:''
                }
            ]   
        });
    }
    
    function removeFormBoutique(cBoutique){
        if( formCreateCustomer.boutiques.length > 1 ){
            formCreateCustomer.boutiques.splice(cBoutique,1);
        }
    }
    
    function sameAddress(numBoutique){
        formCreateCustomer.boutiques[numBoutique].final_destination = formCreateCustomer.boutiques[numBoutique].address;
    }
    
    function sameGeneralContact(numBoutique,numContact){
        console.log(numBoutique,numContact)
        if(formCreateCustomer.g_contact_name == null || formCreateCustomer.g_phone == null || formCreateCustomer.g_email == null || formCreateCustomer.g_reemail == null){
            messageService.errorMessageSimple("Please fill all the inputs for the contact general information","Got it!");
        }else{
            Object.assign(formCreateCustomer.boutiques[numBoutique].contacts[numContact],{
                contact_name: formCreateCustomer.g_contact_name,
                phone: formCreateCustomer.g_phone,
                email: formCreateCustomer.g_email,
                reemail: formCreateCustomer.g_reemail
            });            
        }
    }
    
    function addFormBoutiqueContact(cContact){
        formCreateCustomer.boutiques[cContact].contacts.push({
            contact_name:'',
            phone: '',
            email:'',
            reemail:''
        });
    }
    
    function removeFormBoutiqueConatct(cBoutique,cContact){
        if( formCreateCustomer.boutiques[cBoutique].contacts.length > 1 ){
            formCreateCustomer.boutiques[cBoutique].contacts.splice(cContact,1);
        }
    }
    
    async function createCustomer(){
        try{
            const validationCustomer = await valCosCreate$.value.$validate();
            const customerservice = new CustomerService();
            let customerCreate = await customerservice.create(formCreateCustomer);
            await messageService.successMessage(router,customerCreate.message,'customers',"Create other customert","Go to customer list");
            Object.assign(formCreateCustomer,{
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
                                email:'',
                                reemail:''
                            }
                        ]
                    }
                ]  
            });
        }catch(e){
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
                            v-model="formCreateCustomer.upsNumberAccount" 
                            aria-describedby="inpCustomerUpsAccount-help" 
                            :class="{'p-invalid': valCosCreate$.upsNumberAccount.$error}"
                        />
                        <small id="inpCustomerUpsAccount-help" class="p-error" v-if="valCosCreate$.upsNumberAccount.$error">{{ valCosCreate$.upsNumberAccount.$errors[0].$message }}</small>
                    </div>
                    <div class="col-12 mt-3">
                        <h5>Contact Information</h5>
                        <Divider/>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="inpContactName" :class="{'p-error': valCosCreate$.g_contact_name.$error}">Names:</label>
                        <InputText 
                            v-model="formCreateCustomer.g_contact_name"
                            id="inpContactName"
                            aria-describedby="inpContactName-help"
                            :class="{'p-invalid': valCosCreate$.g_contact_name.$error}"
                        />
                        <small id="inpContactName-help" class="p-error" v-if="valCosCreate$.g_phone.$error">{{ valCosCreate$.g_phone.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="inpContactPhone">Phone:</label>
                        <InputText  
                            v-model="formCreateCustomer.g_phone"
                            id="inpContactPhone"
                            aria-describedby="inpContactPhone-help"
                            :class="{'p-invalid': valCosCreate$.g_phone.$error}"
                        />
                        <small id="inpContactPhone-help" class="p-error" v-if="valCosCreate$.g_phone.$error">{{ valCosCreate$.g_phone.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12">
                        <label for="inpContactEmail" :class="{'p-error': valCosCreate$.g_email.$error}">Email:</label>
                        <InputText  
                            type="text" 
                            v-model="formCreateCustomer.g_email"
                            id="inpContactEmail"
                            aria-describedby="inpContactEmail-help"
                            :class="{'p-invalid': valCosCreate$.g_email.$error}"
                        />
                        <small id="inpContactEmail-help" class="p-error" v-if="valCosCreate$.g_email.$error">{{ valCosCreate$.g_email.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12">
                        <label for="inpContactReEmail" :class="{'p-error': valCosCreate$.g_reemail.$error}">Verify the Email:</label>
                        <InputText  
                            type="text" 
                            v-model="formCreateCustomer.g_reemail"
                            id="inpContactReEmail"
                            aria-describedby="inpContactReEmail-help"
                            :class="{'p-invalid': valCosCreate$.g_reemail.$error}"
                            @paste.prevent
                        />
                        <small id="inpContactReEmail-help" class="p-error" v-if="valCosCreate$.g_reemail.$error">{{ valCosCreate$.g_reemail.$errors[0].$message }}</small>
                    </div>
                </div>
            </template>
            <template #footer>
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
                                    <label>Final destination:</label> <Tag class="mr-2 cursor-pointer" severity="secondary" @click="sameAddress(cB)">Same address</Tag>
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
                                            <template v-for="(contact,cC) in boutique.contacts" :key="cC">
                                                <Fieldset :toggleable="true" class="mb-3">
                                                    <template #legend>
                                                        <div class="flex align-items-center p-0 m-0">
                                                            <span class="font-bold">Contact # {{cC+1}}</span>
                                                            <Button icon="pi pi-trash" class="ml-3" @click="removeFormBoutiqueConatct(cB,cC)" severity="danger" text rounded/>
                                                        </div>
                                                    </template>
                                                    <Tag class="mr-2 cursor-pointer" severity="secondary" @click="sameGeneralContact(cB,cC)">Same general contact</Tag></br>
                                                    <div class="p-fluid formgrid grid">
                                                        <div class="field col-12 md:col-6">
                                                            <label>Names:</label>
                                                            <InputText  
                                                                type="text" 
                                                                v-model="contact.contact_name"
                                                            />
                                                        </div>
                                                        <div class="field col-12 md:col-6">
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
                                                        <div class="field col-12">
                                                            <label for="inpBoutiqueContactReEmail">Verify the Email:</label>
                                                            <InputText  
                                                                type="text" 
                                                                v-model="contact.reemail"
                                                                @paste.prevent
                                                            />
                                                        </div>

                                                    </div>
                                                </Fieldset>
                                            </template>
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
        <div class="col-12">
            <Button icon="pi pi-star-fill" type="submit" label="Create Customer" class="w-full" @click.prevent="createCustomer()"/>
        </div>
    </div>
</template>