<template>
    <div class="modal-component">
        <div class="modal chat-room-list-modal box-shadow-level-two">
            <div class="title">
                <span>历史对话</span>
            </div>
            <div class="loading" v-if="modalData.isLoading">
                <NSpin size="large" />
            </div>
            <template v-else>
                <template v-if="chatRoomList.length === 0">
                    <NEmpty description="历史记录为空">
                        <template #extra>
                            <NButton size="medium" @click="emit('cancel')">
                                关闭
                            </NButton>
                        </template>
                    </NEmpty>
                </template>
                <ul class="list-container" v-else>
                    <li class="list-item" v-for="room in chatRoomList" :key="room.roomId">
                        <a :href="`/${room.roomId}`">
                            <p class="topic">
                                {{ room.topic ? room.topic : '无主题对话' }}
                            </p>
                            <p class="time">
                                {{ `上次使用时间：${new Date(room.lastMessageTime).toLocaleString('zh-CN')}` }}
                            </p>
                        </a>
                        <div class="options">
                            <NDropdown :options="dropdownOptions" size="large" trigger="click"
                                @select="(itemKey, _) => handleSelect(itemKey, room.roomId)">
                                <n-button text size="large">
                                    <template #icon>
                                        <n-icon :size="24">
                                            <OverflowMenuVertical />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </NDropdown>
                        </div>
                    </li>
                </ul>
            </template>

        </div>
        <div class="dim-bg" @click="emit('cancel')">
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, reactive, ref, h } from 'vue';
    import axios from 'axios';
    import type { ApiResponse, ChatRoomFromServer } from '../../types/types';
    import { NSpin, NIcon, NButton, NDropdown, NEmpty, NAlert, useMessage } from 'naive-ui';
    import type { MessageRenderMessage } from 'naive-ui'
    import { OverflowMenuVertical, Edit, Delete } from '@vicons/carbon'
    const emit = defineEmits(['cancel', 'room-selected']);
    const message = useMessage()
    const chatRoomList = ref<ChatRoomFromServer[]>([]);
    const modalData = reactive({
        isLoading: true
    })
    const dropdownOptions = [
        {
            label: '编辑主题',
            key: 'edit',
            icon() {
                return h(NIcon, null, {
                    default: () => h(Edit)
                })
            }
        },
        {
            label: '删除',
            key: 'delete',
            icon() {
                return h(NIcon, { color: 'red' }, {
                    default: () => h(Delete)
                })
            },
            props: {
                style: 'color: red'
            }
        }
    ]
    const handleSelect = async (key: string, roomId: string) => {
        if (key === 'delete') {
            const res = await axios.delete<ApiResponse<undefined>>(`/api/chatroom/del/${roomId}`);
            console.log(res);
            if (res.data.success) {
                message.success('对话历史已删除', {
                    render: renderDeleteSuccessAlert,
                    type: "success",
                    keepAliveOnHover: false
                })
                chatRoomList.value = chatRoomList.value.filter(room => room.roomId !== roomId);
            }
        }
        else if (key === 'edit') {
            return;
        }
        else {
            return;
        }
    }

    const renderDeleteSuccessAlert: MessageRenderMessage = (props) => {
        const { type, closable, onClose } = props;
        return h(NAlert, {
            type: type === 'loading' ? 'default' : type,
            onClose,
            closable,
            title: '删除成功',
            style: {
                maxWidth: 'calc(100vw - 32px)',
                width: '480px'
            }
        },
            {
                default: () => props.content
            })
    }


    const fetchChatRoomList = async () => {
        try {
            modalData.isLoading = true;
            const res = await axios.get<ApiResponse<ChatRoomFromServer[]>>('/api/chatroom/list');
            if (res.data.success) {
                chatRoomList.value = res.data.data;
                modalData.isLoading = false;
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    onMounted(async () => {
        await fetchChatRoomList();
    })

</script>

<style>
    @import "@/stylesheets/modal.css";
</style>