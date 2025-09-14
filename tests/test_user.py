import unittest
from models.user import User

class TestUser(unittest.TestCase):
    
    def test_create_user_success(self):
        user = User.create("testuser", "test@example.com", "SecurePass123!")
        
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertIsNotNone(user.password_hash)
        self.assertNotEqual(user.password_hash, "SecurePass123!")
    
    def test_verify_password_success(self):
        user = User.create("testuser", "test@example.com", "SecurePass123!")
        
        self.assertTrue(user.verify_password("SecurePass123!"))
        self.assertFalse(user.verify_password("WrongPassword"))
    
    def test_change_password_success(self):
        user = User.create("testuser", "test@example.com", "OldPass123!")
        old_hash = user.password_hash
        
        user.change_password("OldPass123!", "NewPass456@")
        
        self.assertNotEqual(user.password_hash, old_hash)
        self.assertTrue(user.verify_password("NewPass456@"))
        self.assertFalse(user.verify_password("OldPass123!"))
    
    def test_change_password_wrong_old_password(self):
        user = User.create("testuser", "test@example.com", "OldPass123!")
        
        with self.assertRaises(ValueError) as context:
            user.change_password("WrongOld123!", "NewPass456@")
        
        self.assertIn("Current password is incorrect", str(context.exception))
    
    def test_password_validation(self):
        test_cases = [
            ("", "Password cannot be empty"),
            ("short", "Password must be at least 8 characters long"),
            ("a" * 129, "Password must be less than 128 characters"),
            ("nouppercase123!", "Password must contain at least one uppercase letter"),
            ("NOLOWERCASE123!", "Password must contain at least one lowercase letter"),
            ("NoDigitsHere!", "Password must contain at least one digit"),
            ("NoSpecialChars123", "Password must contain at least one special character"),
        ]
        
        for password, expected_error in test_cases:
            with self.assertRaises(ValueError) as context:
                User.create("testuser", "test@example.com", password)
            self.assertIn(expected_error, str(context.exception))
    
    def test_username_validation(self):
        with self.assertRaises(ValueError) as context:
            User.create("ab", "test@example.com", "SecurePass123!")
        self.assertIn("Username must be at least 3 characters", str(context.exception))
    
    def test_email_validation(self):
        invalid_emails = ["invalid", "@example.com", "test@", "test.example.com"]
        
        for email in invalid_emails:
            with self.assertRaises(ValueError) as context:
                User.create("testuser", email, "SecurePass123!")
            self.assertIn("Invalid email format", str(context.exception))

if __name__ == '__main__':
    unittest.main()