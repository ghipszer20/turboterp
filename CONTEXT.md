# TurboTerp

An unofficial all-in-one app for University of Maryland students: campus information, a semester schedule builder, and an advisor that checks a four-year plan against every degree requirement.

## Language

### Students and records

**Student**:
The person using TurboTerp, identified by a umd.edu account.
_Avoid_: User, account

**Transcript**:
The student's official record of completed courses, grades and transfer or AP credit, imported from UMD's unofficial transcript.
_Avoid_: Record, grades file

**Completed Course**:
A course on the transcript with a final grade (or transfer/AP credit), in a past term.
_Avoid_: Taken course, finished class

**Term**:
One UMD semester or session, identified like "Spring 2027" (Testudo id 202701); fall, spring, summer or winter.
_Avoid_: Semester (when winter or summer is included), quarter

### Plans and schedules

**Plan**:
The student's four-year arrangement of courses into terms, from first term to graduation. One Plan per student.
_Avoid_: Four-year plan document, roadmap

**Planned Course**:
A course placed in a future term of the Plan, not yet taken.
_Avoid_: Future course

**Schedule**:
A choice of specific sections (with meeting times) for the courses in one term of the Plan. A term can have several Schedules; exactly one is the Active Schedule.
_Avoid_: Timetable, calendar

**Active Schedule**:
The one Schedule per term whose courses are written into the Plan; the others (Plan B, Plan C) are sandboxes.
_Avoid_: Main schedule, primary

**Section**:
One offering of a course in a term: a section number, instructors, seats and meetings.
_Avoid_: Class, offering

**Meeting**:
One recurring time block of a Section (days, start, end, room), such as a lecture or discussion.
_Avoid_: Slot, session

### Degrees and programs

**Degree**:
A credential the student earns, such as a B.S.; a Student may pursue two (a Double Degree).
_Avoid_: Diploma

**Program**:
Any set of requirements a student can declare or follow: a major, minor, certificate, citation, living-learning program, specialization, or pre-professional track.
_Avoid_: Plan (that means something else here), curriculum

**Track**:
A pre-professional Program (pre-med, pre-law, …) listing what professional schools expect; it is never a UMD graduation requirement.
_Avoid_: Pre-professional major

**Double Major**:
One Degree with two majors, needing at least 120 credits.

**Double Degree**:
Two Degrees earned together, needing at least 150 credits and at least 18 credits in each Degree not used for the other.
_Avoid_: Dual major (ambiguous)

**Catalog Year**:
The edition of the UMD Academic Catalog whose rules a Program follows for this student, usually the year the student entered or declared it.
_Avoid_: Bulletin year, version

**Requirement Layer**:
One level of rules applied to a student: University, Gen Ed, College, Program, Track. An audit checks every layer.

### Requirements and auditing

**Requirement**:
One rule a Program imposes, such as "take CMSC351", "12 credits of 400-level CMSC", or "5 courses from at least 3 areas".
_Avoid_: Rule (in user-facing text), criterion

**Alternatives**:
Courses a Requirement lists as "A or B": they stand in for each other, so at most one of them counts toward that Requirement (the other may still count elsewhere).
_Avoid_: Equivalents, substitutes

**Course Set**:
Courses a Requirement asks for together, such as a supporting sequence ("AOSC200, AOSC201 and two 400-level AOSC courses"); a Requirement may ask for one or several of its Course Sets, and a course fills only one place in them.
_Avoid_: Bundle, pair (unless it has exactly two courses)

**Sharing Limit**:
How many courses or credits may count toward two Requirements or two Programs at once.
_Avoid_: Double-count rule, overlap policy

**Assignment**:
Which completed or planned course counts toward which Requirement in an Audit.
_Avoid_: Mapping, allocation

**Audit**:
A check of a Plan and Transcript against every Requirement Layer, producing what is satisfied, what is missing, and what is extra.
_Avoid_: Degree check, validation

**Gap**:
A Requirement the Audit finds unsatisfied, with the courses that could fill it.
_Avoid_: Missing requirement, error

**Overshoot**:
Credits or courses in the Plan that no Requirement needs.
_Avoid_: Excess, waste

**Manual Item**:
A requirement TurboTerp cannot check itself (permission, placement, audition, clinical hours); the student confirms it.
_Avoid_: Unknown, unsupported requirement

**Prerequisite**:
What a student must have completed (sometimes with a minimum grade, sometimes concurrently) before taking a course.
_Avoid_: Prereq (in user-facing text)

**Verified Program**:
A Program whose requirements the owner has reviewed and signed off; only these ship.
_Avoid_: Approved, certified

**What-if**:
An Audit of a hypothetical change (switching majors, adding a minor) that doesn't alter the Plan until the student commits it.
_Avoid_: Simulation, preview
