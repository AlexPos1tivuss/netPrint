# Design Guidelines: Russian Photo Printing Service (NetPrint Parody)

## Design Approach
**Reference-Based Design** inspired by netprint.ru's professional photo service aesthetic, adapted for Russian e-commerce conventions with comprehensive functionality.

## Core Design Principles
1. **Functional Clarity**: Every element serves a clear purpose in the user journey from product selection to checkout
2. **Trust & Professionalism**: Clean, trustworthy design appropriate for handling customer photos and payments
3. **Information Density**: Balance between showcasing services and maintaining breathing room
4. **Progressive Disclosure**: Complex configuration options revealed step-by-step

## Typography System
**Font Stack**: 
- Primary: 'Roboto' or 'Inter' via Google Fonts (excellent Cyrillic support)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Hierarchy**:
- Hero Headlines: text-4xl to text-5xl, font-bold
- Section Headers: text-3xl, font-semibold
- Subsection Titles: text-xl to text-2xl, font-semibold
- Product Names: text-lg, font-medium
- Body Text: text-base, font-normal
- Price Display: text-2xl to text-3xl, font-bold for emphasis
- Labels & Metadata: text-sm, font-medium
- Helper Text: text-sm, font-normal

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20 (desktop), py-8 to py-12 (mobile)
- Card gaps: gap-4 to gap-6
- Form field spacing: space-y-4 to space-y-6

**Container Widths**:
- Full-width sections: w-full with max-w-7xl mx-auto px-4
- Content sections: max-w-6xl mx-auto
- Forms & configurators: max-w-4xl mx-auto
- Admin tables: max-w-full with horizontal scroll on mobile

**Grid Patterns**:
- Service cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Photographer profiles: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
- Order history: Single column stack with card layout
- Admin dashboard: grid-cols-1 lg:grid-cols-3 for statistics

## Page Structures

### Main Public Pages

**Homepage/Product Selection**:
- Header: Logo (left), navigation menu (center), cart + profile icons (right), phone number prominent
- Hero Section (60vh): Large banner showcasing photo products with primary CTA "Начать заказ"
- Product Type Selection: Three large cards (Фотоальбом, Фотографии, Календарь) in grid layout with icons and descriptions
- Trust Indicators: Benefits row (быстрая доставка, гарантия качества, тысячи клиентов)
- Services Preview: Photographer services highlight with sample photos
- Footer: Multi-column (company info, services, contacts, social links)

**Product Configuration Page**:
- Breadcrumb navigation
- Two-column layout (lg:): Left - parameter selection panel (sticky), Right - product preview + price display
- Parameter sections in accordions or tabs: размер, тип бумаги, количество страниц/фото, обложка, etc.
- Live price calculator with breakdown (highlighted in card)
- Photo source selection: Toggle between "Загрузить фото" / "Услуга фотографа"
- Primary CTA button: "Добавить в корзину" or "Продолжить"

**Photo Upload Interface**:
- Drag-and-drop zone with visual feedback
- Grid display of uploaded images (4 columns on desktop, 2 on tablet, 1 on mobile)
- Counter display: "15/20 фото загружено"
- Individual photo actions: delete, reorder via drag-and-drop
- Progress indicators for uploads

**Photographer Service Selection**:
- Photographer cards: Photo, name, rating (stars), specialization, price per hour
- Selection: Radio buttons or highlighted card state
- Map integration: Full-width Google Maps embed with location marker
- Date/time picker: Calendar component + time slots in grid
- Summary card: Selected photographer, location, date/time, total price

**Shopping Cart**:
- Line items with thumbnail, product details, parameters summary, quantity (if applicable), price
- Order summary card (sticky on desktop): subtotal, услуги, доставка, итого
- CTA: "Оформить заказ"

### User Dashboard

**Profile Layout**:
- Sidebar navigation (desktop) / dropdown menu (mobile): Мои заказы, Настройки, Выход
- Orders table/cards: Order ID, product type, status badge, date, price, action button "Подробнее"
- Order details modal/page: Full order information, status timeline, photos if uploaded, photographer details if selected

**Order Details**:
- Status badge with color coding (В обработке, В производстве, Готов к выдаче, Доставлен)
- Product configuration recap
- Timeline visualization of status changes
- Photographer information panel (if applicable): name, photo, съемка scheduled for date/time, location

### Admin Panel

**Admin Dashboard**:
- Statistics grid: Total orders (today/week/month), revenue, active users, pending orders
- Charts: Line chart for revenue trend, bar chart for popular products
- Quick actions: recent orders list with status update dropdown
- Navigation sidebar: Dashboard, Заказы, Магазин, Статистика

**Orders Management**:
- Data table: filterable and sortable columns (ID, клиент, продукт, статус, дата, сумма)
- Inline status editing: Dropdown to change order status
- Row actions: View details, edit
- Pagination controls

**Store Management**:
- Tabs for different sections: Products, Photographers, Settings
- Product editor: parameters and pricing configuration
- Photographer management: Add/edit profiles with photo upload

## Component Library

### Navigation
- Top header: Horizontal menu with dropdowns for categories
- Mobile: Hamburger menu transforming to full-screen overlay
- Cart indicator: Badge with item count
- User menu: Dropdown with profile options

### Cards
- Product cards: Image, title, description snippet, price range, CTA button
- Photographer cards: Circular avatar, name, rating stars, specialization badges, hourly rate
- Order cards: Compact layout with key info, expandable for details
- Statistic cards (admin): Large number display, label, percentage change indicator

### Forms
- Input fields: Consistent height (h-12), rounded corners (rounded-lg), clear labels above
- Select dropdowns: Custom styled with chevron icon
- Radio/checkbox groups: Clear visual selection states
- File upload: Dashed border zone with icon and instruction text
- Validation: Inline error messages in contrasting treatment

### Modals & Overlays
- Modal windows: Centered, max-w-2xl, backdrop blur
- Image viewer: Full-screen overlay for uploaded photos
- Confirmation dialogs: Compact, centered, clear action buttons

### Buttons
- Primary (CTA): Large, bold, rounded, clear text
- Secondary: Outlined or ghost style
- Icon buttons: Circular or square, for actions like delete/edit
- Button sizes: Small (py-2 px-4), Medium (py-3 px-6), Large (py-4 px-8)
- States: Hover (subtle scale/opacity), Active (slight depression), Disabled (reduced opacity)

### Data Display
- Tables: Striped rows, clear headers, sortable columns, responsive (horizontal scroll on mobile)
- Status badges: Rounded pill shape, size-appropriate for context
- Price display: Prominent sizing, "₽" symbol, formatted with spaces (1 000 ₽)
- Date/time: Consistent format (DD.MM.YYYY, HH:MM)

### Maps & Location
- Google Maps embed: Minimum height 400px, rounded corners
- Location marker: Custom icon if possible, or default pin
- Search box: Integrated above map

### Calendar & Time Picker
- Calendar: Month view grid, selectable dates highlighted, disabled past dates
- Time slots: Grid of buttons for available times (2-hour intervals)

## Images

**Hero Section**: Large banner image (1920x600px minimum) showcasing finished photo products - photo albums, calendars, printed photos arranged artistically. Should convey quality and professionalism.

**Product Type Cards**: Individual product images:
- Photo album: Elegant hardcover album, slightly open
- Photos: Stack or fan of glossy prints
- Calendar: Wall calendar showing current month

**Photographer Profiles**: Professional headshots (400x400px) for each of the 3 default photographers - friendly, professional appearance

**Service Highlight Sections**: Lifestyle images showing happy customers with photo products, delivery person, printing equipment

**Placeholder Images**: Use for user uploads before actual photos loaded

## Animations & Interactions

**Subtle Enhancements**:
- Fade-in on scroll for section entries (50-100ms delay)
- Smooth transitions for tab/accordion switches (200ms)
- Hover scale on cards (scale-105, duration-200)
- Loading spinners for async operations
- Progress bar for photo uploads
- Toast notifications for actions (success/error messages)

**Avoid**: Heavy parallax, excessive motion, distracting background animations

## Accessibility & Quality Standards

- All buttons and links must have clear, descriptive text in Russian
- Form labels must be associated with inputs
- Error states must be clearly visible and explained
- Keyboard navigation must work throughout
- Focus states must be visible for interactive elements
- Sufficient contrast ratios throughout
- Touch targets minimum 44x44px on mobile

## Russian Localization Specifics

- All text in Russian language
- Date format: DD.MM.YYYY
- Time format: 24-hour (HH:MM)
- Currency: Russian rubles (₽) with proper formatting (spaces for thousands)
- Phone numbers: Russian format +7 (XXX) XXX-XX-XX
- Formal/informal address: Use formal "Вы" in all customer-facing text
- Cultural appropriateness: Professional, trustworthy tone

This comprehensive design system ensures a polished, fully-functional Russian photo printing service that mirrors netprint.ru's professionalism while delivering all required features with clarity and style.