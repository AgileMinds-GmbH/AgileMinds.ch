import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Globe, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TestCase {
  id: string;
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
  category: 'filter' | 'search' | 'navigation' | 'booking';
}

interface TestResult {
  testId: string;
  passed: boolean;
  notes: string;
  timestamp: string;
}

interface CorsTestResult {
  success: boolean;
  message: string;
  details?: any;
}

const testCases: TestCase[] = [
  {
    id: 'filter-1',
    name: 'Price Range Filter',
    description: 'Test the price range filter functionality',
    category: 'filter',
    steps: [
      'Go to /courses page',
      'Open filters panel',
      'Set min price to 500',
      'Set max price to 1000',
      'Verify that only courses within price range are shown'
    ],
    expectedResult: 'Only courses with prices between 500 and 1000 should be displayed'
  },
  {
    id: 'filter-2',
    name: 'Language Filter',
    description: 'Test the language filter functionality',
    category: 'filter',
    steps: [
      'Go to /courses page',
      'Open filters panel',
      'Select "German" from language dropdown',
      'Verify that only German courses are shown'
    ],
    expectedResult: 'Only courses in German should be displayed'
  },
  {
    id: 'search-1',
    name: 'Course Search',
    description: 'Test the course search functionality',
    category: 'search',
    steps: [
      'Go to /courses page',
      'Enter "SAFe" in search bar',
      'Verify that only SAFe-related courses are shown'
    ],
    expectedResult: 'Only courses containing "SAFe" in title or description should be displayed'
  },
  {
    id: 'navigation-1',
    name: 'Course Details Modal',
    description: 'Test opening and closing course details',
    category: 'navigation',
    steps: [
      'Go to /courses page',
      'Click "Learn More" on any course',
      'Verify modal opens with correct course details',
      'Close modal',
      'Verify modal closes correctly'
    ],
    expectedResult: 'Course details modal should open and close smoothly'
  },
  {
    id: 'booking-1',
    name: 'Course Booking Flow',
    description: 'Test the complete booking process',
    category: 'booking',
    steps: [
      'Go to /courses page',
      'Click "Book Now" on any course',
      'Fill in test booking details',
      'Submit booking form',
      'Verify confirmation message',
      'Check admin panel for new booking'
    ],
    expectedResult: 'Booking should be created and confirmation shown'
  },
  {
    id: 'navigation-2',
    name: 'Load More Functionality',
    description: 'Test the load more courses button',
    category: 'navigation',
    steps: [
      'Go to /courses page',
      'Scroll to bottom',
      'Click "Load More"',
      'Verify additional courses are loaded',
      'Verify course count increases'
    ],
    expectedResult: 'Additional courses should be loaded and displayed'
  }
];

export default function AdminTesting() {
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [corsTestResult, setCorsTestResult] = useState<CorsTestResult | null>(null);
  const [corsTestLoading, setCorsTestLoading] = useState(false);

  const testCors = async () => {
    setCorsTestLoading(true);
    setCorsTestResult(null);
    
    try {
      const response = await fetch('/.netlify/functions/test-cors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ test: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setCorsTestResult({
        success: data.success,
        message: data.message || 'CORS test successful',
        details: data
      });
    } catch (error) {
      console.error('CORS test error:', error);
      setCorsTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'CORS test failed'
      });
    } finally {
      setCorsTestLoading(false);
    }
  };

  const categories = ['all', ...new Set(testCases.map(test => test.category))];

  const filteredTests = testCases.filter(test => 
    selectedCategory === 'all' || test.category === selectedCategory
  );

  const handleTestComplete = (passed: boolean) => {
    if (!selectedTest) return;

    const newResult: TestResult = {
      testId: selectedTest.id,
      passed,
      notes,
      timestamp: new Date().toISOString()
    };

    setTestResults(prev => [newResult, ...prev]);
    setNotes('');
    setSelectedTest(null);

    // Save test result to Supabase (if needed)
    // This is just a placeholder for future implementation
    console.log('Test result:', newResult);
  };

  const getTestStatus = (testId: string) => {
    const result = testResults.find(r => r.testId === testId);
    return result ? (result.passed ? 'passed' : 'failed') : 'pending';
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Frontend Testing</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manual test cases for frontend functionality
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                  ${selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* CORS Test Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                CORS Configuration Test
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Test if CORS is properly configured for the Netlify Functions
              </p>
            </div>
            <button
              onClick={testCors}
              disabled={corsTestLoading}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${corsTestLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
            >
              {corsTestLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Test CORS
                </>
              )}
            </button>
          </div>

          {corsTestResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              corsTestResult.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-start">
                {corsTestResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    corsTestResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {corsTestResult.message}
                  </h3>
                  {corsTestResult.details && (
                    <pre className="mt-2 text-sm overflow-auto max-h-48 p-2 rounded bg-gray-800 text-gray-100">
                      {JSON.stringify(corsTestResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <div
              key={test.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.name}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {test.category}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {getTestStatus(test.id) === 'passed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {getTestStatus(test.id) === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {test.description}
                </p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Steps:</h4>
                  <ol className="mt-2 space-y-2">
                    {test.steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Expected Result:</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {test.expectedResult}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTest(test)}
                  className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Execution Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedTest.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Steps:</h3>
                  <ol className="mt-2 space-y-2">
                    {selectedTest.steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Expected Result:</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedTest.expectedResult}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Test Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Add any notes about the test execution..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleTestComplete(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 inline-block mr-2" />
                    Failed
                  </button>
                  <button
                    onClick={() => handleTestComplete(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 inline-block mr-2" />
                    Passed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}