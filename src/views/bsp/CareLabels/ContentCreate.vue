<script setup>
    import { ref, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';
    import IconsWashCare from '@/assets/json/IconsWashCare'

    import LabelsService from '@/service/LabelsService';
    import MessageService from '@/service/MessageService';

    const loadingBtnContentCreate = ref(false);
    const showWashCareIcons = ref(false);
    const iconsCareWash = reactive(IconsWashCare);    
    const iconSelected = ref([]);
    const emit = defineEmits(['createOptions']);
    
    function addIcon(icon){
        if(icon.check){
            iconSelected.value.push(icon.content);
        }
    }
    function removeIcon(iconR){
        this.iconsCareWash = this.iconsCareWash.filter(function(iC){
            if(iC.content == iconR){
                iC.check = false
                for(var i = iconSelected.value.length; i--;){
                    if(iconSelected[i].value === iconR) iconSelected.value.splice(i,1);
                }
            }
            return iC;
        })
    }
    
    const formTitleLabelCreate = reactive({
        titleLabelContent:'',
        contentLabel:[
            {
                position:1,
                text:''
            },
            {
                position:2,
                text:''
            },
            {
                position:3,
                text:''
            },
            {
                position:4,
                text:''
            },
            {
                position:5,
                text:''
            },
            {
                position:6,
                text:''
            },
            {
                position:7,
                text:''
            },
            {
                position:8,
                text:''
            },
            {
                position:9,
                text:''
            },
            {
                position:10,
                text:''
            },
            {
                position:11,
                text:''
            },
            {
                position:12,
                text:''
            }
        ]
    });
    const ruleTitleLabelCreate = computed( () => ({
        titleLabelContent: {required, minLength: minLength(5), maxLength: maxLength(100)}
    }));
    const vTitleLabelCreate$ = useVuelidate(ruleTitleLabelCreate,formTitleLabelCreate);
    async function createContentLabel(){
        const messageservice = new MessageService()
        const labelservice = new LabelsService()
        loadingBtnContentCreate.value = true;
        try {
            const validateContentCreate = await vTitleLabelCreate$.value.$validate();
            if(!validateContentCreate){
                loadingBtnContentCreate.value = false;    
                return;
            }
            if(iconSelected.value.length > 0) formTitleLabelCreate.contentLabel.push({position:13,text:iconSelected.value.join('')});
            let contentCreate = await labelservice.createContentLabel(formTitleLabelCreate);
            await emit('createOptions',contentCreate.data);
            await messageservice.successMessageSimple(contentCreate.message,"Ok");
            iconSelected.value = [];
            Object.assign(formTitleLabelCreate,{
                titleLabelContent:'',
                contentLabel:[
                    {
                        position:1,
                        text:''
                    },
                    {
                        position:2,
                        text:''
                    },
                    {
                        position:3,
                        text:''
                    },
                    {
                        position:4,
                        text:''
                    },
                    {
                        position:5,
                        text:''
                    },
                    {
                        position:6,
                        text:''
                    },
                    {
                        position:7,
                        text:''
                    },
                    {
                        position:8,
                        text:''
                    },
                    {
                        position:9,
                        text:''
                    },
                    {
                        position:10,
                        text:''
                    },
                    {
                        position:11,
                        text:''
                    },
                    {
                        position:12,
                        text:''
                    },
                    {
                        position:13,
                        text:''
                    }
                ],
                washIcons:''
            });
            loadingBtnContentCreate.value = false;
        }catch (e){
            console.log(e)
            messageservice.errorMessage(e);
            loadingBtnContentCreate.value = false;
        }
    }
    
</script>

<template>

        <h3 style="font-weight: normal">Create Content</h3>
        <form ref="formCreateLabelsTitle" class="p-fluid formgrid grid">
            <div class="field col-12">
                <label for="inpTitleLabelDesc" :class="{'p-error': vTitleLabelCreate$.titleLabelContent.$error}">Title Label:</label>
                <InputText 
                    id="inpTitleLabelDesc" 
                    type="text" 
                    v-model="formTitleLabelCreate.titleLabelContent" 
                    aria-describedby="inpTitleLabelDesc-help" 
                    :class="{'p-invalid': vTitleLabelCreate$.titleLabelContent.$error}"
                />
                <small id="inpTitleLabelDesc-help" class="p-error" v-if="vTitleLabelCreate$.titleLabelContent.$error">{{ vTitleLabelCreate$.titleLabelContent.$errors[0].$message }}</small>
            </div>
            <Divider />
            <div class="field col-12">
                <b>Contents</b>
            </div>
            <div v-for="(content,cC) in formTitleLabelCreate.contentLabel" :key="cC">
                <div class="field col-12">
                    <label>Position # {{content.position}}</label>
                    <InputText  
                        type="text" 
                        v-model="content.text"
                    />
                </div>
            </div>
            <div class="field col-12 inline-block">
                <label class="">Care Clothes Wash:</label>
                <Button icon="pi pi-plus" label="Add" class="text-sm " @click="showWashCareIcons = true" size="small" severity="secondary"/>
                <div class="col-12 border-solid border-1 w-full mt-2 p-2" id="divClothesCare">
                    <template  v-for="(iconsCare,iC) in iconSelected" :key="iC">
                        <Chip class="careClothesFont text-xl justify-content-center align-items-center pt-4 mr-1" removable @remove="removeIcon(iconsCare)"> {{ iconsCare }} </Chip>
                    </template>
                </div>
            </div>
            <div class="col-12">
                <Button icon="pi pi-file" type="submit" label="Create content labels" class="w-full p-3 text-sm" @click.prevent="createContentLabel()" size="small" severity="success" :loading="loadingBtnContentCreate"/>                    
            </div>
        </form>
        
        <Dialog v-model:visible="showWashCareIcons" modal header="Header" :style="{width: '50vw'}" :bereakpoints="{'1199px': '75vw','575px': '90vw'}">
            <template #header>
                <div class="flex align-items-center justify-content-center gap-2">
                    Select the Wash Care Icons that you need
                </div>
            </template>
            <div class="grid-nogutter careClothesFont">
                <div class="grid">
                    <template v-for="(icons,cI) in iconsCareWash" :key="cI">
                        <div class="col">
                            <ToggleButton class="careClothesFont text-3xl pt-6" v-model="icons.check" :onLabel="icons.content" :offLabel="icons.content" v-tooltip="icons.description" @click="addIcon(icons)"> </ToggleButton>
                        </div>
                    </template>
                </div>
            </div>
            <template #footer>
                <Button label="Close" icon="pi pi-close" @click="showWashCareIcons=false"/>
            </template>
        </Dialog>
        
</template>


<style scoped>
    @font-face{
        font-family:"ClothesCareLabels";
        src: url('@/assets/fonts/WashCareSymbols.ttf');
    }
    .careClothesFont{
        font-family:"ClothesCareLabels";
    }
    .labelSize{
        width: 1in;
        height: 2,2in;
    }
</style>