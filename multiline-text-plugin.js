Snap.plugin(function (Snap, Element, Paper, glob) {
    Paper.prototype.multitext = function (x, y, txt, color) {
        txt = txt.split("\n");
        var t = this.text(x, y, txt);
        t.selectAll("tspan:nth-child(n)").attr({
            dy      : "1.2em",
            x       : x,
            fill    : color
        });
        return t;
    };
});