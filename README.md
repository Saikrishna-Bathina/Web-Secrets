# Secrets Web App

A secure authentication web app that lets users register, log in, and access confidential pages using modern web security techniques like **JWT (JSON Web Token)**, **HttpOnly cookies**, and **hashed passwords**.

##  Objective

The project demonstrates the implementation of:
- Secure user authentication
- Password hashing
- Token-based session management (JWT)
- Secure cookies for storing tokens
- Clean folder structure and modular code

---

##  Features

###  User Registration
- Email and password registration
- Email validation format check
- Strong password policy (at least one lowercase, one uppercase, one number, one special character, and minimum 8 characters)
- Redirects to login after successful signup

###  Login Mechanism
- Validates email and password
- Issues a JWT token upon successful login
- Stores token in **HttpOnly cookie** (not accessible from JavaScript)
- Redirects to protected `/secrets` page

###  Session Management
- Uses **JWT token** for stateless authentication
- Token stored in secure, `HttpOnly`, `SameSite=Strict` cookie
- Middleware to protect secrets route (`/secrets`)
- Logout clears token cookie

###  Logout
- Clears cookie and redirects to login

