(function(){

$(document).ready(function() {
    initUI();
    registerEvents();
});

var initUI = function() {
    initTextInput();
    initAlgorithmRidio();
    $.mobile.initializePage();
    SMU.CSE7343.EDIT_TABLE = initEditTable();
    SMU.CSE7343.RESULT_TABLE = initResultTable();
    updateUI();
}

var registerEvents = function() {
    $('#algorithm input').on('change', updateUI);
    $('#parse_input').on('click', parseInput);
    $('#schedule').on('click', scheduleAction);
}

var initAlgorithmRidio = function() {
    var algorithm = $('#algorithm');
    var inputs = [];
    var abbr, id, el, label;
    var methods = Object.assign({}, SMU.CSE7343.METHODS);
    var first = true;
    for (abbr in methods) {
        id = 'radio-choice-' + abbr.toLowerCase();
        el = $('<input/>', {
            type: 'radio',
            id: id,
            name: 'radio-algorithm',
            value: abbr,
        });
        if (first) {
            el.attr('checked', 'checked');
            first = false;
        }

        label = $('<label/>', {
            for: id,
            text: methods[abbr]
        });
        inputs.push(el, label);
    }

    algorithm.append(inputs);
}

var initTextInput = function() {
    var default_input =
`2710,8,6,2
2720,8,2,1
2730,0,8,1
2740,2,5,3
2750,6,10,4`;
    $('#pcb_input').val(default_input);
}

var initEditTable = function() {
    var table = $('#edit_table').editTable({
        data: [
            [1000, 0, 20, 1],
            [1001, 20, 10, 2]
        ],
        row_template: [
            'text',
            'number',
            'number',
            'number'
        ],
        headerCols: [
            'Process ID',
            'Arrival Time',
            'Burst Time',
            'Priority'
        ],
        validate_field: function (col_id, value, col_type, $element) {
            return true;
        }
    });

    return table;
}

var initResultTable = function() {
    var table = $('#result_table').editTable({
        data: [],
        headerCols: [
            'Process ID',
            'Arrival Time',
            'Burst Time',
            'Priority',
            'Turnaround Time',
            'Waiting Time',
            'Completion Time'
        ]
    });

    return table;
}

var updateUI = function() {
    if ($('#radio-choice-rr:checked').length) {
        $('#quantum').slideDown();
        $('#edit_table').addClass('rr');
    } else {
        $('#quantum').slideUp();
        $('#edit_table').removeClass('rr');
    }

    if ($('#radio-choice-pri:checked').length ||
        $('#radio-choice-prip:checked').length) {
        $('#edit_table').addClass('pri');
    } else {
        $('#edit_table').removeClass('pri');
    }
}

var parseInput = function() {
    var text = $('#pcb_input').val();
    var data = SMU.CSE7343.Utils.convertText2Data(text);
    SMU.CSE7343.EDIT_TABLE.loadData(data);
    $("html, body").stop().animate({scrollTop: $('#edit-table-block').offset().top}, 500, 'swing');
}

var validEditableTable = function(data) {
    var valid = true;
    var i, j, el, val;
    var data_length = ($('#radio-choice-rr:checked').length) ? 4 : 3;
    var pids = [];
    var pid_idx = 0;
    var at_idx = 1;
    var bt_idx = 2;
    var pri_idx = 3;

    $('#edit_table tbody tr td input').removeClass('invalid-input');
    for (i = 0; i < data.length; i++) {
        for (j = 0; j < data_length; j++) {
            el = $('#edit_table tbody tr:nth-child(' + (i+1) + ') td:nth-child(' + (j+1) + ') input');
            val = parseInt(el.val());

            if (j === pid_idx) {
                /* Check Duplicate */
                if (-1 === pids.indexOf(data[i][j])) {
                    pids.push(data[i][j]);
                } else {
                    el.addClass('invalid-input');
                    valid = false;
                    continue;
                }
            }

            if ($.isNumeric(val)) {
                if ((j === pid_idx) || (j === at_idx)) {
                    if (0 <= data[i][j]) {
                        continue;
                    }
                } else if ((j === bt_idx) || (j === pri_idx)) {
                    if (0 < data[i][j]) {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            el.addClass('invalid-input');
            valid = false;
        }
    }

    return valid;
}

var validQuantum = function() {
    $('#quantum-input').removeClass('invalid-input');
    if (!$('#quantum-input').is(':visible')) {
        return true;
    }

    var qVal = $('#quantum-input').val();
    var q = parseInt(qVal);
    if ($.isNumeric(q) && (q >= 1) && (qVal == q)) {
        return true;
    }

    $('#quantum-input').addClass('invalid-input');
    $("html, body").stop().animate({scrollTop: $('#quantum-input').offset().top}, 500, 'swing');
    return false;
}

var scheduleAction = function() {
    $('#result').hide();
    var key = $('#algorithm input:checked').val();
    var method = SMU.CSE7343.METHODS[key];
    var data = SMU.CSE7343.EDIT_TABLE.getData();

    if (!validEditableTable(data)) {
        alert("Editable Table is incomplete!");
        return;
    }

    if (!validQuantum(data)) {
        alert("Quantum is invalid!");
        return;
    }

    var input = SMU.CSE7343.Utils.convertData2Text(data);
    var scheduler = new Scheduler({
        name: method,
        input: input,
        quantum: parseInt($('#quantum-input').val())
    });

    result = scheduler.schedule();
    renderGanttChart(result['gantt_chart']);
    renderResult(result['result_pcbs']);
    $('#result').show();
    $("html, body").stop().animate({scrollTop: $('#result').offset().top}, 500, 'swing');
}

var renderGanttChart = function(result) {
    var chart = $('#gantt-chart .block');
    var scale = $('#gantt-chart .scale');
    var i, el, width, style, html, color;
    var total = 0;
    var color_map = {};
    var color_idx = 0;

    for (i = 0; i < result.length; i++) {
        total += parseInt(result[i].time);
    }
    chart.html("");
    scale.html("");

    var first = true;
    var pos = 0;
    for (i = 0; i < result.length; i++) {
        if ("undefined" === typeof color_map[result[i].pid]) {
            color = "background:" + SMU.CSE7343.COLORS[color_idx] + " ;";
            color_map[result[i].pid] = color;
            color_idx++;
        } else {
            color = color_map[result[i].pid]
        }
        width = (result[i].time / total) * 95;
        style = "width: " + width + "%;";
        html = ("Bubble" == result[i].pid) ? "Bubble" : "P<span>" + result[i].pid + "</span>";
        html += "(" + result[i].time + ")";
        el = $('<div/>', {
            style: style + color,
            class: "chart-block",
            html: html
        });
        chart.append(el);

        if (first) {
            el = $('<div/>', {
                style: "width: 1px;",
                text: 0
            });
            scale.append(el);
            first = false;
        }

        pos += parseInt(result[i].time);
        el = $('<div/>', {
            style: style,
            text: pos
        });
        scale.append(el);
    }
}

var renderResult = function(result) {
    var data = SMU.CSE7343.EDIT_TABLE.getData();
    var result_data = SMU.CSE7343.Utils.calcResultTime(data, result);
    SMU.CSE7343.RESULT_TABLE.loadData(result_data['data']);
    $('#result_table input').attr('readonly', '');

    var el = $('#avg-time');
    var html = 'Average Turnaround Time: ' + result_data['avg_tt'] + ' = ' + eval(result_data['avg_tt']) + '<br>';
    html += 'Average Waiting Time: ' + result_data['avg_wt'] + ' = ' + eval(result_data['avg_wt']) + '<br>';
    html += 'Average Completion Time: ' + result_data['avg_ct'] + ' = ' + eval(result_data['avg_ct']) + '<br>';
    el.html(html);
}

})();