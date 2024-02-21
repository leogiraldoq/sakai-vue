<script setup>
    import { ref, onMounted, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength, maxLength } from '@vuelidate/validators';

    import BoxesService from '@/service/BoxesService';
    import ProductsService from '@/service/ProductsService';
    import MessageService from '@/service/MessageService';
    
    const boxesService = new BoxesService();
    const productService = new ProductsService();
    const messageService = new MessageService();
    
    
    const boxesResume = ref([]);
    const productsOptions = ref([]);
    const productsItems = ref([]);
    
    onMounted( async() => {
        await productService.showWithBox().then( (res) => {
            boxesResume.value = res.data.resume;
            productsOptions.value = res.data.products;
        });
    });
    
    const searchProduct = (event) =>{
        setTimeout(() =>{ 
            if(!event.query){
                productsItems.value = [...productsOptions.value];
            }else{
                productsItems.value = productsOptions.value.filter((product) => {
                    return product.name.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
        },250);
    }
    
    
    const formBoxCreate = reactive({
        productId:'',
        dimensions:''
    });
    const rulesFormBoxCreate = computed(()=> ({
        productId: {required},
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
            boxesResume.value = newBox.data;
            Object.assign(formBoxCreate,{
                productId:'',
                dimensions:''
            });
            vBoxCreate$.value.$reset();
        } catch (e) {
            messageService.errorMessage(e);
        }
    }
    
    const formProduct = reactive({
       name: null 
    });
    
    const rulesFormProduct = computed(() => ({
        name: {required,minLength: minLength(3), maxLength: maxLength(100)}
    }))
    const vProdCreate$ = useVuelidate(rulesFormProduct,formProduct);
    async function createProduct(){
        try {
            const validationProductCreate = await vProdCreate$.value.$validate();
            if(!validationProductCreate){
                return;
            }
            let productCreate = await productService.create(formProduct);
            await messageService.successMessageSimple(productCreate.message,"Ok!");
            productsOptions.value.push(productCreate.data);
            vProdCreate$.value.$reset();
        } catch (e) {
            console.log(e)
            messageService.errorMessage(e);        
        }

    }
    
        
    
</script>
<template>
    <div class="grid">
        <div class=" col-6">
            <Card>
                <template #title>Resume Products/Boxes</template>
                <template #content>
                    <DataTable :value="boxesResume" size="small" stripedRows paginator :rows="6">
                        <Column field="product_name" header="Product"></Column>
                        <Column field="box_dimension" header="Dimensions"></Column>
                        <Column field="box_active" header="Status">
                            <template #body="{ data }" class='text-bold align-content-center'>
                                <slot v-if='data.box_active == 1'>
                                    <i class="pi pi-check-circle text-green-900"></i>
                                </slot>
                                <slot v-if='data.box_active == 0'>
                                    <i class="pi pi-times-circle text-red-900"></i>
                                </slot>
                            </template>                                
                        </Column>
                        <Column header="Actions">
                        <template #body="{data}">
                            <span class="p-buttonset">
                                <Button label="Update" size="small" severity="warning" :value="data"/>
                                <Button label="Delete" size="small" severity="danger" :value="data.id_box"/>
                            </span>
                        </template>
                    </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
        <div class="col-6">
            <Card>
                <template #title>Create Product</template>
                <template #content>
                    <form ref="formProductCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="inpProdName" :class="{'p-error': vProdCreate$.name.$error}">Product Name:</label>
                            <InputText 
                                id="inpProdName" 
                                type="text" 
                                v-model="formProduct.name"
                                aria-describedby="inpProdName-help"
                                :class="{'p-invalid':vProdCreate$.name.$error}"
                            />
                            <small id="inpBoxDescribe-help" class="p-error" v-if="vProdCreate$.name.$error">{{ vProdCreate$.name.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <Button type="submit" label="Create product" class="w-full p-3" @click.prevent="createProduct()"></Button>
                        </div>
                    </form>
                </template>
                
            </Card>
            
            <Card class="mt-5">
                <template #title>Create Box</template>
                <template #content>
                    <form ref="formBoxesCreate" class="p-fluid formgrid grid">
                        <div class="field col-12">
                            <label for="acBoxProduct" :class="{'p-error': vBoxCreate$.productId.$error}">Product:</label>
                            <AutoComplete 
                                id="acBoxProduct"
                                v-model="formBoxCreate.productId"
                                :suggestions="productsItems"
                                optionLabel="name"
                                dropdown
                                aria-describedby="acBoxProduct-help"
                                @complete="searchProduct"
                            />
                            <small id="acBoxProduct-help" class="p-error" v-if="vBoxCreate$.productId.$error">{{ vBoxCreate$.productId.$errors[0].$message }}</small>
                        </div>
                        <div class="field col-12">
                            <label for="inpBoxDimension" :class="{'p-error': vBoxCreate$.dimensions.$error}">Size:</label>
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
    
    
