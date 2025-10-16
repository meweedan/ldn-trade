// src/components/DisplacementSphere.tsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import styles from "./Sphere.module.css";

const GOLD_NUM = 0xb7a27d;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Fit a rectangle (with aspect = width/height) inside a circle of diameter D, with a margin (0..1) */
function fitRectInCircle(D: number, aspect: number, margin = 0.9) {
  // For a rectangle W×H inside a circle: W^2 + H^2 <= (D*margin)^2
  // With W = aspect * H ⇒ H = (D*margin) / sqrt(aspect^2 + 1), W = aspect * H
  const max = D * margin;
  const H = max / Math.sqrt(aspect * aspect + 1);
  const W = aspect * H;
  return { W, H };
}

/** Non-WebGL fallback: gold glow + centered logo, aspect-correct, circle-fit */
const GlowFallback: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = "/logo.png";
    imgRef.current = img;

    let raf = 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = Math.max(200, Math.floor(rect?.width ?? window.innerWidth));
      const h = Math.max(220, Math.floor(rect?.height ?? window.innerHeight));
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      const Wc = canvas.clientWidth;
      const Hc = canvas.clientHeight;
      ctx.clearRect(0, 0, Wc, Hc);

      const cx = Wc / 2;
      const cy = Hc / 2;

      // Sphere/glow radius (visual), a bit larger
      const r = Math.min(Wc, Hc) * 0.32;

      // Gold glow
      const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.5);
      grad.addColorStop(0, "#b7a27d");
      grad.addColorStop(0.6, "#b7a27d");
      grad.addColorStop(1, "#b7a27d");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Centered logo — circle-fit
      const logo = imgRef.current;
      if (logo && logo.complete) {
        const aspect =
          logo.naturalWidth && logo.naturalHeight ? logo.naturalWidth / logo.naturalHeight : 1;
        const { W, H } = fitRectInCircle(2 * r, aspect, 0.9);
        ctx.globalAlpha = 0.6;
        ctx.drawImage(logo, cx - W / 2, cy - H / 2, W, H);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.sphereContainer} />;
};

const DisplacementSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [webglOK, setWebglOK] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWebglOK(hasWebGL());
  }, []);

  useEffect(() => {
    if (!isClient || !webglOK || !mountRef.current) return;

    // ===== Scene, Camera, Renderer =====
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);

    const container = mountRef.current;
    container.appendChild(renderer.domElement);

    const maxDpr = /Mobi|Android/i.test(navigator.userAgent) ? 1.75 : 2;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = Math.max(260, Math.floor(rect.height));
      const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    setSize();

    const widthNow = container.getBoundingClientRect().width;
    const isSmall = widthNow < 520;
    const radius = 2.8; // larger sphere
    const widthSegments = isSmall ? 48 : 64;
    const heightSegments = isSmall ? 48 : 64;

    // ===== Geometry with subtle displacement =====
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      const offset = (Math.random() - 0.5) * 0.22;
      const bump = 1 + offset * Math.sin(v.length() * 3.0);
      v.multiplyScalar(bump);
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();

    // ===== Material: gold + ~35% opacity so logo shows through
    const material = new THREE.MeshStandardMaterial({
      color: GOLD_NUM,
      metalness: 0.55,
      roughness: 0.6,
      transparent: true,
      opacity: 0.35,
      emissive: new THREE.Color(GOLD_NUM),
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false, // keep transparent nice & show logo through
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // ===== Centered logo (sprite), **aspect-correct + circle-fit**
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load("/logo.png", (tex) => {
      const img = tex.image as HTMLImageElement | { width: number; height: number } | undefined;
      const imgW = (img as any)?.width || (img as any)?.naturalWidth || 1;
      const imgH = (img as any)?.height || (img as any)?.naturalHeight || 1;
      const aspect = imgW / imgH;

      // Fit inside sphere of diameter (2 * radius) with a margin
      const { W, H } = fitRectInCircle(2 * radius, aspect, 0.9);
      logoSprite.scale.set(W, H, 1);
    });
    logoTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const spriteMat = new THREE.SpriteMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0.6, // 60%
      depthTest: true,
      depthWrite: false,
    });
    const logoSprite = new THREE.Sprite(spriteMat);
    logoSprite.position.set(0, 0, 0);
    // temporary scale until texture loads (assume square-ish)
    const { W: initW, H: initH } = fitRectInCircle(2 * radius, 1, 0.85);
    logoSprite.scale.set(initW, initH, 1);
    // Render after sphere so it blends through; sphere doesn't write depth
    logoSprite.renderOrder = 1;
    sphere.renderOrder = 0;
    scene.add(logoSprite);

    // ===== Lights
    const pointLight = new THREE.PointLight(0xffffff, 1.9, 30, 2.0);
    pointLight.position.set(9, 9, 9);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0x404040, 1.1));

    camera.position.z = 11.5;

    // ===== Animate
    let raf = 0;
    const animate = () => {
      sphere.rotation.x += 0.004;
      sphere.rotation.y += 0.008;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Resize
    const onWindowResize = () => setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    window.addEventListener("resize", onWindowResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWindowResize);
      ro.disconnect();

      scene.remove(logoSprite);
      spriteMat.dispose();
      logoTexture.dispose();

      scene.remove(sphere);
      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isClient, webglOK]);

  if (!isClient) return null;

  return (
    <div className={styles.sphereContainer} ref={mountRef}>
      {!webglOK && <GlowFallback />}
    </div>
  );
};

export default DisplacementSphere;
