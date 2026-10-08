import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import ProfilePage from './ProfilePage.vue'
import { useUsersStore } from '../states/usersStore.js'

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should render profile information and fallback initial', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    const store = useUsersStore()

    store.profile = {
      name: 'Delcom User',
      email: 'user@delcom.org',
      photo: 'my-photo.jpg',
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Delcom User')
    expect(wrapper.text()).toContain('user@delcom.org')
    expect(wrapper.find('img[alt="Foto Profil"]').exists()).toBe(true)
  })

  it('should show fallback initial when photo is missing', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    const store = useUsersStore()

    store.profile = {
      name: 'Bob',
      email: 'bob@test.com',
      photo: '',
    }
    store.isPhotoUpdating = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('B')
    expect(wrapper.text()).toContain('Mengunggah foto...')
  })

  it('should handle photo upload event', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    const store = useUsersStore()
    vi.spyOn(store, 'asyncUpdatePhoto').mockResolvedValue({ success: true })

    const input = wrapper.find('input#photo-upload')
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' })

    // When no file is selected
    Object.defineProperty(input.element, 'files', {
      value: [],
      writable: true,
      configurable: true,
    })
    await input.trigger('change')
    expect(store.asyncUpdatePhoto).not.toHaveBeenCalled()

    // When file is selected
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: true,
    })
    await input.trigger('change')
    expect(store.asyncUpdatePhoto).toHaveBeenCalledWith(file)
  })

  it('should validate and submit profile updates', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    const store = useUsersStore()
    vi.spyOn(store, 'asyncUpdateMe').mockResolvedValue({ success: true })

    const nameInput = wrapper.find('input#profile-name')
    const emailInput = wrapper.find('input#profile-email')

    // Empty name
    await nameInput.setValue('')
    await emailInput.setValue('test@delcom.org')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Nama lengkap wajib diisi')

    // Empty email
    await nameInput.setValue('Valid Name')
    await emailInput.setValue('')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Email wajib diisi')

    // Invalid email
    await emailInput.setValue('not-valid')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Format email tidak valid')

    // Valid submission
    await emailInput.setValue('valid@delcom.org')
    await wrapper.find('form').trigger('submit.prevent')
    expect(store.asyncUpdateMe).toHaveBeenCalledWith({
      name: 'Valid Name',
      email: 'valid@delcom.org',
    })
  })

  it('should validate and submit password updates', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    const store = useUsersStore()
    vi.spyOn(store, 'asyncUpdatePassword').mockResolvedValue({ success: true })

    const forms = wrapper.findAll('form')
    const passwordForm = forms[1]

    const oldPassInput = wrapper.find('input#old-password')
    const newPassInput = wrapper.find('input#new-password')
    const confirmPassInput = wrapper.find('input#confirm-new-password')

    // Empty old password
    await oldPassInput.setValue('')
    await passwordForm.trigger('submit.prevent')
    expect(wrapper.text()).toContain('Kata sandi saat ini wajib diisi')

    // Short new password
    await oldPassInput.setValue('current123')
    await newPassInput.setValue('123')
    await passwordForm.trigger('submit.prevent')
    expect(wrapper.text()).toContain('Kata sandi baru minimal 6 karakter')

    // Password mismatch
    await newPassInput.setValue('newsecret123')
    await confirmPassInput.setValue('mismatch123')
    await passwordForm.trigger('submit.prevent')
    expect(wrapper.text()).toContain('Konfirmasi kata sandi tidak cocok')

    // Valid update
    await confirmPassInput.setValue('newsecret123')
    await passwordForm.trigger('submit.prevent')
    expect(store.asyncUpdatePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        old_password: 'current123',
        new_password: 'newsecret123',
      })
    )
  })
})
