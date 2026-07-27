# BHC Jobs React Native Task Tracker

> Task: Landing Page & Authentication Development
>
> Platform: React Native
> Status: 🟡 In Progress

---

# Progress

- [ ] Project Setup
- [ ] Landing Page
- [ ] Login Screen
- [ ] Registration Screen
- [ ] API Integration
- [ ] Testing
- [ ] Documentation
- [ ] Final Submission

---

# 1. Project Setup

## Initialize Project

- [ ] Create React Native project
- [ ] Setup TypeScript
- [ ] Configure ESLint
- [ ] Configure Prettier
- [ ] Setup folder structure
- [ ] Configure environment variables (.env)
- [ ] Install required dependencies

## Navigation

- [ ] Setup React Navigation
- [ ] Landing Screen
- [ ] Login Screen
- [ ] Registration Screen

## State Management

- [ ] Choose state management
- [ ] Setup API layer
- [ ] Global loading state (if needed)

---

# 3. API Configuration

## Base URL

- [ ] Configure Base URL

```
https://dev.bhcjobs.com
```

## Storage URL

- [ ] Configure Storage URL

```
https://dev.bhcjobs.com/storage
```

## GET APIs

- [x] Industry API
- [ ] Jobs API
- [ ] Companies API

```
GET /api/industry/get
GET /api/job/get
GET /api/company/get
```

## POST APIs

- [ ] Register API
- [ ] Phone Verify API
- [ ] Login API

```
POST /api/job_seeker/register
POST /api/job_seeker/phone_verify
POST /api/job_seeker/login
```

---

# 4. Landing Page

## Hero Banner

- [ ] Hero section
- [ ] Proper spacing
- [ ] Responsive layout

---

## Popular Industries

- [x] Fetch industries
- [x] Loading state
- [x] Empty state
- [x] Error state
- [x] Industry cards
- [x] Industry image
- [x] Industry name

---

## Recommended Jobs

- [ ] Fetch jobs
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Job cards

Display:

- [ ] Company logo
- [ ] Job title
- [ ] Company name
- [ ] Location
- [ ] Job type (if available)
- [ ] Salary (if available)

---

## Popular Companies

- [ ] Fetch companies
- [ ] Loading state
- [ ] Empty state
- [ ] Error state

Display:

- [ ] Company logo
- [ ] Company name

---

## Landing UI

- [ ] Matches reference website
- [ ] Responsive on small devices
- [ ] Responsive on tablets
- [ ] Consistent spacing
- [ ] Modern typography
- [ ] Reusable cards
- [ ] Proper shadows
- [ ] Rounded corners

---

# 5. Login Screen

## UI

- [ ] Phone input
- [ ] Password input
- [ ] Login button
- [ ] Register navigation

---

## Validation

- [ ] Required phone
- [ ] Required password
- [ ] Invalid phone validation

---

## API

- [ ] Call login API
- [ ] Loading state
- [ ] Success handling
- [ ] Error handling

---

# 6. Registration Screen

## UI

- [ ] Required input fields
- [ ] Register button
- [ ] Login navigation

---

## Validation

- [ ] Required fields
- [ ] Phone validation
- [ ] Password validation
- [ ] Confirm password validation (if applicable)

---

## API

- [ ] Register API integration
- [ ] Receive OTP
- [ ] Phone Verify API
- [ ] Loading state
- [ ] Success state
- [ ] Error state

---

# 7. Image Handling

## Industry

- [ ] Build URL

```
{Storage_URL}/industry-image/{image}
```

---

## Jobs

- [ ] Build URL

```
{Storage_URL}/company-image/{image}
```

---

## Companies

- [ ] Build URL

```
{Storage_URL}/company-image/{image}
```

---

# 8. Components

## Reusable Components

- [ ] Button
- [ ] Text Input
- [ ] Header
- [ ] Section Header
- [ ] Job Card
- [ ] Company Card
- [ ] Industry Card
- [ ] Loader
- [ ] Error View
- [ ] Empty View

---

# 9. Error Handling

- [ ] API failure
- [ ] Network failure
- [ ] Timeout handling
- [ ] Invalid response handling
- [ ] User-friendly messages

---

# 10. Performance

- [ ] FlatList
- [ ] Memoized components
- [ ] useCallback
- [ ] useMemo
- [ ] Optimized image rendering
- [ ] Avoid unnecessary re-renders

---

# 11. Code Quality

- [ ] Reusable components
- [ ] Custom hooks
- [ ] API service separation
- [ ] Constants
- [ ] Types
- [ ] No duplicated code
- [ ] Clean naming
- [ ] Comments where necessary

---

# 12. Responsive Design

- [ ] Small Android
- [ ] Large Android
- [ ] Tablet support
- [ ] Landscape check (optional)

---

# 13. Optional Bonus

- [ ] Skeleton loaders
- [ ] Fade animations
- [ ] Pull to refresh
- [ ] Dark mode
- [ ] Better empty state
- [ ] Better error UI

---

# 14. Testing Checklist

Landing

- [ ] Industry API works
- [ ] Jobs API works
- [ ] Company API works
- [ ] Images load correctly

Login

- [ ] Validation
- [ ] Success
- [ ] Invalid credentials
- [ ] Network error

Registration

- [ ] Validation
- [ ] Register
- [ ] OTP received
- [ ] Phone verification

---

# 15. Deliverables

- [ ] Push source code to GitHub
- [ ] APK generated
- [ ] README written
- [ ] Screen recording (optional)

---

# 16. README Checklist

- [ ] Project overview
- [ ] Features
- [ ] Folder structure
- [ ] Installation
- [ ] Environment setup
- [ ] Run Android
- [ ] Build APK
- [ ] API configuration
- [ ] Tech stack

---

# 17. Final Review

- [ ] No console.log
- [ ] No unused imports
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Proper formatting
- [ ] All APIs working
- [ ] Images working
- [ ] Responsive UI
- [ ] README completed
- [ ] APK tested

---

# Notes

## API Base URL

https://dev.bhcjobs.com

## Storage URL

https://dev.bhcjobs.com/storage

## API Endpoints

GET
- /api/industry/get
- /api/job/get
- /api/company/get

POST
- /api/job_seeker/register
- /api/job_seeker/phone_verify
- /api/job_seeker/login