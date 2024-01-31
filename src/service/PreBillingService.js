export default class PreBillingService{
        
        async create(preBillCreate){
            const preBill = await fetch(import.meta.env.VITE_API_URL + '/pre-bill/create',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(preBillCreate)
            });
            if(preBill.ok){
                return await preBill.json();
            }
            throw preBill;
        }
        
}