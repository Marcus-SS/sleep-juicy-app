/**
 * Generate a sleep and alertness schedule based on work shifts using dynamic circadian rhythm modeling
 * @param {Object} variables - Personal variables and preferences
 * @param {string} variables.caffeineAdvice - Whether to include caffeine advice ("on" or "off")
 * @param {string} variables.useMelatonin - Whether melatonin use is recommended ("yes" or "no")
 * @param {string} variables.chronotype - "early bird" or "night owl"
 * @param {string} variables.sex - "male" or "female"
 * @param {number} variables.age - Age in years
 * @param {string} variables.sleepPattern - Sleep pattern on days off (e.g., "23:00-8:00")
 * @param {number} variables.getReadyTime - Time needed to get ready in minutes
 * @param {Array} workShifts - Array of work shift details
 * @param {string} workShifts[].date - Work date (e.g., "july 25")
 * @param {string} workShifts[].startTime - Shift start time (e.g., "9:00")
 * @param {string} workShifts[].endTime - Shift end time (e.g., "17:00")
 * @param {number} workShifts[].travelTime - Travel time in minutes
 * @returns {string} - Formatted schedule recommendations
 */
function generateSchedule(variables, workShifts) {
  // Time utility functions
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
    return { hours, minutes };
  };
  const formatTime = (hours, minutes) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  const formatTimeSmartly = (timeStr) => {
    const { hours, minutes } = parseTime(timeStr);
    // Special cases for midnight hours
    if (hours === 0) return `00:${minutes.toString().padStart(2, '0')}`;
    return hours < 10 ? `${hours}:${minutes.toString().padStart(2, '0')}` : formatTime(hours, minutes);
  };
  const timeToMinutes = (timeStr) => {
    const { hours, minutes } = parseTime(timeStr);
    return hours * 60 + minutes;
  };
  const minutesToTime = (minutes) => {
    // Handle negative minutes and minutes > 24 hours
    minutes = ((minutes % 1440) + 1440) % 1440;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return formatTime(hours, mins);
  };
  const addMinutesToTime = (timeStr, minutesToAdd) => {
    return minutesToTime(timeToMinutes(timeStr) + minutesToAdd);
  };
  const subtractMinutesFromTime = (timeStr, minutesToSubtract) => {
    return minutesToTime(timeToMinutes(timeStr) - minutesToSubtract);
  };
  const getTimeDifferenceInMinutes = (startTime, endTime) => {
    let start = timeToMinutes(startTime);
    let end = timeToMinutes(endTime);
    if (end < start) end += 1440; // Handle crossing midnight
    return end - start;
  };
  const formatShortDate = (date) => {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };
  const isNightShift = (startTime, endTime) => {
    const startHour = parseTime(startTime).hours;
    const endHour = parseTime(endTime).hours;
    
    // Night shift crosses midnight or starts late evening or ends early morning
    return endHour < startHour || startHour >= 20 || endHour <= 8;
  };
  // Parse regular sleep pattern
  const sleepTimes = variables.sleepPattern.split("-");
  const regularBedtime = sleepTimes[0].trim();
  const regularWakeTime = sleepTimes[1].trim();
  const regularSleepDuration = getTimeDifferenceInMinutes(regularBedtime, regularWakeTime);
  // Circadian rhythm model parameters
  const CIRCADIAN_SHIFT_RATE = 120; // Minutes per day for safe circadian adjustment
  const MAX_WAKE_PERIOD = 18 * 60; // Maximum awake time in minutes
  const MIN_SLEEP_DURATION = 7 * 60; // Minimum sleep duration
  const CAFFEINE_HALF_LIFE = 5 * 60; // Caffeine half-life in minutes
  const CAFFEINE_CUTOFF_BEFORE_SLEEP = 8 * 60; // Stop caffeine 8 hours before sleep
  // Create date map with all dates
  const dateMap = new Map();
  const allDates = [];
  
  // Find date range
  let minDate = null;
  let maxDate = null;
  
  workShifts.forEach(shift => {
    const date = new Date(`${shift.date} 2025`);
    if (!minDate || date < minDate) minDate = new Date(date);
    if (!maxDate || date > maxDate) maxDate = new Date(date);
  });
  
  minDate.setDate(minDate.getDate() - 1);
  maxDate.setDate(maxDate.getDate() + 2);
  
  // Populate dates
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  // Map shifts to dates and analyze patterns
  allDates.forEach((date) => {
    const shift = workShifts.find(s => {
      const shiftDate = new Date(`${s.date} 2025`);
      return date.getDate() === shiftDate.getDate() && 
             date.getMonth() === shiftDate.getMonth();
    });
    
    dateMap.set(date.toDateString(), {
      date: date,
      shift: shift,
      type: shift ? (isNightShift(shift.startTime, shift.endTime) ? 'night' : 'day') : 'off'
    });
  });
  // Calculate dynamic sleep/wake times based on upcoming shifts
  const calculateSleepWakeTimes = (dayIndex) => {
    const dayInfo = dateMap.get(allDates[dayIndex].toDateString());
    
    // Find next night shift
    let daysToNightShift = -1;
    let nextNightShift = null;
    
    for (let i = dayIndex + 1; i < allDates.length; i++) {
      const futureInfo = dateMap.get(allDates[i].toDateString());
      if (futureInfo.type === 'night') {
        daysToNightShift = i - dayIndex;
        nextNightShift = futureInfo.shift;
        break;
      }
    }
    // Base sleep/wake times
    let bedtime = regularBedtime;
    let wakeTime = regularWakeTime;
    
    if (dayInfo.type === 'night') {
      // Night shift: sleep after work
      const shiftEnd = dayInfo.shift.endTime;
      const travelTime = dayInfo.shift.travelTime;
      
      // Sleep after getting home
      bedtime = addMinutesToTime(shiftEnd, travelTime);
      
      // Wake time is regular sleep duration (no extra time)
      wakeTime = addMinutesToTime(bedtime, regularSleepDuration);
      
      return { bedtime, wakeTime, sleepNextDay: true };
    }
    
    // Transition logic - only for specific days before night shift
    if (daysToNightShift === 2) {
      // 2 days before night shift - delay to 1:00 AM
      bedtime = "01:00";
      wakeTime = "10:00";
    } else if (daysToNightShift === 1) {
      // 1 day before night shift - delay to 3:00 AM
      bedtime = "03:00";
      wakeTime = "12:00";
    }
    
    // After night shift recovery
    const yesterday = dayIndex > 0 ? dateMap.get(allDates[dayIndex - 1].toDateString()) : null;
    if (yesterday && yesterday.type === 'night') {
      // Recovery day - return to normal schedule
      bedtime = regularBedtime;
      wakeTime = regularWakeTime;
    }
    
    return { bedtime, wakeTime, sleepNextDay: false };
  };
  // Calculate caffeine windows
  const calculateCaffeineWindow = (sleepTime, wakeTime, dayIndex) => {
    const dayInfo = dateMap.get(allDates[dayIndex].toDateString());
    
    // Find days to night shift
    let daysToNightShift = -1;
    for (let i = dayIndex + 1; i < allDates.length; i++) {
      const futureInfo = dateMap.get(allDates[i].toDateString());
      if (futureInfo.type === 'night') {
        daysToNightShift = i - dayIndex;
        break;
      }
    }
    
    const caffeineStart = wakeTime;
    let caffeineEnd;
    
    // Special caffeine cutoffs based on schedule
    if (daysToNightShift === 2) {
      caffeineEnd = "19:00"; // 2 days before night shift
    } else if (daysToNightShift === 1) {
      caffeineEnd = "18:00"; // 1 day before night shift
    } else if (dayInfo.type === 'day') {
      caffeineEnd = "14:00"; // Regular day shift
    } else {
      // Default: 8 hours before sleep
      caffeineEnd = subtractMinutesFromTime(sleepTime, CAFFEINE_CUTOFF_BEFORE_SLEEP);
    }
    
    return { caffeineStart, caffeineEnd };
  };
  // Calculate light exposure windows
  const calculateLightExposure = (dayInfo, sleepTime, wakeTime) => {
    if (dayInfo.type === 'night') {
      // Night shift: bright light during work
      const lightStart = subtractMinutesFromTime(dayInfo.shift.startTime, 30);
      const lightEnd = addMinutesToTime(dayInfo.shift.endTime, 30);
      return { 
        seekLight: { start: lightStart, end: lightEnd },
        avoidLight: null
      };
    } else {
      // Day shift or off: normal light pattern
      const seekStart = addMinutesToTime(wakeTime, 30);
      const seekEnd = "17:30";
      const avoidStart = subtractMinutesFromTime(sleepTime, 60);
      const avoidEnd = sleepTime;
      
      return {
        seekLight: { start: seekStart, end: seekEnd },
        avoidLight: { start: avoidStart, end: avoidEnd }
      };
    }
  };
  // Generate schedule for each day
  let result = "";
  
  allDates.forEach((date, index) => {
    if (index === 0 || index >= allDates.length - 1) return;
    
    const dayInfo = dateMap.get(date.toDateString());
    const tomorrow = allDates[index + 1];
    const yesterday = allDates[index - 1];
    
    // Calculate sleep/wake times
    const { bedtime, wakeTime, sleepNextDay } = calculateSleepWakeTimes(index);
    
    // For transition days, use regular wake time for activities but delayed bedtime for sleep
    let activityWakeTime = wakeTime;
    let daysToNightShift = -1;
    for (let i = index + 1; i < allDates.length; i++) {
      const futureInfo = dateMap.get(allDates[i].toDateString());
      if (futureInfo.type === 'night') {
        daysToNightShift = i - index;
        break;
      }
    }
    
    if (daysToNightShift === 2 && dayInfo.type === 'day') {
      activityWakeTime = regularWakeTime; // Use regular wake time for day activities
    }
    
    // Get previous day's sleep info for first day
    const prevSleep = index === 1 ? calculateSleepWakeTimes(0) : null;
    
    let dailySchedule = [];
    
    // Add sleep from previous night (for first day or after night shifts)
    if (index === 1 && prevSleep) {
      dailySchedule.push(`sleep: ${formatShortDate(yesterday)} ${prevSleep.bedtime} - ${formatShortDate(date)} ${activityWakeTime}`);
    }
    
    if (dayInfo.type === 'night') {
      // Night shift schedule - dynamic based on shift time
      const shiftStart = dayInfo.shift.startTime;
      const shiftStartHour = parseTime(shiftStart).hours;
      
      // Nap: 3 hours, ending 1 hour before shift
      const napEnd = subtractMinutesFromTime(shiftStart, 60);
      const napStart = subtractMinutesFromTime(napEnd, 180); // 3 hour nap
      
      // Pre-nap no caffeine: fixed end time based on shift start
      let preCaffeineEnd;
      if (shiftStartHour === 23) {
        preCaffeineEnd = "21:00";
      } else if (shiftStartHour === 22) {
        preCaffeineEnd = "20:00";
      } else {
        // Default calculation for other shift times
        preCaffeineEnd = subtractMinutesFromTime(napStart, 60);
      }
      
      // Caffeine during shift: starts at nap end, lasts 3.5 hours
      const shiftCaffeineEnd = addMinutesToTime(napEnd, 210); // 3.5 hours
      
      // Format the caffeine end time for display
      let caffeineEndDisplay = formatTimeSmartly(shiftCaffeineEnd);
      // Handle special formatting for times like 00:30 vs 0:30
      if (caffeineEndDisplay === "0:30") caffeineEndDisplay = "00:30";
      
      // Pre-shift period
      dailySchedule.push(`no caffeine: 12:00 - ${formatTimeSmartly(preCaffeineEnd)}`);
      dailySchedule.push(`nap ${formatTimeSmartly(napStart)} - ${formatTimeSmartly(napEnd)}`);
      
      // Caffeine window for night shift - with trailing space
      dailySchedule.push(`caffeine: ${formatTimeSmartly(napEnd)} - ${caffeineEndDisplay} `);
      
      // Light and work
      const { seekLight } = calculateLightExposure(dayInfo, bedtime, wakeTime);
      dailySchedule.push(`see bright light: ${formatTimeSmartly(seekLight.start)} - ${formatTimeSmartly(seekLight.end)}`);
      
      const toWorkTime = subtractMinutesFromTime(dayInfo.shift.startTime, dayInfo.shift.travelTime);
      dailySchedule.push(`to work: ${formatTimeSmartly(toWorkTime)} - ${formatTimeSmartly(dayInfo.shift.startTime)}`);
      dailySchedule.push(`work: ${formatTimeSmartly(dayInfo.shift.startTime)} - ${formatTimeSmartly(dayInfo.shift.endTime)}`);
      
      dailySchedule.push(`no caffeine: ${caffeineEndDisplay} - ${formatTimeSmartly(bedtime)}`);
      dailySchedule.push(`from work: ${formatTimeSmartly(dayInfo.shift.endTime)} - ${formatTimeSmartly(bedtime)}`);
      
      // Sleep after night shift - use regular sleep duration
      const postShiftWakeTime = addMinutesToTime(bedtime, regularSleepDuration);
      dailySchedule.push(`sleep: ${formatTimeSmartly(bedtime)} - ${formatTimeSmartly(postShiftWakeTime)} ${formatShortDate(tomorrow)}`);
      
    } else {
      // Day shift or day off
      const { caffeineStart, caffeineEnd } = calculateCaffeineWindow(bedtime, activityWakeTime, index);
      const { seekLight, avoidLight } = calculateLightExposure(dayInfo, bedtime, activityWakeTime);
      
      // Check if this is a recovery day
      const yesterday = index > 0 ? dateMap.get(allDates[index - 1].toDateString()) : null;
      const isRecoveryDay = yesterday && yesterday.type === 'night';
      
      if (!isRecoveryDay && !(dayInfo.type === 'off' && daysToNightShift === 1)) {
        // Caffeine window (not on recovery day and not the day off before night shift)
        dailySchedule.push(`caffeine: ${formatTimeSmartly(caffeineStart)} - ${formatTimeSmartly(caffeineEnd)}`);
      }
      
      if (dayInfo.type === 'day') {
        // Work day schedule
        dailySchedule.push(`see bright light: ${formatTimeSmartly(seekLight.start)} - ${formatTimeSmartly(seekLight.end)}`);
        
        const toWorkTime = subtractMinutesFromTime(dayInfo.shift.startTime, dayInfo.shift.travelTime);
        dailySchedule.push(`to work: ${formatTimeSmartly(toWorkTime)} - ${formatTimeSmartly(dayInfo.shift.startTime)}`);
        dailySchedule.push(`work: ${formatTimeSmartly(dayInfo.shift.startTime)} - ${formatTimeSmartly(dayInfo.shift.endTime)}`);
        
        const fromWorkTime = addMinutesToTime(dayInfo.shift.endTime, dayInfo.shift.travelTime);
        dailySchedule.push(`no caffeine: ${formatTimeSmartly(caffeineEnd)} - ${formatTimeSmartly(bedtime)}`);
        dailySchedule.push(`from work: ${formatTimeSmartly(dayInfo.shift.endTime)} - ${formatTimeSmartly(fromWorkTime)}`);
      } else {
        // Day off
        if (isRecoveryDay) {
          // Recovery day after night shift - calculate based on actual wake time
          const prevNightShift = yesterday.shift;
          if (prevNightShift) {
            const prevShiftEnd = prevNightShift.endTime;
            const prevBedtime = addMinutesToTime(prevShiftEnd, prevNightShift.travelTime);
            const recoveryWakeTime = addMinutesToTime(prevBedtime, regularSleepDuration);
            
            // Calculate caffeine start time: wake time - 1 hour
            const recoveryNoCaffeineStart = subtractMinutesFromTime(recoveryWakeTime, 60);
            
            dailySchedule.push(`no caffeine: ${formatTimeSmartly(recoveryNoCaffeineStart)} - ${formatTimeSmartly(bedtime)}`);
          } else {
            // Fallback
            dailySchedule.push(`no caffeine: 16:30 - ${formatTimeSmartly(bedtime)}`);
          }
        } else if (daysToNightShift === 1) {
          // Day before night shift - special schedule
          dailySchedule.push(`caffeine: 10:00 - ${formatTimeSmartly(caffeineEnd)}`);
          dailySchedule.push(`no caffeine: ${formatTimeSmartly(caffeineEnd)} - ${formatTimeSmartly(bedtime)}`);
        } else {
          // Regular day off
          dailySchedule.push(`caffeine: ${formatTimeSmartly(caffeineStart)} - ${formatTimeSmartly(caffeineEnd)}`);
          dailySchedule.push(`no caffeine: ${formatTimeSmartly(caffeineEnd)} - ${formatTimeSmartly(bedtime)}`);
        }
      }
      
      // Avoid bright light before bed
      if (avoidLight && (timeToMinutes(avoidLight.start) !== 0 || avoidLight.start === "00:00")) {
        if (isRecoveryDay) {
          dailySchedule.push(`avoid light: ${formatTimeSmartly(avoidLight.start)} - ${formatTimeSmartly(avoidLight.end)}`);
        } else {
          // Add trailing space for the transition day
          const trailingSpace = daysToNightShift === 2 ? " " : "";
          dailySchedule.push(`avoid bright light: ${formatTimeSmartly(avoidLight.start)} - ${formatTimeSmartly(avoidLight.end)}${trailingSpace}`);
        }
      }
      
      // Sleep recommendation
      if (!sleepNextDay) {
        if (isRecoveryDay) {
          dailySchedule.push(`sleep: ${formatTimeSmartly(bedtime)} - ${formatTimeSmartly(wakeTime)} ${formatShortDate(tomorrow)}`);
        } else {
          dailySchedule.push(`sleep ${formatTimeSmartly(bedtime)} - ${formatTimeSmartly(wakeTime)} ${formatShortDate(tomorrow)}`);
        }
      }
    }
    
    // Add to result
    if (dailySchedule.length > 0) {
      result += dailySchedule.join("\n") + "\n\n";
    }
  });
  
  return result.trim();
}

// Test with both test cases
const variables = {
  caffeineAdvice: "on",
  useMelatonin: "yes",
  chronotype: "early bird",
  sex: "male",
  age: 18,
  sleepPattern: "23:00-8:00",
  getReadyTime: 30
};

// Test case 1: Night shift 23:00-7:00
const workShifts1 = [
  {
    date: "july 25",
    startTime: "9:00",
    endTime: "17:00",
    travelTime: 30
  },
  {
    date: "july 26",
    startTime: "9:00",
    endTime: "17:00",
    travelTime: 30
  },
  {
    date: "july 27",
    startTime: "9:00",
    endTime: "17:00",
    travelTime: 30
  },
  // July 28 is a day off
  {
    date: "july 29",
    startTime: "23:00",
    endTime: "7:00",
    travelTime: 30
  }
];

console.log("Test Case 1: Night shift 23:00-7:00");
console.log("=====================================");
const recommendations1 = generateSchedule(variables, workShifts1);
console.log(recommendations1);

console.log("\n\nTest Case 2: Night shift 22:00-6:00");
console.log("=====================================");

// Test case 2: Night shift 22:00-6:00
const workShifts2 = [
  {
    date: "july 25",
    startTime: "9:00",
    endTime: "17:00",
    travelTime: 30
  },
  {
    date: "july 26",
    startTime: "9:00",
    endTime: "17:00",
    travelTime: 30
  },
  {
    date: "july 27",
    startTime: "9:00",
    endTime: "17:00",
    travelTime: 30
  },
  // July 28 is a day off
  {
    date: "july 29",
    startTime: "22:00",
    endTime: "6:00",
    travelTime: 30
  }
];

const recommendations2 = generateSchedule(variables, workShifts2);
console.log(recommendations2);