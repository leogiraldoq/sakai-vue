export default class TrackingService{
        
        async generalResume(){
            const resResumeGeneral = await fetch(import.meta.env.VITE_API_URL + '/track/general',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(resResumeGeneral.ok){
                return await resResumeGeneral.json();
            }
            throw resResumeGeneral;
        }
        
        async customerPreBillProcessResume(){
            const resResumePrePros = await fetch(import.meta.env.VITE_API_URL + '/track/bill/customer',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(resResumePrePros.ok){
                return await resResumePrePros.json();
            }
            throw resResumePrePros;
        }
        
        async detailsBoutiqueProcess(idBoutique){
            const resDetailsPrePros = await fetch(import.meta.env.VITE_API_URL + '/track/bill/boutique/process/prebill/'+idBoutique,{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(resDetailsPrePros.ok){
                return await resDetailsPrePros.json();
            }
            throw resDetailsPrePros;
        }
        
        async billEmployees(){
            const resBillEmployees = await fetch(import.meta.env.VITE_API_URL + '/track/bill/process/users',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(resBillEmployees.ok){
                return await resBillEmployees.json();
            }
            throw resBillEmployees;
        }
        
}