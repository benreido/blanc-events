# Website Upgrade Architecture

This architecture transforms the existing platform into a fully transactional 
system allowing guest checkout, payments, contracts, and optional accounts.

## Schema Additions required:
1. Extend `User` to track non-admin users.
2. Add `IdentityDocument` for ID uploads.
3. Add `Agreement` for contract signing.
4. Integrate an `Enquiry` link with the `QuoteRequest` or define a new Cart flow.

## 3. Stock Carousel / Scrolling Fix
- Implementation of a pure CSS infinite scroll without visual jumps.
