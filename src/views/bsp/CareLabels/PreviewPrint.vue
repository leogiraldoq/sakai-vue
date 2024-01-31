<script setup>
    import { ref, onMounted, reactive } from "vue";
    import { jsPDF } from "jspdf";
    import domtoimage from "dom-to-image";
    
    const props = defineProps(['labels']);
    const tableContent = props.labels;
    const labelsToPrint = ref(null);
    onMounted(async ()=>{
        organizePrintLabels();
    });
    
    function createPdf(){
        domtoimage.toPng(labelsToPrint.value,{ quality: 0.95 }).then((imageData) => {
           const pdf = new jsPDF("p","in",[8,11]);
           pdf.addImage(imageData,"PNG",0,0,8,11);
           pdf.save("Labels.pdf")
        });
        /*const doc = new jsPDF()
        doc.text(JSON.stringify(tableContent),0,0)
        doc.save("test.pdf")*/
    }
    
    const labelOrganizated=reactive([]);
    
    function organizePrintLabels(){    
        console.log(tableContent);
        let numCol = 0;
        let numRow = 0;
        labelOrganizated[numRow]= [];
        //for(var q=0;q<=tableContent.quantity.length;q++){
        for(var q=0;q<=tableContent.quantity.length;q++){
            if(tableContent.quantity[q] !== 0){
                for(var l=1;l<=tableContent.quantity[q];l++){
                    labelOrganizated[numRow][numCol]= {
                       size: JSON.parse(tableContent.sizeLabel)[q].size,
                       content: JSON.parse(tableContent.contentLabel),
                       style:tableContent.styleLabel,
                       cut:tableContent.cutLabel,
                       brand:tableContent.brandLabel,
                    }
                    numCol ++;
                    if(numCol === 7 ){
                        numCol = 0;
                        numRow ++ ;
                        labelOrganizated[numRow]= [];
                    }
                }
            }
        }
        console.log(labelOrganizated);
    }
    
</script>

<template>
    <h1>Preview Print</h1>
    <div class="grid">
        <div class="flex col-12 justify-content-center bg-black-alpha-10">
            <div class="flex bg-white align-items-center">
                <table ref="labelsToPrint" style="width:816px;height:1152px">
                    <tr v-for="(labelRow,tr) in labelOrganizated" :key="tr" style="width: 816px;height: 192px">
                        <template v-for="(label,td) in labelRow" :key="td">
                            <td style="width: 96px">
                                <p class="text-center p-1 text-xs line-height-2 pt-3">
                                    <template class="mb-1" v-for="(content,cP) in label.content" :key="cP">
                                        <template v-if="content.text && cP<12">
                                            {{ content.text}}<br/>
                                        </template>
                                    </template>
                                    <br/>
                                    <b class="careClothesFont text-xl"> {{ label.content[12].text }}</b><br/>
                                    <template v-if="label.style">
                                        <b class="text-sm">Style/Estilo# {{label.style}}</b><br/>
                                    </template>
                                    <b class="text-xl">Size/Talla<br/>{{ label.size }}</b>
                                </p>
                            </td>
                        </template>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <Button icon="pi pi-print" label="Print labels" class="p-3 text-l" @click="createPdf"/>
</template>

<style scoped>
    table{
        width: 8in;
    }
    tr{
        height: 2.2in;
    }
    td{
        width: 1in;
        
    }
    @font-face{
        font-family:"ClothesCareLabels";
        src: url('@/assets/fonts/WashCareSymbols.ttf');
    }
    .careClothesFont{
        font-family:"ClothesCareLabels";
    }
</style>