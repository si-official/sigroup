import { Course } from './types'

export const courses: Course[] = [
  {
    id: '1', slug: 'web-development-bangla',
    title: 'Web Development with Next.js',
    subtitle: 'বাংলায় শিখুন Modern Web Development',
    description: 'Next.js, React, Tailwind CSS দিয়ে প্রফেশনাল ওয়েবসাইট বানান। একদম শুরু থেকে শেখানো হবে।',
    instructor: 'MD. Shahidul Islam', instructorTitle: 'Senior Software Engineer, SI Group',
    category: 'Web Development', level: 'Beginner', language: 'বাংলা',
    price: 1500, originalPrice: 3000,
    thumbnail: '/courses/nextjs.png',
    rating: 4.9, students: 1240, totalLessons: 42, totalHours: '18h 30m',
    badge: 'Best Seller',
    objectives: ['React & Next.js App Router শিখবেন', 'Tailwind CSS দিয়ে UI বানাবেন', 'API Route তৈরি করতে পারবেন', 'Deployment করতে পারবেন'],
    requirements: ['Basic HTML/CSS জানতে হবে', 'Computer ও Internet সংযোগ'],
    sections: [
      { id: 's1', title: 'Getting Started', lessons: [
        { id: 'l1', title: 'Course Introduction', duration: '5:20', type: 'video', free: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Setup Development Environment', duration: '12:45', type: 'video', free: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l3', title: 'Next.js কী ও কেন?', duration: '8:10', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 's2', title: 'React Fundamentals', lessons: [
        { id: 'l4', title: 'Components ও Props', duration: '15:30', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l5', title: 'useState ও useEffect', duration: '20:15', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l6', title: 'Section Quiz', duration: '10 min', type: 'quiz' },
      ]},
      { id: 's3', title: 'Tailwind CSS', lessons: [
        { id: 'l7', title: 'Tailwind Installation', duration: '7:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l8', title: 'Responsive Design', duration: '18:40', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
    quiz: [
      { id: 'q1', question: 'Next.js কোন কোম্পানি তৈরি করেছে?', options: ['Facebook', 'Google', 'Vercel', 'Microsoft'], correctIndex: 2, explanation: 'Next.js তৈরি করেছে Vercel (আগের নাম Zeit)।' },
      { id: 'q2', question: 'React এ State পরিবর্তন করতে কোনটি ব্যবহার করা হয়?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correctIndex: 1, explanation: 'useState hook দিয়ে component এর state manage করা হয়।' },
      { id: 'q3', question: 'Tailwind CSS কোন ধরনের framework?', options: ['Component-based', 'Utility-first', 'Block-based', 'Grid-only'], correctIndex: 1, explanation: 'Tailwind CSS হলো utility-first CSS framework।' },
      { id: 'q4', question: 'Next.js এর App Router কোন version থেকে introduce হয়েছে?', options: ['Next.js 10', 'Next.js 12', 'Next.js 13', 'Next.js 11'], correctIndex: 2, explanation: 'App Router Next.js 13 তে introduce হয়েছে।' },
    ],
  },
  {
    id: '2', slug: 'python-data-science',
    title: 'Python for Data Science',
    subtitle: 'Data Analysis ও Machine Learning শিখুন',
    description: 'Python দিয়ে Data Science শিখুন। Pandas, NumPy, Matplotlib ও Scikit-learn শেখানো হবে।',
    instructor: 'Dr. Rafiqul Islam', instructorTitle: 'Data Scientist, BUET Alumni',
    category: 'Data Science', level: 'Intermediate', language: 'বাংলা',
    price: 2000, originalPrice: 4000,
    thumbnail: '/courses/python.png',
    rating: 4.8, students: 856, totalLessons: 56, totalHours: '24h 15m',
    badge: 'New',
    objectives: ['Python দিয়ে Data Analysis করতে পারবেন', 'Machine Learning Model তৈরি করতে পারবেন', 'Data Visualization করতে পারবেন'],
    requirements: ['Basic Python জানতে হবে', 'Mathematics এর ধারণা থাকতে হবে'],
    sections: [
      { id: 's1', title: 'Python Basics Review', lessons: [
        { id: 'l1', title: 'Python Setup & Jupyter', duration: '10:00', type: 'video', free: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Lists, Dicts & Functions', duration: '22:30', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
      { id: 's2', title: 'Pandas & NumPy', lessons: [
        { id: 'l3', title: 'DataFrame Operations', duration: '35:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l4', title: 'Data Cleaning', duration: '28:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
    quiz: [
      { id: 'q1', question: 'Pandas এ DataFrame তৈরি করতে কোন method ব্যবহার হয়?', options: ['pd.Array()', 'pd.DataFrame()', 'pd.Table()', 'pd.Matrix()'], correctIndex: 1, explanation: 'pd.DataFrame() দিয়ে DataFrame তৈরি করা হয়।' },
      { id: 'q2', question: 'NumPy array এর shape কীভাবে জানা যায়?', options: ['array.size', 'array.length', 'array.shape', 'array.dim'], correctIndex: 2, explanation: 'array.shape property দিয়ে NumPy array এর dimension জানা যায়।' },
    ],
  },
  {
    id: '3', slug: 'graphic-design-illustrator',
    title: 'Graphic Design with Illustrator',
    subtitle: 'Logo, Branding ও Print Design শিখুন',
    description: 'Adobe Illustrator দিয়ে প্রফেশনাল Graphic Design শিখুন। Freelancing শুরু করুন।',
    instructor: 'Nusrat Jahan', instructorTitle: 'Creative Director, SI Design Studio',
    category: 'Design', level: 'Beginner', language: 'বাংলা',
    price: 1200, originalPrice: 2500,
    thumbnail: '/courses/design.png',
    rating: 4.7, students: 2100, totalLessons: 38, totalHours: '16h 00m',
    badge: 'Popular',
    objectives: ['Logo Design করতে পারবেন', 'Brand Identity তৈরি করতে পারবেন', 'Freelancing শুরু করতে পারবেন'],
    requirements: ['কোনো পূর্ব অভিজ্ঞতা লাগবে না', 'Adobe Illustrator installed থাকতে হবে'],
    sections: [
      { id: 's1', title: 'Illustrator Interface', lessons: [
        { id: 'l1', title: 'Interface Tour', duration: '8:00', type: 'video', free: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 'l2', title: 'Basic Tools', duration: '14:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ]},
    ],
    quiz: [
      { id: 'q1', question: 'Vector graphics এর সুবিধা কী?', options: ['Smaller file size', 'Scalable without quality loss', 'More colors', 'Faster loading'], correctIndex: 1, explanation: 'Vector graphics যেকোনো size এ quality না হারিয়ে scale করা যায়।' },
    ],
  },
]

export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug)
}

export const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Business', 'Language']
