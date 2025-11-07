export interface LaunchTokenParams {
  rpcurl: string;
  wallet: any;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  };
  tokenSupply: number;
  liquidityAmount: number;
  tickSpacing: number;
  feeTierAddress: string;
  onStep?: (state: string) => void;
}
