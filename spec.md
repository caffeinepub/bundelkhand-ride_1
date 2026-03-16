# Bundelkhand Ride

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- User registration and OTP-style login (mobile number based, simulated OTP)
- Ride booking flow: pickup + drop location input, fare estimate, confirm booking
- Driver registration with document info (license, RC, photo upload)
- Driver panel: login, accept/reject rides, earnings report
- Admin panel: dashboard stats, driver approval, user management, ride tracking
- Ride status lifecycle: Pending -> Accepted -> On Ride -> Completed / Cancelled
- Ride history for users and drivers
- Wallet and cash payment options
- SOS safety button on active ride screen
- In-app notifications (ride status updates)
- Role-based access: User, Driver, Admin

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: actors for Users, Drivers, Rides, Payments, Notifications with role-based auth
2. Backend: CRUD for ride lifecycle, driver approval flow, earnings tracking
3. Frontend: Mobile-styled PWA with bottom nav, yellow/black theme
4. Frontend: User flow - register, book ride, track status, history, SOS
5. Frontend: Driver flow - register, accept/reject ride, earnings
6. Frontend: Admin flow - dashboard, driver approval, user/ride management
7. Frontend: Shared components - OTP login modal, ride card, status badge
