
var Wallet = require('../lib/wallet');

var chai = require('chai');
var expect = chai.expect;

var StellarSdk = require('stellar-sdk');


var CLEANUP_ID = 'GDXFGXZAXGBEE7UD3SGFPJE7JMFEY4CTW4XNVDRADO7RCPZ6QTOUSTLU';
var TEST_WALLET = null;

describe('Wallet', () => {
  describe('#constructor()', () => {
    it('should initialize without keys if secret not given', async () => {
      var w = new Wallet();
      expect(w.keys).to.be.undefined;
    });
    it('should initialize with correct keys if secret given', async () => {
      var w = new Wallet('SBFSJDJSV3BUIMAEF2LLI7NYNH4DICBYJ4HTHHED52EKPNSVDJKWBJ5E');
      expect(w.keys.secret()).to.equal('SBFSJDJSV3BUIMAEF2LLI7NYNH4DICBYJ4HTHHED52EKPNSVDJKWBJ5E');
      expect(w.keys.publicKey()).to.equal('GD2WVUB52CYWEBSP5KAM6QR7XMGRQVEBHSV3XSEVLQDP25677SHBSUNI');
    });
  });
  describe('#generateKeys()', () => {
    it('should correctly generate keys', async () => {
      var w = new Wallet();
      w.keys = await w.generateKeys();
      expect(w.keys.publicKey()).to.be.a('string');
      expect(w.keys.secret()).to.be.a('string');
    });
  });
  describe('#createAccount()', () => {
    it('new wallet should not have account', async () => {
      var w = new Wallet();
      w.keys = await w.generateKeys();
      try {
        var account = await w.account();
      } catch (err) {
        expect(err.message.status).to.equal(404);
      }
      expect(account).to.be.undefined;
      TEST_WALLET = w;
      return;
    });

    it('should create and fund wallet', async () => {
      var w = TEST_WALLET;
      await w.createAccount(w.keys.publicKey());
      try {
        var account = await w.account();
      } catch (err) {
        console.log(err.message);
        expect(err).to.be.undefined;
      }
      expect(account).to.not.be.undefined;
      expect(account.balances[0].balance).to.equal('10000.0000000');
      return;
    }).timeout(10*1000);

  });

  describe('#send()', async () => {
    it('should send to cleanup wallet', async () => {
      var w = TEST_WALLET;
      try {
        await w.send(CLEANUP_ID, StellarSdk.Asset.native(), '9990');
        var account = await w.account();
      } catch (err) {
        expect(err).to.be.undefined;
      }
      expect(account.balances[0].balance).to.equal('9.9999900');
      return;
    }).timeout(10*1000);
  });

  describe('#trust()', async () => {
    it('should create trustline for custom asset', async () => {
      var w = TEST_WALLET;
      var asset = new StellarSdk.Asset('GAFO', CLEANUP_ID);
      try {
        await w.trust(asset, '1000');
        var account = await w.account();
      } catch (err) {
        expect(err).to.be.undefined;
      }

      var balances = {};
      account.balances.map(b => {
        if (b.asset_type == 'native') balances['XLM'] = b;
        else                        balances[b.asset_code] = b;
      });

      expect(parseInt(balances.GAFO.limit)).to.equal(1000);
      expect(parseInt(balances.GAFO.balance)).to.equal(0);
      expect(balances.GAFO.asset_issuer).to.equal(CLEANUP_ID);
      return;

    }).timeout(10*1000);
  });

  describe('#setOptions()', async () => {
    it('should correctly set flags', async () => {
      var w = TEST_WALLET;
      var account;
      try {
        await w.setOptions({setFlags: StellarSdk.AuthRevocableFlag | StellarSdk.AuthRequiredFlag})
        account = await w.account();
      } catch (err) {
        expect(err).to.be.undefined;
      }
      expect(account.flags.auth_required).to.be.true;
      expect(account.flags.auth_revocable).to.be.true;
    }).timeout(10*1000);
    it('should correctly clear flags', async () => {
      var w = TEST_WALLET;
      var account;
      try {
        await w.setOptions({clearFlags: StellarSdk.AuthRevocableFlag | StellarSdk.AuthRequiredFlag})
        account = await w.account();
      } catch (err) {
        expect(err).to.be.undefined;
      }
      expect(account.flags.auth_required).to.be.false;
      expect(account.flags.auth_revocable).to.be.false;
    }).timeout(10*1000);
  });

});
