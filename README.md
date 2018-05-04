# stellarw
Node.js Stellar Wallet

- **Still under development**
- *More documentation coming soon...*


## Usage

### Node

```javascript
const Wallet = require('stellarw');
const wallet = new Wallet('secret');

// get balances
wallet.account().then(a => {
  console.log(a.balances);
})

```

### Browser

```html
<script src="/dist/wallet.js"></script>
<script type="text/javascript">
  const wallet = new Wallet('secret');

  // get balances
  wallet.account().then(a => {
    console.log(a.balances);
  })
</script>
```
