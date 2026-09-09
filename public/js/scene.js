/* ============================================================
   VOLK NOIR — background 3D scene
   A wireframe entity that pulses like something breathing
   beneath the floor. Starfield as drifting embers. Built with
   three.js (r128, classic script build).
   ============================================================ */

(function () {
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("bg-canvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020000, 0.045);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.4, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* ---------- central wireframe crystal ---------- */
  const crystalGroup = new THREE.Group();

  const geo = new THREE.IcosahedronGeometry(2.1, 1);
  // distort vertices irregularly so it never reads as a clean, tidy shape
  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
    const n = 1 + (Math.random() - 0.5) * 0.28;
    v.multiplyScalar(n);
    posAttr.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const edges = new THREE.EdgesGeometry(geo);
  const crystalMat = new THREE.LineBasicMaterial({
    color: 0x8a0f14,
    transparent: true,
    opacity: 0.9,
  });
  const crystal = new THREE.LineSegments(edges, crystalMat);
  crystalGroup.add(crystal);

  // inner faint solid fill — the thing has a body, barely visible
  const fillMat = new THREE.MeshBasicMaterial({
    color: 0x4b0d14,
    transparent: true,
    opacity: 0.09,
    side: THREE.DoubleSide,
  });
  const fillMesh = new THREE.Mesh(geo, fillMat);
  crystalGroup.add(fillMesh);

  // outer larger echo shell — a second, slower membrane around it
  const geo2 = new THREE.IcosahedronGeometry(2.9, 0);
  const edges2 = new THREE.EdgesGeometry(geo2);
  const shellMat = new THREE.LineBasicMaterial({
    color: 0x3a0509,
    transparent: true,
    opacity: 0.22,
  });
  const shell = new THREE.LineSegments(edges2, shellMat);
  crystalGroup.add(shell);

  // a single dim ember at the core — the "eye"
  const eyeGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const eyeMat = new THREE.MeshBasicMaterial({
    color: 0xc9a227,
    transparent: true,
    opacity: 0.65,
  });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  crystalGroup.add(eye);

  scene.add(crystalGroup);

  /* ---------- starfield ---------- */
  const starCount = 900;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x8a5a3a,
    size: 0.05,
    transparent: true,
    opacity: 0.55,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- floor: a wide dark circle, not a tidy grid ---------- */
  const grid = new THREE.GridHelper(60, 40, 0x8a0f14, 0x140404);
  grid.position.y = -3.4;
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  scene.add(grid);

  /* ---------- mouse parallax ---------- */
  let mouseX = 0,
    mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ---------- resize ---------- */
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- animation loop ---------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      crystalGroup.rotation.y = t * 0.12;
      crystalGroup.rotation.x = Math.sin(t * 0.1) * 0.2;
      shell.rotation.y = -t * 0.06;
      stars.rotation.y = t * 0.008;

      // heartbeat pulse — the entity breathes
      const pulse = 1 + Math.sin(t * 1.5) * 0.05 + Math.pow(Math.sin(t * 1.5), 8) * 0.05;
      crystalGroup.scale.setScalar(pulse);

      // the eye flickers, never fully steady
      eye.material.opacity = 0.45 + Math.random() * 0.35;

      // faint unsettling camera drift, like something breathing behind it
      const shake = Math.sin(t * 0.7) * 0.02 + Math.sin(t * 2.3) * 0.008;

      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
      camera.position.y += (1.4 - mouseY * 0.6 - camera.position.y) * 0.02;
      camera.position.z = 9 + shake;
      camera.lookAt(0, 0.4, 0);
    }

    renderer.render(scene, camera);
  }
  animate();
})();
