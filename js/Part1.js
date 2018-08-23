(function(){

$(document).ready(function() {
    initUI();
    registerEvents();
});

var queue = new Queue();
queue.push([
    new PCB({process_id: 2751}),
    new PCB({process_id: 2750})
]);

var initUI = function() {
    resetInput();
    updateUI();
    printQueue();
}

var registerEvents = function() {
    $('#queue-action input').on('change', resetInput);
    $('#queue-action input').on('change', updateUI);
    $('#queue-add').on('click', addAction);
    $('#queue-delete').on('click', deleteAction);
    $('#add-pid-input').on('input', updateInput);
    $('#add-idx-input').on('input', updateInput);
}

var resetInput = function() {
    $('#add-pid').show();
    $('#add-idx').show();    
    var rand_pid = Math.floor((Math.random() * 1000) + 1000);
    if ($('#radio-choice-add:checked').length) {
        $('#add-pid-input').val(rand_pid);
        $('#add-idx-input').val("");
    } else {
        $('#add-pid-input').val("");
        $('#add-idx-input').val("");
    }
}

var updateUI = function() {
    if ($('#radio-choice-add:checked').length) {
        $('#queue-add').show();
        $('#queue-delete').hide();
    } else {
        $('#queue-add').hide();
        $('#queue-delete').show();
    }
    updateInput();
}

var updateInput = function() {
    var pidEl = $('#add-pid');
    var idxEl = $('#add-idx');
    pidEl.show();
    idxEl.show();

    var pid = $('#add-pid-input').val();
    var idx = $('#add-idx-input').val();
    if ($('#radio-choice-delete:checked').length) {
        if ("" !== pid) {
            idxEl.hide();
        } else if ("" !== idx) {
            pidEl.hide();
        }
    }
}

var addAction = function() {
    var pid = $('#add-pid-input').val();
    var idx = $('#add-idx-input').val();

    if ("" === pid) {
        alert("Add Failed: Pid is required!");
        return;
    }

    var exist = queue.getIdxByPid(pid);
    if (null !== exist) {
        alert("Add Failed: Pid[" + pid + "] does exist!");
        return;
    }

    if ("" === idx) {
        queue.push(new PCB({process_id: pid}));
        resetInput();
    } else {
        idx = parseInt(idx);
        if ((0 <= idx) && (idx <= queue.size())) {
            queue.push(new PCB({process_id: pid}), idx);
            resetInput();
        } else {
            alert("Add Failed: Index is not invaild!")
        }
    }

    printQueue();
}

var deleteAction = function() {
    var pid = $('#add-pid-input').val();
    var idx = $('#add-idx-input').val();

    if (0 === queue.length) {
        alert("Delete Failed: Queue is empty!");
        return;
    }

    if ("" !== pid) {
        idx = queue.getIdxByPid(pid);
        if (null === idx) {
            alert("Delete Failed: Pid[" + pid + "] doesn't exist!");
        } else {
            queue.popByPid(pid);
            resetInput();
        }
    } else if ("" !== idx) {
        idx = parseInt(idx);
        if ((0 <= idx) && (idx < queue.size())) {
            queue.pop(idx);
            resetInput();
        } else {
            alert("Delete Failed: Index is not invaild!")
        }
    } else {
        queue.pop();
        resetInput();
    }

    printQueue();
}

var printQueue = function() {
    var text = queue.printPCBQueue();
    text = text.split('\n').join('<br/>');
    $('#pcb-queue').html(text);
}

})();