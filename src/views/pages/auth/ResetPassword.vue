<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, reactive } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, sameAs} from '@vuelidate/validators';
import { useRouter } from 'vue-router';

import MessageService from '@/service/MessageService';
import UsersService from '@/service/UsersService';


const { layoutConfig } = useLayout();
const router = useRouter();
const message = ref([]) ;
const formResetPassword = reactive({
    passwordA: '',
    passwordRe: ''
});

//Validation rules
const rules = computed(()=>({
    passwordA: { required, minLength: minLength(6) },
    passwordRe: { required, minLength: minLength(6) }
}));

const vResetPassword$ = useVuelidate(rules,formResetPassword);

//functions
async function submitResetPassword() {
    const msgService = new MessageService();
    try{
        event.preventDefault()
        const resultValidation = await vResetPassword$.value.$validate();
        if (!resultValidation){
            return;
        }
        if(formResetPassword.passwordA === formResetPassword.passwordRe){
            const userService = new UsersService();
            const response = await userService.resetPass(formResetPassword);
            msgService.successMessageSimple(response.message ,'Continue')
            router.push({name: 'login'});
        }else{
            msgService.errorMessageSimple("The passwors dont match");
            return;
        }
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
                        <div class="text-900 text-3xl font-medium mb-3">Reset your password for Blue Star Packing App</div>
                    </div>
                    <div>
                        <form>
                            <transition-group tag="div">
                                <Message v-for="msg of message" :severity="msg.severity" :key="msg.id">{{ msg.content }}</Message>
                            </transition-group>
                            <div class="flex flex-column">
                                <label for="inpPasswordA" class="block font-medium text-l mb-2" :class="{'p-error':vResetPassword$.passwordA.$error}">Please enter the new password:</label>
                                <Password 
                                    id="inpPasswordA" 
                                    v-model="formResetPassword.passwordA" 
                                    :toggleMask="true" 
                                    class="w-full" 
                                    inputClass="w-full" 
                                    :inputStyle="{ padding: '1rem' }"
                                    :class="{'p-invalid':vResetPassword$.passwordA.$error}"
                                    :feedback="true"
                                    ></Password>
                                <small id="inpPasswordA-help" class="p-error" v-if="vResetPassword$.passwordA.$error">{{ vResetPassword$.passwordA.$errors[0].$message }}</small>
                            </div>
                            
                            <div class="flex flex-column mt-5">
                                <label for="inpPasswordRe" class="block font-medium text-l mb-2" :class="{'p-error':vResetPassword$.passwordRe.$error}">Re enter the new Password:</label>
                                <Password 
                                    id="inpPasswordRe" 
                                    v-model="formResetPassword.passwordRe" 
                                    :toggleMask="true" 
                                    class="w-full" 
                                    inputClass="w-full" 
                                    :inputStyle="{ padding: '1rem' }"
                                    :class="{'p-invalid':vResetPassword$.passwordRe.$error}"
                                    :feedback="true"
                                    ></Password>
                                <small id="inpPasswordRe-help" class="p-error" v-if="vResetPassword$.passwordRe.$error">{{ vResetPassword$.passwordRe.$errors[0].$message }}</small>
                            </div>
                            <div class="col-12 mt-5">
                                <Button type="submit" label="Change Password" class="w-full p-3 text-xl" @click.prevent="submitResetPassword()"></Button>
                            </div>
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
