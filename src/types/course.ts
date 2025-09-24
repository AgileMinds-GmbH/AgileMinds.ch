export interface Course {
  _id: any;
  skill_level: "beginner" | "intermediate" | "advanced";
  meta_keywords: never[];
  spots_available: any;
  instructor_id: string;
  end_date: any;
  start_date: any;
  end_time: any;
  start_time: any;
  early_bird_deadline: any;
  early_bird_price: any;
  learning_objectives: never[];
  logo_url: string;
  thumbnail_url: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  duration?: string;
  instructor?: string;
  spotsAvailable?: number;
  categories?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  startDate?: string;
  endDate?: string;
  price?: number | undefined;
  language?: string;
  status?: 'draft' | 'published' | 'archived' | 'published' | 'unpublished' | 'expired' | 'deleted';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  publishedAt?: string;
  version?: number;
  isLatest?: boolean;
  learningObjectives?: string[];
  prerequisites?: string[];
  materials?: string[];
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  time?: string | undefined;
}

export interface GetCourseListRequest {
  page?: number;
  limit?: number;
}


export interface BookingFormData {
  tickets: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequirements: string;
}
