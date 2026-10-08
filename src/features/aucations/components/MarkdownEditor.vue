<template>
  <div class="toastui-editor-wrapper">
    <div ref="editorRef" data-testid="toast-ui-editor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '300px',
  },
  placeholder: {
    type: String,
    default: 'Tulis deskripsi lelang menggunakan format Markdown...',
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let editorInstance = null

onMounted(() => {
  if (editorRef.value) {
    try {
      editorInstance = new Editor({
        el: editorRef.value,
        height: props.height,
        initialEditType: 'markdown',
        previewStyle: 'tab',
        initialValue: props.modelValue || '',
        placeholder: props.placeholder,
        events: {
          change: () => {
            if (editorInstance) {
              const content = editorInstance.getMarkdown()
              emit('update:modelValue', content)
            }
          },
        },
      })
    } catch {
      editorInstance = null
    }
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (editorInstance) {
      const current = editorInstance.getMarkdown()
      if (current !== newVal) {
        editorInstance.setMarkdown(newVal || '')
      }
    }
  }
)

onBeforeUnmount(() => {
  if (editorInstance && typeof editorInstance.destroy === 'function') {
    editorInstance.destroy()
    editorInstance = null
  }
})
</script>
