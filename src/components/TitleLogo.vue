<script setup lang="ts">

import { NGradientText } from 'naive-ui';

const props = defineProps({
    titleText: String,
    isCollapse: Boolean
})
</script>

<template>
    <div id="TitleLogo">
        <NGradientText type="success" :size="isCollapse?64:32">PibGPT</NGradientText>
        <p v-if="isCollapse">基于搜索引擎的新一代信息检索AI</p>
        <div v-else>主题：{{ titleText }} 母猪的产后护理</div>
    </div>

</template>

<style scope>
#TitleLogo {
    display: block;
    background-color: var(--page-bg);
    margin-bottom: 1rem;
    flex-shrink: 0;
    user-select: none;
}
</style>