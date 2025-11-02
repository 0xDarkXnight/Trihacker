# Treth: Your Conversational DeFi Swap Bot

## 1. Description

Treth is a user-friendly Telegram bot designed to make decentralized finance (DeFi) accessible to everyone. It demystifies the trading process by replacing complex web interfaces with a simple, conversational menu.

At its core, Treth prompts users with two clear options: **On-Chain Swaps** (for trading tokens on a single network) and **Cross-Chain Swaps** (for moving and trading assets between different blockchains). The bot then securely handles the entire transaction, finding the best rates and executing the trade on your behalf.

---

## 2. Working of Bot

The Treth bot is designed for simplicity. The entire user journey is managed through a guided, menu-based conversation:

1.  **Initiation:** A user starts a chat with the bot and runs the `/start` command.
2.  **Wallet Setup:** The bot provides options to **create a new secure wallet** or **import an existing one** using a private key (which is immediately encrypted and never exposed).
3.  **Main Menu:** The user is presented with a clear main menu featuring two primary buttons:
    * `[ On-Chain Swap ]`
    * `[ Cross-Chain Swap ]`
4.  **Guided Flow (On-Chain):**
    * If the user selects `[ On-Chain Swap ]`, the bot asks a series of simple questions:
        * "Which network would you like to trade on? (e.g., Ethereum, Polygon, Optimism)"
        * "What token are you selling?"
        * "How much would you like to sell?"
        * "What token do you want to buy?"
5.  **Guided Flow (Cross-Chain):**
    * If the user selects `[ Cross-Chain Swap ]`, the bot guides them:
        * "From which network are you sending? (e.g., Polygon)"
        * "To which network are you sending? (e.g., Arbitrum)"
        * "What token are you sending?"
        * "How much are you sending?"
6.  **Route Finding:** The bot's backend connects to DEX and bridge aggregators (like 1inch, Socket, or Li.Fi) to find the most optimal route with the best price and lowest slippage.
7.  **Confirmation:** The bot presents a clear summary of the transaction (e.g., "You will send 1 ETH and receive ~1,590 USDC. Confirm?").
8.  **Execution:** Upon confirmation, the bot securely signs and executes the transaction.
9.  **Notification:** The user receives an instant notification of the transaction's success or failure, complete with a link to the blockchain explorer.

---

## 3. Features

* **Menu-Driven Interface:** No commands to memorize. All actions are handled through simple buttons and guided prompts.
* **Best-Rate On-Chain Swaps:** Integrates with leading DEX aggregators to ensure you get the best possible price for your trade on any supported chain.
* **Simplified Cross-Chain Swaps:** Leverages bridge aggregators to find the cheapest, fastest, and most secure routes between blockchains.
* **Secure Wallet Management:** Provides non-custodial wallet generation and import. Private keys are heavily encrypted and stored securely, accessible only by you.
* **Real-Time Notifications:** Get instant transaction status updates (pending, success, or failed) directly in your Telegram chat.
* **Gas Price Optimization:** Automatically suggests or uses optimal gas fees to balance speed and cost.
* **Multi-Chain Portfolio:** Use the `/wallet` command to see all your token balances across every network the bot supports.

---

## 4. Getting Started

This section is for developers who want to run their own instance of the Treth bot.

### 4.1. Prerequisites

* [Node.js](https://nodejs.org/) (v18.0.0 or later)
* [Yarn](https://yarnpkg.com/) or [NPM](https://www.npmjs.com/)
* [Git](https://git-scm.com/)
* A **Telegram Bot Token**. You can get one from [BotFather](https://t.me/botfather).
* Access to EVM RPC nodes (e.g., via [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/)).

### 4.2. Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd treth-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### 4.3. Configuration

1.  Create a `.env` file in the root directory by copying the example:
    ```bash
    cp .env.example .env
    ```

2.  Edit the `.env` file and add your credentials. This file is critical for the bot's operation.
    ```env
    # Your Telegram bot token from BotFather
    TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

    # A strong, unique secret phrase for encrypting user private keys
    ENCRYPTION_SECRET=YOUR_SUPER_STRONG_SECRET_PHRASE

    # RPC URLs for the chains you want to support
    ETHEREUM_RPC_URL=https://...
    POLYGON_RPC_URL=https://...
    ARBITRUM_RPC_URL=https://...

    # API keys for aggregators
    SOCKET_API_KEY=YOUR_SOCKET_API_KEY
    ONE_INCH_API_KEY=YOUR_1INCH_API_KEY
    ```

### 4.4. Running Locally

1.  **Build the project (if using TypeScript):**
    ```bash
    npm run build
    ```

2.  **Run the bot:**
    ```bash
    npm start
    ```

3.  **For development (with auto-reloading):**
    ```bash
    npm run dev
    ```

Your bot should now be online and responding to messages on Telegram.

---

## 5. Usage

Using the Treth bot is as simple as starting a conversation.

1.  **Start:** Send `/start` to the bot.
2.  **Wallet:** If it's your first time, the bot will guide you to `/create_wallet` or `/import_wallet`.
3.  **Trade:** From the main menu, tap either **[ On-Chain Swap ]** or **[ Cross-Chain Swap ]**.
4.  **Follow Prompts:** The bot will send you messages asking for the details of your trade.
5.  **Confirm:** Review the final confirmation message and tap **[ Confirm ]** to execute the trade.

**Other useful commands:**
* `/wallet`: Securely view your wallet address and token balances.
* `/help`: Get help and a list of available actions.
* `/reset`: (Advanced) Clear your current wallet and set up a new one.

---

## 6. Deployment

To run this bot in a production environment, you must deploy it on a persistent server (e.g., AWS EC2, DigitalOcean, or Heroku).

It is highly recommended to use a process manager like `pm2` to ensure the bot restarts automatically if it crashes.

```bash
# Install pm2 globally
npm install pm2 -g

# Build the bot (if needed)
npm run build

# Start the bot with pm2
pm2 start dist/index.js --name treth-bot
````

-----

## 7\. Project Status

Treth is currently in **active development**. The core functionalities are being built and tested. It is not recommended for use with significant funds on mainnet at this stage.

-----

## 8\. Contributing

Contributions are welcome\! If you'd like to improve Treth, please follow these steps:

1.  **Fork** the Project.
2.  Create your **Feature Branch** (`git checkout -b feature/NewFeature`).
3.  **Commit** your Changes (`git commit -m 'Add some NewFeature'`).
4.  **Push** to the Branch (`git push origin feature/NewFeature`).
5.  Open a **Pull Request**.

-----

## 9\. Project License

This project is licensed under the **MIT License**. See the `LICENSE` file in the repository for more details.

-----

## 10\. References

This bot is powered by several key technologies in the Web3 ecosystem:

  * [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api): The core library for interacting with the Telegram Bot API.
  * [Ethers.js](https://ethers.org/): A complete library for interacting with the Ethereum blockchain.
  * [Socket API](https://socket.tech/): Aggregator for cross-chain bridging and swaps.
  * [1inch API](https://1inch.io/api/): Aggregator for finding the best on-chain swap rates.

<!-- end list -->
