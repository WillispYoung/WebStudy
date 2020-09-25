from matplotlib import pyplot as plt
import json
import math


raw_data = json.loads(open('res.json', 'r').read())['finalResult']

node = []           # nodeCount
text = []           # textCount
text_seg = []       # textSegCount
used_css = []       # usedCssCount
top5_layout = []    # top5Layout

for entry in raw_data:
    node.append(entry['nodeCount'])
    text.append(entry['textCount'])
    text_seg.append(entry['textSegCount'])
    used_css.append(entry['usedCssCount'])
    top5_layout.append(sum(entry['top5Layout']))

plt.subplot(231)
plt.title('Node count')
plt.scatter(node, top5_layout)

plt.subplot(232)
plt.title('Log node count')
plt.scatter([math.log(v) for v in node], top5_layout)

plt.subplot(233)
plt.title('Text count')
plt.scatter(text, top5_layout)

plt.subplot(234)
plt.title('Text seg count')
plt.scatter(text_seg, top5_layout)

plt.subplot(235)
plt.title('Used CSS')
plt.scatter(used_css, top5_layout)


plt.show()