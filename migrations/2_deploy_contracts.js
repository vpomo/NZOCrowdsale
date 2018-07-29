const NZOCrowdsale = artifacts.require('./NZOCrowdsale.sol');

module.exports = (deployer) => {
    //http://www.onlineconversion.com/unix_time.htm
    var owner = "0xbcEDB2FAD161284807A4760DDd7Ed92e04CA8dff";

    deployer.deploy(NZOCrowdsale, owner);

};
