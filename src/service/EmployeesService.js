export default class EmployeesService{
    
    async listAll(){
        const resListEmployees = await fetch(import.meta.env.VITE_API_URL+'/employee/list-all',{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if(resListEmployees.ok){
            return await resListEmployees.json();
        }
        throw resListEmployees;
    };
    
    async createEmployee(dataNewEmployee){
        const responseCreateEmployee = await fetch( import.meta.env.VITE_API_URL + '/employee/create',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( dataNewEmployee )
        });
        if(responseCreateEmployee.ok){
           return await responseCreateEmployee.json();
        }
        throw responseCreateEmployee;
    }
    
    
}