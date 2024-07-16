<template>
    <NMessageProvider>
        <Transition>
            <RegisterModal />
        </Transition>
        <div class="page-container">

        </div>
    </NMessageProvider>
</template>

<script setup lang="ts">
    import RegisterModal from '../components/modals/RegisterModal.vue';
    import { NMessageProvider } from 'naive-ui';
</script>

<style lang="css" scoped></style>