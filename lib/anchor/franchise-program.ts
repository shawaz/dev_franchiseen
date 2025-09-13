import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { FranchiseenChain, IDL } from './franchiseen-idl';

// Safe BN initialization with comprehensive error handling
let BNClass: any;
let isAnchorAvailable = false;

try {
  // Test if Anchor and BN are properly available
  if (typeof BN !== 'undefined' && BN && BN.prototype) {
    // Test BN functionality with more robust error handling
    try {
      const testBN = new BN(100);
      if (testBN && typeof testBN.toNumber === 'function' && testBN.toNumber() === 100) {
        BNClass = BN;
        isAnchorAvailable = true;
        console.log('Anchor BN is available and functional');
      } else {
        throw new Error('BN test failed - methods not working');
      }
    } catch (bnError) {
      console.warn('BN instantiation failed:', bnError);
      throw new Error('BN instantiation failed');
    }
  } else {
    throw new Error('BN is not defined or missing prototype');
  }
} catch (error) {
  console.warn('Anchor BN not available or not functional:', error);
  isAnchorAvailable = false;

  // Create a minimal BN-like class for fallback
  BNClass = class FallbackBN {
    private value: number;

    constructor(value: number | string) {
      this.value = typeof value === 'string' ? parseInt(value) : value;
    }

    toNumber(): number {
      return this.value;
    }

    toString(): string {
      return this.value.toString();
    }

    // Add other BN-like methods that might be needed
    add(other: any): FallbackBN {
      return new FallbackBN(this.value + (other.toNumber ? other.toNumber() : other));
    }

    sub(other: any): FallbackBN {
      return new FallbackBN(this.value - (other.toNumber ? other.toNumber() : other));
    }
  } as any;
}

// Program ID (replace with your deployed program ID)
export const PROGRAM_ID = new PublicKey('7bqq8JJHeZxVrLWCGhDaa9K1RkhpDTE2gBmeVW9ebiCj');

export class FranchiseProgram {
  private program: any;
  private provider: AnchorProvider;

  constructor(provider: AnchorProvider) {
    this.provider = provider;
    this.program = null; // Initialize as null

    try {
      // First check if Anchor is available at all
      if (!isAnchorAvailable) {
        console.warn('Anchor framework is not available or not functional, blockchain features will be disabled');
        return;
      }

      // Validate provider first
      if (!provider) {
        console.warn('Provider is not defined, Anchor program will not be available');
        return;
      }

      // Validate IDL and PROGRAM_ID before creating program
      if (!IDL) {
        console.warn('IDL is not defined, Anchor program will not be available');
        return;
      }
      if (!PROGRAM_ID) {
        console.warn('PROGRAM_ID is not defined, Anchor program will not be available');
        return;
      }

      // Validate provider properties
      if (!provider.connection || !provider.wallet) {
        console.warn('Provider connection or wallet is not defined, Anchor program will not be available');
        return;
      }

      // Additional check for Program class availability
      if (typeof Program === 'undefined') {
        console.warn('Program class is not available, Anchor program will not be available');
        return;
      }

      console.log('Initializing Anchor program with:', {
        programId: PROGRAM_ID.toString(),
        idlName: IDL.name,
        idlVersion: IDL.version,
        providerWallet: provider.wallet.publicKey?.toString(),
        connection: provider.connection.rpcEndpoint,
        anchorAvailable: isAnchorAvailable
      });

      // Check if we're in mock mode first
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

      if (useMockData) {
        console.log('Mock mode enabled - skipping Anchor program initialization');
        this.program = null;
        return;
      }

      // Try to create the program - only if everything is available
      try {
        // Additional safety checks before creating Program
        if (!IDL || !IDL.name || !IDL.instructions) {
          console.warn('IDL is not properly defined');
          this.program = null;
          return;
        }

        // Check if BN is available before creating Program
        if (!isAnchorAvailable || !BNClass) {
          console.warn('Anchor BN not available, skipping program initialization');
          this.program = null;
          return;
        }

        // Additional check for provider wallet
        if (!provider.wallet || !provider.wallet.publicKey) {
          console.warn('Provider wallet not available, skipping program initialization');
          this.program = null;
          return;
        }

        try {
          // Additional check for required dependencies
          if (!provider || !provider.connection) {
            console.warn('Provider or connection not available');
            this.program = null;
            return;
          }

          this.program = new Program(IDL as any, provider);
          console.log('Anchor program initialized successfully');
        } catch (programError) {
          console.error('Failed to initialize Anchor program:', programError);
          console.error('Error details:', {
            hasIDL: !!IDL,
            hasProvider: !!provider,
            hasWallet: !!provider?.wallet,
            hasConnection: !!provider?.connection,
            isBNAvailable: isAnchorAvailable
          });
          this.program = null;
          return;
        }

        // Test program functionality
        if (!this.program || !this.program.methods) {
          console.warn('Program created but methods are not available');
          this.program = null;
          return;
        }
      } catch (programError) {
        console.error('Failed to create Program instance:', programError);
        console.warn('Falling back to mock mode due to program initialization failure');
        this.program = null;
        return;
      }

    } catch (error) {
      console.error('Error initializing Anchor program:', error);
      console.warn('Anchor program initialization failed, blockchain features will be disabled');
      // Don't throw error, just log it and continue
      this.program = null;
    }
  }

  // Helper function to derive PDAs
  static findPlatformPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      PROGRAM_ID
    );
  }

  static findBusinessPDA(slug: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('business'), Buffer.from(slug)],
      PROGRAM_ID
    );
  }

  static findFranchisePDA(businessPubkey: PublicKey, slug: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('franchise'), businessPubkey.toBuffer(), Buffer.from(slug)],
      PROGRAM_ID
    );
  }

  static findFranchiseTokenMintPDA(businessPubkey: PublicKey, slug: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('franchise_token'), businessPubkey.toBuffer(), Buffer.from(slug)],
      PROGRAM_ID
    );
  }

  static findFranchiseVaultPDA(franchisePubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('franchise_vault'), franchisePubkey.toBuffer()],
      PROGRAM_ID
    );
  }

  static findPlatformVaultPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform_vault')],
      PROGRAM_ID
    );
  }

  // Initialize the platform (admin only)
  async initializePlatform(platformFeeBps: number): Promise<string> {
    const [platformPDA] = FranchiseProgram.findPlatformPDA();

    const tx = await this.program.methods
      .initializePlatform(platformFeeBps)
      .accounts({
        platform: platformPDA,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Create a new business
  async createBusiness(
    name: string,
    slug: string,
    industry: string,
    category: string
  ): Promise<string> {
    // Check if we're in mock mode
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('Using mock data for business creation');
      // Generate a mock transaction signature
      const mockTxSignature = `mock_business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Mock business created:', {
        name,
        slug,
        industry,
        category,
        txSignature: mockTxSignature
      });

      return mockTxSignature;
    }

    if (!this.program) {
      throw new Error('Anchor program not initialized - please connect your wallet and ensure the blockchain program is deployed');
    }

    const [businessPDA] = FranchiseProgram.findBusinessPDA(slug);

    const tx = await this.program.methods
      .createBusiness(name, slug, industry, category)
      .accounts({
        business: businessPDA,
        owner: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Create a new franchise
  async createFranchise(
    businessSlug: string,
    franchiseSlug: string,
    locationAddress: string,
    buildingName: string,
    carpetArea: number,
    costPerArea: number,
    totalShares: number
  ): Promise<string> {
    // Check if we're in mock mode
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('Using mock data for franchise creation');
      // Generate a mock transaction signature
      const mockTxSignature = `mock_franchise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Mock franchise created:', {
        businessSlug,
        franchiseSlug,
        locationAddress,
        buildingName,
        carpetArea,
        costPerArea,
        totalShares,
        txSignature: mockTxSignature
      });

      return mockTxSignature;
    }

    if (!this.program) {
      throw new Error('Anchor program not initialized - please connect your wallet and ensure the blockchain program is deployed');
    }

    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);
    const [franchisePDA] = FranchiseProgram.findFranchisePDA(businessPDA, franchiseSlug);
    const [franchiseTokenMintPDA] = FranchiseProgram.findFranchiseTokenMintPDA(businessPDA, franchiseSlug);

    const tx = await this.program.methods
      .createFranchise(
        franchiseSlug,
        locationAddress,
        buildingName,
        carpetArea,
        new BNClass(Math.floor(costPerArea)),
        totalShares
      )
      .accounts({
        franchise: franchisePDA,
        business: businessPDA,
        franchiseTokenMint: franchiseTokenMintPDA,
        owner: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  // Invest in a franchise
  async investInFranchise(
    businessSlug: string,
    franchiseSlug: string,
    sharesToBuy: number
  ): Promise<string> {
    // Check if we're in mock mode
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('Using mock data for franchise investment');
      // Generate a mock transaction signature
      const mockTxSignature = `mock_investment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      console.log('Mock investment created:', {
        businessSlug,
        franchiseSlug,
        sharesToBuy,
        txSignature: mockTxSignature
      });

      return mockTxSignature;
    }

    if (!this.program) {
      throw new Error('Anchor program not initialized - please connect your wallet and ensure the blockchain program is deployed');
    }

    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);
    const [franchisePDA] = FranchiseProgram.findFranchisePDA(businessPDA, franchiseSlug);
    const [franchiseTokenMintPDA] = FranchiseProgram.findFranchiseTokenMintPDA(businessPDA, franchiseSlug);
    const [franchiseVaultPDA] = FranchiseProgram.findFranchiseVaultPDA(franchisePDA);
    const [platformVaultPDA] = FranchiseProgram.findPlatformVaultPDA();
    const [platformPDA] = FranchiseProgram.findPlatformPDA();

    // Get investor's associated token account
    const investorTokenAccount = await getAssociatedTokenAddress(
      franchiseTokenMintPDA,
      this.provider.wallet.publicKey
    );

    const tx = await this.program.methods
      .investInFranchise(sharesToBuy)
      .accounts({
        franchise: franchisePDA,
        franchiseTokenMint: franchiseTokenMintPDA,
        investorTokenAccount: investorTokenAccount,
        franchiseVault: franchiseVaultPDA,
        platformVault: platformVaultPDA,
        platform: platformPDA,
        investor: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Distribute revenue (franchise owner only)
  async distributeRevenue(
    businessSlug: string,
    franchiseSlug: string,
    totalRevenue: number
  ): Promise<string> {
    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);
    const [franchisePDA] = FranchiseProgram.findFranchisePDA(businessPDA, franchiseSlug);

    const tx = await this.program.methods
      .distributeRevenue(new BNClass(Math.floor(totalRevenue)))
      .accounts({
        franchise: franchisePDA,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // Claim dividends (investor)
  async claimDividends(
    businessSlug: string,
    franchiseSlug: string
  ): Promise<string> {
    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);
    const [franchisePDA] = FranchiseProgram.findFranchisePDA(businessPDA, franchiseSlug);
    const [franchiseTokenMintPDA] = FranchiseProgram.findFranchiseTokenMintPDA(businessPDA, franchiseSlug);
    const [franchiseVaultPDA] = FranchiseProgram.findFranchiseVaultPDA(franchisePDA);

    // Get investor's associated token account
    const investorTokenAccount = await getAssociatedTokenAddress(
      franchiseTokenMintPDA,
      this.provider.wallet.publicKey
    );

    const tx = await this.program.methods
      .claimDividends()
      .accounts({
        franchise: franchisePDA,
        investorTokenAccount: investorTokenAccount,
        franchiseVault: franchiseVaultPDA,
        investor: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // Get franchise account data
  async getFranchise(businessSlug: string, franchiseSlug: string) {
    // Check if we're in mock mode
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('Using mock data for franchise fetch');
      // Return mock franchise data
      return {
        businessSlug,
        franchiseSlug,
        locationAddress: 'Mock Location',
        buildingName: 'Mock Building',
        carpetArea: 1000,
        costPerArea: 100,
        totalShares: 1000,
        // Add other mock fields as needed
      };
    }

    if (!this.program) {
      throw new Error('Anchor program not initialized - cannot fetch franchise data');
    }

    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);
    const [franchisePDA] = FranchiseProgram.findFranchisePDA(businessPDA, franchiseSlug);

    return await this.program.account.franchise.fetch(franchisePDA);
  }

  // Get business account data
  async getBusiness(businessSlug: string) {
    // Check if we're in mock mode
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('Using mock data for business fetch');
      // Return mock business data
      return {
        slug: businessSlug,
        name: 'Mock Business',
        industry: 'Mock Industry',
        category: 'Mock Category',
        // Add other mock fields as needed
      };
    }

    if (!this.program) {
      throw new Error('Anchor program not initialized - cannot fetch business data');
    }

    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);

    return await this.program.account.business.fetch(businessPDA);
  }

  // Get platform account data
  async getPlatform() {
    const [platformPDA] = FranchiseProgram.findPlatformPDA();
    
    return await this.program.account.platform.fetch(platformPDA);
  }

  // Get investor's token balance for a franchise
  async getInvestorTokenBalance(
    businessSlug: string,
    franchiseSlug: string,
    investorPubkey: PublicKey
  ): Promise<number> {
    const [businessPDA] = FranchiseProgram.findBusinessPDA(businessSlug);
    const [franchiseTokenMintPDA] = FranchiseProgram.findFranchiseTokenMintPDA(businessPDA, franchiseSlug);

    try {
      const investorTokenAccount = await getAssociatedTokenAddress(
        franchiseTokenMintPDA,
        investorPubkey
      );

      const tokenAccount = await this.provider.connection.getTokenAccountBalance(investorTokenAccount);
      return parseInt(tokenAccount.value.amount);
    } catch (error) {
      // Token account doesn't exist, so balance is 0
      return 0;
    }
  }
}

// Helper function to validate IDL and PROGRAM_ID
export function validateAnchorSetup(): { isValid: boolean; error?: string } {
  try {
    // First check if Anchor is available
    if (!isAnchorAvailable) {
      return { isValid: false, error: 'Anchor framework is not available or not functional' };
    }

    if (!IDL) {
      return { isValid: false, error: 'IDL is not defined' };
    }
    if (!PROGRAM_ID) {
      return { isValid: false, error: 'PROGRAM_ID is not defined' };
    }
    if (!IDL.name || !IDL.version) {
      return { isValid: false, error: 'IDL is missing required fields (name or version)' };
    }

    // Check Program class availability
    if (typeof Program === 'undefined') {
      return { isValid: false, error: 'Program class is not available' };
    }

    // Validate BN is available
    if (!BNClass) {
      return { isValid: false, error: 'BN (BigNumber) is not available' };
    }

    // Test BN functionality
    try {
      const testBN = new BNClass(100);
      if (!testBN || typeof testBN.toNumber !== 'function') {
        return { isValid: false, error: 'BN is not functioning correctly' };
      }
    } catch (bnError) {
      return { isValid: false, error: `BN initialization failed: ${bnError instanceof Error ? bnError.message : 'Unknown BN error'}` };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Helper function to create program instance
export function createFranchiseProgram(provider: AnchorProvider): FranchiseProgram | null {
  try {
    // Check if we're in mock mode
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('Creating franchise program in mock mode');
      // In mock mode, we can create the program even without proper Anchor setup
      return new FranchiseProgram(provider);
    }

    // Validate setup first for non-mock mode
    const validation = validateAnchorSetup();
    if (!validation.isValid) {
      console.error('Anchor setup validation failed:', validation.error);
      return null;
    }

    return new FranchiseProgram(provider);
  } catch (error) {
    console.error('Failed to create franchise program:', error);
    return null;
  }
}

// Types for frontend use
export type FranchiseStatus = 'Funding' | 'Launching' | 'Active' | 'Paused' | 'Closed';
export type VerificationTier = 'Unverified' | 'Basic' | 'Full';

export interface FranchiseAccount {
  business: PublicKey;
  owner: PublicKey;
  slug: string;
  locationAddress: string;
  buildingName: string;
  carpetArea: number;
  costPerArea: typeof BNClass;
  totalInvestment: typeof BNClass;
  totalShares: number;
  soldShares: number;
  totalRaised: typeof BNClass;
  capitalRecovered: typeof BNClass;
  totalRevenue: typeof BNClass;
  pendingDividends: typeof BNClass;
  status: FranchiseStatus;
  tokenMint: PublicKey;
  createdAt: typeof BNClass;
  lastPayout: typeof BNClass;
  bump: number;
}

export interface BusinessAccount {
  owner: PublicKey;
  name: string;
  slug: string;
  industry: string;
  category: string;
  verificationTier: VerificationTier;
  totalFranchises: number;
  totalInvestment: typeof BNClass;
  createdAt: typeof BNClass;
  bump: number;
}
