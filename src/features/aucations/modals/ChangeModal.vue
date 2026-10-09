<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    data-testid="change-modal"
  >
    <div class="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Ubah Data Lelang</h2>
            <p class="text-xs text-slate-500">Perbarui informasi barang lelang Anda</p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          aria-label="Tutup"
          data-testid="close-change-modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
        <div>
          <label for="change-title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Judul Barang Lelang *
          </label>
          <input
            id="change-title"
            type="text"
            v-model="title"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
          />
          <p v-if="titleError" class="text-xs text-rose-500 mt-1">{{ titleError }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="change-start-bid" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Harga Awal (Rp) *
            </label>
            <input
              id="change-start-bid"
              type="number"
              v-model.number="startBid"
              min="1"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="startBidError" class="text-xs text-rose-500 mt-1">{{ startBidError }}</p>
          </div>

          <div>
            <label for="change-closed-at" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Waktu Penutupan *
            </label>
            <input
              id="change-closed-at"
              type="datetime-local"
              v-model="closedAt"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="closedAtError" class="text-xs text-rose-500 mt-1">{{ closedAtError }}</p>
          </div>
        </div>

        <div>
          <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Deskripsi Lelang (Markdown) *
          </span>
          <MarkdownEditor v-model="description" height="240px" />
          <p v-if="descriptionError" class="text-xs text-rose-500 mt-1">{{ descriptionError }}</p>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="aucationsStore.isAucationChange"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition shadow-md shadow-amber-200 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="aucationsStore.isAucationChange" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ aucationsStore.isAucationChange ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent } from 'vue'
import { useAucationsStore } from '../states/aucationsStore.js'
const MarkdownEditor = defineAsyncComponent(() => import('../components/MarkdownEditor.vue'))
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  aucation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'success'])

const aucationsStore = useAucationsStore()

const title = ref('')
const description = ref('')
const startBid = ref(null)
const closedAt = ref('')

const titleError = ref('')
const descriptionError = ref('')
const startBidError = ref('')
const closedAtError = ref('')

const formatForInput = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  // Format as YYYY-MM-DDTHH:mm local
  const pad = (num) => String(num).padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

watch(
  () => [props.isOpen, props.aucation],
  ([isOpen, currentAucation]) => {
    if (isOpen && currentAucation) {
      title.value = currentAucation.title || ''
      description.value = currentAucation.description || ''
      startBid.value = currentAucation.start_bid ?? null
      closedAt.value = formatForInput(currentAucation.closed_at)
      titleError.value = ''
      descriptionError.value = ''
      startBidError.value = ''
      closedAtError.value = ''
    }
  },
  { immediate: true }
)

const validate = () => {
  let isValid = true
  titleError.value = ''
  descriptionError.value = ''
  startBidError.value = ''
  closedAtError.value = ''

  if (!title.value || !title.value.trim()) {
    titleError.value = 'Judul lelang wajib diisi'
    isValid = false
  }

  if (!startBid.value || Number(startBid.value) <= 0) {
    startBidError.value = 'Harga awal harus lebih dari Rp 0'
    isValid = false
  }

  if (!closedAt.value) {
    closedAtError.value = 'Waktu penutupan lelang wajib diisi'
    isValid = false
  }

  if (!description.value || !description.value.trim()) {
    descriptionError.value = 'Deskripsi lelang wajib diisi'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) {
    showErrorDialog('Harap lengkapi semua data formulir dengan benar', 'Form Belum Lengkap')
    return
  }

  const isoClosedAt = new Date(closedAt.value).toISOString()
  const res = await aucationsStore.asyncUpdateAucation(props.aucation.id, {
    title: title.value.trim(),
    description: description.value.trim(),
    start_bid: Number(startBid.value),
    closed_at: isoClosedAt,
  })

  if (res && res.success) {
    emit('success', res.data)
    emit('close')
  }
}
</script>
