function PCB(obj)
{
    var data = Object.assign({
        process_id: 0,
        arrival_time: 0,
        burst_time: 0,
        priority: 0,

        /* For simulator to calc waiting, turnaround, and completion time */
        used_time: 0,
        start_time: -1,
        end_time: 0
    }, obj);

    this.getPid = function() {
        return data.process_id;
    }

    this.getArrivalTime = function() {
        return data.arrival_time;
    }

    this.getBurstTime = function() {
        return data.burst_time;
    }

    this.getPriority = function() {
        return data.priority;
    }

    /* For Debug */
    this.getData = function() {
        return data;
    }
}
