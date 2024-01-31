export default class PickUpCompaniesService{
        
    async getList(){
        const pickUpCompanies = await fetch( import.meta.env.VITE_API_URL + '/pick-up-company/list-all',{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if (pickUpCompanies.ok){
            return await pickUpCompanies.json();
        }
        throw pickUpCompanies;
    }
    
    async create(newPickUpCompany){
        const createdPickUpCompany = await fetch( import.meta.env.VITE_API_URL + '/pick-up-company/create',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( newPickUpCompany )
        });
        if(createdPickUpCompany.ok){
            return await createdPickUpCompany.json();
        }
        throw createdPickUpCompany;
    }
}