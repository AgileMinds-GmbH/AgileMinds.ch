import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Set common CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Max-Age': '86400'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'ok' })
    };
  }

  try {
    // Parse request body if present
    let requestBody: Record<string, unknown> = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        console.error('Error parsing request body:', error);
        throw new Error('Invalid JSON in request body');
      }
    }

    // Prepare response data
    const responseData = {
      success: true,
      message: 'CORS test successful',
      timestamp: new Date().toISOString(),
      request: {
        method: event.httpMethod,
        path: event.path,
        headers: {
          origin: event.headers.origin || event.headers.Origin || 'not provided',
          'content-type': event.headers['content-type'] || event.headers['Content-Type'] || 'not provided'
        },
        body: requestBody
      },
      cors: {
        enabled: true,
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
      }
    };

    // Return successful response
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    // Handle any unexpected errors
    console.error('CORS test error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'CORS test failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      })
    };
  }
};