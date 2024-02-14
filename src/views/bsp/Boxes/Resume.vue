<script setup>
    import { ref, onMounted, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength, maxLength } from '@vuelidate/validators';

    import BoxesService from '@/service/BoxesService';
    import MessageService from '@/service/MessageService';
    
    const boxesService = new BoxesService();
    const messageService = new MessageService();
    
    const boxesResume = ref([]);
    
    onMounted( async() => {
        await boxesService.listAll().then( (res) => ( boxesResume.value = res.data));
    });
    
    const formBoxCreate = reactive({
        describe:'',
        dimensions:''
    });
    const rulesFormBoxCreate = computed(()=> ({
        describe: {required,minLength: minLength(1), maxLength: maxLength(20)},
        dimensions: {required,minLength: minLength(2), maxLength: maxLength(10)},        
    }));
    const vBoxCreate$ = useVuelidate(rulesFormBoxCreate,formBoxCreate);
    
    async function createBox(){
        try {
            const validationBoxCreate = await vBoxCreate$.value.$validate();
            if(!validationBoxCreate){
                return;
            }
            let newBox = await boxesService.create(formBoxCreate);
            await messageService.successMessageSimple(newBox.message,"Ok!");
            boxesResume.value.push(newBox.data);
            Object.assign(formBoxCreate,{
                describe:'',
                dimensions:''
            });
            vBoxCreate$.value.$reset();
        } catch (e) {
            messageService.errorMessage(e);        
        }
    }
</script>
<template>
    <div class="grid">
        <div class=" col-6">
            <Card>
                <template #title>Resume Boxes</template>
                <template #content>
                    <DataTable :value="boxesResume" size="small" stripedRows paginator :rows="6">
                        <Column field="describe" header="Description"></Column>
                        <Column field="dimensions" header="Dimensions"></Column>
                        <Column field="active" header="Status">
                            <template #body="{ data }" class='text-bold align-content-center'>
                                <slot v-if='data.active == 1'>
                                    <i class="pi pi-check-circle text-green-900"></i>
                                </slot>
                                <slot v-if='data.active == 0'>
                                    <i class="pi pi-times-circle text-red-900"></i>
                                </slot>
                            </template>                                
                        </Column>
                        <Column header="Actions">
                        <template #body="{data}">
                            <span class="p-buttonset">
                                <Button label="Update" size="small" severity="warning" outlined :value="data"/>
                                <Button label="Delete" size="small" severity="danger" outlined :value="data.id_box"/>
                            </span>
                        </template>
                    </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
        <div class="col-6">
            <Card>
                <template #title>Create</template>
                <template #content>
                    <form ref="formBoxesCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="inpBoxDescrive" :class="{'p-error': vBoxCreate$.describe.$error}">Description:</label>
                            <InputText 
                                id="inpBoxDescribe" 
                                type="text" 
                                v-model="formBoxCreate.describe"
                                aria-describedby="inpBoxDescribe-help"
                                :class="{'p-invalid':vBoxCreate$.describe.$error}"
                            />
                            <small id="inpBoxDescribe-help" class="p-error" v-if="vBoxCreate$.describe.$error">{{ vBoxCreate$.describe.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <label for="inpBoxDimension" :class="{'p-error': vBoxCreate$.dimensions.$error}">Dimension:</label>
                            <InputText 
                                id="inpBoxDimension" 
                                type="text" 
                                v-model="formBoxCreate.dimensions"
                                aria-describedby="inpBoxDimension-help"
                                :class="{'p-invalid':vBoxCreate$.dimensions.$error}"
                            />
                            <small id="inpBoxDimension-help" class="p-error" v-if="vBoxCreate$.dimensions.$error">{{ vBoxCreate$.dimensions.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <Button type="submit" label="Create box" class="w-full p-3" @click.prevent="createBox()"></Button>
                        </div>
                    </form>
                </template>
            </Card>
        </div>
            
    </div>
    
</template>
    
    
