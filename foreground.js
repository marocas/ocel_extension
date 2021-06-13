var browser = !!browser && browser || !!chrome && chrome

let ocel = {
  years: 2,
  fees: 0.06,
  values: [],
  previsions: [],
  widgets: document.querySelectorAll('.app-main__inner .widget-heading'),
  crypto: [
    {
      name: "btc",
    },
    {
      name: "eth",
    },
  ],
  templates: {
    investiment: ({ investiment, value, currency }) => (`
        <i class="metismenu-icon pe-7s-calculator"></i>
        ${ocel.roundAccurately((investiment * value), 2)} ${currency}
    `),
    previsions: () => (`
      <a class="show" href="/ocel/users/?previsions=show">
        <i class="metismenu-icon pe-7s-graph1"></i>
        Show Prevision
      </a>
    `),
    popup: {
      markup: () => (`<div class="container previsions">
          <button class="reset">X</button>
          <div class="row">
            HTML_CONTENT
          </div>
        </div>
      `),
      card: ({ y, n, c, v, currency }) => (`
        <div class="cards col-12 col-sm-6">
          <div class="card widget-content bg-midnight-bloom">
            <div class="widget-content-wrapper text-white">
              <div class="widget-content-left">
                <div class="widget-heading">Prevision of ${y}</div>
                <div class="widget-subheading">${n}</div>
              </div>
              <div class="widget-content-right">
                <div class="widget-numbers text-white">
                  <span>${c}</span>
                </div>
                <div style="text-align: right;" class="market-value">
                    <i class="metismenu-icon pe-7s-calculator"></i>
                    ${v} ${currency}
                </div>
              </div>
            </div>
          </div>
        </div>`
      ),
    }
  },
  roundAccurately: (number, decimalPlaces) => {
    return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)
  },
  isMultipleOf: (num) => {
    var div = parseInt(num / 12);
    return num === div * 12;
  },
}

// Previsions menu item
if (!document.querySelector('.showPrevisions')) {
  const content = document.createElement('li')
  content.innerHTML = ocel.templates.previsions()

  document.querySelector('.vertical-nav-menu').appendChild(content)
}

// helper
const insertAfter = (referenceNode, newNode) => {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// gether all necessary information from crypto
const getValues = function(name) {
  nameLowerCase = name
  name = name.toUpperCase()
  if (!!ocel.widgets) {
    let values = []
    Array.from(ocel.widgets).forEach(function(elm) {
      if (
        elm.innerText === `Investiment ${name}` ||
        elm.innerText === `${name}(EUR)` ||
        elm.innerText === `Total Income ${name}` ||
        elm.innerText === `${name}(BRL)` ||
        elm.innerText === `Wallet ${name}` ||
        elm.innerText === `${name}(USD)`
      ) {
        let target = elm.parentElement.nextElementSibling
        let value = target.innerText.replace(',', '')

        switch (elm.innerText) {
          case `Investiment ${name}`:
            target.id = `investiment-${nameLowerCase}`
            values = [
              ...values,
              {
                name,
                investiment: value,
              }
            ]
            break;
          case `Total Income ${name}`:
            target.id = `income-${nameLowerCase}`
            values = [
              ...values,
              {
                name,
                income: value,
                investiment: values[0].investiment,
              }
            ]
            break;
          case `Wallet ${name}`:
            target.id = `wallet-${nameLowerCase}`
            values = [
              ...values,
              {
                name,
                wallet: value,
                investiment: values[0].investiment,
              }
            ]
            break;
          case `${name}(EUR)`:
            values = [
              ...values,
              {
                name,
                target,
                value,
                currency: "EUR"
              }
            ]
            break;
          case `${name}(BRL)`:
            values = [
              ...values,
              {
                name,
                target,
                value,
                currency: "BRL"
              }
            ]
            break;
          case `${name}(USD)`:
            values = [
              ...values,
              {
                name,
                target,
                value,
                currency: "USD"
              }
            ]
            break;
        }
      }
    })

    values = [
      { ...values[0], ...values[3] },
      { ...values[1], ...values[4] },
      { ...values[2], ...values[5] },
      { ...values[6], ...values[9] },
      { ...values[7], ...values[10] },
      { ...values[8], ...values[11] },
    ]
    return values.filter((object) => Object.keys(object).length > 0)
  }
}

ocel.crypto.forEach(function({ name }) {
  const values = getValues(name)
  ocel.values.push(...values)
});

const appendResults = () => {
  ocel.values.map((values) => {
    const { target } = values;
    let markupHtml = ocel.templates.investiment({ ...values })

    let container = document.createElement('div')

    container.style = 'text-align: right;'
    container.className = 'market-value';
    container.innerHTML = markupHtml;

    target.appendChild(container)
  })
}
appendResults()


const convert = async ({ name, value, investiment, currency }) => {
  name = name.toUpperCase()
  const cryptoValue = Number(value)
  investiment = Number(investiment)

  var year = 0;
  for (let i = 1; i <= (12 * ocel.years); i++) {
    investiment = ocel.roundAccurately(ocel.fees * investiment, 9) + investiment

    let crypto = ocel.roundAccurately(investiment, 9)
    let marketValue = ocel.roundAccurately((ocel.roundAccurately(investiment, 9) * cryptoValue), 2)

    if (ocel.isMultipleOf(i) && marketValue > 0) {
      year = year + 1

      console.log(`${year} ${year < 2 ? 'year' : 'years'} of interests => \nBTC: ${crypto}\nvalue: €${marketValue}\n===`)

      ocel.previsions.push({
        y: year < 2 ? `${year} year` : `${year} years`,
        n: name,
        c: crypto,
        v: marketValue,
        currency,
      })
    }
  }
}

const showPrevisions = async () => {
  ocel.previsions = []

  let previsions = document.createElement("div");
  previsions.className = "show-previsions -js-hidden";

  for (let object of ocel.values) {
    if (object.investiment > 0 && !(object.hasOwnProperty('income') || object.hasOwnProperty('wallet'))) {
      await convert(object)
    }
  }

  let cards = ''
  ocel.previsions.forEach((previsions) => {
    cards += ocel.templates.popup.card(previsions)
  })

  previsions.innerHTML = ocel.templates.popup.markup().replace('HTML_CONTENT', cards);
  document.body.appendChild(previsions);
}

function removeExistingPrevisions() {
  let existingPrevisions = document.querySelectorAll(".show-previsions");
  for (let previsions of existingPrevisions) {
    previsions.remove();
  }
}

function handleResponse(response) {
  if (!response.hasOwnProperty('command')) return console.log('no command found', response)
  const { command } = response
  removeExistingPrevisions();

  if (command === "show") {
    showPrevisions()
  }
  else if (command === 'options' && !!response?.status) {
    const { status: { years, fees } } = response
    ocel.years = Number(years)
    ocel.fees = Number(fees)
  }
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('previsions')) {
  browser.runtime.sendMessage({ command: urlParams.get('previsions') }, (response) => {
    handleResponse(response)
  })
}

function handleError(error) {
  console.error(`Error: ${error}`);
}

function notifyBackgroundPage(e) {
  const target = e.target

  if (target.classList.contains('show')) {
    e.preventDefault()
    browser.runtime.sendMessage({ command: "show" }, (response) => {
      handleResponse(response)
    })
  } else if (target.classList.contains('reset')) {
    e.preventDefault()
    browser.runtime.sendMessage({ command: "reset" }, (response) => {
      handleResponse(response)
    })
  }
}

document.addEventListener("click", notifyBackgroundPage);

browser.runtime.sendMessage({ command: 'options' }, (response) => {
  handleResponse({ ...response, command: 'options' })
})

browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.options?.newValue) {
    const { years, fees } = changes.options.newValue
    handleResponse({ command: 'options', status: { years, fees } })
  }
});

