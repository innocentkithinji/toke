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


})
