var C = { exports: {} }, _ = {}, j = { exports: {} }, n = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var y = Symbol.for("react.element"), L = Symbol.for("react.portal"), U = Symbol.for("react.fragment"), V = Symbol.for("react.strict_mode"), q = Symbol.for("react.profiler"), M = Symbol.for("react.provider"), B = Symbol.for("react.context"), H = Symbol.for("react.forward_ref"), z = Symbol.for("react.suspense"), W = Symbol.for("react.memo"), J = Symbol.for("react.lazy"), b = Symbol.iterator;
function Y(e) {
  return e === null || typeof e != "object" ? null : (e = b && e[b] || e["@@iterator"], typeof e == "function" ? e : null);
}
var O = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, g = Object.assign, P = {};
function p(e, t, o) {
  this.props = e, this.context = t, this.refs = P, this.updater = o || O;
}
p.prototype.isReactComponent = {};
p.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
p.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function A() {
}
A.prototype = p.prototype;
function R(e, t, o) {
  this.props = e, this.context = t, this.refs = P, this.updater = o || O;
}
var x = R.prototype = new A();
x.constructor = R;
g(x, p.prototype);
x.isPureReactComponent = !0;
var $ = Array.isArray, I = Object.prototype.hasOwnProperty, E = { current: null }, N = { key: !0, ref: !0, __self: !0, __source: !0 };
function T(e, t, o) {
  var r, u = {}, s = null, i = null;
  if (t != null) for (r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (s = "" + t.key), t) I.call(t, r) && !N.hasOwnProperty(r) && (u[r] = t[r]);
  var f = arguments.length - 2;
  if (f === 1) u.children = o;
  else if (1 < f) {
    for (var c = Array(f), a = 0; a < f; a++) c[a] = arguments[a + 2];
    u.children = c;
  }
  if (e && e.defaultProps) for (r in f = e.defaultProps, f) u[r] === void 0 && (u[r] = f[r]);
  return { $$typeof: y, type: e, key: s, ref: i, props: u, _owner: E.current };
}
function G(e, t) {
  return { $$typeof: y, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function k(e) {
  return typeof e == "object" && e !== null && e.$$typeof === y;
}
function K(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(o) {
    return t[o];
  });
}
var w = /\/+/g;
function v(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? K("" + e.key) : t.toString(36);
}
function h(e, t, o, r, u) {
  var s = typeof e;
  (s === "undefined" || s === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else switch (s) {
    case "string":
    case "number":
      i = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case y:
        case L:
          i = !0;
      }
  }
  if (i) return i = e, u = u(i), e = r === "" ? "." + v(i, 0) : r, $(u) ? (o = "", e != null && (o = e.replace(w, "$&/") + "/"), h(u, t, o, "", function(a) {
    return a;
  })) : u != null && (k(u) && (u = G(u, o + (!u.key || i && i.key === u.key ? "" : ("" + u.key).replace(w, "$&/") + "/") + e)), t.push(u)), 1;
  if (i = 0, r = r === "" ? "." : r + ":", $(e)) for (var f = 0; f < e.length; f++) {
    s = e[f];
    var c = r + v(s, f);
    i += h(s, t, o, c, u);
  }
  else if (c = Y(e), typeof c == "function") for (e = c.call(e), f = 0; !(s = e.next()).done; ) s = s.value, c = r + v(s, f++), i += h(s, t, o, c, u);
  else if (s === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return i;
}
function d(e, t, o) {
  if (e == null) return e;
  var r = [], u = 0;
  return h(e, r, "", "", function(s) {
    return t.call(o, s, u++);
  }), r;
}
function Q(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(o) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = o);
    }, function(o) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = o);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var l = { current: null }, m = { transition: null }, X = { ReactCurrentDispatcher: l, ReactCurrentBatchConfig: m, ReactCurrentOwner: E };
function D() {
  throw Error("act(...) is not supported in production builds of React.");
}
n.Children = { map: d, forEach: function(e, t, o) {
  d(e, function() {
    t.apply(this, arguments);
  }, o);
}, count: function(e) {
  var t = 0;
  return d(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return d(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!k(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
n.Component = p;
n.Fragment = U;
n.Profiler = q;
n.PureComponent = R;
n.StrictMode = V;
n.Suspense = z;
n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = X;
n.act = D;
n.cloneElement = function(e, t, o) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = g({}, e.props), u = e.key, s = e.ref, i = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (s = t.ref, i = E.current), t.key !== void 0 && (u = "" + t.key), e.type && e.type.defaultProps) var f = e.type.defaultProps;
    for (c in t) I.call(t, c) && !N.hasOwnProperty(c) && (r[c] = t[c] === void 0 && f !== void 0 ? f[c] : t[c]);
  }
  var c = arguments.length - 2;
  if (c === 1) r.children = o;
  else if (1 < c) {
    f = Array(c);
    for (var a = 0; a < c; a++) f[a] = arguments[a + 2];
    r.children = f;
  }
  return { $$typeof: y, type: e.type, key: u, ref: s, props: r, _owner: i };
};
n.createContext = function(e) {
  return e = { $$typeof: B, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: M, _context: e }, e.Consumer = e;
};
n.createElement = T;
n.createFactory = function(e) {
  var t = T.bind(null, e);
  return t.type = e, t;
};
n.createRef = function() {
  return { current: null };
};
n.forwardRef = function(e) {
  return { $$typeof: H, render: e };
};
n.isValidElement = k;
n.lazy = function(e) {
  return { $$typeof: J, _payload: { _status: -1, _result: e }, _init: Q };
};
n.memo = function(e, t) {
  return { $$typeof: W, type: e, compare: t === void 0 ? null : t };
};
n.startTransition = function(e) {
  var t = m.transition;
  m.transition = {};
  try {
    e();
  } finally {
    m.transition = t;
  }
};
n.unstable_act = D;
n.useCallback = function(e, t) {
  return l.current.useCallback(e, t);
};
n.useContext = function(e) {
  return l.current.useContext(e);
};
n.useDebugValue = function() {
};
n.useDeferredValue = function(e) {
  return l.current.useDeferredValue(e);
};
n.useEffect = function(e, t) {
  return l.current.useEffect(e, t);
};
n.useId = function() {
  return l.current.useId();
};
n.useImperativeHandle = function(e, t, o) {
  return l.current.useImperativeHandle(e, t, o);
};
n.useInsertionEffect = function(e, t) {
  return l.current.useInsertionEffect(e, t);
};
n.useLayoutEffect = function(e, t) {
  return l.current.useLayoutEffect(e, t);
};
n.useMemo = function(e, t) {
  return l.current.useMemo(e, t);
};
n.useReducer = function(e, t, o) {
  return l.current.useReducer(e, t, o);
};
n.useRef = function(e) {
  return l.current.useRef(e);
};
n.useState = function(e) {
  return l.current.useState(e);
};
n.useSyncExternalStore = function(e, t, o) {
  return l.current.useSyncExternalStore(e, t, o);
};
n.useTransition = function() {
  return l.current.useTransition();
};
n.version = "18.3.1";
j.exports = n;
var Z = j.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ee = Z, te = Symbol.for("react.element"), re = Symbol.for("react.fragment"), ne = Object.prototype.hasOwnProperty, oe = ee.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, ue = { key: !0, ref: !0, __self: !0, __source: !0 };
function F(e, t, o) {
  var r, u = {}, s = null, i = null;
  o !== void 0 && (s = "" + o), t.key !== void 0 && (s = "" + t.key), t.ref !== void 0 && (i = t.ref);
  for (r in t) ne.call(t, r) && !ue.hasOwnProperty(r) && (u[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) u[r] === void 0 && (u[r] = t[r]);
  return { $$typeof: te, type: e, key: s, ref: i, props: u, _owner: oe.current };
}
_.Fragment = re;
_.jsx = F;
_.jsxs = F;
C.exports = _;
var S = C.exports;
function se({ actor: e }) {
  return /* @__PURE__ */ S.jsxs("div", { className: "p-4 bg-slate-900 text-slate-100 min-h-full", children: [
    /* @__PURE__ */ S.jsxs("h1", { className: "text-2xl font-bold text-amber-500", children: [
      "React Sheet Connected: ",
      e.name
    ] }),
    /* @__PURE__ */ S.jsx("p", { className: "mt-2 text-slate-300", children: "If you are seeing this, Aeris Core successfully mounted the React interface." })
  ] });
}
Hooks.once("init", () => {
  var o, r;
  const e = (r = (o = game.modules.get("aeris-core")) == null ? void 0 : o.api) == null ? void 0 : r.AerisActorSheet;
  if (!e) {
    console.error("Aeris PF1e Sheet | Aeris Core module is not active or API is missing!");
    return;
  }
  class t extends e {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "aeris-pf1e-react-sheet",
        classes: ["pf1e", "sheet", "actor"],
        width: 800,
        height: 700
      });
    }
    get reactComponent() {
      return se;
    }
  }
  Actors.registerSheet("pf1", t, {
    types: ["character"],
    makeDefault: !1,
    label: "Aeris React Sheet"
  });
});
//# sourceMappingURL=aeris-pf1e-sheet.js.map
