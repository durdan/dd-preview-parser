"""Security configuration constants."""

# Password policy constants
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 50

# Bcrypt configuration
# 12 rounds is current industry standard (2024)
# - Provides ~250ms hash time on modern hardware
# - Resistant to current attack methods
# - Should be reviewed annually and increased as hardware improves
BCRYPT_ROUNDS = 12

# Rate limiting for authentication attempts (not implemented but recommended)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15