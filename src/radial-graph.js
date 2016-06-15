var UI = require('ui');
var Vector2 = require('vector2');


var radial_graph = function(_data1, _data2) {
    this.graph = new UI.Window();

    this.sol_data = [];
    this.cons_data = [];



    this.set = function(_sol, _cons) {
        this.num_seg = _cons.length;
        var n = _cons.length;
        this.clear();
        for (var i = 0; i < n; i++) {

            this.sol_data.push(_sol[i]);
            this.cons_data.push(_cons[i]);
        }
    };
    this.clear = function() {
        this.graph.each(function(element) {
            this.graph.clear(element);
        });
        this.sol_data = [];
        this.cons_data = [];

    };

    this.show = function() {
        var date = new Date();
        var offset_angle = (date.getMinutes() + 60 * date.getHours()) * 360 / (60 * 24);

        var angle_start = 0;
        var angle_end = 0;
        for (var i = 0; i < this.cons_data.length; i++) {
            angle_start = (i * 360) / this.num_seg + offset_angle;
            angle_end = ((i + 1) * 360) / this.num_seg + offset_angle;
            var r = new UI.Radial({

                position: new Vector2(80, 90),
                size: new Vector2(10, 10),
                radius: -(this.sol_data[i]),
                angle: angle_start,
                angle2: angle_end,
                backgroundColor: 'green',
                strokeColor: 'green',
                borderWidth: 1,
                borderColor: 'green'
            });


            var r2 = new UI.Radial({

                position: new Vector2(80, 90),
                size: new Vector2(10, 10),
                radius: -(this.cons_data[i]),
                angle: angle_start,
                angle2: angle_end,
                backgroundColor: 'white',
                strokeColor: 'white',
                borderWidth: 1,
                borderColor: 'white'
            });
            if (this.cons_data[i] < this.sol_data[i]) {
                this.graph.add(r);
                this.graph.add(r2);
            } else {
                this.graph.add(r2);
                this.graph.add(r);
            }

        }
        var r0 = new UI.Radial({

            position: new Vector2(80, 90),
            size: new Vector2(10, 10),
            radius: -(100),
            angle: offset_angle,

            angle2: offset_angle,
            backgroundColor: 'red',
            strokeColor: 'red',
            borderWidth: 1,
            borderColor: 'red'
        });

        this.graph.add(r0);
        this.graph.show();
    };
    this.hide = function() {
        this.graph.hide();
    };
    this.set(_data1, _data2);
};

module.exports = radial_graph;