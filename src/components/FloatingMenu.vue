<script setup lang="ts">
import {NButton, NDivider} from 'naive-ui';

</script>

<template>
    <div class="menu-wrap box_shadow_level_one hoverable">
        <div class="menu-inner">
            <div id="logo menu-item">
                <span>Dauyee</span>
            </div>
            <NDivider></NDivider>
            <div id="menu-item">
                <NButton></NButton>
            </div>
            <div id="menu-item">
                <NButton></NButton>
            </div>
            <div id="menu-item">
                <NButton></NButton>
            </div>
            <NDivider></NDivider>
            <div id="menu-item">
                <a>登录/注册</a>
            </div>
        </div>
    </div>
</template>

<style scope>
    .menu-wrap {
        width: 64px;
        min-height: 200px;
        display: block;
        position: absolute;
        z-index: 201;
        border-radius: 8px; 
        right: 16px;
        margin-right:2rem;
    }
    .menu-inner {
        display: flex;
        padding: 12px 0 8px;
        align-items: center;
        flex-direction: column;

    }
</style>