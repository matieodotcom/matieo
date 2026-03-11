# Email Trigger Map

Before implementing a new feature, check this file.
If the feature creates a user-visible event, add a row and implement the send function in `emailClient.ts`.

| Event constant | Trigger | Recipient | Send function |
|---|---|---|---|
| `waitlist.confirmation` | User joins waitlist | Submitter | `sendWaitlistConfirmation` |
| `memorial.published` | Memorial status → published | Creator | `sendMemorialPublished` |
| `obituary.published` | Obituary status → published | Creator | `sendObituaryPublished` |
| `tribute.posted` | New tribute posted | Page owner (skip if self) | `sendTributePosted` |
| `condolence.posted` | New condolence posted | Page owner (skip if self) | `sendCondolencePosted` |

## Adding a new email

1. Add constant to `EMAIL_EVENTS` in `backend/src/lib/emailClient.ts`
2. Write `sendXxx()` function in same file using `buildEmailHtml` + `getEmailForUser`
3. Wire fire-and-forget (or IIFE for secondary fetches) after `res.json()` in the relevant controller
4. Write test asserting the function is called (and self-notify guard if applicable)
5. Add row to this table
