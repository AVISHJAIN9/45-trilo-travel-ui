# Feature F8: Responsive Multi-Breakpoint Flexbox Layout System

```mermaid
flowchart TD
    Viewport[Browser Viewport Size]
    
    Viewport -->|> 1200px (75em)| Widescreen["Centered Container (max-width: 120rem)\nMargin: 8rem auto\nVertical Sidebar"]
    Viewport -->|900px - 1100px (68.75em)| TabletLandscape["Container Width: 100%, Margin: 0\nFont Size: 50% (1rem = 8px)\nVertical Sidebar"]
    Viewport -->|600px - 900px (56.25em)| TabletPortrait["Sidebar flips to Horizontal Row\nDetail section remains 2 columns"]
    Viewport -->|320px - 600px (37.5em)| Mobile["Detail section stacks into 1 Column\nHeader wraps search bar to 100% width\nSidebar navigation icons stack vertically"]
```

---

## 1. Feature Overview & Breakpoint System
The **Responsive Flexbox Layout System** guarantees pixel-perfect visual fidelity across all screen dimensions. Rather than relying on rigid frameworks, it employs pure CSS Flexbox paired with REM base unit scaling. When viewports narrow below key thresholds, container boundaries expand to 100%, macro-navigation elements reflow, and typography scales down proportionally.

### Breakpoint Architecture

| Breakpoint Name | Media Query | Layout Transformation |
| :--- | :--- | :--- |
| **Widescreen Desktop** | Default / `> 1200px` | Centered 120rem container with deep shadow over gradient background. |
| **Tablet Landscape** | `max-width: 68.75em` (1100px) | HTML font-size scales from 62.5% to 50% (1rem = 8px). Full width container. |
| **Tablet Portrait** | `max-width: 56.25em` (900px) | Sidebar switches from `flex-direction: column` to `row`. Copyright hidden. |
| **Mobile Phone** | `max-width: 37.5em` (600px) | Detail section switches from 2-column flex to single stacked vertical column. |
| **Compact Mobile** | `max-width: 31.25em` (500px) | Header search input wraps to full width below logo and user navigation (`order: 1`). |

---

## 2. Say It Out Loud

> *"I built the layout using a responsive Flexbox architecture backed by a 62.5% root REM scaling strategy. By setting `font-size: 62.5%` on the HTML element, one REM equals ten pixels, making responsive sizing calculations intuitive. I defined custom mixins across five breakpoints—ranging from ultra-wide desktops down to phones under 600 pixels. At critical thresholds, the sidebar transforms from a vertical column into a horizontal navigation bar, the two-column review section stacks vertically, and the root font size scales down to ensure harmonious typography. I chose pure Flexbox over CSS Grid here because the 1-dimensional alignment requirements of the header, sidebar, and detail columns were ideally suited for Flexbox with zero polyfill requirements."*
