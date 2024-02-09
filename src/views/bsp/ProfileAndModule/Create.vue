<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength, maxLength, email } from '@vuelidate/validators';
    import ProfilesModulesService from '@/service/ProfilesModulesService';
    import MessageService from '@/service/MessageService';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const profilemodulesservice = new ProfilesModulesService();
    const messageservice = new MessageService();

    onMounted( async () =>{
        await getModulesOptions();
    });
    
    async function getModulesOptions(){
        await profilemodulesservice.getAllModules().then((res) => {
            res.data.forEach( (element) => {
                formProfileCreate.modulesPermissions.push({
                    id_module: element.id_module,
                    module_name: element.module_name,
                    create: false,
                    read: false,
                    update: false,
                    erase: false,
                });
            });
        });
    }
    
    const formModuleCreate = reactive({
        module_name: '',
        description: null,
    });
    const rulesModuleCreate = computed(() => ({
        module_name: { required, minLength: minLength(4), maxLength: maxLength(50) },
        description: { minLength: minLength(10), maxLength: maxLength(250) },
    }));
    const vModule$ = useVuelidate(rulesModuleCreate,formModuleCreate);
    async function createNewModule(){    
        try {
            const validationModule = await vModule$.value.$validate();
            if(!validationModule){
                return;
            }
            let newModule = await profilemodulesservice.createModule(formModuleCreate);
            await messageservice.successMessageSimple(newModule.message,"OK");
            formProfileCreate.modulesPermissions.push({
                id_module: newModule.data.id_module,
                module_name: newModule.data.module_name,
                create: false,
                read: false,
                update: false,
                erase: false,
            });
            Object.assign(formModuleCreate,{
                module_name: '',
                description: null,                
            });
        } catch (e) {
            messageservice.errorMessage(e);     
        }

    }
    
    const formProfileCreate = reactive({
        name: '',
        description: '',
        modulesPermissions: [
        ]
    });
    const rulesProfileCreate = computed(()=>({
        name: { required, minLength: minLength(4), maxLength: maxLength(50) },
        description: { required, minLength: minLength(10), maxLength: maxLength(250) },
    }));
    const vProfile$ = useVuelidate(rulesProfileCreate,formProfileCreate);
    async function createNewProfile(){
        try {
            const validateProfile = vProfile$.value.$validate();
            if(!validateProfile){
                return;
            }
            let newProfile = await profilemodulesservice.createProfile(formProfileCreate);
            await messageservice.successMessageSimple(newProfile.message,"OK");
            Object.assign(formProfileCreate,{
                name: '',
                description: '',
                modulesPermissions: [
                ]
            });
            await getModulesOptions();
        } catch (e) {
            console.log(e) 
            messageservice.errorMessage(e);
        }

    }
</script>


<template>
    <div class="grid">
        <div class="col-12 md:col-4">
            <Card>
                <template #title>Create module</template>
                <template #content>
                    <form ref="formModulesCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="inpModuleName" :class="{'p-error': vModule$.module_name.$error}">Name:</label>
                            <InputText 
                                id="inpModuleName" 
                                type="text" 
                                v-model="formModuleCreate.module_name" 
                                aria-describedby="inpModuleName-help" 
                                :class="{'p-invalid': vModule$.module_name.$error}"
                            />
                            <small id="inpModuleName-help" class="p-error" v-if="vModule$.module_name.$error">{{ vModule$.module_name.$errors[0].$message }}</small>
                        </div>
                        
                        <div class="field col-12">
                            <label for="textAreaModuleDesc" :class="{'p-error': vModule$.description.$error}">Description:</label>
                            <Textarea
                                id="textAreaModuleDesc"
                                v-model="formModuleCreate.description"
                                aria-describedby="textAreaModuleDesc-help"
                                :class="{'p-invalid': vModule$.description.$error}"
                                rows="5"
                            />
                            <small id="textAreaModuleDesc-help" class="p-error" v-if="vModule$.description.$error">{{ vModule$.description.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <Button type="submit" label="Create module" class="w-full p-3 text-l" @click.prevent="createNewModule()"></Button>
                        </div>
                    </form>  
                </template>
            </Card>
        </div>
        
        <div class="col-12 md:col-8">
            <Card>
                <template #title>Create profile</template>
                <template #content>
                    <form ref="formProfilesCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="inpProfileName" :class="{'p-error': vProfile$.name.$error}">Name:</label>
                            <InputText 
                                id="inpProfileName" 
                                type="text" 
                                v-model="formProfileCreate.name" 
                                aria-describedby="inpProfileName-help" 
                                :class="{'p-invalid': vProfile$.name.$error}"
                            />
                            <small id="inpProfileName-help" class="p-error" v-if="vProfile$.name.$error">{{ vProfile$.name.$errors[0].$message }}</small>
                        </div>
                        
                        <div class="field col-12">
                            <label for="textAreaProfileDesc" :class="{'p-error': vProfile$.description.$error}">Description:</label>
                            <Textarea
                                id="textAreaProfileDesc"
                                v-model="formProfileCreate.description"
                                aria-describedby="textAreaProfileDesc-help"
                                :class="{'p-invalid': vProfile$.description.$error}"
                                rows="5"
                            />
                            <small id="textAreaProfileDesc-help" class="p-error" v-if="vProfile$.description.$error">{{ vProfile$.description.$errors[0].$message }}</small>
                        </div>
                        
                        <div class="field col-12">
                            <label>Give permission for the modules:</label>
                            <DataTable :value="formProfileCreate.modulesPermissions">
                                <Column field="module_name" header="Module"></Column>
                                <Column field="read" header="Read">
                                    <template #body="slotProps">
                                        <ToggleButton v-model="slotProps.data.read"/>
                                    </template>
                                </Column>
                                <Column field="create" header="Create">
                                    <template #body="slotProps">
                                        <ToggleButton v-model="slotProps.data.create"/>
                                    </template>
                                </Column>
                                <Column field="update" header="Update">
                                    <template #body="slotProps">
                                        <ToggleButton v-model="slotProps.data.update"/>
                                    </template>
                                </Column>
                                <Column field="erase" header="Delete">
                                    <template #body="slotProps">
                                        <ToggleButton v-model="slotProps.data.erase"/>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </form>  
                </template>
                <template #footer>
                    <Button type="submit" label="Create profile" class="w-full p-3 text-l" @click.prevent="createNewProfile()"></Button>         
                </template>
            </Card>
        </div>
    </div>
</template>