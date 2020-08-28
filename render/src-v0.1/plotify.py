import json
import math
import sys

from matplotlib import pyplot as plt

legends = ['ParseHTML',
           'ParseCSS',
           'EvaluateScript',
           'UpdateLayoutTree',
           'Layout',
           'UpdateLayer',
           'UpdateLayerTree',
           'Paint',
           'CompositeLayers']


def plot_task_duration(trace):
    data = json.loads(open(trace, 'r').read())['res']

    print('Count of rendering:', len(data))
    task_durations = [[] for i in range(9)]
    task_sum = [0 for i in range(9)]
    task_count = [0 for i in range(9)]
    for v in data:
        # plt.plot(v)
        for i in range(9):
            task_durations[i].append(v[i])
            task_sum[i] += v[i]
            if v[i] > 0:
                task_count[i] += 1

    task_sum = [int(i/1000) for i in task_sum]
    print(task_sum)
    print(task_count)
    print('Task duration sum:', sum(task_sum))

    for i in range(9):
        plt.subplot(3, 3, i+1)
        v = [n/1000 for n in task_durations[i]]
        plt.plot(v)
        plt.title(legends[i] + ' /ms')

    plt.tight_layout()
    plt.show()


plot_task_duration('td.json')
