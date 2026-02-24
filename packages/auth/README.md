# @ai-productivity/auth

Authentication module for user registration, login, and session management.

## Features

- 👤 **User Registration** - Register new users with email and password
- 🔐 **User Login** - Secure login with session management
- 💾 **Persistent Sessions** - Local storage based session management
- 🔑 **Password Reset** - Forgot password and reset functionality
- 👥 **User Profile** - Update and manage user profiles

## Installation

```
bash
npm install @ai-productivity/auth
```

## Usage

### Basic Usage

```javascript
import AuthSystem from '@ai-productivity/auth';

// Initialize auth system
const auth = new AuthSystem();

// Register new user
const result = await auth.register('John Doe', 'john@example.com', 'password123');
console.log(result);

// Login
const loginResult = await auth.login('john@example.com', 'password123');
console.log(loginResult);

// Check if logged in
if (auth.isLoggedIn()) {
    const user = auth.getUser();
    console.log('Logged in as:', user.name);
}
```

### With Custom Options

```
javascript
const auth = new AuthSystem({
    apiBase: 'https://api.example.com',
    tokenKey: 'myAppToken',
    userKey: 'myAppUser',
    storage: localStorage // or custom storage
});
```

### With Server API

```
javascript
const auth = new AuthSystem({
    apiBase: 'https://api.yourapp.com'
});

// Login with server
const result = await auth.login('john@example.com', 'password123');
if (result.success) {
    // Session saved automatically
    console.log('Logged in!');
}

// Fetch user from server
const user = await auth.fetchUser();
```

## API

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiBase | string | '/api' | Base API URL |
| tokenKey | string | 'aiProductivityAuthToken' | Token storage key |
| userKey | string | 'aiProductivityUser' | User storage key |
| storage | object | localStorage | Storage interface |

### Methods

- `register(name, email, password, phone)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout user
- `getUser()` - Get current user
- `isLoggedIn()` - Check if authenticated
- `getToken()` - Get auth token
- `fetchUser()` - Fetch user from server
- `updateProfile(updates)` - Update user profile
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password

## Example: Protected Routes

```
javascript
// Check authentication before accessing protected content
function accessProtectedFeature() {
    if (!auth.isLoggedIn()) {
        // Show login modal or redirect
        auth.showLoginModal();
        return false;
    }
    // Proceed with feature
    return true;
}
```

## Storage

The module uses localStorage by default. You can provide a custom storage implementation:

```
javascript
class CustomStorage {
    getItem(key) { ... }
    setItem(key, value) { ... }
    removeItem(key) { ... }
}

const auth = new AuthSystem({
    storage: new CustomStorage()
});
```

## License

MIT

## Author

AI Productivity Tools
