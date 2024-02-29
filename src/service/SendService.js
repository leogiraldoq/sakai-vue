export default class SendService{
      
      async createPrepare(dataPrepare){
          const resSendCreate = await fetch(import.meta.env.VITE_API_URL + '/send/create',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataPrepare)
         });
         if(resSendCreate.ok){
             return await resSendCreate.json();
         }
         throw resSendCreate;
      }
      
      
      async boxToDelivery(){
          const resToDelivery = await fetch(import.meta.env.VITE_API_URL + '/send/to-deliver',{
            method: "GET",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
         });
         if(resToDelivery.ok){
             return await resToDelivery.json();
         }
         throw resToDelivery;
      }
      
      async customerToDelivery(idCustomer){
          const resCusToDelivery = await fetch(import.meta.env.VITE_API_URL + '/send/to-deliver/customer/'+idCustomer,{
            method: "GET",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
         });
         if(resCusToDelivery.ok){
             return await resCusToDelivery.json();
         }
         throw resCusToDelivery;
      }
}