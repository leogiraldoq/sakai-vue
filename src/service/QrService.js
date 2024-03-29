export default class QrService{
        async readQrPreBill(code,channel){
            const resultQr = await fetch( import.meta.env.VITE_API_URL + '/qr-code/pre-bill/show/info/' + code + '/' + channel,{
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
        
        async readQrQuality(code){
            const resultQr = await fetch( import.meta.env.VITE_API_URL + '/qr-code/quality/show/info/' + code,{
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
        
        async readQrSend(code,channel){
            const resultQr = await fetch( import.meta.env.VITE_API_URL + '/qr-code/shipping/show/info/' + code + '/' + channel,{
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