import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default class MessageService{
        
    async errorMessage(error){
        console.log(error)
        let errorsToShow ={};
        //if(error.status != 500){
            var messageService = new MessageService();
            errorsToShow = await messageService.formatErrorObject(error);            
        /*}else{
            console.log(error.status)
            errorsToShow = {
                status: error.status,
                statusText: error.statusText
            }
        }*/
        await Swal.fire({
           title: "Error ("+errorsToShow.status+") !",
           html: errorsToShow.statusText,
           icon: "error",
           confirmButtonText: "Got it!"
        });
    }

    async errorMessageSimple(errorMessage){
        await Swal.fire({
           title: "Error !",
           html: errorMessage,
           icon: "error",
           confirmButtonText: "Got it!"
        });
    }


    async successMessage(router,message,redirectRoute = null,btnConfirmText,btnDenyText){
        this.router = router;
        return await Swal.fire({
           title: "Ok!",
           html: message,
           icon: "success",
           showDenyButton: true,
           confirmButtonText: btnConfirmText,
           denyButtonText: btnDenyText
        }).then((result) => {
            if (result.isDenied && redirectRoute) {
              this.router.push({name:redirectRoute});
            }else{
                return true;
            }
        });

    }

    async successMessageSimple(message,btnConfirmText){
        await Swal.fire({
           title: "Ok!",
           html: message,
           icon: "success",
           confirmButtonText: btnConfirmText,
        });

    }
    
    async warningMessageSimple(message){
        await Swal.fire({
           title: "Warning!",
           html: message,
           icon: "warning",
           confirmButtonText: "Got it!",
        });

    }
        
    async formatErrorObject(error){
        var messageService = new MessageService();
        const objectRes = JSON.parse(await messageService.getErrorTextPromise(error));
        const errorsMessage = {
            statusText: "<b>"+error.statusText,
            status: error.status,
        };
        if(objectRes.errors){
            errorsMessage.statusText += ":</b><br>"
            for( const [key,value] of Object.entries(objectRes.errors)){
                errorsMessage.statusText += `${value.join("<br>")} <br>`;
            };
        } else if(objectRes.error){
            errorsMessage.statusText += ":</b><br>"
            for( const [key,value] of Object.entries(objectRes.error)){
                errorsMessage.statusText += `${value}`;
            };            
        }
        return errorsMessage;
    }

    async getErrorTextPromise(promise){
        let response;
        await promise.text().then((text)=>{
            throw text;
        }).catch((e)=>{
            response = e;
        });
        return response;
        
    }
}