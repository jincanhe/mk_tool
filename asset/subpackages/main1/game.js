window.gameModule = window.gameModule || {};
var n = {
  ActMain: [
    function (t, e, n) {
      "use strict";
      cc._RF.push(e, "d859bu5JrFL0YhtLCiQu4Eg", "ActMain");
      var o,
        r =
          (this && this.__extends) ||
          ((o = function (t, e) {
            return (o =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (t, e) {
                  t.__proto__ = e;
                }) ||
              function (t, e) {
                for (var n in e)
                  Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
              })(t, e);
          }),
          function (t, e) {
            function n() {
              this.constructor = t;
            }
            o(t, e),
              (t.prototype =
                null === e
                  ? Object.create(e)
                  : ((n.prototype = e.prototype), new n()));
          }),
        c =
          (this && this.__decorate) ||
          function (t, e, n, o) {
            var r,
              c = arguments.length,
              a =
                c < 3
                  ? e
                  : null === o
                  ? (o = Object.getOwnPropertyDescriptor(e, n))
                  : o;
            if (
              "object" == typeof Reflect &&
              "function" == typeof Reflect.decorate
            )
              a = Reflect.decorate(t, e, n, o);
            else
              for (var i = t.length - 1; i >= 0; i--)
                (r = t[i]) &&
                  (a = (c < 3 ? r(a) : c > 3 ? r(e, n, a) : r(e, n)) || a);
            return c > 3 && a && Object.defineProperty(e, n, a), a;
          };
      Object.defineProperty(n, "__esModule", { value: !0 });
      var a = cc._decorator,
        i = a.ccclass,
        u = a.property,
        p = (function (t) {
          function e() {
            var e = (null !== t && t.apply(this, arguments)) || this;
            return (e.actMain_lb = null), e;
          }
          return (
            r(e, t),
            (e.prototype.onLoad = function () {
              this.actMain_lb = new cc.Label();
            }),
            c([u(cc.Label)], e.prototype, "actMain_lb", void 0),
            c([i], e)
          );
        })(cc.Component);
      (n.default = p), cc._RF.pop();
    },
    {},
  ],
  TalkData: [
    function (t, e, n) {
      "use strict";
      cc._RF.push(e, "c9149injhRNaKjIEvVdEPaE", "TalkData"),
        Object.defineProperty(n, "__esModule", { value: !0 }),
        (n.TalkData = void 0);
      (n.TalkData = function () {}), cc._RF.pop();
    },
    {},
  ],
};
for (var name in n) {
  window.gameModule[name] = n[name];
}
