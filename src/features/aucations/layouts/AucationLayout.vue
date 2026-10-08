<template>
  <div class="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
    <!-- Navbar Component -->
    <NavbarComponent @toggle-sidebar="toggleSidebar" />

    <div class="flex-1 flex overflow-hidden">
      <!-- Responsive Sidebar -->
      <SidebarComponent
        :is-open="isSidebarOpen"
        @close="isSidebarOpen = false"
      />

      <!-- Main Content Area with RouterView -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'
import { useUsersStore } from '../../users/states/usersStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'

const isSidebarOpen = ref(false)
const usersStore = useUsersStore()
const authStore = useAuthStore()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(() => {
  if (authStore.token && !usersStore.profile) {
    usersStore.asyncGetMe()
  }
})
</script>
