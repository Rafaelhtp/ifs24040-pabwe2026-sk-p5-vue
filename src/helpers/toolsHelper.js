import Swal from 'sweetalert2'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function showSuccessDialog(message, title = 'Berhasil!') {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#4f46e5',
  })
}

export function showErrorDialog(message, title = 'Gagal!') {
  return Swal.fire({
    icon: 'error',
    title,
    text: message || 'Terjadi kesalahan yang tidak terduga.',
    confirmButtonColor: '#ef4444',
  })
}

export function showConfirmDialog(message, title = 'Apakah Anda yakin?', confirmText = 'Ya, lanjutkan!') {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#64748b',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
  })
}

export function formatRupiah(number) {
  if (number === null || number === undefined || Number.isNaN(Number(number))) {
    return 'Rp 0'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(number))
}

export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
