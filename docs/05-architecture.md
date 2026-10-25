# 05. High-Level Architecture & Lifecycle Dynamics

```mermaid
flowchart TD
    subgraph Browser_Environment ["Client Browser Runtime"]
        subgraph DOM_Presentation ["Presentation Layer (HTML5 & Sass CSS)"]
            HeaderView["Header: Logo, Search Bar, User Navigation"]
            SidebarView["Sidebar: Multi-Tab Vertical / Horizontal Navigation"]
            MainView["Main: Gallery, Overview Bar, Detail Grid, CTA"]
            ModalView["Overlays: Booking Modal Dialog, Dropdowns, Toast"]
        end

        subgraph JS_Controller ["Logic & State Layer (02_Trillo/js/main.js)"]
            EventDispatcher["Event Listeners (click, input, submit, keydown)"]
            StateStore["Centralized State Store (state object)"]
            Catalog["In-Memory Catalog (DESTINATION_CATALOG)"]
            Calculations["Price Calculation & Validation Engine"]
        end

        subgraph Persistence_Layer ["Client Storage Layer"]
            LS[("window.localStorage\n('trillo_helpful_reviews')")]
        end
    end

    subgraph CDN_Infrastructure ["Global Content Delivery Network (Edge Layer)"]
        EdgeCDN["Edge POP Servers (Static HTML, CSS, JS)"]
        GoogleFontsCDN["Google Fonts (Open Sans CDN)"]
        UnsplashCDN["Unsplash Global Image CDN"]
    end

    EdgeCDN -->|HTTP/2 or HTTP/3 Cache| Browser_Environment
    GoogleFontsCDN -->|Streams Webfonts| DOM_Presentation
    UnsplashCDN -->|Streams Visual Assets| DOM_Presentation

    EventDispatcher -->|User Actions| JS_Controller
    JS_Controller <-->|Reads & Updates| StateStore
    JS_Controller -->|Queries Specs| Catalog
    JS_Controller -->|Direct DOM Mutator| DOM_Presentation
    JS_Controller <-->|Hydrates & Persists| LS
```

---

## 1. High-Level Architecture Description
Trillo is architected as an **ultra-lean, client-side Single Page Interface (SPI)** running on pure web standards. Rather than relying on a heavy JavaScript runtime or server-side templating engine, the application operates through a decoupled **Presentation-Controller-Storage pattern**:
1. **Presentation Layer**: Built with semantic HTML5 markup and modular Sass compiled into [`02_Trillo/css/style.css`](file:///Users/avishjain/avishjain9-repos/52-trilo-travel-ui/02_Trillo/css/style.css). It handles fluid Flexbox alignment, 5-breakpoint responsive reflowing, SVG mask icons, and GPU-accelerated CSS transforms.
2. **Controller & State Layer**: Encapsulated in [`02_Trillo/js/main.js`](file:///Users/avishjain/avishjain9-repos/52-trilo-travel-ui/02_Trillo/js/main.js) as an IIFE. It orchestrates user events, tab transitions, real-time live search query scanning, and interactive modal calculations.
3. **Storage Layer**: Uses the browser's native `localStorage` for cross-session reaction persistence and in-memory JavaScript registries for active catalog state.

---

## 2. Interaction Lifecycles for Core Features

### 2.1 Multi-Tab Category Transition Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Nav as .side-nav__item DOM
    participant Switcher as switchTab(key) [main.js]
    participant Data as DESTINATION_CATALOG
    participant View as Document Elements
    participant Toast as showToast()

    User->>Nav: Clicks category (e.g. 'car-rental')
    Nav->>Switcher: Event delegation listener dispatches tabKey
    Switcher->>Data: Queries DESTINATION_CATALOG['car-rental']
    Data-->>Switcher: Returns specs, pricing, and 3 Porsche photos
    Switcher->>View: Toggles .side-nav__item--active
    Switcher->>View: Swaps gallery images with 150ms opacity cross-fade
    Switcher->>View: Updates propertyHeading ('Porsche Macan GTS & Cabrios')
    Switcher->>View: Re-renders 8 car rental amenities list items
    Switcher->>Toast: showToast('Viewing Porsche Macan GTS & Cabrios')
    Toast-->>User: Displays animated bottom-right toast confirmation
```

---

### 2.2 Interactive Booking & Price Calculation Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Button as CTA 'Book now' Button
    participant Modal as Modal Engine [main.js]
    participant Overlay as .modal-overlay DOM
    participant Form as #bookingForm Controls
    participant Toast as Toast Feedback

    User->>Button: Clicks button
    Button->>Modal: openBookingModal()
    Modal->>Overlay: Adds .active class & locks document body scroll
    Modal->>Form: Sets default check-in date to tomorrow
    User->>Form: Changes Room Tier to 'Presidential Penthouse ($390)'
    Form->>Modal: recalculateBookingTotal()
    Modal->>Form: Sets #estimatedTotalAmount to '$1,170 USD' (3 nights)
    User->>Form: Clicks 'Confirm Instant Booking'
    Form->>Modal: handleBookingSubmit(e)
    Modal->>Modal: Decrements available rooms count in state
    Modal->>Overlay: Removes .active class & unlocks scroll
    Modal->>Toast: showToast('Reservation confirmed! Code: TR-...')
    Toast-->>User: Displays green confirmation toast
```

---

## 3. Database & Authentication Architecture
- **Database Backend**: **Not applicable for this project type** (Frontend-only application). State is managed via the client-side `DESTINATION_CATALOG` object and browser `localStorage`.
- **Authentication**: **Not applicable for this project type**. The user navigation bar displays a luxury traveler profile mock (*"Jonas"*) with direct access to bookmark lists and concierge messages without requiring server authentication sessions.

---

## 4. Error Handling Strategy Across Layers
1. **DOM Lookup Safety**: Elements are queried during `init()` and stored in the `DOM` cache object. All event listeners and mutators check for element existence before executing (`if (DOM.propertyHeading) ...`).
2. **Storage Fault Tolerance**: `JSON.parse` and `localStorage` interactions are guarded with default fallback objects (`|| '{}'`), preventing script crashes if cookies/storage are disabled in strict privacy modes.
3. **Timer Debouncing**: `clearTimeout(toastTimer)` is called prior to opening new notifications, preventing race conditions or flashing UI states.

---

## 5. Scaling to 100x Traffic & Bottleneck Analysis

Because Trillo is a static frontend web application with zero server runtime or database queries, scaling it to **100x or 10,000x traffic** is virtually effortless compared to traditional full-stack applications.

```mermaid
flowchart LR
    Clients["100,000 Concurrent Browsers"] --> GlobalDNS["Anycast Global DNS (Cloudflare / Route53)"]
    GlobalDNS --> EdgeNodes["Edge CDN POPs (Fastly / Cloudflare Edge)"]
    
    subgraph Edge_Delivery ["Edge Caching (100% Cache Hit Ratio)"]
        CachedHTML["index.html (Edge Cached, S-MaxAge=3600)"]
        CachedCSS["style.css (Immutable, 1-Year Cache)"]
        CachedJS["main.js (Immutable, 1-Year Cache)"]
    end

    EdgeNodes --> Edge_Delivery
    Edge_Delivery --> Origin["Static Storage Origin (AWS S3 / Netlify / Vercel)"]
```

### The First Three Potential Bottlenecks & Solutions
1. **Unsplash Image Bandwidth & Latency**:
   - *Bottleneck*: Loading high-resolution photography directly from external Unsplash URLs on every page view can consume user bandwidth and introduce third-party DNS lookups.
   - *Senior Solution*: Serve optimized WebP/AVIF images from a localized image CDN edge with responsive `srcset` definitions and `loading="lazy"`.
2. **Google Fonts Render-Blocking Request**:
   - *Bottleneck*: Requesting `Open Sans` from `fonts.googleapis.com` introduces an external network handshake that can delay First Contentful Paint (FCP).
   - *Senior Solution*: Self-host WOFF2 font files directly on the same domain with `preload` links and `font-display: swap`.
3. **Browser Execution in Low-Power Devices**:
   - *Bottleneck*: Running backdrop blur (`backdrop-filter: blur(6px)`) and heavy box-shadows on low-end mobile devices can reduce frame rates below 60fps.
   - *Senior Solution*: Utilize `@supports not (backdrop-filter: blur(6px))` fallbacks with solid background colors and `@media (prefers-reduced-motion)` guards.
