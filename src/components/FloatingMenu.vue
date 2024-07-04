<script setup lang="ts">
import { NButton, NTooltip, NIcon } from 'naive-ui';
import { DataBackup, DownToBottom } from '@vicons/carbon';

const emit = defineEmits(['scroll-to-bottom']);

const scrollToBottom = () => {
    emit('scroll-to-bottom');
}

</script>

<template>
    <div class="menu-wrap box_shadow_level_one hoverable">
        <div class="menu-inner">
            <img id="logo" class="box_shadow_level_one" src="../assets/Pib.png" alt="Pib Logo">
            <div class="divider"></div>
            <NTooltip placement="left" trigger="hover">
                <template #trigger>
                    <NButton quaternary :bordered="false" size="large">
                        <template #icon>
                            <NIcon :size="24">
                                <DataBackup />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                历史对话
            </NTooltip>
            <NTooltip placement="left" trigger="hover">
                <template #trigger>
                    <NButton quaternary :bordered="false" size="large" @click="scrollToBottom">
                        <template #icon>
                            <NIcon :size="24">
                                <DownToBottom />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                滚动到底
            </NTooltip>
            <div class="divider"></div>
            <div class="menu-item">
                <a>登录/注册</a>
            </div>
        </div>
    </div>
</template>

<style scope>
.menu-wrap {
    width: 60px;
    min-height: 200px;
    display: block;
    position: absolute;
    z-index: 201;
    border-radius: 8px;
    right: 16px;
    margin-right: 1rem;
    background-color: var(--item-bg);
}

@media screen and (min-width: 0px) and (max-width: 600px) {
    .menu-wrap {
        display: none;
    }
}

.menu-inner {
    display: flex;
    padding: 12px 0;
    align-items: center;
    flex-direction: column;

}

.menu-item {
    font-size: 12px;
}

.divider {
    width: 36px;
    height: 2px;
    border-top: 1px solid #E5E5E5;
    border-radius: 8px;
    margin: 12px 0;
}

#logo {
    border-radius: 12px;
    width: 36px;
    height: 36px;
}
</style>