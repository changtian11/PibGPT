<script setup lang="ts">
import FloatingMenu from './components/FloatingMenu.vue';
import InputBox from './components/InputBox.vue';
import ChatWrap from './components/ChatWrap.vue';
</script>

<template>
      <FloatingMenu></FloatingMenu>
  <div class="page-container">
    <ChatWrap> </ChatWrap>
<InputBox></InputBox>
  </div>

</template>

<style scoped>
  .page-container {
    height:100%;
    width: 100%;
    display:flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    background-color: var(--page-color)
  }
</style>
