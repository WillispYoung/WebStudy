import json
import math
import sys
from matplotlib import pyplot as plt


def pcc(x, y):
    # Pearson correlation coefficient
    n = len(x)
    v1 = n * sum([x[i]*y[i] for i in range(n)]) - sum(x)*sum(y)
    v2 = math.sqrt(n*sum([x[i]**2 for i in range(n)]) - sum(x)**2)
    v3 = math.sqrt(n*sum([y[i]**2 for i in range(n)]) - sum(y)**2)
    return v1 / (v2*v3)


def num_sim(x, y):
    if x == 0 and y == 0:
        return 1
    else:
        return 1 - (abs(x-y))/(abs(x)+abs(y))


def mean_list_sim(x,y):
    n = len(x)
    return sum([num_sim(x[i], y[i]) for i in range(n)]) / n


def event_prop():
    event_prop = json.loads(open('proportion.json', 'r').read())

    parseHTML = []
    layout = []
    evaluateScript = []

    for p in event_prop['res']:
        parseHTML.append(p['ParseHTML'])
        layout.append(p['Layout'])
        evaluateScript.append(p['EvaluateScript'])

    parseHTML.sort()
    layout.sort()
    evaluateScript.sort()

    plt.plot(parseHTML, marker='.')
    plt.plot(layout, marker='o')
    plt.plot(evaluateScript, marker='x')

    plt.legend(['ParseHTML', 'Layout', 'EvaluateScript'])
    plt.ylabel('Duration Proportion')
    plt.title('Duration Proportion of Different Events')
    plt.show()


def running_duration():
    event_prop = json.loads(open('running_duration.json', 'r').read())

    renderer_main = []
    compositor = []
    tileworker = []

    for p in event_prop['res']:
        v = 0
        for k in p:
            if k == 'CrRendererMain':
                p[k] = max(0.00001, p[k])
                renderer_main.append(p[k])
            elif k == 'Compositor':
                p[k] = max(0.00001, p[k])
                compositor.append(p[k])
            elif k.startswith('CompositorTileWorker'):
                v += p[k]

        v = max(0.00001, v)
        tileworker.append(v)

    renderer_main.sort()
    compositor.sort()
    tileworker.sort()

    plt.plot(renderer_main, marker='o')
    plt.plot(compositor, marker='.')
    plt.plot(tileworker, marker='x')

    plt.yscale('log')
    plt.ylim([0.00001, 0.5])
    plt.legend(['Renderer', 'Compositor', 'TileWorker'])
    plt.ylabel('Running Duration')
    plt.title('Running Duration Proportion of Different Threads')
    plt.show()


def pipeline_task_proportion(file):
    data = json.loads(open(file, 'r').read())
    legends = [
        'UpdateLayoutTree',
        'Layout',
        'UpdateLayerTree',
        'Paint',
        'UpdateLayer',
        'CompositeLayers',
        'FireAnimationFrame',
        'FunctionCall',
        'EventDispatch',
        'HitTest'
    ]
    colors = ['r', 'g', 'b', 'c', 'm', 'y',
              'k', 'lightcoral', 'darkcyan', 'violet']
    # l = len(data['ptd'])
    # ylimit = 0
    stats = []

    # print(l, 'tasks are processed')
    # print('Task info: max, avg, median, min (in ms)')
    for i in range(10):
        v = []
        for arr in data['ptd']:
            if (arr[i] > 0):
                v.append(arr[i]/1000)
        # ylimit = max(ylimit, max(v))
        # plt.bar(range(l*i, l*(i+1)), v, color=colors[i])
        v.sort()
        l = len(v)
        if l > 0:
            stats.append([max(v), sum(v)/l, v[int(l/2)], min(v)])
        else:
            stats.append([0, 0, 0, 0])

    # plt.legend(legends)
    # plt.xlim([0, l*10+1])
    # plt.yscale('log')
    # plt.ylim([0, ylimit*1.01])
    # plt.show()

    fig = plt.figure()
    ax = fig.add_subplot(111)
    l_ = 4
    for i in range(10):
        plt.bar(range(l_*i, l_*(i+1)), stats[i], color=colors[i])
        for j in range(l_):
            ax.annotate('%.2f' % stats[i][j], xy=(l_*i+j, stats[i][j]))
    ax.annotate('Pipeline count: %d' %
                len(data), xy=(20, ax.get_ylim()[1] * 0.8))
    ax.annotate('Values are max, avg, median, and min (in ms).',
                xy=(20, ax.get_ylim()[1] * 0.8 - 20))
    plt.legend(legends)
    plt.show()


def pipeline_pcc(file1, file2):
    d1 = json.loads(open(file1, 'r').read())['ptd']
    d2 = json.loads(open(file2, 'r').read())['ptd']
    res = []
    for i in range(10):
        x = [max(d1[i]), sum(d1[i])/len(d1[i]), d1[i]
             [int(len(d1[i])/2)], min(d1[i])]
        y = [max(d2[i]), sum(d2[i])/len(d2[i]), d2[i]
             [int(len(d2[i])/2)], min(d2[i])]
        v = pcc(x, y)
        res.append(v)
    print(res)


def pipeline_sim(file1, file2):
    d1 = json.loads(open(file1, 'r').read())['ptd']
    d2 = json.loads(open(file2, 'r').read())['ptd']
    mean_sim = []
    for i in range(10):
        x = [max(d1[i]), sum(d1[i])/len(d1[i]), d1[i]
             [int(len(d1[i])/2)], min(d1[i])]
        y = [max(d2[i]), sum(d2[i])/len(d2[i]), d2[i]
             [int(len(d2[i])/2)], min(d2[i])]
        v = mean_list_sim(x, y)
        mean_sim.append(v)
        # mean_sim.sort()
    return mean_sim


def test():
    data = json.loads(open('rd.json', 'r').read())['res']
    tags = ['inTaskDelay', 'networkDelay', 'normalDelay']
    for v in data:
        plt.clf()
        total = [0 for i in range(len(v['rd']))]
        for k in tags:
            line = []
            idx = 0
            for item in v['rd']:
                line.append(item[k])
                total[idx] += item[k]
                idx += 1
            line.sort()
            plt.plot(line)
        # total.sort()
        # plt.plot(total)
        plt.legend(tags)
        plt.title(v['domain'][:-5])
        plt.savefig('img/' + v['domain'][:-5] + '.png')

test()
