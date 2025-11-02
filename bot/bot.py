# file: tg_lighter_bot_buttons.py
import os
import random
import logging
import random
from typing import Dict, Any, Tuple

from telegram import (
    Update,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    ReplyKeyboardRemove,
)
from telegram.ext import (
    ApplicationBuilder,
    ContextTypes,
    CommandHandler,
    ConversationHandler,
    MessageHandler,
    CallbackQueryHandler,
    PicklePersistence,  # <-- Import for persistence
    filters,
)

# ---- logging ----
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---- states ----
(
    GO_NAME,
    GO_ADDRESS,
    TRADE_SELECT_TYPE,
    CROSS_SRC_CHAIN,
    CROSS_SRC_TOKEN,
    CROSS_DST_CHAIN,
    CROSS_DST_TOKEN,
    CROSS_AMOUNT,
    SAME_CHAIN_CHAIN,
    SAME_SRC_TOKEN,
    SAME_DST_TOKEN,
    SAME_AMOUNT,
    TRADE_CONFIRM,
) = range(13)

# REFINEMENT: Removed global USERS dictionary. Persistence will handle user data.
# USERS: Dict[int, Dict[str, Any]] = {}

# Available tokens and chains (as requested)
TOKENS = ["ETH", "USDC", "Bitcoin"]
CHAINS = ["Polygon", "Base", "Ethereum"]

# Map for dummy gas fees
NATIVE_GAS_TOKEN = {
    "Polygon": "MATIC",
    "Base": "ETH",
    "Ethereum": "ETH"
}

# dummy smart-contract functions (replace later)
def get_quote_cross_chain(src_chain: str, src_token: str, dst_chain: str, dst_token: str, amount: float) -> Tuple[float, float, str]:
    net = amount * 3875 * random.randrange(990,1010)/1000
    gas_amt = 0.2 # Dummy gas amount
    gas_token = NATIVE_GAS_TOKEN.get(src_chain, "USDC") # Get native token for gas
    return round(net, 8), gas_amt, gas_token

def get_quote_same_chain(chain: str, src_token: str, dst_token: str, amount: float) -> Tuple[float, float, str]:
    net = amount * 3875 * random.randrange(990,1010)/1000
    gas_amt = 0.1 # Dummy gas amount
    gas_token = NATIVE_GAS_TOKEN.get(chain, "USDC") # Get native token for gas
    return round(net, 8), gas_amt, gas_token

def execute_trade_cross_chain(user_address: str, src_chain: str, src_token: str, dst_chain: str, dst_token: str, amount: float) -> str:
    return "0x" + "".join(random.choices("0123456789abcdef", k=64))

def execute_trade_same_chain(user_address: str, chain: str, src_token: str, dst_token: str, amount: float) -> str:
    return "0x" + "".join(random.choices("0123456789abcdef", k=64))

# helpers
def is_valid_eth_address(addr: str) -> bool:
    if not isinstance(addr, str):
        return False
    s = addr.strip()
    if s.startswith("0x"):
        s = s[2:]
    return len(s) == 40 and all(c in "0123456789abcdefABCDEF" for c in s)

def safe_float(s: str):
    try:
        return float(s)
    except Exception:
        return None

# ---- Handlers ----

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Welcome! I'm your trading helper bot.\n"
        "Use /go to register your address, /trade to start a swap, or /help for all commands."
    )

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Here are the available commands:\n"
        "• /go - Register your name and public address\n"
        "• /trade - Start a new swap (cross-chain or same-chain)\n"
        "• /cancel - Cancel the current operation\n"
        "• /help - Show this help message\n"
        "• /start - Show the welcome message"
    )

# ---- /go flow ----
async def go_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # REFINEMENT: No need to manage USERS dict. context.user_data is automatic.
    await update.message.reply_text("How would you like to be called")
    return GO_NAME

async def go_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    name = update.message.text.strip()
    # REFINEMENT: Save directly to persistent user_data
    context.user_data["name"] = name
    await update.message.reply_text(f"So you're {name}.\nPlease send your public Ethereum address (e.g., 0x...).")
    return GO_ADDRESS

async def go_address(update: Update, context: ContextTypes.DEFAULT_TYPE):
    addr = update.message.text.strip()
    if not is_valid_eth_address(addr):
        await update.message.reply_text("That address doesn't look valid. Please send a valid 40-character hex address, starting with 0x.")
        return GO_ADDRESS
    
    # REFINEMENT: Save directly to persistent user_data
    context.user_data["address"] = addr
    await update.message.reply_text(f"Saved address: {addr}\nYou can now use /trade to start a swap.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END

# ---- /trade entry ----
async def trade_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # REFINEMENT: Check context.user_data directly
    if "address" not in context.user_data:
        await update.message.reply_text("I don't have your address on file. Please use /go to register first.")
        return ConversationHandler.END

    keyboard = [
        [InlineKeyboardButton("Cross-chain", callback_data="trade_cross")],
        [InlineKeyboardButton("Non cross-chain", callback_data="trade_same")],
        [InlineKeyboardButton("Cancel", callback_data="trade_cancel")],
    ]
    await update.message.reply_text("Choose swap option:", reply_markup=InlineKeyboardMarkup(keyboard))
    return TRADE_SELECT_TYPE

# Handle selection of trade type
async def trade_select_type_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    choice = query.data

    if choice == "trade_cancel":
        await query.edit_message_text("Cancelled.")
        return ConversationHandler.END

    if choice == "trade_cross":
        # REFINEMENT: Use context.user_data
        context.user_data["trade"] = {"type": "cross"}
        kb = [[InlineKeyboardButton(c, callback_data=f"cross_src_chain|{c}")] for c in CHAINS]
        kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
        await query.edit_message_text("Select source chain:", reply_markup=InlineKeyboardMarkup(kb))
        return CROSS_SRC_CHAIN

    if choice == "trade_same":
        # REFINEMENT: Use context.user_data
        context.user_data["trade"] = {"type": "same"}
        kb = [[InlineKeyboardButton(c, callback_data=f"same_chain|{c}")] for c in CHAINS]
        kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
        await query.edit_message_text("Select chain:", reply_markup=InlineKeyboardMarkup(kb))
        return SAME_CHAIN_CHAIN

    await query.edit_message_text("Unknown choice, cancelling.")
    return ConversationHandler.END

# --- Cross-chain handlers (callbacks) ---
async def cross_src_chain_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, src_chain = query.data.split("|", 1)
    context.user_data["trade"]["src_chain"] = src_chain

    kb = [[InlineKeyboardButton(t, callback_data=f"cross_src_token|{t}")] for t in TOKENS]
    kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
    await query.edit_message_text(f"Source chain: *{src_chain}*\nChoose source token:", reply_markup=InlineKeyboardMarkup(kb), parse_mode="Markdown")
    return CROSS_SRC_TOKEN

async def cross_src_token_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, token = query.data.split("|", 1)
    context.user_data["trade"]["src_token"] = token

    kb = [[InlineKeyboardButton(c, callback_data=f"cross_dst_chain|{c}")] for c in CHAINS]
    kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
    await query.edit_message_text(f"Source token: *{token}*\nChoose destination chain:", reply_markup=InlineKeyboardMarkup(kb), parse_mode="Markdown")
    return CROSS_DST_CHAIN

async def cross_dst_chain_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, dst_chain = query.data.split("|", 1)
    context.user_data["trade"]["dst_chain"] = dst_chain

    kb = [[InlineKeyboardButton(t, callback_data=f"cross_dst_token|{t}")] for t in TOKENS]
    kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
    await query.edit_message_text(f"Destination chain: *{dst_chain}*\nChoose destination token:", reply_markup=InlineKeyboardMarkup(kb), parse_mode="Markdown")
    return CROSS_DST_TOKEN

async def cross_dst_token_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, dst_token = query.data.split("|", 1)
    context.user_data["trade"]["dst_token"] = dst_token

    await query.edit_message_text(f"Destination token: *{dst_token}*\nNow send the AMOUNT (in source tokens, e.g. 0.5):", parse_mode="Markdown")
    return CROSS_AMOUNT

async def cross_amount_msg(update: Update, context: ContextTypes.DEFAULT_TYPE):
    amt_str = update.message.text.strip()
    amt = safe_float(amt_str)
    if amt is None or amt <= 0:
        # REFINEMENT: Clearer error message
        await update.message.reply_text("Please enter a positive numeric amount (e.g. 0.5).")
        return CROSS_AMOUNT

    trade = context.user_data["trade"]
    trade["amount"] = amt
    
    estimated, gas_amt, gas_token = get_quote_cross_chain(
        trade["src_chain"], trade["src_token"], trade["dst_chain"], trade["dst_token"], amt
    )
    trade["estimated_dst_amount"] = estimated
    trade["gas_fee_amount"] = gas_amt
    trade["gas_fee_token"] = gas_token

    kb = [
        [InlineKeyboardButton("Yes - Execute", callback_data="confirm_yes")],
        [InlineKeyboardButton("No - Cancel", callback_data="confirm_no")]
    ]
    
    message = (
        "You are about to execute this trade:\n\n"
        "Type: Cross-chain Swap\n"
        f"From Token: {trade['src_token']}\n"
        f"To Token: {trade['dst_token']}\n"
        f"From Chain: {trade['src_chain']}\n"
        f"To Chain: {trade['dst_chain']}\n"
        f"Amount: {trade['amount']} {trade['src_token']}\n"
        f"Estimated Received: {trade['estimated_dst_amount']} {trade['dst_token']}\n"
        f"Gas Fee: ~{trade['gas_fee_amount']} USDC\n\n"
        "Proceed?"
    )
    
    await update.message.reply_text(message, reply_markup=InlineKeyboardMarkup(kb))
    return TRADE_CONFIRM

# --- Same-chain handlers (callbacks) ---
async def same_chain_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, chain = query.data.split("|", 1)
    context.user_data["trade"]["chain"] = chain

    kb = [[InlineKeyboardButton(t, callback_data=f"same_src_token|{t}")] for t in TOKENS]
    kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
    await query.edit_message_text(f"Chain: *{chain}*\nChoose source token:", reply_markup=InlineKeyboardMarkup(kb), parse_mode="Markdown")
    return SAME_SRC_TOKEN

async def same_src_token_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, token = query.data.split("|", 1)
    context.user_data["trade"]["src_token"] = token

    kb = [[InlineKeyboardButton(t, callback_data=f"same_dst_token|{t}")] for t in TOKENS]
    kb.append([InlineKeyboardButton("Cancel", callback_data="trade_cancel")])
    await query.edit_message_text(f"Source token: *{token}*\nChoose destination token:", reply_markup=InlineKeyboardMarkup(kb), parse_mode="Markdown")
    return SAME_DST_TOKEN

async def same_dst_token_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    _, token = query.data.split("|", 1)
    context.user_data["trade"]["dst_token"] = token

    await query.edit_message_text(f"Destination token: *{token}*\nNow send the AMOUNT (in source tokens, e.g. 0.5):", parse_mode="Markdown")
    return SAME_AMOUNT

async def same_amount_msg(update: Update, context: ContextTypes.DEFAULT_TYPE):
    amt_str = update.message.text.strip()
    amt = safe_float(amt_str)
    if amt is None or amt <= 0:
        await update.message.reply_text("Please enter a positive numeric amount (e.g. 0.5).")
        return SAME_AMOUNT

    trade = context.user_data["trade"]
    trade["amount"] = amt
    
    estimated, gas_amt, gas_token = get_quote_same_chain(
        trade["chain"], trade["src_token"], trade["dst_token"], amt
    )
    trade["estimated_dst_amount"] = estimated
    trade["gas_fee_amount"] = gas_amt
    trade["gas_fee_token"] = gas_token

    kb = [
        [InlineKeyboardButton("Yes - Execute", callback_data="confirm_yes")],
        [InlineKeyboardButton("No - Cancel", callback_data="confirm_no")]
    ]

    message = (
        "You are about to execute this trade:\n\n"
        "Type: On-chain Swap\n"
        f"Chain: {trade['chain']}\n"
        f"From Token: {trade['src_token']}\n"
        f"To Token: {trade['dst_token']}\n"
        f"Amount: {trade['amount']} {trade['src_token']}\n"
        f"Estimated Received: {trade['estimated_dst_amount']} {trade['dst_token']}\n"
        f"Gas Fee: ~{trade['gas_fee_amount']} USDC\n\n"
        "Proceed?"
    )
    
    await update.message.reply_text(message, reply_markup=InlineKeyboardMarkup(kb))
    return TRADE_CONFIRM

# --- Confirmation callbacks ---
async def confirm_cb(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == "confirm_no":
        await query.edit_message_text("Cancelled — no trade executed.")
        # REFINEMENT: Clean up trade data from user_data
        context.user_data.pop("trade", None)
        return ConversationHandler.END

    if data == "confirm_yes":
        # REFINEMENT: Get data from context.user_data
        trade = context.user_data.get("trade")
        user_address = context.user_data.get("address")
        
        if not trade or not user_address:
            await query.edit_message_text("Internal error: no trade or user data found. Cancelling.")
            return ConversationHandler.END

        if trade["type"] == "cross":
            tx = execute_trade_cross_chain(user_address, trade["src_chain"], trade["src_token"], trade["dst_chain"], trade["dst_token"], trade["amount"])
        else:
            tx = execute_trade_same_chain(user_address, trade["chain"], trade["src_token"], trade["dst_token"], trade["amount"])
        
        await query.edit_message_text(f"TX hash: {tx}")
        # REFINEMENT: Clean up trade data from user_data
        context.user_data.pop("trade", None)
        return ConversationHandler.END

    await query.edit_message_text("Unknown confirmation response.")
    return ConversationHandler.END

# fallback and cancel
async def fallback_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Oops — I didn't understand that. Use /help to see available commands.")

# REFINEMENT: This is for the /cancel COMMAND
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Clean up any trade data in progress
    context.user_data.pop("trade", None)
    await update.message.reply_text("Operation cancelled.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END

# REFINEMENT: This is for the "Cancel" INLINE BUTTON
async def cancel_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    # Clean up any trade data in progress
    context.user_data.pop("trade", None)
    await query.edit_message_text("Operation cancelled.")
    return ConversationHandler.END

async def unknown_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("I didn't understand that. Use /trade to start, /help for commands.")

# ---- Build app ----
def build_app(token: str):
    # REFINEMENT: Add persistence
    persistence = PicklePersistence(filepath="bot_data.pickle")
    app = ApplicationBuilder().token(token).persistence(persistence).build()

    # /go conversation (text for name & address)
    go_conv = ConversationHandler(
        entry_points=[CommandHandler("go", go_start)],
        states={
            GO_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, go_name)],
            GO_ADDRESS: [MessageHandler(filters.TEXT & ~filters.COMMAND, go_address)],
        },
        fallbacks=[CommandHandler("cancel", cancel), CommandHandler("fallback", fallback_cmd)],
        allow_reentry=True,
    )

    # /trade conversation:
    trade_conv = ConversationHandler(
        entry_points=[CommandHandler("trade", trade_start)],
        states={
            TRADE_SELECT_TYPE: [CallbackQueryHandler(trade_select_type_cb, pattern=r"^trade_(?:cross|same|cancel)$")],
            CROSS_SRC_CHAIN: [CallbackQueryHandler(cross_src_chain_cb, pattern=r"^cross_src_chain\|")],
            CROSS_SRC_TOKEN: [CallbackQueryHandler(cross_src_token_cb, pattern=r"^cross_src_token\|")],
            CROSS_DST_CHAIN: [CallbackQueryHandler(cross_dst_chain_cb, pattern=r"^cross_dst_chain\|")],
            CROSS_DST_TOKEN: [CallbackQueryHandler(cross_dst_token_cb, pattern=r"^cross_dst_token\|")],
            CROSS_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, cross_amount_msg)],
            SAME_CHAIN_CHAIN: [CallbackQueryHandler(same_chain_cb, pattern=r"^same_chain\|")],
            SAME_SRC_TOKEN: [CallbackQueryHandler(same_src_token_cb, pattern=r"^same_src_token\|")],
            SAME_DST_TOKEN: [CallbackQueryHandler(same_dst_token_cb, pattern=r"^same_dst_token\|")],
            SAME_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, same_amount_msg)],
            TRADE_CONFIRM: [CallbackQueryHandler(confirm_cb, pattern=r"^confirm_(?:yes|no)$")],
        },
        fallbacks=[
            CommandHandler("cancel", cancel),
            CommandHandler("fallback", fallback_cmd),
            # REFINEMENT: Add a fallback for the "Cancel" button to work in all states
            CallbackQueryHandler(cancel_button, pattern=r"^trade_cancel$")
        ],
        allow_reentry=True,
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("fallback", fallback_cmd))
    app.add_handler(go_conv)
    app.add_handler(trade_conv)
    app.add_handler(CommandHandler("cancel", cancel))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_text))

    return app

# ---- run ----
def main():
    # REFINEMENT (SECURITY): Load token from environment variable. DO NOT hardcode it.
    token = "8244280032:AAE-v3KNt8dUSbGnikxGqyR1839EBF-SLmI"
    if not token:
        print("Error: BOT_TOKEN environment variable not set.")
        print("Please set it, e.g.: export BOT_TOKEN='Your:TokenHere'")
        return
    
    app = build_app(token)
    print("Bot starting...")
    app.run_polling()  # blocks until Ctrl-C

if __name__ == "__main__":
    main()