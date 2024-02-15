export default class ReceiveService{
        
    async create(newDataReceive){
        const resReceive = await fetch(import.meta.env.VITE_API_URL + '/receive/create',{
            method: 'POST',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newDataReceive)            
        });
        if( resReceive.ok ){
            return await resReceive.json();
        }
        throw resReceive;
    }
    
    async queryPerDate(date){
        const listReceive = await fetch(import.meta.env.VITE_API_URL + '/receive/list-per-date/'+date,{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(listReceive.ok){
            return await listReceive.json();
        }
        throw listReceive;
    }
    
    async queryDetailsPerDate(date){
        const listReceiveDetails = await fetch(import.meta.env.VITE_API_URL + '/receive/details/list-per-date/'+date,{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(listReceiveDetails.ok){
            return await listReceiveDetails.json();
        }
        throw listReceiveDetails;
    }
    
    async queryDetailsAll(){
        const listReceiveDetails = await fetch(import.meta.env.VITE_API_URL + '/receive/details/list-all/',{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(listReceiveDetails.ok){
            return await listReceiveDetails.json();
        }
        throw listReceiveDetails;
    }
    
    async listAll(){
        const resumeReceive = await fetch(import.meta.env.VITE_API_URL + '/receive/details/list-all',{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(resumeReceive.ok){
            return await resumeReceive.json();
        }
        throw resumeReceive;
    }
    
    async upserTicket(dataTicketToSave){
        const resTicketSave = await fetch(import.meta.env.VITE_API_URL + '/receive/upser/ticket',{
            method: 'POST',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataTicketToSave)       
        });
        if(resTicketSave.ok){
            return await resTicketSave.json();
        }
        throw resTicketSave;
    }
    
    async delete(dataId,followNum){
        const resDeletion = await fetch(import.meta.env.VITE_API_URL + '/receive/delete/' + btoa(dataId) + "/" + followNum,{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        if(resDeletion.ok){
            return await resDeletion.json();
        }
        throw resDeletion;
    }
    
    async bringTicket(idReceive){
        const resTicket = await fetch(import.meta.env.VITE_API_URL + '/receive/ticket/' + idReceive,{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        if(resTicket.ok){
            return await resTicket.json();
        }
        throw resTicket;
    }
}