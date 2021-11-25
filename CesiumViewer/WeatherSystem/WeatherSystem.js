import { PostProcessStage } from "../../Source/Cesium.js";
import { getRainShader, getSnowShader } from "./shader.js";
let lastStage;

export const WeatherSystem = {
  snow: (scene) => {
    //定义下雪场景 着色器
    const FS_Snow = getSnowShader;

    const collection = scene.postProcessStages;
    const fs_snow = FS_Snow();
    const snow = new PostProcessStage({
      name: "czm_snow",
      fragmentShader: fs_snow,
    });
    collection.add(snow);
    lastStage = snow;
  },
  rain: (scene) => {
    //定义下雨场景 着色器
    const FS_Rain = getRainShader;

    const collection = scene.postProcessStages;
    const fs_rain = FS_Rain();
    const rain = new PostProcessStage({
      name: "czm_rain",
      fragmentShader: fs_rain,
    });
    collection.add(rain);
    lastStage = rain;
  },
  clear: (scene) => {
    lastStage && scene.postProcessStages.remove(lastStage), lastStage = null
  }
};
