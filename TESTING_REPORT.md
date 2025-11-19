# Fare-Based Seat Selection - Testing Report

## Test Date: November 18, 2025
## Tester: System Validation
## Environment: Production (Vercel + Railway)

---

## Phase 7: Comprehensive Testing

### Test Case 1: Economy Saver Fare - Seat Filtering
**Objective:** Verify only Economy seats are selectable for Economy Saver fare

**Steps:**
1. Navigate to Flights page
2. Search for a flight (BKK → SIN)
3. Select a departure flight
4. On Fare page, select "Economy Saver"
5. Add passenger information
6. Navigate to Seat Selection page

**Expected Results:**
- ✅ Only Economy class seats should be clickable
- ✅ Premium Economy seats should show red X
- ✅ Business class seats should show red X
- ✅ Clicking non-Economy seat shows alert: "This seat is not available for your fare class (Economy)"
- ✅ Fare badge shows "Economy Saver • Economy Class"
- ✅ Helper text: "Only Economy seats are available for your fare"

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 2: Economy Standard Fare - Seat Filtering
**Objective:** Verify only Economy seats are selectable for Economy Standard fare

**Steps:**
1. Navigate to Flights page
2. Search for a flight
3. Select a departure flight
4. On Fare page, select "Economy Standard"
5. Add passenger information
6. Navigate to Seat Selection page

**Expected Results:**
- ✅ Only Economy class seats should be clickable
- ✅ Premium Economy seats should show red X
- ✅ Business class seats should show red X
- ✅ Fare badge shows "Economy Standard • Economy Class"

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 3: Economy Plus Fare - Seat Filtering
**Objective:** Verify only Economy seats are selectable for Economy Plus fare

**Steps:**
1. Navigate to Flights page
2. Search for a flight
3. Select a departure flight
4. On Fare page, select "Economy Plus"
5. Add passenger information
6. Navigate to Seat Selection page

**Expected Results:**
- ✅ Only Economy class seats should be clickable
- ✅ Premium Economy seats should show red X
- ✅ Business class seats should show red X
- ✅ Fare badge shows "Economy Plus • Economy Class"

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 4: Premium Economy Fare - Seat Filtering
**Objective:** Verify only Premium Economy seats are selectable

**Steps:**
1. Navigate to Flights page
2. Search for a flight with cabin class "Premium Economy"
3. Select a departure flight
4. On Fare page, select "Premium Economy Saver/Standard/Plus"
5. Add passenger information
6. Navigate to Seat Selection page

**Expected Results:**
- ✅ Only Premium Economy seats should be clickable
- ✅ Economy seats should show red X
- ✅ Business seats should show red X
- ✅ Fare badge shows "Premium Economy [Saver/Standard/Plus] • Premium Economy Class"

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 5: Business Fare - Seat Filtering
**Objective:** Verify only Business seats are selectable

**Steps:**
1. Navigate to Flights page
2. Search for a flight with cabin class "Business"
3. Select a departure flight
4. On Fare page, select "Business Saver/Standard/Plus"
5. Add passenger information
6. Navigate to Seat Selection page

**Expected Results:**
- ✅ Only Business class seats should be clickable
- ✅ Economy seats should show red X
- ✅ Premium Economy seats should show red X
- ✅ Fare badge shows "Business [Saver/Standard/Plus] • Business Class"

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 6: Pricing Display on Seat Page
**Objective:** Verify correct pricing display with fare breakdown

**Steps:**
1. Complete fare selection (e.g., Economy Saver at $300)
2. Add 2 passengers
3. Navigate to Seat Selection
4. Select seats for both passengers (e.g., $600 each)

**Expected Results:**
- ✅ Per-passenger breakdown shows:
  - Base Fare: $150 (300/2)
  - Seat Selection: $600
  - Subtotal: $750
- ✅ All passengers section shows:
  - Total Base Fare (2x): $300.00
  - Total Seat Price: $1200.00
  - Grand Total: $1500.00
- ✅ Prices update dynamically when seats are selected

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 7: Pricing Display on Payment Page
**Objective:** Verify correct pricing breakdown in checkout

**Steps:**
1. Complete seat selection with known prices
2. Navigate to Payment page

**Expected Results:**
- ✅ Price Summary shows:
  - Base Fare (Economy Saver): $300.00
  - Seat Selection: $1200.00
  - Support Service: $0.00 (if not selected)
  - Fast Track: $0.00 (if not selected)
  - Taxes & Fees: $0.00
  - Total Amount: $1500.00
- ✅ All line items are clearly labeled
- ✅ Total matches seat page calculation

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 8: Visual Indicators - Tooltips
**Objective:** Verify tooltips work correctly

**Steps:**
1. Navigate to Seat Selection page
2. Hover over different seat types

**Expected Results:**
- ✅ Available seats show: "[Class] - $[Price]"
- ✅ Booked seats show: "Seat already booked"
- ✅ Non-selectable seats show: "Not available for [Cabin Class] fare"
- ✅ Tooltip appears on hover with dark background

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 9: Visual Indicators - Legend
**Objective:** Verify seat legend is complete and accurate

**Steps:**
1. Navigate to Seat Selection page
2. Check legend items

**Expected Results:**
- ✅ Available (light blue)
- ✅ Booked (gray)
- ✅ Your Selection (dark blue)
- ✅ Other Passenger (green) - if multiple passengers
- ✅ Not Available for Your Fare (gray with red X)

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 10: Backend Validation - Correct Seat Class
**Objective:** Verify backend accepts matching seat classes

**Steps:**
1. Select Economy Saver fare
2. Select Economy seats
3. Complete booking

**Expected Results:**
- ✅ Booking creation succeeds
- ✅ No validation errors
- ✅ Booking confirmation received

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 11: Backend Validation - Incorrect Seat Class
**Objective:** Verify backend rejects mismatched seat classes

**Test Method:** API Testing (requires manual API call or browser console)

**Steps:**
1. Intercept booking request in browser DevTools
2. Modify request to send:
   - cabin_class: "Economy"
   - seat_id: [Business class seat ID]
3. Send modified request

**Expected Results:**
- ✅ Backend returns 400 error
- ✅ Error code: "SEAT_CLASS_MISMATCH"
- ✅ Error message: "Selected seats do not match your fare class (Economy)"
- ✅ Details include incompatible seat information

**Status:** ⏳ PENDING API TEST

---

### Test Case 12: Multiple Passengers - All Economy
**Objective:** Verify multiple passengers can select Economy seats

**Steps:**
1. Select Economy Saver fare
2. Add 3 passengers
3. Select Economy seats for all passengers
4. Complete booking

**Expected Results:**
- ✅ All passengers can select different Economy seats
- ✅ Selected seats show in different colors per passenger
- ✅ Total pricing calculates correctly (base fare + 3 seat prices)
- ✅ Booking succeeds

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 13: Edge Case - No Available Seats in Class
**Objective:** Verify behavior when all seats in fare class are booked

**Steps:**
1. Select a fare class
2. Navigate to seat selection
3. Check if any seats are available

**Expected Results:**
- ✅ If no seats available, user should see message
- ✅ Cannot proceed without seat selection
- ✅ Clear error message displayed

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 14: Price Consistency Across Pages
**Objective:** Verify prices remain consistent throughout booking flow

**Steps:**
1. Note fare price on Fare page (e.g., $405 for Economy Plus)
2. Note seat prices on Seat page
3. Note total on Payment page
4. Calculate manually

**Expected Results:**
- ✅ Fare page price = Payment page "Base Fare"
- ✅ Seat page "Total Seat Price" = Payment page "Seat Selection"
- ✅ Seat page "Grand Total" = Payment page "Total Amount"
- ✅ All calculations are mathematically correct

**Status:** ⏳ PENDING MANUAL TEST

---

### Test Case 15: Browser Console Logging
**Objective:** Verify debug logging works correctly

**Steps:**
1. Open browser DevTools console
2. Go through booking flow
3. Check console logs

**Expected Results:**
- ✅ Fare selection logs: "Selected Fare", "Fare Price", "Cabin Class"
- ✅ Seat filtering logs: "Fare Options", "Cabin Class", "Allowed: [classes]"
- ✅ Seat selection logs: "Base Fare Price", "Total Seat Price", "Grand Total"
- ✅ Payment logs: "Using total price from fare options"

**Status:** ⏳ PENDING MANUAL TEST

---

## Test Summary

### Total Test Cases: 15
- ✅ Passed: 0
- ❌ Failed: 0
- ⏳ Pending: 15

### Critical Issues Found: 0
### Minor Issues Found: 0

---

## Manual Testing Instructions

### Prerequisites:
1. Deployed frontend on Vercel
2. Deployed backend on Railway
3. Database populated with flights, seats, and airports
4. Test user account created

### Testing Checklist:
- [ ] Test Case 1: Economy Saver
- [ ] Test Case 2: Economy Standard
- [ ] Test Case 3: Economy Plus
- [ ] Test Case 4: Premium Economy
- [ ] Test Case 5: Business
- [ ] Test Case 6: Seat Page Pricing
- [ ] Test Case 7: Payment Page Pricing
- [ ] Test Case 8: Tooltips
- [ ] Test Case 9: Legend
- [ ] Test Case 10: Backend Success
- [ ] Test Case 11: Backend Validation
- [ ] Test Case 12: Multiple Passengers
- [ ] Test Case 13: No Available Seats
- [ ] Test Case 14: Price Consistency
- [ ] Test Case 15: Console Logging

---

## Notes for Manual Tester:

1. **Browser DevTools:** Keep console open to verify logging
2. **Network Tab:** Monitor API requests/responses
3. **Screenshots:** Take screenshots of any issues
4. **Error Messages:** Document exact error text
5. **Pricing:** Use calculator to verify all calculations

---

## Sign-off

**Developer:** System
**Date:** November 18, 2025
**Status:** Ready for Manual Testing

All automated checks passed. System is ready for comprehensive manual testing.
