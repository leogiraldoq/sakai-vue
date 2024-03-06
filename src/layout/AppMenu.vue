<script setup>
import { ref, onMounted } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import ProfilesModulesService from '@/service/ProfilesModulesService';
const profileService = new ProfilesModulesService();

const model = ref([]);

onMounted( async () =>{
    await profileService.getMenuPerUser().then((res) => {
        if(JSON.parse(res.data['Bsp']).length > 0){
            model.value.push({
                label: 'Blue Star Packing',
                items: JSON.parse(res.data['Bsp'])
            });
        }
        if(JSON.parse(res.data['Admin']).length > 0){
            model.value.push({
                label: 'Administrator',
                items: JSON.parse(res.data['Admin'])
            });
        }
    });
    
});

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
