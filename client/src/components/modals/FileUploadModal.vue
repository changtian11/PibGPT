<template>
    <div class="modal-component">
        <div class="modal file-upload-modal box-shadow-level-two">
            <div class="title">
                <span>上传文件</span>
            </div>
            <div v-if="fileToUpload" class="preview-wrapper">
                <div v-if="fileType === 'image'" class="image-wrapper">
                    <img v-if="imageFileUrl" :src="imageFileUrl" alt="" />
                </div>
                <div v-else>
                    <span>{{ fileToUpload.name }}</span>
                </div>
                <div class="actions">
                    <NButton size="large" @click="handleCancel" type="error"
                        :disabled="props.uploadingFile.isUploading">取消
                    </NButton>
                    <NButton size="large" @click="fileToUpload = null" :disabled="props.uploadingFile.isUploading">重新选择
                    </NButton>
                    <NButton size="large" type="primary" @click="handleUpload"
                        :disabled="props.uploadingFile.isUploading">发送
                    </NButton>
                </div>
            </div>
            <div v-else class="upload-wrapper" id="upload-wrapper" @dragenter="dragEnterHandler"
                @dragend="dragLeaveAndEndHandler" @dragleave="dragLeaveAndEndHandler" @drop="dropHandler"
                @dragover="dragOverHandler">
                <input class="upload-input" ref="uploadInputEle" type="file" accept="image/*"
                    @change="fileChosenHandler" />
                <NButton size="large" @click="handleUploadButtonClick">
                    <template #icon>
                        <NIcon>
                            <Upload />
                        </NIcon>
                    </template>
                    浏览本地文件
                </NButton>
                <span class="select-or">或者</span>
                <span class="select-drag-prompt">把文件拖拽到这里</span>
                <div class="drag-n-drop-prompt prevent-pointer-event" :class="{ show: pageState.isHovering }">
                    <span>松开鼠标以添加</span>
                </div>
            </div>
        </div>
        <div class="dim-bg" @click="handleCancel"></div>
    </div>
</template>

<script lang="ts" setup>
    import { NButton, NIcon, NAlert, useMessage } from 'naive-ui';
    import type { MessageReactive } from 'naive-ui';
    import { Upload } from '@vicons/carbon';
    import { reactive, ref, watch, computed, onBeforeUnmount, h, Prop } from 'vue';
    const emit = defineEmits(['cancel', 'upload']);

    interface Props {
        uploadingFile: {
            isUploading: boolean,
            error: string | null
        }
    }
    const props = defineProps<Props>();

    const pageState = reactive({
        isHovering: false
    })

    const fileToUpload = ref<File | null>(null);

    const fileType = computed(() => {
        if (fileToUpload.value && fileToUpload.value.name) {
            return getFileTypeByName(fileToUpload.value.name);
        }
        else return null;
    });

    const imageFileUrl = computed(() => {
        if (fileToUpload.value && fileType.value && fileType.value === 'image') return window.URL.createObjectURL(fileToUpload.value)
        else return null;
    })

    const uploadInputEle = ref<HTMLInputElement | null>(null);

    const message = useMessage();

    let lastEnteredEle = null as EventTarget | null;

    const handleUploadButtonClick = () => {
        uploadInputEle.value?.click();
    }

    const dragEnterHandler = (ev: DragEvent) => {
        ev.preventDefault();
        // ev.stopPropagation();
        lastEnteredEle = ev.target;
        pageState.isHovering = true;
    }

    const dragOverHandler = (ev: DragEvent) => {
        ev.preventDefault();
    }

    const dragLeaveAndEndHandler = (ev: DragEvent) => {
        ev.preventDefault();
        if (ev.target === lastEnteredEle) {
            pageState.isHovering = false;
            lastEnteredEle = null;
            // ev.stopPropagation();
        }
    }

    const dropHandler = (ev: DragEvent) => {
        ev.preventDefault();
        pageState.isHovering = false;
        if (ev.dataTransfer && ev.dataTransfer.files) {
            const files = [...ev.dataTransfer.files];
            if (files.length >= 1 && validateFile(files[0])) {
                fileToUpload.value = files[0];
            }
        }
    }

    const fileChosenHandler = () => {
        if (uploadInputEle.value?.files) {
            const files = [...uploadInputEle.value?.files];
            if (files.length >= 1 && validateFile(files[0])) {
                fileToUpload.value = files[0];
            }
            uploadInputEle.value.value = '';
        }
    }

    const validateFile = (file: File | null) => {
        if (!!file) {
            const _fileType = getFileTypeByName(file.name);
            if (_fileType !== null) return true;
            else {
                console.info(`[${file.name}] File type not valid.`)
                return false;
            };
        }
        else {
            return false;
        }
    }

    const fileExtRegex = /\.[0-9a-z]+$/i;

    const allowedAttachmentExts = {
        image: ['jpg', 'jpeg', 'png', 'gif', 'ico', 'bmp'],
        audio: ['mp3', 'wav', 'aac', 'ogg'],
        video: ['mp4', 'm4v', 'webm', 'avi', 'wmv', '3gp'],
        document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
        misc: ['js', 'py']
    }


    const getFileTypeByName = (filename: string | null | undefined): string | null => {
        const fileExtRes = String(filename).match(fileExtRegex);
        if (fileExtRes && fileExtRes.length === 1) {
            const fileExt = fileExtRes[0].toLowerCase().substring(1);
            for (const [type, extensions] of Object.entries(allowedAttachmentExts)) {
                if (extensions.includes(fileExt)) {
                    return type;
                }
            }
            return 'other';
        }
        else return null;

    }

    let uploadingMessage: MessageReactive | null = null


    const handleUpload = () => {
        emit('upload', fileToUpload.value);
    }


    watch(() => props.uploadingFile, (newVal, oldVal) => {
        console.log(newVal, oldVal);
        if (newVal.isUploading && oldVal.isUploading === false) {
            uploadingMessage = message.loading('文件上传中...', {
                duration: 0,
                keepAliveOnHover: true,
            });
        }

        if (newVal.isUploading === false && oldVal) {
            if (uploadingMessage) {
                uploadingMessage.destroy();
                uploadingMessage = null;
            }
            if (!newVal.error) {
                message.success('文件已经发送', {
                    render: (props) => h(NAlert, {
                        type: 'success',
                        closable: true,
                        title: '上传成功',
                        style: {
                            maxWidth: 'calc(100vw - 32px)',
                            width: '480px'
                        }
                    }, {
                        default: () => props.content
                    })
                })
            }

            else {
                message.error('文件上传失败，无法发送', {
                    render: (props) => h(NAlert, {
                        type: 'error',
                        closable: true,
                        title: '上传失败',
                        style: {
                            maxWidth: 'calc(100vw - 32px)',
                            width: '480px'
                        }
                    }, {
                        default: () => props.content
                    })
                })
            }

        }
    })

    const handleCancel = () => {
        console.log(props.uploadingFile);
        if (!props.uploadingFile.isUploading) return emit('cancel');
        else return;
    }

    onBeforeUnmount(() => {
        if (uploadingMessage) {
            uploadingMessage.destroy();
            uploadingMessage = null;
        }
    })

</script>

<style scoped>

    .file-upload-modal {
        max-width: 1000px !important;

    }

    .file-upload-modal>div[class$='wrapper'] {
        margin: 0 1rem;
    }

    .upload-wrapper {
        border: 2px dashed #e0e0e0;
        border-radius: 0.6rem;
        padding: 10rem 4rem;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        gap: 0.4rem;
        user-select: none;
        z-index: 10;
        position: relative;
        min-width: 400px;
        min-height: 150px;
        overflow: hidden;
    }

    .upload-wrapper .select-or {
        color: var(--text-secondary);
        font-size: 1rem;
        font-weight: lighter;
    }

    .upload-wrapper .select-drag-prompt,
    .upload-wrapper .drag-n-drop-prompt>span {
        color: var(--text-accent);
        font-size: 1.2rem;
        font-weight: bold;
    }

    .upload-input {
        display: none;
    }

    .upload-wrapper .drag-n-drop-prompt {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(164, 164, 164, 0.2);
        backdrop-filter: blur(4px);
        z-index: 20;
        opacity: 0;
        transition: opacity .4s ease-out;
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }

    .upload-wrapper .drag-n-drop-prompt.show {
        opacity: 1;
    }

    .prevent-pointer-event {
        pointer-events: none;
    }

    .preview-wrapper {}

    .preview-wrapper>div[class$='wrapper'] {
        margin-bottom: 1.2rem;
    }

    .preview-wrapper .image-wrapper {
        overflow-x: hidden;
        user-select: none;
    }

    .preview-wrapper .image-wrapper img {
        width: auto;
        max-width: 100%;
        max-height: 500px;
    }

    .preview-wrapper .actions {
        display: inline-flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 8px;
    }
</style>