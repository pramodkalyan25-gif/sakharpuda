// ============================================================
// Wizard step constants & dropdown data — Shaadi.com style
// ============================================================

export const PROFILE_FOR_OPTIONS = [
  'Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'My Friend', 'My Relative',
];

export const RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other',
];

export const MARITAL_STATUSES = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
];

export const HEIGHTS = (() => {
  const list = [];
  for (let ft = 4; ft <= 7; ft++) {
    for (let inch = 0; inch <= 11; inch++) {
      const cm = Math.round((ft * 12 + inch) * 2.54);
      list.push({ value: cm, label: `${ft}ft ${inch}in - ${cm}cm` });
      if (ft === 7 && inch === 0) break;
    }
  }
  return list;
})();

export const DIETS = [
  'Veg', 'Non-Veg', 'Occasionally Non-Veg', 'Eggetarian', 'Jain', 'Vegan',
];

export const EDUCATIONS = [
  'High School', 'Diploma', 'B.A', 'B.Sc', 'B.Com', 'B.E / B.Tech', 'BBA', 'BCA',
  'MBBS', 'BDS', 'LLB', 'M.A', 'M.Sc', 'M.Com', 'M.E / M.Tech', 'MBA', 'MCA',
  'MD / MS', 'PhD', 'CA', 'CS', 'Other',
];

export const COMPANY_TYPES = [
  'Private Company', 'Government / Public Sector', 'Defence / Civil Services',
  'Business / Self Employed', 'Not Working', 'Other',
];

export const PROFESSIONS = [
  'Software Developer / Programmer', 'Doctor', 'Engineer', 'Teacher / Professor',
  'Chartered Accountant', 'Lawyer', 'Manager', 'Business Analyst',
  'Civil Services / IAS / IPS', 'Scientist', 'Architect', 'Designer',
  'Marketing Professional', 'Banking Professional', 'HR Professional',
  'Sr. Manager / Manager', 'Others',
];

export const INCOME_RANGES = [
  'No Income', 'Upto ₹ 1 Lakh yearly', '₹ 1 to 2 Lakh yearly', '₹ 2 to 4 Lakh yearly',
  '₹ 4 to 7 Lakh yearly', '₹ 7 to 10 Lakh yearly', '₹ 10 to 15 Lakh yearly',
  '₹ 15 to 20 Lakh yearly', '₹ 20 to 30 Lakh yearly', '₹ 30 to 50 Lakh yearly',
  '₹ 50 Lakh to 1 Crore yearly', '₹ 1 Crore & above yearly',
];

export const MOTHER_TONGUES = [
  'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali',
  'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Konkani', 'Sindhi',
  'Rajasthani', 'Bhojpuri', 'Tulu', 'English', 'Other',
];

export const FAMILY_OCCUPATIONS = [
  'Employed', 'Business / Entrepreneur', 'Retired', 'Homemaker', 'Not Employed', 'Passed Away',
];

export const FAMILY_FINANCIAL_STATUSES = [
  {
    value: 'elite',
    label: 'Elite',
    desc: 'Family owns large businesses or holds executive positions. Annual income above 1 Crore.',
  },
  {
    value: 'high',
    label: 'High',
    desc: 'Family is well-established with senior professional roles. Annual income 30 lakhs - 1 Crore.',
  },
  {
    value: 'middle',
    label: 'Middle',
    desc: 'Family runs a small business or have office jobs. Family owns a vehicle, house & some assets. Annual family income is 10-30 lakhs.',
  },
  {
    value: 'aspiring',
    label: 'Aspiring',
    desc: 'Family is working towards building a comfortable lifestyle.',
  },
];

export const HOBBIES = {
  Creative: [
    'Writing', 'Cooking', 'Singing', 'Photography', 'Playing instruments',
    'Painting', 'DIY crafts', 'Dancing', 'Acting', 'Poetry',
    'Gardening', 'Blogging', 'Content creation', 'Designing', 'Doodling',
  ],
  Fun: [
    'Movies', 'Music', 'Travelling', 'Reading', 'Sports',
    'Social media', 'Gaming', 'Binge-watching', 'Biking', 'Clubbing',
    'Shopping', 'Theater & Events', 'Anime', 'Stand ups',
  ],
  Fitness: [
    'Running', 'Cycling', 'Yoga & Meditation', 'Walking',
    'Gym', 'Swimming', 'Cricket', 'Badminton', 'Football',
  ],
};

export const SUB_COMMUNITIES = {
  Hindu: [
    'Brahmin', 'Kshatriya', 'Vaishya', 'Maratha', '96 Kuli Maratha', 'Kunbi',
    'Rajput', 'Jat', 'Patel', 'Reddy', 'Naidu', 'Nair', 'Lingayat', 'Vokkaliga',
    'Agarwal', 'Kayastha', 'Khatri', 'Bania', 'Gowda', 'Other',
  ],
  Muslim: ['Sunni', 'Shia', 'Bohra', 'Khoja', 'Pathan', 'Syed', 'Sheikh', 'Mughal', 'Other'],
  Christian: ['Roman Catholic', 'Protestant', 'Syrian Catholic', 'Syrian Orthodox', 'CSI', 'Other'],
  Sikh: ['Jat Sikh', 'Khatri Sikh', 'Ramgarhia', 'Arora', 'Saini', 'Other'],
  Jain: ['Digambar', 'Shwetambar', 'Other'],
  Buddhist: ['Mahayana', 'Theravada', 'Neo Buddhist', 'Other'],
  Parsi: ['Parsi', 'Irani', 'Other'],
  Other: ['Other'],
};
