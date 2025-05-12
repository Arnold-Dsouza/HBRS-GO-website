"use client";

import type { Menu, MenuItem, Allergen, Additive } from '@/services/cafeteria';
import { getRealMenu } from '@/services/cafeteria';
import { useEffect, useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Utensils, Info, Loader2, Leaf, Fish, Beef, Wheat, Milk, Tag, ClipboardList, UtensilsCrossed, Soup, ChevronLeft, ChevronRight, CircleSlash, ExternalLink, Salad, Drumstick, Vegan as VeganIcon, Carrot, Euro, ListFilter } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CanteenName = "Mensa Sankt Augustin";

const allergenIcons: Record<string, React.FC<{ className?: string }>> = {
  GL: Wheat, // Gluten
  LA: Milk,  // Lactose
  FI: Fish,  // Fish
  // Add more as needed based on your data
};


const categoryColors: Record<string, string> = {
  "Main Dish": "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
  "Side Dish": "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300",
  "Soup & Stew": "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300",
  "Dessert": "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300",
  "Buffet": "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300",
  "Vegetarisch": "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300", 
  "Vegan": "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300", 
  "Default": "bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300",
};

const categoryIcons: Record<string, LucideIcon> = {
  "Main Dish": Drumstick, 
  "Side Dish": Salad, 
  "Soup & Stew": Soup,
  "Dessert": Tag, // Using Tag icon for desserts
  "Buffet": UtensilsCrossed, 
  "Vegetarisch": Leaf, 
  "Vegan": Leaf, 
  "Default": Utensils,
};


function getCategoryIcon(itemCategory: string): LucideIcon {
    if (categoryIcons[itemCategory]) return categoryIcons[itemCategory];
    
    const lowerCategory = itemCategory.toLowerCase();
    if (lowerCategory.includes("vegan")) return Leaf;
    if (lowerCategory.includes("vegetarisch")) return Leaf;
    if (lowerCategory.includes("suppe") || lowerCategory.includes("stew")) return Soup;
    if (lowerCategory.includes("fisch")) return Fish;
    if (lowerCategory.includes("rind")) return Beef;
    if (lowerCategory.includes("main") || lowerCategory.includes("tellergericht")) return Utensils;

    return categoryIcons["Default"];
}

type DietaryFilter = "all" | "vegetarian" | "vegan";


export default function CafeteriaMenuPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [menuData, setMenuData] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");
  const { t } = useLanguage(); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchAndSetMenu = (date: Date) => {
    if (!isClient) return;
    setLoading(true);
    setError(null);
    const dateString = format(date, "yyyy-MM-dd");
    
    // Using the real menu data API instead of mock data
    getRealMenu(
      dateString, 
      "SanktAugustin", 
      {
        lang: t('general.locale') === 'de' ? 'de' : 'en',
        vegetarian: dietaryFilter === 'vegetarian',
        vegan: dietaryFilter === 'vegan',
        showAllAllergens: true,
        showAdditives: true
      }
    ).then(menuData => {
        setMenuData(menuData);
        if(menuData.errorMessage){
            setError(menuData.errorMessage);
        }
    }).catch(err => {
        console.error("Failed to get menu:", err);
        setError(err.message || t('menu.errorLoadingGeneric'));
        setMenuData(null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedDate && isClient) {
      fetchAndSetMenu(selectedDate);
    } else if (!selectedDate && isClient) {
        setLoading(false);
        setMenuData(null);
    }
  }, [selectedDate, isClient, dietaryFilter]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handlePreviousDay = () => {
    if (selectedDate) {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const handleNextDay = () => {
    if (selectedDate) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };
  
  const filteredMenuData = useMemo(() => {
    if (!menuData || !menuData.items) return {};
    
    let itemsToFilter = menuData.items;
    if (dietaryFilter === "vegetarian") {
      itemsToFilter = itemsToFilter.filter(item => item.isVegetarian);
    } else if (dietaryFilter === "vegan") {
      itemsToFilter = itemsToFilter.filter(item => item.isVegan);
    }

    // Define the order of categories we want to display
    const orderedCategories = ["Main Dish", "Side Dish", "Soup & Stew", "Dessert", "Buffet"];
    
    // Category mapping function to standardize categories coming from the API
    const mapToStandardCategory = (itemCategory: string, itemName: string, item: MenuItem): string => {
      const lowerCategory = itemCategory.toLowerCase();
      const lowerName = itemName.toLowerCase();
      
      // Use price as a strong indicator - main dishes typically cost more than side dishes
      const isExpensiveItem = item.prices && item.prices.student >= 2.5;
      const isCheapItem = item.prices && item.prices.student < 1.5;
      
      // Main dish strong indicators - direct category matches
      if (lowerCategory.includes("hauptgerichte") || 
          lowerCategory.includes("hauptgericht") || 
          lowerCategory.includes("tellergericht") ||
          lowerCategory.includes("main dish") ||
          lowerCategory.includes("main course")) {
        return "Main Dish";
      }
      
      // Check for explicit side dish mentions in category, but be more cautious
      if ((lowerCategory.includes("beilage") || 
           lowerCategory.includes("side dish") ||
           lowerCategory.includes("beilagen")) && 
           // Only categorize as side dish if it doesn't have main dish protein indicators
           !lowerName.includes("fleisch") && 
           !lowerName.includes("meat") &&
           !lowerName.includes("schnitzel") &&
           !lowerName.includes("fisch") &&
           !lowerName.includes("fish") &&
           !lowerName.includes("chicken") &&
           !lowerName.includes("hähnchen") &&
           !lowerName.includes("huhn") &&
           !isExpensiveItem) {
        return "Side Dish";
      }
      
      // Check for explicit soup/stew mentions in category
      if (lowerCategory.includes("suppe") || 
          lowerCategory.includes("soup") ||
          lowerCategory.includes("eintopf") ||
          lowerCategory.includes("stew")) {
        return "Soup & Stew";
      }
      
      // Check for explicit dessert mentions in category, with strict conditions
      if ((lowerCategory.includes("dessert") ||
           lowerCategory.includes("nachspeise") ||
           lowerCategory.includes("nachtisch") ||
           lowerCategory.includes("sweet") ||
           lowerCategory.includes("süß") ||
           lowerCategory.includes("delicacy")) &&
          // Make sure it doesn't have main dish indicators
          !lowerName.includes("fleisch") && 
          !lowerName.includes("meat") &&
          !lowerName.includes("schnitzel") &&
          !lowerName.includes("steak") &&
          !lowerName.includes("chicken") &&
          !lowerName.includes("fish") &&
          !lowerName.includes("hähnchen") &&
          !lowerName.includes("fisch")) {
        return "Dessert";
      }
      
      // Check for explicit buffet/salad mentions in category
      if (lowerCategory.includes("buffet") ||
          lowerCategory.includes("salat") ||
          lowerCategory.includes("salad")) {
        return "Buffet";
      }
      
      // Strong protein indicators in name (highest priority for identifying main dishes)
      const hasStrongProteinIndicator = 
          lowerName.includes("schnitzel") || 
          lowerName.includes("steak") ||
          lowerName.includes("filet") ||
          lowerName.includes("fillet") ||
          lowerName.includes("burger") ||
          lowerName.includes("currywurst") ||
          lowerName.includes("gulasch") ||
          lowerName.includes("goulash") ||
          lowerName.includes("braten") || 
          lowerName.includes("roast") ||
          lowerName.includes("geschnetzeltes") ||
          lowerName.includes("ragout") ||
          lowerName.includes("casserole") ||
          lowerName.includes("auflauf") ||
          lowerName.includes("rolled") ||
          lowerName.includes("gefüllt") ||
          lowerName.includes("stuffed") ||
          lowerName.includes("wrapped") ||
          lowerName.includes("fleisch") || 
          lowerName.includes("meat") ||
          lowerName.includes("huhn") || 
          lowerName.includes("chicken") ||
          lowerName.includes("hähnchen") ||
          lowerName.includes("fisch") || 
          lowerName.includes("fish") ||
          lowerName.includes("lachs") || 
          lowerName.includes("salmon") ||
          lowerName.includes("thunfisch") || 
          lowerName.includes("tuna") ||
          lowerName.includes("rind") || 
          lowerName.includes("beef") ||
          lowerName.includes("schwein") || 
          lowerName.includes("pork") ||
          lowerName.includes("lamm") || 
          lowerName.includes("lamb") ||
          lowerName.includes("truthahn") || 
          lowerName.includes("turkey") ||
          lowerName.includes("gyros") ||
          lowerName.includes("schnitzel");
      
      if (hasStrongProteinIndicator || isExpensiveItem) {
        return "Main Dish";
      }

      // Second level - check name indicators for soup/stew
      if (lowerName.includes("suppe") || lowerName.includes("soup") || 
          lowerName.includes("eintopf") || lowerName.includes("stew")) {
        return "Soup & Stew";
      }
      
      // Second level - check name indicators for buffet/salad
      if ((lowerName.includes("salat") || lowerName.includes("salad")) &&
          !lowerName.includes("fleisch") && // Exclude 'Fleischsalat' type dishes
          !lowerName.includes("meat") &&
          !lowerName.includes("wurst")) {
        return "Buffet";
      }
      
      // Dessert name indicators - only if they don't contain protein terms
      const isDessertByName = lowerName.includes("dessert") || 
          lowerName.includes("kuchen") || 
          lowerName.includes("cake") ||
          lowerName.includes("eis") ||
          lowerName.includes("ice cream") ||
          lowerName.includes("pudding") ||
          (lowerName.includes("sweet") && !lowerName.includes("sweet potato") && !lowerName.includes("sweet and sour")) ||
          (lowerName.includes("süß") && !lowerName.includes("süß-sauer") && !lowerName.includes("süßkartoffel")) ||
          lowerName.includes("schokolade") ||
          lowerName.includes("chocolate") ||
          lowerName.includes("muffin") ||
          lowerName.includes("cookie") ||
          lowerName.includes("keks") ||
          lowerName.includes("mousse");
          
      if (isDessertByName && !hasStrongProteinIndicator && !isExpensiveItem) {
        return "Dessert";
      }
      
      // Check for plant-based protein sources which typically indicate a main dish
      const hasPlantProtein = 
          lowerName.includes("tofu") || 
          lowerName.includes("seitan") ||
          lowerName.includes("tempeh") ||
          lowerName.includes("falafel");
          
      if (hasPlantProtein) {
        return "Main Dish";
      }
      
      // Side dish indicators with careful consideration
      const hasSideDishIndicator = 
          lowerName.includes("reis") || lowerName.includes("rice") ||
          lowerName.includes("kartoffel") || lowerName.includes("potato") ||
          lowerName.includes("nudeln") || lowerName.includes("pasta") ||
          lowerName.includes("noodles") ||
          lowerName.includes("spätzle") ||
          lowerName.includes("gemüse") || lowerName.includes("vegetable") ||
          lowerName.includes("beilage");
          
      if (hasSideDishIndicator) {
        // These combination preparations indicate a main dish
        if (lowerName.includes("auflauf") || 
            lowerName.includes("gratin") ||
            lowerName.includes("pfanne") || 
            lowerName.includes("pan") ||
            lowerName.includes("wok")) {
          return "Main Dish";
        }
        
        // If it contains terms like "mit" (with) and a protein, it's likely a main dish
        if ((lowerName.includes(" mit ") || lowerName.includes(" with ")) && 
            (lowerName.includes("fleisch") || 
             lowerName.includes("meat") ||
             lowerName.includes("huhn") || 
             lowerName.includes("chicken") ||
             lowerName.includes("fisch") || 
             lowerName.includes("fish"))) {
          return "Main Dish";  
        }
        
        // If it's cheap, it's likely a side dish
        if (isCheapItem) {
          return "Side Dish";
        }
        
        // If the side dish indicator is just part of a longer name, it might still be a main dish
        // This helps with dishes like "Pasta with meatballs" or "Rice with chicken"
        if (isExpensiveItem || lowerName.length > 25) {
          return "Main Dish";
        }
        
        return "Side Dish";
      }
      
      // Default to Main Dish if no other category matches
      return "Main Dish";
    };

    // First, group by original category
    const initialGroupedMenu = itemsToFilter.reduce((acc, item) => {
      const originalCategory = item.category || t('menu.defaultCategoryKey');
      if (!acc[originalCategory]) {
        acc[originalCategory] = [];
      }
      acc[originalCategory].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
    
    // Now map each item to its standardized category
    const standardizedMenuItems = itemsToFilter.map(item => ({
      ...item,
      standardCategory: mapToStandardCategory(item.category, item.name, item)
    }));
    
    // Group by standardized category
    const newGroupedMenu = standardizedMenuItems.reduce((acc, item) => {
      if (!acc[item.standardCategory]) {
        acc[item.standardCategory] = [];
      }
      acc[item.standardCategory].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    // Create the final sorted menu object with ordered categories
    const sortedGroupedMenu: Record<string, MenuItem[]> = {};
    
    // Add items in the order of our standard categories
    orderedCategories.forEach(categoryKey => {
      if (newGroupedMenu[categoryKey] && newGroupedMenu[categoryKey].length > 0) {
        // Sort items within categories by name
        newGroupedMenu[categoryKey].sort((a, b) => a.name.localeCompare(b.name));
        sortedGroupedMenu[categoryKey] = newGroupedMenu[categoryKey];
      }
    });

    // Add any remaining categories that weren't in our standard list
    Object.keys(newGroupedMenu).forEach(categoryKey => {
      if (!orderedCategories.includes(categoryKey) && newGroupedMenu[categoryKey].length > 0) {
        sortedGroupedMenu[categoryKey] = newGroupedMenu[categoryKey];
      }
    });

    return sortedGroupedMenu;
  }, [menuData, dietaryFilter, t]);

  if (!isClient) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center">
              <Utensils className="mr-3 h-8 w-8 text-primary" /> {t('nav.menu')}
            </CardTitle>
             <CardDescription>{t('menu.loadingMenu')}</CardDescription>
          </CardHeader>
           <CardContent><Loader2 className="h-12 w-12 animate-spin text-primary" /></CardContent>
        </Card>
      </div>
    );
  }


  return (
    <TooltipProvider>
    <div className="container mx-auto py-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <Utensils className="mr-3 h-8 w-8 text-primary" /> {t('menu.pageTitle')}
          </CardTitle>
          <CardDescription>
            {t('menu.pageDescription', { canteenName: CanteenName })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn("w-full sm:w-[280px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>{t('menu.pickDate')}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={(date) => date < subDays(new Date(), 7) || date > addDays(new Date(), 14)} 
                    initialFocus
                    />
                </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousDay} aria-label={t('menu.prevDay')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextDay} aria-label={t('menu.nextDay')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant={dietaryFilter === 'all' ? 'default' : 'outline'} 
                            size="icon" 
                            onClick={() => setDietaryFilter('all')}
                            aria-label={t('menu.showAllDishes')}
                            className={cn(dietaryFilter === 'all' && "bg-primary text-primary-foreground", "hover:bg-primary/80 hover:text-primary-foreground")}
                        >
                            <Utensils className={cn("h-5 w-5", dietaryFilter !== 'all' && "text-foreground/70")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('menu.showAllDishes')}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant={dietaryFilter === 'vegetarian' ? 'default' : 'outline'} 
                            size="icon" 
                            onClick={() => setDietaryFilter('vegetarian')}
                            aria-label={t('menu.showVegetarian')}
                            className={cn(dietaryFilter === 'vegetarian' && "bg-green-500 text-white", "hover:bg-green-500/80 hover:text-white")}
                        >
                            <Carrot className={cn("h-5 w-5", dietaryFilter !== 'vegetarian' && "text-green-600")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('menu.showVegetarian')}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant={dietaryFilter === 'vegan' ? 'default' : 'outline'} 
                            size="icon" 
                            onClick={() => setDietaryFilter('vegan')}
                            aria-label={t('menu.showVegan')}
                             className={cn(dietaryFilter === 'vegan' && "bg-emerald-500 text-white", "hover:bg-emerald-500/80 hover:text-white")}
                        >
                           <VeganIcon className={cn("h-5 w-5", dietaryFilter !== 'vegan' && "text-emerald-600")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('menu.showVegan')}</p></TooltipContent>
                </Tooltip>
            </div>
          </div>
           <p className="text-sm text-muted-foreground">
            {t('menu.officialLink')}{' '}
            <a 
              href="https://www.studierendenwerk-bonn.de/en/food-drink/canteens-and-cafes/mensa-sankt-augustin" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline inline-flex items-center"
            >
              {t('menu.pageTitle')} <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 bg-card p-6 rounded-lg shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">{t('menu.loadingMenuForDate', { date: selectedDate ? format(selectedDate, "PPP") : 'selected date' })}</p>
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive" className="shadow-md">
          <Info className="h-5 w-5" />
          <AlertTitle>{t('menu.errorLoadingTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && Object.keys(filteredMenuData).length === 0 && (
         <Alert className="shadow-md border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
          <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">{t('menu.noMenuTitle')}</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {t('menu.noMenuDescription', { canteenName: CanteenName, date: selectedDate ? format(selectedDate, "PPP") : 'the selected date' })}
          </AlertDescription>
        </Alert>
      )}

      {!loading && selectedDate && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) && 
        (error || Object.keys(filteredMenuData).length === 0) && (
        <div className="flex flex-col items-center justify-center mt-6">
          <h3 className="text-xl font-semibold mb-4">It's the weekend! The mensa is closed.</h3>
          <div className="relative w-full max-w-md overflow-hidden rounded-lg shadow-lg">
            <img 
              src="/images/holiday.gif" 
              alt="Weekend holiday" 
              className="w-full h-auto"
            />
          </div>
          <p className="mt-4 text-muted-foreground text-center">
            Enjoy your weekend! The mensa will be open again on Monday.
          </p>
        </div>
      )}

      {!loading && !error && Object.keys(filteredMenuData).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filteredMenuData).map(([category, items]) => {
            if (items.length === 0) return null; 
            const IconComponent = getCategoryIcon(category);
            const categoryClass = categoryColors[category] || categoryColors.Default;
            
            // First try to translate using the menu.categoryKey. prefix.
            // If not found, try with menu.category., then fallback to the original category string.
            const categoryKey = category.toLowerCase().replace(/ & | /g, '');
            let translatedCategory = t(`menu.categoryKey.${categoryKey}`, { defaultValue: category });
            if (translatedCategory === `menu.categoryKey.${categoryKey}` || translatedCategory === category) { // Check if first translation failed or returned key
                translatedCategory = t(`menu.category.${categoryKey}`, {defaultValue: category});
            }


            return (
            <Card key={category} className={cn(`shadow-md border-l-4`, categoryClass)}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                    {IconComponent && <IconComponent className="mr-2 h-6 w-6" />}
                    {translatedCategory}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <MenuItemCard key={index} item={item} t={t} />
                ))}
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  t: (key: string, params?: Record<string, string | number>) => string; 
}

function MenuItemCard({ item, t }: MenuItemCardProps) {
  // Determine appropriate styling based on dietary attributes
  let itemSpecificClasses = "";

  // Enhanced vegetarian detection
  const nameLower = item.name.toLowerCase();
  const categoryLower = item.category.toLowerCase();
  const isNaturallyVegetarian = 
    nameLower.includes('salad') || 
    nameLower.includes('salat') || 
    categoryLower.includes('salad') || 
    categoryLower.includes('salat') || 
    nameLower.includes('gemüse') || 
    nameLower.includes('vegetable') ||
    nameLower.includes('tofu') ||
    nameLower.includes('käse') ||
    nameLower.includes('cheese');

  // Check for meat in name or allergens to exclude false positives
  const hasMeatKeywords = 
    nameLower.includes('chicken') || 
    nameLower.includes('beef') ||
    nameLower.includes('pork') ||
    nameLower.includes('fish') ||
    nameLower.includes('ham') ||
    nameLower.includes('hähnchen') || 
    nameLower.includes('huhn') || 
    nameLower.includes('rind') || 
    nameLower.includes('schwein') ||
    nameLower.includes('fisch') ||
    nameLower.includes('schinken');
    
  const hasMeatAllergens = item.allergens.some(allergen => {
    const id = allergen.id.toLowerCase();
    return id.includes('meat') || id.includes('fleisch') || 
           id === 's' || id === 'r' || id === 'g' || id === 'f' ||
           id.includes('pork') || id.includes('beef') || id.includes('fish');
  });

  // Enhanced vegetarian/vegan classification
  const enhancedIsVegan = item.isVegan || 
                          // Add detection for pea stew and similar items
                          nameLower.includes('pea stew') || 
                          nameLower.includes('erbseneintopf') ||
                          nameLower.includes('erbsensuppe') ||
                          (nameLower.includes('pea') && nameLower.includes('soup')) ||
                          (nameLower.includes('pea') && (nameLower.includes('stew') || nameLower.includes('eintopf'))) ||
                          // Check for vegan indicators in allergens and additives
                          item.allergens.some(allergen => {
                            const id = allergen.id.toLowerCase();
                            const name = allergen.name.toLowerCase();
                            return id.includes('vegan') || 
                                  name.includes('vegan') || 
                                  id === 'v' || 
                                  id === 've';
                          }) ||
                          item.additives.some(additive => {
                            const id = additive.id.toLowerCase();
                            const name = additive.name.toLowerCase();
                            return id.includes('vegan') || name.includes('vegan');
                          }) ||
                          // Check for dishes that are marked vegan in category
                          categoryLower.includes('vegan');
  const enhancedIsVegetarian = item.isVegetarian || 
                               enhancedIsVegan ||
                               (isNaturallyVegetarian && !hasMeatKeywords && !hasMeatAllergens);

  if (enhancedIsVegan) {
    itemSpecificClasses = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40";
  } else if (enhancedIsVegetarian) {
    itemSpecificClasses = "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40";
  } else {
    itemSpecificClasses = "bg-card"; 
  }

  // Truncate long meal names and prepare description
  const displayName = item.name.replace(/\(Mock \d\)$/, '').trim(); // Remove any mock indicators
  const displayDescription = item.description || '';

  // CO2 score color and text
  const co2ScoreColorClass = item.co2Score === 1 
    ? "bg-green-500 text-white border-green-600"
    : item.co2Score === 2
      ? "bg-yellow-500 text-white border-yellow-600"
      : item.co2Score === 3
        ? "bg-red-500 text-white border-red-600"
        : "";
  
  const co2ScoreText = item.co2Score === 1
    ? t('menu.co2ScoreBest')
    : item.co2Score === 2
      ? t('menu.co2ScoreBetter')
      : t('menu.co2ScoreWorse');

  // Group allergens by type for better organization
  const allergenGroups = item.allergens.reduce((acc, allergen) => {
    const id = allergen.id.toLowerCase();
    
    // Check for common allergen types
    if (id.includes('milk') || id.includes('milch') || id.includes('46')) {
      acc.dairy.push(allergen);
    } else if (id.includes('egg') || id.includes('eier') || id.includes('42')) {
      acc.eggs.push(allergen);
    } else if (id.includes('fish') || id.includes('fisch') || id.includes('43')) {
      acc.fish.push(allergen);
    } else if (id.includes('gluten') || id.includes('40')) {
      acc.gluten.push(allergen);
    } else if (id.includes('pork') || id.includes('schwein') || id.includes('S)')) {
      acc.meat.push(allergen);
    } else if (id.includes('beef') || id.includes('rind') || id.includes('R)')) {
      acc.meat.push(allergen);
    } else if (id.includes('poultry') || id.includes('G)')) {
      acc.meat.push(allergen);
    } else {
      acc.other.push(allergen);
    }
    
    return acc;
  }, { 
    dairy: [] as Allergen[], 
    eggs: [] as Allergen[], 
    fish: [] as Allergen[], 
    gluten: [] as Allergen[], 
    meat: [] as Allergen[],
    other: [] as Allergen[] 
  });
  
  // Function to get an appropriate icon for allergen
  const getAllergenIcon = (allergen: Allergen) => {
    const id = allergen.id.toLowerCase();
    if (id.includes('milk') || id.includes('milch') || id.includes('46')) return Milk;
    if (id.includes('gluten') || id.includes('40')) return Wheat;
    if (id.includes('fish') || id.includes('fisch') || id.includes('43')) return Fish;
    if (id.includes('beef') || id.includes('pork') || id.includes('meat') || 
        id.includes('fleisch') || id.includes('R)') || id.includes('S)')) return Beef;
    if (id.includes('poultry') || id.includes('G)')) return Drumstick;
    return null;
  };

  return (
    <div className={cn(
        "p-4 pb-8 rounded-lg shadow-sm relative border", // Added padding at bottom for CO2 icon
        itemSpecificClasses
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-foreground mb-1">{displayName}</h3>
          {displayDescription && <p className="text-sm text-muted-foreground mt-1 mb-3">{displayDescription}</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
            {(allergenGroups.dairy.length > 0 || 
              allergenGroups.eggs.length > 0 || 
              allergenGroups.fish.length > 0 || 
              allergenGroups.meat.length > 0 || 
              allergenGroups.gluten.length > 0 ||
              allergenGroups.other.length > 0) && (
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs font-medium text-muted-foreground mr-1">{t('menu.allergensLabel')}</span>
                
                {/* Meat allergens with red highlight */}
                {allergenGroups.meat.map(allergen => {
                  const AllergenIcon = getAllergenIcon(allergen);
                  return (
                    <Tooltip key={allergen.id}>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs border-red-400 text-red-600 dark:border-red-600 dark:text-red-400 px-1.5 py-0.5">
                          {AllergenIcon && <AllergenIcon className="mr-1 h-3 w-3" />}
                          {allergen.id}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                        <p>{t(`menu.allergenNames.${allergen.id.replace(/[()]/g, '')}`, { defaultValue: allergen.name })}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Fish allergens with blue highlight */}
                {allergenGroups.fish.map(allergen => {
                  const AllergenIcon = getAllergenIcon(allergen);
                  return (
                    <Tooltip key={allergen.id}>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs border-blue-400 text-blue-600 dark:border-blue-600 dark:text-blue-400 px-1.5 py-0.5">
                          {AllergenIcon && <AllergenIcon className="mr-1 h-3 w-3" />}
                          {allergen.id}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                        <p>{t(`menu.allergenNames.${allergen.id.replace(/[()]/g, '')}`, { defaultValue: allergen.name })}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Dairy and eggs with yellow highlight */}
                {[...allergenGroups.dairy, ...allergenGroups.eggs].map(allergen => {
                  const AllergenIcon = getAllergenIcon(allergen);
                  return (
                    <Tooltip key={allergen.id}>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600 dark:border-yellow-600 dark:text-yellow-400 px-1.5 py-0.5">
                          {AllergenIcon && <AllergenIcon className="mr-1 h-3 w-3" />}
                          {allergen.id}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                        <p>{t(`menu.allergenNames.${allergen.id.replace(/[()]/g, '')}`, { defaultValue: allergen.name })}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Gluten with orange highlight */}
                {allergenGroups.gluten.map(allergen => {
                  const AllergenIcon = getAllergenIcon(allergen);
                  return (
                    <Tooltip key={allergen.id}>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs border-orange-400 text-orange-600 dark:border-orange-600 dark:text-orange-400 px-1.5 py-0.5">
                          {AllergenIcon && <AllergenIcon className="mr-1 h-3 w-3" />}
                          {allergen.id}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                        <p>{t(`menu.allergenNames.${allergen.id.replace(/[()]/g, '')}`, { defaultValue: allergen.name })}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Other allergens */}
                {allergenGroups.other.map(allergen => (
                  <Tooltip key={allergen.id}>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400 px-1.5 py-0.5">
                        {allergen.id}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground">
                      <p>{t(`menu.allergenNames.${allergen.id.replace(/[()]/g, '')}`, { defaultValue: allergen.name })}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
            
            {item.additives && item.additives.length > 0 && (
              <div className="flex items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center text-xs border-purple-400 text-purple-600 dark:border-purple-600 dark:text-purple-400 hover:text-purple-700 hover:border-purple-500"
                    >
                      <ListFilter className="h-3 w-3 mr-1" />
                      {t('menu.additivesLabel')} ({item.additives.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('menu.additivesDialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      {item.additives.map(additive => (
                        <div key={additive.id} className="flex gap-2 items-center py-1 px-2 rounded-md hover:bg-muted">
                          <Badge className="bg-purple-500 text-white h-6 w-6 rounded-full flex items-center justify-center p-0">
                            {additive.id}
                          </Badge>
                          <span className="text-sm">
                            {t(`menu.additiveNames.${additive.id.replace(/[()]/g, '')}`, { defaultValue: additive.name })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Removing the duplicate CO2 badge display */}
        </div>

        <div className="flex-shrink-0 w-28 text-right space-y-1">
            <p className="text-sm text-muted-foreground">
                {t('menu.studentPrice')} <span className="font-semibold text-foreground">{item.prices.student.toFixed(2)}<Euro className="inline h-3 w-3 ml-0.5"/></span>
            </p>
            <p className="text-sm text-muted-foreground">
                {t('menu.staffPrice')} <span className="font-semibold text-foreground">{item.prices.staff.toFixed(2)}<Euro className="inline h-3 w-3 ml-0.5"/></span>
            </p>
            <p className="text-sm text-muted-foreground">
                {t('menu.guestPrice')} <span className="font-semibold text-foreground">{item.prices.guest.toFixed(2)}<Euro className="inline h-3 w-3 ml-0.5"/></span>
            </p>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 flex space-x-1">
          {/* Vegan badge - only showing vegan badge now */}
          {enhancedIsVegan && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 h-6 flex items-center">
                  <Leaf className="h-3 w-3 mr-1" />
                  <span className="text-xs">{t('menu.vegan')}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent><p>{t('menu.vegan')}</p></TooltipContent>
            </Tooltip>
          )}
          {/* Vegetarian badge is removed as requested */}
        </div>
      
      {/* Small CO2 Score Circle inside the card at the bottom center */}
      {item.co2Score && (
        <div className="absolute bottom-2 right-8">
          <Tooltip>
            <TooltipTrigger>
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border shadow-sm",
                co2ScoreColorClass
              )}>
                {/* CO2 text instead of leaf icon */}
                <span className="text-[9px] font-bold">CO₂</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{co2ScoreText}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
