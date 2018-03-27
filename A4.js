/*
 * UBC CPSC 314, Vsep2017
 * Assignment 4 Template
 */
//Game Elements
var intervalID = null;
var infobox = document.getElementById('infobox');
var infoboxHidden = false;
var gameScoreCount = document.getElementById('gameScore');
var score = 0;
var timeCount = 0;
var gameTracker = document.getElementById('gameTracker');
var switchLeftDirection = false;
var switchRightDirection = false;
var switchLeftLegDirection = false;
var switchRightLegDirection = false;
var swivelCamera = true;

//Sound Elements
var eatSound = new sound("sounds/eatSound.mp3");
var bgMusic = new sound("sounds/epicMusic.mp3");
var goodJob = new sound("sounds/applause.mp3");
var badJob = new sound("sounds/BooYouSuck.mp3");

// Setup renderer
var canvas = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF);
canvas.appendChild(renderer.domElement);

// Adapt backbuffer to window size
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  lightCamera.aspect = window.innerWidth / window.innerHeight;
  lightCamera.updateProjectionMatrix();
}

// Hook up to event listener
window.addEventListener('resize', resize);
window.addEventListener('vrdisplaypresentchange', resize, true);

// Disable scrollbar function
window.onscroll = function() {
  window.scrollTo(0, 0);
}

var depthScene = new THREE.Scene(); // shadowmap
var finalScene = new THREE.Scene(); // final result

// Main camera
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(0,2,20);
camera.lookAt(finalScene.position);
finalScene.add(camera);

// COMMENT BELOW FOR VR CAMERA
// ------------------------------

// Giving it some controls
cameraControl = new THREE.OrbitControls(camera);
cameraControl.damping = 0.2;
cameraControl.autoRotate = false;
// ------------------------------
// COMMENT ABOVE FOR VR CAMERA



// UNCOMMENT BELOW FOR VR CAMERA
// ------------------------------
// Apply VR headset positional data to camera.
// var controls = new THREE.VRControls(camera);
// controls.standing = true;

// // Apply VR stereo rendering to renderer.
// var effect = new THREE.VREffect(renderer);
// effect.setSize(window.innerWidth, window.innerHeight);


// var display;

// // Create a VR manager helper to enter and exit VR mode.
// var params = {
//   hideButton: false, // Default: false.
//   isUndistorted: false // Default: false.
// };
// var manager = new WebVRManager(renderer, effect, params);
// ------------------------------
// UNCOMMENT ABOVE FOR VR CAMERA


// ------------------------------
// LOADING MATERIALS AND TEXTURES

// Shadow map camera
var shadowMapWidth = 10
var shadowMapHeight = 10
var lightDirection = new THREE.Vector3(0.49,0.79,0.49);
var lightCamera = new THREE.OrthographicCamera(shadowMapWidth / - 2, shadowMapWidth / 2, shadowMapHeight / 2, shadowMapHeight / -2, 1, 1000)
lightCamera.position.set(10, 10, 10)
lightCamera.lookAt(new THREE.Vector3(lightCamera.position - lightDirection));
depthScene.add(lightCamera);

// XYZ axis helper
var worldFrame = new THREE.AxisHelper(2);
finalScene.add(worldFrame)

// texture containing the depth values from the lightCamera POV
// anisotropy allows the texture to be viewed decently at skewed angles
var shadowMapWidth = window.innerWidth
var shadowMapHeight = window.innerHeight

// Texture/Render Target where the shadowmap will be written to
var shadowMap = new THREE.WebGLRenderTarget(shadowMapWidth, shadowMapHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } )

// Loading the different textures
// Anisotropy allows the texture to be viewed 'decently' at different angles
var colorMap = new THREE.TextureLoader().load('images/luminous.jpg')
colorMap.anisotropy = renderer.getMaxAnisotropy()
var normalMap = new THREE.TextureLoader().load('images/normal.png')
normalMap.anisotropy = renderer.getMaxAnisotropy()
var aoMap = new THREE.TextureLoader().load('images/ambient_occlusion.png')
aoMap.anisotropy = renderer.getMaxAnisotropy()

// Uniforms
var cameraPositionUniform = {type: "v3", value: camera.position }
var lightColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0) };
var ambientColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0) };
var lightDirectionUniform = {type: "v3", value: lightDirection };
var kAmbientUniform = {type: "f", value: 0.1};
var kDiffuseUniform = {type: "f", value: 0.8};
var kSpecularUniform = {type: "f", value: 0.4};
var shininessUniform = {type: "f", value: 50.0};
var lightViewMatrixUniform = {type: "m4", value: lightCamera.matrixWorldInverse};
var lightProjectMatrixUniform = {type: "m4", value: lightCamera.projectionMatrix};

// Materials
var depthMaterial = new THREE.ShaderMaterial({})

var terrainMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    lightColorUniform: lightColorUniform,
    ambientColorUniform: ambientColorUniform,
    lightDirectionUniform: lightDirectionUniform,
    kAmbientUniform: kAmbientUniform,
    kDiffuseUniform: kDiffuseUniform,
    kSpecularUniform, kSpecularUniform,
    shininessUniform: shininessUniform,
    colorMap: { type: "t", value: colorMap },
    normalMap: { type: "t", value: normalMap },
    aoMap: { type: "t", value: aoMap },
    shadowMap: { type: "t", value: shadowMap },
    lightViewMatrixUniform: lightViewMatrixUniform,
    lightProjectMatrixUniform: lightProjectMatrixUniform,
  },
});

//armadillo Uniforms
var leftArmAngle = {
  type:'f',
  value: 0.0000
}
var rightArmAngle = {
  type:'f',
  value: 0.0000
}
var left_tMat = new THREE.Matrix4();
left_tMat.set(
  1,0,0,-0.5,
  0,1,0,-1.2,
  0,0,1,-0.1,
  0,0,0,1
);
var left_invMat = new THREE.Matrix4();
left_invMat.getInverse(left_tMat);
var right_tMat = new THREE.Matrix4();
right_tMat.set(
  1,0,0,0.5,
  0,1,0,-1.2,
  0,0,1,-0.1,
  0,0,0,1
);
var right_invMat = new THREE.Matrix4();
right_invMat.getInverse(right_tMat);
//leg values
var leftLegAngle = {
  type:'f',
  value: 0.0000
}
var rightLegAngle = {
  type:'f',
  value: 0.0000
}
var leftLeg_tMat = new THREE.Matrix4();
leftLeg_tMat.set(
  1,0,0,-0.3,
  0,1,0,-0.3,
  0,0,1,-0.35,
  0,0,0,1
);
var leftLeg_invMat = new THREE.Matrix4();
leftLeg_invMat.getInverse(leftLeg_tMat);
var rightLeg_tMat = new THREE.Matrix4();
rightLeg_tMat.set(
  1,0,0,0.3,
  0,1,0,-0.3,
  0,0,1,-0.35,
  0,0,0,1
);
var rightLeg_invMat = new THREE.Matrix4();
rightLeg_invMat.getInverse(rightLeg_tMat);

var armadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightColorUniform: lightColorUniform,
    ambientColorUniform: ambientColorUniform,
    lightDirectionUniform: lightDirectionUniform,
    kAmbientUniform: kAmbientUniform,
    kDiffuseUniform: kDiffuseUniform,
    kSpecularUniform, kSpecularUniform,
    shininessUniform: shininessUniform,
    left_tMat: {type:'m4',value:left_tMat},
    left_invMat: {type:'m4',value:left_invMat},
    right_tMat: {type:'m4',value:right_tMat},
    right_invMat: {type:'m4',value:right_invMat},
    leftArmAngle: leftArmAngle,
    rightArmAngle: rightArmAngle,
    leftLeg_tMat: {type:'m4',value:leftLeg_tMat},
    leftLeg_invMat: {type:'m4',value:leftLeg_invMat},
    rightLeg_tMat: {type:'m4',value:rightLeg_tMat},
    rightLeg_invMat: {type:'m4',value:rightLeg_invMat},
    leftLegAngle: leftLegAngle,
    rightLegAngle: rightLegAngle
  },
});

var fruitMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightColorUniform: lightColorUniform,
    lightDirectionUniform: lightDirectionUniform,
    kDiffuseUniform: kDiffuseUniform,
    shininessUniform: shininessUniform,
  }
});

var skyboxCubemap = new THREE.CubeTextureLoader()
  .setPath( 'images/deliriousCubemap/' )
  .load( [
  'delirious_ft.png', 'delirious_bk.png',
  'delirious_up.png', 'delirious_dn.png',
  'delirious_rt.png', 'delirious_lf.png'
  ] );

var skyboxMaterial = new THREE.ShaderMaterial({
	uniforms: {
		skybox: { type: "t", value: skyboxCubemap },
    cameraPositionUniform: cameraPositionUniform,
	},
    side: THREE.BackSide
})

// -------------------------------
// LOADING SHADERS
var shaderFiles = [
  'glsl/depth.vs.glsl',
  'glsl/depth.fs.glsl',

  'glsl/terrain.vs.glsl',
  'glsl/terrain.fs.glsl',

  'glsl/bphong.vs.glsl',
  'glsl/bphong.fs.glsl',

  'glsl/skybox.vs.glsl',
  'glsl/skybox.fs.glsl',

  'glsl/gooch.vs.glsl',
  'glsl/gooch.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
	depthMaterial.vertexShader = shaders['glsl/depth.vs.glsl']
	depthMaterial.fragmentShader = shaders['glsl/depth.fs.glsl']
	terrainMaterial.vertexShader = shaders['glsl/terrain.vs.glsl']
	terrainMaterial.fragmentShader = shaders['glsl/terrain.fs.glsl']
	armadilloMaterial.vertexShader = shaders['glsl/bphong.vs.glsl']
	armadilloMaterial.fragmentShader = shaders['glsl/bphong.fs.glsl']
	skyboxMaterial.vertexShader = shaders['glsl/skybox.vs.glsl']
	skyboxMaterial.fragmentShader = shaders['glsl/skybox.fs.glsl']
  fruitMaterial.vertexShader = shaders['glsl/gooch.vs.glsl']
  fruitMaterial.fragmentShader = shaders['glsl/gooch.fs.glsl']
})

// LOAD OBJ ROUTINE
// mode is the scene where the model will be inserted
function loadOBJ(scene, file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot, name) {
  var onProgress = function(query) {
    if (query.lengthComputable) {
      var percentComplete = query.loaded / query.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function() {
    console.log('Failed to load ' + file);
  };

  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    object.name = name;
    object.position.set(xOff, yOff, zOff);
    object.rotation.x = xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale, scale, scale);
    scene.add(object)
  }, onProgress, onError);
}

// -------------------------------
// ADD OBJECTS TO THE SCENE
var terrainGeometry = new THREE.PlaneBufferGeometry(20, 20);
var terrain = new THREE.Mesh(terrainGeometry, terrainMaterial)
terrain.rotation.set(-1.57, 0, 0)
finalScene.add(terrain)
var terrainDO = new THREE.Mesh(terrainGeometry, depthMaterial)
terrainDO.rotation.set(-1.57, 0, 0)
depthScene.add(terrainDO)

// Add skybox
var skyboxGeometry = new THREE.BoxGeometry( 500, 500, 500 );
var skyboxMesh = new THREE.Mesh( skyboxGeometry, skyboxMaterial );
finalScene.add(skyboxMesh);

var sphereGeo = new THREE.SphereGeometry(0.5, 10, 10);
var sphere = new THREE.Mesh(sphereGeo,fruitMaterial);
sphere.position.set(0,1,4);
sphere.name = 'sphere';
finalScene.add(sphere);

loadOBJ(finalScene, 'obj/armadillo.obj', armadilloMaterial, 1.0, 0, 1.0, 0, 0, 3.14, 0, 'armadillo')
loadOBJ(depthScene, 'obj/armadillo.obj', depthMaterial, 1.0, 0, 1.0, 0, 0, 3.14, 0, 'armadillo')

// -------------------------------
// sound functions
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

// functions for game
function showInfoBox() {
  infobox.className = "infobox";
}

function hideInfoBox() {
  infobox.className = "infobox hidden";
}

function showStartButton() {
  startButton.className = "startButton";
}

function hideStartButton() {
  startButton.className = "startButton hidden";
}

function hideGameTracker() {
  gameTracker.className = "timebox hidden";
}

function showGameTracker() {
  gameTracker.className = "timebox";
}

function incrementScore() {
  gameScoreCount.innerHTML = Number(gameScoreCount.innerText) + 1;
  score++;
}

function startGame() {
  hideStartButton();
  hideInfoBox();
  showGameTracker();
  swivelCamera = false;
  camera.position.set(0,20,30);
  camera.lookAt(finalScene.position);
  intervalID = setInterval(elapsedTimer, 1000);
  bgMusic.play();
}

function resetGame() {
  clearInterval(intervalID);
  showStartButton();
  showInfoBox();
  hideGameTracker();
  timeCount = 0;
  score = 0;
}

//updates time display
function displayElapsedTime(time) {
  var timeCount = document.getElementById('totalElapsedTime');
  timeCount.innerHTML = time;
}

function elapsedTimer() {
  console.log(timeCount);
	timeCount++;
	displayElapsedTime(timeCount);
	if(timeCount > 59) {
    bgMusic.stop();
    (score>5) ? goodJob.play() : badJob.play();
    gameScoreCount.innerHTML = 0;
    var playAgain = confirm("Time's up! Your score is " + score + " woohoo!! Do you want to play again?");
    (playAgain) ? resetGame() : alert("Thank you for playing!");
	}
}

function animateArmadilloWalk() {
  if (leftArmAngle.value >= -0.88 && switchLeftDirection==false) {
    leftArmAngle.value -= 0.04;
    if (leftArmAngle.value <= -0.8)
      switchLeftDirection = true;
  }
  else if (leftArmAngle.value <= 0.88 && switchLeftDirection == true) {
    leftArmAngle.value += 0.04;
    if (leftArmAngle.value >= 0.8)
      switchLeftDirection = false;
  }

  if (rightArmAngle.value >= -0.88 && switchRightDirection==false) {
    rightArmAngle.value += 0.04;
    if (rightArmAngle.value >= 0.8)
      switchRightDirection = true;
  }
  else if (rightArmAngle.value <= 0.88 && switchRightDirection == true) {
    rightArmAngle.value -= 0.04;
    if (rightArmAngle.value <= -0.8)
      switchRightDirection = false;
  }

  if (leftLegAngle.value >= -0.88 && switchLeftLegDirection==false) {
    leftLegAngle.value += 0.04;
    if (leftLegAngle.value >= 0.8)
      switchLeftLegDirection = true;
  }
  else if (leftLegAngle.value <= 0.88 && switchLeftLegDirection == true) {
    leftLegAngle.value -= 0.04;
    if (leftLegAngle.value <= -0.8)
      switchLeftLegDirection = false;
  }

  if (rightLegAngle.value >= -0.88 && switchRightLegDirection==false) {
    rightLegAngle.value -= 0.04;
    if (rightLegAngle.value <= -0.8)
      switchRightLegDirection = true;
  }
  else if (rightLegAngle.value <= 0.88 && switchRightLegDirection == true) {
    rightLegAngle.value += 0.04;
    if (rightLegAngle.value >= 0.8)
      switchRightLegDirection = false;
  }
}

var keyboard = new THREEx.KeyboardState();

function checkKeyboard() {
  var armadillo = finalScene.getObjectByName('armadillo',true);

  if (keyboard.pressed("W")) {
    armadillo.position.z -= 0.1;
    animateArmadilloWalk(); }
  else if (keyboard.pressed("S")) {
    armadillo.position.z += 0.1;
    animateArmadilloWalk(); }
  else if (keyboard.pressed("A")) {
    armadillo.position.x -= 0.1;
    animateArmadilloWalk(); }
  else if (keyboard.pressed("D")) {
    armadillo.position.x += 0.1;
    animateArmadilloWalk(); }
  else if (keyboard.pressed("Q")) {
    armadillo.rotation.y += 0.1;
    animateArmadilloWalk(); }
  else if (keyboard.pressed("E")) {
    armadillo.rotation.y -= 0.1;
    animateArmadilloWalk(); }
}

function updateMaterials() {
	cameraPositionUniform.value = camera.position

	depthMaterial.needsUpdate = true
	terrainMaterial.needsUpdate = true
	armadilloMaterial.needsUpdate = true
	skyboxMaterial.needsUpdate = true
  fruitMaterial.needsUpdate = true
}

// Update routine
function update() {
  var armadillo = finalScene.getObjectByName('armadillo',true);

	checkKeyboard();
	updateMaterials();
	requestAnimationFrame(update)

	renderer.render(depthScene, lightCamera, shadowMap)
	renderer.render(finalScene, camera)

  if ((armadillo.position.z < sphere.position.z+1.0) && (armadillo.position.z > sphere.position.z-1.0) && (armadillo.position.x < sphere.position.x+1.0) && (armadillo.position.x > sphere.position.x-1.0)) {
    console.log("Hit");
    eatSound.play();
    incrementScore();
    var toggle = Math.floor(Math.random()*2) == 1 ? 1 : -1;
    var x = Math.floor((Math.random() * 5) +1) * toggle;
    var z = Math.floor((Math.random() * 5) +1) * toggle;
    console.log(x,z);
    sphere.position.set(x,1,z);
  }
  else
    console.log("Miss");

  // UNCOMMENT BELOW FOR VR CAMERA
  // ------------------------------
  // Update VR headset position and apply to camera.
  // controls.update();
  // ------------------------------
  // UNCOMMENT ABOVE FOR VR CAMERA

  // To see the shadowmap values:
    // renderer.render(depthScene, lightCamera)
}

resize()
update();
