# stellarw
> stellarw is a Javascript library for interacting with the Stellar network for both Node and the browser. It abstracts and simplifies some the basic functionality of the Stellar SDK.

## Installation

Using [npm](https://www.npmjs.com/package/stellarw) to include stellarw in your own project:

```bash
npm install --save stellarw
```

For browsers, use the following script:

```html
<script src="/dist/wallet.js"></script>
```

## Usage

### Node


```javascript
const Wallet = require('stellarw');
const wallet = new Wallet('secret');

// get balances
wallet.account().then(a => {
  console.log(a.balances);
});

```

### Browser

```html
<script src="/dist/wallet.js"></script>
<script type="text/javascript">
  const wallet = new Wallet('secret');

  // get balances
  wallet.account().then(a => {
    console.log(a.balances);
  });
</script>
```


---
# Documentation

## Wallet

> Create a new Wallet object.

`Wallet` represents a single account in the Stellar network.

### Constructor

```javascript
new Wallet(secretKey, useTestnet)
```

#### Parameters

| Name       	| Type    	| Description                              	|
|------------	|---------	|------------------------------------------	|
| secretKey  	| String  	| (optional) the secret key of the account 	|
| useTestnet 	| Boolean 	| (optional) default is false             	|


### Methods

#### `generateKeys()`

> Returns Stellar keys object

```javascript
var keys = await wallet.generateKeys();
var publicKey = keys.publicKey();
var secretKey = keys.secret();
```
---

#### `createAccount(publicKey)`

> Funds and creates and account on the test network

##### Parameters

| Name      	| Type   	| Description                                      	|
|-----------	|--------	|--------------------------------------------------	|
| publicKey 	| String 	| The public key of the account to fund and create 	|


Example account creation on test network.

```javascript
var wallet = new Wallet(null, true);
wallet.keys = await wallet.generateKeys();
await wallet.createAccount(wallet.keys.publicKey());
```
---

#### `account(publicKey)`

> Get account information for given address.

##### Parameters

| Name      	| Type   	| Description                                      	|
|-----------	|--------	|--------------------------------------------------	|
| publicKey 	| String 	| (optional) the address of the account to fetch; defaults to current wallet's public key |

```javascript
wallet.account().then(account => {
  console.log(account.balances);
})
```

---

#### `send(recipientId, asset, amount)`

---

#### `trust(asset, limit)`

---

#### `allowTrust(trustor, assetCode, authorize)`

---

#### `listen(cusor)`

---

#### `createOffer(buyingAsset, sellingAsset, amount,  n, d)`

---

#### `cancelOffer(offerId, buyingAsset, sellingAsset,  n, d)`

---

#### `setOptions(options)`
