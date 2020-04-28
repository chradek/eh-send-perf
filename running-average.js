function runningAverage(title) {
  const data = {
    currentTotal: 0,
    currentCount: 0,
    currentAverage: 0
  };

  let startTime;
  let endTime;

  return {
    add(value) {
      data.currentTotal += value;
      data.currentCount++;
      data.currentAverage = data.currentTotal / data.currentCount;
    },
    print() {
      console.log(`${title}: ${data.currentAverage.toFixed(2)} (${data.currentCount} data points)`);
    },
    /**
     * 
     * @param {"ms"|"seconds"|"minutes"} denomination 
     */
    printTotalOverTime(denomination) {
      if (!startTime || !endTime) {
        console.log(`You must call "start()" and "stop()" before calling "printTotalOverTime()".`);
        return;
      }

      const delta = endTime - startTime;
      let reportedDelta = delta;
      switch (denomination) {
        case "seconds":
          reportedDelta = delta / 1000;
          break;
        case "minutes":
          reportedDelta = delta / 60000;
          break;
        default:
          break;
      }

      console.log(`${title}: ${data.currentTotal} over a duration of ${reportedDelta.toFixed(2)} ${denomination} (${data.currentTotal / reportedDelta}/${denomination})`);
    },
    start() {
      startTime = Date.now();
    },
    stop() {
      endTime = Date.now();
    }
  };
}

module.exports = {
  runningAverage
};