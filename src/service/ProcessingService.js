export default class ProcessingService{
        
        async create(formProcessing){
            const resProcessing = await fetch(import.meta.env.VITE_API_URL + '/processing/create',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formProcessing)
            });
            if(resProcessing.ok){
                return await resProcessing.json();
            }
            throw resProcessing;
        }
        
        async listPerUser(){
            const resProcessing = await fetch(import.meta.env.VITE_API_URL + '/processing/list/user',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            });
            if(resProcessing.ok){
                return await resProcessing.json();
            }
            throw resProcessing;
        }
        
        async listPerUserDate(dates){
            const resProcessing = await fetch(import.meta.env.VITE_API_URL + '/processing/list/user/dates',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dates)
            });
            if(resProcessing.ok){
                return await resProcessing.json();
            }
            throw resProcessing;
        }
        
}