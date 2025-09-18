import React from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { trainers } from '../data/trainers';

export default function Team() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Meet Our Team</h1>
          <p className="mt-4 text-xl text-gray-600">
            Learn from industry experts with years of real-world experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {trainer.name}
                </h2>
                <p className="text-indigo-600 font-medium mb-4">
                  {trainer.credentials}
                </p>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{trainer.bio}</p>

                <div className="flex space-x-4">
                  {trainer.social.linkedin && (
                    <a
                      href={trainer.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {trainer.social.twitter && (
                    <a
                      href={trainer.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {trainer.social.github && (
                    <a
                      href={trainer.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}