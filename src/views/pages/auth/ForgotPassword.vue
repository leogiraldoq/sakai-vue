<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, reactive } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email} from '@vuelidate/validators';
import { useRouter } from 'vue-router';

import MessageService from '@/service/MessageService';
import UsersService from '@/service/UsersService';

const { layoutConfig } = useLayout();
const router = useRouter();
const message = ref([]) ;
const formForgotPassword = reactive({
    username: '',
    email: ''
});

//Validation rules
const rules = computed(()=>({
    username: { required,minLength:minLength(4) },
    email: { required, email },
}));

const vForgot$ = useVuelidate(rules,formForgotPassword);

//functions
async function submitForgot() {
    const msgService = new MessageService();
    try{
        event.preventDefault()
        const resultValidation = await vForgot$.value.$validate();
        if (!resultValidation){
            return;
        }
        const userService = new UsersService();
        const response = await userService.forgetPass(formForgotPassword);
        msgService.successMessageSimple(response.message ,'Continue')
        router.push({name: 'login'});
    }catch(err){
        msgService.errorMessage(err);    
    }
}

</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-1 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/layout/images/logoBlueStarPacking.png" alt="Blue Star Packing" class="mb-2 w-15rem flex-shrink-0" />
                        <div class="text-900 text-3xl font-medium mb-3">Forgot Password to Blue Star Packing!</div>
                        <span class="text-600 font-medium">Please fill the form to restore your password</span>
                    </div>
                    <div>
                        <form>
                            <div class="flex flex-column mb-5">
                                <label for="inpUsername" class="block text-l font-medium mb-2" :class="{'p-error': vForgot$.username.$error}">Username</label>
                                <InputText 
                                    id="inpUsername" 
                                    type="text" 
                                    class="w-full md:w-30rem mb-1" 
                                    style="padding: 1rem" 
                                    v-model="formForgotPassword.username" 
                                    aria-describedby="inpUsername-help"
                                    :class="{'p-invalid': vForgot$.username.$error}"
                                />
                                <small id="inpUsername-help" class="p-error" v-if="vForgot$.username.$error">{{ vForgot$.username.$errors[0].$message }}</small>
                            </div>
                            
                            <div class="flex flex-column">
                                <label for="inpEmail" class="block font-medium text-l mb-2" :class="{'p-error':vForgot$.email.$error}">Email:</label>
                                <InputText
                                    id="inpEmail" 
                                    type="text" 
                                    class="w-full md:w-30rem mb-1" 
                                    style="padding: 1rem" 
                                    v-model="formForgotPassword.email" 
                                    aria-describedby="inpEmail-help"
                                    :class="{'p-invalid': vForgot$.email.$error}"
                                />
                                <small id="inpEmail-help" class="p-error" v-if="vForgot$.email.$error">{{ v$.email.$errors[0].$message }}</small>
                            </div>
                            
                            <Button type="submit" label="Restore my password" class="w-full p-3 text-xl mt-5" @click.prevent="submitForgot()"></Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
