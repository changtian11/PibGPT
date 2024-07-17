<script setup lang="ts">
    import { NButton, NTooltip, NIcon } from 'naive-ui';
    import { SendFilled, DocumentAdd, Stop } from '@vicons/carbon';

    defineProps({
        awaitingResponse: Boolean,
        animationPlaying: Boolean
    })

    const modelValue = defineModel()
    const emit = defineEmits(
        ['submit', 'file-upload', 'stop']
    )

</script>

<template>
    <div class="input-container box-shadow-level-one hoverable">
        <div class="input-inner">
            <div class="input-wrap">
                <input id="input-box" type="text" placeholder="输入你想了解的信息吧！" v-model="modelValue"
                    @keyup.enter="emit('submit')" :disabled="awaitingResponse || animationPlaying"></input>
            </div>
            <div class="side-buttons">
                <NTooltip placement="top" trigger="hover" :disabled="awaitingResponse || animationPlaying">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large"
                            :disabled="awaitingResponse || animationPlaying" @click="emit('file-upload')">
                            <template #icon>
                                <NIcon>
                                    <DocumentAdd />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    上传文档/图像
                </NTooltip>
                <NTooltip v-if="awaitingResponse || animationPlaying" placement="top" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large" @click="emit('stop')">
                            <template #icon>
                                <NIcon>
                                    <Stop />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    停止生成
                </NTooltip>
                <NTooltip v-else placement="top" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large" @click="emit('submit')">
                            <template #icon>
                                <NIcon>
                                    <SendFilled />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    生成回复
                </NTooltip>
            </div>
        </div>
    </div>
</template>

<style scope>
    .input-container {
        display: block;
        border-radius: 12px;
        background-color: var(--item-bg);
        padding: 12px 12px 12px 24px;
        flex-shrink: 0;
    }

    .input-inner {
        height: 48px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
    }

    .input-wrap {
        display: flex;
        flex-grow: 1;
        align-items: center;
    }

    #input-box {
        height: 42px;
        width: 100%;
        padding: 4px 8px;
        font-size: 16px;
        background-color: var(--item-bg);
    }

    #input-box,
    #input-box:active,
    #input-box:hover,
    #input-box:focus,
    #input-box:focus-visible {
        border: 0px solid;
        outline: none;
    }

    .side-buttons {
        margin-left: 1rem;
        display: flex;
        gap: 4px;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
    }
</style>