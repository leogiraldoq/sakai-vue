export default class LabelsService{
    
    
    async getAllContents(){
        const resLabelsContents = await fetch(import.meta.env.VITE_API_URL+'/label/print/content/list-all',{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if(resLabelsContents.ok){
            return await resLabelsContents.json();
        }
        throw resLabelsContents;
    }
    
    async getAllSize(){
        const resLabelSize = await fetch(import.meta.env.VITE_API_URL+'/label/print/size/list-all',{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if(resLabelSize.ok){
            return await resLabelSize.json();
        }
        throw resLabelSize;
    }
    
    async createContentLabel(dataNewContent){
        const resContentCreate = await fetch(import.meta.env.VITE_API_URL+'/label/print/content/create',{
           method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( dataNewContent ) 
        });
        if(resContentCreate.ok){
            return await resContentCreate.json();
        }
        throw resContentCreate;
    }
    
    async createSizeLabel(dataNewSize){
        const resSizeCreate = await fetch(import.meta.env.VITE_API_URL+'/label/print/size/create',{
           method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( dataNewSize ) 
        });
        if(resSizeCreate.ok){
            return await resSizeCreate.json();
        }
        throw resSizeCreate;
    }
}