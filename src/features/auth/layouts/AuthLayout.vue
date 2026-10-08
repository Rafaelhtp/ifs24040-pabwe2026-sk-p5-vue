<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
      <div class="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m14 13-7.5 7.5c-.8.8-2.2.8-3 0s-.8-2.2 0-3L11 10" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
          <path d="m21 11-8-8" />
        </svg>
      </div>
      <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Delcom Auction</h2>
      <p class="mt-2 text-sm text-slate-600 font-medium">
        Platform Lelang Online Terpercaya, Transparan & Aman
      </p>
    </div>

    <!-- Banner Info Card -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 mb-6">
      <div class="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-md flex items-center gap-3">
        <div class="p-2 bg-white/20 rounded-xl backdrop-blur-xs flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div>
          <h4 class="font-bold text-sm leading-snug">Dapatkan Penawaran Terbaik</h4>
          <p class="text-xs text-indigo-100">Ikuti lelang barang berkualitas dengan sistem penawaran real-time.</p>
        </div>
      </div>
    </div>

    <!-- Form Container -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>
