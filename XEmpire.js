const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const { GetApiHash, GetHashByTime } = require('./.hash');

const headers = (apiKey, apiTime, apiHash) => ({
    "Accept": "*/*",
    "Content-Type": "application/json",
    "Api-Key": apiKey,
    "Api-Hash": apiHash,
    "Api-Time": apiTime,
    "Origin": "https://game.muskempire.io",
    "Referer": "https://game.muskempire.io/",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
});

const auth = async (initData) => {
    const url = "https://api.muskempire.io/telegram/auth";
    const chatInstanceMatch = initData.match(/chat_instance=([^&]*)/);
    const chatInstance = chatInstanceMatch ? chatInstanceMatch[1] : '';

    const payload = {
        data: {
            initData: initData,
            platform: "android",
            chatId: ""
        }
    };
    const myHeader = GetApiHash(initData);
    const temp = myHeader.headers;
    const response = await axios.post(url, payload, { headers: myHeader.headers });
    return response.data;
};

const getUserData = async (apiKey) => {
    const url = "https://api.muskempire.io/user/data/all";
    const payload = { data: {} };
    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const claimDailyReward = async (apiKey, rewardId) => {
    const url = "https://api.muskempire.io/quests/daily/claim";
    const payload = { data: rewardId };
    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const getDB = async (apiKey) => {
    const url = "https://api.muskempire.io/dbs";
    const payload = { data: { dbs: ["all"] } };
    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const improveSkill = async (apiKey, skillKey) => {
    const url = "https://api.muskempire.io/skills/improve";
    const payload = { data: skillKey };
    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const guiTap = async (apiKey, amount, currentEnergy) => {
    const url = "https://api.muskempire.io/hero/action/tap";
    const seconds = Math.floor(Math.random() * (900 - 500 + 1)) + 500;
    const payload = {
        data: {
            data: {
                task: {
                    amount: amount,
                    currentEnergy: currentEnergy
                }
            },
            seconds: seconds
        }
    };
    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const pvpFight = async (apiKey, level, balance) => {
    const url = "https://api.muskempire.io/pvp/fight";
    const strategies = ['aggressive', 'flexible', 'protective'];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];

    let league;
    if (level >= 13 && balance >= 100000000) {
        league = 'diamond';
    }
    else if (level >= 10 && balance >= 10000000) {
        league = 'platinum';
    }
    else if (level >= 8 && balance >= 1000000) {
        league = 'gold';
    }
    else if (level > 4 && balance >= 100000) {
        league = 'silver';
    }
    else if (level <= 4 && balance >= 10000) {
        league = 'bronze';
    }
    else {
        return "Not eligible to participate in any tournament.";
    }

    const payload = {
        data: {
            league: league,
            strategy: strategy
        }
    };

    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const claimFightReward = async (apiKey) => {
    const url = "https://api.muskempire.io/pvp/claim";
    const payload = { data: {} };
    const [_time, _hash] = GetHashByTime(payload);
    const hdrs = headers(apiKey, _time, _hash);
    const response = await axios.post(url, payload, { headers: hdrs });
    return response.data;
};

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

const log = (msg) => {
    console.log(`${msg}`);
};

const waitWithCountdown = async (seconds) => {
    const cyanBold = '\x1b[1;36m'; // Bold cyan text
    const reset = '\x1b[0m'; // Reset text formatting

    for (let i = seconds; i >= 0; i--) {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${cyanBold}Wait ${i}${reset}`);            
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('');
};

const printBanner = () => {
    console.log("\x1b[1;91m" +  // Bold Red
`   _  __  ____           _                       
  | |/_/ / __/_ _  ___  (_)______                
 _>  <  / _//  ' \/ _ \/ / __/ -_)               
/_/|_| /___/_/_/_/ .__/_/_/  \\__/     ___________
  /  |/  /__ ___/_/ ___ ____  ___ _  |_  <  /_  /
 / /|_/ / _ \`/  ' \\/ _ \`/ _ \\/ _ \`/ _/_ </ //_ < 
/_/  /_/\\_,_/_/_/_/\\_,_/_//_/\\_, / /____/_/____/ 
                            /___/
` + "\x1b[0m" + "\x1b[1;96m" +  // Bold Cyan

`🐹************************🐹
Script created by: NaaM-M
Visit my GitHub: https://github.com/NaaM-M
*************************` + "\x1b[0m");  // Reset
};

const processUserData = async (apiKey, accountNumber) => {
    try {
        // Dynamically import the chalk module
        const { default: chalk } = await import('chalk');

        const userData = await getUserData(apiKey);
        const heroData = userData.data.hero;
        const firstName = userData.data.profile.firstName;
        const id = userData.data.profile.id;

        console.log(chalk.cyan.bold(`------Account No.${accountNumber + 1}------`));
        console.log(chalk.yellow.bold(`ID: ${id}`));
        console.log(chalk.green.bold(`Balance: ${heroData.money}`));
        console.log(chalk.cyan.bold(`PPH: ${heroData.moneyPerHour}`));
        console.log(chalk.magenta.bold(`Level: ${heroData.level}`));
        console.log(chalk.red.bold(`EXP: ${heroData.exp}`));
        console.log(chalk.yellow.bold(`Energy: ${heroData.earns.task.energy}`));
        console.log(chalk.green.bold(`PvP Wins: ${heroData.pvpWin}`));
        console.log(chalk.red.bold(`PvP Losses: ${heroData.pvpLose}`));
    } catch (error) {
        console.log(chalk.red.bold(`Error getting user data for account ${accountNumber + 1}: ${error.message}`));
    }
};



const processDailyRewards = async (apiKey) => {
    try {
        // Dynamically import the chalk module
        const { default: chalk } = await import('chalk');

        const userData = await getUserData(apiKey);
        const lastIndex = userData.data.hero.dailyRewardLastIndex;
        const nextRewardId = lastIndex + 1;

        try {
            const claimResponse = await claimDailyReward(apiKey, nextRewardId);
            if (claimResponse.success) {
                console.log(chalk.green.bold(`Roll call success for date ${nextRewardId}`));
            } else {
                console.log(chalk.red.bold(`Roll call failed on date ${nextRewardId}`));
            }
        } catch (error) {
            console.log(chalk.red.bold(`Error in roll call for date ${nextRewardId}: ${error.message}`));
        }
    } catch (error) {
        console.log(chalk.red.bold(`Error processing daily rewards: ${error.message}`));
    }
};


const processGuiTap = async (apiKey) => {
    try {
        // Dynamically import the chalk module
        const { default: chalk } = await import('chalk');

        const userData = await getUserData(apiKey);
        const energy = userData.data.hero.earns.task.energy;
        const actionResponse = await guiTap(apiKey, energy, 0);

        if (actionResponse.success) {
            console.log(chalk.green.bold('Tap success!'));
            const heroData = actionResponse.data.hero;
            console.log(chalk.cyan.bold(`New Balance: ${heroData.money}`));
        } else {
            console.log(chalk.red.bold('Tap failed!'));
        }
    } catch (error) {
        console.log(chalk.red.bold(`Error while performing tap: ${error.message}`));
    }
};

const processSkillUpgrade = async (apiKey) => {
    try {
        // Dynamically import the chalk module
        const { default: chalk } = await import('chalk');

        const dbSkillsResponse = await getDB(apiKey);
        if (dbSkillsResponse.success) {
            const userData = await getUserData(apiKey);
            let money = userData.data.hero.money;
            
            for (const skill of dbSkillsResponse.data.dbSkills) {
                while (money > skill.priceBasic) {
                    try {
                        const improveResponse = await improveSkill(apiKey, skill.key);
                        if (improveResponse.success) {
                            console.log(chalk.green.bold(`Upgrade your skills ${skill.title} success!`));
                            money = improveResponse.data.hero.money;
                        } else {
                            console.log(chalk.red.bold(`Upgrade your skills ${skill.title} failure!`));
                            break;
                        }
                    } catch (error) {
                        console.log(chalk.red.bold(`Error while upgrading skill ${skill.title}: ${error.message}`));
                        break;
                    }
                }
            }
        }
    } catch (error) {
        console.log(chalk.red.bold(`Error while upgrading skill: ${error.message}`));
    }
};


const processPvP = async (apiKey) => {
    try {
        const { default: chalk } = await import('chalk');
        const userData = await getUserData(apiKey);
        const { level } = userData.data.hero;
        const money = userData.data.hero.money;
        const id = userData.data.profile.id;

        for (let i = 0; i < 5; i++) {
            try {
                const fightResponse = await pvpFight(apiKey, level, money);
                if (fightResponse.success) {
                    const fightData = fightResponse.data.fight;
                    console.log(chalk.blue.bold(`Start negotiating first (${i + 1}): League: ${fightData.league}, Chiến lược: ${fightData.player2Strategy}, Hợp đồng: ${fightData.moneyContract}, Tiền lãi: ${fightData.moneyProfit}`));
                    if (fightData.winner === id) {
                        console.log(chalk.green.bold('Win! Claim your reward...'));
                    } else {
                        console.log(chalk.red.bold('I lost!'));
                    }
                    try {
                        const claimResponse = await claimFightReward(apiKey);
                        if (claimResponse.success) {
                            const claimData = claimResponse.data.fight;
                            const claimData2 = claimResponse.data.hero;
                            console.log(chalk.green.bold(`Reward Claimed: Contract: ${claimData.moneyContract}, Tiền lãi: ${claimData.moneyProfit}, Balance: ${claimData2.money}`));
                        } else {
                            console.log(chalk.red.bold('Claim Failed'));
                        }
                    } catch (error) {
                        console.log(chalk.red.bold(`Error while claiming reward PvP: ${error.message}`));
                    }
                } else {
                    console.log(chalk.red.bold('Not eligible for any negotiations!'));
                }
            } catch (error) {
                console.log(chalk.red.bold(`Error when doing PvP first time ${i + 1}: ${error.message}`));
            }
        }
    } catch (error) {
        console.log(chalk.red.bold(`Error in execution PvP: ${error.message}`));
    }
};

const main = async () => {
    console.clear();
    printBanner();  // Print banner after clearing the console

    const dataFile = path.join(__dirname, 'data.txt');
    const initDataList = fs.readFileSync(dataFile, 'utf8')
        .replace(/\r/g, '')
        .split('\n')
        .filter(Boolean);

    const nangcap = await askQuestion('Do you want to upgrade your skills? (y/n): ');
    const hoinangcap = nangcap.toLowerCase() === 'y';
    const pvp = await askQuestion('Do you want to play negotiation? (y/n): ');
    const hoipvp = pvp.toLowerCase() === 'y';
    console.clear();
    printBanner();  // Print banner after clearing the console

    while (true) {
        for (let no = 0; no < initDataList.length; no++) {
            const initData = initDataList[no];
            try {
                const authResponse = await auth(initData);
                if (authResponse.success) {
                    const apiKey = initData.match(/hash=([^&]*)/)[1];

                    await processUserData(apiKey, no);
                    await processDailyRewards(apiKey);
                    await processGuiTap(apiKey);
                    if (hoipvp) {
                        await processPvP(apiKey);
                    }
                    if (hoinangcap) {
                        await processSkillUpgrade(apiKey);
                    }
                } else {
                    console.log(`Login failed for account ${no + 1}!`);
                }
            } catch (error) {
                console.log(`Error processing account ${no + 1}: ${error.message}`);
            }
        }
        await waitWithCountdown(Math.floor(650));
        console.clear();
        printBanner();  // Print banner after clearing the console
    }
};

if (require.main === module) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
