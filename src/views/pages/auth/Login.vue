<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, reactive } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength} from '@vuelidate/validators';
import { useRouter } from 'vue-router';



const { layoutConfig } = useLayout();
const router = useRouter();
const message = ref([]) ;
const formLogin = reactive({
    username: '',
    password: ''
});

localStorage.removeItem("token");

//Validation rules
const rules = computed(()=>({
    username: { required },
    password: {
        required,
        minLength: minLength(4)
    }
}));

const v$ = useVuelidate(rules,formLogin);

//functions
async function submitLogin() {
    const resultValidation = await v$.value.$validate();
    message.value=[];
    if (!resultValidation){
        return;
    }
    
    try{
        event.preventDefault()
        const response = await fetch(import.meta.env.VITE_API_URL+"/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username":formLogin.username,
                "password":formLogin.password  
            })
        });
        let dataReturn = await response.json();
        if(dataReturn.access_token){
            localStorage.setItem('token',dataReturn.access_token);
            router.push({name: dataReturn.route});
        }else{
            message.value = [
                { severity: 'error', content: dataReturn.error, id: 1}
            ];
        }
    }catch(err){
        message.value = [
            { severity: 'error', content: err, id: 1}
        ];
    }
    
}

function redirectForgotPassword(){
    router.push({name: 'forgot-password'});
}

</script>

<template>
    <div class="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-1 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/layout/images/logoBlueStarPacking.png" alt="Blue Star Packing" class="mb-2 w-15rem flex-shrink-0" />
                        <div class="text-900 text-3xl font-medium mb-3">Welcome to Blue Star Packing!</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div>
                    <div>
                        <form>
                            <transition-group tag="div">
                                <Message v-for="msg of message" :severity="msg.severity" :key="msg.id">{{ msg.content }}</Message>
                            </transition-group>
                            <div class="flex flex-column mb-5">
                                <label for="inpUsername" class="block text-l font-medium mb-2" :class="{'p-error': v$.username.$error}">Username</label>
                                <InputText 
                                    id="inpUsername" 
                                    type="text" 
                                    class="w-full md:w-30rem mb-1" 
                                    style="padding: 1rem" 
                                    v-model="formLogin.username" 
                                    aria-describedby="inpUsername-help"
                                    :class="{'p-invalid': v$.username.$error}"
                                />
                                <small id="inpUsername-help" class="p-error" v-if="v$.username.$error">{{ v$.username.$errors[0].$message }}</small>
                            </div>
                            
                            <div class="flex flex-column">
                                <label for="inpPassword" class="block font-medium text-l mb-2" :class="{'p-error':v$.password.$error}">Password</label>
                                <Password 
                                    id="inpPassword" 
                                    v-model="formLogin.password" 
                                    :toggleMask="true" 
                                    class="w-full" 
                                    inputClass="w-full" 
                                    :inputStyle="{ padding: '1rem' }"
                                    :class="{'p-invalid':v$.password.$error}"
                                    :feedback="false"
                                    ></Password>
                                <small id="inpPassword-help" class="p-error" v-if="v$.password.$error">{{ v$.password.$errors[0].$message }}</small>
                            </div>
                            
                            <div class="flex align-items-center justify-content-between mt-5 mb-3 gap-5">
                                <div class="flex align-items-center text-center">
                                    <a class="font-medium no-underline text-center cursor-pointer" style="color: var(--primary-color)" @click="redirectForgotPassword()">Forgot password?</a>                            
                                </div>    
                            </div>
                            <Button type="submit" label="Sign In" class="w-full p-3 text-xl" @click.prevent="submitLogin()"></Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

body{
    background-image: url("../../../../layout/images/background.svg");
    background-repeat: repeat;
}
</style>
