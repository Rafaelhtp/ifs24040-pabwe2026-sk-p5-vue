<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Back button -->
    <div>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition p-1"
        data-testid="back-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Katalog
      </RouterLink>
    </div>

    <!-- Loading State -->
    <div v-if="aucationsStore.isAucation && !aucation" class="p-12 text-center bg-white rounded-3xl border border-slate-200 animate-pulse" data-testid="detail-loading">
      <div class="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
      <div class="h-6 bg-slate-200 rounded-md w-1/3 mx-auto"></div>
    </div>

    <!-- Empty or Not Found State -->
    <div v-else-if="!aucation" class="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs" data-testid="detail-not-found">
      <h3 class="text-lg font-bold text-slate-800">Lelang Tidak Ditemukan</h3>
      <p class="text-sm text-slate-500 mt-1">Barang lelang yang Anda tuju mungkin telah dihapus atau tidak tersedia.</p>
      <RouterLink to="/" class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
        Kembali ke Beranda
      </RouterLink>
    </div>

    <!-- Detail Content -->
    <div v-else class="space-y-8" data-testid="detail-content">
      <!-- Title & Status Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5 mb-2">
            <span
              class="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs"
              :class="isClosed ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white'"
              data-testid="status-badge"
            >
              {{ isClosed ? 'Lelang Ditutup' : 'Sedang Berlangsung' }}
            </span>
            <span class="text-xs text-slate-400 font-medium">ID: {{ aucation.id }}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ aucation.title }}
          </h1>
        </div>

        <!-- Owner Controls Top -->
        <div v-if="isOwner" class="flex items-center gap-2">
          <button
            type="button"
            @click="isChangeModalOpen = true"
            class="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition flex items-center gap-1.5"
            data-testid="owner-edit-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Ubah
          </button>
          <button
            type="button"
            @click="isCoverModalOpen = true"
            class="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1.5"
            data-testid="owner-cover-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Cover
          </button>
          <button
            type="button"
            @click="handleDelete"
            class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5"
            data-testid="owner-delete-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>

      <!-- Large Cover Image Banner -->
      <div class="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group">
        <img
          v-if="aucation.cover"
          :src="aucation.cover"
          :alt="aucation.title"
          class="w-full h-full object-cover"
          data-testid="large-cover-img"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-medium">Belum ada foto sampul</span>
        </div>

        <button
          v-if="isOwner"
          type="button"
          @click="isCoverModalOpen = true"
          class="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs text-xs font-bold shadow-lg transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          Ganti Foto Sampul
        </button>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Description & Info -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Deskripsi Barang</h2>
              <div class="mt-4 prose prose-slate max-w-none text-sm leading-relaxed" data-testid="markdown-description">
                <MarkdownViewer :content="aucation.description || 'Tidak ada deskripsi.'" />
              </div>
            </div>

            <!-- Meta attributes -->
            <div class="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Harga Awal</span>
                <p class="text-sm font-bold text-slate-800 mt-0.5">{{ formatRupiah(aucation.start_bid) }}</p>
              </div>
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penutupan</span>
                <p class="text-sm font-bold text-slate-800 mt-0.5">{{ formatDate(aucation.closed_at) }}</p>
              </div>
              <div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dibuat Pada</span>
                <p class="text-sm font-bold text-slate-800 mt-0.5">{{ formatDate(aucation.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Bid Summary, Controls & Bid History -->
        <div class="space-y-6">
          <!-- Bid Summary Box -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tawaran Tertinggi Saat Ini</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight" data-testid="detail-highest-bid">
                {{ formatRupiah(highestBidAmount) }}
              </span>
            </div>

            <!-- Action: Bid button for Non-owner -->
            <div v-if="!isOwner">
              <button
                v-if="!isClosed"
                type="button"
                @click="isBidModalOpen = true"
                class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                data-testid="place-bid-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ajukan Tawaran
              </button>

              <button
                v-if="hasMyBid && !isClosed"
                type="button"
                @click="handleCancelBid"
                class="w-full mt-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                data-testid="cancel-bid-button"
              >
                Tarik Penawaran Terakhir Saya
              </button>
            </div>
            <div v-else class="p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-semibold">
              Anda adalah pemilik lelang ini.
            </div>
          </div>

          <!-- Bid History Section -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-sm font-bold text-slate-800">Riwayat Penawaran</h3>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {{ bidHistory.length }} Tawaran
              </span>
            </div>

            <!-- Empty history -->
            <div v-if="bidHistory.length === 0" class="py-6 text-center text-slate-400 text-xs">
              Belum ada penawaran untuk lelang ini. Jadilah yang pertama menawar!
            </div>

            <!-- List history -->
            <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1" data-testid="bid-history-list">
              <div
                v-for="(bidItem, idx) in sortedBidHistory"
                :key="bidItem.id || idx"
                class="p-3 rounded-xl flex items-center justify-between border text-xs"
                :class="idx === 0 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-100'"
              >
                <div class="space-y-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-800">
                      {{ bidItem.user?.name || bidItem.bidder_name || 'Penawar' }}
                    </span>
                    <span
                      v-if="idx === 0"
                      class="px-1.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold"
                    >
                      Tertinggi
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400">{{ formatDate(bidItem.created_at) }}</p>
                </div>
                <div class="text-right">
                  <span class="font-black text-slate-900" :class="{ 'text-emerald-700': idx === 0 }">
                    {{ formatRupiah(bidItem.bid) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChangeModal
      :is-open="isChangeModalOpen"
      :aucation="aucation"
      @close="isChangeModalOpen = false"
      @success="loadDetail"
    />

    <ChangeCoverModal
      :is-open="isCoverModalOpen"
      :aucation-id="aucation?.id || ''"
      :current-cover="aucation?.cover || ''"
      @close="isCoverModalOpen = false"
      @success="loadDetail"
    />

    <BidModal
      :is-open="isBidModalOpen"
      :aucation="aucation"
      @close="isBidModalOpen = false"
      @success="loadDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { formatRupiah, formatDate, showConfirmDialog } from '../../../helpers/toolsHelper.js'

import MarkdownViewer from '../components/MarkdownViewer.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import BidModal from '../modals/BidModal.vue'

const route = useRoute()
const router = useRouter()
const aucationsStore = useAucationsStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const isChangeModalOpen = ref(false)
const isCoverModalOpen = ref(false)
const isBidModalOpen = ref(false)

const aucation = computed(() => aucationsStore.aucation)

const currentUserId = computed(() => {
  return authStore.user?.id || usersStore.profile?.id || ''
})

const isOwner = computed(() => {
  if (!aucation.value) return false
  if (aucation.value.is_me) return true
  if (aucation.value.author_id && currentUserId.value) {
    return String(aucation.value.author_id) === String(currentUserId.value)
  }
  if (aucation.value.user_id && currentUserId.value) {
    return String(aucation.value.user_id) === String(currentUserId.value)
  }
  return false
})

const isClosed = computed(() => {
  if (!aucation.value) return false
  if (aucation.value.is_closed !== undefined && aucation.value.is_closed !== null) {
    return Boolean(aucation.value.is_closed)
  }
  if (aucation.value.closed_at) {
    return new Date(aucation.value.closed_at).getTime() <= Date.now()
  }
  return false
})

const bidHistory = computed(() => {
  if (!aucation.value) return []
  return Array.isArray(aucation.value.bids) ? aucation.value.bids : []
})

const sortedBidHistory = computed(() => {
  return [...bidHistory.value].sort((a, b) => Number(b.bid) - Number(a.bid))
})

const highestBidAmount = computed(() => {
  if (!aucation.value) return 0
  if (aucation.value.highest_bid) return Number(aucation.value.highest_bid)
  if (sortedBidHistory.value.length > 0) return Number(sortedBidHistory.value[0].bid)
  return Number(aucation.value.start_bid || 0)
})

const hasMyBid = computed(() => {
  if (!currentUserId.value) return false
  return bidHistory.value.some((b) => {
    return String(b.user_id || b.user?.id) === String(currentUserId.value)
  })
})

const loadDetail = async () => {
  const id = route.params.aucationId
  if (id) {
    await aucationsStore.asyncGetAucationById(id)
  }
}

const handleDelete = async () => {
  const confirm = await showConfirmDialog(
    'Lelang ini akan dihapus secara permanen. Lanjutkan?',
    'Hapus Lelang',
    'Ya, Hapus'
  )
  if (confirm && confirm.isConfirmed) {
    const res = await aucationsStore.asyncDeleteAucation(aucation.value.id)
    if (res && res.success) {
      router.push('/')
    }
  }
}

const handleCancelBid = async () => {
  const confirm = await showConfirmDialog(
    'Apakah Anda yakin ingin menarik penawaran Anda?',
    'Tarik Penawaran',
    'Ya, Tarik'
  )
  if (confirm && confirm.isConfirmed) {
    await aucationsStore.asyncDeleteBid(aucation.value.id)
  }
}

onMounted(() => {
  loadDetail()
})
</script>
