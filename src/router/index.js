import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: {path: "/auth/login"},
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/employees',
                    name: 'employees',
                    component: () => import('@/views/bsp/Employees/Resume.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/employees/create',
                    name: 'employeescreate',
                    component: () => import('@/views/bsp/Employees/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/profiles-modules',
                    name: 'profilesmodules',
                    component: () => import('@/views/bsp/ProfileAndModule/Resume.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/profiles-modules/create',
                    name: 'profilesmodulescreate',
                    component: () => import('@/views/bsp/ProfileAndModule/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/customers',
                    name: 'customers',
                    component: () => import('@/views/bsp/Customers/Resume.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/customer/create',
                    name: 'customerscreate',
                    component: () => import('@/views/bsp/Customers/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/customer/:id/instructions',
                    name: 'customers-intructions',
                    component: () => import('@/views/bsp/Customers/Instructions.vue'),
                    props:true,
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/pickupcompany',
                    name: 'pickupcompany',
                    component: () => import('@/views/bsp/PickUpCompany.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/care/labels/create',
                    name: 'labelcreateprint',
                    component: () => import('@/views/bsp/CareLabels/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/care/labels/content/create',
                    name: 'labelcreateoptions',
                    component: () => import('@/views/bsp/CareLabels/ContentCreate.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/care/labels/size/create',
                    name: 'labelcreatesize',
                    component: () => import('@/views/bsp/CareLabels/SizeCreate.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/care/labels/preview-print',
                    name: 'labelcreatedocumentpdf',
                    component: () => import('@/views/bsp/CareLabels/PreviewPrint.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/receiving/create',
                    name: 'recibingcreate',
                    component: () => import('@/views/bsp/Receiving/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/pre-billing',
                    name: 'prebillingresume',
                    component: () => import('@/views/bsp/PreBilling/Resume.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/pre-billing/create',
                    name: 'prebillingcreate',
                    component: () => import('@/views/bsp/PreBilling/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/boxes',
                    name: 'boxes',
                    component: () => import('@/views/bsp/Boxes/Resume.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/shops',
                    name: 'shops',
                    component: () => import('@/views/bsp/Shops/Shops.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/processing/create',
                    name: 'processing',
                    component: () => import('@/views/bsp/Processing/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                },
                {
                    path: '/bsp/quality/create',
                    name: 'qualiyu',
                    component: () => import('@/views/bsp/Quality/Create.vue'),
                    meta:{
                        isAuth:true
                    }
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue'),
            meta:{
                isAuth:false
            }
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta:{
                isAuth:false
            }
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta:{
                isAuth:false
            }
            
        },
        {
            path: '/auth/forgot-password',
            name: 'forgot-password',
            component: () => import('@/views/pages/auth/ForgotPassword.vue'),
            meta:{
                isAuth:false
            }
            
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('@/views/pages/auth/ResetPassword.vue'),
            meta:{
                isAuth:true
            }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
            meta:{
                isAuth:false
            }
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
            meta:{
                isAuth:false
            }
        }
    ]
});

router.beforeEach((to,from,next)=>{
    if (to.meta.isAuth){
        let token = localStorage.getItem("token");
        if(!token){
            next({name: 'login'});
            return;
        }   
    }
    next();
    return;
});

export default router;
