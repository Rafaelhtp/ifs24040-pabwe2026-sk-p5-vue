<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    data-testid="bid-modal"
  >
    <div class="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Ajukan Tawaran</h3>
            <p class="text-xs text-slate-500">Pasang harga penawaran terbaik Anda</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          data-testid="close-bid-modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Current Highest Bid Info -->
      <div class="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500">
            {{ highestBidAmount > 0 ? 'Tawaran Tertinggi Saat Ini' : 'Harga Awal Lelang' }}
          </span>
          <p class="text-xl font-extrabold text-indigo-600 tracking-tight" data-testid="current-bid-display">
            {{ formatRupiah(currentBenchmarkBid) }}
          </p>
        </div>
        <div class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
          Min. Tawaran > {{ formatRupiah(currentBenchmarkBid) }}
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="bid-input" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nominal Tawaran Anda (Rp) *
          </label>
          <input
            id="bid-input"
            type="number"
            v-model.number="bidAmount"
            placeholder="Masukkan nominal tawaran"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
          />
          <p v-if="error" class="text-xs text-rose-500 mt-1">{{ error }}</p>
        </div>

        <!-- Quick increments -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="addIncrement(10000)"
            class="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            +10 Ribu
          </button>
          <button
            type="button"
            @click="addIncrement(50000)"
            class="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            +50 Ribu
          </button>
          <button
            type="button"
            @click="addIncrement(100000)"
            class="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            +100 Ribu
          </button>
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
            :disabled="aucationsStore.isBidAdd"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="aucationsStore.isBidAdd" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ aucationsStore.isBidAdd ? 'Mengirim...' : 'Kirim Tawaran' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { formatRupiah, showErrorDialog } from '../../../helpers/toolsHelper.js'

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
const bidAmount = ref(null)
const error = ref('')

const highestBidAmount = computed(() => {
  if (!props.aucation) return 0
  if (props.aucation.highest_bid) {
    return Number(props.aucation.highest_bid)
  }
  if (Array.isArray(props.aucation.bids) && props.aucation.bids.length > 0) {
    return Math.max(...props.aucation.bids.map((b) => Number(b.bid) || 0))
  }
  return 0
})

const currentBenchmarkBid = computed(() => {
  if (highestBidAmount.value > 0) {
    return highestBidAmount.value
  }
  return Number(props.aucation?.start_bid || 0)
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      error.value = ''
      bidAmount.value = currentBenchmarkBid.value + 10000
    }
  },
  { immediate: true }
)

const addIncrement = (inc) => {
  const current = Number(bidAmount.value) || currentBenchmarkBid.value
  bidAmount.value = current + inc
}

const handleClose = () => {
  error.value = ''
  bidAmount.value = null
  emit('close')
}

const validate = () => {
  error.value = ''
  const val = Number(bidAmount.value)

  if (!val || val <= 0) {
    error.value = 'Nominal tawaran wajib diisi dan harus lebih dari 0'
    return false
  }

  if (val <= currentBenchmarkBid.value) {
    error.value = `Tawaran harus lebih tinggi dari ${formatRupiah(currentBenchmarkBid.value)}`
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validate()) {
    showErrorDialog(error.value, 'Tawaran Tidak Valid')
    return
  }

  const res = await aucationsStore.asyncCreateBid(props.aucation.id, {
    bid: Number(bidAmount.value),
  })

  if (res && res.success) {
    emit('success', res.data)
    handleClose()
  }
}
</script>
