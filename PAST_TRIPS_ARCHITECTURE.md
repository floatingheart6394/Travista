# Past Trip Records - Architecture & Data Flow Diagram

## Feature Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Profile Page (Account Section)               │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │  Edit Profile │ Personal Details │ Past Trip Records │    │
│    └──────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│                    Navigates to /past-trips                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PastTripsPage - Menu View                    │
│                                                                  │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │  Trip &      │  │  Expenses    │  │  Todo Tasks  │        │
│    │  Itinerary   │  │              │  │              │        │
│    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
└───────────┼──────────────────┼──────────────────┼────────────────┘
            ↓                  ↓                  ↓
    ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Trips List    │  │ Expenses     │  │ Todos List   │
    │ with          │  │ List with    │  │ with Status  │
    │ Itineraries   │  │ Trip IDs &   │  │ & Trip IDs   │
    │               │  │ Categories   │  │              │
    └───────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow - Generating & Storing Itinerary

```
User on PlannerPage
        ↓
Fill trip details (destination, duration, budget, etc.)
        ↓
Click "Generate AI Itinerary"
        ↓
┌─────────────────────────────────────┐
│ Frontend - PlannerPage.jsx          │
│                                     │
│ 1. POST /trip/ with trip data       │
│ 2. POST /ai/chat with prompt        │
│ 3. Receive itinerary from OpenAI    │
│ 4. setItinerary(data.reply)         │
│ 5. POST /trip/ with itinerary       │ ← NEW
│    ├─ destination                   │
│    ├─ duration, travelers, budget   │
│    └─ itinerary (TEXT)              │ ← SAVES TO DB
└─────────────────────────────────────┘
        ↓ (API Requests)
┌─────────────────────────────────────┐
│ Backend - app/routes/               │
│                                     │
│ POST /trip/ handler:                │
│ 1. Receives full trip payload       │
│ 2. Updates existing trip OR creates │
│ 3. Sets itinerary column with text  │
│ 4. Commits to PostgreSQL            │
└─────────────────────────────────────┘
        ↓ (Writes to DB)
┌─────────────────────────────────────┐
│ PostgreSQL - trip.trips table       │
│                                     │
│ Row: {                              │
│   id: 1,                            │
│   user_id: 123,                     │
│   destination: "Paris",             │
│   itinerary: "Day 1: Morning..."    │
│   ...                               │
│ }                                   │
└─────────────────────────────────────┘
```

## Data Retrieval - Viewing Past Records

```
User Clicks "Past Trip Records"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ PastTripsPage.jsx - Menu View                              │
│                                                             │
│ User selects:                                              │
│ A) Trip & Itinerary    B) Expenses    C) Todo Tasks        │
└──────┬──────────────────┬──────────────────┬───────────────┘
       ↓                  ↓                  ↓
    fetchPastTrips()   fetchAllExpenses() fetchAllTodos()
       │                  │                  │
       ├─ API Call:       ├─ API Call:       ├─ API Call:
       │ GET /trip/       │ GET /budget/     │ GET /todos/
       │    past/all      │    all-expenses  │
       │                  │                  │
       └──────────────────┴──────────────────┘
                    ↓
      Backend Queries & Returns Data
                    ↓
       ┌───────────────────────────────┐
       │ Frontend Renders List View:   │
       │                               │
       │ Trip 1: Paris (ID: 1)         │
       │  - Duration: 5 days           │
       │  - Budget: ₹50,000            │
       │  - Itinerary: [scrollable]    │
       │                               │
       │ Trip 2: Tokyo (ID: 2)         │
       │  - Duration: 7 days           │
       │  - Budget: ₹75,000            │
       │  - Itinerary: [scrollable]    │
       └───────────────────────────────┘
```

## Database Schema Changes

### Before (Old)
```sql
CREATE TABLE trip.trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    destination VARCHAR NOT NULL,
    duration INTEGER,
    travelers INTEGER,
    budget NUMERIC(10,2),
    trip_styles TEXT[],
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP
);
```

### After (New)
```sql
CREATE TABLE trip.trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    destination VARCHAR NOT NULL,
    duration INTEGER,
    travelers INTEGER,
    budget NUMERIC(10,2),
    trip_styles TEXT[],
    start_date DATE,
    end_date DATE,
    itinerary TEXT,  ← NEW COLUMN (nullable)
    created_at TIMESTAMP
);
```

## Component Hierarchy

```
App.jsx
├── Route: /past-trips
│   └── PastTripsPage.jsx (Main Component)
│       ├── State: view (menu/trips/expenses/todos)
│       ├── State: trips, expenses, todos (data arrays)
│       ├── State: loading, error (status)
│       │
│       ├── Menu View (Initial)
│       │   └── 3 Card Buttons
│       │       ├── fetchPastTrips()
│       │       ├── fetchAllExpenses()
│       │       └── fetchAllTodos()
│       │
│       ├── Trips View
│       │   └── trips.map(trip => TripCard)
│       │       ├── Trip Header (Destination, ID)
│       │       ├── Trip Details Grid
│       │       └── Itinerary Section
│       │
│       ├── Expenses View
│       │   └── expenses.map(exp => ExpenseCard)
│       │       ├── Expense Header (Place, Amount)
│       │       └── Expense Details Grid
│       │
│       └── Todos View
│           └── todos.map(todo => TodoCard)
│               ├── Todo Status Icon
│               ├── Todo Content
│               └── Todo Meta Badges

ProfilePage.jsx
├── accountItems array (Account Menu)
│   └── New item: "Past Trip Records"
│       └── onClick: navigate("/past-trips")
```

## API Endpoint Mapping

### Get Past Trips with Itineraries
```
GET /trip/past/all
Header: Authorization: Bearer {token}

Response: 200 OK
[
  {
    id: 1,
    user_id: 123,
    destination: "Paris",
    duration: 5,
    travelers: 2,
    budget: 50000,
    trip_styles: ["cultural", "adventure"],
    start_date: "2025-06-01",
    end_date: "2025-06-05",
    itinerary: "Day 1:\nMorning: Arrive at CDG..."
  },
  ...
]
```

### Get All Historical Expenses
```
GET /budget/all-expenses
Header: Authorization: Bearer {token}

Response: 200 OK
[
  {
    id: 1,
    user_id: 123,
    trip_id: 1,
    place: "Eiffel Tower",
    amount: 5000,
    category: "sightseeing",
    date: "2025-06-01",
    source: "manual"
  },
  ...
]
```

### Get All Todos
```
GET /todos/
Header: Authorization: Bearer {token}

Response: 200 OK
[
  {
    id: 1,
    user_id: 123,
    trip_id: 1,
    title: "Book flights",
    description: "Book round trip",
    completed: true,
    important: true,
    created_at: "2025-05-20T10:00:00Z"
  },
  ...
]
```

## State Management Flow

```
PastTripsPage Component State:

view: "menu" | "trips" | "expenses" | "todos"
       ↓
     (User clicks a menu card)
       ↓
fetchPastTrips() / fetchAllExpenses() / fetchAllTodos()
       ↓
     API Request
       ↓
loading: true → fetch data → loading: false
       ↓
setTrips(data) / setExpenses(data) / setTodos(data)
       ↓
View state changes to render list view
       ↓
Component re-renders with actual data
```

## Styling Architecture

```
Dark Theme Gradient Background
├── Primary Colors
│   ├── Orange/Gold: #fbbf24 (main accent)
│   └── Orange: #f97316 (hover state)
├── Status Colors
│   ├── Success: #10b981 (completed items)
│   ├── Warning: #ef4444 (important items)
│   └── Info: #60a5fa (categories)
└── Typography
    ├── Headers: 2.5rem (page), 1.5rem (card)
    ├── Body: 0.95rem
    └── Badges: 0.85rem (small)

Card Layout
├── Background: rgba(255,255,255,0.05)
├── Border: 1px solid rgba(255,255,255,0.1)
├── Border-radius: 12-15px
├── Padding: 20-25px
└── Hover Effects
    ├── Background: rgba(255,255,255,0.08)
    ├── Border: #fbbf24
    ├── Shadow: 0 8px 20px rgba(251,191,36,0.1)
    └── Transform: translateY(-5px) / scale(1.1)
```

## File Structure Summary

```
/src
├── pages/
│   ├── PastTripsPage.jsx ← NEW (main component)
│   ├── ProfilePage.jsx (modified - added menu item)
│   └── PlannerPage.jsx (modified - saves itinerary)
├── styles/
│   └── PastTripsPage.css ← NEW (styling)
└── App.jsx (modified - added route)

/backend/app
├── models/
│   └── trip.py (modified - added itinerary column)
├── schemas/
│   └── trip.py (modified - added itinerary field)
├── routes/
│   ├── trip.py (modified - added /past/all endpoint)
│   ├── expense.py (modified - added /all-expenses endpoint)
│   └── todo.py (no changes needed)
└── main.py (modified - added migration)

/documentation
├── PAST_TRIPS_IMPLEMENTATION.md ← NEW (full docs)
└── PAST_TRIPS_QUICK_START.md ← NEW (user guide)
```

## User Journey Map

```
Profile Page
    ↓
    └─→ Account Section
         └─→ Past Trip Records ← NEW
             ├─→ Trip & Itinerary
             │   └─→ View trips with generated itineraries
             │       └─→ Back to menu
             ├─→ Expenses
             │   └─→ View all historical expenses
             │       └─→ Back to menu
             └─→ Todo Tasks
                 └─→ View all completed & pending tasks
                     └─→ Back to menu
```

## Performance Considerations

- **Pagination**: For users with 100+ trips/expenses, consider adding pagination
- **Caching**: Frontend could cache results with expiration
- **Filtering**: Backend queries should be indexed on (user_id, created_at)
- **Lazy Loading**: Itinerary text could be fetched separately if needed
- **Search**: Full-text search could be added on destination/place names

## Security Considerations

✅ User Authentication:
- All endpoints require valid JWT token
- Backend filters results by user_id
- User can only see their own data

✅ Data Validation:
- Pydantic schemas validate API inputs
- Trip IDs validated in URL parameters
- Expense/Todo queries filtered by user_id

✅ CORS & HTTPS:
- CORS middleware configured
- Frontend sends proper Authorization headers
- Tokens stored in localStorage
