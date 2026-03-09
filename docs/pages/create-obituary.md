## Status: ✅ Complete
> Do not load spec unless editing this page.

# Page: Create / Edit Obituary

## Routes
- `/dashboard/obituary/create` — Create new obituary
- `/dashboard/obituary/:id/edit` — Edit existing obituary

## Purpose
Multi-section form for creating or editing an obituary. Accessed via DashboardLayout. Includes full personal info, photos, funeral/burial details, family members, contact person, biography, and death certificate upload.

## Form Hook
`useObituaryForm(obituaryId?)` from `hooks/use-create-obituary.ts`
- `draftSchema` (loose, all optional) + `publishSchema` (requires: firstName, lastName, gender, raceEthnicity, country, contactPersonName, contactPersonRelationship, contactPersonPhone, profilePhoto)
- `onSaveDraft()` — validates against draftSchema, submits with `status: 'draft'`, navigates to `/dashboard/obituary`
- `onPublish(values)` — validates against publishSchema, sets field errors inline, submits with `status: 'published'`, navigates to `/dashboard/obituary`
- `familyMembersField` — RHF `useFieldArray` for dynamic family member rows

## Form Sections (in order)

1. **Photos** — 2-col: Obituary Photo (360×360) + Cover Photo (1296×282)
2. **Personal Information** — firstName*, lastName*, dateOfBirth, ageAtDeath*, dateOfDeath*, country*, state, placeOfDeath*, gender*, raceEthnicity*
3. **Cause of Passing (Optional)** — causeOfPassing (dropdown), causeOfPassingConsented (checkbox). Private notice shown. Data NEVER appears publicly.
4. **Funeral/Prayers Details (Optional)** — funeralName, funeralLocation, funeralDate, funeralTime, funeralNote
5. **Burial Details (Optional)** — burialCenterName, burialLocation, burialDate, burialTime, burialNote
6. **Contact Person** — contactPersonName*, contactPersonRelationship*, contactPersonPhone*, contactPersonEmail
7. **Family Members (Optional)** — dynamic array with `+ Add Family Member` button. Each row: name + relationship dropdown + remove button
8. **Memorial Message (Optional)** — biography textarea (max 4000 chars, char counter shown)
9. **Death Certificate (Optional)** — deathCertPhoto upload. Private notice shown. NEVER shown publicly.

## Footer buttons
- Cancel → navigates to `/dashboard/obituary`
- Save as Draft → calls `onSaveDraft()`
- Publish → form submit → calls `onPublish(values)`

## Navigation
DashboardLayout detects `isObituaryCreateOrEdit` and shows "← My Obituaries" back link.
