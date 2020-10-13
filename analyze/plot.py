from matplotlib import pyplot as pp
import json


data = json.loads(open('data.json', 'r').read())['data']


def sum_of_top5(arr):
    arr.sort(reverse=True)
    return int(sum(arr[:5]) / 1000)


# Distribution of:
#   1. number of DOM nodes,
#   2. number of images,
#   3. number of text nodes,
#   4. number of CSS files / used CSS files,
#   5. number of CSS rules.
# And their relationships with layout task duration in the form of
# scatter plot.

node = []
image = []
text = []
css = []
ucss = []
rule = []
layout = []

for obj in data:
    node.append(obj['metadata'][0])
    image.append(obj['metadata'][1])
    text.append(obj['metadata'][2])
    css.append(obj['metadata'][3])
    ucss.append(obj['metadata'][4])
    rule.append(obj['metadata'][5])

    layout_ = []
    for arr in obj['duration']:
        layout_.append(arr[4] + arr[5])
    layout.append(sum_of_top5(layout_))

# Image 1: distribution of 5 factors, and scatter plots of these against sum of top-5 layout duration.


def plot_general_points(x, y):
    x1 = min(x)
    x2 = max(x)
    limit = x1 + 0.8*(x2-x1)
    x_ = []
    y_ = []
    for i in range(len(x)):
        if x1 <= x[i] and x[i] <= limit:
            x_.append(x[i])
            y_.append(y[i])
    pp.scatter(x_, y_, s=1)


pp.subplot(256)
# pp.scatter(node, layout, s=1)
plot_general_points(node, layout)

pp.subplot(257)
# pp.scatter(image, layout, s=1)
plot_general_points(image, layout)

pp.subplot(258)
# pp.scatter(text, layout, s=1)
plot_general_points(text, layout)

pp.subplot(259)
# pp.scatter(css, layout, s=1)
plot_general_points(css, layout)

pp.subplot(2, 5, 10)
# pp.scatter(rule, layout, s=1)
plot_general_points(rule, layout)

pp.subplot(251)
pp.title('node')
node.sort()
pp.plot(node)

pp.subplot(252)
pp.title('image')
image.sort()
pp.plot(image)

pp.subplot(253)
pp.title('text')
text.sort()
pp.plot(text)

pp.subplot(254)
pp.title('css diff')
diff = [css[i] - ucss[i] for i in range(len(css))]
diff.sort()
pp.plot(diff)
css.sort()
pp.plot(css)
pp.legend(['diff', 'css'])

pp.subplot(255)
pp.title('rule')
rule.sort()
pp.plot(rule)

pp.show()

# Composition of top-10 render tasks.

# Image 2: distribution of sum of top 5 task duration for 6 types of tasks.

html = []
css = []
js = []
layout = []
paint = []
layer = []

for obj in data:
    html_ = []
    css_ = []
    js_ = []
    layout_ = []
    paint_ = []
    layer_ = []
    for arr in obj['duration']:
        html_.append(arr[0])
        css_.append(arr[1])
        js_.append(arr[2] + arr[3])
        layout_.append(arr[4] + arr[5])
        paint_.append(arr[8])
        layer_.append(arr[6] + arr[7] + arr[9])

    html.append(sum_of_top5(html_))
    css.append(sum_of_top5(css_))
    js.append(sum_of_top5(js_))
    layout.append(sum_of_top5(layout_))
    paint.append(sum_of_top5(paint_))
    layer.append(sum_of_top5(layer_))

html.sort()
css.sort()
js.sort()
layout.sort()
paint.sort()
layer.sort()

l = len(html)
l = int(0.99*l)

pp.subplot(121)

pp.plot(html[:l])
pp.plot(css[:l])
pp.plot(js[:l])
pp.plot(layout[:l])
pp.plot(paint[:l])
pp.plot(layer[:l])

pp.legend(['HTML', 'CSS', 'JS', 'Layout', 'Paint', 'Layer'])

# Extreme cases.
pp.subplot(122)

pp.plot(html[l:])
pp.plot(css[l:])
pp.plot(js[l:])
pp.plot(layout[l:])
pp.plot(paint[l:])
pp.plot(layer[l:])

pp.legend(['HTML', 'CSS', 'JS', 'Layout', 'Paint', 'Layer'])

pp.show()
