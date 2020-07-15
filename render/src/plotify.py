import json
from matplotlib import pyplot as plt


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


def pipeline_task_proportion():
    data = json.loads(open('task_proportion.json', 'r').read())
    for i in range(10):
        v = []
        for arr in data['res']:
            v.append(arr[i])
        v.sort()
        plt.plot(v)
    plt.legend(['UpdateLayoutTree',
                'Layout',
                'UpdateLayerTree',
                'Paint',
                'UpdateLayer',
                'CompositeLayers',
                'FireAnimationFrame',
                'FunctionCall',
                'EventDispatch',
                'HitTest'
                ])
    plt.show()


pipeline_task_proportion()
