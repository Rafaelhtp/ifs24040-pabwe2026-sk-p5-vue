<template>
  <div>
    <div class="mb-6">
      <h3 class="text-xl font-bold text-slate-800">Masuk</h3>
      <p class="text-sm text-slate-500 mt-1">Masukkan email dan kata sandi akun Anda</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="login-email-input" class="block text-sm font-medium text-slate-700 mb-1">
          Alamat Email
        </label>
        <input
          id="login-email-input"
          name="email"
          type="email"
          :value="email"
          @input="onEmailChange"
          placeholder="nama@email.com"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
          :class="{ 'border-rose-500 focus:ring-rose-500 focus:border-rose-500': emailError }"
        />
        <p v-if="emailError" class="text-xs text-rose-500 mt-1">{{ emailError }}</p>
      </div>

      <div>
        <label for="login-password-input" class="block text-sm font-medium text-slate-700 mb-1">
          Kata Sandi
        </label>
        <input
          id="login-password-input"
          name="password"
          type="password"
          :value="password"
          @input="onPasswordChange"
          placeholder="••••••••"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
          :class="{ 'border-rose-500 focus:ring-rose-500 focus:border-rose-500': passwordError }"
        />
        <p v-if="passwordError" class="text-xs text-rose-500 mt-1">{{ passwordError }}</p>
      </div>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.isAuthLogin" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ authStore.isAuthLogin ? 'Memproses...' : 'Masuk' }}</span>
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-slate-600">
      Belum memiliki akun?
      <RouterLink to="/auth/register" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Daftar Sekarang
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../states/authStore.js'
import { useInput } from '../../../hooks/useInput.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

const router = useRouter()
const authStore = useAuthStore()

const [email, onEmailChange] = useInput('')
const [password, onPasswordChange] = useInput('')

const emailError = ref('')
const passwordError = ref('')

const validateForm = () => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value || !email.value.trim()) {
    emailError.value = 'Email wajib diisi'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Format email tidak valid'
    isValid = false
  }

  if (!password.value || !password.value.trim()) {
    passwordError.value = 'Kata sandi wajib diisi'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'Kata sandi minimal 6 karakter'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showErrorDialog('Silakan periksa kembali formulir yang Anda isi', 'Form Tidak Valid')
    return
  }

  const result = await authStore.asyncLogin({
    email: email.value.trim(),
    password: password.value,
  })

  if (result && result.success) {
    await showSuccessDialog('Selamat datang kembali di Delcom Auction!', 'Login Berhasil')
    router.push('/')
  }
}
</script>
