# Generate sophisticated HTML document.

import random


doc = open('index.html', 'w')

doc.write('<!DOCTYPE html>\n')
doc.write('<html>\n')

doc.write('<head>\n')
doc.write('<title>Python Generated Web Page</title>\n')
doc.write('<style>*{border: 1px solid red}</style>')
doc.write('</head>\n')

doc.write('<body>\n')

w1 = 50        # first-level width
w2 = 3          # second-level width
depth = 4

NESTABLE_TAGS = ['div', 'p', 'span', 'span', 'span']
CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890       ,.+-*/()!@#$%^&~'

char_num = 0

def rand_text():
    global char_num
    l = random.randint(20, 100)
    char_num += l

    s = ''
    L = len(CHARS)
    for _ in range(l):
        idx = random.randint(0, L-1)
        s += CHARS[idx]
    s += '\n'
    return s


def add_tag(d):
    idx = random.randint(0, len(NESTABLE_TAGS)-1)
    tag = NESTABLE_TAGS[idx]
    doc.write('<' + tag + '>\n')

    if d > 1:
        for _ in range(w2):
            add_tag(d-1)
    else:
        doc.write(rand_text())
    
    doc.write('</' + tag + '>\n')


for i in range(w1):
    # print(i+1)

    idx = random.randint(0, len(NESTABLE_TAGS)-1)
    tag = NESTABLE_TAGS[idx]
    doc.write('<' + tag + '>\n')

    for j in range(w2):
        add_tag(depth-1)

    doc.write('</' + tag + '>\n')

doc.write('</body>\n')
doc.write('</html>')

doc.close()

print(w1, w2, depth, char_num)
