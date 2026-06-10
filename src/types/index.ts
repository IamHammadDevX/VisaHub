export interface Destination {
  name: string;
  flag: string;
  description: string;
  processingTime: string;
  price: string;
}

export interface VisaCategory {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  location: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}
