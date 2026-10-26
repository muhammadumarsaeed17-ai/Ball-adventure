import { SurfaceType, Vector3D } from '../types/game';

export interface BallState {
  position: Vector3D;
  velocity: Vector3D;
  rotation: { x: number; y: number; z: number };
  radius: number;
  isGrounded: boolean;
  groundSurface: SurfaceType;
  coyoteTimer: number;
  jumpBufferTimer: number;
  boostTimer: number;
  boostMeter: number;
}

export interface BoxCollider {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  surfaceType?: SurfaceType;
}

export interface CollisionResult {
  hasCollision: boolean;
  penetration: number;
  normal: Vector3D;
}

export const GRAVITY_DEFAULT = -24;
export const MAX_FALL_SPEED = -35;
export const ACCELERATION = 28;
export const MAX_SPEED = 12;
export const BOOST_SPEED = 20;
export const JUMP_VELOCITY = 11;
export const HIGH_JUMP_VELOCITY = 15;
export const BOUNCE_IMPULSE = 17;
export const BRAKE_DECELERATION = 35;
export const AIR_CONTROL_FACTOR = 0.45;
export const COYOTE_TIME_MAX = 0.12;
export const JUMP_BUFFER_MAX = 0.14;

/**
 * Computes closest point on AABB to sphere center and checks collision
 */
export function checkSphereAABBCollision(
  sphereCenter: Vector3D,
  radius: number,
  box: BoxCollider
): CollisionResult {
  const halfW = box.width / 2;
  const halfH = box.height / 2;
  const halfD = box.depth / 2;

  // Closest point on box
  const cx = Math.max(box.x - halfW, Math.min(sphereCenter.x, box.x + halfW));
  const cy = Math.max(box.y - halfH, Math.min(sphereCenter.y, box.y + halfH));
  const cz = Math.max(box.z - halfD, Math.min(sphereCenter.z, box.z + halfD));

  const dx = sphereCenter.x - cx;
  const dy = sphereCenter.y - cy;
  const dz = sphereCenter.z - cz;

  const distSq = dx * dx + dy * dy + dz * dz;

  if (distSq > radius * radius) {
    return { hasCollision: false, penetration: 0, normal: { x: 0, y: 0, z: 0 } };
  }

  const dist = Math.sqrt(distSq);

  if (dist === 0) {
    // Center is directly on/inside box, resolve upwards
    return { hasCollision: true, penetration: radius, normal: { x: 0, y: 1, z: 0 } };
  }

  return {
    hasCollision: true,
    penetration: radius - dist,
    normal: {
      x: dx / dist,
      y: dy / dist,
      z: dz / dist,
    },
  };
}

/**
 * Calculate surface friction multiplier
 */
export function getSurfaceFriction(surface: SurfaceType): number {
  switch (surface) {
    case 'ice':
      return 0.15; // Very slippery
    case 'sticky':
      return 3.0; // High friction
    case 'booster':
      return 0.5;
    case 'bouncy':
      return 0.6;
    case 'normal':
    default:
      return 1.0;
  }
}

/**
 * Step ball physics deterministically
 */
export function stepBallPhysics(
  ball: BallState,
  input: { x: number; z: number; jump: boolean; brake: boolean; boost: boolean },
  boxes: BoxCollider[],
  dt: number,
  highJumpActive = false,
  customGravity = GRAVITY_DEFAULT
): {
  jumped: boolean;
  landed: boolean;
  bounced: boolean;
  boosted: boolean;
  fell: boolean;
} {
  const clampedDt = Math.min(dt, 0.05);
  let jumped = false;
  let landed = false;
  let bounced = false;
  let boosted = false;
  let fell = false;

  const wasGrounded = ball.isGrounded;

  // Timers
  if (ball.isGrounded) {
    ball.coyoteTimer = COYOTE_TIME_MAX;
  } else {
    ball.coyoteTimer = Math.max(0, ball.coyoteTimer - clampedDt);
  }

  if (input.jump) {
    ball.jumpBufferTimer = JUMP_BUFFER_MAX;
  } else {
    ball.jumpBufferTimer = Math.max(0, ball.jumpBufferTimer - clampedDt);
  }

  // Boost management
  if (input.boost && ball.boostMeter > 0.05) {
    ball.boostTimer = 0.2;
    ball.boostMeter = Math.max(0, ball.boostMeter - clampedDt * 0.35);
    boosted = true;
  } else {
    ball.boostTimer = Math.max(0, ball.boostTimer - clampedDt);
    // Recharge boost meter slowly when not boosting
    ball.boostMeter = Math.min(1.0, ball.boostMeter + clampedDt * 0.15);
  }

  const isBoosting = ball.boostTimer > 0;
  const currentMaxSpeed = isBoosting ? BOOST_SPEED : MAX_SPEED;

  const friction = getSurfaceFriction(ball.groundSurface);
  const controlFactor = ball.isGrounded ? 1.0 : AIR_CONTROL_FACTOR;

  // Accelerate from input
  if (input.brake && ball.isGrounded) {
    const horizontalSpeed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.z * ball.velocity.z);
    if (horizontalSpeed > 0.01) {
      const decel = BRAKE_DECELERATION * clampedDt;
      const ratio = Math.max(0, (horizontalSpeed - decel) / horizontalSpeed);
      ball.velocity.x *= ratio;
      ball.velocity.z *= ratio;
    }
  } else if (input.x !== 0 || input.z !== 0) {
    // Normalize input vector
    const inputLen = Math.sqrt(input.x * input.x + input.z * input.z);
    const inX = input.x / inputLen;
    const inZ = input.z / inputLen;

    const accel = ACCELERATION * controlFactor * (isBoosting ? 1.5 : 1.0);
    ball.velocity.x += inX * accel * clampedDt;
    ball.velocity.z += inZ * accel * clampedDt;

    // Clamp horizontal speed
    const currentHorizSpeed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.z * ball.velocity.z);
    if (currentHorizSpeed > currentMaxSpeed) {
      const clampRatio = currentMaxSpeed / currentHorizSpeed;
      ball.velocity.x *= clampRatio;
      ball.velocity.z *= clampRatio;
    }
  } else if (ball.isGrounded) {
    // Ground drag / friction when no input
    const drag = Math.exp(-clampedDt * 5.0 * friction);
    ball.velocity.x *= drag;
    ball.velocity.z *= drag;
  } else {
    // Mild air resistance
    const airDrag = Math.exp(-clampedDt * 0.4);
    ball.velocity.x *= airDrag;
    ball.velocity.z *= airDrag;
  }

  // Jump execution with Coyote time and Jump buffer
  if (ball.jumpBufferTimer > 0 && ball.coyoteTimer > 0) {
    ball.velocity.y = highJumpActive ? HIGH_JUMP_VELOCITY : JUMP_VELOCITY;
    ball.jumpBufferTimer = 0;
    ball.coyoteTimer = 0;
    ball.isGrounded = false;
    jumped = true;
  }

  // Apply Gravity
  ball.velocity.y += customGravity * clampedDt;
  if (ball.velocity.y < MAX_FALL_SPEED) {
    ball.velocity.y = MAX_FALL_SPEED;
  }

  // Move position
  ball.position.x += ball.velocity.x * clampedDt;
  ball.position.y += ball.velocity.y * clampedDt;
  ball.position.z += ball.velocity.z * clampedDt;

  // Collision resolution with platforms
  ball.isGrounded = false;
  ball.groundSurface = 'normal';

  for (const box of boxes) {
    const col = checkSphereAABBCollision(ball.position, ball.radius, box);
    if (col.hasCollision) {
      // Resolve penetration
      ball.position.x += col.normal.x * col.penetration;
      ball.position.y += col.normal.y * col.penetration;
      ball.position.z += col.normal.z * col.penetration;

      // Check if surface is floor (normal points predominantly upward)
      if (col.normal.y > 0.5) {
        ball.isGrounded = true;
        ball.groundSurface = box.surfaceType || 'normal';

        if (!wasGrounded && ball.velocity.y < -1.5) {
          landed = true;
        }

        // Handle bouncy surface
        if (box.surfaceType === 'bouncy') {
          ball.velocity.y = BOUNCE_IMPULSE;
          ball.isGrounded = false;
          bounced = true;
        } else if (box.surfaceType === 'booster') {
          // Boost forward
          const speedBoost = 18;
          ball.velocity.z = -speedBoost;
          ball.velocity.y = 3;
          boosted = true;
        } else {
          // Stop downward velocity
          if (ball.velocity.y < 0) {
            ball.velocity.y = 0;
          }
        }
      } else if (col.normal.y < -0.5) {
        // Ceiling hit
        if (ball.velocity.y > 0) {
          ball.velocity.y = 0;
        }
      } else {
        // Wall collision: bounce slightly or slide
        const dot = ball.velocity.x * col.normal.x + ball.velocity.z * col.normal.z;
        if (dot < 0) {
          ball.velocity.x -= dot * col.normal.x * 1.2;
          ball.velocity.z -= dot * col.normal.z * 1.2;
        }
      }
    }
  }

  // Natural ball rotation: roll angle delta is distance traveled / radius
  const vx = ball.velocity.x;
  const vz = ball.velocity.z;
  const speed = Math.sqrt(vx * vx + vz * vz);
  if (speed > 0.05) {
    const angularSpeed = speed / ball.radius;
    // Rolling around perpendicular axis:
    // moving in +X rotates around +Z (or -Z)
    // moving in +Z rotates around -X (or +X)
    ball.rotation.x += (vz / ball.radius) * clampedDt;
    ball.rotation.z -= (vx / ball.radius) * clampedDt;
  }

  // Check fall below kill plane
  if (ball.position.y < -15) {
    fell = true;
  }

  return { jumped, landed, bounced, boosted, fell };
}

/**
 * Resets ball state to specified checkpoint or start point with zero leftover velocity
 */
export function resetBallAtPoint(
  ball: BallState,
  spawnPoint: Vector3D,
  radius = 0.5
): void {
  ball.position.x = spawnPoint.x;
  ball.position.y = spawnPoint.y + radius + 0.1;
  ball.position.z = spawnPoint.z;
  ball.velocity.x = 0;
  ball.velocity.y = 0;
  ball.velocity.z = 0;
  ball.rotation.x = 0;
  ball.rotation.y = 0;
  ball.rotation.z = 0;
  ball.isGrounded = true;
  ball.groundSurface = 'normal';
  ball.coyoteTimer = 0;
  ball.jumpBufferTimer = 0;
  ball.boostTimer = 0;
}
