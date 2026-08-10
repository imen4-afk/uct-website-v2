-- Real knowledge base for Touhemi, replacing the hardcoded facts that used
-- to live directly in app/api/chat/route.ts's SYSTEM_PROMPT.
--
-- Run this once in the Supabase SQL editor (same place messages.sql was run).
-- After that, editing an event detail is just editing a row here — no code
-- change or redeploy needed. app/api/chat/route.ts reads this table on every
-- request and builds the prompt's knowledge section from it.

create table knowledge (
  id bigint generated always as identity primary key,
  section text not null,
  title text not null,
  content text not null,
  sort_order int not null default 0,
  updated_at timestamp default now()
);

alter table knowledge enable row level security;

-- Public read access: the app reads this table with the anon key from the
-- server route. No insert/update/delete policy is granted, so edits only
-- happen through the Supabase dashboard (table editor / SQL editor), not
-- from the app itself.
create policy "Public read access" on knowledge
  for select
  using (true);

insert into knowledge (section, title, content, sort_order) values
('event', 'EVENT', $$- Full name: Unmasking Cyber Threats — 2nd Edition (UCT 2.0)
- Type: National Cybersecurity Congress
- Dates: 26–27 September 2026
- Location: Mahdia, Tunisia (exact venue shared with registered participants)
- Organizer: IEEE Computer Science Chapter at ISIMA Student Branch
- Tracks: Overnight CTF + Technical Challenge (in parallel)
- Round table with prominent cybersecurity experts
- Focus: technical depth, competitions, networking$$, 1),

('program', 'PROGRAM — DAY 1 (Sep 26)', $$12:00 – Check In
13:30 – Opening Ceremony
15:00 – Conference / Talks
17:00 – Workshops
19:00 – Dinner
20:00 – Party
22:00 – Overnight CTF starts + Karaoke
23:00 – Movie night$$, 2),

('program', 'PROGRAM — DAY 2 (Sep 27)', $$09:00 – End of CTF & Breakfast
09:30 – Tour of Mahdia OR Murder Mystery Game (participant choice)
12:00 – Lunch
13:00 – Technical Challenge pitching (jury evaluation)
15:00 – Break
15:30 – Closing Ceremony & Awards$$, 3),

('ctf', 'CTF', $$- Overnight jeopardy-style CTF from Day 1 night through Day 2 morning
- Categories: Web Exploitation (SQLi, XSS, SSRF), Reverse Engineering, Cryptography, OSINT, Forensics
- Beginner-friendly with progressive difficulty
- Teams of 2–4 recommended; solo registration allowed (organizers help with matching)$$, 4),

('technical_challenge', 'TECHNICAL CHALLENGE', $$- Separate track from CTF
- Teams solve a real-world cybersecurity scenario
- Pitch and defend to a jury on Day 2 at 13:00$$, 5),

('training', 'PRE-EVENT TRAINING', $$- Free 14-session online workshop series on Cybersecurity Basics & CTF Methodology
- Runs July–September 2026, open to all Tunisian university students
- No application required
- Topics: Intro to Cybersecurity, Networking, Linux, Web Security, Crypto, OSINT, Forensics, Scripting for CTFs, practice CTF$$, 6),

('ambassadors', 'AMBASSADORS', $$- Represent UCT at their university, promote and drive registrations
- Applications open until July 13 — form in the Ambassadors section of the website$$, 7),

('registration', 'REGISTRATION', $$- General registration not yet open
- Ambassador applications open until July 13
- Follow @ieee.uct on Instagram for the announcement$$, 8),

('speakers_partners', 'SPEAKERS & PARTNERS', $$- Lineup being finalized — prominent figures from Tunisia's cybersecurity scene
- Sponsorship inquiries: ieee.cs.isima@gmail.com$$, 9),

('contact', 'CONTACT', $$- Email: ieee.cs.isima@gmail.com
- Instagram: @ieee.uct
- Organized by: IEEE CS Chapter ISIMA Student Branch, Mahdia, Tunisia$$, 10);
