const { Telegraf } = require('telegraf');
const { config } = require('dotenv');

// Load environment variables
config();

// Constants
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = 'https://pageswap.pages.dev/';
const PAGESWAP_LOGO = '🔄'; // Unicode swap symbol
const SOCIAL_LINKS = {
  website: 'https://pageswap.pages.dev',
  twitter: 'https://twitter.com/pageswap',
  discord: 'https://discord.gg/pageswap'
};

// Validate bot token
if (!BOT_TOKEN) {
  throw new Error('🚫 BOT_TOKEN must be provided in environment variables!');
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Helper function to create formatted messages
const createFormattedMessage = (text) => {
  return `${PAGESWAP_LOGO} ${text}`;
};

// Welcome message components
const welcomeMessage = `
*Welcome to PageSwap* ${PAGESWAP_LOGO}

Your gateway to seamless cross-chain trading and staking!

🔹 *Instant Token Swaps*
🔹 *Cross-Chain Bridge*
🔹 *High APR Staking*
🔹 *Low Transaction Fees*

Type /menu to see all available options.
`;

const menuKeyboard = {
  inline_keyboard: [
    [
      { text: "🚀 Launch App", web_app: { url: WEBAPP_URL } },
      { text: "💰 Trade Now", callback_data: 'trade' }
    ],
    [
      { text: "📊 Markets", callback_data: 'markets' },
      { text: "🏦 Stake", callback_data: 'stake' }
    ],
    [
      { text: "ℹ️ Help Center", callback_data: 'help' },
      { text: "📢 News", callback_data: 'news' }
    ]
  ]
};

// Command handlers
bot.command('start', async (ctx) => {
  try {
    await ctx.replyWithMarkdown(welcomeMessage, {
      reply_markup: menuKeyboard,
    });
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

bot.command('menu', async (ctx) => {
  await ctx.replyWithMarkdown(
    createFormattedMessage('*Choose an option:*'), 
    { reply_markup: menuKeyboard }
  );
});

// Help command with rich formatting
bot.command('help', async (ctx) => {
  const helpMessage = `
*PageSwap Bot Commands* ${PAGESWAP_LOGO}

📌 *Basic Commands*
/start - Launch the bot
/menu - Show main menu
/help - Display this help message
/stats - Show current statistics

🔧 *Trading Commands*
/price <symbol> - Check token price
/gas - Check current gas fees
/pairs - List trading pairs

💎 *Staking Commands*
/apy - View staking APY rates
/rewards - Check your rewards
/stake - Start staking

Need more help? Join our community:
`;

  await ctx.replyWithMarkdown(helpMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🌐 Website", url: SOCIAL_LINKS.website },
          { text: "🐦 Twitter", url: SOCIAL_LINKS.twitter },
          { text: "📱 Discord", url: SOCIAL_LINKS.discord }
        ]
      ]
    }
  });
});

// Callback query handlers
bot.action('trade', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithMarkdown(
    createFormattedMessage('*Launch the app to start trading:*'),
    {
      reply_markup: {
        inline_keyboard: [[
          { text: "🚀 Launch PageSwap", web_app: { url: WEBAPP_URL } }
        ]]
      }
    }
  );
});

bot.action('stake', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithMarkdown(
    createFormattedMessage(`
*PageSwap Staking* 🏦

Current APY Rates:
• 1 Month: 5.7% APY
• 3 Months: 8.2% APY
• 6 Months: 12.4% APY
• 12 Months: 18.7% APY

Launch the app to start staking:
    `),
    {
      reply_markup: {
        inline_keyboard: [[
          { text: "🚀 Start Staking", web_app: { url: `${WEBAPP_URL}#stake` } }
        ]]
      }
    }
  );
});

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Launch bot
const launch = async () => {
  try {
    await bot.launch();
    console.log(createFormattedMessage('PageSwap Bot is running...'));
  } catch (error) {
    console.error('Failed to launch bot:', error);
    process.exit(1);
  }
};

launch();

// Enable graceful stop
const stopBot = (signal) => {
  console.log(createFormattedMessage(`Received ${signal}, gracefully stopping bot...`));
  bot.stop(signal);
};

process.once('SIGINT', () => stopBot('SIGINT'));
process.once('SIGTERM', () => stopBot('SIGTERM'));