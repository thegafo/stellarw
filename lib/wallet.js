
const EventEmitter = require('events');
const request = require('request');
const StellarSdk = require('stellar-sdk');

class Wallet extends EventEmitter {

  constructor(secret, testnet) {
    super(); // for EventEmitter
    if (testnet) {
      this.server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      StellarSdk.Network.useTestNetwork();
    } else {
      this.server = new StellarSdk.Server('https://horizon.stellar.org');
      StellarSdk.Network.usePublicNetwork();
    }
    this.stellarSdk = StellarSdk;
    if (secret) this.keys = StellarSdk.Keypair.fromSecret(secret);
  }

  /**
  * generateKeys - generate new keys
  *
  * @return {Promise}  description
  */
  generateKeys ()  {
    return new Promise((resolve,reject) => {
      var pair = StellarSdk.Keypair.random();
      resolve(pair);
    });
  }

  /**
   * createAccount - description
   *
   * @param  {String} publicKey description
   * @return {Promise}           description
   */
  createAccount (publicKey) {
    return new Promise((resolve,reject) => {
      request.get({
        url: 'https://friendbot.stellar.org',
        qs: { addr: publicKey },
        json: true
      }, function(error, response, body) {
        if (error) return reject(error);
        if (response.statusCode != 200) return reject(new Error(body.detail));
        resolve(body);
      });
    });
  }

  /**
   * account - load account
   *
   * Note: throws 404 if account not found for current keys
   * -- must call createAccount first
   *
   * @return {Promise}  description
   */
  account (publicKey) {
    return this.server.loadAccount(publicKey || this.keys.publicKey());
  }

  /**
   * trust - trust an asset
   *
   * Note: setting limit to 0 deletes trustline
   *
   * @param  {type} asset the asset to trust (new StellarSdk.Asset(code, issuerId))
   * @param  {String} limit max number of units of this asset allowed
   * @return {type}       description
   */
  trust(asset, limit) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: asset,
          limit: limit
        }))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }

  /**
   * allowTrust - allow trust of an asset that requires authorization
   *
   * @param  {String} trustor   The trusting account (the one being authorized)
   * @param  {type} assetCode The asset code being authorized.
   * @param  {Boolean} authorize    True to authorize the line, false to deauthorize.
   * @return {Promise}           description
   */
  allowTrust(trustor, assetCode, authorize) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.allowTrust({
          trustor: trustor,
          assetCode: assetCode,
          authorize: authorize
        }))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }

  /**
   * listen - listen for incoming transactions
   *
   * - after started, wallet will emit 'tx' event on new transaction
   * - set cursor to "now" to ignore past transactions
   *
   * @param  {type} cursor description
   * @return {type}        description
   */
  listen(cursor) {
    var txHandler = async (txResponse) => {
        var id = txResponse.id;
        (await txResponse.operations()).records.map(r => {
          delete r._links;
          this.emit('tx', r);
        });
    };
    // start stream
    this.server.transactions()
      .forAccount(this.keys.publicKey())
      .cursor(cursor || undefined)
      .stream({
          onmessage: txHandler
        });
  }

  /**
   * createOffer - create an offer to buy an asset
   *
   * Explation of 'n' and 'd' parameters:
   * Price of 1 unit of selling in terms of buying.
   * For example, if you wanted to buy 5 BTC and sell 30 XLM
   * the price would be {5,30}.
   *
   * @param  {type} buyingAsset  description
   * @param  {type} sellingAsset description
   * @param  {String} amount       description
   * @param  {Integer} n            description
   * @param  {Integer} d            description
   * @return {type}              description
   */
  createOffer(buyingAsset, sellingAsset, amount,  n, d) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.manageOffer({
          buying: buyingAsset,
          selling: sellingAsset,
          amount: amount,
          price: {n: n, d: d},
          offerId: 0 // 0 is make offer
        }))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }


  /**
   * createPassiveOffer - description
   *
   * TODO test
   *
   * @param  {type} buyingAsset  description
   * @param  {type} sellingAsset description
   * @param  {type} amount       description
   * @param  {type} n            description
   * @param  {type} d            description
   * @return {type}              description
   */
  createPassiveOffer(buyingAsset, sellingAsset, amount, n, d) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.createPassiveOffer({
          buying: buyingAsset,
          selling: sellingAsset,
          amount: amount,
          price: {n: n, d: d},
        }))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }

  /**
   * cancelOffer - description
   *
   * TODO test
   *
   * @param  {String} offerId      description
   * @param  {StellarSdk.Asset} buyingAsset  description
   * @param  {StellarSdk.Asset} sellingAsset description
   * @param  {Integer} n            description
   * @param  {Integer} d            description
   * @return {Promise}              description
   */
  cancelOffer(offerId, buyingAsset, sellingAsset,  n, d) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.manageOffer({
          buying: buyingAsset,
          selling: sellingAsset,
          amount: '0',
          price: {n: n, d: d}, //
          offerId: offerId
        }))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }

  /**
   * send - description
   *
   * @param  {String} recipientId description
   * @param  {StellarSdk.Asset} asset       description
   * @param  {String} amount      description
   * @return {Promise}             description
   */
  send(recipientId, asset, amount) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.payment({
          destination: recipientId,
          asset: asset, //StellarSdk.Asset.native() or new StellarSdk.Asset('USD', 'issuerId'),
          amount: amount
        }))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }

  /**
   * setOptions - description
   *
   * Note: see http://stellar.github.io/js-stellar-sdk/Operation.html#.setOptions
   *
   * @param  {Object} options options object
   * @return {Promise}
   */
  setOptions(options) {
    return new Promise(async (resolve,reject) => {
      var account = await this.account();
      var tx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.setOptions(options))
        .build();
      tx.sign(this.keys);
      this.server.submitTransaction(tx).then(resolve).catch(reject);
    });
  }

}

module.exports = Wallet;
