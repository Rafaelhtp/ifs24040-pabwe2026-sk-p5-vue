<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    data-testid="change-cover-modal"
  >
    <div class="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Ganti Foto Sampul Lelang</h3>
            <p class="text-xs text-slate-500">Unggah foto berkualitas agar menarik minat penawar</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          data-testid="close-cover-modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Live Preview & File Picker -->
      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <!-- Live Preview Box -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pratinjau Foto Sampul (Live Preview)
          </label>
          <div class="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group">
            <img
              v-if="activePreview"
              :src="activePreview"
              alt="Pratinjau Cover"
              class="w-full h-full object-cover"
              data-testid="cover-preview"
            />
            <div v-else class="text-center p-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-xs">Belum ada foto sampul yang dipilih</p>
            </div>
          </div>
        </div>

        <!-- File Input -->
        <div>
          <label for="cover-file-input" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Pilih Berkas Gambar *
          </label>
          <input
            id="cover-file-input"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer border border-slate-200 rounded-xl p-1"
          />
          <p v-if="error" class="text-xs text-rose-500 mt-1">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="aucationsStore.isAucationChangeCover"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-md shadow-purple-200 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="aucationsStore.isAucationChangeCover" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ aucationsStore.isAucationChangeCover ? 'Mengunggah...' : 'Unggah Cover' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  aucationId: {
    type: [String, Number],
    required: true,
  },
  currentCover: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'success'])

const aucationsStore = useAucationsStore()

const selectedFile = ref(null)
const previewObjectUrl = ref('')
const error = ref('')

const activePreview = computed(() => {
  return previewObjectUrl.value || props.currentCover || ''
})

watch(
  () => props.isOpen,
  (newIsOpen) => {
    if (newIsOpen) {
      selectedFile.value = null
      previewObjectUrl.value = ''
      error.value = ''
    }
  }
)

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
    error.value = ''
    if (previewObjectUrl.value) {
      URL.revokeObjectURL(previewObjectUrl.value)
    }
    previewObjectUrl.value = URL.createObjectURL(file)
  }
}

const handleClose = () => {
  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value)
  }
  selectedFile.value = null
  previewObjectUrl.value = ''
  error.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!selectedFile.value) {
    error.value = 'Silakan pilih berkas gambar terlebih dahulu'
    showErrorDialog('Silakan pilih berkas gambar terlebih dahulu', 'Berkas Kosong')
    return
  }

  const res = await aucationsStore.asyncUpdateAucationCover(props.aucationId, selectedFile.value)
  if (res && res.success) {
    emit('success', res.data)
    handleClose()
  }
}
</script>
