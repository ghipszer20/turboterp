# App Store listing (R1)

Paste-ready text for App Store Connect (ios-plan sections O9 and O11). Written from the real build in `apps/mobile`: Today (home, reached from the TurboTerp logo) plus four tabs, Campus, Schedule, Seat Alerts and Advisor. Character counts are in brackets and were checked. Items marked **CHECK:** need the owner's eye.

## 1. Metadata

**Name** (30 max) [9]
```
TurboTerp
```

**Subtitle** (30 max) [29]
```
Schedule, dining, seat alerts
```

**Promotional text** (170 max) [156]
```
Build your schedule, get a ping when a full class opens a seat, check dining and libraries, and audit your degree plan. Free, no ads, and no account needed.
```

**Description** (4000 max) [2210]
```
TurboTerp is a free, open-source student app for the University of Maryland campus. Not affiliated with the University of Maryland. It is an unofficial student project, not academic advising, and it has no ads.

Everything works without an account. Signing in is optional and only syncs your plan and schedules between your devices.

TODAY
Your next class, today's dining hours and the dates coming up, on one screen. Open it any time by tapping the TurboTerp name at the top.

CAMPUS
See what is open and what is being served at the dining halls, check library hours, and look up gym and fitness hours.

SCHEDULE
Search courses, see section times and seats, and read professor ratings summarized as star averages with a link to the full reviews. Build a conflict-free schedule and save it.

SEAT ALERTS
Watch a full class and get a notification when a seat opens. Turn notifications on when the app asks. You can stop watching any class, or turn alerts off, whenever you like.

ADVISOR
Add your courses by importing your unofficial transcript (a PDF or a photo) or by typing them in. TurboTerp then checks them against degree requirements, shows what is left, and lays out a four-year plan you can adjust. The check runs on your phone, and your transcript is read on the device and is not uploaded. You can export your plan as a PDF or spreadsheet to take to your advisor.

Before you use the Advisor, you read a short agreement and sign it by typing your name. The Advisor can make mistakes or use out-of-date catalog information, so always confirm your plan with your academic advisor and the official university degree audit before you register or change programs.

PRIVACY
No ads and no tracking. TurboTerp does not sell your data. If you create an account, we keep your email address, your synced plan and your schedules, and you can delete the account yourself inside the app. Read the full policy at turboterp.com/privacy.

Course, dining and seat information comes from publicly available university web pages and may be out of date or wrong. Professor ratings come from PlanetTerp's public data and are shown as summaries with a link to the source.

TurboTerp is made by a student and is open source.
```

**Keywords** (100 max, comma-separated, no brand names) [98]
```
schedule,courses,dining,seat alerts,degree audit,4-year plan,gpa,college,student,planner,professor
```
No UMD, Maryland, Testudo, PlanetTerp, Coursicle, Jupiterp or Apple (guideline 2.3.7). Apple indexes the name and subtitle too, so "schedule" and "seat alerts" are repeats; swap them for new terms if you want more reach.

**Support URL:** `https://turboterp.com/support`
**Marketing URL:** `https://turboterp.com`
**Privacy Policy URL:** `https://turboterp.com/privacy`

**Categories:** primary **Education**, secondary **Productivity** (ios-plan O9).

**Copyright:** `2026 TurboTerp`
**CHECK:** Apple expects a year and the rights owner's name. Use your own name if you prefer, e.g. `2026 Your Name`.

**What's New (first release):** `First release of TurboTerp for iPhone.`

**Content Rights answer (O9 step 3):** "Yes, the app shows third-party content: public university web pages, and PlanetTerp ratings as aggregate star counts with a link out. The content is public and used non-commercially in a free app. PlanetTerp is open source with a public developer API, and the app credits it and links to it."

**Pricing:** Free, United States only. **Trader status:** not a trader (ios-plan O9 step 5).

## 2. Age rating questionnaire

Expected rating: **4+**. Apple's 2026 questionnaire may word things differently; the reasons carry over.

| Question | Answer | Reason |
|---|---|---|
| Cartoon or fantasy violence; realistic violence; graphic violence | None | No such content |
| Sexual content or nudity; mature or suggestive themes | None | No such content |
| Profanity or crude humor | None | The app shows no user-written text |
| Horror or fear themes | None | No such content |
| Alcohol, tobacco or drug references | None | No such content |
| Simulated gambling; real-money gambling; contests | None | No such features |
| Medical or treatment information | None | Not a health app; gym hours only |
| Unrestricted web access | No | Links open reference sites in a browser sheet; there is no general browser |
| User-generated content; chat; messaging | No | No posts, chat or social features; ratings are shown as star counts only |
| Advertising | No | No ads |
| In-app purchases; loot boxes | No | Free, no purchases, no donate button in the app |
| Parental controls or age assurance | No | Not needed |
| AI chatbot or generated content | No | The Advisor is a rule checker, not a chatbot. **CHECK:** change this if an LLM feature ships |

## 3. App Privacy label

Privacy Policy URL: `https://turboterp.com/privacy`. The app has **no analytics** and **no tracking**. Answer **"Do you or your third-party partners use data for tracking? No."** Nothing is used for third-party advertising or the developer's own advertising.

Derived from the privacy text in `packages/app-core/src/legal.ts`, from `apps/mobile/src/sentry.ts`, and from the code under `apps/mobile/src/alerts` and `src/auth`. In App Store Connect choose "Yes, we collect data" and add these types. For every type, "Used for tracking" is **No**.

| Apple data type | Collected? | Linked to user? | Purpose | Why |
|---|---|---|---|---|
| Contact Info: Email Address | Yes, only if the student signs in | Yes | App Functionality | Sign-in and telling accounts apart. Sign in with Apple or Google may give a private-relay address. Never used for marketing |
| Contact Info: Name | Yes | **CHECK:** Yes | App Functionality | The name typed as the Advisor agreement signature, stored encrypted with the agreement record (version, time, random device id, account if signed in). Collected even when signed out |
| User Content: Other User Content | Yes, only if the student signs in | Yes | App Functionality | Synced plan, courses and saved schedules. Without an account they stay on the phone |
| Identifiers: Device ID | Yes, if Seat Alerts is on | **CHECK:** No | App Functionality | Expo push token (relays to Apple), a scrambled copy of a random key kept in the app, and the classes watched. Not tied to an account (privacy text, "Your plan on every device"). **CHECK:** Apple may read a device-keyed record as "linked". If unsure, answer Yes; it costs nothing |
| Diagnostics: Crash Data | Yes, only when the build has a Sentry DSN | No | App Functionality | Sentry error reports with PII scrubbed (`sendDefaultPii: false`, `scrubEvent`). **CHECK:** whether the production build sets `EXPO_PUBLIC_SENTRY_DSN`. If it does not, drop this row |
| Usage Data, Location, Contacts, Photos, Health, Financial, Search history | No | n/a | n/a | Not collected. Transcript photos and PDFs are read on the device and never uploaded. The camera opens only when the student taps Take a photo |
| Diagnostics: Performance Data | No | n/a | n/a | Sentry tracing is off (`tracesSampleRate: 0`) |

**CHECK:** the website uses Vercel Web Analytics, but the iOS app has none, and the label covers the app only.
**CHECK:** "Email my plan" sends the plan PDF to the student's own sign-in address through the server and Brevo. The policy covers it; it is not stored. Apple has no separate type for it.

## 4. App Review notes

Paste into App Review Information, Notes. Leave **Sign-in required** off.

```
TurboTerp is a free student app for the University of Maryland campus. It is not affiliated with the University of Maryland and shows only publicly available information. No ads, no purchases.

Accounts are optional and every tab works signed out, so no demo account is needed. Signing in only syncs plans and schedules between devices. Sign in with Apple is available (Account icon, top right) and creates an account instantly. Account deletion is under Account, Delete account.

How to try the features:
- Today opens by tapping the TurboTerp name at the top. Campus, Schedule, Seat Alerts and Advisor are the four tabs.
- Seat Alerts: open the Seat Alerts tab, allow notifications when asked, then watch a class that is full (a bell is also on each section in Schedule). A notification is sent when a seat opens. Seats open rarely, so the watch list and the notification permission flow are the main things to review.
- Advisor: the degree audit runs on the device. Transcripts (PDF or photo) are read on the device and are not uploaded. The Advisor first shows a typed-name agreement; any name works. To skip importing, add a few courses by hand.

Course, dining and seat data come from public university web pages. Professor ratings come from PlanetTerp's public API and are shown only as star averages with a link to the source. There is no user-generated content.
```

## 5. Screenshot plan

Set: iPhone 6.9" display, **1320 x 2868**, 6 shots. The owner takes them from the real build (TestFlight) with a test plan, not real grades. Claude composes the final images. They must show the real app (guideline 2.3.3), so no mock-ups.

| # | Screen | Caption (one line) |
|---|---|---|
| 1 | Today: next class, dining tiles, upcoming dates | Your day at a glance |
| 2 | Schedule: a conflict-free schedule in the builder | Build a schedule that fits |
| 3 | Seat Alerts: list of watched classes | Get a ping when a seat opens |
| 4 | Advisor: degree audit result with remaining requirements | See what is left to graduate |
| 5 | Advisor: four-year plan | Plan all four years |
| 6 | Campus: Dining | Know what is open and what is served |

Captions use no brand names and no UMD marks. Show no real names, emails or grades.

## 6. App icon

`apps/mobile/assets/icon.png` (1024 x 1024, no transparency) is generated from `apps/web/app/icon.svg` by `npm run icon -w @turboterp/mobile` (`apps/mobile/scripts/make-icon.mjs`, flattened on `#A80A29`). The file is generated and is not committed on this branch until the script runs; run it before the production build.

## 7. Config to fix

Found by comparing `apps/mobile/app.json` with this label. Not edited here, because another builder is changing that file.

1. **`ios.privacyManifests.NSPrivacyCollectedDataTypes` is `[]`**, but the label says the app collects data. Add entries, each with `NSPrivacyCollectedDataTypeLinked`, `NSPrivacyCollectedDataTypeTracking: false` and `NSPrivacyCollectedDataTypePurposes: ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]`:
   - `NSPrivacyCollectedDataTypeEmailAddress`, linked true
   - `NSPrivacyCollectedDataTypeName`, linked true (CHECK, matches the label row)
   - `NSPrivacyCollectedDataTypeOtherUserContent`, linked true
   - `NSPrivacyCollectedDataTypeDeviceID`, linked false (or true, to match the CHECK above)
   - `NSPrivacyCollectedDataTypeCrashData`, linked false (only if Sentry's DSN is set)

   `NSPrivacyTracking: false` already matches "no tracking".
2. **`NSCalendarsWriteOnlyAccessUsageDescription` is declared but no calendar code exists.** `expo-calendar` is not in the plugins list, and a search of `apps/mobile/src` and `app` found no calendar import. The string says "Add to calendar" writes to Apple Calendar. Remove it, or build the feature, before review; an unused permission string invites a 5.1.1 question. The listing above does not mention calendar export for this reason.
3. `usesAppleSignIn: true` and the `expo-apple-authentication` plugin match the review notes. No change needed.
4. `NSCameraUsageDescription` matches the real use (Take a photo, `src/advisor/transcript-sources.ts`). No photo-library string is needed, since the system picker runs out of process.
