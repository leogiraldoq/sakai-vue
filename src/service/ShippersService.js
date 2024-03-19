export default class ShippersService{
    
    async getAll(){
        const listShippers = await fetch(import.meta.env.VITE_API_URL+'/shippers/list-all',{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if(listShippers.ok){
            return await listShippers.json();
        }
        throw listShippers;            
   }
   
   async create(newShop){
        const resShop = await fetch(import.meta.env.VITE_API_URL+'/shippers/create',{
            method: 'POST',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newShop)              
        });
        if(resShop.ok){
            return await resShop.json();
        }
        throw resShop;
   }
   
   async listProcessAndNot(idCustomer){
       const resListShippers = await fetch(import.meta.env.VITE_API_URL+'/shippers/list/process-notprocess/'+idCustomer,{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json' 
       });
       if(resListShippers.ok){
           return await resListShippers.json();
       }
       throw resListShippers;
   }
   
   async itsProcessOrNot(idCustomer,idShipper){
       const resProcessOrNot = await fetch(import.meta.env.VITE_API_URL+'/shippers/verify/process-not/'+idCustomer+'/'+idShipper,{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'            
       });
       if (resProcessOrNot.ok){
           return await resProcessOrNot.json();
       }
       throw resProcessOrNot;
   }
   
   async update(shop){
        const resShop = await fetch(import.meta.env.VITE_API_URL+'/shippers/update',{
            method: 'POST',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(shop)              
        });
        if(resShop.ok){
            return await resShop.json();
        }
        throw resShop;
   }
   
   async delete(idShop,status){
        const resShop = await fetch(import.meta.env.VITE_API_URL+'/shippers/change/'+status+'/'+idShop,{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(resShop.ok){
            return await resShop.json();
        }
        throw resShop;
   }
}