<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
      @click="$emit('close')"
      data-testid="sidebar-backdrop"
    ></div>

    <!-- Sidebar Drawer Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto min-h-screen"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
      data-testid="sidebar"
    >
      <!-- Sidebar Header / Mobile Close -->
      <div class="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <span class="font-bold text-slate-800 text-base">Menu Lelang</span>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Tutup menu"
          data-testid="close-sidebar-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <RouterLink
          to="/"
          @click="$emit('close')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group"
          :class="isExactHome ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard Lelang</span>
        </RouterLink>

        <RouterLink
          to="/?tab=mine"
          @click="$emit('close')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group"
          :class="isMineTab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Lelang Saya</span>
        </RouterLink>

        <RouterLink
          to="/users"
          @click="$emit('close')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group"
          :class="isUsersRoute ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Daftar Pengguna</span>
        </RouterLink>

        <RouterLink
          to="/profile"
          @click="$emit('close')"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group"
          :class="isProfileRoute ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profil Saya</span>
        </RouterLink>
      </nav>

      <!-- Sidebar Footer Badge -->
      <div class="p-4 border-t border-slate-200">
        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-500">
          <p class="font-bold text-slate-800">Delcom Auction v1.0</p>
          <p class="mt-0.5">Sistem Lelang Terbuka & Adil</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const route = useRoute()

const isMineTab = computed(() => route.path === '/' && route.query?.tab === 'mine')
const isExactHome = computed(() => route.path === '/' && (!route.query || !route.query.tab || route.query.tab !== 'mine'))
const isUsersRoute = computed(() => route.path.startsWith('/users'))
const isProfileRoute = computed(() => route.path.startsWith('/profile'))
</script>
