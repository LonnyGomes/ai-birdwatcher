import { logger } from '../utils/logger.js';

interface WikipediaPageInfo {
  imageUrl: string | null;
  pageUrl: string | null;
  description: string | null;
}

export class WikipediaService {
  private readonly WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';

  /**
   * Fetch Wikipedia image and info for a bird species
   * Tries both scientific name and common name
   */
  async fetchSpeciesInfo(species: string, commonName?: string): Promise<WikipediaPageInfo> {
    // Try scientific name first (usually more accurate)
    let result = await this.fetchPageInfo(species);

    // If no image found and we have a common name, try that
    if (!result.imageUrl && commonName) {
      result = await this.fetchPageInfo(commonName);
    }

    // Try with " (bird)" suffix if still no luck
    if (!result.imageUrl) {
      result = await this.fetchPageInfo(`${species} (bird)`);
    }

    if (!result.imageUrl && commonName) {
      result = await this.fetchPageInfo(`${commonName} (bird)`);
    }

    return result;
  }

  /**
   * Fetch page info from Wikipedia API
   */
  private async fetchPageInfo(searchTerm: string): Promise<WikipediaPageInfo> {
    try {
      // First, search for the page to get the exact title
      const searchParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: searchTerm,
        srlimit: '1',
        origin: '*',
      });

      const searchResponse = await fetch(`${this.WIKIPEDIA_API_BASE}?${searchParams}`);
      if (!searchResponse.ok) {
        logger.warn(`Wikipedia search failed for "${searchTerm}": ${searchResponse.status}`);
        return { imageUrl: null, pageUrl: null, description: null };
      }

      const searchData = await searchResponse.json() as { query?: { search?: Array<{ title: string }> } };
      const searchResults = searchData.query?.search;

      if (!searchResults || searchResults.length === 0) {
        logger.debug(`No Wikipedia results found for "${searchTerm}"`);
        return { imageUrl: null, pageUrl: null, description: null };
      }

      const pageTitle = searchResults[0].title;
      const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;

      // Now fetch the page image
      const imageParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: pageTitle,
        prop: 'pageimages|extracts',
        pithumbsize: '500',
        exintro: 'true',
        explaintext: 'true',
        exsentences: '2',
        origin: '*',
      });

      const imageResponse = await fetch(`${this.WIKIPEDIA_API_BASE}?${imageParams}`);
      if (!imageResponse.ok) {
        logger.warn(`Wikipedia page fetch failed for "${pageTitle}": ${imageResponse.status}`);
        return { imageUrl: null, pageUrl, description: null };
      }

      interface WikiPage {
        thumbnail?: { source: string };
        extract?: string;
      }

      const imageData = await imageResponse.json() as { query?: { pages?: Record<string, WikiPage> } };
      const pages = imageData.query?.pages;

      if (!pages) {
        return { imageUrl: null, pageUrl, description: null };
      }

      const page = Object.values(pages)[0];
      const imageUrl = page.thumbnail?.source || null;
      const description = page.extract || null;

      if (imageUrl) {
        logger.info(`Found Wikipedia image for "${searchTerm}": ${imageUrl}`);
      }

      return { imageUrl, pageUrl, description };
    } catch (error) {
      logger.error(`Error fetching Wikipedia info for "${searchTerm}":`, error);
      return { imageUrl: null, pageUrl: null, description: null };
    }
  }

  /**
   * Get a higher resolution version of a Wikipedia thumbnail URL
   */
  getHighResImageUrl(thumbnailUrl: string, width: number = 800): string {
    // Wikipedia thumbnail URLs contain size info like /500px-
    // We can request a larger size by changing this value
    return thumbnailUrl.replace(/\/\d+px-/, `/${width}px-`);
  }
}

export const wikipediaService = new WikipediaService();
