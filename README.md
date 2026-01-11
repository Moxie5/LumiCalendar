# LumiCalendar

A simple, **dependency-free JavaScript calendar component**.  
Supports both **date-only** and **datetime selection** modes.  

---

## Features

- Select single dates or full date + time (datetime)  
- 12-hour or 24-hour time format  
- Start week on Sunday or Monday (configurable)  
- Display custom day and month names  
- Highlight today’s date  
- Select, update, and programmatically set dates  
- Fully customizable through simple configuration  

---

## Installation / Usage

### 1. Include via `<script>` tag (browser usage)

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
### 2. Include via ES module
```javascropt
import LumiCalendar from './LumiCalendar.js';

const datetimeCalendar = new LumiCalendar({
    target: '#calendar-datetime',
    enableDateTime: true,
    hourFormat: '12',
    onChange: (value) => {
        console.log('Selected datetime:', value);
        document.getElementById('datetime-value').textContent = value || 'None';
    }
});
```