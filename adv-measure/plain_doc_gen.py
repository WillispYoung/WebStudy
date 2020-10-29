# Generate simple HTML document purely consists of texts.

import random


doc = open('index.html', 'w')

doc.write('<!DOCTYPE html>\n')
doc.write('<html>\n')

doc.write('<head>\n')
doc.write('<title>Python Generated Web Page</title>\n')
# doc.write('<style>*{border: 1px solid red}</style>')
doc.write('</head>\n')

doc.write('<body>\n')

char_num = 10000

CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890       ,.+-*/()!@#$%^&~'
L = len(CHARS)

content = ''
for _ in range(char_num):
    idx = random.randint(0, L-1)
    content += CHARS[idx]
content += '\n'

doc.write(content)

doc.write('</body>\n')
doc.write('</html>')

doc.close()
