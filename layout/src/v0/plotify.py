from matplotlib import pyplot as pp
import json

data = json.loads(open('counts.json', 'r').read())

c0 = set()  # node
c1 = set()  # img  -> 300
c2 = set()  # text -> 1400
c3 = set()  # css

legends = ['nodeCounts', 'imageCounts', 'textCounts', 'cssCounts']

for v in data[legends[0]]:
    c0.add(v)
c0 = list(c0)
c0.sort()

for v in data[legends[1]]:
    c1.add(v)
c1 = list(c1)
c1.sort()

for v in data[legends[2]]:
    c2.add(v)
c2 = list(c2)
c2.sort()

for v in data[legends[3]]:
    c3.add(v)
c3 = list(c3)
c3.sort()

pp.plot(c0)
pp.plot(c1)
pp.plot(c2)
pp.plot(c3)

pp.legend(legends)
pp.show()
