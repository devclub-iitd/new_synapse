// src/utils/constants.js

export const DEPARTMENTS = [
  "Applied Mechanics",
  "Biochemical Engineering and Biotechnology",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computer Science and Engineering",
  "Design",
  "Electrical Engineering",
  "Energy Science and Engineering",
  "Humanities and Social Sciences",
  "Management Studies",
  "Materials Science and Engineering",
  "Mathematics",
  "Mechanical Engineering",
  "Physics",
  "Textile and Fibre Engineering"
];

export const HOSTELS = [
  "Aravali", "Dronagiri", "Girnar", "Himadri", "Jwalamukhi", "Kailash", "Karakoram", 
  "Kumaon", "Nalanda", "Nilgiri", "Satpura", "Sahyadri", "Saptagiri", "Shivalik", 
  "Udaigiri", "Vindhyachal", "Zanskar", "Dayscholar"
];


export const YEARS = [1, 2, 3, 4, 5];

// Org types (must match backend enums)

export const ORG_TYPES = [
  { label: "Club", value: "club" },
  { label: "Board", value: "board" },
  { label: "Society", value: "society" },
  { label: "Fest", value: "fest" },
  { label: "Sport", value: "sport" },
  { label: "Department", value: "department" }
];

// src/utils/constants.js

export const HEAD_ROLES = [
  "overall coordinator",
  "president",
  "general secretary",
  "vice president",
  "deputy general secretary",
  "secretary",
  "convener"
];

export const TEAM_ROLES = [
  "team head",
  "achead",
  "coordinator",
  "executive"
];

export const ALL_ROLES = [...HEAD_ROLES, ...TEAM_ROLES];

// Master list of all organizations (Matches backend OrgName enum)
export const ALL_ORGS = {
  "club": [
    "devclub", "robotics club", "aeromodelling club", "business and consulting club", 
    "economics club", "physics and astronomy club", "algorithms and computing club", 
    "aries", "igem", "hyperloop club", "indian game theory society", "blockchain society",
    "axlr8r formula racing", "music club", "dance club", "dramatics club", 
    "literary club", "debating club", "photography and films club", 
    "fine arts and crafts club", "design club", "quizzing club", 
    "hindi samiti", "spic macay", "envogue", "indradhanu"
  ],
  "board": [
    "student affairs council", "board for hostel management", "board for student welfare",
    "board for sports activities", "board for recreational and creative activities", 
    "board for student publications", "co-curricular and academic interaction council"
  ],
  "society": [
    "mathsoc", "aces acm", "beta", "mses", "cef", "mes", "ches", "energy society",
    "physoc", "ees", "tes", "chemocronies"
  ],
  "fest": ["rendezvous", "tryst", "becon", "literati", "sportech"],
  "sport": [
    "aquatics", "athletics", "badminton", "basketball", "chess", "cricket",
    "football", "hockey", "lawn tennis", "squash", "table tennis", "volleyball", "weightlifting"
  ],
  "department": [
    "applied mechanics", "biochemical engineering and biotechnology", "chemical engineering",
    "chemistry", "civil engineering", "computer science and engineering", "design",
    "electrical engineering", "energy science and engineering", "humanities and social sciences",
    "management studies", "materials science and engineering", "mathematics",
    "mechanical engineering", "physics", "textile and fibre engineering"
  ]
};

// ─── GENRES / INTERESTS ────────────────────────────────
export const GENRES = [
  "AI & Machine Learning",
  "Web Development",
  "App Development",
  "Competitive Programming",
  "Cyber Security",
  "Blockchain & Web3",
  "Data Science",
  "Cloud Computing",
  "IoT",
  "Robotics",
  "Aeromodelling",
  "Electronics",
  "Astronomy",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology & Biotech",
  "Economics & Finance",
  "Consulting",
  "Entrepreneurship",
  "Game Theory",
  "Music",
  "Dance",
  "Drama & Theatre",
  "Photography",
  "Film Making",
  "Fine Arts",
  "Design & UI/UX",
  "Fashion",
  "Literature & Poetry",
  "Debating",
  "Public Speaking",
  "Quizzing",
  "Hindi & Regional Languages",
  "Writing & Journalism",
  "Cricket",
  "Football",
  "Basketball",
  "Badminton",
  "Table Tennis",
  "Chess",
  "Athletics",
  "Swimming",
  "Volleyball",
  "Squash",
  "Hockey",
  "Weightlifting",
  "Yoga & Fitness",
  "Environment & Sustainability",
  "Social Service",
  "Mental Health & Wellness",
  "Gaming & Esports",
  "Open Source",
  "Research & Innovation",
];

// High-level genre categories for the home page
export const GENRE_CATEGORIES = [
  {
    name: "Tech",
    icon: "Monitor",
    color: "#8b5cf6",
    genres: ["AI & Machine Learning", "Web Development", "App Development", "Competitive Programming", "Cyber Security", "Blockchain & Web3", "Data Science", "Cloud Computing", "IoT", "Open Source"],
  },
  {
    name: "Science",
    icon: "FlaskConical",
    color: "#06b6d4",
    genres: ["Robotics", "Aeromodelling", "Electronics", "Astronomy", "Physics", "Mathematics", "Chemistry", "Biology & Biotech", "Research & Innovation"],
  },
  {
    name: "Music & Arts",
    icon: "Music",
    color: "#ec4899",
    genres: ["Music", "Dance", "Drama & Theatre", "Fine Arts", "Fashion"],
  },
  {
    name: "Media",
    icon: "Camera",
    color: "#f59e0b",
    genres: ["Photography", "Film Making", "Design & UI/UX", "Writing & Journalism"],
  },
  {
    name: "Literary",
    icon: "BookOpen",
    color: "#10b981",
    genres: ["Literature & Poetry", "Debating", "Public Speaking", "Quizzing", "Hindi & Regional Languages"],
  },
  {
    name: "Sports",
    icon: "Trophy",
    color: "#ef4444",
    genres: ["Cricket", "Football", "Basketball", "Badminton", "Table Tennis", "Chess", "Athletics", "Swimming", "Volleyball", "Squash", "Hockey", "Weightlifting", "Yoga & Fitness"],
  },
  {
    name: "Business",
    icon: "Briefcase",
    color: "#6366f1",
    genres: ["Economics & Finance", "Consulting", "Entrepreneurship", "Game Theory"],
  },
  {
    name: "Lifestyle",
    icon: "Leaf",
    color: "#14b8a6",
    genres: ["Environment & Sustainability", "Social Service", "Mental Health & Wellness", "Gaming & Esports"],
  },
];