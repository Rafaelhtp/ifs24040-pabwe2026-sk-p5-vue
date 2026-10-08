<template>
  <div class="toastui-viewer-wrapper">
    <div ref="viewerRef" data-testid="toast-ui-viewer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const viewerRef = ref(null)
let viewerInstance = null

onMounted(() => {
  if (viewerRef.value) {
    try {
      viewerInstance = Editor.factory({
        el: viewerRef.value,
        viewer: true,
        initialValue: props.content || '',
      })
    } catch {
      viewerInstance = null
    }
  }
})

watch(
  () => props.content,
  (newContent) => {
    if (viewerInstance && typeof viewerInstance.setMarkdown === 'function') {
      viewerInstance.setMarkdown(newContent || '')
    }
  }
)

onBeforeUnmount(() => {
  if (viewerInstance && typeof viewerInstance.destroy === 'function') {
    viewerInstance.destroy()
    viewerInstance = null
  }
})
</script>
