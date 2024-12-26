import os

def get_words():
    files = [f for f in os.listdir("words") if f[-4:] == ".txt"]
    for f in files:
        with open(os.path.join("words", f), "r") as file:
            yield file.read().split("\n")


# check that words are sorted
def test_sorted(): 
    for words in get_words():
        assert words == sorted(words) 

# check for duplicates
def test_no_duplicates():
    for words in get_words():
        assert len(words) == len(set(words))        

# check for spaces
def test_no_spaces():
    for words in get_words():
        for w in words:
            assert " " not in w

# check for empty lines
def test_no_empty_lines():
    for words in get_words():
        for w in words:
            assert len(w) > 0