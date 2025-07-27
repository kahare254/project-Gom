/// <reference types="vite/client" />

import { ReactThreeFiber } from '@react-three/fiber';
import { Object3D } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: ReactThreeFiber.Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      planeGeometry: ReactThreeFiber.BufferGeometryNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      boxGeometry: ReactThreeFiber.BufferGeometryNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      meshStandardMaterial: ReactThreeFiber.MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
    }
  }
}

declare module 'three' {
  interface Object3D {
    raycast: (raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) => void;
  }
}

declare module '@react-three/xr' {
  export interface XRProps {
    children: React.ReactNode;
  }

  export interface VRButtonProps {
    className?: string;
  }
}

export {};
