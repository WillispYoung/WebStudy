import json
import math
import sys

from matplotlib import pyplot as plt

def plot_task_duration(trace):
    data = json.loads(open(trace, 'r').read())['res']

    for v in data:
        plt.scatter(range(len(v)), v)
    
    plt.show()

plot_task_duration('td.json')