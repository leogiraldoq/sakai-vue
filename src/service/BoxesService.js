export default class BoxesService{
     
     async listAll(){
        const resListBoxes = await fetch(import.meta.env.VITE_API_URL + '/box/list-all',{
            method: "GET",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(resListBoxes.ok){
            return await resListBoxes.json();
        }
        throw resListBoxes;
     }
     
     async create(boxCreate){
         const resBoxCreate = await fetch(import.meta.env.VITE_API_URL + '/box/create',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(boxCreate)
         });
         if(resBoxCreate.ok){
             return await resBoxCreate.json();
         }
         throw resBoxCreate;
     }
        
}