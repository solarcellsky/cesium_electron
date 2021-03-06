window.CESIUM_BASE_URL = "Source/";

import {
  Cartesian3,
  createWorldTerrain,
  defined,
  formatError,
  Ion,
  Color,
  knockout,
  Rectangle,
  ImageMaterialProperty,
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
      //????????????????????????
      //imageryProvider: new Cesium.UrlTemplateImageryProvider({
      //  url: "http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}"
      //}),
      imageryProvider: new Cesium.WebMapServiceImageryProvider({
        //????????????????????????
          url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')  
      }),
      homeButton: false, //????????????
      baseLayerPicker: false, //??????????????????????????????
      navigationHelpButton: false, //??????????????????
      geocoder: false, //??????????????????????????????
      infoBox: false,//?????????????????????????????????????????????
      fullscreenButton: false, //????????????????????????
      timeline: true, //???????????????????????????
      animation: true, //????????????????????????
      sceneModePicker: true,//??????????????????????????????
      selectionIndicator: false, // ?????????????????????
      shouldAnimate: true,  //????????????
      navigationInstructionsInitiallyVisible: false
      // navigation: false,
      sceneMode: 1,  //?????????????????? 1 2D?????? 2 2D???????????? 3 3D??????  Cesium.SceneMode
      scene3DOnly: false, //??????????????????????????????3D???????????????GPU??????
    }

    //??????: scene.globe.enableLighting
    //?????????scene.fog.enabled
    //?????????scene.skyAtmosphere
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

    // HEATMAP
    var len = 300;
    var points = [];
    var max = 100;
    var width = 600;
    var height = 400;

    var latMin = 39.808265;
    var latMax = 40.114091;
    var lonMin = 116.393777;
    var lonMax = 116.622018;

    var dataRaw = [];
    for (var i = 0; i < len; i++) {
      var point = {
        lat: latMin + Math.random() * (latMax - latMin),
        lon: lonMin + Math.random() * (lonMax - lonMin),
        value: Math.floor(Math.random() * 100)
      };
      dataRaw.push(point);
    }
//
    for (var i = 0; i < len; i++) {
      var dataItem = dataRaw[i];
      var point = {
        x: Math.floor((dataItem.lat - latMin) / (latMax - latMin) * width),
        y: Math.floor((dataItem.lon - lonMin) / (lonMax - lonMin) * height),
        value: Math.floor(dataItem.value)
      };
      max = Math.max(max, dataItem.value);
      points.push(point);
    }


    var heatmapInstance = h337.create({
      // only container is required, the rest will be defaults
      container: document.getElementById("heatmap"),
    });
    
    // heatmap data format
    var data = {
      max: max,
      data: points
    };
    // if you have a set of datapoints always use setData instead of addData
    // for data initialization
    heatmapInstance.setData(data);

    var canvas = document.getElementsByClassName('heatmap-canvas');
    console.log(canvas[0]);

    viewer.entities.add({
      name: 'heatmap',
      rectangle: {
        coordinates: Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
        material: new ImageMaterialProperty({
          image: canvas[0],
          transparent: true
        })
      }
    });

    // hide copyright info
    viewer._cesiumWidget._creditContainer.style.display = "none";


    var dataSource = GeoJsonDataSource.load(
      "./CesiumViewer/geojson/110105.json",
      {
        stroke: Color.WHITE,
        fill: Color.BLUE.withAlpha(0.5),
        strokeWidth: 3,
      }
    );
    viewer.dataSources.add(dataSource);
    viewer.zoomTo(dataSource);

    console.log(viewer.entities)

    // TimelineFormatter(viewer);

    viewer.camera.flyTo({
      // Cesium??????????????????????????????
      // fromDegrees()???????????????????????????????????????????????????
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

  // ??????????????????????????????
  PKXSceneEffect.init({
    globe: globe,
    scene: scene,
  })
  
  // ???????????????????????????
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
