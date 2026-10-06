# Gen Ed code combinations (audit coverage)

Generated 2026-10-06 (session B) from the Fall 2026 + Spring 2027 Schedule of Classes snapshots: 6852 courses, 46 distinct Gen Ed combinations. Rules: `program-sources/gen-ed.md`. Every row needs a test in `packages/audit/test/gen-ed.test.ts` stating what it fills.

Checks: every SCIS course also carries a DS code (yes); no course carries an FS code with a DS or DV code (yes). No Gen Ed text uses "or".

| Combination | Courses | Examples | Fills |
|---|---|---|---|
| DSSP | 202 | ANSC255, ANSC359, ANSC435 | Scholarship in Practice |
| DSHU | 108 | AAAS200, AAAS271, ARCH170 | Humanities |
| DSHS | 71 | AAAS101, ANTH305, AREC250 | History and Social Sciences |
| DSHS + SCIS | 68 | AGST130, AMST260, ANTH323 | History and Social Sciences; + Big Question (only while it fills its DS category) |
| DSHS + DVUP | 59 | AAAS100, AAAS202, AAAS400 | History and Social Sciences; + Diversity (DVUP, also Understanding Plural Societies) |
| DSHU + DVUP | 58 | AAAS234, AAST355, AAST440 | Humanities; + Diversity (DVUP, also Understanding Plural Societies) |
| DVCC | 34 | AAST394, AAST421, AMST324 | + Diversity (DVCC) |
| DSSP + SCIS | 34 | AGNR230, ARCH230, AREC280 | Scholarship in Practice; + Big Question (only while it fills its DS category) |
| DSNS | 26 | AOSC375, ASTR100, ASTR330 | the second Natural Science |
| DVUP | 22 | AAAS254, ABRM330, AREC365 | + Diversity (DVUP, also Understanding Plural Societies) |
| DSHU + SCIS | 22 | CLAS170, CLAS277, ENEE200 | Humanities; + Big Question (only while it fills its DS category) |
| DSNS + SCIS | 19 | AOSC123, ASTR230, BSCI126 | the second Natural Science; + Big Question (only while it fills its DS category) |
| FSPW | 19 | ENGL381, ENGL390, ENGL390H | Professional Writing |
| DSNL | 16 | ASTR101, BSCI201, ENST200 | Natural Sciences with lab (or the second science) |
| FSAR | 16 | BIOM301, BMGT230, BMGT230L | Analytic Reasoning |
| DSHU + DSSP | 14 | ARHU275, ARHU319D, ARHU319E | one of: Humanities / Scholarship in Practice |
| FSOC | 13 | ARCH403, BSST340, COMM107 | Oral Communication |
| DSNL + DSNS | 13 | BSCI160, BSCI170, BSST240 | one of: Natural Sciences with lab (or the second science) / the second Natural Science |
| DSSP + DVUP | 12 | AAST351, EDSP311, HNUH278R | Scholarship in Practice; + Diversity (DVUP, also Understanding Plural Societies) |
| DSHU + DVUP + SCIS | 12 | ARTH261, ENGL154, HISP200 | Humanities; + Big Question (only while it fills its DS category); + Diversity (DVUP, also Understanding Plural Societies) |
| DSHS + DVUP + SCIS | 10 | AAAS187, AAAS211, AAAS230 | History and Social Sciences; + Big Question (only while it fills its DS category); + Diversity (DVUP, also Understanding Plural Societies) |
| DSHS + DSHU + DVUP | 9 | HIST201, LACS234, LACS234H | one of: History and Social Sciences / Humanities; + Diversity (DVUP, also Understanding Plural Societies) |
| DSSP + DVCC | 6 | EDSP220, GVPT356, TLPL401 | Scholarship in Practice; + Diversity (DVCC) |
| DSHS + DSSP | 6 | FMSC302, HESP120, HIST373 | one of: History and Social Sciences / Scholarship in Practice |
| DSHU + DSSP + SCIS | 5 | ARTH260, ENGL126, ARHU380 | one of: Humanities / Scholarship in Practice; + Big Question (only while it fills its DS category) |
| DSHS + DSHU | 5 | CLAS312, HIST200, HIST205 | one of: History and Social Sciences / Humanities |
| DSHS + DVCC | 5 | CPSP220, FMSC110, FMSC110S | History and Social Sciences; + Diversity (DVCC) |
| FSAR + FSMA | 5 | DATA100, MATH120, MATH135 | Analytic Reasoning **and** Mathematics |
| FSAW | 5 | ENGL101, ENGL101A, ENGL101H | Academic Writing |
| DSHS + DSSP + SCIS | 4 | CCJS225, INST232C, PLCY201 | one of: History and Social Sciences / Scholarship in Practice; + Big Question (only while it fills its DS category) |
| DSHS + DVCC + SCIS | 3 | ANTH266, HLTH234, HLTH234H | History and Social Sciences; + Big Question (only while it fills its DS category); + Diversity (DVCC) |
| DSNL + SCIS | 3 | BSCI135, BSCI223, BSCI283 | Natural Sciences with lab (or the second science); + Big Question (only while it fills its DS category) |
| FSMA | 3 | MATH107, MATH113, MATH115 | Mathematics |
| DSHS + DSHU + DVUP + SCIS | 3 | HIST187, ISRL187, JWST187 | one of: History and Social Sciences / Humanities; + Big Question (only while it fills its DS category); + Diversity (DVUP, also Understanding Plural Societies) |
| DSHU + DSSP + DVUP | 2 | AMST320, THET293 | one of: Humanities / Scholarship in Practice; + Diversity (DVUP, also Understanding Plural Societies) |
| DSHS + DSHU + SCIS | 2 | PHIL202, CLAS276 | one of: History and Social Sciences / Humanities; + Big Question (only while it fills its DS category) |
| DSNL + DVUP | 1 | ANTH222 | Natural Sciences with lab (or the second science); + Diversity (DVUP, also Understanding Plural Societies) |
| DSNL + DSNS + SCIS | 1 | AOSC200 | one of: Natural Sciences with lab (or the second science) / the second Natural Science; + Big Question (only while it fills its DS category) |
| DSNS + DSSP + SCIS | 1 | AREC200 | one of: the second Natural Science / Scholarship in Practice; + Big Question (only while it fills its DS category) |
| DSNS + DSSP + DVUP + SCIS | 1 | BSCI151 | one of: the second Natural Science / Scholarship in Practice; + Big Question (only while it fills its DS category); + Diversity (DVUP, also Understanding Plural Societies) |
| DSSP + DVUP + SCIS | 1 | HDCC105 | Scholarship in Practice; + Big Question (only while it fills its DS category); + Diversity (DVUP, also Understanding Plural Societies) |
| DSNS + DSSP | 1 | KNES260 | one of: the second Natural Science / Scholarship in Practice |
| DSHS + DSNS + SCIS | 1 | PHYS235 | one of: History and Social Sciences / the second Natural Science; + Big Question (only while it fills its DS category) |
| DSHS + DSNS | 1 | PSYC100 | one of: History and Social Sciences / the second Natural Science |
| DSSP + DVCC + SCIS | 1 | CPSP210 | Scholarship in Practice; + Big Question (only while it fills its DS category); + Diversity (DVCC) |
| DSHU + DVCC + SCIS | 1 | RELS271 | Humanities; + Big Question (only while it fills its DS category); + Diversity (DVCC) |
