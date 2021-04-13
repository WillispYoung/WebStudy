import json
import numpy
from matplotlib import pyplot as pp

raw_data = json.loads(open('jd_td.json', 'r').read())['td']

tasks = [[] for _ in range(10)]
for entry in raw_data:
    for i in range(10):
        tasks[i].append(entry[i] / 1000)

del tasks[3]

titles = ['ParseHTML', 'ParseCSS', 'EvaluateScript', 'UpdateLayoutTree', 'Layout', 'UpdateLayer', 'UpdateLayerTree', 'Paint', 'CompositeLayers']

axis_font = {'fontname':'Arial', 'size':'16'}

pp.subplots_adjust(hspace=0.25, wspace=0.2)
# pp.tight_layout()

for i in range(9):
    pp.subplot(3, 3, i+1)
    pp.plot(tasks[i], linewidth=1)
    max_y = max(tasks[i])
    pp.xticks([])
    pp.xlim(0, 401)
    if max_y < 1:
        pp.yticks([0, round(max_y/2, 1), round(max_y, 1)], **axis_font)
    else:
        pp.yticks([0, int(max_y/2), int(max_y)], **axis_font)
    # pp.ylim(-0.2, max_y * 1.2)
    pp.title(titles[i] + ' (ms)', **axis_font)

pp.show()
