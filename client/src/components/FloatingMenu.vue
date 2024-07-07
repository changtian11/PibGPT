<template>
    <div class="menu-wrap box_shadow_level_one hoverable">
        <div class="menu-inner">
            <img id="logo" class="box_shadow_level_one" src="../assets/Pib.png" alt="Pib Logo">
            <div class="divider"></div>
            <template v-if="isLoggedIn">
                <NTooltip placement="left" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large" style="margin: 4px 0">
                            <template #icon>
                                <NIcon :size="24">
                                    <NewTab />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    开始新对话
                </NTooltip>
                <NTooltip placement="left" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large" style="margin: 4px 0">
                            <template #icon>
                                <NIcon :size="24">
                                    <DataBackup />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    历史对话
                </NTooltip>
                <NTooltip placement="left" trigger="hover">
                    <template #trigger>
                        <NButton quaternary :bordered="false" size="large" @click="emit('scroll-to-bottom')"
                            style="margin: 4px 0">
                            <template #icon>
                                <NIcon :size="24">
                                    <DownToBottom />
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    滚动到底
                </NTooltip>
                <div class="divider"></div>
                <div class="menu-item clickable">
                    <NDropdown :options="dropdownOptions" placement="left" size="large" :keyboard="false"
                        trigger="click" style="margin-right: 24px; border-radius: 12px" :arrow-point-to-center="true"
                        :show-arrow="true" @select="handleSelect">
                        <img id="userPfp" :src="`/api/pfp/${user?.profilePhoto}`" alt="Pib Logo">
                    </NDropdown>
                </div>
            </template>
            <div v-else class="menu-item">
                <a @click="emit('login')">登录/注册</a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Component, h } from 'vue';
    import { NButton, NTooltip, NIcon, NDropdown, NAlert, useMessage } from 'naive-ui';
    import type { MessageRenderMessage } from 'naive-ui';
    import { NewTab, DataBackup, DownToBottom, UserProfile, Logout } from '@vicons/carbon';
    import axios from 'axios';
    import type { User, ApiResponse } from '../types/types';

    interface Props {
        isLoggedIn: boolean,
        user: User | null
    }

    const props = defineProps<Props>();

    const emit = defineEmits(['scroll-to-bottom', 'login', 'logout-success']);

    const renderIcon = (icon: Component) => {
        return () => h(NIcon, null, {
            default: () => h(icon)
        })
    }

    const renderUserProfile = () => {
        return h('div', {
            style: 'display: flex; align-items: center; flex-wrap: none; padding: 16px 8px; gap:12px'
        },
            [h('img', {
                style: "width: 40x; height: 40px; border-radius: 50%; padding-left: 2px; object-fit: cover; -webkit-user-drag: none",
                src: `/api/pfp/${props.user?.profilePhoto}`
            }),
            h('div', {
                style: 'text-align: left; display: flex; flex-direction: column; flex-wrap: nowrap;padding-right: 4px'
            }, [
                h('span', {
                    style: 'line-height:24px; font-size: 18px; font-weight: bold; min-height: 24px; height: 24px; min-width: 1px; user-select: none'
                }, props.user?.nickname),
                h('span', {
                    style: 'line-height:16px; font-size: 12px; color: gray; height: 16px; user-select: none'
                }, props.user?.username)
            ])
            ])
    }

    const renderLogoutSuccessAlert: MessageRenderMessage = (props) => {
        const { type, closable, onClose } = props;
        return h(NAlert, {
            type: type === 'loading' ? 'default' : type,
            onClose,
            closable,
            title: '登录成功',
            style: {
                maxWidth: 'calc(100vw - 32px)',
                width: '480px'
            }
        },
            {
                default: () => props.content
            })
    }

    const message = useMessage();

    const handleLogout = async () => {
        try {
            const res = await axios.get<ApiResponse<null>>('/api/logout')
            console.log(res.data);
            if (res.data.success) {
                message.success('退出登录成功', {
                    render: renderLogoutSuccessAlert,
                    type: "success",
                    keepAliveOnHover: false
                })
                emit('logout-success');
            }
            else {
                message.error('退出登录失败', {
                    
                })
            }
        }

        catch (error) {
            console.error(error)
        }
    }

    const dropdownOptions = [
        {
            key: 'userProfile',
            type: 'render',
            render: renderUserProfile
        },
        {
            key: 'header-divider',
            type: 'divider'
        },
        {
            label: '编辑用户资料',
            key: 'editProfile',
            icon: renderIcon(UserProfile),

        },
        {
            label: '退出登录',
            key: 'logout',
            icon: renderIcon(Logout)
        }
    ]

    const handleSelect = (key: string) => {
        if (key === "logout") {
            return handleLogout();
        }
    }

</script>

<style scope>
    .menu-wrap {
        width: 60px;
        display: block;
        position: absolute;
        z-index: 100;
        border-radius: 8px;
        right: 16px;
        margin-right: 1rem;
        background-color: var(--item-bg);
    }

    @media screen and (min-width: 0px) and (max-width: 600px) {
        .menu-wrap {
            display: none;
        }
    }

    .menu-inner {
        display: flex;
        padding: 1rem 0;
        align-items: center;
        flex-direction: column;

    }

    .menu-item {
        font-size: 12px;
        background-color: transparent;
    }

    .menu-item.clickable {
        cursor: pointer;
    }


    .divider {
        width: 36px;
        height: 2px;
        border-top: 1px solid #E5E5E5;
        border-radius: 8px;
        margin: 12px 0;
    }

    #logo {
        border-radius: 12px;
        width: 36px;
        height: 36px;
        user-select: none;
        -webkit-user-drag: none;
    }

    #userPfp {
        border-radius: 50%;
        width: 32px;
        height: 32px;
        border: 1px solid rgba(167, 167, 167);
        border: 1px solid rgba(167, 167, 167, 0.5);
        user-select: none;
        -webkit-user-drag: none;
        transition: all .2s ease-in;
    }

    #userPfp:hover {
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24);
    }

    #uesrPfp:focus,
    #userPfp:active {
        transition: none;
        filter: brightness(0.7);
    }
</style>