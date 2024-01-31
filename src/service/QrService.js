export default class QrService{
        async readQrPreBill(code){
            const resultQr = await fetch( import.meta.env.VITE_API_URL + '/qr-code/pre-bill/show/info/' + code,{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log(await resultQr);
            if(resultQr.ok){
                return await resultQr.json();
            }
            throw resultQr;
        }
        
        async readQrProcessing(code){
            const resultQr = await fetch( import.meta.env.VITE_API_URL + '/qr-code/processing/show/info/' + code,{
                method: "GET",
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem("token"),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if(resultQr.ok){
                return await resultQr.json();
            }
            throw resultQr;
        }
}