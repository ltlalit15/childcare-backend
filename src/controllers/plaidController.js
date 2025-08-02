    import asyncHandler from "express-async-handler";
    import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

    // 👇 Hardcoded Plaid Credentials
    const PLAID_CLIENT_ID = "685943158eb7b0002272f4aa";
    const PLAID_SECRET = "f65f53c222b9e42a6ebf02595ef736"; // sandbox key
    const PLAID_ENV = "sandbox"; // Change to 'production' and update secret if needed

    // 🛠️ Plaid Client Setup
    const config = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
        "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
        "PLAID-SECRET": PLAID_SECRET,
        },
    },
    });

    const plaidClient = new PlaidApi(config);

    // 1️⃣ Create Link Token
    export const createLinkToken = asyncHandler(async (req, res) => {
    try {
        const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: "user-unique-id" },
        client_name: "Your App Name",
        products: ["auth", "transactions"],
        country_codes: ["US"],
        language: "en",
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Plaid link token error:", error);
        res.status(500).json({ message: "Link token creation failed" });
    }
    });

    // Exchange Public Token
    export const exchangePublicToken = asyncHandler(async (req, res) => {
    const { public_token } = req.body;

    if (!public_token) {
        return res.status(400).json({ message: "public_token is required" });
    }

    try {
        const response = await plaidClient.itemPublicTokenExchange({ public_token });
        const { access_token, item_id } = response.data;

        res.status(200).json({ access_token, item_id });
    } catch (error) {
        console.error("Plaid token exchange error:", error);
        res.status(500).json({ message: "Token exchange failed" });
    }
    });

    // 3️⃣ Fetch Transactions
    export const getTransactions = asyncHandler(async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ message: "access_token is required" });
    }

    try {
        const startDate = "2024-01-01";
        const endDate = "2024-12-31";

        const response = await plaidClient.transactionsGet({
        access_token,
        start_date: startDate,
        end_date: endDate,
        options: { count: 10, offset: 0 },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Plaid transactions error:", error);
        res.status(500).json({ message: "Could not fetch transactions" });
    }
    });

    // 4️⃣ Add Bank Info with Plaid Token
    export const addBankInfo = asyncHandler(async (req, res) => {
    const { bank_name, account_number, routing_number, plaid_token } = req.body;

    if (!bank_name || !account_number || !routing_number || !plaid_token) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    try {
        const exchange = await plaidClient.itemPublicTokenExchange({ public_token: plaid_token });

        const access_token = exchange.data.access_token;
        const item_id = exchange.data.item_id;

        const accountsRes = await plaidClient.accountsGet({ access_token });
        const account = accountsRes.data.accounts[0];

        const bankData = {
        bank_name,
        account_number,
        routing_number,
        access_token,
        item_id,
        account_id: account.account_id,
        official_name: account.official_name,
        name: account.name,
        mask: account.mask,
        subtype: account.subtype,
        };

        // Save to DB here if needed
        res.status(200).json({ message: "Bank info saved", data: bankData });
    } catch (error) {
        console.error("Add bank info error:", error);
        res.status(500).json({ message: "Bank info failed" });
    }
    });





