export default class CustomerService {
        
        async listAll(){
            const responseListAllCustomers = await fetch(import.meta.env.VITE_API_URL + '/costumer/list-all',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (responseListAllCustomers.ok){
                return await responseListAllCustomers.json();
            }
            throw responseListAllCustomers;
        }
        
        
        async create(dataNewCostumer){
            const responseCreateCostumer = await fetch( import.meta.env.VITE_API_URL + '/costumer/create',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify( dataNewCostumer )
            });
            if(responseCreateCostumer.ok){
               return await responseCreateCostumer.json();
            }
            throw responseCreateCostumer;
        }
        
        async getCustomerAndBoutique(){
            const response = await fetch(import.meta.env.VITE_API_URL + '/costumer/list-all/boutiques',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(response.ok){
                return await response.json();
            }
            throw response;
        }
        
        async getCustomer(){
            const setCustomer = await fetch(import.meta.env.VITE_API_URL + '/costumer/list-all/customers',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (setCustomer.ok){
                return await setCustomer.json();
            }
            throw setCustomer;
        }
        
        async getOneCustomer(id){
            const getCustomer = await fetch(import.meta.env.VITE_API_URL + '/costumer/'+id,{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (getCustomer.ok){
                return await getCustomer.json();
            }
            throw getCustomer;
        }
        
        async removeShopNotProcess(dataDelete){
            const resCustomerShopProcess = await fetch(import.meta.env.VITE_API_URL + '/costumer/not-process/delete/shop',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dataDelete)
            });
            if(resCustomerShopProcess.ok){
                return await resCustomerShopProcess.json();
            }
            throw resCustomerShopProcess;
        }
        
        async addShopNotProcess(dataCustomerShopAdd){
            const resAddShopNotProcess = await fetch( import.meta.env.VITE_API_URL + '/costumer/not-process/create/shop',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify( dataCustomerShopAdd )
            });
            if(resAddShopNotProcess.ok){
                return await resAddShopNotProcess.json();
            }
            throw resAddShopNotProcess;
        }

}
