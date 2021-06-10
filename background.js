// background-script.js
var browser = !!browser && browser || !!chrome && chrome

var css = `
  body {
    overflow: hidden;
    position: relative;
  }

  .previsions {
    padding: 60px 60px 30px;
    background-color: #fffffe;
    z-index: 9999;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
  .show-previsions,
  .show-previsions::before {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .show-previsions {
    z-index: 9999;
  }
  .show-previsions::before {
    background-color: rgba(0, 0, 0, 0.3);
    content: '';
  }

  button.reset {
    background-color: transparent;
    border: 1px solid black;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
  }

  .cards {
    padding-bottom: 30px;
  }
`

// background-script.js
function onError(error) {
  console.log(`Error: ${error}`);
}

function handleMessage(request, sender, sendResponse) {
  if (request.command === "show") {
    browser.tabs.insertCSS({ code: css })
    sendResponse({ command: "show" })
  }
  else if (request.command === "options") {
    console.log('background options =>')
    browser.runtime.sendMessage({ command: 'options' }, (response) => {
      sendResponse({ command: "options", response })
    })
  }
}

browser.runtime.onMessage.addListener(handleMessage);
