<template>
    <div class="modal">
        <div class="login-modal box_shadow_level_two">
            <div class="title">
                <span>登录/注册</span>
            </div>
            <div class="input-container">
                <div class="input-item">
                    <span class="label">手机号</span>
                    <NInputGroup>
                        <NSelect :style="{ width: '50%' }" :options="callingCodes" placeholder="国家/地区"
                            default-value="+86" filterable size="large" :disabled="isLoading"></NSelect>
                        <NInput placeholder="手机号" clearable :maxlength="11" size="large"
                            v-model:value="userLogin.userPhoneNumber" :allow-input="onlyAllowNumber"
                            :disabled="isLoading">
                        </NInput>
                    </NInputGroup>
                </div>
                <div class="input-item">
                    <span class="label">验证码</span>
                    <NInput size="large" placeholder="验证码" :maxlength="6" clearable
                        v-model:value="userLogin.userPassword" :allow-input="onlyAllowNumber" :disabled="isLoading">
                        <template #suffix>
                            <NButton quaternary type="primary" @click="mockSmsOtp"
                                :disabled="smsOtpBtnDisable || isLoading || userLogin.userPhoneNumber.length !== 11">
                                获取验证码{{
                                    smsOtpBtnCountdown > 0 ? `(${smsOtpBtnCountdown})` : "" }}</NButton>
                        </template>
                    </NInput>
                </div>
            </div>
            <div class="bottom-buttons">
                <NButton size="large" @click="rejectEmailLogin" :loading="isLoading">
                    使用邮箱登录
                </NButton>
                <NTooltip trigger="hover" placement="top" :delay="0" to=".login-modal">
                    <template #trigger>
                        <NButton type="primary" size="large" @click="handleLogin" :loading="isLoading"
                            :disabled="userLogin.userPhoneNumber.length !== 11 || userLogin.userPassword.length !== 6">
                            登录/注册</NButton>
                    </template>
                    未注册的手机号将会自动注册
                </NTooltip>
            </div>
        </div>
        <div class="dim-bg" @click="emit('cancel')">
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, onUnmounted, h } from 'vue';
    import { NInputGroup, NInput, NSelect, NButton, NTooltip, NAlert, useMessage } from 'naive-ui';
    import type { MessageRenderMessage } from 'naive-ui';
    import type { ApiResponse, User } from '../types/types';
    import axios from 'axios';
    const emit = defineEmits(['cancel', 'login-success']);
    const smsOtpBtnDisable = ref(false);
    const smsOtpBtnCountdown = ref(0);
    const isLoading = ref(false);
    let userLogin = reactive({
        userPhoneNumber: '',
        userPassword: ''
    })
    let singleTimer: undefined | number;

    const message = useMessage();

    const onlyAllowNumber = (value: string) => !value || /^\d+$/.test(value);

    const smsOtpSetCountdown = (second: number) => {
        if (second > 0) {
            smsOtpBtnDisable.value = true;
            smsOtpBtnCountdown.value = second;
            singleTimer = setTimeout(() => { smsOtpSetCountdown(second - 1) }, 1000);
        }
        else {
            smsOtpBtnDisable.value = false;
            smsOtpBtnCountdown.value = 0;
        }
    }

    const smsOtpHandleOldTimer = () => {
        const nowTime = Date.now();
        let lastSentTime = localStorage.getItem('lastSentTime');
        if (lastSentTime) {
            const timeRemaining = 60 - Math.ceil(((nowTime - parseInt(lastSentTime, 10)) / 1000));
            if (timeRemaining > 0) {
                smsOtpSetCountdown(timeRemaining);
                return false;
            }
            else {
                localStorage.removeItem('lastSentTime');
                return true;
            }
        }
        else return true;
    }

    const smsOtpStartCountdown = () => {
        if (smsOtpHandleOldTimer()) {
            smsOtpSetCountdown(60);
            localStorage.setItem('lastSentTime', String(Date.now()));
        }
    }

    const rejectEmailLogin = () => {
        message.error("暂未开启邮箱登录与注册", {
            duration: 2000
        })
    }

    const mockSmsOtp = () => {
        if (!userLogin.userPhoneNumber || userLogin.userPhoneNumber.length !== 11) {
            return message.error("手机号码有误");
        }
        smsOtpBtnDisable.value = true;
        message.info("短信验证码已发送", {
            duration: 3000
        });
        smsOtpStartCountdown();
    }

    const renderLoginSuccessAlert: MessageRenderMessage = (props) => {
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

    const handleLogin = async () => {
        if (userLogin.userPhoneNumber.length !== 11 || userLogin.userPassword.length !== 6) {
            message.error("手机号或验证码有误");
            return;
        }
        else {
            isLoading.value = true;
            try {
                const res = await axios.post<ApiResponse<User>>('/api/login', {
                    username: userLogin.userPhoneNumber,
                    password: userLogin.userPassword
                })
                console.log(res);
                if (res.data.success) {
                    message.success('欢迎回来', {
                        render: renderLoginSuccessAlert,
                        type: "success",
                        keepAliveOnHover: false
                    })
                    emit('login-success');
                }
                else {
                    message.error('用户名或验证码有误');
                }
            }
            catch (error) {

            }
            finally {
                isLoading.value = false;
            }
        }
    }

    onMounted(() => {
        smsOtpHandleOldTimer();
    })

    onUnmounted(() => {
        if (singleTimer) {
            clearTimeout(singleTimer);
        }
    })

    const callingCodes = [
        {
            label: "美国 +1",
            value: "+1"
        },
        {
            label: "加拿大 +1",
            value: "+1"
        },
        {
            label: "俄罗斯 +7",
            value: "+7"
        },
        {
            label: "中国香港 +852",
            value: "+852"
        },
        {
            label: "中国澳门 +853",
            value: "+853"
        },
        {
            label: "中国大陆 +86",
            value: "+86"
        },
        {
            label: "中国台湾 +886",
            value: "+886"
        },
        {
            label: "日本 +81",
            value: "+81"
        },
        {
            label: "韩国 +82",
            value: "+82"
        },
        {
            label: "新加坡 +65",
            value: "+65"
        },
        {
            label: "马来西亚 +60",
            value: "+60"
        },
        {
            label: "泰国 +66",
            value: "+66"
        },
        {
            label: "越南 +84",
            value: "+84"
        },
        {
            label: "印度 +91",
            value: "+91"
        },
        {
            label: "澳大利亚 +61",
            value: "+61"
        },
        {
            label: "新西兰 +64",
            value: "+64"
        },
        {
            label: "英国 +44",
            value: "+44"
        },
        {
            label: "法国 +33",
            value: "+33"
        },
        {
            label: "德国 +49",
            value: "+49"
        },
        {
            label: "意大利 +39",
            value: "+39"
        },
        {
            label: "西班牙 +34",
            value: "+34"
        },
        {
            label: "瑞士 +41",
            value: "+41"
        },
        {
            label: "奥地利 +43",
            value: "+43"
        },
        {
            label: "丹麦 +45",
            value: "+45"
        },
        {
            label: "瑞典 +46",
            value: "+46"
        },
        {
            label: "挪威 +47",
            value: "+47"
        },
        {
            label: "荷兰 +31",
            value: "+31"
        },
        {
            label: "比利时 +32",
            value: "+32"
        },
        {
            label: "葡萄牙 +351",
            value: "+351"
        },
        {
            label: "希腊 +30",
            value: "+30"
        },
        {
            label: "土耳其 +90",
            value: "+90"
        },
        {
            label: "巴西 +55",
            value: "+55"
        },
        {
            label: "阿根廷 +54",
            value: "+54"
        },
        {
            label: "墨西哥 +52",
            value: "+52"
        },
        {
            label: "南非 +27",
            value: "+27"
        },
        {
            label: "埃及 +20",
            value: "+20"
        },
        {
            label: "阿联酋 +971",
            value: "+971"
        }
    ];

</script>

<style scope>
    .modal {
        position: absolute;
        display: flex;
        height: 100vh;
        width: 100vw;
        background-color: transparent;
        z-index: 198;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        background-color: transparent;
    }

    .dim-bg {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 199;
        left: 0;
        top: 0;
        background-color: rgb(0, 0, 0);
        /* fallback */
        background-color: rgba(0, 0, 0, 0.4);
    }

    .login-modal {
        position: relative;
        z-index: 200;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 90%;
        padding: 2rem 1rem;
        background-color: var(--item-bg);
        border-radius: 12px;
    }

    @media screen and (min-width:600px) {

        .login-modal {
            width: 60%;
            min-width: 500px;
            max-height: 900px;
        }
    }

    @media screen and (min-width: 1200px) {
        .login-modal {
            width: 60%;
            max-width: 500px;
        }

    }

    .title {
        font-size: 28px;
        text-align: left;
        user-select: none;
        padding: 0 12px;
        font-weight: bold;
    }

    .input-container {
        text-align: left;
    }

    .input-item {
        margin-bottom: 24px;
    }

    .input-item>span {
        user-select: none;
    }

    .bottom-buttons {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 12px;
        margin: 1rem 0;
        align-items: center;
        justify-content: center;
    }
</style>