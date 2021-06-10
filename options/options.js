//// options.js ////
var browser = !!browser && browser || !!chrome && chrome

// In-page cache of the user's options
const options = {};

// Initialize the form with the user's option settings
browser.storage.local.get('options', (data) => {
  Object.assign(options, data.options);
  optionsForm.fees.value = options.fees
  optionsForm.years.value = options.years

  browser.runtime.sendMessage({ command: "options", status: options })
});

// Immediately persist options changes
Array.from(optionsForm.children).forEach((element) => {
  element.addEventListener("change", (event) => {
    options[event.target.id] = event.target.value;
    console.log(event.target.id, event.target.value, options);

    browser.storage.local.set({ options });
  });
}
);

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "options") {
    sendResponse(options)
  }
});
