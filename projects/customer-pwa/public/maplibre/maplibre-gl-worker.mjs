// node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs
var e = Object.create;
var t = Object.defineProperty;
var n = Object.getOwnPropertyDescriptor;
var r = Object.getOwnPropertyNames;
var i = Object.getPrototypeOf;
var a = Object.prototype.hasOwnProperty;
var o = (e51, t2) => () => (t2 || (e51((t2 = { exports: {} }).exports, t2), e51 = null), t2.exports);
var s = (e51, i2, o2, s2) => {
  if (i2 && typeof i2 == `object` || typeof i2 == `function`) for (var c2 = r(i2), l2 = 0, u2 = c2.length, d2; l2 < u2; l2++) d2 = c2[l2], !a.call(e51, d2) && d2 !== o2 && t(e51, d2, { get: ((e52) => i2[e52]).bind(null, d2), enumerable: !(s2 = n(i2, d2)) || s2.enumerable });
  return e51;
};
var c = (n2, r2, o2) => (o2 = n2 == null ? {} : e(i(n2)), s(r2 || !n2 || !n2.__esModule || !a.call(n2, `default`) ? t(o2, `default`, { value: n2, enumerable: true }) : o2, n2));
function l(e51, t2) {
  this.x = e51, this.y = t2;
}
l.prototype = { clone() {
  return new l(this.x, this.y);
}, add(e51) {
  return this.clone()._add(e51);
}, sub(e51) {
  return this.clone()._sub(e51);
}, multByPoint(e51) {
  return this.clone()._multByPoint(e51);
}, divByPoint(e51) {
  return this.clone()._divByPoint(e51);
}, mult(e51) {
  return this.clone()._mult(e51);
}, div(e51) {
  return this.clone()._div(e51);
}, rotate(e51) {
  return this.clone()._rotate(e51);
}, rotateAround(e51, t2) {
  return this.clone()._rotateAround(e51, t2);
}, matMult(e51) {
  return this.clone()._matMult(e51);
}, unit() {
  return this.clone()._unit();
}, perp() {
  return this.clone()._perp();
}, round() {
  return this.clone()._round();
}, mag() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
}, equals(e51) {
  return this.x === e51.x && this.y === e51.y;
}, dist(e51) {
  return Math.sqrt(this.distSqr(e51));
}, distSqr(e51) {
  let t2 = e51.x - this.x, n2 = e51.y - this.y;
  return t2 * t2 + n2 * n2;
}, angle() {
  return Math.atan2(this.y, this.x);
}, angleTo(e51) {
  return Math.atan2(this.y - e51.y, this.x - e51.x);
}, angleWith(e51) {
  return this.angleWithSep(e51.x, e51.y);
}, angleWithSep(e51, t2) {
  return Math.atan2(this.x * t2 - this.y * e51, this.x * e51 + this.y * t2);
}, _matMult(e51) {
  let t2 = e51[0] * this.x + e51[1] * this.y, n2 = e51[2] * this.x + e51[3] * this.y;
  return this.x = t2, this.y = n2, this;
}, _add(e51) {
  return this.x += e51.x, this.y += e51.y, this;
}, _sub(e51) {
  return this.x -= e51.x, this.y -= e51.y, this;
}, _mult(e51) {
  return this.x *= e51, this.y *= e51, this;
}, _div(e51) {
  return this.x /= e51, this.y /= e51, this;
}, _multByPoint(e51) {
  return this.x *= e51.x, this.y *= e51.y, this;
}, _divByPoint(e51) {
  return this.x /= e51.x, this.y /= e51.y, this;
}, _unit() {
  return this._div(this.mag()), this;
}, _perp() {
  let e51 = this.y;
  return this.y = this.x, this.x = -e51, this;
}, _rotate(e51) {
  let t2 = Math.cos(e51), n2 = Math.sin(e51), r2 = t2 * this.x - n2 * this.y, i2 = n2 * this.x + t2 * this.y;
  return this.x = r2, this.y = i2, this;
}, _rotateAround(e51, t2) {
  let n2 = Math.cos(e51), r2 = Math.sin(e51), i2 = t2.x + n2 * (this.x - t2.x) - r2 * (this.y - t2.y), a2 = t2.y + r2 * (this.x - t2.x) + n2 * (this.y - t2.y);
  return this.x = i2, this.y = a2, this;
}, _round() {
  return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
}, constructor: l }, l.convert = function(e51) {
  if (e51 instanceof l) return e51;
  if (Array.isArray(e51)) return new l(+e51[0], +e51[1]);
  if (e51.x !== void 0 && e51.y !== void 0) return new l(+e51.x, +e51.y);
  throw Error(`Expected [x, y] or {x, y} point format`);
};
function u(e51, t2, n2, r2) {
  let i2 = 3 * e51, a2 = 3 * (n2 - e51) - i2, o2 = 1 - i2 - a2, s2 = 3 * t2, c2 = 3 * (r2 - t2) - s2, l2 = 1 - s2 - c2;
  return function(e52, t3 = 1e-6) {
    if (e52 <= 0) return 0;
    if (e52 >= 1) return 1;
    let n3 = e52;
    for (let r4 = 0; r4 < 8; r4++) {
      let r5 = ((o2 * n3 + a2) * n3 + i2) * n3 - e52;
      if (Math.abs(r5) < t3) return ((l2 * n3 + c2) * n3 + s2) * n3;
      let u3 = (3 * o2 * n3 + 2 * a2) * n3 + i2;
      if (Math.abs(u3) < 1e-6) break;
      n3 -= r5 / u3;
    }
    let r3 = 0, u2 = 1;
    n3 = e52;
    for (let s3 = 0; s3 < 20; s3++) {
      let s4 = ((o2 * n3 + a2) * n3 + i2) * n3;
      if (Math.abs(s4 - e52) < t3) break;
      e52 > s4 ? r3 = n3 : u2 = n3, n3 = (r3 + u2) * 0.5;
    }
    return ((l2 * n3 + c2) * n3 + s2) * n3;
  };
}
var d;
function f() {
  return d ??= typeof OffscreenCanvas < `u` && new OffscreenCanvas(1, 1).getContext(`2d`) && typeof createImageBitmap == `function`, d;
}
var p;
function m() {
  if (p == null && (p = false, f())) {
    let e51 = new OffscreenCanvas(5, 5).getContext(`2d`, { willReadFrequently: true });
    if (e51) {
      for (let t3 = 0; t3 < 25; t3++) {
        let n2 = t3 * 4;
        e51.fillStyle = `rgb(${n2},${n2 + 1},${n2 + 2})`, e51.fillRect(t3 % 5, Math.floor(t3 / 5), 1, 1);
      }
      let t2 = e51.getImageData(0, 0, 5, 5).data;
      for (let e52 = 0; e52 < 100; e52++) if (e52 % 4 != 3 && t2[e52] !== e52) {
        p = true;
        break;
      }
    }
  }
  return p || false;
}
var h = typeof Float32Array < `u` ? Float32Array : Array;
Math.PI / 180, 180 / Math.PI;
function g() {
  var e51 = new h(9);
  return h != Float32Array && (e51[1] = 0, e51[2] = 0, e51[3] = 0, e51[5] = 0, e51[6] = 0, e51[7] = 0), e51[0] = 1, e51[4] = 1, e51[8] = 1, e51;
}
function se() {
  var e51 = new h(3);
  return h != Float32Array && (e51[0] = 0, e51[1] = 0, e51[2] = 0), e51;
}
function le(e51) {
  var t2 = e51[0], n2 = e51[1], r2 = e51[2];
  return Math.sqrt(t2 * t2 + n2 * n2 + r2 * r2);
}
function ue(e51, t2, n2) {
  var r2 = new h(3);
  return r2[0] = e51, r2[1] = t2, r2[2] = n2, r2;
}
function ge(e51, t2) {
  var n2 = t2[0], r2 = t2[1], i2 = t2[2], a2 = n2 * n2 + r2 * r2 + i2 * i2;
  return a2 > 0 && (a2 = 1 / Math.sqrt(a2)), e51[0] = t2[0] * a2, e51[1] = t2[1] * a2, e51[2] = t2[2] * a2, e51;
}
function _e(e51, t2) {
  return e51[0] * t2[0] + e51[1] * t2[1] + e51[2] * t2[2];
}
function ve(e51, t2, n2) {
  var r2 = t2[0], i2 = t2[1], a2 = t2[2], o2 = n2[0], s2 = n2[1], c2 = n2[2];
  return e51[0] = i2 * c2 - a2 * s2, e51[1] = a2 * o2 - r2 * c2, e51[2] = r2 * s2 - i2 * o2, e51;
}
var De = le;
(function() {
  var e51 = se();
  return function(t2, n2, r2, i2, a2, o2) {
    var s2, c2;
    for (n2 ||= 3, r2 ||= 0, c2 = i2 ? Math.min(i2 * n2 + r2, t2.length) : t2.length, s2 = r2; s2 < c2; s2 += n2) e51[0] = t2[s2], e51[1] = t2[s2 + 1], e51[2] = t2[s2 + 2], a2(e51, e51, o2), t2[s2] = e51[0], t2[s2 + 1] = e51[1], t2[s2 + 2] = e51[2];
    return t2;
  };
})();
function Oe() {
  var e51 = new h(4);
  return h != Float32Array && (e51[0] = 0, e51[1] = 0, e51[2] = 0, e51[3] = 0), e51;
}
function Me(e51, t2) {
  var n2 = t2[0], r2 = t2[1], i2 = t2[2], a2 = t2[3], o2 = n2 * n2 + r2 * r2 + i2 * i2 + a2 * a2;
  return o2 > 0 && (o2 = 1 / Math.sqrt(o2)), e51[0] = n2 * o2, e51[1] = r2 * o2, e51[2] = i2 * o2, e51[3] = a2 * o2, e51;
}
function Ne(e51, t2, n2) {
  var r2 = t2[0], i2 = t2[1], a2 = t2[2], o2 = t2[3];
  return e51[0] = n2[0] * r2 + n2[4] * i2 + n2[8] * a2 + n2[12] * o2, e51[1] = n2[1] * r2 + n2[5] * i2 + n2[9] * a2 + n2[13] * o2, e51[2] = n2[2] * r2 + n2[6] * i2 + n2[10] * a2 + n2[14] * o2, e51[3] = n2[3] * r2 + n2[7] * i2 + n2[11] * a2 + n2[15] * o2, e51;
}
(function() {
  var e51 = Oe();
  return function(t2, n2, r2, i2, a2, o2) {
    var s2, c2;
    for (n2 ||= 4, r2 ||= 0, c2 = i2 ? Math.min(i2 * n2 + r2, t2.length) : t2.length, s2 = r2; s2 < c2; s2 += n2) e51[0] = t2[s2], e51[1] = t2[s2 + 1], e51[2] = t2[s2 + 2], e51[3] = t2[s2 + 3], a2(e51, e51, o2), t2[s2] = e51[0], t2[s2 + 1] = e51[1], t2[s2 + 2] = e51[2], t2[s2 + 3] = e51[3];
    return t2;
  };
})();
function Fe() {
  var e51 = new h(4);
  return h != Float32Array && (e51[0] = 0, e51[1] = 0, e51[2] = 0), e51[3] = 1, e51;
}
function Ie(e51, t2, n2) {
  n2 *= 0.5;
  var r2 = Math.sin(n2);
  return e51[0] = r2 * t2[0], e51[1] = r2 * t2[1], e51[2] = r2 * t2[2], e51[3] = Math.cos(n2), e51;
}
function Re(e51, t2, n2, r2) {
  var i2 = t2[0], a2 = t2[1], o2 = t2[2], s2 = t2[3], c2 = n2[0], l2 = n2[1], u2 = n2[2], d2 = n2[3], f2, p2 = i2 * c2 + a2 * l2 + o2 * u2 + s2 * d2, m2, h2, g2;
  return p2 < 0 && (p2 = -p2, c2 = -c2, l2 = -l2, u2 = -u2, d2 = -d2), 1 - p2 > 1e-6 ? (f2 = Math.acos(p2), m2 = Math.sin(f2), h2 = Math.sin((1 - r2) * f2) / m2, g2 = Math.sin(r2 * f2) / m2) : (h2 = 1 - r2, g2 = r2), e51[0] = h2 * i2 + g2 * c2, e51[1] = h2 * a2 + g2 * l2, e51[2] = h2 * o2 + g2 * u2, e51[3] = h2 * s2 + g2 * d2, e51;
}
function ze(e51, t2) {
  var n2 = t2[0] + t2[4] + t2[8], r2;
  if (n2 > 0) r2 = Math.sqrt(n2 + 1), e51[3] = 0.5 * r2, r2 = 0.5 / r2, e51[0] = (t2[5] - t2[7]) * r2, e51[1] = (t2[6] - t2[2]) * r2, e51[2] = (t2[1] - t2[3]) * r2;
  else {
    var i2 = 0;
    t2[4] > t2[0] && (i2 = 1), t2[8] > t2[i2 * 3 + i2] && (i2 = 2);
    var a2 = (i2 + 1) % 3, o2 = (i2 + 2) % 3;
    r2 = Math.sqrt(t2[i2 * 3 + i2] - t2[a2 * 3 + a2] - t2[o2 * 3 + o2] + 1), e51[i2] = 0.5 * r2, r2 = 0.5 / r2, e51[3] = (t2[a2 * 3 + o2] - t2[o2 * 3 + a2]) * r2, e51[a2] = (t2[a2 * 3 + i2] + t2[i2 * 3 + a2]) * r2, e51[o2] = (t2[o2 * 3 + i2] + t2[i2 * 3 + o2]) * r2;
  }
  return e51;
}
var He = Me;
(function() {
  var e51 = se(), t2 = ue(1, 0, 0), n2 = ue(0, 1, 0);
  return function(r2, i2, a2) {
    var o2 = _e(i2, a2);
    return o2 < -0.999999 ? (ve(e51, t2, i2), De(e51) < 1e-6 && ve(e51, n2, i2), ge(e51, e51), Ie(r2, e51, Math.PI), r2) : o2 > 0.999999 ? (r2[0] = 0, r2[1] = 0, r2[2] = 0, r2[3] = 1, r2) : (ve(e51, i2, a2), r2[0] = e51[0], r2[1] = e51[1], r2[2] = e51[2], r2[3] = 1 + o2, He(r2, r2));
  };
})(), (function() {
  var e51 = Fe(), t2 = Fe();
  return function(n2, r2, i2, a2, o2, s2) {
    return Re(e51, r2, o2, s2), Re(t2, i2, a2, s2), Re(n2, e51, t2, 2 * s2 * (1 - s2)), n2;
  };
})(), (function() {
  var e51 = g();
  return function(t2, n2, r2, i2) {
    return e51[0] = r2[0], e51[3] = r2[1], e51[6] = r2[2], e51[1] = i2[0], e51[4] = i2[1], e51[7] = i2[2], e51[2] = -n2[0], e51[5] = -n2[1], e51[8] = -n2[2], He(t2, ze(t2, e51));
  };
})();
function Ue() {
  var e51 = new h(2);
  return h != Float32Array && (e51[0] = 0, e51[1] = 0), e51;
}
(function() {
  var e51 = Ue();
  return function(t2, n2, r2, i2, a2, o2) {
    var s2, c2;
    for (n2 ||= 2, r2 ||= 0, c2 = i2 ? Math.min(i2 * n2 + r2, t2.length) : t2.length, s2 = r2; s2 < c2; s2 += n2) e51[0] = t2[s2], e51[1] = t2[s2 + 1], a2(e51, e51, o2), t2[s2] = e51[0], t2[s2 + 1] = e51[1];
    return t2;
  };
})();
var j = 8192;
var Qe = `__$json__:`;
function $e(e51) {
  return e51 instanceof Error ? e51 : Error(typeof e51 == `string` ? e51 : String(e51));
}
function _t(e51) {
  if (e51 <= 0) return 0;
  if (e51 >= 1) return 1;
  let t2 = e51 * e51, n2 = t2 * e51;
  return 4 * (e51 < 0.5 ? n2 : 3 * (e51 - t2) + n2 - 0.75);
}
function vt(e51, t2, n2, r2) {
  return u(e51, t2, n2, r2);
}
var yt = vt(0.25, 0.1, 0.25, 1);
function bt(e51, t2, n2) {
  return Math.min(n2, Math.max(t2, e51));
}
function xt(e51, t2, n2) {
  let r2 = n2 - t2, i2 = ((e51 - t2) % r2 + r2) % r2 + t2;
  return i2 === t2 ? n2 : i2;
}
function St(e51, ...t2) {
  for (let n2 of t2) for (let t3 in n2) e51[t3] = n2[t3];
  return e51;
}
function Et(e51) {
  return Math.log(e51) / Math.LN2 % 1 == 0;
}
function jt(e51, t2, n2) {
  let r2 = {};
  for (let i2 in e51) r2[i2] = t2.call(n2 || this, e51[i2], i2, e51);
  return r2;
}
function Mt(e51, t2, n2) {
  let r2 = {};
  for (let i2 in e51) t2.call(n2 || this, e51[i2], i2, e51) && (r2[i2] = e51[i2]);
  return r2;
}
function Pt(e51) {
  return Array.isArray(e51) ? e51.map(Pt) : typeof e51 == `object` && e51 ? jt(e51, Pt) : e51;
}
var Ft = {};
function It(e51) {
  Ft[e51] || (typeof console < `u` && console.warn(e51), Ft[e51] = true);
}
function Lt(e51, t2, n2) {
  return (n2.y - e51.y) * (t2.x - e51.x) > (t2.y - e51.y) * (n2.x - e51.x);
}
function Bt(e51) {
  return typeof WorkerGlobalScope < `u` && e51 !== void 0 && e51 instanceof WorkerGlobalScope;
}
function Wt(e51) {
  return typeof ImageBitmap < `u` && e51 instanceof ImageBitmap;
}
function Jt(e51, t2, n2, r2, i2) {
  let a2 = Math.max(-t2, 0) * 4, o2 = (Math.max(0, n2) - n2) * r2 * 4 + a2, s2 = r2 * 4, c2 = Math.max(0, t2), l2 = Math.max(0, n2), u2 = Math.min(e51.width, t2 + r2), d2 = Math.min(e51.height, n2 + i2);
  return { rect: { x: c2, y: l2, width: u2 - c2, height: d2 - l2 }, layout: [{ offset: o2, stride: s2 }] };
}
async function Yt(e51, t2, n2, r2, i2) {
  if (typeof VideoFrame > `u`) throw Error(`VideoFrame not supported`);
  let a2 = new VideoFrame(e51, { timestamp: 0 });
  try {
    let o2 = a2?.format;
    if (!o2 || !(o2.startsWith(`BGR`) || o2.startsWith(`RGB`))) throw Error(`Unrecognized format ${o2}`);
    let s2 = o2.startsWith(`BGR`), c2 = new Uint8ClampedArray(r2 * i2 * 4);
    if (await a2.copyTo(c2, Jt(e51, t2, n2, r2, i2)), s2) for (let e52 = 0; e52 < c2.length; e52 += 4) {
      let t3 = c2[e52];
      c2[e52] = c2[e52 + 2], c2[e52 + 2] = t3;
    }
    return c2;
  } finally {
    a2.close();
  }
}
var Xt;
var Zt;
function Qt(e51, t2, n2, r2, i2) {
  let a2 = e51.width, o2 = e51.height;
  (!Xt || !Zt) && (Xt = new OffscreenCanvas(a2, o2), Zt = Xt.getContext(`2d`, { willReadFrequently: true })), Xt.width = a2, Xt.height = o2, Zt.drawImage(e51, 0, 0, a2, o2);
  let s2 = Zt.getImageData(t2, n2, r2, i2);
  return Zt.clearRect(0, 0, a2, o2), s2.data;
}
async function $t(e51, t2, n2, r2, i2) {
  if (m()) try {
    return await Yt(e51, t2, n2, r2, i2);
  } catch {
  }
  return Qt(e51, t2, n2, r2, i2);
}
function en(e51, t2, n2, r2) {
  return e51.addEventListener(t2, n2, r2), { unsubscribe: () => {
    e51.removeEventListener(t2, n2, r2);
  } };
}
function tn(e51) {
  return e51 * Math.PI / 180;
}
var mn = `AbortError`;
var hn = class extends Error {
  constructor(e51 = mn) {
    super(e51 instanceof Error ? e51.message : e51), this.name = mn, e51 instanceof Error && e51.stack && (this.stack = e51.stack);
  }
};
function gn(e51) {
  return e51 instanceof Error && e51.name === `AbortError`;
}
function _n(e51) {
  if (e51.aborted) throw new hn(e51.reason);
}
var vn = { MAX_PARALLEL_IMAGE_REQUESTS: 16, MAX_PARALLEL_IMAGE_REQUESTS_PER_FRAME: 8, MAX_TILE_CACHE_ZOOM_LEVELS: 5, REGISTERED_PROTOCOLS: {}, WORKER_URL: `` };
function yn(e51) {
  return vn.REGISTERED_PROTOCOLS[e51.substring(0, e51.indexOf(`://`))];
}
function bn(e51, t2) {
  vn.REGISTERED_PROTOCOLS[e51] = t2;
}
function xn(e51) {
  delete vn.REGISTERED_PROTOCOLS[e51];
}
var Sn = `global-dispatcher`;
var Cn = class extends Error {
  constructor(e51, t2, n2, r2) {
    super(`AJAXError: ${t2} (${e51}): ${n2}`), this.status = e51, this.statusText = t2, this.url = n2, this.body = r2;
  }
};
function wn() {
  if (Bt(self)) return self.worker?.referrer;
  if (window.location.protocol === `blob:`) try {
    return window.parent.location.href;
  } catch {
  }
  return window.location.href;
}
var Tn = (e51) => e51.startsWith(`file:`) || wn()?.startsWith(`file:`) && !/^\w+:/.test(e51);
async function En(e51, t2) {
  let n2 = new Request(e51.url, { method: e51.method || `GET`, body: e51.body, credentials: e51.credentials, headers: e51.headers, cache: e51.cache, referrer: wn(), referrerPolicy: e51.referrerPolicy, signal: t2.signal });
  e51.type === `json` && !n2.headers.has(`Accept`) && n2.headers.set(`Accept`, `application/json`);
  let r2;
  try {
    r2 = await fetch(n2);
  } catch (t3) {
    throw gn(t3) ? t3 : new Cn(0, $e(t3).message, e51.url, new Blob());
  }
  if (!r2.ok) {
    let t3 = await r2.blob();
    throw new Cn(r2.status, r2.statusText, e51.url, t3);
  }
  let i2;
  i2 = e51.type === `arrayBuffer` || e51.type === `image` ? r2.arrayBuffer() : e51.type === `json` ? r2.json() : r2.text();
  let a2 = await i2;
  return _n(t2.signal), { data: a2, cacheControl: r2.headers.get(`Cache-Control`), expires: r2.headers.get(`Expires`), etag: r2.headers.get(`ETag`) };
}
function Dn(e51, t2) {
  return new Promise((n2, r2) => {
    let i2 = new XMLHttpRequest();
    i2.open(e51.method || `GET`, e51.url, true), (e51.type === `arrayBuffer` || e51.type === `image`) && (i2.responseType = `arraybuffer`);
    for (let t3 in e51.headers) i2.setRequestHeader(t3, e51.headers[t3]);
    e51.type === `json` && (i2.responseType = `text`, e51.headers?.Accept || i2.setRequestHeader(`Accept`, `application/json`)), i2.withCredentials = e51.credentials === `include`, i2.onerror = () => {
      r2(Error(i2.statusText));
    }, i2.onload = () => {
      if (!t2.signal.aborted) {
        if ((i2.status >= 200 && i2.status < 300 || i2.status === 0) && i2.response !== null) {
          let t3 = i2.response;
          if (e51.type === `json`) try {
            t3 = JSON.parse(i2.response);
          } catch (e52) {
            r2(e52);
            return;
          }
          n2({ data: t3, cacheControl: i2.getResponseHeader(`Cache-Control`), expires: i2.getResponseHeader(`Expires`), etag: i2.getResponseHeader(`ETag`) });
        } else {
          let t3 = new Blob([i2.response], { type: i2.getResponseHeader(`Content-Type`) });
          r2(new Cn(i2.status, i2.statusText, e51.url, t3));
        }
      }
    }, t2.signal.addEventListener(`abort`, () => {
      i2.abort(), r2(new hn(t2.signal.reason));
    }), i2.send(e51.body);
  });
}
var On = async function(e51, t2) {
  if (e51.url.includes(`://`) && !/^https?:|^file:/.test(e51.url)) {
    let n2 = yn(e51.url);
    if (n2) {
      let r2 = await n2(e51, t2);
      return !r2.data && e51.type === `arrayBuffer` ? St(r2, { data: new ArrayBuffer(0) }) : r2;
    }
    if (Bt(self) && self.worker?.actor) return self.worker.actor.sendAsync({ type: `GR`, data: e51, targetMapId: Sn }, t2);
  }
  if (!Tn(e51.url)) {
    if (fetch && Request && AbortController && Object.hasOwn(Request.prototype, `signal`)) return En(e51, t2);
    if (Bt(self) && self.worker?.actor) return self.worker.actor.sendAsync({ type: `GR`, data: e51, mustQueue: true, targetMapId: Sn }, t2);
  }
  return Dn(e51, t2);
};
var kn = (e51, t2) => On(St(e51, { type: `json` }), t2);
var An = (e51, t2) => On(St(e51, { type: `arrayBuffer` }), t2);
function Nn(e51, t2, n2) {
  n2[e51]?.includes(t2) || (n2[e51] ||= [], n2[e51].push(t2));
}
function Pn(e51, t2, n2) {
  if (n2?.[e51]) {
    let r2 = n2[e51].indexOf(t2);
    r2 !== -1 && n2[e51].splice(r2, 1);
  }
}
var Fn = class {
  constructor(e51, t2 = {}) {
    St(this, t2), this.type = e51;
  }
};
var In = class extends Fn {
  constructor(e51, t2 = {}) {
    super(`error`, St({ error: e51 }, t2));
  }
};
var Ln = class {
  on(e51, t2) {
    return this._listeners ||= {}, Nn(e51, t2, this._listeners), { unsubscribe: () => {
      this.off(e51, t2);
    } };
  }
  off(e51, t2) {
    return Pn(e51, t2, this._listeners), Pn(e51, t2, this._oneTimeListeners), this;
  }
  once(e51, t2) {
    return t2 ? (this._oneTimeListeners ||= {}, Nn(e51, t2, this._oneTimeListeners), this) : new Promise((t3) => this.once(e51, t3));
  }
  fire(e51, t2) {
    let n2 = typeof e51 == `string` ? new Fn(e51, t2 || {}) : e51, r2 = n2.type;
    if (this.listens(r2)) {
      n2.target = this;
      let e52 = this._listeners?.[r2]?.slice() ?? [];
      for (let t4 of e52) t4.call(this, n2);
      let t3 = this._oneTimeListeners?.[r2]?.slice() ?? [];
      for (let e53 of t3) Pn(r2, e53, this._oneTimeListeners), e53.call(this, n2);
      let i2 = this._eventedParent;
      i2 && (St(n2, typeof this._eventedParentData == `function` ? this._eventedParentData() : this._eventedParentData), i2.fire(n2));
    } else n2 instanceof In && console.error(n2.error);
    return this;
  }
  listens(e51) {
    return !!(this._listeners?.[e51]?.length || this._oneTimeListeners?.[e51]?.length || this._eventedParent?.listens(e51));
  }
  setEventedParent(e51, t2) {
    return this._eventedParent = e51, this._eventedParentData = t2, this;
  }
};
var M = { $version: 8, $root: { version: { required: true, type: `enum`, values: [8] }, name: { type: `string` }, metadata: { type: `*` }, center: { type: `array`, value: `number`, length: 2 }, centerAltitude: { type: `number` }, zoom: { type: `number` }, bearing: { type: `number`, default: 0, period: 360, units: `degrees` }, pitch: { type: `number`, default: 0, units: `degrees` }, roll: { type: `number`, default: 0, units: `degrees` }, state: { type: `state`, default: {} }, light: { type: `light` }, sky: { type: `sky` }, projection: { type: `projection` }, terrain: { type: `terrain` }, sources: { required: true, type: `sources` }, sprite: { type: `sprite` }, glyphs: { type: `string` }, "font-faces": { type: `fontFaces` }, transition: { type: `transition` }, layers: { required: true, type: `array`, value: `layer` } }, sources: { "*": { type: `source` } }, source: [`source_vector`, `source_raster`, `source_raster_dem`, `source_geojson`, `source_video`, `source_image`], source_vector: { type: { required: true, type: `enum`, values: { vector: {} } }, url: { type: `string` }, tiles: { type: `array`, value: `string` }, bounds: { type: `array`, value: `number`, length: 4, default: [-180, -85.051129, 180, 85.051129] }, scheme: { type: `enum`, values: { xyz: {}, tms: {} }, default: `xyz` }, minzoom: { type: `number`, default: 0 }, maxzoom: { type: `number`, default: 22 }, attribution: { type: `string` }, promoteId: { type: `promoteId` }, volatile: { type: `boolean`, default: false }, encoding: { type: `enum`, values: { mvt: {}, mlt: {} }, default: `mvt` }, "*": { type: `*` } }, source_raster: { type: { required: true, type: `enum`, values: { raster: {} } }, url: { type: `string` }, tiles: { type: `array`, value: `string` }, bounds: { type: `array`, value: `number`, length: 4, default: [-180, -85.051129, 180, 85.051129] }, minzoom: { type: `number`, default: 0 }, maxzoom: { type: `number`, default: 22 }, tileSize: { type: `number`, default: 512, units: `pixels` }, scheme: { type: `enum`, values: { xyz: {}, tms: {} }, default: `xyz` }, attribution: { type: `string` }, volatile: { type: `boolean`, default: false }, "*": { type: `*` } }, source_raster_dem: { type: { required: true, type: `enum`, values: { "raster-dem": {} } }, url: { type: `string` }, tiles: { type: `array`, value: `string` }, bounds: { type: `array`, value: `number`, length: 4, default: [-180, -85.051129, 180, 85.051129] }, minzoom: { type: `number`, default: 0 }, maxzoom: { type: `number`, default: 22 }, tileSize: { type: `number`, default: 512, units: `pixels` }, attribution: { type: `string` }, encoding: { type: `enum`, values: { terrarium: {}, mapbox: {}, custom: {} }, default: `mapbox` }, redFactor: { type: `number`, default: 1 }, blueFactor: { type: `number`, default: 1 }, greenFactor: { type: `number`, default: 1 }, baseShift: { type: `number`, default: 0 }, volatile: { type: `boolean`, default: false }, "*": { type: `*` } }, source_geojson: { type: { required: true, type: `enum`, values: { geojson: {} } }, data: { required: true, type: `*` }, maxzoom: { type: `number`, default: 18 }, attribution: { type: `string` }, buffer: { type: `number`, default: 128, maximum: 512, minimum: 0 }, filter: { type: `filter` }, tolerance: { type: `number`, default: 0.375 }, cluster: { type: `boolean`, default: false }, clusterRadius: { type: `number`, default: 50, minimum: 0 }, clusterMaxZoom: { type: `number` }, clusterMinPoints: { type: `number` }, clusterProperties: { type: `*` }, lineMetrics: { type: `boolean`, default: false }, generateId: { type: `boolean`, default: false }, promoteId: { type: `promoteId` } }, source_video: { type: { required: true, type: `enum`, values: { video: {} } }, urls: { required: true, type: `array`, value: `string` }, coordinates: { required: true, type: `array`, length: 4, value: { type: `array`, length: 2, value: `number` } } }, source_image: { type: { required: true, type: `enum`, values: { image: {} } }, url: { required: true, type: `string` }, coordinates: { required: true, type: `array`, length: 4, value: { type: `array`, length: 2, value: `number` } } }, layer: { id: { type: `string`, required: true }, type: { type: `enum`, values: { fill: {}, line: {}, symbol: {}, circle: {}, heatmap: {}, "fill-extrusion": {}, raster: {}, hillshade: {}, "color-relief": {}, background: {} }, required: true }, metadata: { type: `*` }, source: { type: `string` }, "source-layer": { type: `string` }, minzoom: { type: `number`, minimum: 0, maximum: 24 }, maxzoom: { type: `number`, minimum: 0, maximum: 24 }, filter: { type: `filter` }, layout: { type: `layout` }, paint: { type: `paint` } }, layout: [`layout_fill`, `layout_line`, `layout_circle`, `layout_heatmap`, `layout_fill-extrusion`, `layout_symbol`, `layout_raster`, `layout_hillshade`, `layout_color-relief`, `layout_background`], layout_background: { visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, layout_fill: { "fill-sort-key": { type: `number`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, layout_circle: { "circle-sort-key": { type: `number`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, layout_heatmap: { visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, "layout_fill-extrusion": { visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` }, "fill-extrusion-rounded-corner-distance": { type: `number`, default: 0, minimum: 0, units: `meters`, "property-type": `constant` } }, layout_line: { "line-cap": { type: `enum`, values: { butt: {}, round: {}, square: {} }, default: `butt`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "line-join": { type: `enum`, values: { bevel: {}, round: {}, miter: {} }, default: `miter`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "line-miter-limit": { type: `number`, default: 2, requires: [{ "line-join": `miter` }], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "line-round-limit": { type: `number`, default: 1.05, requires: [{ "line-join": `round` }], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "line-sort-key": { type: `number`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, layout_symbol: { "symbol-placement": { type: `enum`, values: { point: {}, line: {}, "line-center": {} }, default: `point`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "symbol-spacing": { type: `number`, default: 250, minimum: 1, units: `pixels`, requires: [{ "symbol-placement": `line` }], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "symbol-avoid-edges": { type: `boolean`, default: false, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "symbol-sort-key": { type: `number`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "symbol-z-order": { type: `enum`, values: { auto: {}, "viewport-y": {}, source: {} }, default: `auto`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-allow-overlap": { type: `boolean`, default: false, requires: [`icon-image`, { "!": `icon-overlap` }], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-overlap": { type: `enum`, values: { never: {}, always: {}, cooperative: {} }, requires: [`icon-image`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-ignore-placement": { type: `boolean`, default: false, requires: [`icon-image`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-optional": { type: `boolean`, default: false, requires: [`icon-image`, `text-field`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-rotation-alignment": { type: `enum`, values: { map: {}, viewport: {}, auto: {} }, default: `auto`, requires: [`icon-image`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-size": { type: `number`, default: 1, minimum: 0, units: `factor of the original icon size`, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "icon-text-fit": { type: `enum`, values: { none: {}, width: {}, height: {}, both: {} }, default: `none`, requires: [`icon-image`, `text-field`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-text-fit-padding": { type: `array`, value: `number`, length: 4, default: [0, 0, 0, 0], units: `pixels`, requires: [`icon-image`, `text-field`, { "icon-text-fit": [`both`, `width`, `height`] }], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-image": { type: `resolvedImage`, tokens: true, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "icon-rotate": { type: `number`, default: 0, period: 360, units: `degrees`, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "icon-padding": { type: `padding`, default: [2], units: `pixels`, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "icon-keep-upright": { type: `boolean`, default: false, requires: [`icon-image`, { "icon-rotation-alignment": `map` }, { "symbol-placement": [`line`, `line-center`] }], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-offset": { type: `array`, value: `number`, length: 2, default: [0, 0], requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "icon-anchor": { type: `enum`, values: { center: {}, left: {}, right: {}, top: {}, bottom: {}, "top-left": {}, "top-right": {}, "bottom-left": {}, "bottom-right": {} }, default: `center`, requires: [`icon-image`], expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "icon-pitch-alignment": { type: `enum`, values: { map: {}, viewport: {}, auto: {} }, default: `auto`, requires: [`icon-image`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-pitch-alignment": { type: `enum`, values: { map: {}, viewport: {}, auto: {} }, default: `auto`, requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-rotation-alignment": { type: `enum`, values: { map: {}, viewport: {}, "viewport-glyph": {}, auto: {} }, default: `auto`, requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-field": { type: `formatted`, default: ``, tokens: true, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-font": { type: `array`, value: `string`, default: [`Open Sans Regular`, `Arial Unicode MS Regular`], requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-size": { type: `number`, default: 16, minimum: 0, units: `pixels`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-max-width": { type: `number`, default: 10, minimum: 0, units: `ems`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-line-height": { type: `number`, default: 1.2, units: `ems`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-letter-spacing": { type: `number`, default: 0, units: `ems`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-justify": { type: `enum`, values: { auto: {}, left: {}, center: {}, right: {} }, default: `center`, requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-radial-offset": { type: `number`, units: `ems`, default: 0, requires: [`text-field`], "property-type": `data-driven`, expression: { interpolated: true, parameters: [`zoom`, `feature`] } }, "text-variable-anchor": { type: `array`, value: `enum`, values: { center: {}, left: {}, right: {}, top: {}, bottom: {}, "top-left": {}, "top-right": {}, "bottom-left": {}, "bottom-right": {} }, requires: [`text-field`, { "symbol-placement": [`point`] }], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-variable-anchor-offset": { type: `variableAnchorOffsetCollection`, requires: [`text-field`, { "symbol-placement": [`point`] }], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-anchor": { type: `enum`, values: { center: {}, left: {}, right: {}, top: {}, bottom: {}, "top-left": {}, "top-right": {}, "bottom-left": {}, "bottom-right": {} }, default: `center`, requires: [`text-field`, { "!": `text-variable-anchor` }], expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-max-angle": { type: `number`, default: 45, units: `degrees`, requires: [`text-field`, { "symbol-placement": [`line`, `line-center`] }], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-writing-mode": { type: `array`, value: `enum`, values: { horizontal: {}, vertical: {} }, requires: [`text-field`, { "symbol-placement": [`point`] }], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-rotate": { type: `number`, default: 0, period: 360, units: `degrees`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-padding": { type: `number`, default: 2, minimum: 0, units: `pixels`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-keep-upright": { type: `boolean`, default: true, requires: [`text-field`, { "text-rotation-alignment": `map` }, { "symbol-placement": [`line`, `line-center`] }], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-transform": { type: `enum`, values: { none: {}, uppercase: {}, lowercase: {} }, default: `none`, requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-offset": { type: `array`, value: `number`, units: `ems`, length: 2, default: [0, 0], requires: [`text-field`, { "!": `text-radial-offset` }], expression: { interpolated: true, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, "text-allow-overlap": { type: `boolean`, default: false, requires: [`text-field`, { "!": `text-overlap` }], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-overlap": { type: `enum`, values: { never: {}, always: {}, cooperative: {} }, requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-ignore-placement": { type: `boolean`, default: false, requires: [`text-field`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-optional": { type: `boolean`, default: false, requires: [`text-field`, `icon-image`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, layout_raster: { visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, layout_hillshade: { visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, "layout_color-relief": { visibility: { type: `enum`, values: { visible: {}, none: {} }, default: `visible`, expression: { interpolated: false, parameters: [`global-state`] }, "property-type": `data-constant` } }, filter: { type: `boolean`, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `data-driven` }, filter_operator: { type: `enum`, values: { "==": {}, "!=": {}, ">": {}, ">=": {}, "<": {}, "<=": {}, in: {}, "!in": {}, all: {}, any: {}, none: {}, has: {}, "!has": {} } }, geometry_type: { type: `enum`, values: { Point: {}, LineString: {}, Polygon: {} } }, function: { expression: { type: `expression` }, stops: { type: `array`, value: `function_stop` }, base: { type: `number`, default: 1, minimum: 0 }, property: { type: `string`, default: `$zoom` }, type: { type: `enum`, values: { identity: {}, exponential: {}, interval: {}, categorical: {} }, default: `exponential` }, colorSpace: { type: `enum`, values: { rgb: {}, lab: {}, hcl: {} }, default: `rgb` }, default: { type: `*`, required: false } }, function_stop: { type: `array`, minimum: 0, maximum: 24, value: [`number`, `color`], length: 2 }, expression: { type: `array`, value: `expression_name`, minimum: 1 }, light: { anchor: { type: `enum`, default: `viewport`, values: { map: {}, viewport: {} }, "property-type": `data-constant`, transition: false, expression: { interpolated: false, parameters: [`zoom`] } }, position: { type: `array`, default: [1.15, 210, 30], length: 3, value: `number`, "property-type": `data-constant`, transition: true, expression: { interpolated: true, parameters: [`zoom`] } }, color: { type: `color`, "property-type": `data-constant`, default: `#ffffff`, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, intensity: { type: `number`, "property-type": `data-constant`, default: 0.5, minimum: 0, maximum: 1, expression: { interpolated: true, parameters: [`zoom`] }, transition: true } }, sky: { "sky-color": { type: `color`, "property-type": `data-constant`, default: `#88C6FC`, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, "horizon-color": { type: `color`, "property-type": `data-constant`, default: `#ffffff`, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, "fog-color": { type: `color`, "property-type": `data-constant`, default: `#ffffff`, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, "fog-ground-blend": { type: `number`, "property-type": `data-constant`, default: 0.5, minimum: 0, maximum: 1, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, "horizon-fog-blend": { type: `number`, "property-type": `data-constant`, default: 0.8, minimum: 0, maximum: 1, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, "sky-horizon-blend": { type: `number`, "property-type": `data-constant`, default: 0.8, minimum: 0, maximum: 1, expression: { interpolated: true, parameters: [`zoom`] }, transition: true }, "atmosphere-blend": { type: `number`, "property-type": `data-constant`, default: 0.8, minimum: 0, maximum: 1, expression: { interpolated: true, parameters: [`zoom`] }, transition: true } }, terrain: { source: { type: `string`, required: true }, exaggeration: { type: `number`, minimum: 0, default: 1 } }, projection: { type: { type: `projectionDefinition`, default: `mercator`, "property-type": `data-constant`, transition: false, expression: { interpolated: true, parameters: [`zoom`] } } }, paint: [`paint_fill`, `paint_line`, `paint_circle`, `paint_heatmap`, `paint_fill-extrusion`, `paint_symbol`, `paint_raster`, `paint_hillshade`, `paint_color-relief`, `paint_background`], paint_fill: { "fill-antialias": { type: `boolean`, default: true, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "fill-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "fill-layer-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`, `global-state`] }, "property-type": `data-constant` }, "fill-color": { type: `color`, default: `#000000`, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "fill-outline-color": { type: `color`, transition: true, requires: [{ "!": `fill-pattern` }, { "fill-antialias": true }], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "fill-translate": { type: `array`, value: `number`, length: 2, default: [0, 0], transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "fill-translate-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, requires: [`fill-translate`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "fill-pattern": { type: `resolvedImage`, transition: true, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `cross-faded-data-driven` } }, "paint_fill-extrusion": { "fill-extrusion-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "fill-extrusion-color": { type: `color`, default: `#000000`, transition: true, requires: [{ "!": `fill-extrusion-pattern` }], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "fill-extrusion-translate": { type: `array`, value: `number`, length: 2, default: [0, 0], transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "fill-extrusion-translate-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, requires: [`fill-extrusion-translate`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "fill-extrusion-pattern": { type: `resolvedImage`, transition: true, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `cross-faded-data-driven` }, "fill-extrusion-height": { type: `number`, default: 0, minimum: 0, units: `meters`, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "fill-extrusion-base": { type: `number`, default: 0, minimum: 0, units: `meters`, transition: true, requires: [`fill-extrusion-height`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "fill-extrusion-vertical-gradient": { type: `boolean`, default: true, transition: false, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` } }, paint_line: { "line-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "line-layer-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`, `global-state`] }, "property-type": `data-constant` }, "line-color": { type: `color`, default: `#000000`, transition: true, requires: [{ "!": `line-pattern` }], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "line-translate": { type: `array`, value: `number`, length: 2, default: [0, 0], transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "line-translate-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, requires: [`line-translate`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "line-width": { type: `number`, default: 1, minimum: 0, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "line-gap-width": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "line-offset": { type: `number`, default: 0, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "line-blur": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "line-dasharray": { type: `array`, value: `number`, minimum: 0, transition: true, units: `line widths`, requires: [{ "!": `line-pattern` }], expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `cross-faded-data-driven` }, "line-pattern": { type: `resolvedImage`, transition: true, expression: { interpolated: false, parameters: [`zoom`, `feature`] }, "property-type": `cross-faded-data-driven` }, "line-gradient": { type: `color`, transition: false, requires: [{ "!": `line-dasharray` }, { "!": `line-pattern` }, { source: `geojson`, has: { lineMetrics: true } }], expression: { interpolated: true, parameters: [`line-progress`] }, "property-type": `color-ramp` } }, paint_circle: { "circle-radius": { type: `number`, default: 5, minimum: 0, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "circle-color": { type: `color`, default: `#000000`, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "circle-blur": { type: `number`, default: 0, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "circle-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "circle-translate": { type: `array`, value: `number`, length: 2, default: [0, 0], transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "circle-translate-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, requires: [`circle-translate`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "circle-pitch-scale": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "circle-pitch-alignment": { type: `enum`, values: { map: {}, viewport: {} }, default: `viewport`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "circle-stroke-width": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "circle-stroke-color": { type: `color`, default: `#000000`, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "circle-stroke-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` } }, paint_heatmap: { "heatmap-radius": { type: `number`, default: 30, minimum: 1, transition: true, units: `pixels`, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "heatmap-weight": { type: `number`, default: 1, minimum: 0, transition: false, expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "heatmap-intensity": { type: `number`, default: 1, minimum: 0, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "heatmap-color": { type: `color`, default: [`interpolate`, [`linear`], [`heatmap-density`], 0, `rgba(0, 0, 255, 0)`, 0.1, `royalblue`, 0.3, `cyan`, 0.5, `lime`, 0.7, `yellow`, 1, `red`], transition: false, expression: { interpolated: true, parameters: [`heatmap-density`] }, "property-type": `color-ramp` }, "heatmap-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` } }, paint_symbol: { "icon-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "icon-color": { type: `color`, default: `#000000`, transition: true, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "icon-halo-color": { type: `color`, default: `rgba(0, 0, 0, 0)`, transition: true, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "icon-halo-width": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "icon-halo-blur": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "icon-translate": { type: `array`, value: `number`, length: 2, default: [0, 0], transition: true, units: `pixels`, requires: [`icon-image`], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "icon-translate-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, requires: [`icon-image`, `icon-translate`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "text-color": { type: `color`, default: `#000000`, transition: true, overridable: true, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "text-halo-color": { type: `color`, default: `rgba(0, 0, 0, 0)`, transition: true, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "text-halo-width": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "text-halo-blur": { type: `number`, default: 0, minimum: 0, transition: true, units: `pixels`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`, `feature`, `feature-state`] }, "property-type": `data-driven` }, "text-translate": { type: `array`, value: `number`, length: 2, default: [0, 0], transition: true, units: `pixels`, requires: [`text-field`], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "text-translate-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `map`, requires: [`text-field`, `text-translate`], expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` } }, paint_raster: { "raster-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-hue-rotate": { type: `number`, default: 0, period: 360, transition: true, units: `degrees`, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-brightness-min": { type: `number`, default: 0, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-brightness-max": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-saturation": { type: `number`, default: 0, minimum: -1, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-contrast": { type: `number`, default: 0, minimum: -1, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, resampling: { type: `enum`, values: { linear: {}, nearest: {} }, default: `linear`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-resampling": { type: `enum`, values: { linear: {}, nearest: {} }, default: `linear`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "raster-fade-duration": { type: `number`, default: 300, minimum: 0, transition: false, units: `milliseconds`, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` } }, paint_hillshade: { "hillshade-illumination-direction": { type: `numberArray`, default: 335, minimum: 0, maximum: 359, transition: false, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-illumination-altitude": { type: `numberArray`, default: 45, minimum: 0, maximum: 90, transition: false, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-illumination-anchor": { type: `enum`, values: { map: {}, viewport: {} }, default: `viewport`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-exaggeration": { type: `number`, default: 0.5, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-shadow-color": { type: `colorArray`, default: `#000000`, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-highlight-color": { type: `colorArray`, default: `#FFFFFF`, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-accent-color": { type: `color`, default: `#000000`, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "hillshade-method": { type: `enum`, values: { standard: {}, basic: {}, combined: {}, igor: {}, multidirectional: {} }, default: `standard`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` }, resampling: { type: `enum`, values: { linear: {}, nearest: {} }, default: `linear`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` } }, "paint_color-relief": { "color-relief-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "color-relief-color": { type: `color`, transition: false, expression: { interpolated: true, parameters: [`elevation`] }, "property-type": `color-ramp` }, resampling: { type: `enum`, values: { linear: {}, nearest: {} }, default: `linear`, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `data-constant` } }, paint_background: { "background-color": { type: `color`, default: `#000000`, transition: true, requires: [{ "!": `background-pattern` }], expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` }, "background-pattern": { type: `resolvedImage`, transition: true, expression: { interpolated: false, parameters: [`zoom`] }, "property-type": `cross-faded` }, "background-opacity": { type: `number`, default: 1, minimum: 0, maximum: 1, transition: true, expression: { interpolated: true, parameters: [`zoom`] }, "property-type": `data-constant` } }, transition: { duration: { type: `number`, default: 300, minimum: 0, units: `milliseconds` }, delay: { type: `number`, default: 0, minimum: 0, units: `milliseconds` } }, "property-type": { "data-driven": { type: `property-type` }, "cross-faded": { type: `property-type` }, "cross-faded-data-driven": { type: `property-type` }, "color-ramp": { type: `property-type` }, "data-constant": { type: `property-type` }, constant: { type: `property-type` } }, promoteId: { "*": { type: `string` } }, interpolation: { type: `array`, value: `interpolation_name`, minimum: 1 }, interpolation_name: { type: `enum`, values: { linear: { syntax: { overloads: [{ parameters: [], "output-type": `interpolation` }], parameters: [] } }, exponential: { syntax: { overloads: [{ parameters: [`base`], "output-type": `interpolation` }], parameters: [{ name: `base`, type: `number literal` }] } }, "cubic-bezier": { syntax: { overloads: [{ parameters: [`x1`, `y1`, `x2`, `y2`], "output-type": `interpolation` }], parameters: [{ name: `x1`, type: `number literal` }, { name: `y1`, type: `number literal` }, { name: `x2`, type: `number literal` }, { name: `y2`, type: `number literal` }] } } } } };
var Rn = [`type`, `source`, `source-layer`, `minzoom`, `maxzoom`, `filter`, `layout`];
var P = class {
  constructor(e51, t2, n2, r2, i2 = `error`) {
    this.message = (e51 ? `${e51}: ` : ``) + n2, r2 && (this.identifier = r2), this.severity = i2, t2 != null && t2.__line__ && (this.line = t2.__line__);
  }
};
var Qn = class extends Error {
  constructor(e51, t2) {
    super(t2), this.message = t2, this.key = e51;
  }
};
var $n = class e2 {
  constructor(e51, t2 = []) {
    this.parent = e51, this.bindings = {};
    for (let [e52, n2] of t2) this.bindings[e52] = n2;
  }
  concat(t2) {
    return new e2(this, t2);
  }
  get(e51) {
    if (this.bindings[e51]) return this.bindings[e51];
    if (this.parent) return this.parent.get(e51);
    throw Error(`${e51} not found in scope.`);
  }
  has(e51) {
    return this.bindings[e51] ? true : this.parent ? this.parent.has(e51) : false;
  }
};
var er = { kind: `null` };
var F = { kind: `number` };
var I = { kind: `string` };
var L = { kind: `boolean` };
var tr = { kind: `color` };
var nr = { kind: `projectionDefinition` };
var rr = { kind: `object` };
var R = { kind: `value` };
var ir = { kind: `error` };
var ar = { kind: `collator` };
var or = { kind: `formatted` };
var sr = { kind: `padding` };
var cr = { kind: `colorArray` };
var lr = { kind: `numberArray` };
var ur = { kind: `resolvedImage` };
var dr = { kind: `variableAnchorOffsetCollection` };
function fr(e51, t2) {
  return { kind: `array`, itemType: e51, N: t2 };
}
function z(e51) {
  if (e51.kind === `array`) {
    let t2 = z(e51.itemType);
    return typeof e51.N == `number` ? `array<${t2}, ${e51.N}>` : e51.itemType.kind === `value` ? `array` : `array<${t2}>`;
  }
  return e51.kind;
}
var pr = [er, F, I, L, tr, nr, or, rr, fr(R), sr, lr, cr, ur, dr];
function mr(e51, t2) {
  if (t2.kind === `error`) return null;
  if (e51.kind === `array`) {
    if (t2.kind === `array` && (t2.N === 0 && t2.itemType.kind === `value` || !mr(e51.itemType, t2.itemType)) && (typeof e51.N != `number` || e51.N === t2.N)) return null;
  } else if (e51.kind === t2.kind) return null;
  else if (e51.kind === `value`) {
    for (let e52 of pr) if (!mr(e52, t2)) return null;
  }
  return `Expected ${z(e51)} but found ${z(t2)} instead.`;
}
function hr(e51, t2) {
  return t2.some((t3) => t3.kind === e51.kind);
}
function gr(e51, t2) {
  return t2.some((t3) => t3 === `null` ? e51 === null : t3 === `array` ? Array.isArray(e51) : t3 === `object` ? e51 && !Array.isArray(e51) && typeof e51 == `object` : t3 === typeof e51);
}
function _r(e51, t2) {
  return e51.kind === `array` && t2.kind === `array` ? e51.itemType.kind === t2.itemType.kind && typeof e51.N == `number` : e51.kind === t2.kind;
}
var vr = 0.96422;
var yr = 0.82521;
var br = 4 / 29;
var xr = 6 / 29;
var Sr = 3 * xr * xr;
var Cr = Math.PI / 180;
var wr = 180 / Math.PI;
function Tr(e51) {
  return e51 %= 360, e51 < 0 && (e51 += 360), e51;
}
function Er([e51, t2, n2, r2]) {
  e51 = Dr(e51), t2 = Dr(t2), n2 = Dr(n2);
  let i2, a2, o2 = Or((0.2225045 * e51 + 0.7168786 * t2 + 0.0606169 * n2) / 1);
  e51 === t2 && t2 === n2 ? i2 = a2 = o2 : (i2 = Or((0.4360747 * e51 + 0.3850649 * t2 + 0.1430804 * n2) / vr), a2 = Or((0.0139322 * e51 + 0.0971045 * t2 + 0.7141733 * n2) / yr));
  let s2 = 116 * o2 - 16;
  return [s2 < 0 ? 0 : s2, 500 * (i2 - o2), 200 * (o2 - a2), r2];
}
function Dr(e51) {
  return e51 <= 0.04045 ? e51 / 12.92 : ((e51 + 0.055) / 1.055) ** 2.4;
}
function Or(e51) {
  return e51 > 0.008856451679035631 ? e51 ** (1 / 3) : e51 / Sr + br;
}
function kr([e51, t2, n2, r2]) {
  let i2 = (e51 + 16) / 116, a2 = isNaN(t2) ? i2 : i2 + t2 / 500, o2 = isNaN(n2) ? i2 : i2 - n2 / 200;
  return i2 = 1 * jr(i2), a2 = vr * jr(a2), o2 = yr * jr(o2), [Ar(3.1338561 * a2 - 1.6168667 * i2 - 0.4906146 * o2), Ar(-0.9787684 * a2 + 1.9161415 * i2 + 0.033454 * o2), Ar(0.0719453 * a2 - 0.2289914 * i2 + 1.4052427 * o2), r2];
}
function Ar(e51) {
  return e51 = e51 <= 304e-5 ? 12.92 * e51 : 1.055 * e51 ** (1 / 2.4) - 0.055, e51 < 0 ? 0 : e51 > 1 ? 1 : e51;
}
function jr(e51) {
  return e51 > xr ? e51 * e51 * e51 : Sr * (e51 - br);
}
function Mr(e51) {
  let [t2, n2, r2, i2] = Er(e51), a2 = Math.sqrt(n2 * n2 + r2 * r2);
  return [Math.round(a2 * 1e4) ? Tr(Math.atan2(r2, n2) * wr) : NaN, a2, t2, i2];
}
function Nr([e51, t2, n2, r2]) {
  return e51 = isNaN(e51) ? 0 : e51 * Cr, kr([n2, Math.cos(e51) * t2, Math.sin(e51) * t2, r2]);
}
function Pr([e51, t2, n2, r2]) {
  e51 = Tr(e51), t2 /= 100, n2 /= 100;
  function i2(r3) {
    let i3 = (r3 + e51 / 30) % 12, a2 = t2 * Math.min(n2, 1 - n2);
    return n2 - a2 * Math.max(-1, Math.min(i3 - 3, 9 - i3, 1));
  }
  return [i2(0), i2(8), i2(4), r2];
}
var Fr = Object.hasOwn || function(e51, t2) {
  return Object.prototype.hasOwnProperty.call(e51, t2);
};
function Ir(e51, t2) {
  return Fr(e51, t2) ? e51[t2] : void 0;
}
function Lr(e51) {
  if (e51 = e51.toLowerCase().trim(), e51 === `transparent`) return [0, 0, 0, 0];
  let t2 = Ir(Hr, e51);
  if (t2) {
    let [e52, n3, r2] = t2;
    return [e52 / 255, n3 / 255, r2 / 255, 1];
  }
  if (e51.startsWith(`#`) && /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(e51)) {
    let t3 = e51.length < 6 ? 1 : 2, n3 = 1;
    return [Rr(e51.slice(n3, n3 += t3)), Rr(e51.slice(n3, n3 += t3)), Rr(e51.slice(n3, n3 += t3)), Rr(e51.slice(n3, n3 + t3) || `ff`)];
  }
  if (e51.startsWith(`rgb`)) {
    let t3 = e51.match(/^rgba?\(\s*([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);
    if (t3) {
      let [e52, n3, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2] = t3, p2 = [i2 || ` `, s2 || ` `, u2].join(``);
      if (p2 === `  ` || p2 === `  /` || p2 === `,,` || p2 === `,,,`) {
        let e53 = [r2, o2, l2].join(``), t4 = e53 === `%%%` ? 100 : e53 === `` ? 255 : 0;
        if (t4) {
          let e54 = [Br(+n3 / t4, 0, 1), Br(+a2 / t4, 0, 1), Br(+c2 / t4, 0, 1), d2 ? zr(+d2, f2) : 1];
          if (Vr(e54)) return e54;
        }
      }
      return;
    }
  }
  let n2 = e51.match(/^hsla?\(\s*([\de.+-]+)(?:deg)?(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);
  if (n2) {
    let [e52, t3, r2, i2, a2, o2, s2, c2, l2] = n2, u2 = [r2 || ` `, a2 || ` `, s2].join(``);
    if (u2 === `  ` || u2 === `  /` || u2 === `,,` || u2 === `,,,`) {
      let e53 = [+t3, Br(+i2, 0, 100), Br(+o2, 0, 100), c2 ? zr(+c2, l2) : 1];
      if (Vr(e53)) return Pr(e53);
    }
  }
}
function Rr(e51) {
  return parseInt(e51.padEnd(2, e51), 16) / 255;
}
function zr(e51, t2) {
  return Br(t2 ? e51 / 100 : e51, 0, 1);
}
function Br(e51, t2, n2) {
  return Math.min(Math.max(t2, e51), n2);
}
function Vr(e51) {
  return !e51.some(Number.isNaN);
}
var Hr = { aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255], aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220], bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205], blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42], burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0], chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237], cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255], darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11], darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169], darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47], darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0], darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139], darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209], darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255], dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255], firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34], fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255], gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128], green: [0, 128, 0], greenyellow: [173, 255, 47], grey: [128, 128, 128], honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92], indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140], lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0], lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128], lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211], lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193], lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250], lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222], lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50], linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0], mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211], mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238], mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133], midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225], moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128], oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35], orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214], palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238], palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185], peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221], powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153], red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225], saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96], seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45], silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205], slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250], springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140], teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71], turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179], white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0], yellowgreen: [154, 205, 50] };
function Ur(e51, t2, n2) {
  return e51 + n2 * (t2 - e51);
}
function Wr(e51, t2, n2) {
  return e51.map((e52, r2) => Ur(e52, t2[r2], n2));
}
function Gr(e51) {
  return e51 === `rgb` || e51 === `hcl` || e51 === `lab`;
}
var B = class e3 {
  constructor(e51, t2, n2, r2 = 1, i2 = true) {
    this.r = e51, this.g = t2, this.b = n2, this.a = r2, i2 || (this.r *= r2, this.g *= r2, this.b *= r2, r2 || this.overwriteGetter(`rgb`, [e51, t2, n2, r2]));
  }
  static {
    this.black = new e3(0, 0, 0, 1);
  }
  static {
    this.white = new e3(1, 1, 1, 1);
  }
  static {
    this.transparent = new e3(0, 0, 0, 0);
  }
  static {
    this.red = new e3(1, 0, 0, 1);
  }
  static parse(t2) {
    if (t2 instanceof e3) return t2;
    if (typeof t2 != `string`) return;
    let n2 = Lr(t2);
    if (n2) return new e3(...n2, false);
  }
  get rgb() {
    let { r: e51, g: t2, b: n2, a: r2 } = this, i2 = r2 || 1 / 0;
    return this.overwriteGetter(`rgb`, [e51 / i2, t2 / i2, n2 / i2, r2]);
  }
  get hcl() {
    return this.overwriteGetter(`hcl`, Mr(this.rgb));
  }
  get lab() {
    return this.overwriteGetter(`lab`, Er(this.rgb));
  }
  overwriteGetter(e51, t2) {
    return Object.defineProperty(this, e51, { value: t2 }), t2;
  }
  toString() {
    let [e51, t2, n2, r2] = this.rgb;
    return `rgba(${[e51, t2, n2].map((e52) => Math.round(e52 * 255)).join(`,`)},${r2})`;
  }
  static interpolate(t2, n2, r2, i2 = `rgb`) {
    switch (i2) {
      case `rgb`: {
        let [i3, a2, o2, s2] = Wr(t2.rgb, n2.rgb, r2);
        return new e3(i3, a2, o2, s2, false);
      }
      case `hcl`: {
        let [i3, a2, o2, s2] = t2.hcl, [c2, l2, u2, d2] = n2.hcl, f2, p2;
        if (!isNaN(i3) && !isNaN(c2)) {
          let e51 = c2 - i3;
          c2 > i3 && e51 > 180 ? e51 -= 360 : c2 < i3 && i3 - c2 > 180 && (e51 += 360), f2 = i3 + r2 * e51;
        } else isNaN(i3) ? isNaN(c2) ? f2 = NaN : (f2 = c2, (o2 === 1 || o2 === 0) && (p2 = l2)) : (f2 = i3, (u2 === 1 || u2 === 0) && (p2 = a2));
        let [m2, h2, g2, _] = Nr([f2, p2 ?? Ur(a2, l2, r2), Ur(o2, u2, r2), Ur(s2, d2, r2)]);
        return new e3(m2, h2, g2, _, false);
      }
      case `lab`: {
        let [i3, a2, o2, s2] = kr(Wr(t2.lab, n2.lab, r2));
        return new e3(i3, a2, o2, s2, false);
      }
    }
  }
};
var Kr = class {
  constructor(e51, t2, n2) {
    this.sensitivity = e51 ? t2 ? `variant` : `case` : t2 ? `accent` : `base`, this.locale = n2, this.collator = new Intl.Collator(this.locale ? this.locale : [], { sensitivity: this.sensitivity, usage: `search` });
  }
  compare(e51, t2) {
    return this.collator.compare(e51, t2);
  }
  resolvedLocale() {
    return new Intl.Collator(this.locale ? this.locale : []).resolvedOptions().locale;
  }
};
var qr = [`bottom`, `center`, `top`];
var Jr = class {
  constructor(e51, t2, n2, r2, i2, a2) {
    this.text = e51, this.image = t2, this.scale = n2, this.fontStack = r2, this.textColor = i2, this.verticalAlign = a2;
  }
};
var Yr = class e4 {
  constructor(e51) {
    this.sections = e51;
  }
  static fromString(t2) {
    return new e4([new Jr(t2, null, null, null, null, null)]);
  }
  isEmpty() {
    return this.sections.length === 0 || !this.sections.some((e51) => e51.text.length !== 0 || e51.image && e51.image.name.length !== 0);
  }
  static factory(t2) {
    return t2 instanceof e4 ? t2 : e4.fromString(t2);
  }
  toString() {
    return this.sections.length === 0 ? `` : this.sections.map((e51) => e51.text).join(``);
  }
};
var Xr = class e5 {
  constructor(e51) {
    this.values = e51.slice();
  }
  static parse(t2) {
    if (t2 instanceof e5) return t2;
    if (typeof t2 == `number`) return new e5([t2, t2, t2, t2]);
    if (Array.isArray(t2) && !(t2.length < 1 || t2.length > 4)) {
      for (let e51 of t2) if (typeof e51 != `number`) return;
      switch (t2.length) {
        case 1:
          t2 = [t2[0], t2[0], t2[0], t2[0]];
          break;
        case 2:
          t2 = [t2[0], t2[1], t2[0], t2[1]];
          break;
        case 3:
          t2 = [t2[0], t2[1], t2[2], t2[1]];
      }
      return new e5(t2);
    }
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(t2, n2, r2) {
    return new e5(Wr(t2.values, n2.values, r2));
  }
};
var Zr = class e6 {
  constructor(e51) {
    this.values = e51.slice();
  }
  static parse(t2) {
    if (t2 instanceof e6) return t2;
    if (typeof t2 == `number`) return new e6([t2]);
    if (Array.isArray(t2)) {
      for (let e51 of t2) if (typeof e51 != `number`) return;
      return new e6(t2);
    }
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(t2, n2, r2) {
    return new e6(Wr(t2.values, n2.values, r2));
  }
};
var Qr = class e7 {
  constructor(e51) {
    this.values = e51.slice();
  }
  static parse(t2) {
    if (t2 instanceof e7) return t2;
    if (typeof t2 == `string`) {
      let n3 = B.parse(t2);
      return n3 ? new e7([n3]) : void 0;
    }
    if (!Array.isArray(t2)) return;
    let n2 = [];
    for (let e51 of t2) {
      if (typeof e51 != `string`) return;
      let t3 = B.parse(e51);
      if (!t3) return;
      n2.push(t3);
    }
    return new e7(n2);
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(t2, n2, r2, i2 = `rgb`) {
    let a2 = [];
    if (t2.values.length != n2.values.length) throw Error(`colorArray: Arrays have mismatched length (${t2.values.length} vs. ${n2.values.length}), cannot interpolate.`);
    for (let e51 = 0; e51 < t2.values.length; e51++) a2.push(B.interpolate(t2.values[e51], n2.values[e51], r2, i2));
    return new e7(a2);
  }
};
var V = class extends Error {
  constructor(e51, t2) {
    super(e51), this.name = `RuntimeError`, this.path = t2;
  }
  toJSON() {
    return this.message;
  }
};
var $r = /* @__PURE__ */ new Set([`center`, `left`, `right`, `top`, `bottom`, `top-left`, `top-right`, `bottom-left`, `bottom-right`]);
var ei = class e8 {
  constructor(e51) {
    this.values = e51.slice();
  }
  static parse(t2) {
    if (t2 instanceof e8) return t2;
    if (!(!Array.isArray(t2) || t2.length < 1 || t2.length % 2 != 0)) {
      for (let e51 = 0; e51 < t2.length; e51 += 2) {
        let n2 = t2[e51], r2 = t2[e51 + 1];
        if (typeof n2 != `string` || !$r.has(n2) || !Array.isArray(r2) || r2.length !== 2 || typeof r2[0] != `number` || typeof r2[1] != `number`) return;
      }
      return new e8(t2);
    }
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(t2, n2, r2, i2) {
    let a2 = t2.values, o2 = n2.values;
    if (a2.length !== o2.length) throw new V(`Cannot interpolate values of different length. from: ${t2.toString()}, to: ${n2.toString()}`, i2);
    let s2 = [];
    for (let e51 = 0; e51 < a2.length; e51 += 2) {
      if (a2[e51] !== o2[e51]) throw new V(`Cannot interpolate values containing mismatched anchors. from[${e51}]: ${a2[e51]}, to[${e51}]: ${o2[e51]}`, i2);
      s2.push(a2[e51]);
      let [t3, n3] = a2[e51 + 1], [c2, l2] = o2[e51 + 1];
      s2.push([Ur(t3, c2, r2), Ur(n3, l2, r2)]);
    }
    return new e8(s2);
  }
};
var ti = class e9 {
  constructor(e51) {
    this.name = e51.name, this.available = e51.available;
  }
  toString() {
    return this.name;
  }
  static fromString(t2) {
    return t2 ? new e9({ name: t2, available: false }) : null;
  }
};
var ni = class e10 {
  constructor(e51, t2, n2) {
    this.from = e51, this.to = t2, this.transition = n2;
  }
  toString() {
    return this.from === this.to && this.transition === 1 ? this.from : JSON.stringify([this.from, this.to, this.transition]);
  }
  static interpolate(t2, n2, r2) {
    return new e10(t2, n2, r2);
  }
  static parse(t2) {
    if (t2 instanceof e10) return t2;
    if (Array.isArray(t2) && t2.length === 3 && typeof t2[0] == `string` && typeof t2[1] == `string` && typeof t2[2] == `number`) return new e10(t2[0], t2[1], t2[2]);
    if (typeof t2 == `object` && typeof t2.from == `string` && typeof t2.to == `string` && typeof t2.transition == `number`) return new e10(t2.from, t2.to, t2.transition);
    if (typeof t2 == `string`) return new e10(t2, t2, 1);
  }
};
function ri(e51, t2, n2, r2) {
  return typeof e51 == `number` && e51 >= 0 && e51 <= 255 && typeof t2 == `number` && t2 >= 0 && t2 <= 255 && typeof n2 == `number` && n2 >= 0 && n2 <= 255 ? r2 === void 0 || typeof r2 == `number` && r2 >= 0 && r2 <= 1 ? null : `Invalid rgba value [${[e51, t2, n2, r2].join(`, `)}]: 'a' must be between 0 and 1.` : `Invalid rgba value [${(typeof r2 == `number` ? [e51, t2, n2, r2] : [e51, t2, n2]).join(`, `)}]: 'r', 'g', and 'b' must be between 0 and 255.`;
}
function ii(e51) {
  if (e51 === null || typeof e51 == `string` || typeof e51 == `boolean` || typeof e51 == `number` || e51 instanceof ni || e51 instanceof B || e51 instanceof Kr || e51 instanceof Yr || e51 instanceof Xr || e51 instanceof Zr || e51 instanceof Qr || e51 instanceof ei || e51 instanceof ti) return true;
  if (Array.isArray(e51)) {
    for (let t2 of e51) if (!ii(t2)) return false;
    return true;
  }
  if (typeof e51 == `object`) {
    for (let t2 in e51) if (!ii(e51[t2])) return false;
    return true;
  }
  return false;
}
function ai(e51) {
  if (e51 === null) return er;
  if (typeof e51 == `string`) return I;
  if (typeof e51 == `boolean`) return L;
  if (typeof e51 == `number`) return F;
  if (e51 instanceof B) return tr;
  if (e51 instanceof ni) return nr;
  if (e51 instanceof Kr) return ar;
  if (e51 instanceof Yr) return or;
  if (e51 instanceof Xr) return sr;
  if (e51 instanceof Zr) return lr;
  if (e51 instanceof Qr) return cr;
  if (e51 instanceof ei) return dr;
  if (e51 instanceof ti) return ur;
  if (Array.isArray(e51)) {
    let t2 = e51.length, n2;
    for (let t3 of e51) {
      let e52 = ai(t3);
      if (!n2) n2 = e52;
      else if (n2 === e52) continue;
      else {
        n2 = R;
        break;
      }
    }
    return fr(n2 || R, t2);
  }
  return rr;
}
function oi(e51) {
  let t2 = typeof e51;
  return e51 === null ? `` : t2 === `string` || t2 === `number` || t2 === `boolean` ? String(e51) : e51 instanceof B || e51 instanceof ni || e51 instanceof Yr || e51 instanceof Xr || e51 instanceof Zr || e51 instanceof Qr || e51 instanceof ei || e51 instanceof ti ? e51.toString() : JSON.stringify(e51);
}
var si = class e11 {
  constructor(e51, t2) {
    this.type = e51, this.value = t2;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`'literal' expression requires exactly one argument, but found ${t2.length - 1} instead.`);
    if (!ii(t2[1])) return n2.error(`invalid value`);
    let r2 = t2[1], i2 = ai(r2), a2 = n2.expectedType;
    return i2.kind === `array` && i2.N === 0 && a2 && a2.kind === `array` && (typeof a2.N != `number` || a2.N === 0) && (i2 = a2), new e11(i2, r2);
  }
  evaluate() {
    return this.value;
  }
  eachChild() {
  }
  outputDefined() {
    return true;
  }
};
var ci = { string: I, number: F, boolean: L, object: rr };
var li = class e12 {
  constructor(e51, t2, n2) {
    this.type = e51, this.args = t2, this.key = n2;
  }
  static parse(t2, n2) {
    if (t2.length < 2) return n2.error(`Expected at least one argument.`);
    let r2 = 1, i2, a2 = t2[0];
    if (a2 === `array`) {
      let e51;
      if (t2.length > 2) {
        let i3 = t2[1];
        if (typeof i3 != `string` || !(i3 in ci) || i3 === `object`) return n2.error(`The item type argument of "array" must be one of string, number, boolean`, 1);
        e51 = ci[i3], r2++;
      } else e51 = R;
      let a3;
      if (t2.length > 3) {
        if (t2[2] !== null && (typeof t2[2] != `number` || t2[2] < 0 || t2[2] !== Math.floor(t2[2]))) return n2.error(`The length argument to "array" must be a positive integer literal`, 2);
        a3 = t2[2], r2++;
      }
      i2 = fr(e51, a3);
    } else {
      if (!ci[a2]) throw Error(`Types doesn't contain name = ${a2}`);
      i2 = ci[a2];
    }
    let o2 = [];
    for (; r2 < t2.length; r2++) {
      let e51 = n2.parse(t2[r2], r2, R);
      if (!e51) return null;
      o2.push(e51);
    }
    return new e12(i2, o2, n2.key);
  }
  evaluate(e51) {
    for (let t2 = 0; t2 < this.args.length; t2++) {
      let n2 = this.args[t2].evaluate(e51);
      if (!mr(this.type, ai(n2))) return n2;
      if (t2 === this.args.length - 1) throw new V(`Expected value to be of type ${z(this.type)}, but found ${z(ai(n2))} instead.`, this.key);
    }
    throw Error();
  }
  eachChild(e51) {
    this.args.forEach(e51);
  }
  outputDefined() {
    return this.args.every((e51) => e51.outputDefined());
  }
};
var ui = { "to-boolean": L, "to-color": tr, "to-number": F, "to-string": I };
var di = class e13 {
  constructor(e51, t2, n2) {
    this.type = e51, this.args = t2, this.key = n2;
  }
  static parse(t2, n2) {
    if (t2.length < 2) return n2.error(`Expected at least one argument.`);
    let r2 = t2[0];
    if (!ui[r2]) throw Error(`Can't parse ${r2} as it is not part of the known types`);
    if ((r2 === `to-boolean` || r2 === `to-string`) && t2.length !== 2) return n2.error(`Expected one argument.`);
    let i2 = ui[r2], a2 = [];
    for (let e51 = 1; e51 < t2.length; e51++) {
      let r3 = n2.parse(t2[e51], e51, R);
      if (!r3) return null;
      a2.push(r3);
    }
    return new e13(i2, a2, n2.key);
  }
  evaluate(e51) {
    switch (this.type.kind) {
      case `boolean`:
        return !!this.args[0].evaluate(e51);
      case `color`: {
        let t2, n2;
        for (let r2 of this.args) {
          if (t2 = r2.evaluate(e51), n2 = null, t2 instanceof B) return t2;
          if (typeof t2 == `string`) {
            let n3 = e51.parseColor(t2);
            if (n3) return n3;
          } else if (Array.isArray(t2) && (n2 = t2.length < 3 || t2.length > 4 ? `Invalid rgba value ${JSON.stringify(t2)}: expected an array containing either three or four numeric values.` : ri(t2[0], t2[1], t2[2], t2[3]), !n2)) return new B(t2[0] / 255, t2[1] / 255, t2[2] / 255, t2[3]);
        }
        throw new V(n2 || `Could not parse color from value '${typeof t2 == `string` ? t2 : JSON.stringify(t2)}'`, this.key);
      }
      case `padding`: {
        let t2;
        for (let n2 of this.args) {
          t2 = n2.evaluate(e51);
          let r2 = Xr.parse(t2);
          if (r2) return r2;
        }
        throw new V(`Could not parse padding from value '${typeof t2 == `string` ? t2 : JSON.stringify(t2)}'`, this.key);
      }
      case `numberArray`: {
        let t2;
        for (let n2 of this.args) {
          t2 = n2.evaluate(e51);
          let r2 = Zr.parse(t2);
          if (r2) return r2;
        }
        throw new V(`Could not parse numberArray from value '${typeof t2 == `string` ? t2 : JSON.stringify(t2)}'`, this.key);
      }
      case `colorArray`: {
        let t2;
        for (let n2 of this.args) {
          t2 = n2.evaluate(e51);
          let r2 = Qr.parse(t2);
          if (r2) return r2;
        }
        throw new V(`Could not parse colorArray from value '${typeof t2 == `string` ? t2 : JSON.stringify(t2)}'`, this.key);
      }
      case `variableAnchorOffsetCollection`: {
        let t2;
        for (let n2 of this.args) {
          t2 = n2.evaluate(e51);
          let r2 = ei.parse(t2);
          if (r2) return r2;
        }
        throw new V(`Could not parse variableAnchorOffsetCollection from value '${typeof t2 == `string` ? t2 : JSON.stringify(t2)}'`, this.key);
      }
      case `number`: {
        let t2 = null;
        for (let n2 of this.args) {
          if (t2 = n2.evaluate(e51), t2 === null) return 0;
          let r2 = Number(t2);
          if (!isNaN(r2)) return r2;
        }
        throw new V(`Could not convert ${JSON.stringify(t2)} to number.`, this.key);
      }
      case `formatted`:
        return Yr.fromString(oi(this.args[0].evaluate(e51)));
      case `resolvedImage`:
        return ti.fromString(oi(this.args[0].evaluate(e51)));
      case `projectionDefinition`: {
        let t2 = this.args[0].evaluate(e51);
        if (ni.parse(t2)) return t2;
        throw new V(`Could not parse projectionDefinition from value '${typeof t2 == `string` ? t2 : JSON.stringify(t2)}'`, this.key);
      }
      default:
        return oi(this.args[0].evaluate(e51));
    }
  }
  eachChild(e51) {
    this.args.forEach(e51);
  }
  outputDefined() {
    return this.args.every((e51) => e51.outputDefined());
  }
};
var fi = [`Unknown`, `Point`, `LineString`, `Polygon`];
var pi = class {
  constructor() {
    this.globals = null, this.feature = null, this.featureState = null, this.formattedSection = null, this._parseColorCache = /* @__PURE__ */ new Map(), this.availableImages = null, this.canonical = null;
  }
  id() {
    return this.feature && `id` in this.feature ? this.feature.id : null;
  }
  geometryType() {
    return this.feature ? typeof this.feature.type == `number` ? fi[this.feature.type] : this.feature.type : null;
  }
  geometry() {
    return this.feature && `geometry` in this.feature ? this.feature.geometry : null;
  }
  canonicalID() {
    return this.canonical;
  }
  properties() {
    return this.feature && this.feature.properties || {};
  }
  parseColor(e51) {
    let t2 = this._parseColorCache.get(e51);
    return t2 || (t2 = B.parse(e51), this._parseColorCache.set(e51, t2)), t2;
  }
};
var mi = class e14 {
  constructor(e51, t2, n2 = [], r2, i2 = new $n(), a2 = []) {
    this.registry = e51, this.path = n2, this.key = n2.map((e52) => `[${e52}]`).join(``), this.scope = i2, this.errors = a2, this.expectedType = r2, this._isConstant = t2;
  }
  parse(e51, t2, n2, r2, i2 = {}) {
    return t2 ? this.concat(t2, n2, r2)._parse(e51, i2) : this._parse(e51, i2);
  }
  _parse(e51, t2) {
    (e51 === null || typeof e51 == `string` || typeof e51 == `boolean` || typeof e51 == `number`) && (e51 = [`literal`, e51]);
    let n2 = this.key;
    function r2(e52, t3, r3) {
      return r3 === `assert` ? new li(t3, [e52], n2) : r3 === `coerce` ? new di(t3, [e52], n2) : e52;
    }
    if (Array.isArray(e51)) {
      if (e51.length === 0) return this.error(`Expected an array with at least one element. If you wanted a literal array, use ["literal", []].`);
      let n3 = e51[0];
      if (typeof n3 != `string`) return this.error(`Expression name must be a string, but found ${typeof n3} instead. If you wanted a literal array, use ["literal", [...]].`, 0), null;
      let i2 = this.registry[n3];
      if (i2) {
        let n4 = i2.parse(e51, this);
        if (!n4) return null;
        if (this.expectedType) {
          let e52 = this.expectedType, i3 = n4.type;
          if ((e52.kind === `string` || e52.kind === `number` || e52.kind === `boolean` || e52.kind === `object` || e52.kind === `array`) && i3.kind === `value`) n4 = r2(n4, e52, t2.typeAnnotation || `assert`);
          else if (e52.kind === `projectionDefinition` && [`string`, `array`, `value`].includes(i3.kind) || [`color`, `formatted`, `resolvedImage`].includes(e52.kind) && [`value`, `string`].includes(i3.kind) || [`padding`, `numberArray`].includes(e52.kind) && [`value`, `number`, `array`].includes(i3.kind) || e52.kind === `colorArray` && [`value`, `string`, `array`].includes(i3.kind) || e52.kind === `variableAnchorOffsetCollection` && [`value`, `array`].includes(i3.kind)) n4 = r2(n4, e52, t2.typeAnnotation || `coerce`);
          else if (this.checkSubtype(e52, i3)) return null;
        }
        if (!(n4 instanceof si) && n4.type.kind !== `resolvedImage` && this._isConstant(n4)) {
          let e52 = new pi();
          try {
            n4 = new si(n4.type, n4.evaluate(e52));
          } catch (e53) {
            return this.error(e53.message), null;
          }
        }
        return n4;
      }
      return this.error(`Unknown expression "${n3}". If you wanted a literal array, use ["literal", [...]].`, 0);
    }
    return e51 === void 0 ? this.error(`'undefined' value invalid. Use null instead.`) : typeof e51 == `object` ? this.error(`Bare objects invalid. Use ["literal", {...}] instead.`) : this.error(`Expected an array, but found ${typeof e51} instead.`);
  }
  concat(t2, n2, r2) {
    let i2 = typeof t2 == `number` ? this.path.concat(t2) : this.path, a2 = r2 ? this.scope.concat(r2) : this.scope;
    return new e14(this.registry, this._isConstant, i2, n2 || null, a2, this.errors);
  }
  error(e51, ...t2) {
    let n2 = `${this.key}${t2.map((e52) => `[${e52}]`).join(``)}`;
    this.errors.push(new Qn(n2, e51));
  }
  checkSubtype(e51, t2) {
    let n2 = mr(e51, t2);
    return n2 && this.error(n2), n2;
  }
};
var hi = class e15 {
  constructor(e51, t2) {
    this.type = t2.type, this.bindings = [].concat(e51), this.result = t2;
  }
  evaluate(e51) {
    return this.result.evaluate(e51);
  }
  eachChild(e51) {
    for (let t2 of this.bindings) e51(t2[1]);
    e51(this.result);
  }
  static parse(t2, n2) {
    if (t2.length < 4) return n2.error(`Expected at least 3 arguments, but found ${t2.length - 1} instead.`);
    let r2 = [];
    for (let e51 = 1; e51 < t2.length - 1; e51 += 2) {
      let i3 = t2[e51];
      if (typeof i3 != `string`) return n2.error(`Expected string, but found ${typeof i3} instead.`, e51);
      if (/[^a-zA-Z0-9_]/.test(i3)) return n2.error(`Variable names must contain only alphanumeric characters or '_'.`, e51);
      let a2 = n2.parse(t2[e51 + 1], e51 + 1);
      if (!a2) return null;
      r2.push([i3, a2]);
    }
    let i2 = n2.parse(t2[t2.length - 1], t2.length - 1, n2.expectedType, r2);
    return i2 ? new e15(r2, i2) : null;
  }
  outputDefined() {
    return this.result.outputDefined();
  }
};
var gi = class e16 {
  constructor(e51, t2) {
    this.type = t2.type, this.name = e51, this.boundExpression = t2;
  }
  static parse(t2, n2) {
    if (t2.length !== 2 || typeof t2[1] != `string`) return n2.error(`'var' expression requires exactly one string literal argument.`);
    let r2 = t2[1];
    return n2.scope.has(r2) ? new e16(r2, n2.scope.get(r2)) : n2.error(`Unknown variable "${r2}". Make sure "${r2}" has been bound in an enclosing "let" expression before using it.`, 1);
  }
  evaluate(e51) {
    return this.boundExpression.evaluate(e51);
  }
  eachChild() {
  }
  outputDefined() {
    return false;
  }
};
var _i = class e17 {
  constructor(e51, t2, n2, r2) {
    this.type = e51, this.index = t2, this.input = n2, this.key = r2;
  }
  static parse(t2, n2) {
    if (t2.length !== 3) return n2.error(`Expected 2 arguments, but found ${t2.length - 1} instead.`);
    let r2 = n2.parse(t2[1], 1, F), i2 = n2.parse(t2[2], 2, fr(n2.expectedType || R));
    if (!r2 || !i2) return null;
    let a2 = i2.type;
    return new e17(a2.itemType, r2, i2, n2.key);
  }
  evaluate(e51) {
    let t2 = this.index.evaluate(e51), n2 = this.input.evaluate(e51);
    if (t2 < 0) throw new V(`Array index out of bounds: ${t2} < 0.`, this.key);
    if (t2 >= n2.length) throw new V(`Array index out of bounds: ${t2} > ${n2.length - 1}.`, this.key);
    if (t2 !== Math.floor(t2)) throw new V(`Array index must be an integer, but found ${t2} instead.`, this.key);
    return n2[t2];
  }
  eachChild(e51) {
    e51(this.index), e51(this.input);
  }
  outputDefined() {
    return false;
  }
};
var vi = class e18 {
  constructor(e51, t2, n2) {
    this.needle = e51, this.haystack = t2, this.key = n2, this.type = L;
  }
  static parse(t2, n2) {
    if (t2.length !== 3) return n2.error(`Expected 2 arguments, but found ${t2.length - 1} instead.`);
    let r2 = n2.parse(t2[1], 1, R), i2 = n2.parse(t2[2], 2, R);
    return !r2 || !i2 ? null : hr(r2.type, [L, I, F, er, R]) ? new e18(r2, i2, n2.key) : n2.error(`Expected first argument to be of type boolean, string, number or null, but found ${z(r2.type)} instead`);
  }
  evaluate(e51) {
    let t2 = this.needle.evaluate(e51), n2 = this.haystack.evaluate(e51);
    if (!n2) return false;
    if (!gr(t2, [`boolean`, `string`, `number`, `null`])) throw new V(`Expected first argument to be of type boolean, string, number or null, but found ${z(ai(t2))} instead.`, this.key);
    if (!gr(n2, [`string`, `array`])) throw new V(`Expected second argument to be of type array or string, but found ${z(ai(n2))} instead.`, this.key);
    return n2.indexOf(t2) >= 0;
  }
  eachChild(e51) {
    e51(this.needle), e51(this.haystack);
  }
  outputDefined() {
    return true;
  }
};
var yi = class e19 {
  constructor(e51, t2, n2, r2) {
    this.needle = e51, this.haystack = t2, this.key = n2, this.fromIndex = r2, this.type = F;
  }
  static parse(t2, n2) {
    if (t2.length <= 2 || t2.length >= 5) return n2.error(`Expected 2 or 3 arguments, but found ${t2.length - 1} instead.`);
    let r2 = n2.parse(t2[1], 1, R), i2 = n2.parse(t2[2], 2, R);
    if (!r2 || !i2) return null;
    if (!hr(r2.type, [L, I, F, er, R])) return n2.error(`Expected first argument to be of type boolean, string, number or null, but found ${z(r2.type)} instead`);
    if (t2.length === 4) {
      let a2 = n2.parse(t2[3], 3, F);
      return a2 ? new e19(r2, i2, n2.key, a2) : null;
    }
    return new e19(r2, i2, n2.key);
  }
  evaluate(e51) {
    let t2 = this.needle.evaluate(e51), n2 = this.haystack.evaluate(e51);
    if (!gr(t2, [`boolean`, `string`, `number`, `null`])) throw new V(`Expected first argument to be of type boolean, string, number or null, but found ${z(ai(t2))} instead.`, this.key);
    let r2;
    if (this.fromIndex && (r2 = this.fromIndex.evaluate(e51)), gr(n2, [`string`])) {
      let e52 = n2.indexOf(t2, r2);
      return e52 === -1 ? -1 : [...n2.slice(0, e52)].length;
    }
    if (gr(n2, [`array`])) return n2.indexOf(t2, r2);
    throw new V(`Expected second argument to be of type array or string, but found ${z(ai(n2))} instead.`, this.key);
  }
  eachChild(e51) {
    e51(this.needle), e51(this.haystack), this.fromIndex && e51(this.fromIndex);
  }
  outputDefined() {
    return false;
  }
};
var bi = class e20 {
  constructor(e51, t2, n2, r2, i2, a2) {
    this.inputType = e51, this.type = t2, this.input = n2, this.cases = r2, this.outputs = i2, this.otherwise = a2;
  }
  static parse(t2, n2) {
    if (t2.length < 5) return n2.error(`Expected at least 4 arguments, but found only ${t2.length - 1}.`);
    if (t2.length % 2 != 1) return n2.error(`Expected an even number of arguments.`);
    let r2, i2;
    n2.expectedType && n2.expectedType.kind !== `value` && (i2 = n2.expectedType);
    let a2 = {}, o2 = [];
    for (let e51 = 2; e51 < t2.length - 1; e51 += 2) {
      let s3 = t2[e51], c3 = t2[e51 + 1];
      Array.isArray(s3) || (s3 = [s3]);
      let l2 = n2.concat(e51);
      if (s3.length === 0) return l2.error(`Expected at least one branch label.`);
      for (let e52 of s3) {
        if (typeof e52 != `number` && typeof e52 != `string`) return l2.error(`Branch labels must be numbers or strings.`);
        if (typeof e52 == `number` && Math.abs(e52) > 2 ** 53 - 1) return l2.error(`Branch labels must be integers no larger than ${2 ** 53 - 1}.`);
        if (typeof e52 == `number` && Math.floor(e52) !== e52) return l2.error(`Numeric branch labels must be integer values.`);
        if (!r2) r2 = ai(e52);
        else if (l2.checkSubtype(r2, ai(e52))) return null;
        if (a2[String(e52)] !== void 0) return l2.error(`Branch labels must be unique.`);
        a2[String(e52)] = o2.length;
      }
      let u2 = n2.parse(c3, e51, i2);
      if (!u2) return null;
      i2 ||= u2.type, o2.push(u2);
    }
    let s2 = n2.parse(t2[1], 1, R);
    if (!s2) return null;
    let c2 = n2.parse(t2[t2.length - 1], t2.length - 1, i2);
    return !c2 || s2.type.kind !== `value` && n2.concat(1).checkSubtype(r2, s2.type) ? null : new e20(r2, i2, s2, a2, o2, c2);
  }
  evaluate(e51) {
    let t2 = this.input.evaluate(e51);
    return (ai(t2) === this.inputType && this.outputs[this.cases[t2]] || this.otherwise).evaluate(e51);
  }
  eachChild(e51) {
    e51(this.input), this.outputs.forEach(e51), e51(this.otherwise);
  }
  outputDefined() {
    return this.outputs.every((e51) => e51.outputDefined()) && this.otherwise.outputDefined();
  }
};
var xi = class e21 {
  constructor(e51, t2, n2) {
    this.type = e51, this.branches = t2, this.otherwise = n2;
  }
  static parse(t2, n2) {
    if (t2.length < 4) return n2.error(`Expected at least 3 arguments, but found only ${t2.length - 1}.`);
    if (t2.length % 2 != 0) return n2.error(`Expected an odd number of arguments.`);
    let r2;
    n2.expectedType && n2.expectedType.kind !== `value` && (r2 = n2.expectedType);
    let i2 = [];
    for (let e51 = 1; e51 < t2.length - 1; e51 += 2) {
      let a3 = n2.parse(t2[e51], e51, L);
      if (!a3) return null;
      let o2 = n2.parse(t2[e51 + 1], e51 + 1, r2);
      if (!o2) return null;
      i2.push([a3, o2]), r2 ||= o2.type;
    }
    let a2 = n2.parse(t2[t2.length - 1], t2.length - 1, r2);
    if (!a2) return null;
    if (!r2) throw Error(`Can't infer output type`);
    return new e21(r2, i2, a2);
  }
  evaluate(e51) {
    for (let [t2, n2] of this.branches) if (t2.evaluate(e51)) return n2.evaluate(e51);
    return this.otherwise.evaluate(e51);
  }
  eachChild(e51) {
    for (let [t2, n2] of this.branches) e51(t2), e51(n2);
    e51(this.otherwise);
  }
  outputDefined() {
    return this.branches.every(([e51, t2]) => t2.outputDefined()) && this.otherwise.outputDefined();
  }
};
var Si = class e22 {
  constructor(e51, t2, n2, r2, i2) {
    this.type = e51, this.input = t2, this.beginIndex = n2, this.key = r2, this.endIndex = i2;
  }
  static parse(t2, n2) {
    if (t2.length <= 2 || t2.length >= 5) return n2.error(`Expected 2 or 3 arguments, but found ${t2.length - 1} instead.`);
    let r2 = n2.parse(t2[1], 1, R), i2 = n2.parse(t2[2], 2, F);
    if (!r2 || !i2) return null;
    if (!hr(r2.type, [fr(R), I, R])) return n2.error(`Expected first argument to be of type array or string, but found ${z(r2.type)} instead`);
    if (t2.length === 4) {
      let a2 = n2.parse(t2[3], 3, F);
      return a2 ? new e22(r2.type, r2, i2, n2.key, a2) : null;
    }
    return new e22(r2.type, r2, i2, n2.key);
  }
  evaluate(e51) {
    let t2 = this.input.evaluate(e51), n2 = this.beginIndex.evaluate(e51), r2;
    if (this.endIndex && (r2 = this.endIndex.evaluate(e51)), gr(t2, [`string`])) return [...t2].slice(n2, r2).join(``);
    if (gr(t2, [`array`])) return t2.slice(n2, r2);
    throw new V(`Expected first argument to be of type array or string, but found ${z(ai(t2))} instead.`, this.key);
  }
  eachChild(e51) {
    e51(this.input), e51(this.beginIndex), this.endIndex && e51(this.endIndex);
  }
  outputDefined() {
    return false;
  }
};
function Ci(e51, t2, n2) {
  let r2 = e51.length - 1, i2 = 0, a2 = r2, o2 = 0, s2, c2;
  for (; i2 <= a2; ) if (o2 = Math.floor((i2 + a2) / 2), s2 = e51[o2], c2 = e51[o2 + 1], s2 <= t2) {
    if (o2 === r2 || t2 < c2) return o2;
    i2 = o2 + 1;
  } else if (s2 > t2) a2 = o2 - 1;
  else throw new V(`Input is not a number.`, n2);
  return 0;
}
var wi = class e23 {
  constructor(e51, t2, n2, r2) {
    this.type = e51, this.input = t2, this.key = r2, this.labels = [], this.outputs = [];
    for (let [e52, t3] of n2) this.labels.push(e52), this.outputs.push(t3);
  }
  static parse(t2, n2) {
    if (t2.length - 1 < 4) return n2.error(`Expected at least 4 arguments, but found only ${t2.length - 1}.`);
    if ((t2.length - 1) % 2 != 0) return n2.error(`Expected an even number of arguments.`);
    let r2 = n2.parse(t2[1], 1, F);
    if (!r2) return null;
    let i2 = [], a2 = null;
    n2.expectedType && n2.expectedType.kind !== `value` && (a2 = n2.expectedType);
    for (let e51 = 1; e51 < t2.length; e51 += 2) {
      let r3 = e51 === 1 ? -1 / 0 : t2[e51], o2 = t2[e51 + 1], s2 = e51, c2 = e51 + 1;
      if (typeof r3 != `number`) return n2.error(`Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.`, s2);
      if (i2.length && i2[i2.length - 1][0] >= r3) return n2.error(`Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.`, s2);
      let l2 = n2.parse(o2, c2, a2);
      if (!l2) return null;
      a2 ||= l2.type, i2.push([r3, l2]);
    }
    return new e23(a2, r2, i2, n2.key);
  }
  evaluate(e51) {
    let t2 = this.labels, n2 = this.outputs;
    if (t2.length === 1) return n2[0].evaluate(e51);
    let r2 = this.input.evaluate(e51);
    if (r2 <= t2[0]) return n2[0].evaluate(e51);
    let i2 = t2.length;
    return r2 >= t2[i2 - 1] ? n2[i2 - 1].evaluate(e51) : n2[Ci(t2, r2, this.key)].evaluate(e51);
  }
  eachChild(e51) {
    e51(this.input);
    for (let t2 of this.outputs) e51(t2);
  }
  outputDefined() {
    return this.outputs.every((e51) => e51.outputDefined());
  }
};
function Ti(e51, t2, n2, r2) {
  let i2 = 3 * e51, a2 = 3 * (n2 - e51) - i2, o2 = 1 - i2 - a2, s2 = 3 * t2, c2 = 3 * (r2 - t2) - s2, l2 = 1 - s2 - c2;
  return function(e52, t3 = 1e-6) {
    if (e52 <= 0) return 0;
    if (e52 >= 1) return 1;
    let n3 = e52;
    for (let r4 = 0; r4 < 8; r4++) {
      let r5 = ((o2 * n3 + a2) * n3 + i2) * n3 - e52;
      if (Math.abs(r5) < t3) return ((l2 * n3 + c2) * n3 + s2) * n3;
      let u3 = (3 * o2 * n3 + 2 * a2) * n3 + i2;
      if (Math.abs(u3) < 1e-6) break;
      n3 -= r5 / u3;
    }
    let r3 = 0, u2 = 1;
    n3 = e52;
    for (let s3 = 0; s3 < 20; s3++) {
      let s4 = ((o2 * n3 + a2) * n3 + i2) * n3;
      if (Math.abs(s4 - e52) < t3) break;
      e52 > s4 ? r3 = n3 : u2 = n3, n3 = (r3 + u2) * 0.5;
    }
    return ((l2 * n3 + c2) * n3 + s2) * n3;
  };
}
var Ei = class e24 {
  constructor(e51, t2, n2, r2, i2, a2) {
    this.type = e51, this.operator = t2, this.interpolation = n2, this.input = r2, this.key = a2, this.labels = [], this.outputs = [];
    for (let [e52, t3] of i2) this.labels.push(e52), this.outputs.push(t3);
  }
  static interpolationFactor(e51, t2, n2, r2) {
    let i2 = 0;
    if (e51.name === `exponential`) i2 = Di(t2, e51.base, n2, r2);
    else if (e51.name === `linear`) i2 = Di(t2, 1, n2, r2);
    else if (e51.name === `cubic-bezier`) {
      let a2 = e51.controlPoints;
      i2 = Ti(a2[0], a2[1], a2[2], a2[3])(Di(t2, 1, n2, r2));
    }
    return i2;
  }
  static parse(t2, n2) {
    let [r2, i2, a2, ...o2] = t2;
    if (!Array.isArray(i2) || i2.length === 0) return n2.error(`Expected an interpolation type expression.`, 1);
    if (i2[0] === `linear`) i2 = { name: `linear` };
    else if (i2[0] === `exponential`) {
      let e51 = i2[1];
      if (typeof e51 != `number`) return n2.error(`Exponential interpolation requires a numeric base.`, 1, 1);
      i2 = { name: `exponential`, base: e51 };
    } else if (i2[0] === `cubic-bezier`) {
      let e51 = i2.slice(1);
      if (e51.length !== 4 || e51.some((e52) => typeof e52 != `number` || e52 < 0 || e52 > 1)) return n2.error(`Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.`, 1);
      i2 = { name: `cubic-bezier`, controlPoints: e51 };
    } else return n2.error(`Unknown interpolation type ${String(i2[0])}`, 1, 0);
    if (t2.length - 1 < 4) return n2.error(`Expected at least 4 arguments, but found only ${t2.length - 1}.`);
    if ((t2.length - 1) % 2 != 0) return n2.error(`Expected an even number of arguments.`);
    if (a2 = n2.parse(a2, 2, F), !a2) return null;
    let s2 = [], c2 = null;
    (r2 === `interpolate-hcl` || r2 === `interpolate-lab`) && n2.expectedType != cr ? c2 = tr : n2.expectedType && n2.expectedType.kind !== `value` && (c2 = n2.expectedType);
    for (let e51 = 0; e51 < o2.length; e51 += 2) {
      let t3 = o2[e51], r3 = o2[e51 + 1], i3 = e51 + 3, a3 = e51 + 4;
      if (typeof t3 != `number`) return n2.error(`Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.`, i3);
      if (s2.length && s2[s2.length - 1][0] >= t3) return n2.error(`Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.`, i3);
      let l2 = n2.parse(r3, a3, c2);
      if (!l2) return null;
      c2 ||= l2.type, s2.push([t3, l2]);
    }
    return !_r(c2, F) && !_r(c2, nr) && !_r(c2, tr) && !_r(c2, sr) && !_r(c2, lr) && !_r(c2, cr) && !_r(c2, dr) && !_r(c2, fr(F)) ? n2.error(`Type ${z(c2)} is not interpolatable.`) : new e24(c2, r2, i2, a2, s2, n2.key);
  }
  evaluate(t2) {
    let n2 = this.labels, r2 = this.outputs;
    if (n2.length === 1) return r2[0].evaluate(t2);
    let i2 = this.input.evaluate(t2);
    if (i2 <= n2[0]) return r2[0].evaluate(t2);
    let a2 = n2.length;
    if (i2 >= n2[a2 - 1]) return r2[a2 - 1].evaluate(t2);
    let o2 = Ci(n2, i2, this.key), s2 = n2[o2], c2 = n2[o2 + 1], l2 = e24.interpolationFactor(this.interpolation, i2, s2, c2), u2 = r2[o2].evaluate(t2), d2 = r2[o2 + 1].evaluate(t2);
    switch (this.operator) {
      case `interpolate`:
        switch (this.type.kind) {
          case `number`:
            return Ur(u2, d2, l2);
          case `color`:
            return B.interpolate(u2, d2, l2);
          case `padding`:
            return Xr.interpolate(u2, d2, l2);
          case `colorArray`:
            return Qr.interpolate(u2, d2, l2);
          case `numberArray`:
            return Zr.interpolate(u2, d2, l2);
          case `variableAnchorOffsetCollection`:
            return ei.interpolate(u2, d2, l2, this.key);
          case `array`:
            return Wr(u2, d2, l2);
          case `projectionDefinition`:
            return ni.interpolate(u2, d2, l2);
        }
      case `interpolate-hcl`:
        switch (this.type.kind) {
          case `color`:
            return B.interpolate(u2, d2, l2, `hcl`);
          case `colorArray`:
            return Qr.interpolate(u2, d2, l2, `hcl`);
        }
      case `interpolate-lab`:
        switch (this.type.kind) {
          case `color`:
            return B.interpolate(u2, d2, l2, `lab`);
          case `colorArray`:
            return Qr.interpolate(u2, d2, l2, `lab`);
        }
    }
  }
  eachChild(e51) {
    e51(this.input);
    for (let t2 of this.outputs) e51(t2);
  }
  outputDefined() {
    return this.outputs.every((e51) => e51.outputDefined());
  }
};
function Di(e51, t2, n2, r2) {
  let i2 = r2 - n2, a2 = e51 - n2;
  return i2 === 0 ? 0 : t2 === 1 ? a2 / i2 : (t2 ** +a2 - 1) / (t2 ** +i2 - 1);
}
var Oi = { color: B.interpolate, number: Ur, padding: Xr.interpolate, numberArray: Zr.interpolate, colorArray: Qr.interpolate, variableAnchorOffsetCollection: ei.interpolate, array: Wr };
var ki = class e25 {
  constructor(e51, t2) {
    this.type = e51, this.args = t2;
  }
  static parse(t2, n2) {
    if (t2.length < 2) return n2.error(`Expected at least one argument.`);
    let r2 = null, i2 = n2.expectedType;
    i2 && i2.kind !== `value` && (r2 = i2);
    let a2 = [];
    for (let e51 of t2.slice(1)) {
      let t3 = n2.parse(e51, 1 + a2.length, r2, void 0, { typeAnnotation: `omit` });
      if (!t3) return null;
      r2 ||= t3.type, a2.push(t3);
    }
    if (!r2) throw Error(`No output type`);
    return i2 && a2.some((e51) => mr(i2, e51.type)) ? new e25(R, a2) : new e25(r2, a2);
  }
  evaluate(e51) {
    let t2 = null, n2 = 0, r2;
    for (let i2 of this.args) if (n2++, t2 = i2.evaluate(e51), t2 && t2 instanceof ti && !t2.available && (r2 ||= t2.name, t2 = null, n2 === this.args.length && (t2 = r2)), t2 !== null) break;
    return t2;
  }
  eachChild(e51) {
    this.args.forEach(e51);
  }
  outputDefined() {
    return this.args.every((e51) => e51.outputDefined());
  }
};
function Ai(e51, t2) {
  return e51 === `==` || e51 === `!=` ? t2.kind === `boolean` || t2.kind === `string` || t2.kind === `number` || t2.kind === `null` || t2.kind === `value` : t2.kind === `string` || t2.kind === `number` || t2.kind === `value`;
}
function ji(e51, t2, n2) {
  return t2 === n2;
}
function Mi(e51, t2, n2) {
  return t2 !== n2;
}
function Ni(e51, t2, n2) {
  return t2 < n2;
}
function Pi(e51, t2, n2) {
  return t2 > n2;
}
function Fi(e51, t2, n2) {
  return t2 <= n2;
}
function Ii(e51, t2, n2) {
  return t2 >= n2;
}
function Li(e51, t2, n2, r2) {
  return r2.compare(t2, n2) === 0;
}
function Ri(e51, t2, n2, r2) {
  return !Li(e51, t2, n2, r2);
}
function zi(e51, t2, n2, r2) {
  return r2.compare(t2, n2) < 0;
}
function Bi(e51, t2, n2, r2) {
  return r2.compare(t2, n2) > 0;
}
function Vi(e51, t2, n2, r2) {
  return r2.compare(t2, n2) <= 0;
}
function Hi(e51, t2, n2, r2) {
  return r2.compare(t2, n2) >= 0;
}
function Ui(e51, t2, n2) {
  let r2 = e51 !== `==` && e51 !== `!=`;
  return class i2 {
    constructor(e52, t3, n3, r3) {
      this.lhs = e52, this.rhs = t3, this.key = n3, this.collator = r3, this.type = L, this.hasUntypedArgument = e52.type.kind === `value` || t3.type.kind === `value`;
    }
    static parse(e52, t3) {
      if (e52.length !== 3 && e52.length !== 4) return t3.error(`Expected two or three arguments.`);
      let n3 = e52[0], a2 = t3.parse(e52[1], 1, R);
      if (!a2) return null;
      if (!Ai(n3, a2.type)) return t3.concat(1).error(`"${n3}" comparisons are not supported for type '${z(a2.type)}'.`);
      let o2 = t3.parse(e52[2], 2, R);
      if (!o2) return null;
      if (!Ai(n3, o2.type)) return t3.concat(2).error(`"${n3}" comparisons are not supported for type '${z(o2.type)}'.`);
      if (a2.type.kind !== o2.type.kind && a2.type.kind !== `value` && o2.type.kind !== `value`) return t3.error(`Cannot compare types '${z(a2.type)}' and '${z(o2.type)}'.`);
      r2 && (a2.type.kind === `value` && o2.type.kind !== `value` ? a2 = new li(o2.type, [a2], t3.key) : a2.type.kind !== `value` && o2.type.kind === `value` && (o2 = new li(a2.type, [o2], t3.key)));
      let s2 = null;
      if (e52.length === 4) {
        if (a2.type.kind !== `string` && o2.type.kind !== `string` && a2.type.kind !== `value` && o2.type.kind !== `value`) return t3.error(`Cannot use collator to compare non-string types.`);
        if (s2 = t3.parse(e52[3], 3, ar), !s2) return null;
      }
      return new i2(a2, o2, t3.key, s2);
    }
    evaluate(i3) {
      let a2 = this.lhs.evaluate(i3), o2 = this.rhs.evaluate(i3);
      if (r2 && this.hasUntypedArgument) {
        let t3 = ai(a2), n3 = ai(o2);
        if (t3.kind !== n3.kind || t3.kind !== `string` && t3.kind !== `number`) throw new V(`Expected arguments for "${e51}" to be (string, string) or (number, number), but found (${t3.kind}, ${n3.kind}) instead.`, this.key);
      }
      if (this.collator && !r2 && this.hasUntypedArgument) {
        let e52 = ai(a2), n3 = ai(o2);
        if (e52.kind !== `string` || n3.kind !== `string`) return t2(i3, a2, o2);
      }
      return this.collator ? n2(i3, a2, o2, this.collator.evaluate(i3)) : t2(i3, a2, o2);
    }
    eachChild(e52) {
      e52(this.lhs), e52(this.rhs), this.collator && e52(this.collator);
    }
    outputDefined() {
      return true;
    }
  };
}
var Wi = Ui(`==`, ji, Li);
var Gi = Ui(`!=`, Mi, Ri);
var Ki = Ui(`<`, Ni, zi);
var qi = Ui(`>`, Pi, Bi);
var Ji = Ui(`<=`, Fi, Vi);
var Yi = Ui(`>=`, Ii, Hi);
var Xi = class e26 {
  constructor(e51, t2, n2) {
    this.type = ar, this.locale = n2, this.caseSensitive = e51, this.diacriticSensitive = t2;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`Expected one argument.`);
    let r2 = t2[1];
    if (typeof r2 != `object` || Array.isArray(r2)) return n2.error(`Collator options argument must be an object.`);
    let i2 = n2.parse(r2[`case-sensitive`] !== void 0 && r2[`case-sensitive`], 1, L);
    if (!i2) return null;
    let a2 = n2.parse(r2[`diacritic-sensitive`] !== void 0 && r2[`diacritic-sensitive`], 1, L);
    if (!a2) return null;
    let o2 = null;
    return r2.locale && (o2 = n2.parse(r2.locale, 1, I), !o2) ? null : new e26(i2, a2, o2);
  }
  evaluate(e51) {
    return new Kr(this.caseSensitive.evaluate(e51), this.diacriticSensitive.evaluate(e51), this.locale ? this.locale.evaluate(e51) : null);
  }
  eachChild(e51) {
    e51(this.caseSensitive), e51(this.diacriticSensitive), this.locale && e51(this.locale);
  }
  outputDefined() {
    return false;
  }
};
var Zi = class e27 {
  constructor(e51, t2, n2, r2, i2, a2) {
    this.type = I, this.number = e51, this.locale = t2, this.currency = n2, this.unit = r2, this.minFractionDigits = i2, this.maxFractionDigits = a2;
  }
  static parse(t2, n2) {
    if (t2.length !== 3) return n2.error(`Expected two arguments.`);
    let r2 = n2.parse(t2[1], 1, F);
    if (!r2) return null;
    let i2 = t2[2];
    if (typeof i2 != `object` || Array.isArray(i2)) return n2.error(`NumberFormat options argument must be an object.`);
    let a2 = null;
    if (i2.locale && (a2 = n2.parse(i2.locale, 1, I), !a2)) return null;
    let o2 = null;
    if (i2.currency && (o2 = n2.parse(i2.currency, 1, I), !o2)) return null;
    let s2 = null;
    if (i2.unit && (s2 = n2.parse(i2.unit, 1, I), !s2)) return null;
    if (o2 && s2) return n2.error("NumberFormat options `currency` and `unit` are mutually exclusive");
    let c2 = null;
    if (i2[`min-fraction-digits`] && (c2 = n2.parse(i2[`min-fraction-digits`], 1, F), !c2)) return null;
    let l2 = null;
    return i2[`max-fraction-digits`] && (l2 = n2.parse(i2[`max-fraction-digits`], 1, F), !l2) ? null : new e27(r2, a2, o2, s2, c2, l2);
  }
  evaluate(e51) {
    return new Intl.NumberFormat(this.locale ? this.locale.evaluate(e51) : [], { style: this.currency ? `currency` : this.unit ? `unit` : `decimal`, currency: this.currency ? this.currency.evaluate(e51) : void 0, unit: this.unit ? this.unit.evaluate(e51) : void 0, minimumFractionDigits: this.minFractionDigits ? this.minFractionDigits.evaluate(e51) : void 0, maximumFractionDigits: this.maxFractionDigits ? this.maxFractionDigits.evaluate(e51) : void 0 }).format(this.number.evaluate(e51));
  }
  eachChild(e51) {
    e51(this.number), this.locale && e51(this.locale), this.currency && e51(this.currency), this.unit && e51(this.unit), this.minFractionDigits && e51(this.minFractionDigits), this.maxFractionDigits && e51(this.maxFractionDigits);
  }
  outputDefined() {
    return false;
  }
};
var Qi = class e28 {
  constructor(e51) {
    this.type = or, this.sections = e51;
  }
  static parse(t2, n2) {
    if (t2.length < 2) return n2.error(`Expected at least one argument.`);
    let r2 = t2[1];
    if (!Array.isArray(r2) && typeof r2 == `object`) return n2.error(`First argument must be an image or text section.`);
    let i2 = [], a2 = false;
    for (let e51 = 1; e51 <= t2.length - 1; ++e51) {
      let r3 = t2[e51];
      if (a2 && typeof r3 == `object` && !Array.isArray(r3)) {
        a2 = false;
        let e52 = null;
        if (r3[`font-scale`] && (e52 = n2.parse(r3[`font-scale`], 1, F), !e52)) return null;
        let t3 = null;
        if (r3[`text-font`] && (t3 = n2.parse(r3[`text-font`], 1, fr(I)), !t3)) return null;
        let o2 = null;
        if (r3[`text-color`] && (o2 = n2.parse(r3[`text-color`], 1, tr), !o2)) return null;
        let s2 = null;
        if (r3[`vertical-align`]) {
          if (typeof r3[`vertical-align`] == `string` && !qr.includes(r3[`vertical-align`])) return n2.error(`'vertical-align' must be one of: 'bottom', 'center', 'top' but found '${r3[`vertical-align`]}' instead.`);
          if (s2 = n2.parse(r3[`vertical-align`], 1, I), !s2) return null;
        }
        let c2 = i2[i2.length - 1];
        c2.scale = e52, c2.font = t3, c2.textColor = o2, c2.verticalAlign = s2;
      } else {
        let r4 = n2.parse(t2[e51], 1, R);
        if (!r4) return null;
        let o2 = r4.type.kind;
        if (o2 !== `string` && o2 !== `value` && o2 !== `null` && o2 !== `resolvedImage`) return n2.error(`Formatted text type must be 'string', 'value', 'image' or 'null'.`);
        a2 = true, i2.push({ content: r4, scale: null, font: null, textColor: null, verticalAlign: null });
      }
    }
    return new e28(i2);
  }
  evaluate(e51) {
    return new Yr(this.sections.map((t2) => {
      let n2 = t2.content.evaluate(e51);
      return ai(n2) === ur ? new Jr(``, n2, null, null, null, t2.verticalAlign ? t2.verticalAlign.evaluate(e51) : null) : new Jr(oi(n2), null, t2.scale ? t2.scale.evaluate(e51) : null, t2.font ? t2.font.evaluate(e51).join(`,`) : null, t2.textColor ? t2.textColor.evaluate(e51) : null, t2.verticalAlign ? t2.verticalAlign.evaluate(e51) : null);
    }));
  }
  eachChild(e51) {
    for (let t2 of this.sections) e51(t2.content), t2.scale && e51(t2.scale), t2.font && e51(t2.font), t2.textColor && e51(t2.textColor), t2.verticalAlign && e51(t2.verticalAlign);
  }
  outputDefined() {
    return false;
  }
};
var $i = class e29 {
  constructor(e51) {
    this.type = ur, this.input = e51;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`Expected two arguments.`);
    let r2 = n2.parse(t2[1], 1, I);
    return r2 ? new e29(r2) : n2.error(`No image name provided.`);
  }
  evaluate(e51) {
    let t2 = this.input.evaluate(e51), n2 = ti.fromString(t2);
    return n2 && e51.availableImages && (n2.available = e51.availableImages.indexOf(t2) > -1), n2;
  }
  eachChild(e51) {
    e51(this.input);
  }
  outputDefined() {
    return false;
  }
};
var ea = class e30 {
  constructor(e51, t2) {
    this.input = e51, this.key = t2, this.type = F;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`Expected 1 argument, but found ${t2.length - 1} instead.`);
    let r2 = n2.parse(t2[1], 1);
    return r2 ? r2.type.kind !== `array` && r2.type.kind !== `string` && r2.type.kind !== `value` ? n2.error(`Expected argument of type string or array, but found ${z(r2.type)} instead.`) : new e30(r2, n2.key) : null;
  }
  evaluate(e51) {
    let t2 = this.input.evaluate(e51);
    if (typeof t2 == `string`) return [...t2].length;
    if (Array.isArray(t2)) return t2.length;
    throw new V(`Expected value to be of type string or array, but found ${z(ai(t2))} instead.`, this.key);
  }
  eachChild(e51) {
    e51(this.input);
  }
  outputDefined() {
    return false;
  }
};
var ta = 8192;
function na(e51, t2) {
  let n2 = ia(e51[0]), r2 = oa(e51[1]), i2 = 2 ** t2.z;
  return [Math.round(n2 * i2 * ta), Math.round(r2 * i2 * ta)];
}
function ra(e51, t2) {
  let n2 = 2 ** t2.z, r2 = (e51[0] / ta + t2.x) / n2, i2 = (e51[1] / ta + t2.y) / n2;
  return [aa(r2), sa(i2)];
}
function ia(e51) {
  return (180 + e51) / 360;
}
function aa(e51) {
  return e51 * 360 - 180;
}
function oa(e51) {
  return (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + e51 * Math.PI / 360))) / 360;
}
function sa(e51) {
  return 360 / Math.PI * Math.atan(Math.exp((180 - e51 * 360) * Math.PI / 180)) - 90;
}
function ca(e51, t2) {
  e51[0] = Math.min(e51[0], t2[0]), e51[1] = Math.min(e51[1], t2[1]), e51[2] = Math.max(e51[2], t2[0]), e51[3] = Math.max(e51[3], t2[1]);
}
function la(e51, t2) {
  return !(e51[0] <= t2[0] || e51[2] >= t2[2] || e51[1] <= t2[1] || e51[3] >= t2[3]);
}
function ua(e51, t2, n2) {
  return t2[1] > e51[1] != n2[1] > e51[1] && e51[0] < (n2[0] - t2[0]) * (e51[1] - t2[1]) / (n2[1] - t2[1]) + t2[0];
}
function da(e51, t2, n2) {
  let r2 = e51[0] - t2[0], i2 = e51[1] - t2[1], a2 = e51[0] - n2[0], o2 = e51[1] - n2[1];
  return r2 * o2 - a2 * i2 === 0 && r2 * a2 <= 0 && i2 * o2 <= 0;
}
function fa(e51, t2, n2, r2) {
  let i2 = [t2[0] - e51[0], t2[1] - e51[1]];
  return va([r2[0] - n2[0], r2[1] - n2[1]], i2) !== 0 && !!(ya(e51, t2, n2, r2) && ya(n2, r2, e51, t2));
}
function pa(e51, t2, n2) {
  for (let r2 of n2) for (let n3 = 0; n3 < r2.length - 1; ++n3) if (fa(e51, t2, r2[n3], r2[n3 + 1])) return true;
  return false;
}
function ma(e51, t2, n2 = false) {
  let r2 = false;
  for (let i2 of t2) for (let t3 = 0; t3 < i2.length - 1; t3++) {
    if (da(e51, i2[t3], i2[t3 + 1])) return n2;
    ua(e51, i2[t3], i2[t3 + 1]) && (r2 = !r2);
  }
  return r2;
}
function ha(e51, t2) {
  for (let n2 of t2) if (ma(e51, n2)) return true;
  return false;
}
function ga(e51, t2) {
  for (let n2 of e51) if (!ma(n2, t2)) return false;
  for (let n2 = 0; n2 < e51.length - 1; ++n2) if (pa(e51[n2], e51[n2 + 1], t2)) return false;
  return true;
}
function _a(e51, t2) {
  for (let n2 of t2) if (ga(e51, n2)) return true;
  return false;
}
function va(e51, t2) {
  return e51[0] * t2[1] - e51[1] * t2[0];
}
function ya(e51, t2, n2, r2) {
  let i2 = e51[0] - n2[0], a2 = e51[1] - n2[1], o2 = t2[0] - n2[0], s2 = t2[1] - n2[1], c2 = r2[0] - n2[0], l2 = r2[1] - n2[1], u2 = i2 * l2 - c2 * a2, d2 = o2 * l2 - c2 * s2;
  return u2 > 0 && d2 < 0 || u2 < 0 && d2 > 0;
}
function ba(e51, t2, n2) {
  let r2 = [];
  for (let i2 = 0; i2 < e51.length; i2++) {
    let a2 = [];
    for (let r3 = 0; r3 < e51[i2].length; r3++) {
      let o2 = na(e51[i2][r3], n2);
      ca(t2, o2), a2.push(o2);
    }
    r2.push(a2);
  }
  return r2;
}
function xa(e51, t2, n2) {
  let r2 = [];
  for (let i2 = 0; i2 < e51.length; i2++) {
    let a2 = ba(e51[i2], t2, n2);
    r2.push(a2);
  }
  return r2;
}
function Sa(e51, t2, n2, r2) {
  if (e51[0] < n2[0] || e51[0] > n2[2]) {
    let t3 = r2 * 0.5, i2 = e51[0] - n2[0] > t3 ? -r2 : n2[0] - e51[0] > t3 ? r2 : 0;
    i2 === 0 && (i2 = e51[0] - n2[2] > t3 ? -r2 : n2[2] - e51[0] > t3 ? r2 : 0), e51[0] += i2;
  }
  ca(t2, e51);
}
function Ca(e51) {
  e51[0] = e51[1] = 1 / 0, e51[2] = e51[3] = -1 / 0;
}
function wa(e51, t2, n2, r2) {
  let i2 = 2 ** r2.z * ta, a2 = [r2.x * ta, r2.y * ta], o2 = [];
  for (let r3 of e51) for (let e52 of r3) {
    let r4 = [e52.x + a2[0], e52.y + a2[1]];
    Sa(r4, t2, n2, i2), o2.push(r4);
  }
  return o2;
}
function Ta(e51, t2, n2, r2) {
  let i2 = 2 ** r2.z * ta, a2 = [r2.x * ta, r2.y * ta], o2 = [];
  for (let n3 of e51) {
    let e52 = [];
    for (let r3 of n3) {
      let n4 = [r3.x + a2[0], r3.y + a2[1]];
      ca(t2, n4), e52.push(n4);
    }
    o2.push(e52);
  }
  if (t2[2] - t2[0] <= i2 / 2) {
    Ca(t2);
    for (let e52 of o2) for (let r3 of e52) Sa(r3, t2, n2, i2);
  }
  return o2;
}
function Ea(e51, t2) {
  let n2 = [1 / 0, 1 / 0, -1 / 0, -1 / 0], r2 = [1 / 0, 1 / 0, -1 / 0, -1 / 0], i2 = e51.canonicalID();
  if (t2.type === `Polygon`) {
    let a2 = ba(t2.coordinates, r2, i2), o2 = wa(e51.geometry(), n2, r2, i2);
    if (!la(n2, r2)) return false;
    for (let e52 of o2) if (!ma(e52, a2)) return false;
  }
  if (t2.type === `MultiPolygon`) {
    let a2 = xa(t2.coordinates, r2, i2), o2 = wa(e51.geometry(), n2, r2, i2);
    if (!la(n2, r2)) return false;
    for (let e52 of o2) if (!ha(e52, a2)) return false;
  }
  return true;
}
function Da(e51, t2) {
  let n2 = [1 / 0, 1 / 0, -1 / 0, -1 / 0], r2 = [1 / 0, 1 / 0, -1 / 0, -1 / 0], i2 = e51.canonicalID();
  if (t2.type === `Polygon`) {
    let a2 = ba(t2.coordinates, r2, i2), o2 = Ta(e51.geometry(), n2, r2, i2);
    if (!la(n2, r2)) return false;
    for (let e52 of o2) if (!ga(e52, a2)) return false;
  }
  if (t2.type === `MultiPolygon`) {
    let a2 = xa(t2.coordinates, r2, i2), o2 = Ta(e51.geometry(), n2, r2, i2);
    if (!la(n2, r2)) return false;
    for (let e52 of o2) if (!_a(e52, a2)) return false;
  }
  return true;
}
var Oa = class e31 {
  constructor(e51, t2) {
    this.type = L, this.geojson = e51, this.geometries = t2;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`'within' expression requires exactly one argument, but found ${t2.length - 1} instead.`);
    if (ii(t2[1])) {
      let n3 = t2[1];
      if (n3.type === `FeatureCollection`) {
        let t3 = [];
        for (let e51 of n3.features) {
          let { type: n4, coordinates: r2 } = e51.geometry;
          n4 === `Polygon` && t3.push(r2), n4 === `MultiPolygon` && t3.push(...r2);
        }
        if (t3.length) return new e31(n3, { type: `MultiPolygon`, coordinates: t3 });
      } else if (n3.type === `Feature`) {
        let t3 = n3.geometry.type;
        if (t3 === `Polygon` || t3 === `MultiPolygon`) return new e31(n3, n3.geometry);
      } else if (n3.type === `Polygon` || n3.type === `MultiPolygon`) return new e31(n3, n3);
    }
    return n2.error(`'within' expression requires valid geojson object that contains polygon geometry type.`);
  }
  evaluate(e51) {
    if (e51.geometry() != null && e51.canonicalID() != null) {
      if (e51.geometryType() === `Point`) return Ea(e51, this.geometries);
      if (e51.geometryType() === `LineString`) return Da(e51, this.geometries);
    }
    return false;
  }
  eachChild() {
  }
  outputDefined() {
    return true;
  }
};
var ka = class {
  constructor(e51 = [], t2 = (e52, t3) => e52 < t3 ? -1 : +(e52 > t3)) {
    if (this.data = e51, this.length = this.data.length, this.compare = t2, this.length > 0) for (let e52 = (this.length >> 1) - 1; e52 >= 0; e52--) this._down(e52);
  }
  push(e51) {
    this.data.push(e51), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    let e51 = this.data[0], t2 = this.data.pop();
    return --this.length > 0 && (this.data[0] = t2, this._down(0)), e51;
  }
  peek() {
    return this.data[0];
  }
  _up(e51) {
    let { data: t2, compare: n2 } = this, r2 = t2[e51];
    for (; e51 > 0; ) {
      let i2 = e51 - 1 >> 1, a2 = t2[i2];
      if (n2(r2, a2) >= 0) break;
      t2[e51] = a2, e51 = i2;
    }
    t2[e51] = r2;
  }
  _down(e51) {
    let { data: t2, compare: n2 } = this, r2 = this.length >> 1, i2 = t2[e51];
    for (; e51 < r2; ) {
      let r3 = (e51 << 1) + 1, a2 = r3 + 1;
      if (a2 < this.length && n2(t2[a2], t2[r3]) < 0 && (r3 = a2), n2(t2[r3], i2) >= 0) break;
      t2[e51] = t2[r3], e51 = r3;
    }
    t2[e51] = i2;
  }
};
function Aa(e51, t2, n2 = 0, r2 = e51.length - 1, i2 = Ma) {
  for (; r2 > n2; ) {
    if (r2 - n2 > 600) {
      let a3 = r2 - n2 + 1, o3 = t2 - n2 + 1, s3 = Math.log(a3), c2 = 0.5 * Math.exp(2 * s3 / 3), l2 = 0.5 * Math.sqrt(s3 * c2 * (a3 - c2) / a3) * (o3 - a3 / 2 < 0 ? -1 : 1);
      Aa(e51, t2, Math.max(n2, Math.floor(t2 - o3 * c2 / a3 + l2)), Math.min(r2, Math.floor(t2 + (a3 - o3) * c2 / a3 + l2)), i2);
    }
    let a2 = e51[t2], o2 = n2, s2 = r2;
    for (ja(e51, n2, t2), i2(e51[r2], a2) > 0 && ja(e51, n2, r2); o2 < s2; ) {
      for (ja(e51, o2, s2), o2++, s2--; i2(e51[o2], a2) < 0; ) o2++;
      for (; i2(e51[s2], a2) > 0; ) s2--;
    }
    i2(e51[n2], a2) === 0 ? ja(e51, n2, s2) : (s2++, ja(e51, s2, r2)), s2 <= t2 && (n2 = s2 + 1), t2 <= s2 && (r2 = s2 - 1);
  }
}
function ja(e51, t2, n2) {
  let r2 = e51[t2];
  e51[t2] = e51[n2], e51[n2] = r2;
}
function Ma(e51, t2) {
  return e51 < t2 ? -1 : +(e51 > t2);
}
function Na(e51, t2) {
  if (e51.length <= 1) return [e51];
  let n2 = [], r2, i2;
  for (let t3 of e51) {
    let e52 = Fa(t3);
    e52 !== 0 && (t3.area = Math.abs(e52), i2 === void 0 && (i2 = e52 < 0), i2 === e52 < 0 ? (r2 && n2.push(r2), r2 = [t3]) : r2.push(t3));
  }
  if (r2 && n2.push(r2), t2 > 1) for (let e52 = 0; e52 < n2.length; e52++) n2[e52].length <= t2 || (Aa(n2[e52], t2, 1, n2[e52].length - 1, Pa), n2[e52] = n2[e52].slice(0, t2));
  return n2;
}
function Pa(e51, t2) {
  return t2.area - e51.area;
}
function Fa(e51) {
  let t2 = 0;
  for (let n2 = 0, r2 = e51.length, i2 = r2 - 1, a2, o2; n2 < r2; i2 = n2++) a2 = e51[n2], o2 = e51[i2], t2 += (o2.x - a2.x) * (a2.y + o2.y);
  return t2;
}
var Ia = Math.PI / 180;
var La = class {
  constructor(e51) {
    let t2 = Ia * 6378.137 * 1e3, n2 = Math.cos(e51 * Ia), r2 = 1 / (1 - 0.0066943799901413165 * (1 - n2 * n2)), i2 = Math.sqrt(r2);
    this.kx = t2 * i2 * n2, this.ky = t2 * i2 * r2 * 0.9933056200098587;
  }
  distance(e51, t2) {
    let n2 = this.wrap(e51[0] - t2[0]) * this.kx, r2 = (e51[1] - t2[1]) * this.ky;
    return Math.sqrt(n2 * n2 + r2 * r2);
  }
  pointOnLine(e51, t2) {
    let n2 = 1 / 0, r2, i2, a2, o2;
    for (let s2 = 0; s2 < e51.length - 1; s2++) {
      let c2 = e51[s2][0], l2 = e51[s2][1], u2 = this.wrap(e51[s2 + 1][0] - c2) * this.kx, d2 = (e51[s2 + 1][1] - l2) * this.ky, f2 = 0;
      (u2 !== 0 || d2 !== 0) && (f2 = (this.wrap(t2[0] - c2) * this.kx * u2 + (t2[1] - l2) * this.ky * d2) / (u2 * u2 + d2 * d2), f2 > 1 ? (c2 = e51[s2 + 1][0], l2 = e51[s2 + 1][1]) : f2 > 0 && (c2 += u2 / this.kx * f2, l2 += d2 / this.ky * f2)), u2 = this.wrap(t2[0] - c2) * this.kx, d2 = (t2[1] - l2) * this.ky;
      let p2 = u2 * u2 + d2 * d2;
      p2 < n2 && (n2 = p2, r2 = c2, i2 = l2, a2 = s2, o2 = f2);
    }
    return { point: [r2, i2], index: a2, t: Math.max(0, Math.min(1, o2)) };
  }
  wrap(e51) {
    for (; e51 < -180; ) e51 += 360;
    for (; e51 > 180; ) e51 -= 360;
    return e51;
  }
};
function Ra(e51, t2) {
  return t2[0] - e51[0];
}
function za(e51) {
  return e51[1] - e51[0] + 1;
}
function Ba(e51, t2) {
  return e51[1] >= e51[0] && e51[1] < t2;
}
function Va(e51, t2) {
  if (e51[0] > e51[1]) return [null, null];
  let n2 = za(e51);
  if (t2) {
    if (n2 === 2) return [e51, null];
    let t3 = Math.floor(n2 / 2);
    return [[e51[0], e51[0] + t3], [e51[0] + t3, e51[1]]];
  }
  if (n2 === 1) return [e51, null];
  let r2 = Math.floor(n2 / 2) - 1;
  return [[e51[0], e51[0] + r2], [e51[0] + r2 + 1, e51[1]]];
}
function Ha(e51, t2) {
  if (!Ba(t2, e51.length)) return [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  let n2 = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  for (let r2 = t2[0]; r2 <= t2[1]; ++r2) ca(n2, e51[r2]);
  return n2;
}
function Ua(e51) {
  let t2 = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  for (let n2 of e51) for (let e52 of n2) ca(t2, e52);
  return t2;
}
function Wa(e51) {
  return e51[0] !== -1 / 0 && e51[1] !== -1 / 0 && e51[2] !== 1 / 0 && e51[3] !== 1 / 0;
}
function Ga(e51, t2, n2) {
  if (!Wa(e51) || !Wa(t2)) return NaN;
  let r2 = 0, i2 = 0;
  return e51[2] < t2[0] && (r2 = t2[0] - e51[2]), e51[0] > t2[2] && (r2 = e51[0] - t2[2]), e51[1] > t2[3] && (i2 = e51[1] - t2[3]), e51[3] < t2[1] && (i2 = t2[1] - e51[3]), n2.distance([0, 0], [r2, i2]);
}
function Ka(e51, t2, n2) {
  let r2 = n2.pointOnLine(t2, e51);
  return n2.distance(e51, r2.point);
}
function qa(e51, t2, n2, r2, i2) {
  let a2 = Math.min(Ka(e51, [n2, r2], i2), Ka(t2, [n2, r2], i2)), o2 = Math.min(Ka(n2, [e51, t2], i2), Ka(r2, [e51, t2], i2));
  return Math.min(a2, o2);
}
function Ja(e51, t2, n2, r2, i2) {
  if (!(Ba(t2, e51.length) && Ba(r2, n2.length))) return 1 / 0;
  let a2 = 1 / 0;
  for (let o2 = t2[0]; o2 < t2[1]; ++o2) {
    let t3 = e51[o2], s2 = e51[o2 + 1];
    for (let e52 = r2[0]; e52 < r2[1]; ++e52) {
      let r3 = n2[e52], o3 = n2[e52 + 1];
      if (fa(t3, s2, r3, o3)) return 0;
      a2 = Math.min(a2, qa(t3, s2, r3, o3, i2));
    }
  }
  return a2;
}
function Ya(e51, t2, n2, r2, i2) {
  if (!(Ba(t2, e51.length) && Ba(r2, n2.length))) return NaN;
  let a2 = 1 / 0;
  for (let o2 = t2[0]; o2 <= t2[1]; ++o2) for (let t3 = r2[0]; t3 <= r2[1]; ++t3) if (a2 = Math.min(a2, i2.distance(e51[o2], n2[t3])), a2 === 0) return a2;
  return a2;
}
function Xa(e51, t2, n2) {
  if (ma(e51, t2, true)) return 0;
  let r2 = 1 / 0;
  for (let i2 of t2) {
    let t3 = i2[0], a2 = i2[i2.length - 1];
    if (t3 !== a2 && (r2 = Math.min(r2, Ka(e51, [a2, t3], n2)), r2 === 0)) return r2;
    let o2 = n2.pointOnLine(i2, e51);
    if (r2 = Math.min(r2, n2.distance(e51, o2.point)), r2 === 0) return r2;
  }
  return r2;
}
function Za(e51, t2, n2, r2) {
  if (!Ba(t2, e51.length)) return NaN;
  for (let r3 = t2[0]; r3 <= t2[1]; ++r3) if (ma(e51[r3], n2, true)) return 0;
  let i2 = 1 / 0;
  for (let a2 = t2[0]; a2 < t2[1]; ++a2) {
    let t3 = e51[a2], o2 = e51[a2 + 1];
    for (let e52 of n2) for (let n3 = 0, a3 = e52.length, s2 = a3 - 1; n3 < a3; s2 = n3++) {
      let a4 = e52[s2], c2 = e52[n3];
      if (fa(t3, o2, a4, c2)) return 0;
      i2 = Math.min(i2, qa(t3, o2, a4, c2, r2));
    }
  }
  return i2;
}
function Qa(e51, t2) {
  for (let n2 of e51) for (let e52 of n2) if (ma(e52, t2, true)) return true;
  return false;
}
function $a(e51, t2, n2, r2 = 1 / 0) {
  let i2 = Ua(e51), a2 = Ua(t2);
  if (r2 !== 1 / 0 && Ga(i2, a2, n2) >= r2) return r2;
  if (la(i2, a2)) {
    if (Qa(e51, t2)) return 0;
  } else if (Qa(t2, e51)) return 0;
  let o2 = 1 / 0;
  for (let r3 of e51) for (let e52 = 0, i3 = r3.length, a3 = i3 - 1; e52 < i3; a3 = e52++) {
    let i4 = r3[a3], s2 = r3[e52];
    for (let e53 of t2) for (let t3 = 0, r4 = e53.length, a4 = r4 - 1; t3 < r4; a4 = t3++) {
      let r5 = e53[a4], c2 = e53[t3];
      if (fa(i4, s2, r5, c2)) return 0;
      o2 = Math.min(o2, qa(i4, s2, r5, c2, n2));
    }
  }
  return o2;
}
function eo(e51, t2, n2, r2, i2, a2) {
  if (!a2) return;
  let o2 = Ga(Ha(r2, a2), i2, n2);
  o2 < t2 && e51.push([o2, a2, [0, 0]]);
}
function to(e51, t2, n2, r2, i2, a2, o2) {
  if (!a2 || !o2) return;
  let s2 = Ga(Ha(r2, a2), Ha(i2, o2), n2);
  s2 < t2 && e51.push([s2, a2, o2]);
}
function no(e51, t2, n2, r2, i2 = 1 / 0) {
  let a2 = Math.min(r2.distance(e51[0], n2[0][0]), i2);
  if (a2 === 0) return a2;
  let o2 = new ka([[0, [0, e51.length - 1], [0, 0]]], Ra), s2 = Ua(n2);
  for (; o2.length > 0; ) {
    let i3 = o2.pop();
    if (i3[0] >= a2) continue;
    let c2 = i3[1], l2 = t2 ? 50 : 100;
    if (za(c2) <= l2) {
      if (!Ba(c2, e51.length)) return NaN;
      if (t2) {
        let t3 = Za(e51, c2, n2, r2);
        if (isNaN(t3) || t3 === 0) return t3;
        a2 = Math.min(a2, t3);
      } else for (let t3 = c2[0]; t3 <= c2[1]; ++t3) {
        let i4 = Xa(e51[t3], n2, r2);
        if (a2 = Math.min(a2, i4), a2 === 0) return 0;
      }
    } else {
      let n3 = Va(c2, t2);
      eo(o2, a2, r2, e51, s2, n3[0]), eo(o2, a2, r2, e51, s2, n3[1]);
    }
  }
  return a2;
}
function ro(e51, t2, n2, r2, i2, a2 = 1 / 0) {
  let o2 = Math.min(a2, i2.distance(e51[0], n2[0]));
  if (o2 === 0) return o2;
  let s2 = new ka([[0, [0, e51.length - 1], [0, n2.length - 1]]], Ra);
  for (; s2.length > 0; ) {
    let a3 = s2.pop();
    if (a3[0] >= o2) continue;
    let c2 = a3[1], l2 = a3[2], u2 = t2 ? 50 : 100, d2 = r2 ? 50 : 100;
    if (za(c2) <= u2 && za(l2) <= d2) {
      if (!Ba(c2, e51.length) && Ba(l2, n2.length)) return NaN;
      let a4;
      if (t2 && r2) a4 = Ja(e51, c2, n2, l2, i2), o2 = Math.min(o2, a4);
      else if (t2 && !r2) {
        let t3 = e51.slice(c2[0], c2[1] + 1);
        for (let e52 = l2[0]; e52 <= l2[1]; ++e52) if (a4 = Ka(n2[e52], t3, i2), o2 = Math.min(o2, a4), o2 === 0) return o2;
      } else if (!t2 && r2) {
        let t3 = n2.slice(l2[0], l2[1] + 1);
        for (let n3 = c2[0]; n3 <= c2[1]; ++n3) if (a4 = Ka(e51[n3], t3, i2), o2 = Math.min(o2, a4), o2 === 0) return o2;
      } else a4 = Ya(e51, c2, n2, l2, i2), o2 = Math.min(o2, a4);
    } else {
      let a4 = Va(c2, t2), u3 = Va(l2, r2);
      to(s2, o2, i2, e51, n2, a4[0], u3[0]), to(s2, o2, i2, e51, n2, a4[0], u3[1]), to(s2, o2, i2, e51, n2, a4[1], u3[0]), to(s2, o2, i2, e51, n2, a4[1], u3[1]);
    }
  }
  return o2;
}
function io(e51, t2) {
  let n2 = e51.geometry(), r2 = n2.flat().map((t3) => ra([t3.x, t3.y], e51.canonical));
  if (n2.length === 0) return NaN;
  let i2 = new La(r2[0][1]), a2 = 1 / 0;
  for (let e52 of t2) {
    switch (e52.type) {
      case `Point`:
        a2 = Math.min(a2, ro(r2, false, [e52.coordinates], false, i2, a2));
        break;
      case `LineString`:
        a2 = Math.min(a2, ro(r2, false, e52.coordinates, true, i2, a2));
        break;
      case `Polygon`:
        a2 = Math.min(a2, no(r2, false, e52.coordinates, i2, a2));
    }
    if (a2 === 0) return a2;
  }
  return a2;
}
function ao(e51, t2) {
  let n2 = e51.geometry(), r2 = n2.flat().map((t3) => ra([t3.x, t3.y], e51.canonical));
  if (n2.length === 0) return NaN;
  let i2 = new La(r2[0][1]), a2 = 1 / 0;
  for (let e52 of t2) {
    switch (e52.type) {
      case `Point`:
        a2 = Math.min(a2, ro(r2, true, [e52.coordinates], false, i2, a2));
        break;
      case `LineString`:
        a2 = Math.min(a2, ro(r2, true, e52.coordinates, true, i2, a2));
        break;
      case `Polygon`:
        a2 = Math.min(a2, no(r2, true, e52.coordinates, i2, a2));
    }
    if (a2 === 0) return a2;
  }
  return a2;
}
function oo(e51, t2) {
  let n2 = e51.geometry();
  if (n2.length === 0 || n2[0].length === 0) return NaN;
  let r2 = Na(n2, 0).map((t3) => t3.map((t4) => t4.map((t5) => ra([t5.x, t5.y], e51.canonical)))), i2 = new La(r2[0][0][0][1]), a2 = 1 / 0;
  for (let e52 of t2) for (let t3 of r2) {
    switch (e52.type) {
      case `Point`:
        a2 = Math.min(a2, no([e52.coordinates], false, t3, i2, a2));
        break;
      case `LineString`:
        a2 = Math.min(a2, no(e52.coordinates, true, t3, i2, a2));
        break;
      case `Polygon`:
        a2 = Math.min(a2, $a(t3, e52.coordinates, i2, a2));
    }
    if (a2 === 0) return a2;
  }
  return a2;
}
function so(e51) {
  return e51.type === `MultiPolygon` ? e51.coordinates.map((e52) => ({ type: `Polygon`, coordinates: e52 })) : e51.type === `MultiLineString` ? e51.coordinates.map((e52) => ({ type: `LineString`, coordinates: e52 })) : e51.type === `MultiPoint` ? e51.coordinates.map((e52) => ({ type: `Point`, coordinates: e52 })) : [e51];
}
var co = class e32 {
  constructor(e51, t2) {
    this.type = F, this.geojson = e51, this.geometries = t2;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`'distance' expression requires exactly one argument, but found ${t2.length - 1} instead.`);
    if (ii(t2[1])) {
      let n3 = t2[1];
      if (n3.type === `FeatureCollection`) return new e32(n3, n3.features.map((e51) => so(e51.geometry)).flat());
      if (n3.type === `Feature`) return new e32(n3, so(n3.geometry));
      if (`type` in n3 && `coordinates` in n3) return new e32(n3, so(n3));
    }
    return n2.error(`'distance' expression requires valid geojson object that contains polygon geometry type.`);
  }
  evaluate(e51) {
    if (e51.geometry() != null && e51.canonicalID() != null) {
      if (e51.geometryType() === `Point`) return io(e51, this.geometries);
      if (e51.geometryType() === `LineString`) return ao(e51, this.geometries);
      if (e51.geometryType() === `Polygon`) return oo(e51, this.geometries);
    }
    return NaN;
  }
  eachChild() {
  }
  outputDefined() {
    return true;
  }
};
var lo = class e33 {
  constructor(e51) {
    this.key = e51, this.type = R;
  }
  static parse(t2, n2) {
    if (t2.length !== 2) return n2.error(`Expected 1 argument, but found ${t2.length - 1} instead.`);
    let r2 = t2[1];
    return r2 == null ? n2.error(`Global state property must be defined.`) : typeof r2 == `string` ? new e33(r2) : n2.error(`Global state property must be string, but found ${typeof t2[1]} instead.`);
  }
  evaluate(e51) {
    let t2 = e51.globals?.globalState;
    return !t2 || Object.keys(t2).length === 0 ? null : Ir(t2, this.key) ?? null;
  }
  eachChild() {
  }
  outputDefined() {
    return false;
  }
};
var uo = { "==": Wi, "!=": Gi, ">": qi, "<": Ki, ">=": Yi, "<=": Ji, array: li, at: _i, boolean: li, case: xi, coalesce: ki, collator: Xi, format: Qi, image: $i, in: vi, "index-of": yi, interpolate: Ei, "interpolate-hcl": Ei, "interpolate-lab": Ei, length: ea, let: hi, literal: si, match: bi, number: li, "number-format": Zi, object: li, slice: Si, step: wi, string: li, "to-boolean": di, "to-color": di, "to-number": di, "to-string": di, var: gi, within: Oa, distance: co, "global-state": lo };
var fo = class e34 {
  constructor(e51, t2, n2, r2, i2) {
    this.name = e51, this.type = t2, this._evaluate = n2, this.args = r2, this.key = i2;
  }
  evaluate(e51) {
    return this._evaluate(e51, this.args, this.key);
  }
  eachChild(e51) {
    this.args.forEach(e51);
  }
  outputDefined() {
    return false;
  }
  static parse(t2, n2) {
    let r2 = t2[0], i2 = e34.definitions[r2];
    if (!i2) return n2.error(`Unknown expression "${r2}". If you wanted a literal array, use ["literal", [...]].`, 0);
    let a2 = Array.isArray(i2) ? i2[0] : i2.type, o2 = Array.isArray(i2) ? [[i2[1], i2[2]]] : i2.overloads, s2 = o2.filter(([e51]) => !Array.isArray(e51) || e51.length === t2.length - 1), c2 = null;
    for (let [i3, o3] of s2) {
      c2 = new mi(n2.registry, yo, n2.path, null, n2.scope);
      let s3 = [], l2 = false;
      for (let e51 = 1; e51 < t2.length; e51++) {
        let n3 = t2[e51], r3 = Array.isArray(i3) ? i3[e51 - 1] : i3.type, a3 = c2.parse(n3, 1 + s3.length, r3);
        if (!a3) {
          l2 = true;
          break;
        }
        s3.push(a3);
      }
      if (!l2) {
        if (Array.isArray(i3) && i3.length !== s3.length) {
          c2.error(`Expected ${i3.length} arguments, but found ${s3.length} instead.`);
          continue;
        }
        for (let e51 = 0; e51 < s3.length; e51++) {
          let t3 = Array.isArray(i3) ? i3[e51] : i3.type, n3 = s3[e51];
          c2.concat(e51 + 1).checkSubtype(t3, n3.type);
        }
        if (c2.errors.length === 0) return new e34(r2, a2, o3, s3, n2.key);
      }
    }
    if (s2.length === 1) n2.errors.push(...c2.errors);
    else {
      let e51 = (s2.length ? s2 : o2).map(([e52]) => vo(e52)).join(` | `), r3 = [];
      for (let e52 = 1; e52 < t2.length; e52++) {
        let i3 = n2.parse(t2[e52], 1 + r3.length);
        if (!i3) return null;
        r3.push(z(i3.type));
      }
      n2.error(`Expected arguments of type ${e51}, but found (${r3.join(`, `)}) instead.`);
    }
    return null;
  }
  static register(t2, n2) {
    e34.definitions = n2;
    for (let r2 in n2) t2[r2] = e34;
  }
};
function po(e51, [t2, n2, r2, i2], a2) {
  t2 = t2.evaluate(e51), n2 = n2.evaluate(e51), r2 = r2.evaluate(e51);
  let o2 = i2 ? i2.evaluate(e51) : 1, s2 = ri(t2, n2, r2, o2);
  if (s2) throw new V(s2, a2);
  return new B(t2 / 255, n2 / 255, r2 / 255, o2, false);
}
function mo(e51, t2) {
  return e51 in t2 && t2[e51] !== void 0;
}
function ho(e51, t2) {
  let n2 = t2[e51];
  return n2 === void 0 ? null : n2;
}
function go(e51, t2, n2, r2) {
  for (; n2 <= r2; ) {
    let i2 = n2 + r2 >> 1;
    if (t2[i2] === e51) return true;
    t2[i2] > e51 ? r2 = i2 - 1 : n2 = i2 + 1;
  }
  return false;
}
function _o(e51) {
  return { type: e51 };
}
fo.register(uo, { error: [ir, [I], (e51, [t2], n2) => {
  throw new V(t2.evaluate(e51), n2);
}], typeof: [I, [R], (e51, [t2]) => z(ai(t2.evaluate(e51)))], "to-rgba": [fr(F, 4), [tr], (e51, [t2]) => {
  let [n2, r2, i2, a2] = t2.evaluate(e51).rgb;
  return [n2 * 255, r2 * 255, i2 * 255, a2];
}], rgb: [tr, [F, F, F], po], rgba: [tr, [F, F, F, F], po], has: { type: L, overloads: [[[I], (e51, [t2]) => mo(t2.evaluate(e51), e51.properties())], [[I, rr], (e51, [t2, n2]) => mo(t2.evaluate(e51), n2.evaluate(e51))]] }, get: { type: R, overloads: [[[I], (e51, [t2]) => ho(t2.evaluate(e51), e51.properties())], [[I, rr], (e51, [t2, n2]) => ho(t2.evaluate(e51), n2.evaluate(e51))]] }, "feature-state": [R, [I], (e51, [t2]) => ho(t2.evaluate(e51), e51.featureState || {})], properties: [rr, [], (e51) => e51.properties()], "geometry-type": [I, [], (e51) => e51.geometryType()], id: [R, [], (e51) => e51.id()], zoom: [F, [], (e51) => e51.globals.zoom], "heatmap-density": [F, [], (e51) => e51.globals.heatmapDensity || 0], elevation: [F, [], (e51) => e51.globals.elevation || 0], "line-progress": [F, [], (e51) => e51.globals.lineProgress || 0], accumulated: [R, [], (e51) => e51.globals.accumulated === void 0 ? null : e51.globals.accumulated], "+": [F, _o(F), (e51, t2) => {
  let n2 = 0;
  for (let r2 of t2) n2 += r2.evaluate(e51);
  return n2;
}], "*": [F, _o(F), (e51, t2) => {
  let n2 = 1;
  for (let r2 of t2) n2 *= r2.evaluate(e51);
  return n2;
}], "-": { type: F, overloads: [[[F, F], (e51, [t2, n2]) => t2.evaluate(e51) - n2.evaluate(e51)], [[F], (e51, [t2]) => -t2.evaluate(e51)]] }, "/": [F, [F, F], (e51, [t2, n2]) => t2.evaluate(e51) / n2.evaluate(e51)], "%": [F, [F, F], (e51, [t2, n2]) => t2.evaluate(e51) % n2.evaluate(e51)], ln2: [F, [], () => Math.LN2], pi: [F, [], () => Math.PI], e: [F, [], () => Math.E], "^": [F, [F, F], (e51, [t2, n2]) => t2.evaluate(e51) ** +n2.evaluate(e51)], sqrt: [F, [F], (e51, [t2]) => Math.sqrt(t2.evaluate(e51))], log10: [F, [F], (e51, [t2]) => Math.log(t2.evaluate(e51)) / Math.LN10], ln: [F, [F], (e51, [t2]) => Math.log(t2.evaluate(e51))], log2: [F, [F], (e51, [t2]) => Math.log(t2.evaluate(e51)) / Math.LN2], sin: [F, [F], (e51, [t2]) => Math.sin(t2.evaluate(e51))], cos: [F, [F], (e51, [t2]) => Math.cos(t2.evaluate(e51))], tan: [F, [F], (e51, [t2]) => Math.tan(t2.evaluate(e51))], asin: [F, [F], (e51, [t2]) => Math.asin(t2.evaluate(e51))], acos: [F, [F], (e51, [t2]) => Math.acos(t2.evaluate(e51))], atan: [F, [F], (e51, [t2]) => Math.atan(t2.evaluate(e51))], min: [F, _o(F), (e51, t2) => Math.min(...t2.map((t3) => t3.evaluate(e51)))], max: [F, _o(F), (e51, t2) => Math.max(...t2.map((t3) => t3.evaluate(e51)))], abs: [F, [F], (e51, [t2]) => Math.abs(t2.evaluate(e51))], round: [F, [F], (e51, [t2]) => {
  let n2 = t2.evaluate(e51);
  return n2 < 0 ? -Math.round(-n2) : Math.round(n2);
}], floor: [F, [F], (e51, [t2]) => Math.floor(t2.evaluate(e51))], ceil: [F, [F], (e51, [t2]) => Math.ceil(t2.evaluate(e51))], "filter-==": [L, [I, R], (e51, [t2, n2]) => e51.properties()[t2.value] === n2.value], "filter-id-==": [L, [R], (e51, [t2]) => e51.id() === t2.value], "filter-type-==": [L, [I], (e51, [t2]) => e51.geometryType() === t2.value], "filter-<": [L, [I, R], (e51, [t2, n2]) => {
  let r2 = e51.properties()[t2.value], i2 = n2.value;
  return typeof r2 == typeof i2 && r2 < i2;
}], "filter-id-<": [L, [R], (e51, [t2]) => {
  let n2 = e51.id(), r2 = t2.value;
  return typeof n2 == typeof r2 && n2 < r2;
}], "filter->": [L, [I, R], (e51, [t2, n2]) => {
  let r2 = e51.properties()[t2.value], i2 = n2.value;
  return typeof r2 == typeof i2 && r2 > i2;
}], "filter-id->": [L, [R], (e51, [t2]) => {
  let n2 = e51.id(), r2 = t2.value;
  return typeof n2 == typeof r2 && n2 > r2;
}], "filter-<=": [L, [I, R], (e51, [t2, n2]) => {
  let r2 = e51.properties()[t2.value], i2 = n2.value;
  return typeof r2 == typeof i2 && r2 <= i2;
}], "filter-id-<=": [L, [R], (e51, [t2]) => {
  let n2 = e51.id(), r2 = t2.value;
  return typeof n2 == typeof r2 && n2 <= r2;
}], "filter->=": [L, [I, R], (e51, [t2, n2]) => {
  let r2 = e51.properties()[t2.value], i2 = n2.value;
  return typeof r2 == typeof i2 && r2 >= i2;
}], "filter-id->=": [L, [R], (e51, [t2]) => {
  let n2 = e51.id(), r2 = t2.value;
  return typeof n2 == typeof r2 && n2 >= r2;
}], "filter-has": [L, [R], (e51, [t2]) => {
  let n2 = t2.value, r2 = e51.properties();
  return n2 in r2 && r2[n2] !== void 0;
}], "filter-has-id": [L, [], (e51) => e51.id() !== null && e51.id() !== void 0], "filter-type-in": [L, [fr(I)], (e51, [t2]) => t2.value.indexOf(e51.geometryType()) >= 0], "filter-id-in": [L, [fr(R)], (e51, [t2]) => t2.value.indexOf(e51.id()) >= 0], "filter-in-small": [L, [I, fr(R)], (e51, [t2, n2]) => n2.value.indexOf(e51.properties()[t2.value]) >= 0], "filter-in-large": [L, [I, fr(R)], (e51, [t2, n2]) => go(e51.properties()[t2.value], n2.value, 0, n2.value.length - 1)], all: { type: L, overloads: [[[L, L], (e51, [t2, n2]) => t2.evaluate(e51) && n2.evaluate(e51)], [_o(L), (e51, t2) => {
  for (let n2 of t2) if (!n2.evaluate(e51)) return false;
  return true;
}]] }, any: { type: L, overloads: [[[L, L], (e51, [t2, n2]) => t2.evaluate(e51) || n2.evaluate(e51)], [_o(L), (e51, t2) => {
  for (let n2 of t2) if (n2.evaluate(e51)) return true;
  return false;
}]] }, "!": [L, [L], (e51, [t2]) => !t2.evaluate(e51)], "is-supported-script": [L, [I], (e51, [t2]) => {
  let n2 = e51.globals && e51.globals.isSupportedScript;
  return !n2 || n2(t2.evaluate(e51));
}], upcase: [I, [I], (e51, [t2]) => t2.evaluate(e51).toUpperCase()], downcase: [I, [I], (e51, [t2]) => t2.evaluate(e51).toLowerCase()], concat: [I, _o(R), (e51, t2) => t2.map((t3) => oi(t3.evaluate(e51))).join(``)], split: [fr(I), [I, I], (e51, [t2, n2]) => t2.evaluate(e51).split(n2.evaluate(e51))], join: [I, [fr(I), I], (e51, [t2, n2]) => t2.evaluate(e51).join(n2.evaluate(e51))], "resolved-locale": [I, [ar], (e51, [t2]) => t2.evaluate(e51).resolvedLocale()] });
function vo(e51) {
  return Array.isArray(e51) ? `(${e51.map(z).join(`, `)})` : `(${z(e51.type)}...)`;
}
function yo(e51) {
  if (e51 instanceof gi) return yo(e51.boundExpression);
  if (e51 instanceof fo && e51.name === `error` || e51 instanceof Xi || e51 instanceof Oa || e51 instanceof co || e51 instanceof lo) return false;
  let t2 = e51 instanceof di || e51 instanceof li, n2 = true;
  return e51.eachChild((e52) => {
    n2 &&= t2 ? yo(e52) : e52 instanceof si;
  }), n2 ? bo(e51) && So(e51, [`zoom`, `heatmap-density`, `elevation`, `line-progress`, `accumulated`, `is-supported-script`]) : false;
}
function bo(e51) {
  if (e51 instanceof fo && (e51.name === `get` && e51.args.length === 1 || e51.name === `feature-state` || e51.name === `has` && e51.args.length === 1 || e51.name === `properties` || e51.name === `geometry-type` || e51.name === `id` || /^filter-/.test(e51.name)) || e51 instanceof Oa || e51 instanceof co) return false;
  let t2 = true;
  return e51.eachChild((e52) => {
    t2 && !bo(e52) && (t2 = false);
  }), t2;
}
function xo(e51) {
  if (e51 instanceof fo && e51.name === `feature-state`) return false;
  let t2 = true;
  return e51.eachChild((e52) => {
    t2 && !xo(e52) && (t2 = false);
  }), t2;
}
function So(e51, t2) {
  if (e51 instanceof fo && t2.indexOf(e51.name) >= 0) return false;
  let n2 = true;
  return e51.eachChild((e52) => {
    n2 && !So(e52, t2) && (n2 = false);
  }), n2;
}
function Co(e51) {
  return { result: `success`, value: e51 };
}
function wo(e51) {
  return { result: `error`, value: e51 };
}
function To(e51) {
  return e51[`property-type`] === `data-driven` || e51[`property-type`] === `cross-faded-data-driven`;
}
function Eo(e51) {
  return !!e51.expression && e51.expression.parameters.indexOf(`zoom`) > -1;
}
function Do(e51) {
  return !!e51.expression && e51.expression.interpolated;
}
function Oo(e51, ...t2) {
  for (let n2 of t2) for (let t3 in n2) e51[t3] = n2[t3];
  return e51;
}
function H(e51) {
  return e51 instanceof Number ? `number` : e51 instanceof String ? `string` : e51 instanceof Boolean ? `boolean` : Array.isArray(e51) ? `array` : e51 === null ? `null` : typeof e51;
}
function ko(e51) {
  return typeof e51 == `object` && !!e51 && !Array.isArray(e51) && ai(e51) === rr;
}
function Ao(e51) {
  return e51;
}
function jo(e51) {
  switch (e51.type) {
    case `color`:
      return B.parse;
    case `padding`:
      return Xr.parse;
    case `numberArray`:
      return Zr.parse;
    case `colorArray`:
      return Qr.parse;
    default:
      return null;
  }
}
function Mo(e51) {
  switch (e51) {
    case `exponential`:
      return Lo;
    case `interval`:
      return Io;
    case `categorical`:
      return Fo;
    case `identity`:
      return Ro;
    default:
      throw Error(`Unknown function type "${e51}"`);
  }
}
function No(e51, t2) {
  let n2 = e51.stops && typeof e51.stops[0][0] == `object`, r2 = n2 || e51.property !== void 0, i2 = n2 || !r2, a2 = e51.type || (Do(t2) ? `exponential` : `interval`), o2 = jo(t2);
  if (o2 && (e51 = Oo({}, e51), e51.stops && (e51.stops = e51.stops.map((e52) => [e52[0], o2(e52[1])])), e51.default ? e51.default = o2(e51.default) : e51.default = o2(t2.default)), e51.colorSpace && !Gr(e51.colorSpace)) throw Error(`Unknown color space: "${e51.colorSpace}"`);
  let s2 = Mo(a2), c2, l2;
  if (a2 === `categorical`) {
    c2 = /* @__PURE__ */ Object.create(null);
    for (let t3 of e51.stops) c2[t3[0]] = t3[1];
    l2 = typeof e51.stops[0][0];
  }
  if (n2) {
    let n3 = {}, r3 = [];
    for (let t3 = 0; t3 < e51.stops.length; t3++) {
      let i4 = e51.stops[t3], a4 = i4[0].zoom;
      n3[a4] === void 0 && (n3[a4] = { zoom: a4, type: e51.type, property: e51.property, default: e51.default, stops: [] }, r3.push(a4)), n3[a4].stops.push([i4[0].value, i4[1]]);
    }
    let i3 = [];
    for (let e52 of r3) i3.push([n3[e52].zoom, No(n3[e52], t2)]);
    let a3 = { name: `linear` };
    return { kind: `composite`, interpolationType: a3, interpolationFactor: Ei.interpolationFactor.bind(void 0, a3), zoomStops: i3.map((e52) => e52[0]), evaluate({ zoom: n4 }, r4) {
      return Lo({ stops: i3, base: e51.base }, t2, n4).evaluate(n4, r4);
    } };
  }
  if (i2) {
    let n3 = a2 === `exponential` ? { name: `exponential`, base: e51.base === void 0 ? 1 : e51.base } : null;
    return { kind: `camera`, interpolationType: n3, interpolationFactor: Ei.interpolationFactor.bind(void 0, n3), zoomStops: e51.stops.map((e52) => e52[0]), evaluate: ({ zoom: n4 }) => s2(e51, t2, n4, c2, l2) };
  }
  return { kind: `source`, evaluate(n3, r3) {
    let i3 = r3 && r3.properties ? r3.properties[e51.property] : void 0;
    return i3 === void 0 ? Po(e51.default, t2.default) : s2(e51, t2, i3, c2, l2);
  } };
}
function Po(e51, t2, n2) {
  if (e51 !== void 0) return e51;
  if (t2 !== void 0) return t2;
  if (n2 !== void 0) return n2;
}
function Fo(e51, t2, n2, r2, i2) {
  return Po(typeof n2 === i2 ? r2[n2] : void 0, e51.default, t2.default);
}
function Io(e51, t2, n2) {
  if (H(n2) !== `number`) return Po(e51.default, t2.default);
  let r2 = e51.stops.length;
  if (r2 === 1 || n2 <= e51.stops[0][0]) return e51.stops[0][1];
  if (n2 >= e51.stops[r2 - 1][0]) return e51.stops[r2 - 1][1];
  let i2 = Ci(e51.stops.map((e52) => e52[0]), n2, ``);
  return e51.stops[i2][1];
}
function Lo(e51, t2, n2) {
  let r2 = e51.base === void 0 ? 1 : e51.base;
  if (H(n2) !== `number`) return Po(e51.default, t2.default);
  let i2 = e51.stops.length;
  if (i2 === 1 || n2 <= e51.stops[0][0]) return e51.stops[0][1];
  if (n2 >= e51.stops[i2 - 1][0]) return e51.stops[i2 - 1][1];
  let a2 = Ci(e51.stops.map((e52) => e52[0]), n2, ``), o2 = zo(n2, r2, e51.stops[a2][0], e51.stops[a2 + 1][0]), s2 = e51.stops[a2][1], c2 = e51.stops[a2 + 1][1], l2 = Oi[t2.type] || Ao;
  return typeof s2.evaluate == `function` ? { evaluate(...t3) {
    let n3 = s2.evaluate.apply(void 0, t3), r3 = c2.evaluate.apply(void 0, t3);
    if (n3 !== void 0 && r3 !== void 0) return l2(n3, r3, o2, e51.colorSpace);
  } } : l2(s2, c2, o2, e51.colorSpace);
}
function Ro(e51, t2, n2) {
  switch (t2.type) {
    case `color`:
      n2 = B.parse(n2);
      break;
    case `formatted`:
      n2 = Yr.fromString(n2.toString());
      break;
    case `resolvedImage`:
      n2 = ti.fromString(n2.toString());
      break;
    case `padding`:
      n2 = Xr.parse(n2);
      break;
    case `colorArray`:
      n2 = Qr.parse(n2);
      break;
    case `numberArray`:
      n2 = Zr.parse(n2);
      break;
    default:
      H(n2) !== t2.type && (t2.type !== `enum` || !t2.values[n2]) && (n2 = void 0);
  }
  return Po(n2, e51.default, t2.default);
}
function zo(e51, t2, n2, r2) {
  let i2 = r2 - n2, a2 = e51 - n2;
  return i2 === 0 ? 0 : t2 === 1 ? a2 / i2 : (t2 ** +a2 - 1) / (t2 ** +i2 - 1);
}
var Bo = class {
  constructor(e51, t2, n2, r2) {
    this.expression = e51, this._warningHistory = {}, this._evaluator = new pi(), this._defaultValue = n2 ? es(n2) : null, this._enumValues = n2 && n2.type === `enum` ? n2.values : null, this._globalState = r2, this._rootKey = t2;
  }
  evaluateWithoutErrorHandling(e51, t2, n2, r2, i2, a2) {
    return this._globalState && (e51 = ts(e51, this._globalState)), this._evaluator.globals = e51, this._evaluator.feature = t2, this._evaluator.featureState = n2, this._evaluator.canonical = r2, this._evaluator.availableImages = i2 || null, this._evaluator.formattedSection = a2, this.expression.evaluate(this._evaluator);
  }
  evaluate(e51, t2, n2, r2, i2, a2) {
    this._globalState && (e51 = ts(e51, this._globalState)), this._evaluator.globals = e51, this._evaluator.feature = t2 || null, this._evaluator.featureState = n2 || null, this._evaluator.canonical = r2, this._evaluator.availableImages = i2 || null, this._evaluator.formattedSection = a2 || null;
    try {
      let e52 = this.expression.evaluate(this._evaluator);
      if (e52 == null || typeof e52 == `number` && e52 !== e52) return this._defaultValue;
      if (this._enumValues && !(e52 in this._enumValues)) throw new V(`Expected value to be one of ${Object.keys(this._enumValues).map((e53) => JSON.stringify(e53)).join(`, `)}, but found ${JSON.stringify(e52)} instead.`, ``);
      return e52;
    } catch (e52) {
      let t3 = e52 instanceof V ? e52.path : ``, n3 = `${t3}|${e52.message}`;
      return this._warningHistory[n3] || (this._warningHistory[n3] = true, typeof console < `u` && console.warn(Vo(this._rootKey, t3, e52.message, this._defaultValue))), this._defaultValue;
    }
  }
};
function Vo(e51, t2, n2, r2) {
  return `${e51}${t2}: ${n2}${r2 == null ? `` : ` Falling back to ${String(r2)}.`}`;
}
function Ho(e51) {
  if (!e51) throw Error(`rootKey must identify the location of the expression in the style JSON, e.g. "layers[3].paint.line-width".`);
}
function Uo(e51) {
  return Array.isArray(e51) && e51.length > 0 && typeof e51[0] == `string` && e51[0] in uo;
}
function Wo(e51, t2, n2, r2) {
  Ho(t2);
  let i2 = new mi(uo, yo, [], n2 ? $o(n2) : void 0), a2 = i2.parse(e51, void 0, void 0, void 0, n2 && n2.type === `string` ? { typeAnnotation: `coerce` } : void 0);
  return a2 ? Co(new Bo(a2, t2, n2, r2)) : wo(i2.errors);
}
var Go = class {
  constructor(e51, t2, n2) {
    this.kind = e51, this._styleExpression = t2, this.isStateDependent = e51 !== `constant` && !xo(t2.expression), this.globalStateRefs = Qo(t2.expression), this._globalState = n2;
  }
  evaluateWithoutErrorHandling(e51, t2, n2, r2, i2, a2) {
    return this._globalState && (e51 = ts(e51, this._globalState)), this._styleExpression.evaluateWithoutErrorHandling(e51, t2, n2, r2, i2, a2);
  }
  evaluate(e51, t2, n2, r2, i2, a2) {
    return this._globalState && (e51 = ts(e51, this._globalState)), this._styleExpression.evaluate(e51, t2, n2, r2, i2, a2);
  }
};
var Ko = class {
  constructor(e51, t2, n2, r2, i2) {
    this.kind = e51, this.zoomStops = n2, this._styleExpression = t2, this.isStateDependent = e51 !== `camera` && !xo(t2.expression), this.globalStateRefs = Qo(t2.expression), this.interpolationType = r2, this._globalState = i2;
  }
  evaluateWithoutErrorHandling(e51, t2, n2, r2, i2, a2) {
    return this._globalState && (e51 = ts(e51, this._globalState)), this._styleExpression.evaluateWithoutErrorHandling(e51, t2, n2, r2, i2, a2);
  }
  evaluate(e51, t2, n2, r2, i2, a2) {
    return this._globalState && (e51 = ts(e51, this._globalState)), this._styleExpression.evaluate(e51, t2, n2, r2, i2, a2);
  }
  interpolationFactor(e51, t2, n2) {
    return this.interpolationType ? Ei.interpolationFactor(this.interpolationType, e51, t2, n2) : 0;
  }
};
function qo(e51) {
  return e51._styleExpression !== void 0;
}
function Jo(e51, t2, n2, r2) {
  let i2 = Wo(e51, t2, n2, r2);
  if (i2.result === `error`) return i2;
  let a2 = i2.value.expression, o2 = bo(a2);
  if (!o2 && !To(n2)) return wo([new Qn(``, `data expressions not supported`)]);
  let s2 = So(a2, [`zoom`]);
  if (!s2 && !Eo(n2)) return wo([new Qn(``, `zoom expressions not supported`)]);
  let c2 = Zo(a2);
  if (!c2 && !s2) return wo([new Qn(``, `"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.`)]);
  if (c2 instanceof Qn) return wo([c2]);
  if (c2 instanceof Ei && !Do(n2)) return wo([new Qn(``, `"interpolate" expressions cannot be used with this property`)]);
  if (!c2) return Co(o2 ? new Go(`constant`, i2.value, r2) : new Go(`source`, i2.value, r2));
  let l2 = c2 instanceof Ei ? c2.interpolation : void 0;
  return Co(o2 ? new Ko(`camera`, i2.value, c2.labels, l2, r2) : new Ko(`composite`, i2.value, c2.labels, l2, r2));
}
var Yo = class e35 {
  constructor(e51, t2, n2) {
    this.isStateDependent = false, this.globalStateRefs = /* @__PURE__ */ new Set(), this._globalState = null, Ho(t2), this._parameters = e51, this._specification = n2, this._rootKey = t2, this._defaultValue = es(n2), this._warningHistory = {};
    let r2 = No(this._parameters, this._specification);
    this.kind = r2.kind, this.interpolationFactor = r2.interpolationFactor, this.zoomStops = r2.zoomStops, this.interpolationType = r2.interpolationType, this._innerEvaluate = r2.evaluate;
  }
  evaluate(e51, t2) {
    try {
      return this._innerEvaluate(e51, t2);
    } catch (e52) {
      let t3 = e52 instanceof Error ? e52.message : String(e52), n2 = `|${t3}`;
      return this._warningHistory[n2] || (this._warningHistory[n2] = true, typeof console < `u` && console.warn(Vo(this._rootKey, ``, t3, this._defaultValue))), this._defaultValue;
    }
  }
  static deserialize(t2) {
    return new e35(t2._parameters, t2._rootKey, t2._specification);
  }
  static serialize(e51) {
    return { _parameters: e51._parameters, _specification: e51._specification, _rootKey: e51._rootKey };
  }
};
function Xo(e51, t2, n2, r2) {
  if (ko(e51)) return new Yo(e51, t2, n2);
  if (Uo(e51)) {
    let i2 = Jo(e51, t2, n2, r2);
    if (i2.result === `error`) throw Error(i2.value.map((e52) => `${e52.key}: ${e52.message}`).join(`, `));
    return i2.value;
  }
  {
    let t3 = e51;
    return n2.type === `color` && typeof e51 == `string` ? t3 = B.parse(e51) : n2.type === `padding` && (typeof e51 == `number` || Array.isArray(e51)) ? t3 = Xr.parse(e51) : n2.type === `numberArray` && (typeof e51 == `number` || Array.isArray(e51)) ? t3 = Zr.parse(e51) : n2.type === `colorArray` && (typeof e51 == `string` || Array.isArray(e51)) ? t3 = Qr.parse(e51) : n2.type === `variableAnchorOffsetCollection` && Array.isArray(e51) ? t3 = ei.parse(e51) : n2.type === `projectionDefinition` && typeof e51 == `string` && (t3 = ni.parse(e51)), { globalStateRefs: /* @__PURE__ */ new Set(), _globalState: null, kind: `constant`, evaluate: () => t3 };
  }
}
function Zo(e51) {
  let t2 = null;
  if (e51 instanceof hi) t2 = Zo(e51.result);
  else if (e51 instanceof ki) {
    for (let n2 of e51.args) if (t2 = Zo(n2), t2) break;
  } else (e51 instanceof wi || e51 instanceof Ei) && e51.input instanceof fo && e51.input.name === `zoom` && (t2 = e51);
  return t2 instanceof Qn || e51.eachChild((e52) => {
    let n2 = Zo(e52);
    n2 instanceof Qn ? t2 = n2 : !t2 && n2 ? t2 = new Qn(``, `"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.`) : t2 && n2 && t2 !== n2 && (t2 = new Qn(``, `Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.`));
  }), t2;
}
function Qo(e51, t2 = /* @__PURE__ */ new Set()) {
  return e51 instanceof lo && t2.add(e51.key), e51.eachChild((e52) => {
    Qo(e52, t2);
  }), t2;
}
function $o(e51) {
  let t2 = { color: tr, string: I, number: F, enum: I, boolean: L, formatted: or, padding: sr, numberArray: lr, colorArray: cr, projectionDefinition: nr, resolvedImage: ur, variableAnchorOffsetCollection: dr };
  return e51.type === `array` ? fr(t2[e51.value] || R, e51.length) : t2[e51.type];
}
function es(e51) {
  if (e51.type === `color` && ko(e51.default)) return new B(0, 0, 0, 0);
  switch (e51.type) {
    case `color`:
      return B.parse(e51.default) || null;
    case `padding`:
      return Xr.parse(e51.default) || null;
    case `numberArray`:
      return Zr.parse(e51.default) || null;
    case `colorArray`:
      return Qr.parse(e51.default) || null;
    case `variableAnchorOffsetCollection`:
      return ei.parse(e51.default) || null;
    case `projectionDefinition`:
      return ni.parse(e51.default) || null;
    default:
      return e51.default === void 0 ? null : e51.default;
  }
}
function ts(e51, t2) {
  let { zoom: n2, heatmapDensity: r2, elevation: i2, lineProgress: a2, isSupportedScript: o2, accumulated: s2 } = e51 ?? {};
  return { zoom: n2, heatmapDensity: r2, elevation: i2, lineProgress: a2, isSupportedScript: o2, accumulated: s2, globalState: t2 };
}
function ns(e51) {
  let t2 = false;
  for (let n2 of e51) {
    let e52 = rs(n2);
    if (e52 === `expression`) return `expression`;
    e52 === `legacy` && (t2 = true);
  }
  return t2 ? `legacy` : `neutral`;
}
function rs(e51) {
  if (typeof e51 == `boolean`) return `neutral`;
  if (!Array.isArray(e51) || e51.length === 0) return `legacy`;
  switch (e51[0]) {
    case `has`:
      return e51.length < 2 || e51[1] === `$id` || e51[1] === `$type` ? `legacy` : e51.length === 2 ? `neutral` : `expression`;
    case `in`:
      return e51.length >= 3 && (typeof e51[1] != `string` || Array.isArray(e51[2])) ? `expression` : `legacy`;
    case `!in`:
    case `!has`:
      return `legacy`;
    case `==`:
    case `!=`:
    case `>`:
    case `>=`:
    case `<`:
    case `<=`:
      return e51.length !== 3 || Array.isArray(e51[1]) || Array.isArray(e51[2]) ? `expression` : `legacy`;
    case `none`:
      return `legacy`;
    case `any`:
    case `all`:
      return ns(e51.slice(1));
    default:
      return `expression`;
  }
}
function is(e51) {
  return rs(e51) !== `legacy`;
}
function as(e51) {
  return e51 === `$type` ? [`geometry-type`] : e51 === `$id` ? [`id`] : [`get`, e51];
}
function os(e51) {
  switch (e51[0]) {
    case `==`:
    case `!=`:
    case `<`:
    case `<=`:
    case `>`:
    case `>=`:
      return e51.length !== 3 || typeof e51[1] != `string` ? null : [e51[0], as(e51[1]), e51[2]];
    case `in`:
    case `!in`: {
      if (e51.length < 2 || typeof e51[1] != `string`) return null;
      let t2 = [`in`, as(e51[1]), [`literal`, e51.slice(2)]];
      return e51[0] === `!in` ? [`!`, t2] : t2;
    }
    case `has`:
    case `!has`: {
      if (e51.length !== 2 || typeof e51[1] != `string` || e51[1] === `$type` || e51[1] === `$id`) return null;
      let t2 = [`has`, e51[1]];
      return e51[0] === `!has` ? [`!`, t2] : t2;
    }
    default:
      return null;
  }
}
function ss(e51) {
  if ((e51[0] === `<` || e51[0] === `<=` || e51[0] === `>` || e51[0] === `>=`) && e51[1] === `$type`) return `"$type" cannot be use with operator "${e51[0]}"`;
  let t2 = os(e51);
  return t2 ? `Mixing deprecated filter syntax with expression syntax is not supported. Replace ${JSON.stringify(e51)} with ${JSON.stringify(t2)}.` : `Mixing deprecated filter syntax with expression syntax is not supported. Convert ${JSON.stringify(e51)} to expression syntax.`;
}
function cs(e51, t2, n2) {
  let r2 = n2[e51];
  return Array.isArray(r2) ? is(r2) ? ls(r2, t2.concat(e51)) : { path: t2.concat(e51), legacyFilter: r2 } : null;
}
function ls(e51, t2 = []) {
  if (!Array.isArray(e51) || e51.length < 1) return null;
  switch (e51[0]) {
    case `all`:
    case `any`:
    case `none`:
      for (let n2 = 1; n2 < e51.length; n2++) {
        let r2 = cs(n2, t2, e51);
        if (r2) return r2;
      }
      break;
    case `!`: {
      let n2 = cs(1, t2, e51);
      if (n2) return n2;
      break;
    }
    case `case`:
      for (let n2 = 1; n2 < e51.length - 1; n2 += 2) {
        let r2 = cs(n2, t2, e51);
        if (r2) return r2;
      }
  }
  return null;
}
function us(e51, t2) {
  let n2 = ls(e51);
  if (!n2 || typeof console > `u`) return;
  let r2 = n2.path.map((e52) => `[${e52}]`).join(``);
  console.warn(`${t2}${r2}: ${ss(n2.legacyFilter)}`);
}
var ds = { type: `boolean`, default: false, transition: false, "property-type": `data-driven`, expression: { interpolated: false, parameters: [`zoom`, `feature`] } };
function fs(e51, t2, n2) {
  if (e51 == null) return { filter: () => true, needGeometry: false, getGlobalStateRefs: () => /* @__PURE__ */ new Set() };
  is(e51) ? us(e51, t2) : e51 = hs(e51);
  let r2 = Wo(e51, t2, ds, n2);
  if (r2.result === `error`) throw Error(r2.value.map((e52) => `${e52.key}: ${e52.message}`).join(`, `));
  return { filter: (e52, t3, n3) => r2.value.evaluate(e52, t3, {}, n3), needGeometry: ms(e51), getGlobalStateRefs: () => Qo(r2.value.expression) };
}
function ps(e51, t2) {
  return e51 < t2 ? -1 : +(e51 > t2);
}
function ms(e51) {
  if (!Array.isArray(e51)) return false;
  if (e51[0] === `within` || e51[0] === `distance`) return true;
  for (let t2 = 1; t2 < e51.length; t2++) if (ms(e51[t2])) return true;
  return false;
}
function hs(e51) {
  if (!e51) return true;
  let t2 = e51[0];
  return e51.length <= 1 ? t2 !== `any` : t2 === `==` ? gs(e51[1], e51[2], `==`) : t2 === `!=` ? bs(gs(e51[1], e51[2], `==`)) : t2 === `<` || t2 === `>` || t2 === `<=` || t2 === `>=` ? gs(e51[1], e51[2], t2) : t2 === `any` ? _s(e51.slice(1)) : t2 === `all` ? [`all`].concat(e51.slice(1).map(hs)) : t2 === `none` ? [`all`].concat(e51.slice(1).map(hs).map(bs)) : t2 === `in` ? vs(e51[1], e51.slice(2)) : t2 === `!in` ? bs(vs(e51[1], e51.slice(2))) : t2 === `has` ? ys(e51[1]) : t2 !== `!has` || bs(ys(e51[1]));
}
function gs(e51, t2, n2) {
  switch (e51) {
    case `$type`:
      return [`filter-type-${n2}`, t2];
    case `$id`:
      return [`filter-id-${n2}`, t2];
    default:
      return [`filter-${n2}`, e51, t2];
  }
}
function _s(e51) {
  return [`any`].concat(e51.map(hs));
}
function vs(e51, t2) {
  if (t2.length === 0) return false;
  switch (e51) {
    case `$type`:
      return [`filter-type-in`, [`literal`, t2]];
    case `$id`:
      return [`filter-id-in`, [`literal`, t2]];
    default:
      return t2.length > 200 && !t2.some((e52) => typeof e52 != typeof t2[0]) ? [`filter-in-large`, e51, [`literal`, t2.sort(ps)]] : [`filter-in-small`, e51, [`literal`, t2]];
  }
}
function ys(e51) {
  switch (e51) {
    case `$type`:
      return true;
    case `$id`:
      return [`filter-has-id`];
    default:
      return [`filter-has`, e51];
  }
}
function bs(e51) {
  return [`!`, e51];
}
function xs(e51) {
  let t2 = typeof e51;
  if (t2 === `number` || t2 === `boolean` || t2 === `string` || e51 == null) return JSON.stringify(e51);
  if (Array.isArray(e51)) {
    let t3 = `[`;
    for (let n3 of e51) t3 += `${xs(n3)},`;
    return `${t3}]`;
  }
  let n2 = Object.keys(e51).sort(), r2 = `{`;
  for (let t3 = 0; t3 < n2.length; t3++) r2 += `${JSON.stringify(n2[t3])}:${xs(e51[n2[t3]])},`;
  return `${r2}}`;
}
function Ss(e51) {
  let t2 = ``;
  for (let n2 of Rn) t2 += `/${xs(e51[n2])}`;
  return t2;
}
function Cs(e51, t2) {
  let n2 = {};
  for (let r3 = 0; r3 < e51.length; r3++) {
    let i2 = t2 && t2[e51[r3].id] || Ss(e51[r3]);
    t2 && (t2[e51[r3].id] = i2);
    let a2 = n2[i2];
    a2 ||= n2[i2] = [], a2.push(e51[r3]);
  }
  let r2 = [];
  for (let e52 in n2) r2.push(n2[e52]);
  return r2;
}
function Ts(e51) {
  let t2 = e51.key, n2 = e51.value;
  return n2 ? [new P(t2, n2, `constants have been deprecated as of v8`)] : [];
}
function Es(e51) {
  return e51 instanceof Number || e51 instanceof String || e51 instanceof Boolean ? e51.valueOf() : e51;
}
function Ds(e51) {
  if (Array.isArray(e51)) return e51.map(Ds);
  if (e51 instanceof Object && !(e51 instanceof Number || e51 instanceof String || e51 instanceof Boolean)) {
    let t2 = {};
    for (let n2 in e51) t2[n2] = Ds(e51[n2]);
    return t2;
  }
  return Es(e51);
}
function Os(e51) {
  let t2 = e51.key, n2 = e51.value, r2 = e51.valueSpec || {}, i2 = e51.objectElementValidators || {}, a2 = e51.style, o2 = e51.styleSpec, s2 = e51.validateSpec, c2 = [], l2 = H(n2);
  if (l2 !== `object`) return [new P(t2, n2, `object expected, ${l2} found`)];
  for (let e52 in n2) {
    let l3 = e52.split(`.`)[0], u2 = Ir(r2, l3) || r2[`*`], d2;
    if (Ir(i2, l3)) d2 = i2[l3];
    else if (Ir(r2, l3)) {
      if (n2[e52] === void 0) continue;
      d2 = s2;
    } else if (i2[`*`]) d2 = i2[`*`];
    else if (r2[`*`]) d2 = s2;
    else {
      c2.push(new P(t2, n2[e52], `unknown property "${e52}"`));
      continue;
    }
    c2 = c2.concat(d2({ key: (t2 && `${t2}.`) + e52, value: n2[e52], valueSpec: u2, style: a2, styleSpec: o2, object: n2, objectKey: e52, validateSpec: s2 }, n2));
  }
  for (let e52 in r2) i2[e52] || r2[e52].required && r2[e52].default === void 0 && n2[e52] === void 0 && c2.push(new P(t2, n2, `missing required property "${e52}"`));
  return c2;
}
function ks(e51) {
  let t2 = e51.value, n2 = e51.valueSpec, r2 = e51.validateSpec, i2 = e51.style, a2 = e51.styleSpec, o2 = e51.key, s2 = e51.arrayElementValidator || r2;
  if (H(t2) !== `array`) return [new P(o2, t2, `array expected, ${H(t2)} found`)];
  if (n2.length && t2.length !== n2.length) return [new P(o2, t2, `array length ${n2.length} expected, length ${t2.length} found`)];
  let c2 = { type: n2.value, values: n2.values };
  a2.$version < 7 && (c2.function = n2.function), H(n2.value) === `object` && (c2 = n2.value);
  let l2 = [];
  for (let n3 = 0; n3 < t2.length; n3++) l2 = l2.concat(s2({ array: t2, arrayIndex: n3, value: t2[n3], valueSpec: c2, validateSpec: e51.validateSpec, style: i2, styleSpec: a2, key: `${o2}[${n3}]` }));
  return l2;
}
function As(e51) {
  let t2 = e51.key, n2 = e51.value, r2 = e51.valueSpec, i2 = H(n2);
  return i2 === `number` && n2 !== n2 && (i2 = `NaN`), i2 === `number` ? `minimum` in r2 && n2 < r2.minimum ? [new P(t2, n2, `${n2} is less than the minimum value ${r2.minimum}`)] : `maximum` in r2 && n2 > r2.maximum ? [new P(t2, n2, `${n2} is greater than the maximum value ${r2.maximum}`)] : [] : [new P(t2, n2, `number expected, ${i2} found`)];
}
function js(e51) {
  let t2 = e51.valueSpec, n2 = Es(e51.value.type), r2, i2 = {}, a2, o2, s2 = n2 !== `categorical` && e51.value.property === void 0, c2 = !s2, l2 = H(e51.value.stops) === `array` && H(e51.value.stops[0]) === `array` && H(e51.value.stops[0][0]) === `object`, u2 = Os({ key: e51.key, value: e51.value, valueSpec: e51.styleSpec.function, validateSpec: e51.validateSpec, style: e51.style, styleSpec: e51.styleSpec, objectElementValidators: { stops: d2, default: m2 } });
  return n2 === `identity` && s2 && u2.push(new P(e51.key, e51.value, `missing required property "property"`)), n2 !== `identity` && !e51.value.stops && u2.push(new P(e51.key, e51.value, `missing required property "stops"`)), n2 === `exponential` && e51.valueSpec.expression && !Do(e51.valueSpec) && u2.push(new P(e51.key, e51.value, `exponential functions not supported`)), e51.styleSpec.$version >= 8 && (c2 && !To(e51.valueSpec) ? u2.push(new P(e51.key, e51.value, `property functions not supported`)) : s2 && !Eo(e51.valueSpec) && u2.push(new P(e51.key, e51.value, `zoom functions not supported`))), (n2 === `categorical` || l2) && e51.value.property === void 0 && u2.push(new P(e51.key, e51.value, `"property" property is required`)), u2;
  function d2(e52) {
    if (n2 === `identity`) return [new P(e52.key, e52.value, `identity function may not have a "stops" property`)];
    let t3 = [], r3 = e52.value;
    return t3 = t3.concat(ks({ key: e52.key, value: r3, valueSpec: e52.valueSpec, validateSpec: e52.validateSpec, style: e52.style, styleSpec: e52.styleSpec, arrayElementValidator: f2 })), H(r3) === `array` && r3.length === 0 && t3.push(new P(e52.key, r3, `array must have at least one stop`)), t3;
  }
  function f2(e52) {
    let n3 = [], r3 = e52.value, s3 = e52.key;
    if (H(r3) !== `array`) return [new P(s3, r3, `array expected, ${H(r3)} found`)];
    if (r3.length !== 2) return [new P(s3, r3, `array length 2 expected, length ${r3.length} found`)];
    if (l2) {
      if (H(r3[0]) !== `object`) return [new P(s3, r3, `object expected, ${H(r3[0])} found`)];
      if (r3[0].zoom === void 0) return [new P(s3, r3, `object stop key must have zoom`)];
      if (r3[0].value === void 0) return [new P(s3, r3, `object stop key must have value`)];
      if (o2 && o2 > Es(r3[0].zoom)) return [new P(s3, r3[0].zoom, `stop zoom values must appear in ascending order`)];
      Es(r3[0].zoom) !== o2 && (o2 = Es(r3[0].zoom), a2 = void 0, i2 = {}), n3 = n3.concat(Os({ key: `${s3}[0]`, value: r3[0], valueSpec: { zoom: {} }, validateSpec: e52.validateSpec, style: e52.style, styleSpec: e52.styleSpec, objectElementValidators: { zoom: As, value: p2 } }));
    } else n3 = n3.concat(p2({ key: `${s3}[0]`, value: r3[0], valueSpec: {}, validateSpec: e52.validateSpec, style: e52.style, styleSpec: e52.styleSpec }, r3));
    return Uo(Ds(r3[1])) ? n3.concat([new P(`${s3}[1]`, r3[1], `expressions are not allowed in function stops.`)]) : n3.concat(e52.validateSpec({ key: `${s3}[1]`, value: r3[1], valueSpec: t2, validateSpec: e52.validateSpec, style: e52.style, styleSpec: e52.styleSpec }));
  }
  function p2(e52, o3) {
    let s3 = H(e52.value), c3 = Es(e52.value), l3 = e52.value === null ? o3 : e52.value;
    if (!r2) r2 = s3;
    else if (s3 !== r2) return [new P(e52.key, l3, `${s3} stop domain type must match previous stop domain type ${r2}`)];
    if (s3 !== `number` && s3 !== `string` && s3 !== `boolean`) return [new P(e52.key, l3, `stop domain value must be a number, string, or boolean`)];
    if (s3 !== `number` && n2 !== `categorical`) {
      let r3 = `number expected, ${s3} found`;
      return To(t2) && n2 === void 0 && (r3 += '\nIf you intended to use a categorical function, specify `"type": "categorical"`.'), [new P(e52.key, l3, r3)];
    }
    return n2 === `categorical` && s3 === `number` && (!isFinite(c3) || Math.floor(c3) !== c3) ? [new P(e52.key, l3, `integer expected, found ${c3}`)] : n2 !== `categorical` && s3 === `number` && a2 !== void 0 && c3 < a2 ? [new P(e52.key, l3, `stop domain values must appear in ascending order`)] : (a2 = c3, n2 === `categorical` && c3 in i2 ? [new P(e52.key, l3, `stop domain values must be unique`)] : (i2[c3] = true, []));
  }
  function m2(e52) {
    return e52.validateSpec({ key: e52.key, value: e52.value, valueSpec: t2, validateSpec: e52.validateSpec, style: e52.style, styleSpec: e52.styleSpec });
  }
}
function Ms(e51) {
  let t2 = (e51.expressionContext === `property` ? Jo : Wo)(Ds(e51.value), e51.key, e51.valueSpec);
  if (t2.result === `error`) return t2.value.map((t3) => new P(`${e51.key}${t3.key}`, e51.value, t3.message));
  let n2 = t2.value.expression || t2.value._styleExpression.expression;
  if (e51.expressionContext === `property` && e51.propertyKey === `text-font` && !n2.outputDefined()) return [new P(e51.key, e51.value, `Invalid data expression for "${e51.propertyKey}". Output values must be contained as literals within the expression.`)];
  if (e51.expressionContext === `property` && e51.propertyType === `layout` && !xo(n2)) return [new P(e51.key, e51.value, `"feature-state" data expressions are not supported with layout properties.`)];
  if (e51.expressionContext === `filter` && !xo(n2)) return [new P(e51.key, e51.value, `"feature-state" data expressions are not supported with filters.`)];
  if (e51.expressionContext && e51.expressionContext.indexOf(`cluster`) === 0) {
    if (!So(n2, [`zoom`, `feature-state`])) return [new P(e51.key, e51.value, `"zoom" and "feature-state" expressions are not supported with cluster properties.`)];
    if (e51.expressionContext === `cluster-initial` && !bo(n2)) return [new P(e51.key, e51.value, `Feature data expressions are not supported with initial expression part of cluster properties.`)];
  }
  return [];
}
function Ns(e51) {
  let t2 = e51.value, n2 = e51.key, r2 = H(t2);
  return r2 === `boolean` ? [] : [new P(n2, t2, `boolean expected, ${r2} found`)];
}
function Ps(e51) {
  let t2 = e51.key, n2 = e51.value, r2 = H(n2);
  return r2 === `string` ? B.parse(String(n2)) ? [] : [new P(t2, n2, `color expected, "${n2}" found`)] : [new P(t2, n2, `color expected, ${r2} found`)];
}
function Fs(e51) {
  let t2 = e51.key, n2 = e51.value, r2 = e51.valueSpec, i2 = [];
  return Array.isArray(r2.values) ? r2.values.indexOf(Es(n2)) === -1 && i2.push(new P(t2, n2, `expected one of [${r2.values.join(`, `)}], ${JSON.stringify(n2)} found`)) : Object.keys(r2.values).indexOf(Es(n2)) === -1 && i2.push(new P(t2, n2, `expected one of [${Object.keys(r2.values).join(`, `)}], ${JSON.stringify(n2)} found`)), i2;
}
function Is(e51, t2) {
  let n2 = e51;
  for (let e52 of t2) n2 = n2[e52];
  return n2;
}
function Ls(e51, t2) {
  let n2 = ls(t2);
  return n2 ? [new P(`${e51.key}${n2.path.map((e52) => `[${e52}]`).join(``)}`, Is(e51.value, n2.path), ss(n2.legacyFilter), null, `warning`)] : [];
}
function Rs(e51) {
  let t2 = Ds(e51.value);
  return is(t2) ? [...Ls(e51, t2), ...Ms(Oo({}, e51, { expressionContext: `filter`, valueSpec: { value: `boolean` } }))] : zs(e51);
}
function zs(e51) {
  let t2 = e51.value, n2 = e51.key;
  if (H(t2) !== `array`) return [new P(n2, t2, `array expected, ${H(t2)} found`)];
  let r2 = e51.styleSpec, i2, a2 = [];
  if (t2.length < 1) return [new P(n2, t2, `filter array must have at least 1 element`)];
  switch (a2 = a2.concat(Fs({ key: `${n2}[0]`, value: t2[0], valueSpec: r2.filter_operator, style: e51.style, styleSpec: e51.styleSpec })), Es(t2[0])) {
    case `<`:
    case `<=`:
    case `>`:
    case `>=`:
      t2.length >= 2 && Es(t2[1]) === `$type` && a2.push(new P(n2, t2, `"$type" cannot be use with operator "${t2[0]}"`));
    case `==`:
    case `!=`:
      t2.length !== 3 && a2.push(new P(n2, t2, `filter array for operator "${t2[0]}" must have 3 elements`));
    case `in`:
    case `!in`:
      t2.length >= 2 && (i2 = H(t2[1]), i2 !== `string` && a2.push(new P(`${n2}[1]`, t2[1], `string expected, ${i2} found`)));
      for (let o2 = 2; o2 < t2.length; o2++) i2 = H(t2[o2]), Es(t2[1]) === `$type` ? a2 = a2.concat(Fs({ key: `${n2}[${o2}]`, value: t2[o2], valueSpec: r2.geometry_type, style: e51.style, styleSpec: e51.styleSpec })) : i2 !== `string` && i2 !== `number` && i2 !== `boolean` && a2.push(new P(`${n2}[${o2}]`, t2[o2], `string, number, or boolean expected, ${i2} found`));
      break;
    case `any`:
    case `all`:
    case `none`:
      for (let r3 = 1; r3 < t2.length; r3++) a2 = a2.concat(zs({ key: `${n2}[${r3}]`, value: t2[r3], style: e51.style, styleSpec: e51.styleSpec }));
      break;
    case `has`:
    case `!has`:
      i2 = H(t2[1]), t2.length === 2 ? i2 !== `string` && a2.push(new P(`${n2}[1]`, t2[1], `string expected, ${i2} found`)) : a2.push(new P(n2, t2, `filter array for "${t2[0]}" operator must have 2 elements`));
  }
  return a2;
}
function Bs(e51, t2) {
  let n2 = e51.key, r2 = e51.validateSpec, i2 = e51.style, a2 = e51.styleSpec, o2 = e51.value, s2 = e51.objectKey, c2 = a2[`${t2}_${e51.layerType}`];
  if (!c2) return [];
  let l2 = s2.match(/^(.*)-transition$/);
  if (t2 === `paint` && l2 && c2[l2[1]] && c2[l2[1]].transition) return r2({ key: n2, value: o2, valueSpec: a2.transition, style: i2, styleSpec: a2 });
  let u2 = e51.valueSpec || c2[s2];
  if (!u2) return [new P(n2, o2, `unknown property "${s2}"`)];
  let d2;
  if (H(o2) === `string` && To(u2) && !u2.tokens && (d2 = /^{([^}]+)}$/.exec(o2))) return [new P(n2, o2, `"${s2}" does not support interpolation syntax
Use an identity property function instead: \`{ "type": "identity", "property": ${JSON.stringify(d2[1])} }\`.`)];
  let f2 = [];
  return e51.layerType === `symbol` && s2 === `text-font` && ko(Ds(o2)) && Es(o2.type) === `identity` && f2.push(new P(n2, o2, `"text-font" does not support identity functions`)), f2.concat(r2({ key: e51.key, value: o2, valueSpec: u2, style: i2, styleSpec: a2, expressionContext: `property`, propertyType: t2, propertyKey: s2 }));
}
function Vs(e51) {
  return Bs(e51, `paint`);
}
function Hs(e51) {
  return Bs(e51, `layout`);
}
function Us(e51) {
  let t2 = [], n2 = e51.value, r2 = e51.key, i2 = e51.style, a2 = e51.styleSpec;
  if (H(n2) !== `object`) return [new P(r2, n2, `object expected, ${H(n2)} found`)];
  !n2.type && !n2.ref && t2.push(new P(r2, n2, `either "type" or "ref" is required`));
  let o2 = Es(n2.type), s2 = Es(n2.ref);
  if (n2.id) {
    let a3 = Es(n2.id);
    for (let o3 = 0; o3 < e51.arrayIndex; o3++) {
      let e52 = i2.layers[o3];
      Es(e52.id) === a3 && t2.push(new P(r2, n2.id, `duplicate layer id "${n2.id}", previously used at line ${e52.id.__line__}`));
    }
  }
  if (`ref` in n2) {
    [`type`, `source`, `source-layer`, `filter`, `layout`].forEach((e53) => {
      e53 in n2 && t2.push(new P(r2, n2[e53], `"${e53}" is prohibited for ref layers`));
    });
    let e52;
    i2.layers.forEach((t3) => {
      Es(t3.id) === s2 && (e52 = t3);
    }), e52 ? e52.ref ? t2.push(new P(r2, n2.ref, `ref cannot reference another ref layer`)) : o2 = Es(e52.type) : t2.push(new P(r2, n2.ref, `ref layer "${s2}" not found`));
  } else if (o2 !== `background`) {
    if (!n2.source) t2.push(new P(r2, n2, `missing required property "source"`));
    else {
      let e52 = i2.sources && i2.sources[n2.source], a3 = e52 && Es(e52.type);
      e52 ? a3 === `vector` && o2 === `raster` ? t2.push(new P(r2, n2.source, `layer "${n2.id}" requires a raster source`)) : a3 !== `raster-dem` && o2 === `hillshade` || a3 !== `raster-dem` && o2 === `color-relief` ? t2.push(new P(r2, n2.source, `layer "${n2.id}" requires a raster-dem source`)) : a3 === `raster` && o2 !== `raster` ? t2.push(new P(r2, n2.source, `layer "${n2.id}" requires a vector source`)) : a3 === `vector` && !n2[`source-layer`] ? t2.push(new P(r2, n2, `layer "${n2.id}" must specify a "source-layer"`)) : a3 === `raster-dem` && o2 !== `hillshade` && o2 !== `color-relief` ? t2.push(new P(r2, n2.source, `raster-dem source can only be used with layer type 'hillshade' or 'color-relief'.`)) : o2 === `line` && n2.paint && n2.paint[`line-gradient`] && (a3 !== `geojson` || !e52.lineMetrics) && t2.push(new P(r2, n2, `layer "${n2.id}" specifies a line-gradient, which requires a GeoJSON source with \`lineMetrics\` enabled.`)) : t2.push(new P(r2, n2.source, `source "${n2.source}" not found`));
    }
  }
  return o2 === `raster` && n2.paint?.resampling && n2.paint?.[`raster-resampling`] && t2.push(new P(r2, n2.paint, `layer "${n2.id}" redundantly specifies "resampling" and "raster-resampling" paint properties, but only one is allowed. It is advised to use "resampling".`)), t2 = t2.concat(Os({ key: r2, value: n2, valueSpec: a2.layer, style: e51.style, styleSpec: e51.styleSpec, validateSpec: e51.validateSpec, objectElementValidators: { "*"() {
    return [];
  }, type() {
    return e51.validateSpec({ key: `${r2}.type`, value: n2.type, valueSpec: a2.layer.type, style: e51.style, styleSpec: e51.styleSpec, validateSpec: e51.validateSpec, object: n2, objectKey: `type` });
  }, filter: Rs, layout(e52) {
    return Os({ layer: n2, key: e52.key, value: e52.value, style: e52.style, styleSpec: e52.styleSpec, validateSpec: e52.validateSpec, objectElementValidators: { "*"(e53) {
      return Hs(Oo({ layerType: o2 }, e53));
    } } });
  }, paint(e52) {
    return Os({ layer: n2, key: e52.key, value: e52.value, style: e52.style, styleSpec: e52.styleSpec, validateSpec: e52.validateSpec, objectElementValidators: { "*"(e53) {
      return Vs(Oo({ layerType: o2 }, e53));
    } } });
  } } })), t2;
}
function Ws(e51) {
  let t2 = e51.value, n2 = e51.key, r2 = H(t2);
  return r2 === `string` ? [] : [new P(n2, t2, `string expected, ${r2} found`)];
}
function Gs(e51) {
  let t2 = e51.sourceName ?? ``, n2 = e51.value, r2 = e51.styleSpec, i2 = r2.source_raster_dem, a2 = e51.style, o2 = [], s2 = H(n2);
  if (n2 === void 0) return o2;
  if (s2 !== `object`) return o2.push(new P(`source_raster_dem`, n2, `object expected, ${s2} found`)), o2;
  let c2 = Es(n2.encoding) === `custom`, l2 = [`redFactor`, `greenFactor`, `blueFactor`, `baseShift`], u2 = e51.value.encoding ? `"${e51.value.encoding}"` : `Default`;
  for (let s3 in n2) !c2 && l2.includes(s3) ? o2.push(new P(s3, n2[s3], `In "${t2}": "${s3}" is only valid when "encoding" is set to "custom". ${u2} encoding found`)) : i2[s3] ? o2 = o2.concat(e51.validateSpec({ key: s3, value: n2[s3], valueSpec: i2[s3], validateSpec: e51.validateSpec, style: a2, styleSpec: r2 })) : o2.push(new P(s3, n2[s3], `unknown property "${s3}"`));
  return o2;
}
var Ks = { promoteId: Js };
function qs(e51) {
  let t2 = e51.value, n2 = e51.key, r2 = e51.styleSpec, i2 = e51.style, a2 = e51.validateSpec;
  if (!t2.type) return [new P(n2, t2, `"type" is required`)];
  let o2 = Es(t2.type), s2;
  switch (o2) {
    case `vector`:
    case `raster`:
      return s2 = Os({ key: n2, value: t2, valueSpec: r2[`source_${o2.replace(`-`, `_`)}`], style: e51.style, styleSpec: r2, objectElementValidators: Ks, validateSpec: a2 }), s2;
    case `raster-dem`:
      return s2 = Gs({ sourceName: n2, value: t2, style: e51.style, styleSpec: r2, validateSpec: a2 }), s2;
    case `geojson`:
      if (s2 = Os({ key: n2, value: t2, valueSpec: r2.source_geojson, style: i2, styleSpec: r2, validateSpec: a2, objectElementValidators: Ks }), t2.cluster) for (let e52 in t2.clusterProperties) {
        let [r3, i3] = t2.clusterProperties[e52], o3 = typeof r3 == `string` ? [r3, [`accumulated`], [`get`, e52]] : r3;
        s2.push(...Ms({ key: `${n2}.${e52}.map`, value: i3, validateSpec: a2, expressionContext: `cluster-map` })), s2.push(...Ms({ key: `${n2}.${e52}.reduce`, value: o3, validateSpec: a2, expressionContext: `cluster-reduce` }));
      }
      return s2;
    case `video`:
      return Os({ key: n2, value: t2, valueSpec: r2.source_video, style: i2, validateSpec: a2, styleSpec: r2 });
    case `image`:
      return Os({ key: n2, value: t2, valueSpec: r2.source_image, style: i2, validateSpec: a2, styleSpec: r2 });
    case `canvas`:
      return [new P(n2, null, `Please use runtime APIs to add canvas sources, rather than including them in stylesheets.`, `source.canvas`)];
    default:
      return Fs({ key: `${n2}.type`, value: t2.type, valueSpec: { values: [`vector`, `raster`, `raster-dem`, `geojson`, `video`, `image`] }, style: i2, validateSpec: a2, styleSpec: r2 });
  }
}
function Js({ key: e51, value: t2 }) {
  if (H(t2) === `string`) return Ws({ key: e51, value: t2 });
  {
    let n2 = [];
    for (let r2 in t2) n2.push(...Ws({ key: `${e51}.${r2}`, value: t2[r2] }));
    return n2;
  }
}
function Ys(e51) {
  let t2 = e51.value, n2 = e51.styleSpec, r2 = n2.light, i2 = e51.style, a2 = [], o2 = H(t2);
  if (t2 === void 0) return a2;
  if (o2 !== `object`) return a2 = a2.concat([new P(`light`, t2, `object expected, ${o2} found`)]), a2;
  for (let o3 in t2) {
    let s2 = o3.match(/^(.*)-transition$/);
    a2 = s2 && r2[s2[1]] && r2[s2[1]].transition ? a2.concat(e51.validateSpec({ key: o3, value: t2[o3], valueSpec: n2.transition, validateSpec: e51.validateSpec, style: i2, styleSpec: n2 })) : r2[o3] ? a2.concat(e51.validateSpec({ key: o3, value: t2[o3], valueSpec: r2[o3], validateSpec: e51.validateSpec, style: i2, styleSpec: n2 })) : a2.concat([new P(o3, t2[o3], `unknown property "${o3}"`)]);
  }
  return a2;
}
function Xs(e51) {
  let t2 = e51.value, n2 = e51.styleSpec, r2 = n2.sky, i2 = e51.style, a2 = H(t2);
  if (t2 === void 0) return [];
  if (a2 !== `object`) return [new P(`sky`, t2, `object expected, ${a2} found`)];
  let o2 = [];
  for (let a3 in t2) o2 = r2[a3] ? o2.concat(e51.validateSpec({ key: a3, value: t2[a3], valueSpec: r2[a3], style: i2, styleSpec: n2 })) : o2.concat([new P(a3, t2[a3], `unknown property "${a3}"`)]);
  return o2;
}
function Zs(e51) {
  let t2 = e51.value, n2 = e51.styleSpec, r2 = n2.terrain, i2 = e51.style, a2 = [], o2 = H(t2);
  if (t2 === void 0) return a2;
  if (o2 !== `object`) return a2 = a2.concat([new P(`terrain`, t2, `object expected, ${o2} found`)]), a2;
  for (let o3 in t2) a2 = r2[o3] ? a2.concat(e51.validateSpec({ key: o3, value: t2[o3], valueSpec: r2[o3], validateSpec: e51.validateSpec, style: i2, styleSpec: n2 })) : a2.concat([new P(o3, t2[o3], `unknown property "${o3}"`)]);
  return a2;
}
function Qs(e51) {
  return Ws(e51).length === 0 ? [] : Ms(e51);
}
function $s(e51) {
  return Ws(e51).length === 0 ? [] : Ms(e51);
}
function ec(e51) {
  let t2 = e51.key, n2 = e51.value;
  if (H(n2) === `array`) {
    if (n2.length < 1 || n2.length > 4) return [new P(t2, n2, `padding requires 1 to 4 values; ${n2.length} values found`)];
    let r2 = { type: `number` }, i2 = [];
    for (let a2 = 0; a2 < n2.length; a2++) i2 = i2.concat(e51.validateSpec({ key: `${t2}[${a2}]`, value: n2[a2], validateSpec: e51.validateSpec, valueSpec: r2 }));
    return i2;
  }
  return As({ key: t2, value: n2, valueSpec: {} });
}
function tc(e51) {
  let t2 = e51.key, n2 = e51.value;
  if (H(n2) === `array`) {
    let r2 = { type: `number` };
    if (n2.length < 1) return [new P(t2, n2, `array length at least 1 expected, length 0 found`)];
    let i2 = [];
    for (let a2 = 0; a2 < n2.length; a2++) i2 = i2.concat(e51.validateSpec({ key: `${t2}[${a2}]`, value: n2[a2], validateSpec: e51.validateSpec, valueSpec: r2 }));
    return i2;
  }
  return As({ key: t2, value: n2, valueSpec: {} });
}
function nc(e51) {
  let t2 = e51.key, n2 = e51.value;
  if (H(n2) === `array`) {
    if (n2.length < 1) return [new P(t2, n2, `array length at least 1 expected, length 0 found`)];
    let e52 = [];
    for (let r2 = 0; r2 < n2.length; r2++) e52 = e52.concat(Ps({ key: `${t2}[${r2}]`, value: n2[r2], valueSpec: {} }));
    return e52;
  }
  return Ps({ key: t2, value: n2, valueSpec: {} });
}
function rc(e51) {
  let t2 = e51.key, n2 = e51.value, r2 = H(n2), i2 = e51.styleSpec;
  if (r2 !== `array` || n2.length < 1 || n2.length % 2 != 0) return [new P(t2, n2, `variableAnchorOffsetCollection requires a non-empty array of even length`)];
  let a2 = [];
  for (let r3 = 0; r3 < n2.length; r3 += 2) a2 = a2.concat(Fs({ key: `${t2}[${r3}]`, value: n2[r3], valueSpec: i2.layout_symbol[`text-anchor`] })), a2 = a2.concat(ks({ key: `${t2}[${r3 + 1}]`, value: n2[r3 + 1], valueSpec: { length: 2, value: `number` }, validateSpec: e51.validateSpec, style: e51.style, styleSpec: i2 }));
  return a2;
}
function ic(e51) {
  let t2 = [], n2 = e51.value, r2 = e51.key;
  if (Array.isArray(n2)) {
    let i2 = [], a2 = [];
    for (let o2 in n2) n2[o2].id && i2.includes(n2[o2].id) && t2.push(new P(r2, n2, `all the sprites' ids must be unique, but ${n2[o2].id} is duplicated`)), i2.push(n2[o2].id), n2[o2].url && a2.includes(n2[o2].url) && t2.push(new P(r2, n2, `all the sprites' URLs must be unique, but ${n2[o2].url} is duplicated`)), a2.push(n2[o2].url), t2 = t2.concat(Os({ key: `${r2}[${o2}]`, value: n2[o2], valueSpec: { id: { type: `string`, required: true }, url: { type: `string`, required: true } }, validateSpec: e51.validateSpec }));
    return t2;
  }
  return Ws({ key: r2, value: n2 });
}
function ac(e51) {
  let t2 = e51.value, n2 = e51.styleSpec, r2 = n2.projection, i2 = e51.style, a2 = H(t2);
  if (t2 === void 0) return [];
  if (a2 !== `object`) return [new P(`projection`, t2, `object expected, ${a2} found`)];
  let o2 = [];
  for (let a3 in t2) o2 = r2[a3] ? o2.concat(e51.validateSpec({ key: a3, value: t2[a3], valueSpec: r2[a3], style: i2, styleSpec: n2 })) : o2.concat([new P(a3, t2[a3], `unknown property "${a3}"`)]);
  return o2;
}
function oc(e51) {
  let t2 = e51.key, n2 = e51.value;
  n2 = n2 instanceof String ? n2.valueOf() : n2;
  let r2 = H(n2);
  return r2 === `array` && !cc(n2) && !sc(n2) ? [new P(t2, n2, `projection expected, invalid array ${JSON.stringify(n2)} found`)] : [`array`, `string`].includes(r2) ? [] : [new P(t2, n2, `projection expected, invalid type "${r2}" found`)];
}
function sc(e51) {
  return !![`interpolate`, `step`, `literal`].includes(e51[0]);
}
function cc(e51) {
  return Array.isArray(e51) && e51.length === 3 && typeof e51[0] == `string` && typeof e51[1] == `string` && typeof e51[2] == `number`;
}
function lc(e51) {
  return !!e51 && e51.constructor === Object;
}
function uc(e51) {
  return lc(e51.value) ? [] : [new P(e51.key, e51.value, `object expected, ${H(e51.value)} found`)];
}
function dc(e51) {
  let t2 = e51.key, n2 = e51.value, r2 = e51.validateSpec, i2 = e51.styleSpec, a2 = e51.style;
  if (!lc(n2)) return [new P(t2, n2, `object expected, ${H(n2)} found`)];
  let o2 = [];
  for (let e52 in n2) {
    let s2 = n2[e52], c2 = H(s2);
    if (c2 === `string`) o2.push(...Ws({ key: `${t2}.${e52}`, value: s2 }));
    else if (c2 === `array`) {
      let n3 = { url: { type: `string`, required: true }, "unicode-range": { type: `array`, value: `string` } };
      for (let [c3, l2] of s2.entries()) o2.push(...Os({ key: `${t2}.${e52}[${c3}]`, value: l2, valueSpec: n3, styleSpec: i2, style: a2, validateSpec: r2 }));
    } else o2.push(new P(`${t2}.${e52}`, s2, `string or array expected, ${c2} found`));
  }
  return o2;
}
var fc = { "*"() {
  return [];
}, array: ks, boolean: Ns, number: As, color: Ps, constants: Ts, enum: Fs, filter: Rs, function: js, layer: Us, object: Os, source: qs, light: Ys, sky: Xs, terrain: Zs, projection: ac, projectionDefinition: oc, string: Ws, formatted: Qs, resolvedImage: $s, padding: ec, numberArray: tc, colorArray: nc, variableAnchorOffsetCollection: rc, sprite: ic, state: uc, fontFaces: dc };
function pc(e51) {
  let t2 = e51.value, n2 = e51.valueSpec, r2 = e51.styleSpec;
  return e51.validateSpec = pc, n2.expression && ko(Es(t2)) ? js(e51) : n2.expression && Uo(Ds(t2)) ? Ms(e51) : n2.type && fc[n2.type] ? fc[n2.type](e51) : Os(Oo({}, e51, { valueSpec: n2.type ? r2[n2.type] : n2 }));
}
function mc(e51) {
  let t2 = e51.value, n2 = e51.key, r2 = Ws(e51);
  return r2.length ? r2 : (t2.indexOf(`{fontstack}`) === -1 && r2.push(new P(n2, t2, `"glyphs" url must include a "{fontstack}" token`)), t2.indexOf(`{range}`) === -1 && r2.push(new P(n2, t2, `"glyphs" url must include a "{range}" token`)), r2);
}
function hc(e51, t2 = M) {
  let n2 = [];
  return n2 = n2.concat(pc({ key: ``, value: e51, valueSpec: t2.$root, styleSpec: t2, style: e51, validateSpec: pc, objectElementValidators: { glyphs: mc, "*"() {
    return [];
  } } })), e51.constants && (n2 = n2.concat(Ts({ key: `constants`, value: e51.constants, style: e51, styleSpec: t2, validateSpec: pc }))), _c(n2);
}
hc.source = vc(gc(qs)), hc.sprite = vc(gc(ic)), hc.glyphs = vc(gc(mc)), hc.light = vc(gc(Ys)), hc.sky = vc(gc(Xs)), hc.terrain = vc(gc(Zs)), hc.state = vc(gc(uc)), hc.layer = vc(gc(Us)), hc.filter = vc(gc(Rs)), hc.paintProperty = vc(gc(Vs)), hc.layoutProperty = vc(gc(Hs));
function gc(e51) {
  return function(t2) {
    return e51(Object.assign({}, t2, { validateSpec: pc }));
  };
}
function _c(e51) {
  return [].concat(e51).sort((e52, t2) => e52.line - t2.line);
}
function vc(e51) {
  return function(...t2) {
    return _c(e51.apply(this, t2));
  };
}
var yc = { type: `enum`, "property-type": `data-constant`, expression: { interpolated: false, parameters: [`global-state`] }, values: { visible: {}, none: {} }, transition: false, default: `visible` };
var bc = class {
  constructor(e51, t2, n2) {
    this._rootKey = t2, this._globalState = n2, this.setValue(e51);
  }
  evaluate() {
    return this._literalValue ?? this._compiledValue.evaluate({});
  }
  setValue(e51) {
    if (e51 == null || e51 === `visible` || e51 === `none`) {
      this._literalValue = e51 === `none` ? `none` : `visible`, this._compiledValue = void 0, this._globalStateRefs = /* @__PURE__ */ new Set();
      return;
    }
    let t2 = Wo(e51, this._rootKey, yc, this._globalState);
    if (t2.result === `error`) throw this._literalValue = `visible`, this._compiledValue = void 0, Error(t2.value.map((e52) => `${e52.key}: ${e52.message}`).join(`, `));
    this._literalValue = void 0, this._compiledValue = t2.value, this._globalStateRefs = Qo(t2.value.expression);
  }
  getGlobalStateRefs() {
    return this._globalStateRefs;
  }
};
function xc(e51, t2, n2) {
  return new bc(e51, t2, n2);
}
var Sc = hc;
var Cc = new Set(Object.keys(M).filter((e51) => e51.startsWith(`source_`)).map((e51) => e51.slice(7).replaceAll(`_`, `-`)));
function Ec(e51, t2) {
  let n2 = false;
  for (let r2 of t2) {
    if (r2.severity === `warning`) {
      It(r2.message);
      continue;
    }
    e51.fire(new In(Error(r2.message))), n2 = true;
  }
  return n2;
}
function Dc(e51, t2, n2, r2) {
  return r2?.validate !== false && Ec(e51, t2({ styleSpec: M, ...n2 }));
}
var Oc = class e36 {
  constructor(e51, t2, n2) {
    let r2 = this.cells = [];
    if (e51 instanceof ArrayBuffer) {
      this.arrayBuffer = e51;
      let i3 = new Int32Array(this.arrayBuffer);
      e51 = i3[0], t2 = i3[1], n2 = i3[2], this.d = t2 + 2 * n2;
      for (let e52 = 0; e52 < this.d * this.d; e52++) {
        let t3 = i3[3 + e52], n3 = i3[3 + e52 + 1];
        r2.push(t3 === n3 ? null : i3.subarray(t3, n3));
      }
      let a2 = i3[3 + r2.length], o2 = i3[3 + r2.length + 1];
      this.keys = i3.subarray(a2, o2), this.bboxes = i3.subarray(o2), this.insert = this._insertReadonly;
    } else {
      this.d = t2 + 2 * n2;
      for (let e52 = 0; e52 < this.d * this.d; e52++) r2.push([]);
      this.keys = [], this.bboxes = [];
    }
    this.n = t2, this.extent = e51, this.padding = n2, this.scale = t2 / e51, this.uid = 0;
    let i2 = n2 / t2 * e51;
    this.min = -i2, this.max = e51 + i2;
  }
  insert(e51, t2, n2, r2, i2) {
    this._forEachCell(t2, n2, r2, i2, this._insertCell, this.uid++, void 0, void 0), this.keys.push(e51), this.bboxes.push(t2), this.bboxes.push(n2), this.bboxes.push(r2), this.bboxes.push(i2);
  }
  _insertReadonly() {
    throw Error(`Cannot insert into a GridIndex created from an ArrayBuffer.`);
  }
  _insertCell(e51, t2, n2, r2, i2, a2) {
    this.cells[i2].push(a2);
  }
  query(e51, t2, n2, r2, i2) {
    let a2 = this.min, o2 = this.max;
    if (e51 <= a2 && t2 <= a2 && o2 <= n2 && o2 <= r2 && !i2) return [...this.keys];
    {
      let a3 = [];
      return this._forEachCell(e51, t2, n2, r2, this._queryCell, a3, {}, i2), a3;
    }
  }
  _queryCell(e51, t2, n2, r2, i2, a2, o2, s2) {
    let c2 = this.cells[i2];
    if (c2 !== null) {
      let i3 = this.keys, l2 = this.bboxes;
      for (let u2 of c2) if (o2[u2] === void 0) {
        let c3 = u2 * 4;
        (s2 ? s2(l2[c3 + 0], l2[c3 + 1], l2[c3 + 2], l2[c3 + 3]) : e51 <= l2[c3 + 2] && t2 <= l2[c3 + 3] && n2 >= l2[c3 + 0] && r2 >= l2[c3 + 1]) ? (o2[u2] = true, a2.push(i3[u2])) : o2[u2] = false;
      }
    }
  }
  _forEachCell(e51, t2, n2, r2, i2, a2, o2, s2) {
    let c2 = this._convertToCellCoord(e51), l2 = this._convertToCellCoord(t2), u2 = this._convertToCellCoord(n2), d2 = this._convertToCellCoord(r2);
    for (let f2 = c2; f2 <= u2; f2++) for (let c3 = l2; c3 <= d2; c3++) {
      let l3 = this.d * c3 + f2;
      if (!(s2 && !s2(this._convertFromCellCoord(f2), this._convertFromCellCoord(c3), this._convertFromCellCoord(f2 + 1), this._convertFromCellCoord(c3 + 1))) && i2.call(this, e51, t2, n2, r2, l3, a2, o2, s2)) return;
    }
  }
  _convertFromCellCoord(e51) {
    return (e51 - this.padding) / this.scale;
  }
  _convertToCellCoord(e51) {
    return Math.max(0, Math.min(this.d - 1, Math.floor(e51 * this.scale) + this.padding));
  }
  toArrayBuffer() {
    if (this.arrayBuffer) return this.arrayBuffer;
    let e51 = this.cells, t2 = 3 + this.cells.length + 1 + 1, n2 = 0;
    for (let e52 of this.cells) n2 += e52.length;
    let r2 = new Int32Array(t2 + n2 + this.keys.length + this.bboxes.length);
    r2[0] = this.extent, r2[1] = this.n, r2[2] = this.padding;
    let i2 = t2;
    for (let t3 = 0; t3 < e51.length; t3++) {
      let n3 = e51[t3];
      r2[3 + t3] = i2, r2.set(n3, i2), i2 += n3.length;
    }
    return r2[3 + e51.length] = i2, r2.set(this.keys, i2), i2 += this.keys.length, r2[3 + e51.length + 1] = i2, r2.set(this.bboxes, i2), i2 += this.bboxes.length, r2.buffer;
  }
  static serialize(e51, t2) {
    let n2 = e51.toArrayBuffer();
    return t2 && t2.push(n2), { buffer: n2 };
  }
  static deserialize(t2) {
    return new e36(t2.buffer);
  }
};
var kc = {};
function U(e51, t2, n2 = {}) {
  if (kc[e51]) throw Error(`${e51} is already registered.`);
  Object.defineProperty(t2, "_classRegistryKey", { value: e51, writeable: false }), kc[e51] = { klass: t2, omit: n2.omit || [], shallow: n2.shallow || [] };
}
U(`Object`, Object), U(`Set`, Set), U(`TransferableGridIndex`, Oc), U(`Color`, B), U(`Error`, Error), U(`AJAXError`, Cn), U(`ResolvedImage`, ti), U(`StylePropertyFunction`, Yo), U(`StyleExpression`, Bo, { omit: [`_evaluator`] }), U(`ZoomDependentExpression`, Ko), U(`ZoomConstantExpression`, Go), U(`CompoundExpression`, fo, { omit: [`_evaluate`] });
for (let e51 in uo) uo[e51]._classRegistryKey || U(`Expression_${e51}`, uo[e51]);
function Ac(e51) {
  return e51 && typeof ArrayBuffer < `u` && (e51 instanceof ArrayBuffer || e51.constructor?.name === `ArrayBuffer`);
}
function jc(e51) {
  let t2 = e51.constructor;
  return e51.$name || t2._classRegistryKey;
}
function Mc(e51) {
  if (typeof e51 != `object` || !e51) return false;
  let t2 = jc(e51);
  return t2 && t2 !== `Object`;
}
function Nc(e51) {
  return !Mc(e51) && (e51 == null || typeof e51 == `boolean` || typeof e51 == `number` || typeof e51 == `string` || e51 instanceof Boolean || e51 instanceof Number || e51 instanceof String || e51 instanceof Date || e51 instanceof RegExp || e51 instanceof Blob || e51 instanceof Error || Ac(e51) || Wt(e51) || ArrayBuffer.isView(e51) || e51 instanceof ImageData);
}
function Pc(e51, t2) {
  if (Nc(e51)) return (Ac(e51) || Wt(e51)) && t2 && t2.push(e51), ArrayBuffer.isView(e51) && t2 && t2.push(e51.buffer), e51 instanceof ImageData && t2 && t2.push(e51.data.buffer), e51;
  if (Array.isArray(e51)) {
    let n3 = [];
    for (let r3 of e51) n3.push(Pc(r3, t2));
    return n3;
  }
  if (typeof e51 != `object`) throw Error(`can't serialize object of type ${typeof e51}`);
  let n2 = jc(e51);
  if (!n2) throw Error(`can't serialize object of unregistered class ${e51.constructor.name}`);
  if (!kc[n2]) throw Error(`${n2} is not registered.`);
  let { klass: r2 } = kc[n2], i2 = r2.serialize ? r2.serialize(e51, t2) : {};
  if (!r2.serialize) {
    for (let r3 in e51) {
      if (!e51.hasOwnProperty(r3) || kc[n2].omit.includes(r3)) continue;
      let a2 = e51[r3];
      a2 !== void 0 && (i2[r3] = kc[n2].shallow.includes(r3) ? a2 : Pc(a2, t2));
    }
    e51 instanceof Error && (i2.message = e51.message);
  } else if (i2 === t2?.[t2.length - 1]) throw Error(`statically serialized object won't survive transfer of $name property`);
  if (i2.$name) throw Error(`$name property is reserved for worker serialization logic.`);
  return n2 !== `Object` && (i2.$name = n2), i2;
}
function Fc(e51) {
  if (Nc(e51)) return e51;
  if (Array.isArray(e51)) return e51.map(Fc);
  if (typeof e51 != `object`) throw Error(`can't deserialize object of type ${typeof e51}`);
  let t2 = jc(e51) || `Object`;
  if (!kc[t2]) throw Error(`can't deserialize unregistered class ${t2}`);
  let { klass: n2 } = kc[t2];
  if (!n2) throw Error(`can't deserialize unregistered class ${t2}`);
  if (n2.deserialize) return n2.deserialize(e51);
  let r2 = Object.create(n2.prototype);
  for (let n3 of Object.keys(e51)) {
    if (n3 === `$name`) continue;
    let i2 = e51[n3];
    r2[n3] = kc[t2].shallow.includes(n3) ? i2 : Fc(i2);
  }
  return r2;
}
var Ic = class {
  constructor() {
    this.first = true;
  }
  update(e51, t2) {
    let n2 = Math.floor(e51);
    return this.first ? (this.first = false, this.lastIntegerZoom = n2, this.lastIntegerZoomTime = 0, this.lastZoom = e51, this.lastFloorZoom = n2, true) : (this.lastFloorZoom > n2 ? (this.lastIntegerZoom = n2 + 1, this.lastIntegerZoomTime = t2) : this.lastFloorZoom < n2 && (this.lastIntegerZoom = n2, this.lastIntegerZoomTime = t2), e51 !== this.lastZoom && (this.lastZoom = e51, this.lastFloorZoom = n2, true));
  }
};
function Rc(e51) {
  return /[\u02EA\u02EB\u2E80-\u2FDF\u2FF0-\u303F\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FD-\u30FF\u3105-\u312F\u31A0-\u4DBF\u4E00-\uA48C\uA490-\uA4C6\uF900-\uFA6D\uFA70-\uFAD9\uFE10-\uFE1F\uFE30-\uFE4F\uFF00-\uFFEF]|\uD81B[\uDFE0-\uDFFF]|[\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFFF]|\uD82C[\uDC00-\uDEFB]|\uD83C[\uDE00-\uDEFF]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79]/gim.test(String.fromCodePoint(e51));
}
function zc(e51) {
  return /[\u02EA\u02EB\u1100-\u11FF\u1400-\u167F\u18B0-\u18F5\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u3007\u3012\u3013\u3020-\u302F\u3031-\u303F\u3041-\u3096\u309D-\u30FB\u30FD-\u30FF\u3105-\u312F\u3131-\u318E\u3190-\uA48C\uA490-\uA4C6\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFE10-\uFE1F\uFE30-\uFE48\uFE50-\uFE57\uFE5F-\uFE62\uFE67-\uFE6F\uFF00-\uFF07\uFF0A-\uFF0C\uFF0E-\uFF19\uFF1F-\uFF3A\uFF3C\uFF3E\uFF40-\uFF5A\uFFE0-\uFFE2\uFFE4-\uFFE7]|\uD802[\uDD80-\uDD9F]|\uD805[\uDD80-\uDDFF]|\uD806[\uDE00-\uDEBF]|\uD811[\uDC00-\uDE7F]|\uD81B[\uDFE0-\uDFE4\uDFF0-\uDFF6]|[\uD81C-\uD822\uD83D\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD30-\uDEFB]|\uD833[\uDEC0-\uDFCF]|\uD834[\uDC00-\uDDFF\uDEE0-\uDF7F]|\uD836[\uDC00-\uDEAF]|\uD83C[\uDC00-\uDE00\uDF00-\uDFFF]|\uD83E[\uDD00-\uDEFF]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79]/gim.test(String.fromCodePoint(e51));
}
function Bc(e51) {
  return /[\xA7\xA9\xAE\xB1\xBC-\xBE\xD7\xF7\u2016\u2020\u2021\u2030\u2031\u203B\u203C\u2042\u2047-\u2049\u2051\u2100-\u218F\u221E\u2234\u2235\u2300-\u2307\u230C-\u231F\u2324-\u2328\u232B\u237D-\u239A\u23BE-\u23CD\u23CF\u23D1-\u23DB\u23E2-\u2422\u2424-\u24FF\u25A0-\u2619\u2620-\u2767\u2776-\u2793\u2B12-\u2B2F\u2B50-\u2B59\u2BB8-\u2BEB\u3000-\u303F\u30A0-\u30FF\uE000-\uF8FF\uFE30-\uFE6F\uFF00-\uFFEF\uFFFC\uFFFD]|[\uDB80-\uDBFF][\uDC00-\uDFFF]/gim.test(String.fromCodePoint(e51));
}
function Vc(e51) {
  return /[\u0900-\u0DFF\u0F00-\u109F\u1780-\u17FF]/gim.test(String.fromCodePoint(e51));
}
function Hc(e51) {
  return /\s/u.test(String.fromCodePoint(e51));
}
function Uc(e51) {
  for (let t2 of e51) if (zc(t2.codePointAt(0))) return true;
  return false;
}
function Wc(e51) {
  for (let t2 of e51) if (!qc(t2.codePointAt(0))) return false;
  return true;
}
function Gc(e51) {
  let t2 = e51.map((e52) => {
    try {
      return RegExp(`\\p{sc=${e52}}`, `u`).source;
    } catch {
      return null;
    }
  }).filter((e52) => e52);
  return new RegExp(t2.join(`|`), `u`);
}
var Kc = Gc([`Arab`, `Dupl`, `Mong`, `Ougr`, `Syrc`]);
function qc(e51) {
  return !Kc.test(String.fromCodePoint(e51));
}
function Jc(e51) {
  return !(zc(e51) || Bc(e51));
}
function Yc(e51) {
  return /\p{sc=Arab}/u.test(String.fromCodePoint(e51));
}
var Xc = Gc(`Adlm.Arab.Armi.Avst.Chrs.Cprt.Egyp.Elym.Gara.Hatr.Hebr.Hung.Khar.Lydi.Mand.Mani.Mend.Merc.Mero.Narb.Nbat.Nkoo.Orkh.Palm.Phli.Phlp.Phnx.Prti.Rohg.Samr.Sarb.Sogo.Syrc.Thaa.Todr.Yezi`.split(`.`));
function Zc(e51) {
  return Xc.test(String.fromCodePoint(e51));
}
function Qc(e51, t2) {
  return !t2 && Zc(e51) ? false : !Vc(e51);
}
function $c(e51) {
  for (let t2 of e51) if (Zc(t2.codePointAt(0))) return true;
  return false;
}
function el(e51, t2) {
  for (let n2 of e51) if (!Qc(n2.codePointAt(0), t2)) return false;
  return true;
}
var tl = new class {
  constructor() {
    this.TIMEOUT = 5e3, this.applyArabicShaping = null, this.processBidirectionalText = null, this.processStyledBidirectionalText = null, this.pluginStatus = `unavailable`, this.pluginURL = null, this.loadScriptResolve = () => {
    };
  }
  setState(e51) {
    this.pluginStatus = e51.pluginStatus, this.pluginURL = e51.pluginURL;
  }
  getState() {
    return { pluginStatus: this.pluginStatus, pluginURL: this.pluginURL };
  }
  setMethods(e51) {
    if (tl.isParsed()) throw Error(`RTL text plugin already registered.`);
    this.applyArabicShaping = e51.applyArabicShaping, this.processBidirectionalText = e51.processBidirectionalText, this.processStyledBidirectionalText = e51.processStyledBidirectionalText, this.loadScriptResolve();
  }
  isParsed() {
    return this.applyArabicShaping != null && this.processBidirectionalText != null && this.processStyledBidirectionalText != null;
  }
  getRTLTextPluginStatus() {
    return this.pluginStatus;
  }
  async syncState(e51, t2) {
    if (this.isParsed()) return this.getState();
    if (e51.pluginStatus !== `loading`) return this.setState(e51), e51;
    let n2 = e51.pluginURL, r2 = new Promise((e52) => {
      this.loadScriptResolve = e52;
    }), i2 = new Promise((e52) => setTimeout(() => e52(), this.TIMEOUT));
    if (await t2(n2), await Promise.race([r2, i2]), this.isParsed()) {
      let e52 = { pluginStatus: `loaded`, pluginURL: n2 };
      return this.setState(e52), e52;
    }
    throw this.setState({ pluginStatus: `error`, pluginURL: `` }), Error(`RTL Text Plugin failed to import scripts from ${n2}`);
  }
}();
var W = class {
  constructor(e51, t2) {
    this.isSupportedScript = nl, this.zoom = e51, t2 ? (this.now = t2.now || 0, this.fadeDuration = t2.fadeDuration || 0, this.zoomHistory = t2.zoomHistory || new Ic(), this.transition = t2.transition || {}) : (this.now = 0, this.fadeDuration = 0, this.zoomHistory = new Ic(), this.transition = {});
  }
  crossFadingFactor() {
    return this.fadeDuration === 0 ? 1 : Math.min((this.now - this.zoomHistory.lastIntegerZoomTime) / this.fadeDuration, 1);
  }
  getCrossfadeParameters() {
    let e51 = this.zoom, t2 = e51 - Math.floor(e51), n2 = this.crossFadingFactor();
    return e51 > this.zoomHistory.lastIntegerZoom ? { fromScale: 2, toScale: 1, t: t2 + (1 - t2) * n2 } : { fromScale: 0.5, toScale: 1, t: 1 - (1 - n2) * t2 };
  }
};
function nl(e51) {
  return el(e51, tl.getRTLTextPluginStatus() === `loaded`);
}
var rl = `-transition`;
var il = class {
  constructor(e51, t2, n2, r2) {
    this.property = e51, this.value = t2, this.expression = Xo(t2 === void 0 ? e51.specification.default : t2, n2, e51.specification, r2);
  }
  isDataDriven() {
    return this.expression.kind === `source` || this.expression.kind === `composite`;
  }
  getGlobalStateRefs() {
    return this.expression.globalStateRefs || /* @__PURE__ */ new Set();
  }
  possiblyEvaluate(e51, t2, n2) {
    return this.property.possiblyEvaluate(this, e51, t2, n2);
  }
};
var al = class {
  constructor(e51, t2, n2) {
    this.property = e51, this.value = new il(e51, void 0, t2, n2);
  }
  transitioned(e51, t2) {
    return new sl(this.property, this.value, t2, St({}, e51.transition, this.transition), e51.now);
  }
  untransitioned() {
    return new sl(this.property, this.value, null, {}, 0);
  }
};
var ol = class {
  constructor(e51, t2, n2) {
    this._properties = e51, this._values = Object.create(e51.defaultTransitionablePropertyValues), this._globalState = n2, this._rootKey = t2;
  }
  _propertyRootKey(e51) {
    return `${this._rootKey}.${String(e51)}`;
  }
  hasProperty(e51) {
    return e51 in this._properties.defaultTransitionablePropertyValues;
  }
  getValue(e51) {
    return Pt(this._values[e51].value.value);
  }
  setValue(e51, t2) {
    Object.hasOwn(this._values, e51) || (this._values[e51] = new al(this._values[e51].property, this._propertyRootKey(e51), this._globalState)), this._values[e51].value = new il(this._values[e51].property, t2 === null ? void 0 : Pt(t2), this._propertyRootKey(e51), this._globalState);
  }
  getTransition(e51) {
    return Pt(this._values[e51].transition);
  }
  setTransition(e51, t2) {
    Object.hasOwn(this._values, e51) || (this._values[e51] = new al(this._values[e51].property, this._propertyRootKey(e51), this._globalState)), this._values[e51].transition = Pt(t2) || void 0;
  }
  serialize() {
    let e51 = {};
    for (let t2 of Object.keys(this._values)) {
      let n2 = this.getValue(t2);
      n2 !== void 0 && (e51[t2] = n2);
      let r2 = this.getTransition(t2);
      r2 !== void 0 && (e51[`${t2}${rl}`] = r2);
    }
    return e51;
  }
  transitioned(e51, t2) {
    let n2 = new cl(this._properties);
    for (let r2 of Object.keys(this._values)) n2._values[r2] = this._values[r2].transitioned(e51, t2._values[r2]);
    return n2;
  }
  untransitioned() {
    let e51 = new cl(this._properties);
    for (let t2 of Object.keys(this._values)) e51._values[t2] = this._values[t2].untransitioned();
    return e51;
  }
};
var sl = class {
  constructor(e51, t2, n2, r2, i2) {
    this.property = e51, this.value = t2, this.begin = i2 + r2.delay || 0, this.end = this.begin + r2.duration || 0, e51.specification.transition && (r2.delay || r2.duration) && (this.prior = n2);
  }
  possiblyEvaluate(e51, t2, n2) {
    let r2 = e51.now || 0, i2 = this.value.possiblyEvaluate(e51, t2, n2), a2 = this.prior;
    if (!a2) return i2;
    if (r2 > this.end || this.value.isDataDriven()) return this.prior = null, i2;
    if (r2 < this.begin) return a2.possiblyEvaluate(e51, t2, n2);
    {
      let o2 = (r2 - this.begin) / (this.end - this.begin);
      return this.property.interpolate(a2.possiblyEvaluate(e51, t2, n2), i2, _t(o2));
    }
  }
};
var cl = class {
  constructor(e51) {
    this._properties = e51, this._values = Object.create(e51.defaultTransitioningPropertyValues);
  }
  possiblyEvaluate(e51, t2, n2) {
    let r2 = new dl(this._properties);
    for (let i2 of Object.keys(this._values)) r2._values[i2] = this._values[i2].possiblyEvaluate(e51, t2, n2);
    return r2;
  }
  hasTransition() {
    for (let e51 of Object.keys(this._values)) if (this._values[e51].prior) return true;
    return false;
  }
};
var ll = class {
  constructor(e51, t2, n2) {
    this._properties = e51, this._values = Object.create(e51.defaultPropertyValues), this._globalState = n2, this._rootKey = t2;
  }
  _propertyRootKey(e51) {
    return `${this._rootKey}.${String(e51)}`;
  }
  hasValue(e51) {
    return this._values[e51].value !== void 0;
  }
  hasProperty(e51) {
    return e51 in this._properties.defaultPropertyValues;
  }
  getValue(e51) {
    return Pt(this._values[e51].value);
  }
  setValue(e51, t2) {
    this._values[e51] = new il(this._values[e51].property, t2 === null ? void 0 : Pt(t2), this._propertyRootKey(e51), this._globalState);
  }
  serialize() {
    let e51 = {};
    for (let t2 of Object.keys(this._values)) {
      let n2 = this.getValue(t2);
      n2 !== void 0 && (e51[t2] = n2);
    }
    return e51;
  }
  possiblyEvaluate(e51, t2, n2) {
    let r2 = new dl(this._properties);
    for (let i2 of Object.keys(this._values)) r2._values[i2] = this._values[i2].possiblyEvaluate(e51, t2, n2);
    return r2;
  }
};
var ul = class {
  constructor(e51, t2, n2) {
    this.property = e51, this.value = t2, this.parameters = n2;
  }
  isConstant() {
    return this.value.kind === `constant`;
  }
  constantOr(e51) {
    return this.value.kind === `constant` ? this.value.value : e51;
  }
  evaluate(e51, t2, n2, r2) {
    return this.property.evaluate(this.value, this.parameters, e51, t2, n2, r2);
  }
};
var dl = class {
  constructor(e51) {
    this._properties = e51, this._values = Object.create(e51.defaultPossiblyEvaluatedValues);
  }
  get(e51) {
    return this._values[e51];
  }
};
function fl(e51) {
  if (Array.isArray(e51)) return e51.length;
  let t2 = e51?.values;
  return Array.isArray(t2) ? t2.length : void 0;
}
function pl(e51, t2) {
  let n2 = fl(e51), r2 = fl(t2);
  return n2 !== void 0 && r2 !== void 0 && n2 !== r2;
}
var G = class {
  constructor(e51, t2) {
    this.specification = e51, this.name = t2;
  }
  possiblyEvaluate(e51, t2) {
    if (e51.isDataDriven()) throw Error(`Value should not be data driven`);
    return e51.expression.evaluate(t2);
  }
  interpolate(e51, t2, n2) {
    if (pl(e51, t2)) return It(`Property "${this.name}" is trying to interpolate arrays of different lengths. Rendering may 'jump'.`), t2;
    let r2 = this.specification.type, i2 = Oi[r2];
    return i2 ? i2(e51, t2, n2) : e51;
  }
};
var K = class {
  constructor(e51, t2, n2) {
    this.specification = e51, this.name = t2, this.overrides = n2;
  }
  possiblyEvaluate(e51, t2, n2, r2) {
    return e51.expression.kind === `constant` || e51.expression.kind === `camera` ? new ul(this, { kind: `constant`, value: e51.expression.evaluate(t2, null, {}, n2, r2) }, t2) : new ul(this, e51.expression, t2);
  }
  interpolate(e51, t2, n2) {
    if (e51.value.kind !== `constant` || t2.value.kind !== `constant`) return e51;
    if (e51.value.value === void 0 || t2.value.value === void 0) return new ul(this, { kind: `constant`, value: void 0 }, e51.parameters);
    if (pl(e51.value.value, t2.value.value)) return It(`Property "${this.name}" is trying to interpolate arrays of different lengths. Rendering may 'jump'.`), t2;
    let r2 = this.specification.type, i2 = Oi[r2];
    if (i2) {
      let r3 = i2(e51.value.value, t2.value.value, n2);
      return new ul(this, { kind: `constant`, value: r3 }, e51.parameters);
    }
    return e51;
  }
  evaluate(e51, t2, n2, r2, i2, a2) {
    return e51.kind === `constant` ? e51.value : e51.evaluate(t2, n2, r2, i2, a2);
  }
};
var ml = class extends K {
  possiblyEvaluate(e51, t2, n2, r2) {
    if (e51.value === void 0) return new ul(this, { kind: `constant`, value: void 0 }, t2);
    if (e51.expression.kind === `constant`) {
      let i2 = e51.expression.evaluate(t2, null, {}, n2, r2), a2 = e51.property.specification.type === `resolvedImage` && typeof i2 != `string` ? i2.name : i2, o2 = this._calculate(a2, a2, a2, t2);
      return new ul(this, { kind: `constant`, value: o2 }, t2);
    }
    if (e51.expression.kind === `camera`) {
      let n3 = this._calculate(e51.expression.evaluate({ zoom: t2.zoom - 1 }), e51.expression.evaluate({ zoom: t2.zoom }), e51.expression.evaluate({ zoom: t2.zoom + 1 }), t2);
      return new ul(this, { kind: `constant`, value: n3 }, t2);
    }
    return new ul(this, e51.expression, t2);
  }
  evaluate(e51, t2, n2, r2, i2, a2) {
    if (e51.kind === `source`) {
      let o2 = e51.evaluate(t2, n2, r2, i2, a2);
      return this._calculate(o2, o2, o2, t2);
    }
    return e51.kind === `composite` ? this._calculate(e51.evaluate({ zoom: Math.floor(t2.zoom) - 1 }, n2, r2), e51.evaluate({ zoom: Math.floor(t2.zoom) }, n2, r2), e51.evaluate({ zoom: Math.floor(t2.zoom) + 1 }, n2, r2), t2) : e51.value;
  }
  _calculate(e51, t2, n2, r2) {
    return r2.zoom > r2.zoomHistory.lastIntegerZoom ? { from: e51, to: t2 } : { from: n2, to: t2 };
  }
  interpolate(e51) {
    return e51;
  }
};
var hl = class {
  constructor(e51, t2) {
    this.specification = e51, this.name = t2;
  }
  possiblyEvaluate(e51, t2, n2, r2) {
    if (e51.value !== void 0) {
      if (e51.expression.kind === `constant`) {
        let i2 = e51.expression.evaluate(t2, null, {}, n2, r2);
        return this._calculate(i2, i2, i2, t2);
      }
      return this._calculate(e51.expression.evaluate(new W(Math.floor(t2.zoom - 1), t2)), e51.expression.evaluate(new W(Math.floor(t2.zoom), t2)), e51.expression.evaluate(new W(Math.floor(t2.zoom + 1), t2)), t2);
    }
  }
  _calculate(e51, t2, n2, r2) {
    return r2.zoom > r2.zoomHistory.lastIntegerZoom ? { from: e51, to: t2 } : { from: n2, to: t2 };
  }
  interpolate(e51) {
    return e51;
  }
};
var gl = class {
  constructor(e51, t2) {
    this.specification = e51, this.name = t2;
  }
  possiblyEvaluate(e51, t2, n2, r2) {
    return !!e51.expression.evaluate(t2, null, {}, n2, r2);
  }
  interpolate() {
    return false;
  }
};
var _l = class {
  constructor(e51) {
    this.properties = e51, this.defaultPropertyValues = {}, this.defaultTransitionablePropertyValues = {}, this.defaultTransitioningPropertyValues = {}, this.defaultPossiblyEvaluatedValues = {}, this.overridableProperties = [];
    for (let t2 in e51) {
      let n2 = e51[t2];
      n2.specification.overridable && this.overridableProperties.push(t2);
      let r2 = this.defaultPropertyValues[t2] = new il(n2, void 0, n2.name, void 0), i2 = this.defaultTransitionablePropertyValues[t2] = new al(n2, n2.name, void 0);
      this.defaultTransitioningPropertyValues[t2] = i2.untransitioned(), this.defaultPossiblyEvaluatedValues[t2] = r2.possiblyEvaluate({});
    }
  }
};
U(`DataDrivenProperty`, K), U(`DataConstantProperty`, G), U(`CrossFadedDataDrivenProperty`, ml), U(`CrossFadedProperty`, hl), U(`ColorRampProperty`, gl);
var vl = ` is a PAINT property not a LAYOUT property. Use get/setPaintProperty instead?`;
var yl = ` is a LAYOUT property not a PAINT property. Use get/setLayoutProperty instead?`;
var bl = class extends Ln {
  constructor(e51, t2, n2) {
    if (super(), this.id = e51.id, this.type = e51.type, this._globalState = n2, this._featureFilter = { filter: () => true, needGeometry: false, getGlobalStateRefs: () => /* @__PURE__ */ new Set() }, this._visibilityExpression = xc(this.visibility, `layers[${this.id}].layout.visibility`, n2), e51.type !== `custom` && (this.metadata = e51.metadata, this.minzoom = e51.minzoom, this.maxzoom = e51.maxzoom, e51.type !== `background` && (this.source = e51.source, this.sourceLayer = e51[`source-layer`], this.filter = e51.filter, this._featureFilter = fs(e51.filter, `layers[${this.id}].filter`, n2)), t2.layout && (this._unevaluatedLayout = new ll(t2.layout, `layers[${this.id}].layout`, n2)), t2.paint)) {
      this._transitionablePaint = new ol(t2.paint, `layers[${this.id}].paint`, n2);
      for (let t3 in e51.paint) this.setPaintProperty(t3, e51.paint[t3], { validate: false });
      for (let t3 in e51.layout) this.setLayoutProperty(t3, e51.layout[t3], { validate: false });
      this._transitioningPaint = this._transitionablePaint.untransitioned(), this.paint = new dl(t2.paint);
    }
  }
  setFilter(e51) {
    this.filter = e51, this._featureFilter = fs(e51, `layers[${this.id}].filter`, this._globalState);
  }
  getCrossfadeParameters() {
    return this._crossfadeParameters;
  }
  getLayoutProperty(e51) {
    if (e51 === `visibility`) return this.visibility;
    if (this._transitionablePaint?.hasProperty(e51)) throw Error(e51 + vl);
    if (!this._unevaluatedLayout) throw Error(`Cannot get layout property "${e51}" on layer type "${this.type}" which has no layout properties.`);
    return this._unevaluatedLayout.getValue(e51);
  }
  getLayoutAffectingGlobalStateRefs() {
    let e51 = /* @__PURE__ */ new Set();
    for (let t2 of this._visibilityExpression.getGlobalStateRefs()) e51.add(t2);
    if (this._unevaluatedLayout) for (let t2 in this._unevaluatedLayout._values) {
      let n2 = this._unevaluatedLayout._values[t2];
      for (let t3 of n2.getGlobalStateRefs()) e51.add(t3);
    }
    for (let t2 of this._featureFilter.getGlobalStateRefs()) e51.add(t2);
    return e51;
  }
  getPaintAffectingGlobalStateRefs() {
    let e51 = new globalThis.Map();
    if (this._transitionablePaint) for (let t2 in this._transitionablePaint._values) {
      let n2 = this._transitionablePaint._values[t2].value;
      for (let r2 of n2.getGlobalStateRefs()) {
        let i2 = e51.get(r2) ?? [];
        i2.push({ name: t2, value: n2.value }), e51.set(r2, i2);
      }
    }
    return e51;
  }
  getVisibilityAffectingGlobalStateRefs() {
    return this._visibilityExpression.getGlobalStateRefs();
  }
  setLayoutProperty(e51, t2, n2 = {}) {
    if (e51 === `visibility`) {
      this.visibility = t2, this._visibilityExpression.setValue(t2), this.recalculateVisibility();
      return;
    }
    if (this._transitionablePaint?.hasProperty(e51)) {
      this.fire(new In(Error(e51 + vl)));
      return;
    }
    t2 != null && this._validate(Sc.layoutProperty, `layers.${this.id}.layout.${e51}`, e51, t2, n2) || this._unevaluatedLayout.setValue(e51, t2);
  }
  getPaintProperty(e51) {
    if (e51.endsWith(`-transition`)) {
      let t2 = e51.slice(0, -11);
      if (t2 === `visibility` || this._unevaluatedLayout?.hasProperty(t2)) throw Error(e51 + yl);
      return this._transitionablePaint.getTransition(t2);
    }
    if (e51 === `visibility` || this._unevaluatedLayout?.hasProperty(e51)) throw Error(e51 + yl);
    return this._transitionablePaint.getValue(e51);
  }
  setPaintProperty(e51, t2, n2 = {}) {
    if (e51 === `visibility` || this._unevaluatedLayout?.hasProperty(e51)) return this.fire(new In(Error(e51 + yl))), false;
    if (t2 != null && this._validate(Sc.paintProperty, `layers.${this.id}.paint.${e51}`, e51, t2, n2)) return false;
    if (e51.endsWith(`-transition`)) return this._transitionablePaint.setTransition(e51.slice(0, -11), t2 || void 0), false;
    {
      let n3 = this._transitionablePaint._values[e51], r2 = n3.property.specification[`property-type`] === `cross-faded-data-driven`, i2 = n3.value.isDataDriven(), a2 = n3.value;
      this._transitionablePaint.setValue(e51, t2), this._handleSpecialPaintPropertyUpdate(e51);
      let o2 = this._transitionablePaint._values[e51].value;
      return o2.isDataDriven() || i2 || r2 || this._handleOverridablePaintPropertyUpdate(e51, a2, o2);
    }
  }
  _handleSpecialPaintPropertyUpdate(e51) {
  }
  _handleOverridablePaintPropertyUpdate(e51, t2, n2) {
    return false;
  }
  isHidden(e51 = this.minzoom, t2 = false) {
    return this.minzoom && e51 < (t2 ? Math.floor(this.minzoom) : this.minzoom) || this.maxzoom && e51 >= this.maxzoom ? true : this._evaluatedVisibility === `none`;
  }
  updateTransitions(e51) {
    this._transitioningPaint = this._transitionablePaint.transitioned(e51, this._transitioningPaint);
  }
  hasTransition() {
    return this._transitioningPaint.hasTransition();
  }
  recalculateVisibility() {
    this._evaluatedVisibility = this._visibilityExpression.evaluate();
  }
  recalculate(e51, t2) {
    e51.getCrossfadeParameters && (this._crossfadeParameters = e51.getCrossfadeParameters()), this._unevaluatedLayout && (this.layout = this._unevaluatedLayout.possiblyEvaluate(e51, void 0, t2)), this.paint = this._transitioningPaint.possiblyEvaluate(e51, void 0, t2);
  }
  serialize() {
    let e51 = { id: this.id, type: this.type, source: this.source, "source-layer": this.sourceLayer, metadata: this.metadata, minzoom: this.minzoom, maxzoom: this.maxzoom, filter: this.filter, layout: this._unevaluatedLayout?.serialize(), paint: this._transitionablePaint?.serialize() };
    return this.visibility && (e51.layout ||= {}, e51.layout.visibility = this.visibility), Mt(e51, (e52, t2) => e52 !== void 0 && !(t2 === `layout` && !Object.keys(e52).length) && !(t2 === `paint` && !Object.keys(e52).length));
  }
  _validate(e51, t2, n2, r2, i2 = {}) {
    return Dc(this, e51, { key: t2, layerType: this.type, objectKey: n2, value: r2 }, i2);
  }
  is3D() {
    return false;
  }
  isTileClipped() {
    return false;
  }
  hasOffscreenPass() {
    return false;
  }
  resize() {
  }
  isStateDependent() {
    for (let e51 in this.paint._values) {
      let t2 = this.paint.get(e51);
      if (!(!(t2 instanceof ul) || !To(t2.property.specification)) && (t2.value.kind === `source` || t2.value.kind === `composite`) && t2.value.isStateDependent) return true;
    }
    return false;
  }
};
var xl;
var Sl = () => xl ||= new _l({ "raster-opacity": new G(M.paint_raster[`raster-opacity`], `raster-opacity`), "raster-hue-rotate": new G(M.paint_raster[`raster-hue-rotate`], `raster-hue-rotate`), "raster-brightness-min": new G(M.paint_raster[`raster-brightness-min`], `raster-brightness-min`), "raster-brightness-max": new G(M.paint_raster[`raster-brightness-max`], `raster-brightness-max`), "raster-saturation": new G(M.paint_raster[`raster-saturation`], `raster-saturation`), "raster-contrast": new G(M.paint_raster[`raster-contrast`], `raster-contrast`), resampling: new G(M.paint_raster.resampling, `resampling`), "raster-resampling": new G(M.paint_raster[`raster-resampling`], `raster-resampling`), "raster-fade-duration": new G(M.paint_raster[`raster-fade-duration`], `raster-fade-duration`) });
var Cl = { get paint() {
  return Sl();
} };
var Tl = class extends bl {
  constructor(e51, t2) {
    super(e51, Cl, t2);
  }
};
var El = { Int8: Int8Array, Uint8: Uint8Array, Int16: Int16Array, Uint16: Uint16Array, Int32: Int32Array, Uint32: Uint32Array, Float32: Float32Array };
var Dl = class {
  constructor(e51, t2) {
    this._structArray = e51, this._pos1 = t2 * this.size, this._pos2 = this._pos1 / 2, this._pos4 = this._pos1 / 4, this._pos8 = this._pos1 / 8;
  }
};
var q = class {
  constructor() {
    this.isTransferred = false, this.capacity = -1, this.resize(0);
  }
  static serialize(e51, t2) {
    return e51._trim(), t2 && (e51.isTransferred = true, t2.push(e51.arrayBuffer)), { length: e51.length, arrayBuffer: e51.arrayBuffer };
  }
  static deserialize(e51) {
    let t2 = Object.create(this.prototype);
    return t2.arrayBuffer = e51.arrayBuffer, t2.length = e51.length, t2.capacity = e51.arrayBuffer.byteLength / t2.bytesPerElement, t2._refreshViews(), t2;
  }
  _trim() {
    this.length !== this.capacity && (this.capacity = this.length, this.arrayBuffer = this.arrayBuffer.slice(0, this.length * this.bytesPerElement), this._refreshViews());
  }
  clear() {
    this.length = 0;
  }
  resize(e51) {
    this.reserve(e51), this.length = e51;
  }
  reserve(e51) {
    if (e51 > this.capacity) {
      this.capacity = Math.max(e51, Math.floor(this.capacity * 5), 128), this.arrayBuffer = new ArrayBuffer(this.capacity * this.bytesPerElement);
      let t2 = this.uint8;
      this._refreshViews(), t2 && this.uint8.set(t2);
    }
  }
  _refreshViews() {
    throw Error(`_refreshViews() must be implemented by each concrete StructArray layout`);
  }
  freeBufferAfterUpload() {
    this.arrayBuffer = new ArrayBuffer(0), this._refreshViews();
  }
};
function J(e51, t2 = 1) {
  let n2 = 0, r2 = 0;
  return { members: e51.map((e52) => {
    let i2 = Ol(e52.type), a2 = n2 = kl(n2, Math.max(t2, i2)), o2 = e52.components || 1;
    return r2 = Math.max(r2, i2), n2 += i2 * o2, { name: e52.name, type: e52.type, components: o2, offset: a2 };
  }), size: kl(n2, Math.max(r2, t2)), alignment: t2 };
}
function Ol(e51) {
  return El[e51].BYTES_PER_ELEMENT;
}
function kl(e51, t2) {
  return Math.ceil(e51 / t2) * t2;
}
var Al = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2) {
    let n2 = this.length;
    return this.resize(n2 + 1), this.emplace(n2, e51, t2);
  }
  emplace(e51, t2, n2) {
    let r2 = e51 * 2;
    return this.int16[r2 + 0] = t2, this.int16[r2 + 1] = n2, e51;
  }
};
Al.prototype.bytesPerElement = 4, U(`StructArrayLayout2i4`, Al);
var jl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2) {
    let r2 = this.length;
    return this.resize(r2 + 1), this.emplace(r2, e51, t2, n2);
  }
  emplace(e51, t2, n2, r2) {
    let i2 = e51 * 3;
    return this.int16[i2 + 0] = t2, this.int16[i2 + 1] = n2, this.int16[i2 + 2] = r2, e51;
  }
};
jl.prototype.bytesPerElement = 6, U(`StructArrayLayout3i6`, jl);
var Ml = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2) {
    let i2 = this.length;
    return this.resize(i2 + 1), this.emplace(i2, e51, t2, n2, r2);
  }
  emplace(e51, t2, n2, r2, i2) {
    let a2 = e51 * 4;
    return this.int16[a2 + 0] = t2, this.int16[a2 + 1] = n2, this.int16[a2 + 2] = r2, this.int16[a2 + 3] = i2, e51;
  }
};
Ml.prototype.bytesPerElement = 8, U(`StructArrayLayout4i8`, Ml);
var Nl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2) {
    let o2 = this.length;
    return this.resize(o2 + 1), this.emplace(o2, e51, t2, n2, r2, i2, a2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = e51 * 6;
    return this.int16[s2 + 0] = t2, this.int16[s2 + 1] = n2, this.int16[s2 + 2] = r2, this.int16[s2 + 3] = i2, this.int16[s2 + 4] = a2, this.int16[s2 + 5] = o2, e51;
  }
};
Nl.prototype.bytesPerElement = 12, U(`StructArrayLayout2i4i12`, Nl);
var Pl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2) {
    let o2 = this.length;
    return this.resize(o2 + 1), this.emplace(o2, e51, t2, n2, r2, i2, a2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = e51 * 4, c2 = e51 * 8;
    return this.int16[s2 + 0] = t2, this.int16[s2 + 1] = n2, this.uint8[c2 + 4] = r2, this.uint8[c2 + 5] = i2, this.uint8[c2 + 6] = a2, this.uint8[c2 + 7] = o2, e51;
  }
};
Pl.prototype.bytesPerElement = 8, U(`StructArrayLayout2i4ub8`, Pl);
var Fl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2) {
    let n2 = this.length;
    return this.resize(n2 + 1), this.emplace(n2, e51, t2);
  }
  emplace(e51, t2, n2) {
    let r2 = e51 * 2;
    return this.float32[r2 + 0] = t2, this.float32[r2 + 1] = n2, e51;
  }
};
Fl.prototype.bytesPerElement = 8, U(`StructArrayLayout2f8`, Fl);
var Il = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2) {
    let u2 = this.length;
    return this.resize(u2 + 1), this.emplace(u2, e51, t2, n2, r2, i2, a2, o2, s2, c2, l2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2) {
    let d2 = e51 * 10;
    return this.uint16[d2 + 0] = t2, this.uint16[d2 + 1] = n2, this.uint16[d2 + 2] = r2, this.uint16[d2 + 3] = i2, this.uint16[d2 + 4] = a2, this.uint16[d2 + 5] = o2, this.uint16[d2 + 6] = s2, this.uint16[d2 + 7] = c2, this.uint16[d2 + 8] = l2, this.uint16[d2 + 9] = u2, e51;
  }
};
Il.prototype.bytesPerElement = 20, U(`StructArrayLayout10ui20`, Il);
var Ll = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2, o2, s2) {
    let c2 = this.length;
    return this.resize(c2 + 1), this.emplace(c2, e51, t2, n2, r2, i2, a2, o2, s2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
    let l2 = e51 * 8;
    return this.uint16[l2 + 0] = t2, this.uint16[l2 + 1] = n2, this.uint16[l2 + 2] = r2, this.uint16[l2 + 3] = i2, this.uint16[l2 + 4] = a2, this.uint16[l2 + 5] = o2, this.uint16[l2 + 6] = s2, this.uint16[l2 + 7] = c2, e51;
  }
};
Ll.prototype.bytesPerElement = 16, U(`StructArrayLayout8ui16`, Ll);
var Rl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2) {
    let f2 = this.length;
    return this.resize(f2 + 1), this.emplace(f2, e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2) {
    let p2 = e51 * 12;
    return this.int16[p2 + 0] = t2, this.int16[p2 + 1] = n2, this.int16[p2 + 2] = r2, this.int16[p2 + 3] = i2, this.uint16[p2 + 4] = a2, this.uint16[p2 + 5] = o2, this.uint16[p2 + 6] = s2, this.uint16[p2 + 7] = c2, this.int16[p2 + 8] = l2, this.int16[p2 + 9] = u2, this.int16[p2 + 10] = d2, this.int16[p2 + 11] = f2, e51;
  }
};
Rl.prototype.bytesPerElement = 24, U(`StructArrayLayout4i4ui4i24`, Rl);
var zl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2) {
    let r2 = this.length;
    return this.resize(r2 + 1), this.emplace(r2, e51, t2, n2);
  }
  emplace(e51, t2, n2, r2) {
    let i2 = e51 * 3;
    return this.float32[i2 + 0] = t2, this.float32[i2 + 1] = n2, this.float32[i2 + 2] = r2, e51;
  }
};
zl.prototype.bytesPerElement = 12, U(`StructArrayLayout3f12`, zl);
var Bl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint32 = new Uint32Array(this.arrayBuffer);
  }
  emplaceBack(e51) {
    let t2 = this.length;
    return this.resize(t2 + 1), this.emplace(t2, e51);
  }
  emplace(e51, t2) {
    let n2 = e51 * 1;
    return this.uint32[n2 + 0] = t2, e51;
  }
};
Bl.prototype.bytesPerElement = 4, U(`StructArrayLayout1ul4`, Bl);
var Vl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer), this.uint32 = new Uint32Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
    let l2 = this.length;
    return this.resize(l2 + 1), this.emplace(l2, e51, t2, n2, r2, i2, a2, o2, s2, c2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2) {
    let u2 = e51 * 10, d2 = e51 * 5;
    return this.int16[u2 + 0] = t2, this.int16[u2 + 1] = n2, this.int16[u2 + 2] = r2, this.int16[u2 + 3] = i2, this.int16[u2 + 4] = a2, this.int16[u2 + 5] = o2, this.uint32[d2 + 3] = s2, this.uint16[u2 + 8] = c2, this.uint16[u2 + 9] = l2, e51;
  }
};
Vl.prototype.bytesPerElement = 20, U(`StructArrayLayout6i1ul2ui20`, Vl);
var Hl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2) {
    let o2 = this.length;
    return this.resize(o2 + 1), this.emplace(o2, e51, t2, n2, r2, i2, a2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = e51 * 6;
    return this.int16[s2 + 0] = t2, this.int16[s2 + 1] = n2, this.int16[s2 + 2] = r2, this.int16[s2 + 3] = i2, this.int16[s2 + 4] = a2, this.int16[s2 + 5] = o2, e51;
  }
};
Hl.prototype.bytesPerElement = 12, U(`StructArrayLayout2i2i2i12`, Hl);
var Ul = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2) {
    let a2 = this.length;
    return this.resize(a2 + 1), this.emplace(a2, e51, t2, n2, r2, i2);
  }
  emplace(e51, t2, n2, r2, i2, a2) {
    let o2 = e51 * 4, s2 = e51 * 8;
    return this.float32[o2 + 0] = t2, this.float32[o2 + 1] = n2, this.float32[o2 + 2] = r2, this.int16[s2 + 6] = i2, this.int16[s2 + 7] = a2, e51;
  }
};
Ul.prototype.bytesPerElement = 16, U(`StructArrayLayout2f1f2i16`, Ul);
var Wl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2) {
    let o2 = this.length;
    return this.resize(o2 + 1), this.emplace(o2, e51, t2, n2, r2, i2, a2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = e51 * 16, c2 = e51 * 4, l2 = e51 * 8;
    return this.uint8[s2 + 0] = t2, this.uint8[s2 + 1] = n2, this.float32[c2 + 1] = r2, this.float32[c2 + 2] = i2, this.int16[l2 + 6] = a2, this.int16[l2 + 7] = o2, e51;
  }
};
Wl.prototype.bytesPerElement = 16, U(`StructArrayLayout2ub2f2i16`, Wl);
var Gl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2) {
    let r2 = this.length;
    return this.resize(r2 + 1), this.emplace(r2, e51, t2, n2);
  }
  emplace(e51, t2, n2, r2) {
    let i2 = e51 * 3;
    return this.uint16[i2 + 0] = t2, this.uint16[i2 + 1] = n2, this.uint16[i2 + 2] = r2, e51;
  }
};
Gl.prototype.bytesPerElement = 6, U(`StructArrayLayout3ui6`, Gl);
var Kl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer), this.uint32 = new Uint32Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2) {
    let _ = this.length;
    return this.resize(_ + 1), this.emplace(_, e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2, _) {
    let v = e51 * 24, y = e51 * 12, b = e51 * 48;
    return this.int16[v + 0] = t2, this.int16[v + 1] = n2, this.uint16[v + 2] = r2, this.uint16[v + 3] = i2, this.uint32[y + 2] = a2, this.uint32[y + 3] = o2, this.uint32[y + 4] = s2, this.uint16[v + 10] = c2, this.uint16[v + 11] = l2, this.uint16[v + 12] = u2, this.float32[y + 7] = d2, this.float32[y + 8] = f2, this.uint8[b + 36] = p2, this.uint8[b + 37] = m2, this.uint8[b + 38] = h2, this.uint32[y + 10] = g2, this.int16[v + 22] = _, e51;
  }
};
Kl.prototype.bytesPerElement = 48, U(`StructArrayLayout2i2ui3ul3ui2f3ub1ul1i48`, Kl);
var ql = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.int16 = new Int16Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer), this.uint32 = new Uint32Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2, _, v, y, b, x, S, C, w, T, E, D) {
    let O = this.length;
    return this.resize(O + 1), this.emplace(O, e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2, _, v, y, b, x, S, C, w, T, E, D);
  }
  emplace(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2, _, v, y, b, x, S, C, w, T, E, D, O) {
    let k = e51 * 32, A = e51 * 16;
    return this.int16[k + 0] = t2, this.int16[k + 1] = n2, this.int16[k + 2] = r2, this.int16[k + 3] = i2, this.int16[k + 4] = a2, this.int16[k + 5] = o2, this.int16[k + 6] = s2, this.int16[k + 7] = c2, this.uint16[k + 8] = l2, this.uint16[k + 9] = u2, this.uint16[k + 10] = d2, this.uint16[k + 11] = f2, this.uint16[k + 12] = p2, this.uint16[k + 13] = m2, this.uint16[k + 14] = h2, this.uint16[k + 15] = g2, this.uint16[k + 16] = _, this.uint16[k + 17] = v, this.uint16[k + 18] = y, this.uint16[k + 19] = b, this.uint16[k + 20] = x, this.uint16[k + 21] = S, this.uint16[k + 22] = C, this.uint32[A + 12] = w, this.float32[A + 13] = T, this.float32[A + 14] = E, this.uint16[k + 30] = D, this.uint16[k + 31] = O, e51;
  }
};
ql.prototype.bytesPerElement = 64, U(`StructArrayLayout8i15ui1ul2f2ui64`, ql);
var Jl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51) {
    let t2 = this.length;
    return this.resize(t2 + 1), this.emplace(t2, e51);
  }
  emplace(e51, t2) {
    let n2 = e51 * 1;
    return this.float32[n2 + 0] = t2, e51;
  }
};
Jl.prototype.bytesPerElement = 4, U(`StructArrayLayout1f4`, Jl);
var Yl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2) {
    let r2 = this.length;
    return this.resize(r2 + 1), this.emplace(r2, e51, t2, n2);
  }
  emplace(e51, t2, n2, r2) {
    let i2 = e51 * 6, a2 = e51 * 3;
    return this.uint16[i2 + 0] = t2, this.float32[a2 + 1] = n2, this.float32[a2 + 2] = r2, e51;
  }
};
Yl.prototype.bytesPerElement = 12, U(`StructArrayLayout1ui2f12`, Yl);
var Xl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint32 = new Uint32Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2) {
    let r2 = this.length;
    return this.resize(r2 + 1), this.emplace(r2, e51, t2, n2);
  }
  emplace(e51, t2, n2, r2) {
    let i2 = e51 * 2, a2 = e51 * 4;
    return this.uint32[i2 + 0] = t2, this.uint16[a2 + 2] = n2, this.uint16[a2 + 3] = r2, e51;
  }
};
Xl.prototype.bytesPerElement = 8, U(`StructArrayLayout1ul2ui8`, Xl);
var Zl = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2) {
    let n2 = this.length;
    return this.resize(n2 + 1), this.emplace(n2, e51, t2);
  }
  emplace(e51, t2, n2) {
    let r2 = e51 * 2;
    return this.uint16[r2 + 0] = t2, this.uint16[r2 + 1] = n2, e51;
  }
};
Zl.prototype.bytesPerElement = 4, U(`StructArrayLayout2ui4`, Zl);
var Ql = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.uint16 = new Uint16Array(this.arrayBuffer);
  }
  emplaceBack(e51) {
    let t2 = this.length;
    return this.resize(t2 + 1), this.emplace(t2, e51);
  }
  emplace(e51, t2) {
    let n2 = e51 * 1;
    return this.uint16[n2 + 0] = t2, e51;
  }
};
Ql.prototype.bytesPerElement = 2, U(`StructArrayLayout1ui2`, Ql);
var $l = class extends q {
  _refreshViews() {
    this.uint8 = new Uint8Array(this.arrayBuffer), this.float32 = new Float32Array(this.arrayBuffer);
  }
  emplaceBack(e51, t2, n2, r2) {
    let i2 = this.length;
    return this.resize(i2 + 1), this.emplace(i2, e51, t2, n2, r2);
  }
  emplace(e51, t2, n2, r2, i2) {
    let a2 = e51 * 4;
    return this.float32[a2 + 0] = t2, this.float32[a2 + 1] = n2, this.float32[a2 + 2] = r2, this.float32[a2 + 3] = i2, e51;
  }
};
$l.prototype.bytesPerElement = 16, U(`StructArrayLayout4f16`, $l);
var eu = class extends Dl {
  get anchorPointX() {
    return this._structArray.int16[this._pos2 + 0];
  }
  get anchorPointY() {
    return this._structArray.int16[this._pos2 + 1];
  }
  get x1() {
    return this._structArray.int16[this._pos2 + 2];
  }
  get y1() {
    return this._structArray.int16[this._pos2 + 3];
  }
  get x2() {
    return this._structArray.int16[this._pos2 + 4];
  }
  get y2() {
    return this._structArray.int16[this._pos2 + 5];
  }
  get featureIndex() {
    return this._structArray.uint32[this._pos4 + 3];
  }
  get sourceLayerIndex() {
    return this._structArray.uint16[this._pos2 + 8];
  }
  get bucketIndex() {
    return this._structArray.uint16[this._pos2 + 9];
  }
  get anchorPoint() {
    return new l(this.anchorPointX, this.anchorPointY);
  }
};
eu.prototype.size = 20;
var tu = class extends Vl {
  get(e51) {
    return new eu(this, e51);
  }
};
U(`CollisionBoxArray`, tu);
var nu = class extends Dl {
  get anchorX() {
    return this._structArray.int16[this._pos2 + 0];
  }
  get anchorY() {
    return this._structArray.int16[this._pos2 + 1];
  }
  get glyphStartIndex() {
    return this._structArray.uint16[this._pos2 + 2];
  }
  get numGlyphs() {
    return this._structArray.uint16[this._pos2 + 3];
  }
  get vertexStartIndex() {
    return this._structArray.uint32[this._pos4 + 2];
  }
  get lineStartIndex() {
    return this._structArray.uint32[this._pos4 + 3];
  }
  get lineLength() {
    return this._structArray.uint32[this._pos4 + 4];
  }
  get segment() {
    return this._structArray.uint16[this._pos2 + 10];
  }
  get lowerSize() {
    return this._structArray.uint16[this._pos2 + 11];
  }
  get upperSize() {
    return this._structArray.uint16[this._pos2 + 12];
  }
  get lineOffsetX() {
    return this._structArray.float32[this._pos4 + 7];
  }
  get lineOffsetY() {
    return this._structArray.float32[this._pos4 + 8];
  }
  get writingMode() {
    return this._structArray.uint8[this._pos1 + 36];
  }
  get placedOrientation() {
    return this._structArray.uint8[this._pos1 + 37];
  }
  set placedOrientation(e51) {
    this._structArray.uint8[this._pos1 + 37] = e51;
  }
  get hidden() {
    return this._structArray.uint8[this._pos1 + 38];
  }
  set hidden(e51) {
    this._structArray.uint8[this._pos1 + 38] = e51;
  }
  get crossTileID() {
    return this._structArray.uint32[this._pos4 + 10];
  }
  set crossTileID(e51) {
    this._structArray.uint32[this._pos4 + 10] = e51;
  }
  get associatedIconIndex() {
    return this._structArray.int16[this._pos2 + 22];
  }
};
nu.prototype.size = 48;
var ru = class extends Kl {
  get(e51) {
    return new nu(this, e51);
  }
};
U(`PlacedSymbolArray`, ru);
var iu = class extends Dl {
  get anchorX() {
    return this._structArray.int16[this._pos2 + 0];
  }
  get anchorY() {
    return this._structArray.int16[this._pos2 + 1];
  }
  get rightJustifiedTextSymbolIndex() {
    return this._structArray.int16[this._pos2 + 2];
  }
  get centerJustifiedTextSymbolIndex() {
    return this._structArray.int16[this._pos2 + 3];
  }
  get leftJustifiedTextSymbolIndex() {
    return this._structArray.int16[this._pos2 + 4];
  }
  get verticalPlacedTextSymbolIndex() {
    return this._structArray.int16[this._pos2 + 5];
  }
  get placedIconSymbolIndex() {
    return this._structArray.int16[this._pos2 + 6];
  }
  get verticalPlacedIconSymbolIndex() {
    return this._structArray.int16[this._pos2 + 7];
  }
  get key() {
    return this._structArray.uint16[this._pos2 + 8];
  }
  get textBoxStartIndex() {
    return this._structArray.uint16[this._pos2 + 9];
  }
  get textBoxEndIndex() {
    return this._structArray.uint16[this._pos2 + 10];
  }
  get verticalTextBoxStartIndex() {
    return this._structArray.uint16[this._pos2 + 11];
  }
  get verticalTextBoxEndIndex() {
    return this._structArray.uint16[this._pos2 + 12];
  }
  get iconBoxStartIndex() {
    return this._structArray.uint16[this._pos2 + 13];
  }
  get iconBoxEndIndex() {
    return this._structArray.uint16[this._pos2 + 14];
  }
  get verticalIconBoxStartIndex() {
    return this._structArray.uint16[this._pos2 + 15];
  }
  get verticalIconBoxEndIndex() {
    return this._structArray.uint16[this._pos2 + 16];
  }
  get featureIndex() {
    return this._structArray.uint16[this._pos2 + 17];
  }
  get numHorizontalGlyphVertices() {
    return this._structArray.uint16[this._pos2 + 18];
  }
  get numVerticalGlyphVertices() {
    return this._structArray.uint16[this._pos2 + 19];
  }
  get numIconVertices() {
    return this._structArray.uint16[this._pos2 + 20];
  }
  get numVerticalIconVertices() {
    return this._structArray.uint16[this._pos2 + 21];
  }
  get useRuntimeCollisionCircles() {
    return this._structArray.uint16[this._pos2 + 22];
  }
  get crossTileID() {
    return this._structArray.uint32[this._pos4 + 12];
  }
  set crossTileID(e51) {
    this._structArray.uint32[this._pos4 + 12] = e51;
  }
  get textBoxScale() {
    return this._structArray.float32[this._pos4 + 13];
  }
  get collisionCircleDiameter() {
    return this._structArray.float32[this._pos4 + 14];
  }
  get textAnchorOffsetStartIndex() {
    return this._structArray.uint16[this._pos2 + 30];
  }
  get textAnchorOffsetEndIndex() {
    return this._structArray.uint16[this._pos2 + 31];
  }
};
iu.prototype.size = 64;
var au = class extends ql {
  get(e51) {
    return new iu(this, e51);
  }
};
U(`SymbolInstanceArray`, au);
var ou = class extends Jl {
  getoffsetX(e51) {
    return this.float32[e51 * 1 + 0];
  }
};
U(`GlyphOffsetArray`, ou);
var su = class extends jl {
  getx(e51) {
    return this.int16[e51 * 3 + 0];
  }
  gety(e51) {
    return this.int16[e51 * 3 + 1];
  }
  gettileUnitDistanceFromAnchor(e51) {
    return this.int16[e51 * 3 + 2];
  }
};
U(`SymbolLineVertexArray`, su);
var cu = class extends Dl {
  get textAnchor() {
    return this._structArray.uint16[this._pos2 + 0];
  }
  get textOffset0() {
    return this._structArray.float32[this._pos4 + 1];
  }
  get textOffset1() {
    return this._structArray.float32[this._pos4 + 2];
  }
};
cu.prototype.size = 12;
var lu = class extends Yl {
  get(e51) {
    return new cu(this, e51);
  }
};
U(`TextAnchorOffsetArray`, lu);
var uu = class extends Dl {
  get featureIndex() {
    return this._structArray.uint32[this._pos4 + 0];
  }
  get sourceLayerIndex() {
    return this._structArray.uint16[this._pos2 + 2];
  }
  get bucketIndex() {
    return this._structArray.uint16[this._pos2 + 3];
  }
};
uu.prototype.size = 8;
var du = class extends Xl {
  get(e51) {
    return new uu(this, e51);
  }
};
U(`FeatureIndexArray`, du);
var fu = class extends Al {
};
var hu = class extends Al {
};
var gu = class extends Al {
};
var _u = class extends Nl {
};
var vu = class extends Pl {
};
var yu = class extends Fl {
};
var bu = class extends Il {
};
var xu = class extends Ll {
};
var Su = class extends Rl {
};
var Cu = class extends zl {
};
var wu = class extends Bl {
};
var Tu = class extends Hl {
};
var Du = class extends Wl {
};
var ku = class extends Gl {
};
var Au = class extends Zl {
};
var Mu = J([{ name: `a_pos`, components: 2, type: `Int16` }], 4);
var Nu = Mu.members;
Mu.size, Mu.alignment;
var Pu = class e37 {
  constructor(e51 = []) {
    this._forceNewSegmentOnNextPrepare = false, this.segments = e51;
  }
  prepareSegment(t2, n2, r2, i2) {
    let a2 = this.segments[this.segments.length - 1];
    return t2 > e37.MAX_VERTEX_ARRAY_LENGTH && It(`Max vertices per segment is ${e37.MAX_VERTEX_ARRAY_LENGTH}: bucket requested ${t2}. Consider using the \`fillLargeMeshArrays\` function if you require meshes with more than ${e37.MAX_VERTEX_ARRAY_LENGTH} vertices.`), this._forceNewSegmentOnNextPrepare || !a2 || a2.vertexLength + t2 > e37.MAX_VERTEX_ARRAY_LENGTH || a2.sortKey !== i2 ? this.createNewSegment(n2, r2, i2) : a2;
  }
  createNewSegment(e51, t2, n2) {
    let r2 = { vertexOffset: e51.length, primitiveOffset: t2.length, vertexLength: 0, primitiveLength: 0, vaos: {} };
    return n2 !== void 0 && (r2.sortKey = n2), this._forceNewSegmentOnNextPrepare = false, this.segments.push(r2), r2;
  }
  getOrCreateLatestSegment(e51, t2, n2) {
    return this.prepareSegment(0, e51, t2, n2);
  }
  forceNewSegmentOnNextPrepare() {
    this._forceNewSegmentOnNextPrepare = true;
  }
  get() {
    return this.segments;
  }
  destroy() {
    for (let e51 of this.segments) for (let t2 in e51.vaos) e51.vaos[t2].destroy();
  }
  static simpleSegment(t2, n2, r2, i2) {
    return new e37([{ vertexOffset: t2, primitiveOffset: n2, vertexLength: r2, primitiveLength: i2, vaos: {}, sortKey: 0 }]);
  }
};
Pu.MAX_VERTEX_ARRAY_LENGTH = 2 ** 16 - 1, U(`SegmentVector`, Pu);
function Fu(e51, t2) {
  return e51 = bt(Math.floor(e51), 0, 255), t2 = bt(Math.floor(t2), 0, 255), 256 * e51 + t2;
}
var Iu = J([{ name: `a_pattern_from`, components: 4, type: `Uint16` }, { name: `a_pattern_to`, components: 4, type: `Uint16` }, { name: `a_pixel_ratio_from`, components: 1, type: `Uint16` }, { name: `a_pixel_ratio_to`, components: 1, type: `Uint16` }]);
var Lu = J([{ name: `a_dasharray_from`, components: 4, type: `Uint16` }, { name: `a_dasharray_to`, components: 4, type: `Uint16` }]);
var Ru = o(((e51, t2) => {
  function n2(e52, t3) {
    for (var n3 = e52.length & 3, r2 = e52.length - n3, i2 = t3, a2, o2 = 3432918353, s2 = 461845907, c2, l2 = 0; l2 < r2; ) c2 = e52.charCodeAt(l2) & 255 | (e52.charCodeAt(++l2) & 255) << 8 | (e52.charCodeAt(++l2) & 255) << 16 | (e52.charCodeAt(++l2) & 255) << 24, ++l2, c2 = (c2 & 65535) * o2 + (((c2 >>> 16) * o2 & 65535) << 16) & 4294967295, c2 = c2 << 15 | c2 >>> 17, c2 = (c2 & 65535) * s2 + (((c2 >>> 16) * s2 & 65535) << 16) & 4294967295, i2 ^= c2, i2 = i2 << 13 | i2 >>> 19, a2 = (i2 & 65535) * 5 + (((i2 >>> 16) * 5 & 65535) << 16) & 4294967295, i2 = (a2 & 65535) + 27492 + (((a2 >>> 16) + 58964 & 65535) << 16);
    switch (c2 = 0, n3) {
      case 3:
        c2 ^= (e52.charCodeAt(l2 + 2) & 255) << 16;
      case 2:
        c2 ^= (e52.charCodeAt(l2 + 1) & 255) << 8;
      case 1:
        c2 ^= e52.charCodeAt(l2) & 255, c2 = (c2 & 65535) * o2 + (((c2 >>> 16) * o2 & 65535) << 16) & 4294967295, c2 = c2 << 15 | c2 >>> 17, c2 = (c2 & 65535) * s2 + (((c2 >>> 16) * s2 & 65535) << 16) & 4294967295, i2 ^= c2;
    }
    return i2 ^= e52.length, i2 ^= i2 >>> 16, i2 = (i2 & 65535) * 2246822507 + (((i2 >>> 16) * 2246822507 & 65535) << 16) & 4294967295, i2 ^= i2 >>> 13, i2 = (i2 & 65535) * 3266489909 + (((i2 >>> 16) * 3266489909 & 65535) << 16) & 4294967295, i2 ^= i2 >>> 16, i2 >>> 0;
  }
  t2 !== void 0 && (t2.exports = n2);
}));
var zu = o(((e51, t2) => {
  function n2(e52, t3) {
    for (var n3 = e52.length, r2 = t3 ^ n3, i2 = 0, a2; n3 >= 4; ) a2 = e52.charCodeAt(i2) & 255 | (e52.charCodeAt(++i2) & 255) << 8 | (e52.charCodeAt(++i2) & 255) << 16 | (e52.charCodeAt(++i2) & 255) << 24, a2 = (a2 & 65535) * 1540483477 + (((a2 >>> 16) * 1540483477 & 65535) << 16), a2 ^= a2 >>> 24, a2 = (a2 & 65535) * 1540483477 + (((a2 >>> 16) * 1540483477 & 65535) << 16), r2 = (r2 & 65535) * 1540483477 + (((r2 >>> 16) * 1540483477 & 65535) << 16) ^ a2, n3 -= 4, ++i2;
    switch (n3) {
      case 3:
        r2 ^= (e52.charCodeAt(i2 + 2) & 255) << 16;
      case 2:
        r2 ^= (e52.charCodeAt(i2 + 1) & 255) << 8;
      case 1:
        r2 ^= e52.charCodeAt(i2) & 255, r2 = (r2 & 65535) * 1540483477 + (((r2 >>> 16) * 1540483477 & 65535) << 16);
    }
    return r2 ^= r2 >>> 13, r2 = (r2 & 65535) * 1540483477 + (((r2 >>> 16) * 1540483477 & 65535) << 16), r2 ^= r2 >>> 15, r2 >>> 0;
  }
  t2.exports = n2;
}));
var Bu = c(o(((e51, t2) => {
  var n2 = Ru(), r2 = zu();
  t2.exports = n2, t2.exports.murmur3 = n2, t2.exports.murmur2 = r2;
}))(), 1);
var Vu = class e38 {
  constructor() {
    this.ids = [], this.positions = [], this.indexed = false;
  }
  add(e51, t2, n2, r2) {
    this.ids.push(Hu(e51)), this.positions.push(t2, n2, r2);
  }
  getPositions(e51) {
    if (!this.indexed) throw Error(`Trying to get index, but feature positions are not indexed`);
    let t2 = Hu(e51), n2 = 0, r2 = this.ids.length - 1;
    for (; n2 < r2; ) {
      let e52 = n2 + r2 >> 1;
      this.ids[e52] >= t2 ? r2 = e52 : n2 = e52 + 1;
    }
    let i2 = [];
    for (; this.ids[n2] === t2; ) {
      let e52 = this.positions[3 * n2], t3 = this.positions[3 * n2 + 1], r3 = this.positions[3 * n2 + 2];
      i2.push({ index: e52, start: t3, end: r3 }), n2++;
    }
    return i2;
  }
  static serialize(e51, t2) {
    let n2 = new Float64Array(e51.ids), r2 = new Uint32Array(e51.positions);
    return Uu(n2, r2, 0, n2.length - 1), t2 && t2.push(n2.buffer, r2.buffer), { ids: n2, positions: r2 };
  }
  static deserialize(t2) {
    let n2 = new e38();
    return n2.ids = t2.ids, n2.positions = t2.positions, n2.indexed = true, n2;
  }
};
function Hu(e51) {
  let t2 = +e51;
  return !isNaN(t2) && t2 <= 2 ** 53 - 1 ? t2 : (0, Bu.default)(String(e51));
}
function Uu(e51, t2, n2, r2) {
  for (; n2 < r2; ) {
    let i2 = e51[n2 + r2 >> 1], a2 = n2 - 1, o2 = r2 + 1;
    for (; ; ) {
      do
        a2++;
      while (e51[a2] < i2);
      do
        o2--;
      while (e51[o2] > i2);
      if (a2 >= o2) break;
      Wu(e51, a2, o2), Wu(t2, 3 * a2, 3 * o2), Wu(t2, 3 * a2 + 1, 3 * o2 + 1), Wu(t2, 3 * a2 + 2, 3 * o2 + 2);
    }
    o2 - n2 < r2 - o2 ? (Uu(e51, t2, n2, o2), n2 = o2 + 1) : (Uu(e51, t2, o2 + 1, r2), r2 = o2);
  }
}
function Wu(e51, t2, n2) {
  let r2 = e51[t2];
  e51[t2] = e51[n2], e51[n2] = r2;
}
U(`FeaturePositionMap`, Vu);
var Gu = class {
  constructor(e51, t2) {
    this.gl = e51.gl, this.location = t2;
  }
};
var qu = class extends Gu {
  constructor(e51, t2) {
    super(e51, t2), this.current = 0;
  }
  set(e51) {
    this.current !== e51 && (this.current = e51, this.gl.uniform1f(this.location, e51));
  }
};
var Xu = class extends Gu {
  constructor(e51, t2) {
    super(e51, t2), this.current = [0, 0, 0, 0];
  }
  set(e51) {
    (e51[0] !== this.current[0] || e51[1] !== this.current[1] || e51[2] !== this.current[2] || e51[3] !== this.current[3]) && (this.current = e51, this.gl.uniform4f(this.location, e51[0], e51[1], e51[2], e51[3]));
  }
};
var Zu = class extends Gu {
  constructor(e51, t2) {
    super(e51, t2), this.current = B.transparent;
  }
  set(e51) {
    (e51.r !== this.current.r || e51.g !== this.current.g || e51.b !== this.current.b || e51.a !== this.current.a) && (this.current = e51, this.gl.uniform4f(this.location, e51.r, e51.g, e51.b, e51.a));
  }
};
var ed = new Float32Array(16);
function nd(e51) {
  return [Fu(255 * e51.r, 255 * e51.g), Fu(255 * e51.b, 255 * e51.a)];
}
var rd = class {
  constructor(e51, t2, n2) {
    this.value = e51, this.uniformNames = t2.map((e52) => `u_${e52}`), this.type = n2;
  }
  setUniform(e51, t2, n2) {
    e51.set(n2.constantOr(this.value));
  }
  getBinding(e51, t2, n2) {
    return this.type === `color` ? new Zu(e51, t2) : new qu(e51, t2);
  }
};
var id = class {
  constructor(e51, t2) {
    this.uniformNames = t2.map((e52) => `u_${e52}`), this.patternFrom = null, this.patternTo = null, this.pixelRatioFrom = 1, this.pixelRatioTo = 1;
  }
  setConstantPatternPositions(e51, t2) {
    this.pixelRatioFrom = t2.pixelRatio, this.pixelRatioTo = e51.pixelRatio, this.patternFrom = t2.tlbr, this.patternTo = e51.tlbr;
  }
  setConstantDashPositions(e51, t2) {
    this.dashTo = [0, e51.y, e51.height, e51.width], this.dashFrom = [0, t2.y, t2.height, t2.width];
  }
  setUniform(e51, t2, n2, r2) {
    let i2 = null;
    r2 === `u_pattern_to` ? i2 = this.patternTo : r2 === `u_pattern_from` ? i2 = this.patternFrom : r2 === `u_dasharray_to` ? i2 = this.dashTo : r2 === `u_dasharray_from` ? i2 = this.dashFrom : r2 === `u_pixel_ratio_to` ? i2 = this.pixelRatioTo : r2 === `u_pixel_ratio_from` && (i2 = this.pixelRatioFrom), i2 !== null && e51.set(i2);
  }
  getBinding(e51, t2, n2) {
    return n2.startsWith(`u_pattern`) || n2.startsWith(`u_dasharray_`) ? new Xu(e51, t2) : new qu(e51, t2);
  }
};
var ad = class {
  constructor(e51, t2, n2, r2) {
    this.expression = e51, this.type = n2, this.maxValue = 0, this.paintVertexAttributes = t2.map((e52) => ({ name: `a_${e52}`, type: `Float32`, components: n2 === `color` ? 2 : 1, offset: 0 })), this.paintVertexArray = new r2();
  }
  populatePaintArray(e51, t2, n2) {
    let r2 = this.paintVertexArray.length, i2 = this.expression.evaluate(new W(0, n2), t2, {}, n2.canonical, [], n2.formattedSection);
    this.paintVertexArray.resize(e51), this._setPaintValue(r2, e51, i2);
  }
  updatePaintArray(e51, t2, n2, r2, i2) {
    let a2 = this.expression.evaluate(new W(0, i2), n2, r2);
    this._setPaintValue(e51, t2, a2);
  }
  _setPaintValue(e51, t2, n2) {
    if (this.type === `color`) {
      let r2 = nd(n2);
      for (let n3 = e51; n3 < t2; n3++) this.paintVertexArray.emplace(n3, r2[0], r2[1]);
    } else {
      for (let r2 = e51; r2 < t2; r2++) this.paintVertexArray.emplace(r2, n2);
      this.maxValue = Math.max(this.maxValue, Math.abs(n2));
    }
  }
  upload(e51) {
    this.paintVertexArray?.arrayBuffer.byteLength && (this.paintVertexBuffer?.buffer ? this.paintVertexBuffer.updateData(this.paintVertexArray) : this.paintVertexBuffer = e51.createVertexBuffer(this.paintVertexArray, this.paintVertexAttributes, this.expression.isStateDependent));
  }
  destroy() {
    this.paintVertexBuffer && this.paintVertexBuffer.destroy();
  }
};
var od = class {
  constructor(e51, t2, n2, r2, i2, a2) {
    this.expression = e51, this.uniformNames = t2.map((e52) => `u_${e52}_t`), this.type = n2, this.useIntegerZoom = r2, this.zoom = i2, this.maxValue = 0, this.paintVertexAttributes = t2.map((e52) => ({ name: `a_${e52}`, type: `Float32`, components: n2 === `color` ? 4 : 2, offset: 0 })), this.paintVertexArray = new a2();
  }
  populatePaintArray(e51, t2, n2) {
    let r2 = this.expression.evaluate(new W(this.zoom, n2), t2, {}, n2.canonical, [], n2.formattedSection), i2 = this.expression.evaluate(new W(this.zoom + 1, n2), t2, {}, n2.canonical, [], n2.formattedSection), a2 = this.paintVertexArray.length;
    this.paintVertexArray.resize(e51), this._setPaintValue(a2, e51, r2, i2);
  }
  updatePaintArray(e51, t2, n2, r2, i2) {
    let a2 = this.expression.evaluate(new W(this.zoom, i2), n2, r2), o2 = this.expression.evaluate(new W(this.zoom + 1, i2), n2, r2);
    this._setPaintValue(e51, t2, a2, o2);
  }
  _setPaintValue(e51, t2, n2, r2) {
    if (this.type === `color`) {
      let i2 = nd(n2), a2 = nd(r2);
      for (let n3 = e51; n3 < t2; n3++) this.paintVertexArray.emplace(n3, i2[0], i2[1], a2[0], a2[1]);
    } else {
      for (let i2 = e51; i2 < t2; i2++) this.paintVertexArray.emplace(i2, n2, r2);
      this.maxValue = Math.max(this.maxValue, Math.abs(n2), Math.abs(r2));
    }
  }
  upload(e51) {
    this.paintVertexArray?.arrayBuffer.byteLength && (this.paintVertexBuffer?.buffer ? this.paintVertexBuffer.updateData(this.paintVertexArray) : this.paintVertexBuffer = e51.createVertexBuffer(this.paintVertexArray, this.paintVertexAttributes, this.expression.isStateDependent));
  }
  destroy() {
    this.paintVertexBuffer && this.paintVertexBuffer.destroy();
  }
  setUniform(e51, t2) {
    let n2 = this.useIntegerZoom ? Math.floor(t2.zoom) : t2.zoom, r2 = bt(this.expression.interpolationFactor(n2, this.zoom, this.zoom + 1), 0, 1);
    e51.set(r2);
  }
  getBinding(e51, t2, n2) {
    return new qu(e51, t2);
  }
};
var sd = class {
  constructor(e51, t2, n2, r2, i2, a2) {
    this.expression = e51, this.type = t2, this.useIntegerZoom = n2, this.zoom = r2, this.layerId = a2, this.zoomInPaintVertexArray = new i2(), this.zoomOutPaintVertexArray = new i2();
  }
  populatePaintArray(e51, t2, n2) {
    let r2 = this.zoomInPaintVertexArray.length;
    this.zoomInPaintVertexArray.resize(e51), this.zoomOutPaintVertexArray.resize(e51), this._setPaintValues(r2, e51, this.getPositionIds(t2), n2);
  }
  updatePaintArray(e51, t2, n2, r2, i2) {
    this._setPaintValues(e51, t2, this.getPositionIds(n2), i2);
  }
  _setPaintValues(e51, t2, n2, r2) {
    let i2 = this.getPositions(r2);
    if (!i2 || !n2) return;
    let a2 = i2[n2.min], o2 = i2[n2.mid], s2 = i2[n2.max];
    if (!(!a2 || !o2 || !s2)) for (let n3 = e51; n3 < t2; n3++) this.emplace(this.zoomInPaintVertexArray, n3, a2, o2), this.emplace(this.zoomOutPaintVertexArray, n3, s2, o2);
  }
  upload(e51) {
    if (this.zoomInPaintVertexArray?.arrayBuffer.byteLength && this.zoomOutPaintVertexArray?.arrayBuffer.byteLength) {
      let t2 = this.getVertexAttributes();
      this.zoomInPaintVertexBuffer = e51.createVertexBuffer(this.zoomInPaintVertexArray, t2, this.expression.isStateDependent), this.zoomOutPaintVertexBuffer = e51.createVertexBuffer(this.zoomOutPaintVertexArray, t2, this.expression.isStateDependent);
    }
  }
  destroy() {
    this.zoomOutPaintVertexBuffer && this.zoomOutPaintVertexBuffer.destroy(), this.zoomInPaintVertexBuffer && this.zoomInPaintVertexBuffer.destroy();
  }
};
var cd = class extends sd {
  getPositions(e51) {
    return e51.imagePositions;
  }
  getPositionIds(e51) {
    return e51.patterns?.[this.layerId];
  }
  getVertexAttributes() {
    return Iu.members;
  }
  emplace(e51, t2, n2, r2) {
    e51.emplace(t2, n2.tlbr[0], n2.tlbr[1], n2.tlbr[2], n2.tlbr[3], r2.tlbr[0], r2.tlbr[1], r2.tlbr[2], r2.tlbr[3], n2.pixelRatio, r2.pixelRatio);
  }
};
var ld = class extends sd {
  getPositions(e51) {
    return e51.dashPositions;
  }
  getPositionIds(e51) {
    return e51.dashes?.[this.layerId];
  }
  getVertexAttributes() {
    return Lu.members;
  }
  emplace(e51, t2, n2, r2) {
    e51.emplace(t2, 0, n2.y, n2.height, n2.width, 0, r2.y, r2.height, r2.width);
  }
};
var ud = class {
  constructor(e51, t2, n2) {
    this.binders = {}, this._buffers = [];
    let r2 = [];
    for (let i2 in e51.paint._values) {
      if (!n2(i2)) continue;
      let a2 = e51.paint.get(i2);
      if (!(a2 instanceof ul) || !To(a2.property.specification)) continue;
      let o2 = fd(i2, e51.type), s2 = a2.value, c2 = a2.property.specification.type, l2 = a2.property.useIntegerZoom, u2 = a2.property.specification[`property-type`], d2 = u2 === `cross-faded` || u2 === `cross-faded-data-driven`;
      if (s2.kind === `constant`) this.binders[i2] = d2 ? new id(s2.value, o2) : new rd(s2.value, o2, c2), r2.push(`/u_${i2}`);
      else if (s2.kind === `source` || d2) {
        let n3 = md(i2, c2, `source`);
        this.binders[i2] = d2 ? i2 === `line-dasharray` ? new ld(s2, c2, l2, t2, n3, e51.id) : new cd(s2, c2, l2, t2, n3, e51.id) : new ad(s2, o2, c2, n3), r2.push(`/a_${i2}`);
      } else {
        let e52 = md(i2, c2, `composite`);
        this.binders[i2] = new od(s2, o2, c2, l2, t2, e52), r2.push(`/z_${i2}`);
      }
    }
    this.cacheKey = r2.sort().join(``);
  }
  getMaxValue(e51) {
    let t2 = this.binders[e51];
    return t2 instanceof ad || t2 instanceof od ? t2.maxValue : 0;
  }
  populatePaintArrays(e51, t2, n2) {
    for (let r2 in this.binders) {
      let i2 = this.binders[r2];
      (i2 instanceof ad || i2 instanceof od || i2 instanceof sd) && i2.populatePaintArray(e51, t2, n2);
    }
  }
  setConstantPatternPositions(e51, t2) {
    for (let n2 in this.binders) {
      let r2 = this.binders[n2];
      r2 instanceof id && r2.setConstantPatternPositions(e51, t2);
    }
  }
  setConstantDashPositions(e51, t2) {
    for (let n2 in this.binders) {
      let r2 = this.binders[n2];
      r2 instanceof id && r2.setConstantDashPositions(e51, t2);
    }
  }
  updatePaintArrays(e51, t2, n2, r2, i2) {
    let a2 = false;
    for (let o2 of e51) {
      let e52 = t2.getPositions(o2.id);
      for (let t3 of e52) {
        let e53 = n2.feature(t3.index);
        for (let n3 in this.binders) {
          let s2 = this.binders[n3];
          (s2 instanceof ad || s2 instanceof od || s2 instanceof sd) && s2.expression.isStateDependent === true && (s2.expression = r2.paint.get(n3).value, s2.updatePaintArray(t3.start, t3.end, e53, o2.state, i2), a2 = true);
        }
      }
    }
    return a2;
  }
  defines() {
    let e51 = [];
    for (let t2 in this.binders) {
      let n2 = this.binders[t2];
      (n2 instanceof rd || n2 instanceof id) && e51.push(...n2.uniformNames.map((e52) => `#define HAS_UNIFORM_${e52}`));
    }
    return e51;
  }
  getBinderAttributes() {
    let e51 = [];
    for (let t2 in this.binders) {
      let n2 = this.binders[t2];
      if (n2 instanceof ad || n2 instanceof od) for (let t3 of n2.paintVertexAttributes) e51.push(t3.name);
      else if (n2 instanceof sd) {
        let t3 = n2.getVertexAttributes();
        for (let n3 of t3) e51.push(n3.name);
      }
    }
    return e51;
  }
  getBinderUniforms() {
    let e51 = [];
    for (let t2 in this.binders) {
      let n2 = this.binders[t2];
      if (n2 instanceof rd || n2 instanceof id || n2 instanceof od) for (let t3 of n2.uniformNames) e51.push(t3);
    }
    return e51;
  }
  getPaintVertexBuffers() {
    return this._buffers;
  }
  getUniforms(e51, t2) {
    let n2 = [];
    for (let r2 in this.binders) {
      let i2 = this.binders[r2];
      if (i2 instanceof rd || i2 instanceof id || i2 instanceof od) {
        for (let a2 of i2.uniformNames) if (t2[a2]) {
          let o2 = i2.getBinding(e51, t2[a2], a2);
          n2.push({ name: a2, property: r2, binding: o2 });
        }
      }
    }
    return n2;
  }
  setUniforms(e51, t2, n2, r2) {
    for (let { name: e52, property: i2, binding: a2 } of t2) this.binders[i2].setUniform(a2, r2, n2.get(i2), e52);
  }
  updatePaintBuffers(e51) {
    this._buffers = [];
    for (let t2 in this.binders) {
      let n2 = this.binders[t2];
      if (e51 && n2 instanceof sd) {
        let t3 = e51.fromScale === 2 ? n2.zoomInPaintVertexBuffer : n2.zoomOutPaintVertexBuffer;
        t3 && this._buffers.push(t3);
      } else (n2 instanceof ad || n2 instanceof od) && n2.paintVertexBuffer && this._buffers.push(n2.paintVertexBuffer);
    }
  }
  upload(e51) {
    for (let t2 in this.binders) {
      let n2 = this.binders[t2];
      (n2 instanceof ad || n2 instanceof od || n2 instanceof sd) && n2.upload(e51);
    }
    this.updatePaintBuffers();
  }
  destroy() {
    for (let e51 in this.binders) {
      let t2 = this.binders[e51];
      (t2 instanceof ad || t2 instanceof od || t2 instanceof sd) && t2.destroy();
    }
  }
};
var dd = class {
  constructor(e51, t2, n2 = () => true) {
    this.programConfigurations = {};
    for (let r2 of e51) this.programConfigurations[r2.id] = new ud(r2, t2, n2);
    this.needsUpload = false, this._featureMap = new Vu(), this._bufferOffset = 0;
  }
  populatePaintArrays(e51, t2, n2, r2) {
    for (let n3 in this.programConfigurations) this.programConfigurations[n3].populatePaintArrays(e51, t2, r2);
    t2.id !== void 0 && this._featureMap.add(t2.id, n2, this._bufferOffset, e51), this._bufferOffset = e51, this.needsUpload = true;
  }
  updatePaintArrays(e51, t2, n2, r2) {
    for (let i2 of n2) this.needsUpload = this.programConfigurations[i2.id].updatePaintArrays(e51, this._featureMap, t2, i2, r2) || this.needsUpload;
  }
  get(e51) {
    return this.programConfigurations[e51];
  }
  upload(e51) {
    if (this.needsUpload) {
      for (let t2 in this.programConfigurations) this.programConfigurations[t2].upload(e51);
      this.needsUpload = false;
    }
  }
  destroy() {
    for (let e51 in this.programConfigurations) this.programConfigurations[e51].destroy();
  }
};
function fd(e51, t2) {
  return { "text-opacity": [`opacity`], "icon-opacity": [`opacity`], "text-color": [`fill_color`], "icon-color": [`fill_color`], "text-halo-color": [`halo_color`], "icon-halo-color": [`halo_color`], "text-halo-blur": [`halo_blur`], "icon-halo-blur": [`halo_blur`], "text-halo-width": [`halo_width`], "icon-halo-width": [`halo_width`], "line-gap-width": [`gapwidth`], "line-dasharray": [`dasharray_to`, `dasharray_from`], "line-pattern": [`pattern_to`, `pattern_from`, `pixel_ratio_to`, `pixel_ratio_from`], "fill-pattern": [`pattern_to`, `pattern_from`, `pixel_ratio_to`, `pixel_ratio_from`], "fill-extrusion-pattern": [`pattern_to`, `pattern_from`, `pixel_ratio_to`, `pixel_ratio_from`] }[e51] || [e51.replace(`${t2}-`, ``).replace(/-/g, `_`)];
}
function pd(e51) {
  return { "line-pattern": { source: bu, composite: bu }, "fill-pattern": { source: bu, composite: bu }, "fill-extrusion-pattern": { source: bu, composite: bu }, "line-dasharray": { source: xu, composite: xu } }[e51];
}
function md(e51, t2, n2) {
  let r2 = { color: { source: Fl, composite: $l }, number: { source: Jl, composite: Fl } };
  return pd(e51)?.[n2] || r2[t2][n2];
}
U(`ConstantBinder`, rd), U(`CrossFadedConstantBinder`, id), U(`SourceExpressionBinder`, ad), U(`CrossFadedPatternBinder`, cd), U(`CrossFadedDasharrayBinder`, ld), U(`CompositeExpressionBinder`, od), U(`ProgramConfiguration`, ud, { omit: [`_buffers`] }), U(`ProgramConfigurationSet`, dd);
var hd = 2 ** 14 - 1;
var gd = -hd - 1;
function _d(e51) {
  let t2 = j / e51.extent, n2 = e51.loadGeometry();
  for (let e52 of n2) for (let n3 of e52) {
    let e53 = Math.round(n3.x * t2), r2 = Math.round(n3.y * t2);
    n3.x = bt(e53, gd, hd), n3.y = bt(r2, gd, hd), (e53 < n3.x || e53 > n3.x + 1 || r2 < n3.y || r2 > n3.y + 1) && It(`Geometry exceeds allowed extent, reduce your vector tile buffer size`);
  }
  return n2;
}
function vd(e51, t2) {
  return { type: e51.type, id: e51.id, properties: e51.properties, geometry: t2 ? _d(e51) : [] };
}
var yd = -32768;
function bd(e51, t2, n2, r2, i2) {
  e51.emplaceBack(yd + t2 * 8 + r2, yd + n2 * 8 + i2);
}
var xd = class {
  constructor(e51) {
    this.zoom = e51.zoom, this.overscaling = e51.overscaling, this.layers = e51.layers, this.layerIds = this.layers.map((e52) => e52.id), this.index = e51.index, this.hasDependencies = false, this.layoutVertexArray = new hu(), this.indexArray = new ku(), this.segments = new Pu(), this.programConfigurations = new dd(e51.layers, e51.zoom), this.stateDependentLayerIds = this.layers.filter((e52) => e52.isStateDependent()).map((e52) => e52.id);
  }
  populate(e51, t2, n2) {
    let r2 = this.layers[0], i2 = [], a2 = null, o2 = false, s2 = r2.type === `heatmap`;
    if (r2.type === `circle`) {
      let e52 = r2;
      a2 = e52.layout.get(`circle-sort-key`), o2 = !a2.isConstant(), s2 ||= e52.paint.get(`circle-pitch-alignment`) === `map`;
    }
    let c2 = s2 ? t2.subdivisionGranularity.circle : 1, l2 = new W(this.zoom), u2 = this.layers[0]._featureFilter.needGeometry;
    for (let { feature: t3, id: r3, index: s3, sourceLayerIndex: c3 } of e51) {
      let e52 = vd(t3, u2);
      if (!this.layers[0]._featureFilter.filter(l2, e52, n2)) continue;
      let d2 = o2 ? a2.evaluate(e52, {}, n2) : void 0, f2 = { id: r3, properties: t3.properties, type: t3.type, sourceLayerIndex: c3, index: s3, geometry: u2 ? e52.geometry : _d(t3), patterns: {}, sortKey: d2 };
      i2.push(f2);
    }
    o2 && i2.sort((e52, t3) => e52.sortKey - t3.sortKey);
    for (let r3 of i2) {
      let { geometry: i3, index: a3, sourceLayerIndex: o3 } = r3, s3 = e51[a3].feature;
      this.addFeature(r3, i3, a3, n2, c2), t2.featureIndex.insert(s3, i3, a3, o3, this.index);
    }
  }
  update(e51, t2, n2) {
    this.stateDependentLayers.length && this.programConfigurations.updatePaintArrays(e51, t2, this.stateDependentLayers, { imagePositions: n2 });
  }
  isEmpty() {
    return this.layoutVertexArray.length === 0;
  }
  uploadPending() {
    return !this.uploaded || this.programConfigurations.needsUpload;
  }
  upload(e51) {
    this.uploaded || (this.layoutVertexBuffer = e51.createVertexBuffer(this.layoutVertexArray, Nu), this.indexBuffer = e51.createIndexBuffer(this.indexArray)), this.programConfigurations.upload(e51), this.uploaded = true;
  }
  destroy() {
    this.layoutVertexBuffer && (this.layoutVertexBuffer.destroy(), this.indexBuffer.destroy(), this.programConfigurations.destroy(), this.segments.destroy());
  }
  addFeature(e51, t2, n2, r2, i2 = 1) {
    let a2;
    switch (i2) {
      case 1:
        a2 = [0, 7];
        break;
      case 3:
        a2 = [0, 2, 5, 7];
        break;
      case 5:
        a2 = [0, 1, 3, 4, 6, 7];
        break;
      case 7:
        a2 = [0, 1, 2, 3, 4, 5, 6, 7];
        break;
      default:
        throw Error(`Invalid circle bucket granularity: ${i2}; valid values are 1, 3, 5, 7.`);
    }
    let o2 = a2.length;
    for (let n3 of t2) for (let t3 of n3) {
      let n4 = t3.x, r3 = t3.y;
      if (n4 < 0 || n4 >= 8192 || r3 < 0 || r3 >= 8192) continue;
      let i3 = this.segments.prepareSegment(o2 * o2, this.layoutVertexArray, this.indexArray, e51.sortKey), s2 = i3.vertexLength;
      for (let e52 = 0; e52 < o2; e52++) for (let t4 = 0; t4 < o2; t4++) bd(this.layoutVertexArray, n4, r3, a2[t4], a2[e52]);
      for (let e52 = 0; e52 < o2 - 1; e52++) for (let t4 = 0; t4 < o2 - 1; t4++) {
        let n5 = s2 + e52 * o2 + t4, r4 = s2 + (e52 + 1) * o2 + t4;
        this.indexArray.emplaceBack(n5, r4 + 1, n5 + 1), this.indexArray.emplaceBack(n5, r4, r4 + 1);
      }
      i3.vertexLength += o2 * o2, i3.primitiveLength += (o2 - 1) * (o2 - 1) * 2;
    }
    this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, e51, n2, { imagePositions: {}, canonical: r2 });
  }
};
U(`CircleBucket`, xd, { omit: [`layers`] });
function Sd(e51, t2) {
  for (let n2 of e51) if (Md(t2, n2)) return true;
  for (let n2 of t2) if (Md(e51, n2)) return true;
  return Dd(e51, t2);
}
function Cd(e51, t2, n2) {
  return Md(e51, t2) ? true : kd(t2, e51, n2);
}
function wd(e51, t2) {
  if (e51.length === 1) return jd(t2, e51[0]);
  for (let n2 of t2) for (let t3 of n2) if (Md(e51, t3)) return true;
  for (let n2 of e51) if (jd(t2, n2)) return true;
  for (let n2 of t2) if (Dd(e51, n2)) return true;
  return false;
}
function Td(e51, t2, n2) {
  for (let r2 of t2) {
    if (e51.length >= 3) {
      for (let t3 of r2) if (Md(e51, t3)) return true;
    }
    if (Ed(e51, r2, n2)) return true;
  }
  return false;
}
function Ed(e51, t2, n2) {
  if (e51.length > 1) {
    if (Dd(e51, t2)) return true;
    for (let r2 of t2) if (kd(r2, e51, n2)) return true;
  }
  for (let r2 of e51) if (kd(r2, t2, n2)) return true;
  return false;
}
function Dd(e51, t2) {
  if (e51.length === 0 || t2.length === 0) return false;
  for (let n2 = 0; n2 < e51.length - 1; n2++) {
    let r2 = e51[n2], i2 = e51[n2 + 1];
    for (let e52 = 0; e52 < t2.length - 1; e52++) {
      let n3 = t2[e52], a2 = t2[e52 + 1];
      if (Od(r2, i2, n3, a2)) return true;
    }
  }
  return false;
}
function Od(e51, t2, n2, r2) {
  return Lt(e51, n2, r2) !== Lt(t2, n2, r2) && Lt(e51, t2, n2) !== Lt(e51, t2, r2);
}
function kd(e51, t2, n2) {
  let r2 = n2 * n2;
  if (t2.length === 1) return e51.distSqr(t2[0]) < r2;
  for (let n3 = 1; n3 < t2.length; n3++) {
    let i2 = t2[n3 - 1], a2 = t2[n3];
    if (Ad(e51, i2, a2) < r2) return true;
  }
  return false;
}
function Ad(e51, t2, n2) {
  let r2 = t2.distSqr(n2);
  if (r2 === 0) return e51.distSqr(t2);
  let i2 = ((e51.x - t2.x) * (n2.x - t2.x) + (e51.y - t2.y) * (n2.y - t2.y)) / r2;
  return i2 < 0 ? e51.distSqr(t2) : i2 > 1 ? e51.distSqr(n2) : e51.distSqr(n2.sub(t2)._mult(i2)._add(t2));
}
function jd(e51, t2) {
  let n2 = false, r2, i2, a2;
  for (let o2 of e51) {
    r2 = o2;
    for (let e52 = 0, o3 = r2.length - 1; e52 < r2.length; o3 = e52++) i2 = r2[e52], a2 = r2[o3], i2.y > t2.y != a2.y > t2.y && t2.x < (a2.x - i2.x) * (t2.y - i2.y) / (a2.y - i2.y) + i2.x && (n2 = !n2);
  }
  return n2;
}
function Md(e51, t2) {
  let n2 = false;
  for (let r2 = 0, i2 = e51.length - 1; r2 < e51.length; i2 = r2++) {
    let a2 = e51[r2], o2 = e51[i2];
    a2.y > t2.y != o2.y > t2.y && t2.x < (o2.x - a2.x) * (t2.y - a2.y) / (o2.y - a2.y) + a2.x && (n2 = !n2);
  }
  return n2;
}
function Nd(e51, t2, n2, r2, i2) {
  for (let a3 of e51) if (t2 <= a3.x && n2 <= a3.y && r2 >= a3.x && i2 >= a3.y) return true;
  let a2 = [new l(t2, n2), new l(t2, i2), new l(r2, i2), new l(r2, n2)];
  if (e51.length > 2) {
    for (let t3 of a2) if (Md(e51, t3)) return true;
  }
  for (let t3 = 0; t3 < e51.length - 1; t3++) {
    let n3 = e51[t3], r3 = e51[t3 + 1];
    if (Pd(n3, r3, a2)) return true;
  }
  return false;
}
function Pd(e51, t2, n2) {
  let r2 = n2[0], i2 = n2[2];
  if (e51.x < r2.x && t2.x < r2.x || e51.x > i2.x && t2.x > i2.x || e51.y < r2.y && t2.y < r2.y || e51.y > i2.y && t2.y > i2.y) return false;
  let a2 = Lt(e51, t2, n2[0]);
  return a2 !== Lt(e51, t2, n2[1]) || a2 !== Lt(e51, t2, n2[2]) || a2 !== Lt(e51, t2, n2[3]);
}
function Fd(e51, t2, n2) {
  let r2 = t2.paint.get(e51).value;
  return r2.kind === `constant` ? r2.value : n2.programConfigurations.get(t2.id).getMaxValue(e51);
}
function Id(e51) {
  return Math.sqrt(e51[0] * e51[0] + e51[1] * e51[1]);
}
function Ld(e51, t2, n2, r2, i2) {
  if (!t2[0] && !t2[1]) return e51;
  let a2 = l.convert(t2)._mult(i2);
  n2 === `viewport` && a2._rotate(-r2);
  let o2 = [];
  for (let t3 of e51) o2.push(t3.sub(a2));
  return o2;
}
function Rd(e51) {
  let t2 = [];
  for (let n2 = 0; n2 < e51.length; n2++) {
    let r2 = e51[n2], i2 = t2.at(-1);
    (n2 === 0 || i2 && !r2.equals(i2)) && t2.push(r2);
  }
  return t2;
}
function zd(e51, t2) {
  let n2 = [];
  for (let r2 of e51) {
    let e52 = Rd(r2), i2 = [];
    for (let n3 = 0; n3 < e52.length; n3++) {
      let r3 = e52[n3], a2 = e52[n3 - 1], o2 = e52[n3 + 1], s2 = n3 === 0 ? new l(0, 0) : r3.sub(a2)._unit()._perp(), c2 = n3 === e52.length - 1 ? new l(0, 0) : o2.sub(r3)._unit()._perp(), u2 = s2._add(c2)._unit(), d2 = u2.x * c2.x + u2.y * c2.y;
      d2 !== 0 && u2._mult(1 / d2), i2.push(u2._mult(t2)._add(r3));
    }
    n2.push(i2);
  }
  return n2;
}
function Bd({ queryGeometry: e51, size: t2 }, n2) {
  return Cd(e51, n2, t2);
}
function Vd({ queryGeometry: e51, size: t2, transform: n2, unwrappedTileID: r2, getElevation: i2 }, a2) {
  return Cd(e51, a2, t2 * (n2.projectTileCoordinates(a2.x, a2.y, r2, i2).signedDistanceFromCamera / n2.cameraToCenterDistance));
}
function Hd({ queryGeometry: e51, size: t2, transform: n2, unwrappedTileID: r2, getElevation: i2 }, a2) {
  let o2 = n2.projectTileCoordinates(a2.x, a2.y, r2, i2).signedDistanceFromCamera, s2 = t2 * (n2.cameraToCenterDistance / o2);
  return Cd(e51, Gd(a2, n2, r2, i2), s2);
}
function Ud({ queryGeometry: e51, size: t2, transform: n2, unwrappedTileID: r2, getElevation: i2 }, a2) {
  return Cd(e51, Gd(a2, n2, r2, i2), t2);
}
function Wd({ queryGeometry: e51, size: t2, transform: n2, unwrappedTileID: r2, getElevation: i2, pitchAlignment: a2 = `map`, pitchScale: o2 = `map` }, s2) {
  let c2 = a2 === `map` ? o2 === `map` ? Bd : Vd : o2 === `map` ? Hd : Ud, l2 = { queryGeometry: e51, size: t2, transform: n2, unwrappedTileID: r2, getElevation: i2 };
  for (let e52 of s2) for (let t3 of e52) if (c2(l2, t3)) return true;
  return false;
}
function Gd(e51, t2, n2, r2) {
  let i2 = t2.projectTileCoordinates(e51.x, e51.y, n2, r2).point;
  return new l((i2.x * 0.5 + 0.5) * t2.width, (-i2.y * 0.5 + 0.5) * t2.height);
}
function Kd(e51, t2, n2, r2) {
  return e51.map((e52) => Gd(e52, t2, n2, r2));
}
var qd;
var Jd = () => qd ||= new _l({ "circle-sort-key": new K(M.layout_circle[`circle-sort-key`], `circle-sort-key`) });
var Yd;
var Xd = () => Yd ||= new _l({ "circle-radius": new K(M.paint_circle[`circle-radius`], `circle-radius`), "circle-color": new K(M.paint_circle[`circle-color`], `circle-color`), "circle-blur": new K(M.paint_circle[`circle-blur`], `circle-blur`), "circle-opacity": new K(M.paint_circle[`circle-opacity`], `circle-opacity`), "circle-translate": new G(M.paint_circle[`circle-translate`], `circle-translate`), "circle-translate-anchor": new G(M.paint_circle[`circle-translate-anchor`], `circle-translate-anchor`), "circle-pitch-scale": new G(M.paint_circle[`circle-pitch-scale`], `circle-pitch-scale`), "circle-pitch-alignment": new G(M.paint_circle[`circle-pitch-alignment`], `circle-pitch-alignment`), "circle-stroke-width": new K(M.paint_circle[`circle-stroke-width`], `circle-stroke-width`), "circle-stroke-color": new K(M.paint_circle[`circle-stroke-color`], `circle-stroke-color`), "circle-stroke-opacity": new K(M.paint_circle[`circle-stroke-opacity`], `circle-stroke-opacity`) });
var Zd = { get paint() {
  return Xd();
}, get layout() {
  return Jd();
} };
var $d = class extends bl {
  constructor(e51, t2) {
    super(e51, Zd, t2);
  }
  createBucket(e51) {
    return new xd(e51);
  }
  queryRadius(e51) {
    let t2 = e51;
    return Fd(`circle-radius`, this, t2) + Fd(`circle-stroke-width`, this, t2) + Id(this.paint.get(`circle-translate`));
  }
  queryIntersectsFeature({ queryGeometry: e51, feature: t2, featureState: n2, geometry: r2, transform: i2, pixelsToTileUnits: a2, unwrappedTileID: o2, getElevation: s2 }) {
    let c2 = Ld(e51, this.paint.get(`circle-translate`), this.paint.get(`circle-translate-anchor`), -i2.bearingInRadians, a2), l2 = this.paint.get(`circle-radius`).evaluate(t2, n2) + this.paint.get(`circle-stroke-width`).evaluate(t2, n2), u2 = this.paint.get(`circle-pitch-scale`), d2 = this.paint.get(`circle-pitch-alignment`), f2, p2;
    return d2 === `map` ? (f2 = c2, p2 = l2 * a2) : (f2 = Kd(c2, i2, o2, s2), p2 = l2), Wd({ queryGeometry: f2, size: p2, transform: i2, unwrappedTileID: o2, getElevation: s2, pitchAlignment: d2, pitchScale: u2 }, r2);
  }
};
var ef = class extends xd {
};
U(`HeatmapBucket`, ef, { omit: [`layers`] });
var tf;
var nf = () => tf ||= new _l({ "heatmap-radius": new K(M.paint_heatmap[`heatmap-radius`], `heatmap-radius`), "heatmap-weight": new K(M.paint_heatmap[`heatmap-weight`], `heatmap-weight`), "heatmap-intensity": new G(M.paint_heatmap[`heatmap-intensity`], `heatmap-intensity`), "heatmap-color": new gl(M.paint_heatmap[`heatmap-color`], `heatmap-color`), "heatmap-opacity": new G(M.paint_heatmap[`heatmap-opacity`], `heatmap-opacity`) });
var rf = { get paint() {
  return nf();
} };
function af(e51, { width: t2, height: n2 }, r2, i2) {
  if (!i2) i2 = new Uint8Array(t2 * n2 * r2);
  else if (i2 instanceof Uint8ClampedArray) i2 = new Uint8Array(i2.buffer);
  else if (i2.length !== t2 * n2 * r2) throw RangeError(`mismatched image size. expected: ${i2.length} but got: ${t2 * n2 * r2}`);
  return e51.width = t2, e51.height = n2, e51.data = i2, e51;
}
function of(e51, { width: t2, height: n2 }, r2) {
  if (t2 === e51.width && n2 === e51.height) return;
  let i2 = af({}, { width: t2, height: n2 }, r2);
  sf(e51, i2, { x: 0, y: 0 }, { x: 0, y: 0 }, { width: Math.min(e51.width, t2), height: Math.min(e51.height, n2) }, r2), e51.width = t2, e51.height = n2, e51.data = i2.data;
}
function sf(e51, t2, n2, r2, i2, a2) {
  if (i2.width === 0 || i2.height === 0) return t2;
  if (i2.width > e51.width || i2.height > e51.height || n2.x > e51.width - i2.width || n2.y > e51.height - i2.height) throw RangeError(`out of range source coordinates for image copy`);
  if (i2.width > t2.width || i2.height > t2.height || r2.x > t2.width - i2.width || r2.y > t2.height - i2.height) throw RangeError(`out of range destination coordinates for image copy`);
  let o2 = e51.data, s2 = t2.data;
  if (o2 === s2) throw Error(`srcData equals dstData, so image is already copied`);
  for (let c2 = 0; c2 < i2.height; c2++) {
    let l2 = ((n2.y + c2) * e51.width + n2.x) * a2, u2 = ((r2.y + c2) * t2.width + r2.x) * a2;
    for (let e52 = 0; e52 < i2.width * a2; e52++) s2[u2 + e52] = o2[l2 + e52];
  }
  return t2;
}
var cf = class e39 {
  constructor(e51, t2) {
    af(this, e51, 1, t2);
  }
  resize(e51) {
    of(this, e51, 1);
  }
  clone() {
    return new e39({ width: this.width, height: this.height }, new Uint8Array(this.data));
  }
  static copy(e51, t2, n2, r2, i2) {
    sf(e51, t2, n2, r2, i2, 1);
  }
};
var lf = class e40 {
  constructor(e51, t2) {
    af(this, e51, 4, t2);
  }
  resize(e51) {
    of(this, e51, 4);
  }
  replace(e51, t2) {
    t2 ? this.data.set(e51) : this.data = e51 instanceof Uint8ClampedArray ? new Uint8Array(e51.buffer) : e51;
  }
  clone() {
    return new e40({ width: this.width, height: this.height }, new Uint8Array(this.data));
  }
  static copy(e51, t2, n2, r2, i2) {
    sf(e51, t2, n2, r2, i2, 4);
  }
  setPixel(e51, t2, n2) {
    let r2 = (e51 * this.width + t2) * 4;
    this.data[r2 + 0] = Math.round(n2.r * 255 / n2.a), this.data[r2 + 1] = Math.round(n2.g * 255 / n2.a), this.data[r2 + 2] = Math.round(n2.b * 255 / n2.a), this.data[r2 + 3] = Math.round(n2.a * 255);
  }
};
function uf(e51) {
  let t2 = new Uint8Array(e51.length);
  for (let n2 = 0; n2 < e51.length; n2 += 4) {
    let r2 = e51[n2 + 3];
    t2[n2 + 0] = Math.round(e51[n2 + 0] * r2 / 255), t2[n2 + 1] = Math.round(e51[n2 + 1] * r2 / 255), t2[n2 + 2] = Math.round(e51[n2 + 2] * r2 / 255), t2[n2 + 3] = r2;
  }
  return t2;
}
U(`AlphaImage`, cf), U(`RGBAImage`, lf);
function df(e51) {
  let t2 = {}, n2 = e51.resolution || 256, r2 = e51.clips ? e51.clips.length : 1, i2 = e51.image || new lf({ width: n2, height: r2 });
  if (!Et(n2)) throw Error(`width is not a power of 2 - ${n2}`);
  let a2 = (r3, a3, o2) => {
    t2[e51.evaluationKey] = o2;
    let s2 = e51.expression.evaluate(t2);
    i2.setPixel(r3 / 4 / n2, a3 / 4, s2);
  };
  if (e51.clips) for (let t3 = 0, i3 = 0; t3 < r2; ++t3, i3 += n2 * 4) for (let r3 = 0, o2 = 0; r3 < n2; r3++, o2 += 4) {
    let s2 = r3 / (n2 - 1), { start: c2, end: l2 } = e51.clips[t3], u2 = c2 * (1 - s2) + l2 * s2;
    a2(i3, o2, u2);
  }
  else for (let e52 = 0, t3 = 0; e52 < n2; e52++, t3 += 4) {
    let r3 = e52 / (n2 - 1);
    a2(0, t3, r3);
  }
  return i2;
}
var ff = `big-fb`;
var mf = class extends bl {
  createBucket(e51) {
    return new ef(e51);
  }
  constructor(e51, t2) {
    super(e51, rf, t2), this.heatmapFbos = /* @__PURE__ */ new Map(), this._updateColorRamp();
  }
  _handleSpecialPaintPropertyUpdate(e51) {
    e51 === `heatmap-color` && this._updateColorRamp();
  }
  _updateColorRamp() {
    let e51 = this._transitionablePaint._values[`heatmap-color`].value.expression;
    this.colorRamp = df({ expression: e51, evaluationKey: `heatmapDensity`, image: this.colorRamp }), this.colorRampTexture = null;
  }
  resize() {
    this.heatmapFbos.has(`big-fb`) && this.heatmapFbos.delete(ff);
  }
  queryRadius(e51) {
    return Fd(`heatmap-radius`, this, e51);
  }
  queryIntersectsFeature({ queryGeometry: e51, feature: t2, featureState: n2, geometry: r2, transform: i2, pixelsToTileUnits: a2, unwrappedTileID: o2, getElevation: s2 }) {
    return Wd({ queryGeometry: e51, size: this.paint.get(`heatmap-radius`).evaluate(t2, n2) * a2, transform: i2, unwrappedTileID: o2, getElevation: s2 }, r2);
  }
  hasOffscreenPass() {
    return this.paint.get(`heatmap-opacity`) !== 0 && !this.isHidden();
  }
};
var hf;
var gf = () => hf ||= new _l({ "hillshade-illumination-direction": new G(M.paint_hillshade[`hillshade-illumination-direction`], `hillshade-illumination-direction`), "hillshade-illumination-altitude": new G(M.paint_hillshade[`hillshade-illumination-altitude`], `hillshade-illumination-altitude`), "hillshade-illumination-anchor": new G(M.paint_hillshade[`hillshade-illumination-anchor`], `hillshade-illumination-anchor`), "hillshade-exaggeration": new G(M.paint_hillshade[`hillshade-exaggeration`], `hillshade-exaggeration`), "hillshade-shadow-color": new G(M.paint_hillshade[`hillshade-shadow-color`], `hillshade-shadow-color`), "hillshade-highlight-color": new G(M.paint_hillshade[`hillshade-highlight-color`], `hillshade-highlight-color`), "hillshade-accent-color": new G(M.paint_hillshade[`hillshade-accent-color`], `hillshade-accent-color`), "hillshade-method": new G(M.paint_hillshade[`hillshade-method`], `hillshade-method`), resampling: new G(M.paint_hillshade.resampling, `resampling`) });
var _f = { get paint() {
  return gf();
} };
var yf = class extends bl {
  constructor(e51, t2) {
    super(e51, _f, t2), this.recalculate({ zoom: 0, zoomHistory: {} }, void 0);
  }
  getIlluminationProperties() {
    let e51 = this.paint.get(`hillshade-illumination-direction`).values, t2 = this.paint.get(`hillshade-illumination-altitude`).values, n2 = this.paint.get(`hillshade-highlight-color`).values, r2 = this.paint.get(`hillshade-shadow-color`).values, i2 = Math.max(e51.length, t2.length, n2.length, r2.length);
    e51 = e51.concat(Array(i2 - e51.length).fill(e51.at(-1))), t2 = t2.concat(Array(i2 - t2.length).fill(t2.at(-1))), n2 = n2.concat(Array(i2 - n2.length).fill(n2.at(-1))), r2 = r2.concat(Array(i2 - r2.length).fill(r2.at(-1)));
    let a2 = t2.map(tn);
    return { directionRadians: e51.map(tn), altitudeRadians: a2, shadowColor: r2, highlightColor: n2 };
  }
  hasOffscreenPass() {
    return this.paint.get(`hillshade-exaggeration`) !== 0 && !this.isHidden();
  }
};
var bf;
var xf = () => bf ||= new _l({ "color-relief-opacity": new G(M[`paint_color-relief`][`color-relief-opacity`], `color-relief-opacity`), "color-relief-color": new gl(M[`paint_color-relief`][`color-relief-color`], `color-relief-color`), resampling: new G(M[`paint_color-relief`].resampling, `resampling`) });
var Sf = { get paint() {
  return xf();
} };
function Cf(e51) {
  return `data` in e51;
}
var wf = class {
  constructor(e51, t2, n2, r2) {
    this.context = e51, this.format = n2, this.texture = e51.gl.createTexture(), this._ownedHandle = this.texture, this.update(t2, r2);
  }
  update(e51, t2, n2) {
    let { width: r2, height: i2 } = e51, a2 = (this.size?.[0] !== r2 || this.size[1] !== i2) && !n2, { context: o2 } = this, { gl: s2 } = o2;
    this.useMipmap = !!t2?.useMipmap, a2 && this.size && this.format === s2.RGBA && (s2.deleteTexture(this.texture), this.texture = s2.createTexture(), this._ownedHandle = this.texture, this.filter = void 0, this.wrap = void 0), s2.bindTexture(s2.TEXTURE_2D, this.texture), o2.pixelStoreUnpackFlipY.set(false), o2.pixelStoreUnpack.set(1);
    let c2 = this.format === s2.RGBA && t2?.premultiply !== false;
    if (a2) {
      if (this.size = [r2, i2], this.format === s2.RGBA && r2 > 0 && i2 > 0) {
        let t3 = this.useMipmap ? Math.floor(Math.log2(Math.max(r2, i2))) + 1 : 1;
        if (s2.texStorage2D(s2.TEXTURE_2D, t3, s2.RGBA8, r2, i2), Cf(e51)) {
          o2.pixelStoreUnpackPremultiplyAlpha.set(false);
          let { data: t4 } = e51;
          c2 && t4 && (t4 = uf(t4)), t4 && s2.texSubImage2D(s2.TEXTURE_2D, 0, 0, 0, r2, i2, s2.RGBA, s2.UNSIGNED_BYTE, t4);
        } else o2.pixelStoreUnpackPremultiplyAlpha.set(c2), s2.texSubImage2D(s2.TEXTURE_2D, 0, 0, 0, s2.RGBA, s2.UNSIGNED_BYTE, e51);
      } else Cf(e51) ? (o2.pixelStoreUnpackPremultiplyAlpha.set(false), this._uploadRawData(e51, c2, r2, i2, s2)) : (o2.pixelStoreUnpackPremultiplyAlpha.set(c2), this._uploadDomImage(e51, s2));
    } else {
      let { x: t3, y: a3 } = n2 || { x: 0, y: 0 };
      Cf(e51) ? (o2.pixelStoreUnpackPremultiplyAlpha.set(false), this._updateRawData(e51, c2, t3, a3, r2, i2, s2)) : (o2.pixelStoreUnpackPremultiplyAlpha.set(c2), this._updateDomImage(e51, t3, a3, s2));
    }
    this.useMipmap && s2.generateMipmap(s2.TEXTURE_2D), o2.pixelStoreUnpackFlipY.setDefault(), o2.pixelStoreUnpack.setDefault(), o2.pixelStoreUnpackPremultiplyAlpha.setDefault();
  }
  _uploadDomImage(e51, t2) {
    t2.texImage2D(t2.TEXTURE_2D, 0, this.format, this.format, t2.UNSIGNED_BYTE, e51);
  }
  _uploadRawData(e51, t2, n2, r2, i2) {
    let { data: a2 } = e51;
    t2 && a2 && (a2 = uf(a2)), i2.texImage2D(i2.TEXTURE_2D, 0, this.format, n2, r2, 0, this.format, i2.UNSIGNED_BYTE, a2);
  }
  _updateDomImage(e51, t2, n2, r2) {
    r2.texSubImage2D(r2.TEXTURE_2D, 0, t2, n2, r2.RGBA, r2.UNSIGNED_BYTE, e51);
  }
  _updateRawData(e51, t2, n2, r2, i2, a2, o2) {
    let { data: s2 } = e51;
    t2 && s2 && (s2 = uf(s2)), o2.texSubImage2D(o2.TEXTURE_2D, 0, n2, r2, i2, a2, o2.RGBA, o2.UNSIGNED_BYTE, s2);
  }
  bind(e51, t2, n2) {
    let { context: r2 } = this, { gl: i2 } = r2;
    this.texture !== this._ownedHandle && (this.texture = this._ownedHandle), i2.bindTexture(i2.TEXTURE_2D, this.texture), n2 === i2.LINEAR_MIPMAP_NEAREST && !this.useMipmap && (n2 = i2.LINEAR), e51 !== this.filter && (i2.texParameteri(i2.TEXTURE_2D, i2.TEXTURE_MAG_FILTER, e51), i2.texParameteri(i2.TEXTURE_2D, i2.TEXTURE_MIN_FILTER, n2 || e51), this.filter = e51), t2 !== this.wrap && (i2.texParameteri(i2.TEXTURE_2D, i2.TEXTURE_WRAP_S, t2), i2.texParameteri(i2.TEXTURE_2D, i2.TEXTURE_WRAP_T, t2), this.wrap = t2);
  }
  destroy() {
    let { gl: e51 } = this.context;
    e51.deleteTexture(this.texture), this.texture = null, this._ownedHandle = null;
  }
};
var Tf = class e41 {
  static {
    this.byteViewCache = /* @__PURE__ */ new WeakMap();
  }
  constructor(t2, n2, r2, i2 = 1, a2 = 1, o2 = 1, s2 = 0) {
    if (this.uid = t2, n2.height !== n2.width) throw RangeError(`DEM tiles must be square`);
    if (r2 && ![`mapbox`, `terrarium`, `custom`].includes(r2)) {
      It(`"${r2}" is not a valid encoding type. Valid types include "mapbox", "terrarium" and "custom".`);
      return;
    }
    this.stride = n2.height;
    let c2 = this.dim = n2.height - 2;
    switch (this.data = new Uint32Array(n2.data.buffer), e41.byteViewCache.set(this, new Uint8Array(this.data.buffer)), r2) {
      case `terrarium`:
        this.redFactor = 256, this.greenFactor = 1, this.blueFactor = 1 / 256, this.baseShift = 32768;
        break;
      case `custom`:
        this.redFactor = i2, this.greenFactor = a2, this.blueFactor = o2, this.baseShift = s2;
        break;
      default:
        this.redFactor = 6553.6, this.greenFactor = 25.6, this.blueFactor = 0.1, this.baseShift = 1e4;
    }
    for (let e51 = 0; e51 < c2; e51++) this.data[this._idx(-1, e51)] = this.data[this._idx(0, e51)], this.data[this._idx(c2, e51)] = this.data[this._idx(c2 - 1, e51)], this.data[this._idx(e51, -1)] = this.data[this._idx(e51, 0)], this.data[this._idx(e51, c2)] = this.data[this._idx(e51, c2 - 1)];
    this.data[this._idx(-1, -1)] = this.data[this._idx(0, 0)], this.data[this._idx(c2, -1)] = this.data[this._idx(c2 - 1, 0)], this.data[this._idx(-1, c2)] = this.data[this._idx(0, c2 - 1)], this.data[this._idx(c2, c2)] = this.data[this._idx(c2 - 1, c2 - 1)];
    let l2 = this._getByteView();
    this.min = 2 ** 53 - 1, this.max = -(2 ** 53 - 1);
    for (let e51 = 0; e51 < c2; e51++) for (let t3 = 0; t3 < c2; t3++) {
      let n3 = this._idx(e51, t3) * 4, r3 = this._unpackAtIndex(l2, n3);
      r3 > this.max && (this.max = r3), r3 < this.min && (this.min = r3);
    }
  }
  get(e51, t2) {
    let n2 = this._getByteView(), r2 = this._idx(e51, t2) * 4;
    return this._unpackAtIndex(n2, r2);
  }
  sampleBilinear(e51, t2) {
    let n2 = Math.floor(e51), r2 = Math.floor(t2);
    if (n2 < -1 || n2 >= this.dim || r2 < -1 || r2 >= this.dim) throw RangeError(`Out of range source coordinates for DEM data. x: ${e51}, y: ${t2}, dim: ${this.dim}`);
    let i2 = this._getByteView(), a2 = ((r2 + 1) * this.stride + n2 + 1) * 4, o2 = this.stride * 4, s2 = e51 - n2, c2 = t2 - r2, l2 = this._unpackAtIndex(i2, a2), u2 = this._unpackAtIndex(i2, a2 + 4), d2 = this._unpackAtIndex(i2, a2 + o2), f2 = this._unpackAtIndex(i2, a2 + o2 + 4);
    return l2 * (1 - s2) * (1 - c2) + u2 * s2 * (1 - c2) + d2 * (1 - s2) * c2 + f2 * s2 * c2;
  }
  getUnpackVector() {
    return [this.redFactor, this.greenFactor, this.blueFactor, this.baseShift];
  }
  _idx(e51, t2) {
    if (e51 < -1 || e51 >= this.dim + 1 || t2 < -1 || t2 >= this.dim + 1) throw RangeError(`Out of range source coordinates for DEM data. x: ${e51}, y: ${t2}, dim: ${this.dim}`);
    return (t2 + 1) * this.stride + (e51 + 1);
  }
  unpack(e51, t2, n2) {
    return e51 * this.redFactor + t2 * this.greenFactor + n2 * this.blueFactor - this.baseShift;
  }
  pack(e51) {
    return Ef(e51, this.getUnpackVector());
  }
  getPixels() {
    return new lf({ width: this.stride, height: this.stride }, this._getByteView());
  }
  backfillBorder(e51, t2, n2) {
    if (this.dim !== e51.dim) throw Error(`dem dimension mismatch`);
    let r2 = t2 * this.dim, i2 = t2 * this.dim + this.dim, a2 = n2 * this.dim, o2 = n2 * this.dim + this.dim;
    switch (t2) {
      case -1:
        r2 = i2 - 1;
        break;
      case 1:
        i2 = r2 + 1;
    }
    switch (n2) {
      case -1:
        a2 = o2 - 1;
        break;
      case 1:
        o2 = a2 + 1;
    }
    let s2 = -t2 * this.dim, c2 = -n2 * this.dim;
    for (let t3 = a2; t3 < o2; t3++) for (let n3 = r2; n3 < i2; n3++) this.data[this._idx(n3, t3)] = e51.data[this._idx(n3 + s2, t3 + c2)];
  }
  _getByteView() {
    let t2 = e41.byteViewCache.get(this);
    return t2?.buffer !== this.data.buffer && (t2 = new Uint8Array(this.data.buffer), e41.byteViewCache.set(this, t2)), t2;
  }
  _unpackAtIndex(e51, t2) {
    return this.unpack(e51[t2], e51[t2 + 1], e51[t2 + 2]);
  }
};
function Ef(e51, t2) {
  let n2 = t2[0], r2 = t2[1], i2 = t2[2], a2 = t2[3], o2 = Math.min(n2, r2, i2), s2 = Math.round((e51 + a2) / o2);
  return { r: Math.floor(s2 * o2 / n2) % 256, g: Math.floor(s2 * o2 / r2) % 256, b: Math.floor(s2 * o2 / i2) % 256 };
}
U(`DEMData`, Tf);
var Of = class extends bl {
  constructor(e51, t2) {
    super(e51, Sf, t2);
  }
  _createColorRamp(e51) {
    let t2 = { elevationStops: [], colorStops: [] }, n2 = this._transitionablePaint._values[`color-relief-color`].value.expression;
    if (n2 instanceof Go && n2._styleExpression.expression instanceof Ei) {
      this.colorRampExpression = n2;
      let e52 = n2._styleExpression.expression;
      t2.elevationStops = e52.labels, t2.colorStops = [];
      for (let n3 of t2.elevationStops) t2.colorStops.push(e52.evaluate({ globals: { elevation: n3 } }));
    }
    if (t2.elevationStops.length < 1 && (t2.elevationStops = [0], t2.colorStops = [B.transparent]), t2.elevationStops.length < 2 && (t2.elevationStops.push(t2.elevationStops[0] + 1), t2.colorStops.push(t2.colorStops[0])), t2.elevationStops.length <= e51) return t2;
    let r2 = { elevationStops: [], colorStops: [] }, i2 = (t2.elevationStops.length - 1) / (e51 - 1);
    for (let e52 = 0; e52 < t2.elevationStops.length - 0.5; e52 += i2) r2.elevationStops.push(t2.elevationStops[Math.round(e52)]), r2.colorStops.push(t2.colorStops[Math.round(e52)]);
    return It(`Too many colors in specification of ${this.id} color-relief layer, may not render properly. Max possible colors: ${e51}, provided: ${t2.elevationStops.length}`), r2;
  }
  _colorRampChanged() {
    return this.colorRampExpression != this._transitionablePaint._values[`color-relief-color`].value.expression;
  }
  getColorRampTextures(e51, t2, n2) {
    if (this.colorRampTextures && !this._colorRampChanged()) return this.colorRampTextures;
    let r2 = this._createColorRamp(t2), i2 = new lf({ width: r2.colorStops.length, height: 1 }), a2 = new lf({ width: r2.colorStops.length, height: 1 });
    for (let e52 = 0; e52 < r2.elevationStops.length; e52++) {
      let t3 = Ef(r2.elevationStops[e52], n2);
      a2.setPixel(0, e52, new B(t3.r / 255, t3.g / 255, t3.b / 255, 1)), i2.setPixel(0, e52, r2.colorStops[e52]);
    }
    return this.colorRampTextures = { elevationTexture: new wf(e51, a2, e51.gl.RGBA), colorTexture: new wf(e51, i2, e51.gl.RGBA) }, this.colorRampTextures;
  }
  hasOffscreenPass() {
    return !this.isHidden() && !!this.colorRampTextures;
  }
};
var kf = J([{ name: `a_pos`, components: 2, type: `Int16` }], 4);
var Af = kf.members;
kf.size, kf.alignment;
function jf(e51, t2, n2) {
  let r2 = n2.patternDependencies, i2 = false;
  for (let n3 of t2) {
    let t3 = n3.paint.get(`${e51}-pattern`);
    t3.isConstant() || (i2 = true);
    let a2 = t3.constantOr(null);
    a2 && (i2 = true, r2[a2.to] = true, r2[a2.from] = true);
  }
  return i2;
}
function Mf(e51, t2, n2, r2, i2) {
  let { zoom: a2 } = r2, o2 = i2.patternDependencies;
  for (let r3 of t2) {
    let t3 = r3.paint.get(`${e51}-pattern`).value;
    if (t3.kind !== `constant`) {
      let e52 = t3.evaluate({ zoom: a2 - 1 }, n2, {}, i2.availableImages), s2 = t3.evaluate({ zoom: a2 }, n2, {}, i2.availableImages), c2 = t3.evaluate({ zoom: a2 + 1 }, n2, {}, i2.availableImages);
      e52 = e52?.name ? e52.name : e52, s2 = s2?.name ? s2.name : s2, c2 = c2?.name ? c2.name : c2, o2[e52] = true, o2[s2] = true, o2[c2] = true, n2.patterns[r3.id] = { min: e52, mid: s2, max: c2 };
    }
  }
  return n2;
}
var Nf = /* @__PURE__ */ new Set();
var Pf = false;
function Ff(e51, t2, n2 = 2) {
  let r2 = t2 && t2.length, i2 = r2 ? t2[0] * n2 : e51.length;
  Nf.size && Nf.clear();
  let a2 = If(e51, 0, i2, n2, true), o2 = [];
  if (!a2 || a2.next === a2.prev) return o2;
  let s2 = 0, c2 = 0, l2 = 0;
  if (r2 && (a2 = Wf(e51, t2, a2, n2)), e51.length > 80 * n2) {
    s2 = e51[0], c2 = e51[1];
    let t3 = s2, r3 = c2;
    for (let a3 = n2; a3 < i2; a3 += n2) {
      let n3 = e51[a3], i3 = e51[a3 + 1];
      n3 < s2 && (s2 = n3), i3 < c2 && (c2 = i3), n3 > t3 && (t3 = n3), i3 > r3 && (r3 = i3);
    }
    l2 = Math.max(t3 - s2, r3 - c2), l2 = l2 === 0 ? 0 : 32767 / l2;
  }
  return Rf(a2, o2, s2, c2, l2), o2;
}
function If(e51, t2, n2, r2, i2) {
  let a2 = null;
  if (i2 === Dp(e51, t2, n2, r2) > 0) for (let i3 = t2; i3 < n2; i3 += r2) a2 = wp(i3 / r2 | 0, e51[i3], e51[i3 + 1], a2);
  else for (let i3 = n2 - r2; i3 >= t2; i3 -= r2) a2 = wp(i3 / r2 | 0, e51[i3], e51[i3 + 1], a2);
  return a2 && _p(a2, a2.next) && (Tp(a2), a2 = a2.next), a2;
}
function Lf(e51, t2 = e51) {
  let n2 = t2 === e51, r2 = e51, i2;
  do
    i2 = false, r2 !== r2.next && (Nf.size === 0 || !Nf.has(r2)) && (_p(r2, r2.next) || gp(r2.prev, r2, r2.next) === 0) ? ((n2 || r2 === t2) && (t2 = r2.prev), Pf = true, Tp(r2), r2 = r2.prev, i2 = true) : (n2 || r2 !== t2) && (r2 = r2.next, i2 = !n2);
  while (i2 || r2 !== t2);
  return t2;
}
function Rf(e51, t2, n2, r2, i2) {
  i2 && lp(e51, n2, r2, i2);
  let a2 = e51, o2 = false;
  for (; e51.prev !== e51.next; ) {
    let s2 = e51.prev, c2 = e51.next;
    if (gp(s2, e51, c2) < 0 && (i2 ? Bf(e51, n2, r2, i2) : zf(e51))) {
      t2.push(s2.i, e51.i, c2.i), Tp(e51), e51 = c2, a2 = c2;
      continue;
    }
    if (e51 = c2, e51 === a2) {
      if (Pf = false, e51 = Lf(e51), Pf) {
        a2 = e51;
        continue;
      }
      if (!o2) {
        e51 = Vf(e51, t2), a2 = e51, o2 = true;
        continue;
      }
      Hf(e51, t2, n2, r2, i2);
      break;
    }
  }
}
function zf(e51) {
  let t2 = e51.prev, n2 = e51, r2 = e51.next, i2 = t2.x, a2 = n2.x, o2 = r2.x, s2 = t2.y, c2 = n2.y, l2 = r2.y, u2 = Math.min(i2, a2, o2), d2 = Math.min(s2, c2, l2), f2 = Math.max(i2, a2, o2), p2 = Math.max(s2, c2, l2), m2 = r2.next;
  for (; m2 !== t2; ) {
    if (m2.x >= u2 && m2.x <= f2 && m2.y >= d2 && m2.y <= p2 && (i2 !== m2.x || s2 !== m2.y) && mp(i2, s2, a2, c2, o2, l2, m2.x, m2.y) && gp(m2.prev, m2, m2.next) >= 0) return false;
    m2 = m2.next;
  }
  return true;
}
function Bf(e51, t2, n2, r2) {
  let i2 = e51.prev, a2 = e51, o2 = e51.next, s2 = i2.x, c2 = a2.x, l2 = o2.x, u2 = i2.y, d2 = a2.y, f2 = o2.y, p2 = Math.min(s2, c2, l2), m2 = Math.min(u2, d2, f2), h2 = Math.max(s2, c2, l2), g2 = Math.max(u2, d2, f2), _ = fp(p2, m2, t2, n2, r2), v = fp(h2, g2, t2, n2, r2), y = e51.prevZ;
  for (; y && y.z >= _; ) {
    if (y.x >= p2 && y.x <= h2 && y.y >= m2 && y.y <= g2 && y !== o2 && (s2 !== y.x || u2 !== y.y) && mp(s2, u2, c2, d2, l2, f2, y.x, y.y) && gp(y.prev, y, y.next) >= 0) return false;
    y = y.prevZ;
  }
  let b = e51.nextZ;
  for (; b && b.z <= v; ) {
    if (b.x >= p2 && b.x <= h2 && b.y >= m2 && b.y <= g2 && b !== o2 && (s2 !== b.x || u2 !== b.y) && mp(s2, u2, c2, d2, l2, f2, b.x, b.y) && gp(b.prev, b, b.next) >= 0) return false;
    b = b.nextZ;
  }
  return true;
}
function Vf(e51, t2) {
  let n2 = e51, r2 = false;
  do {
    let i2 = n2.prev, a2 = n2.next.next;
    vp(i2, n2, n2.next, a2, false) && xp(i2, a2) && xp(a2, i2) && (t2.push(i2.i, n2.i, a2.i), Tp(n2), Tp(n2.next), n2 = e51 = a2, r2 = true), n2 = n2.next;
  } while (n2 !== e51);
  return r2 ? Lf(n2) : n2;
}
function Hf(e51, t2, n2, r2, i2) {
  let a2 = e51;
  do {
    let e52 = a2.next.next;
    for (; e52 !== a2.prev; ) {
      if (a2.i !== e52.i && hp(a2, e52)) {
        let o2 = Cp(a2, e52);
        a2 = Lf(a2, a2.next), o2 = Lf(o2, o2.next), Rf(a2, t2, n2, r2, i2), Rf(o2, t2, n2, r2, i2);
        return;
      }
      e52 = e52.next;
    }
    a2 = a2.next;
  } while (a2 !== e51);
}
var Uf = false;
function Wf(e51, t2, n2, r2) {
  let i2 = [];
  for (let n3 = 0, a2 = t2.length; n3 < a2; n3++) {
    let o2 = If(e51, t2[n3] * r2, n3 < a2 - 1 ? t2[n3 + 1] * r2 : e51.length, r2, false);
    o2 === o2.next && Nf.add(o2), i2.push(pp(o2));
  }
  i2.sort(Gf), Zf(e51.length / r2, t2.length), Qf(n2, n2), Uf = true;
  for (let e52 = 0; e52 < i2.length; e52++) n2 = Kf(i2[e52], n2);
  return Uf = false, Lf(n2);
}
function Gf(e51, t2) {
  return e51.x - t2.x || e51.y - t2.y || (e51.next.y - e51.y) / (e51.next.x - e51.x) - (t2.next.y - t2.y) / (t2.next.x - t2.x);
}
function Kf(e51, t2) {
  let n2 = np(e51, t2);
  if (!n2) return t2;
  let r2 = Cp(n2, e51), i2 = r2.next;
  return Qf(n2, i2.next), Lf(r2, r2.next), Lf(n2, n2.next);
}
var qf = new Float64Array();
var Jf = 0;
var Yf = [];
var Xf = [];
function Zf(e51, t2) {
  let n2 = Math.ceil((e51 + 2 * t2) / 16) + t2 + 2;
  qf.length < n2 * 4 && (qf = new Float64Array(n2 * 4)), Jf = 0;
}
function Qf(e51, t2) {
  let n2 = e51;
  do {
    let e52 = Jf++;
    Yf[e52] = n2;
    let r2 = 1 / 0, i2 = 1 / 0, a2 = -1 / 0, o2 = -1 / 0, s2 = 0;
    do {
      let t3 = n2.next;
      n2.z = e52, n2.x < r2 && (r2 = n2.x), n2.x > a2 && (a2 = n2.x), n2.y < i2 && (i2 = n2.y), n2.y > o2 && (o2 = n2.y), t3.x < r2 && (r2 = t3.x), t3.x > a2 && (a2 = t3.x), t3.y < i2 && (i2 = t3.y), t3.y > o2 && (o2 = t3.y), n2 = t3;
    } while (++s2 < 16 && n2 !== t2);
    Xf[e52] = n2;
    let c2 = e52 * 4;
    qf[c2] = r2, qf[c2 + 1] = i2, qf[c2 + 2] = a2, qf[c2 + 3] = o2;
  } while (n2 !== t2);
}
function $f(e51, t2) {
  let n2 = e51.z * 4;
  t2.x < qf[n2] && (qf[n2] = t2.x), t2.y < qf[n2 + 1] && (qf[n2 + 1] = t2.y), t2.x > qf[n2 + 2] && (qf[n2 + 2] = t2.x), t2.y > qf[n2 + 3] && (qf[n2 + 3] = t2.y);
}
function ep(e51) {
  let t2 = Xf[e51];
  for (; t2.prev.next !== t2; ) t2 = t2.next;
  return Xf[e51] = t2, t2;
}
function tp(e51) {
  let t2 = Yf[e51];
  for (; t2.prev.next !== t2; ) t2 = t2.next;
  return Yf[e51] = t2, t2;
}
function np(e51, t2) {
  let n2 = t2, r2 = e51.x, i2 = e51.y, a2 = -1 / 0, o2;
  if (_p(e51, n2)) return n2;
  for (let t3 = 0, s3 = 0; t3 < Jf; t3++, s3 += 4) {
    if (i2 < qf[s3 + 1] || i2 > qf[s3 + 3] || qf[s3] > r2 || qf[s3 + 2] <= a2) continue;
    let c3 = ep(t3);
    n2 = tp(t3);
    do {
      if (n2.prev.next === n2) {
        if (_p(e51, n2.next)) return n2.next;
        if (i2 <= n2.y && i2 >= n2.next.y && n2.next.y !== n2.y) {
          let e52 = n2.x + (i2 - n2.y) * (n2.next.x - n2.x) / (n2.next.y - n2.y);
          if (e52 <= r2 && e52 > a2 && (a2 = e52, o2 = n2.x < n2.next.x ? n2 : n2.next, e52 === r2)) return o2;
        }
      }
      n2 = n2.next;
    } while (n2 !== c3);
  }
  if (!o2) return null;
  let s2 = o2.x, c2 = o2.y, l2 = Math.min(i2, c2), u2 = Math.max(i2, c2), d2 = 1 / 0;
  for (let t3 = 0, f2 = 0; t3 < Jf; t3++, f2 += 4) {
    if (qf[f2 + 2] < s2 || qf[f2] > r2 || qf[f2 + 3] < l2 || qf[f2 + 1] > u2) continue;
    let p2 = ep(t3);
    n2 = tp(t3);
    do {
      if (n2.prev.next === n2 && r2 >= n2.x && n2.x >= s2 && r2 !== n2.x && mp(i2 < c2 ? r2 : a2, i2, s2, c2, i2 < c2 ? a2 : r2, i2, n2.x, n2.y)) {
        let t4 = Math.abs(i2 - n2.y) / (r2 - n2.x);
        (xp(n2, e51) || n2.y === i2 && n2.next.y === i2 && n2.next.x > r2) && (t4 < d2 || t4 === d2 && (n2.x > o2.x || n2.x === o2.x && rp(o2, n2))) && (o2 = n2, d2 = t4);
      }
      n2 = n2.next;
    } while (n2 !== p2);
  }
  return o2;
}
function rp(e51, t2) {
  return gp(e51.prev, e51, t2.prev) < 0 && gp(t2.next, e51, e51.next) < 0;
}
var ip = [];
var ap = [];
var op = new Uint32Array();
var sp = new Uint32Array();
var cp = new Uint32Array(256);
function lp(e51, t2, n2, r2) {
  let i2 = e51, a2 = 0;
  do
    i2.z = fp(i2.x, i2.y, t2, n2, r2), ip[a2++] = i2, i2 = i2.next;
  while (i2 !== e51);
  up(a2);
  let o2 = null;
  for (let e52 = 0; e52 < a2; e52++) {
    let t3 = ip[e52];
    t3.prevZ = o2, o2 && (o2.nextZ = t3), o2 = t3;
  }
  o2.nextZ = null;
}
function up(e51) {
  if (e51 <= 32) {
    for (let t2 = 1; t2 < e51; t2++) {
      let e52 = ip[t2], n2 = e52.z, r2 = t2 - 1;
      for (; r2 >= 0 && ip[r2].z > n2; ) ip[r2 + 1] = ip[r2], r2--;
      ip[r2 + 1] = e52;
    }
    return;
  }
  op.length < e51 && (op = new Uint32Array(e51), sp = new Uint32Array(e51), ap = Array(e51));
  for (let t2 = 0; t2 < e51; t2++) op[t2] = ip[t2].z;
  dp(e51, ip, op, ap, sp, 0), dp(e51, ap, sp, ip, op, 8), dp(e51, ip, op, ap, sp, 16), dp(e51, ap, sp, ip, op, 24);
}
function dp(e51, t2, n2, r2, i2, a2) {
  cp.fill(0);
  for (let t3 = 0; t3 < e51; t3++) cp[n2[t3] >>> a2 & 255]++;
  let o2 = 0;
  for (let e52 = 0; e52 < 256; e52++) {
    let t3 = cp[e52];
    cp[e52] = o2, o2 += t3;
  }
  for (let o3 = 0; o3 < e51; o3++) {
    let e52 = n2[o3], s2 = cp[e52 >>> a2 & 255]++;
    r2[s2] = t2[o3], i2[s2] = e52;
  }
}
function fp(e51, t2, n2, r2, i2) {
  return e51 = (e51 - n2) * i2 | 0, t2 = (t2 - r2) * i2 | 0, e51 = (e51 | e51 << 8) & 16711935, e51 = (e51 | e51 << 4) & 252645135, e51 = (e51 | e51 << 2) & 858993459, e51 = (e51 | e51 << 1) & 1431655765, t2 = (t2 | t2 << 8) & 16711935, t2 = (t2 | t2 << 4) & 252645135, t2 = (t2 | t2 << 2) & 858993459, t2 = (t2 | t2 << 1) & 1431655765, e51 | t2 << 1;
}
function pp(e51) {
  let t2 = e51, n2 = e51;
  do
    (t2.x < n2.x || t2.x === n2.x && t2.y < n2.y) && (n2 = t2), t2 = t2.next;
  while (t2 !== e51);
  return n2;
}
function mp(e51, t2, n2, r2, i2, a2, o2, s2) {
  return (i2 - o2) * (t2 - s2) >= (e51 - o2) * (a2 - s2) && (e51 - o2) * (r2 - s2) >= (n2 - o2) * (t2 - s2) && (n2 - o2) * (a2 - s2) >= (i2 - o2) * (r2 - s2);
}
function hp(e51, t2) {
  let n2 = _p(e51, t2) && gp(e51.prev, e51, e51.next) > 0 && gp(t2.prev, t2, t2.next) > 0;
  return e51.next.i !== t2.i && (n2 || xp(e51, t2) && xp(t2, e51) && (gp(e51.prev, e51, t2.prev) !== 0 || gp(e51, t2.prev, t2) !== 0)) && !bp(e51, t2) && (n2 || Sp(e51, t2));
}
function gp(e51, t2, n2) {
  return (t2.y - e51.y) * (n2.x - t2.x) - (t2.x - e51.x) * (n2.y - t2.y);
}
function _p(e51, t2) {
  return e51.x === t2.x && e51.y === t2.y;
}
function vp(e51, t2, n2, r2, i2 = true) {
  let a2 = gp(e51, t2, n2), o2 = gp(e51, t2, r2), s2 = gp(n2, r2, e51), c2 = gp(n2, r2, t2);
  return (a2 > 0 && o2 < 0 || a2 < 0 && o2 > 0) && (s2 > 0 && c2 < 0 || s2 < 0 && c2 > 0) ? true : i2 ? !!(a2 === 0 && yp(e51, n2, t2) || o2 === 0 && yp(e51, r2, t2) || s2 === 0 && yp(n2, e51, r2) || c2 === 0 && yp(n2, t2, r2)) : false;
}
function yp(e51, t2, n2) {
  return t2.x <= Math.max(e51.x, n2.x) && t2.x >= Math.min(e51.x, n2.x) && t2.y <= Math.max(e51.y, n2.y) && t2.y >= Math.min(e51.y, n2.y);
}
function bp(e51, t2) {
  let n2 = Math.min(e51.x, t2.x), r2 = Math.max(e51.x, t2.x), i2 = Math.min(e51.y, t2.y), a2 = Math.max(e51.y, t2.y), o2 = e51;
  do {
    let s2 = o2.next;
    if (o2.x > r2 && s2.x > r2 || o2.x < n2 && s2.x < n2 || o2.y > a2 && s2.y > a2 || o2.y < i2 && s2.y < i2) {
      o2 = s2;
      continue;
    }
    if (o2.i !== e51.i && s2.i !== e51.i && o2.i !== t2.i && s2.i !== t2.i && vp(o2, s2, e51, t2)) return true;
    o2 = s2;
  } while (o2 !== e51);
  return false;
}
function xp(e51, t2) {
  return gp(e51.prev, e51, e51.next) < 0 ? gp(e51, t2, e51.next) >= 0 && gp(e51, e51.prev, t2) >= 0 : gp(e51, t2, e51.prev) < 0 || gp(e51, e51.next, t2) < 0;
}
function Sp(e51, t2) {
  let n2 = e51, r2 = false, i2 = (e51.x + t2.x) / 2, a2 = (e51.y + t2.y) / 2;
  do {
    let e52 = n2.next;
    n2.y > a2 != e52.y > a2 && i2 < (e52.x - n2.x) * (a2 - n2.y) / (e52.y - n2.y) + n2.x && (r2 = !r2), n2 = e52;
  } while (n2 !== e51);
  return r2;
}
function Cp(e51, t2) {
  let n2 = Ep(e51.i, e51.x, e51.y), r2 = Ep(t2.i, t2.x, t2.y), i2 = e51.next, a2 = t2.prev;
  return e51.next = t2, t2.prev = e51, n2.next = i2, i2.prev = n2, r2.next = n2, n2.prev = r2, a2.next = r2, r2.prev = a2, r2;
}
function wp(e51, t2, n2, r2) {
  let i2 = Ep(e51, t2, n2);
  return r2 ? (i2.next = r2.next, i2.prev = r2, r2.next.prev = i2, r2.next = i2) : (i2.prev = i2, i2.next = i2), i2;
}
function Tp(e51) {
  e51.next.prev = e51.prev, e51.prev.next = e51.next, e51.prevZ && (e51.prevZ.nextZ = e51.nextZ), e51.nextZ && (e51.nextZ.prevZ = e51.prevZ), Uf && $f(e51.prev, e51.next);
}
function Ep(e51, t2, n2) {
  return { i: e51, x: t2, y: n2, prev: null, next: null, z: 0, prevZ: null, nextZ: null };
}
function Dp(e51, t2, n2, r2) {
  let i2 = 0;
  for (let a2 = t2, o2 = n2 - r2; a2 < n2; a2 += r2) i2 += (e51[o2] - e51[a2]) * (e51[a2 + 1] + e51[o2 + 1]), o2 = a2;
  return i2;
}
var Op = class {
  constructor(e51, t2) {
    if (t2 > e51) throw Error(`Min granularity must not be greater than base granularity.`);
    this._baseZoomGranularity = e51, this._minGranularity = t2;
  }
  getGranularityForZoomLevel(e51) {
    let t2 = 1 << e51;
    return Math.max(Math.floor(this._baseZoomGranularity / t2), this._minGranularity, 1);
  }
};
var kp = class e42 {
  constructor(e51) {
    this.fill = e51.fill, this.line = e51.line, this.tile = e51.tile, this.stencil = e51.stencil, this.circle = e51.circle;
  }
  static {
    this.noSubdivision = new e42({ fill: new Op(0, 0), line: new Op(0, 0), tile: new Op(0, 0), stencil: new Op(0, 0), circle: 1 });
  }
};
U(`SubdivisionGranularityExpression`, Op), U(`SubdivisionGranularitySetting`, kp);
var Ap = -32768;
var jp = 32767;
var Mp = class {
  constructor(e51, t2) {
    this._vertexBuffer = [], this._vertexDictionary = /* @__PURE__ */ new Map(), this._used = false, this._granularity = e51, this._granularityCellSize = j / e51, this._canonical = t2;
  }
  _getKey(e51, t2) {
    return e51 += 32768, t2 += 32768, e51 << 16 | t2 << 0;
  }
  _vertexToIndex(e51, t2) {
    if (e51 < -32768 || t2 < -32768 || e51 > 32767 || t2 > 32767) throw Error(`Vertex coordinates are out of signed 16 bit integer range.`);
    let n2 = Math.round(e51) | 0, r2 = Math.round(t2) | 0, i2 = this._getKey(n2, r2);
    if (this._vertexDictionary.has(i2)) return this._vertexDictionary.get(i2);
    let a2 = this._vertexBuffer.length / 2;
    return this._vertexDictionary.set(i2, a2), this._vertexBuffer.push(n2, r2), a2;
  }
  _subdivideTrianglesScanline(e51) {
    if (this._granularity < 2) return Ip(this._vertexBuffer, e51);
    let t2 = [], n2 = e51.length;
    for (let r2 = 0; r2 < n2; r2 += 3) {
      let n3 = [e51[r2 + 0], e51[r2 + 1], e51[r2 + 2]], i2 = [this._vertexBuffer[e51[r2 + 0] * 2 + 0], this._vertexBuffer[e51[r2 + 0] * 2 + 1], this._vertexBuffer[e51[r2 + 1] * 2 + 0], this._vertexBuffer[e51[r2 + 1] * 2 + 1], this._vertexBuffer[e51[r2 + 2] * 2 + 0], this._vertexBuffer[e51[r2 + 2] * 2 + 1]], a2 = 1 / 0, o2 = 1 / 0, s2 = -1 / 0, c2 = -1 / 0;
      for (let e52 = 0; e52 < 3; e52++) {
        let t3 = i2[e52 * 2], n4 = i2[e52 * 2 + 1];
        a2 = Math.min(a2, t3), s2 = Math.max(s2, t3), o2 = Math.min(o2, n4), c2 = Math.max(c2, n4);
      }
      if (a2 === s2 || o2 === c2) continue;
      let l2 = Math.floor(a2 / this._granularityCellSize), u2 = Math.ceil(s2 / this._granularityCellSize), d2 = Math.floor(o2 / this._granularityCellSize), f2 = Math.ceil(c2 / this._granularityCellSize);
      if (l2 === u2 && d2 === f2) {
        t2.push(...n3);
        continue;
      }
      for (let e52 = d2; e52 < f2; e52++) {
        let r3 = this._scanlineGenerateVertexRingForCellRow(e52, i2, n3);
        Lp(this._vertexBuffer, r3, t2);
      }
    }
    return t2;
  }
  _scanlineGenerateVertexRingForCellRow(e51, t2, n2) {
    let r2 = e51 * this._granularityCellSize, i2 = r2 + this._granularityCellSize, a2 = [];
    for (let e52 = 0; e52 < 3; e52++) {
      let o2 = t2[e52 * 2], s2 = t2[e52 * 2 + 1], c2 = t2[(e52 + 1) * 2 % 6], l2 = t2[((e52 + 1) * 2 + 1) % 6], u2 = t2[(e52 + 2) * 2 % 6], d2 = t2[((e52 + 2) * 2 + 1) % 6], f2 = c2 - o2, p2 = l2 - s2, m2 = f2 === 0, h2 = p2 === 0, g2 = (r2 - s2) / p2, _ = (i2 - s2) / p2, v = Math.min(g2, _), y = Math.max(g2, _);
      if (!h2 && (v >= 1 || y <= 0) || h2 && (s2 < r2 || s2 > i2)) {
        l2 >= r2 && l2 <= i2 && a2.push(n2[(e52 + 1) % 3]);
        continue;
      }
      if (!h2 && v > 0) {
        let e53 = o2 + f2 * v, t3 = s2 + p2 * v;
        a2.push(this._vertexToIndex(e53, t3));
      }
      let b = o2 + f2 * Math.max(v, 0), x = o2 + f2 * Math.min(y, 1);
      if (m2 || this._generateIntraEdgeVertices(a2, o2, s2, c2, l2, b, x), !h2 && y < 1) {
        let e53 = o2 + f2 * y, t3 = s2 + p2 * y;
        a2.push(this._vertexToIndex(e53, t3));
      }
      (h2 || l2 >= r2 && l2 <= i2) && a2.push(n2[(e52 + 1) % 3]), !h2 && (l2 <= r2 || l2 >= i2) && this._generateInterEdgeVertices(a2, o2, s2, c2, l2, u2, d2, x, r2, i2);
    }
    return a2;
  }
  _generateIntraEdgeVertices(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = r2 - t2, c2 = i2 - n2, l2 = c2 === 0, u2 = l2 ? Math.min(t2, r2) : Math.min(a2, o2), d2 = l2 ? Math.max(t2, r2) : Math.max(a2, o2), f2 = Math.floor(u2 / this._granularityCellSize) + 1, p2 = Math.ceil(d2 / this._granularityCellSize) - 1;
    if (l2 ? t2 < r2 : a2 < o2) for (let r3 = f2; r3 <= p2; r3++) {
      let i3 = r3 * this._granularityCellSize, a3 = n2 + c2 * (i3 - t2) / s2;
      e51.push(this._vertexToIndex(i3, a3));
    }
    else for (let r3 = p2; r3 >= f2; r3--) {
      let i3 = r3 * this._granularityCellSize, a3 = n2 + c2 * (i3 - t2) / s2;
      e51.push(this._vertexToIndex(i3, a3));
    }
  }
  _generateInterEdgeVertices(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2) {
    let u2 = i2 - n2, d2 = a2 - r2, f2 = o2 - i2, p2 = (c2 - i2) / f2, m2 = (l2 - i2) / f2, h2 = Math.min(p2, m2), g2 = Math.max(p2, m2), _ = r2 + d2 * h2, v = Math.floor(Math.min(_, s2) / this._granularityCellSize) + 1, y = Math.ceil(Math.max(_, s2) / this._granularityCellSize) - 1, b = s2 < _, x = f2 === 0;
    if (x && (o2 === c2 || o2 === l2)) return;
    if (x || h2 >= 1 || g2 <= 0) {
      let e52 = t2 - a2, r3 = n2 - o2, i3 = (c2 - o2) / r3, u3 = (l2 - o2) / r3, d3 = a2 + e52 * Math.min(i3, u3);
      v = Math.floor(Math.min(d3, s2) / this._granularityCellSize) + 1, y = Math.ceil(Math.max(d3, s2) / this._granularityCellSize) - 1, b = s2 < d3;
    }
    let S = u2 > 0 ? l2 : c2;
    if (b) for (let t3 = v; t3 <= y; t3++) {
      let n3 = t3 * this._granularityCellSize;
      e51.push(this._vertexToIndex(n3, S));
    }
    else for (let t3 = y; t3 >= v; t3--) {
      let n3 = t3 * this._granularityCellSize;
      e51.push(this._vertexToIndex(n3, S));
    }
  }
  _generateOutline(e51) {
    let t2 = [];
    for (let n2 of e51) {
      let e52 = Pp(n2, this._granularity, true), r2 = this._pointArrayToIndices(e52), i2 = [];
      for (let e53 = 1; e53 < r2.length; e53++) i2.push(r2[e53 - 1]), i2.push(r2[e53]);
      t2.push(i2);
    }
    return t2;
  }
  _handlePoles(e51) {
    let t2 = false, n2 = false;
    this._canonical && (this._canonical.y === 0 && (t2 = true), this._canonical.y === (1 << this._canonical.z) - 1 && (n2 = true)), (t2 || n2) && this._fillPoles(e51, t2, n2);
  }
  _ensureNoPoleVertices() {
    let e51 = this._vertexBuffer;
    for (let t2 = 0; t2 < e51.length; t2 += 2) {
      let n2 = e51[t2 + 1];
      n2 === -32768 && (e51[t2 + 1] = -32767), n2 === 32767 && (e51[t2 + 1] = 32766);
    }
  }
  _generatePoleQuad(e51, t2, n2, r2, i2, a2) {
    r2 > i2 == (a2 === -32768) ? (e51.push(n2), e51.push(t2), e51.push(this._vertexToIndex(r2, a2)), e51.push(this._vertexToIndex(i2, a2)), e51.push(n2), e51.push(this._vertexToIndex(r2, a2))) : (e51.push(t2), e51.push(n2), e51.push(this._vertexToIndex(r2, a2)), e51.push(n2), e51.push(this._vertexToIndex(i2, a2)), e51.push(this._vertexToIndex(r2, a2)));
  }
  _fillPoles(e51, t2, n2) {
    let r2 = this._vertexBuffer, i2 = j, a2 = e51.length;
    for (let o2 = 2; o2 < a2; o2 += 3) {
      let a3 = e51[o2 - 2], s2 = e51[o2 - 1], c2 = e51[o2], l2 = r2[a3 * 2], u2 = r2[a3 * 2 + 1], d2 = r2[s2 * 2], f2 = r2[s2 * 2 + 1], p2 = r2[c2 * 2], m2 = r2[c2 * 2 + 1];
      t2 && (u2 === 0 && f2 === 0 && this._generatePoleQuad(e51, a3, s2, l2, d2, Ap), f2 === 0 && m2 === 0 && this._generatePoleQuad(e51, s2, c2, d2, p2, Ap), m2 === 0 && u2 === 0 && this._generatePoleQuad(e51, c2, a3, p2, l2, Ap)), n2 && (u2 === i2 && f2 === i2 && this._generatePoleQuad(e51, a3, s2, l2, d2, jp), f2 === i2 && m2 === i2 && this._generatePoleQuad(e51, s2, c2, d2, p2, jp), m2 === i2 && u2 === i2 && this._generatePoleQuad(e51, c2, a3, p2, l2, jp));
    }
  }
  _initializeVertices(e51) {
    for (let t2 = 0; t2 < e51.length; t2 += 2) this._vertexToIndex(e51[t2], e51[t2 + 1]);
  }
  subdividePolygonInternal(e51, t2) {
    if (this._used) throw Error(`Subdivision: multiple use not allowed.`);
    this._used = true;
    let { flattened: n2, holeIndices: r2 } = Fp(e51);
    this._initializeVertices(n2);
    let i2;
    try {
      let e52 = Ff(n2, r2), t3 = this._convertIndices(n2, e52);
      i2 = this._subdivideTrianglesScanline(t3);
    } catch (e52) {
      console.error(e52);
    }
    let a2 = [];
    return t2 && (a2 = this._generateOutline(e51)), this._ensureNoPoleVertices(), this._handlePoles(i2), this._granularity >= 2 && this._canonical?.z === 0 && (i2 = this._removeTrianglesOutsideTileX(i2), a2 = a2.map((e52) => this._removeLinesOutsideTileX(e52))), { verticesFlattened: this._vertexBuffer, indicesTriangles: i2, indicesLineList: a2 };
  }
  _vertexOutsideTileX(e51) {
    let t2 = this._vertexBuffer[e51 * 2];
    return t2 < 0 || t2 > 8192;
  }
  _removeTrianglesOutsideTileX(e51) {
    let t2 = [];
    for (let n2 = 0; n2 < e51.length; n2 += 3) this._vertexOutsideTileX(e51[n2]) || this._vertexOutsideTileX(e51[n2 + 1]) || this._vertexOutsideTileX(e51[n2 + 2]) || t2.push(e51[n2], e51[n2 + 1], e51[n2 + 2]);
    return t2;
  }
  _removeLinesOutsideTileX(e51) {
    let t2 = [];
    for (let n2 = 0; n2 < e51.length; n2 += 2) this._vertexOutsideTileX(e51[n2]) || this._vertexOutsideTileX(e51[n2 + 1]) || t2.push(e51[n2], e51[n2 + 1]);
    return t2;
  }
  _convertIndices(e51, t2) {
    let n2 = [];
    for (let r2 of t2) {
      let t3 = e51[r2 * 2], i2 = e51[r2 * 2 + 1];
      n2.push(this._vertexToIndex(t3, i2));
    }
    return n2;
  }
  _pointArrayToIndices(e51) {
    let t2 = [];
    for (let n2 of e51) t2.push(this._vertexToIndex(n2.x, n2.y));
    return t2;
  }
};
function Np(e51, t2, n2, r2 = true) {
  return new Mp(n2, t2).subdividePolygonInternal(e51, r2);
}
function Pp(e51, t2, n2 = false) {
  if (!e51 || e51.length < 1 || e51.length < 2) return [];
  let r2 = e51[0], i2 = e51[e51.length - 1], a2 = n2 && (r2.x !== i2.x || r2.y !== i2.y);
  if (t2 < 2) return a2 ? [...e51, e51[0]] : [...e51];
  let o2 = Math.floor(j / t2), s2 = [];
  s2.push(new l(e51[0].x, e51[0].y));
  let c2 = e51.length, u2 = a2 ? c2 : c2 - 1;
  for (let t3 = 0; t3 < u2; t3++) {
    let n3 = e51[t3], r3 = t3 < c2 - 1 ? e51[t3 + 1] : e51[0], i3 = n3.x, a3 = n3.y, u3 = r3.x, d2 = r3.y, f2 = i3 !== u3, p2 = a3 !== d2;
    if (!f2 && !p2) continue;
    let m2 = u3 - i3, h2 = d2 - a3, g2 = Math.abs(m2), _ = Math.abs(h2), v = i3, y = a3;
    for (; ; ) {
      let e52 = m2 > 0 ? (Math.floor(v / o2) + 1) * o2 : (Math.ceil(v / o2) - 1) * o2, t4 = h2 > 0 ? (Math.floor(y / o2) + 1) * o2 : (Math.ceil(y / o2) - 1) * o2, n4 = Math.abs(v - e52), r4 = Math.abs(y - t4), i4 = Math.abs(v - u3), a4 = Math.abs(y - d2), c3 = f2 ? n4 / g2 : 1 / 0, b2 = p2 ? r4 / _ : 1 / 0;
      if ((i4 <= n4 || !f2) && (a4 <= r4 || !p2)) break;
      if (c3 < b2 && f2 || !p2) {
        v = e52, y += h2 * c3;
        let t5 = new l(v, Math.round(y));
        (s2[s2.length - 1].x !== t5.x || s2[s2.length - 1].y !== t5.y) && s2.push(t5);
      } else {
        v += m2 * b2, y = t4;
        let e53 = new l(Math.round(v), y);
        (s2[s2.length - 1].x !== e53.x || s2[s2.length - 1].y !== e53.y) && s2.push(e53);
      }
    }
    let b = new l(u3, d2);
    (s2[s2.length - 1].x !== b.x || s2[s2.length - 1].y !== b.y) && s2.push(b);
  }
  return s2;
}
function Fp(e51) {
  let t2 = [], n2 = [];
  for (let r2 of e51) if (r2.length !== 0) {
    r2 !== e51[0] && t2.push(n2.length / 2);
    for (let e52 of r2) n2.push(e52.x), n2.push(e52.y);
  }
  return { flattened: n2, holeIndices: t2 };
}
function Ip(e51, t2) {
  let n2 = [];
  for (let r2 = 0; r2 < t2.length; r2 += 3) {
    let i2 = t2[r2], a2 = t2[r2 + 1], o2 = t2[r2 + 2], s2 = e51[i2 * 2], c2 = e51[i2 * 2 + 1], l2 = e51[a2 * 2], u2 = e51[a2 * 2 + 1], d2 = e51[o2 * 2], f2 = e51[o2 * 2 + 1], p2 = l2 - s2, m2 = u2 - c2, h2 = d2 - s2;
    p2 * (f2 - c2) - m2 * h2 > 0 ? (n2.push(i2), n2.push(o2), n2.push(a2)) : (n2.push(i2), n2.push(a2), n2.push(o2));
  }
  return n2;
}
function Lp(e51, t2, n2) {
  if (t2.length === 0) throw Error(`Subdivision vertex ring is empty.`);
  let r2 = 0, i2 = e51[t2[0] * 2];
  for (let n3 = 1; n3 < t2.length; n3++) {
    let a3 = e51[t2[n3] * 2];
    a3 < i2 && (i2 = a3, r2 = n3);
  }
  let a2 = t2.length, o2 = r2, s2 = (o2 + 1) % a2;
  for (; ; ) {
    let r3 = o2 - 1 >= 0 ? o2 - 1 : a2 - 1, i3 = (s2 + 1) % a2, c2 = e51[t2[r3] * 2], l2 = e51[t2[r3] * 2 + 1], u2 = e51[t2[i3] * 2], d2 = e51[t2[i3] * 2 + 1], f2 = e51[t2[o2] * 2], p2 = e51[t2[o2] * 2 + 1], m2 = e51[t2[s2] * 2], h2 = e51[t2[s2] * 2 + 1], g2 = false;
    if (c2 < u2) g2 = true;
    else if (c2 > u2) g2 = false;
    else {
      let e52 = h2 - p2, t3 = -(m2 - f2), n3 = p2 < h2 ? 1 : -1;
      ((c2 - f2) * e52 + (l2 - p2) * t3) * n3 > ((u2 - f2) * e52 + (d2 - p2) * t3) * n3 && (g2 = true);
    }
    if (g2) {
      let e52 = t2[r3], i4 = t2[o2], c3 = t2[s2];
      e52 !== i4 && e52 !== c3 && i4 !== c3 && n2.push(c3, i4, e52), o2--, o2 < 0 && (o2 = a2 - 1);
    } else {
      let e52 = t2[i3], r4 = t2[o2], c3 = t2[s2];
      e52 !== r4 && e52 !== c3 && r4 !== c3 && n2.push(c3, r4, e52), s2++, s2 >= a2 && (s2 = 0);
    }
    if (r3 === i3) break;
  }
}
function Rp(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
  let l2 = i2.length / 2, u2 = o2 && s2 && c2;
  if (l2 < Pu.MAX_VERTEX_ARRAY_LENGTH) {
    let d2 = t2.prepareSegment(l2, n2, r2), f2 = d2.vertexLength;
    for (let e52 = 0; e52 < a2.length; e52 += 3) r2.emplaceBack(f2 + a2[e52], f2 + a2[e52 + 1], f2 + a2[e52 + 2]);
    d2.vertexLength += l2, d2.primitiveLength += a2.length / 3;
    let p2, m2;
    u2 && (m2 = o2.prepareSegment(l2, n2, s2), p2 = m2.vertexLength, m2.vertexLength += l2);
    for (let t3 = 0; t3 < i2.length; t3 += 2) e51(i2[t3], i2[t3 + 1]);
    if (u2) for (let e52 of c2) {
      for (let t3 = 1; t3 < e52.length; t3 += 2) s2.emplaceBack(p2 + e52[t3 - 1], p2 + e52[t3]);
      m2.primitiveLength += e52.length / 2;
    }
  } else Bp(t2, n2, r2, i2, a2, e51), u2 && Vp(o2, n2, s2, i2, c2, e51), t2.forceNewSegmentOnNextPrepare(), o2?.forceNewSegmentOnNextPrepare();
}
function zp(e51, t2, n2, r2, i2, a2, o2) {
  if (a2) {
    let a3 = r2.count;
    return n2(t2[i2 * 2], t2[i2 * 2 + 1]), e51[i2] = r2.count, r2.count++, o2.vertexLength++, a3;
  }
  return e51[i2];
}
function Bp(e51, t2, n2, r2, i2, a2) {
  let o2 = [];
  for (let e52 = 0; e52 < r2.length / 2; e52++) o2.push(-1);
  let s2 = { count: 0 }, c2 = 0, l2 = e51.getOrCreateLatestSegment(t2, n2), u2 = l2.vertexLength;
  for (let d2 = 2; d2 < i2.length; d2 += 3) {
    let f2 = i2[d2 - 2], p2 = i2[d2 - 1], m2 = i2[d2], h2 = o2[f2] < c2, g2 = o2[p2] < c2, _ = o2[m2] < c2, v = +!!h2 + +!!g2 + +!!_;
    l2.vertexLength + v > Pu.MAX_VERTEX_ARRAY_LENGTH && (l2 = e51.createNewSegment(t2, n2), c2 = s2.count, h2 = true, g2 = true, _ = true, u2 = 0);
    let y = zp(o2, r2, a2, s2, f2, h2, l2), b = zp(o2, r2, a2, s2, p2, g2, l2), x = zp(o2, r2, a2, s2, m2, _, l2);
    n2.emplaceBack(u2 + y - c2, u2 + b - c2, u2 + x - c2), l2.primitiveLength++;
  }
}
function Vp(e51, t2, n2, r2, i2, a2) {
  let o2 = [];
  for (let e52 = 0; e52 < r2.length / 2; e52++) o2.push(-1);
  let s2 = { count: 0 }, c2 = 0, l2 = e51.getOrCreateLatestSegment(t2, n2), u2 = l2.vertexLength;
  for (let d2 of i2) for (let i3 = 1; i3 < d2.length; i3 += 2) {
    let f2 = d2[i3 - 1], p2 = d2[i3], m2 = o2[f2] < c2, h2 = o2[p2] < c2, g2 = +!!m2 + +!!h2;
    l2.vertexLength + g2 > Pu.MAX_VERTEX_ARRAY_LENGTH && (l2 = e51.createNewSegment(t2, n2), c2 = s2.count, m2 = true, h2 = true, u2 = 0);
    let _ = zp(o2, r2, a2, s2, f2, m2, l2), v = zp(o2, r2, a2, s2, p2, h2, l2);
    n2.emplaceBack(u2 + _ - c2, u2 + v - c2), l2.primitiveLength++;
  }
}
var Hp = class {
  constructor(e51) {
    this.zoom = e51.zoom, this.overscaling = e51.overscaling, this.layers = e51.layers, this.layerIds = this.layers.map((e52) => e52.id), this.index = e51.index, this.hasDependencies = false, this.patternFeatures = [], this.layoutVertexArray = new gu(), this.indexArray = new ku(), this.indexArray2 = new Au(), this.programConfigurations = new dd(e51.layers, e51.zoom), this.segments = new Pu(), this.segments2 = new Pu(), this.stateDependentLayerIds = this.layers.filter((e52) => e52.isStateDependent()).map((e52) => e52.id);
  }
  populate(e51, t2, n2) {
    this.hasDependencies = jf(`fill`, this.layers, t2);
    let r2 = this.layers[0].layout.get(`fill-sort-key`), i2 = !r2.isConstant(), a2 = [], o2 = new W(this.zoom), s2 = this.layers[0]._featureFilter.needGeometry;
    for (let { feature: c2, id: l2, index: u2, sourceLayerIndex: d2 } of e51) {
      let e52 = vd(c2, s2);
      if (!this.layers[0]._featureFilter.filter(o2, e52, n2)) continue;
      let f2 = i2 ? r2.evaluate(e52, {}, n2, t2.availableImages) : void 0, p2 = { id: l2, properties: c2.properties, type: c2.type, sourceLayerIndex: d2, index: u2, geometry: s2 ? e52.geometry : _d(c2), patterns: {}, sortKey: f2 };
      a2.push(p2);
    }
    i2 && a2.sort((e52, t3) => e52.sortKey - t3.sortKey);
    for (let r3 of a2) {
      let { geometry: i3, index: a3, sourceLayerIndex: o3 } = r3;
      if (this.hasDependencies) {
        let e52 = Mf(`fill`, this.layers, r3, { zoom: this.zoom }, t2);
        this.patternFeatures.push(e52);
      } else this.addFeature(r3, i3, a3, n2, {}, t2.subdivisionGranularity);
      let s3 = e51[a3].feature;
      t2.featureIndex.insert(s3, i3, a3, o3, this.index);
    }
  }
  update(e51, t2, n2) {
    this.stateDependentLayers.length && this.programConfigurations.updatePaintArrays(e51, t2, this.stateDependentLayers, { imagePositions: n2 });
  }
  addFeatures(e51, t2, n2) {
    for (let r2 of this.patternFeatures) this.addFeature(r2, r2.geometry, r2.index, t2, n2, e51.subdivisionGranularity);
  }
  isEmpty() {
    return this.layoutVertexArray.length === 0;
  }
  uploadPending() {
    return !this.uploaded || this.programConfigurations.needsUpload;
  }
  upload(e51) {
    this.uploaded || (this.layoutVertexBuffer = e51.createVertexBuffer(this.layoutVertexArray, Af), this.indexBuffer = e51.createIndexBuffer(this.indexArray), this.indexBuffer2 = e51.createIndexBuffer(this.indexArray2)), this.programConfigurations.upload(e51), this.uploaded = true;
  }
  destroy() {
    this.layoutVertexBuffer && (this.layoutVertexBuffer.destroy(), this.indexBuffer.destroy(), this.indexBuffer2.destroy(), this.programConfigurations.destroy(), this.segments.destroy(), this.segments2.destroy());
  }
  addFeature(e51, t2, n2, r2, i2, a2) {
    for (let e52 of Na(t2, 500)) {
      let t3 = Np(e52, r2, a2.fill.getGranularityForZoomLevel(r2.z)), n3 = this.layoutVertexArray;
      Rp((e53, t4) => {
        n3.emplaceBack(e53, t4);
      }, this.segments, this.layoutVertexArray, this.indexArray, t3.verticesFlattened, t3.indicesTriangles, this.segments2, this.indexArray2, t3.indicesLineList);
    }
    this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, e51, n2, { imagePositions: i2, canonical: r2 });
  }
};
U(`FillBucket`, Hp, { omit: [`layers`, `patternFeatures`] });
var Up;
var Wp = () => Up ||= new _l({ "fill-sort-key": new K(M.layout_fill[`fill-sort-key`], `fill-sort-key`) });
var Gp;
var Kp = () => Gp ||= new _l({ "fill-antialias": new G(M.paint_fill[`fill-antialias`], `fill-antialias`), "fill-opacity": new K(M.paint_fill[`fill-opacity`], `fill-opacity`), "fill-layer-opacity": new G(M.paint_fill[`fill-layer-opacity`], `fill-layer-opacity`), "fill-color": new K(M.paint_fill[`fill-color`], `fill-color`), "fill-outline-color": new K(M.paint_fill[`fill-outline-color`], `fill-outline-color`), "fill-translate": new G(M.paint_fill[`fill-translate`], `fill-translate`), "fill-translate-anchor": new G(M.paint_fill[`fill-translate-anchor`], `fill-translate-anchor`), "fill-pattern": new ml(M.paint_fill[`fill-pattern`], `fill-pattern`) });
var qp = { get paint() {
  return Kp();
}, get layout() {
  return Wp();
} };
var Yp = class extends bl {
  constructor(e51, t2) {
    super(e51, qp, t2);
  }
  recalculate(e51, t2) {
    super.recalculate(e51, t2);
    let n2 = this.paint._values[`fill-outline-color`];
    n2.value.kind === `constant` && n2.value.value === void 0 && (this.paint._values[`fill-outline-color`] = this.paint._values[`fill-color`]);
  }
  createBucket(e51) {
    return new Hp(e51);
  }
  queryRadius() {
    return Id(this.paint.get(`fill-translate`));
  }
  queryIntersectsFeature({ queryGeometry: e51, geometry: t2, transform: n2, pixelsToTileUnits: r2 }) {
    return wd(Ld(e51, this.paint.get(`fill-translate`), this.paint.get(`fill-translate-anchor`), -n2.bearingInRadians, r2), t2);
  }
  isTileClipped() {
    return true;
  }
};
var Xp = J([{ name: `a_pos`, components: 2, type: `Int16` }, { name: `a_normal_ed`, components: 4, type: `Int16` }], 4);
var Zp = J([{ name: `a_centroid`, components: 2, type: `Int16` }], 4);
var Qp = Xp.members;
Xp.size, Xp.alignment;
var $p = class e43 {
  constructor() {
    this.minX = 1 / 0, this.maxX = -1 / 0, this.minY = 1 / 0, this.maxY = -1 / 0;
  }
  extend(e51) {
    return this.minX = Math.min(this.minX, e51.x), this.minY = Math.min(this.minY, e51.y), this.maxX = Math.max(this.maxX, e51.x), this.maxY = Math.max(this.maxY, e51.y), this;
  }
  expandBy(e51) {
    return this.minX -= e51, this.minY -= e51, this.maxX += e51, this.maxY += e51, (this.minX > this.maxX || this.minY > this.maxY) && (this.minX = 1 / 0, this.maxX = -1 / 0, this.minY = 1 / 0, this.maxY = -1 / 0), this;
  }
  shrinkBy(e51) {
    return this.expandBy(-e51);
  }
  map(t2) {
    let n2 = new e43();
    return n2.extend(t2(new l(this.minX, this.minY))), n2.extend(t2(new l(this.maxX, this.minY))), n2.extend(t2(new l(this.minX, this.maxY))), n2.extend(t2(new l(this.maxX, this.maxY))), n2;
  }
  static fromPoints(t2) {
    let n2 = new e43();
    for (let e51 of t2) n2.extend(e51);
    return n2;
  }
  contains(e51) {
    return e51.x >= this.minX && e51.x <= this.maxX && e51.y >= this.minY && e51.y <= this.maxY;
  }
  empty() {
    return this.minX > this.maxX;
  }
  width() {
    return this.maxX - this.minX;
  }
  height() {
    return this.maxY - this.minY;
  }
  covers(e51) {
    return !this.empty() && !e51.empty() && e51.minX >= this.minX && e51.maxX <= this.maxX && e51.minY >= this.minY && e51.maxY <= this.maxY;
  }
  intersects(e51) {
    return !this.empty() && !e51.empty() && e51.minX <= this.maxX && e51.maxX >= this.minX && e51.minY <= this.maxY && e51.maxY >= this.minY;
  }
};
var em = $p.fromPoints([new l(0, 0), new l(j, j)]);
function tm(e51, t2) {
  return e51.x === t2.x && (e51.x < 0 || e51.x > 8192) || e51.y === t2.y && (e51.y < 0 || e51.y > 8192);
}
function nm(e51) {
  return e51.every((e52) => e52.x < 0) || e51.every((e52) => e52.x > 8192) || e51.every((e52) => e52.y < 0) || e51.every((e52) => e52.y > 8192);
}
var rm = class {
  constructor(e51, t2, n2, r2, i2) {
    for (this.properties = /* @__PURE__ */ Object.create(null), this.extent = n2, this.type = 0, this.id = void 0, this._pbf = e51, this._geometry = -1, this._keys = r2, this._values = i2; e51.pos < t2; ) {
      let t3 = e51.readVarint();
      if (t3 === 8) this.id = e51.readVarint();
      else if (t3 === 18) {
        let t4 = e51.readVarint() + e51.pos;
        for (; e51.pos < t4; ) {
          let t5 = r2[e51.readVarint()], n3 = i2[e51.readVarint()];
          this.properties[t5] = n3;
        }
      } else t3 === 24 ? this.type = e51.readVarint() : (t3 === 34 && (this._geometry = e51.pos), e51.skip(t3));
    }
  }
  loadGeometry() {
    if (this._geometry < 0) throw Error(`feature has no geometry`);
    let e51 = this._pbf;
    e51.pos = this._geometry;
    let t2 = e51.readVarint() + e51.pos, n2 = [], r2, i2 = 1, a2 = 0, o2 = 0, s2 = 0;
    for (; e51.pos < t2; ) {
      if (a2 <= 0) {
        let t3 = e51.readVarint();
        if (i2 = t3 & 7, a2 = t3 >> 3, a2 === 0) continue;
      }
      if (a2--, i2 === 1) o2 += e51.readSVarint(), s2 += e51.readSVarint(), r2 && n2.push(r2), r2 = [new l(o2, s2)];
      else if (i2 === 2) o2 += e51.readSVarint(), s2 += e51.readSVarint(), r2 && r2.push(new l(o2, s2));
      else if (i2 === 7) r2 && r2.push(r2[0].clone());
      else throw Error(`unknown command ${i2}`);
    }
    return r2 && n2.push(r2), n2;
  }
  bbox() {
    if (this._geometry < 0) throw Error(`feature has no geometry`);
    let e51 = this._pbf;
    e51.pos = this._geometry;
    let t2 = e51.readVarint() + e51.pos, n2 = 1, r2 = 0, i2 = 0, a2 = 0, o2 = 1 / 0, s2 = -1 / 0, c2 = 1 / 0, l2 = -1 / 0;
    for (; e51.pos < t2; ) {
      if (r2 <= 0) {
        let t3 = e51.readVarint();
        if (n2 = t3 & 7, r2 = t3 >> 3, r2 === 0) continue;
      }
      if (r2--, n2 === 1 || n2 === 2) i2 += e51.readSVarint(), a2 += e51.readSVarint(), i2 < o2 && (o2 = i2), i2 > s2 && (s2 = i2), a2 < c2 && (c2 = a2), a2 > l2 && (l2 = a2);
      else if (n2 !== 7) throw Error(`unknown command ${n2}`);
    }
    return [o2, c2, s2, l2];
  }
  toGeoJSON(e51, t2, n2) {
    let r2 = this.extent * 2 ** n2, i2 = this.extent * e51, a2 = this.extent * t2, o2 = this.loadGeometry();
    function s2(e52) {
      return [(e52.x + i2) * 360 / r2 - 180, 360 / Math.PI * Math.atan(Math.exp((1 - (e52.y + a2) * 2 / r2) * Math.PI)) - 90];
    }
    function c2(e52) {
      return e52.map(s2);
    }
    let l2;
    if (this.type === 1) {
      let e52 = [];
      for (let t4 of o2) e52.push(t4[0]);
      let t3 = c2(e52);
      l2 = e52.length === 1 ? { type: `Point`, coordinates: t3[0] } : { type: `MultiPoint`, coordinates: t3 };
    } else if (this.type === 2) {
      let e52 = o2.map(c2);
      l2 = e52.length === 1 ? { type: `LineString`, coordinates: e52[0] } : { type: `MultiLineString`, coordinates: e52 };
    } else if (this.type === 3) {
      let e52 = im(o2), t3 = [];
      for (let n3 of e52) t3.push(n3.map(c2));
      l2 = t3.length === 1 ? { type: `Polygon`, coordinates: t3[0] } : { type: `MultiPolygon`, coordinates: t3 };
    } else throw Error(`unknown feature type`);
    let u2 = { type: `Feature`, geometry: l2, properties: this.properties };
    return this.id != null && (u2.id = this.id), u2;
  }
};
rm.types = [`Unknown`, `Point`, `LineString`, `Polygon`];
function im(e51) {
  let t2 = e51.length;
  if (t2 <= 1) return [e51];
  let n2 = [], r2, i2;
  for (let a2 = 0; a2 < t2; a2++) {
    let t3 = am(e51[a2]);
    t3 !== 0 && (i2 === void 0 && (i2 = t3 < 0), i2 === t3 < 0 ? (r2 && n2.push(r2), r2 = [e51[a2]]) : r2 && r2.push(e51[a2]));
  }
  return r2 && n2.push(r2), n2;
}
function am(e51) {
  let t2 = 0;
  for (let n2 = 0, r2 = e51.length, i2 = r2 - 1, a2, o2; n2 < r2; i2 = n2++) a2 = e51[n2], o2 = e51[i2], t2 += (o2.x - a2.x) * (a2.y + o2.y);
  return t2;
}
var om = class {
  constructor(e51, t2) {
    for (this.version = 1, this.name = ``, this.extent = 4096, this.length = 0, this._pbf = e51, this._keys = [], this._values = [], this._features = [], t2 === void 0 && (t2 = e51.length); e51.pos < t2; ) {
      let t3 = e51.readVarint();
      t3 === 10 ? this.name = e51.readString() : t3 === 18 ? (this._features.push(e51.pos), e51.skip(t3)) : t3 === 26 ? this._keys.push(e51.readString()) : t3 === 34 ? this._values.push(sm(e51)) : t3 === 40 ? this.extent = e51.readVarint() : t3 === 120 ? this.version = e51.readVarint() : e51.skip(t3);
    }
    this.length = this._features.length;
  }
  feature(e51) {
    if (e51 < 0 || e51 >= this._features.length) throw Error(`feature index out of bounds`);
    this._pbf.pos = this._features[e51];
    let t2 = this._pbf.readVarint() + this._pbf.pos;
    return new rm(this._pbf, t2, this.extent, this._keys, this._values);
  }
};
function sm(e51) {
  let t2 = null, n2 = e51.readVarint() + e51.pos;
  for (; e51.pos < n2; ) {
    let n3 = e51.readVarint();
    t2 = n3 === 10 ? e51.readString() : n3 === 21 ? e51.readFloat() : n3 === 25 ? e51.readDouble() : n3 === 32 ? e51.readVarint(true) : n3 === 40 ? e51.readVarint() : n3 === 48 ? e51.readSVarint() : n3 === 56 ? e51.readBoolean() : (e51.skip(n3), null);
  }
  if (t2 == null) throw Error(`unknown feature value`);
  return t2;
}
var cm = class {
  constructor(e51, t2 = e51.length) {
    let n2 = /* @__PURE__ */ Object.create(null);
    for (; e51.pos < t2; ) {
      let t3 = e51.readVarint();
      if (t3 === 26) {
        let t4 = new om(e51, e51.readVarint() + e51.pos);
        t4.length && (n2[t4.name] = t4);
      } else e51.skip(t3);
    }
    this.layers = n2;
  }
};
var lm = 63710088e-1;
var um = class e44 {
  constructor(e51, t2) {
    if (isNaN(e51) || isNaN(t2)) throw Error(`Invalid LngLat object: (${e51}, ${t2})`);
    if (this.lng = +e51, this.lat = +t2, this.lat > 90 || this.lat < -90) throw Error(`Invalid LngLat latitude value: must be between -90 and 90`);
  }
  wrap() {
    return new e44(xt(this.lng, -180, 180), this.lat);
  }
  toArray() {
    return [this.lng, this.lat];
  }
  toString() {
    return `LngLat(${this.lng}, ${this.lat})`;
  }
  distanceTo(e51) {
    let t2 = Math.PI / 180, n2 = this.lat * t2, r2 = e51.lat * t2, i2 = Math.sin(n2) * Math.sin(r2) + Math.cos(n2) * Math.cos(r2) * Math.cos((e51.lng - this.lng) * t2);
    return lm * Math.acos(Math.min(i2, 1));
  }
  static convert(t2) {
    if (t2 instanceof e44) return t2;
    if (Array.isArray(t2) && (t2.length === 2 || t2.length === 3)) return new e44(Number(t2[0]), Number(t2[1]));
    if (!Array.isArray(t2) && typeof t2 == `object` && t2) return new e44(Number(`lng` in t2 ? t2.lng : t2.lon), Number(t2.lat));
    throw Error("`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, an object {lon: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]");
  }
};
var dm = 2 * Math.PI * lm;
function fm(e51) {
  return dm * Math.cos(e51 * Math.PI / 180);
}
function pm(e51) {
  return (180 + e51) / 360;
}
function mm(e51) {
  return (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + e51 * Math.PI / 360))) / 360;
}
function hm(e51, t2) {
  return e51 / fm(t2);
}
function gm(e51) {
  return e51 * 360 - 180;
}
function _m(e51) {
  let t2 = 180 - e51 * 360;
  return 360 / Math.PI * Math.atan(Math.exp(t2 * Math.PI / 180)) - 90;
}
function vm(e51, t2) {
  return e51 * fm(_m(t2));
}
function ym(e51) {
  return 1 / Math.cos(e51 * Math.PI / 180);
}
var bm = class e45 {
  constructor(e51, t2, n2 = 0) {
    this.x = +e51, this.y = +t2, this.z = +n2;
  }
  static fromLngLat(t2, n2 = 0) {
    let r2 = um.convert(t2);
    return new e45(pm(r2.lng), mm(r2.lat), hm(n2, r2.lat));
  }
  toLngLat() {
    return new um(gm(this.x), _m(this.y));
  }
  toAltitude() {
    return vm(this.z, this.y);
  }
  meterInMercatorCoordinateUnits() {
    return 1 / dm * ym(_m(this.y));
  }
};
function Sm(e51, t2, n2) {
  let r2 = 1 / (1 << n2.z);
  return new bm(e51 / j * r2 + n2.x * r2, t2 / j * r2 + n2.y * r2);
}
function Cm(e51, t2, n2) {
  return Sm(e51, t2, n2).toLngLat();
}
function Am(e51, t2, n2) {
  if (t2 <= 0 || !e51 || e51.length === 0) return e51;
  let r2 = jm(t2, n2);
  return e51.map((e52) => Mm(e52, r2));
}
function jm(e51, t2) {
  let n2 = Cm(j / 2, j / 2, t2), r2 = bm.fromLngLat(n2).meterInMercatorCoordinateUnits(), i2 = (1 << t2.z) * j;
  return e51 * r2 * i2;
}
function Mm(e51, t2) {
  if (!e51 || e51.length < 3) return e51;
  let n2 = e51[0].x === e51[e51.length - 1].x && e51[0].y === e51[e51.length - 1].y, r2 = n2 ? e51.length - 1 : e51.length;
  if (r2 < 3) return e51;
  let i2 = [];
  for (let n3 = 0; n3 < r2; n3++) {
    let a3 = e51[(n3 - 1 + r2) % r2], o2 = e51[n3], s2 = e51[(n3 + 1) % r2];
    if (tm(a3, o2) || tm(o2, s2)) {
      i2.push(o2.clone());
      continue;
    }
    Pm(i2, a3, o2, s2, t2);
  }
  let a2 = Nm(i2);
  return a2.length < 3 ? e51 : (n2 && a2.push(a2[0].clone()), a2);
}
function Nm(e51) {
  let t2 = [];
  for (let n2 of e51) {
    let e52 = n2.round(), r2 = t2[t2.length - 1];
    (r2?.x !== e52.x || r2?.y !== e52.y) && t2.push(e52);
  }
  for (; t2.length > 1 && t2[0].x === t2[t2.length - 1].x && t2[0].y === t2[t2.length - 1].y; ) t2.pop();
  return t2;
}
function Pm(e51, t2, n2, r2, i2) {
  let a2 = t2.sub(n2), o2 = r2.sub(n2), s2 = a2.mag(), c2 = o2.mag();
  if (s2 < 1e-6 || c2 < 1e-6) {
    e51.push(n2.clone());
    return;
  }
  a2._div(s2), o2._div(c2);
  let l2 = a2.x * o2.x + a2.y * o2.y;
  if (Math.abs(l2) > Math.cos(5 * Math.PI / 180)) {
    e51.push(n2.clone());
    return;
  }
  let u2 = 0.2, d2 = Math.min(i2, s2 * u2, c2 * u2), f2 = n2.add(a2.mult(d2)), p2 = n2.add(o2.mult(d2)), m2 = Math.sqrt((1 + l2) / 2), h2 = n2.add(a2.add(o2)._unit()._mult(d2 / m2)), g2 = f2.sub(h2).angleWith(p2.sub(h2)), _ = Math.max(2, Math.ceil(Math.abs(g2) / (Math.PI / 6) - 1e-6));
  for (let t3 = 0; t3 <= _; t3++) e51.push(f2.rotateAround(t3 / _ * g2, h2));
}
var Fm = 8192;
function Im(e51, t2, n2, r2, i2, a2, o2, s2) {
  e51.emplaceBack(t2, n2, Math.floor(r2 * Fm) * 2 + o2, i2 * Fm * 2, a2 * Fm * 2, Math.round(s2));
}
var Lm = class {
  constructor(e51) {
    this.zoom = e51.zoom, this.overscaling = e51.overscaling, this.layers = e51.layers, this.layerIds = this.layers.map((e52) => e52.id), this.index = e51.index, this.hasDependencies = false, this.layoutVertexArray = new _u(), this.centroidVertexArray = new fu(), this.indexArray = new ku(), this.programConfigurations = new dd(e51.layers, e51.zoom), this.segments = new Pu(), this.stateDependentLayerIds = this.layers.filter((e52) => e52.isStateDependent()).map((e52) => e52.id);
  }
  populate(e51, t2, n2) {
    this.features = [], this.hasDependencies = jf(`fill-extrusion`, this.layers, t2);
    let r2 = new W(this.zoom), i2 = this.layers[0], a2 = i2.layout.get(`fill-extrusion-rounded-corner-distance`), o2 = i2._featureFilter.needGeometry;
    for (let { feature: s2, id: c2, index: l2, sourceLayerIndex: u2 } of e51) {
      let e52 = vd(s2, o2);
      if (!i2._featureFilter.filter(r2, e52, n2)) continue;
      let d2 = o2 ? e52.geometry : _d(s2), f2 = { id: c2, sourceLayerIndex: u2, index: l2, geometry: a2 > 0 ? Am(d2, a2, n2) : d2, properties: s2.properties, type: s2.type, patterns: {} };
      this.hasDependencies ? this.features.push(Mf(`fill-extrusion`, this.layers, f2, { zoom: this.zoom }, t2)) : this.addFeature(f2, f2.geometry, l2, n2, {}, t2.subdivisionGranularity), t2.featureIndex.insert(s2, f2.geometry, l2, u2, this.index, true);
    }
  }
  addFeatures(e51, t2, n2) {
    for (let r2 of this.features) {
      let { geometry: i2 } = r2;
      this.addFeature(r2, i2, r2.index, t2, n2, e51.subdivisionGranularity);
    }
  }
  update(e51, t2, n2) {
    this.stateDependentLayers.length && this.programConfigurations.updatePaintArrays(e51, t2, this.stateDependentLayers, { imagePositions: n2 });
  }
  isEmpty() {
    return this.layoutVertexArray.length === 0 && this.centroidVertexArray.length === 0;
  }
  uploadPending() {
    return !this.uploaded || this.programConfigurations.needsUpload;
  }
  upload(e51) {
    this.uploaded || (this.layoutVertexBuffer = e51.createVertexBuffer(this.layoutVertexArray, Qp), this.centroidVertexBuffer = e51.createVertexBuffer(this.centroidVertexArray, Zp.members, true), this.indexBuffer = e51.createIndexBuffer(this.indexArray)), this.programConfigurations.upload(e51), this.uploaded = true;
  }
  destroy() {
    this.layoutVertexBuffer && (this.layoutVertexBuffer.destroy(), this.indexBuffer.destroy(), this.programConfigurations.destroy(), this.segments.destroy(), this.centroidVertexBuffer.destroy());
  }
  addFeature(e51, t2, n2, r2, i2, a2) {
    let o2 = this.layers[0], s2 = o2.layout ? o2.layout.get(`fill-extrusion-rounded-corner-distance`) : 0, c2 = s2 > 0 ? Am(t2, s2, r2) : t2;
    for (let t3 of Na(c2, 500)) {
      let n3 = { x: 0, y: 0, sampleCount: 0 }, i3 = this.layoutVertexArray.length;
      this.processPolygon(n3, r2, e51, t3, a2);
      let o3 = this.layoutVertexArray.length - i3, s3 = Math.floor(n3.x / n3.sampleCount), c3 = Math.floor(n3.y / n3.sampleCount);
      for (let e52 = 0; e52 < o3; e52++) this.centroidVertexArray.emplaceBack(s3, c3);
    }
    this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, e51, n2, { imagePositions: i2, canonical: r2 });
  }
  processPolygon(e51, t2, n2, r2, i2) {
    if (r2.length < 1 || nm(r2[0])) return;
    for (let t3 of r2) t3.length !== 0 && Rm(e51, t3);
    let a2 = { segment: this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray) }, o2 = i2.fill.getGranularityForZoomLevel(t2.z), s2 = rm.types[n2.type] === `Polygon`;
    for (let e52 of r2) {
      if (e52.length === 0 || nm(e52)) continue;
      let t3 = Pp(e52, o2, s2);
      this._generateSideFaces(t3, a2);
    }
    if (!s2) return;
    let c2 = Np(r2, t2, o2, false), l2 = this.layoutVertexArray;
    Rp((e52, t3) => {
      Im(l2, e52, t3, 0, 0, 1, 1, 0);
    }, this.segments, this.layoutVertexArray, this.indexArray, c2.verticesFlattened, c2.indicesTriangles);
  }
  _generateSideFaces(e51, t2) {
    let n2 = 0;
    for (let r2 = 1; r2 < e51.length; r2++) {
      let i2 = e51[r2], a2 = e51[r2 - 1];
      if (tm(i2, a2)) continue;
      t2.segment.vertexLength + 4 > Pu.MAX_VERTEX_ARRAY_LENGTH && (t2.segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray));
      let o2 = i2.sub(a2)._perp()._unit(), s2 = a2.dist(i2);
      n2 + s2 > 32768 && (n2 = 0), Im(this.layoutVertexArray, i2.x, i2.y, o2.x, o2.y, 0, 0, n2), Im(this.layoutVertexArray, i2.x, i2.y, o2.x, o2.y, 0, 1, n2), n2 += s2, Im(this.layoutVertexArray, a2.x, a2.y, o2.x, o2.y, 0, 0, n2), Im(this.layoutVertexArray, a2.x, a2.y, o2.x, o2.y, 0, 1, n2);
      let c2 = t2.segment.vertexLength;
      this.indexArray.emplaceBack(c2, c2 + 2, c2 + 1), this.indexArray.emplaceBack(c2 + 1, c2 + 2, c2 + 3), t2.segment.vertexLength += 4, t2.segment.primitiveLength += 2;
    }
  }
};
function Rm(e51, t2) {
  for (let n2 = 0; n2 < t2.length; n2++) {
    let r2 = t2[n2];
    (n2 !== t2.length - 1 || t2[0].x !== r2.x || t2[0].y !== r2.y) && (e51.x += r2.x, e51.y += r2.y, e51.sampleCount++);
  }
}
U(`FillExtrusionBucket`, Lm, { omit: [`layers`, `features`] });
var zm;
var Bm = () => zm ||= new _l({ "fill-extrusion-rounded-corner-distance": new G(M[`layout_fill-extrusion`][`fill-extrusion-rounded-corner-distance`], `fill-extrusion-rounded-corner-distance`) });
var Vm;
var Hm = () => Vm ||= new _l({ "fill-extrusion-opacity": new G(M[`paint_fill-extrusion`][`fill-extrusion-opacity`], `fill-extrusion-opacity`), "fill-extrusion-color": new K(M[`paint_fill-extrusion`][`fill-extrusion-color`], `fill-extrusion-color`), "fill-extrusion-translate": new G(M[`paint_fill-extrusion`][`fill-extrusion-translate`], `fill-extrusion-translate`), "fill-extrusion-translate-anchor": new G(M[`paint_fill-extrusion`][`fill-extrusion-translate-anchor`], `fill-extrusion-translate-anchor`), "fill-extrusion-pattern": new ml(M[`paint_fill-extrusion`][`fill-extrusion-pattern`], `fill-extrusion-pattern`), "fill-extrusion-height": new K(M[`paint_fill-extrusion`][`fill-extrusion-height`], `fill-extrusion-height`), "fill-extrusion-base": new K(M[`paint_fill-extrusion`][`fill-extrusion-base`], `fill-extrusion-base`), "fill-extrusion-vertical-gradient": new G(M[`paint_fill-extrusion`][`fill-extrusion-vertical-gradient`], `fill-extrusion-vertical-gradient`) });
var Um = { get paint() {
  return Hm();
}, get layout() {
  return Bm();
} };
var Gm = class extends bl {
  constructor(e51, t2) {
    super(e51, Um, t2);
  }
  createBucket(e51) {
    return new Lm(e51);
  }
  queryRadius() {
    return Id(this.paint.get(`fill-extrusion-translate`));
  }
  is3D() {
    return true;
  }
  queryIntersectsFeature({ queryGeometry: e51, feature: t2, featureState: n2, geometry: r2, transform: i2, pixelsToTileUnits: a2, pixelPosMatrix: o2 }) {
    let s2 = Ld(e51, this.paint.get(`fill-extrusion-translate`), this.paint.get(`fill-extrusion-translate-anchor`), -i2.bearingInRadians, a2), c2 = this.paint.get(`fill-extrusion-height`).evaluate(t2, n2), l2 = this.paint.get(`fill-extrusion-base`).evaluate(t2, n2), u2 = Xm(s2, o2, 0), d2 = Ym(r2, l2, c2, o2), f2 = d2[0], p2 = d2[1];
    return Jm(f2, p2, u2);
  }
};
function Km(e51, t2) {
  return e51.x * t2.x + e51.y * t2.y;
}
function qm(e51, t2) {
  if (e51.length === 1) {
    let n2 = 0, r2 = t2[n2++], i2;
    for (; !i2 || r2.equals(i2); ) if (i2 = t2[n2++], !i2) return 1 / 0;
    for (; n2 < t2.length; n2++) {
      let a2 = t2[n2], o2 = e51[0], s2 = i2.sub(r2), c2 = a2.sub(r2), l2 = o2.sub(r2), u2 = Km(s2, s2), d2 = Km(s2, c2), f2 = Km(c2, c2), p2 = Km(l2, s2), m2 = Km(l2, c2), h2 = u2 * f2 - d2 * d2, g2 = (f2 * p2 - d2 * m2) / h2, _ = (u2 * m2 - d2 * p2) / h2, v = 1 - g2 - _, y = r2.z * v + i2.z * g2 + a2.z * _;
      if (isFinite(y)) return y;
    }
    return 1 / 0;
  }
  {
    let e52 = 1 / 0;
    for (let n2 of t2) e52 = Math.min(e52, n2.z);
    return e52;
  }
}
function Jm(e51, t2, n2) {
  let r2 = 1 / 0;
  wd(n2, t2) && (r2 = qm(n2, t2[0]));
  for (let i2 = 0; i2 < t2.length; i2++) {
    let a2 = t2[i2], o2 = e51[i2];
    for (let e52 = 0; e52 < a2.length - 1; e52++) {
      let t3 = a2[e52], i3 = a2[e52 + 1], s2 = o2[e52], c2 = [t3, i3, o2[e52 + 1], s2, t3];
      Sd(n2, c2) && (r2 = Math.min(r2, qm(n2, c2)));
    }
  }
  return r2 !== 1 / 0 && r2;
}
function Ym(e51, t2, n2, r2) {
  let i2 = [], a2 = [], o2 = r2[8] * t2, s2 = r2[9] * t2, c2 = r2[10] * t2, u2 = r2[11] * t2, d2 = r2[8] * n2, f2 = r2[9] * n2, p2 = r2[10] * n2, m2 = r2[11] * n2;
  for (let t3 of e51) {
    let e52 = [], n3 = [];
    for (let i3 of t3) {
      let t4 = i3.x, a3 = i3.y, h2 = r2[0] * t4 + r2[4] * a3 + r2[12], g2 = r2[1] * t4 + r2[5] * a3 + r2[13], _ = r2[2] * t4 + r2[6] * a3 + r2[14], v = r2[3] * t4 + r2[7] * a3 + r2[15], y = h2 + o2, b = g2 + s2, x = _ + c2, S = v + u2, C = h2 + d2, w = g2 + f2, T = _ + p2, E = v + m2, D = new l(y / S, b / S);
      D.z = x / S, e52.push(D);
      let O = new l(C / E, w / E);
      O.z = T / E, n3.push(O);
    }
    i2.push(e52), a2.push(n3);
  }
  return [i2, a2];
}
function Xm(e51, t2, n2) {
  let r2 = [];
  for (let i2 of e51) {
    let e52 = [i2.x, i2.y, n2, 1];
    Ne(e52, e52, t2), r2.push(new l(e52[0] / e52[3], e52[1] / e52[3]));
  }
  return r2;
}
function Zm(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2 + (n2 - t2 >> 1), o2 = n2 - t2, s2, c2 = e51[t2], l2 = e51[t2 + 1], u2 = e51[n2], d2 = e51[n2 + 1];
  for (let r3 = t2 + 3; r3 < n2; r3 += 3) {
    let t3 = Qm(e51[r3], e51[r3 + 1], c2, l2, u2, d2);
    if (t3 > i2) {
      s2 = r3, i2 = t3;
      continue;
    }
    if (t3 === i2) {
      let e52 = Math.abs(r3 - a2);
      e52 < o2 && (s2 = r3, o2 = e52);
    }
  }
  i2 > r2 && (s2 - t2 > 3 && Zm(e51, t2, s2, r2), e51[s2 + 2] = i2, n2 - s2 > 3 && Zm(e51, s2, n2, r2));
}
function Qm(e51, t2, n2, r2, i2, a2) {
  let o2 = i2 - n2, s2 = a2 - r2;
  if (o2 !== 0 || s2 !== 0) {
    let c2 = ((e51 - n2) * o2 + (t2 - r2) * s2) / (o2 * o2 + s2 * s2);
    c2 > 1 ? (n2 = i2, r2 = a2) : c2 > 0 && (n2 += o2 * c2, r2 += s2 * c2);
  }
  return o2 = e51 - n2, s2 = t2 - r2, o2 * o2 + s2 * s2;
}
function $m(e51, t2, n2, r2) {
  let i2 = { type: t2, geom: n2 }, a2 = { id: e51 ?? null, type: i2.type, geometry: i2.geom, tags: r2, minX: 1 / 0, minY: 1 / 0, maxX: -1 / 0, maxY: -1 / 0 };
  switch (i2.type) {
    case `Point`:
    case `MultiPoint`:
      th(a2, i2.geom);
      break;
    case `LineString`:
      th(a2, i2.geom.points);
      break;
    case `Polygon`:
      th(a2, i2.geom[0].points);
      break;
    case `MultiLineString`:
      for (let e52 of i2.geom) th(a2, e52.points);
      break;
    case `MultiPolygon`:
      for (let e52 of i2.geom) th(a2, e52[0].points);
  }
  return a2;
}
function eh(e51) {
  let t2 = e51;
  e51.points.length > 64 && (t2.points = new Float64Array(e51.points));
}
function th(e51, t2) {
  for (let n2 = 0; n2 < t2.length; n2 += 3) e51.minX = Math.min(e51.minX, t2[n2]), e51.minY = Math.min(e51.minY, t2[n2 + 1]), e51.maxX = Math.max(e51.maxX, t2[n2]), e51.maxY = Math.max(e51.maxY, t2[n2 + 1]);
}
function nh(e51, t2) {
  let n2 = [];
  switch (e51.type) {
    case `FeatureCollection`:
      for (let r2 = 0; r2 < e51.features.length; r2++) rh(n2, e51.features[r2], t2, r2);
      break;
    case `Feature`:
      rh(n2, e51, t2);
      break;
    default:
      rh(n2, { type: `Feature`, geometry: e51, properties: void 0 }, t2);
  }
  return n2;
}
function rh(e51, t2, n2, r2, i2 = 0) {
  if (!t2.geometry) return;
  if (i2 > 1024) throw Error(`GeometryCollection nesting exceeds supported depth: 1024`);
  if (t2.geometry.type === `GeometryCollection`) {
    ah(e51, t2, t2.geometry, n2, r2, i2 + 1);
    return;
  }
  if (!t2.geometry.coordinates?.length) return;
  let a2 = ih(t2, n2, r2), o2 = (n2.tolerance / ((1 << n2.maxZoom) * n2.extent)) ** 2;
  switch (t2.geometry.type) {
    case `Point`:
      oh(e51, a2, t2.geometry, t2.properties);
      return;
    case `MultiPoint`:
      sh(e51, a2, t2.geometry, t2.properties);
      return;
    case `LineString`:
      ch(e51, a2, t2.geometry, o2, t2.properties);
      return;
    case `MultiLineString`:
      lh(e51, a2, t2.geometry, o2, n2, t2.properties);
      return;
    case `Polygon`:
      uh(e51, a2, t2.geometry, o2, t2.properties);
      return;
    case `MultiPolygon`:
      dh(e51, a2, t2.geometry, o2, t2.properties);
      return;
    default:
      throw Error(`Input data is not a valid GeoJSON object.`);
  }
}
function ih(e51, t2, n2) {
  return t2.promoteId ? e51.properties?.[t2.promoteId] : t2.generateId ? n2 || 0 : e51.id;
}
function ah(e51, t2, n2, r2, i2, a2 = 0) {
  for (let o2 of n2.geometries) rh(e51, { id: t2.id, type: `Feature`, geometry: o2, properties: t2.properties }, r2, i2, a2);
}
function oh(e51, t2, n2, r2) {
  let i2 = [];
  i2.push(mh(n2.coordinates[0]), hh(n2.coordinates[1]), 0), e51.push($m(t2, `Point`, i2, r2));
}
function sh(e51, t2, n2, r2) {
  let i2 = [];
  for (let e52 of n2.coordinates) i2.push(mh(e52[0]), hh(e52[1]), 0);
  e51.push($m(t2, `MultiPoint`, i2, r2));
}
function ch(e51, t2, n2, r2, i2) {
  let a2 = { points: [] };
  fh(n2.coordinates, a2, r2, false), e51.push($m(t2, `LineString`, a2, i2));
}
function lh(e51, t2, n2, r2, i2, a2) {
  if (i2.lineMetrics) for (let i3 of n2.coordinates) {
    let n3 = { points: [] };
    fh(i3, n3, r2, false), e51.push($m(t2, `LineString`, n3, a2));
  }
  else {
    let i3 = [];
    ph(n2.coordinates, i3, r2, false), e51.push($m(t2, `MultiLineString`, i3, a2));
  }
}
function uh(e51, t2, n2, r2, i2) {
  let a2 = [];
  ph(n2.coordinates, a2, r2, true), e51.push($m(t2, `Polygon`, a2, i2));
}
function dh(e51, t2, n2, r2, i2) {
  let a2 = [];
  for (let e52 of n2.coordinates) {
    let t3 = [];
    ph(e52, t3, r2, true), a2.push(t3);
  }
  e51.push($m(t2, `MultiPolygon`, a2, i2));
}
function fh(e51, t2, n2, r2) {
  let i2, a2, o2 = 0;
  for (let n3 = 0; n3 < e51.length; n3++) {
    let s3 = mh(e51[n3][0]), c2 = hh(e51[n3][1]);
    t2.points.push(s3, c2, 0), n3 > 0 && (o2 += r2 ? (i2 * c2 - s3 * a2) / 2 : Math.sqrt((s3 - i2) ** 2 + (c2 - a2) ** 2)), i2 = s3, a2 = c2;
  }
  let s2 = t2.points.length - 3;
  t2.points[2] = 1, n2 > 0 && Zm(t2.points, 0, s2, n2), t2.points[s2 + 2] = 1, eh(t2), t2.size = Math.abs(o2), t2.start = 0, t2.end = t2.size;
}
function ph(e51, t2, n2, r2) {
  for (let i2 = 0; i2 < e51.length; i2++) {
    let a2 = { points: [] };
    fh(e51[i2], a2, n2, r2), t2.push(a2);
  }
}
function mh(e51) {
  return e51 / 360 + 0.5;
}
function hh(e51) {
  let t2 = Math.sin(e51 * Math.PI / 180), n2 = 0.5 - 0.25 * Math.log((1 + t2) / (1 - t2)) / Math.PI;
  return n2 < 0 ? 0 : n2 > 1 ? 1 : n2;
}
function gh(e51) {
  return { type: `FeatureCollection`, features: e51.map((e52) => _h(e52)) };
}
function _h(e51) {
  let t2 = { type: `Feature`, geometry: vh(e51), properties: e51.tags };
  return e51.id != null && (t2.id = e51.id), t2;
}
function vh(e51) {
  let { type: t2, geometry: n2 } = e51;
  switch (t2) {
    case `Point`:
      return { type: t2, coordinates: bh(n2[0], n2[1]) };
    case `MultiPoint`:
      return { type: t2, coordinates: yh(n2) };
    case `LineString`:
      return { type: t2, coordinates: yh(n2.points) };
    case `MultiLineString`:
    case `Polygon`:
      return { type: t2, coordinates: n2.map((e52) => yh(e52.points)) };
    case `MultiPolygon`:
      return { type: t2, coordinates: n2.map((e52) => e52.map((e53) => yh(e53.points))) };
  }
}
function yh(e51) {
  let t2 = [];
  for (let n2 = 0; n2 < e51.length; n2 += 3) t2.push(bh(e51[n2], e51[n2 + 1]));
  return t2;
}
function bh(e51, t2) {
  return [xh(e51), Sh(t2)];
}
function xh(e51) {
  return (e51 - 0.5) * 360;
}
function Sh(e51) {
  let t2 = (180 - e51 * 360) * Math.PI / 180;
  return 360 * Math.atan(Math.exp(t2)) / Math.PI - 90;
}
function Ch(e51, t2, n2, r2, i2, a2, o2, s2) {
  if (n2 /= t2, r2 /= t2, a2 >= n2 && o2 < r2) return e51;
  if (o2 < n2 || a2 >= r2) return null;
  let c2 = [];
  for (let t3 of e51) {
    let e52 = i2 === 0 ? t3.minX : t3.minY, a3 = i2 === 0 ? t3.maxX : t3.maxY;
    if (e52 >= n2 && a3 < r2) {
      c2.push(t3);
      continue;
    }
    if (!(a3 < n2 || e52 >= r2)) switch (t3.type) {
      case `Point`:
      case `MultiPoint`:
        wh(t3, c2, n2, r2, i2);
        continue;
      case `LineString`:
        Th(t3, c2, n2, r2, i2, s2);
        continue;
      case `MultiLineString`:
        Eh(t3, c2, n2, r2, i2);
        continue;
      case `Polygon`:
        Dh(t3, c2, n2, r2, i2);
        continue;
      case `MultiPolygon`:
        Oh(t3, c2, n2, r2, i2);
        continue;
    }
  }
  return c2.length ? c2 : null;
}
function wh(e51, t2, n2, r2, i2) {
  let a2 = [];
  if (kh(e51.geometry, a2, n2, r2, i2), !a2.length) return;
  let o2 = a2.length === 3 ? `Point` : `MultiPoint`;
  t2.push($m(e51.id, o2, a2, e51.tags));
}
function Th(e51, t2, n2, r2, i2, a2) {
  let o2 = [];
  if (Ah(e51.geometry, o2, n2, r2, i2, false, a2.lineMetrics), o2.length) {
    if (a2.lineMetrics) {
      for (let n3 of o2) t2.push($m(e51.id, `LineString`, n3, e51.tags));
      return;
    }
    if (o2.length > 1) {
      t2.push($m(e51.id, `MultiLineString`, o2, e51.tags));
      return;
    }
    t2.push($m(e51.id, `LineString`, o2[0], e51.tags));
  }
}
function Eh(e51, t2, n2, r2, i2) {
  let a2 = [];
  if (Mh(e51.geometry, a2, n2, r2, i2, false), a2.length) {
    if (a2.length === 1) {
      t2.push($m(e51.id, `LineString`, a2[0], e51.tags));
      return;
    }
    t2.push($m(e51.id, `MultiLineString`, a2, e51.tags));
  }
}
function Dh(e51, t2, n2, r2, i2) {
  let a2 = [];
  Mh(e51.geometry, a2, n2, r2, i2, true), a2.length && t2.push($m(e51.id, `Polygon`, a2, e51.tags));
}
function Oh(e51, t2, n2, r2, i2) {
  let a2 = [];
  for (let t3 of e51.geometry) {
    let e52 = [];
    Mh(t3, e52, n2, r2, i2, true), e52.length && a2.push(e52);
  }
  a2.length && t2.push($m(e51.id, `MultiPolygon`, a2, e51.tags));
}
function kh(e51, t2, n2, r2, i2) {
  for (let a2 = 0; a2 < e51.length; a2 += 3) {
    let o2 = e51[a2 + i2];
    o2 >= n2 && o2 <= r2 && Nh(t2, e51[a2], e51[a2 + 1], e51[a2 + 2]);
  }
}
function Ah(e51, t2, n2, r2, i2, a2, o2) {
  let s2 = jh(e51), c2 = i2 === 0 ? Ph : Fh, l2 = e51.start, u2, d2;
  for (let f3 = 0; f3 < e51.points.length - 3; f3 += 3) {
    let p3 = e51.points[f3], m3 = e51.points[f3 + 1], h3 = e51.points[f3 + 2], g3 = e51.points[f3 + 3], _ = e51.points[f3 + 4], v = i2 === 0 ? p3 : m3, y = i2 === 0 ? g3 : _, b = false;
    o2 && (u2 = Math.sqrt((p3 - g3) ** 2 + (m3 - _) ** 2)), v < n2 ? y > n2 && (d2 = c2(s2, p3, m3, g3, _, n2), o2 && (s2.start = l2 + u2 * d2)) : v > r2 ? y < r2 && (d2 = c2(s2, p3, m3, g3, _, r2), o2 && (s2.start = l2 + u2 * d2)) : Nh(s2.points, p3, m3, h3), y < n2 && v >= n2 && (d2 = c2(s2, p3, m3, g3, _, n2), b = true), y > r2 && v <= r2 && (d2 = c2(s2, p3, m3, g3, _, r2), b = true), !a2 && b && (o2 && (s2.end = l2 + u2 * d2), t2.push(s2), s2 = jh(e51)), o2 && (l2 += u2);
  }
  let f2 = e51.points.length - 3, p2 = e51.points[f2], m2 = e51.points[f2 + 1], h2 = e51.points[f2 + 2], g2 = i2 === 0 ? p2 : m2;
  g2 >= n2 && g2 <= r2 && Nh(s2.points, p2, m2, h2), f2 = s2.points.length - 3, a2 && f2 >= 3 && (s2.points[f2] !== s2.points[0] || s2.points[f2 + 1] !== s2.points[1]) && Nh(s2.points, s2.points[0], s2.points[1], s2.points[2]), s2.points.length && (eh(s2), t2.push(s2));
}
function jh(e51) {
  return { points: [], size: e51.size, start: e51.start, end: e51.end };
}
function Mh(e51, t2, n2, r2, i2, a2) {
  for (let o2 of e51) Ah(o2, t2, n2, r2, i2, a2, false);
}
function Nh(e51, t2, n2, r2) {
  e51.push(t2, n2, r2);
}
function Ph(e51, t2, n2, r2, i2, a2) {
  let o2 = (a2 - t2) / (r2 - t2);
  return Nh(e51.points, a2, n2 + (i2 - n2) * o2, 1), o2;
}
function Fh(e51, t2, n2, r2, i2, a2) {
  let o2 = (a2 - n2) / (i2 - n2);
  return Nh(e51.points, t2 + (r2 - t2) * o2, a2, 1), o2;
}
function Ih(e51, t2) {
  let n2 = t2.buffer / t2.extent, r2 = e51, i2 = Ch(e51, 1, -1 - n2, n2, 0, -1, 2, t2), a2 = Ch(e51, 1, 1 - n2, 2 + n2, 0, -1, 2, t2);
  return !i2 && !a2 ? r2 : (r2 = Ch(e51, 1, -n2, 1 + n2, 0, -1, 2, t2) || [], i2 && (r2 = Lh(i2, 1).concat(r2)), a2 && (r2 = r2.concat(Lh(a2, -1))), r2);
}
function Lh(e51, t2) {
  let n2 = [];
  for (let r2 of e51) switch (r2.type) {
    case `Point`:
    case `MultiPoint`: {
      let e52 = Rh(r2.geometry, t2);
      n2.push($m(r2.id, r2.type, e52, r2.tags));
      continue;
    }
    case `LineString`: {
      let e52 = zh(r2.geometry, t2);
      n2.push($m(r2.id, r2.type, e52, r2.tags));
      continue;
    }
    case `MultiLineString`:
    case `Polygon`: {
      let e52 = [];
      for (let n3 of r2.geometry) e52.push(zh(n3, t2));
      n2.push($m(r2.id, r2.type, e52, r2.tags));
      continue;
    }
    case `MultiPolygon`: {
      let e52 = [];
      for (let n3 of r2.geometry) {
        let r3 = [];
        for (let e53 of n3) r3.push(zh(e53, t2));
        e52.push(r3);
      }
      n2.push($m(r2.id, r2.type, e52, r2.tags));
      continue;
    }
  }
  return n2;
}
function Rh(e51, t2) {
  let n2 = [];
  for (let r2 = 0; r2 < e51.length; r2 += 3) n2.push(e51[r2] + t2, e51[r2 + 1], e51[r2 + 2]);
  return n2;
}
function zh(e51, t2) {
  let n2 = { points: [], size: e51.size };
  e51.start !== void 0 && (n2.start = e51.start, n2.end = e51.end);
  for (let r2 = 0; r2 < e51.points.length; r2 += 3) n2.points.push(e51.points[r2] + t2, e51.points[r2 + 1], e51.points[r2 + 2]);
  return eh(n2), n2;
}
function Bh(e51, t2, n2) {
  let r2 = Uh(t2, n2), i2 = [];
  if (r2.removeAll && (i2 = e51, e51 = []), r2.remove.size || r2.add.size) {
    let t3 = [];
    for (let n3 of e51) (r2.remove.has(n3.id) || r2.add.has(n3.id)) && t3.push(n3);
    if (t3.length) {
      i2 = i2.concat(t3);
      let n3 = new Set(t3.map((e52) => e52.id));
      e51 = e51.filter((e52) => !n3.has(e52.id));
    }
    if (r2.add.size) {
      let t4 = nh({ type: `FeatureCollection`, features: Array.from(r2.add.values()) }, n2);
      t4 = Ih(t4, n2), i2 = i2.concat(t4), e51 = e51.concat(t4);
    }
  }
  if (r2.update.size) {
    let t3 = /* @__PURE__ */ new Map(), a2 = [];
    for (let n3 of e51) r2.update.has(n3.id) ? t3.set(n3.id, [...t3.get(n3.id) || [], n3]) : a2.push(n3);
    for (let [e52, o2] of r2.update) {
      let r3 = t3.get(e52);
      if (!r3 || r3.length === 0) continue;
      let s2 = Vh(r3, o2, n2);
      i2 = i2.concat(r3, s2), a2 = a2.concat(s2);
    }
    e51 = a2;
  }
  return { affected: i2, source: e51 };
}
function Vh(e51, t2, n2) {
  let r2 = !!t2.newGeometry, i2 = t2.removeAllProperties || t2.removeProperties?.length > 0 || t2.addOrUpdateProperties?.length > 0;
  if (r2) {
    let r3 = e51[0], a2 = nh({ type: `FeatureCollection`, features: [{ type: `Feature`, id: r3.id, geometry: t2.newGeometry, properties: i2 ? Hh(r3.tags, t2) : r3.tags }] }, n2);
    return a2 = Ih(a2, n2), a2;
  }
  if (i2) {
    let n3 = [];
    for (let r3 of e51) {
      let e52 = { ...r3 };
      e52.tags = Hh(e52.tags, t2), n3.push(e52);
    }
    return n3;
  }
  return e51;
}
function Hh(e51, t2) {
  if (t2.removeAllProperties) return {};
  let n2 = { ...e51 || {} };
  if (t2.removeProperties) for (let e52 of t2.removeProperties) delete n2[e52];
  if (t2.addOrUpdateProperties) for (let { key: e52, value: r2 } of t2.addOrUpdateProperties) n2[e52] = r2;
  return n2;
}
function Uh(e51, t2) {
  return e51 ? { removeAll: e51.removeAll, remove: new Set(e51.remove || []), add: new Map(e51.add?.map((e52) => [t2.promoteId ? e52.properties[t2.promoteId] : e52.id, e52])), update: new Map(e51.update?.map((e52) => [e52.id, e52])) } : { remove: /* @__PURE__ */ new Set(), add: /* @__PURE__ */ new Map(), update: /* @__PURE__ */ new Map() };
}
var Wh = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
var Y = new Uint32Array(96);
var Gh = class e46 {
  static from(t2) {
    if (!t2 || t2.byteLength === void 0 || t2.buffer) throw Error(`Data must be an instance of ArrayBuffer or SharedArrayBuffer.`);
    let [n2, r2] = new Uint8Array(t2, 0, 2);
    if (n2 !== 219) throw Error(`Data does not appear to be in a KDBush format.`);
    let i2 = r2 >> 4;
    if (i2 !== 1) throw Error(`Got v${i2} data when expected v1.`);
    let a2 = Wh[r2 & 15];
    if (!a2) throw Error(`Unrecognized array type.`);
    let [o2] = new Uint16Array(t2, 2, 1), [s2] = new Uint32Array(t2, 4, 1);
    return new e46(s2, o2, a2, void 0, t2);
  }
  constructor(e51, t2 = 64, n2 = Float64Array, r2 = ArrayBuffer, i2) {
    if (isNaN(e51) || e51 < 0) throw Error(`Unexpected numItems value: ${e51}.`);
    this.numItems = +e51, this.nodeSize = Math.min(Math.max(+t2, 2), 65535), this.ArrayType = n2, this.IndexArrayType = e51 < 65536 ? Uint16Array : Uint32Array;
    let a2 = Wh.indexOf(this.ArrayType), o2 = e51 * 2 * this.ArrayType.BYTES_PER_ELEMENT, s2 = e51 * this.IndexArrayType.BYTES_PER_ELEMENT, c2 = (8 - s2 % 8) % 8;
    if (a2 < 0) throw Error(`Unexpected typed array class: ${n2}.`);
    if (i2) this.data = i2, this.ids = new this.IndexArrayType(i2, 8, e51), this.coords = new n2(i2, 8 + s2 + c2, e51 * 2), this._pos = e51 * 2, this._finished = true;
    else {
      let i3 = this.data = new r2(8 + o2 + s2 + c2);
      this.ids = new this.IndexArrayType(i3, 8, e51), this.coords = new n2(i3, 8 + s2 + c2, e51 * 2), this._pos = 0, this._finished = false, new Uint8Array(i3, 0, 2).set([219, 16 + a2]), new Uint16Array(i3, 2, 1)[0] = t2, new Uint32Array(i3, 4, 1)[0] = e51;
    }
  }
  add(e51, t2) {
    let n2 = this._pos >> 1;
    return this.ids[n2] = n2, this.coords[this._pos++] = e51, this.coords[this._pos++] = t2, n2;
  }
  finish() {
    let e51 = this._pos >> 1;
    if (e51 !== this.numItems) throw Error(`Added ${e51} items when expected ${this.numItems}.`);
    return Kh(this.ids, this.coords, this.nodeSize, 0, this.numItems - 1, 0), this._finished = true, this;
  }
  range(e51, t2, n2, r2) {
    if (!this._finished) throw Error(`Data not yet indexed - call index.finish().`);
    let { ids: i2, coords: a2, nodeSize: o2 } = this;
    Y[0] = 0, Y[1] = i2.length - 1, Y[2] = 0;
    let s2 = 3, c2 = [];
    for (; s2 > 0; ) {
      let l2 = Y[--s2], u2 = Y[--s2], d2 = Y[--s2];
      if (u2 - d2 <= o2) {
        for (let o3 = d2; o3 <= u2; o3++) {
          let s3 = a2[2 * o3], l3 = a2[2 * o3 + 1];
          s3 >= e51 && s3 <= n2 && l3 >= t2 && l3 <= r2 && c2.push(i2[o3]);
        }
        continue;
      }
      let f2 = d2 + u2 >> 1, p2 = a2[2 * f2], m2 = a2[2 * f2 + 1];
      p2 >= e51 && p2 <= n2 && m2 >= t2 && m2 <= r2 && c2.push(i2[f2]), (l2 === 0 ? e51 <= p2 : t2 <= m2) && (Y[s2++] = d2, Y[s2++] = f2 - 1, Y[s2++] = 1 - l2), (l2 === 0 ? n2 >= p2 : r2 >= m2) && (Y[s2++] = f2 + 1, Y[s2++] = u2, Y[s2++] = 1 - l2);
    }
    return c2;
  }
  within(e51, t2, n2) {
    let r2 = [];
    return this.withinInto(e51, t2, n2, r2), r2;
  }
  withinInto(e51, t2, n2, r2) {
    if (!this._finished) throw Error(`Data not yet indexed - call index.finish().`);
    let { ids: i2, coords: a2, nodeSize: o2 } = this;
    Y[0] = 0, Y[1] = i2.length - 1, Y[2] = 0;
    let s2 = 3, c2 = 0, l2 = n2 * n2;
    for (; s2 > 0; ) {
      let u2 = Y[--s2], d2 = Y[--s2], f2 = Y[--s2];
      if (d2 - f2 <= o2) {
        for (let n3 = f2; n3 <= d2; n3++) Xh(a2[2 * n3], a2[2 * n3 + 1], e51, t2) <= l2 && (r2[c2++] = i2[n3]);
        continue;
      }
      let p2 = f2 + d2 >> 1, m2 = a2[2 * p2], h2 = a2[2 * p2 + 1];
      Xh(m2, h2, e51, t2) <= l2 && (r2[c2++] = i2[p2]), (u2 === 0 ? e51 - n2 <= m2 : t2 - n2 <= h2) && (Y[s2++] = f2, Y[s2++] = p2 - 1, Y[s2++] = 1 - u2), (u2 === 0 ? e51 + n2 >= m2 : t2 + n2 >= h2) && (Y[s2++] = p2 + 1, Y[s2++] = d2, Y[s2++] = 1 - u2);
    }
    return c2;
  }
};
function Kh(e51, t2, n2, r2, i2, a2) {
  if (i2 - r2 <= n2) return;
  let o2 = r2 + i2 >> 1;
  qh(e51, t2, o2, r2, i2, a2), Kh(e51, t2, n2, r2, o2 - 1, 1 - a2), Kh(e51, t2, n2, o2 + 1, i2, 1 - a2);
}
function qh(e51, t2, n2, r2, i2, a2) {
  for (; i2 > r2; ) {
    if (i2 - r2 > 600) {
      let o3 = i2 - r2 + 1, s3 = n2 - r2 + 1, c3 = Math.log(o3), l2 = 0.5 * Math.exp(2 * c3 / 3), u2 = 0.5 * Math.sqrt(c3 * l2 * (o3 - l2) / o3) * (s3 - o3 / 2 < 0 ? -1 : 1);
      qh(e51, t2, n2, Math.max(r2, Math.floor(n2 - s3 * l2 / o3 + u2)), Math.min(i2, Math.floor(n2 + (o3 - s3) * l2 / o3 + u2)), a2);
    }
    let o2 = t2[2 * n2 + a2], s2 = r2, c2 = i2;
    for (Jh(e51, t2, r2, n2), t2[2 * i2 + a2] > o2 && Jh(e51, t2, r2, i2); s2 < c2; ) {
      for (Jh(e51, t2, s2, c2), s2++, c2--; t2[2 * s2 + a2] < o2; ) s2++;
      for (; t2[2 * c2 + a2] > o2; ) c2--;
    }
    t2[2 * r2 + a2] === o2 ? Jh(e51, t2, r2, c2) : (c2++, Jh(e51, t2, c2, i2)), c2 <= n2 && (r2 = c2 + 1), n2 <= c2 && (i2 = c2 - 1);
  }
}
function Jh(e51, t2, n2, r2) {
  Yh(e51, n2, r2), Yh(t2, 2 * n2, 2 * r2), Yh(t2, 2 * n2 + 1, 2 * r2 + 1);
}
function Yh(e51, t2, n2) {
  let r2 = e51[t2];
  e51[t2] = e51[n2], e51[n2] = r2;
}
function Xh(e51, t2, n2, r2) {
  let i2 = e51 - n2, a2 = t2 - r2;
  return i2 * i2 + a2 * a2;
}
var Zh = { minZoom: 0, maxZoom: 16, minPoints: 2, radius: 40, extent: 512, nodeSize: 64, log: false, generateId: false, reduce: null, map: (e51) => e51 };
var Qh = class {
  constructor(e51) {
    this.options = Object.assign(Object.create(Zh), e51), this.trees = Array(this.options.maxZoom + 1), this.stride = this.options.reduce ? 7 : 6, this.clusterProps = [], this.points = [];
  }
  load(e51) {
    let t2 = [];
    for (let n2 of e51) {
      if (!n2.geometry) continue;
      let [e52, r2] = n2.geometry.coordinates, [i2, a2] = [mh(e52), hh(r2)], o2 = { id: n2.id, type: `Point`, geometry: [i2, a2], tags: n2.properties };
      t2.push(o2);
    }
    this.createIndex(t2);
  }
  initialize(e51) {
    let t2 = [];
    for (let n2 of e51) n2.type === `Point` && t2.push(n2);
    this.createIndex(t2);
  }
  updateIndex(e51, t2, n2) {
    this.options = Object.assign(Object.create(Zh), n2.clusterOptions), this.initialize(e51);
  }
  createIndex(e51) {
    let { log: t2, minZoom: n2, maxZoom: r2 } = this.options;
    t2 && console.time(`total time`);
    let i2 = `prepare ${e51.length} points`;
    t2 && console.time(i2), this.points = e51;
    let a2 = [];
    for (let t3 = 0; t3 < e51.length; t3++) {
      let n3 = e51[t3];
      if (!n3?.geometry) continue;
      let [r3, i3] = n3.geometry;
      r3 = Math.fround(r3), i3 = Math.fround(i3), a2.push(r3, i3, 1 / 0, t3, -1, 1), this.options.reduce && a2.push(0);
    }
    let o2 = this.trees[r2 + 1] = this.createTree(a2);
    t2 && console.timeEnd(i2);
    for (let e52 = r2; e52 >= n2; e52--) {
      let n3 = Date.now();
      o2 = this.trees[e52] = this.createTree(this.cluster(o2, e52)), t2 && console.log(`z%d: %d clusters in %dms`, e52, o2.numItems, Date.now() - n3);
    }
    t2 && console.timeEnd(`total time`);
  }
  getClusters(e51, t2) {
    return this.getClustersInternal(e51, t2).map((e52) => _h(e52));
  }
  getClustersInternal(e51, t2) {
    let n2 = ((e51[0] + 180) % 360 + 360) % 360 - 180, r2 = Math.max(-90, Math.min(90, e51[1])), i2 = e51[2] === 180 ? 180 : ((e51[2] + 180) % 360 + 360) % 360 - 180, a2 = Math.max(-90, Math.min(90, e51[3]));
    if (e51[2] - e51[0] >= 360) n2 = -180, i2 = 180;
    else if (n2 > i2) {
      let e52 = this.getClustersInternal([n2, r2, 180, a2], t2), o3 = this.getClustersInternal([-180, r2, i2, a2], t2);
      return e52.concat(o3);
    }
    let o2 = this.trees[this.limitZoom(t2)], s2 = o2.range(mh(n2), hh(a2), mh(i2), hh(r2)), c2 = o2.flatData, l2 = [];
    for (let e52 of s2) {
      let t3 = this.stride * e52;
      l2.push(c2[t3 + 5] > 1 ? $h(c2, t3, this.clusterProps) : this.points[c2[t3 + 3]]);
    }
    return l2;
  }
  getChildren(e51) {
    let t2 = this.getOriginId(e51), n2 = this.getOriginZoom(e51), r2 = Error(`No cluster with the specified id: ` + e51), i2 = this.trees[n2];
    if (!i2) throw r2;
    let a2 = i2.flatData;
    if (t2 * this.stride >= a2.length) throw r2;
    let o2 = this.options.radius / (this.options.extent * 2 ** (n2 - 1)), s2 = a2[t2 * this.stride], c2 = a2[t2 * this.stride + 1], l2 = i2.within(s2, c2, o2), u2 = [];
    for (let t3 of l2) {
      let n3 = t3 * this.stride;
      a2[n3 + 4] === e51 && u2.push(a2[n3 + 5] > 1 ? eg(a2, n3, this.clusterProps) : _h(this.points[a2[n3 + 3]]));
    }
    if (u2.length === 0) throw r2;
    return u2;
  }
  getLeaves(e51, t2, n2) {
    t2 ||= 10, n2 ||= 0;
    let r2 = [];
    return this.appendLeaves(r2, e51, t2, n2, 0), r2;
  }
  getTile(e51, t2, n2) {
    let r2 = this.trees[this.limitZoom(e51)];
    if (!r2) return null;
    let i2 = 2 ** e51, { extent: a2, radius: o2 } = this.options, s2 = o2 / a2, c2 = (n2 - s2) / i2, l2 = (n2 + 1 + s2) / i2, u2 = { transformed: true, features: [], source: null, x: t2, y: n2, z: e51 };
    return this.addTileFeatures(r2.range((t2 - s2) / i2, c2, (t2 + 1 + s2) / i2, l2), r2.flatData, t2, n2, i2, u2), t2 === 0 && this.addTileFeatures(r2.range(1 - s2 / i2, c2, 1, l2), r2.flatData, i2, n2, i2, u2), t2 === i2 - 1 && this.addTileFeatures(r2.range(0, c2, s2 / i2, l2), r2.flatData, -1, n2, i2, u2), u2;
  }
  getClusterExpansionZoom(e51) {
    return this.getOriginZoom(e51);
  }
  appendLeaves(e51, t2, n2, r2, i2) {
    let a2 = this.getChildren(t2);
    for (let t3 of a2) {
      let a3 = t3.properties;
      if (a3?.cluster ? i2 + a3.point_count <= r2 ? i2 += a3.point_count : i2 = this.appendLeaves(e51, a3.cluster_id, n2, r2, i2) : i2 < r2 ? i2++ : e51.push(t3), e51.length === n2) break;
    }
    return i2;
  }
  createTree(e51) {
    let t2 = new Gh(e51.length / this.stride | 0, this.options.nodeSize, Float32Array);
    for (let n2 = 0; n2 < e51.length; n2 += this.stride) t2.add(e51[n2], e51[n2 + 1]);
    return t2.finish(), t2.flatData = e51, t2.data = null, t2;
  }
  addTileFeatures(e51, t2, n2, r2, i2, a2) {
    for (let o2 of e51) {
      let e52 = o2 * this.stride, s2 = t2[e52 + 5] > 1, c2, l2, u2;
      if (s2) c2 = tg(t2, e52, this.clusterProps), l2 = t2[e52], u2 = t2[e52 + 1];
      else {
        let n3 = this.points[t2[e52 + 3]];
        c2 = n3.tags, [l2, u2] = n3.geometry;
      }
      let d2 = { type: 1, geometry: [[Math.round(this.options.extent * (l2 * i2 - n2)), Math.round(this.options.extent * (u2 * i2 - r2))]], tags: c2 }, f2;
      f2 = s2 || this.options.generateId ? t2[e52 + 3] : this.points[t2[e52 + 3]].id, f2 !== void 0 && (d2.id = f2), a2.features.push(d2);
    }
  }
  limitZoom(e51) {
    return Math.max(this.options.minZoom, Math.min(Math.floor(+e51), this.options.maxZoom + 1));
  }
  cluster(e51, t2) {
    let { radius: n2, extent: r2, reduce: i2, minPoints: a2 } = this.options, o2 = n2 / (r2 * 2 ** t2), s2 = e51.flatData, c2 = [], l2 = this.stride;
    for (let n3 = 0; n3 < s2.length; n3 += l2) {
      if (s2[n3 + 2] <= t2) continue;
      s2[n3 + 2] = t2;
      let r3 = s2[n3], u2 = s2[n3 + 1], d2 = e51.within(s2[n3], s2[n3 + 1], o2), f2 = s2[n3 + 5], p2 = f2;
      for (let e52 of d2) {
        let n4 = e52 * l2;
        s2[n4 + 2] > t2 && (p2 += s2[n4 + 5]);
      }
      if (p2 > f2 && p2 >= a2) {
        let e52 = r3 * f2, a3 = u2 * f2, o3, m2 = -1, h2 = ((n3 / l2 | 0) << 5) + (t2 + 1) + this.points.length;
        for (let r4 of d2) {
          let c3 = r4 * l2;
          if (s2[c3 + 2] <= t2) continue;
          s2[c3 + 2] = t2;
          let u3 = s2[c3 + 5];
          e52 += s2[c3] * u3, a3 += s2[c3 + 1] * u3, s2[c3 + 4] = h2, i2 && (o3 || (o3 = this.map(s2, n3, true), m2 = this.clusterProps.length, this.clusterProps.push(o3)), i2(o3, this.map(s2, c3)));
        }
        s2[n3 + 4] = h2, c2.push(e52 / p2, a3 / p2, 1 / 0, h2, -1, p2), i2 && c2.push(m2);
      } else {
        for (let e52 = 0; e52 < l2; e52++) c2.push(s2[n3 + e52]);
        if (p2 > 1) for (let e52 of d2) {
          let n4 = e52 * l2;
          if (!(s2[n4 + 2] <= t2)) {
            s2[n4 + 2] = t2;
            for (let e53 = 0; e53 < l2; e53++) c2.push(s2[n4 + e53]);
          }
        }
      }
    }
    return c2;
  }
  getOriginId(e51) {
    return e51 - this.points.length >> 5;
  }
  getOriginZoom(e51) {
    return (e51 - this.points.length) % 32;
  }
  map(e51, t2, n2) {
    if (e51[t2 + 5] > 1) {
      let r3 = this.clusterProps[e51[t2 + 6]];
      return n2 ? Object.assign({}, r3) : r3;
    }
    let r2 = this.points[e51[t2 + 3]].tags, i2 = this.options.map(r2);
    return n2 && i2 === r2 ? Object.assign({}, i2) : i2;
  }
};
function $h(e51, t2, n2) {
  return { id: e51[t2 + 3], type: `Point`, tags: tg(e51, t2, n2), geometry: [e51[t2], e51[t2 + 1]] };
}
function eg(e51, t2, n2) {
  return { type: `Feature`, id: e51[t2 + 3], properties: tg(e51, t2, n2), geometry: { type: `Point`, coordinates: [xh(e51[t2]), Sh(e51[t2 + 1])] } };
}
function tg(e51, t2, n2) {
  let r2 = e51[t2 + 5], i2 = r2 >= 1e4 ? `${Math.round(r2 / 1e3)}k` : r2 >= 1e3 ? `${Math.round(r2 / 100) / 10}k` : r2, a2 = e51[t2 + 6], o2 = a2 === -1 ? {} : Object.assign({}, n2[a2]);
  return Object.assign(o2, { cluster: true, cluster_id: e51[t2 + 3], point_count: r2, point_count_abbreviated: i2 });
}
var ng = `geojsonvt_clip_start`;
var rg = `geojsonvt_clip_end`;
function ig(e51, t2, n2, r2, i2) {
  let a2 = t2 === i2.maxZoom ? 0 : i2.tolerance / ((1 << t2) * i2.extent), o2 = { transformed: false, features: [], source: null, x: n2, y: r2, z: t2, minX: 2, minY: 1, maxX: -1, maxY: 0, numPoints: 0, numSimplified: 0, numFeatures: e51.length };
  for (let t3 of e51) ag(o2, t3, a2, i2);
  return o2;
}
function ag(e51, t2, n2, r2) {
  switch (e51.minX = Math.min(e51.minX, t2.minX), e51.minY = Math.min(e51.minY, t2.minY), e51.maxX = Math.max(e51.maxX, t2.maxX), e51.maxY = Math.max(e51.maxY, t2.maxY), t2.type) {
    case `Point`:
    case `MultiPoint`:
      og(e51, t2);
      return;
    case `LineString`:
      sg(e51, t2, n2, r2);
      return;
    case `MultiLineString`:
    case `Polygon`:
      cg(e51, t2, n2);
      return;
    case `MultiPolygon`:
      lg(e51, t2, n2);
      return;
  }
}
function og(e51, t2) {
  let n2 = [];
  for (let r3 = 0; r3 < t2.geometry.length; r3 += 3) n2.push(t2.geometry[r3], t2.geometry[r3 + 1]), e51.numPoints++, e51.numSimplified++;
  if (!n2.length) return;
  let r2 = { type: 1, tags: t2.tags || null, geometry: n2 };
  t2.id !== null && (r2.id = t2.id), e51.features.push(r2);
}
function sg(e51, t2, n2, r2) {
  let i2 = [];
  if (ug(i2, t2.geometry, e51, n2, false, false), !i2.length) return;
  let a2 = t2.tags || null;
  if (r2.lineMetrics) {
    a2 = {};
    for (let e52 in t2.tags) a2[e52] = t2.tags[e52];
    a2[ng] = t2.geometry.start / t2.geometry.size, a2[rg] = t2.geometry.end / t2.geometry.size;
  }
  let o2 = { type: 2, tags: a2, geometry: i2 };
  t2.id !== null && (o2.id = t2.id), e51.features.push(o2);
}
function cg(e51, t2, n2) {
  let r2 = [];
  for (let i3 = 0; i3 < t2.geometry.length; i3++) ug(r2, t2.geometry[i3], e51, n2, t2.type === `Polygon`, i3 === 0);
  if (!r2.length) return;
  let i2 = { type: t2.type === `Polygon` ? 3 : 2, tags: t2.tags || null, geometry: r2 };
  t2.id !== null && (i2.id = t2.id), e51.features.push(i2);
}
function lg(e51, t2, n2) {
  let r2 = [];
  for (let i3 = 0; i3 < t2.geometry.length; i3++) {
    let a2 = t2.geometry[i3];
    for (let t3 = 0; t3 < a2.length; t3++) ug(r2, a2[t3], e51, n2, true, t3 === 0);
  }
  if (!r2.length) return;
  let i2 = { type: 3, tags: t2.tags || null, geometry: r2 };
  t2.id !== null && (i2.id = t2.id), e51.features.push(i2);
}
function ug(e51, t2, n2, r2, i2, a2) {
  let o2 = r2 * r2;
  if (r2 > 0 && t2.size < (i2 ? o2 : r2)) {
    n2.numPoints += t2.points.length / 3;
    return;
  }
  let s2 = [];
  for (let e52 = 0; e52 < t2.points.length; e52 += 3) (r2 === 0 || t2.points[e52 + 2] > o2) && (n2.numSimplified++, s2.push(t2.points[e52], t2.points[e52 + 1])), n2.numPoints++;
  i2 && dg(s2, a2), e51.push(s2);
}
function dg(e51, t2) {
  let n2 = 0;
  for (let t3 = 0, r2 = e51.length, i2 = r2 - 2; t3 < r2; i2 = t3, t3 += 2) n2 += (e51[t3] - e51[i2]) * (e51[t3 + 1] + e51[i2 + 1]);
  if (n2 > 0 === t2) for (let t3 = 0, n3 = e51.length; t3 < n3 / 2; t3 += 2) {
    let r2 = e51[t3], i2 = e51[t3 + 1];
    e51[t3] = e51[n3 - 2 - t3], e51[t3 + 1] = e51[n3 - 1 - t3], e51[n3 - 2 - t3] = r2, e51[n3 - 1 - t3] = i2;
  }
}
function fg(e51, t2) {
  if (e51.transformed) return e51;
  let n2 = 1 << e51.z, r2 = e51.x, i2 = e51.y;
  for (let a2 of e51.features) a2.type === 1 ? pg(a2, t2, n2, r2, i2) : mg(a2, t2, n2, r2, i2);
  return e51.transformed = true, e51;
}
function pg(e51, t2, n2, r2, i2) {
  let a2 = e51, o2 = e51.geometry, s2 = [];
  for (let e52 = 0; e52 < o2.length; e52 += 2) s2.push(hg(o2[e52], o2[e52 + 1], t2, n2, r2, i2));
  return a2.geometry = s2, a2;
}
function mg(e51, t2, n2, r2, i2) {
  let a2 = e51, o2 = e51.geometry, s2 = [];
  for (let e52 of o2) {
    let a3 = [];
    for (let o3 = 0; o3 < e52.length; o3 += 2) a3.push(hg(e52[o3], e52[o3 + 1], t2, n2, r2, i2));
    s2.push(a3);
  }
  return a2.geometry = s2, a2;
}
function hg(e51, t2, n2, r2, i2, a2) {
  return [Math.round(n2 * (e51 * r2 - i2)), Math.round(n2 * (t2 * r2 - a2))];
}
var gg = class {
  constructor(e51) {
    this.options = e51, this.total = 0, this.stats = {}, this.tiles = {}, this.tileCoords = [], this.stats = {}, this.total = 0;
  }
  initialize(e51) {
    this.splitTile(e51, 0, 0, 0), this.options.debug && (e51.length && console.log(`features: %d, points: %d`, this.tiles[0].numFeatures, this.tiles[0].numPoints), console.timeEnd(`generate tiles`), console.log(`tiles generated:`, this.total, JSON.stringify(this.stats)));
  }
  updateIndex(e51, t2, n2) {
    n2.debug > 1 && (console.log(`invalidating tiles`), console.time(`invalidating`)), this.invalidateTiles(t2), n2.debug > 1 && console.timeEnd(`invalidating`);
    let [r2, i2, a2] = [0, 0, 0], o2 = ig(e51, r2, i2, a2, n2);
    o2.source = e51;
    let s2 = _g(r2, i2, a2);
    if (this.tiles[s2] = o2, this.tileCoords.push({ z: r2, x: i2, y: a2, id: s2 }), n2.debug) {
      let e52 = `z${r2}`;
      this.stats[e52] = (this.stats[e52] || 0) + 1, this.total++;
    }
  }
  getClusterExpansionZoom(e51) {
    return null;
  }
  getChildren(e51) {
    return null;
  }
  getLeaves(e51, t2, n2) {
    return null;
  }
  getTile(e51, t2, n2) {
    let { extent: r2, debug: i2 } = this.options, a2 = 1 << e51;
    t2 = t2 + a2 & a2 - 1;
    let o2 = _g(e51, t2, n2);
    if (this.tiles[o2]) return fg(this.tiles[o2], r2);
    i2 > 1 && console.log(`drilling down to z%d-%d-%d`, e51, t2, n2);
    let s2 = e51, c2 = t2, l2 = n2, u2;
    for (; !u2 && s2 > 0; ) s2--, c2 >>= 1, l2 >>= 1, u2 = this.tiles[_g(s2, c2, l2)];
    return !u2?.source || (i2 > 1 && (console.log(`found parent tile z%d-%d-%d`, s2, c2, l2), console.time(`drilling down`)), this.splitTile(u2.source, s2, c2, l2, e51, t2, n2), i2 > 1 && console.timeEnd(`drilling down`), !this.tiles[o2]) ? null : fg(this.tiles[o2], r2);
  }
  splitTile(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = [e51, t2, n2, r2], c2 = this.options, l2 = c2.debug;
    for (; s2.length; ) {
      r2 = s2.pop(), n2 = s2.pop(), t2 = s2.pop(), e51 = s2.pop();
      let u2 = 1 << t2, d2 = _g(t2, n2, r2), f2 = this.tiles[d2];
      if (!f2 && (l2 > 1 && console.time(`creation`), f2 = this.tiles[d2] = ig(e51, t2, n2, r2, c2), this.tileCoords.push({ z: t2, x: n2, y: r2, id: d2 }), l2)) {
        l2 > 1 && (console.log(`tile z%d-%d-%d (features: %d, points: %d, simplified: %d)`, t2, n2, r2, f2.numFeatures, f2.numPoints, f2.numSimplified), console.timeEnd(`creation`));
        let e52 = `z${t2}`;
        this.stats[e52] = (this.stats[e52] || 0) + 1, this.total++;
      }
      if (f2.source = e51, i2 == null) {
        if (t2 === c2.indexMaxZoom || f2.numPoints <= c2.indexMaxPoints) continue;
      } else if (t2 === c2.maxZoom || t2 === i2) continue;
      else if (i2 != null) {
        let e52 = i2 - t2;
        if (n2 !== a2 >> e52 || r2 !== o2 >> e52) continue;
      }
      if (f2.source = null, !e51.length) continue;
      l2 > 1 && console.time(`clipping`);
      let p2 = 0.5 * c2.buffer / c2.extent, m2 = 0.5 - p2, h2 = 0.5 + p2, g2 = 1 + p2, _ = null, v = null, y = null, b = null, x = Ch(e51, u2, n2 - p2, n2 + h2, 0, f2.minX, f2.maxX, c2), S = Ch(e51, u2, n2 + m2, n2 + g2, 0, f2.minX, f2.maxX, c2);
      x && (_ = Ch(x, u2, r2 - p2, r2 + h2, 1, f2.minY, f2.maxY, c2), v = Ch(x, u2, r2 + m2, r2 + g2, 1, f2.minY, f2.maxY, c2)), S && (y = Ch(S, u2, r2 - p2, r2 + h2, 1, f2.minY, f2.maxY, c2), b = Ch(S, u2, r2 + m2, r2 + g2, 1, f2.minY, f2.maxY, c2)), l2 > 1 && console.timeEnd(`clipping`), s2.push(_ || [], t2 + 1, n2 * 2, r2 * 2), s2.push(v || [], t2 + 1, n2 * 2, r2 * 2 + 1), s2.push(y || [], t2 + 1, n2 * 2 + 1, r2 * 2), s2.push(b || [], t2 + 1, n2 * 2 + 1, r2 * 2 + 1);
    }
  }
  invalidateTiles(e51) {
    if (!e51.length) return;
    let t2 = this.options, { debug: n2 } = t2, r2 = 1 / 0, i2 = -1 / 0, a2 = 1 / 0, o2 = -1 / 0;
    for (let t3 of e51) r2 = Math.min(r2, t3.minX), i2 = Math.max(i2, t3.maxX), a2 = Math.min(a2, t3.minY), o2 = Math.max(o2, t3.maxY);
    let s2 = t2.buffer / t2.extent, c2 = /* @__PURE__ */ new Set();
    for (let t3 in this.tiles) {
      let l2 = this.tiles[t3], u2 = 1 << l2.z, d2 = (l2.x - s2) / u2, f2 = (l2.x + 1 + s2) / u2, p2 = (l2.y - s2) / u2, m2 = (l2.y + 1 + s2) / u2;
      if (i2 < d2 || r2 >= f2 || o2 < p2 || a2 >= m2) continue;
      let h2 = false;
      for (let t4 of e51) if (t4.maxX >= d2 && t4.minX < f2 && t4.maxY >= p2 && t4.minY < m2) {
        h2 = true;
        break;
      }
      if (h2) {
        if (n2) {
          n2 > 1 && console.log(`invalidate tile z%d-%d-%d (features: %d, points: %d, simplified: %d)`, l2.z, l2.x, l2.y, l2.numFeatures, l2.numPoints, l2.numSimplified);
          let e52 = `z${l2.z}`;
          this.stats[e52] = (this.stats[e52] || 0) - 1, this.total--;
        }
        delete this.tiles[t3], c2.add(t3);
      }
    }
    c2.size && (this.tileCoords = this.tileCoords.filter((e52) => !c2.has(e52.id)));
  }
};
function _g(e51, t2, n2) {
  return ((1 << e51) * n2 + t2) * 32 + e51;
}
var vg = { maxZoom: 14, indexMaxZoom: 5, indexMaxPoints: 1e5, tolerance: 3, extent: 4096, buffer: 64, lineMetrics: false, promoteId: null, generateId: false, updateable: false, cluster: false, clusterOptions: Zh, debug: 0 };
var yg = class {
  constructor(e51, t2) {
    t2 = this.options = Object.assign({}, vg, t2);
    let n2 = t2.debug;
    if (n2 && console.time(`preprocess data`), t2.maxZoom < 0 || t2.maxZoom > 24) throw Error(`maxZoom should be in the 0-24 range`);
    if (t2.promoteId && t2.generateId) throw Error(`promoteId and generateId cannot be used together.`);
    let r2 = nh(e51, t2);
    n2 && (console.timeEnd(`preprocess data`), console.log(`index: maxZoom: %d, maxPoints: %d`, t2.indexMaxZoom, t2.indexMaxPoints), console.time(`generate tiles`)), r2 = Ih(r2, t2), t2.updateable && (this.source = r2), this.initializeIndex(r2, t2);
  }
  initializeIndex(e51, t2) {
    this.tileIndex = t2.cluster ? new Qh(t2.clusterOptions) : new gg(t2), e51.length && this.tileIndex.initialize(e51);
  }
  getTile(e51, t2, n2) {
    return e51 = +e51, t2 = +t2, n2 = +n2, e51 < 0 || e51 > 24 ? null : this.tileIndex.getTile(e51, t2, n2);
  }
  updateData(e51, t2) {
    let n2 = this.options;
    if (!n2.updateable) throw Error("to update tile geojson `updateable` option must be set to true");
    let { affected: r2, source: i2 } = Bh(this.source, e51, n2);
    t2 && ({ affected: r2, source: i2 } = this.filterUpdate(i2, r2, t2)), r2.length && (this.source = i2, this.tileIndex.updateIndex(i2, r2, n2));
  }
  filterUpdate(e51, t2, n2) {
    let r2 = /* @__PURE__ */ new Set();
    for (let i2 of e51) i2.id != null && (n2(_h(i2)) || (t2.push(i2), r2.add(i2.id)));
    return e51 = e51.filter((e52) => !r2.has(e52.id)), { affected: t2, source: e51 };
  }
  getData() {
    if (!this.options.updateable) throw Error("to retrieve data the `updateable` option must be set to true");
    return gh(this.source);
  }
  updateClusterOptions(e51, t2) {
    let n2 = this.options.cluster;
    if (this.options.cluster = e51, this.options.clusterOptions = t2, n2 == e51) {
      this.tileIndex.updateIndex(this.source, [], this.options);
      return;
    }
    this.initializeIndex(this.source, this.options);
  }
  getClusterExpansionZoom(e51) {
    return this.tileIndex.getClusterExpansionZoom(e51);
  }
  getClusterChildren(e51) {
    return this.tileIndex.getChildren(e51);
  }
  getClusterLeaves(e51, t2, n2) {
    return this.tileIndex.getLeaves(e51, t2, n2);
  }
};
var bg = J([{ name: `a_pos_normal`, components: 2, type: `Int16` }, { name: `a_data`, components: 4, type: `Uint8` }], 4);
var xg = bg.members;
bg.size, bg.alignment;
var Sg = J([{ name: `a_uv_x`, components: 1, type: `Float32` }, { name: `a_split_index`, components: 1, type: `Float32` }]);
var Cg = Sg.members;
Sg.size, Sg.alignment;
var wg = Math.cos(75 / 2 * (Math.PI / 180));
var Tg = 1 / 2;
var Eg = 2 ** 14 / Tg;
var Dg = class {
  constructor(e51) {
    this.zoom = e51.zoom, this.overscaling = e51.overscaling, this.layers = e51.layers, this.layerIds = this.layers.map((e52) => e52.id), this.index = e51.index, this.hasDependencies = false, this.patternFeatures = [], this.lineClipsArray = [], this.gradients = {};
    for (let e52 of this.layers) this.gradients[e52.id] = {};
    this.layoutVertexArray = new vu(), this.layoutVertexArray2 = new yu(), this.indexArray = new ku(), this.programConfigurations = new dd(e51.layers, e51.zoom), this.segments = new Pu(), this.maxLineLength = 0, this.stateDependentLayerIds = this.layers.filter((e52) => e52.isStateDependent()).map((e52) => e52.id);
  }
  populate(e51, t2, n2) {
    this.hasDependencies = jf(`line`, this.layers, t2) || this.hasLineDasharray(this.layers);
    let r2 = this.layers[0].layout.get(`line-sort-key`), i2 = !r2.isConstant(), a2 = [], o2 = new W(this.zoom), s2 = this.layers[0]._featureFilter.needGeometry;
    for (let { feature: t3, id: c2, index: l2, sourceLayerIndex: u2 } of e51) {
      let e52 = vd(t3, s2);
      if (!this.layers[0]._featureFilter.filter(o2, e52, n2)) continue;
      let d2 = i2 ? r2.evaluate(e52, {}, n2) : void 0, f2 = { id: c2, properties: t3.properties, type: t3.type, sourceLayerIndex: u2, index: l2, geometry: s2 ? e52.geometry : _d(t3), patterns: {}, dashes: {}, sortKey: d2 };
      a2.push(f2);
    }
    i2 && a2.sort((e52, t3) => e52.sortKey - t3.sortKey);
    for (let r3 of a2) {
      let { geometry: i3, index: a3, sourceLayerIndex: o3 } = r3;
      this.hasDependencies ? (jf(`line`, this.layers, t2) ? Mf(`line`, this.layers, r3, { zoom: this.zoom }, t2) : this.hasLineDasharray(this.layers) && this.addLineDashDependencies(this.layers, r3, this.zoom, t2), this.patternFeatures.push(r3)) : this.addFeature(r3, i3, a3, n2, {}, {}, t2.subdivisionGranularity);
      let s3 = e51[a3].feature;
      t2.featureIndex.insert(s3, i3, a3, o3, this.index);
    }
  }
  update(e51, t2, n2, r2) {
    this.stateDependentLayers.length && this.programConfigurations.updatePaintArrays(e51, t2, this.stateDependentLayers, { imagePositions: n2, dashPositions: r2 });
  }
  addFeatures(e51, t2, n2, r2) {
    for (let i2 of this.patternFeatures) this.addFeature(i2, i2.geometry, i2.index, t2, n2, r2, e51.subdivisionGranularity);
  }
  isEmpty() {
    return this.layoutVertexArray.length === 0;
  }
  uploadPending() {
    return !this.uploaded || this.programConfigurations.needsUpload;
  }
  upload(e51) {
    this.uploaded || (this.layoutVertexArray2.length !== 0 && (this.layoutVertexBuffer2 = e51.createVertexBuffer(this.layoutVertexArray2, Cg)), this.layoutVertexBuffer = e51.createVertexBuffer(this.layoutVertexArray, xg), this.indexBuffer = e51.createIndexBuffer(this.indexArray)), this.programConfigurations.upload(e51), this.uploaded = true;
  }
  destroy() {
    this.layoutVertexBuffer && (this.layoutVertexBuffer.destroy(), this.indexBuffer.destroy(), this.programConfigurations.destroy(), this.segments.destroy());
  }
  lineFeatureClips(e51) {
    if (e51.properties && Object.hasOwn(e51.properties, `geojsonvt_clip_start`) && Object.hasOwn(e51.properties, `geojsonvt_clip_end`)) return { start: +e51.properties[ng], end: +e51.properties[rg] };
  }
  addFeature(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = this.layers[0].layout, c2 = s2.get(`line-join`).evaluate(e51, {}), l2 = s2.get(`line-cap`).evaluate(e51, {}), u2 = s2.get(`line-miter-limit`).evaluate(e51, {}), d2 = s2.get(`line-round-limit`).evaluate(e51, {});
    this.lineClips = this.lineFeatureClips(e51);
    for (let n3 of t2) this.addLine(n3, e51, c2, l2, u2, d2, r2, o2);
    this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, e51, n2, { imagePositions: i2, dashPositions: a2, canonical: r2 });
  }
  addLine(e51, t2, n2, r2, i2, a2, o2, s2) {
    this.distance = 0, this.scaledDistance = 0, this.totalDistance = 0;
    let c2 = o2 ? s2.line.getGranularityForZoomLevel(o2.z) : 1;
    if (e51 = Pp(e51, c2), this.lineClips) {
      this.lineClipsArray.push(this.lineClips);
      for (let t3 = 0; t3 < e51.length - 1; t3++) this.totalDistance += e51[t3].dist(e51[t3 + 1]);
      this.updateScaledDistance(), this.maxLineLength = Math.max(this.maxLineLength, this.totalDistance);
    }
    let l2 = rm.types[t2.type] === `Polygon`, u2 = e51.length;
    for (; u2 >= 2 && e51[u2 - 1].equals(e51[u2 - 2]); ) u2--;
    let d2 = 0;
    for (; d2 < u2 - 1 && e51[d2].equals(e51[d2 + 1]); ) d2++;
    if (u2 - d2 < (l2 ? 3 : 2)) return;
    n2 === `bevel` && (i2 = 1.05);
    let f2 = this.overscaling <= 16 ? 15 * j / (512 * this.overscaling) : 0, p2 = this.segments.prepareSegment(u2 * 10, this.layoutVertexArray, this.indexArray), m2, h2, g2, _, v;
    this.e1 = this.e2 = -1, l2 && (m2 = e51[u2 - 2], v = e51[d2].sub(m2)._unit()._perp());
    for (let t3 = d2; t3 < u2; t3++) {
      if (g2 = t3 === u2 - 1 ? l2 ? e51[d2 + 1] : void 0 : e51[t3 + 1], g2 && e51[t3].equals(g2)) continue;
      v && (_ = v), m2 && (h2 = m2), m2 = e51[t3], v = g2 ? g2.sub(m2)._unit()._perp() : _, _ ||= v;
      let o3 = _.add(v);
      (o3.x !== 0 || o3.y !== 0) && o3._unit();
      let s3 = _.x * v.x + _.y * v.y, c3 = o3.x * v.x + o3.y * v.y, y = c3 === 0 ? 1 / 0 : 1 / c3, b = 2 * Math.sqrt(2 - 2 * c3), x = c3 < wg && h2 && g2, S = _.x * v.y - _.y * v.x > 0;
      if (x && t3 > d2) {
        let e52 = m2.dist(h2);
        if (e52 > 2 * f2) {
          let t4 = m2.sub(m2.sub(h2)._mult(f2 / e52)._round());
          this.updateDistance(h2, t4), this.addCurrentVertex(t4, _, 0, 0, p2), h2 = t4;
        }
      }
      let C = h2 && g2, w = C ? n2 : l2 ? `butt` : r2;
      if (C && w === `round` && (y < a2 ? w = `miter` : y <= 2 && (w = `fakeround`)), w === `miter` && y > i2 && (w = `bevel`), w === `bevel` && (y > 2 && (w = `flipbevel`), y < i2 && (w = `miter`)), h2 && this.updateDistance(h2, m2), w === `miter`) o3._mult(y), this.addCurrentVertex(m2, o3, 0, 0, p2);
      else if (w === `flipbevel`) {
        if (y > 100) o3 = v.mult(-1);
        else {
          let e52 = y * _.add(v).mag() / _.sub(v).mag();
          o3._perp()._mult(e52 * (S ? -1 : 1));
        }
        this.addCurrentVertex(m2, o3, 0, 0, p2), this.addCurrentVertex(m2, o3.mult(-1), 0, 0, p2);
      } else if (w === `bevel` || w === `fakeround`) {
        let e52 = -Math.sqrt(y * y - 1), t4 = S ? e52 : 0, n3 = S ? 0 : e52;
        if (h2 && this.addCurrentVertex(m2, _, t4, n3, p2), w === `fakeround`) {
          let e53 = Math.round(b * 180 / Math.PI / 20);
          for (let t5 = 1; t5 < e53; t5++) {
            let n4 = t5 / e53;
            if (n4 !== 0.5) {
              let e54 = n4 - 0.5, t6 = 1.0904 + s3 * (-3.2452 + s3 * (3.55645 - s3 * 1.43519)), r4 = 0.848013 + s3 * (-1.06021 + s3 * 0.215638);
              n4 += n4 * e54 * (n4 - 1) * (t6 * e54 * e54 + r4);
            }
            let r3 = v.sub(_)._mult(n4)._add(_)._unit()._mult(S ? -1 : 1);
            this.addHalfVertex(m2, r3.x, r3.y, false, S, 0, p2);
          }
        }
        g2 && this.addCurrentVertex(m2, v, -t4, -n3, p2);
      } else if (w === `butt`) this.addCurrentVertex(m2, o3, 0, 0, p2);
      else if (w === `square`) {
        let e52 = h2 ? 1 : -1;
        this.addCurrentVertex(m2, o3, e52, e52, p2);
      } else w === `round` && (h2 && (this.addCurrentVertex(m2, _, 0, 0, p2), this.addCurrentVertex(m2, _, 1, 1, p2, true)), g2 && (this.addCurrentVertex(m2, v, -1, -1, p2, true), this.addCurrentVertex(m2, v, 0, 0, p2)));
      if (x && t3 < u2 - 1) {
        let e52 = m2.dist(g2);
        if (e52 > 2 * f2) {
          let t4 = m2.add(g2.sub(m2)._mult(f2 / e52)._round());
          this.updateDistance(m2, t4), this.addCurrentVertex(t4, v, 0, 0, p2), m2 = t4;
        }
      }
    }
  }
  addCurrentVertex(e51, t2, n2, r2, i2, a2 = false) {
    let o2 = t2.x + t2.y * n2, s2 = t2.y - t2.x * n2, c2 = -t2.x + t2.y * r2, l2 = -t2.y - t2.x * r2;
    this.addHalfVertex(e51, o2, s2, a2, false, n2, i2), this.addHalfVertex(e51, c2, l2, a2, true, -r2, i2), this.distance > Eg / 2 && this.totalDistance === 0 && (this.distance = 0, this.updateScaledDistance(), this.addCurrentVertex(e51, t2, n2, r2, i2, a2));
  }
  addHalfVertex({ x: e51, y: t2 }, n2, r2, i2, a2, o2, s2) {
    let c2 = (this.lineClips ? this.scaledDistance * (Eg - 1) : this.scaledDistance) * Tg;
    if (this.layoutVertexArray.emplaceBack((e51 << 1) + +!!i2, (t2 << 1) + +!!a2, Math.round(63 * n2) + 128, Math.round(63 * r2) + 128, (o2 === 0 ? 0 : o2 < 0 ? -1 : 1) + 1 | (c2 & 63) << 2, c2 >> 6), this.lineClips) {
      let e52 = (this.scaledDistance - this.lineClips.start) / (this.lineClips.end - this.lineClips.start);
      this.layoutVertexArray2.emplaceBack(e52, this.lineClipsArray.length);
    }
    let l2 = s2.vertexLength++;
    this.e1 >= 0 && this.e2 >= 0 && (this.indexArray.emplaceBack(this.e1, l2, this.e2), s2.primitiveLength++), a2 ? this.e2 = l2 : this.e1 = l2;
  }
  updateScaledDistance() {
    this.scaledDistance = this.lineClips ? this.lineClips.start + (this.lineClips.end - this.lineClips.start) * this.distance / this.totalDistance : this.distance;
  }
  updateDistance(e51, t2) {
    this.distance += e51.dist(t2), this.updateScaledDistance();
  }
  hasLineDasharray(e51) {
    for (let t2 of e51) {
      let e52 = t2.paint.get(`line-dasharray`);
      if (e52 && !e52.isConstant()) return true;
    }
    return false;
  }
  addLineDashDependencies(e51, t2, n2, r2) {
    for (let i2 of e51) {
      let e52 = i2.paint.get(`line-dasharray`);
      if (!e52 || e52.value.kind === `constant`) continue;
      let a2 = i2.layout.get(`line-cap`).evaluate(t2, {}) === `round`, o2 = { dasharray: e52.value.evaluate({ zoom: n2 - 1 }, t2, {}), round: a2 }, s2 = { dasharray: e52.value.evaluate({ zoom: n2 }, t2, {}), round: a2 }, c2 = { dasharray: e52.value.evaluate({ zoom: n2 + 1 }, t2, {}), round: a2 }, l2 = `${o2.dasharray.join(`,`)},${o2.round}`, u2 = `${s2.dasharray.join(`,`)},${s2.round}`, d2 = `${c2.dasharray.join(`,`)},${c2.round}`;
      r2.dashDependencies[l2] = o2, r2.dashDependencies[u2] = s2, r2.dashDependencies[d2] = c2, t2.dashes[i2.id] = { min: l2, mid: u2, max: d2 };
    }
  }
};
U(`LineBucket`, Dg, { omit: [`layers`, `patternFeatures`] });
var Og;
var kg = () => Og ||= new _l({ "line-cap": new K(M.layout_line[`line-cap`], `line-cap`), "line-join": new K(M.layout_line[`line-join`], `line-join`), "line-miter-limit": new K(M.layout_line[`line-miter-limit`], `line-miter-limit`), "line-round-limit": new K(M.layout_line[`line-round-limit`], `line-round-limit`), "line-sort-key": new K(M.layout_line[`line-sort-key`], `line-sort-key`) });
var Ag;
var jg = () => Ag ||= new _l({ "line-opacity": new K(M.paint_line[`line-opacity`], `line-opacity`), "line-layer-opacity": new G(M.paint_line[`line-layer-opacity`], `line-layer-opacity`), "line-color": new K(M.paint_line[`line-color`], `line-color`), "line-translate": new G(M.paint_line[`line-translate`], `line-translate`), "line-translate-anchor": new G(M.paint_line[`line-translate-anchor`], `line-translate-anchor`), "line-width": new K(M.paint_line[`line-width`], `line-width`), "line-gap-width": new K(M.paint_line[`line-gap-width`], `line-gap-width`), "line-offset": new K(M.paint_line[`line-offset`], `line-offset`), "line-blur": new K(M.paint_line[`line-blur`], `line-blur`), "line-dasharray": new ml(M.paint_line[`line-dasharray`], `line-dasharray`), "line-pattern": new ml(M.paint_line[`line-pattern`], `line-pattern`), "line-gradient": new gl(M.paint_line[`line-gradient`], `line-gradient`) });
var Mg = { get paint() {
  return jg();
}, get layout() {
  return kg();
} };
var Ng = class extends K {
  possiblyEvaluate(e51, t2) {
    return t2 = new W(Math.floor(t2.zoom), { now: t2.now, fadeDuration: t2.fadeDuration, zoomHistory: t2.zoomHistory, transition: t2.transition }), super.possiblyEvaluate(e51, t2);
  }
  evaluate(e51, t2, n2, r2) {
    return t2 = St({}, t2, { zoom: Math.floor(t2.zoom) }), super.evaluate(e51, t2, n2, r2);
  }
};
var Pg;
var Ig = class extends bl {
  constructor(e51, t2) {
    super(e51, Mg, t2), this.gradientVersion = 0, Pg || (Pg = new Ng(Mg.paint.properties[`line-width`].specification, `line-floorwidth`), Pg.useIntegerZoom = true);
  }
  _handleSpecialPaintPropertyUpdate(e51) {
    if (e51 === `line-gradient`) {
      let e52 = this.gradientExpression();
      this.stepInterpolant = qo(e52) ? e52._styleExpression.expression instanceof wi : false, this.gradientVersion = (this.gradientVersion + 1) % (2 ** 53 - 1);
    }
  }
  gradientExpression() {
    return this._transitionablePaint._values[`line-gradient`].value.expression;
  }
  recalculate(e51, t2) {
    super.recalculate(e51, t2), this.paint._values[`line-floorwidth`] = Pg.possiblyEvaluate(this._transitioningPaint._values[`line-width`].value, e51);
  }
  createBucket(e51) {
    return new Dg(e51);
  }
  queryRadius(e51) {
    let t2 = e51, n2 = Lg(Fd(`line-width`, this, t2), Fd(`line-gap-width`, this, t2)), r2 = Fd(`line-offset`, this, t2);
    return n2 / 2 + Math.abs(r2) + Id(this.paint.get(`line-translate`));
  }
  queryIntersectsFeature({ queryGeometry: e51, feature: t2, featureState: n2, geometry: r2, transform: i2, pixelsToTileUnits: a2 }) {
    let o2 = Ld(e51, this.paint.get(`line-translate`), this.paint.get(`line-translate-anchor`), -i2.bearingInRadians, a2), s2 = a2 / 2 * Lg(this.paint.get(`line-width`).evaluate(t2, n2), this.paint.get(`line-gap-width`).evaluate(t2, n2)), c2 = this.paint.get(`line-offset`).evaluate(t2, n2);
    return c2 && (r2 = zd(r2, c2 * a2)), Td(o2, r2, s2);
  }
  isTileClipped() {
    return true;
  }
};
function Lg(e51, t2) {
  return t2 > 0 ? t2 + 2 * e51 : e51;
}
var Rg = J([{ name: `a_pos_offset`, components: 4, type: `Int16` }, { name: `a_data`, components: 4, type: `Uint16` }, { name: `a_pixeloffset`, components: 4, type: `Int16` }], 4);
var zg = J([{ name: `a_projected_pos`, components: 3, type: `Float32` }], 4);
J([{ name: `a_fade_opacity`, components: 1, type: `Uint32` }], 4);
var Bg = J([{ name: `a_placed`, components: 2, type: `Uint8` }, { name: `a_shift`, components: 2, type: `Float32` }, { name: `a_box_real`, components: 2, type: `Int16` }]);
J([{ type: `Int16`, name: `anchorPointX` }, { type: `Int16`, name: `anchorPointY` }, { type: `Int16`, name: `x1` }, { type: `Int16`, name: `y1` }, { type: `Int16`, name: `x2` }, { type: `Int16`, name: `y2` }, { type: `Uint32`, name: `featureIndex` }, { type: `Uint16`, name: `sourceLayerIndex` }, { type: `Uint16`, name: `bucketIndex` }]);
var Vg = J([{ name: `a_pos`, components: 2, type: `Int16` }, { name: `a_anchor_pos`, components: 2, type: `Int16` }, { name: `a_extrude`, components: 2, type: `Int16` }], 4);
var Hg = J([{ name: `a_pos`, components: 2, type: `Float32` }, { name: `a_radius`, components: 1, type: `Float32` }, { name: `a_flags`, components: 2, type: `Int16` }], 4);
J([{ name: `triangle`, components: 3, type: `Uint16` }]), J([{ type: `Int16`, name: `anchorX` }, { type: `Int16`, name: `anchorY` }, { type: `Uint16`, name: `glyphStartIndex` }, { type: `Uint16`, name: `numGlyphs` }, { type: `Uint32`, name: `vertexStartIndex` }, { type: `Uint32`, name: `lineStartIndex` }, { type: `Uint32`, name: `lineLength` }, { type: `Uint16`, name: `segment` }, { type: `Uint16`, name: `lowerSize` }, { type: `Uint16`, name: `upperSize` }, { type: `Float32`, name: `lineOffsetX` }, { type: `Float32`, name: `lineOffsetY` }, { type: `Uint8`, name: `writingMode` }, { type: `Uint8`, name: `placedOrientation` }, { type: `Uint8`, name: `hidden` }, { type: `Uint32`, name: `crossTileID` }, { type: `Int16`, name: `associatedIconIndex` }]), J([{ type: `Int16`, name: `anchorX` }, { type: `Int16`, name: `anchorY` }, { type: `Int16`, name: `rightJustifiedTextSymbolIndex` }, { type: `Int16`, name: `centerJustifiedTextSymbolIndex` }, { type: `Int16`, name: `leftJustifiedTextSymbolIndex` }, { type: `Int16`, name: `verticalPlacedTextSymbolIndex` }, { type: `Int16`, name: `placedIconSymbolIndex` }, { type: `Int16`, name: `verticalPlacedIconSymbolIndex` }, { type: `Uint16`, name: `key` }, { type: `Uint16`, name: `textBoxStartIndex` }, { type: `Uint16`, name: `textBoxEndIndex` }, { type: `Uint16`, name: `verticalTextBoxStartIndex` }, { type: `Uint16`, name: `verticalTextBoxEndIndex` }, { type: `Uint16`, name: `iconBoxStartIndex` }, { type: `Uint16`, name: `iconBoxEndIndex` }, { type: `Uint16`, name: `verticalIconBoxStartIndex` }, { type: `Uint16`, name: `verticalIconBoxEndIndex` }, { type: `Uint16`, name: `featureIndex` }, { type: `Uint16`, name: `numHorizontalGlyphVertices` }, { type: `Uint16`, name: `numVerticalGlyphVertices` }, { type: `Uint16`, name: `numIconVertices` }, { type: `Uint16`, name: `numVerticalIconVertices` }, { type: `Uint16`, name: `useRuntimeCollisionCircles` }, { type: `Uint32`, name: `crossTileID` }, { type: `Float32`, name: `textBoxScale` }, { type: `Float32`, name: `collisionCircleDiameter` }, { type: `Uint16`, name: `textAnchorOffsetStartIndex` }, { type: `Uint16`, name: `textAnchorOffsetEndIndex` }]), J([{ type: `Float32`, name: `offsetX` }]), J([{ type: `Int16`, name: `x` }, { type: `Int16`, name: `y` }, { type: `Int16`, name: `tileUnitDistanceFromAnchor` }]), J([{ type: `Uint16`, name: `textAnchor` }, { type: `Float32`, components: 2, name: `textOffset` }]);
function Ug(e51, t2, n2) {
  let r2 = t2.layout.get(`text-transform`).evaluate(n2, {});
  return r2 === `uppercase` ? e51 = e51.toLocaleUpperCase() : r2 === `lowercase` && (e51 = e51.toLocaleLowerCase()), tl.applyArabicShaping && (e51 = tl.applyArabicShaping(e51)), e51;
}
function Wg(e51, t2, n2) {
  for (let r2 of e51.sections) r2.text = Ug(r2.text, t2, n2);
  return e51;
}
function Gg(e51) {
  let t2 = {}, n2 = {}, r2 = [], i2 = 0;
  function a2(t3) {
    r2.push(e51[t3]), i2++;
  }
  function o2(e52, t3, i3) {
    let a3 = n2[e52];
    return delete n2[e52], n2[t3] = a3, r2[a3].geometry[0].pop(), r2[a3].geometry[0] = r2[a3].geometry[0].concat(i3[0]), a3;
  }
  function s2(e52, n3, i3) {
    let a3 = t2[n3];
    return delete t2[n3], t2[e52] = a3, r2[a3].geometry[0].shift(), r2[a3].geometry[0] = i3[0].concat(r2[a3].geometry[0]), a3;
  }
  function c2(e52, t3, n3) {
    let r3 = n3 ? t3[0][t3[0].length - 1] : t3[0][0];
    return `${e52}:${r3.x}:${r3.y}`;
  }
  for (let l2 = 0; l2 < e51.length; l2++) {
    let u2 = e51[l2], d2 = u2.geometry, f2 = u2.text ? u2.text.toString() : null;
    if (!f2) {
      a2(l2);
      continue;
    }
    let p2 = c2(f2, d2), m2 = c2(f2, d2, true);
    if (p2 in n2 && m2 in t2 && n2[p2] !== t2[m2]) {
      let e52 = s2(p2, m2, d2), i3 = o2(p2, m2, r2[e52].geometry);
      delete t2[p2], delete n2[m2], n2[c2(f2, r2[i3].geometry, true)] = i3, r2[e52].geometry = null;
    } else p2 in n2 ? o2(p2, m2, d2) : m2 in t2 ? s2(p2, m2, d2) : (a2(l2), t2[p2] = i2 - 1, n2[m2] = i2 - 1);
  }
  return r2.filter((e52) => e52.geometry);
}
var Kg = { "!": `\uFE15`, "#": `\uFF03`, $: `\uFF04`, "%": `\uFF05`, "&": `\uFF06`, "(": `\uFE35`, ")": `\uFE36`, "*": `\uFF0A`, "+": `\uFF0B`, ",": `\uFE10`, "-": `\uFE32`, ".": `\u30FB`, "/": `\uFF0F`, ":": `\uFE13`, ";": `\uFE14`, "<": `\uFE3F`, "=": `\uFF1D`, ">": `\uFE40`, "?": `\uFE16`, "@": `\uFF20`, "[": `\uFE47`, "\\": `\uFF3C`, "]": `\uFE48`, "^": `\uFF3E`, _: `\uFE33`, "`": `\uFF40`, "{": `\uFE37`, "|": `\u2015`, "}": `\uFE38`, "~": `\uFF5E`, "\xA2": `\uFFE0`, "\xA3": `\uFFE1`, "\xA5": `\uFFE5`, "\xA6": `\uFFE4`, "\xAC": `\uFFE2`, "\xAF": `\uFFE3`, "\u2013": `\uFE32`, "\u2014": `\uFE31`, "\u2018": `\uFE43`, "\u2019": `\uFE44`, "\u201C": `\uFE41`, "\u201D": `\uFE42`, "\u2026": `\uFE19`, "\u22EF": `\uFE19`, "\u2027": `\u30FB`, "\u20A9": `\uFFE6`, "\u3001": `\uFE11`, "\u3002": `\uFE12`, "\u3008": `\uFE3F`, "\u3009": `\uFE40`, "\u300A": `\uFE3D`, "\u300B": `\uFE3E`, "\u300C": `\uFE41`, "\u300D": `\uFE42`, "\u300E": `\uFE43`, "\u300F": `\uFE44`, "\u3010": `\uFE3B`, "\u3011": `\uFE3C`, "\u3014": `\uFE39`, "\u3015": `\uFE3A`, "\u3016": `\uFE17`, "\u3017": `\uFE18`, "\uFF01": `\uFE15`, "\uFF08": `\uFE35`, "\uFF09": `\uFE36`, "\uFF0C": `\uFE10`, "\uFF0D": `\uFE32`, "\uFF0E": `\u30FB`, "\uFF1A": `\uFE13`, "\uFF1B": `\uFE14`, "\uFF1C": `\uFE3F`, "\uFF1E": `\uFE40`, "\uFF1F": `\uFE16`, "\uFF3B": `\uFE47`, "\uFF3D": `\uFE48`, "\uFF3F": `\uFE33`, "\uFF5B": `\uFE37`, "\uFF5C": `\u2015`, "\uFF5D": `\uFE38`, "\uFF5F": `\uFE35`, "\uFF60": `\uFE36`, "\uFF61": `\uFE12`, "\uFF62": `\uFE41`, "\uFF63": `\uFE42` };
function qg(e51) {
  let t2 = ``, n2 = { premature: true, value: void 0 }, r2 = e51[Symbol.iterator](), i2 = r2.next(), a2 = e51[Symbol.iterator]();
  a2.next();
  let o2 = a2.next();
  for (; !i2.done; ) (o2.done || !Jc(o2.value.codePointAt(0)) || Kg[o2.value]) && (n2.premature || !Jc(n2.value.codePointAt(0)) || Kg[n2.value]) && Kg[i2.value] ? t2 += Kg[i2.value] : t2 += i2.value, n2 = { value: i2.value, premature: false }, i2 = r2.next(), o2 = a2.next();
  return t2;
}
var Jg = { 10: true, 32: true, 38: true, 41: true, 43: true, 45: true, 47: true, 173: true, 183: true, 8203: true, 8208: true, 8211: true, 8231: true };
var Yg = { 40: true };
function Xg(e51, t2, n2, r2, i2, a2) {
  if (`fontStack` in t2) {
    let r3 = n2[t2.fontStack]?.[e51];
    return r3 ? r3.metrics.advance * t2.scale + i2 : 0;
  }
  {
    let e52 = r2[t2.imageName];
    return e52 ? e52.displaySize[0] * t2.scale * 24 / a2 + i2 : 0;
  }
}
function Zg(e51, t2, n2, r2) {
  let i2 = (e51 - t2) ** 2;
  return r2 ? e51 < t2 ? i2 / 2 : i2 * 2 : i2 + Math.abs(n2) * n2;
}
function Qg(e51, t2, n2) {
  let r2 = 0;
  return e51 === 10 && (r2 -= 1e4), n2 && (r2 += 150), (e51 === 40 || e51 === 65288) && (r2 += 50), (t2 === 41 || t2 === 65289) && (r2 += 50), r2;
}
function $g(e51, t2, n2, r2, i2, a2) {
  let o2 = null, s2 = Zg(t2, n2, i2, a2);
  for (let e52 of r2) {
    let r3 = Zg(t2 - e52.x, n2, i2, a2) + e52.badness;
    r3 <= s2 && (o2 = e52, s2 = r3);
  }
  return { index: e51, x: t2, priorBreak: o2, badness: s2 };
}
function e_(e51) {
  return e51 ? e_(e51.priorBreak).concat(e51.index) : [];
}
var t_ = class e47 {
  constructor(e51 = ``, t2 = [], n2 = []) {
    this.text = e51, this.sections = t2, this.sectionIndex = n2, this.imageSectionID = null;
  }
  static fromFeature(t2, n2) {
    let r2 = new e47();
    for (let e51 of t2.sections) e51.image ? r2.addImageSection(e51) : r2.addTextSection(e51, n2);
    return r2;
  }
  length() {
    return [...this.text].length;
  }
  getSection(e51) {
    return this.sections[this.sectionIndex[e51]];
  }
  getSectionIndex(e51) {
    return this.sectionIndex[e51];
  }
  verticalizePunctuation() {
    this.text = qg(this.text);
  }
  hasZeroWidthSpaces() {
    return this.text.includes(`\u200B`);
  }
  trim() {
    let e51 = this.text.match(/^\s*/), t2 = e51 ? e51[0].length : 0, n2 = this.text.match(/\S\s*$/), r2 = n2 ? n2[0].length - 1 : 0;
    this.text = this.text.substring(t2, this.text.length - r2), this.sectionIndex = this.sectionIndex.slice(t2, this.sectionIndex.length - r2);
  }
  substring(t2, n2) {
    let r2 = [...this.text].slice(t2, n2).join(``), i2 = this.sectionIndex.slice(t2, n2);
    return new e47(r2, this.sections, i2);
  }
  toCodeUnitIndex(e51) {
    return [...this.text].slice(0, e51).join(``).length;
  }
  toString() {
    return this.text;
  }
  getMaxScale() {
    return this.sectionIndex.reduce((e51, t2) => Math.max(e51, this.sections[t2].scale), 0);
  }
  getMaxImageSize(e51) {
    let t2 = 0, n2 = 0;
    for (let r2 = 0; r2 < this.length(); r2++) {
      let i2 = this.getSection(r2);
      if (`imageName` in i2) {
        let r3 = e51[i2.imageName];
        if (!r3) continue;
        let a2 = r3.displaySize;
        t2 = Math.max(t2, a2[0]), n2 = Math.max(n2, a2[1]);
      }
    }
    return { maxImageWidth: t2, maxImageHeight: n2 };
  }
  addTextSection(e51, t2) {
    this.text += e51.text, this.sections.push({ scale: e51.scale || 1, verticalAlign: e51.verticalAlign || `bottom`, fontStack: e51.fontStack || t2 });
    let n2 = this.sections.length - 1;
    this.sectionIndex.push(...[...e51.text].map(() => n2));
  }
  addImageSection(e51) {
    let t2 = e51.image ? e51.image.name : ``;
    if (t2.length === 0) {
      It(`Can't add FormattedSection with an empty image.`);
      return;
    }
    let n2 = this.getNextImageSectionCharCode();
    if (!n2) {
      It(`Reached maximum number of images 6401`);
      return;
    }
    this.text += String.fromCharCode(n2), this.sections.push({ scale: 1, verticalAlign: e51.verticalAlign || `bottom`, imageName: t2 }), this.sectionIndex.push(this.sections.length - 1);
  }
  getNextImageSectionCharCode() {
    return this.imageSectionID ? this.imageSectionID >= 63743 ? null : ++this.imageSectionID : (this.imageSectionID = 57344, this.imageSectionID);
  }
  determineLineBreaks(e51, t2, n2, r2, i2) {
    let a2 = [], o2 = this.determineAverageLineWidth(e51, t2, n2, r2, i2), s2 = this.hasZeroWidthSpaces(), c2 = 0, l2 = 0, u2 = this.text[Symbol.iterator](), d2 = u2.next(), f2 = this.text[Symbol.iterator]();
    f2.next();
    let p2 = f2.next(), m2 = this.text[Symbol.iterator]();
    m2.next(), m2.next();
    let h2 = m2.next();
    for (; !d2.done; ) {
      let t3 = this.getSection(l2), g2 = d2.value.codePointAt(0);
      if (Hc(g2) || (c2 += Xg(g2, t3, n2, r2, e51, i2)), !p2.done) {
        let e52 = Rc(g2), n3 = p2.value.codePointAt(0);
        (Jg[g2] || e52 || `imageName` in t3 || !h2.done && Yg[n3]) && a2.push($g(l2 + 1, c2, o2, a2, Qg(g2, n3, e52 && s2), false));
      }
      l2++, d2 = u2.next(), p2 = f2.next(), h2 = m2.next();
    }
    return e_($g(this.length(), c2, o2, a2, 0, true));
  }
  determineAverageLineWidth(e51, t2, n2, r2, i2) {
    let a2 = 0, o2 = 0;
    for (let t3 of this.text) {
      let s3 = this.getSection(o2);
      a2 += Xg(t3.codePointAt(0), s3, n2, r2, e51, i2), o2++;
    }
    let s2 = Math.max(1, Math.ceil(a2 / t2));
    return a2 / s2;
  }
};
var n_ = 4294967296;
var r_ = 1 / n_;
var i_ = typeof TextDecoder > `u` ? null : new TextDecoder(`utf-8`);
var a_ = class {
  constructor(e51) {
    this.buf = ArrayBuffer.isView(e51) ? e51 : new Uint8Array(e51), this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength), this.pos = 0, this.type = 0, this._valueStart = -1, this.length = this.buf.length;
  }
  readFields(e51, t2, n2 = this.length) {
    let r2;
    for (; r2 = this.nextField(n2); ) e51(r2, t2, this);
    return t2;
  }
  readMessage(e51, t2) {
    return this.readFields(e51, t2, this.readVarint() + this.pos);
  }
  readFixed32() {
    let e51 = this.dataView.getUint32(this.pos, true);
    return this.pos += 4, e51;
  }
  readSFixed32() {
    let e51 = this.dataView.getInt32(this.pos, true);
    return this.pos += 4, e51;
  }
  readFixed64() {
    let e51 = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * n_;
    return this.pos += 8, e51;
  }
  readSFixed64() {
    let e51 = this.dataView.getUint32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * n_;
    return this.pos += 8, e51;
  }
  readFloat() {
    let e51 = this.dataView.getFloat32(this.pos, true);
    return this.pos += 4, e51;
  }
  readDouble() {
    let e51 = this.dataView.getFloat64(this.pos, true);
    return this.pos += 8, e51;
  }
  readVarint(e51) {
    let t2 = this.buf, n2 = t2[this.pos++];
    if (n2 < 128) return n2;
    let r2 = n2 & 127, i2;
    return i2 = t2[this.pos++], r2 |= (i2 & 127) << 7, i2 < 128 || (i2 = t2[this.pos++], r2 |= (i2 & 127) << 14, i2 < 128) || (i2 = t2[this.pos++], r2 |= (i2 & 127) << 21, i2 < 128) ? r2 : (i2 = t2[this.pos], r2 |= (i2 & 15) << 28, s_(r2, e51, this));
  }
  readSVarint() {
    let e51 = this.readVarint();
    return e51 % 2 == 1 ? (e51 + 1) / -2 : e51 / 2;
  }
  readBoolean() {
    return !!this.readVarint();
  }
  readString() {
    let e51 = this.readVarint() + this.pos, t2 = this.pos;
    return this.pos = e51, e51 - t2 >= 12 && i_ ? i_.decode(this.buf.subarray(t2, e51)) : S_(this.buf, t2, e51);
  }
  readBytes() {
    let e51 = this.readVarint() + this.pos, t2 = this.buf.subarray(this.pos, e51);
    return this.pos = e51, t2;
  }
  readPackedVarint(e51 = [], t2) {
    let n2 = this.readPackedEnd();
    for (; this.pos < n2; ) e51.push(this.readVarint(t2));
    return e51;
  }
  readPackedSVarint(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readSVarint());
    return e51;
  }
  readPackedBoolean(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readBoolean());
    return e51;
  }
  readPackedFloat(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readFloat());
    return e51;
  }
  readPackedDouble(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readDouble());
    return e51;
  }
  readPackedFixed32(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readFixed32());
    return e51;
  }
  readPackedSFixed32(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readSFixed32());
    return e51;
  }
  readPackedFixed64(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readFixed64());
    return e51;
  }
  readPackedSFixed64(e51 = []) {
    let t2 = this.readPackedEnd();
    for (; this.pos < t2; ) e51.push(this.readSFixed64());
    return e51;
  }
  readPackedEnd() {
    return this.type === 2 ? this.readVarint() + this.pos : this.pos + 1;
  }
  nextField(e51 = this.length) {
    if (this.pos === this._valueStart && this.skip(this.type), this.pos >= e51) return 0;
    let t2 = this.readVarint();
    return this.type = t2 & 7, this._valueStart = this.pos, t2 >>> 3;
  }
  skip(e51) {
    let t2 = e51 & 7;
    if (t2 === 0) for (; this.buf[this.pos++] > 127; ) ;
    else if (t2 === 2) this.pos = this.readVarint() + this.pos;
    else if (t2 === 5) this.pos += 4;
    else if (t2 === 1) this.pos += 8;
    else throw Error(`Unimplemented type: ${t2}`);
  }
};
var o_ = class {
  constructor(e51 = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(e51) ? e51 : new Uint8Array(e51), this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength), this.pos = 0, this.length = this.buf.length;
  }
  writeTag(e51, t2) {
    this.writeVarint(e51 << 3 | t2);
  }
  realloc(e51) {
    let t2 = this.length || 16;
    for (; t2 < this.pos + e51; ) t2 *= 2;
    if (t2 !== this.length) {
      let e52 = new Uint8Array(t2);
      e52.set(this.buf), this.buf = e52, this.dataView = new DataView(e52.buffer), this.length = t2;
    }
  }
  finish() {
    return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length);
  }
  writeFixed32(e51) {
    this.realloc(4), this.dataView.setInt32(this.pos, e51, true), this.pos += 4;
  }
  writeSFixed32(e51) {
    this.realloc(4), this.dataView.setInt32(this.pos, e51, true), this.pos += 4;
  }
  writeFixed64(e51) {
    this.realloc(8), this.dataView.setInt32(this.pos, e51 & -1, true), this.dataView.setInt32(this.pos + 4, Math.floor(e51 * r_), true), this.pos += 8;
  }
  writeSFixed64(e51) {
    this.realloc(8), this.dataView.setInt32(this.pos, e51 & -1, true), this.dataView.setInt32(this.pos + 4, Math.floor(e51 * r_), true), this.pos += 8;
  }
  writeVarint(e51) {
    if (e51 = +e51 || 0, e51 >= 0 && e51 < 128) {
      this.pos >= this.length && this.realloc(1), this.buf[this.pos++] = e51;
      return;
    }
    if (e51 > 268435455 || e51 < 0) {
      l_(e51, this);
      return;
    }
    this.realloc(4), this.buf[this.pos++] = e51 & 127 | (e51 > 127 ? 128 : 0), !(e51 <= 127) && (this.buf[this.pos++] = (e51 >>>= 7) & 127 | (e51 > 127 ? 128 : 0), !(e51 <= 127) && (this.buf[this.pos++] = (e51 >>>= 7) & 127 | (e51 > 127 ? 128 : 0), !(e51 <= 127) && (this.buf[this.pos++] = e51 >>> 7 & 127)));
  }
  writeSVarint(e51) {
    this.writeVarint(e51 < 0 ? -e51 * 2 - 1 : e51 * 2);
  }
  writeBoolean(e51) {
    this.writeVarint(+e51);
  }
  writeString(e51) {
    e51 = String(e51), this.realloc(e51.length * 4), this.pos++;
    let t2 = this.pos;
    this.pos = C_(this.buf, e51, this.pos);
    let n2 = this.pos - t2;
    n2 >= 128 && f_(t2, n2, this), this.pos = t2 - 1, this.writeVarint(n2), this.pos += n2;
  }
  writeFloat(e51) {
    this.realloc(4), this.dataView.setFloat32(this.pos, e51, true), this.pos += 4;
  }
  writeDouble(e51) {
    this.realloc(8), this.dataView.setFloat64(this.pos, e51, true), this.pos += 8;
  }
  writeBytes(e51) {
    let t2 = e51.length;
    this.writeVarint(t2), this.realloc(t2), this.buf.set(e51, this.pos), this.pos += t2;
  }
  writeRawMessage(e51, t2) {
    this.pos++;
    let n2 = this.pos;
    e51(t2, this);
    let r2 = this.pos - n2;
    r2 >= 128 && f_(n2, r2, this), this.pos = n2 - 1, this.writeVarint(r2), this.pos += r2;
  }
  writeMessage(e51, t2, n2) {
    this.writeTag(e51, 2), this.writeRawMessage(t2, n2);
  }
  writePackedVarint(e51, t2) {
    t2.length && this.writeMessage(e51, p_, t2);
  }
  writePackedSVarint(e51, t2) {
    t2.length && this.writeMessage(e51, m_, t2);
  }
  writePackedBoolean(e51, t2) {
    t2.length && this.writeMessage(e51, __, t2);
  }
  writePackedFloat(e51, t2) {
    t2.length && this.writeMessage(e51, h_, t2);
  }
  writePackedDouble(e51, t2) {
    t2.length && this.writeMessage(e51, g_, t2);
  }
  writePackedFixed32(e51, t2) {
    t2.length && this.writeMessage(e51, v_, t2);
  }
  writePackedSFixed32(e51, t2) {
    t2.length && this.writeMessage(e51, y_, t2);
  }
  writePackedFixed64(e51, t2) {
    t2.length && this.writeMessage(e51, b_, t2);
  }
  writePackedSFixed64(e51, t2) {
    t2.length && this.writeMessage(e51, x_, t2);
  }
  writeBytesField(e51, t2) {
    this.writeTag(e51, 2), this.writeBytes(t2);
  }
  writeFixed32Field(e51, t2) {
    this.writeTag(e51, 5), this.writeFixed32(t2);
  }
  writeSFixed32Field(e51, t2) {
    this.writeTag(e51, 5), this.writeSFixed32(t2);
  }
  writeFixed64Field(e51, t2) {
    this.writeTag(e51, 1), this.writeFixed64(t2);
  }
  writeSFixed64Field(e51, t2) {
    this.writeTag(e51, 1), this.writeSFixed64(t2);
  }
  writeVarintField(e51, t2) {
    this.writeTag(e51, 0), this.writeVarint(t2);
  }
  writeSVarintField(e51, t2) {
    this.writeTag(e51, 0), this.writeSVarint(t2);
  }
  writeStringField(e51, t2) {
    this.writeTag(e51, 2), this.writeString(t2);
  }
  writeFloatField(e51, t2) {
    this.writeTag(e51, 5), this.writeFloat(t2);
  }
  writeDoubleField(e51, t2) {
    this.writeTag(e51, 1), this.writeDouble(t2);
  }
  writeBooleanField(e51, t2) {
    this.writeVarintField(e51, +t2);
  }
};
function s_(e51, t2, n2) {
  let r2 = n2.buf, i2, a2;
  if (a2 = r2[n2.pos++], i2 = (a2 & 112) >> 4, a2 < 128 || (a2 = r2[n2.pos++], i2 |= (a2 & 127) << 3, a2 < 128) || (a2 = r2[n2.pos++], i2 |= (a2 & 127) << 10, a2 < 128) || (a2 = r2[n2.pos++], i2 |= (a2 & 127) << 17, a2 < 128) || (a2 = r2[n2.pos++], i2 |= (a2 & 127) << 24, a2 < 128) || (a2 = r2[n2.pos++], i2 |= (a2 & 1) << 31, a2 < 128)) return c_(e51, i2, t2);
  throw Error(`Expected varint not more than 10 bytes`);
}
function c_(e51, t2, n2) {
  return n2 ? t2 * 4294967296 + (e51 >>> 0) : (t2 >>> 0) * 4294967296 + (e51 >>> 0);
}
function l_(e51, t2) {
  let n2, r2;
  if (e51 >= 0 ? (n2 = e51 % 4294967296 | 0, r2 = e51 / 4294967296 | 0) : (n2 = ~(-e51 % 4294967296), r2 = ~(-e51 / 4294967296), n2 ^ 4294967295 ? n2 = n2 + 1 | 0 : (n2 = 0, r2 = r2 + 1 | 0)), e51 >= 18446744073709552e3 || e51 < -18446744073709552e3) throw Error(`Given varint doesn't fit into 10 bytes`);
  t2.realloc(10), u_(n2, r2, t2), d_(r2, t2);
}
function u_(e51, t2, n2) {
  n2.buf[n2.pos++] = e51 & 127 | 128, e51 >>>= 7, n2.buf[n2.pos++] = e51 & 127 | 128, e51 >>>= 7, n2.buf[n2.pos++] = e51 & 127 | 128, e51 >>>= 7, n2.buf[n2.pos++] = e51 & 127 | 128, e51 >>>= 7, n2.buf[n2.pos] = e51 & 127;
}
function d_(e51, t2) {
  let n2 = (e51 & 7) << 4;
  t2.buf[t2.pos++] |= n2 | ((e51 >>>= 3) ? 128 : 0), e51 && (t2.buf[t2.pos++] = e51 & 127 | ((e51 >>>= 7) ? 128 : 0), e51 && (t2.buf[t2.pos++] = e51 & 127 | ((e51 >>>= 7) ? 128 : 0), e51 && (t2.buf[t2.pos++] = e51 & 127 | ((e51 >>>= 7) ? 128 : 0), e51 && (t2.buf[t2.pos++] = e51 & 127 | ((e51 >>>= 7) ? 128 : 0), e51 && (t2.buf[t2.pos++] = e51 & 127)))));
}
function f_(e51, t2, n2) {
  let r2 = t2 <= 16383 ? 1 : t2 <= 2097151 ? 2 : t2 <= 268435455 ? 3 : Math.floor(Math.log(t2) / (Math.LN2 * 7));
  n2.realloc(r2), n2.buf.copyWithin(e51 + r2, e51, n2.pos);
}
function p_(e51, t2) {
  let n2 = e51.length, r2 = t2.buf, i2 = t2.pos, a2 = t2.length;
  for (let o2 = 0; o2 < n2; o2++) {
    let n3 = e51[o2];
    if (n3 < 0 || i2 + 10 > a2) {
      t2.pos = i2, t2.writeVarint(n3), r2 = t2.buf, i2 = t2.pos, a2 = t2.length;
      continue;
    }
    for (; n3 > 127; ) r2[i2++] = n3 % 128 | 128, n3 = Math.floor(n3 / 128);
    r2[i2++] = n3;
  }
  t2.pos = i2;
}
function m_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeSVarint(e51[n2]);
}
function h_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeFloat(e51[n2]);
}
function g_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeDouble(e51[n2]);
}
function __(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeBoolean(e51[n2]);
}
function v_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeFixed32(e51[n2]);
}
function y_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeSFixed32(e51[n2]);
}
function b_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeFixed64(e51[n2]);
}
function x_(e51, t2) {
  for (let n2 = 0; n2 < e51.length; n2++) t2.writeSFixed64(e51[n2]);
}
function S_(e51, t2, n2) {
  let r2 = ``, i2 = t2;
  for (; i2 < n2; ) {
    let t3 = e51[i2], a2 = null, o2 = t3 > 239 ? 4 : t3 > 223 ? 3 : t3 > 191 ? 2 : 1;
    if (i2 + o2 > n2) break;
    let s2, c2, l2;
    o2 === 1 ? t3 < 128 && (a2 = t3) : o2 === 2 ? (s2 = e51[i2 + 1], (s2 & 192) == 128 && (a2 = (t3 & 31) << 6 | s2 & 63, a2 <= 127 && (a2 = null))) : o2 === 3 ? (s2 = e51[i2 + 1], c2 = e51[i2 + 2], (s2 & 192) == 128 && (c2 & 192) == 128 && (a2 = (t3 & 15) << 12 | (s2 & 63) << 6 | c2 & 63, (a2 <= 2047 || a2 >= 55296 && a2 <= 57343) && (a2 = null))) : o2 === 4 && (s2 = e51[i2 + 1], c2 = e51[i2 + 2], l2 = e51[i2 + 3], (s2 & 192) == 128 && (c2 & 192) == 128 && (l2 & 192) == 128 && (a2 = (t3 & 15) << 18 | (s2 & 63) << 12 | (c2 & 63) << 6 | l2 & 63, (a2 <= 65535 || a2 >= 1114112) && (a2 = null))), a2 === null ? (a2 = 65533, o2 = 1) : a2 > 65535 && (a2 -= 65536, r2 += String.fromCharCode(a2 >>> 10 & 1023 | 55296), a2 = 56320 | a2 & 1023), r2 += String.fromCharCode(a2), i2 += o2;
  }
  return r2;
}
function C_(e51, t2, n2) {
  for (let r2 = 0, i2, a2; r2 < t2.length; r2++) {
    if (i2 = t2.charCodeAt(r2), i2 > 55295 && i2 < 57344) {
      if (a2) {
        if (i2 < 56320) {
          e51[n2++] = 239, e51[n2++] = 191, e51[n2++] = 189, a2 = i2;
          continue;
        }
        i2 = a2 - 55296 << 10 | i2 - 56320 | 65536, a2 = null;
      } else {
        i2 > 56319 || r2 + 1 === t2.length ? (e51[n2++] = 239, e51[n2++] = 191, e51[n2++] = 189) : a2 = i2;
        continue;
      }
    } else a2 &&= (e51[n2++] = 239, e51[n2++] = 191, e51[n2++] = 189, null);
    i2 < 128 ? e51[n2++] = i2 : (i2 < 2048 ? e51[n2++] = i2 >> 6 | 192 : (i2 < 65536 ? e51[n2++] = i2 >> 12 | 224 : (e51[n2++] = i2 >> 18 | 240, e51[n2++] = i2 >> 12 & 63 | 128), e51[n2++] = i2 >> 6 & 63 | 128), e51[n2++] = i2 & 63 | 128);
  }
  return n2;
}
function O_(e51) {
  return typeof e51?.renderWithWebGL == `function`;
}
function A_(e51) {
  let t2 = 0, n2 = 0;
  for (let r3 of e51) t2 += r3.w * r3.h, n2 = Math.max(n2, r3.w);
  e51.sort((e52, t3) => t3.h - e52.h);
  let r2 = [{ x: 0, y: 0, w: Math.max(Math.ceil(Math.sqrt(t2 / 0.95)), n2), h: 1 / 0 }], i2 = 0, a2 = 0;
  for (let t3 of e51) for (let e52 = r2.length - 1; e52 >= 0; e52--) {
    let n3 = r2[e52];
    if (!(t3.w > n3.w || t3.h > n3.h)) {
      if (t3.x = n3.x, t3.y = n3.y, a2 = Math.max(a2, t3.y + t3.h), i2 = Math.max(i2, t3.x + t3.w), t3.w === n3.w && t3.h === n3.h) {
        let t4 = r2.pop();
        t4 && e52 < r2.length && (r2[e52] = t4);
      } else t3.h === n3.h ? (n3.x += t3.w, n3.w -= t3.w) : t3.w === n3.w ? (n3.y += t3.h, n3.h -= t3.h) : (r2.push({ x: n3.x + t3.w, y: n3.y, w: n3.w - t3.w, h: t3.h }), n3.y += t3.h, n3.h -= t3.h);
      break;
    }
  }
  return { w: i2, h: a2, fill: t2 / (i2 * a2) || 0 };
}
var j_ = class {
  constructor(e51, { pixelRatio: t2, version: n2, isWebGLImage: r2 = false, stretchX: i2, stretchY: a2, content: o2, textFitWidth: s2, textFitHeight: c2 }) {
    this.paddedRect = e51, this.pixelRatio = t2, this.stretchX = i2, this.stretchY = a2, this.content = o2, this.version = n2, this.needsFirstWebGLRender = r2, this.textFitWidth = s2, this.textFitHeight = c2;
  }
  get tl() {
    return [this.paddedRect.x + 1, this.paddedRect.y + 1];
  }
  get br() {
    return [this.paddedRect.x + this.paddedRect.w - 1, this.paddedRect.y + this.paddedRect.h - 1];
  }
  get tlbr() {
    return this.tl.concat(this.br);
  }
  get displaySize() {
    return [(this.paddedRect.w - 2) / this.pixelRatio, (this.paddedRect.h - 2) / this.pixelRatio];
  }
};
var M_ = class {
  constructor(e51, t2) {
    let n2 = {}, r2 = {};
    this.haveRenderCallbacks = [], this.patchedUpdateVersion = -1;
    let i2 = [];
    this.addImages(e51, n2, i2), this.addImages(t2, r2, i2);
    let { w: a2, h: o2 } = A_(i2), s2 = new lf({ width: a2 || 1, height: o2 || 1 });
    for (let t3 in e51) {
      let r3 = e51[t3];
      if (r3.isWebGLImage) continue;
      let i3 = n2[t3].paddedRect;
      lf.copy(r3.data, s2, { x: 0, y: 0 }, { x: i3.x + 1, y: i3.y + 1 }, r3.data);
    }
    for (let e52 in t2) {
      let n3 = t2[e52], i3 = r2[e52].paddedRect, a3 = i3.x + 1, o3 = i3.y + 1, c2 = n3.data.width, l2 = n3.data.height;
      lf.copy(n3.data, s2, { x: 0, y: 0 }, { x: a3, y: o3 }, n3.data), lf.copy(n3.data, s2, { x: 0, y: l2 - 1 }, { x: a3, y: o3 - 1 }, { width: c2, height: 1 }), lf.copy(n3.data, s2, { x: 0, y: 0 }, { x: a3, y: o3 + l2 }, { width: c2, height: 1 }), lf.copy(n3.data, s2, { x: c2 - 1, y: 0 }, { x: a3 - 1, y: o3 }, { width: 1, height: l2 }), lf.copy(n3.data, s2, { x: 0, y: 0 }, { x: a3 + c2, y: o3 }, { width: 1, height: l2 });
    }
    this.image = s2, this.iconPositions = n2, this.patternPositions = r2;
  }
  addImages(e51, t2, n2) {
    for (let r2 in e51) {
      let i2 = e51[r2], a2 = { x: 0, y: 0, w: i2.data.width + 2, h: i2.data.height + 2 };
      n2.push(a2), t2[r2] = new j_(a2, i2), i2.hasRenderCallback && this.haveRenderCallbacks.push(r2);
    }
  }
  patchUpdatedImages(e51, t2) {
    if (e51.dispatchRenderCallbacks(this.haveRenderCallbacks), this.patchedUpdateVersion !== e51.updateVersion) {
      this.patchedUpdateVersion = e51.updateVersion;
      for (let n2 in this.iconPositions) this.patchUpdatedImage(this.iconPositions[n2], e51.getImage(n2), t2);
      for (let n2 in this.patternPositions) this.patchUpdatedImage(this.patternPositions[n2], e51.getImage(n2), t2);
    }
  }
  patchUpdatedImage(e51, t2, n2) {
    if (!e51 || !t2 || !e51.needsFirstWebGLRender && e51.version === t2.version) return;
    e51.needsFirstWebGLRender = false, e51.version = t2.version;
    let [r2, i2] = e51.tl, a2 = t2.userImage?.data;
    if (!O_(a2)) {
      n2.update(t2.data, void 0, { x: r2, y: i2 });
      return;
    }
    let { width: o2, height: s2 } = t2.data;
    n2.context.setCustomLayerDefaults(), a2.renderWithWebGL({ gl: n2.context.gl, texture: n2.texture, x: r2, y: i2, width: o2, height: s2 }), n2.context.setDirty();
  }
};
U(`ImagePosition`, j_), U(`ImageAtlas`, M_);
var N_ = (function(e51) {
  return e51[e51.none = 0] = `none`, e51[e51.horizontal = 1] = `horizontal`, e51[e51.vertical = 2] = `vertical`, e51[e51.horizontalOnly = 3] = `horizontalOnly`, e51;
})(N_ || {});
function P_(e51) {
  for (let t2 of e51) if (t2.positionedGlyphs.length !== 0) return false;
  return true;
}
function F_(e51, t2) {
  let n2 = [], r2 = 0;
  for (let i2 of t2) n2.push(e51.substring(r2, i2)), r2 = i2;
  return r2 < e51.length() && n2.push(e51.substring(r2, e51.length())), n2;
}
function I_(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2) {
  let h2 = t_.fromFeature(e51, i2);
  d2 === 2 && h2.verticalizePunctuation();
  let g2, _ = h2.determineLineBreaks(l2, a2, t2, r2, p2), { processBidirectionalText: v, processStyledBidirectionalText: y } = tl;
  if (v && h2.sections.length === 1) {
    g2 = [], _ = _.map((e53) => h2.toCodeUnitIndex(e53));
    let e52 = v(h2.toString(), _);
    for (let t3 of e52) {
      let e53 = [...t3].map(() => 0);
      g2.push(new t_(t3, h2.sections, e53));
    }
  } else if (y) {
    g2 = [], _ = _.map((e53) => h2.toCodeUnitIndex(e53));
    let e52 = 0, t3 = [];
    for (let n4 of h2.text) t3.push(...Array(n4.length).fill(h2.sectionIndex[e52])), e52++;
    let n3 = y(h2.text, t3, _);
    for (let e53 of n3) {
      let t4 = [], n4 = ``;
      for (let r3 of e53[0]) t4.push(e53[1][n4.length]), n4 += r3;
      g2.push(new t_(e53[0], h2.sections, t4));
    }
  } else g2 = F_(h2, _);
  let b = [], x = { positionedLines: b, text: h2.toString(), top: u2[1], bottom: u2[1], left: u2[0], right: u2[0], writingMode: d2, iconsInText: false, verticalizable: false };
  return H_(x, t2, n2, r2, g2, o2, s2, c2, d2, l2, f2, m2), !P_(b) && x;
}
function L_(e51) {
  let t2 = 0.5, n2 = 0.5;
  switch (e51) {
    case `right`:
    case `top-right`:
    case `bottom-right`:
      t2 = 1;
      break;
    case `left`:
    case `top-left`:
    case `bottom-left`:
      t2 = 0;
  }
  switch (e51) {
    case `bottom`:
    case `bottom-right`:
    case `bottom-left`:
      n2 = 1;
      break;
    case `top`:
    case `top-right`:
    case `top-left`:
      n2 = 0;
  }
  return { horizontalAlign: t2, verticalAlign: n2 };
}
function R_(e51, t2, n2) {
  let r2 = t2.getMaxScale() * 24, { maxImageWidth: i2, maxImageHeight: a2 } = t2.getMaxImageSize(e51), o2 = Math.max(r2, a2 * n2);
  return { verticalLineContentWidth: Math.max(r2, i2 * n2), horizontalLineContentHeight: o2 };
}
function z_(e51) {
  switch (e51) {
    case `top`:
      return 0;
    case `center`:
      return 0.5;
    default:
      return 1;
  }
}
function B_(e51, t2, n2, r2) {
  if (e51?.rect) return e51;
  let i2 = t2[n2.fontStack]?.[r2];
  return i2 ? { rect: null, metrics: i2.metrics } : null;
}
function V_(e51, t2, n2) {
  return !(e51 === 1 || !t2 && !zc(n2) || t2 && (Hc(n2) || Yc(n2)));
}
function H_(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2) {
  let f2 = 0, p2 = 0, m2 = 0, h2 = 0, g2 = s2 === `right` ? 1 : s2 === `left` ? 0 : 0.5, _ = 24 / d2, v = 0;
  for (let o3 of i2) {
    o3.trim();
    let i3 = o3.getMaxScale(), s3 = { positionedGlyphs: [], lineOffset: 0 };
    e51.positionedLines[v] = s3;
    let d3 = s3.positionedGlyphs, y2 = 0;
    if (!o3.length()) {
      p2 += a2, ++v;
      continue;
    }
    let b2 = R_(r2, o3, _), x = 0;
    for (let a3 of o3.text) {
      let s4 = o3.getSection(x), m3 = a3.codePointAt(0), h3 = V_(c2, u2, m3), g3 = { glyph: m3, imageName: null, x: f2, y: p2 + -17, vertical: h3, scale: 1, fontStack: ``, sectionIndex: o3.getSectionIndex(x), metrics: null, rect: null }, v2;
      if (`fontStack` in s4) {
        if (v2 = U_(s4, m3, h3, b2, t2, n2), !v2) continue;
        g3.fontStack = s4.fontStack;
      } else {
        if (e51.iconsInText = true, s4.scale *= _, v2 = W_(s4, h3, i3, b2, r2), !v2) continue;
        y2 = Math.max(y2, v2.imageOffset), g3.imageName = s4.imageName;
      }
      let { rect: S2, metrics: C2, baselineOffset: w } = v2;
      if (g3.y += w, g3.scale = s4.scale, g3.metrics = C2, g3.rect = S2, d3.push(g3), !h3) f2 += C2.advance * s4.scale + l2;
      else {
        e51.verticalizable = true;
        let t3 = `imageName` in s4 ? C2.advance : 24;
        f2 += t3 * s4.scale + l2;
      }
      x++;
    }
    if (d3.length !== 0) {
      let e52 = f2 - l2;
      m2 = Math.max(e52, m2), G_(d3, 0, d3.length - 1, g2);
    }
    f2 = 0;
    let S = (i3 - 1) * 24;
    s3.lineOffset = Math.max(y2, S);
    let C = a2 * i3 + y2;
    p2 += C, h2 = Math.max(C, h2), ++v;
  }
  let { horizontalAlign: y, verticalAlign: b } = L_(o2);
  K_(e51.positionedLines, g2, y, b, m2, h2, a2, p2, i2.length), e51.top += -b * p2, e51.bottom = e51.top + p2, e51.left += -y * m2, e51.right = e51.left + m2;
}
function U_(e51, t2, n2, r2, i2, a2) {
  let o2 = a2[e51.fontStack]?.[t2], s2 = B_(o2, i2, e51, t2);
  if (s2 === null) return null;
  let c2;
  if (n2) c2 = r2.verticalLineContentWidth - e51.scale * 24;
  else {
    let t3 = z_(e51.verticalAlign);
    c2 = (r2.horizontalLineContentHeight - e51.scale * 24) * t3;
  }
  return { rect: s2.rect, metrics: s2.metrics, baselineOffset: c2 };
}
function W_(e51, t2, n2, r2, i2) {
  let a2 = i2[e51.imageName];
  if (!a2) return null;
  let o2 = a2.paddedRect, s2 = a2.displaySize, c2 = { width: s2[0], height: s2[1], left: 1, top: -3, advance: t2 ? s2[1] : s2[0] }, l2;
  if (t2) l2 = r2.verticalLineContentWidth - s2[1] * e51.scale;
  else {
    let t3 = z_(e51.verticalAlign);
    l2 = (r2.horizontalLineContentHeight - s2[1] * e51.scale) * t3;
  }
  let u2 = (t2 ? s2[0] : s2[1]) * e51.scale - 24 * n2;
  return { rect: o2, metrics: c2, baselineOffset: l2, imageOffset: u2 };
}
function G_(e51, t2, n2, r2) {
  if (r2 === 0) return;
  let i2 = e51[n2], a2 = i2.metrics.advance * i2.scale, o2 = (e51[n2].x + a2) * r2;
  for (let r3 = t2; r3 <= n2; r3++) e51[r3].x -= o2;
}
function K_(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
  let l2 = (t2 - n2) * i2, u2 = 0;
  u2 = a2 === o2 ? -r2 * c2 * o2 + 0.5 * o2 : -s2 * r2 - -17;
  for (let t3 of e51) for (let e52 of t3.positionedGlyphs) e52.x += l2, e52.y += u2;
}
function q_(e51, t2, n2) {
  let { horizontalAlign: r2, verticalAlign: i2 } = L_(n2), a2 = t2[0], o2 = t2[1], s2 = a2 - e51.displaySize[0] * r2, c2 = s2 + e51.displaySize[0], l2 = o2 - e51.displaySize[1] * i2;
  return { image: e51, top: l2, bottom: l2 + e51.displaySize[1], left: s2, right: c2 };
}
function J_(e51) {
  let t2 = e51.left, n2 = e51.top, r2 = e51.right - t2, i2 = e51.bottom - n2, a2 = e51.image.content[2] - e51.image.content[0], o2 = e51.image.content[3] - e51.image.content[1], s2 = e51.image.textFitWidth ?? `stretchOrShrink`, c2 = e51.image.textFitHeight ?? `stretchOrShrink`, l2 = a2 / o2;
  if (c2 === `proportional`) {
    if (s2 === `stretchOnly` && r2 / i2 < l2 || s2 === `proportional`) {
      let e52 = Math.ceil(i2 * l2);
      t2 *= e52 / r2, r2 = e52;
    }
  } else if (s2 === `proportional` && c2 === `stretchOnly` && l2 !== 0 && r2 / i2 > l2) {
    let e52 = Math.ceil(r2 / l2);
    n2 *= e52 / i2, i2 = e52;
  }
  return { x1: t2, y1: n2, x2: t2 + r2, y2: n2 + i2 };
}
function Y_(e51, t2, n2, r2, i2, a2) {
  let o2 = e51.image, s2;
  if (o2.content) {
    let e52 = o2.content, t3 = o2.pixelRatio || 1;
    s2 = [e52[0] / t3, e52[1] / t3, o2.displaySize[0] - e52[2] / t3, o2.displaySize[1] - e52[3] / t3];
  }
  let c2 = t2.left * a2, l2 = t2.right * a2, u2, d2, f2, p2;
  n2 === `width` || n2 === `both` ? (p2 = i2[0] + c2 - r2[3], d2 = i2[0] + l2 + r2[1]) : (p2 = i2[0] + (c2 + l2 - o2.displaySize[0]) / 2, d2 = p2 + o2.displaySize[0]);
  let m2 = t2.top * a2, h2 = t2.bottom * a2;
  return n2 === `height` || n2 === `both` ? (u2 = i2[1] + m2 - r2[0], f2 = i2[1] + h2 + r2[2]) : (u2 = i2[1] + (m2 + h2 - o2.displaySize[1]) / 2, f2 = u2 + o2.displaySize[1]), { image: o2, top: u2, right: d2, bottom: f2, left: p2, collisionPadding: s2 };
}
var X_ = 32640;
function Z_(e51, t2) {
  let { expression: n2 } = t2;
  if (n2.kind === `constant`) return { kind: `constant`, layoutSize: n2.evaluate(new W(e51 + 1)) };
  if (n2.kind === `source`) return { kind: `source` };
  {
    let { zoomStops: t3, interpolationType: r2 } = n2, i2 = 0;
    for (; i2 < t3.length && t3[i2] <= e51; ) i2++;
    i2 = Math.max(0, i2 - 1);
    let a2 = i2;
    for (; a2 < t3.length && t3[a2] < e51 + 1; ) a2++;
    a2 = Math.min(t3.length - 1, a2);
    let o2 = t3[i2], s2 = t3[a2];
    return n2.kind === `composite` ? { kind: `composite`, minZoom: o2, maxZoom: s2, interpolationType: r2 } : { kind: `camera`, minZoom: o2, maxZoom: s2, minSize: n2.evaluate(new W(o2)), maxSize: n2.evaluate(new W(s2)), interpolationType: r2 };
  }
}
function ev(e51, t2, n2) {
  let r2 = `never`, i2 = e51.get(t2);
  return i2 ? r2 = i2 : e51.get(n2) && (r2 = `always`), r2;
}
var tv = [{ name: `a_fade_opacity`, components: 1, type: `Uint8`, offset: 0 }];
function nv(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2) {
  let p2 = s2 ? Math.min(X_, Math.round(s2[0])) : 0, m2 = s2 ? Math.min(X_, Math.round(s2[1])) : 0;
  e51.emplaceBack(t2, n2, Math.round(r2 * 32), Math.round(i2 * 32), a2, o2, (p2 << 1) + +!!c2, m2, l2 * 16, u2 * 16, d2 * 256, f2 * 256);
}
function rv(e51, t2, n2) {
  e51.emplaceBack(t2.x, t2.y, n2), e51.emplaceBack(t2.x, t2.y, n2), e51.emplaceBack(t2.x, t2.y, n2), e51.emplaceBack(t2.x, t2.y, n2);
}
function iv(e51) {
  for (let t2 of e51.sections) if ($c(t2.text)) return true;
  return false;
}
var av = class {
  constructor(e51) {
    this.layoutVertexArray = new Su(), this.indexArray = new ku(), this.programConfigurations = e51, this.segments = new Pu(), this.dynamicLayoutVertexArray = new Cu(), this.opacityVertexArray = new wu(), this.hasVisibleVertices = false, this.placedSymbolArray = new ru();
  }
  isEmpty() {
    return this.layoutVertexArray.length === 0 && this.indexArray.length === 0 && this.dynamicLayoutVertexArray.length === 0 && this.opacityVertexArray.length === 0;
  }
  upload(e51, t2, n2, r2) {
    this.isEmpty() || (n2 && (this.layoutVertexBuffer = e51.createVertexBuffer(this.layoutVertexArray, Rg.members), this.indexBuffer = e51.createIndexBuffer(this.indexArray, t2), this.dynamicLayoutVertexBuffer = e51.createVertexBuffer(this.dynamicLayoutVertexArray, zg.members, true), this.opacityVertexBuffer = e51.createVertexBuffer(this.opacityVertexArray, tv, true), this.opacityVertexBuffer.itemSize = 1), (n2 || r2) && this.programConfigurations.upload(e51));
  }
  destroy() {
    this.layoutVertexBuffer && (this.layoutVertexBuffer.destroy(), this.indexBuffer.destroy(), this.programConfigurations.destroy(), this.segments.destroy(), this.dynamicLayoutVertexBuffer.destroy(), this.opacityVertexBuffer.destroy());
  }
};
U(`SymbolBuffers`, av);
var ov = class {
  constructor(e51, t2, n2) {
    this.layoutVertexArray = new e51(), this.layoutAttributes = t2, this.indexArray = new n2(), this.segments = new Pu(), this.collisionVertexArray = new Du();
  }
  upload(e51) {
    this.layoutVertexBuffer = e51.createVertexBuffer(this.layoutVertexArray, this.layoutAttributes), this.indexBuffer = e51.createIndexBuffer(this.indexArray), this.collisionVertexBuffer = e51.createVertexBuffer(this.collisionVertexArray, Bg.members, true);
  }
  destroy() {
    this.layoutVertexBuffer && (this.layoutVertexBuffer.destroy(), this.indexBuffer.destroy(), this.segments.destroy(), this.collisionVertexBuffer.destroy());
  }
};
U(`CollisionBuffers`, ov);
var sv = class {
  constructor(e51) {
    this.collisionBoxArray = e51.collisionBoxArray, this.zoom = e51.zoom, this.overscaling = e51.overscaling, this.layers = e51.layers, this.layerIds = this.layers.map((e52) => e52.id), this.index = e51.index, this.pixelRatio = e51.pixelRatio, this.sourceLayerIndex = e51.sourceLayerIndex, this.hasDependencies = false, this.hasRTLText = false, this.sortKeyRanges = [], this.collisionCircleArray = [];
    let t2 = this.layers[0]._unevaluatedLayout._values;
    this.textSizeData = Z_(this.zoom, t2[`text-size`]), this.iconSizeData = Z_(this.zoom, t2[`icon-size`]);
    let n2 = this.layers[0].layout, r2 = n2.get(`symbol-sort-key`), i2 = n2.get(`symbol-z-order`);
    this.canOverlap = ev(n2, `text-overlap`, `text-allow-overlap`) !== `never` || ev(n2, `icon-overlap`, `icon-allow-overlap`) !== `never` || n2.get(`text-ignore-placement`) || n2.get(`icon-ignore-placement`), this.sortFeaturesByKey = i2 !== `viewport-y` && !r2.isConstant();
    let a2 = i2 === `viewport-y` || i2 === `auto` && !this.sortFeaturesByKey;
    this.sortFeaturesByY = a2 && this.canOverlap, n2.get(`symbol-placement`) === `point` && (this.writingModes = n2.get(`text-writing-mode`).map((e52) => N_[e52])), this.stateDependentLayerIds = this.layers.filter((e52) => e52.isStateDependent()).map((e52) => e52.id), this.sourceID = e51.sourceID;
  }
  createArrays() {
    this.text = new av(new dd(this.layers, this.zoom, (e51) => e51.startsWith(`text`))), this.icon = new av(new dd(this.layers, this.zoom, (e51) => e51.startsWith(`icon`))), this.glyphOffsetArray = new ou(), this.lineVertexArray = new su(), this.symbolInstances = new au(), this.textAnchorOffsets = new lu();
  }
  calculateGlyphDependencies(e51, t2, n2, r2, i2) {
    for (let a2 of e51) if (t2[a2.codePointAt(0)] = true, (n2 || r2) && i2) {
      let e52 = Kg[a2];
      e52 && (t2[e52.codePointAt(0)] = true);
    }
  }
  populate(e51, t2, n2) {
    let r2 = this.layers[0], i2 = r2.layout, a2 = i2.get(`text-font`), o2 = i2.get(`text-field`), s2 = i2.get(`icon-image`), c2 = (o2.value.kind !== `constant` || o2.value.value instanceof Yr && !o2.value.value.isEmpty() || o2.value.value.toString().length > 0) && (a2.value.kind !== `constant` || a2.value.value.length > 0), l2 = s2.value.kind !== `constant` || !!s2.value.value || Object.keys(s2.parameters).length > 0, u2 = i2.get(`symbol-sort-key`);
    if (this.features = [], !c2 && !l2) return;
    let d2 = t2.iconDependencies, f2 = t2.glyphDependencies, p2 = t2.availableImages, m2 = new W(this.zoom);
    for (let { feature: t3, id: o3, index: s3, sourceLayerIndex: h2 } of e51) {
      let e52 = r2._featureFilter.needGeometry, g2 = vd(t3, e52);
      if (!r2._featureFilter.filter(m2, g2, n2)) continue;
      e52 || (g2.geometry = _d(t3));
      let _;
      if (c2) {
        let e53 = r2.getValueAndResolveTokens(`text-field`, g2, n2, p2), t4 = Yr.factory(e53);
        this.hasRTLText ||= iv(t4), (!this.hasRTLText || tl.getRTLTextPluginStatus() === `unavailable` || this.hasRTLText && tl.isParsed()) && (_ = Wg(t4, r2, g2));
      }
      let v;
      if (l2) {
        let e53 = r2.getValueAndResolveTokens(`icon-image`, g2, n2, p2);
        v = e53 instanceof ti ? e53 : ti.fromString(e53);
      }
      if (!_ && !v) continue;
      let y = this.sortFeaturesByKey ? u2.evaluate(g2, {}, n2) : void 0, b = { id: o3, text: _, icon: v, index: s3, sourceLayerIndex: h2, geometry: g2.geometry, properties: t3.properties, type: rm.types[t3.type], sortKey: y };
      if (this.features.push(b), v && (d2[v.name] = true), _) {
        let e53 = a2.evaluate(g2, {}, n2).join(`,`), t4 = i2.get(`text-rotation-alignment`) !== `viewport` && i2.get(`symbol-placement`) !== `point`;
        this.allowVerticalPlacement = this.writingModes?.includes(2);
        for (let n3 of _.sections) if (n3.image) d2[n3.image.name] = true;
        else {
          let r3 = Uc(_.toString()), i3 = n3.fontStack || e53;
          f2[i3] ||= {}, this.calculateGlyphDependencies(n3.text, f2[i3], t4, this.allowVerticalPlacement, r3);
        }
      }
    }
    i2.get(`symbol-placement`) === `line` && (this.features = Gg(this.features)), this.sortFeaturesByKey && this.features.sort((e52, t3) => e52.sortKey - t3.sortKey);
  }
  update(e51, t2, n2) {
    this.stateDependentLayers.length && (this.text.programConfigurations.updatePaintArrays(e51, t2, this.layers, { imagePositions: n2 }), this.icon.programConfigurations.updatePaintArrays(e51, t2, this.layers, { imagePositions: n2 }));
  }
  isEmpty() {
    return this.symbolInstances.length === 0 && !this.hasRTLText;
  }
  uploadPending() {
    return !this.uploaded || this.text.programConfigurations.needsUpload || this.icon.programConfigurations.needsUpload;
  }
  upload(e51) {
    !this.uploaded && this.hasDebugData() && (this.textCollisionBox.upload(e51), this.iconCollisionBox.upload(e51)), this.text.upload(e51, this.sortFeaturesByY, !this.uploaded, this.text.programConfigurations.needsUpload), this.icon.upload(e51, this.sortFeaturesByY, !this.uploaded, this.icon.programConfigurations.needsUpload), this.uploaded = true;
  }
  destroyDebugData() {
    this.textCollisionBox.destroy(), this.iconCollisionBox.destroy();
  }
  destroy() {
    this.text.destroy(), this.icon.destroy(), this.hasDebugData() && this.destroyDebugData();
  }
  addToLineVertexArray(e51, t2) {
    let n2 = this.lineVertexArray.length;
    if (e51.segment !== void 0) {
      let n3 = e51.dist(t2[e51.segment + 1]), r2 = e51.dist(t2[e51.segment]), i2 = {};
      for (let r3 = e51.segment + 1; r3 < t2.length; r3++) i2[r3] = { x: t2[r3].x, y: t2[r3].y, tileUnitDistanceFromAnchor: n3 }, r3 < t2.length - 1 && (n3 += t2[r3 + 1].dist(t2[r3]));
      for (let n4 = e51.segment || 0; n4 >= 0; n4--) i2[n4] = { x: t2[n4].x, y: t2[n4].y, tileUnitDistanceFromAnchor: r2 }, n4 > 0 && (r2 += t2[n4 - 1].dist(t2[n4]));
      for (let e52 = 0; e52 < t2.length; e52++) {
        let t3 = i2[e52];
        this.lineVertexArray.emplaceBack(t3.x, t3.y, t3.tileUnitDistanceFromAnchor);
      }
    }
    return { lineStartIndex: n2, lineLength: this.lineVertexArray.length - n2 };
  }
  addSymbols(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2) {
    let f2 = e51.indexArray, p2 = e51.layoutVertexArray, m2 = e51.segments.prepareSegment(4 * t2.length, p2, f2, this.canOverlap ? a2.sortKey : void 0), h2 = this.glyphOffsetArray.length, g2 = m2.vertexLength, _ = this.allowVerticalPlacement && o2 === 2 ? Math.PI / 2 : 0, v = a2.text && a2.text.sections;
    for (let r3 = 0; r3 < t2.length; r3++) {
      let { tl: i3, tr: o3, bl: c3, br: l3, tex: u3, pixelOffsetTL: h3, pixelOffsetBR: g3, minFontScaleX: y, minFontScaleY: b, glyphOffset: x, isSDF: S, sectionIndex: C } = t2[r3], w = m2.vertexLength, T = x[1];
      nv(p2, s2.x, s2.y, i3.x, T + i3.y, u3.x, u3.y, n2, S, h3.x, h3.y, y, b), nv(p2, s2.x, s2.y, o3.x, T + o3.y, u3.x + u3.w, u3.y, n2, S, g3.x, h3.y, y, b), nv(p2, s2.x, s2.y, c3.x, T + c3.y, u3.x, u3.y + u3.h, n2, S, h3.x, g3.y, y, b), nv(p2, s2.x, s2.y, l3.x, T + l3.y, u3.x + u3.w, u3.y + u3.h, n2, S, g3.x, g3.y, y, b), rv(e51.dynamicLayoutVertexArray, s2, _), f2.emplaceBack(w, w + 2, w + 1), f2.emplaceBack(w + 1, w + 2, w + 3), m2.vertexLength += 4, m2.primitiveLength += 2, this.glyphOffsetArray.emplaceBack(x[0]), (r3 === t2.length - 1 || C !== t2[r3 + 1].sectionIndex) && e51.programConfigurations.populatePaintArrays(p2.length, a2, a2.index, { imagePositions: {}, canonical: d2, formattedSection: v?.[C] });
    }
    e51.placedSymbolArray.emplaceBack(s2.x, s2.y, h2, this.glyphOffsetArray.length - h2, g2, c2, l2, s2.segment, n2 ? n2[0] : 0, n2 ? n2[1] : 0, r2[0], r2[1], o2, 0, false, 0, u2);
  }
  _addCollisionDebugVertex(e51, t2, n2, r2, i2, a2) {
    return t2.emplaceBack(0, 0), e51.emplaceBack(n2.x, n2.y, r2, i2, Math.round(a2.x), Math.round(a2.y));
  }
  addCollisionDebugVertices(e51, t2, n2, r2, i2, a2, o2) {
    let s2 = i2.segments.prepareSegment(4, i2.layoutVertexArray, i2.indexArray), c2 = s2.vertexLength, u2 = i2.layoutVertexArray, d2 = i2.collisionVertexArray, f2 = o2.anchorX, p2 = o2.anchorY;
    this._addCollisionDebugVertex(u2, d2, a2, f2, p2, new l(e51, t2)), this._addCollisionDebugVertex(u2, d2, a2, f2, p2, new l(n2, t2)), this._addCollisionDebugVertex(u2, d2, a2, f2, p2, new l(n2, r2)), this._addCollisionDebugVertex(u2, d2, a2, f2, p2, new l(e51, r2)), s2.vertexLength += 4;
    let m2 = i2.indexArray;
    m2.emplaceBack(c2, c2 + 1), m2.emplaceBack(c2 + 1, c2 + 2), m2.emplaceBack(c2 + 2, c2 + 3), m2.emplaceBack(c2 + 3, c2), s2.primitiveLength += 4;
  }
  addDebugCollisionBoxes(e51, t2, n2, r2) {
    for (let i2 = e51; i2 < t2; i2++) {
      let e52 = this.collisionBoxArray.get(i2), t3 = e52.x1, a2 = e52.y1, o2 = e52.x2, s2 = e52.y2;
      this.addCollisionDebugVertices(t3, a2, o2, s2, r2 ? this.textCollisionBox : this.iconCollisionBox, e52.anchorPoint, n2);
    }
  }
  generateCollisionDebugBuffers() {
    this.hasDebugData() && this.destroyDebugData(), this.textCollisionBox = new ov(Tu, Vg.members, Au), this.iconCollisionBox = new ov(Tu, Vg.members, Au);
    for (let e51 = 0; e51 < this.symbolInstances.length; e51++) {
      let t2 = this.symbolInstances.get(e51);
      this.addDebugCollisionBoxes(t2.textBoxStartIndex, t2.textBoxEndIndex, t2, true), this.addDebugCollisionBoxes(t2.verticalTextBoxStartIndex, t2.verticalTextBoxEndIndex, t2, true), this.addDebugCollisionBoxes(t2.iconBoxStartIndex, t2.iconBoxEndIndex, t2, false), this.addDebugCollisionBoxes(t2.verticalIconBoxStartIndex, t2.verticalIconBoxEndIndex, t2, false);
    }
  }
  _deserializeCollisionBoxesForSymbol(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
    let l2 = {};
    for (let r3 = t2; r3 < n2; r3++) {
      let t3 = e51.get(r3);
      l2.textBox = { x1: t3.x1, y1: t3.y1, x2: t3.x2, y2: t3.y2, anchorPointX: t3.anchorPointX, anchorPointY: t3.anchorPointY }, l2.textFeatureIndex = t3.featureIndex;
      break;
    }
    for (let t3 = r2; t3 < i2; t3++) {
      let n3 = e51.get(t3);
      l2.verticalTextBox = { x1: n3.x1, y1: n3.y1, x2: n3.x2, y2: n3.y2, anchorPointX: n3.anchorPointX, anchorPointY: n3.anchorPointY }, l2.verticalTextFeatureIndex = n3.featureIndex;
      break;
    }
    for (let t3 = a2; t3 < o2; t3++) {
      let n3 = e51.get(t3);
      l2.iconBox = { x1: n3.x1, y1: n3.y1, x2: n3.x2, y2: n3.y2, anchorPointX: n3.anchorPointX, anchorPointY: n3.anchorPointY }, l2.iconFeatureIndex = n3.featureIndex;
      break;
    }
    for (let t3 = s2; t3 < c2; t3++) {
      let n3 = e51.get(t3);
      l2.verticalIconBox = { x1: n3.x1, y1: n3.y1, x2: n3.x2, y2: n3.y2, anchorPointX: n3.anchorPointX, anchorPointY: n3.anchorPointY }, l2.verticalIconFeatureIndex = n3.featureIndex;
      break;
    }
    return l2;
  }
  deserializeCollisionBoxes(e51) {
    this.collisionArrays = [];
    for (let t2 = 0; t2 < this.symbolInstances.length; t2++) {
      let n2 = this.symbolInstances.get(t2);
      this.collisionArrays.push(this._deserializeCollisionBoxesForSymbol(e51, n2.textBoxStartIndex, n2.textBoxEndIndex, n2.verticalTextBoxStartIndex, n2.verticalTextBoxEndIndex, n2.iconBoxStartIndex, n2.iconBoxEndIndex, n2.verticalIconBoxStartIndex, n2.verticalIconBoxEndIndex));
    }
  }
  hasTextData() {
    return this.text.segments.get().length > 0;
  }
  hasIconData() {
    return this.icon.segments.get().length > 0;
  }
  hasDebugData() {
    return this.textCollisionBox && this.iconCollisionBox;
  }
  hasTextCollisionBoxData() {
    return this.hasDebugData() && this.textCollisionBox.segments.get().length > 0;
  }
  hasIconCollisionBoxData() {
    return this.hasDebugData() && this.iconCollisionBox.segments.get().length > 0;
  }
  addIndicesForPlacedSymbol(e51, t2) {
    let n2 = e51.placedSymbolArray.get(t2), r2 = n2.vertexStartIndex + n2.numGlyphs * 4;
    for (let t3 = n2.vertexStartIndex; t3 < r2; t3 += 4) e51.indexArray.emplaceBack(t3, t3 + 2, t3 + 1), e51.indexArray.emplaceBack(t3 + 1, t3 + 2, t3 + 3);
  }
  getSortedSymbolIndexes(e51) {
    if (this.sortedAngle === e51 && this.symbolInstanceIndexes !== void 0) return this.symbolInstanceIndexes;
    let t2 = Math.sin(e51), n2 = Math.cos(e51), r2 = [], i2 = [], a2 = [];
    for (let e52 = 0; e52 < this.symbolInstances.length; ++e52) {
      a2.push(e52);
      let o2 = this.symbolInstances.get(e52);
      r2.push(Math.round(t2 * o2.anchorX + n2 * o2.anchorY) | 0), i2.push(o2.featureIndex);
    }
    return a2.sort((e52, t3) => r2[e52] - r2[t3] || i2[t3] - i2[e52]), a2;
  }
  addToSortKeyRanges(e51, t2) {
    let n2 = this.sortKeyRanges[this.sortKeyRanges.length - 1];
    n2?.sortKey === t2 ? n2.symbolInstanceEnd = e51 + 1 : this.sortKeyRanges.push({ sortKey: t2, symbolInstanceStart: e51, symbolInstanceEnd: e51 + 1 });
  }
  sortFeatures(e51) {
    if (this.sortFeaturesByY && this.sortedAngle !== e51 && !(this.text.segments.get().length > 1 || this.icon.segments.get().length > 1)) {
      this.symbolInstanceIndexes = this.getSortedSymbolIndexes(e51), this.sortedAngle = e51, this.text.indexArray.clear(), this.icon.indexArray.clear(), this.featureSortOrder = [];
      for (let e52 of this.symbolInstanceIndexes) {
        let t2 = this.symbolInstances.get(e52);
        this.featureSortOrder.push(t2.featureIndex);
        let n2 = [t2.rightJustifiedTextSymbolIndex, t2.centerJustifiedTextSymbolIndex, t2.leftJustifiedTextSymbolIndex];
        for (let e53 = 0; e53 < n2.length; e53++) {
          let t3 = n2[e53];
          t3 >= 0 && n2.indexOf(t3) === e53 && this.addIndicesForPlacedSymbol(this.text, t3);
        }
        t2.verticalPlacedTextSymbolIndex >= 0 && this.addIndicesForPlacedSymbol(this.text, t2.verticalPlacedTextSymbolIndex), t2.placedIconSymbolIndex >= 0 && this.addIndicesForPlacedSymbol(this.icon, t2.placedIconSymbolIndex), t2.verticalPlacedIconSymbolIndex >= 0 && this.addIndicesForPlacedSymbol(this.icon, t2.verticalPlacedIconSymbolIndex);
      }
      this.text.indexBuffer && this.text.indexBuffer.updateData(this.text.indexArray), this.icon.indexBuffer && this.icon.indexBuffer.updateData(this.icon.indexArray);
    }
  }
};
U(`SymbolBucket`, sv, { omit: [`layers`, `collisionBoxArray`, `features`, `compareText`] }), sv.MAX_GLYPHS = 65535, sv.addDynamicAttributes = rv;
function cv(e51, t2) {
  return t2.replace(/{([^{}]+)}/g, (t3, n2) => e51 && n2 in e51 ? String(e51[n2]) : ``);
}
var lv;
var uv = () => lv ||= new _l({ "symbol-placement": new G(M.layout_symbol[`symbol-placement`], `symbol-placement`), "symbol-spacing": new G(M.layout_symbol[`symbol-spacing`], `symbol-spacing`), "symbol-avoid-edges": new G(M.layout_symbol[`symbol-avoid-edges`], `symbol-avoid-edges`), "symbol-sort-key": new K(M.layout_symbol[`symbol-sort-key`], `symbol-sort-key`), "symbol-z-order": new G(M.layout_symbol[`symbol-z-order`], `symbol-z-order`), "icon-allow-overlap": new G(M.layout_symbol[`icon-allow-overlap`], `icon-allow-overlap`), "icon-overlap": new G(M.layout_symbol[`icon-overlap`], `icon-overlap`), "icon-ignore-placement": new G(M.layout_symbol[`icon-ignore-placement`], `icon-ignore-placement`), "icon-optional": new G(M.layout_symbol[`icon-optional`], `icon-optional`), "icon-rotation-alignment": new G(M.layout_symbol[`icon-rotation-alignment`], `icon-rotation-alignment`), "icon-size": new K(M.layout_symbol[`icon-size`], `icon-size`), "icon-text-fit": new G(M.layout_symbol[`icon-text-fit`], `icon-text-fit`), "icon-text-fit-padding": new G(M.layout_symbol[`icon-text-fit-padding`], `icon-text-fit-padding`), "icon-image": new K(M.layout_symbol[`icon-image`], `icon-image`), "icon-rotate": new K(M.layout_symbol[`icon-rotate`], `icon-rotate`), "icon-padding": new K(M.layout_symbol[`icon-padding`], `icon-padding`), "icon-keep-upright": new G(M.layout_symbol[`icon-keep-upright`], `icon-keep-upright`), "icon-offset": new K(M.layout_symbol[`icon-offset`], `icon-offset`), "icon-anchor": new K(M.layout_symbol[`icon-anchor`], `icon-anchor`), "icon-pitch-alignment": new G(M.layout_symbol[`icon-pitch-alignment`], `icon-pitch-alignment`), "text-pitch-alignment": new G(M.layout_symbol[`text-pitch-alignment`], `text-pitch-alignment`), "text-rotation-alignment": new G(M.layout_symbol[`text-rotation-alignment`], `text-rotation-alignment`), "text-field": new K(M.layout_symbol[`text-field`], `text-field`), "text-font": new K(M.layout_symbol[`text-font`], `text-font`), "text-size": new K(M.layout_symbol[`text-size`], `text-size`), "text-max-width": new K(M.layout_symbol[`text-max-width`], `text-max-width`), "text-line-height": new G(M.layout_symbol[`text-line-height`], `text-line-height`), "text-letter-spacing": new K(M.layout_symbol[`text-letter-spacing`], `text-letter-spacing`), "text-justify": new K(M.layout_symbol[`text-justify`], `text-justify`), "text-radial-offset": new K(M.layout_symbol[`text-radial-offset`], `text-radial-offset`), "text-variable-anchor": new G(M.layout_symbol[`text-variable-anchor`], `text-variable-anchor`), "text-variable-anchor-offset": new K(M.layout_symbol[`text-variable-anchor-offset`], `text-variable-anchor-offset`), "text-anchor": new K(M.layout_symbol[`text-anchor`], `text-anchor`), "text-max-angle": new G(M.layout_symbol[`text-max-angle`], `text-max-angle`), "text-writing-mode": new G(M.layout_symbol[`text-writing-mode`], `text-writing-mode`), "text-rotate": new K(M.layout_symbol[`text-rotate`], `text-rotate`), "text-padding": new G(M.layout_symbol[`text-padding`], `text-padding`), "text-keep-upright": new G(M.layout_symbol[`text-keep-upright`], `text-keep-upright`), "text-transform": new K(M.layout_symbol[`text-transform`], `text-transform`), "text-offset": new K(M.layout_symbol[`text-offset`], `text-offset`), "text-allow-overlap": new G(M.layout_symbol[`text-allow-overlap`], `text-allow-overlap`), "text-overlap": new G(M.layout_symbol[`text-overlap`], `text-overlap`), "text-ignore-placement": new G(M.layout_symbol[`text-ignore-placement`], `text-ignore-placement`), "text-optional": new G(M.layout_symbol[`text-optional`], `text-optional`) });
var dv;
var fv = () => dv ||= new _l({ "icon-opacity": new K(M.paint_symbol[`icon-opacity`], `icon-opacity`), "icon-color": new K(M.paint_symbol[`icon-color`], `icon-color`), "icon-halo-color": new K(M.paint_symbol[`icon-halo-color`], `icon-halo-color`), "icon-halo-width": new K(M.paint_symbol[`icon-halo-width`], `icon-halo-width`), "icon-halo-blur": new K(M.paint_symbol[`icon-halo-blur`], `icon-halo-blur`), "icon-translate": new G(M.paint_symbol[`icon-translate`], `icon-translate`), "icon-translate-anchor": new G(M.paint_symbol[`icon-translate-anchor`], `icon-translate-anchor`), "text-opacity": new K(M.paint_symbol[`text-opacity`], `text-opacity`), "text-color": new K(M.paint_symbol[`text-color`], `text-color`, { runtimeType: tr, getOverride: (e51) => e51.textColor, hasOverride: (e51) => !!e51.textColor }), "text-halo-color": new K(M.paint_symbol[`text-halo-color`], `text-halo-color`), "text-halo-width": new K(M.paint_symbol[`text-halo-width`], `text-halo-width`), "text-halo-blur": new K(M.paint_symbol[`text-halo-blur`], `text-halo-blur`), "text-translate": new G(M.paint_symbol[`text-translate`], `text-translate`), "text-translate-anchor": new G(M.paint_symbol[`text-translate-anchor`], `text-translate-anchor`) });
var pv = { get paint() {
  return fv();
}, get layout() {
  return uv();
} };
var mv = class {
  constructor(e51) {
    if (e51.property.overrides === void 0) throw Error(`overrides must be provided to instantiate FormatSectionOverride class`);
    this.type = e51.property.overrides ? e51.property.overrides.runtimeType : er, this.defaultValue = e51;
  }
  evaluate(e51) {
    if (e51.formattedSection) {
      let t2 = this.defaultValue.property.overrides;
      if (t2?.hasOverride(e51.formattedSection)) return t2.getOverride(e51.formattedSection);
    }
    return e51.feature && e51.featureState ? this.defaultValue.evaluate(e51.feature, e51.featureState) : this.defaultValue.property.specification.default;
  }
  eachChild(e51) {
    if (!this.defaultValue.isConstant()) {
      let t2 = this.defaultValue.value;
      e51(t2._styleExpression.expression);
    }
  }
  outputDefined() {
    return false;
  }
  serialize() {
    return null;
  }
};
U(`FormatSectionOverride`, mv, { omit: [`defaultValue`] });
var gv = class e48 extends bl {
  constructor(e51, t2) {
    super(e51, pv, t2);
  }
  recalculate(e51, t2) {
    if (super.recalculate(e51, t2), this.layout.get(`icon-rotation-alignment`) === `auto` && (this.layout.get(`symbol-placement`) === `point` ? this.layout._values[`icon-rotation-alignment`] = `viewport` : this.layout._values[`icon-rotation-alignment`] = `map`), this.layout.get(`text-rotation-alignment`) === `auto` && (this.layout.get(`symbol-placement`) === `point` ? this.layout._values[`text-rotation-alignment`] = `viewport` : this.layout._values[`text-rotation-alignment`] = `map`), this.layout.get(`text-pitch-alignment`) === `auto` && (this.layout._values[`text-pitch-alignment`] = this.layout.get(`text-rotation-alignment`) === `map` ? `map` : `viewport`), this.layout.get(`icon-pitch-alignment`) === `auto` && (this.layout._values[`icon-pitch-alignment`] = this.layout.get(`icon-rotation-alignment`)), this.layout.get(`symbol-placement`) === `point`) {
      let e52 = this.layout.get(`text-writing-mode`);
      if (e52) {
        let t3 = [];
        for (let n2 of e52) t3.includes(n2) || t3.push(n2);
        this.layout._values[`text-writing-mode`] = t3;
      } else this.layout._values[`text-writing-mode`] = [`horizontal`];
    }
    this._setPaintOverrides();
  }
  getValueAndResolveTokens(e51, t2, n2, r2) {
    let i2 = this.layout.get(e51).evaluate(t2, {}, n2, r2), a2 = this._unevaluatedLayout._values[e51];
    return !a2.isDataDriven() && !Uo(a2.value) && i2 ? cv(t2.properties, i2) : i2;
  }
  createBucket(e51) {
    return new sv(e51);
  }
  queryRadius() {
    return 0;
  }
  queryIntersectsFeature() {
    throw Error(`Should take a different path in FeatureIndex`);
  }
  _setPaintOverrides() {
    for (let t2 of pv.paint.overridableProperties) {
      if (!e48.hasPaintOverride(this.layout, t2)) continue;
      let n2 = this.paint.get(t2), r2 = new Bo(new mv(n2), `layers[${this.id}].paint.${n2.property.name}`, n2.property.specification), i2 = null;
      i2 = n2.value.kind === `constant` || n2.value.kind === `source` ? new Go(`source`, r2) : new Ko(`composite`, r2, n2.value.zoomStops), this.paint._values[t2] = new ul(n2.property, i2, n2.parameters);
    }
  }
  _handleOverridablePaintPropertyUpdate(t2, n2, r2) {
    return !this.layout || n2.isDataDriven() || r2.isDataDriven() ? false : e48.hasPaintOverride(this.layout, t2);
  }
  static hasPaintOverride(e51, t2) {
    let n2 = e51.get(`text-field`), r2 = pv.paint.properties[t2], i2 = false, a2 = (e52) => {
      for (let t3 of e52) if (r2.overrides?.hasOverride(t3)) {
        i2 = true;
        return;
      }
    };
    if (n2.value.kind === `constant` && n2.value.value instanceof Yr) a2(n2.value.value.sections);
    else if (n2.value.kind === `source` || n2.value.kind === `composite`) {
      let e52 = (t4) => {
        if (!i2) {
          if (t4 instanceof si && ai(t4.value) === or) {
            let e53 = t4.value;
            a2(e53.sections);
          } else t4 instanceof Qi ? a2(t4.sections) : t4.eachChild(e52);
        }
      }, t3 = n2.value;
      t3._styleExpression && e52(t3._styleExpression.expression);
    }
    return i2;
  }
};
function _v(e51, t2, n2, r2 = 1) {
  let i2 = e51.get(`icon-padding`).evaluate(t2, {}, n2)?.values;
  return [i2[0] * r2, i2[1] * r2, i2[2] * r2, i2[3] * r2];
}
var vv;
var yv = () => vv ||= new _l({ "background-color": new G(M.paint_background[`background-color`], `background-color`), "background-pattern": new hl(M.paint_background[`background-pattern`], `background-pattern`), "background-opacity": new G(M.paint_background[`background-opacity`], `background-opacity`) });
var bv = { get paint() {
  return yv();
} };
var Sv = class extends bl {
  constructor(e51, t2) {
    super(e51, bv, t2);
  }
};
var Tv = class extends bl {
  constructor(e51, t2) {
    super(e51, {}, t2), this.onAdd = (e52) => {
      this.implementation.onAdd && this.implementation.onAdd(e52, e52.painter.context.gl);
    }, this.onRemove = (e52) => {
      this.implementation.onRemove && this.implementation.onRemove(e52, e52.painter.context.gl);
    }, this.implementation = e51;
  }
  is3D() {
    return this.implementation.renderingMode === `3d`;
  }
  hasOffscreenPass() {
    return this.implementation.prerender !== void 0;
  }
  recalculate() {
  }
  updateTransitions() {
  }
  hasTransition() {
    return false;
  }
  serialize() {
    throw Error(`Custom layers cannot be serialized`);
  }
};
function Ev(e51, t2) {
  if (e51.type === `custom`) return new Tv(e51, t2);
  switch (e51.type) {
    case `background`:
      return new Sv(e51, t2);
    case `circle`:
      return new $d(e51, t2);
    case `color-relief`:
      return new Of(e51, t2);
    case `fill`:
      return new Yp(e51, t2);
    case `fill-extrusion`:
      return new Gm(e51, t2);
    case `heatmap`:
      return new mf(e51, t2);
    case `hillshade`:
      return new yf(e51, t2);
    case `line`:
      return new Ig(e51, t2);
    case `raster`:
      return new Tl(e51, t2);
    case `symbol`:
      return new gv(e51, t2);
  }
}
var Dv = class {
  constructor(e51) {
    this._methodToThrottle = e51, this._triggered = false, this._channel = new MessageChannel(), this._channel.port2.onmessage = () => {
      this._triggered = false, this._methodToThrottle();
    };
  }
  trigger() {
    this._triggered || (this._triggered = true, this._channel?.port1.postMessage(true));
  }
  remove() {
    delete this._channel, this._methodToThrottle = () => {
    };
  }
};
var Ov = { once: true };
var kv = class {
  constructor(e51, t2) {
    this.target = e51, this.mapId = t2, this.resolveRejects = {}, this.tasks = {}, this.taskQueue = [], this.abortControllers = {}, this.messageHandlers = {}, this.invoker = new Dv(() => this.process()), this.subscription = en(this.target, `message`, (e52) => this.receive(e52), false), this.globalScope = Bt(self) ? e51 : window;
  }
  registerMessageHandler(e51, t2) {
    this.messageHandlers[e51] = t2;
  }
  unregisterMessageHandler(e51) {
    delete this.messageHandlers[e51];
  }
  sendAsync(e51, t2) {
    return new Promise((n2, r2) => {
      let i2 = Math.round(Math.random() * 1e18).toString(36).substring(0, 10), a2 = t2 ? en(t2.signal, `abort`, () => {
        a2?.unsubscribe(), delete this.resolveRejects[i2];
        let n3 = { id: i2, type: `<cancel>`, origin: location.origin, targetMapId: e51.targetMapId, sourceMapId: this.mapId };
        this.target.postMessage(n3), r2(new hn(t2.signal.reason));
      }, Ov) : null;
      this.resolveRejects[i2] = { resolve: (e52) => {
        a2?.unsubscribe(), n2(e52);
      }, reject: (e52) => {
        a2?.unsubscribe(), r2(e52);
      } };
      let o2 = [], s2 = { ...e51, id: i2, sourceMapId: this.mapId, origin: location.origin, data: Pc(e51.data, o2) };
      this.target.postMessage(s2, { transfer: o2 });
    });
  }
  receive(e51) {
    let t2 = e51.data, n2 = t2.id, r2 = [`file://`, `resource://android`, `null`], i2 = [t2.origin, location.origin], a2 = t2.origin === location.origin, o2 = i2.some((e52) => r2.includes(e52));
    if (!(!a2 && !o2) && !(t2.targetMapId && this.mapId !== t2.targetMapId)) {
      if (t2.type === `<cancel>`) {
        delete this.tasks[n2];
        let e52 = this.abortControllers[n2];
        delete this.abortControllers[n2], e52 && e52.abort();
        return;
      }
      if (Bt(self) || t2.mustQueue) {
        this.tasks[n2] = t2, this.taskQueue.push(n2), this.invoker.trigger();
        return;
      }
      this.processTask(n2, t2);
    }
  }
  process() {
    if (this.taskQueue.length === 0) return;
    let e51 = this.taskQueue.shift(), t2 = this.tasks[e51];
    delete this.tasks[e51], this.taskQueue.length > 0 && this.invoker.trigger(), t2 && this.processTask(e51, t2);
  }
  async processTask(e51, t2) {
    if (t2.type === `<response>`) {
      let n3 = this.resolveRejects[e51];
      if (delete this.resolveRejects[e51], !n3) return;
      t2.error ? n3.reject($e(Fc(t2.error))) : n3.resolve(Fc(t2.data));
      return;
    }
    if (!this.messageHandlers[t2.type]) {
      this.completeTask(e51, null, null);
      return;
    }
    let n2 = Fc(t2.data), r2 = new AbortController();
    this.abortControllers[e51] = r2;
    try {
      let i2 = await this.messageHandlers[t2.type](t2.sourceMapId, n2, r2);
      this.completeTask(e51, null, i2);
    } catch (t3) {
      this.completeTask(e51, $e(t3));
    }
  }
  completeTask(e51, t2, n2) {
    let r2 = [];
    delete this.abortControllers[e51];
    let i2 = { id: e51, type: `<response>`, sourceMapId: this.mapId, origin: location.origin, error: t2 ? Pc(t2) : null, data: Pc(n2, r2) };
    this.target.postMessage(i2, { transfer: r2 });
  }
  remove() {
    this.invoker.remove(), this.subscription.unsubscribe();
  }
};
function Av(e51, t2, n2) {
  return !(e51 < 0 || e51 > 25 || n2 < 0 || n2 >= 2 ** e51 || t2 < 0 || t2 >= 2 ** e51);
}
var Mv = class {
  constructor(e51, t2, n2) {
    if (!Av(e51, t2, n2)) throw Error(`x=${t2}, y=${n2}, z=${e51} outside of bounds. 0<=x<${2 ** e51}, 0<=y<${2 ** e51} 0<=z<=25 `);
    this.z = e51, this.x = t2, this.y = n2, this.key = Fv(0, e51, e51, t2, n2);
  }
  equals(e51) {
    return this.z === e51.z && this.x === e51.x && this.y === e51.y;
  }
  url(e51, t2, n2) {
    let r2 = Lv(this.x, this.y, this.z), i2 = zv(this.z, this.x, this.y);
    return e51[(this.x + this.y) % e51.length].replace(/{prefix}/g, (this.x % 16).toString(16) + (this.y % 16).toString(16)).replace(/{z}/g, String(this.z)).replace(/{x}/g, String(this.x)).replace(/{y}/g, String(n2 === `tms` ? 2 ** this.z - this.y - 1 : this.y)).replace(/{ratio}/g, t2 > 1 ? `@2x` : ``).replace(/{quadkey}/g, i2).replace(/{bbox-epsg-3857}/g, r2);
  }
  isChildOf(e51) {
    let t2 = this.z - e51.z;
    return t2 > 0 && e51.x === this.x >> t2 && e51.y === this.y >> t2;
  }
  getTilePoint(e51) {
    let t2 = 2 ** this.z;
    return new l((e51.x * t2 - this.x) * j, (e51.y * t2 - this.y) * j);
  }
  toString() {
    return `${this.z}/${this.x}/${this.y}`;
  }
};
var Nv = class {
  constructor(e51, t2) {
    this.wrap = e51, this.canonical = t2, this.key = Fv(e51, t2.z, t2.z, t2.x, t2.y);
  }
};
var Pv = class e49 {
  constructor(e51, t2, n2, r2, i2) {
    if (this.terrainRttPosMatrix32f = null, e51 < n2) throw Error(`overscaledZ should be >= z; overscaledZ = ${e51}; z = ${n2}`);
    this.overscaledZ = e51, this.wrap = t2, this.canonical = new Mv(n2, +r2, +i2), this.key = Fv(t2, e51, n2, r2, i2);
  }
  clone() {
    return new e49(this.overscaledZ, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y);
  }
  equals(e51) {
    return this.overscaledZ === e51.overscaledZ && this.wrap === e51.wrap && this.canonical.equals(e51.canonical);
  }
  scaledTo(t2) {
    if (t2 > this.overscaledZ) throw Error(`targetZ > this.overscaledZ; targetZ = ${t2}; overscaledZ = ${this.overscaledZ}`);
    let n2 = this.canonical.z - t2;
    return t2 > this.canonical.z ? new e49(t2, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y) : new e49(t2, this.wrap, t2, this.canonical.x >> n2, this.canonical.y >> n2);
  }
  isOverscaled() {
    return this.overscaledZ > this.canonical.z;
  }
  calculateScaledKey(e51, t2) {
    if (e51 > this.overscaledZ) throw Error(`targetZ > this.overscaledZ; targetZ = ${e51}; overscaledZ = ${this.overscaledZ}`);
    let n2 = this.canonical.z - e51;
    return e51 > this.canonical.z ? Fv(this.wrap * +t2, e51, this.canonical.z, this.canonical.x, this.canonical.y) : Fv(this.wrap * +t2, e51, e51, this.canonical.x >> n2, this.canonical.y >> n2);
  }
  isChildOf(e51) {
    if (e51.wrap !== this.wrap || this.overscaledZ - e51.overscaledZ <= 0) return false;
    if (e51.overscaledZ === 0) return this.overscaledZ > 0;
    let t2 = this.canonical.z - e51.canonical.z;
    return t2 < 0 ? false : e51.canonical.x === this.canonical.x >> t2 && e51.canonical.y === this.canonical.y >> t2;
  }
  children(t2) {
    if (this.overscaledZ >= t2) return [new e49(this.overscaledZ + 1, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y)];
    let n2 = this.canonical.z + 1, r2 = this.canonical.x * 2, i2 = this.canonical.y * 2;
    return [new e49(n2, this.wrap, n2, r2, i2), new e49(n2, this.wrap, n2, r2 + 1, i2), new e49(n2, this.wrap, n2, r2, i2 + 1), new e49(n2, this.wrap, n2, r2 + 1, i2 + 1)];
  }
  isLessThan(e51) {
    return this.wrap < e51.wrap ? true : this.wrap > e51.wrap ? false : this.overscaledZ < e51.overscaledZ ? true : this.overscaledZ > e51.overscaledZ ? false : this.canonical.x < e51.canonical.x ? true : this.canonical.x > e51.canonical.x ? false : this.canonical.y < e51.canonical.y;
  }
  wrapped() {
    return new e49(this.overscaledZ, 0, this.canonical.z, this.canonical.x, this.canonical.y);
  }
  unwrapTo(t2) {
    return new e49(this.overscaledZ, t2, this.canonical.z, this.canonical.x, this.canonical.y);
  }
  overscaleFactor() {
    return 2 ** (this.overscaledZ - this.canonical.z);
  }
  toUnwrapped() {
    return new Nv(this.wrap, this.canonical);
  }
  toString() {
    return `${this.overscaledZ}/${this.canonical.x}/${this.canonical.y}`;
  }
  getTilePoint(e51) {
    return this.canonical.getTilePoint(new bm(e51.x - this.wrap, e51.y));
  }
  normalizeCoordinates(t2, n2, r2 = j) {
    if (t2 >= 0 && t2 < r2 && n2 >= 0 && n2 < r2) return { tileID: this, x: t2, y: n2 };
    let i2 = Math.floor(t2 / r2), a2 = Math.floor(n2 / r2), o2 = t2 - i2 * r2, s2 = n2 - a2 * r2, c2 = this.canonical.z, l2 = 1 << c2, u2 = this.canonical.y + a2;
    if (u2 < 0 || u2 >= l2) return null;
    let d2 = this.canonical.x + i2, f2 = this.wrap;
    return d2 < 0 ? (f2 -= Math.ceil(-d2 / l2), d2 = (d2 % l2 + l2) % l2) : d2 >= l2 && (f2 += Math.floor(d2 / l2), d2 %= l2), { tileID: new e49(this.overscaledZ, f2, c2, d2, u2), x: o2, y: s2 };
  }
};
function Fv(e51, t2, n2, r2, i2) {
  e51 *= 2, e51 < 0 && (e51 = e51 * -1 - 1);
  let a2 = 1 << n2;
  return (a2 * a2 * e51 + a2 * i2 + r2).toString(36) + n2.toString(36) + t2.toString(36);
}
var Iv = Math.PI * 6378137;
function Lv(e51, t2, n2) {
  t2 = 2 ** n2 - t2 - 1;
  let r2 = Rv(e51 * 256, t2 * 256, n2), i2 = Rv((e51 + 1) * 256, (t2 + 1) * 256, n2);
  return `${r2[0]},${r2[1]},${i2[0]},${i2[1]}`;
}
function Rv(e51, t2, n2) {
  let r2 = 2 * Iv / 256 / 2 ** n2;
  return [e51 * r2 - Iv, t2 * r2 - Iv];
}
function zv(e51, t2, n2) {
  let r2 = ``;
  for (let i2 = e51; i2 > 0; i2--) {
    let e52 = 1 << i2 - 1;
    r2 += (t2 & e52 ? 1 : 0) + (n2 & e52 ? 2 : 0);
  }
  return r2;
}
U(`CanonicalTileID`, Mv), U(`OverscaledTileID`, Pv, { omit: [`terrainRttPosMatrix32f`] });
var Vv = class {
  constructor(e51, t2) {
    this.feature = e51, this.type = e51.type, this.properties = e51.tags ? e51.tags : {}, this.extent = t2, `id` in e51 && (typeof e51.id == `string` ? this.id = parseInt(e51.id, 10) : typeof e51.id == `number` && !isNaN(e51.id) && (this.id = e51.id));
  }
  loadGeometry() {
    let e51 = [], t2 = this.feature.type === 1 ? [this.feature.geometry] : this.feature.geometry;
    for (let n2 of t2) {
      let t3 = [];
      for (let e52 of n2) t3.push(new l(e52[0], e52[1]));
      e51.push(t3);
    }
    return e51;
  }
};
var Hv = `_geojsonTileLayer`;
var Uv = class {
  constructor(e51, t2) {
    this.layers = { [Hv]: this }, this.name = Hv, this.version = t2 ? t2.version : 1, this.extent = t2 ? t2.extent : 4096, this.length = e51.length, this.features = e51;
  }
  feature(e51) {
    return new Vv(this.features[e51], this.extent);
  }
};
function Wv(e51, t2 = ``) {
  let n2 = new o_();
  return Gv(e51, n2, t2), n2.finish();
}
function Gv(e51, t2, n2 = ``) {
  for (let r2 in e51.layers) t2.writeMessage(3, (e52, t3) => Kv(e52, t3, n2), e51.layers[r2]);
}
function Kv(e51, t2, n2 = ``) {
  t2.writeVarintField(15, e51.version || 1), t2.writeStringField(1, e51.name || ``), t2.writeVarintField(5, e51.extent || 4096);
  let r2 = { jsonPrefix: n2, keys: [], values: [], keycache: {}, valuecache: {} };
  for (let n3 = 0; n3 < e51.length; n3++) r2.feature = e51.feature(n3), t2.writeMessage(2, qv, r2);
  let i2 = r2.keys;
  for (let e52 of i2) t2.writeStringField(3, e52);
  let a2 = r2.values;
  for (let e52 of a2) t2.writeMessage(4, Qv, e52);
}
function qv(e51, t2) {
  if (!e51.feature) return;
  let n2 = e51.feature;
  n2.id !== void 0 && t2.writeVarintField(1, n2.id), t2.writeMessage(2, Jv, e51), t2.writeVarintField(3, n2.type), t2.writeMessage(4, Zv, n2);
}
function Jv(e51, t2) {
  for (let n2 in e51.feature?.properties) {
    let r2 = e51.feature.properties[n2], i2 = e51.keycache[n2];
    if (r2 == null) continue;
    i2 === void 0 && (e51.keys.push(n2), i2 = e51.keys.length - 1, e51.keycache[n2] = i2), t2.writeVarint(i2), typeof r2 != `string` && typeof r2 != `boolean` && typeof r2 != `number` && (r2 = e51.jsonPrefix + JSON.stringify(r2));
    let a2 = typeof r2 + `:` + r2, o2 = e51.valuecache[a2];
    o2 === void 0 && (e51.values.push(r2), o2 = e51.values.length - 1, e51.valuecache[a2] = o2), t2.writeVarint(o2);
  }
}
function Yv(e51, t2) {
  return (t2 << 3) + (e51 & 7);
}
function Xv(e51) {
  return e51 << 1 ^ e51 >> 31;
}
function Zv(e51, t2) {
  let n2 = e51.loadGeometry(), r2 = e51.type, i2 = 0, a2 = 0;
  for (let o2 of n2) {
    let n3 = 1;
    r2 === 1 && (n3 = o2.length), t2.writeVarint(Yv(1, n3));
    let s2 = r2 === 3 ? o2.length - 1 : o2.length;
    for (let e52 = 0; e52 < s2; e52++) {
      e52 === 1 && r2 !== 1 && t2.writeVarint(Yv(2, s2 - 1));
      let n4 = o2[e52].x - i2, c2 = o2[e52].y - a2;
      t2.writeVarint(Xv(n4)), t2.writeVarint(Xv(c2)), i2 += n4, a2 += c2;
    }
    e51.type === 3 && t2.writeVarint(Yv(7, 1));
  }
}
function Qv(e51, t2) {
  let n2 = typeof e51;
  n2 === `string` ? t2.writeStringField(1, e51) : n2 === `boolean` ? t2.writeBooleanField(7, e51) : n2 === `number` && (e51 % 1 == 0 ? e51 < 0 ? t2.writeSVarintField(6, e51) : t2.writeVarintField(5, e51) : t2.writeDoubleField(3, e51));
}
var $v = class {
  constructor(e51) {
    this._stringToNumber = {}, this._numberToString = [];
    for (let t2 = 0; t2 < e51.length; t2++) {
      let n2 = e51[t2];
      this._stringToNumber[n2] = t2, this._numberToString[t2] = n2;
    }
  }
  encode(e51) {
    return this._stringToNumber[e51];
  }
  decode(e51) {
    if (e51 >= this._numberToString.length) throw Error(`Out of bounds. Index requested n=${e51} can't be >= this._numberToString.length ${this._numberToString.length}`);
    return this._numberToString[e51];
  }
};
var ey = class {
  constructor(e51, t2, n2, r2, i2) {
    this.type = `Feature`, this._vectorTileFeature = e51, this._x = n2, this._y = r2, this._z = t2;
    for (let t3 in e51.properties) typeof e51.properties[t3] != `string` || !e51.properties[t3].startsWith(`__$json__:`) || (e51.properties[t3] = JSON.parse(e51.properties[t3].slice(10)));
    this.properties = e51.properties, this.id = i2;
  }
  projectPoint(e51, t2, n2, r2) {
    return [(e51.x + t2) * 360 / r2 - 180, 360 / Math.PI * Math.atan(Math.exp((1 - (e51.y + n2) * 2 / r2) * Math.PI)) - 90];
  }
  projectLine(e51, t2, n2, r2) {
    return e51.map((e52) => this.projectPoint(e52, t2, n2, r2));
  }
  get geometry() {
    if (this._geometry) return this._geometry;
    let e51 = this._vectorTileFeature, t2 = e51.extent * 2 ** this._z, n2 = e51.extent * this._x, r2 = e51.extent * this._y, i2 = e51.loadGeometry();
    switch (e51.type) {
      case 1: {
        let e52 = [];
        for (let t3 of i2) e52.push(t3[0]);
        let a2 = this.projectLine(e52, n2, r2, t2);
        this._geometry = e52.length === 1 ? { type: `Point`, coordinates: a2[0] } : { type: `MultiPoint`, coordinates: a2 };
        break;
      }
      case 2: {
        let e52 = i2.map((e53) => this.projectLine(e53, n2, r2, t2));
        this._geometry = e52.length === 1 ? { type: `LineString`, coordinates: e52[0] } : { type: `MultiLineString`, coordinates: e52 };
        break;
      }
      case 3: {
        let e52 = im(i2), a2 = [];
        for (let i3 of e52) a2.push(i3.map((e53) => this.projectLine(e53, n2, r2, t2)));
        this._geometry = a2.length === 1 ? { type: `Polygon`, coordinates: a2[0] } : { type: `MultiPolygon`, coordinates: a2 };
        break;
      }
      default:
        throw Error(`unknown feature type: ${e51.type}`);
    }
    return this._geometry;
  }
  set geometry(e51) {
    this._geometry = e51;
  }
  toJSON() {
    let e51 = { geometry: this.geometry };
    for (let t2 in this) t2 !== `_geometry` && t2 !== `_vectorTileFeature` && t2 !== `_x` && t2 !== `_y` && t2 !== `_z` && (e51[t2] = this[t2]);
    return e51;
  }
};
var ty = class {
  constructor(e51, t2, n2) {
    this._name = e51, this.dataBuffer = t2, typeof n2 == `number` ? this._size = n2 : (this.nullabilityBuffer = n2, this._size = n2.size());
  }
  getValue(e51) {
    return this.nullabilityBuffer && !this.nullabilityBuffer.get(e51) ? null : this.getValueFromBuffer(e51);
  }
  has(e51) {
    return this.nullabilityBuffer?.get(e51) || !this.nullabilityBuffer;
  }
  get name() {
    return this._name;
  }
  get size() {
    return this._size;
  }
};
var ny = class extends ty {
};
var ry = class extends ny {
  getValueFromBuffer(e51) {
    return this.dataBuffer[e51];
  }
};
var iy = class extends ny {
  getValueFromBuffer(e51) {
    return this.dataBuffer[e51];
  }
};
var ay = class extends ty {
  constructor(e51, t2, n2, r2) {
    super(e51, t2, r2), this.delta = n2;
  }
};
var oy = class extends ay {
  constructor(e51, t2, n2, r2) {
    super(e51, Int32Array.of(t2), n2, r2);
  }
  getValueFromBuffer(e51) {
    return this.dataBuffer[0] + e51 * this.delta;
  }
};
var sy = class extends ty {
  constructor(e51, t2, n2, r2) {
    super(e51, r2 ? Int32Array.of(t2) : Uint32Array.of(t2), n2);
  }
  getValueFromBuffer(e51) {
    return this.dataBuffer[0];
  }
};
var cy = class {
  constructor(e51, t2, n2, r2, i2 = 4096) {
    if (this._name = e51, this._geometryVector = t2, this._idVector = n2, this._propertyVectors = r2, this._extent = i2, e51.length === 0) throw Error(`Missing layer name`);
  }
  get name() {
    return this._name;
  }
  get idVector() {
    return this._idVector;
  }
  get geometryVector() {
    return this._geometryVector;
  }
  get propertyVectors() {
    return this._propertyVectors;
  }
  getPropertyVector(e51) {
    return this.propertyVectorsMap ||= new Map(this._propertyVectors.map((e52) => [e52.name, e52])), this.propertyVectorsMap.get(e51);
  }
  get numFeatures() {
    return this.geometryVector.numGeometries;
  }
  get extent() {
    return this._extent;
  }
  getFeatures() {
    let e51 = [], t2 = this.geometryVector.getGeometries();
    for (let n2 = 0; n2 < this.numFeatures; n2++) {
      let r2;
      if (this.idVector) {
        let e52 = this.idVector.getValue(n2);
        r2 = this.containsMaxSafeIntegerValues(this.idVector) && e52 !== null ? Number(e52) : e52;
      }
      let i2 = { coordinates: t2[n2], type: this.geometryVector.geometryType(n2) }, a2 = {};
      for (let e52 of this.propertyVectors) {
        if (!e52) continue;
        let t3 = e52.name, r3 = e52.getValue(n2);
        r3 !== null && (a2[t3] = r3);
      }
      e51.push({ id: r2, geometry: i2, properties: a2 });
    }
    return e51;
  }
  containsMaxSafeIntegerValues(e51) {
    return e51 instanceof ry || e51 instanceof sy || e51 instanceof oy || e51 instanceof iy;
  }
};
var ly = { FEATURE: 0, VERTEX: 1 };
var X = { BOOLEAN: 0, INT_8: 1, UINT_8: 2, INT_32: 3, UINT_32: 4, INT_64: 5, UINT_64: 6, FLOAT: 7, DOUBLE: 8, STRING: 9 };
var uy = { GEOMETRY: 0, STRUCT: 1 };
var dy = { ID: 0 };
var fy = class {
  constructor(e51) {
    this.value = e51;
  }
  get() {
    return this.value;
  }
  set(e51) {
    this.value = e51;
  }
  increment() {
    return this.value++;
  }
  add(e51) {
    this.value += e51;
  }
};
var Z;
(function(e51) {
  e51.NONE = `NONE`, e51.DELTA = `DELTA`, e51.COMPONENTWISE_DELTA = `COMPONENTWISE_DELTA`, e51.RLE = `RLE`, e51.MORTON = `MORTON`, e51.PDE = `PDE`;
})(Z ||= {});
var py;
(function(e51) {
  e51.NONE = `NONE`, e51.FAST_PFOR = `FAST_PFOR`, e51.VARINT = `VARINT`;
})(py ||= {});
var my = new Uint32Array(33);
my[0] = 0;
for (let e51 = 1; e51 <= 32; e51++) my[e51] = e51 === 32 ? 4294967295 : 4294967295 >>> 32 - e51;
var hy = my;
var gy = 65536;
function _y(e51, t2) {
  return e51 - e51 % t2;
}
function vy(e51) {
  return _y(e51 + 31, 32);
}
function yy(e51) {
  if (!Number.isFinite(e51) || e51 <= 0) return gy;
  let t2 = _y(Math.floor(e51), 256);
  return t2 === 0 ? 256 : t2;
}
function by(e51) {
  let t2 = e51 >>> 0;
  return ((t2 & 255) << 24 | (t2 & 65280) << 8 | t2 >>> 8 & 65280 | t2 >>> 24 & 255) >>> 0;
}
function xy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0;
  n2[i2++] = a2 >>> 0 & 3, n2[i2++] = a2 >>> 2 & 3, n2[i2++] = a2 >>> 4 & 3, n2[i2++] = a2 >>> 6 & 3, n2[i2++] = a2 >>> 8 & 3, n2[i2++] = a2 >>> 10 & 3, n2[i2++] = a2 >>> 12 & 3, n2[i2++] = a2 >>> 14 & 3, n2[i2++] = a2 >>> 16 & 3, n2[i2++] = a2 >>> 18 & 3, n2[i2++] = a2 >>> 20 & 3, n2[i2++] = a2 >>> 22 & 3, n2[i2++] = a2 >>> 24 & 3, n2[i2++] = a2 >>> 26 & 3, n2[i2++] = a2 >>> 28 & 3, n2[i2++] = a2 >>> 30 & 3, n2[i2++] = o2 >>> 0 & 3, n2[i2++] = o2 >>> 2 & 3, n2[i2++] = o2 >>> 4 & 3, n2[i2++] = o2 >>> 6 & 3, n2[i2++] = o2 >>> 8 & 3, n2[i2++] = o2 >>> 10 & 3, n2[i2++] = o2 >>> 12 & 3, n2[i2++] = o2 >>> 14 & 3, n2[i2++] = o2 >>> 16 & 3, n2[i2++] = o2 >>> 18 & 3, n2[i2++] = o2 >>> 20 & 3, n2[i2++] = o2 >>> 22 & 3, n2[i2++] = o2 >>> 24 & 3, n2[i2++] = o2 >>> 26 & 3, n2[i2++] = o2 >>> 28 & 3, n2[i2] = o2 >>> 30 & 3;
}
function Sy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0;
  n2[i2++] = a2 >>> 0 & 7, n2[i2++] = a2 >>> 3 & 7, n2[i2++] = a2 >>> 6 & 7, n2[i2++] = a2 >>> 9 & 7, n2[i2++] = a2 >>> 12 & 7, n2[i2++] = a2 >>> 15 & 7, n2[i2++] = a2 >>> 18 & 7, n2[i2++] = a2 >>> 21 & 7, n2[i2++] = a2 >>> 24 & 7, n2[i2++] = a2 >>> 27 & 7, n2[i2++] = (a2 >>> 30 | (o2 & 1) << 2) & 7, n2[i2++] = o2 >>> 1 & 7, n2[i2++] = o2 >>> 4 & 7, n2[i2++] = o2 >>> 7 & 7, n2[i2++] = o2 >>> 10 & 7, n2[i2++] = o2 >>> 13 & 7, n2[i2++] = o2 >>> 16 & 7, n2[i2++] = o2 >>> 19 & 7, n2[i2++] = o2 >>> 22 & 7, n2[i2++] = o2 >>> 25 & 7, n2[i2++] = o2 >>> 28 & 7, n2[i2++] = (o2 >>> 31 | (s2 & 3) << 1) & 7, n2[i2++] = s2 >>> 2 & 7, n2[i2++] = s2 >>> 5 & 7, n2[i2++] = s2 >>> 8 & 7, n2[i2++] = s2 >>> 11 & 7, n2[i2++] = s2 >>> 14 & 7, n2[i2++] = s2 >>> 17 & 7, n2[i2++] = s2 >>> 20 & 7, n2[i2++] = s2 >>> 23 & 7, n2[i2++] = s2 >>> 26 & 7, n2[i2] = s2 >>> 29 & 7;
}
function Cy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0;
  n2[i2++] = a2 >>> 0 & 15, n2[i2++] = a2 >>> 4 & 15, n2[i2++] = a2 >>> 8 & 15, n2[i2++] = a2 >>> 12 & 15, n2[i2++] = a2 >>> 16 & 15, n2[i2++] = a2 >>> 20 & 15, n2[i2++] = a2 >>> 24 & 15, n2[i2++] = a2 >>> 28 & 15, n2[i2++] = o2 >>> 0 & 15, n2[i2++] = o2 >>> 4 & 15, n2[i2++] = o2 >>> 8 & 15, n2[i2++] = o2 >>> 12 & 15, n2[i2++] = o2 >>> 16 & 15, n2[i2++] = o2 >>> 20 & 15, n2[i2++] = o2 >>> 24 & 15, n2[i2++] = o2 >>> 28 & 15, n2[i2++] = s2 >>> 0 & 15, n2[i2++] = s2 >>> 4 & 15, n2[i2++] = s2 >>> 8 & 15, n2[i2++] = s2 >>> 12 & 15, n2[i2++] = s2 >>> 16 & 15, n2[i2++] = s2 >>> 20 & 15, n2[i2++] = s2 >>> 24 & 15, n2[i2++] = s2 >>> 28 & 15, n2[i2++] = c2 >>> 0 & 15, n2[i2++] = c2 >>> 4 & 15, n2[i2++] = c2 >>> 8 & 15, n2[i2++] = c2 >>> 12 & 15, n2[i2++] = c2 >>> 16 & 15, n2[i2++] = c2 >>> 20 & 15, n2[i2++] = c2 >>> 24 & 15, n2[i2] = c2 >>> 28 & 15;
}
function wy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0;
  n2[i2++] = a2 >>> 0 & 31, n2[i2++] = a2 >>> 5 & 31, n2[i2++] = a2 >>> 10 & 31, n2[i2++] = a2 >>> 15 & 31, n2[i2++] = a2 >>> 20 & 31, n2[i2++] = a2 >>> 25 & 31, n2[i2++] = (a2 >>> 30 | (o2 & 7) << 2) & 31, n2[i2++] = o2 >>> 3 & 31, n2[i2++] = o2 >>> 8 & 31, n2[i2++] = o2 >>> 13 & 31, n2[i2++] = o2 >>> 18 & 31, n2[i2++] = o2 >>> 23 & 31, n2[i2++] = (o2 >>> 28 | (s2 & 1) << 4) & 31, n2[i2++] = s2 >>> 1 & 31, n2[i2++] = s2 >>> 6 & 31, n2[i2++] = s2 >>> 11 & 31, n2[i2++] = s2 >>> 16 & 31, n2[i2++] = s2 >>> 21 & 31, n2[i2++] = s2 >>> 26 & 31, n2[i2++] = (s2 >>> 31 | (c2 & 15) << 1) & 31, n2[i2++] = c2 >>> 4 & 31, n2[i2++] = c2 >>> 9 & 31, n2[i2++] = c2 >>> 14 & 31, n2[i2++] = c2 >>> 19 & 31, n2[i2++] = c2 >>> 24 & 31, n2[i2++] = (c2 >>> 29 | (l2 & 3) << 3) & 31, n2[i2++] = l2 >>> 2 & 31, n2[i2++] = l2 >>> 7 & 31, n2[i2++] = l2 >>> 12 & 31, n2[i2++] = l2 >>> 17 & 31, n2[i2++] = l2 >>> 22 & 31, n2[i2] = l2 >>> 27 & 31;
}
function Ty(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0;
  n2[i2++] = a2 >>> 0 & 63, n2[i2++] = a2 >>> 6 & 63, n2[i2++] = a2 >>> 12 & 63, n2[i2++] = a2 >>> 18 & 63, n2[i2++] = a2 >>> 24 & 63, n2[i2++] = (a2 >>> 30 | (o2 & 15) << 2) & 63, n2[i2++] = o2 >>> 4 & 63, n2[i2++] = o2 >>> 10 & 63, n2[i2++] = o2 >>> 16 & 63, n2[i2++] = o2 >>> 22 & 63, n2[i2++] = (o2 >>> 28 | (s2 & 3) << 4) & 63, n2[i2++] = s2 >>> 2 & 63, n2[i2++] = s2 >>> 8 & 63, n2[i2++] = s2 >>> 14 & 63, n2[i2++] = s2 >>> 20 & 63, n2[i2++] = s2 >>> 26 & 63, n2[i2++] = c2 >>> 0 & 63, n2[i2++] = c2 >>> 6 & 63, n2[i2++] = c2 >>> 12 & 63, n2[i2++] = c2 >>> 18 & 63, n2[i2++] = c2 >>> 24 & 63, n2[i2++] = (c2 >>> 30 | (l2 & 15) << 2) & 63, n2[i2++] = l2 >>> 4 & 63, n2[i2++] = l2 >>> 10 & 63, n2[i2++] = l2 >>> 16 & 63, n2[i2++] = l2 >>> 22 & 63, n2[i2++] = (l2 >>> 28 | (u2 & 3) << 4) & 63, n2[i2++] = u2 >>> 2 & 63, n2[i2++] = u2 >>> 8 & 63, n2[i2++] = u2 >>> 14 & 63, n2[i2++] = u2 >>> 20 & 63, n2[i2] = u2 >>> 26 & 63;
}
function Ey(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0;
  n2[i2++] = a2 >>> 0 & 127, n2[i2++] = a2 >>> 7 & 127, n2[i2++] = a2 >>> 14 & 127, n2[i2++] = a2 >>> 21 & 127, n2[i2++] = (a2 >>> 28 | (o2 & 7) << 4) & 127, n2[i2++] = o2 >>> 3 & 127, n2[i2++] = o2 >>> 10 & 127, n2[i2++] = o2 >>> 17 & 127, n2[i2++] = o2 >>> 24 & 127, n2[i2++] = (o2 >>> 31 | (s2 & 63) << 1) & 127, n2[i2++] = s2 >>> 6 & 127, n2[i2++] = s2 >>> 13 & 127, n2[i2++] = s2 >>> 20 & 127, n2[i2++] = (s2 >>> 27 | (c2 & 3) << 5) & 127, n2[i2++] = c2 >>> 2 & 127, n2[i2++] = c2 >>> 9 & 127, n2[i2++] = c2 >>> 16 & 127, n2[i2++] = c2 >>> 23 & 127, n2[i2++] = (c2 >>> 30 | (l2 & 31) << 2) & 127, n2[i2++] = l2 >>> 5 & 127, n2[i2++] = l2 >>> 12 & 127, n2[i2++] = l2 >>> 19 & 127, n2[i2++] = (l2 >>> 26 | (u2 & 1) << 6) & 127, n2[i2++] = u2 >>> 1 & 127, n2[i2++] = u2 >>> 8 & 127, n2[i2++] = u2 >>> 15 & 127, n2[i2++] = u2 >>> 22 & 127, n2[i2++] = (u2 >>> 29 | (d2 & 15) << 3) & 127, n2[i2++] = d2 >>> 4 & 127, n2[i2++] = d2 >>> 11 & 127, n2[i2++] = d2 >>> 18 & 127, n2[i2] = d2 >>> 25 & 127;
}
function Dy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0, f2 = e51[t2 + 7] >>> 0;
  n2[i2++] = a2 >>> 0 & 255, n2[i2++] = a2 >>> 8 & 255, n2[i2++] = a2 >>> 16 & 255, n2[i2++] = a2 >>> 24 & 255, n2[i2++] = o2 >>> 0 & 255, n2[i2++] = o2 >>> 8 & 255, n2[i2++] = o2 >>> 16 & 255, n2[i2++] = o2 >>> 24 & 255, n2[i2++] = s2 >>> 0 & 255, n2[i2++] = s2 >>> 8 & 255, n2[i2++] = s2 >>> 16 & 255, n2[i2++] = s2 >>> 24 & 255, n2[i2++] = c2 >>> 0 & 255, n2[i2++] = c2 >>> 8 & 255, n2[i2++] = c2 >>> 16 & 255, n2[i2++] = c2 >>> 24 & 255, n2[i2++] = l2 >>> 0 & 255, n2[i2++] = l2 >>> 8 & 255, n2[i2++] = l2 >>> 16 & 255, n2[i2++] = l2 >>> 24 & 255, n2[i2++] = u2 >>> 0 & 255, n2[i2++] = u2 >>> 8 & 255, n2[i2++] = u2 >>> 16 & 255, n2[i2++] = u2 >>> 24 & 255, n2[i2++] = d2 >>> 0 & 255, n2[i2++] = d2 >>> 8 & 255, n2[i2++] = d2 >>> 16 & 255, n2[i2++] = d2 >>> 24 & 255, n2[i2++] = f2 >>> 0 & 255, n2[i2++] = f2 >>> 8 & 255, n2[i2++] = f2 >>> 16 & 255, n2[i2] = f2 >>> 24 & 255;
}
function Oy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0, f2 = e51[t2 + 7] >>> 0, p2 = e51[t2 + 8] >>> 0;
  n2[i2++] = a2 >>> 0 & 511, n2[i2++] = a2 >>> 9 & 511, n2[i2++] = a2 >>> 18 & 511, n2[i2++] = (a2 >>> 27 | (o2 & 15) << 5) & 511, n2[i2++] = o2 >>> 4 & 511, n2[i2++] = o2 >>> 13 & 511, n2[i2++] = o2 >>> 22 & 511, n2[i2++] = (o2 >>> 31 | (s2 & 255) << 1) & 511, n2[i2++] = s2 >>> 8 & 511, n2[i2++] = s2 >>> 17 & 511, n2[i2++] = (s2 >>> 26 | (c2 & 7) << 6) & 511, n2[i2++] = c2 >>> 3 & 511, n2[i2++] = c2 >>> 12 & 511, n2[i2++] = c2 >>> 21 & 511, n2[i2++] = (c2 >>> 30 | (l2 & 127) << 2) & 511, n2[i2++] = l2 >>> 7 & 511, n2[i2++] = l2 >>> 16 & 511, n2[i2++] = (l2 >>> 25 | (u2 & 3) << 7) & 511, n2[i2++] = u2 >>> 2 & 511, n2[i2++] = u2 >>> 11 & 511, n2[i2++] = u2 >>> 20 & 511, n2[i2++] = (u2 >>> 29 | (d2 & 63) << 3) & 511, n2[i2++] = d2 >>> 6 & 511, n2[i2++] = d2 >>> 15 & 511, n2[i2++] = (d2 >>> 24 | (f2 & 1) << 8) & 511, n2[i2++] = f2 >>> 1 & 511, n2[i2++] = f2 >>> 10 & 511, n2[i2++] = f2 >>> 19 & 511, n2[i2++] = (f2 >>> 28 | (p2 & 31) << 4) & 511, n2[i2++] = p2 >>> 5 & 511, n2[i2++] = p2 >>> 14 & 511, n2[i2] = p2 >>> 23 & 511;
}
function ky(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0, f2 = e51[t2 + 7] >>> 0, p2 = e51[t2 + 8] >>> 0, m2 = e51[t2 + 9] >>> 0;
  n2[i2++] = a2 >>> 0 & 1023, n2[i2++] = a2 >>> 10 & 1023, n2[i2++] = a2 >>> 20 & 1023, n2[i2++] = (a2 >>> 30 | (o2 & 255) << 2) & 1023, n2[i2++] = o2 >>> 8 & 1023, n2[i2++] = o2 >>> 18 & 1023, n2[i2++] = (o2 >>> 28 | (s2 & 63) << 4) & 1023, n2[i2++] = s2 >>> 6 & 1023, n2[i2++] = s2 >>> 16 & 1023, n2[i2++] = (s2 >>> 26 | (c2 & 15) << 6) & 1023, n2[i2++] = c2 >>> 4 & 1023, n2[i2++] = c2 >>> 14 & 1023, n2[i2++] = (c2 >>> 24 | (l2 & 3) << 8) & 1023, n2[i2++] = l2 >>> 2 & 1023, n2[i2++] = l2 >>> 12 & 1023, n2[i2++] = l2 >>> 22 & 1023, n2[i2++] = u2 >>> 0 & 1023, n2[i2++] = u2 >>> 10 & 1023, n2[i2++] = u2 >>> 20 & 1023, n2[i2++] = (u2 >>> 30 | (d2 & 255) << 2) & 1023, n2[i2++] = d2 >>> 8 & 1023, n2[i2++] = d2 >>> 18 & 1023, n2[i2++] = (d2 >>> 28 | (f2 & 63) << 4) & 1023, n2[i2++] = f2 >>> 6 & 1023, n2[i2++] = f2 >>> 16 & 1023, n2[i2++] = (f2 >>> 26 | (p2 & 15) << 6) & 1023, n2[i2++] = p2 >>> 4 & 1023, n2[i2++] = p2 >>> 14 & 1023, n2[i2++] = (p2 >>> 24 | (m2 & 3) << 8) & 1023, n2[i2++] = m2 >>> 2 & 1023, n2[i2++] = m2 >>> 12 & 1023, n2[i2] = m2 >>> 22 & 1023;
}
function Ay(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0, f2 = e51[t2 + 7] >>> 0, p2 = e51[t2 + 8] >>> 0, m2 = e51[t2 + 9] >>> 0, h2 = e51[t2 + 10] >>> 0;
  n2[i2++] = a2 >>> 0 & 2047, n2[i2++] = a2 >>> 11 & 2047, n2[i2++] = (a2 >>> 22 | (o2 & 1) << 10) & 2047, n2[i2++] = o2 >>> 1 & 2047, n2[i2++] = o2 >>> 12 & 2047, n2[i2++] = (o2 >>> 23 | (s2 & 3) << 9) & 2047, n2[i2++] = s2 >>> 2 & 2047, n2[i2++] = s2 >>> 13 & 2047, n2[i2++] = (s2 >>> 24 | (c2 & 7) << 8) & 2047, n2[i2++] = c2 >>> 3 & 2047, n2[i2++] = c2 >>> 14 & 2047, n2[i2++] = (c2 >>> 25 | (l2 & 15) << 7) & 2047, n2[i2++] = l2 >>> 4 & 2047, n2[i2++] = l2 >>> 15 & 2047, n2[i2++] = (l2 >>> 26 | (u2 & 31) << 6) & 2047, n2[i2++] = u2 >>> 5 & 2047, n2[i2++] = u2 >>> 16 & 2047, n2[i2++] = (u2 >>> 27 | (d2 & 63) << 5) & 2047, n2[i2++] = d2 >>> 6 & 2047, n2[i2++] = d2 >>> 17 & 2047, n2[i2++] = (d2 >>> 28 | (f2 & 127) << 4) & 2047, n2[i2++] = f2 >>> 7 & 2047, n2[i2++] = f2 >>> 18 & 2047, n2[i2++] = (f2 >>> 29 | (p2 & 255) << 3) & 2047, n2[i2++] = p2 >>> 8 & 2047, n2[i2++] = p2 >>> 19 & 2047, n2[i2++] = (p2 >>> 30 | (m2 & 511) << 2) & 2047, n2[i2++] = m2 >>> 9 & 2047, n2[i2++] = m2 >>> 20 & 2047, n2[i2++] = (m2 >>> 31 | (h2 & 1023) << 1) & 2047, n2[i2++] = h2 >>> 10 & 2047, n2[i2] = h2 >>> 21 & 2047;
}
function jy(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0, f2 = e51[t2 + 7] >>> 0, p2 = e51[t2 + 8] >>> 0, m2 = e51[t2 + 9] >>> 0, h2 = e51[t2 + 10] >>> 0, g2 = e51[t2 + 11] >>> 0;
  n2[i2++] = a2 >>> 0 & 4095, n2[i2++] = a2 >>> 12 & 4095, n2[i2++] = (a2 >>> 24 | (o2 & 15) << 8) & 4095, n2[i2++] = o2 >>> 4 & 4095, n2[i2++] = o2 >>> 16 & 4095, n2[i2++] = (o2 >>> 28 | (s2 & 255) << 4) & 4095, n2[i2++] = s2 >>> 8 & 4095, n2[i2++] = s2 >>> 20 & 4095, n2[i2++] = c2 >>> 0 & 4095, n2[i2++] = c2 >>> 12 & 4095, n2[i2++] = (c2 >>> 24 | (l2 & 15) << 8) & 4095, n2[i2++] = l2 >>> 4 & 4095, n2[i2++] = l2 >>> 16 & 4095, n2[i2++] = (l2 >>> 28 | (u2 & 255) << 4) & 4095, n2[i2++] = u2 >>> 8 & 4095, n2[i2++] = u2 >>> 20 & 4095, n2[i2++] = d2 >>> 0 & 4095, n2[i2++] = d2 >>> 12 & 4095, n2[i2++] = (d2 >>> 24 | (f2 & 15) << 8) & 4095, n2[i2++] = f2 >>> 4 & 4095, n2[i2++] = f2 >>> 16 & 4095, n2[i2++] = (f2 >>> 28 | (p2 & 255) << 4) & 4095, n2[i2++] = p2 >>> 8 & 4095, n2[i2++] = p2 >>> 20 & 4095, n2[i2++] = m2 >>> 0 & 4095, n2[i2++] = m2 >>> 12 & 4095, n2[i2++] = (m2 >>> 24 | (h2 & 15) << 8) & 4095, n2[i2++] = h2 >>> 4 & 4095, n2[i2++] = h2 >>> 16 & 4095, n2[i2++] = (h2 >>> 28 | (g2 & 255) << 4) & 4095, n2[i2++] = g2 >>> 8 & 4095, n2[i2] = g2 >>> 20 & 4095;
}
function My(e51, t2, n2, r2) {
  let i2 = r2, a2 = e51[t2] >>> 0, o2 = e51[t2 + 1] >>> 0, s2 = e51[t2 + 2] >>> 0, c2 = e51[t2 + 3] >>> 0, l2 = e51[t2 + 4] >>> 0, u2 = e51[t2 + 5] >>> 0, d2 = e51[t2 + 6] >>> 0, f2 = e51[t2 + 7] >>> 0, p2 = e51[t2 + 8] >>> 0, m2 = e51[t2 + 9] >>> 0, h2 = e51[t2 + 10] >>> 0, g2 = e51[t2 + 11] >>> 0, _ = e51[t2 + 12] >>> 0, v = e51[t2 + 13] >>> 0, y = e51[t2 + 14] >>> 0, b = e51[t2 + 15] >>> 0;
  n2[i2++] = a2 >>> 0 & 65535, n2[i2++] = a2 >>> 16 & 65535, n2[i2++] = o2 >>> 0 & 65535, n2[i2++] = o2 >>> 16 & 65535, n2[i2++] = s2 >>> 0 & 65535, n2[i2++] = s2 >>> 16 & 65535, n2[i2++] = c2 >>> 0 & 65535, n2[i2++] = c2 >>> 16 & 65535, n2[i2++] = l2 >>> 0 & 65535, n2[i2++] = l2 >>> 16 & 65535, n2[i2++] = u2 >>> 0 & 65535, n2[i2++] = u2 >>> 16 & 65535, n2[i2++] = d2 >>> 0 & 65535, n2[i2++] = d2 >>> 16 & 65535, n2[i2++] = f2 >>> 0 & 65535, n2[i2++] = f2 >>> 16 & 65535, n2[i2++] = p2 >>> 0 & 65535, n2[i2++] = p2 >>> 16 & 65535, n2[i2++] = m2 >>> 0 & 65535, n2[i2++] = m2 >>> 16 & 65535, n2[i2++] = h2 >>> 0 & 65535, n2[i2++] = h2 >>> 16 & 65535, n2[i2++] = g2 >>> 0 & 65535, n2[i2++] = g2 >>> 16 & 65535, n2[i2++] = _ >>> 0 & 65535, n2[i2++] = _ >>> 16 & 65535, n2[i2++] = v >>> 0 & 65535, n2[i2++] = v >>> 16 & 65535, n2[i2++] = y >>> 0 & 65535, n2[i2++] = y >>> 16 & 65535, n2[i2++] = b >>> 0 & 65535, n2[i2] = b >>> 16 & 65535;
}
function Ny(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 1, n2[i2++] = t4 >>> 1 & 1, n2[i2++] = t4 >>> 2 & 1, n2[i2++] = t4 >>> 3 & 1, n2[i2++] = t4 >>> 4 & 1, n2[i2++] = t4 >>> 5 & 1, n2[i2++] = t4 >>> 6 & 1, n2[i2++] = t4 >>> 7 & 1, n2[i2++] = t4 >>> 8 & 1, n2[i2++] = t4 >>> 9 & 1, n2[i2++] = t4 >>> 10 & 1, n2[i2++] = t4 >>> 11 & 1, n2[i2++] = t4 >>> 12 & 1, n2[i2++] = t4 >>> 13 & 1, n2[i2++] = t4 >>> 14 & 1, n2[i2++] = t4 >>> 15 & 1, n2[i2++] = t4 >>> 16 & 1, n2[i2++] = t4 >>> 17 & 1, n2[i2++] = t4 >>> 18 & 1, n2[i2++] = t4 >>> 19 & 1, n2[i2++] = t4 >>> 20 & 1, n2[i2++] = t4 >>> 21 & 1, n2[i2++] = t4 >>> 22 & 1, n2[i2++] = t4 >>> 23 & 1, n2[i2++] = t4 >>> 24 & 1, n2[i2++] = t4 >>> 25 & 1, n2[i2++] = t4 >>> 26 & 1, n2[i2++] = t4 >>> 27 & 1, n2[i2++] = t4 >>> 28 & 1, n2[i2++] = t4 >>> 29 & 1, n2[i2++] = t4 >>> 30 & 1, n2[i2++] = t4 >>> 31 & 1;
  }
}
function Py(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 3, n2[i2++] = t4 >>> 2 & 3, n2[i2++] = t4 >>> 4 & 3, n2[i2++] = t4 >>> 6 & 3, n2[i2++] = t4 >>> 8 & 3, n2[i2++] = t4 >>> 10 & 3, n2[i2++] = t4 >>> 12 & 3, n2[i2++] = t4 >>> 14 & 3, n2[i2++] = t4 >>> 16 & 3, n2[i2++] = t4 >>> 18 & 3, n2[i2++] = t4 >>> 20 & 3, n2[i2++] = t4 >>> 22 & 3, n2[i2++] = t4 >>> 24 & 3, n2[i2++] = t4 >>> 26 & 3, n2[i2++] = t4 >>> 28 & 3, n2[i2++] = t4 >>> 30 & 3, n2[i2++] = r3 >>> 0 & 3, n2[i2++] = r3 >>> 2 & 3, n2[i2++] = r3 >>> 4 & 3, n2[i2++] = r3 >>> 6 & 3, n2[i2++] = r3 >>> 8 & 3, n2[i2++] = r3 >>> 10 & 3, n2[i2++] = r3 >>> 12 & 3, n2[i2++] = r3 >>> 14 & 3, n2[i2++] = r3 >>> 16 & 3, n2[i2++] = r3 >>> 18 & 3, n2[i2++] = r3 >>> 20 & 3, n2[i2++] = r3 >>> 22 & 3, n2[i2++] = r3 >>> 24 & 3, n2[i2++] = r3 >>> 26 & 3, n2[i2++] = r3 >>> 28 & 3, n2[i2++] = r3 >>> 30 & 3;
  }
}
function Fy(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0, o2 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 7, n2[i2++] = t4 >>> 3 & 7, n2[i2++] = t4 >>> 6 & 7, n2[i2++] = t4 >>> 9 & 7, n2[i2++] = t4 >>> 12 & 7, n2[i2++] = t4 >>> 15 & 7, n2[i2++] = t4 >>> 18 & 7, n2[i2++] = t4 >>> 21 & 7, n2[i2++] = t4 >>> 24 & 7, n2[i2++] = t4 >>> 27 & 7, n2[i2++] = (t4 >>> 30 | (r3 & 1) << 2) & 7, n2[i2++] = r3 >>> 1 & 7, n2[i2++] = r3 >>> 4 & 7, n2[i2++] = r3 >>> 7 & 7, n2[i2++] = r3 >>> 10 & 7, n2[i2++] = r3 >>> 13 & 7, n2[i2++] = r3 >>> 16 & 7, n2[i2++] = r3 >>> 19 & 7, n2[i2++] = r3 >>> 22 & 7, n2[i2++] = r3 >>> 25 & 7, n2[i2++] = r3 >>> 28 & 7, n2[i2++] = (r3 >>> 31 | (o2 & 3) << 1) & 7, n2[i2++] = o2 >>> 2 & 7, n2[i2++] = o2 >>> 5 & 7, n2[i2++] = o2 >>> 8 & 7, n2[i2++] = o2 >>> 11 & 7, n2[i2++] = o2 >>> 14 & 7, n2[i2++] = o2 >>> 17 & 7, n2[i2++] = o2 >>> 20 & 7, n2[i2++] = o2 >>> 23 & 7, n2[i2++] = o2 >>> 26 & 7, n2[i2++] = o2 >>> 29 & 7;
  }
}
function Iy(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0, o2 = e51[a2++] >>> 0, s2 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 15, n2[i2++] = t4 >>> 4 & 15, n2[i2++] = t4 >>> 8 & 15, n2[i2++] = t4 >>> 12 & 15, n2[i2++] = t4 >>> 16 & 15, n2[i2++] = t4 >>> 20 & 15, n2[i2++] = t4 >>> 24 & 15, n2[i2++] = t4 >>> 28 & 15, n2[i2++] = r3 >>> 0 & 15, n2[i2++] = r3 >>> 4 & 15, n2[i2++] = r3 >>> 8 & 15, n2[i2++] = r3 >>> 12 & 15, n2[i2++] = r3 >>> 16 & 15, n2[i2++] = r3 >>> 20 & 15, n2[i2++] = r3 >>> 24 & 15, n2[i2++] = r3 >>> 28 & 15, n2[i2++] = o2 >>> 0 & 15, n2[i2++] = o2 >>> 4 & 15, n2[i2++] = o2 >>> 8 & 15, n2[i2++] = o2 >>> 12 & 15, n2[i2++] = o2 >>> 16 & 15, n2[i2++] = o2 >>> 20 & 15, n2[i2++] = o2 >>> 24 & 15, n2[i2++] = o2 >>> 28 & 15, n2[i2++] = s2 >>> 0 & 15, n2[i2++] = s2 >>> 4 & 15, n2[i2++] = s2 >>> 8 & 15, n2[i2++] = s2 >>> 12 & 15, n2[i2++] = s2 >>> 16 & 15, n2[i2++] = s2 >>> 20 & 15, n2[i2++] = s2 >>> 24 & 15, n2[i2++] = s2 >>> 28 & 15;
  }
}
function Ly(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0, o2 = e51[a2++] >>> 0, s2 = e51[a2++] >>> 0, c2 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 31, n2[i2++] = t4 >>> 5 & 31, n2[i2++] = t4 >>> 10 & 31, n2[i2++] = t4 >>> 15 & 31, n2[i2++] = t4 >>> 20 & 31, n2[i2++] = t4 >>> 25 & 31, n2[i2++] = (t4 >>> 30 | (r3 & 7) << 2) & 31, n2[i2++] = r3 >>> 3 & 31, n2[i2++] = r3 >>> 8 & 31, n2[i2++] = r3 >>> 13 & 31, n2[i2++] = r3 >>> 18 & 31, n2[i2++] = r3 >>> 23 & 31, n2[i2++] = (r3 >>> 28 | (o2 & 1) << 4) & 31, n2[i2++] = o2 >>> 1 & 31, n2[i2++] = o2 >>> 6 & 31, n2[i2++] = o2 >>> 11 & 31, n2[i2++] = o2 >>> 16 & 31, n2[i2++] = o2 >>> 21 & 31, n2[i2++] = o2 >>> 26 & 31, n2[i2++] = (o2 >>> 31 | (s2 & 15) << 1) & 31, n2[i2++] = s2 >>> 4 & 31, n2[i2++] = s2 >>> 9 & 31, n2[i2++] = s2 >>> 14 & 31, n2[i2++] = s2 >>> 19 & 31, n2[i2++] = s2 >>> 24 & 31, n2[i2++] = (s2 >>> 29 | (c2 & 3) << 3) & 31, n2[i2++] = c2 >>> 2 & 31, n2[i2++] = c2 >>> 7 & 31, n2[i2++] = c2 >>> 12 & 31, n2[i2++] = c2 >>> 17 & 31, n2[i2++] = c2 >>> 22 & 31, n2[i2++] = c2 >>> 27 & 31;
  }
}
function Ry(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0, o2 = e51[a2++] >>> 0, s2 = e51[a2++] >>> 0, c2 = e51[a2++] >>> 0, l2 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 63, n2[i2++] = t4 >>> 6 & 63, n2[i2++] = t4 >>> 12 & 63, n2[i2++] = t4 >>> 18 & 63, n2[i2++] = t4 >>> 24 & 63, n2[i2++] = (t4 >>> 30 | (r3 & 15) << 2) & 63, n2[i2++] = r3 >>> 4 & 63, n2[i2++] = r3 >>> 10 & 63, n2[i2++] = r3 >>> 16 & 63, n2[i2++] = r3 >>> 22 & 63, n2[i2++] = (r3 >>> 28 | (o2 & 3) << 4) & 63, n2[i2++] = o2 >>> 2 & 63, n2[i2++] = o2 >>> 8 & 63, n2[i2++] = o2 >>> 14 & 63, n2[i2++] = o2 >>> 20 & 63, n2[i2++] = o2 >>> 26 & 63, n2[i2++] = s2 >>> 0 & 63, n2[i2++] = s2 >>> 6 & 63, n2[i2++] = s2 >>> 12 & 63, n2[i2++] = s2 >>> 18 & 63, n2[i2++] = s2 >>> 24 & 63, n2[i2++] = (s2 >>> 30 | (c2 & 15) << 2) & 63, n2[i2++] = c2 >>> 4 & 63, n2[i2++] = c2 >>> 10 & 63, n2[i2++] = c2 >>> 16 & 63, n2[i2++] = c2 >>> 22 & 63, n2[i2++] = (c2 >>> 28 | (l2 & 3) << 4) & 63, n2[i2++] = l2 >>> 2 & 63, n2[i2++] = l2 >>> 8 & 63, n2[i2++] = l2 >>> 14 & 63, n2[i2++] = l2 >>> 20 & 63, n2[i2++] = l2 >>> 26 & 63;
  }
}
function zy(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0, o2 = e51[a2++] >>> 0, s2 = e51[a2++] >>> 0, c2 = e51[a2++] >>> 0, l2 = e51[a2++] >>> 0, u2 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 127, n2[i2++] = t4 >>> 7 & 127, n2[i2++] = t4 >>> 14 & 127, n2[i2++] = t4 >>> 21 & 127, n2[i2++] = (t4 >>> 28 | (r3 & 7) << 4) & 127, n2[i2++] = r3 >>> 3 & 127, n2[i2++] = r3 >>> 10 & 127, n2[i2++] = r3 >>> 17 & 127, n2[i2++] = r3 >>> 24 & 127, n2[i2++] = (r3 >>> 31 | (o2 & 63) << 1) & 127, n2[i2++] = o2 >>> 6 & 127, n2[i2++] = o2 >>> 13 & 127, n2[i2++] = o2 >>> 20 & 127, n2[i2++] = (o2 >>> 27 | (s2 & 3) << 5) & 127, n2[i2++] = s2 >>> 2 & 127, n2[i2++] = s2 >>> 9 & 127, n2[i2++] = s2 >>> 16 & 127, n2[i2++] = s2 >>> 23 & 127, n2[i2++] = (s2 >>> 30 | (c2 & 31) << 2) & 127, n2[i2++] = c2 >>> 5 & 127, n2[i2++] = c2 >>> 12 & 127, n2[i2++] = c2 >>> 19 & 127, n2[i2++] = (c2 >>> 26 | (l2 & 1) << 6) & 127, n2[i2++] = l2 >>> 1 & 127, n2[i2++] = l2 >>> 8 & 127, n2[i2++] = l2 >>> 15 & 127, n2[i2++] = l2 >>> 22 & 127, n2[i2++] = (l2 >>> 29 | (u2 & 15) << 3) & 127, n2[i2++] = u2 >>> 4 & 127, n2[i2++] = u2 >>> 11 & 127, n2[i2++] = u2 >>> 18 & 127, n2[i2++] = u2 >>> 25 & 127;
  }
}
function By(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 8; t3++) {
    let t4 = e51[a2++] >>> 0, r3 = e51[a2++] >>> 0, o2 = e51[a2++] >>> 0, s2 = e51[a2++] >>> 0, c2 = e51[a2++] >>> 0, l2 = e51[a2++] >>> 0, u2 = e51[a2++] >>> 0, d2 = e51[a2++] >>> 0;
    n2[i2++] = t4 >>> 0 & 255, n2[i2++] = t4 >>> 8 & 255, n2[i2++] = t4 >>> 16 & 255, n2[i2++] = t4 >>> 24 & 255, n2[i2++] = r3 >>> 0 & 255, n2[i2++] = r3 >>> 8 & 255, n2[i2++] = r3 >>> 16 & 255, n2[i2++] = r3 >>> 24 & 255, n2[i2++] = o2 >>> 0 & 255, n2[i2++] = o2 >>> 8 & 255, n2[i2++] = o2 >>> 16 & 255, n2[i2++] = o2 >>> 24 & 255, n2[i2++] = s2 >>> 0 & 255, n2[i2++] = s2 >>> 8 & 255, n2[i2++] = s2 >>> 16 & 255, n2[i2++] = s2 >>> 24 & 255, n2[i2++] = c2 >>> 0 & 255, n2[i2++] = c2 >>> 8 & 255, n2[i2++] = c2 >>> 16 & 255, n2[i2++] = c2 >>> 24 & 255, n2[i2++] = l2 >>> 0 & 255, n2[i2++] = l2 >>> 8 & 255, n2[i2++] = l2 >>> 16 & 255, n2[i2++] = l2 >>> 24 & 255, n2[i2++] = u2 >>> 0 & 255, n2[i2++] = u2 >>> 8 & 255, n2[i2++] = u2 >>> 16 & 255, n2[i2++] = u2 >>> 24 & 255, n2[i2++] = d2 >>> 0 & 255, n2[i2++] = d2 >>> 8 & 255, n2[i2++] = d2 >>> 16 & 255, n2[i2++] = d2 >>> 24 & 255;
  }
}
function Vy(e51, t2, n2, r2) {
  let i2 = r2, a2 = t2;
  for (let t3 = 0; t3 < 128; t3++) {
    let t4 = e51[a2++] >>> 0;
    n2[i2++] = t4 & 65535, n2[i2++] = t4 >>> 16 & 65535;
  }
}
function Hy(e51, t2, n2, r2, i2) {
  let a2 = hy[i2] >>> 0, o2 = t2, s2 = 0, c2 = e51[o2] >>> 0, l2 = r2;
  for (let t3 = 0; t3 < 8; t3++) {
    for (let t4 = 0; t4 < 32; t4++) if (s2 + i2 <= 32) {
      let r3 = c2 >>> s2 & a2;
      n2[l2 + t4] = r3 | 0, s2 += i2, s2 === 32 && (s2 = 0, o2++, t4 !== 31 && (c2 = e51[o2] >>> 0));
    } else {
      let r3 = 32 - s2, u2 = c2 >>> s2;
      o2++, c2 = e51[o2] >>> 0;
      let d2 = i2 - r3, f2 = -1 >>> 32 - d2 >>> 0, p2 = (u2 | (c2 & f2) << r3) & a2;
      n2[l2 + t4] = p2 | 0, s2 = d2;
    }
    l2 += 32, s2 = 0, t3 < 7 && (c2 = e51[o2] >>> 0);
  }
}
var Uy = yy(gy);
var Wy = 3 * Uy / 256 + Uy | 0;
function Gy() {
  let e51 = new Uint8Array(Wy);
  return { dataToBePacked: Array(33), dataPointers: new Int32Array(33), byteContainer: e51, byteContainerI32: new Int32Array(e51.buffer, e51.byteOffset, e51.byteLength >>> 2), exceptionSizes: new Int32Array(33) };
}
function Ky(e51 = 16) {
  if (e51 < 0) throw RangeError(`initialEncodedWordCapacity must be >= 0, got ${e51}`);
  let t2 = Math.max(16, e51 | 0);
  return { encodedWords: new Uint32Array(t2), decoderWorkspace: Gy() };
}
function qy(e51, t2) {
  if (t2 <= e51.encodedWords.length) return e51.encodedWords;
  let n2 = new Uint32Array(Math.max(16, t2 * 2));
  return e51.encodedWords = n2, n2;
}
function Jy(e51, t2, n2, r2) {
  r2.byteContainer.length < n2 && (r2.byteContainer = new Uint8Array(n2 * 2), r2.byteContainerI32 = void 0);
  let i2 = r2.byteContainer, a2 = n2 >>> 2;
  if (i2.byteOffset & 3) for (let n3 = 0; n3 < a2; n3 = n3 + 1 | 0) {
    let r3 = e51[t2 + n3 | 0] | 0, a3 = n3 << 2;
    i2[a3] = r3 & 255, i2[a3 + 1 | 0] = r3 >>> 8 & 255, i2[a3 + 2 | 0] = r3 >>> 16 & 255, i2[a3 + 3 | 0] = r3 >>> 24 & 255;
  }
  else {
    let n3 = r2.byteContainerI32;
    (!n3 || n3.buffer !== i2.buffer || n3.byteOffset !== i2.byteOffset || n3.length < a2) && (n3 = r2.byteContainerI32 = new Int32Array(i2.buffer, i2.byteOffset, i2.byteLength >>> 2)), n3.set(e51.subarray(t2, t2 + a2));
  }
  let o2 = n2 & 3;
  if (o2 > 0) {
    let n3 = e51[t2 + a2 | 0] | 0, r3 = a2 << 2;
    for (let e52 = 0; e52 < o2; e52 = e52 + 1 | 0) i2[r3 + e52 | 0] = n3 >>> (e52 << 3) & 255;
  }
  return i2;
}
function Yy(e51, t2, n2) {
  let r2 = e51[t2++] | 0, i2 = n2.dataToBePacked;
  for (let a2 = 2; a2 <= 32; a2 = a2 + 1 | 0) {
    if (!(r2 >>> a2 - 1 & 1)) continue;
    if (t2 >= e51.length) throw Error(`FastPFOR decode: truncated exception stream header (bitWidth=${a2}, streamWordIndex=${t2}, needWords=1, availableWords=${e51.length - t2}, encodedWords=${e51.length})`);
    let o2 = e51[t2++] >>> 0, s2 = vy(o2), c2 = o2 * a2 + 31 >>> 5;
    if (t2 + c2 > e51.length) throw Error(`FastPFOR decode: truncated exception stream (bitWidth=${a2}, size=${o2}, streamWordIndex=${t2}, needWords=${c2}, availableWords=${e51.length - t2}, encodedWords=${e51.length})`);
    let l2 = i2[a2];
    (!l2 || l2.length < s2) && (l2 = i2[a2] = new Uint32Array(s2));
    let u2 = 0;
    for (; u2 < o2; u2 = u2 + 32 | 0) ab(e51, t2, l2, u2, a2), t2 = t2 + a2 | 0;
    let d2 = u2 - o2 | 0;
    t2 = t2 - (d2 * a2 >>> 5) | 0, n2.exceptionSizes[a2] = o2;
  }
  return t2;
}
function Xy(e51, t2, n2, r2, i2) {
  switch (i2) {
    case 1:
      Ny(e51, t2, n2, r2);
      break;
    case 2:
      Py(e51, t2, n2, r2);
      break;
    case 3:
      Fy(e51, t2, n2, r2);
      break;
    case 4:
      Iy(e51, t2, n2, r2);
      break;
    case 5:
      Ly(e51, t2, n2, r2);
      break;
    case 6:
      Ry(e51, t2, n2, r2);
      break;
    case 7:
      zy(e51, t2, n2, r2);
      break;
    case 8:
      By(e51, t2, n2, r2);
      break;
    case 16:
      Vy(e51, t2, n2, r2);
      break;
    default:
      Hy(e51, t2, n2, r2, i2);
  }
  return t2 + (i2 << 3) | 0;
}
function Zy(e51, t2, n2, r2) {
  if (n2 + 2 > t2) throw Error(`FastPFOR decode: byteContainer underflow at block=${r2} (need 2 bytes for [bitWidth, exceptionCount], bytePos=${n2}, byteSize=${t2})`);
  let i2 = e51[n2++], a2 = e51[n2++];
  if (i2 > 32) throw Error(`FastPFOR decode: invalid bitWidth=${i2} at block=${r2} (expected 0..32). This likely indicates corrupted or truncated input.`);
  return { bitWidth: i2, exceptionCount: a2, bytePosIn: n2 };
}
function Qy(e51, t2, n2, r2, i2, a2) {
  if (n2 + 1 > t2) throw Error(`FastPFOR decode: exception header underflow at block=${a2} (need 1 byte for maxBits, bytePos=${n2}, byteSize=${t2})`);
  let o2 = e51[n2++];
  if (o2 < r2 || o2 > 32) throw Error(`FastPFOR decode: invalid maxBits=${o2} at block=${a2} (bitWidth=${r2}, expected ${r2}..32)`);
  let s2 = o2 - r2 | 0;
  if (s2 < 1 || s2 > 32) throw Error(`FastPFOR decode: invalid exceptionBitWidth=${s2} at block=${a2} (bitWidth=${r2}, maxBits=${o2})`);
  if (n2 + i2 > t2) throw Error(`FastPFOR decode: exception positions underflow at block=${a2} (need=${i2}, have=${t2 - n2})`);
  return { maxBits: o2, exceptionBitWidth: s2, bytePosIn: n2 };
}
function $y(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
  let { maxBits: l2, exceptionBitWidth: u2, bytePosIn: d2 } = Qy(i2, a2, o2, n2, r2, c2);
  if (o2 = d2, u2 === 1) {
    let a3 = 1 << n2;
    for (let n3 = 0; n3 < r2; n3 = n3 + 1 | 0) {
      let n4 = i2[o2++];
      e51[n4 + t2 | 0] |= a3;
    }
    return o2;
  }
  let f2 = s2.dataToBePacked[u2];
  if (!f2) throw Error(`FastPFOR decode: missing exception stream for exceptionBitWidth=${u2} (bitWidth=${n2}, maxBits=${l2}) at block ${c2}`);
  let p2 = s2.dataPointers, m2 = p2[u2] | 0, h2 = s2.exceptionSizes[u2] | 0;
  if (m2 + r2 > h2) throw Error(`FastPFOR decode: exception stream overflow for exceptionBitWidth=${u2} (ptr=${m2}, need ${r2}, size=${h2}) at block ${c2}`);
  for (let a3 = 0; a3 < r2; a3 = a3 + 1 | 0) {
    let r3 = i2[o2++], a4 = f2[m2++] | 0;
    e51[r3 + t2 | 0] |= a4 << n2;
  }
  return p2[u2] = m2, o2;
}
function eb(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2) {
  let u2 = n2 | 0, d2 = 0;
  for (let t3 = 0; t3 < o2; t3 = t3 + 1 | 0) {
    let n3 = Zy(s2, c2, d2, t3);
    d2 = n3.bytePosIn;
    let r3 = n3.bitWidth, o3 = n3.exceptionCount, f2 = a2 + t3 * 256 | 0;
    switch (r3) {
      case 0:
        i2.fill(0, f2, f2 + 256);
        break;
      case 32:
        for (let t4 = 0; t4 < 256; t4 = t4 + 1 | 0) i2[f2 + t4 | 0] = e51[u2 + t4 | 0] | 0;
        u2 = u2 + 256 | 0;
        break;
      default:
        u2 = Xy(e51, u2, i2, f2, r3);
    }
    o3 > 0 && (d2 = $y(i2, f2, r3, o3, s2, c2, d2, l2, t3));
  }
  if (u2 !== r2) throw Error(`FastPFOR decode: packed region mismatch (pageStart=${t2}, packedStart=${n2}, consumedPackedEnd=${u2}, expectedPackedEnd=${r2}, packedWords=${r2 - n2}, encoded.length=${e51.length})`);
}
function tb(e51, t2, n2, r2, i2, a2) {
  let o2 = n2 | 0, s2 = e51[o2] | 0;
  if (s2 <= 0 || o2 + s2 > e51.length - 1) throw Error(`FastPFOR decode: invalid whereMeta=${s2} at pageStart=${o2} (expected > 0 and pageStart+whereMeta < encoded.length=${e51.length})`);
  let c2 = o2 + 1 | 0, l2 = o2 + s2 | 0, u2 = e51[l2] >>> 0, d2 = u2 + 3 >>> 2, f2 = l2 + 1, p2 = f2 + d2;
  if (p2 >= e51.length) throw Error(`FastPFOR decode: invalid byteSize=${u2} (metaInts=${d2}, pageStart=${o2}, packedEnd=${l2}, byteContainerStart=${f2}) causes bitmapPos=${p2} out of bounds (encoded.length=${e51.length})`);
  let m2 = Jy(e51, f2, u2, a2), h2 = u2, g2 = Yy(e51, p2, a2);
  return a2.dataPointers.fill(0), eb(e51, o2, c2, l2, t2, r2 | 0, i2 / 256 | 0, m2, h2, a2), g2;
}
function nb(e51, t2, n2, r2, i2, a2) {
  let o2 = r2 + _y(i2, 256), s2 = r2, c2 = n2;
  for (; s2 !== o2; ) {
    let n3 = Math.min(Uy, o2 - s2);
    c2 = tb(e51, t2, c2, s2, n3, a2), s2 = s2 + n3 | 0;
  }
  return c2;
}
function rb(e51, t2, n2, r2, i2, a2) {
  if (a2 === 0) return t2;
  let o2 = 0, s2 = t2, c2 = t2 + n2, l2 = i2, u2 = i2, d2 = i2 + a2, f2 = 0, p2 = 0;
  for (; s2 < c2 && u2 < d2; ) {
    let t3 = e51[s2] >>> o2 & 255;
    if (o2 += 8, s2 += o2 >>> 5, o2 &= 31, f2 |= (t3 & 127) << p2, t3 & 128) r2[u2++] = f2 | 0, f2 = 0, p2 = 0;
    else if (p2 += 7, p2 > 28) throw Error(`FastPFOR VByte: unterminated value (expected MSB=1 terminator within 5 bytes; shift=${p2}, partial=${f2}, decoded=${u2 - l2}/${a2}, inPos=${s2}, inEnd=${c2})`);
  }
  if (u2 !== d2) throw Error(`FastPFOR VByte: truncated stream (decoded=${u2 - l2}, expected=${a2}, consumedWords=${s2 - t2}/${n2}, vbyteStart=${t2}, vbyteEnd=${c2})`);
  return s2;
}
function ib(e51, t2, n2) {
  let r2 = 0, i2 = 0, a2 = new Uint32Array(t2), o2 = n2 ?? Gy();
  if (e51.length > 0) {
    let t3 = e51[r2] | 0;
    if (r2 = r2 + 1 | 0, t3 & 255) throw Error(`FastPFOR decode: invalid alignedLength=${t3} (expected multiple of 256)`);
    if (i2 + t3 > a2.length) throw Error(`FastPFOR decode: output buffer too small (outPos=${i2}, alignedLength=${t3}, out.length=${a2.length})`);
    r2 = nb(e51, a2, r2, i2, t3, o2), i2 = i2 + t3 | 0;
  }
  let s2 = e51.length - r2 | 0, c2 = t2 - i2 | 0;
  return rb(e51, r2, s2, a2, i2, c2), a2;
}
function ab(e51, t2, n2, r2, i2) {
  switch (i2) {
    case 2:
      xy(e51, t2, n2, r2);
      return;
    case 3:
      Sy(e51, t2, n2, r2);
      return;
    case 4:
      Cy(e51, t2, n2, r2);
      return;
    case 5:
      wy(e51, t2, n2, r2);
      return;
    case 6:
      Ty(e51, t2, n2, r2);
      return;
    case 7:
      Ey(e51, t2, n2, r2);
      return;
    case 8:
      Dy(e51, t2, n2, r2);
      return;
    case 9:
      Oy(e51, t2, n2, r2);
      return;
    case 10:
      ky(e51, t2, n2, r2);
      return;
    case 11:
      Ay(e51, t2, n2, r2);
      return;
    case 12:
      jy(e51, t2, n2, r2);
      return;
    case 16:
      My(e51, t2, n2, r2);
      return;
    case 32:
      for (let i3 = 0; i3 < 32; i3 = i3 + 1 | 0) n2[r2 + i3 | 0] = e51[t2 + i3 | 0] | 0;
      return;
  }
  let a2 = hy[i2] >>> 0, o2 = t2, s2 = 0, c2 = e51[o2] >>> 0;
  for (let t3 = 0; t3 < 32; t3++) if (s2 + i2 <= 32) {
    let l2 = c2 >>> s2 & a2;
    n2[r2 + t3] = l2 | 0, s2 += i2, s2 === 32 && (s2 = 0, o2++, t3 !== 31 && (c2 = e51[o2] >>> 0));
  } else {
    let l2 = 32 - s2, u2 = c2 >>> s2;
    o2++, c2 = e51[o2] >>> 0;
    let d2 = hy[i2 - l2] >>> 0, f2 = (u2 | (c2 & d2) << l2) & a2;
    n2[r2 + t3] = f2 | 0, s2 = i2 - l2;
  }
}
function ob(e51, t2, n2, r2) {
  if (t2 < 0 || n2 < 0 || t2 + n2 > e51.length) throw RangeError(`decodeBigEndianInt32sInto: out of bounds (offset=${t2}, byteLength=${n2}, bytes.length=${e51.length})`);
  let i2 = Math.floor(n2 / 4), a2 = n2 % 4 != 0, o2 = a2 ? i2 + 1 : i2;
  if (r2.length < o2) throw RangeError(`decodeBigEndianInt32sInto: out.length=${r2.length} < ${o2}`);
  if (i2 > 0) {
    let n3 = e51.byteOffset + t2;
    if (n3 & 3) for (let n4 = 0; n4 < i2; n4++) {
      let i3 = t2 + n4 * 4;
      r2[n4] = e51[i3] << 24 | e51[i3 + 1] << 16 | e51[i3 + 2] << 8 | e51[i3 + 3] | 0;
    }
    else {
      let t3 = new Uint32Array(e51.buffer, n3, i2);
      for (let e52 = 0; e52 < i2; e52++) r2[e52] = by(t3[e52]) | 0;
    }
  }
  if (a2) {
    let a3 = t2 + i2 * 4, o3 = n2 - i2 * 4, s2 = 0;
    for (let t3 = 0; t3 < o3; t3++) s2 |= e51[a3 + t3] << 24 - t3 * 8;
    r2[i2] = s2 | 0;
  }
  return o2;
}
function sb(e51, t2, n2) {
  let r2 = new Uint32Array(n2), i2 = 0, a2 = t2.get();
  for (let t3 = 0; t3 < r2.length; t3++) {
    let t4 = e51[a2++], n3 = t4 & 127;
    if (t4 < 128) {
      r2[i2++] = n3;
      continue;
    }
    if (t4 = e51[a2++], n3 |= (t4 & 127) << 7, t4 < 128) {
      r2[i2++] = n3;
      continue;
    }
    if (t4 = e51[a2++], n3 |= (t4 & 127) << 14, t4 < 128) {
      r2[i2++] = n3;
      continue;
    }
    if (t4 = e51[a2++], n3 |= (t4 & 127) << 21, t4 < 128) {
      r2[i2++] = n3;
      continue;
    }
    t4 = e51[a2++], n3 |= (t4 & 15) << 28, r2[i2++] = n3;
  }
  return t2.set(a2), r2;
}
function cb(e51, t2, n2) {
  let r2 = new BigUint64Array(n2);
  for (let n3 = 0; n3 < r2.length; n3++) r2[n3] = lb(e51, t2);
  return r2;
}
function lb(e51, t2) {
  let n2 = 0n, r2 = 0, i2 = t2.get();
  for (; i2 < e51.length; ) {
    let t3 = e51[i2++];
    if (n2 |= BigInt(t3 & 127) << BigInt(r2), !(t3 & 128)) break;
    if (r2 += 7, r2 >= 64) throw Error(`Varint too long`);
  }
  return t2.set(i2), n2;
}
function ub(e51, t2, n2) {
  let r2 = new Float64Array(n2);
  for (let i2 = 0; i2 < n2; i2++) r2[i2] = db(e51, t2);
  return r2;
}
function db(e51, t2) {
  let n2, r2;
  return r2 = e51[t2.get()], t2.increment(), n2 = r2 & 127, r2 < 128 || (r2 = e51[t2.get()], t2.increment(), n2 |= (r2 & 127) << 7, r2 < 128) || (r2 = e51[t2.get()], t2.increment(), n2 |= (r2 & 127) << 14, r2 < 128) || (r2 = e51[t2.get()], t2.increment(), n2 |= (r2 & 127) << 21, r2 < 128) ? n2 : (r2 = e51[t2.get()], n2 |= (r2 & 15) << 28, fb(n2, e51, t2));
}
function fb(e51, t2, n2) {
  let r2, i2;
  if (i2 = t2[n2.get()], n2.increment(), r2 = (i2 & 112) >> 4, i2 < 128 || (i2 = t2[n2.get()], n2.increment(), r2 |= (i2 & 127) << 3, i2 < 128) || (i2 = t2[n2.get()], n2.increment(), r2 |= (i2 & 127) << 10, i2 < 128) || (i2 = t2[n2.get()], n2.increment(), r2 |= (i2 & 127) << 17, i2 < 128) || (i2 = t2[n2.get()], n2.increment(), r2 |= (i2 & 127) << 24, i2 < 128) || (i2 = t2[n2.get()], n2.increment(), r2 |= (i2 & 1) << 31, i2 < 128)) return r2 * 4294967296 + (e51 >>> 0);
  throw Error(`Expected varint not more than 10 bytes`);
}
function pb(e51, t2, n2, r2) {
  return mb(e51, t2, n2, r2, Ky(n2 >>> 2));
}
function mb(e51, t2, n2, r2, i2) {
  let a2 = r2.get();
  if (n2 & 3) throw Error(`FastPFOR: invalid encodedByteLength=${n2} at offset=${a2} (encodedBytes.length=${e51.length}; expected a multiple of 4 bytes for an int32 big-endian word stream)`);
  let o2 = n2 >>> 2, s2 = qy(i2, o2);
  ob(e51, a2, n2, s2);
  let c2 = ib(s2.subarray(0, o2), t2, i2.decoderWorkspace);
  return r2.add(n2), c2;
}
function Q(e51) {
  return e51 >>> 1 ^ -(e51 & 1);
}
function hb(e51) {
  return e51 >> 1n ^ -(e51 & 1n);
}
function gb(e51) {
  return e51 % 2 == 1 ? (e51 + 1) / -2 : e51 / 2;
}
function _b(e51) {
  let t2 = new Int32Array(e51.length);
  for (let n2 = 0; n2 < e51.length; n2++) t2[n2] = Q(e51[n2]);
  return t2;
}
function vb(e51) {
  let t2 = new BigInt64Array(e51.length);
  for (let n2 = 0; n2 < e51.length; n2++) t2[n2] = hb(e51[n2]);
  return t2;
}
function yb(e51) {
  for (let t2 = 0; t2 < e51.length; t2++) e51[t2] = gb(e51[t2]);
}
function bb(e51, t2, n2) {
  if (n2 === void 0) {
    n2 = 0;
    for (let r3 = 0; r3 < t2; r3++) n2 += e51[r3];
  }
  let r2 = new Uint32Array(n2), i2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let a2 = e51[n3], o2 = e51[n3 + t2];
    r2.fill(o2, i2, i2 + a2), i2 += a2;
  }
  return r2;
}
function xb(e51, t2, n2) {
  if (n2 === void 0) {
    n2 = 0;
    for (let r3 = 0; r3 < t2; r3++) n2 += Number(e51[r3]);
  }
  let r2 = new BigUint64Array(n2), i2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let a2 = Number(e51[n3]), o2 = e51[n3 + t2];
    r2.fill(o2, i2, i2 + a2), i2 += a2;
  }
  return r2;
}
function Sb(e51, t2, n2) {
  let r2 = new Float64Array(n2), i2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let a2 = e51[n3], o2 = e51[n3 + t2];
    r2.fill(o2, i2, i2 + a2), i2 += a2;
  }
  return r2;
}
function Cb(e51) {
  let t2 = new Int32Array(e51.length);
  t2[0] = Q(e51[0]);
  let n2 = e51.length / 4 * 4, r2 = 1;
  if (n2 >= 4) for (; r2 < n2 - 4; r2 += 4) {
    let n3 = e51[r2], i2 = e51[r2 + 1], a2 = e51[r2 + 2], o2 = e51[r2 + 3];
    t2[r2] = Q(n3) + t2[r2 - 1], t2[r2 + 1] = Q(i2) + t2[r2], t2[r2 + 2] = Q(a2) + t2[r2 + 1], t2[r2 + 3] = Q(o2) + t2[r2 + 2];
  }
  for (; r2 !== e51.length; ++r2) t2[r2] = Q(e51[r2]) + t2[r2 - 1];
  return t2;
}
function wb(e51) {
  let t2 = new BigInt64Array(e51.length);
  t2[0] = hb(e51[0]);
  let n2 = e51.length / 4 * 4, r2 = 1;
  if (n2 >= 4) for (; r2 < n2 - 4; r2 += 4) {
    let n3 = e51[r2], i2 = e51[r2 + 1], a2 = e51[r2 + 2], o2 = e51[r2 + 3];
    t2[r2] = hb(n3) + t2[r2 - 1], t2[r2 + 1] = hb(i2) + t2[r2], t2[r2 + 2] = hb(a2) + t2[r2 + 1], t2[r2 + 3] = hb(o2) + t2[r2 + 2];
  }
  for (; r2 !== t2.length; ++r2) t2[r2] = hb(e51[r2]) + t2[r2 - 1];
  return t2;
}
function Tb(e51) {
  e51[0] = gb(e51[0]);
  let t2 = e51.length / 4 * 4, n2 = 1;
  if (t2 >= 4) for (; n2 < t2 - 4; n2 += 4) {
    let t3 = e51[n2], r2 = e51[n2 + 1], i2 = e51[n2 + 2], a2 = e51[n2 + 3];
    e51[n2] = gb(t3) + e51[n2 - 1], e51[n2 + 1] = gb(r2) + e51[n2], e51[n2 + 2] = gb(i2) + e51[n2 + 1], e51[n2 + 3] = gb(a2) + e51[n2 + 2];
  }
  for (; n2 !== e51.length; ++n2) e51[n2] = gb(e51[n2]) + e51[n2 - 1];
}
function Eb(e51, t2, n2) {
  if (n2 === void 0) {
    n2 = 0;
    for (let r3 = 0; r3 < t2; r3++) n2 += e51[r3];
  }
  let r2 = new Int32Array(n2), i2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let a2 = e51[n3], o2 = e51[n3 + t2];
    o2 = Q(o2), r2.fill(o2, i2, i2 + a2), i2 += a2;
  }
  return r2;
}
function Db(e51, t2, n2) {
  if (n2 === void 0) {
    n2 = 0;
    for (let r3 = 0; r3 < t2; r3++) n2 += Number(e51[r3]);
  }
  let r2 = new BigInt64Array(n2), i2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let a2 = Number(e51[n3]), o2 = e51[n3 + t2];
    o2 = hb(o2), r2.fill(o2, i2, i2 + a2), i2 += a2;
  }
  return r2;
}
function Ob(e51, t2, n2) {
  let r2 = new Float64Array(n2), i2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let a2 = e51[n3], o2 = e51[n3 + t2];
    o2 = gb(o2), r2.fill(o2, i2, i2 + a2), i2 += a2;
  }
  return r2;
}
function kb(e51) {
  let t2 = e51.length / 4 * 4, n2 = 1;
  if (t2 >= 4) for (let r2 = e51[0]; n2 < t2 - 4; n2 += 4) r2 = e51[n2] += r2, r2 = e51[n2 + 1] += r2, r2 = e51[n2 + 2] += r2, r2 = e51[n2 + 3] += r2;
  for (; n2 !== e51.length; ) e51[n2] += e51[n2 - 1], ++n2;
}
function Ab(e51) {
  let t2 = 0;
  for (let n2 = 0; n2 < e51.length; n2++) e51[n2] += t2, t2 = e51[n2];
}
function jb(e51) {
  if (e51.length < 2) return new Int32Array(e51);
  let t2 = new Int32Array(e51.length);
  t2[0] = Q(e51[0]), t2[1] = Q(e51[1]);
  let n2 = e51.length / 4 * 4, r2 = 2;
  if (n2 >= 4) for (; r2 < n2 - 4; r2 += 4) {
    let n3 = e51[r2], i2 = e51[r2 + 1], a2 = e51[r2 + 2], o2 = e51[r2 + 3];
    t2[r2] = Q(n3) + t2[r2 - 2], t2[r2 + 1] = Q(i2) + t2[r2 - 1], t2[r2 + 2] = Q(a2) + t2[r2], t2[r2 + 3] = Q(o2) + t2[r2 + 1];
  }
  for (; r2 !== e51.length; r2 += 2) t2[r2] = Q(e51[r2]) + t2[r2 - 2], t2[r2 + 1] = Q(e51[r2 + 1]) + t2[r2 - 1];
  return t2;
}
function Mb(e51, t2, n2, r2) {
  if (e51.length < 2) return new Int32Array(e51);
  let i2 = new Int32Array(e51.length), a2 = Q(e51[0]), o2 = Q(e51[1]);
  i2[0] = Nb(Math.round(a2 * t2), n2, r2), i2[1] = Nb(Math.round(o2 * t2), n2, r2);
  let s2 = e51.length / 16, c2 = 2;
  if (s2 >= 4) for (; c2 < s2 - 4; c2 += 4) {
    let s3 = e51[c2], l2 = e51[c2 + 1], u2 = Q(s3) + a2, d2 = Q(l2) + o2;
    i2[c2] = Nb(Math.round(u2 * t2), n2, r2), i2[c2 + 1] = Nb(Math.round(d2 * t2), n2, r2);
    let f2 = e51[c2 + 2], p2 = e51[c2 + 3];
    a2 = Q(f2) + u2, o2 = Q(p2) + d2, i2[c2 + 2] = Nb(Math.round(a2 * t2), n2, r2), i2[c2 + 3] = Nb(Math.round(o2 * t2), n2, r2);
  }
  for (; c2 !== e51.length; c2 += 2) a2 += Q(e51[c2]), o2 += Q(e51[c2 + 1]), i2[c2] = Nb(Math.round(a2 * t2), n2, r2), i2[c2 + 1] = Nb(Math.round(o2 * t2), n2, r2);
  return i2;
}
function Nb(e51, t2, n2) {
  return Math.min(n2, Math.max(t2, e51));
}
function Pb(e51) {
  let t2 = new Int32Array(e51.length + 1);
  t2[0] = 0, t2[1] = Q(e51[0]);
  let n2 = t2[1];
  for (let r2 = 2; r2 !== t2.length; ++r2) {
    let i2 = e51[r2 - 1], a2 = Q(i2);
    n2 += a2, t2[r2] = t2[r2 - 1] + n2;
  }
  return new Uint32Array(t2);
}
function Fb(e51, t2, n2) {
  let r2 = new Int32Array(n2 + 1);
  r2[0] = 0;
  let i2 = 1, a2 = r2[0];
  for (let n3 = 0; n3 < t2; n3++) {
    let o2 = e51[n3], s2 = e51[n3 + t2];
    s2 = Q(s2);
    for (let e52 = i2; e52 < i2 + o2; e52++) r2[e52] = s2 + a2, a2 = r2[e52];
    i2 += o2;
  }
  return r2;
}
function Ib(e51, t2, n2) {
  let r2 = new Uint32Array(n2 + 1);
  r2[0] = 0;
  let i2 = 1, a2 = r2[0];
  for (let n3 = 0; n3 < t2; n3++) {
    let o2 = e51[n3], s2 = e51[n3 + t2];
    for (let e52 = i2; e52 < i2 + o2; e52++) r2[e52] = s2 + a2, a2 = r2[e52];
    i2 += o2;
  }
  return r2;
}
function Lb(e51, t2, n2) {
  let r2 = new Int32Array(n2), i2 = 0, a2 = 0;
  for (let n3 = 0; n3 < t2; n3++) {
    let o2 = e51[n3], s2 = e51[n3 + t2], c2 = Q(s2);
    for (let e52 = 0; e52 < o2; e52++) a2 += c2, r2[i2++] = a2;
  }
  return r2;
}
function Rb(e51, t2, n2) {
  let r2 = new BigInt64Array(n2), i2 = 0, a2 = 0n;
  for (let n3 = 0; n3 < t2; n3++) {
    let o2 = Number(e51[n3]), s2 = e51[n3 + t2], c2 = hb(s2);
    for (let e52 = 0; e52 < o2; e52++) a2 += c2, r2[i2++] = a2;
  }
  return r2;
}
function zb(e51) {
  let t2 = new Uint32Array(e51.length);
  t2[0] = Q(e51[0]) >>> 0;
  for (let n2 = 1; n2 < e51.length; n2++) t2[n2] = t2[n2 - 1] + Q(e51[n2]) >>> 0;
  return t2;
}
function Bb(e51) {
  let t2 = new BigUint64Array(e51.length);
  t2[0] = BigInt.asUintN(64, hb(e51[0]));
  for (let n2 = 1; n2 < e51.length; n2++) t2[n2] = BigInt.asUintN(64, t2[n2 - 1] + hb(e51[n2]));
  return t2;
}
function Vb(e51) {
  if (e51.length < 2) return new Uint32Array(e51);
  let t2 = new Uint32Array(e51.length);
  t2[0] = Q(e51[0]) >>> 0, t2[1] = Q(e51[1]) >>> 0;
  for (let n2 = 2; n2 < e51.length; n2 += 2) t2[n2] = t2[n2 - 2] + Q(e51[n2]) >>> 0, t2[n2 + 1] = t2[n2 - 1] + Q(e51[n2 + 1]) >>> 0;
  return t2;
}
function Hb(e51, t2, n2, r2) {
  let i2 = Mb(e51, t2, n2, r2);
  return new Uint32Array(i2);
}
function Ub(e51) {
  return e51[1];
}
function Wb(e51) {
  return Q(e51[1]);
}
function Gb(e51) {
  if (e51.length === 2) {
    let t2 = Q(e51[1]);
    return [t2, t2];
  }
  return [Q(e51[2]), Q(e51[3])];
}
function Kb(e51) {
  return e51[1];
}
function qb(e51) {
  return hb(e51[1]);
}
function Jb(e51) {
  if (e51.length === 2) {
    let t2 = hb(e51[1]);
    return [t2, t2];
  }
  return [hb(e51[2]), hb(e51[3])];
}
var Yb;
(function(e51) {
  e51.PRESENT = `PRESENT`, e51.DATA = `DATA`, e51.OFFSET = `OFFSET`, e51.LENGTH = `LENGTH`;
})(Yb ||= {});
var Xb;
(function(e51) {
  e51.NONE = `NONE`, e51.SINGLE = `SINGLE`, e51.SHARED = `SHARED`, e51.VERTEX = `VERTEX`, e51.MORTON = `MORTON`, e51.FSST = `FSST`;
})(Xb ||= {});
var Zb;
(function(e51) {
  e51.VERTEX = `VERTEX`, e51.INDEX = `INDEX`, e51.STRING = `STRING`, e51.KEY = `KEY`;
})(Zb ||= {});
var Qb;
(function(e51) {
  e51.VAR_BINARY = `VAR_BINARY`, e51.GEOMETRIES = `GEOMETRIES`, e51.PARTS = `PARTS`, e51.RINGS = `RINGS`, e51.TRIANGLES = `TRIANGLES`, e51.SYMBOL = `SYMBOL`, e51.DICTIONARY = `DICTIONARY`;
})(Qb ||= {});
var $b = [Yb.PRESENT, Yb.DATA, Yb.OFFSET, Yb.LENGTH];
var ex = [Z.NONE, Z.DELTA, Z.COMPONENTWISE_DELTA, Z.RLE, Z.MORTON, Z.PDE];
var tx = [py.NONE, py.FAST_PFOR, py.VARINT];
var nx = [Xb.NONE, Xb.SINGLE, Xb.SHARED, Xb.VERTEX, Xb.MORTON, Xb.FSST];
var rx = [Zb.VERTEX, Zb.INDEX, Zb.STRING, Zb.KEY];
var ix = [Qb.VAR_BINARY, Qb.GEOMETRIES, Qb.PARTS, Qb.RINGS, Qb.TRIANGLES, Qb.SYMBOL, Qb.DICTIONARY];
function ax(e51, t2) {
  let n2 = cx(e51, t2);
  return n2.logicalLevelTechnique1 === Z.MORTON ? ox(n2, e51, t2) : (Z.RLE === n2.logicalLevelTechnique1 || Z.RLE === n2.logicalLevelTechnique2) && py.NONE !== n2.physicalLevelTechnique ? sx(n2, e51, t2) : n2;
}
function ox(e51, t2, n2) {
  let r2 = sb(t2, n2, 2);
  return { physicalStreamType: e51.physicalStreamType, logicalStreamType: e51.logicalStreamType, logicalLevelTechnique1: e51.logicalLevelTechnique1, logicalLevelTechnique2: e51.logicalLevelTechnique2, physicalLevelTechnique: e51.physicalLevelTechnique, numValues: e51.numValues, byteLength: e51.byteLength, decompressedCount: e51.decompressedCount, numBits: r2[0], coordinateShift: r2[1] };
}
function sx(e51, t2, n2) {
  let r2 = sb(t2, n2, 2);
  return { physicalStreamType: e51.physicalStreamType, logicalStreamType: e51.logicalStreamType, logicalLevelTechnique1: e51.logicalLevelTechnique1, logicalLevelTechnique2: e51.logicalLevelTechnique2, physicalLevelTechnique: e51.physicalLevelTechnique, numValues: e51.numValues, byteLength: e51.byteLength, decompressedCount: r2[1], runs: r2[0], numRleValues: r2[1] };
}
function cx(e51, t2) {
  let n2 = e51[t2.get()], r2 = $b[n2 >> 4], i2 = {};
  switch (r2) {
    case Yb.DATA:
      i2 = { dictionaryType: nx[n2 & 15] };
      break;
    case Yb.OFFSET:
      i2 = { offsetType: rx[n2 & 15] };
      break;
    case Yb.LENGTH:
      i2 = { lengthType: ix[n2 & 15] };
  }
  t2.increment();
  let a2 = e51[t2.get()], o2 = ex[a2 >> 5], s2 = ex[a2 >> 2 & 7], c2 = tx[a2 & 3];
  t2.increment();
  let l2 = sb(e51, t2, 2), u2 = l2[0], d2 = l2[1];
  return { physicalStreamType: r2, logicalStreamType: i2, logicalLevelTechnique1: o2, logicalLevelTechnique2: s2, physicalLevelTechnique: c2, numValues: u2, byteLength: d2, decompressedCount: u2 };
}
var $;
(function(e51) {
  e51[e51.FLAT = 0] = `FLAT`, e51[e51.CONST = 1] = `CONST`, e51[e51.SEQUENCE = 2] = `SEQUENCE`, e51[e51.DICTIONARY = 3] = `DICTIONARY`, e51[e51.FSST_DICTIONARY = 4] = `FSST_DICTIONARY`;
})($ ||= {});
var lx = class {
  constructor(e51, t2) {
    this.values = e51, this._size = t2;
  }
  get(e51) {
    let t2 = Math.floor(e51 / 8), n2 = e51 % 8;
    return (this.values[t2] >> n2 & 1) == 1;
  }
  set(e51, t2) {
    let n2 = Math.floor(e51 / 8), r2 = e51 % 8;
    this.values[n2] = this.values[n2] | +!!t2 << r2;
  }
  getInt(e51) {
    let t2 = Math.floor(e51 / 8), n2 = e51 % 8;
    return this.values[t2] >> n2 & 1;
  }
  size() {
    return this._size;
  }
  getBuffer() {
    return this.values;
  }
};
function ux(e51, t2, n2) {
  if (!t2) return e51;
  let r2 = t2.size(), i2 = e51.constructor, a2 = new i2(r2), o2 = 0;
  for (let i3 = 0; i3 < r2; i3++) a2[i3] = t2.get(i3) ? e51[o2++] : n2;
  return a2;
}
function dx(e51, t2, n2) {
  if (!n2) return e51;
  let r2 = n2.size(), i2 = new lx(e51, t2), a2 = new lx(new Uint8Array(Math.ceil(r2 / 8)), r2), o2 = 0;
  for (let e52 = 0; e52 < r2; e52++) {
    let t3 = n2.get(e52) ? i2.get(o2++) : false;
    a2.set(e52, t3);
  }
  return a2.getBuffer();
}
function fx(e51, t2, n2, r2, i2) {
  return Tx(hx(e51, t2, n2), n2, r2, i2);
}
function px(e51, t2, n2, r2, i2) {
  return Ex(hx(e51, t2, n2), n2, r2, i2);
}
function mx(e51, t2, n2) {
  return Ax(hx(e51, t2, n2), n2);
}
function hx(e51, t2, n2) {
  let r2 = n2.physicalLevelTechnique;
  switch (r2) {
    case py.FAST_PFOR:
      return pb(e51, n2.numValues, n2.byteLength, t2);
    case py.VARINT:
      return sb(e51, t2, n2.numValues);
    case py.NONE: {
      let r3 = t2.get(), i2 = n2.byteLength;
      t2.add(i2);
      let a2 = e51.subarray(r3, t2.get());
      return new Uint32Array(a2);
    }
    default:
      throw Error(`Specified physicalLevelTechnique ${r2} is not supported (yet).`);
  }
}
function gx(e51, t2, n2) {
  let r2 = hx(e51, t2, n2);
  return r2.length === 1 ? Q(r2[0]) : Wb(r2);
}
function _x(e51, t2, n2) {
  let r2 = hx(e51, t2, n2);
  return r2.length === 1 ? n2.logicalLevelTechnique1 === Z.DELTA ? Q(r2[0]) : r2[0] : Ub(r2);
}
function vx(e51, t2, n2) {
  return Gb(hx(e51, t2, n2));
}
function yx(e51, t2, n2) {
  return Jb(cb(e51, t2, n2.numValues));
}
function bx(e51, t2, n2, r2) {
  return Dx(cb(e51, t2, n2.numValues), n2, r2);
}
function xx(e51, t2, n2, r2) {
  return Ox(cb(e51, t2, n2.numValues), n2, r2);
}
function Sx(e51, t2, n2) {
  return kx(ub(e51, t2, n2.numValues), n2, false);
}
function Cx(e51, t2, n2) {
  let r2 = cb(e51, t2, n2.numValues);
  return r2.length === 1 ? hb(r2[0]) : qb(r2);
}
function wx(e51, t2, n2) {
  let r2 = cb(e51, t2, n2.numValues);
  return r2.length === 1 ? n2.logicalLevelTechnique1 === Z.DELTA ? hb(r2[0]) : r2[0] : Kb(r2);
}
function Tx(e51, t2, n2, r2) {
  let i2;
  switch (t2.logicalLevelTechnique1) {
    case Z.DELTA:
      if (t2.logicalLevelTechnique2 === Z.RLE) {
        let n3 = t2;
        if (!r2) return Lb(e51, n3.runs, n3.numRleValues);
        e51 = bb(e51, n3.runs, n3.numRleValues), i2 = Cb(e51);
      } else i2 = Cb(e51);
      break;
    case Z.RLE:
      i2 = Eb(e51, t2.runs, t2.numRleValues);
      break;
    case Z.MORTON:
      kb(e51), i2 = new Int32Array(e51);
      break;
    case Z.COMPONENTWISE_DELTA:
      if (n2 && !r2) return Mb(e51, n2.scale, n2.min, n2.max);
      i2 = jb(e51);
      break;
    case Z.NONE:
      i2 = _b(e51);
      break;
    default:
      throw Error(`The specified Logical level technique is not supported: ${t2.logicalLevelTechnique1}`);
  }
  return r2 ? ux(i2, r2, 0) : i2;
}
function Ex(e51, t2, n2, r2) {
  let i2;
  switch (t2.logicalLevelTechnique1) {
    case Z.DELTA:
      if (t2.logicalLevelTechnique2 === Z.RLE) {
        let n3 = t2;
        i2 = zb(bb(e51, n3.runs, n3.numRleValues));
      } else i2 = zb(e51);
      break;
    case Z.RLE:
      i2 = bb(e51, t2.runs, t2.numRleValues);
      break;
    case Z.MORTON:
      kb(e51), i2 = e51;
      break;
    case Z.COMPONENTWISE_DELTA:
      i2 = n2 && !r2 ? Hb(e51, n2.scale, n2.min, n2.max) : Vb(e51);
      break;
    case Z.NONE:
      i2 = e51;
      break;
    default:
      throw Error(`The specified Logical level technique is not supported: ${t2.logicalLevelTechnique1}`);
  }
  return r2 ? ux(i2, r2, 0) : i2;
}
function Dx(e51, t2, n2) {
  let r2;
  switch (t2.logicalLevelTechnique1) {
    case Z.DELTA:
      if (t2.logicalLevelTechnique2 === Z.RLE) {
        let i2 = t2;
        if (!n2) return Rb(e51, i2.runs, i2.numRleValues);
        e51 = xb(e51, i2.runs, i2.numRleValues), r2 = wb(e51);
      } else r2 = wb(e51);
      break;
    case Z.RLE:
      r2 = Db(e51, t2.runs, t2.numRleValues);
      break;
    case Z.NONE:
      r2 = vb(e51);
      break;
    default:
      throw Error(`The specified Logical level technique is not supported: ${t2.logicalLevelTechnique1}`);
  }
  return n2 ? ux(r2, n2, 0n) : r2;
}
function Ox(e51, t2, n2) {
  let r2;
  switch (t2.logicalLevelTechnique1) {
    case Z.DELTA:
      if (t2.logicalLevelTechnique2 === Z.RLE) {
        let n3 = t2;
        r2 = Bb(xb(e51, n3.runs, n3.numRleValues));
      } else r2 = Bb(e51);
      break;
    case Z.RLE:
      r2 = xb(e51, t2.runs, t2.numRleValues);
      break;
    case Z.NONE:
      r2 = e51;
      break;
    default:
      throw Error(`The specified Logical level technique is not supported: ${t2.logicalLevelTechnique1}`);
  }
  return n2 ? ux(r2, n2, 0n) : r2;
}
function kx(e51, t2, n2) {
  switch (t2.logicalLevelTechnique1) {
    case Z.DELTA:
      if (t2.logicalLevelTechnique2 === Z.RLE) {
        let n3 = t2;
        e51 = Sb(e51, n3.runs, n3.numRleValues);
      }
      return Tb(e51), e51;
    case Z.RLE:
      return Nx(e51, t2, n2);
    case Z.NONE:
      return n2 && yb(e51), e51;
    default:
      throw Error(`The specified Logical level technique is not supported: ${t2.logicalLevelTechnique1}`);
  }
}
function Ax(e51, t2) {
  if (t2.logicalLevelTechnique1 === Z.DELTA && t2.logicalLevelTechnique2 === Z.NONE) return Pb(e51);
  if (t2.logicalLevelTechnique1 === Z.RLE && t2.logicalLevelTechnique2 === Z.NONE) {
    let n2 = t2;
    return Ib(e51, n2.runs, n2.numRleValues);
  }
  if (t2.logicalLevelTechnique1 === Z.NONE && t2.logicalLevelTechnique2 === Z.NONE) {
    Ab(e51);
    let n2 = new Uint32Array(t2.numValues + 1);
    return n2[0] = 0, n2.set(e51, 1), n2;
  }
  if (t2.logicalLevelTechnique1 === Z.DELTA && t2.logicalLevelTechnique2 === Z.RLE) {
    let n2 = t2, r2 = Fb(e51, n2.runs, n2.numRleValues);
    return kb(r2), new Uint32Array(r2);
  }
  throw Error(`Only delta encoding is supported for transforming length to offset streams yet.`);
}
function jx(e51, t2, n2, r2, i2 = `int32`) {
  let a2 = e51.logicalLevelTechnique1;
  if (a2 === Z.RLE) return e51.runs === 1 ? $.CONST : $.FLAT;
  if (a2 !== Z.DELTA || e51.logicalLevelTechnique2 !== Z.RLE) return e51.numValues === 1 ? $.CONST : $.FLAT;
  let o2 = t2 instanceof lx ? t2.size() : t2, s2 = e51;
  if (s2.numRleValues !== o2) return $.FLAT;
  if (s2.runs === 1) return $.SEQUENCE;
  if (s2.runs !== 2) return e51.numValues === 1 ? $.CONST : $.FLAT;
  let c2 = r2.get();
  if (e51.physicalLevelTechnique === py.VARINT) return Mx(n2, r2, i2) ? $.SEQUENCE : e51.numValues === 1 ? $.CONST : $.FLAT;
  let l2 = r2.get(), u2 = new Int32Array(n2.buffer, n2.byteOffset + l2, 4);
  return r2.set(c2), u2[2] === 2 && u2[3] === 2 ? $.SEQUENCE : e51.numValues === 1 ? $.CONST : $.FLAT;
}
function Mx(e51, t2, n2) {
  let r2 = new fy(t2.get());
  if (n2 === `int64`) {
    let t3 = cb(e51, r2, 4);
    return t3[2] === 2n && t3[3] === 2n;
  }
  let i2 = sb(e51, r2, 4);
  return i2[2] === 2 && i2[3] === 2;
}
function Nx(e51, t2, n2) {
  return n2 ? Ob(e51, t2.runs, t2.numRleValues) : Sb(e51, t2.runs, t2.numRleValues);
}
var Px = class extends ny {
  getValueFromBuffer(e51) {
    return this.dataBuffer[e51];
  }
};
var Fx = class extends ay {
  constructor(e51, t2, n2, r2) {
    super(e51, BigInt64Array.of(t2), n2, r2);
  }
  getValueFromBuffer(e51) {
    return this.dataBuffer[0] + BigInt(e51) * this.delta;
  }
};
function Ix(e51, t2, n2) {
  return { x: Lx(e51, t2) - n2, y: Lx(e51 >> 1, t2) - n2 };
}
function Lx(e51, t2) {
  let n2 = 0;
  for (let r2 = 0; r2 < t2; r2++) n2 |= (e51 & 1 << 2 * r2) >> r2;
  return n2;
}
var Rx;
(function(e51) {
  e51[e51.POINT = 0] = `POINT`, e51[e51.LINESTRING = 1] = `LINESTRING`, e51[e51.POLYGON = 2] = `POLYGON`, e51[e51.MULTIPOINT = 3] = `MULTIPOINT`, e51[e51.MULTILINESTRING = 4] = `MULTILINESTRING`, e51[e51.MULTIPOLYGON = 5] = `MULTIPOLYGON`;
})(Rx ||= {});
var zx;
(function(e51) {
  e51[e51.POINT = 0] = `POINT`, e51[e51.LINESTRING = 1] = `LINESTRING`, e51[e51.POLYGON = 2] = `POLYGON`;
})(zx ||= {});
var Bx;
(function(e51) {
  e51[e51.MORTON = 0] = `MORTON`, e51[e51.VEC_2 = 1] = `VEC_2`, e51[e51.VEC_3 = 2] = `VEC_3`;
})(Bx ||= {});
function Vx(e51) {
  let t2 = Array(e51.numGeometries), n2 = 1, r2 = 1, i2 = 1, a2 = 0, o2 = 0, s2 = 0, c2 = e51.mortonSettings, u2 = e51.topologyVector, d2 = u2.geometryOffsets, f2 = u2.partOffsets, p2 = u2.ringOffsets, m2 = e51.vertexOffsets, h2 = !m2 || m2.length === 0, g2 = e51.containsPolygonGeometry(), _ = e51.vertexBuffer;
  for (let u3 = 0; u3 < e51.numGeometries; u3++) {
    let v = e51.geometryType(u3);
    switch (v) {
      case Rx.POINT:
        {
          let u4, g3;
          if (h2) u4 = _[o2++], g3 = _[o2++];
          else if (e51.vertexBufferType === Bx.MORTON) {
            let e52 = _[m2[s2++]], t3 = Ix(e52, c2.numBits, c2.coordinateShift);
            u4 = t3.x, g3 = t3.y;
          } else {
            let e52 = m2[s2++] * 2;
            u4 = _[e52], g3 = _[e52 + 1];
          }
          t2[a2++] = [[new l(u4, g3)]], d2 && i2++, f2 && n2++, p2 && r2++;
        }
        break;
      case Rx.MULTIPOINT:
        {
          let e52 = d2[i2] - d2[i2 - 1];
          i2++;
          let c3 = Array(e52);
          if (h2) for (let t3 = 0; t3 < e52; t3++) {
            let e53 = _[o2++], n3 = _[o2++];
            c3[t3] = new l(e53, n3);
          }
          else for (let t3 = 0; t3 < e52; t3++) {
            let e53 = m2[s2++] * 2, n3 = _[e53], r3 = _[e53 + 1];
            c3[t3] = new l(n3, r3);
          }
          t2[a2++] = c3.map((e53) => [e53]), n2 += e52, r2 += e52;
        }
        break;
      case Rx.LINESTRING:
        {
          let l2;
          g2 ? (l2 = p2[r2] - p2[r2 - 1], r2++) : l2 = f2[n2] - f2[n2 - 1], n2++;
          let u4;
          h2 ? (u4 = Ux(_, o2, l2, false), o2 += l2 * 2) : (u4 = Hx(e51.vertexBufferType, _, m2, s2, l2, false, c2), s2 += l2), t2[a2++] = [u4], d2 && i2++;
        }
        break;
      case Rx.POLYGON:
        {
          let l2 = f2[n2] - f2[n2 - 1];
          n2++;
          let u4 = Array(l2 - 1), g3, v2 = p2[r2] - p2[r2 - 1];
          if (r2++, h2) {
            g3 = Ux(_, o2, v2, true), o2 += v2 * 2;
            for (let e52 = 0; e52 < u4.length; e52++) v2 = p2[r2] - p2[r2 - 1], r2++, u4[e52] = Ux(_, o2, v2, true), o2 += v2 * 2;
          } else {
            g3 = Hx(e51.vertexBufferType, _, m2, s2, v2, true, c2), s2 += v2;
            for (let t3 = 0; t3 < u4.length; t3++) v2 = p2[r2] - p2[r2 - 1], r2++, u4[t3] = Hx(e51.vertexBufferType, _, m2, s2, v2, true, c2), s2 += v2;
          }
          t2[a2++] = [g3].concat(u4), d2 && i2++;
        }
        break;
      case Rx.MULTILINESTRING:
        {
          let l2 = d2[i2] - d2[i2 - 1];
          i2++;
          let u4 = Array(l2);
          for (let t3 = 0; t3 < l2; t3++) {
            let i3;
            if (g2 ? (i3 = p2[r2] - p2[r2 - 1], r2++) : i3 = f2[n2] - f2[n2 - 1], n2++, h2) u4[t3] = Ux(_, o2, i3, false), o2 += i3 * 2;
            else {
              let n3 = Hx(e51.vertexBufferType, _, m2, s2, i3, false, c2);
              u4[t3] = n3, s2 += i3;
            }
          }
          t2[a2++] = u4;
        }
        break;
      case Rx.MULTIPOLYGON:
        {
          let l2 = d2[i2] - d2[i2 - 1];
          i2++;
          let u4 = Array(l2);
          for (let t3 = 0; t3 < l2; t3++) {
            let i3 = f2[n2] - f2[n2 - 1];
            n2++;
            let a3, l3 = Array(i3 - 1), d3 = p2[r2] - p2[r2 - 1];
            r2++, h2 ? (a3 = Ux(_, o2, d3, true), o2 += d3 * 2) : (a3 = Hx(e51.vertexBufferType, _, m2, s2, d3, true, c2), s2 += d3);
            for (let t4 = 0; t4 < l3.length; t4++) {
              let n3 = p2[r2] - p2[r2 - 1];
              r2++, h2 ? (l3[t4] = Ux(_, o2, n3, true), o2 += n3 * 2) : (l3[t4] = Hx(e51.vertexBufferType, _, m2, s2, n3, true, c2), s2 += n3);
            }
            u4[t3] = [a3].concat(l3);
          }
          t2[a2++] = u4.flat();
        }
        break;
      default:
        throw Error(`The specified geometry type (${v}) is currently not supported.`);
    }
  }
  return t2;
}
function Hx(e51, t2, n2, r2, i2, a2, o2) {
  return e51 === Bx.MORTON ? Gx(t2, n2, r2, i2, a2, o2) : Wx(t2, n2, r2, i2, a2);
}
function Ux(e51, t2, n2, r2) {
  let i2 = Array(r2 ? n2 + 1 : n2);
  for (let r3 = 0; r3 < n2 * 2; r3 += 2) {
    let n3 = e51[t2 + r3], a2 = e51[t2 + r3 + 1];
    i2[r3 / 2] = new l(n3, a2);
  }
  return r2 && (i2[i2.length - 1] = i2[0]), i2;
}
function Wx(e51, t2, n2, r2, i2) {
  let a2 = Array(i2 ? r2 + 1 : r2);
  for (let i3 = 0; i3 < r2 * 2; i3 += 2) {
    let r3 = t2[n2 + i3 / 2] * 2, o2 = e51[r3], s2 = e51[r3 + 1];
    a2[i3 / 2] = new l(o2, s2);
  }
  return i2 && (a2[a2.length - 1] = a2[0]), a2;
}
function Gx(e51, t2, n2, r2, i2, a2) {
  let o2 = Array(i2 ? r2 + 1 : r2);
  for (let i3 = 0; i3 < r2; i3++) {
    let r3 = e51[t2[n2 + i3]], s2 = Ix(r3, a2.numBits, a2.coordinateShift);
    o2[i3] = new l(s2.x, s2.y);
  }
  return i2 && (o2[o2.length - 1] = o2[0]), o2;
}
var Kx = class {
  constructor(e51, t2, n2, r2, i2) {
    this._vertexBufferType = e51, this._topologyVector = t2, this._vertexOffsets = n2, this._vertexBuffer = r2, this._mortonSettings = i2;
  }
  get vertexBufferType() {
    return this._vertexBufferType;
  }
  get topologyVector() {
    return this._topologyVector;
  }
  get vertexOffsets() {
    return this._vertexOffsets;
  }
  get vertexBuffer() {
    return this._vertexBuffer;
  }
  getSimpleEncodedVertex(e51) {
    let t2 = this.vertexOffsets ? this.vertexOffsets[e51] * 2 : e51 * 2;
    return [this.vertexBuffer[t2], this.vertexBuffer[t2 + 1]];
  }
  getVertex(e51) {
    if (this.vertexOffsets && this.mortonSettings) {
      let t3 = this.vertexOffsets[e51], n2 = this.vertexBuffer[t3], r2 = Ix(n2, this.mortonSettings.numBits, this.mortonSettings.coordinateShift);
      return [r2.x, r2.y];
    }
    let t2 = this.vertexOffsets ? this.vertexOffsets[e51] * 2 : e51 * 2;
    return [this.vertexBuffer[t2], this.vertexBuffer[t2 + 1]];
  }
  getGeometries() {
    return Vx(this);
  }
  get mortonSettings() {
    return this._mortonSettings;
  }
};
function qx(e51, t2, n2, r2, i2) {
  return new Yx(e51, t2, Bx.VEC_2, n2, r2, i2);
}
function Jx(e51, t2, n2, r2, i2, a2) {
  return new Yx(e51, t2, Bx.MORTON, n2, r2, i2, a2);
}
var Yx = class extends Kx {
  constructor(e51, t2, n2, r2, i2, a2, o2) {
    super(n2, r2, i2, a2, o2), this._numGeometries = e51, this._geometryType = t2;
  }
  geometryType(e51) {
    return this._geometryType;
  }
  get numGeometries() {
    return this._numGeometries;
  }
  containsPolygonGeometry() {
    return this._geometryType === Rx.POLYGON || this._geometryType === Rx.MULTIPOLYGON;
  }
  containsSingleGeometryType() {
    return true;
  }
};
function Xx(e51, t2, n2, r2) {
  return new Qx(Bx.VEC_2, e51, t2, n2, r2);
}
function Zx(e51, t2, n2, r2, i2) {
  return new Qx(Bx.MORTON, e51, t2, n2, r2, i2);
}
var Qx = class extends Kx {
  constructor(e51, t2, n2, r2, i2, a2) {
    super(e51, n2, r2, i2, a2), this._geometryTypes = t2;
  }
  geometryType(e51) {
    return this._geometryTypes[e51];
  }
  get numGeometries() {
    return this._geometryTypes.length;
  }
  containsPolygonGeometry() {
    for (let e51 = 0; e51 < this.numGeometries; e51++) if (this.geometryType(e51) === Rx.POLYGON || this.geometryType(e51) === Rx.MULTIPOLYGON) return true;
    return false;
  }
  containsSingleGeometryType() {
    return false;
  }
};
var $x = class {
  constructor(e51, t2, n2, r2) {
    this._triangleOffsets = e51, this._indexBuffer = t2, this._vertexBuffer = n2, this._topologyVector = r2;
  }
  get triangleOffsets() {
    return this._triangleOffsets;
  }
  get indexBuffer() {
    return this._indexBuffer;
  }
  get vertexBuffer() {
    return this._vertexBuffer;
  }
  get topologyVector() {
    return this._topologyVector;
  }
  getGeometries() {
    if (!this._topologyVector) throw Error(`Cannot convert GpuVector to coordinates without topology information`);
    let e51 = Array(this.numGeometries), t2 = this._topologyVector, n2 = t2.partOffsets, r2 = t2.ringOffsets, i2 = t2.geometryOffsets, a2 = 0, o2 = 1, s2 = 1, c2 = 1;
    for (let t3 = 0; t3 < this.numGeometries; t3++) switch (this.geometryType(t3)) {
      case Rx.POLYGON:
        {
          let u2 = n2[o2] - n2[o2 - 1];
          o2++;
          let d2 = [];
          for (let e52 = 0; e52 < u2; e52++) {
            let e53 = r2[s2] - r2[s2 - 1];
            s2++;
            let t4 = [];
            for (let n3 = 0; n3 < e53; n3++) {
              let e54 = this._vertexBuffer[a2++], n4 = this._vertexBuffer[a2++];
              t4.push(new l(e54, n4));
            }
            t4.length > 0 && t4.push(t4[0]), d2.push(t4);
          }
          e51[t3] = d2, i2 && c2++;
        }
        break;
      case Rx.MULTIPOLYGON: {
        let u2 = i2[c2] - i2[c2 - 1];
        c2++;
        let d2 = [];
        for (let e52 = 0; e52 < u2; e52++) {
          let e53 = n2[o2] - n2[o2 - 1];
          o2++;
          for (let t4 = 0; t4 < e53; t4++) {
            let e54 = r2[s2] - r2[s2 - 1];
            s2++;
            let t5 = [];
            for (let n3 = 0; n3 < e54; n3++) {
              let e55 = this._vertexBuffer[a2++], n4 = this._vertexBuffer[a2++];
              t5.push(new l(e55, n4));
            }
            t5.length > 0 && t5.push(t5[0]), d2.push(t5);
          }
        }
        e51[t3] = d2;
      }
    }
    return e51;
  }
  [Symbol.iterator]() {
    return null;
  }
};
function eS(e51, t2, n2, r2, i2, a2) {
  return new tS(e51, t2, n2, r2, i2, a2);
}
var tS = class extends $x {
  constructor(e51, t2, n2, r2, i2, a2) {
    super(n2, r2, i2, a2), this._numGeometries = e51, this._geometryType = t2;
  }
  geometryType(e51) {
    return this._geometryType;
  }
  get numGeometries() {
    return this._numGeometries;
  }
  containsSingleGeometryType() {
    return true;
  }
};
function nS(e51, t2, n2, r2, i2) {
  return new rS(e51, t2, n2, r2, i2);
}
var rS = class extends $x {
  constructor(e51, t2, n2, r2, i2) {
    super(t2, n2, r2, i2), this._geometryTypes = e51;
  }
  geometryType(e51) {
    return this._geometryTypes[e51];
  }
  get numGeometries() {
    return this._geometryTypes.length;
  }
  containsSingleGeometryType() {
    return false;
  }
};
function iS(e51, t2, n2, r2, i2) {
  let a2 = ax(e51, n2), o2 = jx(a2, r2, e51, n2), s2, c2, l2, u2;
  if (o2 === $.CONST) {
    let o3 = _x(e51, n2, a2), d3, f3, p3, m3;
    for (let r3 = 0; r3 < t2 - 1; r3++) {
      let t3 = ax(e51, n2);
      switch (t3.physicalStreamType) {
        case Yb.LENGTH:
          switch (t3.logicalStreamType.lengthType) {
            case Qb.GEOMETRIES:
              d3 = mx(e51, n2, t3);
              break;
            case Qb.PARTS:
              f3 = mx(e51, n2, t3);
              break;
            case Qb.RINGS:
              p3 = mx(e51, n2, t3);
              break;
            case Qb.TRIANGLES:
              m3 = mx(e51, n2, t3);
          }
          break;
        case Yb.OFFSET:
          switch (t3.logicalStreamType.offsetType) {
            case Zb.VERTEX:
              s2 = px(e51, n2, t3);
              break;
            case Zb.INDEX:
              u2 = px(e51, n2, t3);
          }
          break;
        case Yb.DATA:
          if (Xb.VERTEX === t3.logicalStreamType.dictionaryType) c2 = fx(e51, n2, t3, i2);
          else {
            let r4 = t3;
            l2 = { numBits: r4.numBits, coordinateShift: r4.coordinateShift }, c2 = px(e51, n2, t3, i2);
          }
      }
    }
    return u2 ? d3 !== void 0 || f3 !== void 0 ? eS(r2, o3, m3, u2, c2, { geometryOffsets: d3, partOffsets: f3, ringOffsets: p3 }) : eS(r2, o3, m3, u2, c2) : l2 === void 0 ? qx(r2, o3, { geometryOffsets: d3, partOffsets: f3, ringOffsets: p3 }, s2, c2) : Jx(r2, o3, { geometryOffsets: d3, partOffsets: f3, ringOffsets: p3 }, s2, c2, l2);
  }
  let d2 = px(e51, n2, a2), f2, p2, m2, h2;
  for (let r3 = 0; r3 < t2 - 1; r3++) {
    let t3 = ax(e51, n2);
    switch (t3.physicalStreamType) {
      case Yb.LENGTH:
        switch (t3.logicalStreamType.lengthType) {
          case Qb.GEOMETRIES:
            f2 = px(e51, n2, t3);
            break;
          case Qb.PARTS:
            p2 = px(e51, n2, t3);
            break;
          case Qb.RINGS:
            m2 = px(e51, n2, t3);
            break;
          case Qb.TRIANGLES:
            h2 = mx(e51, n2, t3);
        }
        break;
      case Yb.OFFSET:
        switch (t3.logicalStreamType.offsetType) {
          case Zb.VERTEX:
            s2 = px(e51, n2, t3);
            break;
          case Zb.INDEX:
            u2 = px(e51, n2, t3);
        }
        break;
      case Yb.DATA:
        if (Xb.VERTEX === t3.logicalStreamType.dictionaryType) c2 = fx(e51, n2, t3, i2);
        else {
          let r4 = t3;
          l2 = { numBits: r4.numBits, coordinateShift: r4.coordinateShift }, c2 = px(e51, n2, t3, i2);
        }
    }
  }
  let g2, _, v;
  return f2 ? (g2 = aS(d2, f2, 2), p2 && m2 ? (_ = oS(d2, g2, p2, false), v = cS(d2, g2, _, m2)) : p2 && (_ = sS(d2, g2, p2))) : p2 && m2 ? (_ = aS(d2, p2, 1), v = oS(d2, _, m2, true)) : p2 && (_ = aS(d2, p2, 0)), u2 && !_ ? nS(d2, h2, u2, c2) : u2 ? nS(d2, h2, u2, c2, { geometryOffsets: g2, partOffsets: _, ringOffsets: v }) : l2 === void 0 ? Xx(d2, { geometryOffsets: g2, partOffsets: _, ringOffsets: v }, s2, c2) : Zx(d2, { geometryOffsets: g2, partOffsets: _, ringOffsets: v }, s2, c2, l2);
}
function aS(e51, t2, n2) {
  let r2 = new Uint32Array(e51.length + 1), i2 = 0;
  r2[0] = i2;
  let a2 = 0;
  for (let o2 = 0; o2 < e51.length; o2++) i2 = r2[o2 + 1] = i2 + (e51[o2] > n2 ? t2[a2++] : 1);
  return r2;
}
function oS(e51, t2, n2, r2) {
  let i2 = new Uint32Array(t2[t2.length - 1] + 1), a2 = 0;
  i2[0] = a2;
  let o2 = 1, s2 = 0;
  for (let c2 = 0; c2 < e51.length; c2++) {
    let l2 = e51[c2], u2 = t2[c2 + 1] - t2[c2];
    if (l2 === 5 || l2 === 2 || r2 && (l2 === 4 || l2 === 1)) for (let e52 = 0; e52 < u2; e52++) a2 = i2[o2++] = a2 + n2[s2++];
    else for (let e52 = 0; e52 < u2; e52++) i2[o2++] = ++a2;
  }
  return i2;
}
function sS(e51, t2, n2) {
  let r2 = new Uint32Array(t2[t2.length - 1] + 1), i2 = 0;
  r2[0] = i2;
  let a2 = 1, o2 = 0;
  for (let s2 = 0; s2 < e51.length; s2++) {
    let c2 = e51[s2], l2 = t2[s2 + 1] - t2[s2];
    if (c2 === 4 || c2 === 1) for (let e52 = 0; e52 < l2; e52++) i2 = r2[a2++] = i2 + n2[o2++];
    else for (let e52 = 0; e52 < l2; e52++) r2[a2++] = ++i2;
  }
  return r2;
}
function cS(e51, t2, n2, r2) {
  let i2 = new Uint32Array(n2[n2.length - 1] + 1), a2 = 0;
  i2[0] = a2;
  let o2 = 1, s2 = 1, c2 = 0;
  for (let l2 = 0; l2 < e51.length; l2++) {
    let u2 = e51[l2], d2 = t2[l2 + 1] - t2[l2];
    if (u2 !== 0 && u2 !== 3) for (let e52 = 0; e52 < d2; e52++) {
      let e53 = n2[o2] - n2[o2 - 1];
      o2++;
      for (let t3 = 0; t3 < e53; t3++) a2 = i2[s2++] = a2 + r2[c2++];
    }
    else for (let e52 = 0; e52 < d2; e52++) i2[s2++] = ++a2, o2++;
  }
  return i2;
}
var lS = class extends ty {
  constructor(e51, t2, n2) {
    super(e51, t2.getBuffer(), n2), this.dataVector = t2;
  }
  getValueFromBuffer(e51) {
    return this.dataVector.get(e51);
  }
};
var uS = class extends ny {
  getValueFromBuffer(e51) {
    return this.dataBuffer[e51];
  }
};
var dS = class extends ty {
  constructor(e51, t2, n2, r2) {
    super(e51, r2 ? BigInt64Array.of(t2) : BigUint64Array.of(t2), n2);
  }
  getValueFromBuffer(e51) {
    return this.dataBuffer[0];
  }
};
function fS(e51, t2, n2) {
  for (let r2 = 0; r2 < e51; r2++) {
    let e52 = ax(t2, n2);
    n2.add(e52.byteLength);
  }
}
function pS(e51, t2, n2, r2, i2) {
  let a2 = mS(e51, Math.ceil(t2 / 8), n2, r2);
  return i2 ? dx(a2, t2, i2) : a2;
}
function mS(e51, t2, n2, r2) {
  let i2 = new Uint8Array(t2), a2 = 0, o2 = r2.get() + n2;
  for (; a2 < t2 && !(r2.get() >= o2); ) {
    let n3 = e51[r2.increment()];
    if (n3 <= 127) {
      let o3 = n3 + 3, s2 = e51[r2.increment()], c2 = Math.min(a2 + o3, t2);
      i2.fill(s2, a2, c2), a2 = c2;
    } else {
      let o3 = 256 - n3;
      for (let n4 = 0; n4 < o3 && a2 < t2; n4++) i2[a2++] = e51[r2.increment()];
    }
  }
  return r2.set(o2), i2;
}
function hS(e51, t2, n2, r2) {
  let i2 = t2.get(), a2 = i2 + n2 * Float32Array.BYTES_PER_ELEMENT, o2 = new Uint8Array(e51.subarray(i2, a2)).buffer, s2 = new Float32Array(o2);
  return t2.set(a2), r2 ? ux(s2, r2, 0) : s2;
}
function gS(e51, t2, n2, r2) {
  let i2 = t2.get(), a2 = i2 + n2 * Float64Array.BYTES_PER_ELEMENT, o2 = new Uint8Array(e51.subarray(i2, a2)).buffer, s2 = new Float64Array(o2);
  return t2.set(a2), r2 ? ux(s2, r2, 0) : s2;
}
var _S = new TextDecoder();
function vS(e51, t2, n2) {
  return n2 - t2 >= 12 ? _S.decode(e51.subarray(t2, n2)) : yS(e51, t2, n2);
}
function yS(e51, t2, n2) {
  let r2 = ``, i2 = t2;
  for (; i2 < n2; ) {
    let t3 = e51[i2], a2 = null, o2 = t3 > 239 ? 4 : t3 > 223 ? 3 : t3 > 191 ? 2 : 1;
    if (i2 + o2 > n2) break;
    let s2, c2, l2;
    o2 === 1 ? t3 < 128 && (a2 = t3) : o2 === 2 ? (s2 = e51[i2 + 1], (s2 & 192) == 128 && (a2 = (t3 & 31) << 6 | s2 & 63, a2 <= 127 && (a2 = null))) : o2 === 3 ? (s2 = e51[i2 + 1], c2 = e51[i2 + 2], (s2 & 192) == 128 && (c2 & 192) == 128 && (a2 = (t3 & 15) << 12 | (s2 & 63) << 6 | c2 & 63, (a2 <= 2047 || a2 >= 55296 && a2 <= 57343) && (a2 = null))) : o2 === 4 && (s2 = e51[i2 + 1], c2 = e51[i2 + 2], l2 = e51[i2 + 3], (s2 & 192) == 128 && (c2 & 192) == 128 && (l2 & 192) == 128 && (a2 = (t3 & 15) << 18 | (s2 & 63) << 12 | (c2 & 63) << 6 | l2 & 63, (a2 <= 65535 || a2 >= 1114112) && (a2 = null))), a2 === null ? (a2 = 65533, o2 = 1) : a2 > 65535 && (a2 -= 65536, r2 += String.fromCharCode(a2 >>> 10 & 1023 | 55296), a2 = 56320 | a2 & 1023), r2 += String.fromCharCode(a2), i2 += o2;
  }
  return r2;
}
var bS = class extends ty {
  constructor(e51, t2, n2, r2) {
    super(e51, n2, r2), this.offsetBuffer = t2;
  }
};
var xS = class extends bS {
  constructor(e51, t2, n2, r2) {
    super(e51, t2, n2, r2 ?? t2.length - 1);
  }
  getValueFromBuffer(e51) {
    let t2 = this.offsetBuffer[e51], n2 = this.offsetBuffer[e51 + 1];
    return vS(this.dataBuffer, t2, n2);
  }
};
var SS = class extends bS {
  constructor(e51, t2, n2, r2, i2) {
    super(e51, n2, r2, i2 ?? t2.length), this.indexBuffer = t2, this.indexBuffer = t2;
  }
  getValueFromBuffer(e51) {
    let t2 = this.indexBuffer[e51], n2 = this.offsetBuffer[t2], r2 = this.offsetBuffer[t2 + 1];
    return vS(this.dataBuffer, n2, r2);
  }
};
function CS(e51, t2, n2) {
  let r2 = [], i2 = Array(t2.length).fill(0);
  for (let e52 = 1; e52 < t2.length; e52++) i2[e52] = i2[e52 - 1] + t2[e52 - 1];
  for (let a2 = 0; a2 < n2.length; a2++) if (n2[a2] === 255) r2.push(n2[++a2]);
  else {
    let o2 = t2[n2[a2]], s2 = i2[n2[a2]];
    for (let t3 = 0; t3 < o2; t3++) r2.push(e51[s2 + t3]);
  }
  return new Uint8Array(r2);
}
var wS = class extends bS {
  constructor(e51, t2, n2, r2, i2, a2, o2) {
    super(e51, n2, r2, o2 ?? t2.length), this.indexBuffer = t2, this.symbolOffsetBuffer = i2, this.symbolTableBuffer = a2;
  }
  getValueFromBuffer(e51) {
    this.decodedDictionary ??= (this.symbolLengthBuffer ??= this.offsetToLengthBuffer(this.symbolOffsetBuffer), CS(this.symbolTableBuffer, this.symbolLengthBuffer, this.dataBuffer));
    let t2 = this.indexBuffer[e51], n2 = this.offsetBuffer[t2], r2 = this.offsetBuffer[t2 + 1];
    return vS(this.decodedDictionary, n2, r2);
  }
  offsetToLengthBuffer(e51) {
    let t2 = new Uint32Array(e51.length - 1), n2 = e51[0];
    for (let r2 = 1; r2 < e51.length; r2++) {
      let i2 = e51[r2];
      t2[r2 - 1] = i2 - n2, n2 = i2;
    }
    return t2;
  }
};
function TS(e51, t2, n2, r2, i2) {
  let a2 = null, o2 = null, s2 = null, c2 = null, l2 = null, u2 = i2 ?? null, d2 = null, f2 = null;
  for (let e52 = 0; e52 < r2; e52++) {
    let e53 = ax(t2, n2);
    switch (e53.physicalStreamType) {
      case Yb.PRESENT: {
        let r3 = new lx(pS(t2, e53.numValues, e53.byteLength, n2), e53.numValues);
        u2 = i2 ?? r3;
        break;
      }
      case Yb.OFFSET:
        o2 = px(t2, n2, e53, void 0, u2);
        break;
      case Yb.LENGTH: {
        let r3 = mx(t2, n2, e53);
        Qb.DICTIONARY === e53.logicalStreamType.lengthType ? a2 = r3 : Qb.SYMBOL === e53.logicalStreamType.lengthType ? c2 = r3 : d2 = r3;
        break;
      }
      case Yb.DATA: {
        let r3 = t2.subarray(n2.get(), n2.get() + e53.byteLength);
        n2.add(e53.byteLength);
        let i3 = e53.logicalStreamType.dictionaryType;
        Xb.FSST === i3 ? l2 = r3 : Xb.SINGLE === i3 || Xb.SHARED === i3 ? s2 = r3 : Xb.NONE === i3 && (f2 = r3);
        break;
      }
    }
  }
  return ES(e51, l2, o2, a2, s2, c2, u2) ?? DS(e51, s2, o2, a2, u2) ?? OS(e51, d2, f2, o2, u2);
}
function ES(e51, t2, n2, r2, i2, a2, o2) {
  return t2 ? new wS(e51, n2, r2, i2, a2, t2, o2) : null;
}
function DS(e51, t2, n2, r2, i2) {
  return t2 ? i2 ? new SS(e51, n2, r2, t2, i2) : new SS(e51, n2, r2, t2) : null;
}
function OS(e51, t2, n2, r2, i2) {
  if (!t2 || !n2) return null;
  if (r2) return i2 ? new SS(e51, r2, t2, n2, i2) : new SS(e51, r2, t2, n2);
  if (i2 && i2.size() !== t2.length - 1) {
    let r3 = new Uint32Array(i2.size()), a2 = 0;
    for (let e52 = 0; e52 < i2.size(); e52++) i2.get(e52) ? r3[e52] = a2++ : r3[e52] = 0;
    return new SS(e51, r3, t2, n2, i2);
  }
  return i2 ? new xS(e51, t2, n2, i2) : new xS(e51, t2, n2);
}
function kS(e51, t2, n2, r2) {
  let i2 = null, a2 = null, o2 = null, s2 = null, c2 = false;
  for (; !c2; ) {
    let n3 = ax(e51, t2);
    switch (n3.physicalStreamType) {
      case Yb.LENGTH:
        Qb.DICTIONARY === n3.logicalStreamType.lengthType ? i2 = mx(e51, t2, n3) : o2 = mx(e51, t2, n3);
        break;
      case Yb.DATA:
        Xb.SINGLE === n3.logicalStreamType.dictionaryType || Xb.SHARED === n3.logicalStreamType.dictionaryType ? (a2 = e51.subarray(t2.get(), t2.get() + n3.byteLength), c2 = true) : s2 = e51.subarray(t2.get(), t2.get() + n3.byteLength), t2.add(n3.byteLength);
    }
  }
  let l2 = n2.complexType.children, u2 = [], d2 = 0;
  for (let c3 of l2) {
    let l3 = sb(e51, t2, 1)[0];
    if (l3 === 0) continue;
    let f2 = c3.name ? `${n2.name}${c3.name}` : n2.name;
    if (r2 && !r2.has(f2)) {
      fS(l3, e51, t2);
      continue;
    }
    if (c3.type !== `scalarField` || c3.scalarField.physicalType !== X.STRING) throw Error(`Currently only scalar string fields are implemented for a struct.`);
    if (l3 > 1 && !c3.nullable || l3 === 1 && c3.nullable) throw Error(`The number of streams for the child field ${c3.name} does not match its nullability. nullibilty: ${c3.nullable}, numStreams: ${l3}`);
    let p2;
    if (c3.nullable) {
      let n3 = ax(e51, t2);
      p2 = new lx(pS(e51, n3.numValues, n3.byteLength, t2), n3.numValues);
    }
    let m2 = px(e51, t2, ax(e51, t2), void 0, p2);
    u2[d2++] = s2 ? new wS(f2, m2, i2, a2, o2, s2, p2) : new SS(f2, m2, i2, a2, p2);
  }
  return u2;
}
function AS(e51, t2, n2, r2, i2, a2) {
  return n2.type === `scalarType` ? a2 && !a2.has(n2.name) ? (fS(r2, e51, t2), null) : jS(r2, e51, t2, i2, n2.scalarType, n2) : r2 === 0 ? null : kS(e51, t2, n2, a2);
}
function jS(e51, t2, n2, r2, i2, a2) {
  let o2 = null;
  if (e51 === 0) return null;
  if (a2.nullable) {
    let e52 = ax(t2, n2), r3 = e52.numValues, i3 = n2.get(), a3 = pS(t2, r3, e52.byteLength, n2);
    n2.set(i3 + e52.byteLength), o2 = new lx(a3, e52.numValues);
  }
  let s2 = o2 ?? r2;
  switch (i2.physicalType) {
    case X.UINT_32:
    case X.INT_32:
      return IS(t2, n2, a2, i2, s2);
    case X.STRING: {
      let r3 = a2.nullable ? e51 - 1 : e51;
      return TS(a2.name, t2, n2, r3, o2);
    }
    case X.BOOLEAN:
      return MS(t2, n2, a2, r2, s2);
    case X.UINT_64:
    case X.INT_64:
      return FS(t2, n2, a2, s2, i2);
    case X.FLOAT:
      return NS(t2, n2, a2, s2);
    case X.DOUBLE:
      return PS(t2, n2, a2, s2);
    default:
      throw Error(`The specified data type for the field is currently not supported: ${i2}`);
  }
}
function MS(e51, t2, n2, r2, i2) {
  let a2 = ax(e51, t2), o2 = a2.numValues, s2 = t2.get(), c2 = LS(i2) ? i2 : void 0, l2 = pS(e51, o2, a2.byteLength, t2, c2);
  t2.set(s2 + a2.byteLength);
  let u2 = new lx(l2, o2);
  return new lS(n2.name, u2, i2);
}
function NS(e51, t2, n2, r2) {
  let i2 = ax(e51, t2), a2 = LS(r2) ? r2 : void 0, o2 = hS(e51, t2, i2.numValues, a2);
  return new uS(n2.name, o2, r2);
}
function PS(e51, t2, n2, r2) {
  let i2 = ax(e51, t2), a2 = LS(r2) ? r2 : void 0, o2 = gS(e51, t2, i2.numValues, a2);
  return new iy(n2.name, o2, r2);
}
function FS(e51, t2, n2, r2, i2) {
  let a2 = ax(e51, t2), o2 = jx(a2, r2, e51, t2, `int64`), s2 = i2.physicalType === X.INT_64;
  if (o2 === $.FLAT) {
    let i3 = LS(r2) ? r2 : void 0, o3 = s2 ? bx(e51, t2, a2, i3) : xx(e51, t2, a2, i3);
    return new Px(n2.name, o3, r2);
  }
  if (o2 === $.SEQUENCE) {
    let r3 = yx(e51, t2, a2);
    return new Fx(n2.name, r3[0], r3[1], a2.numRleValues);
  }
  let c2 = s2 ? Cx(e51, t2, a2) : wx(e51, t2, a2);
  return new dS(n2.name, c2, r2, s2);
}
function IS(e51, t2, n2, r2, i2) {
  let a2 = ax(e51, t2), o2 = jx(a2, i2, e51, t2), s2 = r2.physicalType === X.INT_32;
  if (o2 === $.FLAT) {
    let r3 = LS(i2) ? i2 : void 0, o3 = s2 ? fx(e51, t2, a2, void 0, r3) : px(e51, t2, a2, void 0, r3);
    return new ry(n2.name, o3, i2);
  }
  if (o2 === $.SEQUENCE) {
    let r3 = vx(e51, t2, a2);
    return new oy(n2.name, r3[0], r3[1], a2.numRleValues);
  }
  let c2 = s2 ? gx(e51, t2, a2) : _x(e51, t2, a2);
  return new sy(n2.name, c2, i2, s2);
}
function LS(e51) {
  return e51 instanceof lx;
}
function RS(e51) {
  switch (e51) {
    case 0:
    case 1:
    case 2:
    case 3: {
      let t2 = {};
      t2.nullable = !!(e51 & 1), t2.columnScope = ly.FEATURE;
      let n2 = {};
      return n2.type = `logicalType`, n2.logicalType = dy.ID, n2.longID = !!(e51 & 2), t2.scalarType = n2, t2.type = `scalarType`, t2;
    }
    case 4: {
      let e52 = {};
      e52.nullable = false, e52.columnScope = ly.FEATURE;
      let t2 = {};
      return t2.type = `physicalType`, t2.physicalType = uy.GEOMETRY, e52.type = `complexType`, e52.complexType = t2, e52;
    }
    case 30: {
      let e52 = {};
      e52.nullable = false, e52.columnScope = ly.FEATURE;
      let t2 = {};
      return t2.type = `physicalType`, t2.physicalType = uy.STRUCT, e52.type = `complexType`, e52.complexType = t2, e52;
    }
    default:
      return WS(e51);
  }
}
function zS(e51) {
  return e51 >= 10;
}
function BS(e51) {
  return e51 === 30;
}
function VS(e51) {
  if (e51.type === `scalarType`) {
    let t2 = e51.scalarType;
    if (t2.type === `physicalType`) switch (t2.physicalType) {
      case X.BOOLEAN:
      case X.INT_8:
      case X.UINT_8:
      case X.INT_32:
      case X.UINT_32:
      case X.INT_64:
      case X.UINT_64:
      case X.FLOAT:
      case X.DOUBLE:
        return false;
      case X.STRING:
        return true;
      default:
        return false;
    }
    if (t2.type === `logicalType`) return false;
  } else if (e51.type === `complexType`) {
    let t2 = e51.complexType;
    if (t2.type === `physicalType`) switch (t2.physicalType) {
      case uy.GEOMETRY:
      case uy.STRUCT:
        return true;
      default:
        return false;
    }
  }
  return console.warn(`Unexpected column type in hasStreamCount`, e51), false;
}
function HS(e51) {
  return e51.type === `scalarType` && e51.scalarType?.type === `logicalType` && e51.scalarType.logicalType === dy.ID;
}
function US(e51) {
  return e51.type === `complexType` && e51.complexType?.type === `physicalType` && e51.complexType.physicalType === uy.GEOMETRY;
}
function WS(e51) {
  let t2;
  switch (e51) {
    case 10:
    case 11:
      t2 = X.BOOLEAN;
      break;
    case 12:
    case 13:
      t2 = X.INT_8;
      break;
    case 14:
    case 15:
      t2 = X.UINT_8;
      break;
    case 16:
    case 17:
      t2 = X.INT_32;
      break;
    case 18:
    case 19:
      t2 = X.UINT_32;
      break;
    case 20:
    case 21:
      t2 = X.INT_64;
      break;
    case 22:
    case 23:
      t2 = X.UINT_64;
      break;
    case 24:
    case 25:
      t2 = X.FLOAT;
      break;
    case 26:
    case 27:
      t2 = X.DOUBLE;
      break;
    case 28:
    case 29:
      t2 = X.STRING;
      break;
    default:
      return null;
  }
  let n2 = {};
  n2.nullable = !!(e51 & 1), n2.columnScope = ly.FEATURE;
  let r2 = {};
  return r2.type = `physicalType`, r2.physicalType = t2, n2.type = `scalarType`, n2.scalarType = r2, n2;
}
var GS = new TextDecoder();
function KS(e51, t2) {
  let n2 = sb(e51, t2, 1)[0];
  if (n2 === 0) return ``;
  let r2 = t2.get(), i2 = r2 + n2, a2 = e51.subarray(r2, i2);
  return t2.add(n2), GS.decode(a2);
}
function qS(e51) {
  return { name: e51.name, nullable: e51.nullable, scalarField: e51.scalarType, complexField: e51.complexType, type: e51.type === `scalarType` ? `scalarField` : `complexField` };
}
function JS(e51, t2) {
  let n2 = sb(e51, t2, 1)[0] >>> 0;
  if (n2 < 10 || n2 > 30) throw Error(`Unsupported field type code ${n2}. Supported: 10-29(scalars), 30(STRUCT)`);
  let r2 = RS(n2);
  if (zS(n2) && (r2.name = KS(e51, t2)), BS(n2)) {
    let n3 = sb(e51, t2, 1)[0] >>> 0;
    r2.complexType.children = Array(n3);
    for (let i2 = 0; i2 < n3; i2++) r2.complexType.children[i2] = JS(e51, t2);
  }
  return qS(r2);
}
function YS(e51, t2) {
  let n2 = sb(e51, t2, 1)[0] >>> 0, r2 = RS(n2);
  if (!r2) throw Error(`Unsupported column type code ${n2}. Supported: 0-3(ID), 4(GEOMETRY), 10-29(scalars), 30(STRUCT)`);
  if (zS(n2) ? r2.name = KS(e51, t2) : n2 >= 0 && n2 <= 3 ? r2.name = `id` : n2 === 4 && (r2.name = `geometry`), BS(n2)) {
    let n3 = sb(e51, t2, 1)[0] >>> 0, i2 = r2.complexType;
    i2.children = Array(n3);
    for (let r3 = 0; r3 < n3; r3++) i2.children[r3] = JS(e51, t2);
  }
  return r2;
}
function XS(e51, t2) {
  let n2 = {};
  n2.featureTables = [];
  let r2 = {};
  if (r2.name = KS(e51, t2), r2.name.length === 0) throw Error(`Missing layer name`);
  let i2 = sb(e51, t2, 1)[0] >>> 0, a2 = sb(e51, t2, 1)[0] >>> 0;
  r2.columns = Array(a2);
  for (let n3 = 0; n3 < a2; n3++) r2.columns[n3] = YS(e51, t2);
  return n2.featureTables.push(r2), [n2, i2];
}
function ZS(e51, t2, n2 = true) {
  let r2 = new fy(0), i2 = [];
  for (; r2.get() < e51.length; ) {
    let a2 = sb(e51, r2, 1)[0] >>> 0, o2 = r2.get() + a2;
    if (o2 > e51.length) throw Error(`Block overruns tile: ${o2} > ${e51.length}`);
    if (sb(e51, r2, 1)[0] >>> 0 != 1) {
      r2.set(o2);
      continue;
    }
    let [s2, c2] = XS(e51, r2), l2 = s2.featureTables[0], u2 = null, d2 = null, f2 = [], p2 = 0;
    for (let i3 of l2.columns) {
      let a3 = i3.name;
      if (HS(i3)) {
        let t3 = null;
        if (i3.nullable) {
          let n3 = ax(e51, r2), i4 = r2.get(), a4 = pS(e51, n3.numValues, n3.byteLength, r2);
          r2.set(i4 + n3.byteLength), t3 = new lx(a4, n3.numValues);
        }
        let o3 = ax(e51, r2);
        p2 = t3 ? t3.size() : o3.decompressedCount, u2 = QS(e51, i3, r2, a3, o3, t3 ?? p2, n2);
      } else if (US(i3)) {
        let n3 = sb(e51, r2, 1)[0];
        if (p2 === 0) {
          let t3 = r2.get();
          p2 = ax(e51, r2).decompressedCount, r2.set(t3);
        }
        t2 && (t2.scale = t2.extent / c2), d2 = iS(e51, n3, r2, p2, t2);
      } else {
        let t3 = VS(i3) ? sb(e51, r2, 1)[0] : 1;
        if (t3 === 0) continue;
        let n3 = AS(e51, r2, i3, t3, p2, void 0);
        if (n3) {
          if (Array.isArray(n3)) for (let e52 of n3) f2.push(e52);
          else f2.push(n3);
        }
      }
    }
    let m2 = new cy(l2.name, d2, u2, f2, c2);
    i2.push(m2), r2.set(o2);
  }
  return i2;
}
function QS(e51, t2, n2, r2, i2, a2, o2 = false) {
  let s2 = t2.scalarType;
  if (s2?.type !== `logicalType` || s2.logicalType !== dy.ID) throw Error(`ID column must be a logical ID scalar type: ${r2}`);
  let c2 = s2.longID ? X.UINT_64 : X.UINT_32, l2 = typeof a2 == `number` ? void 0 : a2, u2 = jx(i2, a2, e51, n2, c2 === X.UINT_64 ? `int64` : `int32`);
  if (c2 === X.UINT_32) switch (u2) {
    case $.FLAT:
      return new ry(r2, px(e51, n2, i2, void 0, l2), a2);
    case $.SEQUENCE: {
      let t3 = vx(e51, n2, i2);
      return new oy(r2, t3[0], t3[1], i2.numRleValues);
    }
    case $.CONST:
      return new sy(r2, _x(e51, n2, i2), a2, false);
  }
  switch (u2) {
    case $.FLAT:
      return o2 ? new iy(r2, Sx(e51, n2, i2), a2) : new Px(r2, xx(e51, n2, i2, l2), a2);
    case $.SEQUENCE: {
      let t3 = yx(e51, n2, i2);
      return new Fx(r2, t3[0], t3[1], i2.numRleValues);
    }
    case $.CONST:
      return new dS(r2, wx(e51, n2, i2), a2, false);
  }
  throw Error(`Vector type not supported for id column.`);
}
var $S = class {
  constructor(e51, t2) {
    switch (this._featureData = e51, this.properties = this._featureData.properties || {}, this._featureData.geometry?.type) {
      case Rx.POINT:
      case Rx.MULTIPOINT:
        this.type = 1;
        break;
      case Rx.LINESTRING:
      case Rx.MULTILINESTRING:
        this.type = 2;
        break;
      case Rx.POLYGON:
      case Rx.MULTIPOLYGON:
        this.type = 3;
        break;
      default:
        this.type = 0;
    }
    this.extent = t2, this.id = Number(this._featureData.id);
  }
  loadGeometry() {
    let e51 = [];
    for (let t2 of this._featureData.geometry.coordinates) {
      let n2 = [];
      for (let e52 of t2) n2.push(new l(e52.x, e52.y));
      e51.push(n2);
    }
    return e51;
  }
};
var eC = class {
  constructor(e51) {
    this.features = [], this.featureTable = e51, this.name = e51.name, this.extent = e51.extent, this.version = 2, this.features = e51.getFeatures(), this.length = this.features.length;
  }
  feature(e51) {
    return new $S(this.features[e51], this.extent);
  }
};
var tC = class {
  constructor(e51) {
    this.layers = {};
    let t2 = ZS(new Uint8Array(e51));
    this.layers = t2.reduce((e52, t3) => ({ ...e52, [t3.name]: new eC(t3) }), {});
  }
};
var nC = class {
  constructor(e51, t2) {
    this.tileID = e51, this.x = e51.canonical.x, this.y = e51.canonical.y, this.z = e51.canonical.z, this.grid = new Oc(j, 16, 0), this.grid3D = new Oc(j, 16, 0), this.featureIndexArray = new du(), this.promoteId = t2;
  }
  insert(e51, t2, n2, r2, i2, a2) {
    let o2 = this.featureIndexArray.length;
    this.featureIndexArray.emplaceBack(n2, r2, i2);
    let s2 = a2 ? this.grid3D : this.grid;
    for (let e52 of t2) {
      let t3 = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
      for (let n3 of e52) t3[0] = Math.min(t3[0], n3.x), t3[1] = Math.min(t3[1], n3.y), t3[2] = Math.max(t3[2], n3.x), t3[3] = Math.max(t3[3], n3.y);
      t3[0] < 8192 && t3[1] < 8192 && t3[2] >= 0 && t3[3] >= 0 && s2.insert(o2, t3[0], t3[1], t3[2], t3[3]);
    }
  }
  loadVTLayers() {
    if (!this.vtLayers) {
      switch (this.encoding) {
        case `mlt`:
          this.vtLayers = new tC(this.rawTileData).layers;
          break;
        default:
          this.vtLayers = new cm(new a_(this.rawTileData)).layers;
      }
      this.sourceLayerCoder = new $v(this.vtLayers ? Object.keys(this.vtLayers).sort() : [Hv]);
    }
    return this.vtLayers;
  }
  query(e51, t2, n2, r2) {
    this.loadVTLayers();
    let i2 = e51.params, a2 = j / e51.tileSize / e51.scale, o2 = fs(i2.filter, `queryRenderedFeatures filter`, i2.globalState), s2 = e51.queryGeometry, c2 = e51.queryPadding * a2, l2 = $p.fromPoints(s2), u2 = this.grid.query(l2.minX - c2, l2.minY - c2, l2.maxX + c2, l2.maxY + c2), d2 = $p.fromPoints(e51.cameraQueryGeometry).expandBy(c2), f2 = this.grid3D.query(d2.minX, d2.minY, d2.maxX, d2.maxY, (t3, n3, r3, i3) => Nd(e51.cameraQueryGeometry, t3 - c2, n3 - c2, r3 + c2, i3 + c2));
    for (let e52 of f2) u2.push(e52);
    u2.sort(iC);
    let p2 = {}, m2;
    for (let c3 of u2) {
      if (c3 === m2) continue;
      m2 = c3;
      let l3 = this.featureIndexArray.get(c3), u3 = null;
      this.loadMatchingFeature(p2, l3.bucketIndex, l3.sourceLayerIndex, l3.featureIndex, o2, i2.layers, i2.availableImages, t2, n2, r2, (t3, n3, r3) => (u3 ||= _d(t3), n3.queryIntersectsFeature({ queryGeometry: s2, feature: t3, featureState: r3, geometry: u3, zoom: this.z, transform: e51.transform, pixelsToTileUnits: a2, pixelPosMatrix: e51.pixelPosMatrix, unwrappedTileID: this.tileID.toUnwrapped(), getElevation: e51.getElevation })));
    }
    return p2;
  }
  loadMatchingFeature(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2) {
    let d2 = this.bucketLayerIDs[t2];
    if (a2 && !d2.some((e52) => a2.has(e52))) return;
    let f2 = this.sourceLayerCoder.decode(n2), p2 = this.vtLayers[f2].feature(r2);
    if (i2.needGeometry) {
      let e52 = vd(p2, true);
      if (!i2.filter(new W(this.tileID.overscaledZ), e52, this.tileID.canonical)) return;
    } else if (!i2.filter(new W(this.tileID.overscaledZ), p2)) return;
    let m2 = this.getId(p2, f2);
    for (let t3 of d2) {
      if (a2 && !a2.has(t3)) continue;
      let n3 = s2[t3];
      if (!n3) continue;
      let i3 = {};
      m2 && l2 && (i3 = l2.getState(n3.sourceLayer || `_geojsonTileLayer`, m2));
      let d3 = St({}, c2[t3]);
      d3.paint = rC(d3.paint, n3.paint, p2, i3, o2), d3.layout = rC(d3.layout, n3.layout, p2, i3, o2);
      let f3 = !u2 || u2(p2, n3, i3);
      if (!f3) continue;
      let h2 = new ey(p2, this.z, this.x, this.y, m2);
      h2.layer = d3;
      let g2 = e51[t3];
      g2 === void 0 && (g2 = e51[t3] = []), g2.push({ featureIndex: r2, feature: h2, intersectionZ: f3 });
    }
  }
  lookupSymbolFeatures(e51, t2, n2, r2, i2, a2, o2, s2) {
    let c2 = {};
    this.loadVTLayers();
    let l2 = fs(i2.filterSpec, `queryRenderedFeatures symbol filter`, i2.globalState);
    for (let i3 of e51) this.loadMatchingFeature(c2, n2, r2, i3, l2, a2, o2, s2, t2);
    return c2;
  }
  hasLayer(e51) {
    for (let t2 of this.bucketLayerIDs) for (let n2 of t2) if (e51 === n2) return true;
    return false;
  }
  getId(e51, t2) {
    let n2 = e51.id;
    if (this.promoteId) {
      let r2 = typeof this.promoteId == `string` ? this.promoteId : this.promoteId[t2];
      n2 = e51.properties[r2], typeof n2 == `boolean` && (n2 = Number(n2)), n2 === void 0 && e51.properties?.cluster && this.promoteId && (n2 = Number(e51.properties.cluster_id));
    }
    return n2;
  }
};
U(`FeatureIndex`, nC, { omit: [`rawTileData`, `sourceLayerCoder`] });
function rC(e51, t2, n2, r2, i2) {
  return jt(e51, (e52, a2) => {
    let o2 = t2 instanceof dl ? t2.get(a2) : null;
    return o2?.evaluate ? o2.evaluate(n2, r2, i2) : o2;
  });
}
function iC(e51, t2) {
  return t2 - e51;
}
var oC = class {
  constructor(e51) {
    this.maxEntries = e51, this.map = /* @__PURE__ */ new Map();
  }
  get(e51) {
    let t2 = this.map.get(e51);
    return t2 !== void 0 && (this.map.delete(e51), this.map.set(e51, t2)), t2;
  }
  set(e51, t2) {
    if (this.map.has(e51)) this.map.delete(e51);
    else if (this.map.size >= this.maxEntries) {
      let e52 = this.map.keys().next().value;
      this.map.delete(e52);
    }
    this.map.set(e51, t2);
  }
  clear() {
    this.map.clear();
  }
};
function sC(e51, t2, n2, r2, i2) {
  let a2 = [];
  for (let o2 of e51) {
    let e52;
    for (let s2 = 0; s2 < o2.length - 1; s2++) {
      let c2 = o2[s2], u2 = o2[s2 + 1];
      c2.x < t2 && u2.x < t2 || (c2.x < t2 ? c2 = new l(t2, c2.y + (u2.y - c2.y) * ((t2 - c2.x) / (u2.x - c2.x)))._round() : u2.x < t2 && (u2 = new l(t2, c2.y + (u2.y - c2.y) * ((t2 - c2.x) / (u2.x - c2.x)))._round()), !(c2.y < n2 && u2.y < n2) && (c2.y < n2 ? c2 = new l(c2.x + (u2.x - c2.x) * ((n2 - c2.y) / (u2.y - c2.y)), n2)._round() : u2.y < n2 && (u2 = new l(c2.x + (u2.x - c2.x) * ((n2 - c2.y) / (u2.y - c2.y)), n2)._round()), !(c2.x >= r2 && u2.x >= r2) && (c2.x >= r2 ? c2 = new l(r2, c2.y + (u2.y - c2.y) * ((r2 - c2.x) / (u2.x - c2.x)))._round() : u2.x >= r2 && (u2 = new l(r2, c2.y + (u2.y - c2.y) * ((r2 - c2.x) / (u2.x - c2.x)))._round()), !(c2.y >= i2 && u2.y >= i2) && (c2.y >= i2 ? c2 = new l(c2.x + (u2.x - c2.x) * ((i2 - c2.y) / (u2.y - c2.y)), i2)._round() : u2.y >= i2 && (u2 = new l(c2.x + (u2.x - c2.x) * ((i2 - c2.y) / (u2.y - c2.y)), i2)._round()), (!e52 || !c2.equals(e52[e52.length - 1])) && (e52 = [c2], a2.push(e52)), e52.push(u2)))));
    }
  }
  return a2;
}
function cC(e51, t2, n2, r2, i2, a2) {
  let o2 = lC(e51, t2, n2, i2, 0);
  return o2 = lC(o2, t2, r2, a2, 1), o2;
}
function lC(e51, t2, n2, r2, i2) {
  switch (t2) {
    case 1:
      return uC(e51, n2, r2, i2);
    case 2:
      return fC(e51, n2, r2, i2, false);
    case 3:
      return fC(e51, n2, r2, i2, true);
  }
  return [];
}
function uC(e51, t2, n2, r2) {
  let i2 = [];
  for (let a2 of e51) for (let e52 of a2) {
    let a3 = r2 === 0 ? e52.x : e52.y;
    a3 >= t2 && a3 <= n2 && i2.push([e52]);
  }
  return i2;
}
function dC(e51, t2, n2, r2, i2) {
  let a2 = r2 === 0 ? pC : mC, o2 = [], s2 = [];
  for (let c3 = 0; c3 < e51.length - 1; c3++) {
    let l2 = e51[c3], u3 = e51[c3 + 1], d2 = r2 === 0 ? l2.x : l2.y, f2 = r2 === 0 ? u3.x : u3.y, p2 = false;
    d2 < t2 ? f2 > t2 && o2.push(a2(l2, u3, t2)) : d2 > n2 ? f2 < n2 && o2.push(a2(l2, u3, n2)) : o2.push(l2), f2 < t2 && d2 >= t2 && (o2.push(a2(l2, u3, t2)), p2 = true), f2 > n2 && d2 <= n2 && (o2.push(a2(l2, u3, n2)), p2 = true), !i2 && p2 && (s2.push(o2), o2 = []);
  }
  let c2 = e51.length - 1, u2 = r2 === 0 ? e51[c2].x : e51[c2].y;
  return u2 >= t2 && u2 <= n2 && o2.push(e51[c2]), i2 && o2.length > 0 && !o2[0].equals(o2[o2.length - 1]) && o2.push(new l(o2[0].x, o2[0].y)), o2.length > 0 && s2.push(o2), s2;
}
function fC(e51, t2, n2, r2, i2) {
  let a2 = [];
  for (let o2 of e51) {
    let e52 = dC(o2, t2, n2, r2, i2);
    e52.length > 0 && a2.push(...e52);
  }
  return a2;
}
function pC(e51, t2, n2) {
  let r2 = (n2 - e51.x) / (t2.x - e51.x);
  return new l(n2, e51.y + (t2.y - e51.y) * r2);
}
function mC(e51, t2, n2) {
  let r2 = (n2 - e51.y) / (t2.y - e51.y);
  return new l(e51.x + (t2.x - e51.x) * r2, n2);
}
var hC = class e50 extends l {
  constructor(e51, t2, n2, r2) {
    super(e51, t2), this.angle = n2, r2 !== void 0 && (this.segment = r2);
  }
  clone() {
    return new e50(this.x, this.y, this.angle, this.segment);
  }
};
U(`Anchor`, hC);
function gC(e51, t2, n2, r2, i2) {
  if (t2.segment === void 0 || n2 === 0) return true;
  let a2 = t2, o2 = t2.segment + 1, s2 = 0;
  for (; s2 > -n2 / 2; ) {
    if (o2--, o2 < 0) return false;
    s2 -= e51[o2].dist(a2), a2 = e51[o2];
  }
  s2 += e51[o2].dist(e51[o2 + 1]), o2++;
  let c2 = [], l2 = 0;
  for (; s2 < n2 / 2; ) {
    let t3 = e51[o2 - 1], n3 = e51[o2], a3 = e51[o2 + 1];
    if (!a3) return false;
    let u2 = t3.angleTo(n3) - n3.angleTo(a3);
    for (u2 = Math.abs((u2 + 3 * Math.PI) % (Math.PI * 2) - Math.PI), c2.push({ distance: s2, angleDelta: u2 }), l2 += u2; s2 - c2[0].distance > r2; ) l2 -= c2.shift().angleDelta;
    if (l2 > i2) return false;
    o2++, s2 += n3.dist(a3);
  }
  return true;
}
function _C(e51) {
  let t2 = 0;
  for (let n2 = 0; n2 < e51.length - 1; n2++) t2 += e51[n2].dist(e51[n2 + 1]);
  return t2;
}
function vC(e51, t2, n2) {
  return e51 ? 3 / 5 * t2 * n2 : 0;
}
function yC(e51, t2) {
  return Math.max(e51 ? e51.right - e51.left : 0, t2 ? t2.right - t2.left : 0);
}
function bC(e51, t2, n2, r2, i2, a2) {
  let o2 = vC(n2, i2, a2), s2 = yC(n2, r2) * a2, c2 = 0, l2 = _C(e51) / 2;
  for (let n3 = 0; n3 < e51.length - 1; n3++) {
    let r3 = e51[n3], i3 = e51[n3 + 1], a3 = r3.dist(i3);
    if (c2 + a3 > l2) {
      let u2 = (l2 - c2) / a3, d2 = new hC(Oi.number(r3.x, i3.x, u2), Oi.number(r3.y, i3.y, u2), i3.angleTo(r3), n3);
      return d2._round(), !o2 || gC(e51, d2, s2, o2, t2) ? d2 : void 0;
    }
    c2 += a3;
  }
}
function xC(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
  let l2 = vC(r2, a2, o2), u2 = yC(r2, i2), d2 = u2 * o2, f2 = e51[0].x === 0 || e51[0].x === c2 || e51[0].y === 0 || e51[0].y === c2;
  t2 - d2 < t2 / 4 && (t2 = d2 + t2 / 4);
  let p2 = a2 * 2;
  return SC(e51, f2 ? t2 / 2 * s2 % t2 : (u2 / 2 + p2) * o2 * s2 % t2, t2, l2, n2, d2, f2, false, c2);
}
function SC(e51, t2, n2, r2, i2, a2, o2, s2, c2) {
  let l2 = a2 / 2, u2 = _C(e51), d2 = 0, f2 = t2 - n2, p2 = [];
  for (let t3 = 0; t3 < e51.length - 1; t3++) {
    let o3 = e51[t3], s3 = e51[t3 + 1], m2 = o3.dist(s3), h2 = s3.angleTo(o3);
    for (; f2 + n2 < d2 + m2; ) {
      f2 += n2;
      let g2 = (f2 - d2) / m2, _ = Oi.number(o3.x, s3.x, g2), v = Oi.number(o3.y, s3.y, g2);
      if (_ >= 0 && _ < c2 && v >= 0 && v < c2 && f2 - l2 >= 0 && f2 + l2 <= u2) {
        let n3 = new hC(_, v, h2, t3);
        n3._round(), (!r2 || gC(e51, n3, a2, r2, i2)) && p2.push(n3);
      }
    }
    d2 += m2;
  }
  return !s2 && !p2.length && !o2 && (p2 = SC(e51, d2 / 2, n2, r2, i2, a2, o2, true, c2)), p2;
}
function CC(e51, t2, n2, r2) {
  let i2 = [], a2 = e51.image, o2 = a2.pixelRatio, s2 = a2.paddedRect.w - 2, c2 = a2.paddedRect.h - 2, u2 = { x1: e51.left, y1: e51.top, x2: e51.right, y2: e51.bottom }, d2 = a2.stretchX || [[0, s2]], f2 = a2.stretchY || [[0, c2]], p2 = (e52, t3) => e52 + t3[1] - t3[0], m2 = d2.reduce(p2, 0), h2 = f2.reduce(p2, 0), g2 = s2 - m2, _ = c2 - h2, v = 0, y = m2, b = 0, x = h2, S = 0, C = g2, w = 0, T = _;
  if (a2.content && r2) {
    let t3 = a2.content, n3 = t3[2] - t3[0], r3 = t3[3] - t3[1];
    (a2.textFitWidth || a2.textFitHeight) && (u2 = J_(e51)), v = wC(d2, 0, t3[0]), b = wC(f2, 0, t3[1]), y = wC(d2, t3[0], t3[2]), x = wC(f2, t3[1], t3[3]), S = t3[0] - v, w = t3[1] - b, C = n3 - y, T = r3 - x;
  }
  let E = u2.x1, D = u2.y1, O = u2.x2 - E, k = u2.y2 - D, A = (e52, r3, i3, s3) => {
    let c3 = EC(e52.stretch - v, y, O, E), u3 = DC(e52.fixed - S, C, e52.stretch, m2), d3 = EC(r3.stretch - b, x, k, D), f3 = DC(r3.fixed - w, T, r3.stretch, h2), p3 = EC(i3.stretch - v, y, O, E), g3 = DC(i3.fixed - S, C, i3.stretch, m2), _2 = EC(s3.stretch - b, x, k, D), A2 = DC(s3.fixed - w, T, s3.stretch, h2), ee = new l(c3, d3), te = new l(p3, d3), ne = new l(p3, _2), re = new l(c3, _2), ie2 = new l(u3 / o2, f3 / o2), ae2 = new l(g3 / o2, A2 / o2), oe2 = t2 * Math.PI / 180;
    if (oe2) {
      let e53 = Math.sin(oe2), t3 = Math.cos(oe2), n3 = [t3, -e53, e53, t3];
      ee._matMult(n3), te._matMult(n3), re._matMult(n3), ne._matMult(n3);
    }
    let se3 = e52.stretch + e52.fixed, ce2 = i3.stretch + i3.fixed, le2 = r3.stretch + r3.fixed, ue2 = s3.stretch + s3.fixed;
    return { tl: ee, tr: te, bl: re, br: ne, tex: { x: a2.paddedRect.x + 1 + se3, y: a2.paddedRect.y + 1 + le2, w: ce2 - se3, h: ue2 - le2 }, writingMode: void 0, glyphOffset: [0, 0], sectionIndex: 0, pixelOffsetTL: ie2, pixelOffsetBR: ae2, minFontScaleX: C / o2 / O, minFontScaleY: T / o2 / k, isSDF: n2 };
  };
  if (!r2 || !a2.stretchX && !a2.stretchY) i2.push(A({ fixed: 0, stretch: -1 }, { fixed: 0, stretch: -1 }, { fixed: 0, stretch: s2 + 1 }, { fixed: 0, stretch: c2 + 1 }));
  else {
    let e52 = TC(d2, g2, m2), t3 = TC(f2, _, h2);
    for (let n3 = 0; n3 < e52.length - 1; n3++) {
      let r3 = e52[n3], a3 = e52[n3 + 1];
      for (let e53 = 0; e53 < t3.length - 1; e53++) {
        let n4 = t3[e53], o3 = t3[e53 + 1];
        i2.push(A(r3, n4, a3, o3));
      }
    }
  }
  return i2;
}
function wC(e51, t2, n2) {
  let r2 = 0;
  for (let i2 of e51) r2 += Math.max(t2, Math.min(n2, i2[1])) - Math.max(t2, Math.min(n2, i2[0]));
  return r2;
}
function TC(e51, t2, n2) {
  let r2 = [{ fixed: -1, stretch: 0 }];
  for (let [t3, n3] of e51) {
    let e52 = r2[r2.length - 1];
    r2.push({ fixed: t3 - e52.stretch, stretch: e52.stretch }), r2.push({ fixed: t3 - e52.stretch, stretch: e52.stretch + (n3 - t3) });
  }
  return r2.push({ fixed: t2 + 1, stretch: n2 }), r2;
}
function EC(e51, t2, n2, r2) {
  return e51 / t2 * n2 + r2;
}
function DC(e51, t2, n2, r2) {
  return e51 - t2 * n2 / r2;
}
function OC(e51, t2, n2, r2, i2, a2, o2, s2) {
  let c2 = r2.layout.get(`text-rotate`).evaluate(a2, {}) * Math.PI / 180, u2 = [];
  for (let e52 of t2.positionedLines) for (let r3 of e52.positionedGlyphs) {
    if (!r3.rect) continue;
    let a3 = r3.rect || {}, d2 = 4, f2 = true, p2 = 1, m2 = 0, h2 = (i2 || s2) && r3.vertical, g2 = r3.metrics.advance * r3.scale / 2;
    if (s2 && t2.verticalizable) {
      let t3 = (r3.scale - 1) * 24, n3 = (24 - r3.metrics.width * r3.scale) / 2;
      m2 = e52.lineOffset / 2 - (r3.imageName ? -n3 : t3);
    }
    if (r3.imageName) {
      let e53 = o2[r3.imageName];
      f2 = e53.sdf, p2 = e53.pixelRatio, d2 = 1 / p2;
    }
    let _ = i2 ? [r3.x + g2, r3.y] : [0, 0], v = i2 ? [0, 0] : [r3.x + g2 + n2[0], r3.y + n2[1] - m2], y = [0, 0];
    h2 && (y = v, v = [0, 0]);
    let b = r3.metrics.isDoubleResolution ? 2 : 1, x = (r3.metrics.left - d2) * r3.scale - g2 + v[0], S = (-r3.metrics.top - d2) * r3.scale + v[1], C = x + a3.w / b * r3.scale / p2, w = S + a3.h / b * r3.scale / p2, T = new l(x, S), E = new l(C, S), D = new l(x, w), O = new l(C, w);
    if (h2) {
      let e53 = new l(-g2, g2 - -17), t3 = -Math.PI / 2, n3 = 12 - g2, i3 = r3.imageName ? n3 : 0, a4 = new l(22 - n3, -i3), o3 = new l(...y);
      T._rotateAround(t3, e53)._add(a4)._add(o3), E._rotateAround(t3, e53)._add(a4)._add(o3), D._rotateAround(t3, e53)._add(a4)._add(o3), O._rotateAround(t3, e53)._add(a4)._add(o3);
    }
    if (c2) {
      let e53 = Math.sin(c2), t3 = Math.cos(c2), n3 = [t3, -e53, e53, t3];
      T._matMult(n3), E._matMult(n3), D._matMult(n3), O._matMult(n3);
    }
    let k = new l(0, 0), A = new l(0, 0);
    u2.push({ tl: T, tr: E, bl: D, br: O, tex: a3, writingMode: t2.writingMode, glyphOffset: _, sectionIndex: r3.sectionIndex, isSDF: f2, pixelOffsetTL: k, pixelOffsetBR: A, minFontScaleX: 0, minFontScaleY: 0 });
  }
  return u2;
}
var kC = class {
  constructor(e51, t2, n2, r2, i2, a2, o2, s2, c2, u2) {
    if (this.boxStartIndex = e51.length, c2) {
      let e52 = a2.top, t3 = a2.bottom, n3 = a2.collisionPadding;
      n3 && (e52 -= n3[1], t3 += n3[3]);
      let r3 = t3 - e52;
      r3 > 0 && (r3 = Math.max(10, r3), this.circleDiameter = r3);
    } else {
      let c3 = a2.image?.content && (a2.image.textFitWidth || a2.image.textFitHeight) ? J_(a2) : { x1: a2.left, y1: a2.top, x2: a2.right, y2: a2.bottom };
      c3.y1 = c3.y1 * o2 - s2[0], c3.y2 = c3.y2 * o2 + s2[2], c3.x1 = c3.x1 * o2 - s2[3], c3.x2 = c3.x2 * o2 + s2[1];
      let d2 = a2.collisionPadding;
      if (d2 && (c3.x1 -= d2[0] * o2, c3.y1 -= d2[1] * o2, c3.x2 += d2[2] * o2, c3.y2 += d2[3] * o2), u2) {
        let e52 = new l(c3.x1, c3.y1), t3 = new l(c3.x2, c3.y1), n3 = new l(c3.x1, c3.y2), r3 = new l(c3.x2, c3.y2), i3 = u2 * Math.PI / 180;
        e52._rotate(i3), t3._rotate(i3), n3._rotate(i3), r3._rotate(i3), c3.x1 = Math.min(e52.x, t3.x, n3.x, r3.x), c3.x2 = Math.max(e52.x, t3.x, n3.x, r3.x), c3.y1 = Math.min(e52.y, t3.y, n3.y, r3.y), c3.y2 = Math.max(e52.y, t3.y, n3.y, r3.y);
      }
      e51.emplaceBack(t2.x, t2.y, c3.x1, c3.y1, c3.x2, c3.y2, n2, r2, i2);
    }
    this.boxEndIndex = e51.length;
  }
};
var AC = class {
  constructor(e51 = [], t2 = (e52, t3) => e52 < t3 ? -1 : +(e52 > t3)) {
    if (this.data = e51, this.length = this.data.length, this.compare = t2, this.length > 0) for (let e52 = (this.length >> 1) - 1; e52 >= 0; e52--) this._down(e52);
  }
  push(e51) {
    this.data.push(e51), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    let e51 = this.data[0], t2 = this.data.pop();
    return --this.length > 0 && (this.data[0] = t2, this._down(0)), e51;
  }
  peek() {
    return this.data[0];
  }
  _up(e51) {
    let { data: t2, compare: n2 } = this, r2 = t2[e51];
    for (; e51 > 0; ) {
      let i2 = e51 - 1 >> 1, a2 = t2[i2];
      if (n2(r2, a2) >= 0) break;
      t2[e51] = a2, e51 = i2;
    }
    t2[e51] = r2;
  }
  _down(e51) {
    let { data: t2, compare: n2 } = this, r2 = this.length >> 1, i2 = t2[e51];
    for (; e51 < r2; ) {
      let r3 = (e51 << 1) + 1, a2 = r3 + 1;
      if (a2 < this.length && n2(t2[a2], t2[r3]) < 0 && (r3 = a2), n2(t2[r3], i2) >= 0) break;
      t2[e51] = t2[r3], e51 = r3;
    }
    t2[e51] = i2;
  }
};
function jC(e51, t2 = 1) {
  let n2 = $p.fromPoints(e51[0]), r2 = Math.min(n2.width(), n2.height()), i2 = r2 / 2, a2 = new AC([], MC), { minX: o2, minY: s2, maxX: c2, maxY: u2 } = n2;
  if (r2 === 0) return new l(o2, s2);
  for (let t3 = o2; t3 < c2; t3 += r2) for (let n3 = s2; n3 < u2; n3 += r2) a2.push(new NC(t3 + i2, n3 + i2, i2, e51));
  let d2 = FC(e51), f2 = d2;
  for (; a2.length; ) {
    let n3 = a2.pop();
    (n3.d > f2.d || !f2.d) && (f2 = n3), !(n3.max - f2.d <= t2) && (i2 = n3.h / 2, a2.push(new NC(n3.p.x - i2, n3.p.y - i2, i2, e51)), a2.push(new NC(n3.p.x + i2, n3.p.y - i2, i2, e51)), a2.push(new NC(n3.p.x - i2, n3.p.y + i2, i2, e51)), a2.push(new NC(n3.p.x + i2, n3.p.y + i2, i2, e51)));
  }
  return d2.d > 0 && f2.d - d2.d <= t2 ? d2.p : f2.p;
}
function MC(e51, t2) {
  return t2.max - e51.max;
}
var NC = class {
  constructor(e51, t2, n2, r2) {
    this.p = new l(e51, t2), this.h = n2, this.d = PC(this.p, r2), this.max = this.d + this.h * Math.SQRT2;
  }
};
function PC(e51, t2) {
  let n2 = false, r2 = 1 / 0;
  for (let i2 of t2) for (let t3 = 0, a2 = i2.length, o2 = a2 - 1; t3 < a2; o2 = t3++) {
    let a3 = i2[t3], s2 = i2[o2];
    a3.y > e51.y != s2.y > e51.y && e51.x < (s2.x - a3.x) * (e51.y - a3.y) / (s2.y - a3.y) + a3.x && (n2 = !n2), r2 = Math.min(r2, Ad(e51, a3, s2));
  }
  return (n2 ? 1 : -1) * Math.sqrt(r2);
}
function FC(e51) {
  let t2 = 0, n2 = 0, r2 = 0, i2 = e51[0];
  for (let e52 = 0, a2 = i2.length, o2 = a2 - 1; e52 < a2; o2 = e52++) {
    let a3 = i2[e52], s2 = i2[o2], c2 = a3.x * s2.y - s2.x * a3.y;
    n2 += (a3.x + s2.x) * c2, r2 += (a3.y + s2.y) * c2, t2 += c2 * 3;
  }
  return new NC(n2 / t2, r2 / t2, 0, e51);
}
var IC = (function(e51) {
  return e51[e51.center = 1] = `center`, e51[e51.left = 2] = `left`, e51[e51.right = 3] = `right`, e51[e51.top = 4] = `top`, e51[e51.bottom = 5] = `bottom`, e51[e51[`top-left`] = 6] = `top-left`, e51[e51[`top-right`] = 7] = `top-right`, e51[e51[`bottom-left`] = 8] = `bottom-left`, e51[e51[`bottom-right`] = 9] = `bottom-right`, e51;
})({});
var LC = 1 / 0;
function RC(e51, t2) {
  function n2(e52, t3) {
    let n3 = 0, r3 = 0;
    t3 < 0 && (t3 = 0);
    let i2 = t3 / Math.SQRT2;
    switch (e52) {
      case `top-right`:
      case `top-left`:
        r3 = i2 - 7;
        break;
      case `bottom-right`:
      case `bottom-left`:
        r3 = -i2 + 7;
        break;
      case `bottom`:
        r3 = -t3 + 7;
        break;
      case `top`:
        r3 = t3 - 7;
    }
    switch (e52) {
      case `top-right`:
      case `bottom-right`:
        n3 = -i2;
        break;
      case `top-left`:
      case `bottom-left`:
        n3 = i2;
        break;
      case `left`:
        n3 = t3;
        break;
      case `right`:
        n3 = -t3;
    }
    return [n3, r3];
  }
  function r2(e52, t3, n3) {
    let r3 = 0, i2 = 0;
    switch (t3 = Math.abs(t3), n3 = Math.abs(n3), e52) {
      case `top-right`:
      case `top-left`:
      case `top`:
        i2 = n3 - 7;
        break;
      case `bottom-right`:
      case `bottom-left`:
      case `bottom`:
        i2 = -n3 + 7;
    }
    switch (e52) {
      case `top-right`:
      case `bottom-right`:
      case `right`:
        r3 = -t3;
        break;
      case `top-left`:
      case `bottom-left`:
      case `left`:
        r3 = t3;
    }
    return [r3, i2];
  }
  return t2[1] === LC ? n2(e51, t2[0]) : r2(e51, t2[0], t2[1]);
}
function zC(e51, t2, n2) {
  let r2 = e51.layout, i2 = r2.get(`text-variable-anchor-offset`)?.evaluate(t2, {}, n2);
  if (i2) {
    let e52 = i2.values, t3 = [];
    for (let n3 = 0; n3 < e52.length; n3 += 2) {
      let r3 = t3[n3] = e52[n3], i3 = e52[n3 + 1].map((e53) => e53 * 24);
      r3.startsWith(`top`) ? i3[1] -= 7 : r3.startsWith(`bottom`) && (i3[1] += 7), t3[n3 + 1] = i3;
    }
    return new ei(t3);
  }
  let a2 = r2.get(`text-variable-anchor`);
  if (a2) {
    let i3;
    i3 = e51._unevaluatedLayout.getValue(`text-radial-offset`) === void 0 ? r2.get(`text-offset`).evaluate(t2, {}, n2).map((e52) => e52 * 24) : [r2.get(`text-radial-offset`).evaluate(t2, {}, n2) * 24, LC];
    let o2 = [];
    for (let e52 of a2) o2.push(e52, RC(e52, i3));
    return new ei(o2);
  }
  return null;
}
function BC(e51) {
  e51.bucket.createArrays();
  let t2 = 512 * e51.bucket.overscaling;
  e51.bucket.tilePixelRatio = j / t2, e51.bucket.compareText = {}, e51.bucket.iconsNeedLinear = false;
  let n2 = e51.bucket.layers[0], r2 = n2.layout, i2 = n2._unevaluatedLayout._values, a2 = { layoutIconSize: i2[`icon-size`].possiblyEvaluate(new W(e51.bucket.zoom + 1), e51.canonical), layoutTextSize: i2[`text-size`].possiblyEvaluate(new W(e51.bucket.zoom + 1), e51.canonical), textMaxSize: i2[`text-size`].possiblyEvaluate(new W(18)) };
  if (e51.bucket.textSizeData.kind === `composite`) {
    let { minZoom: t3, maxZoom: n3 } = e51.bucket.textSizeData;
    a2.compositeTextSizes = [i2[`text-size`].possiblyEvaluate(new W(t3), e51.canonical), i2[`text-size`].possiblyEvaluate(new W(n3), e51.canonical)];
  }
  if (e51.bucket.iconSizeData.kind === `composite`) {
    let { minZoom: t3, maxZoom: n3 } = e51.bucket.iconSizeData;
    a2.compositeIconSizes = [i2[`icon-size`].possiblyEvaluate(new W(t3), e51.canonical), i2[`icon-size`].possiblyEvaluate(new W(n3), e51.canonical)];
  }
  let o2 = r2.get(`text-line-height`) * 24, s2 = r2.get(`text-rotation-alignment`) !== `viewport` && r2.get(`symbol-placement`) !== `point`, c2 = r2.get(`text-keep-upright`), l2 = r2.get(`text-size`);
  for (let t3 of e51.bucket.features) {
    let i3 = r2.get(`text-font`).evaluate(t3, {}, e51.canonical).join(`,`), u2 = l2.evaluate(t3, {}, e51.canonical), d2 = a2.layoutTextSize.evaluate(t3, {}, e51.canonical), f2 = a2.layoutIconSize.evaluate(t3, {}, e51.canonical), p2 = { horizontal: {}, vertical: void 0 }, m2 = t3.text, h2 = [0, 0];
    if (m2) {
      let a3 = m2.toString(), l3 = r2.get(`text-letter-spacing`).evaluate(t3, {}, e51.canonical) * 24, f3 = Wc(a3) ? l3 : 0, g3 = r2.get(`text-anchor`).evaluate(t3, {}, e51.canonical), _2 = zC(n2, t3, e51.canonical);
      if (!_2) {
        let n3 = r2.get(`text-radial-offset`).evaluate(t3, {}, e51.canonical);
        h2 = n3 ? RC(g3, [n3 * 24, LC]) : r2.get(`text-offset`).evaluate(t3, {}, e51.canonical).map((e52) => e52 * 24);
      }
      let v2 = s2 ? `center` : r2.get(`text-justify`).evaluate(t3, {}, e51.canonical), y = r2.get(`symbol-placement`) === `point` ? r2.get(`text-max-width`).evaluate(t3, {}, e51.canonical) * 24 : 1 / 0, b = () => {
        e51.bucket.allowVerticalPlacement && Uc(a3) && (p2.vertical = I_(m2, e51.glyphMap, e51.glyphPositions, e51.imagePositions, i3, y, o2, g3, `left`, f3, h2, 2, true, d2, u2));
      };
      if (!s2 && _2) {
        let t4 = /* @__PURE__ */ new Set();
        if (v2 === `auto`) for (let e52 = 0; e52 < _2.values.length; e52 += 2) t4.add(VC(_2.values[e52]));
        else t4.add(v2);
        let n3 = false;
        for (let r3 of t4) if (!p2.horizontal[r3]) {
          if (n3) p2.horizontal[r3] = p2.horizontal[0];
          else {
            let t5 = I_(m2, e51.glyphMap, e51.glyphPositions, e51.imagePositions, i3, y, o2, `center`, r3, f3, h2, 1, false, d2, u2);
            t5 && (p2.horizontal[r3] = t5, n3 = t5.positionedLines.length === 1);
          }
        }
        b();
      } else {
        v2 === `auto` && (v2 = VC(g3));
        let t4 = I_(m2, e51.glyphMap, e51.glyphPositions, e51.imagePositions, i3, y, o2, g3, v2, f3, h2, 1, false, d2, u2);
        t4 && (p2.horizontal[v2] = t4), b(), Uc(a3) && s2 && c2 && (p2.vertical = I_(m2, e51.glyphMap, e51.glyphPositions, e51.imagePositions, i3, y, o2, g3, v2, f3, h2, 2, false, d2, u2));
      }
    }
    let g2, _ = false;
    if (t3.icon?.name) {
      let n3 = e51.imageMap[t3.icon.name];
      n3 && (g2 = q_(e51.imagePositions[t3.icon.name], r2.get(`icon-offset`).evaluate(t3, {}, e51.canonical), r2.get(`icon-anchor`).evaluate(t3, {}, e51.canonical)), _ = !!n3.sdf, e51.bucket.sdfIcons === void 0 ? e51.bucket.sdfIcons = _ : e51.bucket.sdfIcons !== _ && It(`Style sheet warning: Cannot mix SDF and non-SDF icons in one buffer`), n3.pixelRatio === e51.bucket.pixelRatio ? r2.get(`icon-rotate`).constantOr(1) !== 0 && (e51.bucket.iconsNeedLinear = true) : e51.bucket.iconsNeedLinear = true);
    }
    let v = GC(p2.horizontal) || p2.vertical;
    e51.bucket.iconsInText ||= v ? v.iconsInText : false, (v || g2) && HC(e51.bucket, t3, p2, g2, e51.imageMap, a2, d2, f2, h2, _, e51.canonical, e51.subdivisionGranularity);
  }
  e51.showCollisionBoxes && e51.bucket.generateCollisionDebugBuffers();
}
function VC(e51) {
  switch (e51) {
    case `right`:
    case `top-right`:
    case `bottom-right`:
      return `right`;
    case `left`:
    case `top-left`:
    case `bottom-left`:
      return `left`;
  }
  return `center`;
}
function HC(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2) {
  let f2 = a2.textMaxSize.evaluate(t2, {});
  f2 === void 0 && (f2 = o2);
  let p2 = e51.layers[0].layout, m2 = p2.get(`icon-offset`).evaluate(t2, {}, u2), h2 = GC(n2.horizontal), g2 = o2 / 24, _ = e51.tilePixelRatio * g2, v = e51.tilePixelRatio * f2 / 24, y = e51.tilePixelRatio * s2, b = e51.tilePixelRatio * p2.get(`symbol-spacing`), x = p2.get(`text-padding`) * e51.tilePixelRatio, S = _v(p2, t2, u2, e51.tilePixelRatio), C = p2.get(`text-max-angle`) / 180 * Math.PI, w = p2.get(`text-rotation-alignment`) !== `viewport` && p2.get(`symbol-placement`) !== `point`, T = p2.get(`icon-rotation-alignment`) === `map` && p2.get(`symbol-placement`) !== `point`, E = p2.get(`symbol-placement`), D = b / 2, O = p2.get(`icon-text-fit`), k;
  r2 && O !== `none` && (e51.allowVerticalPlacement && n2.vertical && (k = Y_(r2, n2.vertical, O, p2.get(`icon-text-fit-padding`), m2, g2)), h2 && (r2 = Y_(r2, h2, O, p2.get(`icon-text-fit-padding`), m2, g2)));
  let A = u2 ? d2.line.getGranularityForZoomLevel(u2.z) : 1, ee = (s3, d3) => {
    d3.x < 0 || d3.x >= 8192 || d3.y < 0 || d3.y >= 8192 || KC(e51, d3, s3, n2, r2, i2, k, e51.layers[0], e51.collisionBoxArray, t2.index, t2.sourceLayerIndex, e51.index, _, [x, x, x, x], w, c2, y, S, T, m2, t2, a2, l2, u2, o2);
  };
  if (E === `line`) for (let i3 of sC(t2.geometry, 0, 0, j, j)) {
    let t3 = Pp(i3, A), a3 = xC(t3, b, C, n2.vertical || h2, r2, 24, v, e51.overscaling, j);
    for (let n3 of a3) {
      let r3 = h2;
      (!r3 || !qC(e51, r3.text, D, n3)) && ee(t3, n3);
    }
  }
  else if (E === `line-center`) {
    for (let e52 of t2.geometry) if (e52.length > 1) {
      let t3 = Pp(e52, A), i3 = bC(t3, C, n2.vertical || h2, r2, 24, v);
      i3 && ee(t3, i3);
    }
  } else if (t2.type === `Polygon`) for (let e52 of Na(t2.geometry, 0)) {
    let t3 = jC(e52, 16);
    ee(Pp(e52[0], A, true), new hC(t3.x, t3.y, 0));
  }
  else if (t2.type === `LineString`) for (let e52 of t2.geometry) {
    let t3 = Pp(e52, A);
    ee(t3, new hC(t3[0].x, t3[0].y, 0));
  }
  else if (t2.type === `Point`) for (let e52 of t2.geometry) for (let t3 of e52) ee([t3], new hC(t3.x, t3.y, 0));
}
function UC(e51, t2) {
  let n2 = e51.length, r2 = t2?.values;
  if (r2?.length > 0) for (let t3 = 0; t3 < r2.length; t3 += 2) {
    let n3 = IC[r2[t3]], i2 = r2[t3 + 1];
    e51.emplaceBack(n3, i2[0], i2[1]);
  }
  return [n2, e51.length];
}
function WC(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2) {
  let h2 = OC(t2, n2, s2, i2, a2, o2, r2, e51.allowVerticalPlacement), g2 = e51.textSizeData, _ = null;
  g2.kind === `source` ? (_ = [128 * i2.layout.get(`text-size`).evaluate(o2, {})], _[0] > 32640 && It(`${e51.layerIds[0]}: Value for "text-size" is >= 255. Reduce your "text-size".`)) : g2.kind === `composite` && (_ = [128 * p2.compositeTextSizes[0].evaluate(o2, {}, m2), 128 * p2.compositeTextSizes[1].evaluate(o2, {}, m2)], (_[0] > 32640 || _[1] > 32640) && It(`${e51.layerIds[0]}: Value for "text-size" is >= 255. Reduce your "text-size".`)), e51.addSymbols(e51.text, h2, _, s2, a2, o2, l2, t2, c2.lineStartIndex, c2.lineLength, f2, m2);
  for (let t3 of u2) d2[t3] = e51.text.placedSymbolArray.length - 1;
  return h2.length * 4;
}
function GC(e51) {
  for (let t2 in e51) return e51[t2];
  return null;
}
function KC(e51, t2, n2, r2, i2, a2, o2, s2, c2, l2, u2, d2, f2, p2, m2, h2, g2, _, v, y, b, x, S, C, w) {
  let T = e51.addToLineVertexArray(t2, n2), E, D, O, k, A = 0, ee = 0, te = 0, ne = 0, re = -1, ie2 = -1, ae2 = {}, oe2 = (0, Bu.default)(``);
  if (e51.allowVerticalPlacement && r2.vertical) {
    let e52 = s2.layout.get(`text-rotate`).evaluate(b, {}, C) + 90, n3 = r2.vertical;
    O = new kC(c2, t2, l2, u2, d2, n3, f2, p2, m2, e52), o2 && (k = new kC(c2, t2, l2, u2, d2, o2, g2, _, m2, e52));
  }
  if (i2) {
    let n3 = s2.layout.get(`icon-rotate`).evaluate(b, {}), r3 = s2.layout.get(`icon-text-fit`) !== `none`, a3 = CC(i2, n3, S, r3), f3 = o2 ? CC(o2, n3, S, r3) : void 0;
    D = new kC(c2, t2, l2, u2, d2, i2, g2, _, false, n3), A = a3.length * 4;
    let p3 = e51.iconSizeData, m3 = null;
    p3.kind === `source` ? (m3 = [128 * s2.layout.get(`icon-size`).evaluate(b, {})], m3[0] > 32640 && It(`${e51.layerIds[0]}: Value for "icon-size" is >= 255. Reduce your "icon-size".`)) : p3.kind === `composite` && (m3 = [128 * x.compositeIconSizes[0].evaluate(b, {}, C), 128 * x.compositeIconSizes[1].evaluate(b, {}, C)], (m3[0] > 32640 || m3[1] > 32640) && It(`${e51.layerIds[0]}: Value for "icon-size" is >= 255. Reduce your "icon-size".`)), e51.addSymbols(e51.icon, a3, m3, y, v, b, 0, t2, T.lineStartIndex, T.lineLength, -1, C), re = e51.icon.placedSymbolArray.length - 1, f3 && (ee = f3.length * 4, e51.addSymbols(e51.icon, f3, m3, y, v, b, 2, t2, T.lineStartIndex, T.lineLength, -1, C), ie2 = e51.icon.placedSymbolArray.length - 1);
  }
  let se3 = Object.keys(r2.horizontal);
  for (let n3 of se3) {
    let i3 = r2.horizontal[n3];
    E ||= (oe2 = (0, Bu.default)(i3.text), new kC(c2, t2, l2, u2, d2, i3, f2, p2, m2, s2.layout.get(`text-rotate`).evaluate(b, {}, C)));
    let o3 = i3.positionedLines.length === 1;
    if (te += WC(e51, t2, i3, a2, s2, m2, b, h2, T, r2.vertical ? 1 : 3, o3 ? se3 : [n3], ae2, re, x, C), o3) break;
  }
  r2.vertical && (ne += WC(e51, t2, r2.vertical, a2, s2, m2, b, h2, T, 2, [`vertical`], ae2, ie2, x, C));
  let ce2 = E ? E.boxStartIndex : e51.collisionBoxArray.length, le2 = E ? E.boxEndIndex : e51.collisionBoxArray.length, ue2 = O ? O.boxStartIndex : e51.collisionBoxArray.length, de = O ? O.boxEndIndex : e51.collisionBoxArray.length, fe = D ? D.boxStartIndex : e51.collisionBoxArray.length, pe = D ? D.boxEndIndex : e51.collisionBoxArray.length, me = k ? k.boxStartIndex : e51.collisionBoxArray.length, he = k ? k.boxEndIndex : e51.collisionBoxArray.length, ge2 = -1, _e2 = (e52, t3) => e52?.circleDiameter ? Math.max(e52.circleDiameter, t3) : t3;
  ge2 = _e2(E, ge2), ge2 = _e2(O, ge2), ge2 = _e2(D, ge2), ge2 = _e2(k, ge2);
  let ve2 = +(ge2 > -1);
  ve2 && (ge2 *= w / 24), e51.glyphOffsetArray.length >= sv.MAX_GLYPHS && It(`Too many glyphs being rendered in a tile. See https://github.com/mapbox/mapbox-gl-js/issues/2907`), b.sortKey !== void 0 && e51.addToSortKeyRanges(e51.symbolInstances.length, b.sortKey);
  let ye = zC(s2, b, C), [be, xe] = UC(e51.textAnchorOffsets, ye);
  e51.symbolInstances.emplaceBack(t2.x, t2.y, ae2.right >= 0 ? ae2.right : -1, ae2.center >= 0 ? ae2.center : -1, ae2.left >= 0 ? ae2.left : -1, ae2.vertical || -1, re, ie2, oe2, ce2, le2, ue2, de, fe, pe, me, he, l2, te, ne, A, ee, ve2, 0, f2, ge2, be, xe);
}
function qC(e51, t2, n2, r2) {
  let i2 = e51.compareText;
  if (!(t2 in i2)) i2[t2] = [];
  else {
    let e52 = i2[t2];
    for (let t3 = e52.length - 1; t3 >= 0; t3--) if (r2.dist(e52[t3]) < n2) return true;
  }
  return i2[t2].push(r2), false;
}

// node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs
var H2 = class {
  constructor(e51, t2) {
    this.keyCache = {}, e51 && this.replace(e51, t2);
  }
  replace(e51, t2) {
    this._layerConfigs = {}, this._layers = {}, this.update(e51, [], t2);
  }
  update(e51, t2, n2) {
    for (let t3 of e51) {
      this._layerConfigs[t3.id] = t3;
      let e52 = this._layers[t3.id] = Ev(t3, n2);
      e52._featureFilter = fs(e52.filter, `layers[${t3.id}].filter`, n2), this.keyCache[t3.id] && delete this.keyCache[t3.id];
    }
    for (let e52 of t2) delete this.keyCache[e52], delete this._layerConfigs[e52], delete this._layers[e52];
    this.familiesBySource = {};
    let r2 = Cs(Object.values(this._layerConfigs), this.keyCache);
    for (let e52 of r2) {
      let t3 = e52.map((e53) => this._layers[e53.id]), n3 = t3[0];
      if (n3.isHidden()) continue;
      let r3 = n3.source || ``, i2 = this.familiesBySource[r3];
      i2 ||= this.familiesBySource[r3] = {};
      let a2 = n3.sourceLayer || `_geojsonTileLayer`, o2 = i2[a2];
      o2 ||= i2[a2] = [], o2.push(t3);
    }
  }
};
var U2 = class {
  constructor(e51) {
    let t2 = {}, n2 = [];
    for (let r3 in e51) {
      let i3 = e51[r3], a2 = t2[r3] = {};
      for (let e52 in i3) {
        let t3 = i3[+e52];
        if (!t3 || t3.bitmap.width === 0 || t3.bitmap.height === 0) continue;
        let r4 = { x: 0, y: 0, w: t3.bitmap.width + 2, h: t3.bitmap.height + 2 };
        n2.push(r4), a2[e52] = { rect: r4, metrics: t3.metrics };
      }
    }
    let { w: r2, h: i2 } = A_(n2), o2 = new cf({ width: r2 || 1, height: i2 || 1 });
    for (let n3 in e51) {
      let r3 = e51[n3];
      for (let e52 in r3) {
        let i3 = r3[+e52];
        if (!i3 || i3.bitmap.width === 0 || i3.bitmap.height === 0) continue;
        let s2 = t2[n3][e52].rect;
        cf.copy(i3.bitmap, o2, { x: 0, y: 0 }, { x: s2.x + 1, y: s2.y + 1 }, i3.bitmap);
      }
    }
    this.image = o2, this.positions = t2;
  }
};
U(`GlyphAtlas`, U2);
var W2 = class {
  constructor(e51) {
    this.tileID = new Pv(e51.tileID.overscaledZ, e51.tileID.wrap, e51.tileID.canonical.z, e51.tileID.canonical.x, e51.tileID.canonical.y), this.uid = e51.uid, this.zoom = e51.zoom, this.pixelRatio = e51.pixelRatio, this.tileSize = e51.tileSize, this.source = e51.source, this.overscaling = this.tileID.overscaleFactor(), this.showCollisionBoxes = e51.showCollisionBoxes, this.collectResourceTiming = !!e51.collectResourceTiming, this.returnDependencies = !!e51.returnDependencies, this.promoteId = e51.promoteId, this.inFlightDependencies = [];
  }
  async parse(e51, t2, r2, i2, a2) {
    this.data = e51, this.collisionBoxArray = new tu();
    let o2 = new $v(Object.keys(e51.layers).sort()), s2 = new nC(this.tileID, this.promoteId);
    s2.bucketLayerIDs = [];
    let l2 = {}, u2 = { featureIndex: s2, iconDependencies: {}, patternDependencies: {}, glyphDependencies: {}, dashDependencies: {}, availableImages: r2, subdivisionGranularity: a2 }, f2 = t2.familiesBySource[this.source];
    for (let t3 in f2) {
      let n2 = e51.layers[t3];
      if (!n2) continue;
      n2.version === 1 && It(`Vector tile source "${this.source}" layer "${t3}" does not use vector tile spec v2 and therefore may have some rendering errors.`);
      let i3 = o2.encode(t3), a3 = [];
      for (let e52 = 0; e52 < n2.length; e52++) {
        let r3 = n2.feature(e52), o3 = s2.getId(r3, t3);
        a3.push({ feature: r3, id: o3, index: e52, sourceLayerIndex: i3 });
      }
      for (let e52 of f2[t3]) {
        let t4 = e52[0];
        t4.source !== this.source && It(`layer.source = ${t4.source} does not equal this.source = ${this.source}`), !t4.isHidden(this.zoom, true) && (G2(e52, this.zoom, r2), (l2[t4.id] = t4.createBucket({ index: s2.bucketLayerIDs.length, layers: e52, zoom: this.zoom, pixelRatio: this.pixelRatio, overscaling: this.overscaling, collisionBoxArray: this.collisionBoxArray, sourceLayerIndex: i3, sourceID: this.source })).populate(a3, u2, this.tileID.canonical), s2.bucketLayerIDs.push(e52.map((e53) => e53.id)));
      }
    }
    let p2 = jt(u2.glyphDependencies, (e52) => Object.keys(e52).map(Number));
    for (let e52 of this.inFlightDependencies) e52?.abort();
    this.inFlightDependencies = [];
    let h2 = Promise.resolve({});
    if (Object.keys(p2).length) {
      let e52 = new AbortController();
      this.inFlightDependencies.push(e52), h2 = i2.sendAsync({ type: `GG`, data: { stacks: p2, source: this.source, tileID: this.tileID, type: `glyphs` } }, e52);
    }
    let g2 = Object.keys(u2.iconDependencies), _ = Promise.resolve({});
    if (g2.length) {
      let e52 = new AbortController();
      this.inFlightDependencies.push(e52), _ = i2.sendAsync({ type: `GI`, data: { icons: g2, source: this.source, tileID: this.tileID, type: `icons` } }, e52);
    }
    let v = Object.keys(u2.patternDependencies), y = Promise.resolve({});
    if (v.length) {
      let e52 = new AbortController();
      this.inFlightDependencies.push(e52), y = i2.sendAsync({ type: `GI`, data: { icons: v, source: this.source, tileID: this.tileID, type: `patterns` } }, e52);
    }
    let S = u2.dashDependencies, C = Promise.resolve({});
    if (Object.keys(S).length) {
      let e52 = new AbortController();
      this.inFlightDependencies.push(e52), C = i2.sendAsync({ type: `GDA`, data: { dashes: S } }, e52);
    }
    let [w, T, E, D] = await Promise.all([h2, _, y, C]), O = new U2(w), k = new M_(T, E);
    for (let e52 in l2) {
      let t3 = l2[e52];
      t3 instanceof sv ? (G2(t3.layers, this.zoom, r2), BC({ bucket: t3, glyphMap: w, glyphPositions: O.positions, imageMap: T, imagePositions: k.iconPositions, showCollisionBoxes: this.showCollisionBoxes, canonical: this.tileID.canonical, subdivisionGranularity: u2.subdivisionGranularity })) : t3.hasDependencies && (t3 instanceof Hp || t3 instanceof Lm || t3 instanceof Dg) && (G2(t3.layers, this.zoom, r2), t3.addFeatures(u2, this.tileID.canonical, k.patternPositions, D));
    }
    return { buckets: Object.values(l2).filter((e52) => !e52.isEmpty()), featureIndex: s2, collisionBoxArray: this.collisionBoxArray, glyphAtlasImage: O.image, imageAtlas: k, dashPositions: D, glyphMap: this.returnDependencies ? w : null, iconMap: this.returnDependencies ? T : null, glyphPositions: this.returnDependencies ? O.positions : null };
  }
};
function G2(e51, t2, n2) {
  let r2 = new W(t2);
  for (let t3 of e51) t3.recalculate(r2, n2);
}
var K2 = class {
  constructor() {
    this.loading = {}, this.loaded = {}, this.parsing = {};
  }
  startLoading(e51, t2) {
    this.loading[e51] = t2;
  }
  finishLoading(e51) {
    delete this.loading[e51];
  }
  abort(e51) {
    let t2 = this.loading[e51];
    t2?.abort && (t2.abort.abort(), delete this.loading[e51]);
  }
  getParsing(e51) {
    return this.parsing[e51];
  }
  setParsing(e51, t2) {
    this.parsing[e51] = t2;
  }
  removeParsing(e51) {
    delete this.parsing[e51];
  }
  markLoaded(e51, t2) {
    this.loaded[e51] = t2;
  }
  getLoaded(e51) {
    let t2 = this.loaded[e51];
    if (t2) return t2;
  }
  removeLoaded(e51) {
    delete this.loaded[e51];
  }
  clearLoaded() {
    this.loaded = {};
  }
};
var q2 = class {
  constructor(e51) {
    this.start = `${e51}#start`, this.end = `${e51}#end`, this.measure = e51, performance.mark(this.start);
  }
  finish() {
    performance.mark(this.end);
    let e51 = performance.getEntriesByName(this.measure);
    return e51.length === 0 && (performance.measure(this.measure, this.start, this.end), e51 = performance.getEntriesByName(this.measure), performance.clearMarks(this.start), performance.clearMarks(this.end), performance.clearMeasures(this.measure)), e51;
  }
};
var J2 = class {
  constructor(e51, t2, n2, r2, i2) {
    this.type = e51, this.properties = n2 || {}, this.extent = i2, this.pointsArray = t2, this.id = r2;
  }
  loadGeometry() {
    return this.pointsArray.map((e51) => e51.map((e52) => new l(e52.x, e52.y)));
  }
};
var Y2 = class {
  constructor(e51, t2, n2) {
    this.version = 2, this._myFeatures = e51, this.name = t2, this.length = e51.length, this.extent = n2;
  }
  feature(e51) {
    return this._myFeatures[e51];
  }
};
var X2 = class {
  constructor() {
    this.layers = {};
  }
  addLayer(e51) {
    this.layers[e51.name] = e51;
  }
};
function ie(e51, t2, n2) {
  let { extent: r2 } = e51, i2 = 2 ** (n2.z - t2.z), a2 = (n2.x - t2.x * i2) * r2, o2 = (n2.y - t2.y * i2) * r2, s2 = [];
  for (let t3 = 0; t3 < e51.length; t3++) {
    let n3 = e51.feature(t3), c2 = n3.loadGeometry();
    for (let e52 of c2) for (let t4 of e52) t4.x = t4.x * i2 - a2, t4.y = t4.y * i2 - o2;
    c2 = cC(c2, n3.type, -128, -128, r2 + 128, r2 + 128), c2.length !== 0 && s2.push(new J2(n3.type, c2, n3.properties, n3.id, r2));
  }
  return new Y2(s2, e51.name, r2);
}
var ae = class {
  constructor(e51, t2, n2) {
    this.actor = e51, this.layerIndex = t2, this.availableImages = n2, this.tileState = new K2(), this.overzoomedTileResultCache = new oC(1e3);
  }
  loadVectorTile(t2, n2) {
    try {
      return { vectorTile: t2.encoding === `mlt` ? new tC(n2) : new cm(new a_(n2)), rawData: n2 };
    } catch (e51) {
      let r2 = new Uint8Array(n2), i2 = r2[0] === 31 && r2[1] === 139, a2 = `Unable to parse the tile at ${t2.request.url}, `;
      throw a2 += i2 ? `please make sure the data is not gzipped and that you have configured the relevant header in the server` : `got error: ${$e(e51).message}`, Error(a2);
    }
  }
  async loadTile(e51) {
    let { uid: t2, overzoomParameters: n2 } = e51;
    n2 && (e51.request = n2.overzoomRequest);
    let i2 = this._startRequestTiming(e51), a2 = new W2(e51);
    this.tileState.startLoading(t2, a2);
    let o2 = new AbortController();
    a2.abort = o2;
    try {
      let s2 = await An(e51.request, o2);
      if (e51.etag && e51.etag === s2.etag) return this.tileState.finishLoading(t2), this._getEtagUnmodifiedResult(s2, i2);
      let c2 = this.loadVectorTile(e51, s2.data);
      if (this.tileState.finishLoading(t2), !c2) return null;
      let { vectorTile: l2, rawData: u2 } = c2;
      n2 && ({ vectorTile: l2, rawData: u2 } = this._getOverzoomTile(e51, l2));
      let d2 = this._getExpiryData(s2), f2 = this._finishRequestTiming(i2);
      a2.vectorTile = l2, this.tileState.markLoaded(t2, a2);
      let p2 = { rawData: u2, cacheControl: d2, resourceTiming: f2 };
      return this.tileState.setParsing(t2, p2), await this._parseWorkerTile(a2, e51);
    } catch (e52) {
      throw this.tileState.finishLoading(t2), this.tileState.markLoaded(t2, a2), e52;
    }
  }
  _getEtagUnmodifiedResult(e51, t2) {
    let n2 = this._getExpiryData(e51), r2 = this._finishRequestTiming(t2);
    return St({ etagUnmodified: true }, n2, r2);
  }
  async _parseWorkerTile(e51, t2) {
    let n2 = this.tileState.getParsing(e51.uid), r2 = await e51.parse(e51.vectorTile, this.layerIndex, this.availableImages, this.actor, t2.subdivisionGranularity);
    if (n2) {
      let { rawData: i2, cacheControl: a2, resourceTiming: o2 } = n2, s2 = t2.overzoomParameters ? `mvt` : t2.encoding;
      r2 = St({ rawTileData: i2.slice(0), encoding: s2 }, r2, a2, o2), this.tileState.removeParsing(e51.uid);
    }
    return r2;
  }
  _getExpiryData({ expires: e51, cacheControl: t2, etag: n2 }) {
    let r2 = {};
    return e51 && (r2.expires = e51), t2 && (r2.cacheControl = t2), n2 && (r2.etag = n2), r2;
  }
  _startRequestTiming(e51) {
    if (e51.request?.collectResourceTiming) return new q2(e51.request.url);
  }
  _finishRequestTiming(e51) {
    let t2 = e51?.finish();
    return t2 ? { resourceTiming: JSON.parse(JSON.stringify(t2)) } : {};
  }
  _getOverzoomTile(e51, t2) {
    let { tileID: n2, source: r2, overzoomParameters: i2 } = e51, { maxZoomTileID: a2 } = i2, o2 = `${a2.key}_${n2.key}_${e51.request?.url}`, s2 = this.overzoomedTileResultCache.get(o2);
    if (s2) return s2;
    let c2 = new X2(), l2 = this.layerIndex.familiesBySource[r2];
    for (let e52 in l2) {
      let r3 = t2.layers[e52];
      if (!r3) continue;
      let i3 = ie(r3, a2, n2.canonical);
      i3.length > 0 && c2.addLayer(i3);
    }
    let u2 = { vectorTile: c2, rawData: Wv(c2).buffer };
    return this.overzoomedTileResultCache.set(o2, u2), u2;
  }
  async reloadTile(e51) {
    let t2 = e51.uid, n2 = this.tileState.getLoaded(t2);
    if (!n2) throw Error(`Should not be trying to reload a tile that was never loaded or has been removed`);
    if (n2.vectorTile) return n2.showCollisionBoxes = e51.showCollisionBoxes, await this._parseWorkerTile(n2, e51);
  }
  async abortTile(e51) {
    this.tileState.abort(e51.uid);
  }
  async removeTile(e51) {
    this.tileState.removeLoaded(e51.uid);
  }
};
var oe = class {
  constructor() {
    this.loaded = {};
  }
  async loadTile(e51) {
    let { uid: t2, encoding: n2, rawImageData: r2, redFactor: a2, greenFactor: o2, blueFactor: s2, baseShift: c2 } = e51, l2 = r2.width + 2, u2 = r2.height + 2, d2 = Wt(r2) ? new lf({ width: l2, height: u2 }, await $t(r2, -1, -1, l2, u2)) : r2, f2 = new Tf(t2, d2, n2, a2, o2, s2, c2);
    return this.loaded ||= {}, this.loaded[t2] = f2, f2;
  }
  removeTile(e51) {
    let t2 = this.loaded, n2 = e51.uid;
    t2?.[n2] && delete t2[n2];
  }
};
var se2 = class {
  constructor(e51, t2, n2, r2 = ce) {
    this.actor = e51, this.layerIndex = t2, this.availableImages = n2, this.tileState = new K2(), this._createGeoJSONIndex = r2;
  }
  loadVectorTile(e51) {
    if (!this._geoJSONIndex) throw Error(`Unable to parse the data into a cluster or geojson`);
    let { z: n2, x: r2, y: i2 } = e51.tileID.canonical, a2 = this._geoJSONIndex.getTile(n2, r2, i2);
    if (!a2) return null;
    let o2 = new Uv(a2.features, { version: 2, extent: j });
    return { vectorTile: o2, rawData: Wv(o2, Qe).buffer };
  }
  async loadTile(e51) {
    let { uid: t2 } = e51, n2 = new W2(e51);
    n2.abort = new AbortController();
    try {
      let r2 = this.loadVectorTile(e51);
      if (!r2) return null;
      let { vectorTile: i2, rawData: a2 } = r2;
      n2.vectorTile = i2, this.tileState.markLoaded(t2, n2);
      let o2 = { rawData: a2 };
      return this.tileState.setParsing(t2, o2), await this._parseWorkerTile(n2, e51);
    } catch (e52) {
      throw this.tileState.markLoaded(t2, n2), e52;
    }
  }
  async _parseWorkerTile(e51, t2) {
    let n2 = this.tileState.getParsing(e51.uid), r2 = await e51.parse(e51.vectorTile, this.layerIndex, this.availableImages, this.actor, t2.subdivisionGranularity);
    if (n2) {
      let { rawData: t3 } = n2;
      r2 = St({ rawTileData: t3.slice(0), encoding: `mvt` }, r2), this.tileState.removeParsing(e51.uid);
    }
    return r2;
  }
  async abortTile(e51) {
    this.tileState.abort(e51.uid);
  }
  async removeTile(e51) {
    this.tileState.removeLoaded(e51.uid);
  }
  async loadData(e51) {
    this._pendingRequest?.abort();
    let t2 = this._startRequestTiming(e51);
    this._pendingRequest = new AbortController();
    try {
      await this.loadAndProcessGeoJSON(e51, this._pendingRequest), delete this._pendingRequest, this.tileState.clearLoaded();
      let n2 = {};
      return e51.request && (n2.data = e51.data), this._finishRequestTiming(t2, e51, n2), n2;
    } catch (e52) {
      if (delete this._pendingRequest, !gn(e52)) throw e52;
      return { abandoned: true };
    }
  }
  _startRequestTiming(e51) {
    if (e51.request?.collectResourceTiming) return new q2(e51.request.url);
  }
  _finishRequestTiming(e51, t2, n2) {
    let r2 = e51?.finish();
    r2 && (n2.resourceTiming = { [t2.source]: JSON.parse(JSON.stringify(r2)) });
  }
  async reloadTile(e51) {
    let t2 = e51.uid, n2 = this.tileState.getLoaded(t2);
    if (!n2) return await this.loadTile(e51);
    if (n2.vectorTile) return n2.showCollisionBoxes = e51.showCollisionBoxes, await this._parseWorkerTile(n2, e51);
  }
  async loadAndProcessGeoJSON(e51, t2) {
    if (e51.request && (e51.data = (await kn(e51.request, t2)).data), e51.data) {
      e51.data = this._filterGeoJSON(e51.data, e51.filter, e51.source), this._geoJSONIndex = this._createGeoJSONIndex(e51.data, e51);
      return;
    }
    if (e51.dataDiff) {
      this._geoJSONIndex ??= this._createGeoJSONIndex({ type: `FeatureCollection`, features: [] }, e51), this._geoJSONIndex.updateData(e51.dataDiff, this._getFilterPredicate(e51.filter, e51.source));
      return;
    }
    if (e51.updateCluster && this._geoJSONIndex.updateClusterOptions(e51.geojsonVtOptions.cluster, Z2(e51)), this._geoJSONIndex == null) throw Error(`Input data given to '${e51.source}' is not a valid GeoJSON object.`);
  }
  _filterGeoJSON(e51, t2, n2) {
    if (e51.type !== `FeatureCollection`) return e51;
    let r2 = this._getFilterPredicate(t2, n2);
    return r2 ? { type: `FeatureCollection`, features: e51.features.filter((e52) => r2(e52)) } : e51;
  }
  _getFilterPredicate(e51, t2) {
    if (typeof e51 != `boolean` && !e51?.length) return;
    let n2 = Wo(e51, `sources.${t2}.filter`, { type: `boolean`, "property-type": `data-driven`, overridable: false, transition: false });
    if (n2.result === `error`) throw Error(n2.value.map((e52) => `${e52.key}: ${e52.message}`).join(`, `));
    return (e52) => n2.value.evaluate({ zoom: 0 }, e52);
  }
  async removeSource(e51) {
    this._pendingRequest?.abort();
  }
  getClusterExpansionZoom(e51) {
    return this._geoJSONIndex.getClusterExpansionZoom(e51.clusterId);
  }
  getClusterChildren(e51) {
    return this._geoJSONIndex.getClusterChildren(e51.clusterId);
  }
  getClusterLeaves(e51) {
    return this._geoJSONIndex.getClusterLeaves(e51.clusterId, e51.limit, e51.offset);
  }
};
function ce(e51, t2) {
  let n2 = St(t2.geojsonVtOptions || {}, { updateable: true, clusterOptions: Z2(t2) });
  return new yg(e51, n2);
}
function Z2({ geojsonVtOptions: e51, clusterProperties: t2, source: n2 }) {
  if (!t2 || !e51.clusterOptions) return e51.clusterOptions;
  let r2 = {}, i2 = {}, a2 = { accumulated: null, zoom: 0 }, o2 = { properties: null }, s2 = Object.keys(t2);
  for (let e52 of s2) {
    let [a3, o3] = t2[e52], s3 = Wo(o3, `sources.${n2}.clusterProperties.${e52}[1]`), c2 = Wo(typeof a3 == `string` ? [a3, [`accumulated`], [`get`, e52]] : a3, `sources.${n2}.clusterProperties.${e52}[0]`);
    r2[e52] = s3.value, i2[e52] = c2.value;
  }
  return e51.clusterOptions.map = (e52) => {
    o2.properties = e52;
    let t3 = {};
    for (let e53 of s2) t3[e53] = r2[e53].evaluate(a2, o2);
    return t3;
  }, e51.clusterOptions.reduce = (e52, t3) => {
    o2.properties = t3;
    for (let t4 of s2) a2.accumulated = e52[t4], e52[t4] = i2[t4].evaluate(a2, o2);
  }, e51.clusterOptions;
}
async function Q2(e51) {
  if (e51.endsWith(`.mjs`)) {
    await import(e51);
    return;
  }
  let t2 = await fetch(e51, { credentials: `same-origin` });
  if (!t2.ok) throw Error(`Failed to load ${e51}: ${t2.status}`);
  let n2 = await t2.text();
  if (/^[ \t]*(import|export)\s/m.test(n2)) {
    let e52 = URL.createObjectURL(new Blob([n2], { type: `text/javascript` }));
    try {
      await import(e52);
    } finally {
      URL.revokeObjectURL(e52);
    }
    return;
  }
  globalThis.eval(n2);
}
var $2 = class {
  constructor(e51) {
    this.self = e51, this.actor = new kv(e51), this.layerIndexes = {}, this.availableImages = {}, this.workerSources = {}, this.demWorkerSources = {}, this.externalWorkerSourceTypes = {}, this.globalStates = /* @__PURE__ */ new Map(), this.self.registerWorkerSource = (e52, t2) => {
      if (this.externalWorkerSourceTypes[e52]) throw Error(`Worker source with name "${e52}" already registered.`);
      this.externalWorkerSourceTypes[e52] = t2;
    }, this.self.addProtocol = bn, this.self.removeProtocol = xn, this.self.registerRTLTextPlugin = (e52) => {
      tl.setMethods(e52);
    }, this.self.makeRequest = On, this.actor.registerMessageHandler(`LDT`, (e52, t2) => this._getDEMWorkerSource(e52, t2.source).loadTile(t2)), this.actor.registerMessageHandler(`RDT`, async (e52, t2) => {
      this._getDEMWorkerSource(e52, t2.source).removeTile(t2);
    }), this.actor.registerMessageHandler(`GCEZ`, async (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).getClusterExpansionZoom(t2)), this.actor.registerMessageHandler(`GCC`, async (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).getClusterChildren(t2)), this.actor.registerMessageHandler(`GCL`, async (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).getClusterLeaves(t2)), this.actor.registerMessageHandler(`LD`, (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).loadData(t2)), this.actor.registerMessageHandler(`LT`, (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).loadTile(t2)), this.actor.registerMessageHandler(`RT`, (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).reloadTile(t2)), this.actor.registerMessageHandler(`AT`, (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).abortTile(t2)), this.actor.registerMessageHandler(`RMT`, (e52, t2) => this._getWorkerSource(e52, t2.type, t2.source).removeTile(t2)), this.actor.registerMessageHandler(`RS`, async (e52, t2) => {
      if (!this.workerSources[e52]?.[t2.type]?.[t2.source]) return;
      let n2 = this.workerSources[e52][t2.type][t2.source];
      delete this.workerSources[e52][t2.type][t2.source], n2.removeSource !== void 0 && n2.removeSource(t2);
    }), this.actor.registerMessageHandler(`RM`, async (e52) => {
      delete this.layerIndexes[e52], delete this.availableImages[e52], delete this.workerSources[e52], delete this.demWorkerSources[e52], this.globalStates.delete(e52);
    }), this.actor.registerMessageHandler(`SR`, async (e52, t2) => {
      this.referrer = t2;
    }), this.actor.registerMessageHandler(`SRPS`, (e52, t2) => this._syncRTLPluginState(e52, t2)), this.actor.registerMessageHandler(`IS`, async (e52, t2) => {
      await Q2(t2);
    }), this.actor.registerMessageHandler(`SI`, (e52, t2) => this._setImages(e52, t2)), this.actor.registerMessageHandler(`UL`, async (e52, t2) => {
      this._getLayerIndex(e52).update(t2.layers, t2.removedIds, this._getGlobalState(e52));
    }), this.actor.registerMessageHandler(`UGS`, async (e52, t2) => {
      let n2 = this._getGlobalState(e52);
      for (let e53 in t2) n2[e53] = t2[e53];
    }), this.actor.registerMessageHandler(`SL`, async (e52, t2) => {
      this._getLayerIndex(e52).replace(t2, this._getGlobalState(e52));
    });
  }
  _getGlobalState(e51) {
    let t2 = this.globalStates.get(e51);
    return t2 || (t2 = {}, this.globalStates.set(e51, t2)), t2;
  }
  async _setImages(e51, t2) {
    this.availableImages[e51] = t2;
    for (let n2 in this.workerSources[e51]) {
      let r2 = this.workerSources[e51][n2];
      for (let e52 in r2) r2[e52].availableImages = t2;
    }
  }
  async _syncRTLPluginState(e51, t2) {
    return await tl.syncState(t2, Q2);
  }
  _getAvailableImages(e51) {
    let t2 = this.availableImages[e51];
    return t2 ||= [], t2;
  }
  _getLayerIndex(e51) {
    let t2 = this.layerIndexes[e51];
    return t2 ||= this.layerIndexes[e51] = new H2(), t2;
  }
  _getWorkerSource(e51, t2, n2) {
    if (this.workerSources[e51] ||= {}, this.workerSources[e51][t2] ||= {}, !this.workerSources[e51][t2][n2]) {
      let r2 = { sendAsync: (t3, n3) => (t3.targetMapId = e51, this.actor.sendAsync(t3, n3)) };
      switch (t2) {
        case `vector`:
          this.workerSources[e51][t2][n2] = new ae(r2, this._getLayerIndex(e51), this._getAvailableImages(e51));
          break;
        case `geojson`:
          this.workerSources[e51][t2][n2] = new se2(r2, this._getLayerIndex(e51), this._getAvailableImages(e51));
          break;
        default:
          this.workerSources[e51][t2][n2] = new this.externalWorkerSourceTypes[t2](r2, this._getLayerIndex(e51), this._getAvailableImages(e51));
      }
    }
    return this.workerSources[e51][t2][n2];
  }
  _getDEMWorkerSource(e51, t2) {
    return this.demWorkerSources[e51] ||= {}, this.demWorkerSources[e51][t2] ||= new oe(), this.demWorkerSources[e51][t2];
  }
};
Bt(self) && (self.worker = new $2(self));
export {
  $2 as default
};
/*! Bundled license information:

maplibre-gl/dist/maplibre-gl-shared.mjs:
maplibre-gl/dist/maplibre-gl-worker.mjs:
  (**
  * MapLibre GL JS
  * @license 3-Clause BSD. Full text of license: https://github.com/maplibre/maplibre-gl-js/blob/v6.4.0/LICENSE.txt
  *)
*/
