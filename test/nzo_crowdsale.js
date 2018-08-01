var NZOCrowdsale = artifacts.require("./NZOCrowdsale.sol");
//import assertRevert from './helpers/assertRevert';


contract('NZOCrowdsale', (accounts) => {
    var contract;
    //var owner = "0xbcEDB2FAD161284807A4760DDd7Ed92e04CA8dff";
    var owner = accounts[0]; // for test

    var rate = Number(10*2);
    var buyWei = Number(1 * 10**18);
    var rateNew = Number(10*2);
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
        var balanceAccountTwoBefore = await contract.paidTokensOf(accounts[2]);
        var weiRaisedBefore = await contract.weiRaised.call();
        //console.log("tokenAllocatedBefore = " + tokenAllocatedBefore);

        await contract.buyTokens(accounts[2],{from:accounts[2], value:buyWei});
        var tokenAllocatedAfter = await contract.tokenAllocated.call();
        //console.log("tokenAllocatedAfter = " + tokenAllocatedAfter + "; rate*buyWei = " + Number(rate*buyWei));
        assert.isTrue(tokenAllocatedBefore < tokenAllocatedAfter);
        assert.equal(0, tokenAllocatedBefore);
        //assert.equal(Number(rate*buyWei), Number(tokenAllocatedAfter));

       var balanceAccountTwoAfter = await contract.paidTokensOf(accounts[2]);
       //console.log("balanceAccountTwoAfter = " + balanceAccountTwoAfter);
        assert.isTrue(balanceAccountTwoBefore < balanceAccountTwoAfter);
        assert.equal(0, balanceAccountTwoBefore);
        //assert.equal(rate*buyWei, balanceAccountTwoAfter);

        var weiRaisedAfter = await contract.weiRaised.call();
        //console.log("weiRaisedAfter = " + weiRaisedAfter);
        assert.isTrue(weiRaisedBefore < weiRaisedAfter);
        assert.equal(0, weiRaisedBefore);
        assert.equal(buyWei, weiRaisedAfter);

        var depositedAfter = await contract.getDeposited.call(accounts[2]);
        //console.log("DepositedAfter = " + depositedAfter);
        assert.equal(buyWei, depositedAfter);

        var balanceAccountThreeBefore = await contract.paidTokensOf(accounts[3]);
        await contract.buyTokens(accounts[3],{from:accounts[3], value:buyWeiNew});
        var balanceAccountThreeAfter = await contract.paidTokensOf(accounts[3]);
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

        currentDate = 1536076800; // Sep, 04
        period = await contract.getPeriod(currentDate);
        assert.equal(1, period);

        currentDate = 1537459200; // Sep, 20
        period = await contract.getPeriod(currentDate);
        assert.equal(2, period);

        currentDate = 1538755200; // Oct, 05
        period = await contract.getPeriod(currentDate);
        assert.equal(3, period);

        currentDate = 1540051200; // Oct, 20
        period = await contract.getPeriod(currentDate);
        assert.equal(4, period);

        currentDate = 1541433600; // Nov, 05
        period = await contract.getPeriod(currentDate);
        assert.equal(100, period);

        currentDate = 1562342400; // Jun, 05
        period = await contract.getPeriod(currentDate);
        assert.equal(100, period);
    });

    it('verification tokens limit min amount', async ()  => {
        var numberTokensMinWey = await contract.validPurchaseTokens.call(buyWeiMin);
        //console.log("numberTokensMinWey = " + numberTokensMinWey);
        assert.equal(0, Number(numberTokensMinWey));
    });

});



