"""
Script to add 3 Indian-specific dummy trip records with itineraries, expenses, and todos.
Run this script from the backend directory: python add_dummy_data.py
"""

import asyncio
from datetime import date, timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def add_dummy_data():
    """Add 3 dummy Indian trips with expenses and todos"""
    
    async with AsyncSessionLocal() as session:
        # Using user_id = 13 (the currently logged in user)
        # Update this if you need to use a different user ID
        
        print("Adding dummy Indian trip data...")
        
        # Trip 1: Goa Beach Vacation
        trip1_data = {
            "destination": "Goa",
            "duration": 5,
            "travelers": 2,
            "budget": 35000,
            "trip_styles": ["beach", "relaxation", "nightlife"],
            "start_date": date(2025, 12, 20),
            "end_date": date(2025, 12, 24),
            "itinerary": """Day 1: Arrival in Goa
Morning: Arrive at Dabolim Airport, transfer to hotel in North Goa (Calangute/Baga area)
Afternoon: Check-in and freshen up, enjoy complimentary welcome drink
Evening: Visit Baga Beach for sunset, dinner at Britto's Beach Shack (₹800 per person)
Night: Explore Tito's Lane nightlife area
Estimated Cost: ₹2,500

Day 2: North Goa Beaches
Morning: Breakfast at hotel, head to Anjuna Beach (₹200 for parking)
Afternoon: Visit Vagator Beach and Chapora Fort, lunch at Curlies Beach Shack (₹1,200)
Evening: Shopping at Anjuna Flea Market (budget ₹2,000)
Night: Sunset at Morjim Beach, dinner at seafood restaurant (₹1,500)
Estimated Cost: ₹5,400

Day 3: Water Sports & Adventure
Morning: Water sports at Calangute Beach - Parasailing (₹800), Jet Ski (₹600), Banana Boat (₹300)
Afternoon: Lunch at beach shack, visit Fort Aguada (₹500 including guide)
Evening: Sunset cruise on Mandovi River (₹1,000 per person)
Night: Dinner at Panjim heritage restaurant (₹1,800)
Estimated Cost: ₹6,800

Day 4: South Goa Exploration
Morning: Visit Colva Beach and Benaulim Beach, breakfast at local café (₹400)
Afternoon: Explore Old Goa Churches - Basilica of Bom Jesus, Se Cathedral (₹200 donation)
Evening: Visit Palolem Beach, dinner at beach restaurant (₹1,500)
Night: Return to hotel, relax
Estimated Cost: ₹3,600

Day 5: Departure
Morning: Breakfast at hotel, last-minute shopping at Mapusa Market (₹1,500)
Afternoon: Check-out, transfer to airport
Estimated Cost: ₹2,000

Total Estimated Cost: ₹20,300 (within budget of ₹35,000)""",
            "user_id": 13
        }
        
        # Trip 2: Jaipur Heritage Tour
        trip2_data = {
            "destination": "Jaipur",
            "duration": 4,
            "travelers": 3,
            "budget": 45000,
            "trip_styles": ["cultural", "heritage", "photography"],
            "start_date": date(2026, 1, 10),
            "end_date": date(2026, 1, 13),
            "itinerary": """Day 1: Pink City Welcome
Morning: Arrive at Jaipur Airport, transfer to heritage hotel in Walled City
Afternoon: Visit Hawa Mahal (Palace of Winds) - ₹50 entry per person
Evening: Explore Johari Bazaar for traditional jewelry and textiles (budget ₹5,000)
Night: Dinner at Chokhi Dhani village resort with cultural show (₹1,200 per person)
Estimated Cost: ₹9,750

Day 2: Forts & Palaces
Morning: Visit Amber Fort - elephant ride up the hill (₹1,200 per person), fort entry (₹500)
Afternoon: Light & sound show at Amber Fort (₹300 per person), lunch at 1135 AD restaurant (₹2,500)
Evening: Jal Mahal photoshoot, visit Nahargarh Fort for sunset (₹200 entry)
Night: Rooftop dinner overlooking City Palace (₹2,000)
Estimated Cost: ₹10,600

Day 3: Royal Heritage
Morning: City Palace & Museum tour (₹700 per person including guide)
Afternoon: Jantar Mantar Observatory (₹200 per person), lunch at LMB (₹1,500)
Evening: Albert Hall Museum (₹150 per person), shopping at Bapu Bazaar (₹3,000)
Night: Traditional Rajasthani thali dinner (₹1,200)
Estimated Cost: ₹8,350

Day 4: Departure Day
Morning: Visit Birla Mandir, breakfast at local restaurant (₹600)
Afternoon: Last-minute shopping at Nehru Bazaar (₹2,000), check-out
Evening: Transfer to airport
Estimated Cost: ₹3,000

Total Estimated Cost: ₹31,700 (within budget of ₹45,000)""",
            "user_id": 13
        }
        
        # Trip 3: Kerala Backwaters
        trip3_data = {
            "destination": "Kerala",
            "duration": 6,
            "travelers": 4,
            "budget": 80000,
            "trip_styles": ["nature", "wellness", "relaxation"],
            "start_date": date(2025, 11, 15),
            "end_date": date(2025, 11, 20),
            "itinerary": """Day 1: Arrival in Kochi
Morning: Arrive at Cochin International Airport, transfer to Fort Kochi hotel
Afternoon: Explore Fort Kochi - Chinese Fishing Nets, St. Francis Church (₹100)
Evening: Kathakali dance show (₹500 per person), dinner at seafood restaurant (₹2,500)
Night: Walk through Princess Street art district
Estimated Cost: ₹5,600

Day 2: Kochi Sightseeing
Morning: Mattancherry Palace (₹20 per person), Jewish Synagogue (₹100 per person)
Afternoon: Spice market tour, lunch at traditional Kerala restaurant (₹2,000)
Evening: Sunset cruise on Kochi harbor (₹800 per person), dinner at hotel (₹3,000)
Night: Relax
Estimated Cost: ₹9,680

Day 3: Transfer to Alleppey - Houseboat Experience
Morning: Check-out, drive to Alleppey (2 hours), board deluxe houseboat (₹12,000 for overnight)
Afternoon: Cruise through backwaters, traditional Kerala lunch included
Evening: Watch sunset from houseboat deck, traditional dinner on boat
Night: Stay overnight on houseboat (air-conditioned rooms)
Estimated Cost: ₹14,000

Day 4: Kumarakom & Ayurvedic Spa
Morning: Check-out from houseboat, transfer to Kumarakom resort
Afternoon: Ayurvedic spa treatment for all (₹8,000 total), lunch at resort (₹4,000)
Evening: Kumarakom Bird Sanctuary visit (₹400 total)
Night: Resort dinner buffet (₹5,000)
Estimated Cost: ₹17,400

Day 5: Munnar Hill Station
Morning: Drive to Munnar (4 hours), check-in at hill resort
Afternoon: Visit tea plantations and tea museum (₹500 total), lunch en route (₹2,000)
Evening: Explore Munnar town market (shopping budget ₹3,000)
Night: Bonfire dinner at resort (₹4,000)
Estimated Cost: ₹10,000

Day 6: Departure
Morning: Early morning visit to Echo Point (₹200), breakfast at resort
Afternoon: Check-out, transfer to Cochin Airport (3 hours drive including stops)
Estimated Cost: ₹2,500

Total Estimated Cost: ₹59,180 (within budget of ₹80,000)""",
            "user_id": 13
        }
        
        # Insert trips
        await session.execute(
            text("""
                INSERT INTO trip.trips 
                (user_id, destination, duration, travelers, budget, trip_styles, start_date, end_date, itinerary, created_at)
                VALUES 
                (:user_id, :destination, :duration, :travelers, :budget, :trip_styles, :start_date, :end_date, :itinerary, NOW())
                RETURNING id
            """),
            trip1_data
        )
        result1 = await session.execute(text("SELECT MAX(id) FROM trip.trips WHERE user_id = 13"))
        trip1_id = result1.scalar()
        
        await session.execute(
            text("""
                INSERT INTO trip.trips 
                (user_id, destination, duration, travelers, budget, trip_styles, start_date, end_date, itinerary, created_at)
                VALUES 
                (:user_id, :destination, :duration, :travelers, :budget, :trip_styles, :start_date, :end_date, :itinerary, NOW())
            """),
            trip2_data
        )
        result2 = await session.execute(text("SELECT MAX(id) FROM trip.trips WHERE user_id = 13"))
        trip2_id = result2.scalar()
        
        await session.execute(
            text("""
                INSERT INTO trip.trips 
                (user_id, destination, duration, travelers, budget, trip_styles, start_date, end_date, itinerary, created_at)
                VALUES 
                (:user_id, :destination, :duration, :travelers, :budget, :trip_styles, :start_date, :end_date, :itinerary, NOW())
            """),
            trip3_data
        )
        result3 = await session.execute(text("SELECT MAX(id) FROM trip.trips WHERE user_id = 13"))
        trip3_id = result3.scalar()
        
        await session.commit()
        print(f"✓ Added 3 trips: IDs {trip1_id}, {trip2_id}, {trip3_id}")
        
        # Add expenses for Trip 1 (Goa)
        goa_expenses = [
            {"place": "Britto's Beach Shack", "amount": 1600, "category": "food", "date": "2025-12-20", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Hotel Calangute", "amount": 8000, "category": "accommodation", "date": "2025-12-20", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Curlies Beach Shack", "amount": 1200, "category": "food", "date": "2025-12-21", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Anjuna Flea Market", "amount": 2000, "category": "shopping", "date": "2025-12-21", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Water Sports Calangute", "amount": 3400, "category": "sightseeing", "date": "2025-12-22", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Mandovi River Cruise", "amount": 2000, "category": "sightseeing", "date": "2025-12-22", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Palolem Beach Restaurant", "amount": 1500, "category": "food", "date": "2025-12-23", "source": "manual", "trip_id": trip1_id, "user_id": 13},
            {"place": "Mapusa Market Shopping", "amount": 1500, "category": "shopping", "date": "2025-12-24", "source": "manual", "trip_id": trip1_id, "user_id": 13},
        ]
        
        # Add expenses for Trip 2 (Jaipur)
        jaipur_expenses = [
            {"place": "Heritage Hotel Jaipur", "amount": 12000, "category": "accommodation", "date": "2026-01-10", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "Hawa Mahal Entry", "amount": 150, "category": "sightseeing", "date": "2026-01-10", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "Johari Bazaar Jewelry", "amount": 5000, "category": "shopping", "date": "2026-01-10", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "Chokhi Dhani Dinner", "amount": 3600, "category": "food", "date": "2026-01-10", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "Amber Fort Elephant Ride", "amount": 3600, "category": "sightseeing", "date": "2026-01-11", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "1135 AD Restaurant", "amount": 2500, "category": "food", "date": "2026-01-11", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "City Palace Museum", "amount": 2100, "category": "sightseeing", "date": "2026-01-12", "source": "manual", "trip_id": trip2_id, "user_id": 13},
            {"place": "Bapu Bazaar Shopping", "amount": 3000, "category": "shopping", "date": "2026-01-12", "source": "manual", "trip_id": trip2_id, "user_id": 13},
        ]
        
        # Add expenses for Trip 3 (Kerala)
        kerala_expenses = [
            {"place": "Fort Kochi Hotel", "amount": 15000, "category": "accommodation", "date": "2025-11-15", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Kathakali Show", "amount": 2000, "category": "sightseeing", "date": "2025-11-15", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Seafood Restaurant Kochi", "amount": 2500, "category": "food", "date": "2025-11-15", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Kochi Harbor Cruise", "amount": 3200, "category": "sightseeing", "date": "2025-11-16", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Alleppey Houseboat", "amount": 12000, "category": "accommodation", "date": "2025-11-17", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Kumarakom Resort", "amount": 18000, "category": "accommodation", "date": "2025-11-18", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Ayurvedic Spa Treatment", "amount": 8000, "category": "wellness", "date": "2025-11-18", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Munnar Hill Resort", "amount": 14000, "category": "accommodation", "date": "2025-11-19", "source": "manual", "trip_id": trip3_id, "user_id": 13},
            {"place": "Munnar Market Shopping", "amount": 3000, "category": "shopping", "date": "2025-11-19", "source": "manual", "trip_id": trip3_id, "user_id": 13},
        ]
        
        # Insert all expenses
        for expense in goa_expenses + jaipur_expenses + kerala_expenses:
            await session.execute(
                text("""
                    INSERT INTO budget.expenses 
                    (user_id, trip_id, place, amount, category, date, source)
                    VALUES 
                    (:user_id, :trip_id, :place, :amount, :category, :date, :source)
                """),
                expense
            )
        
        await session.commit()
        print(f"✓ Added {len(goa_expenses) + len(jaipur_expenses) + len(kerala_expenses)} expenses")
        
        # Add todos for Trip 1 (Goa)
        goa_todos = [
            {"title": "Book flight tickets", "description": "Book round-trip tickets Mumbai to Goa", "completed": True, "important": True, "trip_id": trip1_id, "user_id": 13},
            {"title": "Reserve beach hotel", "description": "Book hotel in Calangute area with sea view", "completed": True, "important": True, "trip_id": trip1_id, "user_id": 13},
            {"title": "Pack beachwear", "description": "Swimsuits, sunscreen, beach towels, sunglasses", "completed": True, "important": False, "trip_id": trip1_id, "user_id": 13},
            {"title": "Book water sports", "description": "Pre-book parasailing and jet ski slots", "completed": True, "important": False, "trip_id": trip1_id, "user_id": 13},
            {"title": "Download offline maps", "description": "Download Goa maps on Google Maps", "completed": True, "important": False, "trip_id": trip1_id, "user_id": 13},
        ]
        
        # Add todos for Trip 2 (Jaipur)
        jaipur_todos = [
            {"title": "Book train tickets", "description": "Book Delhi to Jaipur Shatabdi Express", "completed": True, "important": True, "trip_id": trip2_id, "user_id": 13},
            {"title": "Reserve heritage hotel", "description": "Book traditional haveli in Pink City", "completed": True, "important": True, "trip_id": trip2_id, "user_id": 13},
            {"title": "Buy traditional attire", "description": "Get Rajasthani dress for photoshoot", "completed": False, "important": False, "trip_id": trip2_id, "user_id": 13},
            {"title": "Book Amber Fort elephant ride", "description": "Pre-book early morning elephant ride", "completed": True, "important": False, "trip_id": trip2_id, "user_id": 13},
            {"title": "Arrange city tour guide", "description": "Hire English-speaking guide for heritage sites", "completed": True, "important": False, "trip_id": trip2_id, "user_id": 13},
            {"title": "Pack camera gear", "description": "DSLR, extra batteries, tripod for palace photos", "completed": True, "important": True, "trip_id": trip2_id, "user_id": 13},
        ]
        
        # Add todos for Trip 3 (Kerala)
        kerala_todos = [
            {"title": "Book domestic flights", "description": "Book flights to Kochi and return", "completed": True, "important": True, "trip_id": trip3_id, "user_id": 13},
            {"title": "Reserve houseboat", "description": "Book deluxe AC houseboat for family", "completed": True, "important": True, "trip_id": trip3_id, "user_id": 13},
            {"title": "Book Ayurvedic spa", "description": "Pre-book spa treatments at Kumarakom", "completed": True, "important": False, "trip_id": trip3_id, "user_id": 13},
            {"title": "Get travel insurance", "description": "Family travel insurance for 6 days", "completed": True, "important": True, "trip_id": trip3_id, "user_id": 13},
            {"title": "Pack mosquito repellent", "description": "Essential for backwater areas", "completed": True, "important": False, "trip_id": trip3_id, "user_id": 13},
            {"title": "Download Kerala travel guide", "description": "Offline guide for attractions", "completed": True, "important": False, "trip_id": trip3_id, "user_id": 13},
            {"title": "Arrange airport transfers", "description": "Book cab for airport to hotel and back", "completed": True, "important": False, "trip_id": trip3_id, "user_id": 13},
        ]
        
        # Insert all todos
        for todo in goa_todos + jaipur_todos + kerala_todos:
            await session.execute(
                text("""
                    INSERT INTO todo.todos 
                    (user_id, trip_id, title, description, completed, important, created_at)
                    VALUES 
                    (:user_id, :trip_id, :title, :description, :completed, :important, NOW())
                """),
                todo
            )
        
        await session.commit()
        print(f"✓ Added {len(goa_todos) + len(jaipur_todos) + len(kerala_todos)} todos")
        
        print("\n✅ Successfully added 3 Indian trip records with itineraries, expenses, and todos!")
        print(f"\nTrip 1: Goa Beach Vacation (ID: {trip1_id}) - {len(goa_expenses)} expenses, {len(goa_todos)} todos")
        print(f"Trip 2: Jaipur Heritage Tour (ID: {trip2_id}) - {len(jaipur_expenses)} expenses, {len(jaipur_todos)} todos")
        print(f"Trip 3: Kerala Backwaters (ID: {trip3_id}) - {len(kerala_expenses)} expenses, {len(kerala_todos)} todos")


if __name__ == "__main__":
    asyncio.run(add_dummy_data())
