// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
// 0x90F79bf6EB2c4f870365E785982E1f101E93b906
// 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
// 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
// 0x976EA74026E726554dB657fA54763abd0C3a0aa9
// 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
// 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
// 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
// 0xBcd4042DE499D14e55001CcbB24a551F3b954096
// 0x71bE63f3384f5fb98995898A86B02Fb2426c5788
// 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a
// 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec
// 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097
// 0xcd3B766CCDd6AE721141F452C550Ca635964ce71
// 0x2546BcD3c84621e976D8185a91A922aE77ECEc30
// 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E
// 0xdD2FD4581271e230360230F9337D5c0430Bf44C0
// 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
const { advanceBlock, advanceBlockTo } = require("@openzeppelin/test-helpers/src/time");
const { expect } = require("chai");
const { ethers } = require("hardhat");


let token;
    let pool;
    let today;
    let current;

    const SECONDS_IN_DAY = 86400;
    const MILISECONDS_IN_DAY = 86400000;
    const ONE_MILLION = 1000000;

    describe("test logic: ", async() =>{

        beforeEach(async() => {
            let MUUVToken = await ethers.getContractFactory('MUUV');
            let Vesting = await ethers.getContractFactory('Vesting');
            const blockNumAfter = await ethers.provider.getBlockNumber();
            const blockAfter = await ethers.provider.getBlock(blockNumAfter);
            const timestamp = blockAfter.timestamp;
            current = timestamp;
            console.log("current: " + current)
            token = await MUUVToken.deploy();
            pool = await Vesting.deploy(token.address, current + 86400 * 30, 2592000);
            console.log("tgetimétamp: " + (current + 86400 * 30))
            console.log("unlockPeriod: " + 2592000);
        });
    
        it('1.1: mint token', async () => {
            const [owner, acc1, acc2] = await ethers.getSigners();

            let x = (await token.balanceOf(owner.address)).toString();
            console.log("x: " + x);

            expect(x).to.equal("900000000000000000000000000");
        });

        it('1.2: transfer token to Vesting', async () => {
            await token.transfer(pool.address, 900000000);
            let x = await token.balanceOf(pool.address);
            console.log("x: " + parseInt(x));

            expect(x).to.equal(900000000);
        });

        
        it('1.3.1: withdraw pre-seed 3% TGE unlock', async () => {
            const [owner, acc1, acc2] = await ethers.getSigners();
    
            await token.transfer(pool.address, 900000000);
            await pool.setTGETimestamp(current + SECONDS_IN_DAY);
    
            await pool.addUser(acc2.address, 9000000, 3, 5184000, 24, 1);
            console.log("sta_vestingDurationrt: " + 24);

            let x;
            await ethers.provider.send('evm_increaseTime', [86400 * 12 * 30 * 5]);
            console.log(" evm_increaseTime current: " + (current + 86400 * 12 * 30 * 5));

            try{
                await pool.connect(acc2).claim();
            } catch (e) {
                throw e;
            }

            x = await token.balanceOf(acc2.address);
            console.log("x: " + parseInt(x));

            expect(x).to.equal(9000000);
        });

        
        
        it('1.3.2: withdraw pre-seed 3% TGE unlock, before cliff', async () => {
            const [owner, acc1, acc2] = await ethers.getSigners();
    
            await token.transfer(pool.address, 900000000);
            await pool.setTGETimestamp(current + SECONDS_IN_DAY);
    
            await pool.addUser(acc2.address, 9000000, 3, 5184000, 24, 1);
            console.log("sta_vestingDurationrt: " + 24);

            let x;
            await ethers.provider.send('evm_increaseTime', [3888000]); //45 days
            // console.log(" evm_increaseTime current: " + (current + 3888000));

            try{
                await pool.connect(acc2).claim();
            } catch (e) {
                throw e;
            }

            x = await token.balanceOf(acc2.address);
            console.log("x: " + parseInt(x));

            expect(x).to.equal(270000);
        });
        
        
        it('1.3.3: withdraw pre-seed 3% TGE unlock claim before cliff, then claim full', async () => {
            const [owner, acc1, acc2] = await ethers.getSigners();
    
            await token.transfer(pool.address, 900000000);
            await pool.setTGETimestamp(current + SECONDS_IN_DAY);
    
            await pool.addUser(acc2.address, 9000000, 3, 5184000, 24, 1);
            console.log("sta_vestingDurationrt: " + 24);

            let x;
            await ethers.provider.send('evm_increaseTime', [SECONDS_IN_DAY * 35]); //45 days
            // console.log(" evm_increaseTime current: " + (current + 3888000));

            try{
                await pool.connect(acc2).claim();
            } catch (e) {
                throw e;
            }

            x = await token.balanceOf(acc2.address);
            console.log("x: " + parseInt(x));

            expect(x).to.equal(270000);

            await ethers.provider.send('evm_increaseTime', [SECONDS_IN_DAY * 360 * 2 + SECONDS_IN_DAY * 30]); 
            // console.log(" evm_increaseTime current: " + (current + 3888000));

            try{
                await pool.connect(acc2).claim();
            } catch (e) {
                throw e;
            }
            let x2 = await token.balanceOf(acc2.address);
            console.log("x2: " + parseInt(x2));
            expect(x2).to.equal(9000000);
        });
        

        
        it('1.4: withdraw partners full', async () => {
            const [owner, acc1, acc2] = await ethers.getSigners();
    
            await token.transfer(pool.address, 900000000);
            await pool.setTGETimestamp(current + SECONDS_IN_DAY);
    
            await pool.addUser(acc1.address, 81000000, 3, 5184000, 24, 1);
            console.log("sta_vestingDurationrt: " + 24);

            let x;
            await ethers.provider.send('evm_increaseTime', [86400 * 12 * 30 * 1]);
            console.log(" evm_increaseTime current: " + (current + 86400 * 12 * 30 * 1));

            try{
                await pool.connect(acc1).claim();
            } catch (e) {
                throw e;
            }

            x = await token.balanceOf(acc1.address);
            console.log("x: " + parseInt(x));
            await ethers.provider.send('evm_increaseTime', [86400 * 12 * 30 * 2]);
            console.log(" evm_increaseTime current: " + (current + 86400 * 12 * 30 * 2));
            await pool.connect(acc1).claim();
            x = await token.balanceOf(acc1.address);
            console.log("x: " + parseInt(x));

            expect(x).to.equal(81000000);
        });
        
    });