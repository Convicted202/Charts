(function ($, window) {
    'use strict';
    var Chart = {
        initDonut: function (selector, cx, cy, rInner, rOuter) {
            var svg = this.svg(selector, 500);
            
            this.drawChart(window.testData, svg, cx, cy, rInner, rOuter);
        },
        
        initLine: function (selector, cx, cy, width, height) {
            var svg = this.svg(selector, 500);

            this.drawLineChart(window.testData, svg, cx, cy, width, height, 25);
        },
        
        svg: function (selector, width) {
            var container = $('[id^=' + selector + ']'),
                svg = $('svg', container),
                width = container.width() || width,
                height = container.height() || width;
            
            if (svg.length > 0) {
                svg = Snap(svg[0]);
            } else {
                svg = Snap(width, height);
                container.html(svg.node);
            }
            
            svg.node.setAttribute('width', width);
            svg.node.setAttribute('height', height);
            
            return svg;
        },
        
        drawSector: function (path, options) {
            var opts = optionsWithDefaults(options);
            
            var p = [ // points
                [opts.cx + opts.r2 * Math.sin(opts.startRadians),
                opts.cy - opts.r2 * Math.cos(opts.startRadians)],
                [opts.cx + opts.r2 * Math.sin(opts.closeRadians),
                opts.cy - opts.r2 * Math.cos(opts.closeRadians)],
                [opts.cx + opts.r1 * Math.sin(opts.closeRadians),
                opts.cy - opts.r1 * Math.cos(opts.closeRadians)],
                [opts.cx + opts.r1 * Math.sin(opts.startRadians),
                opts.cy - opts.r1 * Math.cos(opts.startRadians)],
            ];
            
            var angleDiff = opts.closeRadians - opts.startRadians,
                largeArc = (angleDiff % (Math.PI * 2)) > Math.PI ? 1 : 0,
                cmds = [];
            cmds.push("M" + p[0].join());                                // Move to P0
            cmds.push("A" + [opts.r2, opts.r2, 0, largeArc, 1, p[1]].join()); // Arc to  P1
            cmds.push("L" + p[2].join());                                // Line to P2
            cmds.push("A" + [opts.r1, opts.r1, 0, largeArc, 0, p[3]].join()); // Arc to  P3
            cmds.push("z");                                // Close path (Line to P0)
            path.setAttribute('d', cmds.join(' '));
            
            function optionsWithDefaults(o){
                // Create a new object so that we don't mutate the original
                var o2 = {
                    cx           : o.centerX || 0,
                    cy           : o.centerY || 0,
                    startRadians : (o.startDegrees || 0),
                    closeRadians : (o.endDegrees   || 0),
                };
                
                var t = o.thickness!==undefined ? o.thickness : 100;
                if (o.innerRadius!==undefined)      o2.r1 = o.innerRadius;
                else if (o.outerRadius!==undefined) o2.r1 = o.outerRadius - t;
                else                                o2.r1 = 200           - t;
                if (o.outerRadius!==undefined)      o2.r2 = o.outerRadius;
                else                                o2.r2 = o2.r1         + t;
                
                if (o2.r1<0) o2.r1 = 0;
                if (o2.r2<0) o2.r2 = 0;
                
                return o2;
            }
        },
        
        drawChart: function (data, svg, cx, cy, r1, r2) {
            var startAngle = 0,
                endAngle = 0,
                amount = 0,
                ratio = 0,
                angles = [],
                i, ln = data.length,
                path, pText, pTxtWidth;
            
            for (i = 0; i < ln; i++) {
                amount += data[i].value;
            }
            
            ratio = 2 * Math.PI / amount;
            for (i = 0; i < ln; i++) {
                path = svg.path();
                angles.push(data[i].value * ratio);
                
                endAngle += angles[angles.length - 1];
                
                this.drawSector(path.node, {
                    centerX: cx, 
                    centerY: cy,
                    startDegrees: startAngle, 
                    endDegrees: endAngle,
                    innerRadius: r1,
                    outerRadius: r2
                });
                
                path.attr({
                    fill: data[i].color,
                    stroke: '#fff',
                    strokeWidth: '2'
                });
                
                path.node.setAttribute('data-donut-id', i);
                
                pText = path.paper.multitext(cx, cy, data[i].name + '\n' + data[i].value + '\n' + data[i].text, '#999').attr({
                    font: '20px Raleway',
                    textAnchor: "middle"
                });
                
//                $(pText.node).append('svg:tspan').text(data[i].name).
//                            append('svg:tspan').text(data[i].value).
//                            append('svg:tspan').text(data[i].text);
                
                pText.attr({
                    y       : cy - pText.getBBox().height / 2,
                    opacity : 0 
                });
                
//                $(pText.node).find('tspan').attr({
//                    x       : cx - pText.getBBox().width / 2
//                    y       : cy - pText.getBBox().height / 2,
//                });
                
                pText.node.setAttribute('data-donut-id', i);
                
                this.setMouseOverHandle(path);
                
                startAngle = endAngle;
            }
            
        },
        
        setMouseOverHandle: function (sPath) {
            var sText = Snap($('text[data-donut-id="' + $(sPath.node).attr('data-donut-id') + '"]')[0]);
            
            sPath.hover(function(e) {
                sPath.animate({
                    opacity: 0.6
                }, 400);
                
                sText.animate({
                    opacity: 1
                }, 400);  
//                console.log($(e.target).attr('data-donut-id'));
            }, function (e) {
                sPath.animate({
                    opacity: 1
                }, 400);
                
                sText.animate({
                    opacity: 0
                }, 400);
            });
        },
        
        drawLineChart: function (data, svg, cx, cy, width, height, offX) {
            var maxDatum = 0, maxValue = 0,
                path, line, values = [],
                dx, dy,
                pathCmd = '', curText, vertex,
                i, ln = data.length;
            
            offX = offX || 0;
            
            for (i = 0; i < ln; i++) {
                if (data[i].value > maxDatum) {
                    maxDatum = data[i].value;
                }
                values.push(data[i].value);
            }
            
            maxValue = maxDatum * (1 + 0.3);
            dx = width / values.length;
            dy = height / maxValue;
            
            path = svg.path();
            
            pathCmd = 'M' + (cx + offX) + ' ' + (cy + height - values[0] * dy);
            
            line = path.paper.line(cx + offX, cy + height - values[0] * dy, cx + offX, cy + height).attr({
                stroke              : "#d0d1d1",
                strokeWidth         : 2,
                "stroke-dasharray"  : 5, 
                "stroke-dashoffset" : 5,
                opacity             : 0
            });
            line.node.setAttribute('data-vertline-id', 0);
            line = path.paper.line(cx + offX, cy + height - values[0] * dy, cx, cy + height - values[0] * dy).attr({
                stroke              : "#d0d1d1",
                strokeWidth         : 2,
                "stroke-dasharray"  : 5, 
                "stroke-dashoffset" : 5,
                opacity             : 0
            });
            line.node.setAttribute('data-horzline-id', 0);
            
            vertex = path.paper.circle(cx + offX, cy + height - values[0] * dy, 6.5).attr({
                stroke: "#92b6c7",
                strokeWidth: 3,
                fill: "#fff"
            });
            vertex.node.setAttribute('data-vertex-id', 0);
            curText = path.paper.text(cx + offX, cy + height + 20, data[0].name);
            curText.attr({
                x       : curText.attr('x') - curText.getBBox().width / 2,
                font    : '15px Raleway',
                fill    : '#9ea0a6'
            });
            
            for (i = 1; i < ln; i++) {                
                pathCmd += ' L' + (cx + (i  * dx) + offX) + ' ' + (cy + height - values[i] * dy);
                line = path.paper.line(cx + i * dx + offX, cy + height - values[i] * dy, cx + i * dx + offX, cy + height).attr({
                    stroke              : "#d0d1d1",
                    strokeWidth         : 2,
                    "stroke-dasharray"  : 5, 
                    "stroke-dashoffset" : 5,
                    opacity             : 0
                });
                line.node.setAttribute('data-vertline-id', i);
                line = path.paper.line(cx + i * dx + offX, cy + height - values[i] * dy, cx, cy + height - values[i] * dy).attr({
                    stroke              : "#d0d1d1",
                    strokeWidth         : 2,
                    "stroke-dasharray"  : 5, 
                    "stroke-dashoffset" : 5,
                    opacity             : 0
                });
                line.node.setAttribute('data-horzline-id', i);
                vertex = path.paper.circle(cx + i * dx + offX, cy + height - values[i] * dy, 6.5).attr({
                    stroke      : "#92b6c7",
                    strokeWidth : 3,
                    fill        : "#fff"
                });
                vertex.node.setAttribute('data-vertex-id', i);
                
                curText = path.paper.text(cx + i * dx + offX, cy + height + 20, data[i].name);
                curText.attr({
                    x       : curText.attr('x') - curText.getBBox().width / 2,
                    font    : '15px Raleway',
                    fill    : '#9ea0a6'
                });
            }
            path.node.setAttribute('d', pathCmd);
            
            path.attr({
                fill        : "none",
                stroke      : "#92b6c7",
                strokeWidth : 3
            });
            
            path.paper.line(cx, cy + height, cx + width, cy + height).attr({
                stroke      : "#d0d1d1",
                strokeWidth : 1
            });
            path.paper.line(cx, cy, cx, cy + height).attr({
                stroke      : "#d0d1d1",
                strokeWidth : 2
            });
            
            this.setVertexMouseOverHandle(svg, cx, cy, width, height);
        },
        
        setVertexMouseOverHandle: function (svg, cx, cy, width, height) {
            var vertexes = $('circle[data-vertex-id]', svg.node);
            
            vertexes.each(function (key, value) {
                var sVertex = Snap(value),
                    hzLine  = Snap($('line[data-horzline-id="' + $(value).attr('data-vertex-id') + '"]')[0]),
                    vtLine  = Snap($('line[data-vertline-id="' + $(value).attr('data-vertex-id') + '"]')[0])
                    
                sVertex.hover(function(e) {
                    hzLine.animate({
                        opacity : 1
                    }, 400);
                    vtLine.animate({
                        opacity : 1
                    }, 400);
                    sVertex.attr({
                        strokeWidth  : 6
                    }).animate({
                        fill : "#9d3b3b"
                    }, 400);
                    
                }, function (e) {
                    hzLine.animate({
                        opacity : 0
                    }, 400);
                    vtLine.animate({
                        opacity : 0
                    }, 400);
                    sVertex.attr({
                        strokeWidth  : 3
                    }).animate({
                        fill : "#fff"
                    }, 400);                    
                });
            });
            
        }
    }
    
    window.Chart = Chart;
}($, this));