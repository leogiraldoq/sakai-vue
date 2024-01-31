<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';

    import LabelsService from '@/service/LabelsService';
    import MessageService from '@/service/MessageService';
    
    const emit = defineEmits(['createSize'])
    const loadingBtnSizeCreate = ref(false);
    
    
    const formSizeLabelCreate = reactive({
        titleSize:'',
        listLabelSize:[
            {
                position:1,
                size:'',
            },
            {
                position:2,
                size:'',
            },
            {
                position:3,
                size:'',
            },
            {
                position:4,
                size:'',
            },
            {
                position:5,
                size:'',
            },
            {
                position:6,
                size:'',
            },
        ]
    });
    const ruleSizeCreate = computed( () => ({
        titleSize: {required, minLength: minLength(5), maxLength: maxLength(100)}
    }));
    const vSizeLabelCreate$ = useVuelidate(ruleSizeCreate,formSizeLabelCreate);
    
    async function createSizeLabels(){
        const labelservice = new LabelsService()
        const messageservice = new MessageService()
        loadingBtnSizeCreate.value = true;
        try {
            const validateSizeCreate = await vSizeLabelCreate$.value.$validate();
            if(!validateSizeCreate){
                loadingBtnSizeCreate.value = false;    
                return;
            }
            let sizeCreate = await labelservice.createSizeLabel(formSizeLabelCreate)
            await emit('createSize',sizeCreate.data)
            await messageservice.successMessageSimple(sizeCreate.message,"Ok");
            Object.assign(formSizeLabelCreate,{
                titleSize:'',
                listLabelSize:[
                    {
                        position:1,
                        size:''
                    },
                    {
                        position:2,
                        size:''
                    },
                    {
                        position:3,
                        size:''
                    },
                    {
                        position:4,
                        size:''
                    },
                    {
                        position:5,
                        size:''
                    },
                    {
                        position:6,
                        size:''
                    },
                ]
            });
            loadingBtnSizeCreate.value = false;
        }catch (e){
            console.log(e)
            messageservice.errorMessage(e);
            loadingBtnSizeCreate.value = false;
        }
    }
    
</script>

<template>
    <h3 style="font-weight: normal">Create Size</h3>
    <form ref="formCreateLabelsSize" class="p-fluid formgrid grid">
        <div class="field col-12">
            <label for="inpSizeLabelDesc" :class="{'p-error': vSizeLabelCreate$.titleSize.$error}">Title Size Label:</label>
            <InputText 
                id="inpSizeLabelDesc" 
                type="text" 
                v-model="formSizeLabelCreate.titleSize" 
                aria-describedby="inpSizeLabelDesc-help" 
                :class="{'p-invalid': vSizeLabelCreate$.titleSize.$error}"
            />
            <small id="inpSizeLabelDesc-help" class="p-error" v-if="vSizeLabelCreate$.titleSize.$error">{{ vSizeLabelCreate$.titleSize.$errors[0].$message }}</small>
        </div>
        <Divider />
        <div class="field col-12">
            <b>Size:</b>
        </div>
        <div v-for="(textSize,cS) in formSizeLabelCreate.listLabelSize" :key="cS">
            <div class="field col-12">
                <label>Size # {{textSize.position}}</label>
                <InputText  
                    type="text" 
                    v-model="textSize.size"
                />
            </div>
        </div>
        <div class="col-12">
            <Button icon="pi pi-file" type="submit" label="Create size labels" class="w-full p-3 text-sm" @click.prevent="createSizeLabels()" size="small" severity="success" :loading="loadingBtnSizeCreate"/>                    
        </div>
    </form>
</template>


<style scoped>
    @font-face{
        font-family:"ClothesCareLabels";
        src: url('@/assets/fonts/WashCareSymbols.ttf');
    }
    .careClothesFont{
        font-family:"ClothesCareLabels";
    }
</style>
