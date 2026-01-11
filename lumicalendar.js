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
        // Selected value (date or datetime)
        this.selectedValue = null;
        // Track AM/PM state for 12-hour format (internal, not shown to user)
        this.currentIsPM = false;
        this.viewMode = 'days'; // 'days' | 'month-year'
        this.tempDate = null;  // used while selecting month/year
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
    
        const prev = document.createElement('button');
        prev.textContent = '−';
        prev.onclick = () => {
            this.tempDate.setFullYear(this.tempDate.getFullYear() - 1);
            yearLabel.textContent = this.tempDate.getFullYear();
        };        
    
        const yearLabel = document.createElement('span');
        yearLabel.textContent = this.tempDate.getFullYear();
    
        const next = document.createElement('button');
        next.textContent = '+';
        next.onclick = () => {
            this.tempDate.setFullYear(this.tempDate.getFullYear() + 1);
            yearLabel.textContent = this.tempDate.getFullYear();
        };        
    
        yearControl.append(prev, yearLabel, next);
    
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
        cancel.textContent = 'Cancel';
        cancel.onclick = () => {
            this.viewMode = 'days';
            this.render();
        };
    
        const apply = document.createElement('button');
        apply.textContent = 'Apply';
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
        prevBtn.className = 'nav-btn prev-btn';
        prevBtn.innerHTML = '&larr;';
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
        nextBtn.innerHTML = '&rarr;';
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
                // Empty cell for days outside current month
                dayCell.className += ' empty';
            } else {
                dayCell.textContent = day.getDate();
                
                // Store date value for easy updates
                dayCell.dataset.dateValue = this.formatDate(day);
                
                // Check if this day is selected
                if (this.isSelected(day)) {
                    dayCell.className += ' selected';
                }
                
                // Check if this day is today
                if (this.isToday(day)) {
                    dayCell.className += ' today';
                }
                
                // Add click handler
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
        hoursLabel.textContent = 'Hour:';
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
        minutesLabel.textContent = 'Minute:';
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
        
        // Last day of previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
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
        if (this.enableDateTime) {
            // If we have existing selected value, preserve the time
            // Otherwise use default time (12:00)
            let hours = 12;
            let minutes = 0;
            if (this.selectedValue) {
                const selectedDate = new Date(this.selectedValue);
                if (!isNaN(selectedDate.getTime())) {
                    hours = selectedDate.getHours();
                    minutes = selectedDate.getMinutes();
                }
            }
            
            // Set the selected value
            this.selectedValue = this.formatDateTime(date, hours, minutes);
            
            // Update visual selection
            this.updateSelectedCell(date);
            
            // Update internal AM/PM state for 12-hour format
            if (this.hourFormat === '12') {
                this.currentIsPM = hours >= 12;
            }
            
            // Show time picker if it exists
            if (this.timePicker) {
                this.timePicker.style.display = 'block';
                if (this.hoursInput && this.minutesInput) {
                    // Convert to display format
                    if (this.hourFormat === '12') {
                        this.hoursInput.value = this.to12Hour(hours);
                        // Sync AM/PM dropdown
                        if (this.ampmSelect) {
                            this.ampmSelect.value = this.currentIsPM ? 'PM' : 'AM';
                        }
                    } else {
                        this.hoursInput.value = hours;
                    }
                    this.minutesInput.value = minutes;
                }
            }
            
            this.triggerChange();
        } else {
            // Date-only mode: select immediately
            this.selectedValue = this.formatDate(date);
            
            // Update visual selection
            this.updateSelectedCell(date);
            
            this.triggerChange();
        }
    }
    
    /**
     * Update datetime value when time changes (datetime mode)
     */
    updateDateTime() {
        if (!this.selectedValue) return;
        
        // Get the date part from current selected value
        const date = new Date(this.selectedValue);
        if (isNaN(date.getTime())) return;
        
        let hours24;
        const minutes = parseInt(this.minutesInput.value) || 0;
        
        // Convert hours based on format
        if (this.hourFormat === '12') {
            const hours12 = parseInt(this.hoursInput.value) || 12;
            
            // Validate 12-hour format
            const validHours12 = Math.max(1, Math.min(12, hours12));
            this.hoursInput.value = validHours12;
            
            // Convert to 24-hour format using internal AM/PM state
            hours24 = this.to24Hour(validHours12, this.currentIsPM);
        } else {
            const hours = parseInt(this.hoursInput.value) || 0;
            // Validate 24-hour format
            hours24 = Math.max(0, Math.min(23, hours));
            this.hoursInput.value = hours24;
        }
        
        // Validate minutes
        const validMinutes = Math.max(0, Math.min(59, minutes));
        this.minutesInput.value = validMinutes;
        
        // Update internal AM/PM state for 12-hour format
        if (this.hourFormat === '12') {
            this.currentIsPM = hours24 >= 12;
        }
        
        // Update selected value with new time (date stays the same)
        // Always store in 24-hour format internally
        this.selectedValue = this.formatDateTime(date, hours24, validMinutes);
        
        // No need to re-render, just update the value
        this.triggerChange();
    }
    
    /**
     * Trigger onChange callback
     */
    triggerChange() {
        if (this.onChange && typeof this.onChange === 'function') {
            this.onChange(this.selectedValue);
        }
    }
    
    /**
     * Get current selected value
     */
    getValue() {
        return this.selectedValue;
    }
    
    /**
     * Set calendar value programmatically
     */
    setValue(value) {
        if (!value) {
            this.selectedValue = null;
            // Remove selection from all cells
            const allCells = document.querySelectorAll(`${this.target} .day-cell`);
            allCells.forEach(cell => {
                cell.classList.remove('selected');
            });
            if (this.timePicker) {
                this.timePicker.style.display = 'none';
            }
            return;
        }
        
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            console.error('Invalid date value');
            return;
        }
        
        // Check if we need to change the month view
        const newMonth = date.getMonth();
        const newYear = date.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        const monthChanged = newMonth !== currentMonth || newYear !== currentYear;
        
        // Update current view to show the selected month if needed
        if (monthChanged) {
            this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
            this.render(); // Need to re-render if month changed
        }
        
        if (this.enableDateTime) {
            // DateTime mode
            const hours24 = date.getHours();
            const minutes = date.getMinutes();
            this.selectedValue = this.formatDateTime(date, hours24, minutes);
            
            // Update internal AM/PM state for 12-hour format
            if (this.hourFormat === '12') {
                this.currentIsPM = hours24 >= 12;
            }
            
            if (this.timePicker) {
                this.timePicker.style.display = 'block';
                // Convert to display format
                if (this.hourFormat === '12') {
                    this.hoursInput.value = this.to12Hour(hours24);
                } else {
                    this.hoursInput.value = hours24;
                }
                this.minutesInput.value = minutes;
            }
        } else {
            // Date-only mode
            this.selectedValue = this.formatDate(date);
        }
        
        // Update visual selection (only if month didn't change, otherwise render() already did it)
        if (!monthChanged) {
            this.updateSelectedCell(date);
        }
    }
}

if (typeof window !== 'undefined') {
    window.LumiCalendar = LumiCalendar;
}

// export default LumiCalendar;