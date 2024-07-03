<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NTooltip, NIcon } from 'naive-ui';
import { SendFilled, DocumentAdd } from '@vicons/carbon';

const userInput = ref("");

const emit = defineEmits(
    ['submit']
)

const submitText = () => {
    if (userInput.value.length > 0) {
        emit('submit', userInput.value.trim())
    }
    userInput.value = "";
}

</script>

<template>
    <div class="input-container box_shadow_level_one hoverable">
        <div class="input-inner">
            <div class="input-wrap">
                <input id="input-box" type="text" placeholder="输入你想了解的信息吧！" v-model="userInput"
                    @keyup.enter="submitText()"></input>
            </div>
            <div class="side-buttons">
                <NTooltip placement="top" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large">
                            <template #icon>
                                <NIcon>
                                    <DocumentAdd />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    上传文档/图像
                </NTooltip>
                <NTooltip placement="top" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large" @click="submitText()">
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
    border: 1px solid var(--border-color);
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