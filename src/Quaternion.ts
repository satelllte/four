import { Vector3 } from './Vector3'

/**
 * Calculates a quaternion with a defined rotation axis (x, y, z) and magnitude (w).
 */
export class Quaternion extends Array {
  private _a = new Vector3()
  private _b = new Vector3()
  private _c = new Vector3()

  constructor(x = 0, y = 0, z = 0, w = 1) {
    super(4)
    this.set(x, y, z, w)
  }

  get x(): number {
    return this[0]
  }

  set x(x) {
    this[0] = x
  }

  get y(): number {
    return this[1]
  }

  set y(y) {
    this[1] = y
  }

  get z(): number {
    return this[2]
  }

  set z(z) {
    this[2] = z
  }

  get w(): number {
    return this[3]
  }

  set w(w) {
    this[3] = w
  }

  /**
   * Sets this quaternion's x, y, z, and w properties.
   */
  set(...q: [x: number, y: number, z: number, w: number]): this {
    for (let i = 0; i < 4; i++) {
      this[i] = q[i]
    }

    return this
  }

  /**
   * Copies properties from another {@link Quaternion}.
   */
  copy(q: Quaternion): this {
    return this.set(...(q as unknown as [x: number, y: number, z: number, w: number]))
  }

  /**
   * Resets to an identity quaternion.
   */
  identity(): this {
    return this.set(0, 0, 0, 1)
  }

  /**
   * Adds a scalar or {@link Quaternion}.
   */
  add(t: number | Quaternion): this {
    for (let i = 0; i < 4; i++) {
      this[i] += typeof t === 'number' ? t : t[i]
    }

    return this
  }

  /**
   * Subtracts a scalar or {@link Quaternion}.
   */
  sub(t: number | Quaternion): this {
    for (let i = 0; i < 4; i++) {
      this[i] -= typeof t === 'number' ? t : t[i]
    }

    return this
  }

  /**
   * Multiplies a scalar or {@link Quaternion}.
   */
  multiply(t: number | Quaternion): this {
    if (typeof t === 'number') {
      for (let i = 0; i < 4; i++) {
        this[i] *= t
      }
    } else {
      this.set(
        this.x * t.w + this.w * t.x + this.y * t.z - this.z * t.y,
        this.y * t.w + this.w * t.y + this.z * t.x - this.x * t.z,
        this.z * t.w + this.w * t.z + this.x * t.y - this.y * t.x,
        this.w * t.w - this.x * t.x - this.y * t.y - this.z * t.z,
      )
    }

    return this
  }

  /**
   * Divides a scalar or {@link Quaternion}.
   */
  divide(t: number | Quaternion): this {
    for (let i = 0; i < 4; i++) {
      this[i] /= typeof t === 'number' ? t : t[i]
    }

    return this
  }

  /**
   * Calculates the conjugate or inverse of this quaternion.
   */
  invert(): this {
    for (let i = 0; i < 4; i++) {
      this[i] *= -1
    }

    return this
  }

  /**
   * Returns the Euclidean length of this quaternion.
   */
  getLength(): number {
    return Math.hypot(this.x, this.y, this.z, this.w)
  }

  /**
   * Normalizes this quaternion.
   */
  normalize(): this {
    return this.divide(this.getLength() || 1)
  }

  /**
   * Calculates the dot product between another {@link Quaternion}.
   */
  dot(q: Quaternion): number {
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w
  }

  /**
   * Slerps between another {@link Quaternion} with a given `t`.
   */
  slerp(q: Quaternion, t: number): this {
    let cosom = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w
    if (cosom < 0) cosom *= -1

    let scale0 = 1 - t
    let scale1 = t

    if (1 - cosom > Number.EPSILON) {
      const omega = Math.acos(cosom)
      const sinom = Math.sin(omega)
      scale0 = Math.sin((1 - t) * omega) / sinom
      scale1 = Math.sin(t * omega) / sinom
    }

    if (cosom < 0) scale1 *= -1

    this.set(
      scale0 * this.x + scale1 * q.x,
      scale0 * this.y + scale1 * q.y,
      scale0 * this.z + scale1 * q.z,
      scale0 * this.w + scale1 * q.w,
    )

    return this
  }

  /**
   * Rotates this quaternion from `eye` to `target`, assuming `up` as world-space up.
   */
  lookAt(eye: Vector3, target: Vector3, up: Vector3) {
    const z = this._a.copy(eye).sub(target)

    // eye and target are in the same position
    if (z.getLength() ** 2 === 0) z.z = 1
    else z.normalize()

    const x = this._b.copy(up).cross(z)

    // up and z are parallel
    if (x.getLength() ** 2 === 0) {
      const pup = this._c.copy(up)

      if (pup.z) {
        pup.x += 1e-6
      } else if (pup.y) {
        pup.z += 1e-6
      } else {
        pup.y += 1e-6
      }

      x.cross(pup)
    }
    x.normalize()

    const y = this._c.copy(z).cross(x)

    const sm11 = x.x
    const sm12 = x.y
    const sm13 = x.z
    const sm21 = y.x
    const sm22 = y.y
    const sm23 = y.z
    const sm31 = z.x
    const sm32 = z.y
    const sm33 = z.z

    const trace = sm11 + sm22 + sm33

    if (trace > 0) {
      const S = Math.sqrt(trace + 1.0) * 2
      return this.set((sm23 - sm32) / S, (sm31 - sm13) / S, (sm12 - sm21) / S, 0.25 * S)
    } else if (sm11 > sm22 && sm11 > sm33) {
      const S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2
      return this.set(0.25 * S, (sm12 + sm21) / S, (sm31 + sm13) / S, (sm23 - sm32) / S)
    } else if (sm22 > sm33) {
      const S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2
      return this.set((sm12 + sm21) / S, 0.25 * S, (sm23 + sm32) / S, (sm31 - sm13) / S)
    } else {
      const S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2
      return this.set((sm31 + sm13) / S, (sm23 + sm32) / S, 0.25 * S, (sm12 - sm21) / S)
    }
  }
}