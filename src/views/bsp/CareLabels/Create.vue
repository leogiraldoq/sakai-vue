<script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { helpers, required, minLength, maxLength, numeric } from '@vuelidate/validators';

    import LabelsService from '@/service/LabelsService';
    import MessageService from '@/service/MessageService';
    
    import LabelContentOptions from './ContentCreate.vue'
    import LabelSizeOptions from './SizeCreate.vue'
    import LabelCreateDocumentToPrint from './PreviewPrint.vue'
    
    const labelContentOptions = ref([]);
    const labelSizeOptions = ref([]);
    const sideBarContent = ref(false);
    const sideBarSize = ref(false);
    const sideBarLabelsPrint = ref(false);
    const loadingBtnSizeCreate = ref(false);
    const showPreview = ref(false);
    const showWashCareIcons = ref(false);
    
    const labelservice = new LabelsService();
    
    onMounted(async () => {
       await labelservice.getAllContents().then((data) => (labelContentOptions.value = data.data));
       await labelservice.getAllSize().then((data) => (labelSizeOptions.value = data.data));
    });
    const formOptionsLabels = reactive({
        contentLabel:null,
        sizeLabel:null,
        styleLabel:null,
        cutLabel:null,
        brandLabel:null,
        quantity:[0,0,0,0,0,0] 
    });
    const rulesFormOptionsLabels = computed(()=>({
        contentLabel: {required},
        sizeLabel: {required},
        styleLabel: {minLength: minLength(1),maxLength: maxLength(4)},
        cutLabel: {minLength: minLength(1),maxLength: maxLength(10)},
        brandLabel: {minLength: minLength(1),maxLength: maxLength(10)},        
    }));
    const vLabelOptions$ = useVuelidate(rulesFormOptionsLabels,formOptionsLabels);

    function setOptionsCreateLabel(newOption){
        sideBarContent.value = false
        labelContentOptions.value.push(newOption);
    }
    
    function setSizeCreateLabel(newSize){
        sideBarSize.value = false
        labelSizeOptions.value.push(newSize)
    }
    
    function createPrintLabels(){    
        sideBarLabelsPrint.value=true
    }
    
</script>

<template>
    <div class="grid">
        <Sidebar v-model:visible="sideBarContent" position="right" class="w-full md:w-30rem lg:w-20rem">
            <LabelContentOptions @createOptions="setOptionsCreateLabel"></LabelContentOptions>
        </Sidebar>
        
        <Sidebar v-model:visible="sideBarSize" position="right" class="w-full md:w-30rem lg:w-20rem">
            <LabelSizeOptions @createSize="setSizeCreateLabel"></LabelSizeOptions>
        </Sidebar>
         
        <div class="col-12">
            <Card>
                <template #title>Create and Print Size Labels</template>
                <template #subtitle>Choose the options for create and print size labels</template>
                <template #content>
                    <form ref="formOptionsCreateLabels" class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="dpdLabelsContent" :class="{'p-error': vLabelOptions$.contentLabel.$error}">Title of contents:</label>  <Tag class="mr-2 cursor-pointer" severity="success" @click="sideBarContent = true">New title</Tag>
                            <Dropdown
                                id="dpdLabelsContent"
                                showClear
                                placeholder="Select contents"
                                v-model="formOptionsLabels.contentLabel" 
                                :options="labelContentOptions" 
                                optionLabel="title_content"
                                optionValue="list_contents"
                                aria-describedby="dpdLabelsContent-help"
                                :class="{'p-invalid': vLabelOptions$.contentLabel.$error}"
                            />
                            <small id="dpdLabelsContent-help" class="p-error" v-if="vLabelOptions$.contentLabel.$error">{{ vLabelOptions$.contentLabel.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="dpdLabelSize" :class="{'p-error': vLabelOptions$.sizeLabel.$error}">Size:</label> <Tag class="mr-2 cursor-pointer" severity="success" @click="sideBarSize = true">New size</Tag>
                            <Dropdown
                                id="dpdLabelSize"
                                showClear
                                placeholder="Select size"
                                v-model="formOptionsLabels.sizeLabel" 
                                :options="labelSizeOptions" 
                                optionLabel="title_label_size"
                                optionValue="list_size"
                                aria-describedby="dpdLabelSize-help"
                                :class="{'p-invalid': vLabelOptions$.sizeLabel.$error}"
                            />
                            <small id="dpdLabelSize-help" class="p-error" v-if="vLabelOptions$.sizeLabel.$error">{{ vLabelOptions$.sizeLabel.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12 md:col-4">
                            <label for="inpLabelStyle" :class="{'p-error': vLabelOptions$.styleLabel.$error}">Style:</label>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    Style #
                                </span>
                                <InputText 
                                    id="inpLabelStyle" 
                                    type="text" 
                                    v-model="formOptionsLabels.styleLabel" 
                                    aria-describedby="inpLabelStyle-help" 
                                    :class="{'p-invalid': vLabelOptions$.styleLabel.$error}"
                                />
                            </div>
                            <small id="inpLabelStyle-help" class="p-error" v-if="vLabelOptions$.styleLabel.$error">{{ vLabelOptions$.styleLabel.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12 md:col-4">
                            <label for="inpLabelCut" :class="{'p-error': vLabelOptions$.cutLabel.$error}">Cut:</label>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    Cut #
                                </span>
                                <InputText 
                                    id="inpLabelCut" 
                                    type="text" 
                                    v-model="formOptionsLabels.cutLabel" 
                                    aria-describedby="inpLabelCut-help" 
                                    :class="{'p-invalid': vLabelOptions$.cutLabel.$error}"
                                />
                            </div>
                            <small id="inpLabelCut-help" class="p-error" v-if="vLabelOptions$.cutLabel.$error">{{ vLabelOptions$.cutLabel.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12 md:col-4">
                            <label for="inpLabelBrand" :class="{'p-error': vLabelOptions$.brandLabel.$error}">Brand:</label>
                            <InputText 
                                id="inpLabelBrand" 
                                type="text" 
                                v-model="formOptionsLabels.brandLabel" 
                                aria-describedby="inpLabelBrand-help" 
                                :class="{'p-invalid': vLabelOptions$.brandLabel.$error}"
                            />
                            <small id="inpLabelBrand-help" class="p-error" v-if="vLabelOptions$.brandLabel.$error">{{ vLabelOptions$.brandLabel.$errors[0].$message }}</small>
                        </div>
                    </form>
                </template>
            </Card>
            
            <Card>
                <template #title>Preview Labels to Print</template>
                <template #content>
                    <div class="grid">
                        <template v-for="(label,cL) in JSON.parse(formOptionsLabels.sizeLabel)" :key="cL" class="col-3">
                            <div v-if="label.size" class="md:col-3 lg:col-2 col-12">
                                <p class="text-center border-solid border-1 p-1 text-xs line-height-2 pt-8">
                                    <template class="mb-1" v-for="(content,cP) in JSON.parse(formOptionsLabels.contentLabel)" :key="cP-1">
                                        <template v-if="content.text && cP<12">
                                            {{ content.text}}<br/>
                                        </template>
                                    </template>
                                    <br/>
                                    <b class="careClothesFont text-xl"> {{ JSON.parse(formOptionsLabels.contentLabel)[12].text }}</b><br/>
                                    <b v-if="formOptionsLabels.styleLabel" class="text-sm">Style/Estilo# {{formOptionsLabels.styleLabel}}</b><br/>
                                    <b class="text-xl">Size/Talla<br/>{{ label.size }}</b>
                                </p>
                                <div class="field text-center">
                                    <label>Quantity to Print (size {{ label.size }}):</label>
                                    <InputNumber 
                                        v-model="formOptionsLabels.quantity[cL]" 
                                        style="width: 3rem"
                                        showButtons 
                                        buttonLayout="vertical"
                                        decrementButtonClassName="p-button-secondary"
                                        decrementButtonIcon="pi pi-minus"
                                        incrementButtonClassName="p-button-secondary"
                                        incrementButtonIcon="pi pi-plus"
                                    />
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
                <template #footer>
                    <div class="col-12">
                        <Button icon="pi pi-print" type="submit" label="Generate labels" class="p-3 text-l" @click.prevent="sideBarLabelsPrint = true"/>
                    </div>
                </template>
            </Card>
        </div>
    </div>
    <Sidebar v-model:visible="sideBarLabelsPrint" position="full">
        <LabelCreateDocumentToPrint :labels="formOptionsLabels" ></LabelCreateDocumentToPrint>
    </Sidebar>
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