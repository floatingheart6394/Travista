"""
Add dummy Indian trip data for user_id = 1 (to match logged-in user in database)
"""
import asyncio
from datetime import date
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.trip import Trip

DATABASE_URL = "postgresql+asyncpg://postgres:Reshma123@localhost:5432/travista_db"

async def main():
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Trip 1: Goa Beach Vacation
        trip1 = Trip(
            user_id=1,  # Using user_id=1 to match the database authentication
            destination="Goa, India",
            duration="5 days",
            travelers="2",
            budget=35000,
            trip_styles="Beach, Water Sports, Nightlife",
            start_date=date(2025, 12, 20),
            end_date=date(2025, 12, 24),
            itinerary="""Day 1 (Dec 20): Arrival in Goa
- Flight arrives at Dabolim Airport at 3 PM
- Check-in at beachfront resort in Baga
- Evening stroll on Baga Beach
- Dinner at shack restaurant (₹800/person)

Day 2 (Dec 21): Water Sports & North Goa
- Morning parasailing at Baga Beach (₹1500/person)
- Lunch at Curlie's restaurant (₹600/person)
- Visit Aguada Fort
- Evening DJ party at Tito's Club (₹1000/person entry)

Day 3 (Dec 22): South Goa Exploration
- Day trip to South Goa via scooter rental (₹500/day)
- Visit Palolem Beach
- Sunset cruise in backwaters (₹800/person)
- Seafood dinner in Palolem (₹900/person)

Day 4 (Dec 23): Relaxation & Spa
- Morning yoga session (₹400/person)
- Full body Ayurvedic massage (₹2000/person)
- Shopping at Anjuna Flea Market
- Local market exploration

Day 5 (Dec 24): Departure
- Checkout at 11 AM
- Last-minute shopping at duty-free
- Flight departure at 8 PM"""
        )
        
        # Trip 2: Jaipur Heritage Tour
        trip2 = Trip(
            user_id=1,
            destination="Jaipur, Rajasthan, India",
            duration="4 days",
            travelers="3",
            budget=45000,
            trip_styles="Heritage, Culture, Shopping",
            start_date=date(2026, 1, 10),
            end_date=date(2026, 1, 13),
            itinerary="""Day 1 (Jan 10): City Palace & Jantar Mantar
- Arrival at Jaipur Railway Station
- Hotel check-in in Pink City area
- Visit City Palace (entry ₹500/person)
- Explore Jantar Mantar Observatory (entry ₹200/person)
- Evening walk in Hawa Mahal bazaar area
- Dinner at local restaurant (₹600/person)

Day 2 (Jan 11): Hawa Mahal & Heritage Walk
- Sunrise at Hawa Mahal
- Heritage walking tour (₹300/person)
- Visit Albert Hall Museum (₹150/person)
- Shopping at Bapu Bazaar
- Traditional Rajasthani lunch (₹700/person)
- Block printing workshop (₹500/person)

Day 3 (Jan 12): Amber Fort Excursion
- Day trip to Amber Fort (30 km away)
- Jeep ride up to fort (₹200/person)
- Complete fort tour with guide (₹400/person)
- Lunch at Laxmi Mishthan Bhandar (₹400/person)
- Visit Jal Mahal on the way back
- Shopping at local markets

Day 4 (Jan 13): Departure
- Last-minute souvenir shopping
- Checkout and departure to airport
- Flight/train departure in evening"""
        )
        
        # Trip 3: Kerala Backwaters
        trip3 = Trip(
            user_id=1,
            destination="Kochi & Alleppey, Kerala, India",
            duration="6 days",
            travelers="2",
            budget=80000,
            trip_styles="Nature, Backwaters, Relaxation, Food",
            start_date=date(2025, 11, 15),
            end_date=date(2025, 11, 20),
            itinerary="""Day 1 (Nov 15): Arrival in Kochi
- Flight arrival at Kochi International Airport
- Check-in at houseboat resort
- Sunset cruise on backwaters (₹1200/person)
- Traditional Kerala dinner (₹800/person)

Day 2 (Nov 16): Kochi Exploration
- Visit Chinese Fishing Nets (entry free, photo ₹30)
- Tour of Paradesi Synagogue (₹50/person)
- Spice market exploration
- Sunset at Fort Kochi beach
- Dinner at Kashi Art Cafe (₹900/person)

Day 3 (Nov 17): Houseboat Backwaters
- All-day houseboat cruise (₹5000/houseboat)
- Stop at coconut lagoons
- Traditional fishing net demonstration
- On-board lunch with fish curry
- Sunset view from houseboat

Day 4 (Nov 18): Alleppey Beach & Water Sports
- Transfer to Alleppey
- Water sports: kayaking & paddleboarding (₹1500/person)
- Beach volleyball session
- Traditional Kerala lunch at beach shack (₹600/person)
- Sunset beach walk

Day 5 (Nov 19): Spa & Relaxation
- Ayurvedic treatment session (₹3000/person for 2 hours)
- Visit Kumbalangi Sanctuary (₹200/person)
- Birdwatching tour
- Local elephant sanctuary (₹1500/person)
- Evening meditation session

Day 6 (Nov 20): Departure
- Breakfast at resort
- Last-minute shopping for spices and handicrafts
- Transfer to airport
- Flight departure"""
        )
        
        # Add trips to session
        session.add(trip1)
        session.add(trip2)
        session.add(trip3)
        
        # Commit changes
        await session.commit()
        
        print("✓ Successfully added 3 Indian trips for user_id=1")
        print(f"  • Trip 1: {trip1.destination} (ID will be auto-generated)")
        print(f"  • Trip 2: {trip2.destination} (ID will be auto-generated)")
        print(f"  • Trip 3: {trip3.destination} (ID will be auto-generated)")

if __name__ == "__main__":
    asyncio.run(main())
