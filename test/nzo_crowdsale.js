var NZOCrowdsale = artifacts.require("./NZOCrowdsale.sol");
//import assertRevert from './helpers/assertRevert';


contract('NZOCrowdsale', (accounts) => {
    var contract;
    //var owner = "0xbcEDB2FAD161284807A4760DDd7Ed92e04CA8dff";
    var owner = accounts[0]; // for test

    var rate = Number(10/5);
    var buyWei = Number(1 * 10**18);
    var rateNew = Number(10/5);
    var buyWeiNew = 6 * 10**17;
    var buyWeiMin = 1 * 10**15;
    var buyWeiLimitWeekZero = Number(8 * 10**18);
    var buyWeiLimitWeekOther = Number(12 * 10**18);

    var fundForSale = 12600 * 10**24;

    it('should deployed contract', async ()  => {
        assert.equal(undefined, contract);
        contract = await NZOCrowdsale.deployed();
        assert.notEqual(undefined, contract);
    });

    it('get address contract', async ()  => {
        assert.notEqual(undefined, contract.address);
    });

    it('verification balance owner contract', async ()  => {
        var balanceOwner = await contract.balanceOf(owner);
        //console.log("balanceOwner = " + balanceOwner);
        assert.equal(fundForSale, balanceOwner);
    });


    it('verification of receiving Ether', async ()  => {

        var tokenAllocatedBefore = await contract.tokenAllocated.call();
        var balanceAccountTwoBefore = await contract.balanceOf(accounts[2]);
        var weiRaisedBefore = await contract.weiRaised.call();
        //console.log("tokenAllocatedBefore = " + tokenAllocatedBefore);

        await contract.buyTokens(accounts[2],{from:accounts[2], value:buyWei});
        var tokenAllocatedAfter = await contract.tokenAllocated.call();
        //console.log("tokenAllocatedAfter = " + tokenAllocatedAfter + "; rate*buyWei = " + Number(rate*buyWei));
        assert.isTrue(tokenAllocatedBefore < tokenAllocatedAfter);
        assert.equal(0, tokenAllocatedBefore);
        assert.equal(Number(rate*buyWei), Number(tokenAllocatedAfter));

       var balanceAccountTwoAfter = await contract.balanceOf(accounts[2]);
        assert.isTrue(balanceAccountTwoBefore < balanceAccountTwoAfter);
        assert.equal(0, balanceAccountTwoBefore);
        assert.equal(rate*buyWei, balanceAccountTwoAfter);

        var weiRaisedAfter = await contract.weiRaised.call();
        //console.log("weiRaisedAfter = " + weiRaisedAfter);
        assert.isTrue(weiRaisedBefore < weiRaisedAfter);
        assert.equal(0, weiRaisedBefore);
        assert.equal(buyWei, weiRaisedAfter);

        var depositedAfter = await contract.getDeposited.call(accounts[2]);
        //console.log("DepositedAfter = " + depositedAfter);
        assert.equal(buyWei, depositedAfter);

        var balanceAccountThreeBefore = await contract.balanceOf(accounts[3]);
        await contract.buyTokens(accounts[3],{from:accounts[3], value:buyWeiNew});
        var balanceAccountThreeAfter = await contract.balanceOf(accounts[3]);
        assert.isTrue(balanceAccountThreeBefore < balanceAccountThreeAfter);
        assert.equal(0, balanceAccountThreeBefore);
        //console.log("balanceAccountThreeAfter = " + balanceAccountThreeAfter);
        assert.equal(rateNew*buyWeiNew, balanceAccountThreeAfter);

        var balanceOwnerAfter = await contract.balanceOf(owner);
        //console.log("balanceOwnerAfter = " + Number(balanceOwnerAfter));
        //assert.equal(fundForSale - balanceAccountThreeAfter - balanceAccountTwoAfter, balanceOwnerAfter);
    });

    it('verification define period', async ()  => {
        var currentDate = 1528128000; // Jun, 04
        period = await contract.getPeriod(currentDate);
        assert.equal(100, period);

        currentDate = 1533513600; // Aug, 06
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);

        currentDate = 1534694400; // Aug, 19
        period = await contract.getPeriod(currentDate);
        assert.equal(1, period);

        currentDate = 1535299200; // Aug, 26
        period = await contract.getPeriod(currentDate);
        assert.equal(2, period);

        currentDate = 1535846400; // Sep, 2
        period = await contract.getPeriod(currentDate);
        assert.equal(3, period);

        currentDate = 1562169600; // Jul, 03, 2019
        period = await contract.getPeriod(currentDate);
        assert.equal(46, period);

        currentDate = 1562342400; // Jun, 05
        period = await contract.getPeriod(currentDate);
        assert.equal(100, period);
    });

    it('verification claim tokens', async ()  => {
        var balanceAccountOneBefore = await contract.balanceOf(accounts[1]);
        assert.equal(0, balanceAccountOneBefore);
        await contract.buyTokens(accounts[1],{from:accounts[1], value:buyWei});
        var balanceAccountOneAfter = await contract.balanceOf(accounts[1]);
        await contract.transfer(contract.address,balanceAccountOneAfter,{from:accounts[1]});
        var balanceContractBefore = await contract.balanceOf(contract.address);
        assert.equal(buyWei*rate, balanceContractBefore);
        //console.log("balanceContractBefore = " + balanceContractBefore);
        var balanceAccountAfter = await contract.balanceOf(accounts[1]);
        assert.equal(0, balanceAccountAfter);
        var balanceOwnerBefore = await contract.balanceOf(owner);
        await contract.claimTokens(contract.address,{from:accounts[0]});
        var balanceContractAfter = await contract.balanceOf(contract.address);
        assert.equal(0, balanceContractAfter);
        var balanceOwnerAfter = await contract.balanceOf(owner);
        assert.equal(true, balanceOwnerBefore<balanceOwnerAfter);
    });

    it('verification tokens limit min amount', async ()  => {
        var numberTokensMinWey = await contract.validPurchaseTokens.call(buyWeiMin);
        //console.log("numberTokensMinWey = " + numberTokensMinWey);
        assert.equal(0, Number(numberTokensMinWey));
    });

    it('checking the limit of the amount of tokens by stages of sales', async ()  => {
        //var numberTokensLimit = await contract.validPurchaseTokens.call(buyWeiLimitWeekZero); //test time week Zero
        //assert.equal(0, Number(numberTokensLimit));
        var numberTokensLimit = await contract.validPurchaseTokens.call(buyWeiLimitWeekOther); //test time week #1
        assert.equal(24e18, Number(numberTokensLimit));
        //console.log("numberTokensLimit = " + numberTokensLimit);
    });

});



