class AuthenticationError(Exception):
    """Base authentication exception"""
    pass

class InvalidCredentialsError(AuthenticationError):
    """Invalid username/password"""
    pass

class TokenExpiredError(AuthenticationError):
    """JWT token has expired"""
    pass

class InvalidTokenError(AuthenticationError):
    """JWT token is invalid"""
    pass

class InsufficientPermissionsError(AuthenticationError):
    """User lacks required role/permissions"""
    pass

class UserAlreadyExistsError(AuthenticationError):
    """User already exists during registration"""
    pass