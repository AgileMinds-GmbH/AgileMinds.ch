import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Award, BookOpen } from 'lucide-react';
import Newsletter from '../components/Newsletter';
import FeaturedCoursesCarousel from '../components/FeaturedCoursesCarousel';
import { courses } from '../data/courses';

export default function Home() {
  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Flexible Learning',
      description: 'Weekend courses designed to fit your busy schedule'
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Certification',
      description: 'Earn recognized certificates upon course completion'
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Hands-on Projects',
      description: 'Apply your knowledge with real-world projects'
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Transform Your Career with Expert-Led Tech Training
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
              Join our intensive 2-day workshops and master the skills that drive innovation in today's digital world.
            </p>
            <div className="mt-10">
              <Link
                to="/courses"
                className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-50 transition-colors duration-200"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <p className="mt-4 text-xl text-gray-600">
              Explore our upcoming courses and start your learning journey
            </p>
          </div>

          <FeaturedCoursesCarousel courses={courses} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              What Our Students Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Thompson',
                role: 'Software Developer',
                image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=60',
                quote:
                  'The React Development course completely transformed my understanding of modern web development. Highly recommended!'
              },
              {
                name: 'Emily Chen',
                role: 'Data Analyst',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60',
                quote:
                  'The Data Science course provided practical skills that I use daily in my work. The instructors were exceptional.'
              },
              {
                name: 'Marcus Rodriguez',
                role: 'UX Designer',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
                quote:
                  'The UX/UI workshop helped me understand design principles deeply. It was intense but worth every minute.'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { number: '500+', label: 'Students Trained' },
                { number: '50+', label: 'Courses Completed' },
                { number: '95%', label: 'Satisfaction Rate' },
                { number: '80%', label: 'Career Advancement' }
              ].map((stat, index) => (
                <div key={index} className="p-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
