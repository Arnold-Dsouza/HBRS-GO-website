#!/usr/bin/env python3
import argparse
import sys
from html.parser import HTMLParser
import time
import json
from typing import Dict, List, Optional, Set
import requests
import datetime
import os.path

# Try to import colorama, use dummy colors if not available
try:
    from colorama import Fore, Style, init as colorama_init
except ImportError:
    # Define dummy colorama classes if not available
    class Fore:
        MAGENTA = ""
        GREEN = ""
        BLUE = ""
        CYAN = ""
        RED = ""
        YELLOW = ""
    
    class Style:
        RESET_ALL = ""
    
    def colorama_init():
        pass

# Try to import holidays, create fallback if not available
try:
    import holidays
except ImportError:
    # Create a dummy holidays module
    class DummyHolidays:
        def country_holidays(self, country, subdiv=None):
            return {}
    
    holidays = DummyHolidays()

# Try to import xml.etree.ElementTree
try:
    import xml.etree.ElementTree as ET
except ImportError:
    ET = None

# Constants for the mensa script
meat_allergens: Dict[str, Set[str]] = {
    "de": {
        "Krebstiere (41)",
        "Fisch (43)",
        "Weichtiere (53)",
        "Kalbfleisch (K)",
        "Schweinefleisch (S)",
        "Rindfleisch (R)",
        "Lammfleisch (L)",
        "Geflügel (G)",
        "Fisch (F)",
    },
    "en": {
        "crustaceans (41)",
        "fish (43)",
        "mollusks (53)",
        "veal (K)",
        "pork (S)",
        "beef (R)",
        "lamb (L)",
        "poultry (G)",
        "fish (F)",
    },
}

ovo_lacto_allergens = {
    "de": {
        "Eier (42)",
        "Milch (46)",
    },
    "en": {"eggs (42)", "milk (46)"},
}

gluten_allergens = {
    "de": {
        "Gluten (40)",
        "Weizen (40a)",
        "Roggen (40b)",
        "Gerste (40c)",
    },
    "en": {
        "gluten (40)",
        "wheat (40a)",
        "rye (40b)",
        "barley (40c)",
    },
}

other_allergens: Dict[str, Set[str]] = {
    "de": set(),
    "en": set(),
}

canteen_id_dict = {
    "SanktAugustin": "1",
    "CAMPO": "2",
    "Hofgarten": "3",
    "FoodtruckRheinbach": "5",
    "VenusbergBistro": "6",
    "CasinoZEF/ZEI": "8",
    "Foodtruck": "19",
    "Rabinstraße": "21",
}

language_id_dict = {
    "de": "0",
    "en": "1",
}

content_strings = {
    "NEW_INFOS_ALLERGENS": {
        "de": "Allergene",
        "en": "Allergens",
    },
    "NEW_INFOS_ADDITIVES": {
        "de": "Zusatzstoffe",
        "en": "Additives",
    },
    "PRICE_CATEGORY_STUDENT": {
        "de": "Stud.",
        "en": "Student",
    },
    "PRICE_CATEGORY_STAFF": {
        "de": "Bed.",
        "en": "Staff",
    },
    "PRICE_CATEGORY_GUEST": {
        "de": "Gast",
        "en": "Guest",
    },
}

# CO2 info is always in German
co2_strings = {
    "Mindestens 50% besser als der Durchschnitt.": "CO2_TAG_GREEN",
    "Besser als der Durchschnitt.": "CO2_TAG_ORANGE",
    "Schlechter als der Durchschnitt.": "CO2_TAG_RED",
}

output_strs = {
    "MD_TABLE_COL_CAT": {
        "de": "Kategorie",
        "en": "Category",
    },
    "MD_TABLE_COL_MEAL": {
        "de": "Gericht",
        "en": "Meal",
    },
    "MD_TABLE_COL_PRICE": {
        "de": "Preis",
        "en": "Price",
    },
    "MD_TABLE_COL_SOME_ALLERGENS": {
        "de": "Allergene (Auswahl)",
        "en": "Allergens (Selection)",
    },
    "MD_TABLE_COL_ALLERGENS": {
        "de": "Allergene",
        "en": "Allergens",
    },
    "MD_TABLE_COL_ADDITIVES": {
        "de": "Zusatzstoffe",
        "en": "Additives",
    },
    "MD_TABLE_COL_CO2": {
        "de": "CO₂-Bilanz",
        "en": "CO₂ Balance",
    },
    "CO2_TAG_GREEN": {
        "de": "Mindestens 50% besser als der Durchschnitt",
        "en": "At least 50% better than average",
    },
    "CO2_TAG_ORANGE": {
        "de": "Besser als der Durchschnitt",
        "en": "Better than average",
    },
    "CO2_TAG_RED": {
        "de": "Schlechter als der Durchschnitt",
        "en": "Worse than average",
    },
}


class Meal:
    def __init__(self, title: str) -> None:
        self.title = title
        self.allergens: List[str] = []
        self.additives: List[str] = []
        self.student_price: Optional[int] = None
        self.staff_price: Optional[int] = None
        self.guest_price: Optional[int] = None
        self.co2_tag: Optional[str] = None

    def add_allergen(self, allergen: str) -> None:
        self.allergens.append(allergen)

    def add_additive(self, additive: str) -> None:
        self.additives.append(additive)


class Category:
    def __init__(self, title: str) -> None:
        self.title = title
        self.meals: List[Meal] = []

    def add_meal(self, meal: Meal) -> None:
        self.meals.append(meal)


class SimpleMensaResponseParser(HTMLParser):
    def __init__(self, lang: str, verbose: bool = False):
        super().__init__()
        self.curr_category: Optional[Category] = None
        self.curr_meal: Optional[Meal] = None

        self.last_tag: Optional[str] = None
        self.last_nonignored_tag: Optional[str] = None
        self.categories: List[Category] = []
        self.mode = "INIT"

        self.lang = lang
        self.verbose = verbose

    def start_new_category(self):
        if self.curr_category:
            if self.curr_meal:
                self.curr_category.add_meal(self.curr_meal)
                self.curr_meal = None
            self.categories.append(self.curr_category)
            self.curr_category = None

        self.mode = "NEW_CAT"

    def start_new_meal(self):
        if not self.curr_category:
            self.curr_category = Category("DUMMY-Name")

        if self.curr_meal:
            self.curr_category.add_meal(self.curr_meal)
            self.curr_meal = None

        self.mode = "NEW_MEAL"

    def handle_starttag(self, tag, attrs):
        # skip non-empty attributes
        if attrs or tag not in ["h2", "h5", "strong", "p", "th", "td", "br"]:
            self.mode = "IGNORE"
            return

        self.last_nonignored_tag = tag
        if tag == "h2":
            self.start_new_category()
        elif tag == "h5":
            self.start_new_meal()
        elif tag == "strong":
            self.mode = "NEW_INFOS"
        elif tag == "p":
            if not self.curr_meal and not self.curr_category:
                self.mode = "INFO"
        elif tag == "th":
            self.mode = "NEW_PRICE_CAT"
        elif tag == "td":
            pass

    def parse_price(self, price: str) -> int:
        return int("".join(digit for digit in price if digit.isdigit()))

    def handle_data(self, data):
        if self.mode == "IGNORE" or not data.strip():
            return
        if self.mode in ["INIT", "INFO"]:
            print(data)
            return
        data = data.strip()
        if self.mode == "NEW_CAT":
            self.curr_category = Category(data)
            if self.verbose:
                print(f"Creating new category {data}")
        elif self.mode == "NEW_MEAL":
            self.curr_meal = Meal(data)
            if self.verbose:
                print(f"\tCreating new meal {data}")
        elif self.mode == "NEW_INFOS":
            if data == content_strings["NEW_INFOS_ALLERGENS"][self.lang]:
                self.mode = "NEW_ALLERGENS"
            elif data == content_strings["NEW_INFOS_ADDITIVES"][self.lang]:
                self.mode = "NEW_ADDITIVES"
            elif data in co2_strings:
                self.curr_meal.co2_tag = co2_strings[data]
                self.mode = "IGNORE"
            else:
                raise NotImplementedError(f"Mode NEW_INFOS with data {data}")
        elif self.mode == "NEW_ALLERGENS":
            if self.verbose:
                print(f"\t\tAdding new allergen: {data}")
            self.curr_meal.add_allergen(data)
        elif self.mode == "NEW_ADDITIVES":
            if self.verbose:
                print(f"\t\tAdding new additive: {data}")
            self.curr_meal.add_additive(data)
        elif self.mode == "NEW_PRICE_CAT":
            if data == content_strings["PRICE_CATEGORY_STUDENT"][self.lang]:
                self.mode = "NEW_PRICE_STUDENT"
            elif data == content_strings["PRICE_CATEGORY_STAFF"][self.lang]:
                self.mode = "NEW_PRICE_STAFF"
            elif data == content_strings["PRICE_CATEGORY_GUEST"][self.lang]:
                self.mode = "NEW_PRICE_GUEST"
            else:
                raise NotImplementedError(f"Mode NEW_PRICE_CAT with data {data}")
        elif self.mode == "NEW_PRICE_STUDENT":
            assert self.last_nonignored_tag == "td"
            self.curr_meal.student_price = self.parse_price(data)
        elif self.mode == "NEW_PRICE_STAFF":
            assert self.last_nonignored_tag == "td"
            self.curr_meal.staff_price = self.parse_price(data)
        elif self.mode == "NEW_PRICE_GUEST":
            assert self.last_nonignored_tag == "td"
            self.curr_meal.guest_price = self.parse_price(data)
        else:
            raise NotImplementedError(f"{self.last_nonignored_tag} with data {data}")

    def to_xml(self, wCanteen) -> ET.Element:
        if ET is None:
            raise ImportError("XML functionality requires xml.etree.ElementTree")
        
        # Define namespaces
        ns = {
            "": "http://openmensa.org/open-mensa-v2",
            "xsi": "http://www.w3.org/2001/XMLSchema-instance",
        }
        # Register namespaces
        for prefix, uri in ns.items():
            ET.register_namespace(prefix, uri)

        # Create the root element with namespaces
        root = ET.Element(
            "openmensa",
            {
                "version": "2.1",
                "xmlns": ns[""],
                "xmlns:xsi": ns["xsi"],
                "xsi:schemaLocation": "http://openmensa.org/open-mensa-v2 http://openmensa.org/open-mensa-v2.xsd",
            },
        )
        # Add version element
        version = ET.SubElement(root, "version")
        version.text = "5.04-4"

        # Create the canteen and Date element
        canteen = ET.SubElement(root, "canteen")
        day = ET.SubElement(canteen, "day")
        day.set("date", str(datetime.date.today()))

        # Create the meals element

        for cat in self.categories:
            categories = ET.SubElement(day, "category")
            categories.set("name", cat.title)
            for meal in cat.meals:
                meal_element = ET.SubElement(categories, "meal")
                name = ET.SubElement(meal_element, "name")
                name.text = meal.title
                # Add allergens and Additives
                allergens = ET.SubElement(meal_element, "note")
                combined_list = meal.allergens + meal.additives
                allergens.text = ", ".join(combined_list)
                # Add prices
                price = ET.SubElement(meal_element, "price")
                price.set("role", "student")
                price.text = str(f"{meal.student_price / 100:.2f}")
                price = ET.SubElement(meal_element, "price")
                price.set("role", "employee")
                price.text = str(f"{meal.staff_price / 100:.2f}")
                price = ET.SubElement(meal_element, "price")
                price.set("role", "other")
                price.text = str(f"{meal.guest_price / 100:.2f}")

        return root

    def close(self):
        super().close()
        self.start_new_category()


def get_mensa_data() -> datetime.date:
    print("Fetching mensa data...")
    # Since the canteenes ar elocated in NRW get the public holidays for NRW
    try:
        nrw_holidays = holidays.country_holidays("DE", subdiv="NW")
    except:
        # Fallback if holidays module not working
        nrw_holidays = {}

    date = datetime.date.today()
    # Initialize the next working day as the day after today
    next_working_day = date + datetime.timedelta()

    # Loop until we find a day that is not a weekend or a public holiday
    while next_working_day.weekday() >= 5 or next_working_day in nrw_holidays:
        next_working_day += datetime.timedelta(days=1)

    return next_working_day


def query_mensa(
    date: Optional[str],
    canteen: str,
    filtered_categories: List[str],
    language: str,
    filter_mode: Optional[str] = None,
    show_all_allergens: bool = False,
    show_additives: bool = False,
    show_co2: bool = False,
    gluten_free: bool = False,
    url: str = "https://www.studierendenwerk-bonn.de/?type=1732731666",
    verbose: bool = False,
    price: str = "Student",
    colors: bool = True,
    markdown_output: bool = False,
    xml_output: bool = False,
    show_all_prices: bool = False,
    json_output: bool = False,  # New parameter for JSON output
) -> None:
    if date is None:
        # If no date is provided get next valid day i.E. working days from monday to fridy
        # this does not take into account closures due to operational reasons
        date = get_mensa_data().strftime("%Y-%m-%d")

    if colors:
        QUERY_COLOR = Fore.MAGENTA
        CATEGORY_COLOR = Fore.GREEN
        MEAL_COLOR = Fore.BLUE
        PRICE_COLOR = Fore.CYAN
        ALLERGEN_COLOR = Fore.RED
        ADDITIVE_COLOR = Fore.YELLOW
        WARN_COLOR = Fore.RED
        RESET_COLOR = Style.RESET_ALL
        CO2_COLORS = {
            "CO2_TAG_GREEN": Fore.GREEN,
            "CO2_TAG_ORANGE": Fore.YELLOW,
            "CO2_TAG_RED": Fore.RED,
        }
    else:
        QUERY_COLOR = ""
        CATEGORY_COLOR = ""
        MEAL_COLOR = ""
        PRICE_COLOR = ""
        ALLERGEN_COLOR = ""
        ADDITIVE_COLOR = ""
        WARN_COLOR = ""
        RESET_COLOR = ""
        CO2_COLORS = {
            "CO2_TAG_GREEN": "",
            "CO2_TAG_ORANGE": "",
            "CO2_TAG_RED": "",
        }

    filter_str = f" [{filter_mode}]" if filter_mode else ""
    if markdown_output:
        print(f"### Mensa {canteen} – {date}{filter_str} [{language}]\n")
    else:
        print(
            f"{QUERY_COLOR}Mensa {canteen} – {date}{filter_str} [{language}]{RESET_COLOR}"
        )

    if verbose:
        print(
            f"Querying for date={date}, canteen={canteen}, filtered_categories={filtered_categories}, filter_mode={filter_mode}, url={url}"
        )
    
    try:
        r = requests.post(
            url,
            data={
                "tx_festwb_mealsajax[date]": date,
                "tx_festwb_mealsajax[canteen]": canteen_id_dict[canteen],
                "tx_festwb_mealsajax[language]": language_id_dict[language],
            },
            timeout=10  # Add timeout to prevent hanging
        )
        parser = SimpleMensaResponseParser(lang=language, verbose=verbose)
        parser.feed(r.text)
        parser.close()
    except Exception as e:
        error_msg = f"Error fetching mensa data: {str(e)}"
        if json_output:
            # Return JSON error response with fallback mock data
            json_data = get_mock_menu_data(date, canteen, language)
            print(json.dumps(json_data, ensure_ascii=False, indent=2))
            return
        else:
            print(f"{WARN_COLOR}{error_msg}{RESET_COLOR}")
            return

    if not parser.categories:
        error_msg = f"Query failed. Please check https://www.studierendenwerk-bonn.de if the mensa is open today."
        if json_output:
            # Return JSON error response with fallback mock data
            json_data = get_mock_menu_data(date, canteen, language)
            print(json.dumps(json_data, ensure_ascii=False, indent=2))
            return
        else:
            print(f"{WARN_COLOR}{error_msg}{RESET_COLOR}")
            return
    print()

    queried_categories = [
        cat for cat in parser.categories if cat.title not in filtered_categories
    ]
    if not queried_categories:
        if json_output:
            # Return empty JSON response
            json_data = {
                "date": date,
                "canteen": canteen,
                "lang": language,
                "categories": []
            }
            print(json.dumps(json_data, ensure_ascii=False, indent=2))
        return

    interesting_allergens = (
        meat_allergens[language]
        | ovo_lacto_allergens[language]
        | other_allergens[language]
    )

    if filter_mode is None:
        remove_allergens = set()
    elif filter_mode == "vegetarian":
        remove_allergens = meat_allergens[language]
    elif filter_mode == "vegan":
        remove_allergens = meat_allergens[language] | ovo_lacto_allergens[language]
    else:
        remove_allergens = set()  # Changed to not raise error for unknown filter modes

    if gluten_free:
        remove_allergens.update(gluten_allergens[language])

    # Handle JSON output if requested
    if json_output:
        json_categories = []
        
        for cat in queried_categories:
            filtered_meals = [
                meal for meal in cat.meals if not set(meal.allergens) & remove_allergens
            ]

            if not filtered_meals:
                continue
                
            json_meals = []
            for meal in filtered_meals:
                allergens_list = meal.allergens
                additives_list = meal.additives
                
                co2_info = None
                if meal.co2_tag:
                    co2_info = output_strs[meal.co2_tag][language]
                
                # Determine vegetarian/vegan status
                hasMeat = any(a in meat_allergens[language] for a in meal.allergens)
                hasDairy = any(a in ovo_lacto_allergens[language] for a in meal.allergens)
                isVegan = not (hasMeat or hasDairy)
                isVegetarian = not hasMeat
                
                json_meals.append({
                    "name": meal.title,
                    "prices": {
                        "student": meal.student_price / 100,
                        "staff": meal.staff_price / 100,
                        "guest": meal.guest_price / 100
                    },
                    "allergens": allergens_list,
                    "additives": additives_list,
                    "co2": co2_info,
                    "isVegetarian": isVegetarian,
                    "isVegan": isVegan
                })
            
            if json_meals:
                json_categories.append({
                    "category": cat.title,
                    "meals": json_meals
                })
        
        # Create the complete JSON response
        json_data = {
            "date": date,
            "canteen": canteen,
            "lang": language,
            "categories": json_categories
        }
        
        # Print the JSON response
        print(json.dumps(json_data, ensure_ascii=False, indent=2))
        return

    maxlen_catname = max(len(cat.title) for cat in queried_categories)
    if markdown_output:
        print(f"| {output_strs['MD_TABLE_COL_CAT'][language]}", end="")
        print(f"| {output_strs['MD_TABLE_COL_MEAL'][language]}", end="")
        print(f"| {output_strs['MD_TABLE_COL_PRICE'][language]}", end="")
        if show_all_allergens:
            print(f"| {output_strs['MD_TABLE_COL_ALLERGENS'][language]}", end="")
        else:
            print(f"| {output_strs['MD_TABLE_COL_SOME_ALLERGENS'][language]}", end="")
        if show_additives:
            print(f"| {output_strs['MD_TABLE_COL_ADDITIVES'][language]}", end="")
        if show_co2:
            print(f"| {output_strs['MD_TABLE_COL_CO2'][language]}", end="")
        print(" |")
        print(f"| :-- | :-- | --: | :-- | ", end="")
        if show_additives:
            print(":-- |", end="")
        if show_co2:
            print(":-- |", end="")
        print()

    for cat in queried_categories:
        filtered_meals = [
            meal for meal in cat.meals if not set(meal.allergens) & remove_allergens
        ]

        if not filtered_meals:
            continue

        if markdown_output:
            for meal_idx, meal in enumerate(filtered_meals):
                if meal_idx:
                    print(f"| |", end="")
                else:
                    print(f"| {cat.title} |", end="")
                
                # Show meal title and price(s)
                print(f" {meal.title} | ", end="")
                
                # Display all prices or just the selected price
                if show_all_prices:
                    print(f"S:{meal.student_price/100:.2f}€/E:{meal.staff_price/100:.2f}€/G:{meal.guest_price/100:.2f}€ |", end="")
                else:
                    if price == "Student":
                        print(f"{meal.student_price/100:.2f}€ |", end="")
                    elif price == "Staff":
                        print(f"{meal.staff_price/100:.2f}€ |", end="")
                    elif price == "Guest":
                        print(f"{meal.guest_price/100:.2f}€ |", end="")

                if show_all_allergens:
                    allergen_str = ", ".join(meal.allergens)
                else:
                    allergen_str = ", ".join(
                        al for al in meal.allergens if al in interesting_allergens
                    )
                print(f" {allergen_str} |", end="")

                if show_additives:
                    additives_str = ", ".join(meal.additives)
                    print(f" {additives_str} |", end="")

                if show_co2:
                    co2_str = output_strs[meal.co2_tag][language] if meal.co2_tag else ''
                    print(f" {co2_str} |", end="")

                print("")
        else:
            cat_str = cat.title.ljust(maxlen_catname + 1)
            print(f"{CATEGORY_COLOR}{cat_str}{RESET_COLOR}", end="")

            for meal_idx, meal in enumerate(filtered_meals):
                # do not indent first line
                if meal_idx:
                    print(" " * (maxlen_catname + 1), end="")
                
                # Display meal title
                print(f"{MEAL_COLOR}{meal.title} ", end="")
                
                # Display all prices or just the selected price
                if show_all_prices:
                    print(f"{PRICE_COLOR}(S:{meal.student_price/100:.2f}€/E:{meal.staff_price/100:.2f}€/G:{meal.guest_price/100:.2f}€)", end="")
                else:
                    if price == "Student":
                        print(f"{PRICE_COLOR}({meal.student_price/100:.2f}€)", end="")
                    elif price == "Staff":
                        print(f"{PRICE_COLOR}({meal.staff_price/100:.2f}€)", end="")
                    elif price == "Guest":
                        print(f"{PRICE_COLOR}({meal.guest_price/100:.2f}€)", end="")
                
                if meal.allergens and (
                    show_all_allergens or set(meal.allergens) & interesting_allergens
                ):
                    if show_all_allergens:
                        allergen_str = ", ".join(meal.allergens)
                    else:
                        allergen_str = ", ".join(
                            al for al in meal.allergens if al in interesting_allergens
                        )
                    print(f" {ALLERGEN_COLOR}[{allergen_str}]", end="")

                if show_additives and meal.additives:
                    additives_str = ", ".join(meal.additives)
                    print(f" {ADDITIVE_COLOR}[{additives_str}]", end="")

                if show_co2 and meal.co2_tag:
                    co2_str = output_strs[meal.co2_tag][language]
                    color = CO2_COLORS[meal.co2_tag]
                    print(f" {color}[CO₂: {co2_str}]", end="")

                print(f"{RESET_COLOR}")
        if xml_output:
            xml_root = parser.to_xml(canteen)
            xml_tree = ET.ElementTree(xml_root)
            filename = f"{canteen}_{date}_{time.time()}.xml"
            xml_tree.write(
                filename, encoding="utf-8", xml_declaration=True, method="xml"
            )
            print(f"XML saved to {filename}")

# Fallback mock menu data for times when the actual site is unreachable
def get_mock_menu_data(date, mensa="SanktAugustin", lang="en"):
    """Generate mock menu data for testing purposes when real data is unavailable"""
    
    # Convert string date to datetime object
    try:
        menu_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        # Format for display
        date_str = menu_date.strftime("%Y-%m-%d")
        
        # Check if weekend (5=Saturday, 6=Sunday)
        is_weekend = menu_date.weekday() >= 5
    except ValueError:
        date_str = date
        is_weekend = False
    
    if is_weekend:
        # Return closed message for weekends
        return {
            "date": date_str,
            "canteen": mensa,
            "lang": lang,
            "error": f"The mensa is closed on weekends.",
            "categories": []
        }
    
    # Generate mock menu data when real data isn't available
    return {
        "date": date_str,
        "canteen": mensa,
        "lang": lang,
        "error": "Could not connect to the real mensa service. Showing mock data.",
        "categories": [
            {
                "category": "Main Dishes",
                "meals": [
                    {
                        "name": "Pasta with Tomato Sauce",
                        "prices": {
                            "student": 2.80,
                            "staff": 3.80,
                            "guest": 4.50
                        },
                        "allergens": ["wheat (40a)", "gluten (40)"],
                        "additives": ["colorant (1)"],
                        "co2": "At least 50% better than average",
                        "isVegetarian": True,
                        "isVegan": True
                    },
                    {
                        "name": "Chicken Curry with Rice",
                        "prices": {
                            "student": 3.60,
                            "staff": 4.60,
                            "guest": 5.20
                        },
                        "allergens": ["poultry (G)"],
                        "additives": ["flavor enhancer (2)"],
                        "co2": "Better than average",
                        "isVegetarian": False,
                        "isVegan": False
                    }
                ]
            },
            {
                "category": "Side Dishes",
                "meals": [
                    {
                        "name": "Steamed Vegetables",
                        "prices": {
                            "student": 1.20,
                            "staff": 1.80,
                            "guest": 2.20
                        },
                        "allergens": [],
                        "additives": [],
                        "co2": "At least 50% better than average",
                        "isVegetarian": True,
                        "isVegan": True
                    },
                    {
                        "name": "French Fries",
                        "prices": {
                            "student": 1.50,
                            "staff": 2.00,
                            "guest": 2.50
                        },
                        "allergens": [],
                        "additives": ["antioxidant (3)"],
                        "co2": "Worse than average",
                        "isVegetarian": True,
                        "isVegan": True
                    }
                ]
            }
        ]
    }

def get_parser():
    parser = argparse.ArgumentParser(description="HBRS Mensa Menu CLI")
    filter_group = parser.add_mutually_exclusive_group()
    filter_group.add_argument(
        "--vegan", action="store_true", help="Only show vegan options"
    )
    filter_group.add_argument(
        "--vegetarian", action="store_true", help="Only show vegetarian options"
    )
    parser.add_argument(
        "--mensa",
        choices=canteen_id_dict.keys(),
        type=str,
        default="SanktAugustin",
        help="The canteen to query. Defaults to SanktAugustin.",
    )
    parser.add_argument(
        "--filter-categories",
        nargs="*",
        metavar="CATEGORY",
        default=["Buffet", "Dessert"],
        help="Meal categories to hide. Defaults to ['Buffet', 'Dessert'].",
    )
    parser.add_argument(
        "--date",
        type=str,
        default=None,
        help="The date to query for in YYYY-MM-DD format. Defaults to today.",
    )
    parser.add_argument(
        "--price",
        type=str,
        choices=["Student", "Staff", "Guest"],
        default="Student",
        help="The price category to show. Defaults to Student.",
    )

    parser.add_argument(
        "--lang",
        choices=["de", "en"],
        default="de",
        help="The language of the meal plan to query. Defaults to German.",
    )

    parser.add_argument(
        "--show-all-allergens",
        action="store_true",
        help="Show all allergens. By default, only allergens relevant to vegans (e.g. milk or fish) are shown.",
    )

    parser.add_argument(
        "--show-additives",
        action="store_true",
        help="Show additives.",
    )
    
    parser.add_argument(
        "--show-co2",
        action="store_true",
        help="Show CO₂ bilance.",
    )

    parser.add_argument(
        "--no-colors",
        action="store_true",
        help="Do not use any ANSI colors in the output.",
    )

    parser.add_argument(
        "--markdown",
        action="store_true",
        help="Output in markdown table format.",
    )

    parser.add_argument(
        "--json",
        action="store_true",
        help="Output in JSON format for easier parsing.",
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print debug output.",
    )

    parser.add_argument(
        "--version",
        action="version",
        version="bonn-mensa v1.0.0",
    )

    parser.add_argument(
        "--xml",
        action="store_true",
        help="""Save canteen pan with all allergens as xml. If no filename is given the resulting
            xml will be saved as <canteen name>_<time>.""",
    )
    parser.add_argument(
        "--glutenfree",
        action="store_true",
        help="Only show gluten free options",
    )
    parser.add_argument(
        "--show-all-prices",
        action="store_true",
        help="Show all price categories (Student, Staff, Guest)",
    )

    return parser


def run_cmd(args):
    if args.vegan:
        filter_mode: Optional[str] = "vegan"
    elif args.vegetarian:
        filter_mode = "vegetarian"
    else:
        filter_mode = None

    query_mensa(
        date=args.date,
        canteen=args.mensa,
        language=args.lang,
        filtered_categories=args.filter_categories,
        filter_mode=filter_mode,
        show_all_allergens=args.show_all_allergens,
        show_additives=args.show_additives,
        show_co2=args.show_co2,
        gluten_free=args.glutenfree,
        colors=not args.no_colors,
        markdown_output=args.markdown,
        verbose=args.verbose,
        price=args.price,
        xml_output=args.xml,
        show_all_prices=args.show_all_prices,
        json_output=args.json,  # Pass JSON flag to query_mensa
    )


def main():
    try:
        colorama_init()
    except:
        pass
        
    args = get_parser().parse_args()
    run_cmd(args)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)