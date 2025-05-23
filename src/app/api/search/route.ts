import { NextResponse } from 'next/server';

// Function to search using SerpApi for news results
async function searchWithSerpApi(query: string, numResults: number = 5): Promise<any[]> {
  try {
    const apiKey = process.env.SERP_API_KEY;
    
    if (!apiKey) {
      console.error('SERPAPI_KEY environment variable is not set');
      throw new Error('Search API configuration error');
    }
    
    // Append "news" to the query to focus on news results
    const newsQuery = `${query} news recent`;
    
    // Call SerpApi Google News search
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(newsQuery)}&tbm=nws&api_key=${apiKey}&num=${numResults}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from SerpApi');
    }
    
    const data = await response.json();
    console.log(data);
    const results = [];
    
    // Process news results
    if (data.news_results && data.news_results.length > 0) {
      for (let i = 0; i < Math.min(numResults, data.news_results.length); i++) {
        const article = data.news_results[i];
        results.push({
          title: article.title || 'News Article',
          body: article.snippet || article.title,
          source: article.source || 'News Source'
        });
      }
    }
    
    // If no news results, try organic results as fallback
    if (results.length === 0 && data.organic_results && data.organic_results.length > 0) {
      for (let i = 0; i < Math.min(numResults, data.organic_results.length); i++) {
        const result = data.organic_results[i];
        results.push({
          title: result.title || 'Search Result',
          body: result.snippet || result.title,
          source: new URL(result.link).hostname || 'Web Source'
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error searching with SerpApi:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    const results = await searchWithSerpApi(query);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in search route:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
} 