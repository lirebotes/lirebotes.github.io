import json
import requests
import math

f = requests.get('https://raw.githubusercontent.com/uclmr/emoji2vec/master/pre-trained/emoji2vec.txt')
f = f.text.split("\n")
f.pop()
f.pop(0)

emoji_vecs = {}
for line in f:
	emoji, *vec = line.split()
	vec = [eval(x) for x in vec]
	emoji_vecs[emoji] = vec


emoji_vec_norms = {}
for k in emoji_vecs:
	emoji_vec_norms[k] = math.sqrt(sum([x**2 for x in emoji_vecs[k]]))


with open('emoji_vecs.json', 'w') as out:
	data = {'vecs': emoji_vecs,'norms': emoji_vec_norms}
	json.dump(data, out)
