
const Wallet = require('../index');

(async () => {
  var wallet = new Wallet(null, true);
  wallet.keys = await wallet.generateKeys();
  await wallet.createAccount(wallet.keys.publicKey());

  console.log('created wallet');
  console.log(wallet.keys.publicKey(), wallet.keys.secret());
  console.log();

  let account = await wallet.account();

  wallet.on('tx', tx => {
    console.log(JSON.stringify(tx, null, 2));
  })

  wallet.listen();

})();
