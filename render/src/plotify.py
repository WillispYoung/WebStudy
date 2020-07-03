import json
from matplotlib import pyplot as plt

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
