import { PasswordService } from '../../lib/services/password'

describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hash = await PasswordService.hash(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
    })

    it('should throw error for invalid password', async () => {
      await expect(PasswordService.hash('')).rejects.toThrow('Invalid password provided')
      await expect(PasswordService.hash(null as any)).rejects.toThrow('Invalid password provided')
    })
  })

  describe('verify', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hash = await PasswordService.hash(password)
      
      const isValid = await PasswordService.verify(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword'
      const hash = await PasswordService.hash(password)
      
      const isValid = await PasswordService.verify(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    it('should handle invalid inputs', async () => {
      expect(await PasswordService.verify('', 'hash')).toBe(false)
      expect(await PasswordService.verify('password', '')).toBe(false)
      expect(await PasswordService.verify(null as any, 'hash')).toBe(false)
    })
  })
})