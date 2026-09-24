/*import * as THREE from 'three';
import { Engine } from './Engine';

const engine = new Engine();

engine.camera.setPosition(0, 3, 7);
engine.camera.instance.lookAt(0, 1, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Lumière globale douce
engine.scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Lumière directionnelle (style soleil)
directionalLight.position.set(5, 8, 5);
engine.scene.add(directionalLight);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 }); // Gris clair mat
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4 }); // Gris foncé
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff, roughness: 0.2, metalness: 0.1 });
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1, metalness: 0.3 });


const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), floorMaterial);
floor.position.set(0, -0.1, 0);
engine.scene.add(floor);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.2), wallMaterial);
backWall.position.set(0, 2, -4);
engine.scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 8), wallMaterial);
leftWall.position.set(-4, 2, 0);
engine.scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 8), wallMaterial);
rightWall.position.set(4, 2, 0);
engine.scene.add(rightWall);

const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), cubeMaterial);
cube.position.set(-1.2, 0.5, 0);
engine.scene.add(cube);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), sphereMaterial);
sphere.position.set(1.2, 0.6, 0);
engine.scene.add(sphere);

engine.start(() => {
  cube.rotation.y += 0.01;
  cube.rotation.x += 0.005;

  sphere.position.y = 0.8 + Math.sin(Date.now() * 0.003) * 0.2;
});
*/

import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { Engine } from './Engine';
import { Robot } from './Robot';

async function bootstrap() {
  const engine = new Engine();
  await engine.init(); // Initialise la physique

  engine.camera.setPosition(0, 5, 6);
  engine.camera.lookAt(0, 0, 0);

  // Éclairage
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(5, 10, 5);
  engine.scene.add(light);
  engine.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // --------------------------------------------------------
  // 1. SOL STATIQUE (Fixed)
  // --------------------------------------------------------
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  engine.scene.add(floorMesh);

  // Création manuelle du body statique dans le monde physique
  const floorBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
  const floorBody = engine.physics.world.createRigidBody(floorBodyDesc);
  const floorCollider = RAPIER.ColliderDesc.cuboid(5, 0.1, 5);
  engine.physics.world.createCollider(floorCollider, floorBody);

  // Pas besoin de synchro pour le sol statique car il ne bouge pas !

  // --------------------------------------------------------
  // 2. ENVIRONNEMENT VISUEL (Optionnel)
  // --------------------------------------------------------
  await engine.loadEnvironment('/models/env.glb');

  // --------------------------------------------------------
  // 3. BRAS ROBOTIQUE
  // --------------------------------------------------------
  const robot = new Robot('/models/bras_robotique.glb');
  await engine.addRobot(robot);

  const boneNames = robot.getBoneNames();
  console.log('Os du bras robotique:', boneNames);

  const animateRobot = async (): Promise<void> => {
    while (true) {
      await Promise.all([
        robot.animateBone('bras', 25, 800, 'z'),
        robot.animateBone('avant_bras', -35, 800, 'z'),
        robot.animateBone('coude', 25, 800, 'z'),
        robot.animateBone('poignet', 20, 800, 'y'),
        robot.animateBone('pince1', 25, 800, 'z'),
        robot.animateBone('pince2', -15, 800, 'z')
      ]);

      await Promise.all([
        robot.animateBone('bras', -25, 800, 'z'),
        robot.animateBone('avant_bras', 35, 800, 'z'),
        robot.animateBone('coude', -25, 800, 'z'),
        robot.animateBone('poignet', -20, 800, 'y'),
        robot.animateBone('pince1', -25, 800, 'z'),
        robot.animateBone('pince2', 25, 800, 'z')
      ]);
    }
  };

  let hasStartedAnimation = false;

  // Lancement du moteur
  engine.start(() => {
    if (!hasStartedAnimation) {
      hasStartedAnimation = true;
      void animateRobot();
    }
  });
}

bootstrap();