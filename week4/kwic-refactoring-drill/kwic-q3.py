import functools

######################################################################
## LINE STORAGE

class LineStore:

  # Swapped get_char, set_char for get_word, set_word for convenience
  def get_word(line_num, word_num, word):
    # retrieves word from storage struct

  def set_word(line_num, word_num, word):
    # inserts word into storage struct

  def words(line_num):
    # return the number of words on a given line

  def lines():
    # return the total number of lines stored

  def delete_line(line_num):
    # deletes specifiec line from storage struct

  def delete_word(line_num, word_num):
    # deletes specifed word from storage struct


######################################################################
## CIRCULAR SHIFTER
#
# Make circ_index store something representing all circular shifts
#
# Fact: For a line with K words, there are K circular shifts.
# As a result, the ith shift is the line containing the ith word in the file,
#
class CircularShifter:
  __init__(self, line_store: LineStore):
    self.__line_store = line_store
    self.__circ_index = []
    for line_num in range line_store.lines():
      for word_num in range line_store.words(line_num)
        self.__circ_index.append( (line_num, word_num) )


  # Swapped `char()` for `word()` for convenience in this illustration
  def word(shift_num, word_num):
    line_num = self.__circ_index[shift_num][0] 
    i = word_num % self.__line_store.words(line_num)
    
    return self.__line_store.get_word(line_num, i)

  def words(shift_num):
    return self.__line_store.words(shift_num)

  def shifts():
    return len(self.__circ_index)


######################################################################
## ALPHABETIZING MODULE

class Alphabetizer:
  __init__(self, circ_shifter: CircularShifter):
    self.circ_shifter = circ_shifter
    shifts = range(circ_shifter.shifts())
    self.__alph_index = sorted(shifts, key=functools.cmp_to_key(cmp_csline))
  
  @ staticmethod
  def cmp_csline(shift1, shift2) # these are just indexes to be passed to circ_index
    nwords1 = circ_shifter.num_words(shift1)
    nwords2 = circ_shifter.num_words(shift2)
    lasti = min(nwords1, nwords2)
          
    for i in range(lasti+1):
      cword1 = circ_shifter.word(shift1, i)
      cword2 = circ_shifter.word(shift2, i)

      if cword1 != cword2:
        return cmp(cword1, cword2)
    
      return cmp(nwords1, nwords2)

  def ith(i):
    return self.__alph_index[i]