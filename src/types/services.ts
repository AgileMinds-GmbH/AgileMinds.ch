export interface Service {
    icon: string;
    image: string;
    title: string;
    description: string;
    features: string[];
    category: string;
    cta: {
        text: string;
        link: string;
    };
}

export interface GetServiceListRequest {
  page?: number;
  limit?: number;
}
