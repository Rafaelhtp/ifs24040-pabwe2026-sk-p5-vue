<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    data-testid="add-modal"
  >
    <div class="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Buka Lelang Baru</h2>
            <p class="text-xs text-slate-500">Isi rincian barang yang ingin Anda lelang</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          aria-label="Tutup"
          data-testid="close-add-modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-4 py-4 flex-1 overflow-y-auto pr-1">
        <div>
          <label for="add-title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Judul Barang Lelang *
          </label>
          <input
            id="add-title"
            type="text"
            v-model="title"
            placeholder="Contoh: MacBook Pro M2 2023 512GB"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
          />
          <p v-if="titleError" class="text-xs text-rose-500 mt-1">{{ titleError }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="add-start-bid" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Harga Awal (Rp) *
            </label>
            <input
              id="add-start-bid"
              type="number"
              v-model.number="startBid"
              placeholder="Contoh: 1000000"
              min="1"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="startBidError" class="text-xs text-rose-500 mt-1">{{ startBidError }}</p>
          </div>

          <div>
            <label for="add-closed-at" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Waktu Penutupan *
            </label>
            <input
              id="add-closed-at"
              type="datetime-local"
              v-model="closedAt"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="closedAtError" class="text-xs text-rose-500 mt-1">{{ closedAtError }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Deskripsi Lelang (Markdown) *
          </label>
          <MarkdownEditor v-model="description" height="240px" />
          <p v-if="descriptionError" class="text-xs text-rose-500 mt-1">{{ descriptionError }}</p>
        </div>

        <!-- Footer Actions -->
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
            :disabled="aucationsStore.isAucationAdd"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="aucationsStore.isAucationAdd" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ aucationsStore.isAucationAdd ? 'Membuat...' : 'Terbitkan Lelang' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useAucationsStore } from '../states/aucationsStore.js'
const MarkdownEditor = defineAsyncComponent(() => import('../components/MarkdownEditor.vue'))
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
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

const resetForm = () => {
  title.value = ''
  description.value = ''
  startBid.value = null
  closedAt.value = ''
  titleError.value = ''
  descriptionError.value = ''
  startBidError.value = ''
  closedAtError.value = ''
}

const handleClose = () => {
  resetForm()
  emit('close')
}

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

  // Format closed_at to ISO string
  const isoClosedAt = new Date(closedAt.value).toISOString()

  const res = await aucationsStore.asyncCreateAucation({
    title: title.value.trim(),
    description: description.value.trim(),
    start_bid: Number(startBid.value),
    closed_at: isoClosedAt,
  })

  if (res && res.success) {
    resetForm()
    emit('success', res.data)
    emit('close')
  }
}
</script>
