<script setup>
import { ref, reactive, computed, inject, onMounted} from 'vue';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, email } from '@vuelidate/validators';
import { useRouter } from 'vue-router';

import EmployeesService from '@/service/EmployeesService';
import MessageService from '@/service/MessageService';
import ProfilesModulesService from '@/service/ProfilesModulesService';

onMounted(async()=>{
    const profileService = new ProfilesModulesService();
    await profileService.getAllProfiles().then((res)=>(profiles.value=res.data));
    console.log(profiles)
});

const profiles = ref(null);
const router = useRouter();
const toast = useToast();
const moment = inject('moment');
const formCreateEmployee = reactive({
       names: '',
       last_names: '',
       phone: '',
       email: null,
       title: '',
       address: '',
       city: '',
       postal_code: '',
       birth: '',
       user: 'No',
       username: null,
       profile: null
});
console.log(formCreateEmployee)
//Validation rules
const rules = computed(()=>({
    names: { required, minLength: minLength(4), maxLength: maxLength(50) },
    last_names: { required, minLength: minLength(4), maxLength: maxLength(50) },
    phone: { required, minLength: minLength(12), maxLength: maxLength(13) },
    email: { required, email },
    title: { required, minLength: minLength(3), maxLength: maxLength(20) },
    address: { required, minLength: minLength(10), maxLength: maxLength(50) },
    city: { required, minLength: minLength(5), maxLength: maxLength(20) },
    postal_code: { required, minLength: minLength(5), maxLength: maxLength(5) },
    birth: { required },
}));

const v$ = useVuelidate(rules,formCreateEmployee);
const loadingBtnCreateEmployee = ref(false);

function showUsername(){
    if(this.formCreateEmployee.email == ''){
        toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill up the employee email first'});
        return;
    }
    const emailSplited = this.formCreateEmployee.email.split('@');
    this.formCreateEmployee.username = emailSplited[0];
    return;
}

async function createEmployee(){
    const messageService = new MessageService();
    this.loadingBtnCreateEmployee = true;
    try{
        const validation = await v$.value.$validate();
        if(!validation){
            this.loadingBtnCreateEmployee = false;
            return;
        }
        this.formCreateEmployee.birth = moment(this.formCreateEmployee.birth).format('YYYY-MM-DD');
        const employeesService = new EmployeesService(messageService);
        let employeeCreate = await employeesService.createEmployee(this.formCreateEmployee);
        await messageService.successMessage(this.router,employeeCreate.message,'employees',"Create other employee","Go to employees list");
        Object.assign(this.formCreateEmployee,{
            names: '',
            last_names: '',
            phone: '',
            email: null,
            title: '',
            address: '',
            city: '',
            postal_code: '',
            birth: '',
            user: 'No',
            username: null,
            profile: null
        });
        v$.value.$reset();
        this.loadingBtnCreateEmployee = false;
    } catch(err){
        messageService.errorMessage(err);
        this.loadingBtnCreateEmployee = false;
    }
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Create Employee</h5>
                <form ref="formEmployeesCreate" class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-4">
                        <label for="inpEmpNames" :class="{'p-error': v$.names.$error}">Names</label>
                        <InputText 
                            id="inpEmpNames" 
                            type="text" 
                            v-model="formCreateEmployee.names" 
                            aria-describedby="inpEmpNames-help" 
                            :class="{'p-invalid': v$.names.$error}"
                        />
                        <small id="inpEmpNames-help" class="p-error" v-if="v$.names.$error">{{ v$.names.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="inpEmpLastname" :class="{'p-error': v$.last_names.$error}">Lastname</label>
                        <InputText 
                            id="inpEmpLastname" 
                            type="text"
                            v-model="formCreateEmployee.last_names"
                            aria-describedby="inpEmpLastname-help" 
                            :class="{'p-invalid': v$.last_names.$error}"                            
                            />
                        <small id="inpEmpLastname-help" class="p-error" v-if="v$.last_names.$error">{{ v$.last_names.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="inpEmpTitle" :class="{'p-error': v$.title.$error}">Title</label>
                        <InputText 
                            id="inpEmpTitle" 
                            type="text"
                            v-model="formCreateEmployee.title"
                            aria-describedby="inpEmpTitle-help" 
                            :class="{'p-invalid': v$.title.$error}"                            
                            />
                        <small id="inpEmpTitle-help" class="p-error" v-if="v$.title.$error">{{ v$.title.$errors[0].$message }}</small>
                    </div>

                    <div class="field col-12">
                        <label for="inpEmpAddress" :class="{'p-error':v$.address.$error}">Address</label>
                        <InputText 
                            id="inpEmpAddress" 
                            type="text" 
                            v-model="formCreateEmployee.address"
                            aria-describedby="inpEmpAddress-help"
                            :class="{'p-invalid':v$.address.$error}"
                            />
                        <small id="inpEmpAddress-help" class="p-error" v-if="v$.address.$error">{{ v$.address.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-8 md:col-3">
                        <label for="inpEmpCity" :class="{'p-error':v$.city.$error}">City</label>
                        <InputText 
                            id="inpEmpCity" 
                            type="text" 
                            v-model="formCreateEmployee.city"
                            aria-describedby="inpEmpCity-help"
                            :class="{'p-invalid': v$.city.$error}"
                            />
                        <small id="inpEmpCity-help" class="p-error" v-if="v$.city.$error">{{ v$.city.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="inpEmpPostalCode" :class="{'p-error':v$.postal_code.$error}">Postal Code</label>
                        <InputText 
                            id="inpEmpPostalCode" 
                            type="text"
                            v-model="formCreateEmployee.postal_code"
                            aria-describedby="inpEmpPostalCode-help"
                            :class="{'p-invalid':v$.postal_code.$error}"
                            />
                        <small id="inpEmpPostalCode-help" :class="{'p-error':v$.postal_code.$error}" v-if="v$.postal_code.$error">{{ v$.postal_code.$errors[0].$message }}</small>
                    </div>
                    
                    <div class="field col-12 md:col-3">
                        <label for="inpEmpBirthdate" :class="{'p-error':v$.birth.$error}">Birthdate</label>
                        <Calendar 
                            id="inpEmpBirthdate" 
                            v-model="formCreateEmployee.birth" 
                            aria-describedby='inpEmpBirthdate-help'
                            :class="{'p-invalid': v$.birth.$error}"
                            touchUI
                            showIcon/>
                        <small id='inpEmpBirthdate-help' :class="{'p-error':v$.birth.$error}" v-if="v$.birth.$error">{{ v$.birth.$errors[0].$message }}</small>
                    </div>
                    
                    <div class="field col-12 md:col-3">
                        <label for="inpEmpPhone" :class="{'p-error': v$.phone.$error}">Phone</label>
                        <InputText 
                            id="inpEmpPhone" 
                            type="text" 
                            v-model="formCreateEmployee.phone"
                            :class="{'p-invalid':v$.phone.$error}"
                            aria-describedby='inpEmpPhone-help'/>
                        <small id="inpEmpPhone-help" :class="{'p-error':v$.phone.$error}" v-if="v$.phone.$error">{{ v$.phone.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="inpEmpEmail" :class="{'p-error':v$.email.$error}">Email</label>
                        <InputText 
                            id="inpEmpEmail" 
                            type="text"
                            v-model="formCreateEmployee.email"
                            :class="{'p-invalid':v$.email.$error}"
                            aria-describedby='inpEmpEmail-help'/>
                        <small id='inpEmpEmail' :class="{'p-error':v$.email.$error}" v-if="v$.email.$error">{{ v$.email.$errors[0].$message }}</small>
                    </div>
                    <div class="field col-12 md:col-6" v-if="formCreateEmployee.email">
                        <div><label>Create user?</label></div>
                        <div class="flex flex-wrap gap-3 mt-3">
                            <div class="flex align-items-center">
                                <RadioButton v-model="formCreateEmployee.user" inputId="rbEmployeeUserYes" name="rbEmployeUser" value="Yes" @click="showUsername()" />
                                <label for="rbEmployeeUserYes" class="ml-2">Yes</label>
                            </div>
                            <div class="flex align-items-center">
                                <RadioButton v-model="formCreateEmployee.user" inputId="rbEmployeeUserNo" name="rbEmployeUser" value="No" :value="formCreateEmployee.user" @click="formCreateEmployee.username = null"/>
                                <label for="rbEmployeeUserNo" class="ml-2">No</label>
                            </div>
                        </div>
                    </div>
                    <template v-if="formCreateEmployee.username">
                        <div class="field col-12 md:col-6">
                            <label for="inpEmpUsername">Username</label>
                            <InputText id="inpEmpUsername" type="text" v-model="formCreateEmployee.username" :value="formCreateEmployee.username"/>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="multiUserProfile">Select the profiles</label>
                            <MultiSelect 
                                v-model="formCreateEmployee.profile"
                                display="chip"
                                :options="profiles"
                                optionLabel="name"
                                optionValue="id_profile"
                                placeholder="Select"
                                id="multiUserProfile"
                            />  
                        </div>
                    </template>

                    <div class="field col-12">
                        <Button type="submit" label="Create employee" class="w-full p-3 text-l" @click.prevent="createEmployee()" :loading="loadingBtnCreateEmployee"></Button>
                    </div>
                    <Toast />
                </form>
            </div>
        </div>
    </div>
</template>
