var SMU = {};

/* Define and Global Value */
SMU.CSE7343 = {
    EDIT_TABLE: null,
    RESULT_TABLE: null,
    METHODS: {
        FCFS: "FCFS Scheduling",
        PRI: "Non-preemptive Priority Scheduling",
        RR: "Round-Robin Scheduling",
        SJF: "Non-preemptive Shortest Job First (SJF)",
        SJFP: "Preemptive Shortest Job First (SJF)",
        PRIP: "Preemptive Priority Scheduling"
    },
    COLORS: [
        'plum',
        'yellow',
        '#FF7F50',
        '#DAA520',
        '#DA70D6',
        '#87CEEB',
        '#F0E68C',
        '#CD5C5C',
        '#FFE4C4',
        '#DEB887'
    ]
};

/* Global Utils function */
SMU.CSE7343.Utils = {
    convertText2Data: function(text) {
        var data = [];
        var line = text.split(/\r\n|\r|\n/g);
        var i, arr;
        for (i = 0; i < line.length; i++) {
            arr = line[i].split(",").map(function(item) {
                return item.trim();
            });

            if (arr.length > 0) {
                data.push(arr);
            }
        }

        return data;
    },

    convertData2Text: function(data) {
        var lines = [];
        var i;
        for (i = 0; i < data.length; i++) {
            lines.push(data[i].join(','));
        }

        return lines.join('\n');
    },

    convertText2PCBs: function(text) {
        var pcbs = [];
        var data = this.convertText2Data(text);
        var i;
        for (i = 0; i < data.length; i++) {
            pcbs.push({
                process_id: data[i][0],
                arrival_time: parseInt(data[i][1]),
                burst_time: parseInt(data[i][2]),
                priority: parseInt(data[i][3]) || 0
            });
        }

        return pcbs;
    },

    /* Sort by arrival_time and index */
    getSortPCBs: function(text) {
        var list = [];
        var data = this.convertText2Data(text);
        var i, key, arrival_time, keys;
        var sortObj = {};

        for (i = 0; i < data.length; i++) {
            arrival_time = data[i][1];
            key = arrival_time + "_" + i;
            sortObj[key] = {
                process_id: data[i][0],
                arrival_time: data[i][1],
                burst_time: data[i][2],
                priority: data[i][3] || 0
            };
        }

        keys = Object.keys(sortObj);
        keys.sort();

        for (i = 0; i < keys.length; i++) {
            list.push(sortObj[keys[i]]);
        }

        return list;
    },

    calcResultTime: function(data, result) {
        var result_data = data.slice();
        var i, j, pcb;
        var ttIdx = 4;
        var wtIdx = 5;
        var ctIdx = 6;
        var wt = [];
        var tt = [];
        var ct = [];
        for (i = 0; i < result_data.length; i++) {
            pcb = result[result_data[i][0]];
            if (pcb) {
                result_data[i][ctIdx] = pcb.end_time;
                result_data[i][ttIdx] = pcb.end_time - pcb.arrival_time;
                result_data[i][wtIdx] = pcb.end_time - pcb.burst_time - pcb.arrival_time;
                ct.push(result_data[i][ctIdx]);
                tt.push(result_data[i][ttIdx]);
                wt.push(result_data[i][wtIdx]);
            }
        }

        return {
            data: result_data,
            avg_tt: '(' + tt.join(' + ') + ') / ' + result_data.length,
            avg_wt: '(' + wt.join(' + ') + ') / ' + result_data.length,
            avg_ct: '(' + ct.join(' + ') + ') / ' + result_data.length
        };
    }
};
