import { JulianDate as CesiumJulianDate, ClockRange } from "../../Source/Cesium.js";

export const TimelineFormatter = (viewer) => {
  // 获取当前时区
  var timeNow = new Date();
  var timeOffset = timeNow.getTimezoneOffset();
  var timeZone = (0 - timeOffset) / 60;

  // 获取当前时间
  var start = CesiumJulianDate.fromDate(new Date());
  // 设置时区(-12~12) 8 代表北京时间，使地图时间和北京时间相同
  start = CesiumJulianDate.addHours(start, timeZone, new CesiumJulianDate());
  //start = CesiumJulianDate.fromIso8601('2020-04-18');

  // 结束时间
  var stop = CesiumJulianDate.fromDate(new Date(2038, 12, 31));
  //360是秒，可以在这个时间上加360秒，但是这还是地图上的时间
  stop = CesiumJulianDate.addSeconds(start, 360, new CesiumJulianDate());
  // 将时间刻到时间轴上
  // 设置始时钟始时间
  viewer.clock.startTime = start.clone();
  // 设置时钟当前时间
  viewer.clock.currentTime = start.clone();
  // 设置始终停止时间
  viewer.clock.stopTime = stop.clone();
  // 时间速率，数字越大时间过的越快
  viewer.clock.multiplier = 1;
  // 时间轴
  viewer.timeline.zoomTo(start, stop);
  /*
  CLAMPED
  达到终止时间后停止
  LOOP_STOP
  达到终止时间后重新循环
  UNBOUNDED
  达到终止时间后继续读秒
  */
  viewer.clock.clockRange = ClockRange.LOOP_STOP;

  //时间变化就执行(即使停止时间轴仍然会执行)
  viewer.clock.onTick.addEventListener(function (clock) {
    //可以在这里做一些时间的监听
  });
}