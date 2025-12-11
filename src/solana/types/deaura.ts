/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/deaura.json`.
 */
export type Deaura = {
  address: "DDZZWyq9ur4iszNCREty7f2PZBceVNA2vpPXtCnH3kob";
  metadata: {
    name: "deaura";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addLiqudity";
      discriminator: [187, 193, 178, 125, 145, 231, 143, 214];
      accounts: [
        {
          name: "whirlpoolProgram";
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";
        },
        {
          name: "vaultAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "launchTokenStore";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  101,
                ];
              },
              {
                kind: "account";
                path: "whirlpool";
              },
            ];
          };
        },
        {
          name: "whirlpool";
          writable: true;
        },
        {
          name: "tokenMintA";
          writable: true;
        },
        {
          name: "tokenMintB";
          writable: true;
        },
        {
          name: "funder";
          writable: true;
          signer: true;
        },
        {
          name: "tokenVaultA";
          writable: true;
          signer: true;
        },
        {
          name: "tokenVaultB";
          writable: true;
          signer: true;
        },
        {
          name: "tickArrayLower";
          writable: true;
        },
        {
          name: "tickArrayUpper";
          writable: true;
        },
        {
          name: "positionOwner";
          pda: {
            seeds: [
              {
                kind: "const";
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
                  114,
                ];
              },
            ];
          };
        },
        {
          name: "position";
          writable: true;
        },
        {
          name: "positionMint";
          writable: true;
          signer: true;
        },
        {
          name: "positionTokenAccount";
          writable: true;
        },
        {
          name: "tokenOwnerAccountA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "positionOwner";
              },
              {
                kind: "const";
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
                  169,
                ];
              },
              {
                kind: "account";
                path: "tokenMintA";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "tokenOwnerAccountB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "positionOwner";
              },
              {
                kind: "const";
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
                  169,
                ];
              },
              {
                kind: "account";
                path: "tokenMintB";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "token2022Program";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "metadataUpdateAuth";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "memoProgram";
          address: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "tokenMetadataProgram";
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
      ];
      args: [
        {
          name: "withTokenMetadataExtension";
          type: "bool";
        },
        {
          name: "liquidityAmount";
          type: "u128";
        },
      ];
    },
    {
      name: "claimCreatorFee";
      discriminator: [26, 97, 138, 203, 132, 171, 141, 252];
      accounts: [
        {
          name: "launchTokenStore";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  101,
                ];
              },
              {
                kind: "account";
                path: "whirlpool";
              },
            ];
          };
        },
        {
          name: "claimant";
          writable: true;
          signer: true;
        },
        {
          name: "whirlpool";
          relations: ["launchTokenStore"];
        },
        {
          name: "positionAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
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
                  114,
                ];
              },
            ];
          };
        },
        {
          name: "tokenMintA";
        },
        {
          name: "tokenMintB";
        },
        {
          name: "feeVaultA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "positionAuthority";
              },
              {
                kind: "account";
                path: "tokenProgramA";
              },
              {
                kind: "account";
                path: "tokenMintA";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "feeVaultB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "positionAuthority";
              },
              {
                kind: "account";
                path: "tokenProgramB";
              },
              {
                kind: "account";
                path: "tokenMintB";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "claimantTokenA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "claimant";
              },
              {
                kind: "account";
                path: "tokenProgramA";
              },
              {
                kind: "account";
                path: "tokenMintA";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "claimantTokenB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "claimant";
              },
              {
                kind: "account";
                path: "tokenProgramB";
              },
              {
                kind: "account";
                path: "tokenMintB";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "tokenProgramA";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "tokenProgramB";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "collectProtocolFee";
      discriminator: [136, 136, 252, 221, 194, 66, 126, 89];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "launchTokenStore";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  101,
                ];
              },
              {
                kind: "account";
                path: "whirlpool";
              },
            ];
          };
        },
        {
          name: "whirlpoolProgram";
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";
        },
        {
          name: "whirlpool";
        },
        {
          name: "positionAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
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
                  114,
                ];
              },
            ];
          };
        },
        {
          name: "position";
          docs: ["Fees are measured from here pre-CPI"];
          writable: true;
        },
        {
          name: "positionTokenAccount";
        },
        {
          name: "tokenMintA";
        },
        {
          name: "tokenMintB";
        },
        {
          name: "tokenOwnerAccountA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "positionAuthority";
              },
              {
                kind: "account";
                path: "tokenProgramA";
              },
              {
                kind: "account";
                path: "tokenMintA";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "tokenVaultA";
          writable: true;
        },
        {
          name: "tokenOwnerAccountB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "positionAuthority";
              },
              {
                kind: "account";
                path: "tokenProgramB";
              },
              {
                kind: "account";
                path: "tokenMintB";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "tokenVaultB";
          writable: true;
        },
        {
          name: "protocolTreasury";
          writable: true;
          address: "5enXfJeNUGkx2EYoyvjr8oP1xmDC4noTgFMxxDaQhJ5V";
        },
        {
          name: "protocolFeeAccountA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "protocolTreasury";
              },
              {
                kind: "account";
                path: "tokenProgramA";
              },
              {
                kind: "account";
                path: "tokenMintA";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "protocolFeeAccountB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "protocolTreasury";
              },
              {
                kind: "account";
                path: "tokenProgramB";
              },
              {
                kind: "account";
                path: "tokenMintB";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "tokenProgramA";
        },
        {
          name: "tokenProgramB";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "memoProgram";
          address: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
        },
      ];
      args: [];
    },
    {
      name: "deposit";
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "globalState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "vaultAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "goldcMint";
          writable: true;
          address: "2MwxMWon2z4RxAq98pt9uNxLpWCDY2QCeeqtUS4JWHC7";
        },
        {
          name: "payerGoldcTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "const";
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
                  169,
                ];
              },
              {
                kind: "account";
                path: "goldcMint";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "vnxMint";
          writable: true;
          address: "9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R";
        },
        {
          name: "payerVnxTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "const";
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
                  169,
                ];
              },
              {
                kind: "account";
                path: "vnxMint";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "vnxVault";
          writable: true;
          address: "BsgqmFnmncCMRrnGaKaCAXEG3DiApLX2tW2ui3KmXTNd";
        },
        {
          name: "userData";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: "account";
                path: "payer";
              },
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "initTickArray";
      discriminator: [88, 230, 135, 70, 171, 38, 191, 183];
      accounts: [
        {
          name: "whirlpoolProgram";
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";
        },
        {
          name: "launchTokenStore";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  101,
                ];
              },
              {
                kind: "account";
                path: "whirlpool";
              },
            ];
          };
        },
        {
          name: "whirlpool";
          writable: true;
        },
        {
          name: "tickArray";
          writable: true;
        },
        {
          name: "funder";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "startTickIndex";
          type: "i32";
        },
        {
          name: "tickIndexLower";
          type: "i32";
        },
        {
          name: "tickIndexUpper";
          type: "i32";
        },
      ];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "globalState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "vaultAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "goldcMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 111, 108, 100, 99, 95, 109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: "metadataAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "account";
                path: "tokenMetadataProgram";
              },
              {
                kind: "account";
                path: "goldcMint";
              },
            ];
            program: {
              kind: "account";
              path: "tokenMetadataProgram";
            };
          };
        },
        {
          name: "vnxTokenVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 110, 120, 95, 118, 97, 117, 108, 116];
              },
            ];
          };
        },
        {
          name: "vnxMint";
          writable: true;
          address: "9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "tokenMetadataProgram";
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "adminAccount";
          type: "pubkey";
        },
        {
          name: "treasuery";
          type: "pubkey";
        },
      ];
    },
    {
      name: "launchToken";
      discriminator: [10, 128, 86, 171, 3, 137, 161, 244];
      accounts: [
        {
          name: "launchTokenStore";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  101,
                ];
              },
              {
                kind: "account";
                path: "whirlpool";
              },
            ];
          };
        },
        {
          name: "whirlpoolProgram";
          address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";
        },
        {
          name: "whirlpoolsConfig";
        },
        {
          name: "vaultAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "whirlpool";
          writable: true;
        },
        {
          name: "tokenMintA";
          writable: true;
          address: "2MwxMWon2z4RxAq98pt9uNxLpWCDY2QCeeqtUS4JWHC7";
        },
        {
          name: "tokenMintB";
          writable: true;
          signer: true;
        },
        {
          name: "metadataAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "account";
                path: "tokenMetadataProgram";
              },
              {
                kind: "account";
                path: "tokenMintB";
              },
            ];
            program: {
              kind: "account";
              path: "tokenMetadataProgram";
            };
          };
        },
        {
          name: "tokenBadgeA";
          writable: true;
        },
        {
          name: "tokenBadgeB";
          writable: true;
        },
        {
          name: "funder";
          writable: true;
          signer: true;
        },
        {
          name: "tokenVaultA";
          writable: true;
          signer: true;
        },
        {
          name: "tokenVaultB";
          writable: true;
          signer: true;
        },
        {
          name: "feeTier";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "tokenMetadataProgram";
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
      ];
      args: [
        {
          name: "tickSpacing";
          type: "u16";
        },
        {
          name: "initialSqrtPrice";
          type: "u128";
        },
        {
          name: "tokenName";
          type: "string";
        },
        {
          name: "tokenSymbol";
          type: "string";
        },
        {
          name: "tokenUri";
          type: "string";
        },
        {
          name: "totalMintA";
          type: "u64";
        },
        {
          name: "totalMintB";
          type: "u64";
        },
        {
          name: "integrator";
          type: {
            option: "pubkey";
          };
        },
        {
          name: "salesRep";
          type: {
            option: "pubkey";
          };
        },
      ];
    },
    {
      name: "redeem";
      discriminator: [184, 12, 86, 149, 70, 196, 97, 225];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "globalState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "vaultAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
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
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "goldcMint";
          writable: true;
          address: "2MwxMWon2z4RxAq98pt9uNxLpWCDY2QCeeqtUS4JWHC7";
        },
        {
          name: "payerGoldcTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "const";
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
                  169,
                ];
              },
              {
                kind: "account";
                path: "goldcMint";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "vnxMint";
          writable: true;
          address: "9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R";
        },
        {
          name: "payerVnxTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "const";
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
                  169,
                ];
              },
              {
                kind: "account";
                path: "vnxMint";
              },
            ];
            program: {
              kind: "const";
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
                89,
              ];
            };
          };
        },
        {
          name: "vnxVault";
          writable: true;
          address: "BsgqmFnmncCMRrnGaKaCAXEG3DiApLX2tW2ui3KmXTNd";
        },
        {
          name: "userData";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: "account";
                path: "payer";
              },
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "setFeeRecipients";
      discriminator: [49, 149, 195, 192, 109, 40, 213, 123];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "globalState";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: "whirlpool";
          writable: true;
        },
        {
          name: "launchTokenStore";
          pda: {
            seeds: [
              {
                kind: "const";
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
                  101,
                ];
              },
              {
                kind: "account";
                path: "whirlpool";
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "integratorAccount";
          type: "pubkey";
        },
        {
          name: "salesRepAccount";
          type: "pubkey";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "globalState";
      discriminator: [163, 46, 74, 168, 216, 123, 133, 98];
    },
    {
      name: "launchedToken";
      discriminator: [53, 29, 67, 30, 75, 106, 63, 0];
    },
    {
      name: "position";
      discriminator: [170, 188, 143, 228, 122, 64, 247, 208];
    },
    {
      name: "user";
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236];
    },
  ];
  events: [
    {
      name: "depositEvent";
      discriminator: [120, 248, 61, 83, 31, 142, 107, 144];
    },
    {
      name: "liquidityAdded";
      discriminator: [154, 26, 221, 108, 238, 64, 217, 161];
    },
    {
      name: "redeemEvent";
      discriminator: [90, 114, 83, 146, 212, 26, 217, 59];
    },
    {
      name: "tokenLaunched";
      discriminator: [225, 232, 190, 147, 213, 192, 220, 168];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "amountIsZero";
      msg: "amount should not be zero";
    },
    {
      code: 6001;
      name: "insufficientTokenBalance";
      msg: "amount is too high";
    },
    {
      code: 6002;
      name: "numericalOverflow";
      msg: "Numerical overflow occurred.";
    },
    {
      code: 6003;
      name: "notAuthorized";
      msg: "Account not authorized to perform this Action";
    },
    {
      code: 6004;
      name: "invalidTotalMint";
      msg: "Invalid total mint amount";
    },
    {
      code: 6005;
      name: "invalidTickIndices";
      msg: "Invalid tick indices";
    },
    {
      code: 6006;
      name: "tokenNameTooLong";
      msg: "Token name too long";
    },
    {
      code: 6007;
      name: "unauthorizedClaimant";
      msg: "Unauthorized claimant";
    },
    {
      code: 6008;
      name: "liqudityAlreadyAdded";
      msg: "Initial Liqudity for position is added";
    },
    {
      code: 6009;
      name: "incorrectAccount";
      msg: "Account passed is Incorrect";
    },
    {
      code: 6010;
      name: "invalidGoldcTotalMint";
      msg: "Invalid goldc mint amount";
    },
    {
      code: 6011;
      name: "incorrectMintAccount";
      msg: "Incorrect mint account";
    },
  ];
  types: [
    {
      name: "depositEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "totalVnxDeposited";
            type: "u64";
          },
          {
            name: "timestamp";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "globalState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "adminAccount";
            type: "pubkey";
          },
          {
            name: "treasuery";
            type: "pubkey";
          },
          {
            name: "isMintingPaused";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "launchedToken";
      type: {
        kind: "struct";
        fields: [
          {
            name: "tokenMintA";
            type: "pubkey";
          },
          {
            name: "tokenMintB";
            type: "pubkey";
          },
          {
            name: "tokenDeployer";
            type: "pubkey";
          },
          {
            name: "totalMintA";
            type: "u64";
          },
          {
            name: "totalMintB";
            type: "u64";
          },
          {
            name: "whirlpool";
            type: "pubkey";
          },
          {
            name: "tokenAPoolAccount";
            type: "pubkey";
          },
          {
            name: "tokenBPoolAccount";
            type: "pubkey";
          },
          {
            name: "tickSpacing";
            type: "u16";
          },
          {
            name: "initialSqrtPrice";
            type: "u128";
          },
          {
            name: "tickIndexLower";
            type: "i32";
          },
          {
            name: "tickIndexUpper";
            type: "i32";
          },
          {
            name: "feeAccumulatedTokenA";
            type: "u64";
          },
          {
            name: "feeAccumulatedTokenB";
            type: "u64";
          },
          {
            name: "integratorAccount";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "salesRepAccount";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "feeAccumulatedIntegratorA";
            type: "u64";
          },
          {
            name: "feeAccumulatedIntegratorB";
            type: "u64";
          },
          {
            name: "feeAccumulatedSalesRepA";
            type: "u64";
          },
          {
            name: "feeAccumulatedSalesRepB";
            type: "u64";
          },
          {
            name: "positionOwner";
            type: "pubkey";
          },
          {
            name: "position";
            type: "pubkey";
          },
          {
            name: "positionMint";
            type: "pubkey";
          },
          {
            name: "positionTokenAccount";
            type: "pubkey";
          },
          {
            name: "isLiqudityAdded";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "liquidityAdded";
      type: {
        kind: "struct";
        fields: [
          {
            name: "whirlpool";
            type: "pubkey";
          },
          {
            name: "liquidityAmount";
            type: "u128";
          },
          {
            name: "tokenAmountA";
            type: "u64";
          },
          {
            name: "tokenAmountB";
            type: "u64";
          },
          {
            name: "positionOwner";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "position";
      type: {
        kind: "struct";
        fields: [
          {
            name: "whirlpool";
            type: "pubkey";
          },
          {
            name: "positionMint";
            type: "pubkey";
          },
          {
            name: "liquidity";
            type: "u128";
          },
          {
            name: "tickLowerIndex";
            type: "i32";
          },
          {
            name: "tickUpperIndex";
            type: "i32";
          },
          {
            name: "feeGrowthCheckpointA";
            type: "u128";
          },
          {
            name: "feeOwedA";
            type: "u64";
          },
          {
            name: "feeGrowthCheckpointB";
            type: "u128";
          },
          {
            name: "feeOwedB";
            type: "u64";
          },
          {
            name: "rewardInfos";
            type: {
              array: [
                {
                  defined: {
                    name: "positionRewardInfo";
                  };
                },
                3,
              ];
            };
          },
        ];
      };
    },
    {
      name: "positionRewardInfo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "growthInsideCheckpoint";
            type: "u128";
          },
          {
            name: "amountOwed";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "redeemEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "totalVnxDeposited";
            type: "u64";
          },
          {
            name: "timestamp";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "tokenLaunched";
      type: {
        kind: "struct";
        fields: [
          {
            name: "tokenMintA";
            type: "pubkey";
          },
          {
            name: "tokenMintB";
            type: "pubkey";
          },
          {
            name: "whirlpool";
            type: "pubkey";
          },
          {
            name: "deployer";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "user";
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalVnxDeposited";
            type: "u64";
          },
        ];
      };
    },
  ];
};
