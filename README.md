# metal-bat-web
## Installation

**Step 1:** Checkout and running the Ember CLI server(this repository):

* `git clone https://github.com/taoning2014/metal-bat-web.git`
* Register an Agora account, and get an APP_ID to put into `AGORA_ENV` at `environment.js`. [Refer](https://docs.agora.io/en/Voice/product_voice?platform=Web)
* Register a leancloud account, get an APP_ID, APP_KEY to put into `LEANCLOUD_ENV` at `environment.js`. [refer](https://docs.leancloud.app/leanstorage_guide-js.html)
* `cd metal-bat-web`
* `yarn install`
* `ember serve`

**Step 2:** Checkout and running the API server:

* `git clone https://github.com/taoning2014/metal-bat-api.git`
* Use the same Agora account in the step 1 to get the API keys, put them into `.env`
* `cd metal-bat-api`
* `yarn install`
* `yarn start`

## Useful Links

* The project is inspired by [neshouse](https://github.com/bestony/neshouse)
* The project use [NES.css](https://nostalgic-css.github.io/NES.css/) for styling
