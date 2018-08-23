# CPU Scheduling
For CSE7343 Final Project (JavaScript-base)

3rd Party Library: [jquery mobile](https://jquerymobile.com/), and [jquery.edittable](https://github.com/micc83/editTable)

### Part 1: Utils for Process Control Block (PCB) Queue
* Add PCB by process Id (and position, default position is tail)
* Delete PCB by process Id or position

### Part 2: Implement multiple schedules
* Support FCFS, Priority, Round-Robin, and SJF Scheduling (Preemptive and Non-preemptive)
* Input: Textarea and editable Table
```
Process_id, arrival_time, burst_time, priority 
2760, 1, 16, 1
2750, 1, 9, 2
...
```
* Output: Gantt Chart and Turnaround ,Waiting, and Completion Time for each process and average.
