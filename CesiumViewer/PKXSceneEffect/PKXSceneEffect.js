import { WeatherSystem } from "../WeatherSystem/WeatherSystem.js";
import { $localStorage } from "../localStorage.js";

export const PKXSceneEffect = {
  init: (options) => {
    const { globe, scene } = options;
    // 读取 localStorage
    const $enableLighting = $localStorage.get("enableLighting");
    const $enableFog = $localStorage.get("enableFog");
    const $enableWeather = $localStorage.get("enableWeather");

    // 根据 localStorage 开启/关闭场景效果
    if ($enableLighting == "true") {
      globe.enableLighting = true;
    } else {
      globe.enableLighting = false;
    }

    if ($enableFog == "true") {
      scene.fog.enabled = true;
    } else {
      scene.fog.enabled = false;
    }

    if ($enableWeather == "true") {
      WeatherSystem.snow(scene)
      scene.enableWeather = true;
    } else {
      WeatherSystem.clear(scene)
      scene.enableWeather = false;
    }

    scene.fog.density = 0.001;
    scene.fog.minimumBrightness = 0.8;

    // 昼夜开关
    Sandcastle.addToggleButton("昼夜", globe.enableLighting, (checked) => {
      globe.enableLighting = checked;
      $localStorage.set("enableLighting", checked)
    });

    // 雾效开关
    Sandcastle.addToggleButton("雾效", scene.fog.enabled, (checked) => {
      scene.fog.enabled = checked;
      $localStorage.set("enableFog", checked);
    });

    // 天气系统开关
    Sandcastle.addToggleButton("天气", scene.enableWeather, (checked) => {
      scene.enableWeather = checked;
      $localStorage.set("enableWeather", checked);
      if (checked) {
        WeatherSystem.snow(scene)
      } else {
        WeatherSystem.clear(scene)
      }
    });

    // 恢复默认设置
    Sandcastle.addToolbarButton("恢复默认设置", function () {
      $localStorage.clear();
      window.location.reload();
    });

    // 重载应用
    Sandcastle.addToolbarButton("重载", function () {
      window.location.reload();
    });

  }
}