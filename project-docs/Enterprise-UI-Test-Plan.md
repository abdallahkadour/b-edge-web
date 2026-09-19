<!--
  Provenance: supplied by the founder on 2026-09-19 as `enterprise_ui_test_plan.md`
  and reproduced here verbatim so the execution report has a stable referent.

  Executed against the production bundle on 2026-09-19. Results, including the
  two sections that could NOT be executed in this environment, are in
  Enterprise-UI-Test-Plan-Execution-2026-09-19.md alongside this file.
-->

# Enterprise UI Test Plan: Booking Platform (Fresha-Style)

Designing an enterprise-grade UI test plan for a booking platform requires strict attention to touch interactions, dynamic calendars, and viewport constraints. To ensure a flawless booking experience across the fragmented landscape of mobile and tablet browsers, this strategy isolates the unique behaviors of each ecosystem and focuses heavily on the critical path to revenue.

## 1. Device & Viewport Targeting Matrix

An enterprise strategy relies on data-driven device selection, targeting the highest market share while accounting for critical edge-case aspect ratios and rendering engines.

| Device Tier | Target Devices | Viewport Resolution (CSS) | OS / Browser Focus |
| :--- | :--- | :--- | :--- |
| **iOS Mobile** | iPhone 13/14/15/16 Pro Max | 430 × 932 | iOS Safari, Chrome for iOS |
| **iOS Mobile** | iPhone SE (3rd Gen) | 375 × 667 | iOS Safari (Small screen baseline) |
| **Android Mobile** | Samsung Galaxy S23/S24 Ultra | 360 × 800 | Android Chrome, Samsung Internet |
| **Android Mobile**| Samsung Galaxy Z Fold 5/6 | 344 × 882 / 882 × 1134 | Android Chrome (Foldable edge case) |
| **Tablet** | iPad Pro 12.9" / 13" | 1024 × 1366 | iPadOS Safari (Desktop-class rendering) |
| **Tablet** | iPad Air / Standard | 820 × 1180 | iPadOS Safari, Chrome |

---

## 2. Core UI Functional Testing (The Booking Flow)

This phase validates the functional interactivity of the scheduling flow, which behaves drastically differently across touch devices.

*   **Date & Time Pickers:** Verify native versus custom calendar rendering. Native date pickers behave differently on iOS Safari compared to Samsung Internet. Ensure touch targets for selecting time slots are at least `44x44px` (Apple's HIG standard).
*   **Virtual Keyboard Deployments:** Trigger the correct virtual keyboard (e.g., numeric pad for phone numbers/credit cards, email pad for email inputs). Disable auto-zoom on input focus for iOS Safari by ensuring the input `font-size` is at least `16px`.
*   **Modals & Bottom Sheets:** When selecting staff members or service variations, ensure bottom-sheet overlays can be swiped down or dismissed without closing the entire browser tab or triggering the browser's native "pull-to-refresh."
*   **Sticky Elements:** Test sticky "Book Now" footers and navigation headers. Verify they do not overlap crucial content or form fields when the virtual keyboard is deployed.

---

## 3. Visual & Responsive Layout Validation

*   **Orientation Switching:** Rotate devices from portrait to landscape. Verify the grid recalibrates smoothly (e.g., transitioning from a 1-column service list on mobile to a 2-column or 3-column masonry grid on an iPad).
*   **Safe Area Insets:** Ensure UI elements respect the `env(safe-area-inset-bottom)` and top notches on iPhones, preventing the iOS home indicator bar from overlapping your bottom navigation buttons.
*   **Asset Aspect Ratios:** Validate aspect ratios of makeup portfolio images. Ensure `object-fit: cover` CSS is applied so images do not warp or stretch on ultra-wide or narrow screens.

---

## 4. Performance & Network Simulation

*   **Stateful Loading:** Throttle the connection to "Fast 3G" to test the skeleton loaders or UI spinners while the booking API fetches available time slots. The UI must not freeze or allow double-booking clicks during this latency.
*   **Image Lazy Loading:** Scroll rapidly through the service and portfolio catalog. Verify off-screen images defer loading to save mobile bandwidth, and that layout shifts (Cumulative Layout Shift) do not occur as images populate.

---

## 5. Enterprise Execution Strategy

*   **Real Device Cloud:** Execute these tests on real physical devices using device farms (like BrowserStack, Sauce Labs, or AWS Device Farm) rather than relying solely on Chrome DevTools emulation. Emulation cannot replicate iOS Safari's WebKit rendering engine or true mobile touch events.
*   **Automated Visual Regression:** Integrate UI automation frameworks (like Playwright or Cypress) with visual testing tools (like Applitools or Percy) to automatically catch pixel-level deviations across the matrix on every pull request, freeing up manual QA for complex exploratory testing.