<template>

    <div class="dim-bg" @click="emit('cancel')"></div>
</template>

<script lang="ts" setup>
    interface Props {
        showBg: boolean
    }
    withDefaults(defineProps<Props>(), {
        showBg: true
    })
    const emit = defineEmits(['cancel']);
</script>

<style scoped></style>