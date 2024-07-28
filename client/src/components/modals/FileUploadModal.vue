<template>
    <div class="model-component">
        <div class="modal file-upload-modal box-shadow-level-two">
            <div class="tilte">
                <span>上传文件</span>
            </div>
        </div>
    </div>
    <div class="dim-bg" @click="emit('cancel')"></div>
</template>

<script lang="ts" setup>
    const emit = defineEmits(['cancel']);
</script>

<style scoped></style>