'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreeOnboardingSceneProps {
  step: number;
  theme?: 'light' | 'dark';
  className?: string;
  compact?: boolean;
}

export function ThreeOnboardingScene({
  step,
  theme = 'light',
  className = '',
  compact = false,
}: ThreeOnboardingSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stepRef = useRef<number>(step);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webglFallback, setWebglFallback] = useState(false);

  // Refs to update 3D materials dynamically when theme switches between light & dark
  const dotMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const spineMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const stemMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const isDark = theme === 'dark';
    if (dotMatRef.current) {
      // High-contrast luminous cyan/lime dots in dark mode; deep till ink in light mode
      dotMatRef.current.color.setHex(isDark ? 0xddf24e : 0x13222b);
    }
    if (spineMatRef.current) {
      spineMatRef.current.color.setHex(isDark ? 0x74c2f6 : 0x13222b);
    }
    if (stemMatRef.current) {
      stemMatRef.current.color.setHex(isDark ? 0xffffff : 0x13222b);
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = isDark ? 1.28 : 1.1;
    }
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let envTexture: THREE.Texture | null = null;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    let frameId = 0;

    let handleResize: (() => void) | null = null;
    let handlePointerMove: ((e: PointerEvent) => void) | null = null;

    const isDarkInitial = theme === 'dark';

    try {
      const isHeadless =
        typeof navigator !== 'undefined' &&
        (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = isDarkInitial ? 1.28 : 1.1;
      renderer.setPixelRatio(
        isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      );
      rendererRef.current = renderer;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;
        pmremGenerator.dispose();
      } catch {
        // Fallback if PMREM fails on basic WebGL drivers
      }

      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
      camera.position.set(0, 0.1, compact ? 6.4 : 6.9);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x6fb0a8, 1.4);
      const dirLight = new THREE.DirectionalLight(0xfff9e6, 1.55);
      dirLight.position.set(3.5, 5.5, 4.5);
      const rimLight = new THREE.DirectionalLight(0x74c2f6, 0.85);
      rimLight.position.set(-4, -2, -3);
      scene.add(hemiLight, dirLight, rimLight);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      const makeMat = (color: number, metalness = 0.25, roughness = 0.35) => {
        const m = new THREE.MeshStandardMaterial({ color, metalness, roughness });
        materials.push(m);
        return m;
      };

      const addBox = (
        w: number,
        h: number,
        d: number,
        color: number,
        x: number,
        y: number,
        z: number,
        metalness = 0.15,
        roughness = 0.45
      ) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        geometries.push(geo);
        const mat = makeMat(color, metalness, roughness);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        return { mesh, mat };
      };

      // 1. Composite Hero Coin ('b' emblem in 3D)
      const coinGroup = new THREE.Group();
      coinGroup.position.set(0, 0.12, 0.1);
      coinGroup.userData.baseY = 0.12;

      const cylGeo = new THREE.CylinderGeometry(1.02, 1.02, 0.24, 64);
      geometries.push(cylGeo);
      const coinBody = new THREE.Mesh(cylGeo, makeMat(0xddf24e, 0.45, 0.22));
      coinBody.rotation.x = Math.PI / 2;

      const rimGeo = new THREE.TorusGeometry(0.76, 0.075, 20, 64);
      geometries.push(rimGeo);
      const rimFront = new THREE.Mesh(rimGeo, makeMat(0xffffff, 0.15, 0.25));
      rimFront.position.z = 0.13;

      const rimBack = new THREE.Mesh(rimGeo, makeMat(0x2c8c8a, 0.35, 0.3));
      rimBack.position.z = -0.13;

      const spineStemObj = addBox(
        0.16,
        0.92,
        0.3,
        isDarkInitial ? 0xffffff : 0x13222b,
        -0.34,
        0.08,
        0,
        0.3,
        0.3
      );
      stemMatRef.current = spineStemObj.mat;
      coinGroup.add(coinBody, rimFront, rimBack, spineStemObj.mesh);
      rootGroup.add(coinGroup);

      // 2. 5-Part Bahi Ledger Book
      const bookGroup = new THREE.Group();
      bookGroup.position.set(-1.95, -0.82, -0.55);
      bookGroup.userData.baseY = -0.82;
      const coverFront = addBox(1.38, 1.88, 0.06, 0x2c8c8a, 0, 0, 0.2, 0.15, 0.45);
      const coverBack = addBox(1.38, 1.88, 0.06, 0x2c8c8a, 0, 0, -0.2, 0.15, 0.45);
      const bookSpine = addBox(
        0.14,
        1.88,
        0.46,
        isDarkInitial ? 0x74c2f6 : 0x13222b,
        -0.64,
        0,
        0,
        0.2,
        0.4
      );
      spineMatRef.current = bookSpine.mat;
      const bookPages = addBox(1.24, 1.76, 0.34, 0xffffff, 0.06, 0, 0, 0.02, 0.85);
      const bookRibbon = addBox(0.15, 0.95, 0.04, 0xef5b45, 0.28, -0.92, 0.23, 0.1, 0.4);

      bookGroup.add(
        coverFront.mesh,
        coverBack.mesh,
        bookSpine.mesh,
        bookPages.mesh,
        bookRibbon.mesh
      );
      bookGroup.rotation.z = 0.28;
      rootGroup.add(bookGroup);

      // 3. 520-Dot Instanced Globe (High-contrast theme-adaptive dots)
      const dotGeo = new THREE.SphereGeometry(0.038, 8, 8);
      geometries.push(dotGeo);
      const dotMat = new THREE.MeshBasicMaterial({
        color: isDarkInitial ? 0xddf24e : 0x13222b,
      });
      materials.push(dotMat);
      dotMatRef.current = dotMat;

      const globeInstanced = new THREE.InstancedMesh(dotGeo, dotMat, 520);
      globeInstanced.position.set(1.95, 0.95, -0.75);
      globeInstanced.userData.baseY = 0.95;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < 520; i++) {
        const y = 1 - (i / 519) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = i * 2.3999632;
        dummy.position.set(
          Math.cos(theta) * radius * 1.08,
          y * 1.08,
          Math.sin(theta) * radius * 1.08
        );
        dummy.updateMatrix();
        globeInstanced.setMatrixAt(i, dummy.matrix);
      }
      globeInstanced.instanceMatrix.needsUpdate = true;
      globeInstanced.computeBoundingSphere();
      rootGroup.add(globeInstanced);

      // 4. Sun Icosahedron + Ring
      const sunGroup = new THREE.Group();
      sunGroup.position.set(1.68, -1.35, 0.55);
      sunGroup.userData.baseY = -1.35;
      const sunGeo = new THREE.IcosahedronGeometry(0.48, 1);
      geometries.push(sunGeo);
      const sunMesh = new THREE.Mesh(sunGeo, makeMat(0xef5b45, 0.18, 0.35));
      const sunHaloGeo = new THREE.TorusGeometry(0.68, 0.03, 12, 48);
      geometries.push(sunHaloGeo);
      const sunHalo = new THREE.Mesh(sunHaloGeo, makeMat(0xf5b83d, 0.4, 0.25));
      sunHalo.rotation.x = Math.PI / 3;
      sunGroup.add(sunMesh, sunHalo);
      rootGroup.add(sunGroup);

      // 5. Soft Coral Sphere + Satellite
      const sphereGroup = new THREE.Group();
      sphereGroup.position.set(-1.55, 1.45, 0.2);
      sphereGroup.userData.baseY = 1.45;
      const sphGeo = new THREE.SphereGeometry(0.38, 32, 32);
      geometries.push(sphGeo);
      const sphMesh = new THREE.Mesh(sphGeo, makeMat(0xf2b8b5, 0.08, 0.28));
      const satGeo = new THREE.SphereGeometry(0.12, 16, 16);
      geometries.push(satGeo);
      const satMesh = new THREE.Mesh(satGeo, makeMat(0x74c2f6, 0.3, 0.2));
      satMesh.position.set(0.55, 0.22, 0);
      sphereGroup.add(sphMesh, satMesh);
      rootGroup.add(sphereGroup);

      handleResize = () => {
        if (!container || !renderer) return;
        const w = Math.max(container.clientWidth, 280);
        const h = Math.max(container.clientHeight, 200);
        renderer.setSize(w, h);
        camera.aspect = w / h;
        const scale = Math.min(1.08, Math.max(0.72, (w / h) * 0.85));
        rootGroup.scale.setScalar(scale);
        camera.updateProjectionMatrix();
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      handlePointerMove = (e: PointerEvent) => {
        pointerRef.current.x = e.clientX / window.innerWidth - 0.5;
        pointerRef.current.y = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });

      const clock = new THREE.Clock();

      const animate = () => {
        if (!renderer) return;
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        const targetRotY = stepRef.current * 0.92 + pointerRef.current.x * 0.85;
        const targetRotX = pointerRef.current.y * 0.42;

        rootGroup.rotation.y = THREE.MathUtils.damp(
          rootGroup.rotation.y,
          targetRotY,
          4.5,
          delta
        );
        rootGroup.rotation.x = THREE.MathUtils.damp(
          rootGroup.rotation.x,
          targetRotX,
          4.5,
          delta
        );

        for (let i = 0; i < rootGroup.children.length; i++) {
          const child = rootGroup.children[i];
          const baseY = child.userData.baseY ?? 0;
          child.position.y =
            baseY + Math.sin(elapsed * 1.15 + i * 1.1) * 0.11;
        }

        coinGroup.rotation.y = elapsed * 0.75;
        bookGroup.rotation.y = Math.sin(elapsed * 0.55) * 0.42;
        globeInstanced.rotation.y = elapsed * 0.28;
        sunGroup.rotation.set(elapsed * 0.42, elapsed * 0.32, 0);
        sphereGroup.rotation.z = elapsed * 0.5;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);
    } catch {
      setWebglFallback(true);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (handlePointerMove)
        window.removeEventListener('pointermove', handlePointerMove);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      if (envTexture) envTexture.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      }
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none select-none overflow-hidden flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {webglFallback && (
        <div className="flex items-center justify-center gap-6 animate-float-slow">
          <div className="w-24 h-24 rounded-full bg-[#DDF24E] border-8 border-white shadow-xl grid place-items-center font-fraunces font-bold text-3xl text-[#13222B]">
            b
          </div>
        </div>
      )}
    </div>
  );
}
