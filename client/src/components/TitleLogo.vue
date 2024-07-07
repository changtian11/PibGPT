<script setup lang="ts">

    import { NGradientText } from 'naive-ui';

    interface Props {
        chatTitle: string,
        isCollapse: boolean
    }

    defineProps<Props>();
</script>

<template>
    <div id="TitleLogo">
        <NGradientText type="success" :size="isCollapse ? 64 : 32">PibGPT</NGradientText>
        <p class="sub-title" v-if="isCollapse">基于搜索引擎的新一代信息检索AI</p>
        <div v-else-if="chatTitle?.trim() !== ''">主题：{{ chatTitle }}</div>
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

    .sub-title {
        margin: 0 0 1rem;
    }
</style>