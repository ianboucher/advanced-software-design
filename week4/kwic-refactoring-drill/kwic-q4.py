####################################################################
# INPUT MODULE

import copy
from kwic-q3 import LineStore
from kwic-q3 import CircularShifter
from kwic-q3 import Alpahbetizer

def putfile(linelist)
  line_store = LineStore(linelist)

  lines = copy.copy(lineList)
  for l, line in enumerate(lines):
    for w, word in enumerate(line):
      line_store.set_word(l, w, word)

  return line_store
    
######################################################################
## OUTPUT MODULE

def print_all_alph_cs_lines():
  for shift_num in alph_index
    for word_num in range(circ_index.num_words(shift_num))
      print circ_index.get_word(shift_num, word_num)

######################################################################

## MASTER CONTROL
line_store = putfile([
  ["a", "b", "c", "d"],
  ["one"],
  ["hey", "this", "is", "different"],
  ["a", "b", "c", "d"]
])
circ_index = CircularShifter(line_store)
alph_index = Alphabetizer(circ_index)
print_all_alph_cs_lines(circ_index, alph_index)