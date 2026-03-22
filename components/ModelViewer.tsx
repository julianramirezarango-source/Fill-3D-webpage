'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ModelViewerProps {
  buffer: ArrayBuffer;
}

export default function ModelViewer({ buffer }: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f8f8);

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(1, 2, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-2, -1, -1);
    scene.add(dirLight2);

    // Load STL from buffer
    const loader = new STLLoader();
    const geometry = loader.parse(buffer.slice(0));

    geometry.computeVertexNormals();
    geometry.center();

    const material = new THREE.MeshPhongMaterial({
      color: 0xf97316,   // Fill-3D orange
      specular: 0x444444,
      shininess: 40,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Auto-fit camera
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fovRad = (camera.fov * Math.PI) / 180;
    const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * 2.2;

    camera.position.set(distance * 0.7, distance * 0.5, distance);
    camera.lookAt(0, 0, 0);

    // Grid helper (subtle)
    const gridSize = maxDim * 2;
    const grid = new THREE.GridHelper(gridSize, 10, 0xdddddd, 0xeeeeee);
    grid.position.y = -size.y / 2;
    scene.add(grid);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = distance * 0.3;
    controls.maxDistance = distance * 4;

    // Auto-rotate slowly
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    // Stop auto-rotate on user interaction
    const stopAutoRotate = () => { controls.autoRotate = false; };
    renderer.domElement.addEventListener('pointerdown', stopAutoRotate);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', stopAutoRotate);
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [buffer]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '280px' }}>
      <div ref={mountRef} className="w-full h-full" />
      <p className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
        🖱 Arrastra para rotar · Scroll para zoom
      </p>
    </div>
  );
}
