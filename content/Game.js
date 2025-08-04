class Game {
  static getKeyNeighbours(lang) {
    const keyNeighbours = {
      en: {
        a: ["q", "w", "s", "z"],
        b: ["g", "h", "v", "n"],
        c: ["d", "f", "x", "v"],
        d: ["e", "r", "s", "f", "x", "c"],
        e: ["w", "r", "s", "d"],
        f: ["r", "t", "d", "g", "c", "v"],
        g: ["t", "y", "f", "h", "v", "b"],
        h: ["y", "u", "g", "j", "b", "n"],
        i: ["u", "o", "j", "k"],
        j: ["u", "i", "h", "k", "n", "m"],
        k: ["i", "o", "j", "l", "m"],
        l: ["o", "p", "k"],
        m: ["j", "k", "n"],
        n: ["h", "j", "b", "m"],
        o: ["i", "p", "k", "l"],
        p: ["o", "l"],
        q: ["w", "a"],
        r: ["e", "t", "d", "f"],
        s: ["w", "e", "a", "d", "z", "x"],
        t: ["r", "y", "f", "g"],
        u: ["y", "i", "h", "j"],
        v: ["f", "g", "c", "b"],
        w: ["q", "e", "a", "s"],
        x: ["s", "d", "z", "c"],
        y: ["t", "u", "g", "h"],
        z: ["a", "s", "x"],
      },
      fr: {
        a: ["z", "q"],
        b: ["g", "h", "v", "n"],
        c: ["d", "f", "x", "v"],
        d: ["e", "r", "s", "f", "x", "c"],
        e: ["z", "r", "s", "d"],
        f: ["r", "t", "d", "g", "c", "v"],
        g: ["t", "y", "f", "h", "v", "b"],
        h: ["y", "u", "g", "j", "b", "n"],
        i: ["u", "o", "j", "k"],
        j: ["u", "i", "h", "k", "n"],
        k: ["i", "o", "j", "l"],
        l: ["o", "p", "k", "m"],
        m: ["o", "p", "l"],
        n: ["h", "j", "b"],
        o: ["i", "p", "k", "l"],
        p: ["o", "l", "m"],
        q: ["a", "z", "s", "w"],
        r: ["e", "t", "d", "f"],
        s: ["z", "e", "q", "d", "w", "x"],
        t: ["r", "y", "f", "g"],
        u: ["y", "i", "h", "j"],
        v: ["f", "g", "c", "b"],
        w: ["q", "s", "x"],
        x: ["s", "d", "w", "c"],
        y: ["t", "u", "g", "h"],
        z: ["a", "e", "q", "s"],
      },
    };

    if (lang in keyNeighbours) return keyNeighbours[lang];
    else return keyNeighbours["en"];
  }

  constructor(inputNode) {
    this.input = inputNode;
    this.paused = false;
    this.speed = 2; // Between 1 and 5
    this.myTurn = false;
    this.#updateIcon();
  }

  #updateIcon() {
    chrome.runtime.sendMessage({
      type: "updateIcon",
      status: this.paused ? "OFF" : "ON",
    });
  }

  togglePause() {
    this.paused = !this.paused;
    this.#updateIcon();
    if(!this.paused && !this.typingId && this.myTurn) this.playTurn();
  }

  speedUp() {
    this.speed = Math.min(this.speed + 1, 5);
  }

  speedDown() {
    this.speed = Math.max(this.speed - 1, 1);
  }

  async setLang(language) {
    const langCodes = {
      English: "en",
      French: "fr",
      Spanish: "es",
      'Brazilian Portuguese': "pt-br",
    };

    if (!(language in langCodes)) {
      console.log(`${language} is not an available language!`);
      return;
    }

    this.used = {};
    if (this.words && this.lang === langCodes[language]) return;
    this.lang = langCodes[language];
    this.words = await Game.getWords(this.lang);
    console.log(`Bomb party buddy loaded in ${language} (${this.lang})! (${this.words.length} words)`);
  }

  static async getWords(lang) {
    let url = "";
    if (lang == "en") {
      url = chrome.runtime.getURL("../words/en.txt");
    } else if (lang == "fr") {
      url = chrome.runtime.getURL("../words/fr.txt");
    } else if (lang == "es") {
      url = chrome.runtime.getURL("../words/es.txt");
    } else if (lang == "pt-br") {
      url = chrome.runtime.getURL("../words/pt-br.txt");
    }

    if (url) {
      const res = await fetch(url);
      const text = await res.text();

      function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array
      }

      // Shuffle all the words with less than 7 letters
      const smallText = text
        .split("\n")
        .map((word) => word.trim())
        .filter((word) => word.length <= 7);

      const bigText = text
        .split("\n")
        .map((word) => word.trim())
        .filter((word) => word.length > 7);

      return shuffle(smallText).concat(bigText)
    }
    return [];
  }
  
  async playTurn() {
    if (this.paused) return;
    if (this.typingId) clearTimeout(this.typingId);
    this.typingId = -1; // Waiting for the word to be fetched
    const word = await this.getWord();
    if (!word) return;
    this.typeWord(word);
  }

  async getWord() {
    for (const word of this.words) {
      if (!this.used[word] && word.includes(this.syllable)) {
        this.used[word] = 1;
        await new Promise((r) => setTimeout(r, Math.random() * 100 + 1000 / this.speed));
        return word;
      }
    }
  }

  typeWord(word, lastIsMistake) {
    if (!word) {
      this.input.parentNode.requestSubmit();
      this.typingId = null;
      return;
    }
    if (lastIsMistake) {
      this.input.value = this.input.value.slice(0, -1);
      this.input.dispatchEvent(new InputEvent("input"));
      this.typingId = setTimeout(() => this.typeWord(word, false), Math.random() * 800 / this.speed); // 400
      return;
    }

    let inputLetter = word[0];
    const isMistake =
      inputLetter in Game.getKeyNeighbours(this.lang) && Math.random() < 0.1;
    if (isMistake) {
      const neighbours = Game.getKeyNeighbours(this.lang)[inputLetter];
      inputLetter = neighbours[Math.floor(Math.random() * neighbours.length)];
    }
    this.input.value += inputLetter;
    this.input.dispatchEvent(new InputEvent("input"));
    this.typingId = setTimeout(
      () => this.typeWord(isMistake ? word : word.substring(1), isMistake),
      Math.random() * 800 / this.speed // 400
    );
  }

  // listener
  onCorrectWord(word) {
    this.used[word] = 1;
  }
}
