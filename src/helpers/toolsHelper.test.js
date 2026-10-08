import { describe, it, expect, vi, beforeEach } from 'vitest'
import Swal from 'sweetalert2'
import {
  cn,
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from './toolsHelper.js'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}))

describe('toolsHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('cn', () => {
    it('should merge tailwind classes properly', () => {
      expect(cn('p-4', 'p-2', 'bg-red-500')).toBe('p-2 bg-red-500')
      expect(cn('text-sm', false && 'text-lg', 'font-bold')).toBe('text-sm font-bold')
    })
  })

  describe('SweetAlert dialogs', () => {
    it('should call Swal.fire for success with default title', () => {
      showSuccessDialog('Operasi berhasil')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Operasi berhasil',
        })
      )
    })

    it('should call Swal.fire for success with custom title', () => {
      showSuccessDialog('Operasi berhasil', 'Kustom Sukses')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Kustom Sukses',
        })
      )
    })

    it('should call Swal.fire for error with default message and custom title', () => {
      showErrorDialog()
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan yang tidak terduga.',
        })
      )

      showErrorDialog('Ada kendala', 'Kustom Error')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Kustom Error',
          text: 'Ada kendala',
        })
      )
    })

    it('should call Swal.fire for confirm with defaults and custom options', () => {
      showConfirmDialog('Apakah ingin menghapus?')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'warning',
          title: 'Apakah Anda yakin?',
          text: 'Apakah ingin menghapus?',
          confirmButtonText: 'Ya, lanjutkan!',
          cancelButtonText: 'Batal',
          showCancelButton: true,
        })
      )

      showConfirmDialog('Hapus?', 'Konfirmasi', 'Ya, Hapus')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Konfirmasi',
          confirmButtonText: 'Ya, Hapus',
        })
      )
    })
  })

  describe('formatRupiah', () => {
    it('should return Rp 0 for null, undefined, or NaN', () => {
      expect(formatRupiah(null)).toBe('Rp 0')
      expect(formatRupiah(undefined)).toBe('Rp 0')
      expect(formatRupiah('invalid')).toBe('Rp 0')
    })

    it('should format valid numbers to Rupiah string', () => {
      const formatted = formatRupiah(500000)
      expect(formatted).toContain('500.000')
      expect(formatted).toContain('Rp')
    })
  })

  describe('formatDate', () => {
    it('should return "-" for falsy or invalid dates', () => {
      expect(formatDate('')).toBe('-')
      expect(formatDate(null)).toBe('-')
      expect(formatDate('not-a-date')).toBe('-')
    })

    it('should format valid date correctly', () => {
      const formatted = formatDate('2026-03-24T14:30:00Z')
      expect(formatted).not.toBe('-')
      expect(formatted).toContain('2026')
    })
  })
})
