function Queue()
{
    var queue = [];

    /* General queue functions */
    this.push = function(item, pos) {
        var i;
        if (Array.isArray(item)) {
            for (i = 0; i < item.length; i++) {
                this.push(item[i], pos);
            }
            return;
        }

        pos = (2 <= arguments.length) ? parseInt(pos) : queue.length;
        pos = (0 <= pos) ? pos : queue.length;
        queue.splice(pos, 0, item);
    }

    this.pop = function(pos) {
        if (0 === queue.length) {
            return null;
        }

        pos = (1 <= arguments.length) ? parseInt(pos) : 0;
        pos = (0 <= pos) ? pos : 0;

        return queue.splice(pos, 1)[0];
    }

    this.size = function() {
        return queue.length;
    }

    /* Utils for PCB */
    this.printPCBQueue = function() {
        var output = "PCB Queue:\n";
        var i, pcb_data;

        if (0 === queue.length) {
            return "PCB Queue is empty\n";
        }

        output = "PCB Queue:\n";
        for (i = 0; i < queue.length; i++) {
            pcb_data = queue[i].getData();
            output += "" + i + ") Process Id: " + pcb_data.process_id;

            if (1 < queue.length) {
                if (0 === i) {
                    output += " (HEAD)";
                } else if (queue.length - 1 === i) {
                    output += " (TAIL)";
                }
            }
            output += "\n";
        }

        return output;
    }

    this.getIdxByPid = function(pid) {
        var idx;
        var del_idx = null;
        for (idx = 0; idx < queue.length; idx++) {
            if (pid == queue[idx].getPid()) {
                del_idx = idx;
                break;
            }
        }

        return del_idx;
    }

    this.popByPid = function(pid) {
        var idx = this.getIdxByPid(pid);
        return (null === idx) ? null : this.pop(idx);
    }

    this.sortPCBBy = function(name) {
        var pcb, i, key, keys;
        var sortObj = {};
        for (i = 0; i < queue.length; i++) {
            pcb = queue[i].getData();
            if ("priority" === name) {
                key = pcb.priority + '_' + i;
            } else if ("shortest_job" == name) {
                key = (pcb.burst_time - pcb.used_time) + '_' + i;
            }
            sortObj[key] = pcb;
        }
        keys = Object.keys(sortObj);
        keys.sort();
        queue = [];

        for (i = 0; i < keys.length; i++) {
            queue.push(new PCB(sortObj[keys[i]]));
        }

        return this;
    }

    /* For Print and Debug */
    this.getQueue = function() {
        return queue;
    }
}
