<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Blue Star Packing',
        items: [
            {   
                label: 'Dashboard', 
                icon: 'pi pi-fw pi-home', 
                to: '/dashboard' 
            },
            {
                label: 'Recibing',
                icon: 'pi pi-fw pi-shopping-bag',
                items: [
                    { label: 'Resume', icon: 'pi pi-fw pi-table', to: '/bsp/receiving'},
                    { label: 'Receive', icon: 'pi pi-fw pi-plus', to: '/bsp/receiving/create'},
                ]
            },
            {
                label: 'Pre Billing',
                icon: 'pi pi-fw pi-list',
                items: [
                    { label: 'Resume', icon: 'pi pi-fw pi-table', to: '/bsp/pre-billing'},
                    { label: 'Invoices', icon: 'pi pi-fw pi-inbox', to: '/bsp/pre-billing/create'},
                ]
            },
            {
                label: 'Processing',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    { label: 'Process', icon: 'pi pi-fw pi-tablet', to: '/bsp/processing/create'},
                ]
            }
        ]
    },
    {
        label: 'Administration',
        items:[
            {
                label: 'Employess',
                icon: 'pi pi-users',
                items:[
                    { label: 'List All', icon:'pi pi-users', to:'/bsp/employees'},
                    { label: 'Create', icon:'pi pi-user-plus', to:'/bsp/employees/create'}
                ]
            },
            {
                label: 'Profile Access',
                icon: 'pi pi-key',
                items:[
                    { label: 'List All', icon:'pi pi-lock', to:'/bsp/profiles-modules'},
                    { label: 'Create', icon:'pi pi-key', to:'/bsp/profiles-modules/create'}
                ]
            },
            {
                label: 'Customers',
                icon: 'pi pi-building',
                items:[
                    { label: 'List All', icon:'pi pi-star', to:'/bsp/customers'},
                    { label: 'Create', icon:'pi pi-star-fill', to:'/bsp/customer/create'},
                    { label: 'Pick up Companies', icon:'pi pi-truck', to:'/bsp/pickupcompany'}
                ]
            },
            {
                label: 'Size Labels',
                icon: 'pi pi-bookmark-fill',
                items:[
                    { label: 'Create And Print', icon:'pi pi-print', to:'/bsp/care/labels/create'},
                ]
            },
            {
                label: 'Boxes',
                icon: 'pi pi-box',
                to:'/bsp/boxes'
            },
            {
                label: 'Shops',
                icon: 'pi pi-shopping-bag',
                to:'/bsp/shops'
            },

        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
