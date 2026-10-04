# 4. Verified data sources (checked 2026-09-24)

Moved out of PROJECT_MEMORY.md (section 4) so it loads only when needed. Update it here when a decision changes.

| Data | Source | Notes |
|---|---|---|
| Courses/sections/seats | Testudo Schedule of Classes (app.testudo.umd.edu/soc) | Primary source; umd.io (student-run) is the fallback only |
| Requirements | academiccatalog.umd.edu, 2026–27 catalog | Structured HTML course lists, "select N" groups, footnotes, Graduation Plans tab |
| Sample plans | 4yearplans.umd.edu | Used as golden tests: each official plan must pass |
| Grades/profs/reviews | PlanetTerp API, api.planetterp.com/v1 | No auth; endpoints: courses, professors, grades, search. Credit them, and ask before heavy use |
| Reddit | Reddit Data API | Free only for non-commercial use, needs manual approval (2–4 weeks); optional or dropped |
| Dining | nutrition.umd.edu `longmenu.aspx` | Hall/date/meal/station; items link to `label.aspx?RecNumAndPort=…`. No update feed, so poll every ~30 min and push only when a content hash changes |
| Dining (confirmed 2026-09-24) | `GET https://nutrition.umd.edu/?locationNum={16 South Campus, 19 Yahentamitsi, 51 251 North}&dtdate={M/D/YYYY}` | Meals are tab panes `#pane-1/2/3` (Breakfast/Lunch/Dinner; titles from `.nav-link`). Stations are `.card` with `h3.card-title`. Items are `.menu-item-row` → `a.menu-item-name` (href `label.aspx?RecNumAndPort=…`) plus `img.nutri-icon` alt text (e.g. "Contains pork"). The date dropdown is filled by JS, so generate dates yourself |
| Room availability (confirmed 2026-09-24) | `POST https://umd.libcal.com/spaces/availability/grid`, form `lid, gid, eid=-1, seat=0, seatId=0, zone=0, start=YYYY-MM-DD, end=YYYY-MM-DD, pageIndex=0, pageSize=18`, header `Referer` = the category page | Returns `{slots:[{start,end,itemId,checksum,className?}]}`. A `className` of `s-lc-eq-checkout` means booked; no className means open. Room metadata is embedded in the category page HTML (e.g. `/reserve/mckeldin/carrels-4hr`) as JS objects: `title` ("7209 (Capacity 2)"), `url` `/space/{eid}` (the booking deep link), `eid`, `gid`, `lid`, `grouping`, `capacity`. Undocumented endpoint: read-only, cache it, keep request rates low |
| Library hours | umd.libcal.com/hours (LibCal) | 10 locations, weeks of hours ahead |
| Study rooms | umd.libcal.com/reserve | Booking needs a UMD email, not a password. Location ids: McKeldin 2552, Art 14005, Performing Arts 14006, STEM 6745. McKeldin categories: TLC Group Study 23065, Carrels 23067, Family Room 23082, Faculty Office 23071, Podcasting Lab 30085, Conversation Room 40070 |
| RecWell hours | Public Google Sheet `1y3-5AE7FBNL0JFi4LW459WaBQzYVOdWMvtOVr0DZCmM` | CSV via `/export?format=csv&gid=…`. Indoor gids: 1320933735, 1321604209, 354755843, 83449240, 1348172338, 883167948, 628324683, 180872438. Outdoor gids: 1601669223, 1656075107, 849246933, 836576797. One row per facility or area, one column per date for the whole year. Needs a layout check that alerts the owner when it breaks |
| Group fitness | Semester PDF on recwell.umd.edu | Extract once per semester, then owner review |
| Gym occupancy | Not found publicly | Don't plan on it |
| Bus schedules (static) | Shuttle-UM GTFS `https://feed.actionfigure.ai/university-of-maryland-shuttle-um.zip` (Transitland `f-shuttleum~md~us`) | Downloaded 2026-09-24: 37 routes (including event routes), 361 stops, ~3,050 trips, with shapes. Valid 2026-05-19 to 2026-12-24, so re-fetch every day and alert if the feed nears expiry. Interline GTFS license: non-commercial, non-revenue educational use; attribution optional (text and notes in prelaunch-checklist.md) |
| Bus real-time | Not public. DOTS uses Swiftly, which powers the official Transit app | Ask DOTS for a Swiftly GTFS-RT key (non-commercial student app). Until then, show scheduled times plus a link out to Transit |
| Metro/regional | WMATA developer API (free key); Metrobus/TheBus GTFS | Optional: College Park Metro connections |
| Waitlist rules | registrar.umd.edu waitlist-hold-file | Opened seats go to the waitlist automatically; daily check-in is mandatory or you lose your spot |
