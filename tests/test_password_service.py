import unittest
from services.password_service import PasswordService

class TestPasswordService(unittest.TestCase):
    
    def test_hash_password_success(self):
        password = "SecurePass123!"
        hashed = PasswordService.hash_password(password)
        
        self.assertIsInstance(hashed, str)
        self.assertTrue(hashed.startswith('$2b$12$'))  # bcrypt format with 12 rounds
        self.assertNotEqual(password, hashed)
    
    def test_hash_password_different_salts(self):
        password = "SecurePass123!"
        hash1 = PasswordService.hash_password(password)
        hash2 = PasswordService.hash_password(password)
        
        # Same password should produce different hashes due to random salt
        self.assertNotEqual(hash1, hash2)
    
    def test_verify_password_success(self):
        password = "SecurePass123!"
        hashed = PasswordService.hash_password(password)
        
        self.assertTrue(PasswordService.verify_password(password, hashed))
    
    def test_verify_password_failure(self):
        password = "SecurePass123!"
        wrong_password = "WrongPass123!"
        hashed = PasswordService.hash_password(password)
        
        self.assertFalse(PasswordService.verify_password(wrong_password, hashed))
    
    def test_hash_password_invalid_input(self):
        with self.assertRaises(TypeError):
            PasswordService.hash_password(None)
        
        with self.assertRaises(TypeError):
            PasswordService.hash_password(123)
    
    def test_verify_password_invalid_input(self):
        with self.assertRaises(TypeError):
            PasswordService.verify_password(None, "hash")
        
        with self.assertRaises(TypeError):
            PasswordService.verify_password("password", None)
    
    def test_verify_password_malformed_hash(self):
        # Should return False for malformed hash, not raise exception
        result = PasswordService.verify_password("password", "invalid_hash")
        self.assertFalse(result)

if __name__ == '__main__':
    unittest.main()