function isBombPartyFrame() {
  return /https:\/\/[a-z]*.jklm.fun\/games\/bombparty\/$/.test(document.location);
}

function getInput() {
  return document.getElementsByClassName("selfTurn")[0].getElementsByTagName("input")[0];
}

async function setupBuddy() {
  //Inject socket listener
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("content/injected.js");
  s.onload = function () {
    this.remove();
  };
  document.body.appendChild(s);

  //await new Promise((r) => setTimeout(r, 1000));
  let input = getInput();

  //Create game manager
  const game = new Game(input);
  setTimeout(() => (game.input = getInput()), 1000);

  window.addEventListener("message", async (event) => {
    if (!event.origin.endsWith("jklm.fun")) return;

    const data = event.data;
    if (data.type === "setup") {
      await game.setLang(data.language);
      if (data.myTurn) {
        game.syllable = data.syllable;
        game.playTurn();
      }
    } else if (data.type === "correctWord") {
      game.onCorrectWord(data.word);
    } else if (data.type === "failWord") {
      if (data.myTurn) game.playTurn();
    } else if (data.type === "nextTurn") {
      if (data.myTurn) {
        game.syllable = data.syllable;
        game.playTurn();
      }
    }
  });

  window.addEventListener("keydown", function (ev) {
    if (ev.altKey && ev.key == "w") {
      game.paused = !game.paused;
      console.log("Buddy " + (game.paused ? "paused" : "on"));
    } else if(ev.altKey && ev.key == "ArrowUp") {
      game.speedUp();
    } else if(ev.altKey && ev.key == "ArrowDown") {
      game.speedDown();
    }
  });
}

if (isBombPartyFrame()) {
  setupBuddy();
}
