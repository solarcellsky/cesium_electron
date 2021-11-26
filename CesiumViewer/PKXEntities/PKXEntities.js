import {
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRange,
  TimeIntervalCollection,
  TimeInterval,
  VelocityOrientationProperty,
  PolylineGlowMaterialProperty,
  Color,
  SampledPositionProperty,
  JulianDate as CesiumJulianDate,
  HermitePolynomialApproximation
} from "../../Source/Cesium.js";

/*
  * @options
  {
    viewer: undefined,
    start: undefined,
    position: undefined,
    model: undefined,
  }

*/
export const PKXEntities = {
  airplane: (options) => {
    const { viewer, start, position, model } = options;
    // //Set bounds of our simulation time
    const stop = CesiumJulianDate.addSeconds(
      start,
      360,
      new CesiumJulianDate()
    );

    //Generate a random circular pattern with varying heights.
    const computeCirclularFlight = (lon, lat, radius) => {
      var property = new SampledPositionProperty();
      for (var i = 0; i <= 360; i += 45) {
        var radians = CesiumMath.toRadians(i);
        var time = CesiumJulianDate.addSeconds(
          start,
          i,
          new CesiumJulianDate()
        );
        var position = Cartesian3.fromDegrees(
          lon + radius * 1.5 * Math.cos(radians),
          lat + radius * Math.sin(radians),
          CesiumMath.nextRandomNumber() * 500 + 50
        );
        property.addSample(time, position);
    
        //Also create a point for each sample we generate.
        viewer.entities.add({
          position: position,
          point: {
            pixelSize: 1,
            color: Color.TRANSPARENT,
            outlineColor: Color.GREEN,
            outlineWidth: 5,
          },
        });
      }
      return property;
    }

    var $position = computeCirclularFlight(
      position[0],
      position[1], 
      0.03
    );

    var entity = viewer.entities.add({
      //Set the entity availability to the same interval as the simulation time.
      availability: new TimeIntervalCollection([
        new TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
    
      //Use our computed positions
      position: $position,
    
      //Automatically compute orientation based on position movement.
      orientation: new VelocityOrientationProperty($position),
    
      //Load the Cesium plane model to represent the entity
      model: model,
    
      //Show the path as a yellow line sampled in 1 second increments.
      path: {
        resolution: 1,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Color.YELLOW,
        }),
        width: 10,
      },
    });

    entity.position.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: HermitePolynomialApproximation,
    });

    //Add button to view the path from the top down
    Sandcastle.addDefaultToolbarButton("俯视", function () {
      viewer.trackedEntity = undefined;
      viewer.zoomTo(
        viewer.entities,
        new HeadingPitchRange(0, CesiumMath.toRadians(-90))
      );
    });

    //Add button to view the path from the side
    Sandcastle.addToolbarButton("侧视", function () {
      viewer.trackedEntity = undefined;
      viewer.zoomTo(
        viewer.entities,
        new HeadingPitchRange(
          CesiumMath.toRadians(-90),
          CesiumMath.toRadians(-15),
          7500
        )
      );
    });

    //Add button to track the entity as it moves
    Sandcastle.addToolbarButton("飞行器", function () {
      viewer.trackedEntity = entity;
    });
  }
}