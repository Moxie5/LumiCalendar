# LumiCalendar

**LumiCalendar** is a simple, dependency-free JavaScript calendar component that supports both **date-only** and **datetime** selection modes. It is lightweight, fully customizable, and easy to integrate.

---

## Features

- Date-only selection
- DateTime selection
- 12-hour time format
- 24-hour time format
- Customizable day names
- Customizable month names
- Supports programmatic setting of date/datetime
- Supports programmatic getting of date/datetime via getValue()
- Simple navigation between months
- Month/year header popup for easy selection
- Highlights today’s date
- Highlights the selected date
- Allows selecting a date range (start and end dates)
- Allows selecting a datetime range (start and end with time)
- Prevents selecting dates before a minimum date (minDate)
- Prevents selecting disabled dates (setDisabled())
- Adjustable hour and minute inputs
- Adjustable AM/PM selection for 12-hour format
- Displays range selection visually on calendar
- Supports initial date display (initialDate)
- Works with single date, datetime, date range, or datetime range
---

## Installation

You can include LumiCalendar via ES module import or via script tag.

### 1. Include via `<script>` tag (browser usage)

```html
<script src="LumiCalendar.js"></script>

<div id="calendar-date"></div>
<p>Selected date: <span id="date-value">None</span></p>

<script>
/* --------------------------------------------------
       1. Date Only (Base)
    -------------------------------------------------- */
    const cal1 = new LumiCalendar({
        target: '#cal-1',
        enableDateTime: false,
        onChange: (value) => {
            document.getElementById('v1').textContent = value || 'None';
        }
    });

    /* --------------------------------------------------
       2. Date Only (Monday Start)
    -------------------------------------------------- */
    const cal2 = new LumiCalendar({
        target: '#cal-2',
        enableDateTime: false,
        startDay: 1,
        onChange: (value) => {
            document.getElementById('v2').textContent = value || 'None';
        }
    });

    /* --------------------------------------------------
       3. Date Only (Min Date)
    -------------------------------------------------- */
    const cal3 = new LumiCalendar({
        target: '#cal-3',
        enableDateTime: false,
        minDate: '2026-01-01',
        onChange: (value) => {
            document.getElementById('v3').textContent = value || 'None';
        }
    });

    /* --------------------------------------------------
       4. Disabled Ranges
    -------------------------------------------------- */
    const cal4 = new LumiCalendar({
        target: '#cal-4',
        enableDateTime: false,
        disabledDates: [
            { start: '2026-01-10', end: '2026-01-15' }
        ],
        onChange: (value) => {
            document.getElementById('v4').textContent = value || 'None';
        }
    });

    // OR Other way to set disabled dates
    // cal4.setDisabled([
    //     { start: '2026-01-10', end: '2026-01-15' }
    // ]);

    /* --------------------------------------------------
       5. DateTime (24h)
    -------------------------------------------------- */
    const cal5 = new LumiCalendar({
        target: '#cal-5',
        enableDateTime: true,
        hourFormat: '24',
        onChange: (value) => {
            document.getElementById('v5').textContent = value || 'None';
        }
    });

    /* --------------------------------------------------
       6. DateTime (12h)
    -------------------------------------------------- */
    const cal6 = new LumiCalendar({
        target: '#cal-6',
        enableDateTime: true,
        hourFormat: '12',
        onChange: (value) => {
            document.getElementById('v6').textContent = value || 'None';
        }
    });

    /* --------------------------------------------------
       7. Date Range (Date Only)
    -------------------------------------------------- */
    const cal7 = new LumiCalendar({
        target: '#cal-7',
        rangeSelection: true,
        enableDateTime: false,
        onChange: (value) => {
            document.getElementById('v7').textContent =
                value ? `Start: ${value.start}, End: ${value.end}` : 'None';
        }
    });

    /* --------------------------------------------------
       8. Date Range (Preset)
    -------------------------------------------------- */
    const cal8 = new LumiCalendar({
        target: '#cal-8',
        rangeSelection: true,
        enableDateTime: false,
        onChange: (value) => {
            document.getElementById('v8').textContent =
                value ? `Start: ${value.start}, End: ${value.end}` : 'None';
        }
    });
    cal8.setValue({ start: '2026-01-05', end: '2026-01-10' });

    /* --------------------------------------------------
       9. DateTime Range (24h)
    -------------------------------------------------- */
    const cal9 = new LumiCalendar({
        target: '#cal-9',
        rangeSelection: true,
        enableDateTime: true,
        hourFormat: '24',
        onChange: (value) => {
            document.getElementById('v9').textContent =
                value ? `Start: ${value.start}, End: ${value.end}` : 'None';
        }
    });

    /* --------------------------------------------------
       10. DateTime Range (12h)
    -------------------------------------------------- */
    const cal10 = new LumiCalendar({
        target: '#cal-10',
        rangeSelection: true,
        enableDateTime: true,
        hourFormat: '12',
        onChange: (value) => {
            document.getElementById('v10').textContent =
                value ? `Start: ${value.start}, End: ${value.end}` : 'None';
        }
    });

    /* --------------------------------------------------
       11. Localized (BG)
    -------------------------------------------------- */
    const cal11 = new LumiCalendar({
        target: '#cal-11',
        enableDateTime: true,
        startDay: 1,
        dayNames: ['Нед', 'Пон', 'Втор', 'Сря', 'Чет', 'Пет', 'Съб'],
        monthsNames: [
            'Януари','Февруари','Март','Април','Май','Юни',
            'Юли','Август','Септември','Октомври','Ноември','Декември'
        ],
        cancelButtonText: 'Отказ',
        applyButtonText: 'Запази',
        hourLabel: 'Час:',
        minuteLabel: 'Минути:',
        onChange: (value) => {
            document.getElementById('v11').textContent = value || 'None';
        }
    });

    /* --------------------------------------------------
       12. Programmatic Date
    -------------------------------------------------- */
    const cal12 = new LumiCalendar({
        target: '#cal-12',
        enableDateTime: false,
        onChange: (value) => {
            document.getElementById('v12').textContent = value || 'None';
        }
    });
    cal12.setValue('2026-02-14');

    /* --------------------------------------------------
       13. Programmatic DateTime Range
    -------------------------------------------------- */
    const cal13 = new LumiCalendar({
        target: '#cal-13',
        rangeSelection: true,
        enableDateTime: true,
        onChange: (value) => {
            document.getElementById('v13').textContent =
                value ? `Start: ${value.start}, End: ${value.end}` : 'None';
        }
    });
    cal13.setValue({
        start: '2026-03-01 09:00',
        end: '2026-03-03 18:00'
    });

    /* --------------------------------------------------
       14. Booking Style
    -------------------------------------------------- */
    const cal14 = new LumiCalendar({
        target: '#cal-14',
        rangeSelection: true,
        enableDateTime: true,
        minDate: '2026-01-01',
        disabledDates: [
            { start: '2026-01-10', end: '2026-01-12' }
        ],
        onChange: (value) => {
            document.getElementById('v14').textContent =
                value ? `Start: ${value.start}, End: ${value.end}` : 'None';
        }
    });
</script>
```

### 2. Set a value

```html
<script>
dateCalendar.setValue('2026-01-15');  // YYYY-MM-DD
// Set value for datetime
// For 12-hour format, it will automatically convert internally and display AM/PM correctly.
dateCalendar.setValue('2026-01-15 14:30');  // YYYY-MM-DD HH:mm (24-hour)
//Set date range with date and time
datetimeCalendar.setValue({ start: '2026-01-11 08:00', end: '2026-01-16 20:00' });
// Disable the dates in range
dateCalendar.setDisabled([{ start: '2026-01-20', end: '2026-01-25' }]);
</script>
```