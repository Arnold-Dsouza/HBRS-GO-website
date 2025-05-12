/**
 * Represents an allergen.
 */
export interface Allergen {
  id: string;
  name: string;
}

/**
 * Represents an additive.
 */
export interface Additive {
  id: string;
  name: string;
}

/**
 * Represents a cafeteria menu item.
 */
export interface MenuItem {
  category: string;
  name: string;
  description?: string;
  prices: { // Added prices
    student: number;
    staff: number;
    guest: number;
  };
  allergens: Allergen[];
  additives: Additive[];
  isVegetarian: boolean;
  isVegan: boolean;
  co2Score?: number; // Optional CO2 score
}

/**
 * Represents a cafeteria menu for a specific day.
 */
export interface Menu {
  /**
   * The date for which the menu is valid.
   */
  date: string;
  /**
   * An array of menu items available on this day.
   */
  items: MenuItem[];
  /**
   * Optional error message if menu fetching failed or no menu is available.
   */
  errorMessage?: string;
}

/**
 * Parameters for fetching cafeteria menu data.
 */
export interface MensaParams {
  mensa?: string;
  lang?: string;
  date?: string;
  filterCategories?: string[];
  showAllAllergens?: boolean;
  showAdditives?: boolean;
  showAllPrices?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  markdown?: boolean;
}

/**
 * JSON response structure from the Python mensa script
 */
export interface MensaJsonData {
  date: string;
  canteen: string;
  lang: string;
  categories: {
    category: string;
    meals: {
      name: string;
      prices: {
        student: number;
        staff: number;
        guest: number;
      };
      allergens: string[];
      additives: string[];
      co2?: string;
      isVegetarian: boolean;
      isVegan: boolean;
    }[];
  }[];
  error?: string;
}

/**
 * Response from the mensa API with structured JSON data
 */
export interface MensaJsonResponse {
  data: MensaJsonData;
  params: MensaParams;
  error?: string;
}

/**
 * Response from the mensa API with markdown data
 */
export interface MensaMarkdownResponse {
  markdownData: string;
  params: MensaParams;
  error?: string;
}

/**
 * Response from the mensa API.
 */
export interface MensaResponse {
  data: string;
  params: MensaParams;
  error?: string;
}

/**
 * Fetches real menu data from the API endpoint (which runs the Python script).
 * 
 * @param params Parameters for the cafeteria menu request
 * @returns Promise with the response from the API
 */
export async function fetchRealMenuData(params: MensaParams = {}): Promise<MensaJsonResponse | MensaMarkdownResponse> {
  try {
    // Use environment variables if available, otherwise default to the current origin
    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || window.location.origin;
    
    // Build URL with query parameters
    const url = new URL('/api/mensa', apiBaseUrl);
    
    // Add each parameter to the URL
    if (params.mensa) url.searchParams.append('mensa', params.mensa);
    if (params.lang) url.searchParams.append('lang', params.lang);
    if (params.date) url.searchParams.append('date', params.date);
    
    if (params.filterCategories && params.filterCategories.length > 0) {
      params.filterCategories.forEach(cat => 
        url.searchParams.append('filterCategories', cat)
      );
    }
    
    if (params.showAllAllergens) url.searchParams.append('showAllAllergens', '');
    if (params.showAdditives) url.searchParams.append('showAdditives', '');
    if (params.showAllPrices) url.searchParams.append('showAllPrices', '');
    if (params.vegan) url.searchParams.append('vegan', '');
    if (params.vegetarian) url.searchParams.append('vegetarian', '');
    
    console.log(`Fetching menu data from: ${url.toString()}`);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('API response received:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error fetching cafeteria data:', error);
    return {
      markdownData: '',
      params,
      error: error instanceof Error ? error.message : 'Unknown error fetching cafeteria data'
    };
  }
}

/**
 * Converts JSON data from the Python script directly into our Menu format.
 * This is much more reliable than parsing markdown.
 */
export function convertJsonToMenu(jsonData: MensaJsonData, date: string): Menu {
  try {
    if (jsonData.error) {
      return { date, items: [], errorMessage: jsonData.error };
    }

    console.log("Processing JSON data:", jsonData); // Debug log
    const items: MenuItem[] = [];
    
    // Process each category and its meals
    jsonData.categories.forEach(category => {
      category.meals.forEach(meal => {
        // Ensure allergens and additives are properly handled
        const allergens: Allergen[] = meal.allergens ? meal.allergens.map(allergen => ({
          id: allergen,
          name: allergen
        })) : [];
        
        const additives: Additive[] = meal.additives ? meal.additives.map(additive => ({
          id: additive,
          name: additive
        })) : [];
        
        // Make sure prices are numbers
        const prices = {
          student: typeof meal.prices?.student === 'number' ? meal.prices.student : 0,
          staff: typeof meal.prices?.staff === 'number' ? meal.prices.staff : 0,
          guest: typeof meal.prices?.guest === 'number' ? meal.prices.guest : 0
        };
        
        console.log(`Meal: ${meal.name}, Prices: ${JSON.stringify(prices)}`); // Debug pricing
        
        // Create a menu item from the JSON data
        items.push({
          category: category.category,
          name: meal.name,
          prices,
          allergens,
          additives,
          isVegetarian: meal.isVegetarian === true,
          isVegan: meal.isVegan === true,
          co2Score: meal.co2 ? convertCo2TextToScore(meal.co2) : undefined
        });
      });
    });
    
    console.log(`Processed ${items.length} menu items`); // Debug log
    return { date, items };
  } catch (error) {
    console.error('Error converting JSON data to menu:', error);
    return { 
      date, 
      items: [], 
      errorMessage: `Error converting JSON data to menu: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Convert CO2 text description to a numeric score
 */
function convertCo2TextToScore(co2Text: string): number | undefined {
  if (co2Text.includes('50% better') || co2Text.includes('better than average')) {
    return 1; // Best
  } else if (co2Text.includes('Better than average')) {
    return 2; // Medium
  } else if (co2Text.includes('Worse than average')) {
    return 3; // Worst
  }
  return undefined;
}

/**
 * Parse markdown table format from the mensa Python script output into Menu object.
 * 
 * @param markdownData Markdown data from the mensa script
 * @returns Menu object with parsed items
 */
export function parseMensaMarkdownToMenu(markdownData: string, date: string): Menu {
  try {
    console.log("Raw markdown data:", markdownData); // Debug logging
    
    const lines = markdownData.split('\n');
    
    // Check if there's any data at all
    if (!lines.length) {
      return { date, items: [], errorMessage: 'No data received from mensa script' };
    }
    
    // Extract header information
    let mensaInfo = '';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('### Mensa')) {
        mensaInfo = lines[i];
        break;
      }
    }
    
    // Find the table header and separator lines
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i].includes('| Category') || lines[i].includes('| Kategorie')) && 
          lines[i].startsWith('|') && lines[i].endsWith('|')) {
        headerIndex = i;
        break;
      }
    }
    
    if (headerIndex === -1) {
      console.warn("Could not find table header in:", lines); // Debug warning
      return { 
        date, 
        items: [], 
        errorMessage: 'Could not parse menu data: table header not found - check if the mensa is open on the selected date' 
      };
    }
    
    // Parse column headers to understand table structure
    const headerColumns = lines[headerIndex].split('|')
      .map(col => col.trim())
      .filter(col => col !== '');
    
    const columnMap = {
      category: 0,
      meal: 1,
      price: 2,
      allergens: 3,
      additives: headerColumns.length > 4 ? 4 : -1,
      co2: headerColumns.length > 5 ? 5 : -1
    };
    
    console.log("Column mapping:", columnMap); // Debug logging
    
    // Skip the header and separator lines
    const dataLines = lines.slice(headerIndex + 2);
    const items: MenuItem[] = [];
    let currentCategory = '';
    
    for (const line of dataLines) {
      if (!line.startsWith('|')) continue;
      
      const columns = line.split('|')
        .map(col => col.trim())
        .filter(col => col !== '');
        
      if (columns.length < 3) continue;
      
      // Use column mapping for flexibility
      const category = columns[columnMap.category] || currentCategory;
      if (columns[columnMap.category]) {
        currentCategory = category;
      }
      
      const name = columns[columnMap.meal];
      const priceText = columns[columnMap.price];
      
      // Parse prices with flexible formats
      const prices = {
        student: 0,
        staff: 0,
        guest: 0
      };
      
      // Try different price formats
      // Format 1: S:3.45€/E:4.05€/G:5.75€
      const studentMatch = priceText.match(/S:(\d+\.\d+)€/);
      const staffMatch = priceText.match(/E:(\d+\.\d+)€/);
      const guestMatch = priceText.match(/G:(\d+\.\d+)€/);
      
      // Format 2: Just a single price like 3.45€
      const singlePriceMatch = !studentMatch && !staffMatch && !guestMatch
        ? priceText.match(/(\d+\.\d+)€/)
        : null;
      
      if (studentMatch) prices.student = parseFloat(studentMatch[1]);
      if (staffMatch) prices.staff = parseFloat(staffMatch[1]);
      if (guestMatch) prices.guest = parseFloat(guestMatch[1]);
      
      // If only a single price is found, use it for all price categories
      if (singlePriceMatch && !studentMatch && !staffMatch && !guestMatch) {
        const price = parseFloat(singlePriceMatch[1]);
        prices.student = price;
        prices.staff = price;
        prices.guest = price;
      }
      
      // Parse allergens
      const allergens: Allergen[] = [];
      if (columns.length > columnMap.allergens && columns[columnMap.allergens]) {
        columns[columnMap.allergens]
          .split(', ')
          .filter(Boolean)
          .forEach(allergenText => {
            // Clean up potential formatting issues
            const cleanAllergen = allergenText.trim().replace(/^\(|\)$/g, '');
            if (cleanAllergen) {
              allergens.push({ id: cleanAllergen, name: cleanAllergen });
            }
          });
      }
      
      // Parse additives (if available)
      const additives: Additive[] = [];
      if (columnMap.additives >= 0 && columns.length > columnMap.additives && columns[columnMap.additives]) {
        columns[columnMap.additives]
          .split(', ')
          .filter(Boolean)
          .forEach(additiveText => {
            // Clean up potential formatting issues
            const cleanAdditive = additiveText.trim().replace(/^\(|\)$/g, '');
            if (cleanAdditive) {
              additives.push({ id: cleanAdditive, name: cleanAdditive });
            }
          });
      }
      
      // Extract CO2 information if available
      let co2Score: number | undefined = undefined;
      if (columnMap.co2 >= 0 && columns.length > columnMap.co2 && columns[columnMap.co2]) {
        const co2Text = columns[columnMap.co2];
        // Map CO2 text to a numeric score (1-3)
        if (co2Text.includes('50% better')) co2Score = 1; // Best
        else if (co2Text.includes('Better than average')) co2Score = 2; // Medium
        else if (co2Text.includes('Worse than average')) co2Score = 3; // Worst
      }
      
      // Determine if vegan/vegetarian based on allergens or menu name keywords
      const hasMeat = allergens.some(a => 
        ['veal', 'pork', 'beef', 'lamb', 'poultry', 'fish', 
         'crustaceans', 'mollusks', 'meat', 'fleisch', 
         'K)', 'S)', 'R)', 'L)', 'G)', 'F)'].some(meat => 
           a.id.toLowerCase().includes(meat.toLowerCase())
         )
      );
      
      const hasDairy = allergens.some(a => 
        ['milk', 'eggs', 'milch', 'eier'].some(dairy => 
          a.id.toLowerCase().includes(dairy.toLowerCase())
        )
      );
      
      // Also check the dish name for obvious indicators
      const nameLower = name.toLowerCase();
      const nameIndicatesMeat = ['chicken', 'beef', 'pork', 'fish', 'meat', 'fleisch', 'fisch', 
                                'hähnchen', 'huhn', 'rind', 'schwein'].some(term => 
                                  nameLower.includes(term)
                                );
      
      const nameIndicatesVegan = ['vegan'].some(term => nameLower.includes(term));
      const nameIndicatesVegetarian = ['vegetarian', 'vegetarisch'].some(term => nameLower.includes(term));
      
      const isVegan = (nameIndicatesVegan || (!hasMeat && !hasDairy && !nameIndicatesMeat));
      const isVegetarian = isVegan || nameIndicatesVegetarian || (!hasMeat && !nameIndicatesMeat);
      
      // Create a menu item with all the parsed information
      items.push({
        category,
        name,
        prices,
        allergens,
        additives,
        isVegan,
        isVegetarian,
        co2Score
      });
    }
    
    if (items.length === 0) {
      return {
        date,
        items: [],
        errorMessage: mensaInfo ? 
          `No menu items found for ${mensaInfo.replace('### ', '')}` : 
          'No menu items found for the selected date'
      };
    }
    
    return { date, items };
  } catch (error) {
    console.error('Error parsing markdown data:', error);
    return { 
      date, 
      items: [], 
      errorMessage: `Error parsing menu data: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Asynchronously retrieves the cafeteria menu using the real API.
 * 
 * @param date The date for which to retrieve the menu (YYYY-MM-DD).
 * @param canteenName The name of the canteen.
 * @param options Additional options for the request
 * @returns A promise that resolves to a Menu object.
 */
export async function getRealMenu(
  date: string, 
  canteenName: string = 'SanktAugustin',
  options: {
    lang?: string,
    vegan?: boolean,
    vegetarian?: boolean,
    showAllAllergens?: boolean,
    showAdditives?: boolean
  } = {}
): Promise<Menu> {
  try {
    const response = await fetchRealMenuData({
      mensa: canteenName,
      date,
      lang: options.lang || 'en',
      vegan: options.vegan,
      vegetarian: options.vegetarian,
      showAllAllergens: options.showAllAllergens || true,
      showAdditives: options.showAdditives || true,
      showAllPrices: true,
      filterCategories: ['Dessert'] // Filtering desserts by default
    });
    
    // Check if response has error
    if ('error' in response && response.error) {
      return { date, items: [], errorMessage: response.error };
    }
    
    // Check if response has JSON data
    if ('data' in response) {
      return convertJsonToMenu(response.data, date);
    }
    
    // Fallback to markdown parsing if response has markdownData
    if ('markdownData' in response) {
      return parseMensaMarkdownToMenu(response.markdownData, date);
    }
    
    return { date, items: [], errorMessage: 'Invalid response format from API' };
  } catch (error) {
    console.error('Error getting real menu:', error);
    return { 
      date, 
      items: [], 
      errorMessage: `Error fetching menu data: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
