from sklearn import linear_model
import json

# lr = linear_model.LinearRegression(fit_intercept=True, normalize=True)
lr = linear_model.LinearRegression()
# lr = linear_model.RANSACRegressor()

raw_data = json.loads(open('res.json', 'r').read())

max_counts = [0 for i in range(7)]
for entry in raw_data['finalResult']:
    max_counts[0] = max(max_counts[0], entry['latency'])
    max_counts[1] = max(max_counts[1], entry['bandwidth'])
    max_counts[2] = max(max_counts[2], entry['nodeCount'])
    max_counts[3] = max(max_counts[3], entry['imageCount'])
    max_counts[4] = max(max_counts[4], entry['textCount'])
    max_counts[5] = max(max_counts[5], entry['cssRuleCount'])
    max_counts[6] = max(max_counts[6], entry['usedCssCount'])

X = []
y = []

# format of x:
# [tag, latency, bandwidth, node_count, image_count, text_count, css_count, rule_count, used_css_count,
#  image_sizes..., text_sizes...]
for entry in raw_data['finalResult']:
    x = []

    # 0-8
    # x.append(tags.index(entry['tag']))
    x.append(entry['latency'] / max_counts[0])
    x.append(entry['bandwidth'] / max_counts[1])
    x.append(entry['nodeCount'] / max_counts[2])
    x.append(entry['imageCount'] / max_counts[3])
    x.append(entry['textCount'] / max_counts[4])
    # x.append(entry['cssCount'])
    x.append(entry['cssRuleCount'] / max_counts[5])
    x.append(entry['usedCssCount'] / max_counts[6])

    # 9-308
    # image_sizes = entry['imageSizes']
    # image_sizes.sort(reverse=True)
    # if len(image_sizes) >= 300:
    #     image_sizes = image_sizes[:300]
    # else:
    #     l = len(image_sizes)
    #     for i in range(l, 300):
    #         image_sizes.append(0)
    # for v in image_sizes:
    #     x.append(v)

    # 309-1708
    # text_sizes = entry['textSizes']
    # text_sizes.sort(reverse=True)
    # if len(text_sizes) >= 1400:
    #     text_sizes = text_sizes[:1400]
    # else:
    #     l = len(text_sizes)
    #     for i in range(l, 1400):
    #         text_sizes.append(0)
    # for v in text_sizes:
    #     x.append(v)

    X.append(x)
    y.append(max(entry['top5Layout']))

lr.fit(X, y)

output = open('coef.txt', 'w')
for v in lr.coef_:
    output.write(str(v))
    output.write('\n')
output.close()
