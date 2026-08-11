function zf(L) {
  return L && L.__esModule && Object.prototype.hasOwnProperty.call(L, "default") ? L.default : L;
}
var Na = { exports: {} }, D = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ka;
function Tf() {
  if (ka) return D;
  ka = 1;
  var L = Symbol.for("react.element"), te = Symbol.for("react.portal"), m = Symbol.for("react.fragment"), pe = Symbol.for("react.strict_mode"), Pe = Symbol.for("react.profiler"), Fe = Symbol.for("react.provider"), Ne = Symbol.for("react.context"), ae = Symbol.for("react.forward_ref"), B = Symbol.for("react.suspense"), Ee = Symbol.for("react.memo"), ve = Symbol.for("react.lazy"), q = Symbol.iterator;
  function X(c) {
    return c === null || typeof c != "object" ? null : (c = q && c[q] || c["@@iterator"], typeof c == "function" ? c : null);
  }
  var $e = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, We = Object.assign, G = {};
  function H(c, v, O) {
    this.props = c, this.context = v, this.refs = G, this.updater = O || $e;
  }
  H.prototype.isReactComponent = {}, H.prototype.setState = function(c, v) {
    if (typeof c != "object" && typeof c != "function" && c != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, c, v, "setState");
  }, H.prototype.forceUpdate = function(c) {
    this.updater.enqueueForceUpdate(this, c, "forceUpdate");
  };
  function vt() {
  }
  vt.prototype = H.prototype;
  function st(c, v, O) {
    this.props = c, this.context = v, this.refs = G, this.updater = O || $e;
  }
  var qe = st.prototype = new vt();
  qe.constructor = st, We(qe, H.prototype), qe.isPureReactComponent = !0;
  var ye = Array.isArray, be = Object.prototype.hasOwnProperty, _e = { current: null }, ze = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Qe(c, v, O) {
    var M, F = {}, j = null, W = null;
    if (v != null) for (M in v.ref !== void 0 && (W = v.ref), v.key !== void 0 && (j = "" + v.key), v) be.call(v, M) && !ze.hasOwnProperty(M) && (F[M] = v[M]);
    var A = arguments.length - 2;
    if (A === 1) F.children = O;
    else if (1 < A) {
      for (var Z = Array(A), Ue = 0; Ue < A; Ue++) Z[Ue] = arguments[Ue + 2];
      F.children = Z;
    }
    if (c && c.defaultProps) for (M in A = c.defaultProps, A) F[M] === void 0 && (F[M] = A[M]);
    return { $$typeof: L, type: c, key: j, ref: W, props: F, _owner: _e.current };
  }
  function Pt(c, v) {
    return { $$typeof: L, type: c.type, key: v, ref: c.ref, props: c.props, _owner: c._owner };
  }
  function yt(c) {
    return typeof c == "object" && c !== null && c.$$typeof === L;
  }
  function Kt(c) {
    var v = { "=": "=0", ":": "=2" };
    return "$" + c.replace(/[=:]/g, function(O) {
      return v[O];
    });
  }
  var at = /\/+/g;
  function je(c, v) {
    return typeof c == "object" && c !== null && c.key != null ? Kt("" + c.key) : v.toString(36);
  }
  function et(c, v, O, M, F) {
    var j = typeof c;
    (j === "undefined" || j === "boolean") && (c = null);
    var W = !1;
    if (c === null) W = !0;
    else switch (j) {
      case "string":
      case "number":
        W = !0;
        break;
      case "object":
        switch (c.$$typeof) {
          case L:
          case te:
            W = !0;
        }
    }
    if (W) return W = c, F = F(W), c = M === "" ? "." + je(W, 0) : M, ye(F) ? (O = "", c != null && (O = c.replace(at, "$&/") + "/"), et(F, v, O, "", function(Ue) {
      return Ue;
    })) : F != null && (yt(F) && (F = Pt(F, O + (!F.key || W && W.key === F.key ? "" : ("" + F.key).replace(at, "$&/") + "/") + c)), v.push(F)), 1;
    if (W = 0, M = M === "" ? "." : M + ":", ye(c)) for (var A = 0; A < c.length; A++) {
      j = c[A];
      var Z = M + je(j, A);
      W += et(j, v, O, Z, F);
    }
    else if (Z = X(c), typeof Z == "function") for (c = Z.call(c), A = 0; !(j = c.next()).done; ) j = j.value, Z = M + je(j, A++), W += et(j, v, O, Z, F);
    else if (j === "object") throw v = String(c), Error("Objects are not valid as a React child (found: " + (v === "[object Object]" ? "object with keys {" + Object.keys(c).join(", ") + "}" : v) + "). If you meant to render a collection of children, use an array instead.");
    return W;
  }
  function ct(c, v, O) {
    if (c == null) return c;
    var M = [], F = 0;
    return et(c, M, "", "", function(j) {
      return v.call(O, j, F++);
    }), M;
  }
  function Te(c) {
    if (c._status === -1) {
      var v = c._result;
      v = v(), v.then(function(O) {
        (c._status === 0 || c._status === -1) && (c._status = 1, c._result = O);
      }, function(O) {
        (c._status === 0 || c._status === -1) && (c._status = 2, c._result = O);
      }), c._status === -1 && (c._status = 0, c._result = v);
    }
    if (c._status === 1) return c._result.default;
    throw c._result;
  }
  var ne = { current: null }, S = { transition: null }, T = { ReactCurrentDispatcher: ne, ReactCurrentBatchConfig: S, ReactCurrentOwner: _e };
  function _() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return D.Children = { map: ct, forEach: function(c, v, O) {
    ct(c, function() {
      v.apply(this, arguments);
    }, O);
  }, count: function(c) {
    var v = 0;
    return ct(c, function() {
      v++;
    }), v;
  }, toArray: function(c) {
    return ct(c, function(v) {
      return v;
    }) || [];
  }, only: function(c) {
    if (!yt(c)) throw Error("React.Children.only expected to receive a single React element child.");
    return c;
  } }, D.Component = H, D.Fragment = m, D.Profiler = Pe, D.PureComponent = st, D.StrictMode = pe, D.Suspense = B, D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = T, D.act = _, D.cloneElement = function(c, v, O) {
    if (c == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + c + ".");
    var M = We({}, c.props), F = c.key, j = c.ref, W = c._owner;
    if (v != null) {
      if (v.ref !== void 0 && (j = v.ref, W = _e.current), v.key !== void 0 && (F = "" + v.key), c.type && c.type.defaultProps) var A = c.type.defaultProps;
      for (Z in v) be.call(v, Z) && !ze.hasOwnProperty(Z) && (M[Z] = v[Z] === void 0 && A !== void 0 ? A[Z] : v[Z]);
    }
    var Z = arguments.length - 2;
    if (Z === 1) M.children = O;
    else if (1 < Z) {
      A = Array(Z);
      for (var Ue = 0; Ue < Z; Ue++) A[Ue] = arguments[Ue + 2];
      M.children = A;
    }
    return { $$typeof: L, type: c.type, key: F, ref: j, props: M, _owner: W };
  }, D.createContext = function(c) {
    return c = { $$typeof: Ne, _currentValue: c, _currentValue2: c, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, c.Provider = { $$typeof: Fe, _context: c }, c.Consumer = c;
  }, D.createElement = Qe, D.createFactory = function(c) {
    var v = Qe.bind(null, c);
    return v.type = c, v;
  }, D.createRef = function() {
    return { current: null };
  }, D.forwardRef = function(c) {
    return { $$typeof: ae, render: c };
  }, D.isValidElement = yt, D.lazy = function(c) {
    return { $$typeof: ve, _payload: { _status: -1, _result: c }, _init: Te };
  }, D.memo = function(c, v) {
    return { $$typeof: Ee, type: c, compare: v === void 0 ? null : v };
  }, D.startTransition = function(c) {
    var v = S.transition;
    S.transition = {};
    try {
      c();
    } finally {
      S.transition = v;
    }
  }, D.unstable_act = _, D.useCallback = function(c, v) {
    return ne.current.useCallback(c, v);
  }, D.useContext = function(c) {
    return ne.current.useContext(c);
  }, D.useDebugValue = function() {
  }, D.useDeferredValue = function(c) {
    return ne.current.useDeferredValue(c);
  }, D.useEffect = function(c, v) {
    return ne.current.useEffect(c, v);
  }, D.useId = function() {
    return ne.current.useId();
  }, D.useImperativeHandle = function(c, v, O) {
    return ne.current.useImperativeHandle(c, v, O);
  }, D.useInsertionEffect = function(c, v) {
    return ne.current.useInsertionEffect(c, v);
  }, D.useLayoutEffect = function(c, v) {
    return ne.current.useLayoutEffect(c, v);
  }, D.useMemo = function(c, v) {
    return ne.current.useMemo(c, v);
  }, D.useReducer = function(c, v, O) {
    return ne.current.useReducer(c, v, O);
  }, D.useRef = function(c) {
    return ne.current.useRef(c);
  }, D.useState = function(c) {
    return ne.current.useState(c);
  }, D.useSyncExternalStore = function(c, v, O) {
    return ne.current.useSyncExternalStore(c, v, O);
  }, D.useTransition = function() {
    return ne.current.useTransition();
  }, D.version = "18.3.1", D;
}
Na.exports = Tf();
var Po = Na.exports;
const Lf = /* @__PURE__ */ zf(Po);
var xo = {}, za = { exports: {} }, Ie = {}, Eo = { exports: {} }, _o = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ea;
function Rf() {
  return Ea || (Ea = 1, function(L) {
    function te(S, T) {
      var _ = S.length;
      S.push(T);
      e: for (; 0 < _; ) {
        var c = _ - 1 >>> 1, v = S[c];
        if (0 < Pe(v, T)) S[c] = T, S[_] = v, _ = c;
        else break e;
      }
    }
    function m(S) {
      return S.length === 0 ? null : S[0];
    }
    function pe(S) {
      if (S.length === 0) return null;
      var T = S[0], _ = S.pop();
      if (_ !== T) {
        S[0] = _;
        e: for (var c = 0, v = S.length, O = v >>> 1; c < O; ) {
          var M = 2 * (c + 1) - 1, F = S[M], j = M + 1, W = S[j];
          if (0 > Pe(F, _)) j < v && 0 > Pe(W, F) ? (S[c] = W, S[j] = _, c = j) : (S[c] = F, S[M] = _, c = M);
          else if (j < v && 0 > Pe(W, _)) S[c] = W, S[j] = _, c = j;
          else break e;
        }
      }
      return T;
    }
    function Pe(S, T) {
      var _ = S.sortIndex - T.sortIndex;
      return _ !== 0 ? _ : S.id - T.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var Fe = performance;
      L.unstable_now = function() {
        return Fe.now();
      };
    } else {
      var Ne = Date, ae = Ne.now();
      L.unstable_now = function() {
        return Ne.now() - ae;
      };
    }
    var B = [], Ee = [], ve = 1, q = null, X = 3, $e = !1, We = !1, G = !1, H = typeof setTimeout == "function" ? setTimeout : null, vt = typeof clearTimeout == "function" ? clearTimeout : null, st = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function qe(S) {
      for (var T = m(Ee); T !== null; ) {
        if (T.callback === null) pe(Ee);
        else if (T.startTime <= S) pe(Ee), T.sortIndex = T.expirationTime, te(B, T);
        else break;
        T = m(Ee);
      }
    }
    function ye(S) {
      if (G = !1, qe(S), !We) if (m(B) !== null) We = !0, Te(be);
      else {
        var T = m(Ee);
        T !== null && ne(ye, T.startTime - S);
      }
    }
    function be(S, T) {
      We = !1, G && (G = !1, vt(Qe), Qe = -1), $e = !0;
      var _ = X;
      try {
        for (qe(T), q = m(B); q !== null && (!(q.expirationTime > T) || S && !Kt()); ) {
          var c = q.callback;
          if (typeof c == "function") {
            q.callback = null, X = q.priorityLevel;
            var v = c(q.expirationTime <= T);
            T = L.unstable_now(), typeof v == "function" ? q.callback = v : q === m(B) && pe(B), qe(T);
          } else pe(B);
          q = m(B);
        }
        if (q !== null) var O = !0;
        else {
          var M = m(Ee);
          M !== null && ne(ye, M.startTime - T), O = !1;
        }
        return O;
      } finally {
        q = null, X = _, $e = !1;
      }
    }
    var _e = !1, ze = null, Qe = -1, Pt = 5, yt = -1;
    function Kt() {
      return !(L.unstable_now() - yt < Pt);
    }
    function at() {
      if (ze !== null) {
        var S = L.unstable_now();
        yt = S;
        var T = !0;
        try {
          T = ze(!0, S);
        } finally {
          T ? je() : (_e = !1, ze = null);
        }
      } else _e = !1;
    }
    var je;
    if (typeof st == "function") je = function() {
      st(at);
    };
    else if (typeof MessageChannel < "u") {
      var et = new MessageChannel(), ct = et.port2;
      et.port1.onmessage = at, je = function() {
        ct.postMessage(null);
      };
    } else je = function() {
      H(at, 0);
    };
    function Te(S) {
      ze = S, _e || (_e = !0, je());
    }
    function ne(S, T) {
      Qe = H(function() {
        S(L.unstable_now());
      }, T);
    }
    L.unstable_IdlePriority = 5, L.unstable_ImmediatePriority = 1, L.unstable_LowPriority = 4, L.unstable_NormalPriority = 3, L.unstable_Profiling = null, L.unstable_UserBlockingPriority = 2, L.unstable_cancelCallback = function(S) {
      S.callback = null;
    }, L.unstable_continueExecution = function() {
      We || $e || (We = !0, Te(be));
    }, L.unstable_forceFrameRate = function(S) {
      0 > S || 125 < S ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Pt = 0 < S ? Math.floor(1e3 / S) : 5;
    }, L.unstable_getCurrentPriorityLevel = function() {
      return X;
    }, L.unstable_getFirstCallbackNode = function() {
      return m(B);
    }, L.unstable_next = function(S) {
      switch (X) {
        case 1:
        case 2:
        case 3:
          var T = 3;
          break;
        default:
          T = X;
      }
      var _ = X;
      X = T;
      try {
        return S();
      } finally {
        X = _;
      }
    }, L.unstable_pauseExecution = function() {
    }, L.unstable_requestPaint = function() {
    }, L.unstable_runWithPriority = function(S, T) {
      switch (S) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          S = 3;
      }
      var _ = X;
      X = S;
      try {
        return T();
      } finally {
        X = _;
      }
    }, L.unstable_scheduleCallback = function(S, T, _) {
      var c = L.unstable_now();
      switch (typeof _ == "object" && _ !== null ? (_ = _.delay, _ = typeof _ == "number" && 0 < _ ? c + _ : c) : _ = c, S) {
        case 1:
          var v = -1;
          break;
        case 2:
          v = 250;
          break;
        case 5:
          v = 1073741823;
          break;
        case 4:
          v = 1e4;
          break;
        default:
          v = 5e3;
      }
      return v = _ + v, S = { id: ve++, callback: T, priorityLevel: S, startTime: _, expirationTime: v, sortIndex: -1 }, _ > c ? (S.sortIndex = _, te(Ee, S), m(B) === null && S === m(Ee) && (G ? (vt(Qe), Qe = -1) : G = !0, ne(ye, _ - c))) : (S.sortIndex = v, te(B, S), We || $e || (We = !0, Te(be))), S;
    }, L.unstable_shouldYield = Kt, L.unstable_wrapCallback = function(S) {
      var T = X;
      return function() {
        var _ = X;
        X = T;
        try {
          return S.apply(this, arguments);
        } finally {
          X = _;
        }
      };
    };
  }(_o)), _o;
}
var _a;
function Of() {
  return _a || (_a = 1, Eo.exports = Rf()), Eo.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ca;
function Df() {
  if (Ca) return Ie;
  Ca = 1;
  var L = Po, te = Of();
  function m(e) {
    for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var pe = /* @__PURE__ */ new Set(), Pe = {};
  function Fe(e, t) {
    Ne(e, t), Ne(e + "Capture", t);
  }
  function Ne(e, t) {
    for (Pe[e] = t, e = 0; e < t.length; e++) pe.add(t[e]);
  }
  var ae = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), B = Object.prototype.hasOwnProperty, Ee = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, ve = {}, q = {};
  function X(e) {
    return B.call(q, e) ? !0 : B.call(ve, e) ? !1 : Ee.test(e) ? q[e] = !0 : (ve[e] = !0, !1);
  }
  function $e(e, t, n, r) {
    if (n !== null && n.type === 0) return !1;
    switch (typeof t) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function We(e, t, n, r) {
    if (t === null || typeof t > "u" || $e(e, t, n, r)) return !0;
    if (r) return !1;
    if (n !== null) switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
    return !1;
  }
  function G(e, t, n, r, l, u, o) {
    this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = u, this.removeEmptyString = o;
  }
  var H = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
    H[e] = new G(e, 0, !1, e, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
    var t = e[0];
    H[t] = new G(t, 1, !1, e[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
    H[e] = new G(e, 2, !1, e.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
    H[e] = new G(e, 2, !1, e, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
    H[e] = new G(e, 3, !1, e.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
    H[e] = new G(e, 3, !0, e, null, !1, !1);
  }), ["capture", "download"].forEach(function(e) {
    H[e] = new G(e, 4, !1, e, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(e) {
    H[e] = new G(e, 6, !1, e, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(e) {
    H[e] = new G(e, 5, !1, e.toLowerCase(), null, !1, !1);
  });
  var vt = /[\-:]([a-z])/g;
  function st(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var t = e.replace(
      vt,
      st
    );
    H[t] = new G(t, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var t = e.replace(vt, st);
    H[t] = new G(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var t = e.replace(vt, st);
    H[t] = new G(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    H[e] = new G(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), H.xlinkHref = new G("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(e) {
    H[e] = new G(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function qe(e, t, n, r) {
    var l = H.hasOwnProperty(t) ? H[t] : null;
    (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (We(t, n, l, r) && (n = null), r || l === null ? X(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
  }
  var ye = L.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, be = Symbol.for("react.element"), _e = Symbol.for("react.portal"), ze = Symbol.for("react.fragment"), Qe = Symbol.for("react.strict_mode"), Pt = Symbol.for("react.profiler"), yt = Symbol.for("react.provider"), Kt = Symbol.for("react.context"), at = Symbol.for("react.forward_ref"), je = Symbol.for("react.suspense"), et = Symbol.for("react.suspense_list"), ct = Symbol.for("react.memo"), Te = Symbol.for("react.lazy"), ne = Symbol.for("react.offscreen"), S = Symbol.iterator;
  function T(e) {
    return e === null || typeof e != "object" ? null : (e = S && e[S] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var _ = Object.assign, c;
  function v(e) {
    if (c === void 0) try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      c = t && t[1] || "";
    }
    return `
` + c + e;
  }
  var O = !1;
  function M(e, t) {
    if (!e || O) return "";
    O = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (t) if (t = function() {
        throw Error();
      }, Object.defineProperty(t.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(t, []);
        } catch (p) {
          var r = p;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (p) {
          r = p;
        }
        e.call(t.prototype);
      }
      else {
        try {
          throw Error();
        } catch (p) {
          r = p;
        }
        e();
      }
    } catch (p) {
      if (p && r && typeof p.stack == "string") {
        for (var l = p.stack.split(`
`), u = r.stack.split(`
`), o = l.length - 1, i = u.length - 1; 1 <= o && 0 <= i && l[o] !== u[i]; ) i--;
        for (; 1 <= o && 0 <= i; o--, i--) if (l[o] !== u[i]) {
          if (o !== 1 || i !== 1)
            do
              if (o--, i--, 0 > i || l[o] !== u[i]) {
                var s = `
` + l[o].replace(" at new ", " at ");
                return e.displayName && s.includes("<anonymous>") && (s = s.replace("<anonymous>", e.displayName)), s;
              }
            while (1 <= o && 0 <= i);
          break;
        }
      }
    } finally {
      O = !1, Error.prepareStackTrace = n;
    }
    return (e = e ? e.displayName || e.name : "") ? v(e) : "";
  }
  function F(e) {
    switch (e.tag) {
      case 5:
        return v(e.type);
      case 16:
        return v("Lazy");
      case 13:
        return v("Suspense");
      case 19:
        return v("SuspenseList");
      case 0:
      case 2:
      case 15:
        return e = M(e.type, !1), e;
      case 11:
        return e = M(e.type.render, !1), e;
      case 1:
        return e = M(e.type, !0), e;
      default:
        return "";
    }
  }
  function j(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case ze:
        return "Fragment";
      case _e:
        return "Portal";
      case Pt:
        return "Profiler";
      case Qe:
        return "StrictMode";
      case je:
        return "Suspense";
      case et:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case Kt:
        return (e.displayName || "Context") + ".Consumer";
      case yt:
        return (e._context.displayName || "Context") + ".Provider";
      case at:
        var t = e.render;
        return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case ct:
        return t = e.displayName || null, t !== null ? t : j(e.type) || "Memo";
      case Te:
        t = e._payload, e = e._init;
        try {
          return j(e(t));
        } catch {
        }
    }
    return null;
  }
  function W(e) {
    var t = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (t.displayName || "Context") + ".Consumer";
      case 10:
        return (t._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return t;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return j(t);
      case 8:
        return t === Qe ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof t == "function") return t.displayName || t.name || null;
        if (typeof t == "string") return t;
    }
    return null;
  }
  function A(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Z(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Ue(e) {
    var t = Z(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
    if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
      var l = n.get, u = n.set;
      return Object.defineProperty(e, t, { configurable: !0, get: function() {
        return l.call(this);
      }, set: function(o) {
        r = "" + o, u.call(this, o);
      } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
        return r;
      }, setValue: function(o) {
        r = "" + o;
      }, stopTracking: function() {
        e._valueTracker = null, delete e[t];
      } };
    }
  }
  function gr(e) {
    e._valueTracker || (e._valueTracker = Ue(e));
  }
  function No(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(), r = "";
    return e && (r = Z(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
  }
  function wr(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function zl(e, t) {
    var n = t.checked;
    return _({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
  }
  function zo(e, t) {
    var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
    n = A(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
  }
  function To(e, t) {
    t = t.checked, t != null && qe(e, "checked", t, !1);
  }
  function Tl(e, t) {
    To(e, t);
    var n = A(t.value), r = t.type;
    if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
    else if (r === "submit" || r === "reset") {
      e.removeAttribute("value");
      return;
    }
    t.hasOwnProperty("value") ? Ll(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ll(e, t.type, A(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
  }
  function Lo(e, t, n) {
    if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var r = t.type;
      if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
      t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
    }
    n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
  }
  function Ll(e, t, n) {
    (t !== "number" || wr(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
  }
  var On = Array.isArray;
  function on(e, t, n, r) {
    if (e = e.options, t) {
      t = {};
      for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
      for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + A(n), t = null, l = 0; l < e.length; l++) {
        if (e[l].value === n) {
          e[l].selected = !0, r && (e[l].defaultSelected = !0);
          return;
        }
        t !== null || e[l].disabled || (t = e[l]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Rl(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(m(91));
    return _({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
  }
  function Ro(e, t) {
    var n = t.value;
    if (n == null) {
      if (n = t.children, t = t.defaultValue, n != null) {
        if (t != null) throw Error(m(92));
        if (On(n)) {
          if (1 < n.length) throw Error(m(93));
          n = n[0];
        }
        t = n;
      }
      t == null && (t = ""), n = t;
    }
    e._wrapperState = { initialValue: A(n) };
  }
  function Oo(e, t) {
    var n = A(t.value), r = A(t.defaultValue);
    n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
  }
  function Do(e) {
    var t = e.textContent;
    t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
  }
  function Mo(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Ol(e, t) {
    return e == null || e === "http://www.w3.org/1999/xhtml" ? Mo(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
  }
  var Sr, Io = function(e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
      MSApp.execUnsafeLocalFunction(function() {
        return e(t, n, r, l);
      });
    } : e;
  }(function(e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
    else {
      for (Sr = Sr || document.createElement("div"), Sr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Sr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
  function Dn(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Mn = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, Ra = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Mn).forEach(function(e) {
    Ra.forEach(function(t) {
      t = t + e.charAt(0).toUpperCase() + e.substring(1), Mn[t] = Mn[e];
    });
  });
  function Fo(e, t, n) {
    return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Mn.hasOwnProperty(e) && Mn[e] ? ("" + t).trim() : t + "px";
  }
  function jo(e, t) {
    e = e.style;
    for (var n in t) if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0, l = Fo(n, t[n], r);
      n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
    }
  }
  var Oa = _({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Dl(e, t) {
    if (t) {
      if (Oa[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(m(137, e));
      if (t.dangerouslySetInnerHTML != null) {
        if (t.children != null) throw Error(m(60));
        if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(m(61));
      }
      if (t.style != null && typeof t.style != "object") throw Error(m(62));
    }
  }
  function Ml(e, t) {
    if (e.indexOf("-") === -1) return typeof t.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Il = null;
  function Fl(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var jl = null, sn = null, an = null;
  function Uo(e) {
    if (e = nr(e)) {
      if (typeof jl != "function") throw Error(m(280));
      var t = e.stateNode;
      t && (t = $r(t), jl(e.stateNode, e.type, t));
    }
  }
  function Ao(e) {
    sn ? an ? an.push(e) : an = [e] : sn = e;
  }
  function Vo() {
    if (sn) {
      var e = sn, t = an;
      if (an = sn = null, Uo(e), t) for (e = 0; e < t.length; e++) Uo(t[e]);
    }
  }
  function Bo(e, t) {
    return e(t);
  }
  function Ho() {
  }
  var Ul = !1;
  function $o(e, t, n) {
    if (Ul) return e(t, n);
    Ul = !0;
    try {
      return Bo(e, t, n);
    } finally {
      Ul = !1, (sn !== null || an !== null) && (Ho(), Vo());
    }
  }
  function In(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var r = $r(n);
    if (r === null) return null;
    n = r[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function") throw Error(m(231, t, typeof n));
    return n;
  }
  var Al = !1;
  if (ae) try {
    var Fn = {};
    Object.defineProperty(Fn, "passive", { get: function() {
      Al = !0;
    } }), window.addEventListener("test", Fn, Fn), window.removeEventListener("test", Fn, Fn);
  } catch {
    Al = !1;
  }
  function Da(e, t, n, r, l, u, o, i, s) {
    var p = Array.prototype.slice.call(arguments, 3);
    try {
      t.apply(n, p);
    } catch (y) {
      this.onError(y);
    }
  }
  var jn = !1, kr = null, Er = !1, Vl = null, Ma = { onError: function(e) {
    jn = !0, kr = e;
  } };
  function Ia(e, t, n, r, l, u, o, i, s) {
    jn = !1, kr = null, Da.apply(Ma, arguments);
  }
  function Fa(e, t, n, r, l, u, o, i, s) {
    if (Ia.apply(this, arguments), jn) {
      if (jn) {
        var p = kr;
        jn = !1, kr = null;
      } else throw Error(m(198));
      Er || (Er = !0, Vl = p);
    }
  }
  function Yt(e) {
    var t = e, n = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, t.flags & 4098 && (n = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function Wo(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function Qo(e) {
    if (Yt(e) !== e) throw Error(m(188));
  }
  function ja(e) {
    var t = e.alternate;
    if (!t) {
      if (t = Yt(e), t === null) throw Error(m(188));
      return t !== e ? null : e;
    }
    for (var n = e, r = t; ; ) {
      var l = n.return;
      if (l === null) break;
      var u = l.alternate;
      if (u === null) {
        if (r = l.return, r !== null) {
          n = r;
          continue;
        }
        break;
      }
      if (l.child === u.child) {
        for (u = l.child; u; ) {
          if (u === n) return Qo(l), e;
          if (u === r) return Qo(l), t;
          u = u.sibling;
        }
        throw Error(m(188));
      }
      if (n.return !== r.return) n = l, r = u;
      else {
        for (var o = !1, i = l.child; i; ) {
          if (i === n) {
            o = !0, n = l, r = u;
            break;
          }
          if (i === r) {
            o = !0, r = l, n = u;
            break;
          }
          i = i.sibling;
        }
        if (!o) {
          for (i = u.child; i; ) {
            if (i === n) {
              o = !0, n = u, r = l;
              break;
            }
            if (i === r) {
              o = !0, r = u, n = l;
              break;
            }
            i = i.sibling;
          }
          if (!o) throw Error(m(189));
        }
      }
      if (n.alternate !== r) throw Error(m(190));
    }
    if (n.tag !== 3) throw Error(m(188));
    return n.stateNode.current === n ? e : t;
  }
  function Ko(e) {
    return e = ja(e), e !== null ? Yo(e) : null;
  }
  function Yo(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var t = Yo(e);
      if (t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var Xo = te.unstable_scheduleCallback, Go = te.unstable_cancelCallback, Ua = te.unstable_shouldYield, Aa = te.unstable_requestPaint, le = te.unstable_now, Va = te.unstable_getCurrentPriorityLevel, Bl = te.unstable_ImmediatePriority, Zo = te.unstable_UserBlockingPriority, _r = te.unstable_NormalPriority, Ba = te.unstable_LowPriority, Jo = te.unstable_IdlePriority, Cr = null, ft = null;
  function Ha(e) {
    if (ft && typeof ft.onCommitFiberRoot == "function") try {
      ft.onCommitFiberRoot(Cr, e, void 0, (e.current.flags & 128) === 128);
    } catch {
    }
  }
  var tt = Math.clz32 ? Math.clz32 : Qa, $a = Math.log, Wa = Math.LN2;
  function Qa(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - ($a(e) / Wa | 0) | 0;
  }
  var xr = 64, Pr = 4194304;
  function Un(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function Nr(e, t) {
    var n = e.pendingLanes;
    if (n === 0) return 0;
    var r = 0, l = e.suspendedLanes, u = e.pingedLanes, o = n & 268435455;
    if (o !== 0) {
      var i = o & ~l;
      i !== 0 ? r = Un(i) : (u &= o, u !== 0 && (r = Un(u)));
    } else o = n & ~l, o !== 0 ? r = Un(o) : u !== 0 && (r = Un(u));
    if (r === 0) return 0;
    if (t !== 0 && t !== r && !(t & l) && (l = r & -r, u = t & -t, l >= u || l === 16 && (u & 4194240) !== 0)) return t;
    if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - tt(t), l = 1 << n, r |= e[n], t &= ~l;
    return r;
  }
  function Ka(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return t + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Ya(e, t) {
    for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, u = e.pendingLanes; 0 < u; ) {
      var o = 31 - tt(u), i = 1 << o, s = l[o];
      s === -1 ? (!(i & n) || i & r) && (l[o] = Ka(i, t)) : s <= t && (e.expiredLanes |= i), u &= ~i;
    }
  }
  function Hl(e) {
    return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
  }
  function qo() {
    var e = xr;
    return xr <<= 1, !(xr & 4194240) && (xr = 64), e;
  }
  function $l(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function An(e, t, n) {
    e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - tt(t), e[t] = n;
  }
  function Xa(e, t) {
    var n = e.pendingLanes & ~t;
    e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
    var r = e.eventTimes;
    for (e = e.expirationTimes; 0 < n; ) {
      var l = 31 - tt(n), u = 1 << l;
      t[l] = 0, r[l] = -1, e[l] = -1, n &= ~u;
    }
  }
  function Wl(e, t) {
    var n = e.entangledLanes |= t;
    for (e = e.entanglements; n; ) {
      var r = 31 - tt(n), l = 1 << r;
      l & t | e[r] & t && (e[r] |= t), n &= ~l;
    }
  }
  var V = 0;
  function bo(e) {
    return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
  }
  var ei, Ql, ti, ni, ri, Kl = !1, zr = [], Nt = null, zt = null, Tt = null, Vn = /* @__PURE__ */ new Map(), Bn = /* @__PURE__ */ new Map(), Lt = [], Ga = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function li(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Nt = null;
        break;
      case "dragenter":
      case "dragleave":
        zt = null;
        break;
      case "mouseover":
      case "mouseout":
        Tt = null;
        break;
      case "pointerover":
      case "pointerout":
        Vn.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Bn.delete(t.pointerId);
    }
  }
  function Hn(e, t, n, r, l, u) {
    return e === null || e.nativeEvent !== u ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: u, targetContainers: [l] }, t !== null && (t = nr(t), t !== null && Ql(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
  }
  function Za(e, t, n, r, l) {
    switch (t) {
      case "focusin":
        return Nt = Hn(Nt, e, t, n, r, l), !0;
      case "dragenter":
        return zt = Hn(zt, e, t, n, r, l), !0;
      case "mouseover":
        return Tt = Hn(Tt, e, t, n, r, l), !0;
      case "pointerover":
        var u = l.pointerId;
        return Vn.set(u, Hn(Vn.get(u) || null, e, t, n, r, l)), !0;
      case "gotpointercapture":
        return u = l.pointerId, Bn.set(u, Hn(Bn.get(u) || null, e, t, n, r, l)), !0;
    }
    return !1;
  }
  function ui(e) {
    var t = Xt(e.target);
    if (t !== null) {
      var n = Yt(t);
      if (n !== null) {
        if (t = n.tag, t === 13) {
          if (t = Wo(n), t !== null) {
            e.blockedOn = t, ri(e.priority, function() {
              ti(n);
            });
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Tr(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = Xl(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var r = new n.constructor(n.type, n);
        Il = r, n.target.dispatchEvent(r), Il = null;
      } else return t = nr(n), t !== null && Ql(t), e.blockedOn = n, !1;
      t.shift();
    }
    return !0;
  }
  function oi(e, t, n) {
    Tr(e) && n.delete(t);
  }
  function Ja() {
    Kl = !1, Nt !== null && Tr(Nt) && (Nt = null), zt !== null && Tr(zt) && (zt = null), Tt !== null && Tr(Tt) && (Tt = null), Vn.forEach(oi), Bn.forEach(oi);
  }
  function $n(e, t) {
    e.blockedOn === t && (e.blockedOn = null, Kl || (Kl = !0, te.unstable_scheduleCallback(te.unstable_NormalPriority, Ja)));
  }
  function Wn(e) {
    function t(l) {
      return $n(l, e);
    }
    if (0 < zr.length) {
      $n(zr[0], e);
      for (var n = 1; n < zr.length; n++) {
        var r = zr[n];
        r.blockedOn === e && (r.blockedOn = null);
      }
    }
    for (Nt !== null && $n(Nt, e), zt !== null && $n(zt, e), Tt !== null && $n(Tt, e), Vn.forEach(t), Bn.forEach(t), n = 0; n < Lt.length; n++) r = Lt[n], r.blockedOn === e && (r.blockedOn = null);
    for (; 0 < Lt.length && (n = Lt[0], n.blockedOn === null); ) ui(n), n.blockedOn === null && Lt.shift();
  }
  var cn = ye.ReactCurrentBatchConfig, Lr = !0;
  function qa(e, t, n, r) {
    var l = V, u = cn.transition;
    cn.transition = null;
    try {
      V = 1, Yl(e, t, n, r);
    } finally {
      V = l, cn.transition = u;
    }
  }
  function ba(e, t, n, r) {
    var l = V, u = cn.transition;
    cn.transition = null;
    try {
      V = 4, Yl(e, t, n, r);
    } finally {
      V = l, cn.transition = u;
    }
  }
  function Yl(e, t, n, r) {
    if (Lr) {
      var l = Xl(e, t, n, r);
      if (l === null) fu(e, t, r, Rr, n), li(e, r);
      else if (Za(l, e, t, n, r)) r.stopPropagation();
      else if (li(e, r), t & 4 && -1 < Ga.indexOf(e)) {
        for (; l !== null; ) {
          var u = nr(l);
          if (u !== null && ei(u), u = Xl(e, t, n, r), u === null && fu(e, t, r, Rr, n), u === l) break;
          l = u;
        }
        l !== null && r.stopPropagation();
      } else fu(e, t, r, null, n);
    }
  }
  var Rr = null;
  function Xl(e, t, n, r) {
    if (Rr = null, e = Fl(r), e = Xt(e), e !== null) if (t = Yt(e), t === null) e = null;
    else if (n = t.tag, n === 13) {
      if (e = Wo(t), e !== null) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
    return Rr = e, null;
  }
  function ii(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (Va()) {
          case Bl:
            return 1;
          case Zo:
            return 4;
          case _r:
          case Ba:
            return 16;
          case Jo:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Rt = null, Gl = null, Or = null;
  function si() {
    if (Or) return Or;
    var e, t = Gl, n = t.length, r, l = "value" in Rt ? Rt.value : Rt.textContent, u = l.length;
    for (e = 0; e < n && t[e] === l[e]; e++) ;
    var o = n - e;
    for (r = 1; r <= o && t[n - r] === l[u - r]; r++) ;
    return Or = l.slice(e, 1 < r ? 1 - r : void 0);
  }
  function Dr(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Mr() {
    return !0;
  }
  function ai() {
    return !1;
  }
  function Ae(e) {
    function t(n, r, l, u, o) {
      this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = u, this.target = o, this.currentTarget = null;
      for (var i in e) e.hasOwnProperty(i) && (n = e[i], this[i] = n ? n(u) : u[i]);
      return this.isDefaultPrevented = (u.defaultPrevented != null ? u.defaultPrevented : u.returnValue === !1) ? Mr : ai, this.isPropagationStopped = ai, this;
    }
    return _(t.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var n = this.nativeEvent;
      n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Mr);
    }, stopPropagation: function() {
      var n = this.nativeEvent;
      n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Mr);
    }, persist: function() {
    }, isPersistent: Mr }), t;
  }
  var fn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
    return e.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, Zl = Ae(fn), Qn = _({}, fn, { view: 0, detail: 0 }), ec = Ae(Qn), Jl, ql, Kn, Ir = _({}, Qn, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: eu, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Kn && (Kn && e.type === "mousemove" ? (Jl = e.screenX - Kn.screenX, ql = e.screenY - Kn.screenY) : ql = Jl = 0, Kn = e), Jl);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : ql;
  } }), ci = Ae(Ir), tc = _({}, Ir, { dataTransfer: 0 }), nc = Ae(tc), rc = _({}, Qn, { relatedTarget: 0 }), bl = Ae(rc), lc = _({}, fn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), uc = Ae(lc), oc = _({}, fn, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), ic = Ae(oc), sc = _({}, fn, { data: 0 }), fi = Ae(sc), ac = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, cc = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, fc = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function dc(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = fc[e]) ? !!t[e] : !1;
  }
  function eu() {
    return dc;
  }
  var pc = _({}, Qn, { key: function(e) {
    if (e.key) {
      var t = ac[e.key] || e.key;
      if (t !== "Unidentified") return t;
    }
    return e.type === "keypress" ? (e = Dr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? cc[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: eu, charCode: function(e) {
    return e.type === "keypress" ? Dr(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? Dr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), mc = Ae(pc), hc = _({}, Ir, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), di = Ae(hc), vc = _({}, Qn, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: eu }), yc = Ae(vc), gc = _({}, fn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), wc = Ae(gc), Sc = _({}, Ir, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), kc = Ae(Sc), Ec = [9, 13, 27, 32], tu = ae && "CompositionEvent" in window, Yn = null;
  ae && "documentMode" in document && (Yn = document.documentMode);
  var _c = ae && "TextEvent" in window && !Yn, pi = ae && (!tu || Yn && 8 < Yn && 11 >= Yn), mi = " ", hi = !1;
  function vi(e, t) {
    switch (e) {
      case "keyup":
        return Ec.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function yi(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var dn = !1;
  function Cc(e, t) {
    switch (e) {
      case "compositionend":
        return yi(t);
      case "keypress":
        return t.which !== 32 ? null : (hi = !0, mi);
      case "textInput":
        return e = t.data, e === mi && hi ? null : e;
      default:
        return null;
    }
  }
  function xc(e, t) {
    if (dn) return e === "compositionend" || !tu && vi(e, t) ? (e = si(), Or = Gl = Rt = null, dn = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return pi && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Pc = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function gi(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!Pc[e.type] : t === "textarea";
  }
  function wi(e, t, n, r) {
    Ao(r), t = Vr(t, "onChange"), 0 < t.length && (n = new Zl("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
  }
  var Xn = null, Gn = null;
  function Nc(e) {
    ji(e, 0);
  }
  function Fr(e) {
    var t = yn(e);
    if (No(t)) return e;
  }
  function zc(e, t) {
    if (e === "change") return t;
  }
  var Si = !1;
  if (ae) {
    var nu;
    if (ae) {
      var ru = "oninput" in document;
      if (!ru) {
        var ki = document.createElement("div");
        ki.setAttribute("oninput", "return;"), ru = typeof ki.oninput == "function";
      }
      nu = ru;
    } else nu = !1;
    Si = nu && (!document.documentMode || 9 < document.documentMode);
  }
  function Ei() {
    Xn && (Xn.detachEvent("onpropertychange", _i), Gn = Xn = null);
  }
  function _i(e) {
    if (e.propertyName === "value" && Fr(Gn)) {
      var t = [];
      wi(t, Gn, e, Fl(e)), $o(Nc, t);
    }
  }
  function Tc(e, t, n) {
    e === "focusin" ? (Ei(), Xn = t, Gn = n, Xn.attachEvent("onpropertychange", _i)) : e === "focusout" && Ei();
  }
  function Lc(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return Fr(Gn);
  }
  function Rc(e, t) {
    if (e === "click") return Fr(t);
  }
  function Oc(e, t) {
    if (e === "input" || e === "change") return Fr(t);
  }
  function Dc(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var nt = typeof Object.is == "function" ? Object.is : Dc;
  function Zn(e, t) {
    if (nt(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
    var n = Object.keys(e), r = Object.keys(t);
    if (n.length !== r.length) return !1;
    for (r = 0; r < n.length; r++) {
      var l = n[r];
      if (!B.call(t, l) || !nt(e[l], t[l])) return !1;
    }
    return !0;
  }
  function Ci(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function xi(e, t) {
    var n = Ci(e);
    e = 0;
    for (var r; n; ) {
      if (n.nodeType === 3) {
        if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
        e = r;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = Ci(n);
    }
  }
  function Pi(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Pi(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function Ni() {
    for (var e = window, t = wr(); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = wr(e.document);
    }
    return t;
  }
  function lu(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  function Mc(e) {
    var t = Ni(), n = e.focusedElem, r = e.selectionRange;
    if (t !== n && n && n.ownerDocument && Pi(n.ownerDocument.documentElement, n)) {
      if (r !== null && lu(n)) {
        if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
        else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var l = n.textContent.length, u = Math.min(r.start, l);
          r = r.end === void 0 ? u : Math.min(r.end, l), !e.extend && u > r && (l = r, r = u, u = l), l = xi(n, u);
          var o = xi(
            n,
            r
          );
          l && o && (e.rangeCount !== 1 || e.anchorNode !== l.node || e.anchorOffset !== l.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (t = t.createRange(), t.setStart(l.node, l.offset), e.removeAllRanges(), u > r ? (e.addRange(t), e.extend(o.node, o.offset)) : (t.setEnd(o.node, o.offset), e.addRange(t)));
        }
      }
      for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
    }
  }
  var Ic = ae && "documentMode" in document && 11 >= document.documentMode, pn = null, uu = null, Jn = null, ou = !1;
  function zi(e, t, n) {
    var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    ou || pn == null || pn !== wr(r) || (r = pn, "selectionStart" in r && lu(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Jn && Zn(Jn, r) || (Jn = r, r = Vr(uu, "onSelect"), 0 < r.length && (t = new Zl("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = pn)));
  }
  function jr(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var mn = { animationend: jr("Animation", "AnimationEnd"), animationiteration: jr("Animation", "AnimationIteration"), animationstart: jr("Animation", "AnimationStart"), transitionend: jr("Transition", "TransitionEnd") }, iu = {}, Ti = {};
  ae && (Ti = document.createElement("div").style, "AnimationEvent" in window || (delete mn.animationend.animation, delete mn.animationiteration.animation, delete mn.animationstart.animation), "TransitionEvent" in window || delete mn.transitionend.transition);
  function Ur(e) {
    if (iu[e]) return iu[e];
    if (!mn[e]) return e;
    var t = mn[e], n;
    for (n in t) if (t.hasOwnProperty(n) && n in Ti) return iu[e] = t[n];
    return e;
  }
  var Li = Ur("animationend"), Ri = Ur("animationiteration"), Oi = Ur("animationstart"), Di = Ur("transitionend"), Mi = /* @__PURE__ */ new Map(), Ii = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Ot(e, t) {
    Mi.set(e, t), Fe(t, [e]);
  }
  for (var su = 0; su < Ii.length; su++) {
    var au = Ii[su], Fc = au.toLowerCase(), jc = au[0].toUpperCase() + au.slice(1);
    Ot(Fc, "on" + jc);
  }
  Ot(Li, "onAnimationEnd"), Ot(Ri, "onAnimationIteration"), Ot(Oi, "onAnimationStart"), Ot("dblclick", "onDoubleClick"), Ot("focusin", "onFocus"), Ot("focusout", "onBlur"), Ot(Di, "onTransitionEnd"), Ne("onMouseEnter", ["mouseout", "mouseover"]), Ne("onMouseLeave", ["mouseout", "mouseover"]), Ne("onPointerEnter", ["pointerout", "pointerover"]), Ne("onPointerLeave", ["pointerout", "pointerover"]), Fe("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Fe("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Fe("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), Fe("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Fe("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Fe("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var qn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Uc = new Set("cancel close invalid load scroll toggle".split(" ").concat(qn));
  function Fi(e, t, n) {
    var r = e.type || "unknown-event";
    e.currentTarget = n, Fa(r, t, void 0, e), e.currentTarget = null;
  }
  function ji(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var r = e[n], l = r.event;
      r = r.listeners;
      e: {
        var u = void 0;
        if (t) for (var o = r.length - 1; 0 <= o; o--) {
          var i = r[o], s = i.instance, p = i.currentTarget;
          if (i = i.listener, s !== u && l.isPropagationStopped()) break e;
          Fi(l, i, p), u = s;
        }
        else for (o = 0; o < r.length; o++) {
          if (i = r[o], s = i.instance, p = i.currentTarget, i = i.listener, s !== u && l.isPropagationStopped()) break e;
          Fi(l, i, p), u = s;
        }
      }
    }
    if (Er) throw e = Vl, Er = !1, Vl = null, e;
  }
  function K(e, t) {
    var n = t[yu];
    n === void 0 && (n = t[yu] = /* @__PURE__ */ new Set());
    var r = e + "__bubble";
    n.has(r) || (Ui(t, e, 2, !1), n.add(r));
  }
  function cu(e, t, n) {
    var r = 0;
    t && (r |= 4), Ui(n, e, r, t);
  }
  var Ar = "_reactListening" + Math.random().toString(36).slice(2);
  function bn(e) {
    if (!e[Ar]) {
      e[Ar] = !0, pe.forEach(function(n) {
        n !== "selectionchange" && (Uc.has(n) || cu(n, !1, e), cu(n, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Ar] || (t[Ar] = !0, cu("selectionchange", !1, t));
    }
  }
  function Ui(e, t, n, r) {
    switch (ii(t)) {
      case 1:
        var l = qa;
        break;
      case 4:
        l = ba;
        break;
      default:
        l = Yl;
    }
    n = l.bind(null, t, n, e), l = void 0, !Al || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
  }
  function fu(e, t, n, r, l) {
    var u = r;
    if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
      if (r === null) return;
      var o = r.tag;
      if (o === 3 || o === 4) {
        var i = r.stateNode.containerInfo;
        if (i === l || i.nodeType === 8 && i.parentNode === l) break;
        if (o === 4) for (o = r.return; o !== null; ) {
          var s = o.tag;
          if ((s === 3 || s === 4) && (s = o.stateNode.containerInfo, s === l || s.nodeType === 8 && s.parentNode === l)) return;
          o = o.return;
        }
        for (; i !== null; ) {
          if (o = Xt(i), o === null) return;
          if (s = o.tag, s === 5 || s === 6) {
            r = u = o;
            continue e;
          }
          i = i.parentNode;
        }
      }
      r = r.return;
    }
    $o(function() {
      var p = u, y = Fl(n), g = [];
      e: {
        var h = Mi.get(e);
        if (h !== void 0) {
          var k = Zl, C = e;
          switch (e) {
            case "keypress":
              if (Dr(n) === 0) break e;
            case "keydown":
            case "keyup":
              k = mc;
              break;
            case "focusin":
              C = "focus", k = bl;
              break;
            case "focusout":
              C = "blur", k = bl;
              break;
            case "beforeblur":
            case "afterblur":
              k = bl;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              k = ci;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              k = nc;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              k = yc;
              break;
            case Li:
            case Ri:
            case Oi:
              k = uc;
              break;
            case Di:
              k = wc;
              break;
            case "scroll":
              k = ec;
              break;
            case "wheel":
              k = kc;
              break;
            case "copy":
            case "cut":
            case "paste":
              k = ic;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              k = di;
          }
          var x = (t & 4) !== 0, ue = !x && e === "scroll", f = x ? h !== null ? h + "Capture" : null : h;
          x = [];
          for (var a = p, d; a !== null; ) {
            d = a;
            var w = d.stateNode;
            if (d.tag === 5 && w !== null && (d = w, f !== null && (w = In(a, f), w != null && x.push(er(a, w, d)))), ue) break;
            a = a.return;
          }
          0 < x.length && (h = new k(h, C, null, n, y), g.push({ event: h, listeners: x }));
        }
      }
      if (!(t & 7)) {
        e: {
          if (h = e === "mouseover" || e === "pointerover", k = e === "mouseout" || e === "pointerout", h && n !== Il && (C = n.relatedTarget || n.fromElement) && (Xt(C) || C[gt])) break e;
          if ((k || h) && (h = y.window === y ? y : (h = y.ownerDocument) ? h.defaultView || h.parentWindow : window, k ? (C = n.relatedTarget || n.toElement, k = p, C = C ? Xt(C) : null, C !== null && (ue = Yt(C), C !== ue || C.tag !== 5 && C.tag !== 6) && (C = null)) : (k = null, C = p), k !== C)) {
            if (x = ci, w = "onMouseLeave", f = "onMouseEnter", a = "mouse", (e === "pointerout" || e === "pointerover") && (x = di, w = "onPointerLeave", f = "onPointerEnter", a = "pointer"), ue = k == null ? h : yn(k), d = C == null ? h : yn(C), h = new x(w, a + "leave", k, n, y), h.target = ue, h.relatedTarget = d, w = null, Xt(y) === p && (x = new x(f, a + "enter", C, n, y), x.target = d, x.relatedTarget = ue, w = x), ue = w, k && C) t: {
              for (x = k, f = C, a = 0, d = x; d; d = hn(d)) a++;
              for (d = 0, w = f; w; w = hn(w)) d++;
              for (; 0 < a - d; ) x = hn(x), a--;
              for (; 0 < d - a; ) f = hn(f), d--;
              for (; a--; ) {
                if (x === f || f !== null && x === f.alternate) break t;
                x = hn(x), f = hn(f);
              }
              x = null;
            }
            else x = null;
            k !== null && Ai(g, h, k, x, !1), C !== null && ue !== null && Ai(g, ue, C, x, !0);
          }
        }
        e: {
          if (h = p ? yn(p) : window, k = h.nodeName && h.nodeName.toLowerCase(), k === "select" || k === "input" && h.type === "file") var P = zc;
          else if (gi(h)) if (Si) P = Oc;
          else {
            P = Lc;
            var N = Tc;
          }
          else (k = h.nodeName) && k.toLowerCase() === "input" && (h.type === "checkbox" || h.type === "radio") && (P = Rc);
          if (P && (P = P(e, p))) {
            wi(g, P, n, y);
            break e;
          }
          N && N(e, h, p), e === "focusout" && (N = h._wrapperState) && N.controlled && h.type === "number" && Ll(h, "number", h.value);
        }
        switch (N = p ? yn(p) : window, e) {
          case "focusin":
            (gi(N) || N.contentEditable === "true") && (pn = N, uu = p, Jn = null);
            break;
          case "focusout":
            Jn = uu = pn = null;
            break;
          case "mousedown":
            ou = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ou = !1, zi(g, n, y);
            break;
          case "selectionchange":
            if (Ic) break;
          case "keydown":
          case "keyup":
            zi(g, n, y);
        }
        var z;
        if (tu) e: {
          switch (e) {
            case "compositionstart":
              var R = "onCompositionStart";
              break e;
            case "compositionend":
              R = "onCompositionEnd";
              break e;
            case "compositionupdate":
              R = "onCompositionUpdate";
              break e;
          }
          R = void 0;
        }
        else dn ? vi(e, n) && (R = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (R = "onCompositionStart");
        R && (pi && n.locale !== "ko" && (dn || R !== "onCompositionStart" ? R === "onCompositionEnd" && dn && (z = si()) : (Rt = y, Gl = "value" in Rt ? Rt.value : Rt.textContent, dn = !0)), N = Vr(p, R), 0 < N.length && (R = new fi(R, e, null, n, y), g.push({ event: R, listeners: N }), z ? R.data = z : (z = yi(n), z !== null && (R.data = z)))), (z = _c ? Cc(e, n) : xc(e, n)) && (p = Vr(p, "onBeforeInput"), 0 < p.length && (y = new fi("onBeforeInput", "beforeinput", null, n, y), g.push({ event: y, listeners: p }), y.data = z));
      }
      ji(g, t);
    });
  }
  function er(e, t, n) {
    return { instance: e, listener: t, currentTarget: n };
  }
  function Vr(e, t) {
    for (var n = t + "Capture", r = []; e !== null; ) {
      var l = e, u = l.stateNode;
      l.tag === 5 && u !== null && (l = u, u = In(e, n), u != null && r.unshift(er(e, u, l)), u = In(e, t), u != null && r.push(er(e, u, l))), e = e.return;
    }
    return r;
  }
  function hn(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function Ai(e, t, n, r, l) {
    for (var u = t._reactName, o = []; n !== null && n !== r; ) {
      var i = n, s = i.alternate, p = i.stateNode;
      if (s !== null && s === r) break;
      i.tag === 5 && p !== null && (i = p, l ? (s = In(n, u), s != null && o.unshift(er(n, s, i))) : l || (s = In(n, u), s != null && o.push(er(n, s, i)))), n = n.return;
    }
    o.length !== 0 && e.push({ event: t, listeners: o });
  }
  var Ac = /\r\n?/g, Vc = /\u0000|\uFFFD/g;
  function Vi(e) {
    return (typeof e == "string" ? e : "" + e).replace(Ac, `
`).replace(Vc, "");
  }
  function Br(e, t, n) {
    if (t = Vi(t), Vi(e) !== t && n) throw Error(m(425));
  }
  function Hr() {
  }
  var du = null, pu = null;
  function mu(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var hu = typeof setTimeout == "function" ? setTimeout : void 0, Bc = typeof clearTimeout == "function" ? clearTimeout : void 0, Bi = typeof Promise == "function" ? Promise : void 0, Hc = typeof queueMicrotask == "function" ? queueMicrotask : typeof Bi < "u" ? function(e) {
    return Bi.resolve(null).then(e).catch($c);
  } : hu;
  function $c(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function vu(e, t) {
    var n = t, r = 0;
    do {
      var l = n.nextSibling;
      if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
        if (r === 0) {
          e.removeChild(l), Wn(t);
          return;
        }
        r--;
      } else n !== "$" && n !== "$?" && n !== "$!" || r++;
      n = l;
    } while (n);
    Wn(t);
  }
  function Dt(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
        if (t === "/$") return null;
      }
    }
    return e;
  }
  function Hi(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?") {
          if (t === 0) return e;
          t--;
        } else n === "/$" && t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var vn = Math.random().toString(36).slice(2), dt = "__reactFiber$" + vn, tr = "__reactProps$" + vn, gt = "__reactContainer$" + vn, yu = "__reactEvents$" + vn, Wc = "__reactListeners$" + vn, Qc = "__reactHandles$" + vn;
  function Xt(e) {
    var t = e[dt];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if (t = n[gt] || n[dt]) {
        if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Hi(e); e !== null; ) {
          if (n = e[dt]) return n;
          e = Hi(e);
        }
        return t;
      }
      e = n, n = e.parentNode;
    }
    return null;
  }
  function nr(e) {
    return e = e[dt] || e[gt], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function yn(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(m(33));
  }
  function $r(e) {
    return e[tr] || null;
  }
  var gu = [], gn = -1;
  function Mt(e) {
    return { current: e };
  }
  function Y(e) {
    0 > gn || (e.current = gu[gn], gu[gn] = null, gn--);
  }
  function Q(e, t) {
    gn++, gu[gn] = e.current, e.current = t;
  }
  var It = {}, ge = Mt(It), Le = Mt(!1), Gt = It;
  function wn(e, t) {
    var n = e.type.contextTypes;
    if (!n) return It;
    var r = e.stateNode;
    if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
    var l = {}, u;
    for (u in n) l[u] = t[u];
    return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
  }
  function Re(e) {
    return e = e.childContextTypes, e != null;
  }
  function Wr() {
    Y(Le), Y(ge);
  }
  function $i(e, t, n) {
    if (ge.current !== It) throw Error(m(168));
    Q(ge, t), Q(Le, n);
  }
  function Wi(e, t, n) {
    var r = e.stateNode;
    if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
    r = r.getChildContext();
    for (var l in r) if (!(l in t)) throw Error(m(108, W(e) || "Unknown", l));
    return _({}, n, r);
  }
  function Qr(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || It, Gt = ge.current, Q(ge, e), Q(Le, Le.current), !0;
  }
  function Qi(e, t, n) {
    var r = e.stateNode;
    if (!r) throw Error(m(169));
    n ? (e = Wi(e, t, Gt), r.__reactInternalMemoizedMergedChildContext = e, Y(Le), Y(ge), Q(ge, e)) : Y(Le), Q(Le, n);
  }
  var wt = null, Kr = !1, wu = !1;
  function Ki(e) {
    wt === null ? wt = [e] : wt.push(e);
  }
  function Kc(e) {
    Kr = !0, Ki(e);
  }
  function Ft() {
    if (!wu && wt !== null) {
      wu = !0;
      var e = 0, t = V;
      try {
        var n = wt;
        for (V = 1; e < n.length; e++) {
          var r = n[e];
          do
            r = r(!0);
          while (r !== null);
        }
        wt = null, Kr = !1;
      } catch (l) {
        throw wt !== null && (wt = wt.slice(e + 1)), Xo(Bl, Ft), l;
      } finally {
        V = t, wu = !1;
      }
    }
    return null;
  }
  var Sn = [], kn = 0, Yr = null, Xr = 0, Ke = [], Ye = 0, Zt = null, St = 1, kt = "";
  function Jt(e, t) {
    Sn[kn++] = Xr, Sn[kn++] = Yr, Yr = e, Xr = t;
  }
  function Yi(e, t, n) {
    Ke[Ye++] = St, Ke[Ye++] = kt, Ke[Ye++] = Zt, Zt = e;
    var r = St;
    e = kt;
    var l = 32 - tt(r) - 1;
    r &= ~(1 << l), n += 1;
    var u = 32 - tt(t) + l;
    if (30 < u) {
      var o = l - l % 5;
      u = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, St = 1 << 32 - tt(t) + l | n << l | r, kt = u + e;
    } else St = 1 << u | n << l | r, kt = e;
  }
  function Su(e) {
    e.return !== null && (Jt(e, 1), Yi(e, 1, 0));
  }
  function ku(e) {
    for (; e === Yr; ) Yr = Sn[--kn], Sn[kn] = null, Xr = Sn[--kn], Sn[kn] = null;
    for (; e === Zt; ) Zt = Ke[--Ye], Ke[Ye] = null, kt = Ke[--Ye], Ke[Ye] = null, St = Ke[--Ye], Ke[Ye] = null;
  }
  var Ve = null, Be = null, J = !1, rt = null;
  function Xi(e, t) {
    var n = Je(5, null, null, 0);
    n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
  }
  function Gi(e, t) {
    switch (e.tag) {
      case 5:
        var n = e.type;
        return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Ve = e, Be = Dt(t.firstChild), !0) : !1;
      case 6:
        return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Ve = e, Be = null, !0) : !1;
      case 13:
        return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Zt !== null ? { id: St, overflow: kt } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Je(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Ve = e, Be = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Eu(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function _u(e) {
    if (J) {
      var t = Be;
      if (t) {
        var n = t;
        if (!Gi(e, t)) {
          if (Eu(e)) throw Error(m(418));
          t = Dt(n.nextSibling);
          var r = Ve;
          t && Gi(e, t) ? Xi(r, n) : (e.flags = e.flags & -4097 | 2, J = !1, Ve = e);
        }
      } else {
        if (Eu(e)) throw Error(m(418));
        e.flags = e.flags & -4097 | 2, J = !1, Ve = e;
      }
    }
  }
  function Zi(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    Ve = e;
  }
  function Gr(e) {
    if (e !== Ve) return !1;
    if (!J) return Zi(e), J = !0, !1;
    var t;
    if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !mu(e.type, e.memoizedProps)), t && (t = Be)) {
      if (Eu(e)) throw Ji(), Error(m(418));
      for (; t; ) Xi(e, t), t = Dt(t.nextSibling);
    }
    if (Zi(e), e.tag === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(m(317));
      e: {
        for (e = e.nextSibling, t = 0; e; ) {
          if (e.nodeType === 8) {
            var n = e.data;
            if (n === "/$") {
              if (t === 0) {
                Be = Dt(e.nextSibling);
                break e;
              }
              t--;
            } else n !== "$" && n !== "$!" && n !== "$?" || t++;
          }
          e = e.nextSibling;
        }
        Be = null;
      }
    } else Be = Ve ? Dt(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Ji() {
    for (var e = Be; e; ) e = Dt(e.nextSibling);
  }
  function En() {
    Be = Ve = null, J = !1;
  }
  function Cu(e) {
    rt === null ? rt = [e] : rt.push(e);
  }
  var Yc = ye.ReactCurrentBatchConfig;
  function rr(e, t, n) {
    if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
      if (n._owner) {
        if (n = n._owner, n) {
          if (n.tag !== 1) throw Error(m(309));
          var r = n.stateNode;
        }
        if (!r) throw Error(m(147, e));
        var l = r, u = "" + e;
        return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === u ? t.ref : (t = function(o) {
          var i = l.refs;
          o === null ? delete i[u] : i[u] = o;
        }, t._stringRef = u, t);
      }
      if (typeof e != "string") throw Error(m(284));
      if (!n._owner) throw Error(m(290, e));
    }
    return e;
  }
  function Zr(e, t) {
    throw e = Object.prototype.toString.call(t), Error(m(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
  }
  function qi(e) {
    var t = e._init;
    return t(e._payload);
  }
  function bi(e) {
    function t(f, a) {
      if (e) {
        var d = f.deletions;
        d === null ? (f.deletions = [a], f.flags |= 16) : d.push(a);
      }
    }
    function n(f, a) {
      if (!e) return null;
      for (; a !== null; ) t(f, a), a = a.sibling;
      return null;
    }
    function r(f, a) {
      for (f = /* @__PURE__ */ new Map(); a !== null; ) a.key !== null ? f.set(a.key, a) : f.set(a.index, a), a = a.sibling;
      return f;
    }
    function l(f, a) {
      return f = Wt(f, a), f.index = 0, f.sibling = null, f;
    }
    function u(f, a, d) {
      return f.index = d, e ? (d = f.alternate, d !== null ? (d = d.index, d < a ? (f.flags |= 2, a) : d) : (f.flags |= 2, a)) : (f.flags |= 1048576, a);
    }
    function o(f) {
      return e && f.alternate === null && (f.flags |= 2), f;
    }
    function i(f, a, d, w) {
      return a === null || a.tag !== 6 ? (a = vo(d, f.mode, w), a.return = f, a) : (a = l(a, d), a.return = f, a);
    }
    function s(f, a, d, w) {
      var P = d.type;
      return P === ze ? y(f, a, d.props.children, w, d.key) : a !== null && (a.elementType === P || typeof P == "object" && P !== null && P.$$typeof === Te && qi(P) === a.type) ? (w = l(a, d.props), w.ref = rr(f, a, d), w.return = f, w) : (w = Sl(d.type, d.key, d.props, null, f.mode, w), w.ref = rr(f, a, d), w.return = f, w);
    }
    function p(f, a, d, w) {
      return a === null || a.tag !== 4 || a.stateNode.containerInfo !== d.containerInfo || a.stateNode.implementation !== d.implementation ? (a = yo(d, f.mode, w), a.return = f, a) : (a = l(a, d.children || []), a.return = f, a);
    }
    function y(f, a, d, w, P) {
      return a === null || a.tag !== 7 ? (a = un(d, f.mode, w, P), a.return = f, a) : (a = l(a, d), a.return = f, a);
    }
    function g(f, a, d) {
      if (typeof a == "string" && a !== "" || typeof a == "number") return a = vo("" + a, f.mode, d), a.return = f, a;
      if (typeof a == "object" && a !== null) {
        switch (a.$$typeof) {
          case be:
            return d = Sl(a.type, a.key, a.props, null, f.mode, d), d.ref = rr(f, null, a), d.return = f, d;
          case _e:
            return a = yo(a, f.mode, d), a.return = f, a;
          case Te:
            var w = a._init;
            return g(f, w(a._payload), d);
        }
        if (On(a) || T(a)) return a = un(a, f.mode, d, null), a.return = f, a;
        Zr(f, a);
      }
      return null;
    }
    function h(f, a, d, w) {
      var P = a !== null ? a.key : null;
      if (typeof d == "string" && d !== "" || typeof d == "number") return P !== null ? null : i(f, a, "" + d, w);
      if (typeof d == "object" && d !== null) {
        switch (d.$$typeof) {
          case be:
            return d.key === P ? s(f, a, d, w) : null;
          case _e:
            return d.key === P ? p(f, a, d, w) : null;
          case Te:
            return P = d._init, h(
              f,
              a,
              P(d._payload),
              w
            );
        }
        if (On(d) || T(d)) return P !== null ? null : y(f, a, d, w, null);
        Zr(f, d);
      }
      return null;
    }
    function k(f, a, d, w, P) {
      if (typeof w == "string" && w !== "" || typeof w == "number") return f = f.get(d) || null, i(a, f, "" + w, P);
      if (typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
          case be:
            return f = f.get(w.key === null ? d : w.key) || null, s(a, f, w, P);
          case _e:
            return f = f.get(w.key === null ? d : w.key) || null, p(a, f, w, P);
          case Te:
            var N = w._init;
            return k(f, a, d, N(w._payload), P);
        }
        if (On(w) || T(w)) return f = f.get(d) || null, y(a, f, w, P, null);
        Zr(a, w);
      }
      return null;
    }
    function C(f, a, d, w) {
      for (var P = null, N = null, z = a, R = a = 0, de = null; z !== null && R < d.length; R++) {
        z.index > R ? (de = z, z = null) : de = z.sibling;
        var U = h(f, z, d[R], w);
        if (U === null) {
          z === null && (z = de);
          break;
        }
        e && z && U.alternate === null && t(f, z), a = u(U, a, R), N === null ? P = U : N.sibling = U, N = U, z = de;
      }
      if (R === d.length) return n(f, z), J && Jt(f, R), P;
      if (z === null) {
        for (; R < d.length; R++) z = g(f, d[R], w), z !== null && (a = u(z, a, R), N === null ? P = z : N.sibling = z, N = z);
        return J && Jt(f, R), P;
      }
      for (z = r(f, z); R < d.length; R++) de = k(z, f, R, d[R], w), de !== null && (e && de.alternate !== null && z.delete(de.key === null ? R : de.key), a = u(de, a, R), N === null ? P = de : N.sibling = de, N = de);
      return e && z.forEach(function(Qt) {
        return t(f, Qt);
      }), J && Jt(f, R), P;
    }
    function x(f, a, d, w) {
      var P = T(d);
      if (typeof P != "function") throw Error(m(150));
      if (d = P.call(d), d == null) throw Error(m(151));
      for (var N = P = null, z = a, R = a = 0, de = null, U = d.next(); z !== null && !U.done; R++, U = d.next()) {
        z.index > R ? (de = z, z = null) : de = z.sibling;
        var Qt = h(f, z, U.value, w);
        if (Qt === null) {
          z === null && (z = de);
          break;
        }
        e && z && Qt.alternate === null && t(f, z), a = u(Qt, a, R), N === null ? P = Qt : N.sibling = Qt, N = Qt, z = de;
      }
      if (U.done) return n(
        f,
        z
      ), J && Jt(f, R), P;
      if (z === null) {
        for (; !U.done; R++, U = d.next()) U = g(f, U.value, w), U !== null && (a = u(U, a, R), N === null ? P = U : N.sibling = U, N = U);
        return J && Jt(f, R), P;
      }
      for (z = r(f, z); !U.done; R++, U = d.next()) U = k(z, f, R, U.value, w), U !== null && (e && U.alternate !== null && z.delete(U.key === null ? R : U.key), a = u(U, a, R), N === null ? P = U : N.sibling = U, N = U);
      return e && z.forEach(function(Nf) {
        return t(f, Nf);
      }), J && Jt(f, R), P;
    }
    function ue(f, a, d, w) {
      if (typeof d == "object" && d !== null && d.type === ze && d.key === null && (d = d.props.children), typeof d == "object" && d !== null) {
        switch (d.$$typeof) {
          case be:
            e: {
              for (var P = d.key, N = a; N !== null; ) {
                if (N.key === P) {
                  if (P = d.type, P === ze) {
                    if (N.tag === 7) {
                      n(f, N.sibling), a = l(N, d.props.children), a.return = f, f = a;
                      break e;
                    }
                  } else if (N.elementType === P || typeof P == "object" && P !== null && P.$$typeof === Te && qi(P) === N.type) {
                    n(f, N.sibling), a = l(N, d.props), a.ref = rr(f, N, d), a.return = f, f = a;
                    break e;
                  }
                  n(f, N);
                  break;
                } else t(f, N);
                N = N.sibling;
              }
              d.type === ze ? (a = un(d.props.children, f.mode, w, d.key), a.return = f, f = a) : (w = Sl(d.type, d.key, d.props, null, f.mode, w), w.ref = rr(f, a, d), w.return = f, f = w);
            }
            return o(f);
          case _e:
            e: {
              for (N = d.key; a !== null; ) {
                if (a.key === N) if (a.tag === 4 && a.stateNode.containerInfo === d.containerInfo && a.stateNode.implementation === d.implementation) {
                  n(f, a.sibling), a = l(a, d.children || []), a.return = f, f = a;
                  break e;
                } else {
                  n(f, a);
                  break;
                }
                else t(f, a);
                a = a.sibling;
              }
              a = yo(d, f.mode, w), a.return = f, f = a;
            }
            return o(f);
          case Te:
            return N = d._init, ue(f, a, N(d._payload), w);
        }
        if (On(d)) return C(f, a, d, w);
        if (T(d)) return x(f, a, d, w);
        Zr(f, d);
      }
      return typeof d == "string" && d !== "" || typeof d == "number" ? (d = "" + d, a !== null && a.tag === 6 ? (n(f, a.sibling), a = l(a, d), a.return = f, f = a) : (n(f, a), a = vo(d, f.mode, w), a.return = f, f = a), o(f)) : n(f, a);
    }
    return ue;
  }
  var _n = bi(!0), es = bi(!1), Jr = Mt(null), qr = null, Cn = null, xu = null;
  function Pu() {
    xu = Cn = qr = null;
  }
  function Nu(e) {
    var t = Jr.current;
    Y(Jr), e._currentValue = t;
  }
  function zu(e, t, n) {
    for (; e !== null; ) {
      var r = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
      e = e.return;
    }
  }
  function xn(e, t) {
    qr = e, xu = Cn = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (Oe = !0), e.firstContext = null);
  }
  function Xe(e) {
    var t = e._currentValue;
    if (xu !== e) if (e = { context: e, memoizedValue: t, next: null }, Cn === null) {
      if (qr === null) throw Error(m(308));
      Cn = e, qr.dependencies = { lanes: 0, firstContext: e };
    } else Cn = Cn.next = e;
    return t;
  }
  var qt = null;
  function Tu(e) {
    qt === null ? qt = [e] : qt.push(e);
  }
  function ts(e, t, n, r) {
    var l = t.interleaved;
    return l === null ? (n.next = n, Tu(t)) : (n.next = l.next, l.next = n), t.interleaved = n, Et(e, r);
  }
  function Et(e, t) {
    e.lanes |= t;
    var n = e.alternate;
    for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
    return n.tag === 3 ? n.stateNode : null;
  }
  var jt = !1;
  function Lu(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function ns(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
  }
  function _t(e, t) {
    return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
  }
  function Ut(e, t, n) {
    var r = e.updateQueue;
    if (r === null) return null;
    if (r = r.shared, I & 2) {
      var l = r.pending;
      return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, Et(e, n);
    }
    return l = r.interleaved, l === null ? (t.next = t, Tu(r)) : (t.next = l.next, l.next = t), r.interleaved = t, Et(e, n);
  }
  function br(e, t, n) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
      var r = t.lanes;
      r &= e.pendingLanes, n |= r, t.lanes = n, Wl(e, n);
    }
  }
  function rs(e, t) {
    var n = e.updateQueue, r = e.alternate;
    if (r !== null && (r = r.updateQueue, n === r)) {
      var l = null, u = null;
      if (n = n.firstBaseUpdate, n !== null) {
        do {
          var o = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
          u === null ? l = u = o : u = u.next = o, n = n.next;
        } while (n !== null);
        u === null ? l = u = t : u = u.next = t;
      } else l = u = t;
      n = { baseState: r.baseState, firstBaseUpdate: l, lastBaseUpdate: u, shared: r.shared, effects: r.effects }, e.updateQueue = n;
      return;
    }
    e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
  }
  function el(e, t, n, r) {
    var l = e.updateQueue;
    jt = !1;
    var u = l.firstBaseUpdate, o = l.lastBaseUpdate, i = l.shared.pending;
    if (i !== null) {
      l.shared.pending = null;
      var s = i, p = s.next;
      s.next = null, o === null ? u = p : o.next = p, o = s;
      var y = e.alternate;
      y !== null && (y = y.updateQueue, i = y.lastBaseUpdate, i !== o && (i === null ? y.firstBaseUpdate = p : i.next = p, y.lastBaseUpdate = s));
    }
    if (u !== null) {
      var g = l.baseState;
      o = 0, y = p = s = null, i = u;
      do {
        var h = i.lane, k = i.eventTime;
        if ((r & h) === h) {
          y !== null && (y = y.next = {
            eventTime: k,
            lane: 0,
            tag: i.tag,
            payload: i.payload,
            callback: i.callback,
            next: null
          });
          e: {
            var C = e, x = i;
            switch (h = t, k = n, x.tag) {
              case 1:
                if (C = x.payload, typeof C == "function") {
                  g = C.call(k, g, h);
                  break e;
                }
                g = C;
                break e;
              case 3:
                C.flags = C.flags & -65537 | 128;
              case 0:
                if (C = x.payload, h = typeof C == "function" ? C.call(k, g, h) : C, h == null) break e;
                g = _({}, g, h);
                break e;
              case 2:
                jt = !0;
            }
          }
          i.callback !== null && i.lane !== 0 && (e.flags |= 64, h = l.effects, h === null ? l.effects = [i] : h.push(i));
        } else k = { eventTime: k, lane: h, tag: i.tag, payload: i.payload, callback: i.callback, next: null }, y === null ? (p = y = k, s = g) : y = y.next = k, o |= h;
        if (i = i.next, i === null) {
          if (i = l.shared.pending, i === null) break;
          h = i, i = h.next, h.next = null, l.lastBaseUpdate = h, l.shared.pending = null;
        }
      } while (!0);
      if (y === null && (s = g), l.baseState = s, l.firstBaseUpdate = p, l.lastBaseUpdate = y, t = l.shared.interleaved, t !== null) {
        l = t;
        do
          o |= l.lane, l = l.next;
        while (l !== t);
      } else u === null && (l.shared.lanes = 0);
      tn |= o, e.lanes = o, e.memoizedState = g;
    }
  }
  function ls(e, t, n) {
    if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
      var r = e[t], l = r.callback;
      if (l !== null) {
        if (r.callback = null, r = n, typeof l != "function") throw Error(m(191, l));
        l.call(r);
      }
    }
  }
  var lr = {}, pt = Mt(lr), ur = Mt(lr), or = Mt(lr);
  function bt(e) {
    if (e === lr) throw Error(m(174));
    return e;
  }
  function Ru(e, t) {
    switch (Q(or, t), Q(ur, e), Q(pt, lr), e = t.nodeType, e) {
      case 9:
      case 11:
        t = (t = t.documentElement) ? t.namespaceURI : Ol(null, "");
        break;
      default:
        e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ol(t, e);
    }
    Y(pt), Q(pt, t);
  }
  function Pn() {
    Y(pt), Y(ur), Y(or);
  }
  function us(e) {
    bt(or.current);
    var t = bt(pt.current), n = Ol(t, e.type);
    t !== n && (Q(ur, e), Q(pt, n));
  }
  function Ou(e) {
    ur.current === e && (Y(pt), Y(ur));
  }
  var b = Mt(0);
  function tl(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if (t.flags & 128) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Du = [];
  function Mu() {
    for (var e = 0; e < Du.length; e++) Du[e]._workInProgressVersionPrimary = null;
    Du.length = 0;
  }
  var nl = ye.ReactCurrentDispatcher, Iu = ye.ReactCurrentBatchConfig, en = 0, ee = null, ie = null, ce = null, rl = !1, ir = !1, sr = 0, Xc = 0;
  function we() {
    throw Error(m(321));
  }
  function Fu(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++) if (!nt(e[n], t[n])) return !1;
    return !0;
  }
  function ju(e, t, n, r, l, u) {
    if (en = u, ee = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, nl.current = e === null || e.memoizedState === null ? qc : bc, e = n(r, l), ir) {
      u = 0;
      do {
        if (ir = !1, sr = 0, 25 <= u) throw Error(m(301));
        u += 1, ce = ie = null, t.updateQueue = null, nl.current = ef, e = n(r, l);
      } while (ir);
    }
    if (nl.current = ol, t = ie !== null && ie.next !== null, en = 0, ce = ie = ee = null, rl = !1, t) throw Error(m(300));
    return e;
  }
  function Uu() {
    var e = sr !== 0;
    return sr = 0, e;
  }
  function mt() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return ce === null ? ee.memoizedState = ce = e : ce = ce.next = e, ce;
  }
  function Ge() {
    if (ie === null) {
      var e = ee.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = ie.next;
    var t = ce === null ? ee.memoizedState : ce.next;
    if (t !== null) ce = t, ie = e;
    else {
      if (e === null) throw Error(m(310));
      ie = e, e = { memoizedState: ie.memoizedState, baseState: ie.baseState, baseQueue: ie.baseQueue, queue: ie.queue, next: null }, ce === null ? ee.memoizedState = ce = e : ce = ce.next = e;
    }
    return ce;
  }
  function ar(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Au(e) {
    var t = Ge(), n = t.queue;
    if (n === null) throw Error(m(311));
    n.lastRenderedReducer = e;
    var r = ie, l = r.baseQueue, u = n.pending;
    if (u !== null) {
      if (l !== null) {
        var o = l.next;
        l.next = u.next, u.next = o;
      }
      r.baseQueue = l = u, n.pending = null;
    }
    if (l !== null) {
      u = l.next, r = r.baseState;
      var i = o = null, s = null, p = u;
      do {
        var y = p.lane;
        if ((en & y) === y) s !== null && (s = s.next = { lane: 0, action: p.action, hasEagerState: p.hasEagerState, eagerState: p.eagerState, next: null }), r = p.hasEagerState ? p.eagerState : e(r, p.action);
        else {
          var g = {
            lane: y,
            action: p.action,
            hasEagerState: p.hasEagerState,
            eagerState: p.eagerState,
            next: null
          };
          s === null ? (i = s = g, o = r) : s = s.next = g, ee.lanes |= y, tn |= y;
        }
        p = p.next;
      } while (p !== null && p !== u);
      s === null ? o = r : s.next = i, nt(r, t.memoizedState) || (Oe = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = s, n.lastRenderedState = r;
    }
    if (e = n.interleaved, e !== null) {
      l = e;
      do
        u = l.lane, ee.lanes |= u, tn |= u, l = l.next;
      while (l !== e);
    } else l === null && (n.lanes = 0);
    return [t.memoizedState, n.dispatch];
  }
  function Vu(e) {
    var t = Ge(), n = t.queue;
    if (n === null) throw Error(m(311));
    n.lastRenderedReducer = e;
    var r = n.dispatch, l = n.pending, u = t.memoizedState;
    if (l !== null) {
      n.pending = null;
      var o = l = l.next;
      do
        u = e(u, o.action), o = o.next;
      while (o !== l);
      nt(u, t.memoizedState) || (Oe = !0), t.memoizedState = u, t.baseQueue === null && (t.baseState = u), n.lastRenderedState = u;
    }
    return [u, r];
  }
  function os() {
  }
  function is(e, t) {
    var n = ee, r = Ge(), l = t(), u = !nt(r.memoizedState, l);
    if (u && (r.memoizedState = l, Oe = !0), r = r.queue, Bu(cs.bind(null, n, r, e), [e]), r.getSnapshot !== t || u || ce !== null && ce.memoizedState.tag & 1) {
      if (n.flags |= 2048, cr(9, as.bind(null, n, r, l, t), void 0, null), fe === null) throw Error(m(349));
      en & 30 || ss(n, t, l);
    }
    return l;
  }
  function ss(e, t, n) {
    e.flags |= 16384, e = { getSnapshot: t, value: n }, t = ee.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, ee.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function as(e, t, n, r) {
    t.value = n, t.getSnapshot = r, fs(t) && ds(e);
  }
  function cs(e, t, n) {
    return n(function() {
      fs(t) && ds(e);
    });
  }
  function fs(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !nt(e, n);
    } catch {
      return !0;
    }
  }
  function ds(e) {
    var t = Et(e, 1);
    t !== null && it(t, e, 1, -1);
  }
  function ps(e) {
    var t = mt();
    return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ar, lastRenderedState: e }, t.queue = e, e = e.dispatch = Jc.bind(null, ee, e), [t.memoizedState, e];
  }
  function cr(e, t, n, r) {
    return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = ee.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, ee.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
  }
  function ms() {
    return Ge().memoizedState;
  }
  function ll(e, t, n, r) {
    var l = mt();
    ee.flags |= e, l.memoizedState = cr(1 | t, n, void 0, r === void 0 ? null : r);
  }
  function ul(e, t, n, r) {
    var l = Ge();
    r = r === void 0 ? null : r;
    var u = void 0;
    if (ie !== null) {
      var o = ie.memoizedState;
      if (u = o.destroy, r !== null && Fu(r, o.deps)) {
        l.memoizedState = cr(t, n, u, r);
        return;
      }
    }
    ee.flags |= e, l.memoizedState = cr(1 | t, n, u, r);
  }
  function hs(e, t) {
    return ll(8390656, 8, e, t);
  }
  function Bu(e, t) {
    return ul(2048, 8, e, t);
  }
  function vs(e, t) {
    return ul(4, 2, e, t);
  }
  function ys(e, t) {
    return ul(4, 4, e, t);
  }
  function gs(e, t) {
    if (typeof t == "function") return e = e(), t(e), function() {
      t(null);
    };
    if (t != null) return e = e(), t.current = e, function() {
      t.current = null;
    };
  }
  function ws(e, t, n) {
    return n = n != null ? n.concat([e]) : null, ul(4, 4, gs.bind(null, t, e), n);
  }
  function Hu() {
  }
  function Ss(e, t) {
    var n = Ge();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return r !== null && t !== null && Fu(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
  }
  function ks(e, t) {
    var n = Ge();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return r !== null && t !== null && Fu(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
  }
  function Es(e, t, n) {
    return en & 21 ? (nt(n, t) || (n = qo(), ee.lanes |= n, tn |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Oe = !0), e.memoizedState = n);
  }
  function Gc(e, t) {
    var n = V;
    V = n !== 0 && 4 > n ? n : 4, e(!0);
    var r = Iu.transition;
    Iu.transition = {};
    try {
      e(!1), t();
    } finally {
      V = n, Iu.transition = r;
    }
  }
  function _s() {
    return Ge().memoizedState;
  }
  function Zc(e, t, n) {
    var r = Ht(e);
    if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Cs(e)) xs(t, n);
    else if (n = ts(e, t, n, r), n !== null) {
      var l = xe();
      it(n, e, r, l), Ps(n, t, r);
    }
  }
  function Jc(e, t, n) {
    var r = Ht(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
    if (Cs(e)) xs(t, l);
    else {
      var u = e.alternate;
      if (e.lanes === 0 && (u === null || u.lanes === 0) && (u = t.lastRenderedReducer, u !== null)) try {
        var o = t.lastRenderedState, i = u(o, n);
        if (l.hasEagerState = !0, l.eagerState = i, nt(i, o)) {
          var s = t.interleaved;
          s === null ? (l.next = l, Tu(t)) : (l.next = s.next, s.next = l), t.interleaved = l;
          return;
        }
      } catch {
      } finally {
      }
      n = ts(e, t, l, r), n !== null && (l = xe(), it(n, e, r, l), Ps(n, t, r));
    }
  }
  function Cs(e) {
    var t = e.alternate;
    return e === ee || t !== null && t === ee;
  }
  function xs(e, t) {
    ir = rl = !0;
    var n = e.pending;
    n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
  }
  function Ps(e, t, n) {
    if (n & 4194240) {
      var r = t.lanes;
      r &= e.pendingLanes, n |= r, t.lanes = n, Wl(e, n);
    }
  }
  var ol = { readContext: Xe, useCallback: we, useContext: we, useEffect: we, useImperativeHandle: we, useInsertionEffect: we, useLayoutEffect: we, useMemo: we, useReducer: we, useRef: we, useState: we, useDebugValue: we, useDeferredValue: we, useTransition: we, useMutableSource: we, useSyncExternalStore: we, useId: we, unstable_isNewReconciler: !1 }, qc = { readContext: Xe, useCallback: function(e, t) {
    return mt().memoizedState = [e, t === void 0 ? null : t], e;
  }, useContext: Xe, useEffect: hs, useImperativeHandle: function(e, t, n) {
    return n = n != null ? n.concat([e]) : null, ll(
      4194308,
      4,
      gs.bind(null, t, e),
      n
    );
  }, useLayoutEffect: function(e, t) {
    return ll(4194308, 4, e, t);
  }, useInsertionEffect: function(e, t) {
    return ll(4, 2, e, t);
  }, useMemo: function(e, t) {
    var n = mt();
    return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
  }, useReducer: function(e, t, n) {
    var r = mt();
    return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = Zc.bind(null, ee, e), [r.memoizedState, e];
  }, useRef: function(e) {
    var t = mt();
    return e = { current: e }, t.memoizedState = e;
  }, useState: ps, useDebugValue: Hu, useDeferredValue: function(e) {
    return mt().memoizedState = e;
  }, useTransition: function() {
    var e = ps(!1), t = e[0];
    return e = Gc.bind(null, e[1]), mt().memoizedState = e, [t, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, t, n) {
    var r = ee, l = mt();
    if (J) {
      if (n === void 0) throw Error(m(407));
      n = n();
    } else {
      if (n = t(), fe === null) throw Error(m(349));
      en & 30 || ss(r, t, n);
    }
    l.memoizedState = n;
    var u = { value: n, getSnapshot: t };
    return l.queue = u, hs(cs.bind(
      null,
      r,
      u,
      e
    ), [e]), r.flags |= 2048, cr(9, as.bind(null, r, u, n, t), void 0, null), n;
  }, useId: function() {
    var e = mt(), t = fe.identifierPrefix;
    if (J) {
      var n = kt, r = St;
      n = (r & ~(1 << 32 - tt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = sr++, 0 < n && (t += "H" + n.toString(32)), t += ":";
    } else n = Xc++, t = ":" + t + "r" + n.toString(32) + ":";
    return e.memoizedState = t;
  }, unstable_isNewReconciler: !1 }, bc = {
    readContext: Xe,
    useCallback: Ss,
    useContext: Xe,
    useEffect: Bu,
    useImperativeHandle: ws,
    useInsertionEffect: vs,
    useLayoutEffect: ys,
    useMemo: ks,
    useReducer: Au,
    useRef: ms,
    useState: function() {
      return Au(ar);
    },
    useDebugValue: Hu,
    useDeferredValue: function(e) {
      var t = Ge();
      return Es(t, ie.memoizedState, e);
    },
    useTransition: function() {
      var e = Au(ar)[0], t = Ge().memoizedState;
      return [e, t];
    },
    useMutableSource: os,
    useSyncExternalStore: is,
    useId: _s,
    unstable_isNewReconciler: !1
  }, ef = { readContext: Xe, useCallback: Ss, useContext: Xe, useEffect: Bu, useImperativeHandle: ws, useInsertionEffect: vs, useLayoutEffect: ys, useMemo: ks, useReducer: Vu, useRef: ms, useState: function() {
    return Vu(ar);
  }, useDebugValue: Hu, useDeferredValue: function(e) {
    var t = Ge();
    return ie === null ? t.memoizedState = e : Es(t, ie.memoizedState, e);
  }, useTransition: function() {
    var e = Vu(ar)[0], t = Ge().memoizedState;
    return [e, t];
  }, useMutableSource: os, useSyncExternalStore: is, useId: _s, unstable_isNewReconciler: !1 };
  function lt(e, t) {
    if (e && e.defaultProps) {
      t = _({}, t), e = e.defaultProps;
      for (var n in e) t[n] === void 0 && (t[n] = e[n]);
      return t;
    }
    return t;
  }
  function $u(e, t, n, r) {
    t = e.memoizedState, n = n(r, t), n = n == null ? t : _({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var il = { isMounted: function(e) {
    return (e = e._reactInternals) ? Yt(e) === e : !1;
  }, enqueueSetState: function(e, t, n) {
    e = e._reactInternals;
    var r = xe(), l = Ht(e), u = _t(r, l);
    u.payload = t, n != null && (u.callback = n), t = Ut(e, u, l), t !== null && (it(t, e, l, r), br(t, e, l));
  }, enqueueReplaceState: function(e, t, n) {
    e = e._reactInternals;
    var r = xe(), l = Ht(e), u = _t(r, l);
    u.tag = 1, u.payload = t, n != null && (u.callback = n), t = Ut(e, u, l), t !== null && (it(t, e, l, r), br(t, e, l));
  }, enqueueForceUpdate: function(e, t) {
    e = e._reactInternals;
    var n = xe(), r = Ht(e), l = _t(n, r);
    l.tag = 2, t != null && (l.callback = t), t = Ut(e, l, r), t !== null && (it(t, e, r, n), br(t, e, r));
  } };
  function Ns(e, t, n, r, l, u, o) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, u, o) : t.prototype && t.prototype.isPureReactComponent ? !Zn(n, r) || !Zn(l, u) : !0;
  }
  function zs(e, t, n) {
    var r = !1, l = It, u = t.contextType;
    return typeof u == "object" && u !== null ? u = Xe(u) : (l = Re(t) ? Gt : ge.current, r = t.contextTypes, u = (r = r != null) ? wn(e, l) : It), t = new t(n, u), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = il, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = u), t;
  }
  function Ts(e, t, n, r) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && il.enqueueReplaceState(t, t.state, null);
  }
  function Wu(e, t, n, r) {
    var l = e.stateNode;
    l.props = n, l.state = e.memoizedState, l.refs = {}, Lu(e);
    var u = t.contextType;
    typeof u == "object" && u !== null ? l.context = Xe(u) : (u = Re(t) ? Gt : ge.current, l.context = wn(e, u)), l.state = e.memoizedState, u = t.getDerivedStateFromProps, typeof u == "function" && ($u(e, t, u, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && il.enqueueReplaceState(l, l.state, null), el(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function Nn(e, t) {
    try {
      var n = "", r = t;
      do
        n += F(r), r = r.return;
      while (r);
      var l = n;
    } catch (u) {
      l = `
Error generating stack: ` + u.message + `
` + u.stack;
    }
    return { value: e, source: t, stack: l, digest: null };
  }
  function Qu(e, t, n) {
    return { value: e, source: null, stack: n ?? null, digest: t ?? null };
  }
  function Ku(e, t) {
    try {
      console.error(t.value);
    } catch (n) {
      setTimeout(function() {
        throw n;
      });
    }
  }
  var tf = typeof WeakMap == "function" ? WeakMap : Map;
  function Ls(e, t, n) {
    n = _t(-1, n), n.tag = 3, n.payload = { element: null };
    var r = t.value;
    return n.callback = function() {
      ml || (ml = !0, io = r), Ku(e, t);
    }, n;
  }
  function Rs(e, t, n) {
    n = _t(-1, n), n.tag = 3;
    var r = e.type.getDerivedStateFromError;
    if (typeof r == "function") {
      var l = t.value;
      n.payload = function() {
        return r(l);
      }, n.callback = function() {
        Ku(e, t);
      };
    }
    var u = e.stateNode;
    return u !== null && typeof u.componentDidCatch == "function" && (n.callback = function() {
      Ku(e, t), typeof r != "function" && (Vt === null ? Vt = /* @__PURE__ */ new Set([this]) : Vt.add(this));
      var o = t.stack;
      this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
    }), n;
  }
  function Os(e, t, n) {
    var r = e.pingCache;
    if (r === null) {
      r = e.pingCache = new tf();
      var l = /* @__PURE__ */ new Set();
      r.set(t, l);
    } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
    l.has(n) || (l.add(n), e = vf.bind(null, e, t, n), t.then(e, e));
  }
  function Ds(e) {
    do {
      var t;
      if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function Ms(e, t, n, r, l) {
    return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = _t(-1, 1), t.tag = 2, Ut(n, t, 1))), n.lanes |= 1), e);
  }
  var nf = ye.ReactCurrentOwner, Oe = !1;
  function Ce(e, t, n, r) {
    t.child = e === null ? es(t, null, n, r) : _n(t, e.child, n, r);
  }
  function Is(e, t, n, r, l) {
    n = n.render;
    var u = t.ref;
    return xn(t, l), r = ju(e, t, n, r, u, l), n = Uu(), e !== null && !Oe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, Ct(e, t, l)) : (J && n && Su(t), t.flags |= 1, Ce(e, t, r, l), t.child);
  }
  function Fs(e, t, n, r, l) {
    if (e === null) {
      var u = n.type;
      return typeof u == "function" && !ho(u) && u.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = u, js(e, t, u, r, l)) : (e = Sl(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (u = e.child, !(e.lanes & l)) {
      var o = u.memoizedProps;
      if (n = n.compare, n = n !== null ? n : Zn, n(o, r) && e.ref === t.ref) return Ct(e, t, l);
    }
    return t.flags |= 1, e = Wt(u, r), e.ref = t.ref, e.return = t, t.child = e;
  }
  function js(e, t, n, r, l) {
    if (e !== null) {
      var u = e.memoizedProps;
      if (Zn(u, r) && e.ref === t.ref) if (Oe = !1, t.pendingProps = r = u, (e.lanes & l) !== 0) e.flags & 131072 && (Oe = !0);
      else return t.lanes = e.lanes, Ct(e, t, l);
    }
    return Yu(e, t, n, r, l);
  }
  function Us(e, t, n) {
    var r = t.pendingProps, l = r.children, u = e !== null ? e.memoizedState : null;
    if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Q(Tn, He), He |= n;
    else {
      if (!(n & 1073741824)) return e = u !== null ? u.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Q(Tn, He), He |= e, null;
      t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = u !== null ? u.baseLanes : n, Q(Tn, He), He |= r;
    }
    else u !== null ? (r = u.baseLanes | n, t.memoizedState = null) : r = n, Q(Tn, He), He |= r;
    return Ce(e, t, l, n), t.child;
  }
  function As(e, t) {
    var n = t.ref;
    (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
  }
  function Yu(e, t, n, r, l) {
    var u = Re(n) ? Gt : ge.current;
    return u = wn(t, u), xn(t, l), n = ju(e, t, n, r, u, l), r = Uu(), e !== null && !Oe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, Ct(e, t, l)) : (J && r && Su(t), t.flags |= 1, Ce(e, t, n, l), t.child);
  }
  function Vs(e, t, n, r, l) {
    if (Re(n)) {
      var u = !0;
      Qr(t);
    } else u = !1;
    if (xn(t, l), t.stateNode === null) al(e, t), zs(t, n, r), Wu(t, n, r, l), r = !0;
    else if (e === null) {
      var o = t.stateNode, i = t.memoizedProps;
      o.props = i;
      var s = o.context, p = n.contextType;
      typeof p == "object" && p !== null ? p = Xe(p) : (p = Re(n) ? Gt : ge.current, p = wn(t, p));
      var y = n.getDerivedStateFromProps, g = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function";
      g || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (i !== r || s !== p) && Ts(t, o, r, p), jt = !1;
      var h = t.memoizedState;
      o.state = h, el(t, r, o, l), s = t.memoizedState, i !== r || h !== s || Le.current || jt ? (typeof y == "function" && ($u(t, n, y, r), s = t.memoizedState), (i = jt || Ns(t, n, i, r, h, s, p)) ? (g || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = s), o.props = r, o.state = s, o.context = p, r = i) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
    } else {
      o = t.stateNode, ns(e, t), i = t.memoizedProps, p = t.type === t.elementType ? i : lt(t.type, i), o.props = p, g = t.pendingProps, h = o.context, s = n.contextType, typeof s == "object" && s !== null ? s = Xe(s) : (s = Re(n) ? Gt : ge.current, s = wn(t, s));
      var k = n.getDerivedStateFromProps;
      (y = typeof k == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (i !== g || h !== s) && Ts(t, o, r, s), jt = !1, h = t.memoizedState, o.state = h, el(t, r, o, l);
      var C = t.memoizedState;
      i !== g || h !== C || Le.current || jt ? (typeof k == "function" && ($u(t, n, k, r), C = t.memoizedState), (p = jt || Ns(t, n, p, r, h, C, s) || !1) ? (y || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, C, s), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, C, s)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || i === e.memoizedProps && h === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && h === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = C), o.props = r, o.state = C, o.context = s, r = p) : (typeof o.componentDidUpdate != "function" || i === e.memoizedProps && h === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && h === e.memoizedState || (t.flags |= 1024), r = !1);
    }
    return Xu(e, t, n, r, u, l);
  }
  function Xu(e, t, n, r, l, u) {
    As(e, t);
    var o = (t.flags & 128) !== 0;
    if (!r && !o) return l && Qi(t, n, !1), Ct(e, t, u);
    r = t.stateNode, nf.current = t;
    var i = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
    return t.flags |= 1, e !== null && o ? (t.child = _n(t, e.child, null, u), t.child = _n(t, null, i, u)) : Ce(e, t, i, u), t.memoizedState = r.state, l && Qi(t, n, !0), t.child;
  }
  function Bs(e) {
    var t = e.stateNode;
    t.pendingContext ? $i(e, t.pendingContext, t.pendingContext !== t.context) : t.context && $i(e, t.context, !1), Ru(e, t.containerInfo);
  }
  function Hs(e, t, n, r, l) {
    return En(), Cu(l), t.flags |= 256, Ce(e, t, n, r), t.child;
  }
  var Gu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Zu(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function $s(e, t, n) {
    var r = t.pendingProps, l = b.current, u = !1, o = (t.flags & 128) !== 0, i;
    if ((i = o) || (i = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), i ? (u = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Q(b, l & 1), e === null)
      return _u(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, u ? (r = t.mode, u = t.child, o = { mode: "hidden", children: o }, !(r & 1) && u !== null ? (u.childLanes = 0, u.pendingProps = o) : u = kl(o, r, 0, null), e = un(e, r, n, null), u.return = t, e.return = t, u.sibling = e, t.child = u, t.child.memoizedState = Zu(n), t.memoizedState = Gu, e) : Ju(t, o));
    if (l = e.memoizedState, l !== null && (i = l.dehydrated, i !== null)) return rf(e, t, o, r, i, l, n);
    if (u) {
      u = r.fallback, o = t.mode, l = e.child, i = l.sibling;
      var s = { mode: "hidden", children: r.children };
      return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = s, t.deletions = null) : (r = Wt(l, s), r.subtreeFlags = l.subtreeFlags & 14680064), i !== null ? u = Wt(i, u) : (u = un(u, o, n, null), u.flags |= 2), u.return = t, r.return = t, r.sibling = u, t.child = r, r = u, u = t.child, o = e.child.memoizedState, o = o === null ? Zu(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, u.memoizedState = o, u.childLanes = e.childLanes & ~n, t.memoizedState = Gu, r;
    }
    return u = e.child, e = u.sibling, r = Wt(u, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
  }
  function Ju(e, t) {
    return t = kl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
  }
  function sl(e, t, n, r) {
    return r !== null && Cu(r), _n(t, e.child, null, n), e = Ju(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
  }
  function rf(e, t, n, r, l, u, o) {
    if (n)
      return t.flags & 256 ? (t.flags &= -257, r = Qu(Error(m(422))), sl(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (u = r.fallback, l = t.mode, r = kl({ mode: "visible", children: r.children }, l, 0, null), u = un(u, l, o, null), u.flags |= 2, r.return = t, u.return = t, r.sibling = u, t.child = r, t.mode & 1 && _n(t, e.child, null, o), t.child.memoizedState = Zu(o), t.memoizedState = Gu, u);
    if (!(t.mode & 1)) return sl(e, t, o, null);
    if (l.data === "$!") {
      if (r = l.nextSibling && l.nextSibling.dataset, r) var i = r.dgst;
      return r = i, u = Error(m(419)), r = Qu(u, r, void 0), sl(e, t, o, r);
    }
    if (i = (o & e.childLanes) !== 0, Oe || i) {
      if (r = fe, r !== null) {
        switch (o & -o) {
          case 4:
            l = 2;
            break;
          case 16:
            l = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            l = 32;
            break;
          case 536870912:
            l = 268435456;
            break;
          default:
            l = 0;
        }
        l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== u.retryLane && (u.retryLane = l, Et(e, l), it(r, e, l, -1));
      }
      return mo(), r = Qu(Error(m(421))), sl(e, t, o, r);
    }
    return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = yf.bind(null, e), l._reactRetry = t, null) : (e = u.treeContext, Be = Dt(l.nextSibling), Ve = t, J = !0, rt = null, e !== null && (Ke[Ye++] = St, Ke[Ye++] = kt, Ke[Ye++] = Zt, St = e.id, kt = e.overflow, Zt = t), t = Ju(t, r.children), t.flags |= 4096, t);
  }
  function Ws(e, t, n) {
    e.lanes |= t;
    var r = e.alternate;
    r !== null && (r.lanes |= t), zu(e.return, t, n);
  }
  function qu(e, t, n, r, l) {
    var u = e.memoizedState;
    u === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (u.isBackwards = t, u.rendering = null, u.renderingStartTime = 0, u.last = r, u.tail = n, u.tailMode = l);
  }
  function Qs(e, t, n) {
    var r = t.pendingProps, l = r.revealOrder, u = r.tail;
    if (Ce(e, t, r.children, n), r = b.current, r & 2) r = r & 1 | 2, t.flags |= 128;
    else {
      if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Ws(e, n, t);
        else if (e.tag === 19) Ws(e, n, t);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
      r &= 1;
    }
    if (Q(b, r), !(t.mode & 1)) t.memoizedState = null;
    else switch (l) {
      case "forwards":
        for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && tl(e) === null && (l = n), n = n.sibling;
        n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), qu(t, !1, l, n, u);
        break;
      case "backwards":
        for (n = null, l = t.child, t.child = null; l !== null; ) {
          if (e = l.alternate, e !== null && tl(e) === null) {
            t.child = l;
            break;
          }
          e = l.sibling, l.sibling = n, n = l, l = e;
        }
        qu(t, !0, n, null, u);
        break;
      case "together":
        qu(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function al(e, t) {
    !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
  }
  function Ct(e, t, n) {
    if (e !== null && (t.dependencies = e.dependencies), tn |= t.lanes, !(n & t.childLanes)) return null;
    if (e !== null && t.child !== e.child) throw Error(m(153));
    if (t.child !== null) {
      for (e = t.child, n = Wt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = Wt(e, e.pendingProps), n.return = t;
      n.sibling = null;
    }
    return t.child;
  }
  function lf(e, t, n) {
    switch (t.tag) {
      case 3:
        Bs(t), En();
        break;
      case 5:
        us(t);
        break;
      case 1:
        Re(t.type) && Qr(t);
        break;
      case 4:
        Ru(t, t.stateNode.containerInfo);
        break;
      case 10:
        var r = t.type._context, l = t.memoizedProps.value;
        Q(Jr, r._currentValue), r._currentValue = l;
        break;
      case 13:
        if (r = t.memoizedState, r !== null)
          return r.dehydrated !== null ? (Q(b, b.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? $s(e, t, n) : (Q(b, b.current & 1), e = Ct(e, t, n), e !== null ? e.sibling : null);
        Q(b, b.current & 1);
        break;
      case 19:
        if (r = (n & t.childLanes) !== 0, e.flags & 128) {
          if (r) return Qs(e, t, n);
          t.flags |= 128;
        }
        if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Q(b, b.current), r) break;
        return null;
      case 22:
      case 23:
        return t.lanes = 0, Us(e, t, n);
    }
    return Ct(e, t, n);
  }
  var Ks, bu, Ys, Xs;
  Ks = function(e, t) {
    for (var n = t.child; n !== null; ) {
      if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
      else if (n.tag !== 4 && n.child !== null) {
        n.child.return = n, n = n.child;
        continue;
      }
      if (n === t) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === t) return;
        n = n.return;
      }
      n.sibling.return = n.return, n = n.sibling;
    }
  }, bu = function() {
  }, Ys = function(e, t, n, r) {
    var l = e.memoizedProps;
    if (l !== r) {
      e = t.stateNode, bt(pt.current);
      var u = null;
      switch (n) {
        case "input":
          l = zl(e, l), r = zl(e, r), u = [];
          break;
        case "select":
          l = _({}, l, { value: void 0 }), r = _({}, r, { value: void 0 }), u = [];
          break;
        case "textarea":
          l = Rl(e, l), r = Rl(e, r), u = [];
          break;
        default:
          typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Hr);
      }
      Dl(n, r);
      var o;
      n = null;
      for (p in l) if (!r.hasOwnProperty(p) && l.hasOwnProperty(p) && l[p] != null) if (p === "style") {
        var i = l[p];
        for (o in i) i.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
      } else p !== "dangerouslySetInnerHTML" && p !== "children" && p !== "suppressContentEditableWarning" && p !== "suppressHydrationWarning" && p !== "autoFocus" && (Pe.hasOwnProperty(p) ? u || (u = []) : (u = u || []).push(p, null));
      for (p in r) {
        var s = r[p];
        if (i = l != null ? l[p] : void 0, r.hasOwnProperty(p) && s !== i && (s != null || i != null)) if (p === "style") if (i) {
          for (o in i) !i.hasOwnProperty(o) || s && s.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
          for (o in s) s.hasOwnProperty(o) && i[o] !== s[o] && (n || (n = {}), n[o] = s[o]);
        } else n || (u || (u = []), u.push(
          p,
          n
        )), n = s;
        else p === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, i = i ? i.__html : void 0, s != null && i !== s && (u = u || []).push(p, s)) : p === "children" ? typeof s != "string" && typeof s != "number" || (u = u || []).push(p, "" + s) : p !== "suppressContentEditableWarning" && p !== "suppressHydrationWarning" && (Pe.hasOwnProperty(p) ? (s != null && p === "onScroll" && K("scroll", e), u || i === s || (u = [])) : (u = u || []).push(p, s));
      }
      n && (u = u || []).push("style", n);
      var p = u;
      (t.updateQueue = p) && (t.flags |= 4);
    }
  }, Xs = function(e, t, n, r) {
    n !== r && (t.flags |= 4);
  };
  function fr(e, t) {
    if (!J) switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
        n === null ? e.tail = null : n.sibling = null;
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
        r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
    }
  }
  function Se(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
    if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
    else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
    return e.subtreeFlags |= r, e.childLanes = n, t;
  }
  function uf(e, t, n) {
    var r = t.pendingProps;
    switch (ku(t), t.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Se(t), null;
      case 1:
        return Re(t.type) && Wr(), Se(t), null;
      case 3:
        return r = t.stateNode, Pn(), Y(Le), Y(ge), Mu(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Gr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, rt !== null && (co(rt), rt = null))), bu(e, t), Se(t), null;
      case 5:
        Ou(t);
        var l = bt(or.current);
        if (n = t.type, e !== null && t.stateNode != null) Ys(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
        else {
          if (!r) {
            if (t.stateNode === null) throw Error(m(166));
            return Se(t), null;
          }
          if (e = bt(pt.current), Gr(t)) {
            r = t.stateNode, n = t.type;
            var u = t.memoizedProps;
            switch (r[dt] = t, r[tr] = u, e = (t.mode & 1) !== 0, n) {
              case "dialog":
                K("cancel", r), K("close", r);
                break;
              case "iframe":
              case "object":
              case "embed":
                K("load", r);
                break;
              case "video":
              case "audio":
                for (l = 0; l < qn.length; l++) K(qn[l], r);
                break;
              case "source":
                K("error", r);
                break;
              case "img":
              case "image":
              case "link":
                K(
                  "error",
                  r
                ), K("load", r);
                break;
              case "details":
                K("toggle", r);
                break;
              case "input":
                zo(r, u), K("invalid", r);
                break;
              case "select":
                r._wrapperState = { wasMultiple: !!u.multiple }, K("invalid", r);
                break;
              case "textarea":
                Ro(r, u), K("invalid", r);
            }
            Dl(n, u), l = null;
            for (var o in u) if (u.hasOwnProperty(o)) {
              var i = u[o];
              o === "children" ? typeof i == "string" ? r.textContent !== i && (u.suppressHydrationWarning !== !0 && Br(r.textContent, i, e), l = ["children", i]) : typeof i == "number" && r.textContent !== "" + i && (u.suppressHydrationWarning !== !0 && Br(
                r.textContent,
                i,
                e
              ), l = ["children", "" + i]) : Pe.hasOwnProperty(o) && i != null && o === "onScroll" && K("scroll", r);
            }
            switch (n) {
              case "input":
                gr(r), Lo(r, u, !0);
                break;
              case "textarea":
                gr(r), Do(r);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof u.onClick == "function" && (r.onclick = Hr);
            }
            r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
          } else {
            o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Mo(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[dt] = t, e[tr] = r, Ks(e, t, !1, !1), t.stateNode = e;
            e: {
              switch (o = Ml(n, r), n) {
                case "dialog":
                  K("cancel", e), K("close", e), l = r;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  K("load", e), l = r;
                  break;
                case "video":
                case "audio":
                  for (l = 0; l < qn.length; l++) K(qn[l], e);
                  l = r;
                  break;
                case "source":
                  K("error", e), l = r;
                  break;
                case "img":
                case "image":
                case "link":
                  K(
                    "error",
                    e
                  ), K("load", e), l = r;
                  break;
                case "details":
                  K("toggle", e), l = r;
                  break;
                case "input":
                  zo(e, r), l = zl(e, r), K("invalid", e);
                  break;
                case "option":
                  l = r;
                  break;
                case "select":
                  e._wrapperState = { wasMultiple: !!r.multiple }, l = _({}, r, { value: void 0 }), K("invalid", e);
                  break;
                case "textarea":
                  Ro(e, r), l = Rl(e, r), K("invalid", e);
                  break;
                default:
                  l = r;
              }
              Dl(n, l), i = l;
              for (u in i) if (i.hasOwnProperty(u)) {
                var s = i[u];
                u === "style" ? jo(e, s) : u === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, s != null && Io(e, s)) : u === "children" ? typeof s == "string" ? (n !== "textarea" || s !== "") && Dn(e, s) : typeof s == "number" && Dn(e, "" + s) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (Pe.hasOwnProperty(u) ? s != null && u === "onScroll" && K("scroll", e) : s != null && qe(e, u, s, o));
              }
              switch (n) {
                case "input":
                  gr(e), Lo(e, r, !1);
                  break;
                case "textarea":
                  gr(e), Do(e);
                  break;
                case "option":
                  r.value != null && e.setAttribute("value", "" + A(r.value));
                  break;
                case "select":
                  e.multiple = !!r.multiple, u = r.value, u != null ? on(e, !!r.multiple, u, !1) : r.defaultValue != null && on(
                    e,
                    !!r.multiple,
                    r.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof l.onClick == "function" && (e.onclick = Hr);
              }
              switch (n) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  r = !!r.autoFocus;
                  break e;
                case "img":
                  r = !0;
                  break e;
                default:
                  r = !1;
              }
            }
            r && (t.flags |= 4);
          }
          t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
        }
        return Se(t), null;
      case 6:
        if (e && t.stateNode != null) Xs(e, t, e.memoizedProps, r);
        else {
          if (typeof r != "string" && t.stateNode === null) throw Error(m(166));
          if (n = bt(or.current), bt(pt.current), Gr(t)) {
            if (r = t.stateNode, n = t.memoizedProps, r[dt] = t, (u = r.nodeValue !== n) && (e = Ve, e !== null)) switch (e.tag) {
              case 3:
                Br(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 && Br(r.nodeValue, n, (e.mode & 1) !== 0);
            }
            u && (t.flags |= 4);
          } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[dt] = t, t.stateNode = r;
        }
        return Se(t), null;
      case 13:
        if (Y(b), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (J && Be !== null && t.mode & 1 && !(t.flags & 128)) Ji(), En(), t.flags |= 98560, u = !1;
          else if (u = Gr(t), r !== null && r.dehydrated !== null) {
            if (e === null) {
              if (!u) throw Error(m(318));
              if (u = t.memoizedState, u = u !== null ? u.dehydrated : null, !u) throw Error(m(317));
              u[dt] = t;
            } else En(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
            Se(t), u = !1;
          } else rt !== null && (co(rt), rt = null), u = !0;
          if (!u) return t.flags & 65536 ? t : null;
        }
        return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || b.current & 1 ? se === 0 && (se = 3) : mo())), t.updateQueue !== null && (t.flags |= 4), Se(t), null);
      case 4:
        return Pn(), bu(e, t), e === null && bn(t.stateNode.containerInfo), Se(t), null;
      case 10:
        return Nu(t.type._context), Se(t), null;
      case 17:
        return Re(t.type) && Wr(), Se(t), null;
      case 19:
        if (Y(b), u = t.memoizedState, u === null) return Se(t), null;
        if (r = (t.flags & 128) !== 0, o = u.rendering, o === null) if (r) fr(u, !1);
        else {
          if (se !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
            if (o = tl(e), o !== null) {
              for (t.flags |= 128, fr(u, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) u = n, e = r, u.flags &= 14680066, o = u.alternate, o === null ? (u.childLanes = 0, u.lanes = e, u.child = null, u.subtreeFlags = 0, u.memoizedProps = null, u.memoizedState = null, u.updateQueue = null, u.dependencies = null, u.stateNode = null) : (u.childLanes = o.childLanes, u.lanes = o.lanes, u.child = o.child, u.subtreeFlags = 0, u.deletions = null, u.memoizedProps = o.memoizedProps, u.memoizedState = o.memoizedState, u.updateQueue = o.updateQueue, u.type = o.type, e = o.dependencies, u.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
              return Q(b, b.current & 1 | 2), t.child;
            }
            e = e.sibling;
          }
          u.tail !== null && le() > Ln && (t.flags |= 128, r = !0, fr(u, !1), t.lanes = 4194304);
        }
        else {
          if (!r) if (e = tl(o), e !== null) {
            if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), fr(u, !0), u.tail === null && u.tailMode === "hidden" && !o.alternate && !J) return Se(t), null;
          } else 2 * le() - u.renderingStartTime > Ln && n !== 1073741824 && (t.flags |= 128, r = !0, fr(u, !1), t.lanes = 4194304);
          u.isBackwards ? (o.sibling = t.child, t.child = o) : (n = u.last, n !== null ? n.sibling = o : t.child = o, u.last = o);
        }
        return u.tail !== null ? (t = u.tail, u.rendering = t, u.tail = t.sibling, u.renderingStartTime = le(), t.sibling = null, n = b.current, Q(b, r ? n & 1 | 2 : n & 1), t) : (Se(t), null);
      case 22:
      case 23:
        return po(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? He & 1073741824 && (Se(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Se(t), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(m(156, t.tag));
  }
  function of(e, t) {
    switch (ku(t), t.tag) {
      case 1:
        return Re(t.type) && Wr(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return Pn(), Y(Le), Y(ge), Mu(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
      case 5:
        return Ou(t), null;
      case 13:
        if (Y(b), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null) throw Error(m(340));
          En();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return Y(b), null;
      case 4:
        return Pn(), null;
      case 10:
        return Nu(t.type._context), null;
      case 22:
      case 23:
        return po(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var cl = !1, ke = !1, sf = typeof WeakSet == "function" ? WeakSet : Set, E = null;
  function zn(e, t) {
    var n = e.ref;
    if (n !== null) if (typeof n == "function") try {
      n(null);
    } catch (r) {
      re(e, t, r);
    }
    else n.current = null;
  }
  function eo(e, t, n) {
    try {
      n();
    } catch (r) {
      re(e, t, r);
    }
  }
  var Gs = !1;
  function af(e, t) {
    if (du = Lr, e = Ni(), lu(e)) {
      if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
      else e: {
        n = (n = e.ownerDocument) && n.defaultView || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var l = r.anchorOffset, u = r.focusNode;
          r = r.focusOffset;
          try {
            n.nodeType, u.nodeType;
          } catch {
            n = null;
            break e;
          }
          var o = 0, i = -1, s = -1, p = 0, y = 0, g = e, h = null;
          t: for (; ; ) {
            for (var k; g !== n || l !== 0 && g.nodeType !== 3 || (i = o + l), g !== u || r !== 0 && g.nodeType !== 3 || (s = o + r), g.nodeType === 3 && (o += g.nodeValue.length), (k = g.firstChild) !== null; )
              h = g, g = k;
            for (; ; ) {
              if (g === e) break t;
              if (h === n && ++p === l && (i = o), h === u && ++y === r && (s = o), (k = g.nextSibling) !== null) break;
              g = h, h = g.parentNode;
            }
            g = k;
          }
          n = i === -1 || s === -1 ? null : { start: i, end: s };
        } else n = null;
      }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (pu = { focusedElem: e, selectionRange: n }, Lr = !1, E = t; E !== null; ) if (t = E, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, E = e;
    else for (; E !== null; ) {
      t = E;
      try {
        var C = t.alternate;
        if (t.flags & 1024) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (C !== null) {
              var x = C.memoizedProps, ue = C.memoizedState, f = t.stateNode, a = f.getSnapshotBeforeUpdate(t.elementType === t.type ? x : lt(t.type, x), ue);
              f.__reactInternalSnapshotBeforeUpdate = a;
            }
            break;
          case 3:
            var d = t.stateNode.containerInfo;
            d.nodeType === 1 ? d.textContent = "" : d.nodeType === 9 && d.documentElement && d.removeChild(d.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(m(163));
        }
      } catch (w) {
        re(t, t.return, w);
      }
      if (e = t.sibling, e !== null) {
        e.return = t.return, E = e;
        break;
      }
      E = t.return;
    }
    return C = Gs, Gs = !1, C;
  }
  function dr(e, t, n) {
    var r = t.updateQueue;
    if (r = r !== null ? r.lastEffect : null, r !== null) {
      var l = r = r.next;
      do {
        if ((l.tag & e) === e) {
          var u = l.destroy;
          l.destroy = void 0, u !== void 0 && eo(t, n, u);
        }
        l = l.next;
      } while (l !== r);
    }
  }
  function fl(e, t) {
    if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
      var n = t = t.next;
      do {
        if ((n.tag & e) === e) {
          var r = n.create;
          n.destroy = r();
        }
        n = n.next;
      } while (n !== t);
    }
  }
  function to(e) {
    var t = e.ref;
    if (t !== null) {
      var n = e.stateNode;
      switch (e.tag) {
        case 5:
          e = n;
          break;
        default:
          e = n;
      }
      typeof t == "function" ? t(e) : t.current = e;
    }
  }
  function Zs(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, Zs(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[dt], delete t[tr], delete t[yu], delete t[Wc], delete t[Qc])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Js(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function qs(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Js(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function no(e, t, n) {
    var r = e.tag;
    if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Hr));
    else if (r !== 4 && (e = e.child, e !== null)) for (no(e, t, n), e = e.sibling; e !== null; ) no(e, t, n), e = e.sibling;
  }
  function ro(e, t, n) {
    var r = e.tag;
    if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (r !== 4 && (e = e.child, e !== null)) for (ro(e, t, n), e = e.sibling; e !== null; ) ro(e, t, n), e = e.sibling;
  }
  var me = null, ut = !1;
  function At(e, t, n) {
    for (n = n.child; n !== null; ) bs(e, t, n), n = n.sibling;
  }
  function bs(e, t, n) {
    if (ft && typeof ft.onCommitFiberUnmount == "function") try {
      ft.onCommitFiberUnmount(Cr, n);
    } catch {
    }
    switch (n.tag) {
      case 5:
        ke || zn(n, t);
      case 6:
        var r = me, l = ut;
        me = null, At(e, t, n), me = r, ut = l, me !== null && (ut ? (e = me, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : me.removeChild(n.stateNode));
        break;
      case 18:
        me !== null && (ut ? (e = me, n = n.stateNode, e.nodeType === 8 ? vu(e.parentNode, n) : e.nodeType === 1 && vu(e, n), Wn(e)) : vu(me, n.stateNode));
        break;
      case 4:
        r = me, l = ut, me = n.stateNode.containerInfo, ut = !0, At(e, t, n), me = r, ut = l;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!ke && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
          l = r = r.next;
          do {
            var u = l, o = u.destroy;
            u = u.tag, o !== void 0 && (u & 2 || u & 4) && eo(n, t, o), l = l.next;
          } while (l !== r);
        }
        At(e, t, n);
        break;
      case 1:
        if (!ke && (zn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
          r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
        } catch (i) {
          re(n, t, i);
        }
        At(e, t, n);
        break;
      case 21:
        At(e, t, n);
        break;
      case 22:
        n.mode & 1 ? (ke = (r = ke) || n.memoizedState !== null, At(e, t, n), ke = r) : At(e, t, n);
        break;
      default:
        At(e, t, n);
    }
  }
  function ea(e) {
    var t = e.updateQueue;
    if (t !== null) {
      e.updateQueue = null;
      var n = e.stateNode;
      n === null && (n = e.stateNode = new sf()), t.forEach(function(r) {
        var l = gf.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(l, l));
      });
    }
  }
  function ot(e, t) {
    var n = t.deletions;
    if (n !== null) for (var r = 0; r < n.length; r++) {
      var l = n[r];
      try {
        var u = e, o = t, i = o;
        e: for (; i !== null; ) {
          switch (i.tag) {
            case 5:
              me = i.stateNode, ut = !1;
              break e;
            case 3:
              me = i.stateNode.containerInfo, ut = !0;
              break e;
            case 4:
              me = i.stateNode.containerInfo, ut = !0;
              break e;
          }
          i = i.return;
        }
        if (me === null) throw Error(m(160));
        bs(u, o, l), me = null, ut = !1;
        var s = l.alternate;
        s !== null && (s.return = null), l.return = null;
      } catch (p) {
        re(l, t, p);
      }
    }
    if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) ta(t, e), t = t.sibling;
  }
  function ta(e, t) {
    var n = e.alternate, r = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (ot(t, e), ht(e), r & 4) {
          try {
            dr(3, e, e.return), fl(3, e);
          } catch (x) {
            re(e, e.return, x);
          }
          try {
            dr(5, e, e.return);
          } catch (x) {
            re(e, e.return, x);
          }
        }
        break;
      case 1:
        ot(t, e), ht(e), r & 512 && n !== null && zn(n, n.return);
        break;
      case 5:
        if (ot(t, e), ht(e), r & 512 && n !== null && zn(n, n.return), e.flags & 32) {
          var l = e.stateNode;
          try {
            Dn(l, "");
          } catch (x) {
            re(e, e.return, x);
          }
        }
        if (r & 4 && (l = e.stateNode, l != null)) {
          var u = e.memoizedProps, o = n !== null ? n.memoizedProps : u, i = e.type, s = e.updateQueue;
          if (e.updateQueue = null, s !== null) try {
            i === "input" && u.type === "radio" && u.name != null && To(l, u), Ml(i, o);
            var p = Ml(i, u);
            for (o = 0; o < s.length; o += 2) {
              var y = s[o], g = s[o + 1];
              y === "style" ? jo(l, g) : y === "dangerouslySetInnerHTML" ? Io(l, g) : y === "children" ? Dn(l, g) : qe(l, y, g, p);
            }
            switch (i) {
              case "input":
                Tl(l, u);
                break;
              case "textarea":
                Oo(l, u);
                break;
              case "select":
                var h = l._wrapperState.wasMultiple;
                l._wrapperState.wasMultiple = !!u.multiple;
                var k = u.value;
                k != null ? on(l, !!u.multiple, k, !1) : h !== !!u.multiple && (u.defaultValue != null ? on(
                  l,
                  !!u.multiple,
                  u.defaultValue,
                  !0
                ) : on(l, !!u.multiple, u.multiple ? [] : "", !1));
            }
            l[tr] = u;
          } catch (x) {
            re(e, e.return, x);
          }
        }
        break;
      case 6:
        if (ot(t, e), ht(e), r & 4) {
          if (e.stateNode === null) throw Error(m(162));
          l = e.stateNode, u = e.memoizedProps;
          try {
            l.nodeValue = u;
          } catch (x) {
            re(e, e.return, x);
          }
        }
        break;
      case 3:
        if (ot(t, e), ht(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
          Wn(t.containerInfo);
        } catch (x) {
          re(e, e.return, x);
        }
        break;
      case 4:
        ot(t, e), ht(e);
        break;
      case 13:
        ot(t, e), ht(e), l = e.child, l.flags & 8192 && (u = l.memoizedState !== null, l.stateNode.isHidden = u, !u || l.alternate !== null && l.alternate.memoizedState !== null || (oo = le())), r & 4 && ea(e);
        break;
      case 22:
        if (y = n !== null && n.memoizedState !== null, e.mode & 1 ? (ke = (p = ke) || y, ot(t, e), ke = p) : ot(t, e), ht(e), r & 8192) {
          if (p = e.memoizedState !== null, (e.stateNode.isHidden = p) && !y && e.mode & 1) for (E = e, y = e.child; y !== null; ) {
            for (g = E = y; E !== null; ) {
              switch (h = E, k = h.child, h.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  dr(4, h, h.return);
                  break;
                case 1:
                  zn(h, h.return);
                  var C = h.stateNode;
                  if (typeof C.componentWillUnmount == "function") {
                    r = h, n = h.return;
                    try {
                      t = r, C.props = t.memoizedProps, C.state = t.memoizedState, C.componentWillUnmount();
                    } catch (x) {
                      re(r, n, x);
                    }
                  }
                  break;
                case 5:
                  zn(h, h.return);
                  break;
                case 22:
                  if (h.memoizedState !== null) {
                    la(g);
                    continue;
                  }
              }
              k !== null ? (k.return = h, E = k) : la(g);
            }
            y = y.sibling;
          }
          e: for (y = null, g = e; ; ) {
            if (g.tag === 5) {
              if (y === null) {
                y = g;
                try {
                  l = g.stateNode, p ? (u = l.style, typeof u.setProperty == "function" ? u.setProperty("display", "none", "important") : u.display = "none") : (i = g.stateNode, s = g.memoizedProps.style, o = s != null && s.hasOwnProperty("display") ? s.display : null, i.style.display = Fo("display", o));
                } catch (x) {
                  re(e, e.return, x);
                }
              }
            } else if (g.tag === 6) {
              if (y === null) try {
                g.stateNode.nodeValue = p ? "" : g.memoizedProps;
              } catch (x) {
                re(e, e.return, x);
              }
            } else if ((g.tag !== 22 && g.tag !== 23 || g.memoizedState === null || g === e) && g.child !== null) {
              g.child.return = g, g = g.child;
              continue;
            }
            if (g === e) break e;
            for (; g.sibling === null; ) {
              if (g.return === null || g.return === e) break e;
              y === g && (y = null), g = g.return;
            }
            y === g && (y = null), g.sibling.return = g.return, g = g.sibling;
          }
        }
        break;
      case 19:
        ot(t, e), ht(e), r & 4 && ea(e);
        break;
      case 21:
        break;
      default:
        ot(
          t,
          e
        ), ht(e);
    }
  }
  function ht(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        e: {
          for (var n = e.return; n !== null; ) {
            if (Js(n)) {
              var r = n;
              break e;
            }
            n = n.return;
          }
          throw Error(m(160));
        }
        switch (r.tag) {
          case 5:
            var l = r.stateNode;
            r.flags & 32 && (Dn(l, ""), r.flags &= -33);
            var u = qs(e);
            ro(e, u, l);
            break;
          case 3:
          case 4:
            var o = r.stateNode.containerInfo, i = qs(e);
            no(e, i, o);
            break;
          default:
            throw Error(m(161));
        }
      } catch (s) {
        re(e, e.return, s);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function cf(e, t, n) {
    E = e, na(e);
  }
  function na(e, t, n) {
    for (var r = (e.mode & 1) !== 0; E !== null; ) {
      var l = E, u = l.child;
      if (l.tag === 22 && r) {
        var o = l.memoizedState !== null || cl;
        if (!o) {
          var i = l.alternate, s = i !== null && i.memoizedState !== null || ke;
          i = cl;
          var p = ke;
          if (cl = o, (ke = s) && !p) for (E = l; E !== null; ) o = E, s = o.child, o.tag === 22 && o.memoizedState !== null ? ua(l) : s !== null ? (s.return = o, E = s) : ua(l);
          for (; u !== null; ) E = u, na(u), u = u.sibling;
          E = l, cl = i, ke = p;
        }
        ra(e);
      } else l.subtreeFlags & 8772 && u !== null ? (u.return = l, E = u) : ra(e);
    }
  }
  function ra(e) {
    for (; E !== null; ) {
      var t = E;
      if (t.flags & 8772) {
        var n = t.alternate;
        try {
          if (t.flags & 8772) switch (t.tag) {
            case 0:
            case 11:
            case 15:
              ke || fl(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !ke) if (n === null) r.componentDidMount();
              else {
                var l = t.elementType === t.type ? n.memoizedProps : lt(t.type, n.memoizedProps);
                r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
              }
              var u = t.updateQueue;
              u !== null && ls(t, u, r);
              break;
            case 3:
              var o = t.updateQueue;
              if (o !== null) {
                if (n = null, t.child !== null) switch (t.child.tag) {
                  case 5:
                    n = t.child.stateNode;
                    break;
                  case 1:
                    n = t.child.stateNode;
                }
                ls(t, o, n);
              }
              break;
            case 5:
              var i = t.stateNode;
              if (n === null && t.flags & 4) {
                n = i;
                var s = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    s.autoFocus && n.focus();
                    break;
                  case "img":
                    s.src && (n.src = s.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var p = t.alternate;
                if (p !== null) {
                  var y = p.memoizedState;
                  if (y !== null) {
                    var g = y.dehydrated;
                    g !== null && Wn(g);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(m(163));
          }
          ke || t.flags & 512 && to(t);
        } catch (h) {
          re(t, t.return, h);
        }
      }
      if (t === e) {
        E = null;
        break;
      }
      if (n = t.sibling, n !== null) {
        n.return = t.return, E = n;
        break;
      }
      E = t.return;
    }
  }
  function la(e) {
    for (; E !== null; ) {
      var t = E;
      if (t === e) {
        E = null;
        break;
      }
      var n = t.sibling;
      if (n !== null) {
        n.return = t.return, E = n;
        break;
      }
      E = t.return;
    }
  }
  function ua(e) {
    for (; E !== null; ) {
      var t = E;
      try {
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            var n = t.return;
            try {
              fl(4, t);
            } catch (s) {
              re(t, n, s);
            }
            break;
          case 1:
            var r = t.stateNode;
            if (typeof r.componentDidMount == "function") {
              var l = t.return;
              try {
                r.componentDidMount();
              } catch (s) {
                re(t, l, s);
              }
            }
            var u = t.return;
            try {
              to(t);
            } catch (s) {
              re(t, u, s);
            }
            break;
          case 5:
            var o = t.return;
            try {
              to(t);
            } catch (s) {
              re(t, o, s);
            }
        }
      } catch (s) {
        re(t, t.return, s);
      }
      if (t === e) {
        E = null;
        break;
      }
      var i = t.sibling;
      if (i !== null) {
        i.return = t.return, E = i;
        break;
      }
      E = t.return;
    }
  }
  var ff = Math.ceil, dl = ye.ReactCurrentDispatcher, lo = ye.ReactCurrentOwner, Ze = ye.ReactCurrentBatchConfig, I = 0, fe = null, oe = null, he = 0, He = 0, Tn = Mt(0), se = 0, pr = null, tn = 0, pl = 0, uo = 0, mr = null, De = null, oo = 0, Ln = 1 / 0, xt = null, ml = !1, io = null, Vt = null, hl = !1, Bt = null, vl = 0, hr = 0, so = null, yl = -1, gl = 0;
  function xe() {
    return I & 6 ? le() : yl !== -1 ? yl : yl = le();
  }
  function Ht(e) {
    return e.mode & 1 ? I & 2 && he !== 0 ? he & -he : Yc.transition !== null ? (gl === 0 && (gl = qo()), gl) : (e = V, e !== 0 || (e = window.event, e = e === void 0 ? 16 : ii(e.type)), e) : 1;
  }
  function it(e, t, n, r) {
    if (50 < hr) throw hr = 0, so = null, Error(m(185));
    An(e, n, r), (!(I & 2) || e !== fe) && (e === fe && (!(I & 2) && (pl |= n), se === 4 && $t(e, he)), Me(e, r), n === 1 && I === 0 && !(t.mode & 1) && (Ln = le() + 500, Kr && Ft()));
  }
  function Me(e, t) {
    var n = e.callbackNode;
    Ya(e, t);
    var r = Nr(e, e === fe ? he : 0);
    if (r === 0) n !== null && Go(n), e.callbackNode = null, e.callbackPriority = 0;
    else if (t = r & -r, e.callbackPriority !== t) {
      if (n != null && Go(n), t === 1) e.tag === 0 ? Kc(ia.bind(null, e)) : Ki(ia.bind(null, e)), Hc(function() {
        !(I & 6) && Ft();
      }), n = null;
      else {
        switch (bo(r)) {
          case 1:
            n = Bl;
            break;
          case 4:
            n = Zo;
            break;
          case 16:
            n = _r;
            break;
          case 536870912:
            n = Jo;
            break;
          default:
            n = _r;
        }
        n = ha(n, oa.bind(null, e));
      }
      e.callbackPriority = t, e.callbackNode = n;
    }
  }
  function oa(e, t) {
    if (yl = -1, gl = 0, I & 6) throw Error(m(327));
    var n = e.callbackNode;
    if (Rn() && e.callbackNode !== n) return null;
    var r = Nr(e, e === fe ? he : 0);
    if (r === 0) return null;
    if (r & 30 || r & e.expiredLanes || t) t = wl(e, r);
    else {
      t = r;
      var l = I;
      I |= 2;
      var u = aa();
      (fe !== e || he !== t) && (xt = null, Ln = le() + 500, rn(e, t));
      do
        try {
          mf();
          break;
        } catch (i) {
          sa(e, i);
        }
      while (!0);
      Pu(), dl.current = u, I = l, oe !== null ? t = 0 : (fe = null, he = 0, t = se);
    }
    if (t !== 0) {
      if (t === 2 && (l = Hl(e), l !== 0 && (r = l, t = ao(e, l))), t === 1) throw n = pr, rn(e, 0), $t(e, r), Me(e, le()), n;
      if (t === 6) $t(e, r);
      else {
        if (l = e.current.alternate, !(r & 30) && !df(l) && (t = wl(e, r), t === 2 && (u = Hl(e), u !== 0 && (r = u, t = ao(e, u))), t === 1)) throw n = pr, rn(e, 0), $t(e, r), Me(e, le()), n;
        switch (e.finishedWork = l, e.finishedLanes = r, t) {
          case 0:
          case 1:
            throw Error(m(345));
          case 2:
            ln(e, De, xt);
            break;
          case 3:
            if ($t(e, r), (r & 130023424) === r && (t = oo + 500 - le(), 10 < t)) {
              if (Nr(e, 0) !== 0) break;
              if (l = e.suspendedLanes, (l & r) !== r) {
                xe(), e.pingedLanes |= e.suspendedLanes & l;
                break;
              }
              e.timeoutHandle = hu(ln.bind(null, e, De, xt), t);
              break;
            }
            ln(e, De, xt);
            break;
          case 4:
            if ($t(e, r), (r & 4194240) === r) break;
            for (t = e.eventTimes, l = -1; 0 < r; ) {
              var o = 31 - tt(r);
              u = 1 << o, o = t[o], o > l && (l = o), r &= ~u;
            }
            if (r = l, r = le() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * ff(r / 1960)) - r, 10 < r) {
              e.timeoutHandle = hu(ln.bind(null, e, De, xt), r);
              break;
            }
            ln(e, De, xt);
            break;
          case 5:
            ln(e, De, xt);
            break;
          default:
            throw Error(m(329));
        }
      }
    }
    return Me(e, le()), e.callbackNode === n ? oa.bind(null, e) : null;
  }
  function ao(e, t) {
    var n = mr;
    return e.current.memoizedState.isDehydrated && (rn(e, t).flags |= 256), e = wl(e, t), e !== 2 && (t = De, De = n, t !== null && co(t)), e;
  }
  function co(e) {
    De === null ? De = e : De.push.apply(De, e);
  }
  function df(e) {
    for (var t = e; ; ) {
      if (t.flags & 16384) {
        var n = t.updateQueue;
        if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
          var l = n[r], u = l.getSnapshot;
          l = l.value;
          try {
            if (!nt(u(), l)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function $t(e, t) {
    for (t &= ~uo, t &= ~pl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
      var n = 31 - tt(t), r = 1 << n;
      e[n] = -1, t &= ~r;
    }
  }
  function ia(e) {
    if (I & 6) throw Error(m(327));
    Rn();
    var t = Nr(e, 0);
    if (!(t & 1)) return Me(e, le()), null;
    var n = wl(e, t);
    if (e.tag !== 0 && n === 2) {
      var r = Hl(e);
      r !== 0 && (t = r, n = ao(e, r));
    }
    if (n === 1) throw n = pr, rn(e, 0), $t(e, t), Me(e, le()), n;
    if (n === 6) throw Error(m(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = t, ln(e, De, xt), Me(e, le()), null;
  }
  function fo(e, t) {
    var n = I;
    I |= 1;
    try {
      return e(t);
    } finally {
      I = n, I === 0 && (Ln = le() + 500, Kr && Ft());
    }
  }
  function nn(e) {
    Bt !== null && Bt.tag === 0 && !(I & 6) && Rn();
    var t = I;
    I |= 1;
    var n = Ze.transition, r = V;
    try {
      if (Ze.transition = null, V = 1, e) return e();
    } finally {
      V = r, Ze.transition = n, I = t, !(I & 6) && Ft();
    }
  }
  function po() {
    He = Tn.current, Y(Tn);
  }
  function rn(e, t) {
    e.finishedWork = null, e.finishedLanes = 0;
    var n = e.timeoutHandle;
    if (n !== -1 && (e.timeoutHandle = -1, Bc(n)), oe !== null) for (n = oe.return; n !== null; ) {
      var r = n;
      switch (ku(r), r.tag) {
        case 1:
          r = r.type.childContextTypes, r != null && Wr();
          break;
        case 3:
          Pn(), Y(Le), Y(ge), Mu();
          break;
        case 5:
          Ou(r);
          break;
        case 4:
          Pn();
          break;
        case 13:
          Y(b);
          break;
        case 19:
          Y(b);
          break;
        case 10:
          Nu(r.type._context);
          break;
        case 22:
        case 23:
          po();
      }
      n = n.return;
    }
    if (fe = e, oe = e = Wt(e.current, null), he = He = t, se = 0, pr = null, uo = pl = tn = 0, De = mr = null, qt !== null) {
      for (t = 0; t < qt.length; t++) if (n = qt[t], r = n.interleaved, r !== null) {
        n.interleaved = null;
        var l = r.next, u = n.pending;
        if (u !== null) {
          var o = u.next;
          u.next = l, r.next = o;
        }
        n.pending = r;
      }
      qt = null;
    }
    return e;
  }
  function sa(e, t) {
    do {
      var n = oe;
      try {
        if (Pu(), nl.current = ol, rl) {
          for (var r = ee.memoizedState; r !== null; ) {
            var l = r.queue;
            l !== null && (l.pending = null), r = r.next;
          }
          rl = !1;
        }
        if (en = 0, ce = ie = ee = null, ir = !1, sr = 0, lo.current = null, n === null || n.return === null) {
          se = 1, pr = t, oe = null;
          break;
        }
        e: {
          var u = e, o = n.return, i = n, s = t;
          if (t = he, i.flags |= 32768, s !== null && typeof s == "object" && typeof s.then == "function") {
            var p = s, y = i, g = y.tag;
            if (!(y.mode & 1) && (g === 0 || g === 11 || g === 15)) {
              var h = y.alternate;
              h ? (y.updateQueue = h.updateQueue, y.memoizedState = h.memoizedState, y.lanes = h.lanes) : (y.updateQueue = null, y.memoizedState = null);
            }
            var k = Ds(o);
            if (k !== null) {
              k.flags &= -257, Ms(k, o, i, u, t), k.mode & 1 && Os(u, p, t), t = k, s = p;
              var C = t.updateQueue;
              if (C === null) {
                var x = /* @__PURE__ */ new Set();
                x.add(s), t.updateQueue = x;
              } else C.add(s);
              break e;
            } else {
              if (!(t & 1)) {
                Os(u, p, t), mo();
                break e;
              }
              s = Error(m(426));
            }
          } else if (J && i.mode & 1) {
            var ue = Ds(o);
            if (ue !== null) {
              !(ue.flags & 65536) && (ue.flags |= 256), Ms(ue, o, i, u, t), Cu(Nn(s, i));
              break e;
            }
          }
          u = s = Nn(s, i), se !== 4 && (se = 2), mr === null ? mr = [u] : mr.push(u), u = o;
          do {
            switch (u.tag) {
              case 3:
                u.flags |= 65536, t &= -t, u.lanes |= t;
                var f = Ls(u, s, t);
                rs(u, f);
                break e;
              case 1:
                i = s;
                var a = u.type, d = u.stateNode;
                if (!(u.flags & 128) && (typeof a.getDerivedStateFromError == "function" || d !== null && typeof d.componentDidCatch == "function" && (Vt === null || !Vt.has(d)))) {
                  u.flags |= 65536, t &= -t, u.lanes |= t;
                  var w = Rs(u, i, t);
                  rs(u, w);
                  break e;
                }
            }
            u = u.return;
          } while (u !== null);
        }
        fa(n);
      } catch (P) {
        t = P, oe === n && n !== null && (oe = n = n.return);
        continue;
      }
      break;
    } while (!0);
  }
  function aa() {
    var e = dl.current;
    return dl.current = ol, e === null ? ol : e;
  }
  function mo() {
    (se === 0 || se === 3 || se === 2) && (se = 4), fe === null || !(tn & 268435455) && !(pl & 268435455) || $t(fe, he);
  }
  function wl(e, t) {
    var n = I;
    I |= 2;
    var r = aa();
    (fe !== e || he !== t) && (xt = null, rn(e, t));
    do
      try {
        pf();
        break;
      } catch (l) {
        sa(e, l);
      }
    while (!0);
    if (Pu(), I = n, dl.current = r, oe !== null) throw Error(m(261));
    return fe = null, he = 0, se;
  }
  function pf() {
    for (; oe !== null; ) ca(oe);
  }
  function mf() {
    for (; oe !== null && !Ua(); ) ca(oe);
  }
  function ca(e) {
    var t = ma(e.alternate, e, He);
    e.memoizedProps = e.pendingProps, t === null ? fa(e) : oe = t, lo.current = null;
  }
  function fa(e) {
    var t = e;
    do {
      var n = t.alternate;
      if (e = t.return, t.flags & 32768) {
        if (n = of(n, t), n !== null) {
          n.flags &= 32767, oe = n;
          return;
        }
        if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
        else {
          se = 6, oe = null;
          return;
        }
      } else if (n = uf(n, t, He), n !== null) {
        oe = n;
        return;
      }
      if (t = t.sibling, t !== null) {
        oe = t;
        return;
      }
      oe = t = e;
    } while (t !== null);
    se === 0 && (se = 5);
  }
  function ln(e, t, n) {
    var r = V, l = Ze.transition;
    try {
      Ze.transition = null, V = 1, hf(e, t, n, r);
    } finally {
      Ze.transition = l, V = r;
    }
    return null;
  }
  function hf(e, t, n, r) {
    do
      Rn();
    while (Bt !== null);
    if (I & 6) throw Error(m(327));
    n = e.finishedWork;
    var l = e.finishedLanes;
    if (n === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(m(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var u = n.lanes | n.childLanes;
    if (Xa(e, u), e === fe && (oe = fe = null, he = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || hl || (hl = !0, ha(_r, function() {
      return Rn(), null;
    })), u = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || u) {
      u = Ze.transition, Ze.transition = null;
      var o = V;
      V = 1;
      var i = I;
      I |= 4, lo.current = null, af(e, n), ta(n, e), Mc(pu), Lr = !!du, pu = du = null, e.current = n, cf(n), Aa(), I = i, V = o, Ze.transition = u;
    } else e.current = n;
    if (hl && (hl = !1, Bt = e, vl = l), u = e.pendingLanes, u === 0 && (Vt = null), Ha(n.stateNode), Me(e, le()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
    if (ml) throw ml = !1, e = io, io = null, e;
    return vl & 1 && e.tag !== 0 && Rn(), u = e.pendingLanes, u & 1 ? e === so ? hr++ : (hr = 0, so = e) : hr = 0, Ft(), null;
  }
  function Rn() {
    if (Bt !== null) {
      var e = bo(vl), t = Ze.transition, n = V;
      try {
        if (Ze.transition = null, V = 16 > e ? 16 : e, Bt === null) var r = !1;
        else {
          if (e = Bt, Bt = null, vl = 0, I & 6) throw Error(m(331));
          var l = I;
          for (I |= 4, E = e.current; E !== null; ) {
            var u = E, o = u.child;
            if (E.flags & 16) {
              var i = u.deletions;
              if (i !== null) {
                for (var s = 0; s < i.length; s++) {
                  var p = i[s];
                  for (E = p; E !== null; ) {
                    var y = E;
                    switch (y.tag) {
                      case 0:
                      case 11:
                      case 15:
                        dr(8, y, u);
                    }
                    var g = y.child;
                    if (g !== null) g.return = y, E = g;
                    else for (; E !== null; ) {
                      y = E;
                      var h = y.sibling, k = y.return;
                      if (Zs(y), y === p) {
                        E = null;
                        break;
                      }
                      if (h !== null) {
                        h.return = k, E = h;
                        break;
                      }
                      E = k;
                    }
                  }
                }
                var C = u.alternate;
                if (C !== null) {
                  var x = C.child;
                  if (x !== null) {
                    C.child = null;
                    do {
                      var ue = x.sibling;
                      x.sibling = null, x = ue;
                    } while (x !== null);
                  }
                }
                E = u;
              }
            }
            if (u.subtreeFlags & 2064 && o !== null) o.return = u, E = o;
            else e: for (; E !== null; ) {
              if (u = E, u.flags & 2048) switch (u.tag) {
                case 0:
                case 11:
                case 15:
                  dr(9, u, u.return);
              }
              var f = u.sibling;
              if (f !== null) {
                f.return = u.return, E = f;
                break e;
              }
              E = u.return;
            }
          }
          var a = e.current;
          for (E = a; E !== null; ) {
            o = E;
            var d = o.child;
            if (o.subtreeFlags & 2064 && d !== null) d.return = o, E = d;
            else e: for (o = a; E !== null; ) {
              if (i = E, i.flags & 2048) try {
                switch (i.tag) {
                  case 0:
                  case 11:
                  case 15:
                    fl(9, i);
                }
              } catch (P) {
                re(i, i.return, P);
              }
              if (i === o) {
                E = null;
                break e;
              }
              var w = i.sibling;
              if (w !== null) {
                w.return = i.return, E = w;
                break e;
              }
              E = i.return;
            }
          }
          if (I = l, Ft(), ft && typeof ft.onPostCommitFiberRoot == "function") try {
            ft.onPostCommitFiberRoot(Cr, e);
          } catch {
          }
          r = !0;
        }
        return r;
      } finally {
        V = n, Ze.transition = t;
      }
    }
    return !1;
  }
  function da(e, t, n) {
    t = Nn(n, t), t = Ls(e, t, 1), e = Ut(e, t, 1), t = xe(), e !== null && (An(e, 1, t), Me(e, t));
  }
  function re(e, t, n) {
    if (e.tag === 3) da(e, e, n);
    else for (; t !== null; ) {
      if (t.tag === 3) {
        da(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Vt === null || !Vt.has(r))) {
          e = Nn(n, e), e = Rs(t, e, 1), t = Ut(t, e, 1), e = xe(), t !== null && (An(t, 1, e), Me(t, e));
          break;
        }
      }
      t = t.return;
    }
  }
  function vf(e, t, n) {
    var r = e.pingCache;
    r !== null && r.delete(t), t = xe(), e.pingedLanes |= e.suspendedLanes & n, fe === e && (he & n) === n && (se === 4 || se === 3 && (he & 130023424) === he && 500 > le() - oo ? rn(e, 0) : uo |= n), Me(e, t);
  }
  function pa(e, t) {
    t === 0 && (e.mode & 1 ? (t = Pr, Pr <<= 1, !(Pr & 130023424) && (Pr = 4194304)) : t = 1);
    var n = xe();
    e = Et(e, t), e !== null && (An(e, t, n), Me(e, n));
  }
  function yf(e) {
    var t = e.memoizedState, n = 0;
    t !== null && (n = t.retryLane), pa(e, n);
  }
  function gf(e, t) {
    var n = 0;
    switch (e.tag) {
      case 13:
        var r = e.stateNode, l = e.memoizedState;
        l !== null && (n = l.retryLane);
        break;
      case 19:
        r = e.stateNode;
        break;
      default:
        throw Error(m(314));
    }
    r !== null && r.delete(t), pa(e, n);
  }
  var ma;
  ma = function(e, t, n) {
    if (e !== null) if (e.memoizedProps !== t.pendingProps || Le.current) Oe = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return Oe = !1, lf(e, t, n);
      Oe = !!(e.flags & 131072);
    }
    else Oe = !1, J && t.flags & 1048576 && Yi(t, Xr, t.index);
    switch (t.lanes = 0, t.tag) {
      case 2:
        var r = t.type;
        al(e, t), e = t.pendingProps;
        var l = wn(t, ge.current);
        xn(t, n), l = ju(null, t, r, e, l, n);
        var u = Uu();
        return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Re(r) ? (u = !0, Qr(t)) : u = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, Lu(t), l.updater = il, t.stateNode = l, l._reactInternals = t, Wu(t, r, e, n), t = Xu(null, t, r, !0, u, n)) : (t.tag = 0, J && u && Su(t), Ce(null, t, l, n), t = t.child), t;
      case 16:
        r = t.elementType;
        e: {
          switch (al(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = Sf(r), e = lt(r, e), l) {
            case 0:
              t = Yu(null, t, r, e, n);
              break e;
            case 1:
              t = Vs(null, t, r, e, n);
              break e;
            case 11:
              t = Is(null, t, r, e, n);
              break e;
            case 14:
              t = Fs(null, t, r, lt(r.type, e), n);
              break e;
          }
          throw Error(m(
            306,
            r,
            ""
          ));
        }
        return t;
      case 0:
        return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : lt(r, l), Yu(e, t, r, l, n);
      case 1:
        return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : lt(r, l), Vs(e, t, r, l, n);
      case 3:
        e: {
          if (Bs(t), e === null) throw Error(m(387));
          r = t.pendingProps, u = t.memoizedState, l = u.element, ns(e, t), el(t, r, null, n);
          var o = t.memoizedState;
          if (r = o.element, u.isDehydrated) if (u = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = u, t.memoizedState = u, t.flags & 256) {
            l = Nn(Error(m(423)), t), t = Hs(e, t, r, n, l);
            break e;
          } else if (r !== l) {
            l = Nn(Error(m(424)), t), t = Hs(e, t, r, n, l);
            break e;
          } else for (Be = Dt(t.stateNode.containerInfo.firstChild), Ve = t, J = !0, rt = null, n = es(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
          else {
            if (En(), r === l) {
              t = Ct(e, t, n);
              break e;
            }
            Ce(e, t, r, n);
          }
          t = t.child;
        }
        return t;
      case 5:
        return us(t), e === null && _u(t), r = t.type, l = t.pendingProps, u = e !== null ? e.memoizedProps : null, o = l.children, mu(r, l) ? o = null : u !== null && mu(r, u) && (t.flags |= 32), As(e, t), Ce(e, t, o, n), t.child;
      case 6:
        return e === null && _u(t), null;
      case 13:
        return $s(e, t, n);
      case 4:
        return Ru(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = _n(t, null, r, n) : Ce(e, t, r, n), t.child;
      case 11:
        return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : lt(r, l), Is(e, t, r, l, n);
      case 7:
        return Ce(e, t, t.pendingProps, n), t.child;
      case 8:
        return Ce(e, t, t.pendingProps.children, n), t.child;
      case 12:
        return Ce(e, t, t.pendingProps.children, n), t.child;
      case 10:
        e: {
          if (r = t.type._context, l = t.pendingProps, u = t.memoizedProps, o = l.value, Q(Jr, r._currentValue), r._currentValue = o, u !== null) if (nt(u.value, o)) {
            if (u.children === l.children && !Le.current) {
              t = Ct(e, t, n);
              break e;
            }
          } else for (u = t.child, u !== null && (u.return = t); u !== null; ) {
            var i = u.dependencies;
            if (i !== null) {
              o = u.child;
              for (var s = i.firstContext; s !== null; ) {
                if (s.context === r) {
                  if (u.tag === 1) {
                    s = _t(-1, n & -n), s.tag = 2;
                    var p = u.updateQueue;
                    if (p !== null) {
                      p = p.shared;
                      var y = p.pending;
                      y === null ? s.next = s : (s.next = y.next, y.next = s), p.pending = s;
                    }
                  }
                  u.lanes |= n, s = u.alternate, s !== null && (s.lanes |= n), zu(
                    u.return,
                    n,
                    t
                  ), i.lanes |= n;
                  break;
                }
                s = s.next;
              }
            } else if (u.tag === 10) o = u.type === t.type ? null : u.child;
            else if (u.tag === 18) {
              if (o = u.return, o === null) throw Error(m(341));
              o.lanes |= n, i = o.alternate, i !== null && (i.lanes |= n), zu(o, n, t), o = u.sibling;
            } else o = u.child;
            if (o !== null) o.return = u;
            else for (o = u; o !== null; ) {
              if (o === t) {
                o = null;
                break;
              }
              if (u = o.sibling, u !== null) {
                u.return = o.return, o = u;
                break;
              }
              o = o.return;
            }
            u = o;
          }
          Ce(e, t, l.children, n), t = t.child;
        }
        return t;
      case 9:
        return l = t.type, r = t.pendingProps.children, xn(t, n), l = Xe(l), r = r(l), t.flags |= 1, Ce(e, t, r, n), t.child;
      case 14:
        return r = t.type, l = lt(r, t.pendingProps), l = lt(r.type, l), Fs(e, t, r, l, n);
      case 15:
        return js(e, t, t.type, t.pendingProps, n);
      case 17:
        return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : lt(r, l), al(e, t), t.tag = 1, Re(r) ? (e = !0, Qr(t)) : e = !1, xn(t, n), zs(t, r, l), Wu(t, r, l, n), Xu(null, t, r, !0, e, n);
      case 19:
        return Qs(e, t, n);
      case 22:
        return Us(e, t, n);
    }
    throw Error(m(156, t.tag));
  };
  function ha(e, t) {
    return Xo(e, t);
  }
  function wf(e, t, n, r) {
    this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Je(e, t, n, r) {
    return new wf(e, t, n, r);
  }
  function ho(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function Sf(e) {
    if (typeof e == "function") return ho(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === at) return 11;
      if (e === ct) return 14;
    }
    return 2;
  }
  function Wt(e, t) {
    var n = e.alternate;
    return n === null ? (n = Je(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
  }
  function Sl(e, t, n, r, l, u) {
    var o = 2;
    if (r = e, typeof e == "function") ho(e) && (o = 1);
    else if (typeof e == "string") o = 5;
    else e: switch (e) {
      case ze:
        return un(n.children, l, u, t);
      case Qe:
        o = 8, l |= 8;
        break;
      case Pt:
        return e = Je(12, n, t, l | 2), e.elementType = Pt, e.lanes = u, e;
      case je:
        return e = Je(13, n, t, l), e.elementType = je, e.lanes = u, e;
      case et:
        return e = Je(19, n, t, l), e.elementType = et, e.lanes = u, e;
      case ne:
        return kl(n, l, u, t);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case yt:
            o = 10;
            break e;
          case Kt:
            o = 9;
            break e;
          case at:
            o = 11;
            break e;
          case ct:
            o = 14;
            break e;
          case Te:
            o = 16, r = null;
            break e;
        }
        throw Error(m(130, e == null ? e : typeof e, ""));
    }
    return t = Je(o, n, t, l), t.elementType = e, t.type = r, t.lanes = u, t;
  }
  function un(e, t, n, r) {
    return e = Je(7, e, r, t), e.lanes = n, e;
  }
  function kl(e, t, n, r) {
    return e = Je(22, e, r, t), e.elementType = ne, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
  }
  function vo(e, t, n) {
    return e = Je(6, e, null, t), e.lanes = n, e;
  }
  function yo(e, t, n) {
    return t = Je(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
  }
  function kf(e, t, n, r, l) {
    this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = $l(0), this.expirationTimes = $l(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = $l(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
  }
  function go(e, t, n, r, l, u, o, i, s) {
    return e = new kf(e, t, n, i, s), t === 1 ? (t = 1, u === !0 && (t |= 8)) : t = 0, u = Je(3, null, null, t), e.current = u, u.stateNode = e, u.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Lu(u), e;
  }
  function Ef(e, t, n) {
    var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: _e, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
  }
  function va(e) {
    if (!e) return It;
    e = e._reactInternals;
    e: {
      if (Yt(e) !== e || e.tag !== 1) throw Error(m(170));
      var t = e;
      do {
        switch (t.tag) {
          case 3:
            t = t.stateNode.context;
            break e;
          case 1:
            if (Re(t.type)) {
              t = t.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        t = t.return;
      } while (t !== null);
      throw Error(m(171));
    }
    if (e.tag === 1) {
      var n = e.type;
      if (Re(n)) return Wi(e, n, t);
    }
    return t;
  }
  function ya(e, t, n, r, l, u, o, i, s) {
    return e = go(n, r, !0, e, l, u, o, i, s), e.context = va(null), n = e.current, r = xe(), l = Ht(n), u = _t(r, l), u.callback = t ?? null, Ut(n, u, l), e.current.lanes = l, An(e, l, r), Me(e, r), e;
  }
  function El(e, t, n, r) {
    var l = t.current, u = xe(), o = Ht(l);
    return n = va(n), t.context === null ? t.context = n : t.pendingContext = n, t = _t(u, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = Ut(l, t, o), e !== null && (it(e, l, o, u), br(e, l, o)), o;
  }
  function _l(e) {
    if (e = e.current, !e.child) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function ga(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function wo(e, t) {
    ga(e, t), (e = e.alternate) && ga(e, t);
  }
  function _f() {
    return null;
  }
  var wa = typeof reportError == "function" ? reportError : function(e) {
    console.error(e);
  };
  function So(e) {
    this._internalRoot = e;
  }
  Cl.prototype.render = So.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(m(409));
    El(e, t, null, null);
  }, Cl.prototype.unmount = So.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      nn(function() {
        El(null, e, null, null);
      }), t[gt] = null;
    }
  };
  function Cl(e) {
    this._internalRoot = e;
  }
  Cl.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = ni();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < Lt.length && t !== 0 && t < Lt[n].priority; n++) ;
      Lt.splice(n, 0, e), n === 0 && ui(e);
    }
  };
  function ko(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function xl(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function Sa() {
  }
  function Cf(e, t, n, r, l) {
    if (l) {
      if (typeof r == "function") {
        var u = r;
        r = function() {
          var p = _l(o);
          u.call(p);
        };
      }
      var o = ya(t, r, e, 0, null, !1, !1, "", Sa);
      return e._reactRootContainer = o, e[gt] = o.current, bn(e.nodeType === 8 ? e.parentNode : e), nn(), o;
    }
    for (; l = e.lastChild; ) e.removeChild(l);
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var p = _l(s);
        i.call(p);
      };
    }
    var s = go(e, 0, !1, null, null, !1, !1, "", Sa);
    return e._reactRootContainer = s, e[gt] = s.current, bn(e.nodeType === 8 ? e.parentNode : e), nn(function() {
      El(t, s, n, r);
    }), s;
  }
  function Pl(e, t, n, r, l) {
    var u = n._reactRootContainer;
    if (u) {
      var o = u;
      if (typeof l == "function") {
        var i = l;
        l = function() {
          var s = _l(o);
          i.call(s);
        };
      }
      El(t, o, e, l);
    } else o = Cf(n, t, e, l, r);
    return _l(o);
  }
  ei = function(e) {
    switch (e.tag) {
      case 3:
        var t = e.stateNode;
        if (t.current.memoizedState.isDehydrated) {
          var n = Un(t.pendingLanes);
          n !== 0 && (Wl(t, n | 1), Me(t, le()), !(I & 6) && (Ln = le() + 500, Ft()));
        }
        break;
      case 13:
        nn(function() {
          var r = Et(e, 1);
          if (r !== null) {
            var l = xe();
            it(r, e, 1, l);
          }
        }), wo(e, 1);
    }
  }, Ql = function(e) {
    if (e.tag === 13) {
      var t = Et(e, 134217728);
      if (t !== null) {
        var n = xe();
        it(t, e, 134217728, n);
      }
      wo(e, 134217728);
    }
  }, ti = function(e) {
    if (e.tag === 13) {
      var t = Ht(e), n = Et(e, t);
      if (n !== null) {
        var r = xe();
        it(n, e, t, r);
      }
      wo(e, t);
    }
  }, ni = function() {
    return V;
  }, ri = function(e, t) {
    var n = V;
    try {
      return V = e, t();
    } finally {
      V = n;
    }
  }, jl = function(e, t, n) {
    switch (t) {
      case "input":
        if (Tl(e, n), t = n.name, n.type === "radio" && t != null) {
          for (n = e; n.parentNode; ) n = n.parentNode;
          for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
            var r = n[t];
            if (r !== e && r.form === e.form) {
              var l = $r(r);
              if (!l) throw Error(m(90));
              No(r), Tl(r, l);
            }
          }
        }
        break;
      case "textarea":
        Oo(e, n);
        break;
      case "select":
        t = n.value, t != null && on(e, !!n.multiple, t, !1);
    }
  }, Bo = fo, Ho = nn;
  var xf = { usingClientEntryPoint: !1, Events: [nr, yn, $r, Ao, Vo, fo] }, vr = { findFiberByHostInstance: Xt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Pf = { bundleType: vr.bundleType, version: vr.version, rendererPackageName: vr.rendererPackageName, rendererConfig: vr.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ye.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = Ko(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: vr.findFiberByHostInstance || _f, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Nl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Nl.isDisabled && Nl.supportsFiber) try {
      Cr = Nl.inject(Pf), ft = Nl;
    } catch {
    }
  }
  return Ie.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = xf, Ie.createPortal = function(e, t) {
    var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!ko(t)) throw Error(m(200));
    return Ef(e, t, null, n);
  }, Ie.createRoot = function(e, t) {
    if (!ko(e)) throw Error(m(299));
    var n = !1, r = "", l = wa;
    return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = go(e, 1, !1, null, null, n, !1, r, l), e[gt] = t.current, bn(e.nodeType === 8 ? e.parentNode : e), new So(t);
  }, Ie.findDOMNode = function(e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(m(188)) : (e = Object.keys(e).join(","), Error(m(268, e)));
    return e = Ko(t), e = e === null ? null : e.stateNode, e;
  }, Ie.flushSync = function(e) {
    return nn(e);
  }, Ie.hydrate = function(e, t, n) {
    if (!xl(t)) throw Error(m(200));
    return Pl(null, e, t, !0, n);
  }, Ie.hydrateRoot = function(e, t, n) {
    if (!ko(e)) throw Error(m(405));
    var r = n != null && n.hydratedSources || null, l = !1, u = "", o = wa;
    if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (u = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = ya(t, null, e, 1, n ?? null, l, !1, u, o), e[gt] = t.current, bn(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
      n,
      l
    );
    return new Cl(t);
  }, Ie.render = function(e, t, n) {
    if (!xl(t)) throw Error(m(200));
    return Pl(null, e, t, !1, n);
  }, Ie.unmountComponentAtNode = function(e) {
    if (!xl(e)) throw Error(m(40));
    return e._reactRootContainer ? (nn(function() {
      Pl(null, null, e, !1, function() {
        e._reactRootContainer = null, e[gt] = null;
      });
    }), !0) : !1;
  }, Ie.unstable_batchedUpdates = fo, Ie.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
    if (!xl(n)) throw Error(m(200));
    if (e == null || e._reactInternals === void 0) throw Error(m(38));
    return Pl(e, t, n, !1, r);
  }, Ie.version = "18.3.1-next-f1338f8080-20240426", Ie;
}
function Ta() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ta);
    } catch (L) {
      console.error(L);
    }
}
Ta(), za.exports = Df();
var Mf = za.exports, xa = Mf;
xo.createRoot = xa.createRoot, xo.hydrateRoot = xa.hydrateRoot;
var La = { exports: {} }, yr = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Pa;
function If() {
  if (Pa) return yr;
  Pa = 1;
  var L = Po, te = Symbol.for("react.element"), m = Symbol.for("react.fragment"), pe = Object.prototype.hasOwnProperty, Pe = L.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Fe = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Ne(ae, B, Ee) {
    var ve, q = {}, X = null, $e = null;
    Ee !== void 0 && (X = "" + Ee), B.key !== void 0 && (X = "" + B.key), B.ref !== void 0 && ($e = B.ref);
    for (ve in B) pe.call(B, ve) && !Fe.hasOwnProperty(ve) && (q[ve] = B[ve]);
    if (ae && ae.defaultProps) for (ve in B = ae.defaultProps, B) q[ve] === void 0 && (q[ve] = B[ve]);
    return { $$typeof: te, type: ae, key: X, ref: $e, props: q, _owner: Pe.current };
  }
  return yr.Fragment = m, yr.jsx = Ne, yr.jsxs = Ne, yr;
}
La.exports = If();
var Co = La.exports;
function Ff({ actor: L }) {
  return /* @__PURE__ */ Co.jsxs("div", { className: "p-4 bg-slate-900 text-slate-100 min-h-full", children: [
    /* @__PURE__ */ Co.jsxs("h1", { className: "text-2xl font-bold text-amber-500", children: [
      "React Sheet Connected: ",
      L.name
    ] }),
    /* @__PURE__ */ Co.jsx("p", { className: "mt-2 text-slate-300", children: "If you are seeing this, Aeris Core successfully mounted the React interface." })
  ] });
}
Hooks.once("init", () => {
  class L extends ActorSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "aeris-pf1e-react-sheet",
        classes: ["pf1e", "sheet", "actor"],
        width: 800,
        height: 700
      });
    }
    // Generate an empty container for React to live inside
    async _renderInner(m) {
      const pe = document.createElement("div");
      return pe.className = "react-sheet-container", pe.style.height = "100%", $(pe);
    }
    // Once the window exists on the screen, inject the React App
    activateListeners(m) {
      super.activateListeners(m);
      const pe = m[0];
      this._reactRoot || (this._reactRoot = xo.createRoot(pe)), this._reactRoot.render(Lf.createElement(Ff, { actor: this.actor }));
    }
    // Destroy the React instance when the window closes to prevent memory leaks
    async close(m = {}) {
      return this._reactRoot && (this._reactRoot.unmount(), this._reactRoot = null), super.close(m);
    }
  }
  Actors.registerSheet("pf1", L, {
    types: ["character"],
    makeDefault: !1,
    label: "React Character Sheet"
  });
});
//# sourceMappingURL=aeris-pf1e-sheet.js.map
