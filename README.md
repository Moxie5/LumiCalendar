# LumiCalendar

**LumiCalendar** is a simple, dependency-free JavaScript calendar component that supports both **date-only** and **datetime** selection modes. It is lightweight, fully customizable, and easy to integrate.

---

## Features

- Date-only or datetime selection
- 12-hour or 24-hour time format
- Customizable day names and month names
- Supports programmatic setting and getting of selected date
- Simple navigation between months
- Highlights today’s date and selected date

---

## Installation

You can include LumiCalendar via ES module import or via script tag.

### 1. Using ES Module

```javascript
import LumiCalendar from './path/to/LumiCalendar.js';

const calendar = new LumiCalendar({
    target: '#calendar',        // Selector for the container element
    enableDateTime: true,       // Enable date + time selection
    hourFormat: '12',           // '12' or '24'
    startDay: 1,                // 0 = Sunday, 1 = Monday
    dayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    monthsNames: ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'],
    initialDate: '2026-01-11', // Optional: initial displayed date
    onChange: (value) => {
        console.log('Selected value:', value);
    }
});
```

### 2. Include via `<script>` tag (browser usage)

```html
<script src="LumiCalendar.js"></script>

<div id="calendar-date"></div>
<p>Selected date: <span id="date-value">None</span></p>

<script>
const dateCalendar = new LumiCalendar({
    target: '#calendar-date',
    enableDateTime: false,
    onChange: (value) => {
        console.log('Selected date:', value);
        document.getElementById('date-value').textContent = value || 'None';
    }
});
</script>
```