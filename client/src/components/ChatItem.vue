<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { NButton, NTooltip, NIcon } from 'naive-ui';
    import { Copy, Share } from '@vicons/carbon';
    import type { ChatMessageToRender } from '../types/types';
    import robotGreen from '@/assets/robot-green.png'

    interface Props {
        message: ChatMessageToRender;
        rightPfpUri?: string;
        leftPfpUri?: string;
        showActions?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        rightPfpUri: "https://picsum.photos/seed/picsum/200",
        leftPfpUri: robotGreen,
        showActions: true
    })
    const emit = defineEmits(['animation-playing']);
    const animatedText = ref("");
    const isAnimationPlaying = ref(false);

    const typeWriterEffect = () => {
        if (!props.message.isAnimated) return;
        else {
            isAnimationPlaying.value = true;
            const text = props.message.content;
            const textLength = props.message.content.length;
            let index = 0;
            function addNextChar() {
                if (index < textLength) {
                    animatedText.value += text[index];
                    index++;
                    setTimeout(addNextChar, Math.random() * 50 + 60)
                }
                else {
                    isAnimationPlaying.value = false;
                }
            }
            addNextChar();
        }
    }

    watch(isAnimationPlaying, (newVal, oldVal) => {
        if (newVal && !oldVal) {
            emit('animation-playing', true);
        }
        else {
            emit('animation-playing', false);
        }
    })

    watch(() => props.message.isAnimated, (isAnimated) => {
        if (isAnimated) typeWriterEffect();
    }, {
        immediate: true
    })

</script>

<template>
    <div class="chat-item">
        <div v-if="message.position === 'right'" class="message right">
            <div class="pfp-placeholder"></div>
            <div class="message-content">
                <div class="bubble">
                    <img v-if="message.type === 'file'" class="image" :src="message.content"></img>
                    <div v-else class="text">{{ message.content }}</div>
                </div>
            </div>
            <div class="pfp">
                <img :src="props.rightPfpUri" alt="头像">
            </div>
        </div>
        <div v-else-if="message.position === 'left'" class="message left">
            <div class="pfp">
                <img :src="leftPfpUri" alt="Pib">
            </div>
            <div class="message-content">
                <div class="bubble">
                    <div v-if="message.isLoading" class="loading">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    <div v-else>
                        <img v-if="message.type === 'file'" class="image" :src="message.content"></img>
                        <div v-else-if="message.isAnimated" class="text">{{ animatedText }}</div>
                        <div v-else class="text">{{ message.content }}</div>
                        <div v-if="!isAnimationPlaying && showActions" class="functionButtons">
                            <NTooltip placement="top" trigger="hover" to=".functionButtons">
                                <template #trigger>
                                    <NButton quaternary :bordered="false" size="small">
                                        <template #icon>
                                            <NIcon :size="18">
                                                <Copy />
                                            </NIcon>
                                        </template>
                                    </NButton>
                                </template>
                                复制
                            </NTooltip>
                            <NTooltip placement="top" trigger="hover" to=".functionButtons">
                                <template #trigger>
                                    <NButton quaternary :bordered="false" size="small">
                                        <template #icon>
                                            <NIcon :size="18">
                                                <Share />
                                            </NIcon>
                                        </template>
                                    </NButton>
                                </template>
                                分享
                            </NTooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pfp-placeholder"></div>
        </div>
    </div>
</template>

<style>
    .chat-item {
        margin: 1rem 0 0;
        color: var(--item-bg);
    }
</style>

<style scope>
    .message {
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

    .message-content {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        flex-grow: 1;
    }

    .message.right .message-content {
        justify-content: flex-end;
    }

    .message.left .message-content {
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

    .bubble .image {
        margin: 8px 0 0;
        width: 100%;
        height: auto;
        user-select: none;
        -webkit-user-drag: none;
    }

    .bubble .loading {
        align-items: center;
        display: flex;
        height: 18px;
        margin-top: 6px;
    }

    .bubble .loading .dot {
        animation: loadingAnimation 1.6s infinite ease-in-out;
        background-color: #6CAD96;
        border-radius: 50%;
        height: 12px;
        width: 12px;
        margin-right: 6px;
        vertical-align: middle;
        display: inline-block;
    }

    .bubble .loading .dot:nth-child(1) {
        animation-delay: 200ms;
    }

    .bubble .loading .dot:nth-child(2) {
        animation-delay: 300ms;
    }

    .bubble .loading .dot:nth-child(3) {
        animation-delay: 400ms;
    }

    .bubble .loading .dot:last-child {
        margin-right: 0;
    }

    @keyframes loadingAnimation {
        0% {
            transform: translateY(0px);
            background-color: #6CAD96;
        }

        28% {
            transform: translateY(-7px);
            background-color: #9ECAB9;
        }

        44% {
            transform: translateY(0px);
            background-color: #B5D9CB;
        }
    }

    @media screen and (min-width: 600px) {
        .bubble {
            max-width: 90%;
        }
    }

    .functionButtons {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 8px;
        padding-top: 4px;
        margin-bottom: 0;
        justify-content: flex-end;
    }

    .message.right .bubble {
        color: var(--sender-text-color);
        background-color: var(--sender-bg);
        text-wrap: wrap;
        word-break: break-word;
        white-space: pre-wrap;
    }

    .message.right .bubble:before {
        right: -7px;
        width: 20px;
        background-color: var(--sender-bg);
        border-bottom-left-radius: 16px 14px;
    }

    .message.right .bubble:after {
        right: -26px;
        width: 26px;
        background-color: var(--page-bg);
        border-bottom-left-radius: 10px;
    }

    .message.left .bubble {
        color: var(--receiver-text-color);
        background-color: var(--receiver-bg);
    }

    .message.left .bubble:before {
        left: -7px;
        width: 20px;
        background-color: var(--receiver-bg);
        border-bottom-right-radius: 16px 14px;
    }

    .message.left .bubble:after {
        left: -26px;
        width: 26px;
        background-color: var(--page-bg);
        border-bottom-right-radius: 10px;
    }
</style>