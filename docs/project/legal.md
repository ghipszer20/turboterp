# Legal and trust notes

Moved out of PROJECT_MEMORY.md (section 11) on 2026-09-26 so it loads only when needed. Read it before building the disclaimer, accounts, exports, scraping or anything shown with UMD's name. Update it here when a decision changes.

- **Required liability agreement for the 4-year plan / audit (owner requirement, 2026-09-24).**
  - A clickwrap gate before first use. The student must scroll through a short, plain-language notice, tick the box, **type their full name as a signature** and see the date. There's no way to skip it.
  - Content:
    - Unofficial; not affiliated with UMD; not academic advising.
    - May contain errors or outdated catalog data.
    - The student is responsible for checking with their advisor and UMD's official degree audit before registering or changing programs.
    - No warranty, and limitation of liability (e.g. for extra semesters or costs).
    - Covers the advisor, optimizer, LLM feedback and pre-professional tracks too.
  - **Proof of consent:** store the agreement version, timestamp, account, and a hash of the typed name on the server. So the planner **requires a umd.edu account** (a change from "no account needed"; other tabs stay usable without one). **Superseded (owner, 2026-10-04):** accounts must NOT be tied to a UMD email ("this is supposed to be an unofficial student project"); the owner likes having accounts, with any email address. The Advisor only offers sign-in (owner, 2026-10-04). **Records (owner, 2026-10-08):** every signature, signed in or not, goes to `consent_records` (version, accepted time, account if signed in, device id, HMAC of the typed name with a server secret) through `/api/consent`; one daily digest email to the records address; on account deletion the record stays, unlinked (`docs/project/account-sync-plan.md`). Ask for re-consent when the wording changes materially.
  - **Protection inside the product too, not only the signature:**
    - Every audit result cites its catalog rule and catalog year.
    - "Verify with your advisor" prompts at high-stakes moments: committing a program change or dropping a course that delays graduation.
    - Exported PDFs carry a disclaimer footer and are laid out to take to an advisor.
  - **No lawyer review and no LLC** (owner decision, 2026-09-24): the disclaimer is enough. Assumption: the typed-name agreement stays, since it is the disclaimer in its strongest form; confirm with the owner if in doubt. Claude writes the wording. A signature reduces risk but doesn't remove it, especially for negligence. **Accuracy plus the owner's verification pass is the real protection.**
- Show a "not official advising" disclaimer and the catalog year used.
- No UMD marks: no Testudo, no official logos, no official color scheme that suggests affiliation. Show "Not affiliated with the University of Maryland" in the app, on the website and in the App Store listing.
- Never ask for or store Testudo credentials, and never auto-register students.
- Be polite when scraping: cache results, back off on errors, and poll only what's needed.
- **Terms of Use and Privacy Policy (2026-10-04):** the text is data in `apps/web/lib/legal.ts`, shown at `/terms` and `/privacy`. Update it, and bump its version date, before any change to what is collected goes live: a custom SMTP provider for sign-in mail (add it to "Other services involved"), plan and agreement sync (replace the "planned" section), analytics of any kind, a new localStorage key or cookie (the test fails until the key is named). Both pages send people to Report an issue until `contactEmail` in `lib/about.ts` is set; account deletion requests need that address.
