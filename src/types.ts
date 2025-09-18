export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  time: string;
  startDate: string;
  endDate: string;
  price: number;
  early_bird_price?: number;
  early_bird_deadline?: string;
  instructor: string;
  spotsAvailable: number;
  categories: string[];
  language: 'en' | 'de';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'draft' | 'archived' | 'deleted';
  learning_objectives?: string[];
  prerequisites?: string[];
  materials?: string[];
}

export interface Trainer {
  id: string;
  name: string;
  credentials: string;
  expertise: string[];
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface Attendee {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  specialRequirements?: string;
  courseId: string;
}