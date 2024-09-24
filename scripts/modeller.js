var canvas = new fabric.Canvas("canvas");
var isDrawing = false;
var line;
var grid = 10;
var lineDrawingEnabled = false;
var measurementsEnabled = false;
var unit = document.getElementById("unitInput").value;
var scale = document.getElementById("scaleInput").value;

function drawGrid() {
  for (var i = 0; i < canvas.width / grid; i++) {
    canvas.add(
      new fabric.Line([i * grid, 0, i * grid, canvas.height], {
        stroke: "#ccc",
        selectable: false,
        evented: false,
      }),
    );
    canvas.add(
      new fabric.Line([0, i * grid, canvas.width, i * grid], {
        stroke: "#ccc",
        selectable: false,
        evented: false,
      }),
    );
  }
}

function snapToGrid(point) {
  return Math.round(point / grid) * grid;
}

function addRectangle() {
  var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: "red",
    width: 50,
    height: 50,
  });
  canvas.add(rect);
  if (measurementsEnabled) addDimensions(rect);
}

function addCircle() {
  var circle = new fabric.Circle({
    left: 150,
    top: 150,
    fill: "blue",
    radius: 30,
  });
  canvas.add(circle);
  if (measurementsEnabled) addDimensions(circle);
}

function addTriangle() {
  var triangle = new fabric.Triangle({
    left: 200,
    top: 200,
    fill: "green",
    width: 50,
    height: 50,
  });
  canvas.add(triangle);
  if (measurementsEnabled) addDimensions(triangle);
}

function toggleLineDrawing() {
  lineDrawingEnabled = !lineDrawingEnabled;
  isDrawing = false;
  if (lineDrawingEnabled) {
    canvas.on("mouse:down", startLine);
    canvas.on("mouse:move", drawLine);
    canvas.on("mouse:up", stopLine);
    document.getElementById("lineButton").classList.add("active");
  } else {
    canvas.off("mouse:down", startLine);
    canvas.off("mouse:move", drawLine);
    canvas.off("mouse:up", stopLine);
    document.getElementById("lineButton").classList.remove("active");
  }
}

function startLine(o) {
  isDrawing = true;
  var pointer = canvas.getPointer(o.e);
  var points = [
    snapToGrid(pointer.x),
    snapToGrid(pointer.y),
    snapToGrid(pointer.x),
    snapToGrid(pointer.y),
  ];
  line = new fabric.Line(points, {
    strokeWidth: 2,
    fill: "black",
    stroke: "black",
    originX: "center",
    originY: "center",
  });
  canvas.add(line);
}

function drawLine(o) {
  if (!isDrawing) return;
  var pointer = canvas.getPointer(o.e);
  line.set({ x2: snapToGrid(pointer.x), y2: snapToGrid(pointer.y) });
  canvas.renderAll();
}

function stopLine() {
  isDrawing = false;
  if (measurementsEnabled) addDimensions(line);
}

function disableDrawing() {
  isDrawing = false;
  canvas.off("mouse:down");
  canvas.off("mouse:move");
  canvas.off("mouse:up");
}

function deleteSelectedObject() {
  var activeObjects = canvas.getActiveObjects();
  activeObjects.forEach(function (object) {
    if (object.measurement) {
      canvas.remove(object.measurement);
    }
    canvas.remove(object);
  });
  canvas.discardActiveObject();
  canvas.renderAll();
}

function addLabel() {
  var text = new fabric.Textbox("Label", {
    left: 250,
    top: 250,
    width: 150,
    fontSize: 20,
    fill: "black",
  });
  canvas.add(text);
}

function addDimensions(object) {
  let text;
  if (object.type === "line") {
    var length = (
      Math.sqrt(
        Math.pow(object.x2 - object.x1, 2) + Math.pow(object.y2 - object.y1, 2),
      ) * scale
    ).toFixed(2);
    text = new fabric.Textbox(length + " " + unit, {
      left: (object.x1 + object.x2) / 2,
      top: (object.y1 + object.y2) / 2,
      fontSize: 14,
      fill: "black",
      selectable: true,
      editable: true,
      width: 100,
    });
    canvas.add(text);
    object.on("modified", function () {
      length = (
        Math.sqrt(
          Math.pow(object.x2 - object.x1, 2) +
            Math.pow(object.y2 - object.y1, 2),
        ) * scale
      ).toFixed(2);
      text.set({
        left: (object.x1 + object.x2) / 2,
        top: (object.y1 + object.y2) / 2,
        text: length + " " + unit,
      });
      canvas.renderAll();
    });
  } else {
    text = new fabric.Textbox(
      (object.width * object.scaleX * scale).toFixed(2) +
        " x " +
        (object.height * object.scaleY * scale).toFixed(2) +
        " " +
        unit,
      {
        left: object.left,
        top: object.top - 20,
        fontSize: 14,
        fill: "black",
        selectable: true,
        editable: true,
        width: 150,
      },
    );
    canvas.add(text);
    object.on("modified", function () {
      text.set({
        left: object.left,
        top: object.top - 20,
        text:
          (object.width * object.scaleX * scale).toFixed(2) +
          " x " +
          (object.height * object.scaleY * scale).toFixed(2) +
          " " +
          unit,
      });
      canvas.renderAll();
    });
    object.on("moving", function () {
      text.set({
        left: object.left,
        top: object.top - 20,
      });
    });
  }
  object.measurement = text;
}

function removeDimensions(object) {
  if (object.measurement) {
    canvas.remove(object.measurement);
    object.measurement = null;
  }
}

function toggleMeasurements() {
  measurementsEnabled = !measurementsEnabled;
  var activeObjects = canvas.getActiveObjects();
  activeObjects.forEach(function (object) {
    if (measurementsEnabled) {
      if (!object.measurement) {
        addDimensions(object);
      }
    } else {
      if (object.measurement) {
        removeDimensions(object);
      }
    }
  });
  document
    .getElementById("toggleMeasurementsButton")
    .classList.toggle("active", measurementsEnabled);
}

function updateAllMeasurements() {
  canvas.getObjects().forEach(function (object) {
    if (object.measurement) {
      removeDimensions(object);
      addDimensions(object);
    }
  });
}

canvas.on("object:moving", function (options) {
  options.target.set({
    left: Math.round(options.target.left / grid) * grid,
    top: Math.round(options.target.top / grid) * grid,
  });
});

canvas.on("object:scaling", function (options) {
  var target = options.target;
  var newWidth = target.width * target.scaleX;
  var newHeight = target.height * target.scaleY;

  var snappedWidth = Math.round(newWidth / grid) * grid;
  var snappedHeight = Math.round(newHeight / grid) * grid;

  var scaleX = snappedWidth / target.width;
  var scaleY = snappedHeight / target.height;

  var left = target.left;
  var top = target.top;

  switch (target.__corner) {
    case "tl":
      left = target.left + target.width * target.scaleX - snappedWidth;
      top = target.top + target.height * target.scaleY - snappedHeight;
      break;
    case "tr":
      top = target.top + target.height * target.scaleY - snappedHeight;
      break;
    case "bl":
      left = target.left + target.width * target.scaleX - snappedWidth;
      break;
    case "br":
      break;
  }

  left = Math.round(left / grid) * grid;
  top = Math.round(top / grid) * grid;

  target.set({
    scaleX: scaleX,
    scaleY: scaleY,
    left: left,
    top: top,
  });

  target.setCoords();
  canvas.renderAll();
});

drawGrid();

document
  .getElementById("lineButton")
  .addEventListener("click", toggleLineDrawing);
document
  .getElementById("rectangleButton")
  .addEventListener("click", function () {
    disableDrawing();
    addRectangle();
  });
document.getElementById("circleButton").addEventListener("click", function () {
  disableDrawing();
  addCircle();
});
document
  .getElementById("triangleButton")
  .addEventListener("click", function () {
    disableDrawing();
    addTriangle();
  });
document
  .getElementById("deleteButton")
  .addEventListener("click", deleteSelectedObject);
document.getElementById("labelButton").addEventListener("click", function () {
  disableDrawing();
  addLabel();
});
document
  .getElementById("toggleMeasurementsButton")
  .addEventListener("click", toggleMeasurements);

document.getElementById("unitInput").addEventListener("change", function (e) {
  unit = e.target.value;
  updateAllMeasurements();
});

document.getElementById("scaleInput").addEventListener("change", function (e) {
  scale = e.target.value;
  updateAllMeasurements();
});

function convertTo3D() {
  document.getElementById("canvas-container").style.display = "none";
  document.getElementById("3d-container").style.display = "block";

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("3d-container").appendChild(renderer.domElement);

  var light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);

  canvas.getObjects().forEach(function (object) {
    var shape;
    var geometry;
    var material = new THREE.MeshBasicMaterial({ color: object.fill });

    if (object.type === "rect") {
      geometry = new THREE.BoxGeometry(
        object.width / 10,
        object.height / 10,
        10,
      );
      shape = new THREE.Mesh(geometry, material);
      shape.position.set(object.left / 10, object.top / 10, 5);
    } else if (object.type === "circle") {
      geometry = new THREE.CylinderGeometry(
        object.radius / 10,
        object.radius / 10,
        10,
        32,
      );
      shape = new THREE.Mesh(geometry, material);
      shape.position.set(object.left / 10, object.top / 10, 5);
    } else if (object.type === "triangle") {
      geometry = new THREE.ConeGeometry(
        object.width / 20,
        object.height / 10,
        3,
      );
      shape = new THREE.Mesh(geometry, material);
      shape.position.set(object.left / 10, object.top / 10, 5);
    }

    if (shape) {
      scene.add(shape);
    }
  });

  camera.position.z = 100;

  var animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();
}

document.getElementById("convertBtn").addEventListener("click", convertTo3D);
