import re
from typing import Dict, Any, List

class ValidationError(Exception):
    def __init__(self, errors: Dict[str, List[str]]):
        self.errors = errors
        super().__init__(f"Validation failed: {errors}")

class ValidationService:
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,30}$')

    @staticmethod
    def validate_user_creation(data: Dict[str, Any]) -> None:
        """Validate user creation data."""
        errors = {}

        # Email validation
        email = data.get('email', '').strip()
        if not email:
            errors['email'] = ['Email is required']
        elif not ValidationService.EMAIL_PATTERN.match(email):
            errors['email'] = ['Invalid email format']

        # Username validation
        username = data.get('username', '').strip()
        if not username:
            errors['username'] = ['Username is required']
        elif not ValidationService.USERNAME_PATTERN.match(username):
            errors['username'] = ['Username must be 3-30 characters, alphanumeric and underscore only']

        # Password validation
        password = data.get('password', '')
        if not password:
            errors['password'] = ['Password is required']
        elif len(password) < 8:
            errors['password'] = ['Password must be at least 8 characters']

        # Name validation
        first_name = data.get('first_name', '').strip()
        if not first_name:
            errors['first_name'] = ['First name is required']
        elif len(first_name) > 50:
            errors['first_name'] = ['First name too long']

        last_name = data.get('last_name', '').strip()
        if not last_name:
            errors['last_name'] = ['Last name is required']
        elif len(last_name) > 50:
            errors['last_name'] = ['Last name too long']

        if errors:
            raise ValidationError(errors)

    @staticmethod
    def validate_user_update(data: Dict[str, Any]) -> None:
        """Validate user update data."""
        errors = {}

        # Only validate provided fields
        if 'email' in data:
            email = data['email'].strip()
            if not email:
                errors['email'] = ['Email cannot be empty']
            elif not ValidationService.EMAIL_PATTERN.match(email):
                errors['email'] = ['Invalid email format']

        if 'username' in data:
            username = data['username'].strip()
            if not username:
                errors['username'] = ['Username cannot be empty']
            elif not ValidationService.USERNAME_PATTERN.match(username):
                errors['username'] = ['Username must be 3-30 characters, alphanumeric and underscore only']

        if 'first_name' in data:
            first_name = data['first_name'].strip()
            if not first_name:
                errors['first_name'] = ['First name cannot be empty']
            elif len(first_name) > 50:
                errors['first_name'] = ['First name too long']

        if 'last_name' in data:
            last_name = data['last_name'].strip()
            if not last_name:
                errors['last_name'] = ['Last name cannot be empty']
            elif len(last_name) > 50:
                errors['last_name'] = ['Last name too long']

        if errors:
            raise ValidationError(errors)

    @staticmethod
    def sanitize_search_input(query: str) -> str:
        """Sanitize search query to prevent injection."""
        if not query:
            return ""
        # Remove potentially dangerous characters
        return re.sub(r'[<>"\';]', '', query.strip())