<template>
  <div class="space-y-6">
    <!-- Header banner & Action buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Eksplorasi Lelang</h1>
        <p class="text-sm text-slate-500 mt-1">Temukan dan ikuti penawaran berbagai barang pilihan</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="activeTab === 'mine' && filteredAucations.length > 0"
          type="button"
          @click="handleDeleteAllMine"
          class="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
          data-testid="delete-all-mine-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus Semua Lelang Saya
        </button>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center gap-2"
          data-testid="open-add-modal-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Buka Lelang Baru
        </button>
      </div>
    </div>

    <!-- Search & Filter Tabs -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Tabs -->
      <div class="flex items-center overflow-x-auto gap-1.5 p-1 bg-slate-100/80 rounded-xl">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="selectTab(tab.id)"
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap"
          :class="activeTab === tab.id ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          :data-testid="`tab-${tab.id}`"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Live Search -->
      <div class="relative w-full md:w-80">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari lelang berdasarkan judul..."
          class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
          data-testid="search-input"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="aucationsStore.isAucation" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="aucations-loading">
      <div v-for="n in 6" :key="n" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
        <div class="h-48 bg-slate-200"></div>
        <div class="p-5 space-y-3">
          <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
          <div class="h-3 bg-slate-200 rounded-md w-1/2"></div>
          <div class="h-8 bg-slate-100 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredAucations.length === 0"
      class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs"
      data-testid="aucations-empty"
    >
      <div class="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h2 class="text-base font-bold text-slate-800">Tidak ada lelang yang ditemukan</h2>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Belum ada barang lelang pada kategori ini atau kata kunci yang Anda cari belum cocok.
      </p>
    </div>

    <!-- Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="aucations-grid">
      <div
        v-for="item in filteredAucations"
        :key="item.id"
        class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-indigo-200 transition duration-200 flex flex-col group"
      >
        <!-- Card Cover & Status Badge -->
        <div class="relative h-48 bg-slate-100 overflow-hidden">
          <img
            v-if="item.cover"
            :src="item.cover"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-[11px] font-medium">Tidak ada foto</span>
          </div>

          <!-- Status badge -->
          <div class="absolute top-3 left-3">
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5"
              :class="isClosed(item) ? 'bg-slate-900/80 text-white backdrop-blur-xs' : 'bg-emerald-700 text-white'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping" v-if="!isClosed(item)"></span>
              {{ isClosed(item) ? 'Ditutup' : 'Berlangsung' }}
            </span>
          </div>

          <!-- Countdown status -->
          <div class="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-medium">
            {{ getCountdownText(item.closed_at) }}
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
              {{ item.title }}
            </h2>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">
              {{ item.description?.replace(/[#*`_~]/g, '') }}
            </p>

            <!-- Pricing Details -->
            <div class="mt-4 p-3 bg-slate-50 rounded-xl grid grid-cols-2 gap-2 border border-slate-100">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-600">Harga Awal</span>
                <p class="text-xs font-bold text-slate-700 truncate">
                  {{ formatRupiah(item.start_bid) }}
                </p>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-indigo-700">Tawaran Tertinggi</span>
                <p class="text-xs font-black text-indigo-600 truncate">
                  {{ formatRupiah(getHighestBid(item)) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <RouterLink
              :to="`/aucations/${item.id}`"
              class="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition"
            >
              Lihat Detail
            </RouterLink>

            <!-- Quick Bid button for non-owner if auction active -->
            <button
              v-if="!isOwner(item) && !isClosed(item)"
              type="button"
              @click="openBidModal(item)"
              class="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs"
              data-testid="quick-bid-button"
            >
              Tawar
            </button>

            <!-- Owner Quick Controls -->
            <div v-if="isOwner(item)" class="flex items-center gap-1">
              <button
                type="button"
                @click="openChangeModal(item)"
                class="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition"
                title="Ubah Lelang"
                aria-label="Ubah Lelang"
                data-testid="edit-aucation-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                @click="openChangeCoverModal(item)"
                class="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition"
                title="Ganti Cover"
                aria-label="Ganti Cover"
                data-testid="cover-aucation-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                @click="handleDeleteAucation(item.id)"
                class="p-2 rounded-xl text-rose-700 hover:bg-rose-50 transition"
                title="Hapus Lelang"
                aria-label="Hapus Lelang"
                data-testid="delete-aucation-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @success="fetchData"
    />

    <ChangeModal
      :is-open="isChangeModalOpen"
      :aucation="selectedAucation"
      @close="isChangeModalOpen = false"
      @success="fetchData"
    />

    <ChangeCoverModal
      :is-open="isCoverModalOpen"
      :aucation-id="selectedAucation?.id || ''"
      :current-cover="selectedAucation?.cover || ''"
      @close="isCoverModalOpen = false"
      @success="fetchData"
    />

    <BidModal
      :is-open="isBidModalOpen"
      :aucation="selectedAucation"
      @close="isBidModalOpen = false"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { formatRupiah, showConfirmDialog } from '../../../helpers/toolsHelper.js'

import AddModal from '../modals/AddModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import BidModal from '../modals/BidModal.vue'

const route = useRoute()
const aucationsStore = useAucationsStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const tabs = [
  { id: 'all', name: 'Semua Lelang' },
  { id: 'mine', name: 'Lelang Saya' },
  { id: 'active', name: 'Lelang Berlangsung' },
  { id: 'closed', name: 'Lelang Ditutup' },
]

const activeTab = ref('all')
const searchQuery = ref('')

const isAddModalOpen = ref(false)
const isChangeModalOpen = ref(false)
const isCoverModalOpen = ref(false)
const isBidModalOpen = ref(false)
const selectedAucation = ref(null)

const selectTab = (tabId) => {
  activeTab.value = tabId
  fetchData()
}

const isClosed = (item) => {
  if (item.is_closed !== undefined && item.is_closed !== null) {
    return Boolean(item.is_closed)
  }
  if (item.closed_at) {
    return new Date(item.closed_at).getTime() <= Date.now()
  }
  return false
}

const getCountdownText = (closedAt) => {
  if (!closedAt) return '-'
  const diff = new Date(closedAt).getTime() - Date.now()
  if (diff <= 0) return 'Telah Berakhir'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `Sisa ${days} hari`
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `Sisa ${hours}j ${minutes}m`
}

const getHighestBid = (item) => {
  if (item.highest_bid) return Number(item.highest_bid)
  if (Array.isArray(item.bids) && item.bids.length > 0) {
    return Math.max(...item.bids.map((b) => Number(b.bid) || 0))
  }
  return Number(item.start_bid || 0)
}

const currentUserId = computed(() => {
  return authStore.user?.id || usersStore.profile?.id || ''
})

const isOwner = (item) => {
  if (item.is_me) return true
  if (item.author_id && currentUserId.value) {
    return String(item.author_id) === String(currentUserId.value)
  }
  if (item.user_id && currentUserId.value) {
    return String(item.user_id) === String(currentUserId.value)
  }
  return false
}

const fetchData = async () => {
  const params = {}
  if (activeTab.value === 'mine') {
    params.is_me = 1
  } else if (activeTab.value === 'active') {
    params.is_closed = 0
  } else if (activeTab.value === 'closed') {
    params.is_closed = 1
  }
  await aucationsStore.asyncGetAucations(params)
}

const filteredAucations = computed(() => {
  let list = aucationsStore.aucations || []

  // Client filter fallback for tabs
  if (activeTab.value === 'mine') {
    list = list.filter((item) => isOwner(item))
  } else if (activeTab.value === 'active') {
    list = list.filter((item) => !isClosed(item))
  } else if (activeTab.value === 'closed') {
    list = list.filter((item) => isClosed(item))
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return list

  return list.filter((item) => {
    const titleMatch = item.title && item.title.toLowerCase().includes(query)
    const descMatch = item.description && item.description.toLowerCase().includes(query)
    return Boolean(titleMatch || descMatch)
  })
})

const openChangeModal = (item) => {
  selectedAucation.value = item
  isChangeModalOpen.value = true
}

const openChangeCoverModal = (item) => {
  selectedAucation.value = item
  isCoverModalOpen.value = true
}

const openBidModal = (item) => {
  selectedAucation.value = item
  isBidModalOpen.value = true
}

const handleDeleteAucation = async (id) => {
  const confirm = await showConfirmDialog(
    'Lelang yang dihapus tidak dapat dipulihkan. Apakah Anda yakin?',
    'Hapus Lelang',
    'Ya, Hapus'
  )
  if (confirm && confirm.isConfirmed) {
    await aucationsStore.asyncDeleteAucation(id)
  }
}

const handleDeleteAllMine = async () => {
  const confirm = await showConfirmDialog(
    'Semua lelang Anda akan dihapus secara permanen. Apakah Anda yakin?',
    'Hapus Semua Lelang',
    'Ya, Hapus Semua'
  )
  if (confirm && confirm.isConfirmed) {
    await aucationsStore.deleteAllMyAucations()
    fetchData()
  }
}

watch(
  () => route.query?.tab,
  (newTab) => {
    if (newTab === 'mine') {
      activeTab.value = 'mine'
      fetchData()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (!route.query?.tab) {
    fetchData()
  }
})
</script>
