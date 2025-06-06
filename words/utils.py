import os
import argparse

def clean_txt_files():
    files = [f for f in os.listdir("./") if f.endswith(".txt")]

    for f in files:
        print(f)
        with open(f, "r") as file:
            words = file.read().split("\n")
            words = [w for w in words if " " not in w and len(w) > 0]

        words = list(set(words)) # remove duplicate
        words = [w for w in words if w.isalpha()] # remove non-letters
        words.sort() # sort

        with open(f, "w") as file:
            file.write("\n".join(words))

def combine_words(source_file, language):
    lang_file = f"{language}.txt"
    if not os.path.exists(lang_file):
        print(f"Language file '{lang_file}' does not exist.")
        return

    # Read words from source file
    with open(source_file, "r") as sf:
        source_words = sf.read().split("\n")
        source_words = [w for w in source_words if " " not in w and len(w) > 0 and w.isalpha()]

    # Read words from language file
    with open(lang_file, "r") as lf:
        lang_words = lf.read().split("\n")
        lang_words = [w for w in lang_words if " " not in w and len(w) > 0 and w.isalpha()]

    # Combine, deduplicate, sort
    combined = list(set(lang_words + source_words))
    combined.sort()

    # Write back to language file
    with open(lang_file, "w") as lf:
        lf.write("\n".join(combined))
    print(f"Combined words from '{source_file}' into '{lang_file}'.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Utilities for word files.")
    parser.add_argument("--clean", action="store_true", help="Clean all .txt files in the current directory.")
    parser.add_argument("--combine", nargs=2, metavar=("FILENAME", "LANGUAGE"), help="Combine words from FILENAME into LANGUAGE.txt if it exists.")
    args = parser.parse_args()

    if args.clean:
        clean_txt_files()
    elif args.combine:
        combine_words(args.combine[0], args.combine[1])
    else:
        parser.print_usage()