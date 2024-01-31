export default class InstructionsService{
        
        async listPerBoutique(idCustomer){
            const instructions = await fetch(import.meta.env.VITE_API_URL + '/boutique/instructions/' + idCustomer,{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(instructions.ok){
                return await instructions.json();
            }
            throw instructions;
        }
        
        async create(instructions){
            const createdInstruction = await fetch(import.meta.env.VITE_API_URL + '/instrucction/create/per-costumer',{
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(instructions)
            });
            if(createdInstruction.ok){
                return await createdInstruction.json();
            }
            throw createdInstruction;
        }
}