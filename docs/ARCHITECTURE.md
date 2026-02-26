# Blanc Event Hire & Production Architecture

## Optional User System
By default, the `User` model handles Authentication (`ADMIN` or `CUSTOMER`).
If `CUSTOMER`, their ID can optionally tie to a `BookingOrder` and `Invoice`.
However, all logic defaults to identifying the user via their `email` and `guest_session` token so the checkout is frictionless.

## Data Structures additions
- IdentityDocument Model
- Contract / Agreement Model 
- Modified BookingOrder (Contract IDs)
