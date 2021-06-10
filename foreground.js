var browser = !!browser && browser || !!chrome && chrome

let ocel = {
  intrestes: 0.10,
  values: [],
  predictions: [],
  crypto: [
    {
      name: "btc",
      value: 0,
      investiment: 0,
      converted: 0
    },
    {
      name: "eth",
      value: 0,
      investiment: 0,
      converted: 0
    },
  ],
  template: (args) => {
    return `
      <div class="col-12 col-md-4">
        <div class="card mb-3 widget-content badge-warning">
          <div class="widget-content-wrapper text-white">
            <div class="widget-content-left">
              <div class="widget-heading">${args.name.toUpperCase()}(EUR)</div>
              <div class="widget-subheading">Converted on Market Price</div>
            </div>
            <div class="widget-content-right">
              <div class="widget-numbers text-white">
                <span>${ocel.roundAccurately((args.investiment * args.eur), 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card mb-3 widget-content badge-warning">
          <div class="widget-content-wrapper text-white">
            <div class="widget-content-left">
              <div class="widget-heading">${args.name.toUpperCase()}(BRL)</div>
              <div class="widget-subheading">Converted on Market Price</div>
            </div>
            <div class="widget-content-right">
              <div class="widget-numbers text-white">
                <span>${ocel.roundAccurately((args.investiment * args.brl), 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card mb-3 widget-content badge-warning">
          <div class="widget-content-wrapper text-white">
            <div class="widget-content-left">
              <div class="widget-heading">${args.name.toUpperCase()}(USD)</div>
              <div class="widget-subheading">Converted on Market Price</div>
            </div>
            <div class="widget-content-right">
              <div class="widget-numbers text-white">
                <span>${ocel.roundAccurately((args.investiment * args.usd), 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  roundAccurately: (number, decimalPlaces) => {
    return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)
  },
  isMultipleOf: (num) => {
    var div = parseInt(num / 12);
    return num === div * 12;
  },
}

if (!document.querySelector('.showPredictions')) {
  const content = document.createElement('li')
  content.innerHTML = `
    <a class="show" href="/ocel/users/?predictions=show">
      <i class="metismenu-icon pe-7s-display2"></i>
      Show Predictions
    </a>
  `

  document.querySelector('.vertical-nav-menu').appendChild(content)
}

const card = ({ y, n, c, v }) => {
  return `<div class="cards col-12 col-sm-6">
      <div class="card widget-content bg-midnight-bloom">
        <div class="widget-content-wrapper text-white">
          <div class="widget-content-left">
            <div class="widget-heading">Investiment in ${y}</div>
            <div class="widget-subheading">${n}</div>
          </div>
          <div class="widget-content-right">
            <div class="widget-numbers text-white">
              <span>${c}</span>
              <br>
              <span>Value: €${v}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`
}

const markupHTML = () => {
  return `<div class="container predictions">
      <button class="reset">X</button>
      <div class="row">
        HTML_CONTENT
      </div>
    </div>`
}

const insertAfter = (referenceNode, newNode) => {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

const getValues = function(name) {
  nameLowerCase = name
  name = name.toUpperCase()
  if (!!document.querySelectorAll('.app-main__inner .widget-heading')) {
    let values = {}
    Array.from(document.querySelectorAll('.app-main__inner .widget-heading')).forEach(function(elm) {
      if (
        elm.innerText === `Investiment ${name}` ||
        elm.innerText === `${name}(EUR)` ||
        elm.innerText === `Total Income ${name}` ||
        elm.innerText === `${name}(BRL)` ||
        elm.innerText === `Wallet ${name}` ||
        elm.innerText === `${name}(USD)`
      ) {
        let sibling = elm.parentElement.nextElementSibling
        let value = sibling.innerText.replace(',', '')

        switch (elm.innerText) {
          case `Investiment ${name}`:
            sibling.id = `investiment-${nameLowerCase}`
            values = {
              ...values,
              parent: elm.closest('.row'),
              investiment: value
            }
            break;
          case `Total Income ${name}`:
            sibling.id = `income-${nameLowerCase}`
            values = {
              ...values,
              income: value
            }
            break;
          case `Wallet ${name}`:
            sibling.id = `wallet-${nameLowerCase}`
            values = {
              ...values,
              wallet: value
            }
            break;
          case `${name}(EUR)`:
            values = {
              ...values,
              eur: value
            }
            break;
          case `${name}(BRL)`:
            values = {
              ...values,
              brl: value
            }
            break;
          case `${name}(USD)`:
            values = {
              ...values,
              usd: value
            }
            break;
        }
      }
    })

    return values
  }
}

ocel.crypto.forEach(function({ name }) {
  const values = getValues(name)

  ocel.values.push({ name, ...values })

  let markupHtml = ocel.template({ name, ...values })
  let container = document.createElement('div')

  container.className = 'row';
  container.innerHTML = markupHtml;

  insertAfter(values.parent, container)
});

const convert = async ({ name, eur, investiment }) => {
  name = name.toUpperCase()
  const cryptoValue = Number(eur)
  investiment = Number(investiment)

  var year = 0;
  for (let i = 1; i <= (12 * 4); i++) {
    investiment = ocel.roundAccurately(ocel.intrestes * investiment, 9) + investiment

    let crypto = ocel.roundAccurately(investiment, 9)
    let marketValue = ocel.roundAccurately((ocel.roundAccurately(investiment, 9) * cryptoValue), 2)

    if (ocel.isMultipleOf(i)) {
      year = year + 1

      console.log(`${year} ${year < 2 ? 'year' : 'years'} of interests => \nBTC: ${crypto}\nvalue: €${marketValue}\n===`)

      ocel.predictions.push({
        y: year < 2 ? `${year} year` : `${year} years`,
        n: name,
        c: crypto,
        v: marketValue,
      })
    }
  }

  return console.log('convert =>', name, cryptoValue, investiment)
}

const showPredictions = async () => {
  ocel.predictions = []

  let predictions = document.createElement("div");
  predictions.className = "show-predictions -js-hidden";

  for (let values of ocel.values) {
    if (values.investiment > 0) {
      await convert(values)
    }
  }

  let cards = ''
  ocel.predictions.forEach((prediction) => {
    cards += card(prediction)
  })

  predictions.innerHTML = markupHTML().replace('HTML_CONTENT', cards);
  document.body.appendChild(predictions);
}

function removeExistingPredictions() {
  let existingPredictions = document.querySelectorAll(".show-predictions");
  for (let prediction of existingPredictions) {
    prediction.remove();
  }
}

function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
  removeExistingPredictions();

  if (message.command === "show") {
    showPredictions()
  }
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage(e) {
  const target = e.target
  if (location.href !== 'https://ocel.pt/ocel/users') {

  }

  if (target.classList.contains('show')) {
    e.preventDefault()
    console.log(`target =>`, target);
    browser.runtime.sendMessage({ command: "show" }, (response) => {
      handleResponse(response)
    })
  } else if (target.classList.contains('reset')) {
    e.preventDefault()
    console.log(`target =>`, target);
    browser.runtime.sendMessage({ command: "reset" }, (response) => {
      handleResponse(response)
    })
  }
}

document.addEventListener("click", notifyBackgroundPage);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('predictions')) {
  browser.runtime.sendMessage({ command: urlParams.get('predictions') }, (response) => {
    handleResponse(response)
  })
}
