export default class ProductsService{
        
        async show(){
            const productsList = await fetch(import.meta.env.VITE_API_URL + '/products/list-all',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(productsList.ok){
                return await productsList.json();
            }
            throw productsList;
        }
        
        async create(product){
            const productCreate = await fetch(import.meta.env.VITE_API_URL + '/products/create',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(product)
             });
             if(productCreate.ok){
                 return await productCreate.json();
             }
             throw productCreate;
        }
        
        async showWithBox(){
            const productsBoxList = await fetch(import.meta.env.VITE_API_URL + '/products/boxes/list',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(productsBoxList.ok){
                return await productsBoxList.json();
            }
            throw productsBoxList;
        }
        
        async showWithBoxAuto(){
            const productsBox = await fetch(import.meta.env.VITE_API_URL + '/products/boxes',{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(productsBox.ok){
                return await productsBox.json();
            }
            throw productsBox;
        }
        
}