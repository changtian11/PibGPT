<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    isSender: Boolean,
    textString: String,
    userPfpUrl: String
})

</script>

<template>
    <div class="chat-item-container">
        <div v-if="isSender" class="item-line">
            <div class="pfp-placeholder"></div>
            <div class="main-content sender">
                <div class="bubble">{{ textString }}</div>
            </div>
            <div class="pfp">
                <img :src="props.userPfpUrl" alt="User">
            </div>
        </div>
        <div v-else class="item-line">
            <div class="pfp">
                <img src="https://picsum.photos/seed/picsum/200" alt="Pib">
            </div>
            <div class="main-content receiver">
                <div class="bubble">{{ textString }}</div>
            </div>
            <div class="pfp-placeholder"></div>
        </div>
    </div>
</template>

<style>
.chat-item-container {
    margin: 1rem 0 0;
    color: var(--item-bg);
}
</style>

<style scope>
.item-line {
    display: flex;
    width: 100%;
    gap: 28px;
}

.pfp-placeholder,
.pfp {
    min-width: 56px;
}

.pfp-placeholder {
    background-color: transparent;
}

.pfp {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.pfp>img {
    height: 56px;
    width: 56px;
    border-radius: 50%;
    border: 1px solid #AAA;
    margin-bottom: 8px;
    user-select: none;
    -webkit-user-drag: none;
}

.main-content {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    flex-grow: 1;
}

.main-content.sender {
    justify-content: flex-end;
}

.main-content.receiver {
    justify-content: flex-start;
}

.bubble {
    word-wrap: normal;
    margin-bottom: 12px;
    font-size: 16px;
    line-height: 28px;
    position: relative;
    padding: 10px 20px;
    border-radius: 25px;
    text-align: left;
    white-space: pre-line;
}

.bubble:before,
.bubble:after {
    content: "";
    position: absolute;
    bottom: 0;
    height: 25px;
    user-select: none;
}

@media screen and (min-width: 600px) {
    .bubble {
        max-width: 90%;
    }
}

.sender>.bubble {
    color: var(--sender-text-color);
    background-color: var(--sender-bg);
}

.sender>.bubble:before {
    right: -7px;
    width: 20px;
    background-color: var(--sender-bg);
    border-bottom-left-radius: 16px 14px;
}

.sender>.bubble:after {
    right: -26px;
    width: 26px;
    background-color: var(--page-bg);
    border-bottom-left-radius: 10px;
}

.receiver>.bubble {
    color: var(--receiver-text-color);
    background-color: var(--receiver-bg);
}

.receiver>.bubble:before {
    left: -7px;
    width: 20px;
    background-color: var(--receiver-bg);
    border-bottom-right-radius: 16px 14px;
}

.receiver>.bubble:after {
    left: -26px;
    width: 26px;
    background-color: var(--page-bg);
    border-bottom-right-radius: 10px;
}
</style>