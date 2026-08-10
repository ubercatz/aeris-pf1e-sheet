import { AerisActorSheet as $r } from "aeris-core";
function Fr(O) {
  return O && O.__esModule && Object.prototype.hasOwnProperty.call(O, "default") ? O.default : O;
}
var We = { exports: {} }, d = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ot;
function xr() {
  if (Ot) return d;
  Ot = 1;
  var O = Symbol.for("react.element"), l = Symbol.for("react.portal"), Te = Symbol.for("react.fragment"), z = Symbol.for("react.strict_mode"), fe = Symbol.for("react.profiler"), B = Symbol.for("react.provider"), ee = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), re = Symbol.for("react.suspense"), H = Symbol.for("react.memo"), M = Symbol.for("react.lazy"), V = Symbol.iterator;
  function ne(r) {
    return r === null || typeof r != "object" ? null : (r = V && r[V] || r["@@iterator"], typeof r == "function" ? r : null);
  }
  var D = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, U = Object.assign, le = {};
  function $(r, o, p) {
    this.props = r, this.context = o, this.refs = le, this.updater = p || D;
  }
  $.prototype.isReactComponent = {}, $.prototype.setState = function(r, o) {
    if (typeof r != "object" && typeof r != "function" && r != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, r, o, "setState");
  }, $.prototype.forceUpdate = function(r) {
    this.updater.enqueueForceUpdate(this, r, "forceUpdate");
  };
  function de() {
  }
  de.prototype = $.prototype;
  function q(r, o, p) {
    this.props = r, this.context = o, this.refs = le, this.updater = p || D;
  }
  var K = q.prototype = new de();
  K.constructor = q, U(K, $.prototype), K.isPureReactComponent = !0;
  var F = Array.isArray, T = Object.prototype.hasOwnProperty, j = { current: null }, x = { key: !0, ref: !0, __self: !0, __source: !0 };
  function W(r, o, p) {
    var y, h = {}, w = null, E = null;
    if (o != null) for (y in o.ref !== void 0 && (E = o.ref), o.key !== void 0 && (w = "" + o.key), o) T.call(o, y) && !x.hasOwnProperty(y) && (h[y] = o[y]);
    var R = arguments.length - 2;
    if (R === 1) h.children = p;
    else if (1 < R) {
      for (var g = Array(R), P = 0; P < R; P++) g[P] = arguments[P + 2];
      h.children = g;
    }
    if (r && r.defaultProps) for (y in R = r.defaultProps, R) h[y] === void 0 && (h[y] = R[y]);
    return { $$typeof: O, type: r, key: w, ref: E, props: h, _owner: j.current };
  }
  function pe(r, o) {
    return { $$typeof: O, type: r.type, key: o, ref: r.ref, props: r.props, _owner: r._owner };
  }
  function ae(r) {
    return typeof r == "object" && r !== null && r.$$typeof === O;
  }
  function ke(r) {
    var o = { "=": "=0", ":": "=2" };
    return "$" + r.replace(/[=:]/g, function(p) {
      return o[p];
    });
  }
  var ve = /\/+/g;
  function oe(r, o) {
    return typeof r == "object" && r !== null && r.key != null ? ke("" + r.key) : o.toString(36);
  }
  function G(r, o, p, y, h) {
    var w = typeof r;
    (w === "undefined" || w === "boolean") && (r = null);
    var E = !1;
    if (r === null) E = !0;
    else switch (w) {
      case "string":
      case "number":
        E = !0;
        break;
      case "object":
        switch (r.$$typeof) {
          case O:
          case l:
            E = !0;
        }
    }
    if (E) return E = r, h = h(E), r = y === "" ? "." + oe(E, 0) : y, F(h) ? (p = "", r != null && (p = r.replace(ve, "$&/") + "/"), G(h, o, p, "", function(P) {
      return P;
    })) : h != null && (ae(h) && (h = pe(h, p + (!h.key || E && E.key === h.key ? "" : ("" + h.key).replace(ve, "$&/") + "/") + r)), o.push(h)), 1;
    if (E = 0, y = y === "" ? "." : y + ":", F(r)) for (var R = 0; R < r.length; R++) {
      w = r[R];
      var g = y + oe(w, R);
      E += G(w, o, p, g, h);
    }
    else if (g = ne(r), typeof g == "function") for (r = g.call(r), R = 0; !(w = r.next()).done; ) w = w.value, g = y + oe(w, R++), E += G(w, o, p, g, h);
    else if (w === "object") throw o = String(r), Error("Objects are not valid as a React child (found: " + (o === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : o) + "). If you meant to render a collection of children, use an array instead.");
    return E;
  }
  function I(r, o, p) {
    if (r == null) return r;
    var y = [], h = 0;
    return G(r, y, "", "", function(w) {
      return o.call(p, w, h++);
    }), y;
  }
  function L(r) {
    if (r._status === -1) {
      var o = r._result;
      o = o(), o.then(function(p) {
        (r._status === 0 || r._status === -1) && (r._status = 1, r._result = p);
      }, function(p) {
        (r._status === 0 || r._status === -1) && (r._status = 2, r._result = p);
      }), r._status === -1 && (r._status = 0, r._result = o);
    }
    if (r._status === 1) return r._result.default;
    throw r._result;
  }
  var c = { current: null }, Y = { transition: null }, ye = { ReactCurrentDispatcher: c, ReactCurrentBatchConfig: Y, ReactCurrentOwner: j };
  function Q() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return d.Children = { map: I, forEach: function(r, o, p) {
    I(r, function() {
      o.apply(this, arguments);
    }, p);
  }, count: function(r) {
    var o = 0;
    return I(r, function() {
      o++;
    }), o;
  }, toArray: function(r) {
    return I(r, function(o) {
      return o;
    }) || [];
  }, only: function(r) {
    if (!ae(r)) throw Error("React.Children.only expected to receive a single React element child.");
    return r;
  } }, d.Component = $, d.Fragment = Te, d.Profiler = fe, d.PureComponent = q, d.StrictMode = z, d.Suspense = re, d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ye, d.act = Q, d.cloneElement = function(r, o, p) {
    if (r == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + r + ".");
    var y = U({}, r.props), h = r.key, w = r.ref, E = r._owner;
    if (o != null) {
      if (o.ref !== void 0 && (w = o.ref, E = j.current), o.key !== void 0 && (h = "" + o.key), r.type && r.type.defaultProps) var R = r.type.defaultProps;
      for (g in o) T.call(o, g) && !x.hasOwnProperty(g) && (y[g] = o[g] === void 0 && R !== void 0 ? R[g] : o[g]);
    }
    var g = arguments.length - 2;
    if (g === 1) y.children = p;
    else if (1 < g) {
      R = Array(g);
      for (var P = 0; P < g; P++) R[P] = arguments[P + 2];
      y.children = R;
    }
    return { $$typeof: O, type: r.type, key: h, ref: w, props: y, _owner: E };
  }, d.createContext = function(r) {
    return r = { $$typeof: ee, _currentValue: r, _currentValue2: r, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, r.Provider = { $$typeof: B, _context: r }, r.Consumer = r;
  }, d.createElement = W, d.createFactory = function(r) {
    var o = W.bind(null, r);
    return o.type = r, o;
  }, d.createRef = function() {
    return { current: null };
  }, d.forwardRef = function(r) {
    return { $$typeof: te, render: r };
  }, d.isValidElement = ae, d.lazy = function(r) {
    return { $$typeof: M, _payload: { _status: -1, _result: r }, _init: L };
  }, d.memo = function(r, o) {
    return { $$typeof: H, type: r, compare: o === void 0 ? null : o };
  }, d.startTransition = function(r) {
    var o = Y.transition;
    Y.transition = {};
    try {
      r();
    } finally {
      Y.transition = o;
    }
  }, d.unstable_act = Q, d.useCallback = function(r, o) {
    return c.current.useCallback(r, o);
  }, d.useContext = function(r) {
    return c.current.useContext(r);
  }, d.useDebugValue = function() {
  }, d.useDeferredValue = function(r) {
    return c.current.useDeferredValue(r);
  }, d.useEffect = function(r, o) {
    return c.current.useEffect(r, o);
  }, d.useId = function() {
    return c.current.useId();
  }, d.useImperativeHandle = function(r, o, p) {
    return c.current.useImperativeHandle(r, o, p);
  }, d.useInsertionEffect = function(r, o) {
    return c.current.useInsertionEffect(r, o);
  }, d.useLayoutEffect = function(r, o) {
    return c.current.useLayoutEffect(r, o);
  }, d.useMemo = function(r, o) {
    return c.current.useMemo(r, o);
  }, d.useReducer = function(r, o, p) {
    return c.current.useReducer(r, o, p);
  }, d.useRef = function(r) {
    return c.current.useRef(r);
  }, d.useState = function(r) {
    return c.current.useState(r);
  }, d.useSyncExternalStore = function(r, o, p) {
    return c.current.useSyncExternalStore(r, o, p);
  }, d.useTransition = function() {
    return c.current.useTransition();
  }, d.version = "18.3.1", d;
}
var ce = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
ce.exports;
var Tt;
function Lr() {
  return Tt || (Tt = 1, function(O, l) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var Te = "18.3.1", z = Symbol.for("react.element"), fe = Symbol.for("react.portal"), B = Symbol.for("react.fragment"), ee = Symbol.for("react.strict_mode"), te = Symbol.for("react.profiler"), re = Symbol.for("react.provider"), H = Symbol.for("react.context"), M = Symbol.for("react.forward_ref"), V = Symbol.for("react.suspense"), ne = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), U = Symbol.for("react.lazy"), le = Symbol.for("react.offscreen"), $ = Symbol.iterator, de = "@@iterator";
      function q(e) {
        if (e === null || typeof e != "object")
          return null;
        var t = $ && e[$] || e[de];
        return typeof t == "function" ? t : null;
      }
      var K = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, F = {
        transition: null
      }, T = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, j = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, x = {}, W = null;
      function pe(e) {
        W = e;
      }
      x.setExtraStackFrame = function(e) {
        W = e;
      }, x.getCurrentStack = null, x.getStackAddendum = function() {
        var e = "";
        W && (e += W);
        var t = x.getCurrentStack;
        return t && (e += t() || ""), e;
      };
      var ae = !1, ke = !1, ve = !1, oe = !1, G = !1, I = {
        ReactCurrentDispatcher: K,
        ReactCurrentBatchConfig: F,
        ReactCurrentOwner: j
      };
      I.ReactDebugCurrentFrame = x, I.ReactCurrentActQueue = T;
      function L(e) {
        {
          for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), a = 1; a < t; a++)
            n[a - 1] = arguments[a];
          Y("warn", e, n);
        }
      }
      function c(e) {
        {
          for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), a = 1; a < t; a++)
            n[a - 1] = arguments[a];
          Y("error", e, n);
        }
      }
      function Y(e, t, n) {
        {
          var a = I.ReactDebugCurrentFrame, u = a.getStackAddendum();
          u !== "" && (t += "%s", n = n.concat([u]));
          var s = n.map(function(i) {
            return String(i);
          });
          s.unshift("Warning: " + t), Function.prototype.apply.call(console[e], console, s);
        }
      }
      var ye = {};
      function Q(e, t) {
        {
          var n = e.constructor, a = n && (n.displayName || n.name) || "ReactClass", u = a + "." + t;
          if (ye[u])
            return;
          c("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, a), ye[u] = !0;
        }
      }
      var r = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: function(e) {
          return !1;
        },
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: function(e, t, n) {
          Q(e, "forceUpdate");
        },
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: function(e, t, n, a) {
          Q(e, "replaceState");
        },
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: function(e, t, n, a) {
          Q(e, "setState");
        }
      }, o = Object.assign, p = {};
      Object.freeze(p);
      function y(e, t, n) {
        this.props = e, this.context = t, this.refs = p, this.updater = n || r;
      }
      y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
        if (typeof e != "object" && typeof e != "function" && e != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, e, t, "setState");
      }, y.prototype.forceUpdate = function(e) {
        this.updater.enqueueForceUpdate(this, e, "forceUpdate");
      };
      {
        var h = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, w = function(e, t) {
          Object.defineProperty(y.prototype, e, {
            get: function() {
              L("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
            }
          });
        };
        for (var E in h)
          h.hasOwnProperty(E) && w(E, h[E]);
      }
      function R() {
      }
      R.prototype = y.prototype;
      function g(e, t, n) {
        this.props = e, this.context = t, this.refs = p, this.updater = n || r;
      }
      var P = g.prototype = new R();
      P.constructor = g, o(P, y.prototype), P.isPureReactComponent = !0;
      function kt() {
        var e = {
          current: null
        };
        return Object.seal(e), e;
      }
      var Pt = Array.isArray;
      function he(e) {
        return Pt(e);
      }
      function At(e) {
        {
          var t = typeof Symbol == "function" && Symbol.toStringTag, n = t && e[Symbol.toStringTag] || e.constructor.name || "Object";
          return n;
        }
      }
      function jt(e) {
        try {
          return Ye(e), !1;
        } catch {
          return !0;
        }
      }
      function Ye(e) {
        return "" + e;
      }
      function me(e) {
        if (jt(e))
          return c("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", At(e)), Ye(e);
      }
      function It(e, t, n) {
        var a = e.displayName;
        if (a)
          return a;
        var u = t.displayName || t.name || "";
        return u !== "" ? n + "(" + u + ")" : n;
      }
      function ze(e) {
        return e.displayName || "Context";
      }
      function N(e) {
        if (e == null)
          return null;
        if (typeof e.tag == "number" && c("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
          return e.displayName || e.name || null;
        if (typeof e == "string")
          return e;
        switch (e) {
          case B:
            return "Fragment";
          case fe:
            return "Portal";
          case te:
            return "Profiler";
          case ee:
            return "StrictMode";
          case V:
            return "Suspense";
          case ne:
            return "SuspenseList";
        }
        if (typeof e == "object")
          switch (e.$$typeof) {
            case H:
              var t = e;
              return ze(t) + ".Consumer";
            case re:
              var n = e;
              return ze(n._context) + ".Provider";
            case M:
              return It(e, e.render, "ForwardRef");
            case D:
              var a = e.displayName || null;
              return a !== null ? a : N(e.type) || "Memo";
            case U: {
              var u = e, s = u._payload, i = u._init;
              try {
                return N(i(s));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var ue = Object.prototype.hasOwnProperty, Be = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, He, qe, Pe;
      Pe = {};
      function Ke(e) {
        if (ue.call(e, "ref")) {
          var t = Object.getOwnPropertyDescriptor(e, "ref").get;
          if (t && t.isReactWarning)
            return !1;
        }
        return e.ref !== void 0;
      }
      function Ge(e) {
        if (ue.call(e, "key")) {
          var t = Object.getOwnPropertyDescriptor(e, "key").get;
          if (t && t.isReactWarning)
            return !1;
        }
        return e.key !== void 0;
      }
      function Dt(e, t) {
        var n = function() {
          He || (He = !0, c("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", t));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: n,
          configurable: !0
        });
      }
      function $t(e, t) {
        var n = function() {
          qe || (qe = !0, c("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", t));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: n,
          configurable: !0
        });
      }
      function Ft(e) {
        if (typeof e.ref == "string" && j.current && e.__self && j.current.stateNode !== e.__self) {
          var t = N(j.current.type);
          Pe[t] || (c('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', t, e.ref), Pe[t] = !0);
        }
      }
      var Ae = function(e, t, n, a, u, s, i) {
        var f = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: z,
          // Built-in properties that belong on the element
          type: e,
          key: t,
          ref: n,
          props: i,
          // Record the component responsible for creating this element.
          _owner: s
        };
        return f._store = {}, Object.defineProperty(f._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(f, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: a
        }), Object.defineProperty(f, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: u
        }), Object.freeze && (Object.freeze(f.props), Object.freeze(f)), f;
      };
      function xt(e, t, n) {
        var a, u = {}, s = null, i = null, f = null, v = null;
        if (t != null) {
          Ke(t) && (i = t.ref, Ft(t)), Ge(t) && (me(t.key), s = "" + t.key), f = t.__self === void 0 ? null : t.__self, v = t.__source === void 0 ? null : t.__source;
          for (a in t)
            ue.call(t, a) && !Be.hasOwnProperty(a) && (u[a] = t[a]);
        }
        var m = arguments.length - 2;
        if (m === 1)
          u.children = n;
        else if (m > 1) {
          for (var _ = Array(m), b = 0; b < m; b++)
            _[b] = arguments[b + 2];
          Object.freeze && Object.freeze(_), u.children = _;
        }
        if (e && e.defaultProps) {
          var C = e.defaultProps;
          for (a in C)
            u[a] === void 0 && (u[a] = C[a]);
        }
        if (s || i) {
          var S = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          s && Dt(u, S), i && $t(u, S);
        }
        return Ae(e, s, i, f, v, j.current, u);
      }
      function Lt(e, t) {
        var n = Ae(e.type, t, e.ref, e._self, e._source, e._owner, e.props);
        return n;
      }
      function Nt(e, t, n) {
        if (e == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
        var a, u = o({}, e.props), s = e.key, i = e.ref, f = e._self, v = e._source, m = e._owner;
        if (t != null) {
          Ke(t) && (i = t.ref, m = j.current), Ge(t) && (me(t.key), s = "" + t.key);
          var _;
          e.type && e.type.defaultProps && (_ = e.type.defaultProps);
          for (a in t)
            ue.call(t, a) && !Be.hasOwnProperty(a) && (t[a] === void 0 && _ !== void 0 ? u[a] = _[a] : u[a] = t[a]);
        }
        var b = arguments.length - 2;
        if (b === 1)
          u.children = n;
        else if (b > 1) {
          for (var C = Array(b), S = 0; S < b; S++)
            C[S] = arguments[S + 2];
          u.children = C;
        }
        return Ae(e.type, s, i, f, v, m, u);
      }
      function X(e) {
        return typeof e == "object" && e !== null && e.$$typeof === z;
      }
      var Qe = ".", Mt = ":";
      function Vt(e) {
        var t = /[=:]/g, n = {
          "=": "=0",
          ":": "=2"
        }, a = e.replace(t, function(u) {
          return n[u];
        });
        return "$" + a;
      }
      var Xe = !1, Ut = /\/+/g;
      function Je(e) {
        return e.replace(Ut, "$&/");
      }
      function je(e, t) {
        return typeof e == "object" && e !== null && e.key != null ? (me(e.key), Vt("" + e.key)) : t.toString(36);
      }
      function ge(e, t, n, a, u) {
        var s = typeof e;
        (s === "undefined" || s === "boolean") && (e = null);
        var i = !1;
        if (e === null)
          i = !0;
        else
          switch (s) {
            case "string":
            case "number":
              i = !0;
              break;
            case "object":
              switch (e.$$typeof) {
                case z:
                case fe:
                  i = !0;
              }
          }
        if (i) {
          var f = e, v = u(f), m = a === "" ? Qe + je(f, 0) : a;
          if (he(v)) {
            var _ = "";
            m != null && (_ = Je(m) + "/"), ge(v, t, _, "", function(Dr) {
              return Dr;
            });
          } else v != null && (X(v) && (v.key && (!f || f.key !== v.key) && me(v.key), v = Lt(
            v,
            // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            n + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            (v.key && (!f || f.key !== v.key) ? (
              // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
              // eslint-disable-next-line react-internal/safe-string-coercion
              Je("" + v.key) + "/"
            ) : "") + m
          )), t.push(v));
          return 1;
        }
        var b, C, S = 0, k = a === "" ? Qe : a + Mt;
        if (he(e))
          for (var Oe = 0; Oe < e.length; Oe++)
            b = e[Oe], C = k + je(b, Oe), S += ge(b, t, n, C, u);
        else {
          var Ve = q(e);
          if (typeof Ve == "function") {
            var Ct = e;
            Ve === Ct.entries && (Xe || L("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Xe = !0);
            for (var jr = Ve.call(Ct), wt, Ir = 0; !(wt = jr.next()).done; )
              b = wt.value, C = k + je(b, Ir++), S += ge(b, t, n, C, u);
          } else if (s === "object") {
            var St = String(e);
            throw new Error("Objects are not valid as a React child (found: " + (St === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : St) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return S;
      }
      function _e(e, t, n) {
        if (e == null)
          return e;
        var a = [], u = 0;
        return ge(e, a, "", "", function(s) {
          return t.call(n, s, u++);
        }), a;
      }
      function Wt(e) {
        var t = 0;
        return _e(e, function() {
          t++;
        }), t;
      }
      function Yt(e, t, n) {
        _e(e, function() {
          t.apply(this, arguments);
        }, n);
      }
      function zt(e) {
        return _e(e, function(t) {
          return t;
        }) || [];
      }
      function Bt(e) {
        if (!X(e))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return e;
      }
      function Ht(e) {
        var t = {
          $$typeof: H,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: e,
          _currentValue2: e,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        t.Provider = {
          $$typeof: re,
          _context: t
        };
        var n = !1, a = !1, u = !1;
        {
          var s = {
            $$typeof: H,
            _context: t
          };
          Object.defineProperties(s, {
            Provider: {
              get: function() {
                return a || (a = !0, c("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), t.Provider;
              },
              set: function(i) {
                t.Provider = i;
              }
            },
            _currentValue: {
              get: function() {
                return t._currentValue;
              },
              set: function(i) {
                t._currentValue = i;
              }
            },
            _currentValue2: {
              get: function() {
                return t._currentValue2;
              },
              set: function(i) {
                t._currentValue2 = i;
              }
            },
            _threadCount: {
              get: function() {
                return t._threadCount;
              },
              set: function(i) {
                t._threadCount = i;
              }
            },
            Consumer: {
              get: function() {
                return n || (n = !0, c("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), t.Consumer;
              }
            },
            displayName: {
              get: function() {
                return t.displayName;
              },
              set: function(i) {
                u || (L("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", i), u = !0);
              }
            }
          }), t.Consumer = s;
        }
        return t._currentRenderer = null, t._currentRenderer2 = null, t;
      }
      var ie = -1, Ie = 0, Ze = 1, qt = 2;
      function Kt(e) {
        if (e._status === ie) {
          var t = e._result, n = t();
          if (n.then(function(s) {
            if (e._status === Ie || e._status === ie) {
              var i = e;
              i._status = Ze, i._result = s;
            }
          }, function(s) {
            if (e._status === Ie || e._status === ie) {
              var i = e;
              i._status = qt, i._result = s;
            }
          }), e._status === ie) {
            var a = e;
            a._status = Ie, a._result = n;
          }
        }
        if (e._status === Ze) {
          var u = e._result;
          return u === void 0 && c(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, u), "default" in u || c(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, u), u.default;
        } else
          throw e._result;
      }
      function Gt(e) {
        var t = {
          // We use these fields to store the result.
          _status: ie,
          _result: e
        }, n = {
          $$typeof: U,
          _payload: t,
          _init: Kt
        };
        {
          var a, u;
          Object.defineProperties(n, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return a;
              },
              set: function(s) {
                c("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), a = s, Object.defineProperty(n, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return u;
              },
              set: function(s) {
                c("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), u = s, Object.defineProperty(n, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return n;
      }
      function Qt(e) {
        e != null && e.$$typeof === D ? c("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e != "function" ? c("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e) : e.length !== 0 && e.length !== 2 && c("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), e != null && (e.defaultProps != null || e.propTypes != null) && c("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var t = {
          $$typeof: M,
          render: e
        };
        {
          var n;
          Object.defineProperty(t, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return n;
            },
            set: function(a) {
              n = a, !e.name && !e.displayName && (e.displayName = a);
            }
          });
        }
        return t;
      }
      var et;
      et = Symbol.for("react.module.reference");
      function tt(e) {
        return !!(typeof e == "string" || typeof e == "function" || e === B || e === te || G || e === ee || e === V || e === ne || oe || e === le || ae || ke || ve || typeof e == "object" && e !== null && (e.$$typeof === U || e.$$typeof === D || e.$$typeof === re || e.$$typeof === H || e.$$typeof === M || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        e.$$typeof === et || e.getModuleId !== void 0));
      }
      function Xt(e, t) {
        tt(e) || c("memo: The first argument must be a component. Instead received: %s", e === null ? "null" : typeof e);
        var n = {
          $$typeof: D,
          type: e,
          compare: t === void 0 ? null : t
        };
        {
          var a;
          Object.defineProperty(n, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return a;
            },
            set: function(u) {
              a = u, !e.name && !e.displayName && (e.displayName = u);
            }
          });
        }
        return n;
      }
      function A() {
        var e = K.current;
        return e === null && c(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), e;
      }
      function Jt(e) {
        var t = A();
        if (e._context !== void 0) {
          var n = e._context;
          n.Consumer === e ? c("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : n.Provider === e && c("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return t.useContext(e);
      }
      function Zt(e) {
        var t = A();
        return t.useState(e);
      }
      function er(e, t, n) {
        var a = A();
        return a.useReducer(e, t, n);
      }
      function tr(e) {
        var t = A();
        return t.useRef(e);
      }
      function rr(e, t) {
        var n = A();
        return n.useEffect(e, t);
      }
      function nr(e, t) {
        var n = A();
        return n.useInsertionEffect(e, t);
      }
      function ar(e, t) {
        var n = A();
        return n.useLayoutEffect(e, t);
      }
      function or(e, t) {
        var n = A();
        return n.useCallback(e, t);
      }
      function ur(e, t) {
        var n = A();
        return n.useMemo(e, t);
      }
      function ir(e, t, n) {
        var a = A();
        return a.useImperativeHandle(e, t, n);
      }
      function sr(e, t) {
        {
          var n = A();
          return n.useDebugValue(e, t);
        }
      }
      function cr() {
        var e = A();
        return e.useTransition();
      }
      function fr(e) {
        var t = A();
        return t.useDeferredValue(e);
      }
      function lr() {
        var e = A();
        return e.useId();
      }
      function dr(e, t, n) {
        var a = A();
        return a.useSyncExternalStore(e, t, n);
      }
      var se = 0, rt, nt, at, ot, ut, it, st;
      function ct() {
      }
      ct.__reactDisabledLog = !0;
      function pr() {
        {
          if (se === 0) {
            rt = console.log, nt = console.info, at = console.warn, ot = console.error, ut = console.group, it = console.groupCollapsed, st = console.groupEnd;
            var e = {
              configurable: !0,
              enumerable: !0,
              value: ct,
              writable: !0
            };
            Object.defineProperties(console, {
              info: e,
              log: e,
              warn: e,
              error: e,
              group: e,
              groupCollapsed: e,
              groupEnd: e
            });
          }
          se++;
        }
      }
      function vr() {
        {
          if (se--, se === 0) {
            var e = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: o({}, e, {
                value: rt
              }),
              info: o({}, e, {
                value: nt
              }),
              warn: o({}, e, {
                value: at
              }),
              error: o({}, e, {
                value: ot
              }),
              group: o({}, e, {
                value: ut
              }),
              groupCollapsed: o({}, e, {
                value: it
              }),
              groupEnd: o({}, e, {
                value: st
              })
            });
          }
          se < 0 && c("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var De = I.ReactCurrentDispatcher, $e;
      function be(e, t, n) {
        {
          if ($e === void 0)
            try {
              throw Error();
            } catch (u) {
              var a = u.stack.trim().match(/\n( *(at )?)/);
              $e = a && a[1] || "";
            }
          return `
` + $e + e;
        }
      }
      var Fe = !1, Ee;
      {
        var yr = typeof WeakMap == "function" ? WeakMap : Map;
        Ee = new yr();
      }
      function ft(e, t) {
        if (!e || Fe)
          return "";
        {
          var n = Ee.get(e);
          if (n !== void 0)
            return n;
        }
        var a;
        Fe = !0;
        var u = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var s;
        s = De.current, De.current = null, pr();
        try {
          if (t) {
            var i = function() {
              throw Error();
            };
            if (Object.defineProperty(i.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(i, []);
              } catch (k) {
                a = k;
              }
              Reflect.construct(e, [], i);
            } else {
              try {
                i.call();
              } catch (k) {
                a = k;
              }
              e.call(i.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (k) {
              a = k;
            }
            e();
          }
        } catch (k) {
          if (k && a && typeof k.stack == "string") {
            for (var f = k.stack.split(`
`), v = a.stack.split(`
`), m = f.length - 1, _ = v.length - 1; m >= 1 && _ >= 0 && f[m] !== v[_]; )
              _--;
            for (; m >= 1 && _ >= 0; m--, _--)
              if (f[m] !== v[_]) {
                if (m !== 1 || _ !== 1)
                  do
                    if (m--, _--, _ < 0 || f[m] !== v[_]) {
                      var b = `
` + f[m].replace(" at new ", " at ");
                      return e.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", e.displayName)), typeof e == "function" && Ee.set(e, b), b;
                    }
                  while (m >= 1 && _ >= 0);
                break;
              }
          }
        } finally {
          Fe = !1, De.current = s, vr(), Error.prepareStackTrace = u;
        }
        var C = e ? e.displayName || e.name : "", S = C ? be(C) : "";
        return typeof e == "function" && Ee.set(e, S), S;
      }
      function hr(e, t, n) {
        return ft(e, !1);
      }
      function mr(e) {
        var t = e.prototype;
        return !!(t && t.isReactComponent);
      }
      function Re(e, t, n) {
        if (e == null)
          return "";
        if (typeof e == "function")
          return ft(e, mr(e));
        if (typeof e == "string")
          return be(e);
        switch (e) {
          case V:
            return be("Suspense");
          case ne:
            return be("SuspenseList");
        }
        if (typeof e == "object")
          switch (e.$$typeof) {
            case M:
              return hr(e.render);
            case D:
              return Re(e.type, t, n);
            case U: {
              var a = e, u = a._payload, s = a._init;
              try {
                return Re(s(u), t, n);
              } catch {
              }
            }
          }
        return "";
      }
      var lt = {}, dt = I.ReactDebugCurrentFrame;
      function Ce(e) {
        if (e) {
          var t = e._owner, n = Re(e.type, e._source, t ? t.type : null);
          dt.setExtraStackFrame(n);
        } else
          dt.setExtraStackFrame(null);
      }
      function gr(e, t, n, a, u) {
        {
          var s = Function.call.bind(ue);
          for (var i in e)
            if (s(e, i)) {
              var f = void 0;
              try {
                if (typeof e[i] != "function") {
                  var v = Error((a || "React class") + ": " + n + " type `" + i + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[i] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw v.name = "Invariant Violation", v;
                }
                f = e[i](t, i, a, n, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (m) {
                f = m;
              }
              f && !(f instanceof Error) && (Ce(u), c("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", a || "React class", n, i, typeof f), Ce(null)), f instanceof Error && !(f.message in lt) && (lt[f.message] = !0, Ce(u), c("Failed %s type: %s", n, f.message), Ce(null));
            }
        }
      }
      function J(e) {
        if (e) {
          var t = e._owner, n = Re(e.type, e._source, t ? t.type : null);
          pe(n);
        } else
          pe(null);
      }
      var xe;
      xe = !1;
      function pt() {
        if (j.current) {
          var e = N(j.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
      function _r(e) {
        if (e !== void 0) {
          var t = e.fileName.replace(/^.*[\\\/]/, ""), n = e.lineNumber;
          return `

Check your code at ` + t + ":" + n + ".";
        }
        return "";
      }
      function br(e) {
        return e != null ? _r(e.__source) : "";
      }
      var vt = {};
      function Er(e) {
        var t = pt();
        if (!t) {
          var n = typeof e == "string" ? e : e.displayName || e.name;
          n && (t = `

Check the top-level render call using <` + n + ">.");
        }
        return t;
      }
      function yt(e, t) {
        if (!(!e._store || e._store.validated || e.key != null)) {
          e._store.validated = !0;
          var n = Er(t);
          if (!vt[n]) {
            vt[n] = !0;
            var a = "";
            e && e._owner && e._owner !== j.current && (a = " It was passed a child from " + N(e._owner.type) + "."), J(e), c('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', n, a), J(null);
          }
        }
      }
      function ht(e, t) {
        if (typeof e == "object") {
          if (he(e))
            for (var n = 0; n < e.length; n++) {
              var a = e[n];
              X(a) && yt(a, t);
            }
          else if (X(e))
            e._store && (e._store.validated = !0);
          else if (e) {
            var u = q(e);
            if (typeof u == "function" && u !== e.entries)
              for (var s = u.call(e), i; !(i = s.next()).done; )
                X(i.value) && yt(i.value, t);
          }
        }
      }
      function mt(e) {
        {
          var t = e.type;
          if (t == null || typeof t == "string")
            return;
          var n;
          if (typeof t == "function")
            n = t.propTypes;
          else if (typeof t == "object" && (t.$$typeof === M || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          t.$$typeof === D))
            n = t.propTypes;
          else
            return;
          if (n) {
            var a = N(t);
            gr(n, e.props, "prop", a, e);
          } else if (t.PropTypes !== void 0 && !xe) {
            xe = !0;
            var u = N(t);
            c("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", u || "Unknown");
          }
          typeof t.getDefaultProps == "function" && !t.getDefaultProps.isReactClassApproved && c("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function Rr(e) {
        {
          for (var t = Object.keys(e.props), n = 0; n < t.length; n++) {
            var a = t[n];
            if (a !== "children" && a !== "key") {
              J(e), c("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", a), J(null);
              break;
            }
          }
          e.ref !== null && (J(e), c("Invalid attribute `ref` supplied to `React.Fragment`."), J(null));
        }
      }
      function gt(e, t, n) {
        var a = tt(e);
        if (!a) {
          var u = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (u += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var s = br(t);
          s ? u += s : u += pt();
          var i;
          e === null ? i = "null" : he(e) ? i = "array" : e !== void 0 && e.$$typeof === z ? (i = "<" + (N(e.type) || "Unknown") + " />", u = " Did you accidentally export a JSX literal instead of a component?") : i = typeof e, c("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", i, u);
        }
        var f = xt.apply(this, arguments);
        if (f == null)
          return f;
        if (a)
          for (var v = 2; v < arguments.length; v++)
            ht(arguments[v], e);
        return e === B ? Rr(f) : mt(f), f;
      }
      var _t = !1;
      function Cr(e) {
        var t = gt.bind(null, e);
        return t.type = e, _t || (_t = !0, L("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(t, "type", {
          enumerable: !1,
          get: function() {
            return L("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: e
            }), e;
          }
        }), t;
      }
      function wr(e, t, n) {
        for (var a = Nt.apply(this, arguments), u = 2; u < arguments.length; u++)
          ht(arguments[u], a.type);
        return mt(a), a;
      }
      function Sr(e, t) {
        var n = F.transition;
        F.transition = {};
        var a = F.transition;
        F.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          e();
        } finally {
          if (F.transition = n, n === null && a._updatedFibers) {
            var u = a._updatedFibers.size;
            u > 10 && L("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), a._updatedFibers.clear();
          }
        }
      }
      var bt = !1, we = null;
      function Or(e) {
        if (we === null)
          try {
            var t = ("require" + Math.random()).slice(0, 7), n = O && O[t];
            we = n.call(O, "timers").setImmediate;
          } catch {
            we = function(u) {
              bt === !1 && (bt = !0, typeof MessageChannel > "u" && c("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var s = new MessageChannel();
              s.port1.onmessage = u, s.port2.postMessage(void 0);
            };
          }
        return we(e);
      }
      var Z = 0, Et = !1;
      function Rt(e) {
        {
          var t = Z;
          Z++, T.current === null && (T.current = []);
          var n = T.isBatchingLegacy, a;
          try {
            if (T.isBatchingLegacy = !0, a = e(), !n && T.didScheduleLegacyUpdate) {
              var u = T.current;
              u !== null && (T.didScheduleLegacyUpdate = !1, Me(u));
            }
          } catch (C) {
            throw Se(t), C;
          } finally {
            T.isBatchingLegacy = n;
          }
          if (a !== null && typeof a == "object" && typeof a.then == "function") {
            var s = a, i = !1, f = {
              then: function(C, S) {
                i = !0, s.then(function(k) {
                  Se(t), Z === 0 ? Le(k, C, S) : C(k);
                }, function(k) {
                  Se(t), S(k);
                });
              }
            };
            return !Et && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              i || (Et = !0, c("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), f;
          } else {
            var v = a;
            if (Se(t), Z === 0) {
              var m = T.current;
              m !== null && (Me(m), T.current = null);
              var _ = {
                then: function(C, S) {
                  T.current === null ? (T.current = [], Le(v, C, S)) : C(v);
                }
              };
              return _;
            } else {
              var b = {
                then: function(C, S) {
                  C(v);
                }
              };
              return b;
            }
          }
        }
      }
      function Se(e) {
        e !== Z - 1 && c("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Z = e;
      }
      function Le(e, t, n) {
        {
          var a = T.current;
          if (a !== null)
            try {
              Me(a), Or(function() {
                a.length === 0 ? (T.current = null, t(e)) : Le(e, t, n);
              });
            } catch (u) {
              n(u);
            }
          else
            t(e);
        }
      }
      var Ne = !1;
      function Me(e) {
        if (!Ne) {
          Ne = !0;
          var t = 0;
          try {
            for (; t < e.length; t++) {
              var n = e[t];
              do
                n = n(!0);
              while (n !== null);
            }
            e.length = 0;
          } catch (a) {
            throw e = e.slice(t + 1), a;
          } finally {
            Ne = !1;
          }
        }
      }
      var Tr = gt, kr = wr, Pr = Cr, Ar = {
        map: _e,
        forEach: Yt,
        count: Wt,
        toArray: zt,
        only: Bt
      };
      l.Children = Ar, l.Component = y, l.Fragment = B, l.Profiler = te, l.PureComponent = g, l.StrictMode = ee, l.Suspense = V, l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = I, l.act = Rt, l.cloneElement = kr, l.createContext = Ht, l.createElement = Tr, l.createFactory = Pr, l.createRef = kt, l.forwardRef = Qt, l.isValidElement = X, l.lazy = Gt, l.memo = Xt, l.startTransition = Sr, l.unstable_act = Rt, l.useCallback = or, l.useContext = Jt, l.useDebugValue = sr, l.useDeferredValue = fr, l.useEffect = rr, l.useId = lr, l.useImperativeHandle = ir, l.useInsertionEffect = nr, l.useLayoutEffect = ar, l.useMemo = ur, l.useReducer = er, l.useRef = tr, l.useState = Zt, l.useSyncExternalStore = dr, l.useTransition = cr, l.version = Te, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(ce, ce.exports)), ce.exports;
}
process.env.NODE_ENV === "production" ? We.exports = xr() : We.exports = Lr();
var Nr = We.exports;
const Ue = /* @__PURE__ */ Fr(Nr);
function Mr({ actor: O }) {
  return /* @__PURE__ */ Ue.createElement("div", { className: "p-4 bg-slate-900 text-slate-100 min-h-full" }, /* @__PURE__ */ Ue.createElement("h1", { className: "text-2xl font-bold text-amber-500" }, "React Sheet Connected: ", O.name), /* @__PURE__ */ Ue.createElement("p", { className: "mt-2 text-slate-300" }, "If you are seeing this, Aeris Core successfully mounted the React interface."));
}
class Vr extends $r {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-pf1e-react-sheet",
      classes: ["pf1e", "sheet", "actor"],
      width: 800,
      height: 700
    });
  }
  get reactComponent() {
    return Mr;
  }
}
Hooks.once("init", () => {
  Actors.registerSheet("pf1", Vr, {
    types: ["character"],
    makeDefault: !1,
    label: "Aeris Core React Sheet"
  });
});
//# sourceMappingURL=aeris-pf1e-sheet.js.map
