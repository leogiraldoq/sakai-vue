export default class ProfilesModulesService{
        
   async getAllProfiles(){
        const listProfiles = await fetch(import.meta.env.VITE_API_URL+'/profile/list-all',{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if(listProfiles.ok){
            return await listProfiles.json();
        }
        throw listProfiles;            
   }
   
   async getAllModules(){
           const listModules = await fetch(import.meta.env.VITE_API_URL+'/module/list-all',{
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Accept': 'application/json'
            });
            if (listModules.ok){
                return await listModules.json();
            }
            throw listModules;
   }
   
   async createModule(dataNewModule){
        const createModule = await fetch( import.meta.env.VITE_API_URL + '/module/create',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( dataNewModule )
        });
        if (createModule.ok){
            return await createModule.json();
        }
        throw createModule;
    }
    
    
   async createProfile(dataNewProfile){
        const createProfile = await fetch( import.meta.env.VITE_API_URL + '/profile/create',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( dataNewProfile )
        });
        if (createProfile.ok){
            return await createProfile.json();
        }
        throw createProfile;
    }
    
    async getModuleUsers(module){
        const usersProfile = await fetch(import.meta.env.VITE_API_URL + '/profile/show/users/module/'+module,{
            'Authorization': 'Bearer '+localStorage.getItem("token"),
            'Accept': 'application/json'
        });
        if (usersProfile.ok){
            return await usersProfile.json();
        }
        throw usersProfile;
    }
    
    async getMenuPerUser(){
        const resMenu = await fetch(import.meta.env.VITE_API_URL + '/profile/menu/me',{
            method: "GET",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(resMenu.ok){
            return await resMenu.json();
        }
        throw resMenu;
    }
    
    async getProfileModulesUpdate(idProfile){
        const resProfile = await fetch(import.meta.env.VITE_API_URL + '/profile/index/'+idProfile,{
            method: "GET",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if(resProfile.ok){
            return await resProfile.json();
        }
        throw resProfile;
    }
    
    async updateProfile(dataProfile){
        const createProfile = await fetch( import.meta.env.VITE_API_URL + '/profile/update',{
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem("token"),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( dataProfile )
        });
        if (createProfile.ok){
            return await createProfile.json();
        }
        throw createProfile;
    }
}

