/**
 * LumiCalendar - A simple, dependency-free JavaScript calendar component
 * Supports both date-only and datetime selection modes
 */
class LumiCalendar {
    constructor(config) {
        this.target = config.target;
        this.enableDateTime = config.enableDateTime || false;
        this.onChange = config.onChange || null;
        this.hourFormat = config.hourFormat || '24'; // '12' or '24'
        // Current view date (month/year being displayed)
        this.currentDate = config.initialDate ? new Date(config.initialDate) : new Date();
        // Start day of week (0 = Sunday, 1 = Monday)
        this.startDay = typeof config.startDay === 'number' ? config.startDay : 0;
        this.dayNames = (() => {
            const names = config.dayNames || ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            return names.slice(this.startDay).concat(names.slice(0, this.startDay));
        })();              
        this.monthsNames = config.monthsNames || ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        this.applyButtonText = config.applyButtonText || 'Apply';
        this.cancelButtonText = config.cancelButtonText || 'Cancel';
        this.hourLabel = config.hourLabel || 'Hour:';
        this.minuteLabel = config.minuteLabel || 'Minute:';
        // Selected value (date or datetime)
        this.selectedValue = null;
        // Range selection properties
        this.rangeSelection = config.rangeSelection || false; // enable range mode
        this.startDate = null;  // first selected date
        this.endDate = null;    // last selected date
        if (this.rangeSelection) {
            if (config.startDate) this.startDate = new Date(config.startDate);
            if (config.endDate) this.endDate = new Date(config.endDate);
        }
        // Datetime range support
        this.startTime = { hours: 12, minutes: 0 };
        this.endTime = { hours: 12, minutes: 0 };
        this.activeRangePart = 'start'; // 'start' | 'end'
        this.minDate = config.minDate ? new Date(config.minDate) : null; //everything before this is disabled
        // Track AM/PM state for 12-hour format (internal, not shown to user)
        this.currentIsPM = false;
        this.viewMode = 'days'; // 'days' | 'month-year'
        this.tempDate = null;  // used while selecting month/year
        // Array of disabled ranges [{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }]
        this.disabledRanges = (config.disabledDates || []).map(range => ({
            start: new Date(range.start),
            end: new Date(range.end)
        }));
        // Initialize the calendar
        this.init();
    }
    
    /**
     * Initialize the calendar DOM structure
     */
    init() {
        const container = document.querySelector(this.target);
        if (!container) {
            console.error(`Calendar target "${this.target}" not found`);
            return;
        }
        
        container.innerHTML = '';
        container.className = 'custom-calendar';
        
        // Create calendar structure
        this.render();
    }
    
    /**
     * Render the calendar UI
     */
    render() {
        const container = document.querySelector(this.target);
        if (!container) return;
        
        // Find and remove existing calendar wrapper, or clear container
        const existingWrapper = container.querySelector('.calendar-wrapper');
        if (existingWrapper) {
            existingWrapper.remove();
        } else {
            // If no wrapper exists, clear the container (but keep the class)
            const containerClass = container.className;
            container.innerHTML = '';
            container.className = containerClass || 'custom-calendar';
        }
        
        // Calendar wrapper
        const calendarWrapper = document.createElement('div');
        calendarWrapper.className = 'calendar-wrapper';
        
        // Header with month/year and navigation
        const header = this.createHeader();
        calendarWrapper.appendChild(header);
        
        // Calendar grid
        if (this.viewMode === 'month-year') {
            calendarWrapper.appendChild(this.createMonthYearView());
        } else {
            calendarWrapper.appendChild(this.createGrid());
        }        
        
        // Time picker (only if datetime mode is enabled)
        if (this.enableDateTime) {
            const timePicker = this.createTimePicker();
            calendarWrapper.appendChild(timePicker);
        }
        
        container.appendChild(calendarWrapper);
    }

    createMonthYearView() {
        const wrapper = document.createElement('div');
        wrapper.className = 'month-year-view';
    
        // Year selector
        const yearControl = document.createElement('div');
        yearControl.className = 'year-control';

        // Scrollable year container
        const yearContainer = document.createElement('div');
        yearContainer.className = 'year-scroll-container';

        // Show 10 years around current year
        const currentYear = this.tempDate.getFullYear();
        const startYear = currentYear - 5;
        const endYear = currentYear + 5;

        for (let y = startYear; y <= endYear; y++) {
            const yearItem = document.createElement('div');
            yearItem.className = 'year-item';
            yearItem.textContent = y;

            if (y === currentYear) {
                yearItem.classList.add('active');
            }

            yearItem.onclick = () => {
                this.tempDate.setFullYear(y);

                // update active state
                yearContainer.querySelectorAll('.year-item').forEach(el => el.classList.remove('active'));
                yearItem.classList.add('active');
            };

            yearContainer.appendChild(yearItem);
        }

        // Append the scrollable container to yearControl
        yearControl.appendChild(yearContainer);

        // Scroll the active year into the center
        setTimeout(() => {
            const activeYear = yearContainer.querySelector('.year-item.active');
            if (activeYear) {
                activeYear.scrollIntoView({
                    behavior: 'smooth', 
                    block: 'nearest',   // vertical: don’t scroll
                    inline: 'center'    // horizontal: center in container
                });
            }
        }, 0);        
    
        // Month grid
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';
    
        this.monthsNames.forEach((month, index) => {
            const m = document.createElement('div');
            m.className = 'month-item';
            m.textContent = month.substring(0, 3);
    
            if (index === this.tempDate.getMonth()) {
                m.classList.add('active');
            }

            m.onclick = () => {
                this.tempDate.setMonth(index);
            
                // update active state visually
                monthGrid.querySelectorAll('.month-item').forEach(el => {
                    el.classList.remove('active');
                });
                m.classList.add('active');
            };            
    
            monthGrid.appendChild(m);
        });
    
        // Actions
        const actions = document.createElement('div');
        actions.className = 'month-year-actions';
    
        const cancel = document.createElement('button');
        cancel.textContent = this.cancelButtonText;
        cancel.onclick = () => {
            this.viewMode = 'days';
            this.render();
        };
    
        const apply = document.createElement('button');
        apply.textContent = this.applyButtonText;
        apply.onclick = () => {
            this.currentDate = new Date(this.tempDate);
            this.viewMode = 'days';
            this.render();
        };
    
        actions.append(cancel, apply);
    
        wrapper.append(yearControl, monthGrid, actions);
        return wrapper;
    }    
    
    /**
     * Create calendar header with month/year and navigation buttons
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        
        // Previous month button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn prev-btn flipped';
        prevBtn.innerHTML = '&#10132;';
        prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        
        // Month/Year display
        const monthYear = document.createElement('div');
        monthYear.className = 'month-year';
        monthYear.textContent = this.getMonthYearString();

        // When in month/year selection mode
        if (this.viewMode === 'month-year') {
            monthYear.textContent = this.getMonthYearString();
        }

        monthYear.style.cursor = 'pointer';
        monthYear.addEventListener('click', () => {
            if (this.viewMode === 'month-year') return;
        
            this.viewMode = 'month-year';
            this.tempDate = new Date(this.currentDate);
            this.render();
        });
        
        // Next month button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn next-btn';
        nextBtn.innerHTML = '&#10132;';
        nextBtn.addEventListener('click', () => this.navigateMonth(1));
        
        header.appendChild(prevBtn);
        header.appendChild(monthYear);
        header.appendChild(nextBtn);
        
        return header;
    }
    
    /**
     * Create the calendar grid with days
     */
    createGrid() {
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        
        // Day names header
        const dayNames = this.dayNames;
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-name';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });
        
        // Get days for current month
        const days = this.getDaysInMonth();
        
        days.forEach(day => {        
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';                    
            
            if (day === null) {
                dayCell.className += ' empty';
            } else {
                dayCell.textContent = day.getDate();
                dayCell.dataset.dateValue = this.formatDate(day);
            
                const isDisabled =
                    (this.minDate && day < this.minDate) ||
                    this.isDateDisabled(day);
            
                if (isDisabled) {
                    dayCell.classList.add('disabled');
                    dayCell.style.pointerEvents = 'none';
                    dayCell.style.opacity = '0.4';
                    return grid.appendChild(dayCell);
                }
            
                if (!this.rangeSelection && this.isSelected(day)) {
                    dayCell.classList.add('selected');
                }
            
                if (this.isToday(day)) {
                    dayCell.classList.add('today');
                }
            
                // ✅ CLICK ONLY FOR ENABLED DATES
                dayCell.addEventListener('click', () => this.selectDate(day));
            }            
            
            grid.appendChild(dayCell);
        });
        
        return grid;
    }
    
    /**
     * Convert 24-hour format to 12-hour format
     */
    to12Hour(hour24) {
        if (hour24 === 0) return 12;
        if (hour24 <= 12) return hour24;
        return hour24 - 12;
    }
    
    /**
     * Convert 12-hour format to 24-hour format
     */
    to24Hour(hour12, isPM) {
        if (isPM) {
            if (hour12 === 12) return 12;
            return hour12 + 12;
        } else {
            if (hour12 === 12) return 0;
            return hour12;
        }
    }
    
    /**
     * Create time picker component (for datetime mode)
     */
    createTimePicker() {
        const timePicker = document.createElement('div');
        timePicker.className = 'time-picker';
        
        // Show time picker if we have a selected value
        const shouldShow = this.selectedValue !== null;
        timePicker.style.display = shouldShow ? 'block' : 'none';

        // Range time selector (only for range + datetime)
        let rangeToggle = null;

        if (this.enableDateTime && this.rangeSelection) {
            rangeToggle = document.createElement('div');
            rangeToggle.className = 'range-time-toggle';

            const startBtn = document.createElement('button');
            this.rangeStartBtn = startBtn;
            const clockIcon = '🕒';
            startBtn.innerHTML = `${clockIcon} <span class="range-date-label"></span>`;

            startBtn.classList.add('active');

            const endBtn = document.createElement('button');
            this.rangeEndBtn = endBtn;
            endBtn.innerHTML = `${clockIcon} <span class="range-date-label"></span>`;

            startBtn.onclick = () => {
                this.setActiveRangePart('start');
            };

            endBtn.onclick = () => {
                if (!this.endDate) return;
                this.setActiveRangePart('end');
            };

            rangeToggle.append(startBtn, endBtn);

            const updateRangeLabels = () => {
                const format = (d) =>
                    d ? d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '--';
            
                startBtn.querySelector('.range-date-label').textContent =
                    format(this.startDate);
            
                endBtn.querySelector('.range-date-label').textContent =
                    format(this.endDate);
            };
            
            // Store reference so we can update later
            this.updateRangeLabels = updateRangeLabels;
            
            // Initial update
            updateRangeLabels();            
        }
        
        const timeControls = document.createElement('div');
        timeControls.className = 'time-controls';
        
        // Get hours and minutes from selected value if it exists
        let hours24 = 12;
        let minutes = 0;
        if (this.selectedValue) {
            const date = new Date(this.selectedValue);
            if (!isNaN(date.getTime())) {
                hours24 = date.getHours();
                minutes = date.getMinutes();
            }
        }
        
        // Convert to 12-hour format if needed
        const hours12 = this.to12Hour(hours24);
        // Update internal AM/PM state based on current value
        this.currentIsPM = hours24 >= 12;
        
        // Hours selector
        const hoursWrapper = document.createElement('div');
        hoursWrapper.className = 'time-input-wrapper';
        const hoursLabel = document.createElement('label');
        hoursLabel.textContent = this.hourLabel;
        const hoursInput = document.createElement('input');
        hoursInput.type = 'number';
        hoursInput.className = 'time-input hours-input';
        
        if (this.hourFormat === '12') {
            hoursInput.min = '1';
            hoursInput.max = '12';
            hoursInput.value = hours12;
        } else {
            hoursInput.min = '0';
            hoursInput.max = '23';
            hoursInput.value = hours24;
        }
        
        hoursInput.addEventListener('change', () => this.updateDateTime());
        hoursWrapper.appendChild(hoursLabel);
        hoursWrapper.appendChild(hoursInput);
        
        // Minutes selector
        const minutesWrapper = document.createElement('div');
        minutesWrapper.className = 'time-input-wrapper';
        const minutesLabel = document.createElement('label');
        minutesLabel.textContent = this.minuteLabel;
        const minutesInput = document.createElement('input');
        minutesInput.type = 'number';
        minutesInput.className = 'time-input minutes-input';
        minutesInput.min = '0';
        minutesInput.max = '59';
        minutesInput.value = minutes;
        minutesInput.addEventListener('change', () => this.updateDateTime());
        minutesWrapper.appendChild(minutesLabel);
        minutesWrapper.appendChild(minutesInput);
        
        timeControls.appendChild(hoursWrapper);
        timeControls.appendChild(minutesWrapper);

        if (this.hourFormat === '12') {
            const ampmWrapper = document.createElement('div');
            ampmWrapper.className = 'time-input-wrapper';

            const ampmLabel = document.createElement('label');
            ampmLabel.textContent = 'AM/PM:';

            const ampmSelect = document.createElement('select');
            ampmSelect.className = 'ampm-select';

            const optionAM = document.createElement('option');
            optionAM.value = 'AM';
            optionAM.textContent = 'AM';
            const optionPM = document.createElement('option');
            optionPM.value = 'PM';
            optionPM.textContent = 'PM';

            ampmSelect.append(optionAM, optionPM);

            // Set initial value
            ampmSelect.value = this.currentIsPM ? 'PM' : 'AM';

            // Update currentIsPM when user changes selection
            ampmSelect.addEventListener('change', () => {
                this.currentIsPM = ampmSelect.value === 'PM';
                this.updateDateTime();
            });

            ampmWrapper.append(ampmLabel, ampmSelect);
            timeControls.appendChild(ampmWrapper);

            this.ampmSelect = ampmSelect; // save reference for later
        }

        timePicker.appendChild(timeControls);

        if (rangeToggle) {
            timePicker.insertBefore(rangeToggle, timeControls);
        }        
        
        // Store references for later use
        this.timePicker = timePicker;
        this.hoursInput = hoursInput;
        this.minutesInput = minutesInput;
        
        return timePicker;
    }
    
    /**
     * Get array of days for current month view
     * Returns array of Date objects, with null for empty cells
     */
    getDaysInMonth() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // First day of the month
        const firstDay = new Date(year, month, 1);
        // const firstDayOfWeek = firstDay.getDay();
        const firstDayOfWeek = (firstDay.getDay() - this.startDay + 7) % 7;
        
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const days = [];
        
        // Add days from previous month to fill first week
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push(null);
        }
        
        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        // Add days from next month to fill last week (total 42 cells for 6 weeks)
        const totalCells = 42;
        const remainingCells = totalCells - days.length;
        for (let i = 0; i < remainingCells; i++) {
            days.push(null);
        }
        
        return days;
    }
    
    /**
     * Navigate to previous or next month
     */
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render();
    }
    
    /**
     * Get formatted month/year string
     */
    getMonthYearString() {
        const months = this.monthsNames;
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
    
    /**
     * Check if a date is today
     */
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    /**
     * Check if a date is selected
     */
    isSelected(date) {
        if (!this.selectedValue) return false;
        
        const selectedDate = new Date(this.selectedValue);
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    }
    
    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Format datetime as YYYY-MM-DD HH:mm
     */
    formatDateTime(date, hours, minutes) {
        const dateStr = this.formatDate(date);
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        return `${dateStr} ${hoursStr}:${minutesStr}`;
    }
    
    /**
     * Update the visual selection of a date cell
     */
    updateSelectedCell(selectedDate) {
        // Remove 'selected' class from all cells
        const allCells = document.querySelectorAll(`${this.target} .day-cell`);
        allCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Add 'selected' class to the clicked cell
        if (selectedDate) {
            const dateStr = this.formatDate(selectedDate);
            const targetCell = document.querySelector(`${this.target} .day-cell[data-date-value="${dateStr}"]`);
            if (targetCell) {
                targetCell.classList.add('selected');
            }
        }
    }
    
    /**
     * Handle date selection
     */
    selectDate(date) {
        if ((this.minDate && date < this.minDate) || this.isDateDisabled(date)) {
            return; // ignore selection
        }              

        if (this.rangeSelection) {

            if (!this.startDate || (this.startDate && this.endDate)) {
                // Start new range
                this.startDate = date;
                this.endDate = null;
                this.activeRangePart = 'start';
                this.setActiveRangePart('start');
            } else {
                // Finish range
                if (date < this.startDate) {
                    this.endDate = this.startDate;
                    this.startDate = date;
                } else {
                    this.endDate = date;
                }
                this.setActiveRangePart('end');
            }
        
            this.updateRangeCells();
        
            // Show time picker if datetime is enabled
            if (this.enableDateTime && this.timePicker) {
                this.timePicker.style.display = 'block';
                this.syncTimeInputs();
            }

            // Auto switch to end time after end date selected
            if (this.endDate && this.enableDateTime) {
                this.activeRangePart = 'end';
                this.updateRangeCells();
            }

            if (this.updateRangeLabels) {
                this.updateRangeLabels();
            }            
        
            this.selectedValue = true;
            this.triggerChange();
            return;
        } else {
            // Existing single-date selection logic
            if (this.enableDateTime) {
                let hours = 12;
                let minutes = 0;
                if (this.selectedValue) {
                    const selectedDate = new Date(this.selectedValue);
                    if (!isNaN(selectedDate.getTime())) {
                        hours = selectedDate.getHours();
                        minutes = selectedDate.getMinutes();
                    }
                }
                this.selectedValue = this.formatDateTime(date, hours, minutes);
                this.updateSelectedCell(date);
                if (this.hourFormat === '12') this.currentIsPM = hours >= 12;
                if (this.timePicker) this.timePicker.style.display = 'block';
                if (this.hoursInput && this.minutesInput) {
                    if (this.hourFormat === '12') this.hoursInput.value = this.to12Hour(hours);
                    else this.hoursInput.value = hours;
                    this.minutesInput.value = minutes;
                }
                this.triggerChange();
            } else {
                this.selectedValue = this.formatDate(date);
                this.updateSelectedCell(date);
                this.triggerChange();
            }
        }
    }

    syncTimeInputs() {
        if (!this.enableDateTime) return;
    
        let hours, minutes;
    
        if (this.rangeSelection) {
            const time = this.activeRangePart === 'start' ? this.startTime : this.endTime;
            hours = time.hours;
            minutes = time.minutes;
        } else {
            if (!this.selectedValue) {
                hours = 12;
                minutes = 0;
            } else {
                const d = new Date(this.selectedValue);
                if (isNaN(d.getTime())) {
                    hours = 12;
                    minutes = 0;
                } else {
                    hours = d.getHours();
                    minutes = d.getMinutes();
                }
            }
        }
    
        if (this.hourFormat === '12') {
            this.hoursInput.value = this.to12Hour(hours);
            this.currentIsPM = hours >= 12;
            if (this.ampmSelect) {
                this.ampmSelect.value = this.currentIsPM ? 'PM' : 'AM';
            }
        } else {
            this.hoursInput.value = hours;
        }
    
        this.minutesInput.value = minutes;
    }      
    
    updateRangeCells() {
        const allCells = document.querySelectorAll(`${this.target} .day-cell`);
    
        allCells.forEach(cell => {
            cell.classList.remove(
                'selected',
                'in-range',
                'range-start',
                'range-end',
                'range-active'
            );
        });
    
        if (!this.startDate) return;
    
        const start = new Date(this.startDate).setHours(0,0,0,0);
        const end = this.endDate
            ? new Date(this.endDate).setHours(0,0,0,0)
            : null;
    
        allCells.forEach(cell => {
            const dateStr = cell.dataset.dateValue;
            if (!dateStr) return;
    
            const cellDate = new Date(dateStr).setHours(0,0,0,0);
    
            if (cellDate === start) {
                cell.classList.add('range-start');
                if (this.activeRangePart === 'start') {
                    cell.classList.add('range-active');
                }
            }
    
            if (end && cellDate === end) {
                cell.classList.add('range-end');
                if (this.activeRangePart === 'end') {
                    cell.classList.add('range-active');
                }
            }
    
            if (end && cellDate > start && cellDate < end) {
                cell.classList.add('in-range');
            }
        });
    }
    
    /**
     *  Disable Rand Time 
     */
    isDateDisabled(date) {
        if (!this.disabledRanges || this.disabledRanges.length === 0) return false;
        
        const time = new Date(date).setHours(0,0,0,0);
        
        return this.disabledRanges.some(range => {
            const start = new Date(range.start).setHours(0,0,0,0);
            const end = new Date(range.end).setHours(0,0,0,0);
            return time >= start && time <= end;
        });
    }    
    
    /**
     * Update datetime value when time changes (datetime mode)
     */
    updateDateTime() {
        if (!this.enableDateTime) return;
    
        let hours24;
        const minutes = parseInt(this.minutesInput.value) || 0;
    
        if (this.hourFormat === '12') {
            const hours12 = parseInt(this.hoursInput.value) || 12;
            const validHours12 = Math.max(1, Math.min(12, hours12));
            this.hoursInput.value = validHours12;
            hours24 = this.to24Hour(validHours12, this.currentIsPM);
        } else {
            const hours = parseInt(this.hoursInput.value) || 0;
            hours24 = Math.max(0, Math.min(23, hours));
            this.hoursInput.value = hours24;
        }
    
        const validMinutes = Math.max(0, Math.min(59, minutes));
        this.minutesInput.value = validMinutes;
    
        // Save to correct range part or single-date
        if (this.rangeSelection) {
            if (this.activeRangePart === 'start') {
                this.startTime = { hours: hours24, minutes: validMinutes };
            } else {
                this.endTime = { hours: hours24, minutes: validMinutes };
            }
        } else {
            // Single date mode
            if (!this.selectedValue) return; // nothing selected yet
            const datePart = new Date(this.selectedValue);
            if (isNaN(datePart.getTime())) return;

            // Update selectedValue with new time
            this.selectedValue = this.formatDateTime(datePart, hours24, validMinutes);

            // Update the calendar cell highlight if needed
            this.updateSelectedCell(datePart);
        }
    
        this.triggerChange();
    }    
    
    /**
     * Trigger onChange callback
     */
    triggerChange() {
        if (this.onChange && typeof this.onChange === 'function') {
            if (this.rangeSelection) {

                let start = null;
                let end = null;
            
                if (this.startDate) {
                    start = this.enableDateTime
                        ? this.formatDateTime(
                            this.startDate,
                            this.startTime.hours,
                            this.startTime.minutes
                        )
                        : this.formatDate(this.startDate);
                }
            
                if (this.endDate) {
                    end = this.enableDateTime
                        ? this.formatDateTime(
                            this.endDate,
                            this.endTime.hours,
                            this.endTime.minutes
                        )
                        : this.formatDate(this.endDate);
                }
            
                this.onChange({ start, end });
                return;
            } else {
                this.onChange(this.selectedValue);
            }
        }
    }    
    
    /**
     * Get current selected value
     */
    getValue() {
        if (this.rangeSelection) {
            return {
                start: this.startDate
                    ? this.enableDateTime
                        ? this.formatDateTime(this.startDate, this.startTime.hours, this.startTime.minutes)
                        : this.formatDate(this.startDate)
                    : null,
                end: this.endDate
                    ? this.enableDateTime
                        ? this.formatDateTime(this.endDate, this.endTime.hours, this.endTime.minutes)
                        : this.formatDate(this.endDate)
                    : null
            };
        } else {
            return this.selectedValue;
        }
    }    
    
    /**
     * Set calendar value programmatically
     */
    setValue(value) {
        if (!value) {
            // Clear all selections
            this.selectedValue = null;
            this.startDate = null;
            this.endDate = null;
            const allCells = document.querySelectorAll(`${this.target} .day-cell`);
            allCells.forEach(cell => cell.classList.remove('selected', 'in-range'));
            if (this.timePicker) this.timePicker.style.display = 'none';
            return;
        }
    
        if (this.rangeSelection && typeof value === 'object') {
            // RESET range first
            this.startDate = null;
            this.endDate = null;
            this.startTime = { hours: 12, minutes: 0 };
            this.endTime = { hours: 12, minutes: 0 };
    
            if (value.start) {
                const d = new Date(value.start);
                if (!isNaN(d.getTime())) {
                    this.startDate = d;
                    this.startTime = { hours: d.getHours(), minutes: d.getMinutes() };
                }
            }
    
            if (value.end) {
                const d = new Date(value.end);
                if (!isNaN(d.getTime())) {
                    this.endDate = d;
                    this.endTime = { hours: d.getHours(), minutes: d.getMinutes() };
                }
            }
    
            this.setActiveRangePart(this.endDate ? 'end' : 'start');
    
            // Always move calendar to startDate's month/year
            if (this.startDate) {
                this.currentDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
            }
    
            this.render();
            this.updateRangeCells();
    
            if (this.enableDateTime && this.timePicker) {
                this.timePicker.style.display = 'block';
                this.syncTimeInputs();
            }
    
            this.triggerChange();
            return;
        } else {
            // SINGLE DATE / DATETIME
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                console.error('Invalid date value');
                return;
            }
    
            // Move calendar view to selected date's month/year
            this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
    
            // Set selected value
            if (this.enableDateTime) {
                const hours24 = date.getHours();
                const minutes = date.getMinutes();
                this.selectedValue = this.formatDateTime(date, hours24, minutes);
                if (this.hourFormat === '12') this.currentIsPM = hours24 >= 12;
            } else {
                this.selectedValue = this.formatDate(date);
            }
    
            // Render calendar to show selected cell with correct highlight
            this.render();
    
            // Sync time picker if datetime
            if (this.enableDateTime && this.timePicker) this.syncTimeInputs();
        }
    }
    
    /**
     * Set disabled dates or ranges dynamically
     * @param {Array} ranges - Array of { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } objects
     */
    setDisabled(ranges) {
        // Convert string ranges to Date objects
        this.disabledRanges = (ranges || []).map(range => ({
            start: new Date(range.start),
            end: new Date(range.end)
        }));

        // Re-render calendar to apply disabled styles
        this.render();
    }

    
    setActiveRangePart(part) {
        this.activeRangePart = part;
    
        if (this.rangeStartBtn && this.rangeEndBtn) {
            this.rangeStartBtn.classList.toggle('active', part === 'start');
            this.rangeEndBtn.classList.toggle('active', part === 'end');
        }
    
        this.syncTimeInputs();
        this.updateRangeCells();
    }    
}