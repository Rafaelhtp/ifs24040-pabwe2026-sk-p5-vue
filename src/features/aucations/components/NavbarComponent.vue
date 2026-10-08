<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <!-- Mobile sidebar toggle & Logo -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          @click="$emit('toggle-sidebar')"
          class="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Toggle Sidebar"
          data-testid="toggle-sidebar-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <RouterLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <span class="text-lg font-black text-slate-900 tracking-tight hidden sm:inline">Delcom Auction</span>
        </RouterLink>
      </div>

      <!-- User Identity & Logout -->
      <div class="flex items-center gap-3">
        <RouterLink
          to="/profile"
          class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition text-slate-700 group"
          data-testid="profile-link"
        >
          <div class="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-1 ring-slate-200">
            <img
              v-if="userPhoto"
              :src="userPhoto"
              :alt="userName"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ userInitial }}</span>
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition truncate max-w-[120px]">
              {{ userName }}
            </p>
            <p class="text-[11px] text-slate-500 leading-tight truncate max-w-[120px]">
              {{ userEmail }}
            </p>
          </div>
        </RouterLink>

        <!-- Logout Button -->
        <button
          type="button"
          @click="handleLogout"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition shadow-2xs"
          data-testid="logout-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../../auth/states/authStore.js'
import { showConfirmDialog } from '../../../helpers/toolsHelper.js'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

const currentUser = computed(() => authStore.user)

const userName = computed(() => currentUser.value?.name || 'Pengguna')
const userEmail = computed(() => currentUser.value?.email || '')
const userPhoto = computed(() => currentUser.value?.photo || currentUser.value?.avatar || '')

const userInitial = computed(() => {
  const name = userName.value
  return name ? name.trim().charAt(0).toUpperCase() : 'U'
})

const handleLogout = async () => {
  const confirmResult = await showConfirmDialog(
    'Apakah Anda yakin ingin keluar dari akun Anda?',
    'Konfirmasi Keluar',
    'Ya, Keluar'
  )

  if (confirmResult && confirmResult.isConfirmed) {
    await authStore.asyncLogout()
    router.push('/auth/login')
  }
}
</script>
