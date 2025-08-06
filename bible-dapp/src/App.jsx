import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BookOpen, Coins, Calendar, Wallet, CheckCircle, Leaf, Globe, X } from 'lucide-react';
import { 
  createNetworkConfig, 
  SuiClientProvider, 
  WalletProvider,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  ConnectButton,
  useCurrentWallet
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

// Network configuration
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
});

const queryClient = new QueryClient();

// Sui configuration - Use environment variables with fallbacks
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
const TREASURY_ID = import.meta.env.VITE_TREASURY_ID;
const CLAIMS_ID = import.meta.env.VITE_CLAIMS_ID;
const PROGRESS_REGISTRY_ID = import.meta.env.VITE_PROGRESS_REGISTRY_ID;
const ADMIN_CAP_ID = import.meta.env.VITE_ADMIN_CAP_ID;

// Language Support (only English for now, but structure kept)
const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
};

// Translations
const TRANSLATIONS = {
  en: {
    siteTitle: 'Blockchain Bible Study',
    todaysVerse: 'Today\'s Verse',
    connected: 'Connected',
    connectWalletButton: 'Connect Wallet',
    claimTodaysBible: 'Claim Today\'s $BIBLESTUDY ✨',
    claiming: 'Claiming...',
    alreadyClaimedToday: 'Already Claimed Today',
    weeklyProgress: 'Weekly Progress',
    monthlyProgress: 'Monthly Progress',
    yearlyProgress: 'Yearly Progress',
    about: 'About',
    tokenomics: 'Tokenomics',
    help: 'Help',
    reset: 'Reset',
    completed: 'Completed',
    missed: 'Missed',
    available: 'Available',
    future: 'Future',
    wallet: 'Wallet',
    gasBalance: 'Gas Balance',
    gasLow: 'Low Gas Balance',
    gasNeeded: 'Please add testnet SUI to your wallet',
    getFreeGas: 'Get Free Testnet SUI',
    sufficientGas: 'Sufficient gas for transactions',
    verifyingClaim: 'Verifying claim status...',
    nextClaimAvailable: 'Next claim available tomorrow',
    alreadyClaimedMessage: 'Come back tomorrow for another blessing!',
    testnetDisclaimer: 'This app runs on Sui Testnet',
    testnetExplainer: 'Testnet tokens have no real value - they\'re for testing only!',
    claimedAmountToday: 'Earned {amount} $BIBLESTUDY today!',
    loadingVerse: 'Loading your daily verse...',
    verseError: 'Unable to load verse. Please try again.',
    retryVerse: 'Retry',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  }
};

// Modal translations
const MODAL_TRANSLATIONS = {
  en: {
    aboutBible: 'About Blockchain Bible Study',
    whatIsBible: 'What is Blockchain Bible Study?',
    whatIsBibleText: 'A daily Bible study app that rewards you with $BIBLESTUDY tokens for claiming your daily verse. Embed God\'s word in your heart and track your progress on Sui blockchain!',
    whereIsBible: 'Where does it live?',
    whereIsBibleText: 'On the Sui blockchain for secure, immutable storage of your study progress and verse references.',
    whenCanClaim: 'When can I claim?',
    whenCanClaimText: 'Once every 24 hours, alongside your daily verse.',
    whyBible: 'Why Blockchain Bible Study?',
    whyBibleText: 'To combine eternal truth with modern technology, tracking your spiritual journey on-chain.',
    whatsNext: 'What\'s next?',
    whatsNextText: 'Build your streak for greater rewards and deeper study!',
    contractAddress: 'Smart Contract Address',
    tokenomics: 'Tokenomics',
    totalSupplyTitle: 'Total Supply',
    totalSupply: '10,000,000,000,000 $BIBLESTUDY',
    fixedSupply: 'Fixed Supply - No Inflation',
    allocationBreakdown: 'Allocation Breakdown',
    dailyClaims: 'Daily Claims (100%)',
    helpTitle: 'Help & Support',
    switchToTestnet: 'Switch to Sui Testnet',
    switchToTestnetText: 'This app runs on Sui Testnet. Please switch your wallet.',
    needTestnetSui: 'Need Testnet SUI?',
    needTestnetSuiText: 'Use the faucet for free testnet SUI.',
    troubleshooting: 'Troubleshooting',
    troubleshootingText: 'Refresh or reconnect wallet if issues.',
  }
};

// Nature background without animations
const NatureBackground = () => {
  const generateLeaves = () => {
    const leaves = [];
    for (let i = 0; i < 50; i++) {
      const leafStyle = {
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: '10px',
        height: '20px',
        background: 'rgba(34, 139, 34, 0.8)',
        borderRadius: '50% 0',
        opacity: 0.3
      };
      leaves.push(<div key={i} style={leafStyle} />);
    }
    return leaves;
  };

  const leaves = useMemo(generateLeaves, []);

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      zIndex: 0,
      background: 'linear-gradient(to bottom, #f0f8ff 0%, #f0f8ff 50%, #f5f5dc 100%)',
    }}>
      <div>
        {leaves}
      </div>
    </div>
  );
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-aliceblue text-gray-800 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 rounded-xl p-6 border border-red-200">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">Please refresh to try again.</p>
              <button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Spinner
const LoadingSpinner = ({ size = "h-5 w-5" }) => (
  <div className={`animate-spin rounded-full ${size} border-2 border-blue-500 border-t-transparent`}></div>
);

// BCS Parsing Functions
function parseULEB128(bytes, offset) {
  let value = 0;
  let shift = 0;
  while (true) {
    const byte = bytes[offset];
    value |= (byte & 0x7f) << shift;
    offset++;
    shift += 7;
    if ((byte & 0x80) === 0) break;
  }
  return {value, offset};
}

function parseU8(bytes, offset) {
  return {value: bytes[offset], offset: offset + 1};
}

function parseU64(bytes, offset) {
  let value = 0n;
  for (let i = 0; i < 8; i++) {
    value |= BigInt(bytes[offset + i]) << BigInt(i * 8);
  }
  return {value: Number(value), offset: offset + 8};
}

function parseVectorU8(bytes, offset) {
  const {value: len, offset: newOffset} = parseULEB128(bytes, offset);
  const data = bytes.slice(newOffset, newOffset + len);
  return {value: data, offset: newOffset + len};
}

function parseDailyClaimInfo(bytes, offset) {
  const {value: day_of_week, offset: o1} = parseU8(bytes, offset);
  const {value: amount_claimed, offset: o2} = parseU64(bytes, o1);
  const {value: timestamp, offset: o3} = parseU64(bytes, o2);
  const {value: verse_reference, offset: o4} = parseVectorU8(bytes, o3);
  const {value: claim_day, offset: o5} = parseU64(bytes, o4);
  const {value: streak_at_claim, offset: o6} = parseU64(bytes, o5);
  return {
    value: {
      day_of_week,
      amount_claimed,
      timestamp,
      verse_reference,
      claim_day,
      streak_at_claim
    },
    offset: o6
  };
}

function parseBCSBytes(bytes) {
  if (!Array.isArray(bytes) || bytes.length === 0) return [];
  
  let offset = 0;
  const {value: length, offset: newOffset} = parseULEB128(bytes, offset);
  offset = newOffset;
  const infos = [];
  for (let i = 0; i < length; i++) {
    const {value, offset: o} = parseDailyClaimInfo(bytes, offset);
    infos.push(value);
    offset = o;
  }
  return infos;
}

// Sui Time
const useSuiTime = () => {
  const [suiTimeData, setSuiTimeData] = useState({
    timestamp: null,
    dayOfWeek: null,
    currentDay: null,
    weekNumber: null,
    year: null,
    isLoaded: false,
    error: null
  });

  const getSuiTime = async (suiClient) => {
    try {
      const clockObject = await suiClient.getObject({
        id: '0x6',
        options: { showContent: true }
      });
      const timestampMs = parseInt(clockObject.data.content.fields.timestamp_ms);
      const timestampSeconds = Math.floor(timestampMs / 1000);
      const daysSinceEpoch = Math.floor(timestampSeconds / 86400);
      const dayOfWeek = (daysSinceEpoch + 4) % 7;
      const daysSinceSunday = (daysSinceEpoch + 4) % 7;
      const sundayOfCurrentWeek = daysSinceEpoch - daysSinceSunday;
      const weekNumber = Math.floor(sundayOfCurrentWeek / 7);
      const yearsSince2024 = Math.floor((daysSinceEpoch - 19723) / 365);
      const year = 2024 + yearsSince2024;
      
      const timeData = {
        timestamp: timestampMs,
        dayOfWeek,
        currentDay: daysSinceEpoch,
        weekNumber,
        year,
        isLoaded: true,
        error: null
      };
      setSuiTimeData(timeData);
      return timeData;
    } catch (error) {
      const utcNow = new Date();
      const utcTimestamp = utcNow.getTime();
      const utcSeconds = Math.floor(utcTimestamp / 1000);
      const utcDaysSinceEpoch = Math.floor(utcSeconds / 86400);
      const utcDayOfWeek = (utcDaysSinceEpoch + 4) % 7;
      const daysSinceSunday = (utcDaysSinceEpoch + 4) % 7;
      const sundayOfCurrentWeek = utcDaysSinceEpoch - daysSinceSunday;
      const weekNumber = Math.floor(sundayOfCurrentWeek / 7);
      const yearsSince2024 = Math.floor((utcDaysSinceEpoch - 19723) / 365);
      const year = 2024 + yearsSince2024;
      
      const fallbackData = {
        timestamp: utcTimestamp,
        dayOfWeek: utcDayOfWeek,
        currentDay: utcDaysSinceEpoch,
        weekNumber,
        year,
        isLoaded: true,
        error: error.message
      };
      setSuiTimeData(fallbackData);
      return fallbackData;
    }
  };

  return { suiTimeData, getSuiTime };
};

// Gas Manager
const GasManager = ({ currentAccount, suiClient, t }) => {
  const [gasBalance, setGasBalance] = useState(null);
  const [isRequestingGas, setIsRequestingGas] = useState(false);
  const [gasStatus, setGasStatus] = useState('checking');

  const MIN_GAS_BALANCE = 50_000_000;

  const checkGasBalance = async () => {
    if (!currentAccount?.address) return;
    try {
      const balance = await suiClient.getBalance({
        owner: currentAccount.address,
        coinType: '0x2::sui::SUI'
      });
      const totalBalance = parseInt(balance.totalBalance);
      setGasBalance(totalBalance);
      setGasStatus(totalBalance >= MIN_GAS_BALANCE ? 'sufficient' : 'low');
    } catch (error) {
      setGasStatus('low');
    }
  };

  const requestTestnetGas = async () => {
    if (!currentAccount?.address || isRequestingGas) return;
    setIsRequestingGas(true);
    try {
      window.open('https://faucet.testnet.sui.io/', '_blank');
      alert(`Testnet Faucet opened! Paste your address: ${currentAccount.address}`);
      setTimeout(() => {
        checkGasBalance();
        setIsRequestingGas(false);
      }, 5000);
    } catch (error) {
      alert('Failed to open faucet');
      setIsRequestingGas(false);
    }
  };

  const formatSuiAmount = (amount) => amount ? (amount / 1_000_000_000).toFixed(4) : '0';

  useEffect(() => {
    if (currentAccount?.address) checkGasBalance();
    else {
      setGasBalance(null);
      setGasStatus('checking');
    }
  }, [currentAccount?.address]);

  if (!currentAccount) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
        <span style={{ color: '#4a5568' }}>{t('gasBalance')}:</span>
        <span style={{ color: gasStatus === 'sufficient' ? '#3182ce' : '#e53e3e' }}>
          {gasBalance !== null ? `${formatSuiAmount(gasBalance)} SUI` : 'Loading...'}
        </span>
      </div>

      {gasStatus === 'low' && (
        <div style={{ backgroundColor: '#fed7d7', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid #feb2b2' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#e53e3e', fontWeight: '600', fontSize: '0.875rem' }}>{t('gasLow')}</p>
            <p style={{ color: '#f56565', fontSize: '0.75rem' }}>{t('gasNeeded')}</p>
            <button
              onClick={requestTestnetGas}
              disabled={isRequestingGas}
              style={{ 
                backgroundColor: '#4299e1', 
                color: 'white', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                transition: 'all 0.3s ease', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                margin: '0 auto',
                border: 'none',
                cursor: isRequestingGas ? 'default' : 'pointer',
                opacity: isRequestingGas ? 0.5 : 1
              }}
              onMouseEnter={(e) => !isRequestingGas && (e.target.style.backgroundColor = '#2b6cb0')}
              onMouseLeave={(e) => !isRequestingGas && (e.target.style.backgroundColor = '#4299e1')}
            >
              {isRequestingGas ? (
                <>
                  <LoadingSpinner size="h-4 w-4" />
                  <span>Opening faucet...</span>
                </>
              ) : (
                <span>{t('getFreeGas')}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {gasStatus === 'sufficient' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#3182ce', fontSize: '0.75rem' }}>{t('sufficientGas')}</p>
        </div>
      )}
    </div>
  );
};

// Custom Connect Button
const CustomConnectButton = ({ t }) => {
  const currentAccount = useCurrentAccount();
  
  if (currentAccount) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'rgba(66, 153, 225, 0.1)', border: '1px solid rgba(66, 153, 225, 0.2)', color: '#3182ce', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.5rem', backdropFilter: 'blur(2px)' }}>
          {t('connected')}: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div className="connect-wallet-nature">
        <ConnectButton 
          connectText={t('connectWalletButton')}
        />
      </div>
    </div>
  );
};

// Language Selector (kept but only en)
const LanguageSelector = ({ currentLanguage, onLanguageChange, textColor = "text-gray-600" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: textColor === "text-gray-600" ? '#4a5568' : '#718096', transition: 'color 0.3s ease', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none' }}
        onMouseEnter={(e) => e.target.style.color = '#2d3748'}
        onMouseLeave={(e) => e.target.style.color = textColor === "text-gray-600" ? '#4a5568' : '#718096'}
      >
        <Globe style={{ height: '1rem', width: '1rem' }} />
        <span>{LANGUAGES[currentLanguage]?.flag}</span>
        <span>{LANGUAGES[currentLanguage]?.name}</span>
      </button>
      
      {isOpen && (
        <div 
          style={{ position: 'absolute', bottom: '100%', marginBottom: '0.5rem', left: 0, backgroundColor: 'white', backdropFilter: 'blur(2px)', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', minWidth: 'max-content', zIndex: 50 }}
          onMouseLeave={() => setIsOpen(false)}
        >
          {Object.entries(LANGUAGES).map(([code, language]) => (
            <button
              key={code}
              onClick={() => {
                onLanguageChange(code);
                setIsOpen(false);
              }}
              style={{ width: '100%', padding: '0.5rem 1rem', textAlign: 'left', transition: 'background-color 0.3s ease', color: '#2d3748', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f7fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function BibleApp() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const { suiTimeData, getSuiTime } = useSuiTime();
  
  const [weeklyProgressByDay, setWeeklyProgressByDay] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTokenomics, setShowTokenomics] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [autoSigningProgress, setAutoSigningProgress] = useState(false);
  const [language, setLanguage] = useState('en');
  
  const [blockchainClaimStatus, setBlockchainClaimStatus] = useState('checking');
  const [isVerifyingClaim, setIsVerifyingClaim] = useState(false);
  const [todaysClaimAmount, setTodaysClaimAmount] = useState(0);

  const [verseData, setVerseData] = useState(null);
  const [verseLoading, setVerseLoading] = useState(false);
  const [verseError, setVerseError] = useState(null);

  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showYearlyModal, setShowYearlyModal] = useState(false);
  const [monthlyClaims, setMonthlyClaims] = useState([]);
  const [yearlyClaims, setYearlyClaims] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  const t = (key, replacements = {}) => {
    let translation = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
    Object.keys(replacements).forEach(placeholder => {
      translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    return translation;
  };

  const mt = (key) => {
    return MODAL_TRANSLATIONS[language]?.[key] || MODAL_TRANSLATIONS.en[key] || key;
  };

  const fetchVerse = async () => {
    setVerseLoading(true);
    setVerseError(null);
    setVerseData(null);
    
    try {
      // Step 1: Fetch only the reference from OurManna (discard text/version)
      const mannaResponse = await fetch('https://beta.ourmanna.com/api/v1/get?format=json');
      if (!mannaResponse.ok) throw new Error('OurManna API request failed');
      const mannaData = await mannaResponse.json();
      const verseReference = mannaData.verse.details.reference; // Only extract reference

      // Step 2: Use reference to fetch KJV from Bible-API
      const encodedRef = verseReference.replace(/ /g, '%20');
      const bibleResponse = await fetch(`https://bible-api.com/${encodedRef}?translation=kjv`);
      if (!bibleResponse.ok) throw new Error('Bible-API request failed');
      const bibleData = await bibleResponse.json();

      // Set verseData to KJV only (reference is the same, but text/version are from KJV)
      setVerseData({
        text: bibleData.text,
        reference: bibleData.reference,
        version: bibleData.translation_name || 'KJV'
      });
    } catch (error) {
      console.error('Failed to fetch verse:', error);
      setVerseError(error.message);
    } finally {
      setVerseLoading(false);
    }
  };

  const getCurrentVerse = () => {
    if (verseLoading) return t('loadingVerse');
    if (verseError) return t('verseError');
    if (!verseData) return 'Select a Bible verse to see your daily reading.';
    return `${verseData.text} (${verseData.reference}, ${verseData.version})`;
  };

  const retryVerse = () => {
    fetchVerse();
  };

  const getCurrentDayOfWeek = () => {
    if (suiTimeData.isLoaded && suiTimeData.dayOfWeek !== null) return suiTimeData.dayOfWeek;
    const utcDate = new Date();
    const utcTimestamp = utcDate.getTime();
    const utcSeconds = Math.floor(utcTimestamp / 1000);
    const utcDaysSinceEpoch = Math.floor(utcSeconds / 86400);
    return (utcDaysSinceEpoch + 4) % 7;
  };

  const getDateForDayOfWeek = (dayOfWeek) => {
    if (!suiTimeData.isLoaded || suiTimeData.timestamp === null || suiTimeData.dayOfWeek === null) {
      const today = new Date();
      const utcToday = new Date(today.getTime() + (today.getTimezoneOffset() * 60000));
      const currentDayOfWeek = (Math.floor(utcToday.getTime() / (1000 * 86400)) + 4) % 7;
      const diff = dayOfWeek - currentDayOfWeek;
      const targetDate = new Date(utcToday);
      targetDate.setDate(utcToday.getDate() + diff);
      return targetDate.toISOString().split('T')[0];
    }
    const suiDate = new Date(suiTimeData.timestamp);
    const currentSuiDayOfWeek = suiTimeData.dayOfWeek;
    const diff = dayOfWeek - currentSuiDayOfWeek;
    const targetDate = new Date(suiDate);
    targetDate.setDate(suiDate.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const getDayName = (dayIndex) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(dayKeys[dayIndex]);
  };

  const calculateDailyReward = (dayCount) => {
    const baseReward = 10;
    const streakBonus = Math.floor(dayCount / 3) * 5;
    return baseReward + streakBonus;
  };

  const getDailyStreak = () => {
    return Object.keys(weeklyProgressByDay).length;
  };

  const isTodayCompleted = () => {
    const currentDayOfWeek = getCurrentDayOfWeek();
    const hasProgressToday = weeklyProgressByDay[currentDayOfWeek];
    return blockchainClaimStatus === 'claimed' || !!hasProgressToday;
  };

  const checkBlockchainClaimStatus = async (silent = false) => {
    if (!currentAccount?.address) {
      setBlockchainClaimStatus('checking');
      return;
    }

    if (!silent) {
      setIsVerifyingClaim(true);
    }
    
    try {
      const currentSuiTime = await getSuiTime(suiClient);
      
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: (() => {
          const txb = new Transaction();
          txb.moveCall({
            target: `${PACKAGE_ID}::biblestudy::has_claimed_today`,
            arguments: [
              txb.object(CLAIMS_ID),
              txb.object('0x6'),
              txb.pure.address(currentAccount?.address)
            ]
          });
          return txb;
        })(),
        sender: currentAccount?.address,
      });

      let hasClaimed = false;
      
      if (result.results && result.results[0] && result.results[0].returnValues && result.results[0].returnValues[0]) {
        const returnValue = result.results[0].returnValues[0];
        if (Array.isArray(returnValue) && returnValue.length >= 2) {
          const dataArray = returnValue[0];
          if (Array.isArray(dataArray) && dataArray.length > 0) {
            hasClaimed = dataArray[0] === 1;
          }
        }
      }
      
      setBlockchainClaimStatus(hasClaimed ? 'claimed' : 'not_claimed');
    } catch (error) {
      console.error('Failed to check claim status:', error);
      setBlockchainClaimStatus('not_claimed');
    }
    
    if (!silent) {
      setIsVerifyingClaim(false);
    }
  };

  const loadWeeklyProgress = async () => {
    if (!currentAccount?.address) {
      setWeeklyProgressByDay({});
      return;
    }
    
    setIsLoading(true);
    try {
      const currentSuiTime = await getSuiTime(suiClient);
      
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: (() => {
          const txb = new Transaction();
          txb.moveCall({
            target: `${PACKAGE_ID}::biblestudy::get_weekly_progress`,
            arguments: [
              txb.object(PROGRESS_REGISTRY_ID),
              txb.pure.address(currentAccount?.address),
              txb.object('0x6'),
            ]
          });
          return txb;
        })(),
        sender: currentAccount?.address,
      });
      
      const weeklyData = parseWeeklyProgressResult(result);
      const promises = Object.keys(weeklyData).map(async (key) => {
        const item = weeklyData[key];
        let verseText = '';
        let version = '';
        try {
          const ref = item.verseReference.replace(/ /g, '%20');
          const response = await fetch(`https://bible-api.com/${ref}?translation=kjv`); // Add ?translation=kjv
          const data = await response.json();
          verseText = data.text || '';
          version = data.translation_name || 'KJV'; // Update default to KJV
        } catch (e) {
          verseText = '';
          version = 'KJV';
        }
        return { key, item: { ...item, verseText, version } };
      });
      const results = await Promise.all(promises);
      const dataWithText = {};
      results.forEach(({key, item}) => dataWithText[key] = item);
      setWeeklyProgressByDay(dataWithText);
    } catch (error) {
      console.error('Failed to load weekly progress:', error);
      setWeeklyProgressByDay({});
    }
    setIsLoading(false);
  };

  const parseWeeklyProgressResult = (result) => {
    try {
      if (result.results && result.results[0] && result.results[0].returnValues && result.results[0].returnValues[0]) {
        const returnValue = result.results[0].returnValues[0];
        if (Array.isArray(returnValue) && returnValue.length >= 2) {
          const bcsBytes = returnValue[0];
          const dailyClaimInfos = parseBCSBytes(bcsBytes);
          if (dailyClaimInfos && Array.isArray(dailyClaimInfos)) {
            const progressByDay = {};
            dailyClaimInfos.forEach(claimInfo => {
              if (claimInfo && typeof claimInfo.day_of_week === 'number') {
                progressByDay[claimInfo.day_of_week] = {
                  dayOfWeek: claimInfo.day_of_week,
                  dailyReward: Math.floor(claimInfo.amount_claimed / 1_000_000),
                  timestamp: claimInfo.timestamp,
                  verseReference: new TextDecoder().decode(new Uint8Array(claimInfo.verse_reference)),
                  claimDay: claimInfo.claim_day,
                  streakAtClaim: claimInfo.streak_at_claim
                };
              }
            });
            return progressByDay;
          }
        }
      }
      return {};
    } catch (error) {
      console.error('Error parsing weekly progress:', error);
      return {};
    }
  };

  const loadProgressForWeek = async (weekNumber) => {
    if (!currentAccount?.address) return [];
    try {
      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: (() => {
          const txb = new Transaction();
          txb.moveCall({
            target: `${PACKAGE_ID}::biblestudy::get_progress_for_week`,
            arguments: [
              txb.object(PROGRESS_REGISTRY_ID),
              txb.pure.address(currentAccount?.address),
              txb.pure.u64(weekNumber),
            ]
          });
          return txb;
        })(),
        sender: currentAccount?.address,
      });
      
      if (result.results && result.results[0] && result.results[0].returnValues && result.results[0].returnValues[0]) {
        const returnValue = result.results[0].returnValues[0];
        if (Array.isArray(returnValue) && returnValue.length >= 2) {
          const bcsBytes = returnValue[0];
          return parseBCSBytes(bcsBytes) || [];
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load week progress:', error);
      return [];
    }
  };

  const loadMonthlyProgress = async (month, year) => {
    setMonthlyLoading(true);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayEpoch = Math.floor(firstDay.getTime() / 86400000);
    const lastDayEpoch = Math.floor(lastDay.getTime() / 86400000);
    const startWeek = Math.floor((firstDayEpoch + 4) / 7);
    const endWeek = Math.floor((lastDayEpoch + 4) / 7);
    
    let claims = [];
    for (let w = startWeek; w <= endWeek; w++) {
      const weekClaims = await loadProgressForWeek(w);
      claims = [...claims, ...weekClaims];
    }
    claims = claims.filter(claim => {
      const claimDate = new Date(claim.claim_day * 86400000);
      return claimDate.getMonth() === month && claimDate.getFullYear() === year;
    });
    const promises = claims.map(async (claim) => {
      const ref = new TextDecoder().decode(new Uint8Array(claim.verse_reference));
      let verseText = '';
      let version = '';
      try {
        const encodedRef = ref.replace(/ /g, '%20');
        const response = await fetch(`https://bible-api.com/${encodedRef}?translation=kjv`); // Add ?translation=kjv
        const data = await response.json();
        verseText = data.text || '';
        version = data.translation_name || 'KJV'; // Update default to KJV
      } catch (e) {
        verseText = '';
        version = 'KJV';
      }
      return { ...claim, verseReference: ref, verseText, version };
    });
    const claimsWithText = await Promise.all(promises);
    setMonthlyClaims(claimsWithText);
    setMonthlyLoading(false);
  };

  const loadYearlyProgress = async (year) => {
    setYearlyLoading(true);
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    const firstDayEpoch = Math.floor(firstDay.getTime() / 86400000);
    const lastDayEpoch = Math.floor(lastDay.getTime() / 86400000);
    const startWeek = Math.floor((firstDayEpoch + 4) / 7);
    const endWeek = Math.floor((lastDayEpoch + 4) / 7);
    
    let claims = [];
    for (let w = startWeek; w <= endWeek; w++) {
      const weekClaims = await loadProgressForWeek(w);
      claims = [...claims, ...weekClaims];
    }
    
    claims = claims.filter(claim => new Date(claim.claim_day * 86400000).getFullYear() === year);
    
    const monthlyCounts = Array(12).fill(0);
    claims.forEach(claim => {
      const date = new Date(claim.claim_day * 86400000);
      monthlyCounts[date.getMonth()]++;
    });
    setYearlyClaims(monthlyCounts);
    setYearlyLoading(false);
  };

  const claimTodaysBible = async () => {
    const hasAlreadyClaimed = isTodayCompleted();
    
    if (hasAlreadyClaimed) {
      alert('You\'ve already claimed your daily $BIBLESTUDY! Come back tomorrow for another blessing!');
      return;
    }
    
    if (!verseData || !verseData.reference) {
      alert('Please wait for the verse to load or retry.');
      return;
    }
    
    setAutoSigningProgress(true);
    
    try {
      const currentSuiTime = await getSuiTime(suiClient);
      const currentStreak = getDailyStreak();
      const dailyReward = calculateDailyReward(currentStreak + 1);
      const amount = dailyReward * 1_000_000;
      
      const treasuryObject = await suiClient.getObject({
        id: TREASURY_ID,
        options: { showContent: true, showType: true }
      });
      
      const claimsObject = await suiClient.getObject({
        id: CLAIMS_ID,
        options: { showContent: true, showType: true }
      });

      const progressObject = await suiClient.getObject({
        id: PROGRESS_REGISTRY_ID,
        options: { showContent: true, showType: true }
      });
      
      if (!claimsObject.data?.type?.includes('DailyClaims')) {
        throw new Error(`Invalid claims object`);
      }
      
      if (!treasuryObject.data?.type?.includes('Treasury')) {
        throw new Error(`Invalid treasury object`);
      }

      if (!progressObject.data?.type?.includes('UserProgressRegistry')) {
        throw new Error(`Invalid progress registry object`);
      }
      
      const verseRefBytes = Array.from(new TextEncoder().encode(verseData.reference));
      
      const txb = new Transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::biblestudy::claim_daily_reward`,
        arguments: [
          txb.object(TREASURY_ID),
          txb.object(CLAIMS_ID),
          txb.object(PROGRESS_REGISTRY_ID),
          txb.object('0x6'),
          txb.pure.u64(amount),
          txb.pure.vector('u8', verseRefBytes)
        ]
      });
      
      const txResult = await signAndExecuteTransaction(
        {
          transaction: txb,
        },
        {
          onSuccess: async (result) => {
            setBlockchainClaimStatus('claimed');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for state propagation
            await loadWeeklyProgress();
            alert(`Daily Claim Complete!\n\n+${dailyReward} $BIBLESTUDY earned today!\nStreak: ${currentStreak + 1} days\n\nTransaction: ${result.digest || 'completed'}`);
          },
          onError: (error) => {
            throw error;
          }
        }
      );
      
      if (txResult) {
        const digest = txResult.digest || 'completed';
        setBlockchainClaimStatus('claimed');
        await loadWeeklyProgress();
        alert(`Daily Claim Complete!\n\n+${dailyReward} $BIBLESTUDY earned today!\nStreak: ${currentStreak + 1} days\n\nTransaction: ${digest}`);
      }
    } catch (error) {
      const errorMessage = error.message || error.toString() || '';
      if (errorMessage.includes('EAlreadyClaimedToday') || errorMessage.includes('Abort(1)')) {
        setBlockchainClaimStatus('claimed');
        alert('You\'ve already claimed today!');
      } else if (errorMessage.includes('EGlobalPeriodLimitExceeded') || errorMessage.includes('Abort(4)')) {
        alert('The daily limit has been reached. Try again later.');
      } else if (errorMessage.includes('Insufficient gas')) {
        alert('Need testnet SUI for gas.');
      } else if (errorMessage.includes('User rejected')) {
        alert('Transaction cancelled.');
      } else {
        alert(`Claim failed: ${errorMessage.slice(0, 100)}...`);
      }
    }
    
    setAutoSigningProgress(false);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('bibleLanguage');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setLanguage(savedLanguage);
    }
    fetchVerse();
  }, []);

  useEffect(() => {
    localStorage.setItem('bibleLanguage', language);
  }, [language]);

  useEffect(() => {
    let statusCheckInterval;
    if (currentAccount?.address) {
      statusCheckInterval = setInterval(async () => {
        try {
          await checkBlockchainClaimStatus(true);
          await loadWeeklyProgress();
        } catch (error) {}
      }, 5000);
    } else {
      setBlockchainClaimStatus('checking');
      setTodaysClaimAmount(0);
      setWeeklyProgressByDay({});
    }
    return () => clearInterval(statusCheckInterval);
  }, [currentAccount?.address]);

  useEffect(() => {
    if (currentAccount?.address) {
      getSuiTime(suiClient).then(() => {
        checkBlockchainClaimStatus();
        loadWeeklyProgress();
      }).catch(() => {
        checkBlockchainClaimStatus();
        loadWeeklyProgress();
      });
    }
  }, [currentAccount?.address]);

  useEffect(() => {
    if (currentAccount) {
      const currentDayOfWeek = getCurrentDayOfWeek();
      const todaysProgress = weeklyProgressByDay[currentDayOfWeek];
      
      if (blockchainClaimStatus === 'claimed' || todaysProgress) {
        if (todaysProgress && todaysProgress.dailyReward) {
          setTodaysClaimAmount(todaysProgress.dailyReward);
        } else {
          const currentStreak = getDailyStreak();
          const estimatedAmount = calculateDailyReward(currentStreak + 1);
          setTodaysClaimAmount(estimatedAmount);
        }
      } else {
        setTodaysClaimAmount(0);
      }
    }
  }, [blockchainClaimStatus, weeklyProgressByDay, suiTimeData]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const formatCurrentDate = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(now);
  };

  const appStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f0f8ff 0%, #f0f8ff 50%, #f5f5dc 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'serif',
    color: '#2d3748'
  };

  return (
    <>
      <div style={appStyle}>
        <style>
          {`
            .connect-wallet-nature .wallet-adapter-button {
              background: linear-gradient(45deg, #4299e1, #63b3ed) !important;
              border: none !important;
              padding: 12px 25px !important;
              border-radius: 20px !important;
              color: white !important;
              font-weight: bold !important;
              transition: all 0.3s ease !important;
            }
            
            .connect-wallet-nature .wallet-adapter-button:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 10px 25px rgba(66, 153, 225, 0.4) !important;
            }

            .tooltip {
              position: relative;
              display: block;
              width: 100%;
            }

            .tooltip .tooltiptext {
              visibility: hidden;
              width: 300px;
              background-color: #555;
              color: #fff;
              text-align: center;
              border-radius: 6px;
              padding: 5px 10px;
              position: absolute;
              z-index: 1;
              bottom: 125%; 
              left: 90%;
              margin-left: -180px;
              opacity: 0;
              transition: opacity 0.3s;
            }

            .tooltip .tooltiptext::after {
              content: "";
              position: absolute;
              top: 100%;
              left: 50%;
              margin-left: -5px;
              border-width: 5px;
              border-style: solid;
              border-color: #555 transparent transparent transparent;
            }

            .tooltip:hover .tooltiptext {
              visibility: visible;
              opacity: 1;
            }
          `}
        </style>
        
        <NatureBackground />
        
        <div style={{ 
          zIndex: 1, 
          position: 'relative', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '20px'
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Leaf style={{ height: '48px', width: '48px', color: '#4299e1', marginRight: '12px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #2b6cb0, #4299e1)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('siteTitle')}
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <CustomConnectButton t={t} />
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '2rem', color: '#2b6cb0' }}>
                    Daily Reading
                  </h2>
                </div>
                <div style={{ fontSize: '1.5rem', color: '#718096' }}>
                  {formatCurrentDate()}
                </div>
              </div>
              
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h3 style={{ color: '#4299e1', marginBottom: '1rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('todaysVerse')}
                  {verseLoading && (
                    <LoadingSpinner size="h-4 w-4" />
                  )}
                </h3>
                <p style={{ 
                  lineHeight: '1.6', 
                  fontSize: '1.1rem', 
                  color: verseLoading ? '#a0aec0' : '#2d3748',
                  fontStyle: verseLoading ? 'italic' : 'normal',
                  minHeight: '3rem'
                }}>
                  {getCurrentVerse()}
                </p>
                {verseError && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    backgroundColor: '#fed7d7', 
                    border: '1px solid #feb2b2', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: '#9b2c2c',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <p style={{ margin: 0 }}>Failed to load verse</p>
                    <button
                      onClick={retryVerse}
                      disabled={verseLoading}
                      style={{
                        backgroundColor: verseLoading ? '#e53e3e' : '#f56565',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: verseLoading ? 'default' : 'pointer',
                        fontWeight: '600',
                        opacity: verseLoading ? 0.5 : 1
                      }}
                    >
                      {t('retryVerse')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!currentAccount && (
              <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌿</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '1rem' }}>Connect Your Wallet</h3>
                <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
                  Connect your Sui wallet to claim $BIBLESTUDY tokens and track your progress.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <CustomConnectButton t={t} />
                </div>
                <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                  <h4>{t('testnetDisclaimer')}</h4>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{t('testnetExplainer')}</p>
                </div>
              </div>
            )}

            {currentAccount && (
              <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0' }}>{t('weeklyProgress')}</h2>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{getDailyStreak()}/7</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', marginTop: '0.5rem' }}>
                  {[...Array(7)].map((_, i) => {
                    const isToday = i === getCurrentDayOfWeek();
                    const isPastDay = i < getCurrentDayOfWeek();
                    const dayProgress = weeklyProgressByDay[i];
                    const isTodayCompletedFlag = isToday && (blockchainClaimStatus === 'claimed' || !!dayProgress);
                    
                    let bgColor, label, topText, topTextColor;
                    
                    if (dayProgress || isTodayCompletedFlag) {
                      bgColor = '#4299e1';
                      label = '✓';
                      topText = todaysClaimAmount > 0 ? `+${todaysClaimAmount}` : '+10';
                      topTextColor = '#2b6cb0';
                    } else if (isPastDay) {
                      bgColor = '#e53e3e';
                      label = '✗';
                      topText = '+0';
                      topTextColor = '#c53030';
                    } else if (isToday && blockchainClaimStatus === 'not_claimed') {
                      bgColor = '#ecc94b';
                      label = '!';
                      topText = 'Today';
                      topTextColor = '#b7791f';
                    } else {
                      bgColor = '#e2e8f0';
                      label = '';
                      topText = '🌿';
                      topTextColor = '#718096';
                    }
                    
                    const barDiv = (
                      <div style={{ width: '100%', height: '1rem', borderRadius: '0.5rem', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {label && (
                          <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>{label}</span>
                        )}
                      </div>
                    );

                    return (
                      <div key={i} style={{ flex: 1, position: 'relative', padding: '0.5rem 0' }}>
                        {topText && (
                          <div style={{ position: 'absolute', top: '-1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: topTextColor, whiteSpace: 'nowrap', fontWeight: '600' }}>
                            {topText}
                          </div>
                        )}
                        <div className={dayProgress ? "tooltip" : ""} style={{ width: '100%' }}>
                          {barDiv}
                          {dayProgress && <span className="tooltiptext">{`${dayProgress.verseText}`}<br/>{`(${dayProgress.verseReference}, ${dayProgress.version})`}</span>}
                        </div>
                        <div style={{ position: 'absolute', bottom: '-1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', whiteSpace: 'nowrap', color: isToday ? '#2b6cb0' : '#718096', fontWeight: isToday ? '600' : 'normal' }}>
                          {getDayName(i).slice(0, 3)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#4299e1', borderRadius: '50%' }}></div>
                    <span style={{ color: '#2d3748' }}>{t('completed')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#e53e3e', borderRadius: '50%' }}></div>
                    <span style={{ color: '#2d3748' }}>{t('missed')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#ecc94b', borderRadius: '50%' }}></div>
                    <span style={{ color: '#2d3748' }}>{t('available')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#e2e8f0', borderRadius: '50%' }}></div>
                    <span style={{ color: '#2d3748' }}>{t('future')}</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(() => {
                    const hasAlreadyClaimed = isTodayCompleted();
                    const isCheckingStatus = isVerifyingClaim && blockchainClaimStatus === 'checking';
                    const isCurrentlyClaiming = autoSigningProgress;
                    
                    if (hasAlreadyClaimed) {
                      return (
                        <>
                          <button
                            disabled={true}
                            style={{ backgroundColor: '#e2e8f0', color: '#718096', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', cursor: 'not-allowed', border: 'none' }}
                          >
                            <span>✅ {todaysClaimAmount > 0 ? t('claimedAmountToday', { amount: todaysClaimAmount }) : 'Already Claimed Today'}</span>
                          </button>
                          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <p style={{ color: '#3182ce', fontSize: '0.875rem' }}>{t('alreadyClaimedMessage')}</p>
                            <p style={{ color: '#718096', fontSize: '0.75rem' }}>{t('nextClaimAvailable')}</p>
                          </div>
                        </>
                      );
                    } else if (isCheckingStatus) {
                      return (
                        <>
                          <button
                            disabled={true}
                            style={{ backgroundColor: '#e2e8f0', color: '#718096', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', border: 'none' }}
                          >
                            <LoadingSpinner size="h-4 w-4" />
                            <span>{t('verifyingClaim')}</span>
                          </button>
                          <p style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center' }}>
                            Checking blockchain status...
                          </p>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <button
                            onClick={claimTodaysBible}
                            disabled={isCurrentlyClaiming || verseLoading || verseError}
                            style={{ 
                              backgroundColor: isCurrentlyClaiming ? '#2b6cb0' : '#4299e1', 
                              color: 'white', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '0.5rem', 
                              fontSize: '0.875rem', 
                              transition: 'all 0.3s ease', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem', 
                              width: '100%', 
                              justifyContent: 'center', 
                              border: 'none', 
                              cursor: isCurrentlyClaiming ? 'default' : 'pointer', 
                              opacity: isCurrentlyClaiming || verseLoading || verseError ? 0.5 : 1 
                            }}
                            onMouseEnter={(e) => !isCurrentlyClaiming && !verseLoading && !verseError && (e.target.style.backgroundColor = '#2b6cb0')}
                            onMouseLeave={(e) => !isCurrentlyClaiming && !verseLoading && !verseError && (e.target.style.backgroundColor = '#4299e1')}
                          >
                            {isCurrentlyClaiming ? (
                              <>
                                <LoadingSpinner size="h-4 w-4" />
                                <span>{t('claiming')}</span>
                              </>
                            ) : (
                              <span>{t('claimTodaysBible')}</span>
                            )}
                          </button>
                          <p style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center' }}>
                            Claim your daily $BIBLESTUDY tokens (real blockchain transaction)
                          </p>
                        </>
                      );
                    }
                  })()}
                </div>
                
                {currentAccount?.address && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ color: '#718096', fontSize: '0.75rem' }}>
                      {t('wallet')}: {currentAccount?.address.slice(0, 8)}...{currentAccount?.address.slice(-6)}
                    </p>
                    <GasManager currentAccount={currentAccount} suiClient={suiClient} t={t} />
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem' }}>
                  <button 
                    onClick={async () => { 
                      setSelectedMonth(new Date().getMonth());
                      setShowMonthlyModal(true); 
                      await loadMonthlyProgress(new Date().getMonth(), selectedYear); 
                    }} 
                    style={{ background: '#4299e1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.background = '#2b6cb0'}
                    onMouseLeave={(e) => e.target.style.background = '#4299e1'}
                  >
                    {t('monthlyProgress')}
                  </button>
                  <button 
                    onClick={async () => { 
                      setShowYearlyModal(true); 
                      await loadYearlyProgress(selectedYear); 
                    }} 
                    style={{ background: '#4299e1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.background = '#2b6cb0'}
                    onMouseLeave={(e) => e.target.style.background = '#4299e1'}
                  >
                    {t('yearlyProgress')}
                  </button>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: '#718096', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => setShowAbout(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                  {t('about')}
                </button>
                <button onClick={() => setShowTokenomics(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                  {t('tokenomics')}
                </button>
                <button onClick={() => setShowHelp(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                  {t('help')}
                </button>
                <LanguageSelector 
                  currentLanguage={language} 
                  onLanguageChange={handleLanguageChange}
                  textColor="text-gray-600"
                />
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAbout && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 99999 }}
          onClick={() => setShowAbout(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '32rem', width: '100%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #e2e8f0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{mt('aboutBible')}</h2>
              <button onClick={() => setShowAbout(false)} style={{ color: '#718096', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#4a5568' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('whatIsBible')}</h3>
                <p style={{ lineHeight: '1.625' }}>{mt('whatIsBibleText')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('whereIsBible')}</h3>
                <p style={{ lineHeight: '1.625' }}>{mt('whereIsBibleText')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('whenCanClaim')}</h3>
                <p style={{ lineHeight: '1.625' }}>{mt('whenCanClaimText')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('whyBible')}</h3>
                <p style={{ lineHeight: '1.625' }}>{mt('whyBibleText')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('whatsNext')}</h3>
                <p style={{ lineHeight: '1.625' }}>{mt('whatsNextText')}</p>
              </div>

              <div style={{ backgroundColor: '#ebf8ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bee3f8' }}>
                <h4 style={{ fontWeight: '600', color: '#2b6cb0', marginBottom: '0.5rem' }}>{mt('contractAddress')}</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4a5568', wordBreak: 'break-all', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  {PACKAGE_ID}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTokenomics && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 99999 }}
          onClick={() => setShowTokenomics(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '32rem', width: '100%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #e2e8f0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{mt('tokenomics')}</h2>
              <button onClick={() => setShowTokenomics(false)} style={{ color: '#718096', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#4a5568' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.5rem' }}>{mt('totalSupplyTitle')}</h3>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748', marginBottom: '0.5rem' }}>{mt('totalSupply')}</h4>
                <p style={{ color: '#3182ce', fontWeight: '600' }}>{mt('fixedSupply')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '1rem' }}>{mt('allocationBreakdown')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#ebf8ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bee3f8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#3182ce' }}>{mt('dailyClaims')}</div>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>10T tokens</div>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3182ce' }}>100%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#ebf8ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bee3f8' }}>
                <h4 style={{ fontWeight: '600', color: '#3182ce', marginBottom: '0.5rem' }}>{mt('contractAddress')}</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4a5568', wordBreak: 'break-all', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  {PACKAGE_ID}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 99999 }}
          onClick={() => setShowHelp(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '32rem', width: '100%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #e2e8f0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{mt('helpTitle')}</h2>
              <button onClick={() => setShowHelp(false)} style={{ color: '#718096', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#4a5568' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('switchToTestnet')}</h3>
                <p style={{ lineHeight: '1.625', whiteSpace: 'pre-line' }}>{mt('switchToTestnetText')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('needTestnetSui')}</h3>
                <p style={{ lineHeight: '1.625', whiteSpace: 'pre-line' }}>{mt('needTestnetSuiText')}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '0.75rem' }}>{mt('troubleshooting')}</h3>
                <p style={{ lineHeight: '1.625', whiteSpace: 'pre-line' }}>{mt('troubleshootingText')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMonthlyModal && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 99999 }}
          onClick={() => setShowMonthlyModal(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '32rem', width: '100%', padding: '1.5rem', border: '1px solid #e2e8f0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{t('monthlyProgress')} - {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(selectedYear, selectedMonth, 1))}</h2>
              <button onClick={() => setShowMonthlyModal(false)} style={{ color: '#718096', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            {monthlyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <LoadingSpinner size="h-8 w-8" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: '#2b6cb0' }}>{d}</div>
                ))}
                {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const claim = monthlyClaims.find(c => new Date(c.claim_day * 86400000).getDate() === day);
                  return (
                    <div 
                      key={day} 
                      className={claim ? "tooltip" : ""}
                      style={{ 
                        backgroundColor: claim ? '#4299e1' : '#e2e8f0', 
                        color: claim ? 'white' : '#2d3748',
                        textAlign: 'center', 
                        padding: '0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.875rem',
                        cursor: claim ? 'pointer' : 'default'
                      }}
                    >
                      {day}
                      {claim && <span className="tooltiptext">{`${claim.verseReference} (${claim.version}): ${claim.verseText}`}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showYearlyModal && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 99999 }}
          onClick={() => setShowYearlyModal(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '32rem', width: '100%', padding: '1.5rem', border: '1px solid #e2e8f0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{t('yearlyProgress')} - {selectedYear}</h2>
              <button onClick={() => setShowYearlyModal(false)} style={{ color: '#718096', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            {yearlyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <LoadingSpinner size="h-8 w-8" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <div 
                    key={m} 
                    style={{ 
                      backgroundColor: `rgba(66, 153, 225, ${yearlyClaims[i] / 31})`, 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      textAlign: 'center', 
                      color: yearlyClaims[i] > 15 ? 'white' : '#2d3748',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedMonth(i);
                      setShowYearlyModal(false);
                      setShowMonthlyModal(true);
                      loadMonthlyProgress(i, selectedYear);
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{m}</div>
                    <div>{yearlyClaims[i]} days</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function BibleAppWithWallet() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider>
            <BibleApp />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}