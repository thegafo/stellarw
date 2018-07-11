
var Wallet = require('../lib/wallet');

var chai = require('chai');
var expect = chai.expect;

var CLEANUP_ID = 'GDXFGXZAXGBEE7UD3SGFPJE7JMFEY4CTW4XNVDRADO7RCPZ6QTOUSTLU';
var TEST_WALLET = null;

describe('Wallet', () => {
  describe('#constructor()', () => {
    it('should initialize without keys if secret not given', async () => {
      var w = new Wallet(null, true); // use testnet
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
      var w = new Wallet(null, true);
      w.keys = await w.generateKeys();
      expect(w.keys.publicKey()).to.be.a('string');
      expect(w.keys.secret()).to.be.a('string');
    });
  });
  describe('#createAccount()', () => {
    it('new wallet should not have account', async () => {
      var w = new Wallet(null, true);
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
        await w.send(CLEANUP_ID, w.stellarSdk.Asset.native(), '5990');
        var account = await w.account();
      } catch (err) {
        expect(err).to.be.undefined;
      }
      expect(account.balances[0].balance).to.equal('4009.9999900');
      return;
    }).timeout(10*1000);
  });

  describe('#sendWithMemo(text)', async () => {
    it('should send with text memo to cleanup wallet', async () => {
      var w = TEST_WALLET;
      try {
        var res = await w.sendWithMemo(CLEANUP_ID, w.stellarSdk.Asset.native(), '2000', 'text', "hello world");
        console.log(res.hash);
        var account = await w.account();
      } catch (err) {
        console.log(JSON.stringify(err));
        expect(err).to.be.undefined;
      }
      expect(account.balances[0].balance).to.equal('2009.9999800');
      return;
    }).timeout(10*1000);
  });

  describe('#sendWithMemo(hash)', async () => {
    it('should send with text memo to cleanup wallet', async () => {
      var w = TEST_WALLET;
      try {
        var res = await w.sendWithMemo(CLEANUP_ID, w.stellarSdk.Asset.native(), '1000', 'hash', 'a3b0ee496f6925ddd3404c584cfcf0933e9ee3e0515e8da70e0a18e8a946992d');
        console.log(res.hash);
        var account = await w.account();
      } catch (err) {
        console.log(JSON.stringify(err));
        expect(err).to.be.undefined;
      }
      expect(account.balances[0].balance).to.equal('1009.9999700');
      return;
    }).timeout(10*1000);
  });

  describe('#sendWithMemo(return)', async () => {
    it('should send with text memo to cleanup wallet', async () => {
      var w = TEST_WALLET;
      try {
        var res = await w.sendWithMemo(CLEANUP_ID, w.stellarSdk.Asset.native(), '1000', 'return', 'c50961e3b57c71c1bbb6050241d1bc89162dad1043a0167b82875943abfae4a9');
        console.log(res.hash);
        var account = await w.account();
      } catch (err) {
        console.log(JSON.stringify(err));
        expect(err).to.be.undefined;
      }
      expect(account.balances[0].balance).to.equal('9.9999600');
      return;
    }).timeout(10*1000);
  });

  describe('#trust()', async () => {
    it('should create trustline for custom asset', async () => {
      var w = TEST_WALLET;
      var asset = new w.stellarSdk.Asset('GAFO', CLEANUP_ID);
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
        await w.setOptions({setFlags: w.stellarSdk.AuthRevocableFlag | w.stellarSdk.AuthRequiredFlag})
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
        await w.setOptions({clearFlags: w.stellarSdk.AuthRevocableFlag | w.stellarSdk.AuthRequiredFlag})
        account = await w.account();
      } catch (err) {
        expect(err).to.be.undefined;
      }
      expect(account.flags.auth_required).to.be.false;
      expect(account.flags.auth_revocable).to.be.false;
    }).timeout(10*1000);
  });

});
