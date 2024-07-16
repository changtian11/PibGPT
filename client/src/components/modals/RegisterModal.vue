<template>
    <div class="modal-component">
        <div class="modal register-modal box-shadow-level-two">
            <div class="title">
                <span>真正的注册界面</span>
            </div>
            <div class="form-container">
                <form>
                    <div class="form-item">
                        <p class="label">用户名</p>
                        <NInput v-model:value="regForm.username" placeholder="" required />
                    </div>
                    <div class="form-item">
                        <p class="label">昵称</p>
                        <NInput v-model:value="regForm.nickname" placeholder="" required />
                    </div>
                    <div class="form-item">
                        <p class="label">密码</p>
                        <NInput type="password" v-model:value="regForm.password" placeholder="" required />
                    </div>
                    <div class="form-item">
                        <p class="label">身份</p>
                        <NSelect :options="roleOptions" v-model:value="regForm.role" required />
                    </div>
                    <div class="form-item">
                        <p class="label">头像</p>
                        <NUpload list-type="image" :multiple="false" v-model:file-list="pfpList">
                            <NButton :disabled="pfpList.length > 0">上传头像</NButton>
                        </NUpload>
                    </div>
                </form>
            </div>
            <div class="form-actions">
                <NButton size="large" @click="emit('cancel')">
                    取消
                </NButton>
                <NButton @click="handleSubmit" size="large" type="primary">注册</NButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, onUnmounted, h } from 'vue';
    import { NInput, NSelect, NButton, NTooltip, NAlert, NUpload, useMessage } from 'naive-ui';
    import type { MessageRenderMessage, UploadFileInfo } from 'naive-ui';
    import type { ApiResponse, User } from '../../types/types';
    import axios from 'axios';

    const message = useMessage();
    const emit = defineEmits(['cancel', 'login-success']);
    interface RegForm {
        username: string,
        password: string,
        nickname: string,
        role: 'user' | 'bot',
        profilePhoto: null | undefined | File
    }

    const pfpList = ref<Array<UploadFileInfo>>([]);

    const regForm = reactive<RegForm>({
        username: '',
        password: '',
        role: 'user',
        nickname: '',
        profilePhoto: null
    })

    const roleOptions = [
        {
            label: "作为用户，与后台‘机器人’进行对话",
            value: 'user'
        },
        {
            label: "扮演机器人，同时为后台管理员",
            value: 'bot'
        }
    ]

    const renderLoginSuccessAlert: MessageRenderMessage = (props) => {
        const { type, closable, onClose } = props;
        return h(NAlert, {
            type: type === 'loading' ? 'default' : type,
            onClose,
            closable,
            title: '注册成功',
            style: {
                maxWidth: 'calc(100vw - 32px)',
                width: '480px'
            }
        },
            {
                default: () => props.content
            })
    }

    const handleSubmit = async () => {
        console.log(pfpList.value);
        if (pfpList.value.length === 1) {
            regForm.profilePhoto = pfpList.value[0].file;
        }
        else {
            regForm.profilePhoto = null;
        }
        try {
            const { username, password, nickname, profilePhoto, role } = regForm;
            const res = await axios.post<ApiResponse<undefined>>('/api/register',
                {
                    username, password, nickname, role,
                    filePurpose: 'pfp',
                    file: profilePhoto
                },
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            console.log(res);
            if (res.data.success) {
                message.success('快去登录吧！', {
                    type: "success",
                    keepAliveOnHover: false,
                    render: renderLoginSuccessAlert
                })
            }
            else {
                message.error('注册失败');
            }
        }
        catch (err) {
            console.error(err);
        }
    }

</script>

<style>
    @import "@/stylesheets/modal.css";
</style>