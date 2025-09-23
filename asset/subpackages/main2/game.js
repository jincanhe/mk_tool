window.gameModule = window.gameModule || {};
var n = {
  TalkMain: [
    function (t, e, n) {
      "use strict";
      cc._RF.push(e, "66e85RneoFEip58sF0T+v4J", "TalkMain");
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
      Object.defineProperty(n, "__esModule", { value: !0 }),
        (n.TalkMain = void 0);
      var a = cc._decorator,
        i = a.ccclass,
        u =
          (a.property,
          (function (t) {
            function e() {
              var e = (null !== t && t.apply(this, arguments)) || this;
              return (e.talkMain_lb = "hello"), (e.data = void 0), e;
            }
            return (
              r(e, t),
              (e.prototype.start = function () {
                (this.talkMain_lb = "startGame"), (this.data.name = "testData");
              }),
              (e.prototype.update = function (t) {
                this.data.name = t.toString();
              }),
              c([i], e)
            );
          })(cc.Component));
      (n.TalkMain = u), cc._RF.pop();
    },
    {},
  ],
};
for (var name in n) {
  window.gameModule[name] = n[name];
}
