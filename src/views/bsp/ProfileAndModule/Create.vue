<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength, maxLength, email } from '@vuelidate/validators';
    import ProfilesModulesService from '@/service/ProfilesModulesService';
    import MessageService from '@/service/MessageService';
    import { useRoute, useRouter } from 'vue-router';
    import { Vue3JsonEditor } from 'vue3-json-editor'
    import MenuAdmin from '@/assets/json/MenuAdmin';
    import MenuBsp from '@/assets/json/MenuBsp';

    const route = useRoute();
    const router = useRouter();
    const profilemodulesservice = new ProfilesModulesService();
    const messageservice = new MessageService();
    const idProfile = ref(route.params.id);
    const showCreate = ref(true)
    const formModuleCreate = reactive({
        module_name: '',
        description: null,
    });
    const textTittle = ref("Create");
    const formProfileCreate = reactive({
        id_profile: null,
        name: null,
        description: null,
        menuBsp: MenuBsp,
        menuAdmin: MenuAdmin,
        modulesPermissions: [
        ]
    });
    const rulesProfileCreate = computed(()=>({
        name: { required, minLength: minLength(4), maxLength: maxLength(50) },
        description: { required, minLength: minLength(10), maxLength: maxLength(250) },
    }));
    const vProfile$ = useVuelidate(rulesProfileCreate,formProfileCreate);
    
    onMounted( async () =>{
        if(idProfile.value){
            showCreate.value = false
            textTittle.value = "Update";
            await profilemodulesservice.getProfileModulesUpdate(idProfile.value).then((res) => {
                Object.assign(formProfileCreate,res.data);
            });
        }else{
            await getModulesOptions();
        }
        
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
    
    async function createNewProfile(){
        try {
            const validateProfile = vProfile$.value.$validate();
            if(!validateProfile){
                return;
            }
            console.log(formProfileCreate)
            let newProfile = await profilemodulesservice.createProfile(formProfileCreate);
            await messageservice.successMessageSimple(newProfile.message,"OK");
            Object.assign(formProfileCreate,{
                name: null,
                description: null,
                menuBsp: JSON.stringify(MenuBsp),
                menuAdmin: JSON.stringify(MenuAdmin),
                modulesPermissions: [
                ]
            });
            await getModulesOptions();
        } catch (e) {
            console.log(e) 
            messageservice.errorMessage(e);
        }
    }
    
    const showMenuAdmin = ref(false);
    const showMenuBsp = ref(false);
    function changeBspMenu(value){
        formProfileCreate.menuBsp = value
    }
    function changeAdminMenu(value){
        formProfileCreate.menuAdmin = value
    }
    
    function bringOriginalMenuBsp(){
        formProfileCreate.menuBsp = MenuBsp
    }
    
    function bringOriginalMenuAdmin(){
        formProfileCreate.menuAdmin = MenuAdmin
    }
    
    async function updateProfile(){
        try {
            const validateProfile = vProfile$.value.$validate();
            if(!validateProfile){
                return;
            }
            let newProfile = await profilemodulesservice.updateProfile(formProfileCreate);
            await messageservice.successMessageSimple(newProfile.message,"OK");
            Object.assign(formProfileCreate,{
                name: null,
                description: null,
                menuBsp: JSON.stringify(MenuBsp),
                menuAdmin: JSON.stringify(MenuAdmin),
                modulesPermissions: [
                ]
            });
            router.push({
                name:'profilesmodules',
            });
        } catch (e) { 
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
                    </form>  
                </template>
                <template #footer>
                    <Button type="submit" label="Create module" class="w-full p-3 text-l" @click.prevent="createNewModule()"></Button>
                </template>
            </Card>
        </div>
        <div class="col-12 md:col-8">
            <Card>
                <template #title>{{ textTittle }} profile</template>
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
                    <div class=" grid col-12">
                        <div class="field col-12 md:col-6">
                            <Button label="Menu BlueStar" class="w-full p-3 text-l" severity="help" @click="showMenuBsp = true"></Button>
                        </div>
                        <div class="field col-12 md:col-6">
                            <Button label="Menu Admin" class="w-full p-3 text-l" severity="help" @click="showMenuAdmin = true" outlined></Button>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <template v-if="showCreate">
                        <Button type="submit" severity="success" icon="pi pi-save" label="Create profile" class="w-full p-3 text-l" @click.prevent="createNewProfile()" ></Button>         
                    </template>
                    <template v-else=>
                        <Button type="submit" severity="info" icon="pi pi-pencil" label="Update profile" class="w-full p-3 text-l" @click.prevent="updateProfile()" ></Button>         
                    </template>
                        
                </template>
            </Card>
        </div>
        
        <Sidebar v-model:visible="showMenuBsp" position="left" class="w-full md:w-30rem lg:w-40rem">
            <template #header>
                <h5 class="text-left">Menu Blue star to profile <b>{{ formProfileCreate.name }}</b></h5>
                <Tag class="mr-2 cursor-pointer" severity="secondary" @click="bringOriginalMenuBsp()">Bring all the menu</Tag>
            </template>
            <Vue3JsonEditor
                v-model="formProfileCreate.menuBsp"
                :show-btns="false"
                :expandedOnStart="true"
                @json-change="changeBspMenu"
              />
        </Sidebar>
        
        <Sidebar v-model:visible="showMenuAdmin" position="left" class="w-full md:w-30rem lg:w-40rem">
            <template #header>
                <h5>Menu Administrator to profile <b>{{ formProfileCreate.name }}</b></h5>
                <Tag class="mr-2 cursor-pointer" severity="secondary" @click="bringOriginalMenuAdmin()">Bring all the menu</Tag>
            </template>
            <Vue3JsonEditor
                v-model="formProfileCreate.menuAdmin"
                :show-btns="false"
                :expandedOnStart="true"
                @json-change="changeAdminMenu"
              />
        </Sidebar>
    </div>
</template>