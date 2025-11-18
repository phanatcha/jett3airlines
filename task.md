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

## Phase 7: Testing ⏳
- [⏳] **7.1** Test Economy Saver → only economy seats selectable (See TESTING_REPORT.md)
- [⏳] **7.2** Test Economy Plus → only economy seats selectable (See TESTING_REPORT.md)
- [⏳] **7.3** Test Premium Economy → only premium seats selectable (See TESTING_REPORT.md)
- [⏳] **7.4** Test Business → only business seats selectable (See TESTING_REPORT.md)
- [⏳] **7.5** Verify price calculations are correct throughout flow (See TESTING_REPORT.md)
- [⏳] **7.6** Test edge cases (no available seats in selected class) (See TESTING_REPORT.md)

**Note:** All test cases documented in TESTING_REPORT.md. Ready for manual testing.

---

## Implementation Summary

### ✅ Completed Features:

1. **Fare-Based Seat Filtering**
   - Economy fares (Saver/Standard/Plus) → Only basic Economy seats (excludes $600 Premium Economy)
   - Premium Economy fare → Only $600 Premium Economy seats
   - Business fare → Only $1200 Business seats

2. **Visual Indicators**
   - Red X overlay on non-selectable seats
   - Gray/dimmed appearance for unavailable seats
   - Tooltips explaining why seats are unavailable
   - Complete legend with all seat states

3. **Pricing Integration**
   - Base fare from Fare page displayed on Seat page
   - Per-passenger pricing breakdown
   - Total pricing with all passengers
   - Complete price summary on Payment page

4. **Backend Validation**
   - Validates seat class matches fare class
   - Checks both seat class name AND price for Premium Economy
   - Returns detailed error messages for mismatches

### 🔧 Technical Implementation:

**Frontend (Seat.jsx):**
- `getAllowedSeatClasses()` - Determines allowed seat classes based on fare
- `isSeatSelectable()` - Checks both class and price for seat eligibility
- `renderSeatContent()` - Shows X for non-selectable seats with tooltip
- Dynamic pricing calculation and display

**Backend (bookingsController.ts):**
- Seat class validation in `createBooking()`
- Price-based validation for Premium Economy ($600)
- Detailed error responses with incompatible seat information

### 📊 Current Status:
- **Phases 1-6:** ✅ Complete
- **Phase 7:** ⏳ Ready for manual testing (see TESTING_REPORT.md)

---

## Notes
- Selected fare on Fare page: Economy Saver ($300), Economy Standard ($345), Economy Plus ($405)
- Seat prices: Economy (varies), Premium Economy ($600), Business ($1200)
- $600 seats are exclusively reserved for Premium Economy fare class
- Total price includes base fare + seat selection + optional services
