<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Profil Saya</h1>
      <p class="text-sm text-slate-500 mt-1">Kelola informasi akun, foto profil, dan keamanan Anda</p>
    </div>

    <!-- Profile Banner & Photo Upload -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="relative group">
          <img
            v-if="profilePhoto"
            :src="profilePhoto"
            alt="Foto Profil"
            class="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-50"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-3xl shadow-sm"
          >
            {{ userInitial }}
          </div>
          <label
            for="photo-upload"
            class="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md cursor-pointer transition"
            title="Ganti Foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handlePhotoChange"
            />
          </label>
        </div>

        <div class="text-center sm:text-left flex-1">
          <h2 class="text-lg font-bold text-slate-900">{{ usersStore.profile?.name || 'Pengguna' }}</h2>
          <p class="text-sm text-slate-500">{{ usersStore.profile?.email || '-' }}</p>
          <div class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Pengguna Terverifikasi
            </span>
            <span v-if="usersStore.isPhotoUpdating" class="text-xs text-indigo-600 animate-pulse font-medium">
              Mengunggah foto...
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Forms Grid: Profile Info & Change Password -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Edit Profile -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Ubah Informasi Profil
        </h3>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label for="profile-name" class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              id="profile-name"
              type="text"
              v-model="nameInput"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Nama Lengkap"
            />
            <p v-if="nameError" class="text-xs text-rose-500 mt-1">{{ nameError }}</p>
          </div>

          <div>
            <label for="profile-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="profile-email"
              type="email"
              v-model="emailInput"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Alamat Email"
            />
            <p v-if="emailError" class="text-xs text-rose-500 mt-1">{{ emailError }}</p>
          </div>

          <button
            type="submit"
            :disabled="usersStore.isProfileUpdating"
            class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
          >
            {{ usersStore.isProfileUpdating ? 'Menyimpan...' : 'Simpan Profil' }}
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Ubah Kata Sandi
        </h3>

        <form @submit.prevent="handleUpdatePassword" class="space-y-4">
          <div>
            <label for="old-password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Saat Ini</label>
            <input
              id="old-password"
              type="password"
              v-model="oldPasswordInput"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="oldPasswordError" class="text-xs text-rose-500 mt-1">{{ oldPasswordError }}</p>
          </div>

          <div>
            <label for="new-password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              id="new-password"
              type="password"
              v-model="newPasswordInput"
              placeholder="Minimal 6 karakter"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="newPasswordError" class="text-xs text-rose-500 mt-1">{{ newPasswordError }}</p>
          </div>

          <div>
            <label for="confirm-new-password" class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              id="confirm-new-password"
              type="password"
              v-model="confirmPasswordInput"
              placeholder="Ulangi kata sandi baru"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p v-if="confirmPasswordError" class="text-xs text-rose-500 mt-1">{{ confirmPasswordError }}</p>
          </div>

          <button
            type="submit"
            :disabled="usersStore.isPasswordUpdating"
            class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
          >
            {{ usersStore.isPasswordUpdating ? 'Menyimpan...' : 'Perbarui Kata Sandi' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUsersStore } from '../states/usersStore.js'

const usersStore = useUsersStore()

const nameInput = ref('')
const emailInput = ref('')
const nameError = ref('')
const emailError = ref('')

const oldPasswordInput = ref('')
const newPasswordInput = ref('')
const confirmPasswordInput = ref('')
const oldPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const profilePhoto = computed(() => {
  return usersStore.profile?.photo || usersStore.profile?.avatar || ''
})

const userInitial = computed(() => {
  const name = usersStore.profile?.name || ''
  return name ? name.trim().charAt(0).toUpperCase() : 'U'
})

const populateInputs = () => {
  if (usersStore.profile) {
    nameInput.value = usersStore.profile.name || ''
    emailInput.value = usersStore.profile.email || ''
  }
}

watch(
  () => usersStore.profile,
  () => {
    populateInputs()
  },
  { immediate: true }
)

onMounted(async () => {
  await usersStore.asyncGetMe()
  populateInputs()
})

const handlePhotoChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  await usersStore.asyncUpdatePhoto(file)
}

const handleUpdateProfile = async () => {
  nameError.value = ''
  emailError.value = ''

  if (!nameInput.value || !nameInput.value.trim()) {
    nameError.value = 'Nama lengkap wajib diisi'
    return
  }
  if (!emailInput.value || !emailInput.value.trim()) {
    emailError.value = 'Email wajib diisi'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    emailError.value = 'Format email tidak valid'
    return
  }

  await usersStore.asyncUpdateMe({
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
  })
}

const handleUpdatePassword = async () => {
  oldPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''

  if (!oldPasswordInput.value) {
    oldPasswordError.value = 'Kata sandi saat ini wajib diisi'
    return
  }
  if (!newPasswordInput.value || newPasswordInput.value.length < 6) {
    newPasswordError.value = 'Kata sandi baru minimal 6 karakter'
    return
  }
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi tidak cocok'
    return
  }

  const res = await usersStore.asyncUpdatePassword({
    old_password: oldPasswordInput.value,
    new_password: newPasswordInput.value,
    current_password: oldPasswordInput.value,
    password: oldPasswordInput.value,
  })

  if (res && res.success) {
    oldPasswordInput.value = ''
    newPasswordInput.value = ''
    confirmPasswordInput.value = ''
  }
}
</script>
