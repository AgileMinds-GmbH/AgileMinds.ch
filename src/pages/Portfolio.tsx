import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Layout, Database, Cloud, Shield, Smartphone, Lightbulb, Rocket } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
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

const services: Service[] = [
  {
    icon: <Code className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop&q=80',
    title: "Custom Software Development",
    description: "End-to-end development of custom software solutions tailored to your business needs.",
    features: [
      "Full-stack web applications",
      "Enterprise software solutions",
      "API development and integration",
      "Legacy system modernization"
    ],
    category: "Development",
    cta: {
      text: "Start Your Project",
      link: "/contact"
    }
  },
  {
    icon: <Layout className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop&q=80',
    title: "UI/UX Design",
    description: "Creating intuitive and engaging user experiences that drive results.",
    features: [
      "User interface design",
      "User experience optimization",
      "Design system creation",
      "Responsive web design"
    ],
    category: "Design",
    cta: {
      text: "Design Consultation",
      link: "/contact"
    }
  },
  {
    icon: <Database className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&q=80',
    title: "Data Analytics",
    description: "Transform your data into actionable insights with our analytics solutions.",
    features: [
      "Business intelligence",
      "Data visualization",
      "Predictive analytics",
      "Custom reporting solutions"
    ],
    category: "Analytics",
    cta: {
      text: "Analyze Your Data",
      link: "/contact"
    }
  },
  {
    icon: <Cloud className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&q=80',
    title: "Cloud Solutions",
    description: "Scalable and secure cloud infrastructure for modern businesses.",
    features: [
      "Cloud migration",
      "Infrastructure optimization",
      "DevOps implementation",
      "24/7 monitoring"
    ],
    category: "Infrastructure",
    cta: {
      text: "Cloud Consultation",
      link: "/contact"
    }
  },
  {
    icon: <Shield className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=450&fit=crop&q=80',
    title: "Cybersecurity",
    description: "Protect your digital assets with our comprehensive security solutions.",
    features: [
      "Security audits",
      "Penetration testing",
      "Compliance consulting",
      "Security training"
    ],
    category: "Security",
    cta: {
      text: "Secure Your Business",
      link: "/contact"
    }
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&q=80',
    title: "Mobile Development",
    description: "Native and cross-platform mobile applications for iOS and Android.",
    features: [
      "iOS development",
      "Android development",
      "Cross-platform solutions",
      "Mobile app maintenance"
    ],
    category: "Development",
    cta: {
      text: "Build Your App",
      link: "/contact"
    }
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=450&fit=crop&q=80',
    title: "Digital Innovation",
    description: "Strategic consulting to drive digital transformation and innovation.",
    features: [
      "Digital strategy",
      "Process automation",
      "Innovation workshops",
      "Technology roadmap"
    ],
    category: "Consulting",
    cta: {
      text: "Innovate Now",
      link: "/contact"
    }
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&q=80',
    title: "Product Development",
    description: "End-to-end product development from concept to launch.",
    features: [
      "Product strategy",
      "MVP development",
      "Product scaling",
      "Market validation"
    ],
    category: "Development",
    cta: {
      text: "Launch Your Product",
      link: "/contact"
    }
  }
];

const categories = Array.from(new Set(services.map(service => service.category)));

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const filteredServices = selectedCategory
    ? services.filter(service => service.category === selectedCategory)
    : services;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
          <p className="mt-4 text-xl text-gray-600">
            Comprehensive solutions to drive your business forward
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${!selectedCategory
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All Services
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <div
              key={service.title}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
            >
              <Link
                to={service.cta.link}
                className="block relative group"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.image}
                    alt={`${service.title} service illustration`}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-indigo-600 shadow-lg">
                  {service.icon}
                  </div>
                </div>
              </Link>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={service.cta.link}
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {service.cta.text}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}