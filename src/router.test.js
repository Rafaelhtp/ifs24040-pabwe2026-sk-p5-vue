import { describe, it, expect, vi, beforeEach } from 'vitest'
import router, { routes } from './router.js'
import * as apiHelper from './helpers/apiHelper.js'

describe('router', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should define all required routes including auth, protected, and wildcard', () => {
    expect(routes.length).toBe(3)
    const authRoute = routes.find((r) => r.path === '/auth')
    const mainRoute = routes.find((r) => r.path === '/')
    const wildcardRoute = routes.find((r) => r.path === '/:pathMatch(.*)*')

    expect(authRoute).toBeDefined()
    expect(authRoute.children.map((c) => c.path)).toContain('login')
    expect(authRoute.children.map((c) => c.path)).toContain('register')

    expect(mainRoute).toBeDefined()
    expect(mainRoute.children.map((c) => c.path)).toContain('')
    expect(mainRoute.children.map((c) => c.path)).toContain('aucations/:aucationId')
    expect(mainRoute.children.map((c) => c.path)).toContain('users')
    expect(mainRoute.children.map((c) => c.path)).toContain('profile')

    expect(wildcardRoute).toBeDefined()
  })

  it('should redirect unauthenticated user from protected route to /auth/login', async () => {
    vi.spyOn(apiHelper, 'getAccessToken').mockReturnValue('')

    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('should allow authenticated user to visit protected route', async () => {
    vi.spyOn(apiHelper, 'getAccessToken').mockReturnValue('valid-token')

    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')

    await router.push('/users')
    expect(router.currentRoute.value.path).toBe('/users')
  })

  it('should redirect authenticated user from guest route to /', async () => {
    vi.spyOn(apiHelper, 'getAccessToken').mockReturnValue('valid-token')

    await router.push('/auth/login')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('should match wildcard route for non-existent paths', async () => {
    vi.spyOn(apiHelper, 'getAccessToken').mockReturnValue('')

    await router.push('/non-existent-page-xyz')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('should resolve every route component (static for auth, lazy for the rest)', async () => {
    const all = routes.flatMap((r) => [r, ...(r.children || [])])
    const modules = await Promise.all(
      all.map((r) => (typeof r.component === 'function' ? r.component() : { default: r.component }))
    )
    modules.forEach((m) => expect(m.default).toBeDefined())
  })
})