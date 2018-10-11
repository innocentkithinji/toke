var DappToken = artifacts.require("./DappToken.sol");

function sleep(milliseconds) {
  console.log("sleeping");
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
  console.log("done sleeping");
}


contract('DappToken', function(accounts){


  it('initializes with a name', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.name()
      // assert.equal(tokenInstance.name(), "Token");
    }).then(function(name){
      assert(name, "Chips", "asserts the name")
    })
  })

  it('Conform standard', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.standard()
      // assert.equal(tokenInstance.name(), "Token");
    }).then(function(standard){
      assert(standard, "v1.0", "Correct version")
    })
  })


  it('initializes with a symbol', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.symbol()
      // assert.equal(tokenInstance.name(), "Token");
    }).then(function(name){
      assert(name, "CHP", "asserts the symbol")
    })
  })

  it('initializes with a _initialSupply', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.totalSupply()
      // assert.equal(tokenInstance.name(), "Token");
    }).then(function(totalSupply){
      assert(totalSupply.toNumber(), 1000000 , "initializes with a _initialSupply")
    })
  })

  it('assigns initialSupply to deployer', function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.balanceOf(accounts[0])
      // assert.equal(tokenInstance.name(), "Token");
    }).then(function(balance){
      assert(balance.toNumber(), 100000, "assert assigns initialSupply to deployer")
    })
  })

  it("user cannot send what they don't have", function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.transfer.call(accounts[1], 999999999999999999);
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 1, 'error message contain revert');
    });
  })

  it("can transfer", function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.transfer(accounts[1], 150, {from: accounts[0]});
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
      return tokenInstance.balanceOf(accounts[1]);
    }).then(function(balance){
      assert.equal(balance.toNumber(), 150, 'adds the amount to the recieving account' )
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(bal){
      assert.equal(bal.toNumber(), 999850, 'deducted from the sender')
    });
  })


  it("can approve", function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 100, {from: accounts[1]})
    }).then(function(success){
      assert.equal( success, true)
      return tokenInstance.approve(accounts[1], 100)
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'triggers approve event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'check owner')
      return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then(function(allowance){
      assert.equal(allowance.toNumber(), 100, "stores the allowance");
    });
  });


  it("can handle delegated transfers", function(){
    return DappToken.deployed().then(function(instance){
      tokenInstance = instance;
      fromAcc = accounts[2];
      toAcc = accounts[3];
      spendingAcc = accounts[4];
      return tokenInstance.transfer(fromAcc, 100, {from: accounts[0]});
    }).then(function(receipt){
      return tokenInstance.approve(spendingAcc, 10, {from: fromAcc});
    }).then(function(){
      return tokenInstance.transferFrom(fromAcc, toAcc, 9999, {from: spendingAcc})
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') > 0 , "cannot transfer ammount that you dont have")
      return tokenInstance.transferFrom(fromAcc, toAcc, 20, {from: spendingAcc})
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') > 0, "cannot transfer more than allowed" )
      return tokenInstance.transferFrom.call(fromAcc, toAcc, 10, {from: spendingAcc});
    }).then(function(success){
      assert.equal(success, true);
      return tokenInstance.transferFrom(fromAcc, toAcc, 10, {from: spendingAcc});
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'triggers approve event');
      assert.equal(receipt.logs[0].args._from, fromAcc, 'check owner')
      return tokenInstance.balanceOf(fromAcc);
    }).then(function(fromBal){
      assert.equal(fromBal.toNumber(), 90, 'Changes the allowance balance')
      return tokenInstance.balanceOf(toAcc);
    }).then(function(toBalance){
      assert(toBalance, 10, "adds the amount to the other account");
      return tokenInstance.allowance(fromAcc, spendingAcc);
    }).then(function(allowance){
      assert.equal(allowance, 0, "deducts from the spending account allowance");
    });
  })


})
