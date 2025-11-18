# Task List: Fare-Based Seat Selection & Pricing

## Phase 1: Data Flow & State Management ✅
- [x] **1.1** Pass selected fare class from Fare page to Seat page via BookingContext
- [x] **1.2** Pass base price and fare multipliers from Fare page to Seat page
- [x] **1.3** Store selected cabin class (Economy Saver/Standard/Plus) in booking context
- [x] **1.4** Pass calculated fare price to checkout/payment page

## Phase 2: Seat Filtering Logic ✅
- [x] **2.1** Fetch seat data with class information from backend
- [x] **2.2** Filter seats based on selected fare class:
  - Economy Saver → Only Economy seats (exclude $600 Premium Economy)
  - Economy Standard → Only Economy seats (exclude $600 Premium Economy)
  - Economy Plus → Only Economy seats (exclude $600 Premium Economy)
  - Premium Economy → Only Premium Economy seats ($600)
  - Business → Only Business seats ($1200)
- [x] **2.3** Mark non-selectable seats (different class) as disabled

## Phase 3: Visual Indicators ✅
- [x] **3.1** Add cross (X) icon/overlay on non-selectable seats
- [x] **3.2** Gray out or dim non-selectable seats
- [x] **3.3** Show tooltip explaining why seat is not selectable
- [x] **3.4** Update seat legend to show "Not Available for Your Fare"

## Phase 4: Pricing Display ✅
- [x] **4.1** Display base fare price from Fare page on Seat page
- [x] **4.2** Show seat-specific upcharges (if any) for premium economy/business
- [x] **4.3** Calculate and display total price per passenger
- [x] **4.4** Update price dynamically when seat is selected

## Phase 5: Checkout Integration ✅
- [x] **5.1** Pass final calculated price (fare + seat) to Payment page
- [x] **5.2** Display fare breakdown in checkout:
  - Base fare (from Fare page)
  - Seat selection fee (if applicable)
  - Support service
  - Fast track service
  - Taxes & fees
  - Total amount
- [x] **5.3** Ensure price consistency across all pages

## Phase 6: Backend Validation ✅
- [x] **6.1** Validate seat class matches booked fare class on backend
- [x] **6.2** Return error if user tries to book incompatible seat
- [x] **6.3** Store fare class and pricing in booking record

## Phase 7: Testing
- [ ] **7.1** Test Economy Saver → only economy seats selectable
- [ ] **7.2** Test Economy Plus → only economy seats selectable
- [ ] **7.3** Test Premium Economy → only premium seats selectable
- [ ] **7.4** Test Business → only business seats selectable
- [ ] **7.5** Verify price calculations are correct throughout flow
- [ ] **7.6** Test edge cases (no available seats in selected class)

---

## Notes
- Selected fare on Fare page: Economy Saver ($300), Economy Standard ($345), Economy Plus ($405)
- Seat prices: Economy ($600), Premium Economy ($600), Business ($1200)
- Need to add cross (X) on non-selectable seats
- Total price should include fare multiplier from Fare page
