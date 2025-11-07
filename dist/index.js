"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ensureValidToken: () => ensureValidToken,
  getAuthToken: () => getAuthToken,
  getCurrentUser: () => getCurrentUser,
  getDummyData: () => getDummyData,
  getSolBalance: () => getSolBalance,
  initSdk: () => initSdk,
  isInitialized: () => isInitialized,
  launchToken: () => launchToken,
  logoutSdk: () => logoutSdk,
  restoreSdk: () => restoreSdk,
  transferSol: () => transferSol
});
module.exports = __toCommonJS(index_exports);

// src/dummyData.ts
var getDummyData = () => {
  return {
    name: "Demo Smart Contract",
    chain: "Solana",
    address: "xyz123"
  };
};

// src/auth/authManager.ts
var import_cross_fetch = require("cross-fetch");
var _authToken = null;
var _user = null;
var VALIDATE_TOKEN_URL = "http://localhost:5001/api/v1/sdk/validate-api-key";
var TOKEN_KEY = "goldc_sdk_token";
var initSdk = (_0) => __async(null, [_0], function* ({ authToken }) {
  _authToken = authToken;
  try {
    const res = yield (0, import_cross_fetch.fetch)(VALIDATE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ apiKey: authToken })
    });
    if (!res.ok) {
      _authToken = null;
      _user = null;
      throw new Error("\u274C Token validation failed. Please log in again.");
    }
    _user = yield res.json();
    return _user;
  } catch (err) {
    _authToken = null;
    _user = null;
    throw err;
  }
});
var restoreSdk = () => __async(null, null, function* () {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    return yield initSdk({ authToken: token });
  } catch (e) {
    return null;
  }
});
var getAuthToken = () => {
  if (!_authToken)
    throw new Error(
      "\u274C SDK not initialized. Call initSdk() with a valid token."
    );
  return _authToken;
};
var getCurrentUser = () => {
  if (!_user)
    throw new Error("\u274C User not validated. Ensure initSdk() has completed.");
  return _user;
};
var isInitialized = () => !!_authToken;
var logoutSdk = () => {
  _authToken = null;
  _user = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};
var ensureValidToken = () => __async(null, null, function* () {
  if (!_authToken) throw new Error("\u274C SDK not initialized.");
  try {
    const res = yield (0, import_cross_fetch.fetch)(VALIDATE_TOKEN_URL, {
      method: "POST",
      headers: { Authorization: _authToken }
    });
    if (!res.ok) throw new Error("Token expired");
  } catch (err) {
    logoutSdk();
    throw new Error("\u274C Token expired or invalid. Please reauthenticate.");
  }
});

// src/auth/withAuth.ts
function withAuth(fn) {
  return (...args) => __async(null, null, function* () {
    const token = getAuthToken();
    yield ensureValidToken();
    return fn(token, ...args);
  });
}

// src/getSolBalance.ts
var _getSolBalance = (token, publicKey, connection) => __async(null, null, function* () {
  if (!publicKey) throw new Error("Public key is required");
  if (!connection) throw new Error("Connection is required");
  const lamports = yield connection.getBalance(publicKey);
  return lamports / 1e9;
});
var getSolBalance = withAuth(_getSolBalance);

// src/solana/transferSol.ts
var import_web3 = require("@solana/web3.js");
var _transferSol = (token, wallet, to, amount) => __async(null, null, function* () {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("\u274C Wallet not connected");
  }
  const recipient = typeof to === "string" ? new import_web3.PublicKey(to) : to;
  const connection = new import_web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const sender = wallet.publicKey;
  const lamports = Math.floor(amount * import_web3.LAMPORTS_PER_SOL);
  const balance = yield connection.getBalance(sender);
  if (balance < lamports) {
    throw new Error(
      `\u274C Insufficient balance. Need ${amount} SOL, have ${(balance / import_web3.LAMPORTS_PER_SOL).toFixed(4)} SOL`
    );
  }
  const tx = new import_web3.Transaction().add(
    import_web3.SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports
    })
  );
  tx.feePayer = sender;
  const { blockhash, lastValidBlockHeight } = yield connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  try {
    const txid = yield wallet.sendTransaction(tx, connection, {
      preflightCommitment: "confirmed"
    });
    yield connection.confirmTransaction(
      {
        signature: txid,
        blockhash,
        lastValidBlockHeight
      },
      "confirmed"
    );
    return txid;
  } catch (err) {
    console.error("\u274C Transfer failed:", err);
    throw new Error(`\u274C Transfer failed: ${(err == null ? void 0 : err.message) || "Unknown error"}`);
  }
});
var transferSol = withAuth(_transferSol);

// src/solana/contract/token.ts
var anchor3 = __toESM(require("@coral-xyz/anchor"));
var import_bn2 = require("bn.js");
var import_web35 = require("@solana/web3.js");
var import_spl_token = require("@solana/spl-token");

// src/solana/constants.ts
var anchor = __toESM(require("@coral-xyz/anchor"));
var import_web32 = require("@solana/web3.js");

// src/solana/abi/deaura.json
var deaura_default = {
  address: "BS9GdU2iwVEHC2y3nad2DVm3Abx3U2WyTnMnZ9SnfdUL",
  metadata: {
    name: "deaura",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor"
  },
  instructions: [
    {
      name: "add_liqudity",
      discriminator: [
        187,
        193,
        178,
        125,
        145,
        231,
        143,
        214
      ],
      accounts: [
        {
          name: "whirlpool_program",
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"
        },
        {
          name: "vault_authority",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          name: "launch_token_store",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  108,
                  97,
                  117,
                  110,
                  99,
                  104,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              },
              {
                kind: "account",
                path: "whirlpool"
              }
            ]
          }
        },
        {
          name: "whirlpool",
          writable: true
        },
        {
          name: "token_mint_a",
          writable: true
        },
        {
          name: "token_mint_b",
          writable: true
        },
        {
          name: "funder",
          writable: true,
          signer: true
        },
        {
          name: "token_vault_a",
          writable: true,
          signer: true
        },
        {
          name: "token_vault_b",
          writable: true,
          signer: true
        },
        {
          name: "tick_array_lower",
          writable: true
        },
        {
          name: "tick_array_upper",
          writable: true
        },
        {
          name: "position_owner",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          name: "position",
          writable: true
        },
        {
          name: "position_mint",
          writable: true,
          signer: true
        },
        {
          name: "position_token_account",
          writable: true
        },
        {
          name: "token_owner_account_a",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "position_owner"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint_a"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "token_owner_account_b",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "position_owner"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "token_mint_b"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "token_2022_program",
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          name: "metadata_update_auth"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "memo_program",
          address: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "token_metadata_program",
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      args: [
        {
          name: "with_token_metadata_extension",
          type: "bool"
        },
        {
          name: "liquidity_amount",
          type: "u128"
        }
      ]
    },
    {
      name: "claim_creator_fee",
      discriminator: [
        26,
        97,
        138,
        203,
        132,
        171,
        141,
        252
      ],
      accounts: [
        {
          name: "launch_token_store",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  108,
                  97,
                  117,
                  110,
                  99,
                  104,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              },
              {
                kind: "account",
                path: "whirlpool"
              }
            ]
          }
        },
        {
          name: "claimant",
          writable: true,
          signer: true
        },
        {
          name: "whirlpool",
          relations: [
            "launch_token_store"
          ]
        },
        {
          name: "position_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          name: "token_mint_a"
        },
        {
          name: "token_mint_b"
        },
        {
          name: "fee_vault_a",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "position_authority"
              },
              {
                kind: "account",
                path: "token_program_a"
              },
              {
                kind: "account",
                path: "token_mint_a"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "fee_vault_b",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "position_authority"
              },
              {
                kind: "account",
                path: "token_program_b"
              },
              {
                kind: "account",
                path: "token_mint_b"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "claimant_token_a",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "claimant"
              },
              {
                kind: "account",
                path: "token_program_a"
              },
              {
                kind: "account",
                path: "token_mint_a"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "claimant_token_b",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "claimant"
              },
              {
                kind: "account",
                path: "token_program_b"
              },
              {
                kind: "account",
                path: "token_mint_b"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "token_program_a",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "token_program_b",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        }
      ],
      args: []
    },
    {
      name: "collect_protocol_fee",
      discriminator: [
        136,
        136,
        252,
        221,
        194,
        66,
        126,
        89
      ],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "launch_token_store",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  108,
                  97,
                  117,
                  110,
                  99,
                  104,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              },
              {
                kind: "account",
                path: "whirlpool"
              }
            ]
          }
        },
        {
          name: "whirlpool_program",
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"
        },
        {
          name: "whirlpool"
        },
        {
          name: "position_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          name: "position",
          docs: [
            "Fees are measured from here pre-CPI"
          ],
          writable: true
        },
        {
          name: "position_token_account"
        },
        {
          name: "token_mint_a"
        },
        {
          name: "token_mint_b"
        },
        {
          name: "token_owner_account_a",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "position_authority"
              },
              {
                kind: "account",
                path: "token_program_a"
              },
              {
                kind: "account",
                path: "token_mint_a"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "token_vault_a",
          writable: true
        },
        {
          name: "token_owner_account_b",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "position_authority"
              },
              {
                kind: "account",
                path: "token_program_b"
              },
              {
                kind: "account",
                path: "token_mint_b"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "token_vault_b",
          writable: true
        },
        {
          name: "protocol_treasury",
          writable: true,
          address: "76U9hvHNUNn7YV5FekSzDHzqnHETsUpDKq4cMj2dMxNi"
        },
        {
          name: "protocol_fee_account_a",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "protocol_treasury"
              },
              {
                kind: "account",
                path: "token_program_a"
              },
              {
                kind: "account",
                path: "token_mint_a"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "protocol_fee_account_b",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "protocol_treasury"
              },
              {
                kind: "account",
                path: "token_program_b"
              },
              {
                kind: "account",
                path: "token_mint_b"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "token_program_a"
        },
        {
          name: "token_program_b"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "memo_program",
          address: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        }
      ],
      args: []
    },
    {
      name: "deposit",
      discriminator: [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "global_state",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          name: "vault_authority",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          name: "goldc_mint",
          writable: true,
          address: "9xJjgUFq86fNtZLXGEFW4u18PVGEvy8RH4YwS52MwXWU"
        },
        {
          name: "payer_goldc_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "payer"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "goldc_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "vnx_mint",
          writable: true,
          address: "28LpdHkgn3Smzhum4W4SWSYqbw8XUNbkVdztXhewbZBv"
        },
        {
          name: "payer_vnx_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "payer"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "vnx_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "vnx_vault",
          writable: true,
          address: "2cwPZqRcDjq5vZco8jQ4sFDMpEhTbKLD1cBmu4p8xD7r"
        },
        {
          name: "user_data",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                kind: "account",
                path: "payer"
              }
            ]
          }
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "initialize",
      discriminator: [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "global_state",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          name: "vault_authority",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          name: "goldc_mint",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  103,
                  111,
                  108,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          name: "metadata_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                kind: "account",
                path: "token_metadata_program"
              },
              {
                kind: "account",
                path: "goldc_mint"
              }
            ],
            program: {
              kind: "account",
              path: "token_metadata_program"
            }
          }
        },
        {
          name: "vnx_token_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118,
                  110,
                  120,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          name: "vnx_mint",
          writable: true,
          address: "28LpdHkgn3Smzhum4W4SWSYqbw8XUNbkVdztXhewbZBv"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "token_metadata_program",
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "admin_account",
          type: "pubkey"
        },
        {
          name: "treasuery",
          type: "pubkey"
        }
      ]
    },
    {
      name: "launch_token",
      discriminator: [
        10,
        128,
        86,
        171,
        3,
        137,
        161,
        244
      ],
      accounts: [
        {
          name: "launch_token_store",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  108,
                  97,
                  117,
                  110,
                  99,
                  104,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              },
              {
                kind: "account",
                path: "whirlpool"
              }
            ]
          }
        },
        {
          name: "whirlpool_program",
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"
        },
        {
          name: "whirlpools_config"
        },
        {
          name: "vault_authority",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          name: "whirlpool",
          writable: true
        },
        {
          name: "token_mint_a",
          writable: true,
          address: "9xJjgUFq86fNtZLXGEFW4u18PVGEvy8RH4YwS52MwXWU"
        },
        {
          name: "token_mint_b",
          writable: true,
          signer: true
        },
        {
          name: "metadata_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                kind: "account",
                path: "token_metadata_program"
              },
              {
                kind: "account",
                path: "token_mint_b"
              }
            ],
            program: {
              kind: "account",
              path: "token_metadata_program"
            }
          }
        },
        {
          name: "token_badge_a",
          writable: true
        },
        {
          name: "token_badge_b",
          writable: true
        },
        {
          name: "funder",
          writable: true,
          signer: true
        },
        {
          name: "token_vault_a",
          writable: true,
          signer: true
        },
        {
          name: "token_vault_b",
          writable: true,
          signer: true
        },
        {
          name: "fee_tier"
        },
        {
          name: "tick_array_lower",
          writable: true
        },
        {
          name: "tick_array_upper",
          writable: true
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        },
        {
          name: "rent",
          address: "SysvarRent111111111111111111111111111111111"
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "token_metadata_program",
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      args: [
        {
          name: "tick_spacing",
          type: "u16"
        },
        {
          name: "initial_sqrt_price",
          type: "u128"
        },
        {
          name: "start_tick_index_lower",
          type: "i32"
        },
        {
          name: "start_tick_index_upper",
          type: "i32"
        },
        {
          name: "tick_index_lower",
          type: "i32"
        },
        {
          name: "tick_index_upper",
          type: "i32"
        },
        {
          name: "token_name",
          type: "string"
        },
        {
          name: "token_symbol",
          type: "string"
        },
        {
          name: "token_uri",
          type: "string"
        },
        {
          name: "total_mint_a",
          type: "u64"
        },
        {
          name: "total_mint_b",
          type: "u64"
        }
      ]
    },
    {
      name: "redeem",
      discriminator: [
        184,
        12,
        86,
        149,
        70,
        196,
        97,
        225
      ],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "global_state",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          name: "vault_authority",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          name: "goldc_mint",
          writable: true,
          address: "9xJjgUFq86fNtZLXGEFW4u18PVGEvy8RH4YwS52MwXWU"
        },
        {
          name: "payer_goldc_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "payer"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "goldc_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "vnx_mint",
          writable: true,
          address: "28LpdHkgn3Smzhum4W4SWSYqbw8XUNbkVdztXhewbZBv"
        },
        {
          name: "payer_vnx_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "payer"
              },
              {
                kind: "const",
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                kind: "account",
                path: "vnx_mint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          name: "vnx_vault",
          writable: true,
          address: "2cwPZqRcDjq5vZco8jQ4sFDMpEhTbKLD1cBmu4p8xD7r"
        },
        {
          name: "user_data",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                kind: "account",
                path: "payer"
              }
            ]
          }
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "set_fee_recipients",
      discriminator: [
        49,
        149,
        195,
        192,
        109,
        40,
        213,
        123
      ],
      accounts: [
        {
          name: "admin",
          writable: true,
          signer: true
        },
        {
          name: "global_state",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          name: "whirlpool",
          writable: true
        },
        {
          name: "launch_token_store",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  108,
                  97,
                  117,
                  110,
                  99,
                  104,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              },
              {
                kind: "account",
                path: "whirlpool"
              }
            ]
          }
        }
      ],
      args: [
        {
          name: "integrator_account",
          type: "pubkey"
        },
        {
          name: "sales_rep_account",
          type: "pubkey"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "GlobalState",
      discriminator: [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      name: "LaunchedToken",
      discriminator: [
        53,
        29,
        67,
        30,
        75,
        106,
        63,
        0
      ]
    },
    {
      name: "Position",
      discriminator: [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    },
    {
      name: "User",
      discriminator: [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  events: [
    {
      name: "DepositEvent",
      discriminator: [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      name: "LiquidityAdded",
      discriminator: [
        154,
        26,
        221,
        108,
        238,
        64,
        217,
        161
      ]
    },
    {
      name: "RedeemEvent",
      discriminator: [
        90,
        114,
        83,
        146,
        212,
        26,
        217,
        59
      ]
    },
    {
      name: "TokenLaunched",
      discriminator: [
        225,
        232,
        190,
        147,
        213,
        192,
        220,
        168
      ]
    }
  ],
  errors: [
    {
      code: 6e3,
      name: "AmountIsZero",
      msg: "amount should not be zero"
    },
    {
      code: 6001,
      name: "InsufficientTokenBalance",
      msg: "amount is too high"
    },
    {
      code: 6002,
      name: "NumericalOverflow",
      msg: "Numerical overflow occurred."
    },
    {
      code: 6003,
      name: "NotAuthorized",
      msg: "Account not authorized to perform this Action"
    },
    {
      code: 6004,
      name: "InvalidTotalMint",
      msg: "Invalid total mint amount"
    },
    {
      code: 6005,
      name: "InvalidTickIndices",
      msg: "Invalid tick indices"
    },
    {
      code: 6006,
      name: "TokenNameTooLong",
      msg: "Token name too long"
    },
    {
      code: 6007,
      name: "UnauthorizedClaimant",
      msg: "Unauthorized claimant"
    },
    {
      code: 6008,
      name: "LiqudityAlreadyAdded",
      msg: "Initial Liqudity for position is added"
    },
    {
      code: 6009,
      name: "IncorrectAccount",
      msg: "Account passed is Incorrect"
    }
  ],
  types: [
    {
      name: "DepositEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey"
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "total_vnx_deposited",
            type: "u64"
          },
          {
            name: "timestamp",
            type: "i64"
          }
        ]
      }
    },
    {
      name: "GlobalState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin_account",
            type: "pubkey"
          },
          {
            name: "treasuery",
            type: "pubkey"
          },
          {
            name: "is_minting_paused",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "LaunchedToken",
      type: {
        kind: "struct",
        fields: [
          {
            name: "token_mint_a",
            type: "pubkey"
          },
          {
            name: "token_mint_b",
            type: "pubkey"
          },
          {
            name: "token_deployer",
            type: "pubkey"
          },
          {
            name: "total_mint_a",
            type: "u64"
          },
          {
            name: "total_mint_b",
            type: "u64"
          },
          {
            name: "whirlpool",
            type: "pubkey"
          },
          {
            name: "token_a_pool_account",
            type: "pubkey"
          },
          {
            name: "token_b_pool_account",
            type: "pubkey"
          },
          {
            name: "tick_spacing",
            type: "u16"
          },
          {
            name: "initial_sqrt_price",
            type: "u128"
          },
          {
            name: "tick_index_lower",
            type: "i32"
          },
          {
            name: "tick_index_upper",
            type: "i32"
          },
          {
            name: "fee_accumulated_token_a",
            type: "u64"
          },
          {
            name: "fee_accumulated_token_b",
            type: "u64"
          },
          {
            name: "integrator_account",
            type: {
              option: "pubkey"
            }
          },
          {
            name: "sales_rep_account",
            type: {
              option: "pubkey"
            }
          },
          {
            name: "fee_accumulated_integrator_a",
            type: "u64"
          },
          {
            name: "fee_accumulated_integrator_b",
            type: "u64"
          },
          {
            name: "fee_accumulated_sales_rep_a",
            type: "u64"
          },
          {
            name: "fee_accumulated_sales_rep_b",
            type: "u64"
          },
          {
            name: "is_liqudity_added",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "LiquidityAdded",
      type: {
        kind: "struct",
        fields: [
          {
            name: "whirlpool",
            type: "pubkey"
          },
          {
            name: "liquidity_amount",
            type: "u128"
          },
          {
            name: "token_amount_a",
            type: "u64"
          },
          {
            name: "token_amount_b",
            type: "u64"
          },
          {
            name: "position_owner",
            type: "pubkey"
          }
        ]
      }
    },
    {
      name: "Position",
      type: {
        kind: "struct",
        fields: [
          {
            name: "whirlpool",
            type: "pubkey"
          },
          {
            name: "position_mint",
            type: "pubkey"
          },
          {
            name: "liquidity",
            type: "u128"
          },
          {
            name: "tick_lower_index",
            type: "i32"
          },
          {
            name: "tick_upper_index",
            type: "i32"
          },
          {
            name: "fee_growth_checkpoint_a",
            type: "u128"
          },
          {
            name: "fee_owed_a",
            type: "u64"
          },
          {
            name: "fee_growth_checkpoint_b",
            type: "u128"
          },
          {
            name: "fee_owed_b",
            type: "u64"
          },
          {
            name: "reward_infos",
            type: {
              array: [
                {
                  defined: {
                    name: "PositionRewardInfo"
                  }
                },
                3
              ]
            }
          }
        ]
      }
    },
    {
      name: "PositionRewardInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "growth_inside_checkpoint",
            type: "u128"
          },
          {
            name: "amount_owed",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "RedeemEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey"
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "total_vnx_deposited",
            type: "u64"
          },
          {
            name: "timestamp",
            type: "i64"
          }
        ]
      }
    },
    {
      name: "TokenLaunched",
      type: {
        kind: "struct",
        fields: [
          {
            name: "token_mint_a",
            type: "pubkey"
          },
          {
            name: "token_mint_b",
            type: "pubkey"
          },
          {
            name: "whirlpool",
            type: "pubkey"
          },
          {
            name: "deployer",
            type: "pubkey"
          }
        ]
      }
    },
    {
      name: "User",
      type: {
        kind: "struct",
        fields: [
          {
            name: "total_vnx_deposited",
            type: "u64"
          }
        ]
      }
    }
  ]
};

// src/solana/constants.ts
var import_kit = require("@solana/kit");

// src/solana/env.ts
var GOLDC_TOKEN_MINT = "9xJjgUFq86fNtZLXGEFW4u18PVGEvy8RH4YwS52MwXWU";
var VNX_TOKEN_MINT = "28LpdHkgn3Smzhum4W4SWSYqbw8XUNbkVdztXhewbZBv";
var ORCA_WHIRLPOOL_PROGRAM_ID = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";
var TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
var TREASURY_ADDRESS = "76U9hvHNUNn7YV5FekSzDHzqnHETsUpDKq4cMj2dMxNi";
var WHIRLPOOLS_CONFIG_PUBKEY = "FcrweFY1G9HJAHG5inkGB6pKg1HZ6x9UC2WioAfWrGkR";
var METADATA_UPDATE_AUTH = "3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr";
var MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
var ASSOCIATED_TOKEN_PROGRAM_ID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

// src/solana/constants.ts
var METADATA_UPDATE_AUTH_ADDRESS = (0, import_kit.address)(METADATA_UPDATE_AUTH);
var MAX_FILE_SIZE = 5 * 1024 * 1024;
var TOKEN_X_MINT = new import_web32.PublicKey(VNX_TOKEN_MINT);
var TOKEN_Y_MINT = new import_web32.PublicKey(GOLDC_TOKEN_MINT);
var IDL = deaura_default;
var admin = anchor.web3.Keypair.generate();
var treasuery = anchor.web3.Keypair.generate();
var VAULT_AUTHORITY = Buffer.from("vault_authority");
var GOLDC_MINT = Buffer.from("goldc_mint");
var VNX_VAULT_PREFIX = Buffer.from("vnx_vault");
var GLOBAL_STATE = Buffer.from("global_state");
var USER_STATE_PREFIX = Buffer.from("user_state");
var ASSOCIATED_TOKEN_PROGRAM_ID2 = new import_web32.PublicKey(
  ASSOCIATED_TOKEN_PROGRAM_ID
);
var ORCA_WHIRLPOOL_PROGRAM_ID2 = new import_web32.PublicKey(
  ORCA_WHIRLPOOL_PROGRAM_ID
);
var TOKEN_METADATA_PROGRAM_ID2 = new import_web32.PublicKey(
  TOKEN_METADATA_PROGRAM_ID
);
var TREASURY_ADDRESS2 = new import_web32.PublicKey(TREASURY_ADDRESS);
var MEMO_PROGRAM2 = new import_web32.PublicKey(MEMO_PROGRAM);
var METADATA_UPDATE_AUTH2 = new import_web32.PublicKey(METADATA_UPDATE_AUTH);
var WHIRLPOOLS_CONFIG_PUBKEY2 = new import_web32.PublicKey(
  WHIRLPOOLS_CONFIG_PUBKEY
);

// src/solana/contract/helpers.ts
var import_web33 = require("@solana/web3.js");
var anchor2 = __toESM(require("@coral-xyz/anchor"));
var import_bn = require("bn.js");
var import_web34 = require("@solana/web3.js");

// node_modules/decimal.js/decimal.mjs
var EXP_LIMIT = 9e15;
var MAX_DIGITS = 1e9;
var NUMERALS = "0123456789abcdef";
var LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
var PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
var DEFAULTS = {
  // These values must be integers within the stated ranges (inclusive).
  // Most of these values can be changed at run-time using the `Decimal.config` method.
  // The maximum number of significant digits of the result of a calculation or base conversion.
  // E.g. `Decimal.config({ precision: 20 });`
  precision: 20,
  // 1 to MAX_DIGITS
  // The rounding mode used when rounding to `precision`.
  //
  // ROUND_UP         0 Away from zero.
  // ROUND_DOWN       1 Towards zero.
  // ROUND_CEIL       2 Towards +Infinity.
  // ROUND_FLOOR      3 Towards -Infinity.
  // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
  // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
  // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
  // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
  // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
  //
  // E.g.
  // `Decimal.rounding = 4;`
  // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
  rounding: 4,
  // 0 to 8
  // The modulo mode used when calculating the modulus: a mod n.
  // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
  // The remainder (r) is calculated as: r = a - n * q.
  //
  // UP         0 The remainder is positive if the dividend is negative, else is negative.
  // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
  // FLOOR      3 The remainder has the same sign as the divisor (Python %).
  // HALF_EVEN  6 The IEEE 754 remainder function.
  // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
  //
  // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
  // division (9) are commonly used for the modulus operation. The other rounding modes can also
  // be used, but they may not give useful results.
  modulo: 1,
  // 0 to 9
  // The exponent value at and beneath which `toString` returns exponential notation.
  // JavaScript numbers: -7
  toExpNeg: -7,
  // 0 to -EXP_LIMIT
  // The exponent value at and above which `toString` returns exponential notation.
  // JavaScript numbers: 21
  toExpPos: 21,
  // 0 to EXP_LIMIT
  // The minimum exponent value, beneath which underflow to zero occurs.
  // JavaScript numbers: -324  (5e-324)
  minE: -EXP_LIMIT,
  // -1 to -EXP_LIMIT
  // The maximum exponent value, above which overflow to Infinity occurs.
  // JavaScript numbers: 308  (1.7976931348623157e+308)
  maxE: EXP_LIMIT,
  // 1 to EXP_LIMIT
  // Whether to use cryptographically-secure random number generation, if available.
  crypto: false
  // true/false
};
var inexact;
var quadrant;
var external = true;
var decimalError = "[DecimalError] ";
var invalidArgument = decimalError + "Invalid argument: ";
var precisionLimitExceeded = decimalError + "Precision limit exceeded";
var cryptoUnavailable = decimalError + "crypto unavailable";
var tag = "[object Decimal]";
var mathfloor = Math.floor;
var mathpow = Math.pow;
var isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
var isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
var isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
var isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
var BASE = 1e7;
var LOG_BASE = 7;
var MAX_SAFE_INTEGER = 9007199254740991;
var LN10_PRECISION = LN10.length - 1;
var PI_PRECISION = PI.length - 1;
var P = { toStringTag: tag };
P.absoluteValue = P.abs = function() {
  var x = new this.constructor(this);
  if (x.s < 0) x.s = 1;
  return finalise(x);
};
P.ceil = function() {
  return finalise(new this.constructor(this), this.e + 1, 2);
};
P.clampedTo = P.clamp = function(min2, max2) {
  var k, x = this, Ctor = x.constructor;
  min2 = new Ctor(min2);
  max2 = new Ctor(max2);
  if (!min2.s || !max2.s) return new Ctor(NaN);
  if (min2.gt(max2)) throw Error(invalidArgument + max2);
  k = x.cmp(min2);
  return k < 0 ? min2 : x.cmp(max2) > 0 ? max2 : new Ctor(x);
};
P.comparedTo = P.cmp = function(y) {
  var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
  if (!xd || !yd) {
    return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
  }
  if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;
  if (xs !== ys) return xs;
  if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;
  xdL = xd.length;
  ydL = yd.length;
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
};
P.cosine = P.cos = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.d) return new Ctor(NaN);
  if (!x.d[0]) return new Ctor(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
};
P.cubeRoot = P.cbrt = function() {
  var e, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero()) return new Ctor(x);
  external = false;
  s = x.s * mathpow(x.s * x, 1 / 3);
  if (!s || Math.abs(s) == 1 / 0) {
    n = digitsToString(x.d);
    e = x.e;
    if (s = (e - n.length + 1) % 3) n += s == 1 || s == -2 ? "0" : "00";
    s = mathpow(n, 1 / 3);
    e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
    r.s = x.s;
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    t3 = t.times(t).times(t);
    t3plusx = t3.plus(x);
    r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e + 1, 0);
          if (t.times(t).times(t).eq(x)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e + 1, 1);
          m = !r.times(r).times(r).eq(x);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e, Ctor.rounding, m);
};
P.decimalPlaces = P.dp = function() {
  var w, d = this.d, n = NaN;
  if (d) {
    w = d.length - 1;
    n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
    w = d[w];
    if (w) for (; w % 10 == 0; w /= 10) n--;
    if (n < 0) n = 0;
  }
  return n;
};
P.dividedBy = P.div = function(y) {
  return divide(this, new this.constructor(y));
};
P.dividedToIntegerBy = P.divToInt = function(y) {
  var x = this, Ctor = x.constructor;
  return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
};
P.equals = P.eq = function(y) {
  return this.cmp(y) === 0;
};
P.floor = function() {
  return finalise(new this.constructor(this), this.e + 1, 3);
};
P.greaterThan = P.gt = function(y) {
  return this.cmp(y) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y) {
  var k = this.cmp(y);
  return k == 1 || k === 0;
};
P.hyperbolicCosine = P.cosh = function() {
  var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
  if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
  if (x.isZero()) return one;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
  Ctor.rounding = 1;
  len = x.d.length;
  if (len < 32) {
    k = Math.ceil(len / 3);
    n = (1 / tinyPow(4, k)).toString();
  } else {
    k = 16;
    n = "2.3283064365386962890625e-10";
  }
  x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
  var cosh2_x, i = k, d8 = new Ctor(8);
  for (; i--; ) {
    cosh2_x = x.times(x);
    x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
  }
  return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.hyperbolicSine = P.sinh = function() {
  var k, pr, rm, len, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero()) return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
  Ctor.rounding = 1;
  len = x.d.length;
  if (len < 3) {
    x = taylorSeries(Ctor, 2, x, x, true);
  } else {
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;
    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x, true);
    var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
    for (; k--; ) {
      sinh2_x = x.times(x);
      x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
    }
  }
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(x, pr, rm, true);
};
P.hyperbolicTangent = P.tanh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite()) return new Ctor(x.s);
  if (x.isZero()) return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 7;
  Ctor.rounding = 1;
  return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
};
P.inverseCosine = P.acos = function() {
  var x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
  if (k !== -1) {
    return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
  }
  if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x = new Ctor(1).minus(x).div(x.plus(1)).sqrt().atan();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(2);
};
P.inverseHyperbolicCosine = P.acosh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
  if (!x.isFinite()) return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
  Ctor.rounding = 1;
  external = false;
  x = x.times(x).minus(1).sqrt().plus(x);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.ln();
};
P.inverseHyperbolicSine = P.asinh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero()) return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
  Ctor.rounding = 1;
  external = false;
  x = x.times(x).plus(1).sqrt().plus(x);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.ln();
};
P.inverseHyperbolicTangent = P.atanh = function() {
  var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
  if (!x.isFinite()) return new Ctor(NaN);
  if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  xsd = x.sd();
  if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);
  Ctor.precision = wpr = xsd - x.e;
  x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
  Ctor.precision = pr + 4;
  Ctor.rounding = 1;
  x = x.ln();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(0.5);
};
P.inverseSine = P.asin = function() {
  var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
  if (x.isZero()) return new Ctor(x);
  k = x.abs().cmp(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (k !== -1) {
    if (k === 0) {
      halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
      halfPi.s = x.s;
      return halfPi;
    }
    return new Ctor(NaN);
  }
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(2);
};
P.inverseTangent = P.atan = function() {
  var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
  if (!x.isFinite()) {
    if (!x.s) return new Ctor(NaN);
    if (pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.5);
      r.s = x.s;
      return r;
    }
  } else if (x.isZero()) {
    return new Ctor(x);
  } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
    r = getPi(Ctor, pr + 4, rm).times(0.25);
    r.s = x.s;
    return r;
  }
  Ctor.precision = wpr = pr + 10;
  Ctor.rounding = 1;
  k = Math.min(28, wpr / LOG_BASE + 2 | 0);
  for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));
  external = false;
  j = Math.ceil(wpr / LOG_BASE);
  n = 1;
  x2 = x.times(x);
  r = new Ctor(x);
  px = x;
  for (; i !== -1; ) {
    px = px.times(x2);
    t = r.minus(px.div(n += 2));
    px = px.times(x2);
    r = t.plus(px.div(n += 2));
    if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--; ) ;
  }
  if (k) r = r.times(2 << k - 1);
  external = true;
  return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.isFinite = function() {
  return !!this.d;
};
P.isInteger = P.isInt = function() {
  return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
};
P.isNaN = function() {
  return !this.s;
};
P.isNegative = P.isNeg = function() {
  return this.s < 0;
};
P.isPositive = P.isPos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return !!this.d && this.d[0] === 0;
};
P.lessThan = P.lt = function(y) {
  return this.cmp(y) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y) {
  return this.cmp(y) < 1;
};
P.logarithm = P.log = function(base) {
  var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
  if (base == null) {
    base = new Ctor(10);
    isBase10 = true;
  } else {
    base = new Ctor(base);
    d = base.d;
    if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);
    isBase10 = base.eq(10);
  }
  d = arg.d;
  if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
    return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
  }
  if (isBase10) {
    if (d.length > 1) {
      inf = true;
    } else {
      for (k = d[0]; k % 10 === 0; ) k /= 10;
      inf = k !== 1;
    }
  }
  external = false;
  sd = pr + guard;
  num = naturalLogarithm(arg, sd);
  denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
  r = divide(num, denominator, sd, 1);
  if (checkRoundingDigits(r.d, k = pr, rm)) {
    do {
      sd += 10;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
      r = divide(num, denominator, sd, 1);
      if (!inf) {
        if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
        break;
      }
    } while (checkRoundingDigits(r.d, k += 10, rm));
  }
  external = true;
  return finalise(r, pr, rm);
};
P.minus = P.sub = function(y) {
  var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.d) {
    if (!x.s || !y.s) y = new Ctor(NaN);
    else if (x.d) y.s = -y.s;
    else y = new Ctor(y.d || x.s !== y.s ? x : NaN);
    return y;
  }
  if (x.s != y.s) {
    y.s = -y.s;
    return x.plus(y);
  }
  xd = x.d;
  yd = y.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (yd[0]) y.s = -y.s;
    else if (xd[0]) y = new Ctor(x);
    else return new Ctor(rm === 3 ? -0 : 0);
    return external ? finalise(y, pr, rm) : y;
  }
  e = mathfloor(y.e / LOG_BASE);
  xe = mathfloor(x.e / LOG_BASE);
  xd = xd.slice();
  k = xe - e;
  if (k) {
    xLTy = k < 0;
    if (xLTy) {
      d = xd;
      k = -k;
      len = yd.length;
    } else {
      d = yd;
      e = xe;
      len = xd.length;
    }
    i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
    if (k > i) {
      k = i;
      d.length = 1;
    }
    d.reverse();
    for (i = k; i--; ) d.push(0);
    d.reverse();
  } else {
    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy) len = i;
    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }
    k = 0;
  }
  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y.s = -y.s;
  }
  len = xd.length;
  for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
  for (i = yd.length; i > k; ) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }
    xd[i] -= yd[i];
  }
  for (; xd[--len] === 0; ) xd.pop();
  for (; xd[0] === 0; xd.shift()) --e;
  if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);
  y.d = xd;
  y.e = getBase10Exponent(xd, e);
  return external ? finalise(y, pr, rm) : y;
};
P.modulo = P.mod = function(y) {
  var q, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);
  if (!y.d || x.d && !x.d[0]) {
    return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
  }
  external = false;
  if (Ctor.modulo == 9) {
    q = divide(x, y.abs(), 0, 3, 1);
    q.s *= y.s;
  } else {
    q = divide(x, y, 0, Ctor.modulo, 1);
  }
  q = q.times(y);
  external = true;
  return x.minus(q);
};
P.naturalExponential = P.exp = function() {
  return naturalExponential(this);
};
P.naturalLogarithm = P.ln = function() {
  return naturalLogarithm(this);
};
P.negated = P.neg = function() {
  var x = new this.constructor(this);
  x.s = -x.s;
  return finalise(x);
};
P.plus = P.add = function(y) {
  var carry, d, e, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.d) {
    if (!x.s || !y.s) y = new Ctor(NaN);
    else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);
    return y;
  }
  if (x.s != y.s) {
    y.s = -y.s;
    return x.minus(y);
  }
  xd = x.d;
  yd = y.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (!yd[0]) y = new Ctor(x);
    return external ? finalise(y, pr, rm) : y;
  }
  k = mathfloor(x.e / LOG_BASE);
  e = mathfloor(y.e / LOG_BASE);
  xd = xd.slice();
  i = k - e;
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e = k;
      len = xd.length;
    }
    k = Math.ceil(pr / LOG_BASE);
    len = k > len ? k + 1 : len + 1;
    if (i > len) {
      i = len;
      d.length = 1;
    }
    d.reverse();
    for (; i--; ) d.push(0);
    d.reverse();
  }
  len = xd.length;
  i = yd.length;
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }
  for (carry = 0; i; ) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e;
  }
  for (len = xd.length; xd[--len] == 0; ) xd.pop();
  y.d = xd;
  y.e = getBase10Exponent(xd, e);
  return external ? finalise(y, pr, rm) : y;
};
P.precision = P.sd = function(z) {
  var k, x = this;
  if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
  if (x.d) {
    k = getPrecision(x.d);
    if (z && x.e + 1 > k) k = x.e + 1;
  } else {
    k = NaN;
  }
  return k;
};
P.round = function() {
  var x = this, Ctor = x.constructor;
  return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
};
P.sine = P.sin = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite()) return new Ctor(NaN);
  if (x.isZero()) return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x = sine(Ctor, toLessThanHalfPi(Ctor, x));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
};
P.squareRoot = P.sqrt = function() {
  var m, n, sd, r, rep, t, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
  if (s !== 1 || !d || !d[0]) {
    return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
  }
  external = false;
  s = Math.sqrt(+x);
  if (s == 0 || s == 1 / 0) {
    n = digitsToString(d);
    if ((n.length + e) % 2 == 0) n += "0";
    s = Math.sqrt(n);
    e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e + 1, 0);
          if (t.times(t).eq(x)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e + 1, 1);
          m = !r.times(r).eq(x);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e, Ctor.rounding, m);
};
P.tangent = P.tan = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite()) return new Ctor(NaN);
  if (x.isZero()) return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 10;
  Ctor.rounding = 1;
  x = x.sin();
  x.s = 1;
  x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
};
P.times = P.mul = function(y) {
  var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
  y.s *= x.s;
  if (!xd || !xd[0] || !yd || !yd[0]) {
    return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
  }
  e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r = xd;
    xd = yd;
    yd = r;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r = [];
  rL = xdL + ydL;
  for (i = rL; i--; ) r.push(0);
  for (i = ydL; --i >= 0; ) {
    carry = 0;
    for (k = xdL + i; k > i; ) {
      t = r[k] + yd[i] * xd[k - i - 1] + carry;
      r[k--] = t % BASE | 0;
      carry = t / BASE | 0;
    }
    r[k] = (r[k] + carry) % BASE | 0;
  }
  for (; !r[--rL]; ) r.pop();
  if (carry) ++e;
  else r.shift();
  y.d = r;
  y.e = getBase10Exponent(r, e);
  return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
};
P.toBinary = function(sd, rm) {
  return toStringBinary(this, 2, sd, rm);
};
P.toDecimalPlaces = P.toDP = function(dp, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (dp === void 0) return x;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);
  return finalise(x, dp + x.e + 1, rm);
};
P.toExponential = function(dp, rm) {
  var str, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = finiteToString(x, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x = finalise(new Ctor(x), dp + 1, rm);
    str = finiteToString(x, true, dp + 1);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toFixed = function(dp, rm) {
  var str, y, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = finiteToString(x);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    y = finalise(new Ctor(x), dp + x.e + 1, rm);
    str = finiteToString(y, false, dp + y.e + 1);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toFraction = function(maxD) {
  var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
  if (!xd) return new Ctor(x);
  n1 = d0 = new Ctor(1);
  d1 = n0 = new Ctor(0);
  d = new Ctor(d1);
  e = d.e = getPrecision(xd) - x.e - 1;
  k = e % LOG_BASE;
  d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
  if (maxD == null) {
    maxD = e > 0 ? d : n1;
  } else {
    n = new Ctor(maxD);
    if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
    maxD = n.gt(d) ? e > 0 ? d : n1 : n;
  }
  external = false;
  n = new Ctor(digitsToString(xd));
  pr = Ctor.precision;
  Ctor.precision = e = xd.length * LOG_BASE * 2;
  for (; ; ) {
    q = divide(n, d, 0, 1, 1);
    d2 = d0.plus(q.times(d1));
    if (d2.cmp(maxD) == 1) break;
    d0 = d1;
    d1 = d2;
    d2 = n1;
    n1 = n0.plus(q.times(d2));
    n0 = d2;
    d2 = d;
    d = n.minus(q.times(d2));
    n = d2;
  }
  d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
  n0 = n0.plus(d2.times(n1));
  d0 = d0.plus(d2.times(d1));
  n0.s = n1.s = x.s;
  r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];
  Ctor.precision = pr;
  external = true;
  return r;
};
P.toHexadecimal = P.toHex = function(sd, rm) {
  return toStringBinary(this, 16, sd, rm);
};
P.toNearest = function(y, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (y == null) {
    if (!x.d) return x;
    y = new Ctor(1);
    rm = Ctor.rounding;
  } else {
    y = new Ctor(y);
    if (rm === void 0) {
      rm = Ctor.rounding;
    } else {
      checkInt32(rm, 0, 8);
    }
    if (!x.d) return y.s ? x : y;
    if (!y.d) {
      if (y.s) y.s = x.s;
      return y;
    }
  }
  if (y.d[0]) {
    external = false;
    x = divide(x, y, 0, rm, 1).times(y);
    external = true;
    finalise(x);
  } else {
    y.s = x.s;
    x = y;
  }
  return x;
};
P.toNumber = function() {
  return +this;
};
P.toOctal = function(sd, rm) {
  return toStringBinary(this, 8, sd, rm);
};
P.toPower = P.pow = function(y) {
  var e, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
  if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));
  x = new Ctor(x);
  if (x.eq(1)) return x;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (y.eq(1)) return finalise(x, pr, rm);
  e = mathfloor(y.e / LOG_BASE);
  if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r = intPow(Ctor, x, k, pr);
    return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
  }
  s = x.s;
  if (s < 0) {
    if (e < y.d.length - 1) return new Ctor(NaN);
    if ((y.d[e] & 1) == 0) s = 1;
    if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
      x.s = s;
      return x;
    }
  }
  k = mathpow(+x, yn);
  e = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log("0." + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + "").e;
  if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);
  external = false;
  Ctor.rounding = x.s = 1;
  k = Math.min(12, (e + "").length);
  r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
  if (r.d) {
    r = finalise(r, pr + 5, 1);
    if (checkRoundingDigits(r.d, pr, rm)) {
      e = pr + 10;
      r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);
      if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
        r = finalise(r, pr + 1, 0);
      }
    }
  }
  r.s = s;
  external = true;
  Ctor.rounding = rm;
  return finalise(r, pr, rm);
};
P.toPrecision = function(sd, rm) {
  var str, x = this, Ctor = x.constructor;
  if (sd === void 0) {
    str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x = finalise(new Ctor(x), sd, rm);
    str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toSignificantDigits = P.toSD = function(sd, rm) {
  var x = this, Ctor = x.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  }
  return finalise(new Ctor(x), sd, rm);
};
P.toString = function() {
  var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.truncated = P.trunc = function() {
  return finalise(new this.constructor(this), this.e + 1, 1);
};
P.valueOf = P.toJSON = function() {
  var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  return x.isNeg() ? "-" + str : str;
};
function digitsToString(d) {
  var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
  if (indexOfLastWord > 0) {
    str += w;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + "";
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
      str += ws;
    }
    w = d[i];
    ws = w + "";
    k = LOG_BASE - ws.length;
    if (k) str += getZeroString(k);
  } else if (w === 0) {
    return "0";
  }
  for (; w % 10 === 0; ) w /= 10;
  return str + w;
}
function checkInt32(i, min2, max2) {
  if (i !== ~~i || i < min2 || i > max2) {
    throw Error(invalidArgument + i);
  }
}
function checkRoundingDigits(d, i, rm, repeating) {
  var di, k, r, rd;
  for (k = d[0]; k >= 10; k /= 10) --i;
  if (--i < 0) {
    i += LOG_BASE;
    di = 0;
  } else {
    di = Math.ceil((i + 1) / LOG_BASE);
    i %= LOG_BASE;
  }
  k = mathpow(10, LOG_BASE - i);
  rd = d[di] % k | 0;
  if (repeating == null) {
    if (i < 3) {
      if (i == 0) rd = rd / 100 | 0;
      else if (i == 1) rd = rd / 10 | 0;
      r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
    } else {
      r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
    }
  } else {
    if (i < 4) {
      if (i == 0) rd = rd / 1e3 | 0;
      else if (i == 1) rd = rd / 100 | 0;
      else if (i == 2) rd = rd / 10 | 0;
      r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
    } else {
      r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1e3 | 0) == mathpow(10, i - 3) - 1;
    }
  }
  return r;
}
function convertBase(str, baseIn, baseOut) {
  var j, arr = [0], arrL, i = 0, strL = str.length;
  for (; i < strL; ) {
    for (arrL = arr.length; arrL--; ) arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str.charAt(i++));
    for (j = 0; j < arr.length; j++) {
      if (arr[j] > baseOut - 1) {
        if (arr[j + 1] === void 0) arr[j + 1] = 0;
        arr[j + 1] += arr[j] / baseOut | 0;
        arr[j] %= baseOut;
      }
    }
  }
  return arr.reverse();
}
function cosine(Ctor, x) {
  var k, len, y;
  if (x.isZero()) return x;
  len = x.d.length;
  if (len < 32) {
    k = Math.ceil(len / 3);
    y = (1 / tinyPow(4, k)).toString();
  } else {
    k = 16;
    y = "2.3283064365386962890625e-10";
  }
  Ctor.precision += k;
  x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
  for (var i = k; i--; ) {
    var cos2x = x.times(x);
    x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
  }
  Ctor.precision -= k;
  return x;
}
var divide = /* @__PURE__ */ function() {
  function multiplyInteger(x, k, base) {
    var temp, carry = 0, i = x.length;
    for (x = x.slice(); i--; ) {
      temp = x[i] * k + carry;
      x[i] = temp % base | 0;
      carry = temp / base | 0;
    }
    if (carry) x.unshift(carry);
    return x;
  }
  function compare(a, b, aL, bL) {
    var i, r;
    if (aL != bL) {
      r = aL > bL ? 1 : -1;
    } else {
      for (i = r = 0; i < aL; i++) {
        if (a[i] != b[i]) {
          r = a[i] > b[i] ? 1 : -1;
          break;
        }
      }
    }
    return r;
  }
  function subtract(a, b, aL, base) {
    var i = 0;
    for (; aL--; ) {
      a[aL] -= i;
      i = a[aL] < b[aL] ? 1 : 0;
      a[aL] = i * base + a[aL] - b[aL];
    }
    for (; !a[0] && a.length > 1; ) a.shift();
  }
  return function(x, y, pr, rm, dp, base) {
    var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign2 = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
    if (!xd || !xd[0] || !yd || !yd[0]) {
      return new Ctor(
        // Return NaN if either NaN, or both Infinity or 0.
        !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : (
          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign2 * 0 : sign2 / 0
        )
      );
    }
    if (base) {
      logBase = 1;
      e = x.e - y.e;
    } else {
      base = BASE;
      logBase = LOG_BASE;
      e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
    }
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign2);
    qd = q.d = [];
    for (i = 0; yd[i] == (xd[i] || 0); i++) ;
    if (yd[i] > (xd[i] || 0)) e--;
    if (pr == null) {
      sd = pr = Ctor.precision;
      rm = Ctor.rounding;
    } else if (dp) {
      sd = pr + (x.e - y.e) + 1;
    } else {
      sd = pr;
    }
    if (sd < 0) {
      qd.push(1);
      more = true;
    } else {
      sd = sd / logBase + 2 | 0;
      i = 0;
      if (yL == 1) {
        k = 0;
        yd = yd[0];
        sd++;
        for (; (i < xL || k) && sd--; i++) {
          t = k * base + (xd[i] || 0);
          qd[i] = t / yd | 0;
          k = t % yd | 0;
        }
        more = k || i < xL;
      } else {
        k = base / (yd[0] + 1) | 0;
        if (k > 1) {
          yd = multiplyInteger(yd, k, base);
          xd = multiplyInteger(xd, k, base);
          yL = yd.length;
          xL = xd.length;
        }
        xi = yL;
        rem = xd.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; ) rem[remL++] = 0;
        yz = yd.slice();
        yz.unshift(0);
        yd0 = yd[0];
        if (yd[1] >= base / 2) ++yd0;
        do {
          k = 0;
          cmp = compare(yd, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
            k = rem0 / yd0 | 0;
            if (k > 1) {
              if (k >= base) k = base - 1;
              prod = multiplyInteger(yd, k, base);
              prodL = prod.length;
              remL = rem.length;
              cmp = compare(prod, rem, prodL, remL);
              if (cmp == 1) {
                k--;
                subtract(prod, yL < prodL ? yz : yd, prodL, base);
              }
            } else {
              if (k == 0) cmp = k = 1;
              prod = yd.slice();
            }
            prodL = prod.length;
            if (prodL < remL) prod.unshift(0);
            subtract(rem, prod, remL, base);
            if (cmp == -1) {
              remL = rem.length;
              cmp = compare(yd, rem, yL, remL);
              if (cmp < 1) {
                k++;
                subtract(rem, yL < remL ? yz : yd, remL, base);
              }
            }
            remL = rem.length;
          } else if (cmp === 0) {
            k++;
            rem = [0];
          }
          qd[i++] = k;
          if (cmp && rem[0]) {
            rem[remL++] = xd[xi] || 0;
          } else {
            rem = [xd[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] !== void 0) && sd--);
        more = rem[0] !== void 0;
      }
      if (!qd[0]) qd.shift();
    }
    if (logBase == 1) {
      q.e = e;
      inexact = more;
    } else {
      for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
      q.e = i + e * logBase - 1;
      finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
    }
    return q;
  };
}();
function finalise(x, sd, rm, isTruncated) {
  var digits, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
  out: if (sd != null) {
    xd = x.d;
    if (!xd) return x;
    for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
    i = sd - digits;
    if (i < 0) {
      i += LOG_BASE;
      j = sd;
      w = xd[xdi = 0];
      rd = w / mathpow(10, digits - j - 1) % 10 | 0;
    } else {
      xdi = Math.ceil((i + 1) / LOG_BASE);
      k = xd.length;
      if (xdi >= k) {
        if (isTruncated) {
          for (; k++ <= xdi; ) xd.push(0);
          w = rd = 0;
          digits = 1;
          i %= LOG_BASE;
          j = i - LOG_BASE + 1;
        } else {
          break out;
        }
      } else {
        w = k = xd[xdi];
        for (digits = 1; k >= 10; k /= 10) digits++;
        i %= LOG_BASE;
        j = i - LOG_BASE + digits;
        rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
      }
    }
    isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));
    roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
    (i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
    if (sd < 1 || !xd[0]) {
      xd.length = 0;
      if (roundUp) {
        sd -= x.e + 1;
        xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
        x.e = -sd || 0;
      } else {
        xd[0] = x.e = 0;
      }
      return x;
    }
    if (i == 0) {
      xd.length = xdi;
      k = 1;
      xdi--;
    } else {
      xd.length = xdi + 1;
      k = mathpow(10, LOG_BASE - i);
      xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
    }
    if (roundUp) {
      for (; ; ) {
        if (xdi == 0) {
          for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
          j = xd[0] += k;
          for (k = 1; j >= 10; j /= 10) k++;
          if (i != k) {
            x.e++;
            if (xd[0] == BASE) xd[0] = 1;
          }
          break;
        } else {
          xd[xdi] += k;
          if (xd[xdi] != BASE) break;
          xd[xdi--] = 0;
          k = 1;
        }
      }
    }
    for (i = xd.length; xd[--i] === 0; ) xd.pop();
  }
  if (external) {
    if (x.e > Ctor.maxE) {
      x.d = null;
      x.e = NaN;
    } else if (x.e < Ctor.minE) {
      x.e = 0;
      x.d = [0];
    }
  }
  return x;
}
function finiteToString(x, isExp, sd) {
  if (!x.isFinite()) return nonFiniteToString(x);
  var k, e = x.e, str = digitsToString(x.d), len = str.length;
  if (isExp) {
    if (sd && (k = sd - len) > 0) {
      str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
    } else if (len > 1) {
      str = str.charAt(0) + "." + str.slice(1);
    }
    str = str + (x.e < 0 ? "e" : "e+") + x.e;
  } else if (e < 0) {
    str = "0." + getZeroString(-e - 1) + str;
    if (sd && (k = sd - len) > 0) str += getZeroString(k);
  } else if (e >= len) {
    str += getZeroString(e + 1 - len);
    if (sd && (k = sd - e - 1) > 0) str = str + "." + getZeroString(k);
  } else {
    if ((k = e + 1) < len) str = str.slice(0, k) + "." + str.slice(k);
    if (sd && (k = sd - len) > 0) {
      if (e + 1 === len) str += ".";
      str += getZeroString(k);
    }
  }
  return str;
}
function getBase10Exponent(digits, e) {
  var w = digits[0];
  for (e *= LOG_BASE; w >= 10; w /= 10) e++;
  return e;
}
function getLn10(Ctor, sd, pr) {
  if (sd > LN10_PRECISION) {
    external = true;
    if (pr) Ctor.precision = pr;
    throw Error(precisionLimitExceeded);
  }
  return finalise(new Ctor(LN10), sd, 1, true);
}
function getPi(Ctor, sd, rm) {
  if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
  return finalise(new Ctor(PI), sd, rm, true);
}
function getPrecision(digits) {
  var w = digits.length - 1, len = w * LOG_BASE + 1;
  w = digits[w];
  if (w) {
    for (; w % 10 == 0; w /= 10) len--;
    for (w = digits[0]; w >= 10; w /= 10) len++;
  }
  return len;
}
function getZeroString(k) {
  var zs = "";
  for (; k--; ) zs += "0";
  return zs;
}
function intPow(Ctor, x, n, pr) {
  var isTruncated, r = new Ctor(1), k = Math.ceil(pr / LOG_BASE + 4);
  external = false;
  for (; ; ) {
    if (n % 2) {
      r = r.times(x);
      if (truncate(r.d, k)) isTruncated = true;
    }
    n = mathfloor(n / 2);
    if (n === 0) {
      n = r.d.length - 1;
      if (isTruncated && r.d[n] === 0) ++r.d[n];
      break;
    }
    x = x.times(x);
    truncate(x.d, k);
  }
  external = true;
  return r;
}
function isOdd(n) {
  return n.d[n.d.length - 1] & 1;
}
function maxOrMin(Ctor, args, n) {
  var k, y, x = new Ctor(args[0]), i = 0;
  for (; ++i < args.length; ) {
    y = new Ctor(args[i]);
    if (!y.s) {
      x = y;
      break;
    }
    k = x.cmp(y);
    if (k === n || k === 0 && x.s === n) {
      x = y;
    }
  }
  return x;
}
function naturalExponential(x, sd) {
  var denominator, guard, j, pow2, sum2, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (!x.d || !x.d[0] || x.e > 17) {
    return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  t = new Ctor(0.03125);
  while (x.e > -2) {
    x = x.times(t);
    k += 5;
  }
  guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow2 = sum2 = new Ctor(1);
  Ctor.precision = wpr;
  for (; ; ) {
    pow2 = finalise(pow2.times(x), wpr, 1);
    denominator = denominator.times(++i);
    t = sum2.plus(divide(pow2, denominator, wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
      j = k;
      while (j--) sum2 = finalise(sum2.times(sum2), wpr, 1);
      if (sd == null) {
        if (rep < 3 && checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += 10;
          denominator = pow2 = t = new Ctor(1);
          i = 0;
          rep++;
        } else {
          return finalise(sum2, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum2;
      }
    }
    sum2 = t;
  }
}
function naturalLogarithm(y, sd) {
  var c, c0, denominator, e, numerator, rep, sum2, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
    return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  Ctor.precision = wpr += guard;
  c = digitsToString(xd);
  c0 = c.charAt(0);
  if (Math.abs(e = x.e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
      x = x.times(y);
      c = digitsToString(x.d);
      c0 = c.charAt(0);
      n++;
    }
    e = x.e;
    if (c0 > 1) {
      x = new Ctor("0." + c);
      e++;
    } else {
      x = new Ctor(c0 + "." + c.slice(1));
    }
  } else {
    t = getLn10(Ctor, wpr + 2, pr).times(e + "");
    x = naturalLogarithm(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
    Ctor.precision = pr;
    return sd == null ? finalise(x, pr, rm, external = true) : x;
  }
  x1 = x;
  sum2 = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
  x2 = finalise(x.times(x), wpr, 1);
  denominator = 3;
  for (; ; ) {
    numerator = finalise(numerator.times(x2), wpr, 1);
    t = sum2.plus(divide(numerator, new Ctor(denominator), wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
      sum2 = sum2.times(2);
      if (e !== 0) sum2 = sum2.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
      sum2 = divide(sum2, new Ctor(n), wpr, 1);
      if (sd == null) {
        if (checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += guard;
          t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
          x2 = finalise(x.times(x), wpr, 1);
          denominator = rep = 1;
        } else {
          return finalise(sum2, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum2;
      }
    }
    sum2 = t;
    denominator += 2;
  }
}
function nonFiniteToString(x) {
  return String(x.s * x.s / 0);
}
function parseDecimal(x, str) {
  var e, i, len;
  if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
  if ((i = str.search(/e/i)) > 0) {
    if (e < 0) e = i;
    e += +str.slice(i + 1);
    str = str.substring(0, i);
  } else if (e < 0) {
    e = str.length;
  }
  for (i = 0; str.charCodeAt(i) === 48; i++) ;
  for (len = str.length; str.charCodeAt(len - 1) === 48; --len) ;
  str = str.slice(i, len);
  if (str) {
    len -= i;
    x.e = e = e - i - 1;
    x.d = [];
    i = (e + 1) % LOG_BASE;
    if (e < 0) i += LOG_BASE;
    if (i < len) {
      if (i) x.d.push(+str.slice(0, i));
      for (len -= LOG_BASE; i < len; ) x.d.push(+str.slice(i, i += LOG_BASE));
      str = str.slice(i);
      i = LOG_BASE - str.length;
    } else {
      i -= len;
    }
    for (; i--; ) str += "0";
    x.d.push(+str);
    if (external) {
      if (x.e > x.constructor.maxE) {
        x.d = null;
        x.e = NaN;
      } else if (x.e < x.constructor.minE) {
        x.e = 0;
        x.d = [0];
      }
    }
  } else {
    x.e = 0;
    x.d = [0];
  }
  return x;
}
function parseOther(x, str) {
  var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
  if (str.indexOf("_") > -1) {
    str = str.replace(/(\d)_(?=\d)/g, "$1");
    if (isDecimal.test(str)) return parseDecimal(x, str);
  } else if (str === "Infinity" || str === "NaN") {
    if (!+str) x.s = NaN;
    x.e = NaN;
    x.d = null;
    return x;
  }
  if (isHex.test(str)) {
    base = 16;
    str = str.toLowerCase();
  } else if (isBinary.test(str)) {
    base = 2;
  } else if (isOctal.test(str)) {
    base = 8;
  } else {
    throw Error(invalidArgument + str);
  }
  i = str.search(/p/i);
  if (i > 0) {
    p = +str.slice(i + 1);
    str = str.substring(2, i);
  } else {
    str = str.slice(2);
  }
  i = str.indexOf(".");
  isFloat = i >= 0;
  Ctor = x.constructor;
  if (isFloat) {
    str = str.replace(".", "");
    len = str.length;
    i = len - i;
    divisor = intPow(Ctor, new Ctor(base), i, i * 2);
  }
  xd = convertBase(str, base, BASE);
  xe = xd.length - 1;
  for (i = xe; xd[i] === 0; --i) xd.pop();
  if (i < 0) return new Ctor(x.s * 0);
  x.e = getBase10Exponent(xd, xe);
  x.d = xd;
  external = false;
  if (isFloat) x = divide(x, divisor, len * 4);
  if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
  external = true;
  return x;
}
function sine(Ctor, x) {
  var k, len = x.d.length;
  if (len < 3) {
    return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
  }
  k = 1.4 * Math.sqrt(len);
  k = k > 16 ? 16 : k | 0;
  x = x.times(1 / tinyPow(5, k));
  x = taylorSeries(Ctor, 2, x, x);
  var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
  for (; k--; ) {
    sin2_x = x.times(x);
    x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
  }
  return x;
}
function taylorSeries(Ctor, n, x, y, isHyperbolic) {
  var j, t, u, x2, i = 1, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
  external = false;
  x2 = x.times(x);
  u = new Ctor(y);
  for (; ; ) {
    t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
    u = isHyperbolic ? y.plus(t) : y.minus(t);
    y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
    t = u.plus(y);
    if (t.d[k] !== void 0) {
      for (j = k; t.d[j] === u.d[j] && j--; ) ;
      if (j == -1) break;
    }
    j = u;
    u = y;
    y = t;
    t = j;
    i++;
  }
  external = true;
  t.d.length = k + 1;
  return t;
}
function tinyPow(b, e) {
  var n = b;
  while (--e) n *= b;
  return n;
}
function toLessThanHalfPi(Ctor, x) {
  var t, isNeg = x.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
  x = x.abs();
  if (x.lte(halfPi)) {
    quadrant = isNeg ? 4 : 1;
    return x;
  }
  t = x.divToInt(pi);
  if (t.isZero()) {
    quadrant = isNeg ? 3 : 2;
  } else {
    x = x.minus(t.times(pi));
    if (x.lte(halfPi)) {
      quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
      return x;
    }
    quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
  }
  return x.minus(pi).abs();
}
function toStringBinary(x, baseOut, sd, rm) {
  var base, e, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
  if (isExp) {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  } else {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  }
  if (!x.isFinite()) {
    str = nonFiniteToString(x);
  } else {
    str = finiteToString(x);
    i = str.indexOf(".");
    if (isExp) {
      base = 2;
      if (baseOut == 16) {
        sd = sd * 4 - 3;
      } else if (baseOut == 8) {
        sd = sd * 3 - 2;
      }
    } else {
      base = baseOut;
    }
    if (i >= 0) {
      str = str.replace(".", "");
      y = new Ctor(1);
      y.e = str.length - i;
      y.d = convertBase(finiteToString(y), 10, base);
      y.e = y.d.length;
    }
    xd = convertBase(str, 10, base);
    e = len = xd.length;
    for (; xd[--len] == 0; ) xd.pop();
    if (!xd[0]) {
      str = isExp ? "0p+0" : "0";
    } else {
      if (i < 0) {
        e--;
      } else {
        x = new Ctor(x);
        x.d = xd;
        x.e = e;
        x = divide(x, y, sd, rm, 0, base);
        xd = x.d;
        e = x.e;
        roundUp = inexact;
      }
      i = xd[sd];
      k = base / 2;
      roundUp = roundUp || xd[sd + 1] !== void 0;
      roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
      xd.length = sd;
      if (roundUp) {
        for (; ++xd[--sd] > base - 1; ) {
          xd[sd] = 0;
          if (!sd) {
            ++e;
            xd.unshift(1);
          }
        }
      }
      for (len = xd.length; !xd[len - 1]; --len) ;
      for (i = 0, str = ""; i < len; i++) str += NUMERALS.charAt(xd[i]);
      if (isExp) {
        if (len > 1) {
          if (baseOut == 16 || baseOut == 8) {
            i = baseOut == 16 ? 4 : 3;
            for (--len; len % i; len++) str += "0";
            xd = convertBase(str, base, baseOut);
            for (len = xd.length; !xd[len - 1]; --len) ;
            for (i = 1, str = "1."; i < len; i++) str += NUMERALS.charAt(xd[i]);
          } else {
            str = str.charAt(0) + "." + str.slice(1);
          }
        }
        str = str + (e < 0 ? "p" : "p+") + e;
      } else if (e < 0) {
        for (; ++e; ) str = "0" + str;
        str = "0." + str;
      } else {
        if (++e > len) for (e -= len; e--; ) str += "0";
        else if (e < len) str = str.slice(0, e) + "." + str.slice(e);
      }
    }
    str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
  }
  return x.s < 0 ? "-" + str : str;
}
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
function abs(x) {
  return new this(x).abs();
}
function acos(x) {
  return new this(x).acos();
}
function acosh(x) {
  return new this(x).acosh();
}
function add(x, y) {
  return new this(x).plus(y);
}
function asin(x) {
  return new this(x).asin();
}
function asinh(x) {
  return new this(x).asinh();
}
function atan(x) {
  return new this(x).atan();
}
function atanh(x) {
  return new this(x).atanh();
}
function atan2(y, x) {
  y = new this(y);
  x = new this(x);
  var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
  if (!y.s || !x.s) {
    r = new this(NaN);
  } else if (!y.d && !x.d) {
    r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
    r.s = y.s;
  } else if (!x.d || y.isZero()) {
    r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
    r.s = y.s;
  } else if (!y.d || x.isZero()) {
    r = getPi(this, wpr, 1).times(0.5);
    r.s = y.s;
  } else if (x.s < 0) {
    this.precision = wpr;
    this.rounding = 1;
    r = this.atan(divide(y, x, wpr, 1));
    x = getPi(this, wpr, 1);
    this.precision = pr;
    this.rounding = rm;
    r = y.s < 0 ? r.minus(x) : r.plus(x);
  } else {
    r = this.atan(divide(y, x, wpr, 1));
  }
  return r;
}
function cbrt(x) {
  return new this(x).cbrt();
}
function ceil(x) {
  return finalise(x = new this(x), x.e + 1, 2);
}
function clamp(x, min2, max2) {
  return new this(x).clamp(min2, max2);
}
function config(obj) {
  if (!obj || typeof obj !== "object") throw Error(decimalError + "Object expected");
  var i, p, v, useDefaults = obj.defaults === true, ps = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -EXP_LIMIT,
    0,
    "toExpPos",
    0,
    EXP_LIMIT,
    "maxE",
    0,
    EXP_LIMIT,
    "minE",
    -EXP_LIMIT,
    0,
    "modulo",
    0,
    9
  ];
  for (i = 0; i < ps.length; i += 3) {
    if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
      else throw Error(invalidArgument + p + ": " + v);
    }
  }
  if (p = "crypto", useDefaults) this[p] = DEFAULTS[p];
  if ((v = obj[p]) !== void 0) {
    if (v === true || v === false || v === 0 || v === 1) {
      if (v) {
        if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
          this[p] = true;
        } else {
          throw Error(cryptoUnavailable);
        }
      } else {
        this[p] = false;
      }
    } else {
      throw Error(invalidArgument + p + ": " + v);
    }
  }
  return this;
}
function cos(x) {
  return new this(x).cos();
}
function cosh(x) {
  return new this(x).cosh();
}
function clone(obj) {
  var i, p, ps;
  function Decimal2(v) {
    var e, i2, t, x = this;
    if (!(x instanceof Decimal2)) return new Decimal2(v);
    x.constructor = Decimal2;
    if (isDecimalInstance(v)) {
      x.s = v.s;
      if (external) {
        if (!v.d || v.e > Decimal2.maxE) {
          x.e = NaN;
          x.d = null;
        } else if (v.e < Decimal2.minE) {
          x.e = 0;
          x.d = [0];
        } else {
          x.e = v.e;
          x.d = v.d.slice();
        }
      } else {
        x.e = v.e;
        x.d = v.d ? v.d.slice() : v.d;
      }
      return;
    }
    t = typeof v;
    if (t === "number") {
      if (v === 0) {
        x.s = 1 / v < 0 ? -1 : 1;
        x.e = 0;
        x.d = [0];
        return;
      }
      if (v < 0) {
        v = -v;
        x.s = -1;
      } else {
        x.s = 1;
      }
      if (v === ~~v && v < 1e7) {
        for (e = 0, i2 = v; i2 >= 10; i2 /= 10) e++;
        if (external) {
          if (e > Decimal2.maxE) {
            x.e = NaN;
            x.d = null;
          } else if (e < Decimal2.minE) {
            x.e = 0;
            x.d = [0];
          } else {
            x.e = e;
            x.d = [v];
          }
        } else {
          x.e = e;
          x.d = [v];
        }
        return;
      }
      if (v * 0 !== 0) {
        if (!v) x.s = NaN;
        x.e = NaN;
        x.d = null;
        return;
      }
      return parseDecimal(x, v.toString());
    }
    if (t === "string") {
      if ((i2 = v.charCodeAt(0)) === 45) {
        v = v.slice(1);
        x.s = -1;
      } else {
        if (i2 === 43) v = v.slice(1);
        x.s = 1;
      }
      return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
    }
    if (t === "bigint") {
      if (v < 0) {
        v = -v;
        x.s = -1;
      } else {
        x.s = 1;
      }
      return parseDecimal(x, v.toString());
    }
    throw Error(invalidArgument + v);
  }
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.EUCLID = 9;
  Decimal2.config = Decimal2.set = config;
  Decimal2.clone = clone;
  Decimal2.isDecimal = isDecimalInstance;
  Decimal2.abs = abs;
  Decimal2.acos = acos;
  Decimal2.acosh = acosh;
  Decimal2.add = add;
  Decimal2.asin = asin;
  Decimal2.asinh = asinh;
  Decimal2.atan = atan;
  Decimal2.atanh = atanh;
  Decimal2.atan2 = atan2;
  Decimal2.cbrt = cbrt;
  Decimal2.ceil = ceil;
  Decimal2.clamp = clamp;
  Decimal2.cos = cos;
  Decimal2.cosh = cosh;
  Decimal2.div = div;
  Decimal2.exp = exp;
  Decimal2.floor = floor;
  Decimal2.hypot = hypot;
  Decimal2.ln = ln;
  Decimal2.log = log;
  Decimal2.log10 = log10;
  Decimal2.log2 = log2;
  Decimal2.max = max;
  Decimal2.min = min;
  Decimal2.mod = mod;
  Decimal2.mul = mul;
  Decimal2.pow = pow;
  Decimal2.random = random;
  Decimal2.round = round;
  Decimal2.sign = sign;
  Decimal2.sin = sin;
  Decimal2.sinh = sinh;
  Decimal2.sqrt = sqrt;
  Decimal2.sub = sub;
  Decimal2.sum = sum;
  Decimal2.tan = tan;
  Decimal2.tanh = tanh;
  Decimal2.trunc = trunc;
  if (obj === void 0) obj = {};
  if (obj) {
    if (obj.defaults !== true) {
      ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
      for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
    }
  }
  Decimal2.config(obj);
  return Decimal2;
}
function div(x, y) {
  return new this(x).div(y);
}
function exp(x) {
  return new this(x).exp();
}
function floor(x) {
  return finalise(x = new this(x), x.e + 1, 3);
}
function hypot() {
  var i, n, t = new this(0);
  external = false;
  for (i = 0; i < arguments.length; ) {
    n = new this(arguments[i++]);
    if (!n.d) {
      if (n.s) {
        external = true;
        return new this(1 / 0);
      }
      t = n;
    } else if (t.d) {
      t = t.plus(n.times(n));
    }
  }
  external = true;
  return t.sqrt();
}
function isDecimalInstance(obj) {
  return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
}
function ln(x) {
  return new this(x).ln();
}
function log(x, y) {
  return new this(x).log(y);
}
function log2(x) {
  return new this(x).log(2);
}
function log10(x) {
  return new this(x).log(10);
}
function max() {
  return maxOrMin(this, arguments, -1);
}
function min() {
  return maxOrMin(this, arguments, 1);
}
function mod(x, y) {
  return new this(x).mod(y);
}
function mul(x, y) {
  return new this(x).mul(y);
}
function pow(x, y) {
  return new this(x).pow(y);
}
function random(sd) {
  var d, e, k, n, i = 0, r = new this(1), rd = [];
  if (sd === void 0) sd = this.precision;
  else checkInt32(sd, 1, MAX_DIGITS);
  k = Math.ceil(sd / LOG_BASE);
  if (!this.crypto) {
    for (; i < k; ) rd[i++] = Math.random() * 1e7 | 0;
  } else if (crypto.getRandomValues) {
    d = crypto.getRandomValues(new Uint32Array(k));
    for (; i < k; ) {
      n = d[i];
      if (n >= 429e7) {
        d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
      } else {
        rd[i++] = n % 1e7;
      }
    }
  } else if (crypto.randomBytes) {
    d = crypto.randomBytes(k *= 4);
    for (; i < k; ) {
      n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
      if (n >= 214e7) {
        crypto.randomBytes(4).copy(d, i);
      } else {
        rd.push(n % 1e7);
        i += 4;
      }
    }
    i = k / 4;
  } else {
    throw Error(cryptoUnavailable);
  }
  k = rd[--i];
  sd %= LOG_BASE;
  if (k && sd) {
    n = mathpow(10, LOG_BASE - sd);
    rd[i] = (k / n | 0) * n;
  }
  for (; rd[i] === 0; i--) rd.pop();
  if (i < 0) {
    e = 0;
    rd = [0];
  } else {
    e = -1;
    for (; rd[0] === 0; e -= LOG_BASE) rd.shift();
    for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;
    if (k < LOG_BASE) e -= LOG_BASE - k;
  }
  r.e = e;
  r.d = rd;
  return r;
}
function round(x) {
  return finalise(x = new this(x), x.e + 1, this.rounding);
}
function sign(x) {
  x = new this(x);
  return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
}
function sin(x) {
  return new this(x).sin();
}
function sinh(x) {
  return new this(x).sinh();
}
function sqrt(x) {
  return new this(x).sqrt();
}
function sub(x, y) {
  return new this(x).sub(y);
}
function sum() {
  var i = 0, args = arguments, x = new this(args[i]);
  external = false;
  for (; x.s && ++i < args.length; ) x = x.plus(args[i]);
  external = true;
  return finalise(x, this.precision, this.rounding);
}
function tan(x) {
  return new this(x).tan();
}
function tanh(x) {
  return new this(x).tanh();
}
function trunc(x) {
  return finalise(x = new this(x), x.e + 1, 1);
}
P[Symbol.for("nodejs.util.inspect.custom")] = P.toString;
P[Symbol.toStringTag] = "Decimal";
var Decimal = P.constructor = clone(DEFAULTS);
LN10 = new Decimal(LN10);
PI = new Decimal(PI);
var decimal_default = Decimal;

// src/solana/contract/helpers.ts
var import_whirlpools = require("@orca-so/whirlpools");
var import_kit2 = require("@solana/kit");
var getLaunchConfigs = (rpcurl, wallet, tokenAmountB, tokenAmountA, tickSpacing, feeTierAddress) => __async(null, null, function* () {
  const GOLDC_MINT2 = Buffer.from("goldc_mint");
  const TICK_SPACING = tickSpacing;
  const FEE_TIER_INDEX = 1024 + TICK_SPACING;
  const FEE_TIER_PUBKEY = new import_web33.PublicKey(feeTierAddress);
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }
  let core;
  try {
    core = yield import("@orca-so/whirlpools-core");
  } catch (e) {
    console.error("\u274C Failed to load @orca-so/whirlpools-core:", e);
    throw new Error("Failed to initialize Orca whirlpools core (WASM).");
  }
  const priceToSqrtPrice = core.priceToSqrtPrice;
  const getTickArrayStartTickIndex = core.getTickArrayStartTickIndex;
  const getFullRangeTickIndexes = core.getFullRangeTickIndexes;
  if (typeof priceToSqrtPrice !== "function") {
    throw new Error(
      "priceToSqrtPrice not available after importing @orca-so/whirlpools-core."
    );
  }
  const connection = new import_web33.Connection(
    rpcurl || "https://api.devnet.solana.com",
    "confirmed"
  );
  const provider = new anchor2.AnchorProvider(connection, wallet, {
    preflightCommitment: "processed"
  });
  anchor2.setProvider(provider);
  const program = new anchor2.Program(IDL, provider);
  const [goldcMintPda] = import_web33.PublicKey.findProgramAddressSync(
    [GOLDC_MINT2],
    program.programId
  );
  const tokenMintB = import_web34.Keypair.generate();
  const [tokenAMint, tokenBMint] = (0, import_whirlpools.orderMints)(
    (0, import_kit2.address)(goldcMintPda.toBase58()),
    (0, import_kit2.address)(tokenMintB.publicKey.toBase58())
  );
  const tokenAPK = new import_web33.PublicKey(tokenAMint);
  const tokenBPK = new import_web33.PublicKey(tokenBMint);
  const noFlip = tokenAMint === goldcMintPda.toBase58();
  const [tokenAmountAU64, tokenAmountBU64] = noFlip ? [BigInt(tokenAmountA), BigInt(tokenAmountB)] : [BigInt(tokenAmountB), BigInt(tokenAmountA)];
  const [decimalsA, decimalsB] = [9, 9];
  const initialPrice = new decimal_default(tokenAmountBU64.toString()).div(
    new decimal_default(tokenAmountAU64.toString())
  );
  const INITIAL_SQRT_PRICE = new import_bn.BN(
    priceToSqrtPrice(initialPrice.toNumber(), decimalsA, decimalsB).toString()
  );
  const { tickLowerIndex, tickUpperIndex } = getFullRangeTickIndexes(TICK_SPACING);
  const START_TA_LOWER = getTickArrayStartTickIndex(
    tickLowerIndex,
    TICK_SPACING
  );
  const START_TA_UPPER = getTickArrayStartTickIndex(
    tickUpperIndex,
    TICK_SPACING
  );
  const whirlpool = getWhirlpoolPda(
    ORCA_WHIRLPOOL_PROGRAM_ID2,
    WHIRLPOOLS_CONFIG_PUBKEY2,
    tokenAPK,
    tokenBPK,
    TICK_SPACING
  );
  const tickArrayLower = getTickArrayPda(
    whirlpool,
    START_TA_LOWER,
    ORCA_WHIRLPOOL_PROGRAM_ID2
  );
  const tickArrayUpper = getTickArrayPda(
    whirlpool,
    START_TA_UPPER,
    ORCA_WHIRLPOOL_PROGRAM_ID2
  );
  const tokenBadge0 = deriveTokenBadge(WHIRLPOOLS_CONFIG_PUBKEY2, tokenAPK);
  const tokenBadge1 = deriveTokenBadge(WHIRLPOOLS_CONFIG_PUBKEY2, tokenBPK);
  const [tokenBadgeA, tokenBadgeB] = noFlip ? [tokenBadge0, tokenBadge1] : [tokenBadge1, tokenBadge0];
  const tokenVaultA = import_web34.Keypair.generate();
  const tokenVaultB = import_web34.Keypair.generate();
  const metadataAccountB = deriveMetadataPda(tokenMintB.publicKey);
  const launchtokenStore = deriveLaunchStore(whirlpool, program.programId);
  const [oraclePda] = deriveOraclePda(whirlpool, ORCA_WHIRLPOOL_PROGRAM_ID2);
  const [vaultAuthority] = import_web33.PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority")],
    program.programId
  );
  return {
    provider,
    program,
    wallet,
    connection,
    // Constants
    WHIRLPOOLS_CONFIG_PUBKEY: WHIRLPOOLS_CONFIG_PUBKEY2,
    FEE_TIER_PUBKEY,
    TICK_SPACING,
    FEE_TIER_INDEX,
    INITIAL_SQRT_PRICE,
    START_TA_LOWER,
    START_TA_UPPER,
    tickLowerIndex,
    tickUpperIndex,
    // Token mints
    goldcMintPda,
    tokenMintB,
    tokenAPK,
    tokenBPK,
    noFlip,
    // Whirlpool + PDAs
    whirlpool,
    tickArrayLower,
    tickArrayUpper,
    tokenBadgeA,
    tokenBadgeB,
    tokenVaultA,
    tokenVaultB,
    metadataAccountB,
    launchtokenStore,
    oraclePda,
    vaultAuthority
  };
});
function leU16(n) {
  return Buffer.from(new Uint16Array([n]).buffer);
}
function getWhirlpoolPda(programId, config2, mintA, mintB, tick_spacing) {
  const [pda] = import_web33.PublicKey.findProgramAddressSync(
    [
      Buffer.from("whirlpool"),
      config2.toBuffer(),
      mintA.toBuffer(),
      // DO NOT sort – must match token_mint_a
      mintB.toBuffer(),
      // DO NOT sort – must match token_mint_b
      leU16(tick_spacing)
      // or leU32 if that’s the actual type
    ],
    programId
  );
  return pda;
}
function getTickArrayPda(whirlpool, startTickIndex, programId) {
  const [pda] = import_web33.PublicKey.findProgramAddressSync(
    [
      Buffer.from("tick_array"),
      whirlpool.toBuffer(),
      Buffer.from(startTickIndex.toString(), "utf8")
    ],
    programId
  );
  return pda;
}
function deriveTokenBadge(whirlpoolsConfig, tokenMint) {
  const [badge] = import_web33.PublicKey.findProgramAddressSync(
    [
      Buffer.from("token_badge"),
      whirlpoolsConfig.toBuffer(),
      tokenMint.toBuffer()
    ],
    ORCA_WHIRLPOOL_PROGRAM_ID2
  );
  return badge;
}
function deriveMetadataPda(mint) {
  const [pda] = import_web33.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID2.toBuffer(),
      mint.toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID2
  );
  return pda;
}
function deriveLaunchStore(whirlpool, programId) {
  const [pda] = import_web33.PublicKey.findProgramAddressSync(
    [Buffer.from("launch_store"), whirlpool.toBuffer()],
    programId
  );
  return pda;
}
function deriveOraclePda(whirlpool, whirlpoolProgramId) {
  return import_web33.PublicKey.findProgramAddressSync(
    [Buffer.from("oracle"), whirlpool.toBuffer()],
    whirlpoolProgramId
  );
}

// src/solana/contract/token.ts
var runLaunchFlow = (rpcurl, wallet, metadata, tokenSupply, liquidityAmount, setStep, tickSpacing, feeTierAddress) => __async(null, null, function* () {
  const results = {};
  if (!/^https?:\/\/.+/.test(metadata.uri)) {
    const err = "Invalid URI: must be an http/https URL";
    results.error = err;
    return results;
  }
  if (!Number.isFinite(tokenSupply) || tokenSupply <= 0) {
    const err = "Invalid token supply: must be a positive number";
    results.error = err;
    return results;
  }
  if (!Number.isFinite(liquidityAmount) || liquidityAmount <= 0) {
    const err = "Invalid liquidity amount: must be a positive number";
    results.error = err;
    return results;
  }
  const MAX_SUPPLY = 1e9;
  if (tokenSupply > MAX_SUPPLY) {
    const err = `Invalid token supply: must not exceed ${MAX_SUPPLY}`;
    results.error = err;
    return results;
  }
  const MAX_LIQUIDITY = 1e9;
  if (liquidityAmount > MAX_LIQUIDITY) {
    const err = `Invalid liquidity amount: must not exceed ${MAX_LIQUIDITY}`;
    results.error = err;
    return results;
  }
  if (!tickSpacing) {
    const err = `Unable to get fee tier! try again later.`;
    results.error = err;
    return results;
  }
  try {
    const configs = yield getLaunchConfigs(
      rpcurl,
      wallet,
      liquidityAmount,
      tokenSupply,
      tickSpacing,
      feeTierAddress
    );
    results.configs = configs;
    setStep("Minting Token...");
    const grad = yield graduateToken(
      wallet,
      metadata,
      configs,
      tokenSupply,
      liquidityAmount
    );
    results.graduateToken = grad;
    if (grad.error) {
      results.error = grad.error;
      return results;
    }
    setStep("Adding Liquidity...");
    const addLiq = yield addLiquidity(
      wallet,
      configs,
      tokenSupply,
      // tokenAmountA
      liquidityAmount
      // tokenAmountB
    );
    results.addLiquidity = addLiq;
    if (addLiq.error) {
      results.error = addLiq.error;
      return results;
    }
    return results;
  } catch (err) {
    console.error("\u274C runLaunchFlow failed:", err);
    results.error = err;
    return results;
  }
});
var graduateToken = (wallet, metadata, configs, tokenAmount0, tokenAmount1) => __async(null, null, function* () {
  var _a, _b;
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }
  const {
    provider,
    program,
    whirlpool,
    vaultAuthority,
    goldcMintPda,
    tokenMintB,
    metadataAccountB,
    tokenBadgeA,
    tokenBadgeB,
    tokenVaultA,
    tokenVaultB,
    tickArrayLower,
    tickArrayUpper,
    launchtokenStore,
    WHIRLPOOLS_CONFIG_PUBKEY: WHIRLPOOLS_CONFIG_PUBKEY3,
    FEE_TIER_PUBKEY,
    TICK_SPACING,
    INITIAL_SQRT_PRICE,
    START_TA_LOWER: startTickIndexLower,
    START_TA_UPPER: startTickIndexUpper,
    tickLowerIndex,
    tickUpperIndex
  } = configs;
  const sqrtPrice = new import_bn2.BN(INITIAL_SQRT_PRICE.toString());
  const computeUnitsIx = import_web35.ComputeBudgetProgram.setComputeUnitLimit({
    units: 14e5
  });
  const ixBuilder = program.methods.launchToken(
    TICK_SPACING,
    sqrtPrice,
    startTickIndexLower,
    startTickIndexUpper,
    tickLowerIndex,
    tickUpperIndex,
    metadata.name,
    metadata.symbol,
    metadata.uri,
    new import_bn2.BN(tokenAmount0),
    new import_bn2.BN(tokenAmount1)
  ).accountsPartial({
    launchTokenStore: launchtokenStore,
    whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID2,
    whirlpoolsConfig: WHIRLPOOLS_CONFIG_PUBKEY3,
    vaultAuthority,
    whirlpool,
    tokenMintA: goldcMintPda,
    tokenMintB: tokenMintB.publicKey,
    metadataAccount: metadataAccountB,
    tokenBadgeA,
    tokenBadgeB,
    funder: wallet.publicKey,
    tokenVaultA: tokenVaultA.publicKey,
    tokenVaultB: tokenVaultB.publicKey,
    feeTier: FEE_TIER_PUBKEY,
    tickArrayLower,
    tickArrayUpper,
    tokenProgram: import_spl_token.TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID2,
    systemProgram: import_web35.SystemProgram.programId,
    rent: anchor3.web3.SYSVAR_RENT_PUBKEY
  });
  let tx = yield ixBuilder.transaction();
  tx.instructions.unshift(computeUnitsIx);
  tx.feePayer = wallet.publicKey;
  try {
    const { blockhash, lastValidBlockHeight } = yield provider.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.partialSign(tokenMintB, tokenVaultA, tokenVaultB);
    const sig = yield wallet.sendTransaction(tx, provider.connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed"
    });
    yield provider.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );
    return { signature: sig, configs, error: null };
  } catch (e) {
    const logs = (_b = e == null ? void 0 : e.logs) != null ? _b : (_a = e == null ? void 0 : e.getLogs) == null ? void 0 : _a.call(e);
    console.error("\u274C SendTransactionError:", (e == null ? void 0 : e.message) || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));
    return { signature: null, configs, error: e };
  }
});
var addLiquidity = (wallet, configs, tokenAmountA, tokenAmountB) => __async(null, null, function* () {
  var _a, _b;
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or cannot sign");
  }
  const {
    provider,
    program,
    whirlpool,
    vaultAuthority,
    tokenAPK,
    // ordered A mint
    tokenBPK,
    // ordered B mint
    tokenVaultA,
    tokenVaultB,
    tickArrayLower,
    tickArrayUpper,
    launchtokenStore,
    INITIAL_SQRT_PRICE,
    tickLowerIndex,
    tickUpperIndex,
    noFlip
  } = configs;
  let core;
  try {
    core = yield import("@orca-so/whirlpools-core");
  } catch (e) {
    console.error("\u274C Failed to load @orca-so/whirlpools-core:", e);
    throw new Error("Failed to initialize Orca whirlpools core (WASM).");
  }
  const increaseLiquidityQuoteA = core.increaseLiquidityQuoteA;
  const increaseLiquidityQuoteB = core.increaseLiquidityQuoteB;
  if (typeof increaseLiquidityQuoteA !== "function") {
    throw new Error(
      "increaseLiquidityQuoteA not available after importing @orca-so/whirlpools-core."
    );
  }
  if (typeof increaseLiquidityQuoteB !== "function") {
    throw new Error(
      "increaseLiquidityQuoteB not available after importing @orca-so/whirlpools-core."
    );
  }
  const amountAUsed = noFlip ? tokenAmountA : tokenAmountB;
  const amountBUsed = noFlip ? tokenAmountB : tokenAmountA;
  const scaledAmountA = BigInt(
    new decimal_default(amountAUsed.toString()).mul(new decimal_default(10).pow(9)).toString()
  );
  const scaledAmountB = BigInt(
    new decimal_default(amountBUsed.toString()).mul(new decimal_default(10).pow(9)).toString()
  );
  const quoteA = increaseLiquidityQuoteA(
    scaledAmountA,
    0,
    BigInt(INITIAL_SQRT_PRICE.toString()),
    tickLowerIndex,
    tickUpperIndex
  );
  const quoteB = increaseLiquidityQuoteB(
    scaledAmountB,
    0,
    BigInt(INITIAL_SQRT_PRICE.toString()),
    tickLowerIndex,
    tickUpperIndex
  );
  const useA = quoteA.liquidityDelta < quoteB.liquidityDelta;
  const liquidityDelta = useA ? quoteA.liquidityDelta : quoteB.liquidityDelta;
  const positionMint = anchor3.web3.Keypair.generate();
  const [position] = import_web35.PublicKey.findProgramAddressSync(
    [Buffer.from("position"), positionMint.publicKey.toBuffer()],
    ORCA_WHIRLPOOL_PROGRAM_ID2
  );
  const [positionOwnerPda] = import_web35.PublicKey.findProgramAddressSync(
    [Buffer.from("position_owner")],
    program.programId
  );
  const positionTokenAccount = (0, import_spl_token.getAssociatedTokenAddressSync)(
    positionMint.publicKey,
    positionOwnerPda,
    true,
    import_spl_token.TOKEN_2022_PROGRAM_ID
  );
  const tokenOwnerAccountA = (0, import_spl_token.getAssociatedTokenAddressSync)(
    tokenAPK,
    positionOwnerPda,
    true,
    import_spl_token.TOKEN_PROGRAM_ID
  );
  const tokenOwnerAccountB = (0, import_spl_token.getAssociatedTokenAddressSync)(
    tokenBPK,
    positionOwnerPda,
    true
  );
  const vaultA = noFlip ? tokenVaultA.publicKey : tokenVaultB.publicKey;
  const vaultB = noFlip ? tokenVaultB.publicKey : tokenVaultA.publicKey;
  const ixBuilder = program.methods.addLiqudity(true, new import_bn2.BN(liquidityDelta.toString())).accountsPartial({
    whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID2,
    vaultAuthority,
    launchTokenStore: launchtokenStore,
    whirlpool,
    tokenMintA: tokenAPK,
    tokenMintB: tokenBPK,
    funder: wallet.publicKey,
    tokenVaultA: vaultA,
    tokenVaultB: vaultB,
    tickArrayLower,
    tickArrayUpper,
    positionOwner: positionOwnerPda,
    position,
    positionMint: positionMint.publicKey,
    positionTokenAccount,
    tokenOwnerAccountA,
    tokenOwnerAccountB,
    token2022Program: import_spl_token.TOKEN_2022_PROGRAM_ID,
    metadataUpdateAuth: METADATA_UPDATE_AUTH2,
    systemProgram: import_web35.SystemProgram.programId,
    rent: anchor3.web3.SYSVAR_RENT_PUBKEY,
    associatedTokenProgram: import_spl_token.ASSOCIATED_TOKEN_PROGRAM_ID,
    memoProgram: MEMO_PROGRAM2,
    tokenProgram: import_spl_token.TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID2
  });
  const computeUnitsIx = import_web35.ComputeBudgetProgram.setComputeUnitLimit({
    units: 14e5
  });
  let tx = yield ixBuilder.transaction();
  tx.instructions.unshift(computeUnitsIx);
  tx.feePayer = wallet.publicKey;
  try {
    const { blockhash, lastValidBlockHeight } = yield provider.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.partialSign(positionMint, tokenVaultA, tokenVaultB);
    const sig = yield wallet.sendTransaction(tx, provider.connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed"
    });
    yield provider.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );
    return {
      signature: sig,
      positionMint,
      position,
      positionOwnerPda,
      positionTokenAccount,
      tokenOwnerAccountA,
      tokenOwnerAccountB,
      usedQuote: useA ? "A" : "B",
      error: null
    };
  } catch (e) {
    const logs = (_b = e == null ? void 0 : e.logs) != null ? _b : (_a = e == null ? void 0 : e.getLogs) == null ? void 0 : _a.call(e);
    console.error("\u274C addLiquidity failed:", (e == null ? void 0 : e.message) || e);
    if (logs) console.error("Program Logs:\n" + logs.join("\n"));
    return { signature: null, error: e };
  }
});

// src/solana/launchToken.ts
var launchToken = (_0) => __async(null, [_0], function* ({
  rpcurl,
  wallet,
  metadata,
  tokenSupply,
  liquidityAmount,
  tickSpacing,
  feeTierAddress,
  onStep
}) {
  try {
    if (!wallet) throw new Error("Wallet is required");
    if (!(metadata == null ? void 0 : metadata.name) || !(metadata == null ? void 0 : metadata.symbol) || !(metadata == null ? void 0 : metadata.uri))
      throw new Error("Metadata (name, symbol, uri) is required");
    const result = yield runLaunchFlow(
      rpcurl,
      wallet,
      metadata,
      tokenSupply,
      liquidityAmount,
      onStep || (() => {
      }),
      tickSpacing,
      feeTierAddress
    );
    if (result == null ? void 0 : result.error) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("\u274C launchToken failed:", error);
    return { success: false, error: error.message || error };
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ensureValidToken,
  getAuthToken,
  getCurrentUser,
  getDummyData,
  getSolBalance,
  initSdk,
  isInitialized,
  launchToken,
  logoutSdk,
  restoreSdk,
  transferSol
});
/*! Bundled license information:

decimal.js/decimal.mjs:
  (*!
   *  decimal.js v10.6.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   *)
*/
