import { Course, Instructor, CoachingCenter, Student, Enrollment, WithdrawalRequest, Review } from './types'

// ─── INSTRUCTORS ──────────────────────────────────────────────────────────────
export const instructors: Instructor[] = [
  {
    id: 'inst-1', name: 'মো. রহিম উদ্দিন', email: 'rahim@school.com', password: 'Rahim@123',
    role: 'instructor', phone: '01711-111111', createdAt: '2023-01-10', status: 'active',
    bio: 'ঢাকা বিশ্ববিদ্যালয় থেকে গণিত ও পদার্থবিজ্ঞানে স্নাতকোত্তর। ১৫ বছরের শিক্ষকতার অভিজ্ঞতা।',
    expertise: ['গণিত', 'পদার্থবিজ্ঞান', 'SSC', 'HSC'],
    totalCourses: 5, totalStudents: 3240, rating: 4.9,
    totalEarnings: 84500, pendingWithdrawal: 12000, verified: true, institution: 'coaching-1',
  },
  {
    id: 'inst-2', name: 'ফাতেমা আক্তার', email: 'fatema@school.com', password: 'Fatema@123',
    role: 'instructor', phone: '01722-222222', createdAt: '2023-03-15', status: 'active',
    bio: 'ইংরেজি সাহিত্যে স্নাতকোত্তর, IELTS Band 8.5। ১০ বছর ধরে ইংরেজি শেখাচ্ছেন।',
    expertise: ['English', 'IELTS', 'Speaking', 'Grammar'],
    totalCourses: 3, totalStudents: 1890, rating: 4.8,
    totalEarnings: 52200, pendingWithdrawal: 8500, verified: true,
  },
  {
    id: 'inst-3', name: 'করিম ভাই', email: 'karim@school.com', password: 'Karim@123',
    role: 'instructor', phone: '01733-333333', createdAt: '2022-11-20', status: 'active',
    bio: 'BUET থেকে CSE-তে পাস করা Software Engineer। Google-এ কাজ করার অভিজ্ঞতা আছে।',
    expertise: ['Python', 'JavaScript', 'Web Development', 'Programming'],
    totalCourses: 4, totalStudents: 5600, rating: 4.9,
    totalEarnings: 135000, pendingWithdrawal: 25000, verified: true, institution: 'coaching-2',
  },
]

// ─── COACHING CENTERS ─────────────────────────────────────────────────────────
export const coachingCenters: CoachingCenter[] = [
  {
    id: 'coaching-1', name: 'Udayan Academy', email: 'udayan@school.com', password: 'Udayan@123',
    role: 'coaching_center', phone: '02-9876543', createdAt: '2022-06-01', status: 'active',
    brandName: 'উদয়ন একাডেমি', description: 'ঢাকার অন্যতম সেরা কোচিং সেন্টার। SSC ও HSC পরীক্ষার্থীদের জন্য বিশেষভাবে ডিজাইন করা কোর্সসমূহ।',
    instructors: ['inst-1'], totalCourses: 8, totalStudents: 4200,
    totalEarnings: 210000, pendingWithdrawal: 35000, verified: true,
    address: 'ধানমন্ডি, ঢাকা-১২০৫',
  },
  {
    id: 'coaching-2', name: 'Pioneer Coaching', email: 'pioneer@school.com', password: 'Pioneer@123',
    role: 'coaching_center', phone: '031-654321', createdAt: '2022-09-15', status: 'active',
    brandName: 'পায়োনিয়ার কোচিং', description: 'চট্টগ্রামের শীর্ষস্থানীয় কোচিং ইনস্টিটিউট। প্রোগ্রামিং ও স্কিল ডেভেলপমেন্টে অগ্রণী ভূমিকা রাখছে।',
    instructors: ['inst-3'], totalCourses: 5, totalStudents: 3100,
    totalEarnings: 155000, pendingWithdrawal: 22000, verified: true,
    address: 'আগ্রাবাদ, চট্টগ্রাম',
  },
]

// ─── COURSES ──────────────────────────────────────────────────────────────────
export const courses: Course[] = [
  {
    id: 'c1', slug: 'ssc-math-master',
    title: 'SSC গণিত মাস্টার কোর্স',
    subtitle: 'SSC পরীক্ষায় A+ পেতে সম্পূর্ণ গণিত',
    description: 'SSC পরীক্ষার সম্পূর্ণ গণিত সিলেবাস কভার করা হয়েছে এই কোর্সে। বীজগণিত থেকে জ্যামিতি, সব কিছু সহজ ভাষায় বোঝানো হবে। প্রতিটি অধ্যায়ের পর প্র্যাকটিস টেস্ট আছে।',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 1200, originalPrice: 2000,
    category: 'Academic', subcategory: 'SSC',
    language: 'bangla', level: 'beginner',
    tags: ['SSC', 'গণিত', 'বীজগণিত', 'জ্যামিতি'],
    instructorId: 'inst-1', coachingCenterId: 'coaching-1',
    totalLessons: 45, totalDuration: '32h 15m',
    rating: 4.9, reviews: 342, enrollments: 2100,
    badge: 'Bestseller', status: 'approved',
    commissionRate: 20, createdAt: '2023-06-01', updatedAt: '2024-01-15',
    requirements: ['Class 9-10 এর পাঠ্যপুস্তক', 'কলম ও খাতা', 'মনোযোগ দিয়ে পড়ার ইচ্ছে'],
    whatYouLearn: ['বীজগণিতের সব সূত্র আয়ত্ত করতে পারবেন', 'জ্যামিতির সব উপপাদ্য বুঝবেন', 'MCQ ও সৃজনশীল উভয় প্রশ্নের উত্তর দিতে পারবেন', 'SSC পরীক্ষায় A+ পাওয়ার কৌশল শিখবেন'],
    targetAudience: 'SSC পরীক্ষার্থী যারা গণিতে ভালো করতে চান',
    certificate: true, liveClasses: true, liveClassLink: 'https://zoom.us/j/example',
    chapters: [
      { id: 'ch1', title: 'বীজগণিত', order: 1, lessons: [
        { id: 'l1', title: 'বীজগণিতের পরিচয়', duration: '15:30', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'সূত্র ও প্রয়োগ', duration: '22:45', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'ফ্যাক্টরিজেশন', duration: '18:20', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l4', title: 'অধ্যায় কুইজ', duration: '15 min', type: 'quiz', isFree: false, order: 4 },
      ]},
      { id: 'ch2', title: 'জ্যামিতি', order: 2, lessons: [
        { id: 'l5', title: 'ত্রিভুজের গুণাবলী', duration: '20:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l6', title: 'বৃত্তের উপপাদ্য', duration: '25:10', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'ক্ষেত্রফল ও পরিসীমা', duration: '17:45', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'পরিমিতি', order: 3, lessons: [
        { id: 'l8', title: 'ঘনবস্তুর আয়তন', duration: '19:30', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l9', title: 'পৃষ্ঠতলের ক্ষেত্রফল', duration: '21:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch4', title: 'সংখ্যাতত্ত্ব', order: 4, lessons: [
        { id: 'l10', title: 'মৌলিক সংখ্যা', duration: '14:20', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l11', title: 'গ.সা.গু ও ল.সা.গু', duration: '16:40', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch5', title: 'মডেল টেস্ট', order: 5, lessons: [
        { id: 'l12', title: 'ফাইনাল মডেল টেস্ট ১', duration: '60 min', type: 'quiz', isFree: false, order: 1 },
        { id: 'l13', title: 'ফাইনাল মডেল টেস্ট ২', duration: '60 min', type: 'quiz', isFree: false, order: 2 },
      ]},
    ],
  },
  {
    id: 'c2', slug: 'hsc-physics-complete',
    title: 'HSC পদার্থবিজ্ঞান সম্পূর্ণ কোর্স',
    subtitle: 'HSC পদার্থবিজ্ঞান ১ম ও ২য় পত্র',
    description: 'HSC পদার্থবিজ্ঞানের সম্পূর্ণ সিলেবাস অ্যানিমেশন ও ভিজ্যুয়ালের মাধ্যমে বোঝানো হবে। জটিল ধারণাগুলো সহজ করে উপস্থাপন করা হয়েছে।',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 1500, originalPrice: 2500,
    category: 'Academic', subcategory: 'HSC',
    language: 'bangla', level: 'intermediate',
    tags: ['HSC', 'পদার্থবিজ্ঞান', 'Physics'],
    instructorId: 'inst-1',
    totalLessons: 38, totalDuration: '28h 00m',
    rating: 4.8, reviews: 215, enrollments: 1560,
    badge: 'Hot', status: 'approved',
    commissionRate: 20, createdAt: '2023-08-10', updatedAt: '2024-02-01',
    requirements: ['SSC পদার্থবিজ্ঞানের জ্ঞান', 'ক্যালকুলেটর'],
    whatYouLearn: ['নিউটনের গতিসূত্র বুঝবেন', 'তড়িৎ ও চুম্বকত্ব শিখবেন', 'আধুনিক পদার্থবিজ্ঞান জানবেন', 'HSC পরীক্ষায় A+ পাবেন'],
    targetAudience: 'HSC প্রথম ও দ্বিতীয় বর্ষের শিক্ষার্থী',
    certificate: true, liveClasses: false,
    chapters: [
      { id: 'ch1', title: 'গতিবিজ্ঞান', order: 1, lessons: [
        { id: 'l1', title: 'পরিচয় ও মৌলিক ধারণা', duration: '18:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'নিউটনের সূত্র', duration: '24:30', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'প্রজেক্টাইল গতি', duration: '20:15', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'তরঙ্গ ও শব্দ', order: 2, lessons: [
        { id: 'l4', title: 'তরঙ্গের প্রকারভেদ', duration: '16:40', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'শব্দের বৈশিষ্ট্য', duration: '19:20', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'তড়িৎ ও চুম্বকত্ব', order: 3, lessons: [
        { id: 'l6', title: 'তড়িৎ ক্ষেত্র', duration: '22:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'চুম্বকীয় ক্ষেত্র', duration: '25:30', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l8', title: 'তড়িৎচুম্বকীয় আবেশ', duration: '21:15', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch4', title: 'আধুনিক পদার্থবিজ্ঞান', order: 4, lessons: [
        { id: 'l9', title: 'আপেক্ষিকতা তত্ত্ব', duration: '28:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l10', title: 'কোয়ান্টাম মেকানিক্স', duration: '30:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
  },
  {
    id: 'c3', slug: 'ielts-foundation',
    title: 'IELTS Foundation Course',
    subtitle: 'Listening, Reading, Writing ও Speaking',
    description: 'IELTS পরীক্ষার সম্পূর্ণ প্রস্তুতি। Band 7+ পেতে প্রয়োজনীয় সব কৌশল এবং প্র্যাকটিস টেস্ট সহ।',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 2500, originalPrice: 4000,
    category: 'Professional', subcategory: 'IELTS',
    language: 'both', level: 'intermediate',
    tags: ['IELTS', 'English', 'Band 7', 'Academic'],
    instructorId: 'inst-2',
    totalLessons: 55, totalDuration: '40h 30m',
    rating: 4.8, reviews: 189, enrollments: 1240,
    badge: 'Featured', status: 'approved',
    commissionRate: 20, createdAt: '2023-04-20', updatedAt: '2024-01-20',
    requirements: ['Intermediate level English', 'Notebook for writing practice'],
    whatYouLearn: ['IELTS exam format বুঝবেন', 'Band 7+ পাওয়ার strategy শিখবেন', 'Academic Writing Task 1 & 2 লিখতে পারবেন', 'Speaking confidence বাড়াবেন'],
    targetAudience: 'যারা বিদেশে পড়তে বা কাজ করতে চান',
    certificate: true, liveClasses: true,
    chapters: [
      { id: 'ch1', title: 'Listening Module', order: 1, lessons: [
        { id: 'l1', title: 'IELTS Listening Overview', duration: '12:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Section 1 & 2 Strategies', duration: '18:30', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'Section 3 & 4 Practice', duration: '22:00', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'Reading Module', order: 2, lessons: [
        { id: 'l4', title: 'Skimming & Scanning', duration: '20:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'True/False/Not Given', duration: '25:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'Writing Module', order: 3, lessons: [
        { id: 'l6', title: 'Task 1: Graph Description', duration: '30:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'Task 2: Essay Writing', duration: '35:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch4', title: 'Speaking Module', order: 4, lessons: [
        { id: 'l8', title: 'Part 1: Introduction', duration: '15:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l9', title: 'Part 2: Cue Card', duration: '20:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch5', title: 'Mock Tests', order: 5, lessons: [
        { id: 'l10', title: 'Full Mock Test 1', duration: '3h', type: 'quiz', isFree: false, order: 1 },
        { id: 'l11', title: 'Full Mock Test 2', duration: '3h', type: 'quiz', isFree: false, order: 2 },
      ]},
      { id: 'ch6', title: 'Vocabulary & Grammar', order: 6, lessons: [
        { id: 'l12', title: 'Academic Word List', duration: '28:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
  },
  {
    id: 'c4', slug: 'python-bangla',
    title: 'Python প্রোগ্রামিং বাংলায়',
    subtitle: 'শূন্য থেকে প্রফেশনাল Python Developer',
    description: 'সম্পূর্ণ বাংলায় Python শিখুন। ভেরিয়েবল থেকে শুরু করে Object-Oriented Programming পর্যন্ত সব কিছু হাতে-কলমে শেখানো হবে।',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 800, originalPrice: 1500,
    category: 'Skills', subcategory: 'Programming',
    language: 'bangla', level: 'beginner',
    tags: ['Python', 'Programming', 'Coding', 'Beginner'],
    instructorId: 'inst-3', coachingCenterId: 'coaching-2',
    totalLessons: 60, totalDuration: '45h 00m',
    rating: 4.9, reviews: 567, enrollments: 4200,
    badge: 'Bestseller', status: 'approved',
    commissionRate: 20, createdAt: '2023-02-15', updatedAt: '2024-03-01',
    requirements: ['যেকোনো Computer বা Laptop', 'Python 3.x install করতে হবে', 'ইন্টারনেট সংযোগ'],
    whatYouLearn: ['Python এর মূল ধারণাগুলো শিখবেন', 'OOP দিয়ে প্রোগ্রাম লিখবেন', 'File handling ও error handling করতে পারবেন', 'ছোট ছোট প্রজেক্ট তৈরি করবেন'],
    targetAudience: 'যারা একদম শুরু থেকে প্রোগ্রামিং শিখতে চান',
    certificate: true, liveClasses: false,
    chapters: [
      { id: 'ch1', title: 'Python পরিচিতি', order: 1, lessons: [
        { id: 'l1', title: 'Python কী ও কেন?', duration: '10:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Installation ও Setup', duration: '15:00', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'প্রথম প্রোগ্রাম', duration: '12:30', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'ভেরিয়েবল ও ডেটা টাইপ', order: 2, lessons: [
        { id: 'l4', title: 'Variables ও Strings', duration: '18:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'Numbers ও Operators', duration: '16:30', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l6', title: 'Lists ও Tuples', duration: '20:00', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'কন্ট্রোল ফ্লো', order: 3, lessons: [
        { id: 'l7', title: 'if-else Statements', duration: '17:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l8', title: 'Loops (for & while)', duration: '22:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch4', title: 'ফাংশন', order: 4, lessons: [
        { id: 'l9', title: 'Function তৈরি করা', duration: '19:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l10', title: 'Lambda ও Higher-Order Functions', duration: '21:30', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch5', title: 'OOP', order: 5, lessons: [
        { id: 'l11', title: 'Class ও Object', duration: '25:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l12', title: 'Inheritance ও Polymorphism', duration: '28:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
  },
  {
    id: 'c5', slug: 'web-development-full-stack',
    title: 'Web Development Full Stack',
    subtitle: 'HTML থেকে Next.js পর্যন্ত সম্পূর্ণ ওয়েব ডেভেলপমেন্ট',
    description: 'Front-end ও Back-end সহ সম্পূর্ণ Web Development শিখুন। HTML, CSS, JavaScript, React, Next.js, Node.js, ডেটাবেস — সব কিছু এক কোর্সে।',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 3500, originalPrice: 6000,
    category: 'Skills', subcategory: 'Web Development',
    language: 'bangla', level: 'beginner',
    tags: ['Web Development', 'HTML', 'CSS', 'JavaScript', 'React', 'Next.js'],
    instructorId: 'inst-3',
    totalLessons: 90, totalDuration: '80h 00m',
    rating: 4.9, reviews: 423, enrollments: 2340,
    badge: undefined, status: 'approved',
    commissionRate: 20, createdAt: '2023-01-10', updatedAt: '2024-04-01',
    requirements: ['Computer বা Laptop', 'শেখার ইচ্ছা', 'দৈনিক ২-৩ ঘণ্টা সময়'],
    whatYouLearn: ['HTML ও CSS দিয়ে ওয়েবসাইট বানাবেন', 'JavaScript দিয়ে ইন্টারেক্টিভ UI তৈরি করবেন', 'React ও Next.js শিখবেন', 'Database সংযুক্ত করতে পারবেন', 'Freelancing শুরু করতে পারবেন'],
    targetAudience: 'যারা ওয়েব ডেভেলপার হতে চান',
    certificate: true, liveClasses: true,
    chapters: [
      { id: 'ch1', title: 'HTML Fundamentals', order: 1, lessons: [
        { id: 'l1', title: 'HTML কী?', duration: '8:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Tags ও Elements', duration: '14:30', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'Forms ও Tables', duration: '18:00', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'CSS Styling', order: 2, lessons: [
        { id: 'l4', title: 'CSS Basics', duration: '16:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'Flexbox ও Grid', duration: '24:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'JavaScript', order: 3, lessons: [
        { id: 'l6', title: 'JS Fundamentals', duration: '20:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'DOM Manipulation', duration: '25:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l8', title: 'ES6+ Features', duration: '22:00', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch4', title: 'React', order: 4, lessons: [
        { id: 'l9', title: 'React Components', duration: '18:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l10', title: 'Hooks (useState, useEffect)', duration: '26:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch5', title: 'Next.js', order: 5, lessons: [
        { id: 'l11', title: 'App Router', duration: '20:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l12', title: 'API Routes', duration: '22:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch6', title: 'Database', order: 6, lessons: [
        { id: 'l13', title: 'MongoDB Basics', duration: '24:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch7', title: 'Deployment', order: 7, lessons: [
        { id: 'l14', title: 'Vercel Deployment', duration: '16:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch8', title: 'Projects', order: 8, lessons: [
        { id: 'l15', title: 'E-commerce Project', duration: '120:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
  },
  {
    id: 'c6', slug: 'bcs-preparation',
    title: 'BCS প্রস্তুতি সম্পূর্ণ কোর্স',
    subtitle: 'বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান সহ সম্পূর্ণ প্রস্তুতি',
    description: 'BCS প্রিলিমিনারি থেকে ভাইভা পর্যন্ত সম্পূর্ণ গাইড। পূর্ববর্তী প্রশ্নপত্র বিশ্লেষণ সহ।',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 1800, originalPrice: 3000,
    category: 'Professional', subcategory: 'BCS',
    language: 'bangla', level: 'intermediate',
    tags: ['BCS', 'সরকারি চাকরি', 'Preparation'],
    instructorId: 'inst-1', coachingCenterId: 'coaching-1',
    totalLessons: 72, totalDuration: '55h 30m',
    rating: 4.8, reviews: 298, enrollments: 1800,
    badge: 'Featured', status: 'approved',
    commissionRate: 20, createdAt: '2023-05-01', updatedAt: '2024-02-15',
    requirements: ['স্নাতক পর্যায়ের শিক্ষার্থী বা পাস করা', 'নিয়মিত পড়ার অভ্যাস'],
    whatYouLearn: ['BCS সিলেবাস সম্পর্কে জানবেন', 'দ্রুত উত্তর দেওয়ার কৌশল শিখবেন', 'পূর্বের প্রশ্ন বিশ্লেষণ করতে পারবেন', 'ভাইভার জন্য প্রস্তুত হবেন'],
    targetAudience: 'সরকারি চাকরিপ্রার্থী তরুণ-তরুণী',
    certificate: true, liveClasses: true,
    chapters: [
      { id: 'ch1', title: 'বাংলা ভাষা ও সাহিত্য', order: 1, lessons: [
        { id: 'l1', title: 'ভাষা আন্দোলন ও ইতিহাস', duration: '20:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'বাংলা সাহিত্যের যুগ', duration: '18:00', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'ব্যাকরণ ও বানান', duration: '22:00', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'English', order: 2, lessons: [
        { id: 'l4', title: 'Grammar Rules', duration: '25:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'Vocabulary Building', duration: '20:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'গণিত', order: 3, lessons: [
        { id: 'l6', title: 'পাটিগণিত', duration: '24:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'বীজগণিত', duration: '22:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch4', title: 'সাধারণ জ্ঞান', order: 4, lessons: [
        { id: 'l8', title: 'বাংলাদেশ বিষয়াবলী', duration: '30:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l9', title: 'আন্তর্জাতিক বিষয়াবলী', duration: '28:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch5', title: 'বিজ্ঞান ও প্রযুক্তি', order: 5, lessons: [
        { id: 'l10', title: 'সাধারণ বিজ্ঞান', duration: '26:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch6', title: 'মডেল টেস্ট', order: 6, lessons: [
        { id: 'l11', title: 'প্রিলিমিনারি মডেল টেস্ট ১', duration: '2h', type: 'quiz', isFree: false, order: 1 },
        { id: 'l12', title: 'প্রিলিমিনারি মডেল টেস্ট ২', duration: '2h', type: 'quiz', isFree: false, order: 2 },
      ]},
    ],
  },
  {
    id: 'c7', slug: 'english-speaking',
    title: 'ইংরেজিতে কথা বলা শিখুন',
    subtitle: 'দৈনন্দিন জীবনে English Speaking Confidence',
    description: 'লজ্জা ছাড়াই English বলুন! ব্যবহারিক পরিস্থিতিতে ইংরেজি বলার সহজ পদ্ধতি শিখুন।',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 600, originalPrice: 1200,
    category: 'Skills', subcategory: 'Language',
    language: 'bangla', level: 'beginner',
    tags: ['English Speaking', 'Communication', 'Confidence'],
    instructorId: 'inst-2',
    totalLessons: 30, totalDuration: '20h 00m',
    rating: 4.7, reviews: 145, enrollments: 980,
    badge: 'New', status: 'approved',
    commissionRate: 20, createdAt: '2023-11-01', updatedAt: '2024-03-10',
    requirements: ['Basic বাংলা জানা যথেষ্ট', 'Microphone সহ ডিভাইস'],
    whatYouLearn: ['ভয় ছাড়াই English বলতে পারবেন', 'সাধারণ কথোপকথন করতে পারবেন', 'Pronunciation উন্নত করবেন', 'Daily vocabulary বাড়াবেন'],
    targetAudience: 'যারা ইংরেজিতে কথা বলতে লজ্জা পান',
    certificate: true, liveClasses: false,
    chapters: [
      { id: 'ch1', title: 'Introduction', order: 1, lessons: [
        { id: 'l1', title: 'Why English Matters', duration: '10:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Overcoming Fear', duration: '12:00', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'Daily Conversation', order: 2, lessons: [
        { id: 'l3', title: 'Greetings ও Introductions', duration: '15:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l4', title: 'Shopping ও Restaurant', duration: '18:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'Office Communication', duration: '20:00', type: 'video', isFree: false, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch3', title: 'Advanced Speaking', order: 3, lessons: [
        { id: 'l6', title: 'Debate ও Discussion', duration: '22:00', type: 'video', isFree: false, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'Presentation Skills', duration: '25:00', type: 'video', isFree: false, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
  },
  {
    id: 'c8', slug: 'graphic-design-canva',
    title: 'Canva দিয়ে Graphic Design',
    subtitle: 'বিনামূল্যে শিখুন প্রফেশনাল Graphic Design',
    description: 'Canva ব্যবহার করে সুন্দর ডিজাইন তৈরি করুন। Social Media Post, Banner, Presentation — সব কিছু শিখুন বিনামূল্যে।',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&q=80',
    previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    price: 0,
    category: 'Creative', subcategory: 'Design',
    language: 'bangla', level: 'beginner',
    tags: ['Canva', 'Graphic Design', 'Free', 'Social Media'],
    instructorId: 'inst-3', coachingCenterId: 'coaching-2',
    totalLessons: 20, totalDuration: '15h 00m',
    rating: 4.6, reviews: 412, enrollments: 3500,
    badge: 'Free', status: 'approved',
    commissionRate: 0, createdAt: '2023-07-15', updatedAt: '2024-01-05',
    requirements: ['Canva account (বিনামূল্যে)', 'Smartphone বা Computer'],
    whatYouLearn: ['Canva ব্যবহার করতে পারবেন', 'Social Media Design করবেন', 'Logo তৈরি করবেন', 'Presentation বানাবেন'],
    targetAudience: 'যে কেউ যিনি ডিজাইন শিখতে চান',
    certificate: false, liveClasses: false,
    chapters: [
      { id: 'ch1', title: 'Canva Basics', order: 1, lessons: [
        { id: 'l1', title: 'Canva Account খোলা', duration: '8:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Interface পরিচিতি', duration: '10:00', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'Templates ব্যবহার', duration: '12:00', type: 'video', isFree: true, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 'ch2', title: 'Design Projects', order: 2, lessons: [
        { id: 'l4', title: 'Facebook Post Design', duration: '15:00', type: 'video', isFree: true, order: 1, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'Business Card Design', duration: '14:00', type: 'video', isFree: true, order: 2, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l6', title: 'Logo Design', duration: '18:00', type: 'video', isFree: true, order: 3, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l7', title: 'Presentation Slide', duration: '16:00', type: 'video', isFree: true, order: 4, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
  },
]

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categories = [
  { id: 'academic', name: 'Academic', bangla: 'একাডেমিক', icon: '📚', subcategories: ['SSC', 'HSC', 'University'] },
  { id: 'skills', name: 'Skills', bangla: 'দক্ষতা', icon: '💻', subcategories: ['Programming', 'Design', 'Language'] },
  { id: 'professional', name: 'Professional', bangla: 'প্রফেশনাল', icon: '💼', subcategories: ['BCS', 'Bank Job', 'IELTS'] },
  { id: 'creative', name: 'Creative', bangla: 'ক্রিয়েটিভ', icon: '🎨', subcategories: ['Art', 'Music', 'Photography'] },
]

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviews: Review[] = [
  { id: 'r1', studentId: 's1', studentName: 'আরিফ হোসেন', courseId: 'c1', rating: 5, comment: 'অসাধারণ কোর্স! রহিম স্যার এত সুন্দর করে বুঝিয়েছেন যে গণিত এখন আর কঠিন মনে হয় না।', createdAt: '2024-01-15' },
  { id: 'r2', studentId: 's2', studentName: 'সুমাইয়া বেগম', courseId: 'c4', rating: 5, comment: 'Python শেখা এত সহজ হবে ভাবিনি। করিম ভাই অনেক ভালো শেখান।', createdAt: '2024-02-10' },
  { id: 'r3', studentId: 's3', studentName: 'তানভীর আহমেদ', courseId: 'c3', rating: 4, comment: 'IELTS কোর্সটি অনেক ভালো। ফাতেমা ম্যাডামের Speaking টিপস কাজে লেগেছে।', createdAt: '2024-03-05' },
]

// ─── WITHDRAWAL REQUESTS ──────────────────────────────────────────────────────
export const withdrawalRequests: WithdrawalRequest[] = [
  { id: 'w1', userId: 'inst-1', userRole: 'instructor', amount: 10000, method: 'bkash', accountNumber: '01711-111111', accountName: 'Md Rahim Uddin', status: 'pending', requestedAt: '2024-06-01' },
  { id: 'w2', userId: 'coaching-1', userRole: 'coaching_center', amount: 25000, method: 'bank', accountNumber: '1234567890', accountName: 'Udayan Academy', status: 'approved', requestedAt: '2024-05-15', processedAt: '2024-05-20' },
  { id: 'w3', userId: 'inst-3', userRole: 'instructor', amount: 20000, method: 'nagad', accountNumber: '01733-333333', accountName: 'Karim Vai', status: 'pending', requestedAt: '2024-06-10' },
]

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
export function getCourse(slug: string): Course | undefined {
  return courses.find(c => c.slug === slug)
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id)
}

export function getCoursesByInstructor(instructorId: string): Course[] {
  return courses.filter(c => c.instructorId === instructorId)
}

export function getCoursesByCoachingCenter(coachingCenterId: string): Course[] {
  return courses.filter(c => c.coachingCenterId === coachingCenterId)
}

export function getFeaturedCourses(): Course[] {
  return courses.filter(c => c.badge === 'Featured' || c.badge === 'Bestseller').slice(0, 4)
}

export function getFreeCourses(): Course[] {
  return courses.filter(c => c.price === 0)
}

export function getInstructor(id: string): Instructor | undefined {
  return instructors.find(i => i.id === id)
}

export function getCoachingCenter(id: string): CoachingCenter | undefined {
  return coachingCenters.find(c => c.id === id)
}
