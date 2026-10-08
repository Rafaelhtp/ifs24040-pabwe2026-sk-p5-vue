<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Pengguna</h1>
        <p class="text-sm text-slate-500 mt-1">Daftar seluruh pengguna yang terdaftar di Delcom Auction</p>
      </div>
      <div class="w-full sm:w-72">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari nama atau email..."
          class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.isUsersLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-loading">
      <div v-for="n in 6" :key="n" class="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs animate-pulse flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-slate-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
          <div class="h-3 bg-slate-200 rounded-md w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs"
      data-testid="users-empty"
    >
      <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 class="text-base font-semibold text-slate-800">Tidak ada pengguna ditemukan</h2>
      <p class="text-sm text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
    </div>

    <!-- Users Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-grid">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition duration-200 flex items-center gap-4 group"
      >
        <div class="relative w-12 h-12 flex-shrink-0">
          <img
            v-if="user.photo || user.avatar"
            :src="user.photo || user.avatar"
            :alt="user.name"
            class="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-300 transition"
          />
          <div
            v-else
            class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-xs"
          >
            {{ getInitial(user.name) }}
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
            {{ user.name }}
          </h2>
          <p class="text-xs text-slate-500 truncate mt-0.5">{{ user.email }}</p>
          <div class="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
            <span>ID: {{ user.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../states/usersStore.js'

const usersStore = useUsersStore()
const searchQuery = ref('')

const getInitial = (name) => {
  if (!name) return 'U'
  return name.trim().charAt(0).toUpperCase()
}

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return usersStore.users
  return usersStore.users.filter((u) => {
    const nameMatch = u.name && u.name.toLowerCase().includes(query)
    const emailMatch = u.email && u.email.toLowerCase().includes(query)
    return Boolean(nameMatch || emailMatch)
  })
})

onMounted(() => {
  usersStore.asyncGetUsers()
})
</script>
