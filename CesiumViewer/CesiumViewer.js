window.CESIUM_BASE_URL = "Source/";

import {
  Cartesian3,
  createWorldTerrain,
  defined,
  formatError,
  Ion,
  knockout,
  Math as CesiumMath,
  objectToQuery,
  queryToObject,
  CzmlDataSource,
  GeoJsonDataSource,
  KmlDataSource,
  TileMapServiceImageryProvider,
  Viewer,
  viewerCesiumInspectorMixin,
  viewerDragDropMixin,
  JulianDate as CesiumJulianDate,
} from "../Source/Cesium.js";
import { $config } from "./config.js";
import { PKXSceneEffect } from "./PKXSceneEffect/PKXSceneEffect.js";
import { PKXEntities } from "./PKXEntities/PKXEntities.js";

function main() {
  /*
    Options parsed from query string:
      source=url          The URL of a CZML/GeoJSON/KML data source to load at startup.
                          Automatic data type detection uses file extension.
      sourceType=czml/geojson/kml
                          Override data type detection for source.
      flyTo=false         Don't automatically fly to the loaded source.
      tmsImageryUrl=url   Automatically use a TMS imagery provider.
      lookAt=id           The ID of the entity to track at startup.
      stats=true          Enable the FPS performance display.
      inspector=true      Enable the inspector widget.
      debug=true          Full WebGL error reporting at substantial performance cost.
      theme=lighter       Use the dark-text-on-light-background theme.
      scene3DOnly=true    Enable 3D only mode.
      view=longitude,latitude,[height,heading,pitch,roll]
                          Automatically set a camera view. Values in degrees and meters.
                          [height,heading,pitch,roll] default is looking straight down, [300,0,-90,0]
      saveCamera=false    Don't automatically update the camera view in the URL when it changes.
     */
  Ion.defaultAccessToken = $config.CESIUM_ACCESS_TOKEN;
  var defaultPosition = $config.defaultPosition;
  var defaultOrientation = $config.defaultOrientation;

  var endUserOptions = queryToObject(window.location.search.substring(1));
  // endUserOptions.tmsImageryUrl = $config.TMS_IMAGERY_URL;
  var imageryProvider;
  if (defined(endUserOptions.tmsImageryUrl)) {
    imageryProvider = new TileMapServiceImageryProvider({
      url: endUserOptions.tmsImageryUrl,
    });
  }

  var loadingIndicator = document.getElementById("loadingIndicator");
  var viewer;
  /*
    Viewer Options

    {
      //加载在线谷歌地图
      //imageryProvider: new Cesium.UrlTemplateImageryProvider({
      //  url: "http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}"
      //}),
      imageryProvider: new Cesium.WebMapServiceImageryProvider({
        //加载本地资源地球
          url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')  
      }),
      homeButton: false, //主页按钮
      baseLayerPicker: false, //是否显示图层选择控件
      navigationHelpButton: false, //帮助信息按钮
      geocoder: false, //是否显示地名查找控件
      infoBox: false,//是否显示点击要素之后显示的信息
      fullscreenButton: false, //是否显示全屏按钮
      timeline: true, //是否显示时间线控件
      animation: true, //是否显示动画控件
      sceneModePicker: true,//是否显示投影方式控件
      selectionIndicator: false, // 取消点击有绿框
      shouldAnimate: true,  //允许动画
      navigationInstructionsInitiallyVisible: false
      // navigation: false,
      sceneMode: 1,  //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
      scene3DOnly: false, //每个几何实例将只能以3D渲染以节省GPU内存
    }

    //光照: scene.globe.enableLighting
    //雾效：scene.fog.enabled
    //大气：scene.skyAtmosphere
    */
  try {
    var hasBaseLayerPicker = !defined(imageryProvider);
    viewer = new Viewer("cesiumContainer", {
      imageryProvider: imageryProvider,
      baseLayerPicker: hasBaseLayerPicker,
      scene3DOnly: endUserOptions.scene3DOnly,
      requestRenderMode: true,
      shouldAnimate: true,
      fullscreenButton: false,
      baseLayerPicker: false,
      contextOptions: {
        webgl: {
          alpha: true,
          depth: false,
          stencil: true,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true,
        },
        allowTextureFilterAnisotropic: true,
      },
    });

    // hide copyright info
    viewer._cesiumWidget._creditContainer.style.display = "none";

    // TimelineFormatter(viewer);

    viewer.camera.flyTo({
      // Cesium的坐标是以地心为原点
      // fromDegrees()方法，将经纬度和高程转换为世界坐标
      destination: Cartesian3.fromDegrees(
        defaultPosition[0],
        defaultPosition[1],
        3000.0
      ),
      orientation: defaultOrientation,
    });

    // homeButton Click event
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true;
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            defaultPosition[0],
            defaultPosition[1],
            3000
          ),
        });
      }
    );

    if (hasBaseLayerPicker && viewer.baseLayerPicker) {
      var viewModel = viewer.baseLayerPicker.viewModel;
      viewModel.selectedTerrain = viewModel.terrainProviderViewModels[1];
    } else {
      viewer.terrainProvider = createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
      });
    }

  } catch (exception) {
    loadingIndicator.style.display = "none";
    var message = formatError(exception);
    console.error(message);
    if (!document.querySelector(".cesium-widget-errorPanel")) {
      //eslint-disable-next-line no-alert
      window.alert(message);
    }
    return;
  }

  viewer.extend(viewerDragDropMixin);
  if (endUserOptions.inspector) {
    viewer.extend(viewerCesiumInspectorMixin);
  }

  var showLoadError = function (name, error) {
    var title = "An error occurred while loading the file: " + name;
    var message =
      "An error occurred while loading the file, which may indicate that it is invalid.  A detailed error report is below:";
    viewer.cesiumWidget.showErrorPanel(title, message, error);
  };

  viewer.dropError.addEventListener(function (viewerArg, name, error) {
    showLoadError(name, error);
  });

  var scene = viewer.scene;
  var context = scene.context;

  var skyAtmosphere = scene.skyAtmosphere;
  var globe = scene.globe;
  var viewModel = {
    hueShift: -0.9,
    saturationShift: -0.7,
    brightnessShift: -0.33,
  };
  // Convert the viewModel members into knockout observables.
  knockout.track(viewModel);
  // Make the skyAtmosphere's HSB parameters subscribers of the viewModel.
  var subscribeParameter = function (name, globeName) {
    knockout.getObservable(viewModel, name).subscribe(function (newValue) {
      skyAtmosphere[name] = newValue;
      globe[globeName] = newValue;
    });
  };

  subscribeParameter("hueShift", "atmosphereHueShift");
  subscribeParameter("saturationShift", "atmosphereSaturationShift");
  subscribeParameter("brightnessShift", "atmosphereBrightnessShift");

  // 添加场景效果切换按钮
  PKXSceneEffect.init({
    globe: globe,
    scene: scene,
  })
  
  // 添加飞机模型到场景
  PKXEntities.airplane({
    viewer: viewer,
    start: CesiumJulianDate.fromDate(new Date()),
    position: defaultPosition,
    model: {
      uri: "CesiumViewer/models/CesiumAir/Cesium_Air.glb",
      minimumPixelSize: 66,
    },
  });
  
  

  if (endUserOptions.debug) {
    context.validateShaderProgram = true;
    context.validateFramebuffer = true;
    context.logShaderCompilation = true;
    context.throwOnWebGLError = true;
  }

  var view = endUserOptions.view;
  var source = endUserOptions.source;
  if (defined(source)) {
    var sourceType = endUserOptions.sourceType;
    if (!defined(sourceType)) {
      // autodetect using file extension if not specified
      if (/\.czml$/i.test(source)) {
        sourceType = "czml";
      } else if (
        /\.geojson$/i.test(source) ||
        /\.json$/i.test(source) ||
        /\.topojson$/i.test(source)
      ) {
        sourceType = "geojson";
      } else if (/\.kml$/i.test(source) || /\.kmz$/i.test(source)) {
        sourceType = "kml";
      }
    }

    var loadPromise;
    if (sourceType === "czml") {
      loadPromise = CzmlDataSource.load(source);
    } else if (sourceType === "geojson") {
      loadPromise = GeoJsonDataSource.load(source);
    } else if (sourceType === "kml") {
      loadPromise = KmlDataSource.load(source, {
        camera: scene.camera,
        canvas: scene.canvas,
        screenOverlayContainer: viewer.container,
      });
    } else {
      showLoadError(source, "Unknown format.");
    }

    if (defined(loadPromise)) {
      viewer.dataSources
        .add(loadPromise)
        .then(function (dataSource) {
          var lookAt = endUserOptions.lookAt;
          if (defined(lookAt)) {
            var entity = dataSource.entities.getById(lookAt);
            if (defined(entity)) {
              viewer.trackedEntity = entity;
            } else {
              var error =
                'No entity with id "' +
                lookAt +
                '" exists in the provided data source.';
              showLoadError(source, error);
            }
          } else if (!defined(view) && endUserOptions.flyTo !== "false") {
            viewer.flyTo(dataSource);
          }
        })
        .otherwise(function (error) {
          showLoadError(source, error);
        });
    }
  }

  if (endUserOptions.stats) {
    scene.debugShowFramesPerSecond = true;
  }

  var theme = endUserOptions.theme;
  if (defined(theme)) {
    if (endUserOptions.theme === "lighter") {
      document.body.classList.add("cesium-lighter");
      viewer.animation.applyThemeChanges();
    } else {
      var error = "Unknown theme: " + theme;
      viewer.cesiumWidget.showErrorPanel(error, "");
    }
  }

  if (defined(view)) {
    var splitQuery = view.split(/[ ,]+/);
    if (splitQuery.length > 1) {
      var longitude = !isNaN(+splitQuery[0]) ? +splitQuery[0] : 0.0;
      var latitude = !isNaN(+splitQuery[1]) ? +splitQuery[1] : 0.0;
      var height =
        splitQuery.length > 2 && !isNaN(+splitQuery[2])
          ? +splitQuery[2]
          : 300.0;
      var heading =
        splitQuery.length > 3 && !isNaN(+splitQuery[3])
          ? CesiumMath.toRadians(+splitQuery[3])
          : undefined;
      var pitch =
        splitQuery.length > 4 && !isNaN(+splitQuery[4])
          ? CesiumMath.toRadians(+splitQuery[4])
          : undefined;
      var roll =
        splitQuery.length > 5 && !isNaN(+splitQuery[5])
          ? CesiumMath.toRadians(+splitQuery[5])
          : undefined;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
      });
    }
  }

  var camera = viewer.camera;
  function saveCamera() {
    var position = camera.positionCartographic;
    var hpr = "";
    if (defined(camera.heading)) {
      hpr =
        "," +
        CesiumMath.toDegrees(camera.heading) +
        "," +
        CesiumMath.toDegrees(camera.pitch) +
        "," +
        CesiumMath.toDegrees(camera.roll);
    }
    endUserOptions.view =
      CesiumMath.toDegrees(position.longitude) +
      "," +
      CesiumMath.toDegrees(position.latitude) +
      "," +
      position.height +
      hpr;
    history.replaceState(undefined, "", "?" + objectToQuery(endUserOptions));
  }

  var timeout;
  if (endUserOptions.saveCamera !== "false") {
    camera.changed.addEventListener(function () {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(saveCamera, 1000);
    });
  }

  loadingIndicator.style.display = "none";
}

main();
