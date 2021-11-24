import {
  Math as CesiumMath
} from "../Source/Cesium.js";
export const $config = {
  //Cesium API AccessToken
  CESIUM_ACCESS_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZWFiNTkyNC05NDVmLTQ1NjktODIwMy1kZTE4ZTc4ZGE4ZjAiLCJpZCI6NTk3MTEsImlhdCI6MTYyNDQyNTM2MX0.9dgD9B04smS8WfvZwmIBx6aOrjFW2POsVmWq8J60Uo8",
  TMS_IMAGERY_URL: "",
  // 大兴机场地理坐标
  defaultPosition: [116.410088824153, 39.509140438939355],
  // 地图默认指向 视角
  defaultOrientation: {
    heading: CesiumMath.toRadians(20.0),
    pitch: CesiumMath.toRadians(-90.0),
    roll: 0.0
  }
}