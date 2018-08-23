function Scheduler(data)
{
    var methods = SMU.CSE7343.METHODS;
    var method = data.name;
    var input_pcbs = SMU.CSE7343.Utils.convertText2PCBs(data.input);
    var quantum = data.quantum;

    this.schedule = function() {
        if (-1 === Object.values(methods).indexOf(method)) {
            return {};
        }

        var key;
        for (key in methods) {
            if (method === methods[key]) {
                /* Call fcfs, pri, rr, or sjk */
                return this[key.toLowerCase()]();
            }
        }
    }

    this.getNewPCBs = function(clock, by_priority) {
        var new_pcb_list = [];
        var pcbs = [];
        var i;
        for (i = 0; i < pcb_list.length; i++) {
            if (clock >= pcb_list[i].getArrivalTime()) {
                pcbs.push(pcb_list[i]);
            } else {
                new_pcb_list.push(pcb_list[i]);
            }
        }

        pcb_list = new_pcb_list;
        return pcbs;
    }

    this.getArrivalPCBs = function(pcbs, clock, config) {
        var arrival_pcbs = [];
        var no_arrival_pcbs = [];
        var tmp_pcbs = [];
        var i, key, keys;
        var sortObj = {};
        for (i = 0; i < pcbs.length; i++) {
            if (clock >= pcbs[i].arrival_time) {
                if (config.by_priority) {
                    key = pcbs[i].priority + '_' + i;
                } else {
                    key = pcbs[i].arrival_time + '_' + i;
                }
                sortObj[key] = pcbs[i];
            } else {
                no_arrival_pcbs.push(pcbs[i]);
            }
        }

        keys = Object.keys(sortObj);
        keys.sort();
        for (i = 0; i < keys.length; i++) {
            arrival_pcbs.push(new PCB(sortObj[keys[i]]));
        }

        pcbs.splice(0, pcbs.length);
        for (i = 0; i < no_arrival_pcbs.length; i++) {
            pcbs[i] = no_arrival_pcbs[i];
        }

        return arrival_pcbs;
    }

    this.getPassTime = function(process_pcb, pcbs, clock, config) {
        var pcb_data = process_pcb.getData();
        var pass_time = pcb_data.burst_time - pcb_data.used_time;
        var i, compare_finish_time;

        if (!config.preemptive) {
            return pass_time;
        }

        if (0 < config.quantum) {
            pass_time = Math.min(config.quantum, pass_time);
        } else {
            for (i = 0; i < pcbs.length; i++) {
                if (config.by_priority) {
                    if (pcb_data.priority > pcbs[i].priority) {
                        pass_time = Math.min(pass_time, pcbs[i].arrival_time - clock);
                    }
                } else if (config.by_shortest_job) {
                    compare_finish_time = pcbs[i].arrival_time + pcbs[i].burst_time;
                    if (pass_time > compare_finish_time) {
                        pass_time = Math.min(pass_time, pcbs[i].arrival_time - clock);
                    }
                } else {
                    pass_time = Math.min(pass_time, pcbs[i].arrival_time - clock);
                }
            }
        }

        return parseInt(pass_time);
    }

    this.sortReadyQueue = function(config, ready_queue) {
        if (config.by_priority) {
            ready_queue.sortPCBBy("priority");
        } else if (config.by_shortest_job) {
            ready_queue.sortPCBBy("shortest_job");
        }

        return ready_queue;
    }

    this.processPCB = function(ready_pcb, pass_time, clock) {
        var process_pcb = ready_pcb;
        var pcb_data = ready_pcb.getData();
        
        /* Update PCB status for clac waiting time */
        if (0 > pcb_data.start_time) {
            pcb_data.start_time = clock;
        }
        
        pcb_data.used_time += pass_time;
        if (pcb_data.used_time >= pcb_data.burst_time) {
            pcb_data.end_time = clock + pass_time;
            process_pcb = null;
        }

        return process_pcb;
    }

    this.simulate = function(cfg, pcbs) {
        var result_pcbs = {};
        var gantt_chart = [];
        var config = Object.assign({
            preemptive: false,
            by_priority: false,
            by_shortest_job: false,
            quantum: -1
        }, cfg);

        var clock = 0;
        var empty_time = 0;
        var ready_queue = new Queue();
        var undone_pcb = null;
        var new_pcbs = pcbs;
        var pass_time, process_pcb, pid;

        while ((0 !== new_pcbs.length) || (0 !== ready_queue.size()) || (null !== undone_pcb)) {
            arrival_pcbs = this.getArrivalPCBs(new_pcbs, clock, config);
            ready_queue.push(arrival_pcbs);
            ready_queue = this.sortReadyQueue(config, ready_queue);

            if (undone_pcb) {
                ready_queue.push(undone_pcb);
            }

            process_pcb = ready_queue.pop();
            if (null === process_pcb) {
                clock++;
                empty_time++;
            } else {
                if (0 < empty_time) {
                    gantt_chart.push({
                        pid: "Bubble",
                        time: empty_time
                    });
                    empty_time = 0;
                }

                pass_time = this.getPassTime(process_pcb, new_pcbs, clock, config);
                undone_pcb = this.processPCB(process_pcb, pass_time, clock);
                if (null === undone_pcb) {
                    result_pcbs[process_pcb.getPid()] = process_pcb.getData();
                }
                gantt_chart.push({
                    pid: process_pcb.getPid(),
                    time: pass_time
                });
                clock += pass_time;
            }
        }

        return {
            result_pcbs: result_pcbs,
            gantt_chart: gantt_chart
        };
    }

    this.fcfs = function() {
        var pcbs = input_pcbs.slice();
        var config = {};

        return this.simulate(config, pcbs);
    }

    this.pri = function() {
        var pcbs = input_pcbs.slice();
        var config = {
            by_priority: true
        };

        return this.simulate(config, pcbs);
    }

    this.rr = function() {
        var pcbs = input_pcbs.slice();
        var config = {
            preemptive: true,
            quantum: quantum
        };

        return this.simulate(config, pcbs);
    }

    this.sjf = function() {
        var pcbs = input_pcbs.slice();
        var config = {
            by_shortest_job: true
        };

        return this.simulate(config, pcbs);
    }

    this.sjfp = function() {
        var pcbs = input_pcbs.slice();
        var config = {
            preemptive: true,
            by_shortest_job: true
        };

        return this.simulate(config, pcbs);
    }

    this.prip = function() {
        var pcbs = input_pcbs.slice();
        var config = {
            preemptive: true,
            by_priority: true
        };

        return this.simulate(config, pcbs);
    }
}