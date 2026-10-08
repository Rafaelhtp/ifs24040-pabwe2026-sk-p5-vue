<template>
  <div>
    <div class="mb-6">
      <h3 class="text-xl font-bold text-slate-800">Daftar Akun Baru</h3>
      <p class="text-sm text-slate-500 mt-1">Lengkapi data diri Anda untuk mulai menawar lelang</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="register-name-input" class="block text-sm font-medium text-slate-700 mb-1">
          Nama Lengkap
        </label>
        <input
          id="register-name-input"
          name="name"
          type="text"
          :value="name"
          @input="onNameChange"
          placeholder="Nama Anda"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
          :class="{ 'border-rose-500 focus:ring-rose-500 focus:border-rose-500': nameError }"
        />
        <p v-if="nameError" class="text-xs text-rose-500 mt-1">{{ nameError }}</p>
      </div>

      <div>
        <label for="register-email-input" class="block text-sm font-medium text-slate-700 mb-1">
          Alamat Email
        </label>
        <input
          id="register-email-input"
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
        <label for="register-password-input" class="block text-sm font-medium text-slate-700 mb-1">
          Kata Sandi
        </label>
        <input
          id="register-password-input"
          name="password"
          type="password"
          :value="password"
          @input="onPasswordChange"
          placeholder="Minimal 6 karakter"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
          :class="{ 'border-rose-500 focus:ring-rose-500 focus:border-rose-500': passwordError }"
        />
        <p v-if="passwordError" class="text-xs text-rose-500 mt-1">{{ passwordError }}</p>
      </div>

      <div>
        <label for="register-confirm-password-input" class="block text-sm font-medium text-slate-700 mb-1">
          Konfirmasi Kata Sandi
        </label>
        <input
          id="register-confirm-password-input"
          name="confirmPassword"
          type="password"
          :value="confirmPassword"
          @input="onConfirmPasswordChange"
          placeholder="Ulangi kata sandi"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
          :class="{ 'border-rose-500 focus:ring-rose-500 focus:border-rose-500': confirmPasswordError }"
        />
        <p v-if="confirmPasswordError" class="text-xs text-rose-500 mt-1">{{ confirmPasswordError }}</p>
      </div>

      <button
        id="register-submit-button"
        type="submit"
        :disabled="authStore.isAuthRegister"
        class="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.isAuthRegister" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ authStore.isAuthRegister ? 'Mendaftar...' : 'Daftar' }}</span>
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-slate-600">
      Sudah memiliki akun?
      <RouterLink to="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Masuk di Sini
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

const [name, onNameChange] = useInput('')
const [email, onEmailChange] = useInput('')
const [password, onPasswordChange] = useInput('')
const [confirmPassword, onConfirmPasswordChange] = useInput('')

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const validateForm = () => {
  let isValid = true
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!name.value || !name.value.trim()) {
    nameError.value = 'Nama lengkap wajib diisi'
    isValid = false
  } else if (name.value.trim().length < 2) {
    nameError.value = 'Nama minimal 2 karakter'
    isValid = false
  }

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

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi wajib diisi'
    isValid = false
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi tidak cocok'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showErrorDialog('Silakan periksa kembali formulir pendaftaran Anda', 'Form Tidak Valid')
    return
  }

  const result = await authStore.asyncRegister({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  })

  if (result && result.success) {
    await showSuccessDialog('Pendaftaran berhasil! Silakan masuk dengan akun Anda.', 'Pendaftaran Berhasil')
    router.push('/auth/login')
  }
}
</script>
