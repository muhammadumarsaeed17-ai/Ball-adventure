import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkSphereAABBCollision,
  getSurfaceFriction,
  stepBallPhysics,
  resetBallAtPoint,
  BallState,
  BoxCollider,
} from './physics';

test('checkSphereAABBCollision detects direct collision on top of box', () => {
  const box: BoxCollider = { x: 0, y: 0, z: 0, width: 4, height: 1, depth: 4 };
  const sphereCenter = { x: 0, y: 0.9, z: 0 };
  const radius = 0.5;

  const result = checkSphereAABBCollision(sphereCenter, radius, box);
  assert.equal(result.hasCollision, true);
  assert.ok(result.normal.y > 0.8, 'Normal should point upward');
  assert.ok(result.penetration > 0, 'Penetration should be greater than 0');
});

test('checkSphereAABBCollision returns false when ball is far away', () => {
  const box: BoxCollider = { x: 0, y: 0, z: 0, width: 2, height: 1, depth: 2 };
  const sphereCenter = { x: 5, y: 10, z: 5 };
  const radius = 0.5;

  const result = checkSphereAABBCollision(sphereCenter, radius, box);
  assert.equal(result.hasCollision, false);
});

test('getSurfaceFriction yields appropriate values for ice, sticky, and normal', () => {
  assert.equal(getSurfaceFriction('ice'), 0.15);
  assert.equal(getSurfaceFriction('sticky'), 3.0);
  assert.equal(getSurfaceFriction('normal'), 1.0);
});

test('stepBallPhysics executes jump when grounded and jump input is pressed', () => {
  const ball: BallState = {
    position: { x: 0, y: 0.5, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    radius: 0.5,
    isGrounded: true,
    groundSurface: 'normal',
    coyoteTimer: 0.1,
    jumpBufferTimer: 0,
    boostTimer: 0,
    boostMeter: 1.0,
  };

  const ground: BoxCollider = { x: 0, y: 0, z: 0, width: 10, height: 0.2, depth: 10 };
  const input = { x: 0, z: 0, jump: true, brake: false, boost: false };

  const event = stepBallPhysics(ball, input, [ground], 0.016);
  assert.equal(event.jumped, true);
  assert.ok(ball.velocity.y > 0, 'Vertical velocity should be positive after jump');
});

test('resetBallAtPoint cleanly resets velocity, rotation, and position', () => {
  const ball: BallState = {
    position: { x: 99, y: -20, z: 50 },
    velocity: { x: 15, y: -30, z: 12 },
    rotation: { x: 5, y: 2, z: 8 },
    radius: 0.5,
    isGrounded: false,
    groundSurface: 'ice',
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    boostTimer: 1.0,
    boostMeter: 0.2,
  };

  resetBallAtPoint(ball, { x: 0, y: 2, z: 0 }, 0.5);
  assert.equal(ball.position.x, 0);
  assert.equal(ball.velocity.x, 0);
  assert.equal(ball.velocity.y, 0);
  assert.equal(ball.velocity.z, 0);
  assert.equal(ball.rotation.x, 0);
  assert.equal(ball.isGrounded, true);
});
