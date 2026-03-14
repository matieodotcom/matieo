# Service Provider Page

**Route**: `/services/:slug/:id`
**File**: `frontend/src/pages/public/ServiceProviderPage.tsx`
**Status**: Active
**Type**: Public

## Purpose
Full detail page for a single service provider. Shows gallery, contact info, Google Maps embed, and community comments.

## Features
- Photo gallery grid (up to 5 images)
- Contact block with address, phone, email, website
- Embedded Google Maps iframe
- Comment system (requires authentication to post)

## Hooks
- `useServiceProvider(id)` — fetches provider detail
- `useServiceProviderComments(id)` — fetches comments
- `useCreateProviderComment(serviceId)` — posts new comment

## i18n Keys
- `services.provider.*`
