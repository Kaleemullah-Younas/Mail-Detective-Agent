import type { RawEmail } from './types';

/**
 * 50 hand-written sample emails covering the full spectrum:
 * scholarships, internships, fellowships, competitions, conferences,
 * research roles, jobs - plus newsletters, spam, phishing, OTPs, and
 * plain-personal mail, so the filter agent has something real to judge.
 *
 * `getSampleInbox()` returns 15 random picks on every call.
 */

export const SAMPLE_INBOX: RawEmail[] = [
  {
    id: 's01',
    from: 'Fulbright Commission <fulbright@usefp.org>',
    subject: 'Fulbright Foreign Student Program 2026 - now open',
    date: '2026-03-18T09:12:00Z',
    body: `Dear Student,\n\nApplications for the Fulbright Foreign Student Program for the 2026-27 academic year are now OPEN. The program covers full tuition, stipend, airfare and health insurance at accredited U.S. universities for MS and PhD degrees.\n\nEligibility: 16 years of education, minimum CGPA 3.0/4.0 or 70%, Pakistani nationality.\nApplication deadline: 15 May 2026.\nApply at: https://fulbright.usefp.org/apply\n\nRegards,\nUSEFP Team`,
  },
  {
    id: 's02',
    from: 'HEC Scholarships <scholarships@hec.gov.pk>',
    subject: 'HEC Need-Based Scholarship - Fall 2026 applications',
    date: '2026-03-20T06:40:00Z',
    body: `The Higher Education Commission invites applications for the Need-Based Scholarship Program Phase-III. The scholarship covers full tuition and living stipend for undergraduate students whose monthly family income is below PKR 45,000.\n\nDeadline: 30 April 2026. Apply through your university's Financial Aid Office.`,
  },
  {
    id: 's03',
    from: 'Google Careers <no-reply@google.com>',
    subject: 'STEP Internship 2026 - applications open',
    date: '2026-03-22T14:02:00Z',
    body: `Google's Student Training in Engineering Program (STEP) is a 12-week paid internship for first and second-year undergraduates. Open to CS/CE/EE students with strong programming skills.\n\nLocation: Warsaw, Dublin, London (on-site). Deadline: 12 April 2026.\nApply: https://careers.google.com/students/step/`,
  },
  {
    id: 's04',
    from: 'DAAD Pakistan <info@daad.pk>',
    subject: 'DAAD Master Scholarships Germany - batch 2026',
    date: '2026-03-10T10:00:00Z',
    body: `The DAAD offers fully-funded master scholarships in Germany for graduates from Pakistan in Development-related fields (Economics, Engineering, Agriculture, Public Health). Monthly stipend of EUR 934, travel allowance and health insurance included.\n\nApplication window closes: 31 July 2026.`,
  },
  {
    id: 's05',
    from: 'Chevening Scholarships <pakistan@chevening.org>',
    subject: 'Chevening Scholarships 2026-27 - UK, fully funded',
    date: '2026-03-12T11:30:00Z',
    body: `Chevening is the UK Government's international awards programme. It funds a one-year master's degree at any UK university. Need 2.1 degree or equivalent and two years of work/volunteer experience.\n\nDeadline: 5 November 2026. Apply: chevening.org/scholarship`,
  },
  {
    id: 's06',
    from: 'Microsoft Research <intern@microsoft.com>',
    subject: 'Research Intern - AI Systems (Summer 2026)',
    date: '2026-03-15T12:20:00Z',
    body: `We are hiring research interns to work on efficient inference for large language models. PhD students preferred; exceptional master's students considered.\n\nLocation: Redmond, WA. Duration: 12 weeks. Stipend: USD 9,500/month. Apply by 20 April 2026.`,
  },
  {
    id: 's07',
    from: 'Amazon Web Services <aws-noreply@amazon.com>',
    subject: '30% off your next EC2 reservation - limited time',
    date: '2026-03-21T08:10:00Z',
    body: `Save up to 30% on one-year Compute Savings Plans when you commit by 31 March. Log in to the AWS console to see your personalised recommendations.`,
  },
  {
    id: 's08',
    from: 'LinkedIn <jobs-listings@linkedin.com>',
    subject: '5 new internships matching "software engineer" in Lahore',
    date: '2026-03-21T07:00:00Z',
    body: `New internship postings we think you'll like:\n1. Frontend Engineer Intern - Afiniti\n2. ML Engineer Intern - Careem\n3. Backend Intern - Systems Ltd\n4. SRE Intern - VentureDive\n5. Data Intern - Tintash\n\nDeadlines vary; click each listing for details.`,
  },
  {
    id: 's09',
    from: 'Mom <ammi@gmail.com>',
    subject: 'Dinner on Sunday?',
    date: '2026-03-22T18:45:00Z',
    body: `Beta, aa rahe ho na Sunday ko? Phuppo bhi aayengi. Let me know by Friday so I can plan the food.\n\nLove,\nAmmi`,
  },
  {
    id: 's10',
    from: 'Nigerian Prince <prince.kolawole@mailinator.com>',
    subject: 'URGENT: Transfer of USD 18.5M to your account',
    date: '2026-03-19T03:00:00Z',
    body: `Dearest Friend,\n\nI am Prince Kolawole of the Federal Republic of Nigeria. I have inherited USD 18.5 million and need a trustworthy partner overseas to receive the funds. Your share will be 30%. Please send your bank details and a scan of your ID immediately.`,
  },
  {
    id: 's11',
    from: 'Netflix <info@mailer.netflix.com>',
    subject: 'New on Netflix this week',
    date: '2026-03-20T02:30:00Z',
    body: `Because you watched "True Detective" - three new crime docuseries just dropped. Start watching now.`,
  },
  {
    id: 's12',
    from: 'Stanford Admissions <admissions@stanford.edu>',
    subject: 'Knight-Hennessy Scholars 2026 - now accepting applications',
    date: '2026-03-14T16:00:00Z',
    body: `Knight-Hennessy Scholars is a fully-funded graduate scholarship at Stanford University open to students pursuing any graduate degree (MS, PhD, MBA, MD, JD).\n\nRequires separate admission to a Stanford graduate program. Deadline: 9 October 2026.`,
  },
  {
    id: 's13',
    from: 'GitHub <noreply@github.com>',
    subject: '[Security] Verify your login from Karachi',
    date: '2026-03-22T19:00:00Z',
    body: `A login from a new device was detected:\n\nBrowser: Chrome on Windows\nLocation: Karachi, Pakistan\n\nIf this was you, no action needed. If not, please change your password immediately.`,
  },
  {
    id: 's14',
    from: 'Google OTP <no-reply@accounts.google.com>',
    subject: 'Your verification code is 283019',
    date: '2026-03-22T20:11:00Z',
    body: `Your Google verification code is 283019. It expires in 10 minutes. Do not share this code with anyone.`,
  },
  {
    id: 's15',
    from: 'Hackathon Pakistan <team@hackpak.io>',
    subject: 'NUST Codefest 2026 - registrations close in 7 days',
    date: '2026-03-18T11:00:00Z',
    body: `NUST Codefest is a 36-hour hackathon with a PKR 500,000 prize pool. Themes: FinTech, Climate, EdTech. Teams of 2-4. Food and swag provided.\n\nRegistration: codefest.nust.edu.pk\nDeadline: 25 March 2026.`,
  },
  {
    id: 's16',
    from: 'Afiniti HR <careers@afiniti.com>',
    subject: 'Software Engineer - full-time (Islamabad)',
    date: '2026-03-17T09:30:00Z',
    body: `Afiniti is hiring full-time Software Engineers for its Islamabad office. 0-2 years experience. Strong fundamentals in data structures, algorithms and distributed systems.\n\nStarting salary: PKR 350,000/month + benefits. Apply: afiniti.com/careers`,
  },
  {
    id: 's17',
    from: 'IEEE Pakistan <chapter@ieee.org>',
    subject: 'IEEE International Conference on AI - call for student papers',
    date: '2026-03-11T13:20:00Z',
    body: `Submit your student research paper to the IEEE International Conference on Artificial Intelligence, to be held in Islamabad this December.\n\nSubmission deadline: 1 August 2026. Notification of acceptance: 15 September 2026.`,
  },
  {
    id: 's18',
    from: 'Daraz <promo@daraz.pk>',
    subject: '48 hours only: Ramzan sale - up to 70% off',
    date: '2026-03-20T04:00:00Z',
    body: `Ramzan Mubarak! Enjoy up to 70% off on electronics, fashion, and kitchen essentials. Sale ends Friday midnight. Shop now: daraz.pk/ramzan`,
  },
  {
    id: 's19',
    from: 'Mastercard Foundation <info@mcscholars.org>',
    subject: 'Mastercard Foundation Scholars Program - UBC intake',
    date: '2026-03-09T15:00:00Z',
    body: `The Mastercard Foundation Scholars Program provides full scholarships (tuition, books, airfare, living stipend) for African and marginalised students at the University of British Columbia.\n\nDeadline: 1 December 2026.`,
  },
  {
    id: 's20',
    from: 'Best Buy <noreply@bestbuy.com>',
    subject: 'Your Geek Squad subscription renewed',
    date: '2026-03-19T12:00:00Z',
    body: `Your Geek Squad Total Tech Support has been renewed for another year. USD 199.99 was charged to your card ending 4421.`,
  },
  {
    id: 's21',
    from: 'World Bank Careers <noreply@worldbank.org>',
    subject: 'Junior Professional Associate (JPA) Program - 2026 cohort',
    date: '2026-03-13T08:50:00Z',
    body: `The World Bank's Junior Professional Associate program hires recent graduates (under 28) for 2-year analyst roles in Washington DC and country offices. Master's degree and fluency in English required.\n\nDeadline: 30 June 2026.`,
  },
  {
    id: 's22',
    from: 'MIT Admissions <admissions@mit.edu>',
    subject: 'MIT Summer Research Program - undergraduate applications',
    date: '2026-03-16T10:00:00Z',
    body: `MSRP is a 9-week research internship for rising juniors and seniors from underrepresented groups. Full funding includes stipend, housing and travel.\n\nDeadline: 1 February 2026. (This email is being re-sent to close-deadline applicants.)`,
  },
  {
    id: 's23',
    from: 'Spotify <no-reply@spotify.com>',
    subject: 'Your 2026 Ramzan playlist is here',
    date: '2026-03-20T09:00:00Z',
    body: `Dig into 40 hours of naat, qawwali and soothing instrumentals curated for Ramzan. Listen now on Spotify.`,
  },
  {
    id: 's24',
    from: 'Erasmus+ <erasmus.plus@ec.europa.eu>',
    subject: 'Erasmus Mundus Joint Masters - 2026 call',
    date: '2026-03-08T07:15:00Z',
    body: `The European Commission's Erasmus Mundus scholarships cover fully-funded joint master's degrees across two or three European universities. Available in 130+ subjects.\n\nCheck individual programme pages for deadlines (most close between January and March 2026).`,
  },
  {
    id: 's25',
    from: 'Kaggle <noreply@kaggle.com>',
    subject: 'New competition: LLM Efficiency Challenge - USD 50k',
    date: '2026-03-21T17:00:00Z',
    body: `A new Kaggle competition is live. Fine-tune a base LLM on a single A100 GPU within 24 hours and maximise held-out performance. USD 50,000 total prizes.\n\nSubmission deadline: 10 May 2026.`,
  },
  {
    id: 's26',
    from: 'Rahim Sheikh <rahim@batchmates.pk>',
    subject: 're: semester 5 notes',
    date: '2026-03-22T11:11:00Z',
    body: `Thanks yaar. Got the OS notes. Do you have the DB slides from Sir Awais as well? The midterm is next week and his section has a different deck.`,
  },
  {
    id: 's27',
    from: 'Adobe <noreply@adobe.com>',
    subject: 'Your Creative Cloud subscription expires in 3 days',
    date: '2026-03-19T06:00:00Z',
    body: `Renew now to keep access to Photoshop, Illustrator, Premiere and 100 GB of cloud storage.`,
  },
  {
    id: 's28',
    from: 'UNDP Pakistan <careers.pk@undp.org>',
    subject: 'Policy Fellow - Youth Development (1-year)',
    date: '2026-03-12T08:40:00Z',
    body: `UNDP Pakistan is hiring a one-year Policy Fellow to support its Youth Development programme. Open to master's degree holders under 32. Monthly stipend PKR 220,000.\n\nDeadline: 14 April 2026.`,
  },
  {
    id: 's29',
    from: 'Rhodes Trust <applications@rhodesscholar.org>',
    subject: 'Rhodes Scholarships Pakistan - 2027 applications',
    date: '2026-03-07T10:30:00Z',
    body: `Applications for the Rhodes Scholarship from Pakistan for study at the University of Oxford open in June 2026. Eligibility: age 19-25, first degree or equivalent by Oct 2027, Pakistani citizenship.`,
  },
  {
    id: 's30',
    from: 'Crypto Winner <winner@lucky-eth.com>',
    subject: 'Congratulations! You have won 2.5 ETH',
    date: '2026-03-18T02:00:00Z',
    body: `You have been selected as one of our 10 weekly winners. To claim your 2.5 ETH, connect your wallet to the link below and pay a small gas fee of 0.01 ETH.`,
  },
  {
    id: 's31',
    from: 'Dr. Salman Ahmad <salman.ahmad@fast.edu.pk>',
    subject: 'Research assistantship - NLP lab, summer 2026',
    date: '2026-03-15T14:00:00Z',
    body: `Dear students,\n\nI'm looking for two research assistants to work on a project on low-resource Urdu NLP. Requires solid Python and familiarity with PyTorch. 20 hours/week, PKR 40,000 stipend.\n\nEmail me a CV and transcript by 5 April.`,
  },
  {
    id: 's32',
    from: 'Aga Khan Foundation <scholarship@akfp.org>',
    subject: 'Aga Khan Foundation International Scholarship 2026',
    date: '2026-03-06T09:00:00Z',
    body: `The AKF International Scholarship Programme provides loans and partial grants to outstanding students from developing countries for postgraduate studies. Priority given to Aga Khan Development Network countries.\n\nDeadline: 31 March 2026.`,
  },
  {
    id: 's33',
    from: 'Slack <notifications@slack.com>',
    subject: '3 new messages in #project-hackathon',
    date: '2026-03-22T13:30:00Z',
    body: `You have new activity from the last 24 hours. Open Slack to see the messages.`,
  },
  {
    id: 's34',
    from: 'Meta Careers <careers@meta.com>',
    subject: 'University Recruitment: Software Engineer Intern 2026',
    date: '2026-03-14T09:00:00Z',
    body: `Meta is hiring software engineering interns for summer 2026. Open to undergraduate and master's students in CS. Locations: Menlo Park, Seattle, London. Apply before 30 April.`,
  },
  {
    id: 's35',
    from: 'Phishy Bank Security <security@g00gle-mail.com>',
    subject: 'Urgent: verify your account to avoid suspension',
    date: '2026-03-20T21:00:00Z',
    body: `We detected unusual activity on your account. Please verify your identity by clicking the link below and entering your username and password within 24 hours, or your account will be permanently suspended.`,
  },
  {
    id: 's36',
    from: 'Rhodes Academy <info@rhodesacademy.org>',
    subject: 'Rhodes Academy Summer School 2026 - Oceans & Law',
    date: '2026-03-11T11:45:00Z',
    body: `A three-week summer school on the Law of the Sea, held in Rhodes, Greece. Full scholarships available for students from developing countries. Deadline: 31 March 2026.`,
  },
  {
    id: 's37',
    from: 'Accenture Pakistan <careers.pk@accenture.com>',
    subject: 'Analyst Trainee Program - Fresh Graduates 2026',
    date: '2026-03-17T08:00:00Z',
    body: `Accenture Pakistan's 18-month Analyst Trainee Program hires bachelor's graduates for technology consulting roles in Karachi and Islamabad. Starting salary PKR 180,000/month. Apply by 30 April.`,
  },
  {
    id: 's38',
    from: 'McKinsey Careers <careers@mckinsey.com>',
    subject: 'Business Analyst - summer 2026 applications',
    date: '2026-03-13T15:30:00Z',
    body: `McKinsey is recruiting for Business Analyst internships in its Dubai and Istanbul offices for summer 2026. Strong academic record and quantitative ability required. Deadline: 25 March 2026.`,
  },
  {
    id: 's39',
    from: 'Uber <receipts@uber.com>',
    subject: 'Your Saturday evening trip with Uber',
    date: '2026-03-21T21:15:00Z',
    body: `PKR 420 for a 6.2 km ride. Thanks for riding with Uber.`,
  },
  {
    id: 's40',
    from: 'Model United Nations <secretariat@lums.mun>',
    subject: 'LUMUN 2026 - delegate applications open',
    date: '2026-03-10T14:00:00Z',
    body: `LUMS Model United Nations invites delegates for its 21st annual conference (19-22 October 2026). 20+ committees, international delegates, partial scholarships for outstation participants.\n\nDeadline: 15 August 2026.`,
  },
  {
    id: 's41',
    from: 'TEDxUET <team@tedxuet.com>',
    subject: 'Be a speaker at TEDxUET Lahore - call for nominations',
    date: '2026-03-09T10:00:00Z',
    body: `We are accepting nominations for speakers at TEDxUET 2026. Themes: Identity, Climate, Technology, Art. Self-nominations welcome.\n\nDeadline: 20 April 2026.`,
  },
  {
    id: 's42',
    from: 'Arbisoft Careers <careers@arbisoft.com>',
    subject: 'Summer Internship Program 2026 - software engineering',
    date: '2026-03-16T12:00:00Z',
    body: `Arbisoft's 10-week paid summer internship is open for 3rd and 4th-year CS/SE undergraduates. On-site in Lahore and Islamabad offices. Stipend PKR 75,000/month.\n\nDeadline: 15 April 2026.`,
  },
  {
    id: 's43',
    from: 'Medium Daily Digest <noreply@medium.com>',
    subject: '5 stories picked for you today',
    date: '2026-03-22T06:00:00Z',
    body: `Today's reads: "Why React Server Components are harder than they look", "A primer on LoRA for CPUs", and three more.`,
  },
  {
    id: 's44',
    from: 'Commonwealth Scholarships <cscuk@cscuk.org>',
    subject: "Commonwealth Scholarships - UK Master's 2026-27",
    date: '2026-03-08T09:45:00Z',
    body: `The Commonwealth Scholarship Commission funds one-year master's studies in the UK for students from developing Commonwealth countries (including Pakistan). Covers tuition, airfare and living allowance.\n\nApplication opens July 2026.`,
  },
  {
    id: 's45',
    from: 'YC Startup School <school@ycombinator.com>',
    subject: 'Startup School 2026 - free online programme',
    date: '2026-03-15T11:30:00Z',
    body: `Y Combinator's Startup School is a free 10-week online programme for founders. Get weekly lectures, office hours, and access to a global founder community.\n\nApplications close 1 May 2026.`,
  },
  {
    id: 's46',
    from: 'HR Portal <hr@systemsltd.com>',
    subject: 'Reminder: log your daily attendance',
    date: '2026-03-22T08:00:00Z',
    body: `You have not logged your attendance for the week. Please complete your timesheet by Friday 5pm.`,
  },
  {
    id: 's47',
    from: 'Karachi Institute of Economics <events@kie.edu.pk>',
    subject: 'National Case Competition 2026 - PKR 300k prize',
    date: '2026-03-11T15:00:00Z',
    body: `The 8th National Undergraduate Case Competition is open for registration. Teams of 3, any discipline. Finals in Karachi, 28-30 June. Travel and accommodation covered for shortlisted teams.\n\nDeadline: 20 April 2026.`,
  },
  {
    id: 's48',
    from: 'LinkedIn Learning <learning@linkedin.com>',
    subject: 'Your weekly skill progress',
    date: '2026-03-22T05:30:00Z',
    body: `You watched 42 minutes of "Advanced Next.js" this week. Keep it up to maintain your streak.`,
  },
  {
    id: 's49',
    from: 'Fatima Fellowship <apply@fatima-fellowship.com>',
    subject: 'Fatima Fellowship - ML mentorship for Pakistan',
    date: '2026-03-13T10:45:00Z',
    body: `The Fatima Fellowship is a 4-month remote research mentorship pairing Pakistani students with top ML researchers abroad. Projects culminate in a workshop paper.\n\nDeadline: 25 April 2026.`,
  },
  {
    id: 's50',
    from: 'CERN Students <students@cern.ch>',
    subject: 'CERN Summer Student Programme 2026',
    date: '2026-03-10T12:30:00Z',
    body: `Spend 8-13 weeks at CERN, Geneva, working on physics or computing projects under the supervision of CERN staff. Open to undergraduate and graduate students in STEM. Travel and stipend provided.\n\nDeadline: 31 January 2026. (Backup recruitment round closes 10 April 2026.)`,
  },
];

/**
 * Returns 15 random emails from the sample pool. Uses Fisher-Yates so we
 * always get a unique set within a call. Stable within a single call -
 * component re-mounts will reshuffle (which matches the product spec:
 * "on every refresh they are random swapped in position").
 */
export function getSampleInbox(count = 15): RawEmail[] {
  const pool = [...SAMPLE_INBOX];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
