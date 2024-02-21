export default class QualityService{
        
        async create(qualityControl){
            const quality = await fetch(import.meta.env.VITE_API_URL + '/quality/create',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(qualityControl)
             });
             if(quality.ok){
                 return await quality.json();
             }
             throw quality;
        }
}

