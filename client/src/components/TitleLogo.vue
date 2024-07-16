<script setup lang="ts">

    import { NGradientText } from 'naive-ui';

    interface Props {
        chatTitle: string | undefined | null,
        folded: boolean
    }

    defineProps<Props>();
</script>

<template>
    <div class="title-logo-component">
        <NGradientText type="success" :size="folded ? 64 : 32">PibGPT</NGradientText>
        <p class="sub-title" v-if="folded">基于搜索引擎的新一代信息检索AI</p>
        <div v-else-if="chatTitle?.trim() !== ''">主题：{{ chatTitle }}</div>
        <div v-else>主题生成中...</div>
    </div>

</template>

<style scope>
    .title-logo-component {
        display: block;
        background-color: var(--page-bg);
        padding-bottom: 1rem;
        flex-shrink: 0;
        user-select: none;
    }

    .sub-title {
        margin: 0 0 1rem;
    }
</style>