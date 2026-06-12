export const COLORS = {
  primary: "#06B6D4",
  secondary: "#2f69c7",
  accent: "#40c79a",
  success: "#40c79a",
} as const;

export const SITE_CONFIG = {
  name: "VisaHub",
  tagline: "Travel Anywhere With Confidence",
  description: "Compare, Apply and Track Visas for 150+ Countries",
  url: "https://visahub.com",
} as const;

export const NAV_LINKS = [
  { label: "Destinations", href: "/#destinations" },
  { label: "Visa Types", href: "/#visa-types" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const FOOTER_LINKS = {} as const;

export const DESTINATIONS = [
  {
    name: "United States",
    flag: "🇺🇸",
    description: "Explore the land of opportunity",
    processingTime: "5-10 business days",
    price: "From $160",
  },
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    description: "Experience British heritage",
    processingTime: "3-6 weeks",
    price: "From £100",
  },
  {
    name: "Schengen Area",
    flag: "🇪🇺",
    description: "Travel across 27 European countries",
    processingTime: "15 days",
    price: "From €80",
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    description: "Discover the Great White North",
    processingTime: "2-4 weeks",
    price: "From CAD $100",
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    description: "Adventure Down Under",
    processingTime: "4-6 weeks",
    price: "From AUD $145",
  },
  {
    name: "Japan",
    flag: "🇯🇵",
    description: "Where tradition meets future",
    processingTime: "5-7 business days",
    price: "From $30",
  },
] as const;

export const VISA_CATEGORIES = [
  {
    title: "Tourist Visa",
    description: "For leisure travel and sightseeing",
    icon: "Globe",
    color: "#06B6D4",
  },
  {
    title: "Business Visa",
    description: "For meetings, conferences, and work",
    icon: "Briefcase",
    color: "#2f69c7",
  },
  {
    title: "Student Visa",
    description: "For academic pursuits abroad",
    icon: "GraduationCap",
    color: "#40c79a",
  },
  {
    title: "Work Visa",
    description: "For employment opportunities",
    icon: "Building2",
    color: "#06B6D4",
  },
  {
    title: "Medical Visa",
    description: "For medical treatment abroad",
    icon: "HeartPulse",
    color: "#c7aa00",
  },
  {
    title: "Transit Visa",
    description: "For connecting flights",
    icon: "Plane",
    color: "#2f69c7",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Search & Compare",
    description: "Browse visa requirements for 150+ countries and compare processing times, fees, and documentation needs.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Apply Online",
    description: "Fill out a smart form that auto-saves your progress. Our AI assistant guides you through each step.",
    icon: "FileText",
  },
  {
    step: 3,
    title: "Upload Documents",
    description: "Upload and verify your documents with real-time validation and smart suggestions.",
    icon: "Upload",
  },
  {
    step: 4,
    title: "Track & Go",
    description: "Track your application in real-time and receive instant updates until you get your visa.",
    icon: "CheckCircle",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    location: "New York, USA",
    avatar: "SJ",
    text: "VisaHub made my visa application process incredibly smooth. Got my Schengen visa in just 5 days!",
    rating: 5,
  },
  {
    name: "James Chen",
    location: "Toronto, Canada",
    avatar: "JC",
    text: "The document checklist feature saved me from making costly mistakes. Highly recommended!",
    rating: 5,
  },
  {
    name: "Maria Garcia",
    location: "Madrid, Spain",
    avatar: "MG",
    text: "I applied for my UK visa through VisaHub and the tracking feature gave me peace of mind throughout.",
    rating: 5,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How long does the visa application process take?",
    answer: "Processing times vary by country and visa type. Typically, tourist visas take 5-15 business days, while student and work visas may take 4-8 weeks. Our platform provides real-time estimates for each application.",
  },
  {
    question: "What documents do I need to apply for a visa?",
    answer: "Required documents vary by destination and visa type. Common requirements include a valid passport, recent photographs, proof of accommodation, travel itinerary, bank statements, and travel insurance. Our platform provides a personalized checklist based on your specific needs.",
  },
  {
    question: "Can I track my visa application status?",
    answer: "Yes! VisaHub provides real-time tracking for all applications. You'll receive instant updates via email and SMS, and you can check your application status anytime through your dashboard.",
  },
  {
    question: "What happens if my visa is rejected?",
    answer: "If your visa is rejected, our team will review your application to identify areas for improvement. We offer guidance on reapplying and can help you address the reasons for rejection to strengthen your new application.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use bank-grade encryption (256-bit SSL) to protect your data. We are fully compliant with GDPR and data protection regulations. Your information is never shared with third parties without your explicit consent.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a transparent refund policy. Government visa fees are non-refundable, but our service fees are refundable as per our terms. Contact our support team for specific cases.",
  },
] as const;

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "#", icon: "Facebook" },
  { name: "Twitter", href: "#", icon: "Twitter" },
  { name: "Instagram", href: "#", icon: "Instagram" },
  { name: "LinkedIn", href: "#", icon: "Linkedin" },
] as const;
