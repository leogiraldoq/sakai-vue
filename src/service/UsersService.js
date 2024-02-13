export default class UsersService{
     
     async resetPass(dataResetPas){
        const resResetPass = await fetch(import.meta.env.VITE_API_URL + '/user/reset-password',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataResetPas)
        });
        if(resResetPass.ok){
            return await resResetPass.json();
        }
        throw resResetPass;
     }
     
     async forgetPass(dataFotgetPassword){
         const resForgotPass = await fetch(import.meta.env.VITE_API_URL + '/forgot-password',{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataFotgetPassword)
        });
        if(resForgotPass.ok){
            return await resForgotPass.json();
        }
        throw resForgotPass;
     }
        
}