import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  TextInput,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

// Tokens de Design Nubank 2026 adaptativos (Dark OLED oficial das referências com suporte refinado)
const NU = {
  purple: '#7A00C7',
  purpleLight: '#820AD1',
  purpleDark: '#530082',
  purpleSoft: '#261738',
  purpleBadge: '#6E1FA3',
  bg: '#000000',
  cardBg: '#1C1C1E',
  surface: '#161618',
  divider: '#1A1A1E',
  text: '#FFFFFF',
  textSub: '#C4C4C6',
  muted: '#8E8E93',
  green: '#00C49F',
  greenSoft: '#10393B',
  blue: '#009EE3',
  red: '#E02424',
};

const formatBRL = (value) => {
  const abs = Math.abs(Number(value) || 0);
  const fixed = abs.toFixed(2).replace('.', ',');
  const parts = fixed.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '- ' : ''}R$ ${parts.join(',')}`;
};

// Ícone oficial do Pix em geometria pura com proporção exata
const PixGlyph = ({ size = 22, color = '#FFFFFF' }) => {
  const s = size * 0.31;
  const gap = size * 0.09;
  const box = s * 2 + gap;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: box,
          height: box,
          transform: [{ rotate: '45deg' }],
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignContent: 'space-between',
        }}
      >
        {[0, 1, 2, 3].map((idx) => (
          <View
            key={idx}
            style={{
              width: s,
              height: s,
              borderRadius: s * 0.28,
              borderWidth: 1.75,
              borderColor: color,
            }}
          />
        ))}
      </View>
    </View>
  );
};

// Máscara fiel do Nubank ao ocultar valores
const MaskedValue = ({ visible, text, style, dotSize = 8 }) => {
  if (visible) return <Text style={style}>{text}</Text>;
  return (
    <View style={[styles.maskedRow, { height: (style?.fontSize || 20) * 1.25 }]}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: '#FFFFFF',
            marginRight: 5,
          }}
        />
      ))}
    </View>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Estados dinâmicos da conta
  const [balance, setBalance] = useState(3570.28);
  const [invoiceTotal] = useState(16.44);
  const [creditLimit] = useState(1000.0);
  const [streetMode, setStreetMode] = useState(true);

  // Autenticação Face ID / Touch ID ao abrir
  useEffect(() => {
    handleBiometricAuth();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsAuthenticated(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear Nubank com Face ID / Biometria',
        fallbackLabel: 'Usar senha de 4 dígitos',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setIsAuthenticated(true);
    }
  };

  const [transactions, setTransactions] = useState([
    {
      id: 't1',
      type: 'pix_out',
      title: 'Transferência enviada',
      subtitle: 'MATHEUS BARROS',
      amount: -0.02,
      date: 'Hoje, 11:40',
      method: 'Pix',
    },
    {
      id: 't2',
      type: 'pix_in',
      title: 'Transferência recebida',
      subtitle: 'Lucas Mendes',
      amount: 850.0,
      date: 'Ontem',
      method: 'Pix',
    },
    {
      id: 't3',
      type: 'bill',
      title: 'Pagamento de fatura',
      subtitle: 'Cartão Nubank',
      amount: -74.8,
      date: '17 NOV',
      method: 'Débito',
    },
    {
      id: 't4',
      type: 'yield',
      title: 'Rendimento da conta',
      subtitle: '100% do CDI líquido',
      amount: 14.62,
      date: '16 NOV',
      method: 'Conta',
    },
  ]);

  const [creditPurchases] = useState([
    { id: 'c1', merchant: 'iFood *Restaurante', category: 'Alimentação', amount: 16.44, date: 'Hoje', icon: 'restaurant-outline' },
    { id: 'c2', merchant: 'Amazon.com.br', category: 'Eletrônicos', amount: 349.5, date: '12 NOV', icon: 'cart-outline' },
    { id: 'c3', merchant: 'Uber *Trip', category: 'Transporte', amount: 28.4, date: '10 NOV', icon: 'car-outline' },
  ]);

  const [cards, setCards] = useState([
    { id: 'card1', name: 'Cartão físico', label: 'Ultravioleta', last4: '4109', type: 'physical', blocked: false },
    { id: 'card2', name: 'Compras online', label: 'Virtual', last4: '8842', type: 'virtual', blocked: false },
    { id: 'card3', name: 'Assinaturas', label: 'Virtual', last4: '2915', type: 'virtual', blocked: false },
  ]);

  // Controle de Modais / Telas
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [pixStep, setPixStep] = useState('menu'); // 'menu' | 'amount' | 'recipient' | 'receipt' | 'schedule'
  const [pixInputAmount, setPixInputAmount] = useState('0,02');
  const [pixRecipient, setPixRecipient] = useState('MATHEUS BARROS');
  const [lastReceipt, setLastReceipt] = useState(null);

  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [extractSearch, setExtractSearch] = useState('');
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [cardsModalVisible, setCardsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const availableLimit = Math.max(0, creditLimit - invoiceTotal);
  const invoicePercent = Math.min(100, (invoiceTotal / creditLimit) * 100);

  const filteredTransactions = useMemo(() => {
    if (!extractSearch.trim()) return transactions;
    const q = extractSearch.toLowerCase();
    return transactions.filter(
      (t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)
    );
  }, [transactions, extractSearch]);

  // Ações Rápidas Oficiais Nubank 2026 com badges das referências
  const quickActions = [
    {
      id: '1',
      label: 'Área Pix e\nTransferir',
      icon: 'grid-outline',
      lib: 'ion',
      action: () => {
        setPixStep('menu');
        setPixModalVisible(true);
      },
    },
    { id: '2', label: 'Pagar', icon: 'barcode-outline', lib: 'ion', action: () => setCreditModalVisible(true) },
    {
      id: '3',
      label: 'Pegar\nemprestado',
      icon: 'hand-coin-outline',
      lib: 'mci',
      badge: 'R$ 2.000',
      action: () => {},
    },
    { id: '4', label: 'Recarga de\ncelular', icon: 'smartphone', lib: 'feather', action: () => {} },
    {
      id: '5',
      label: 'Caixinha\nTurbo',
      icon: 'cash-multiple',
      lib: 'mci',
      badge: '115% CDI',
      action: () => setActiveTab('planning'),
    },
    { id: '6', label: 'Cobrar', icon: 'chatbubble-ellipses-outline', lib: 'ion', action: () => {} },
    { id: '7', label: 'Depositar', icon: 'arrow-down-left', lib: 'feather', action: () => {} },
  ];

  // Cards informativos do Feed
  const noticeCards = [
    {
      id: 'n1',
      prefix: 'Pix no Crédito: ',
      text: 'faça pagamentos sem usar o saldo da conta.',
      highlight: true,
      hasIcon: true,
    },
    {
      id: 'n2',
      prefix: 'CDBs com as ',
      text: 'maiores taxas de rendimento para você investir.',
      highlight: false,
      hasIcon: false,
    },
    {
      id: 'n3',
      prefix: 'O Modo Escuro ',
      text: 'já está disponível no app! Saiba mais.',
      highlight: false,
      hasIcon: false,
    },
  ];

  const pixContacts = [
    { id: 'p1', name: 'MATHEUS BARROS', bank: 'Nu Pagamentos S.A.', initials: 'MB' },
    { id: 'p2', name: 'Lucas Mendes', bank: 'Nu Pagamentos S.A.', initials: 'LM' },
    { id: 'p3', name: 'Mariana Silva', bank: 'Itaú Unibanco S.A.', initials: 'MS' },
  ];

  // Fluxo real de envio/agendamento de Pix
  const handleConfirmPix = (recipientName) => {
    const parsed = parseFloat(pixInputAmount.replace(',', '.'));
    if (!parsed || parsed <= 0 || parsed > balance) return;

    const finalRecipient = recipientName || pixRecipient.trim() || 'Chave Pix';
    setBalance((prev) => +(prev - parsed).toFixed(2));

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'pix_out',
      title: 'Transferência enviada',
      subtitle: finalRecipient,
      amount: -parsed,
      date: `Hoje, ${timeStr}`,
      method: 'Pix',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setLastReceipt({
      amount: parsed,
      recipient: finalRecipient,
      date: `Hoje às ${timeStr}`,
      id: `E1823612020261119${Math.floor(100000 + Math.random() * 899999)}`,
    });
    setPixStep('receipt');
  };

  const toggleBlockCard = (id) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
  };

  const createVirtualCard = () => {
    const rand4 = String(Math.floor(1000 + Math.random() * 9000));
    setCards((prev) => [
      ...prev,
      {
        id: `card_${Date.now()}`,
        name: `Virtual #${prev.length}`,
        label: 'Virtual',
        last4: rand4,
        type: 'virtual',
        blocked: false,
      },
    ]);
  };

  // Se bloqueado, exibe tela de desbloqueio Face ID / Biometria
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.lockScreen}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.lockContainer}>
          <View style={styles.nuLogoCircle}>
            <Text style={styles.nuLogoText}>nu</Text>
          </View>
          <Text style={styles.lockGreeting}>Olá, Victor</Text>
          <Text style={styles.lockSub}>Toque para autenticar com Face ID ou Biometria</Text>

          <TouchableOpacity 
            style={styles.biometricBtn} 
            onPress={handleBiometricAuth}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={30} color="#FFFFFF" />
            <Text style={styles.biometricBtnText}>Desbloquear com Biometria</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.unlockDirectBtn} 
            onPress={() => setIsAuthenticated(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.unlockDirectText}>Entrar com senha do app</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cabeçalho Roxo compartilhado Oficial
  const renderPurpleHeader = (showGreeting) => (
    <View style={[styles.header, !showGreeting && styles.headerCompact]}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.avatarButton}
          activeOpacity={0.75}
          onPress={() => setProfileModalVisible(true)}
        >
          <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          <View style={styles.avatarNotificationBadge} />
        </TouchableOpacity>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setBalanceVisible(!balanceVisible)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={23} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="email-newsletter" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showGreeting && <Text style={styles.greetingText}>Olá, Victor</Text>}
    </View>
  );

  // ABA 1: FEED PRINCIPAL NUBANK 2026 DARK
  const renderHomeFeed = () => (
    <>
      {renderPurpleHeader(true)}
      <View style={styles.feedSheetDark}>
        {/* SALDO EM CONTA */}
        <TouchableOpacity
          style={styles.accountSection}
          activeOpacity={0.75}
          onPress={() => setAccountModalVisible(true)}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Saldo em conta</Text>
            <Feather name="chevron-right" size={20} color={NU.muted} />
          </View>
          <MaskedValue
            visible={balanceVisible}
            text={formatBRL(balance)}
            style={styles.balanceAmount}
            dotSize={8}
          />
        </TouchableOpacity>

        {/* AVATARS DE CONTATOS FREQUENTES PIX (EXATO SCREENSHOT) */}
        <View style={styles.recentContactsRow}>
          <TouchableOpacity 
            style={styles.contactAvatarCircle} 
            activeOpacity={0.8}
            onPress={() => {
              setPixRecipient('MATHEUS BARROS');
              setPixInputAmount('0,02');
              setScheduleModalVisible(true);
            }}
          >
            <View style={styles.contactAvatarInner}>
              <Ionicons name="swap-horizontal" size={16} color={NU.green} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactAvatarCircle} 
            activeOpacity={0.8}
            onPress={() => {
              setPixRecipient('Lucas Mendes');
              setPixInputAmount('50,00');
              setScheduleModalVisible(true);
            }}
          >
            <View style={styles.contactAvatarInner}>
              <Ionicons name="swap-horizontal" size={16} color={NU.green} />
            </View>
          </TouchableOpacity>
        </View>

        {/* CARROSSEL DE AÇÕES CIRCULARES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsCarousel}
        >
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={item.action}
            >
              <View style={styles.actionCircleContainer}>
                <View style={styles.actionCircle}>
                  {item.customPix ? (
                    <PixGlyph size={24} color="#FFFFFF" />
                  ) : item.lib === 'ion' ? (
                    <Ionicons name={item.icon} size={25} color="#FFFFFF" />
                  ) : item.lib === 'feather' ? (
                    <Feather name={item.icon} size={22} color="#FFFFFF" />
                  ) : (
                    <MaterialCommunityIcons name={item.icon} size={25} color="#FFFFFF" />
                  )}
                </View>
                {item.badge && (
                  <View style={styles.actionBadgePill}>
                    <Text style={styles.actionBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BOTÃO MEUS CARTÕES */}
        <TouchableOpacity
          style={styles.myCardsButton}
          activeOpacity={0.8}
          onPress={() => setCardsModalVisible(true)}
        >
          <Ionicons name="phone-portrait-outline" size={20} color="#FFFFFF" />
          <Text style={styles.myCardsText}>Meus cartões</Text>
        </TouchableOpacity>

        {/* CARROSSEL INFORMATIVO DO FEED (PIX NO CRÉDITO, ETC) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoCarousel}
        >
          {noticeCards.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={[
                styles.promoCard,
                promo.highlight ? styles.promoCardHighlight : styles.promoCardNormal,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                if (promo.highlight) setCreditModalVisible(true);
              }}
            >
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoBodyText}>
                  <Text style={styles.promoPrefix}>{promo.prefix}</Text>
                  {promo.text}
                </Text>
              </View>

              {promo.hasIcon && (
                <View style={styles.promoIconPill}>
                  <Ionicons name="grid" size={18} color="#A742EB" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionDivider} />

        {/* PRÓXIMOS 7 DIAS */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.rowAlign}>
              <Text style={styles.sectionTitle}>Próximos 7 dias</Text>
              <Feather name="chevron-right" size={18} color={NU.muted} style={{ marginLeft: 6 }} />
            </View>
            <View style={styles.circleIconSmall}>
              <Ionicons name="notifications-outline" size={16} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.upcomingText}>
            {balanceVisible ? 'R$ 74,80 a pagar em uma conta' : '••••••••'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        {/* CARTÃO DE CRÉDITO */}
        <TouchableOpacity
          style={styles.cardSection}
          activeOpacity={0.85}
          onPress={() => setCreditModalVisible(true)}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cartão de crédito</Text>
            <Feather name="chevron-right" size={20} color={NU.muted} />
          </View>
          <Text style={styles.subText}>Fatura atual</Text>
          <MaskedValue
            visible={balanceVisible}
            text={formatBRL(invoiceTotal)}
            style={styles.invoiceValue}
            dotSize={8}
          />
          <Text style={styles.limitInfo}>
            Limite disponível de {balanceVisible ? formatBRL(availableLimit) : '••••'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        {/* EMPRÉSTIMO */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Empréstimo</Text>
            <Feather name="chevron-right" size={20} color={NU.muted} />
          </View>
          <Text style={styles.subText}>Valor disponível de até</Text>
          <MaskedValue
            visible={balanceVisible}
            text="R$ 50.000,00"
            style={styles.loanAmount}
            dotSize={8}
          />
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        {/* ACOMPANHE TAMBÉM / ASSISTENTE DE PAGAMENTOS */}
        <View style={styles.cardSection}>
          <Text style={styles.subSectionTitle}>Acompanhe também</Text>
          <TouchableOpacity style={styles.assistantRow} activeOpacity={0.8}>
            <View style={styles.rowAlign}>
              <MaterialCommunityIcons name="history" size={22} color="#FFFFFF" />
              <Text style={styles.assistantText}>Assistente de pagamentos</Text>
            </View>
            <View style={styles.newBadgePill}>
              <Text style={styles.newBadgeText}>Novo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  // ABA 2: PLANEJAMENTO ($ — Caixinhas, Investimentos, Cripto)
  const renderPlanningTab = () => (
    <>
      {renderPurpleHeader(false)}
      <View style={styles.feedSheetDark}>
        <View style={styles.cardSection}>
          <Text style={styles.tabHeroTitle}>Acompanhe seu dinheiro</Text>

          <TouchableOpacity style={styles.planningRowCard} activeOpacity={0.75}>
            <View style={styles.planningRowLeft}>
              <View style={styles.planningIconBox}>
                <MaterialCommunityIcons name="piggy-bank-outline" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.planningItemTitle}>Caixinhas</Text>
                <Text style={styles.planningItemSub}>3 objetivos ativos • 115% CDI</Text>
              </View>
            </View>
            <MaskedValue
              visible={balanceVisible}
              text="R$ 12.450,00"
              style={styles.planningValue}
              dotSize={6}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.planningRowCard} activeOpacity={0.75}>
            <View style={styles.planningRowLeft}>
              <View style={styles.planningIconBox}>
                <Feather name="trending-up" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.planningItemTitle}>Investimentos</Text>
                <Text style={styles.planningItemSub}>CDBs, Tesouro e Ações</Text>
              </View>
            </View>
            <MaskedValue
              visible={balanceVisible}
              text="R$ 5.870,00"
              style={styles.planningValue}
              dotSize={6}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.planningRowCard} activeOpacity={0.75}>
            <View style={styles.planningRowLeft}>
              <View style={styles.planningIconBox}>
                <MaterialCommunityIcons name="bitcoin" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.planningItemTitle}>Cripto</Text>
                <Text style={styles.planningItemSub}>BTC, ETH, SOL e USDC</Text>
              </View>
            </View>
            <MaskedValue
              visible={balanceVisible}
              text="R$ 1.240,50"
              style={styles.planningValue}
              dotSize={6}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* SUAS CAIXINHAS */}
        <View style={styles.cardSection}>
          <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Suas Caixinhas</Text>
          <View style={styles.caixinhasGrid}>
            {[
              { name: 'Reserva de\nEmergência', val: 'R$ 8.200,00', rate: '+R$ 84,20 este mês', bg: '#261738' },
              { name: 'Upgrade\nPC / Setup', val: 'R$ 2.750,00', rate: '+R$ 26,10 este mês', bg: '#162238' },
              { name: 'Viagem\n2027', val: 'R$ 1.500,00', rate: '+R$ 14,90 este mês', bg: '#10393B' },
            ].map((cx, i) => (
              <TouchableOpacity key={i} style={styles.caixinhaCard} activeOpacity={0.8}>
                <View style={[styles.caixinhaBanner, { backgroundColor: cx.bg }]}>
                  <MaterialCommunityIcons name="piggy-bank-outline" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.caixinhaName}>{cx.name}</Text>
                <MaskedValue
                  visible={balanceVisible}
                  text={cx.val}
                  style={styles.caixinhaVal}
                  dotSize={6}
                />
                <Text style={styles.caixinhaYield}>{cx.rate}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );

  // ABA 3: SHOPPING DO NU
  const renderShoppingTab = () => (
    <>
      {renderPurpleHeader(false)}
      <View style={styles.feedSheetDark}>
        <View style={styles.cardSection}>
          <Text style={styles.tabHeroTitle}>Shopping</Text>

          <View style={styles.searchBoxDark}>
            <Feather name="search" size={18} color={NU.muted} />
            <Text style={styles.searchPlaceholderDark}>Buscar no Shopping do Nu</Text>
          </View>

          <View style={styles.shopBannerDark}>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopBannerTag}>CASHBACK DIRETO NA CONTA</Text>
              <Text style={styles.shopBannerTitle}>Até 15% de volta nas maiores lojas</Text>
              <Text style={styles.shopBannerSub}>Use seu cartão Nu ou Pix no checkout.</Text>
            </View>
            <MaterialCommunityIcons name="ticket-percent-outline" size={44} color="#FFFFFF" />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 14 }]}>
            Lojas em destaque
          </Text>

          <View style={styles.storesGrid}>
            {[
              { name: 'Amazon', cashback: '2% cashback', color: '#232F3E' },
              { name: 'Mercado Livre', cashback: '3% cashback', color: '#D4A017' },
              { name: 'Shopee', cashback: '4% cashback', color: '#EE4D2D' },
              { name: 'KaBuM!', cashback: '5% cashback', color: '#FF6500' },
              { name: 'Nike', cashback: '6% cashback', color: '#111111' },
              { name: 'iFood Card', cashback: '5% OFF', color: '#EA1D2C' },
            ].map((store, i) => (
              <TouchableOpacity key={i} style={styles.storeCardDark} activeOpacity={0.75}>
                <View style={[styles.storeLogoBadge, { backgroundColor: store.color }]}>
                  <Text style={styles.storeLogoLetter}>{store.name[0]}</Text>
                </View>
                <Text style={styles.storeNameDark}>{store.name}</Text>
                <View style={styles.cashbackPill}>
                  <Text style={styles.cashbackPillText}>{store.cashback}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#7A00C7" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'home' && renderHomeFeed()}
          {activeTab === 'planning' && renderPlanningTab()}
          {activeTab === 'shopping' && renderShoppingTab()}
        </ScrollView>

        {/* CÁPSULA FLUTUANTE INFERIOR OFICIAL 2026 (EXATA DO SCREENSHOT) */}
        <View style={styles.floatingNavContainer} pointerEvents="box-none">
          <View style={styles.floatingNavCapsule}>
            <TouchableOpacity
              style={[styles.floatingTabItem, activeTab === 'home' && styles.floatingTabItemActive]}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-vertical" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.floatingTabItem, activeTab === 'planning' && styles.floatingTabItemActive]}
              onPress={() => setActiveTab('planning')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-usd" size={19} color={activeTab === 'planning' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.floatingTabItem, activeTab === 'shopping' && styles.floatingTabItemActive]}
              onPress={() => setActiveTab('shopping')}
              activeOpacity={0.8}
            >
              <Ionicons name="bag-handle-outline" size={19} color={activeTab === 'shopping' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ==================== TELA COMPLETA DE AGENDAMENTO (EXATA DO SCREENSHOT MATHEUS BARROS) ==================== */}
      <Modal
        animationType="slide"
        visible={scheduleModalVisible}
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <SafeAreaView style={styles.transferScreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          <View style={styles.transferScreenHeader}>
            <TouchableOpacity
              style={styles.transferBackBtn}
              onPress={() => setScheduleModalVisible(false)}
            >
              <Feather name="chevron-left" size={28} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.transferContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.transferTitleHeader}>Agendando</Text>

            <View style={styles.transferAmountRow}>
              <Text style={styles.transferAmountPurple}>R$ {pixInputAmount}</Text>
              <TouchableOpacity style={styles.pencilBtn}>
                <Ionicons name="pencil-outline" size={20} color="#820AD1" />
              </TouchableOpacity>
            </View>

            <Text style={styles.transferTargetLabel}>
              para <Text style={styles.boldTargetText}>{pixRecipient}</Text>
            </Text>

            <TouchableOpacity style={styles.writeMessageRow} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={18} color="#820AD1" />
              <Text style={styles.writeMessageText}>Escrever uma mensagem...</Text>
            </TouchableOpacity>

            <View style={styles.transferFieldItem}>
              <View>
                <Text style={styles.fieldItemLabel}>Quando</Text>
                <Text style={styles.fieldItemValue}>17/09/2026</Text>
              </View>
              <Feather name="chevron-down" size={20} color="#111111" />
            </View>

            <View style={styles.transferFieldItem}>
              <View>
                <Text style={styles.fieldItemLabel}>Tipo de transferência</Text>
                <Text style={styles.fieldItemValue}>Pix</Text>
              </View>
              <Feather name="chevron-down" size={20} color="#111111" />
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>CPF</Text>
              <Text style={styles.fieldValueSmall}>***.482.918-**</Text>
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>Instituição</Text>
              <Text style={styles.fieldValueSmall}>Nu Pagamentos S.A.</Text>
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>Agência</Text>
              <Text style={styles.fieldValueSmall}>0001</Text>
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>Conta corrente</Text>
              <Text style={styles.fieldValueSmall}>8492019-3</Text>
            </View>
          </ScrollView>

          <View style={styles.transferBottomContainer}>
            <TouchableOpacity
              style={styles.confirmTransferBtn}
              activeOpacity={0.8}
              onPress={() => {
                handleConfirmPix(pixRecipient);
                setScheduleModalVisible(false);
                Alert.alert('Transferência Agendada', `Agendamento de R$ ${pixInputAmount} para ${pixRecipient} realizado com sucesso!`);
              }}
            >
              <Text style={styles.confirmTransferBtnText}>Agendar transferência</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL ÁREA PIX COMPLETA ==================== */}
      <Modal
        animationType="slide"
        visible={pixModalVisible}
        onRequestClose={() => setPixModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalSafeDark}>
          <View style={styles.fullModalTopBar}>
            <TouchableOpacity
              style={styles.topIconHit}
              onPress={() => {
                if (pixStep === 'menu' || pixStep === 'receipt') {
                  setPixModalVisible(false);
                } else if (pixStep === 'recipient') {
                  setPixStep('amount');
                } else {
                  setPixStep('menu');
                }
              }}
            >
              <Feather
                name={pixStep === 'menu' || pixStep === 'receipt' ? 'x' : 'chevron-left'}
                size={26}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topIconHit}>
              <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {pixStep === 'menu' && (
            <ScrollView contentContainerStyle={styles.fullModalPad}>
              <Text style={styles.nuBigTitleDark}>Área Pix</Text>
              <Text style={styles.nuBigSubtitleDark}>
                Envie e receba transferências 24h por dia, 7 dias por semana sem nenhuma tarifa.
              </Text>

              <View style={styles.pixGrid}>
                {[
                  { label: 'Transferir', icon: 'arrow-up-right', lib: 'feather', onPress: () => setPixStep('amount') },
                  { label: 'Programar', icon: 'calendar-outline', lib: 'ion', onPress: () => setScheduleModalVisible(true) },
                  { label: 'Ler QR code', icon: 'qr-code-outline', lib: 'ion', onPress: () => {} },
                  { label: 'Pix Copia\ne Cola', icon: 'copy-outline', lib: 'ion', onPress: () => {} },
                  { label: 'Cobrar', icon: 'chatbubble-ellipses-outline', lib: 'ion', onPress: () => {} },
                  { label: 'Depositar', icon: 'arrow-down-left', lib: 'feather', onPress: () => {} },
                ].map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.pixGridItem}
                    activeOpacity={0.7}
                    onPress={opt.onPress}
                  >
                    <View style={styles.pixGridCircleDark}>
                      {opt.lib === 'feather' ? (
                        <Feather name={opt.icon} size={23} color="#FFFFFF" />
                      ) : (
                        <Ionicons name={opt.icon} size={23} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.pixGridLabelDark}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.sectionDivider, { marginHorizontal: -24, marginVertical: 20 }]} />

              <Text style={styles.prefHeaderDark}>Preferências</Text>

              <TouchableOpacity style={styles.prefRowDark} activeOpacity={0.7}>
                <Ionicons name="key-outline" size={22} color="#FFFFFF" />
                <Text style={styles.prefRowTextDark}>Registrar ou trazer chaves</Text>
                <Feather name="chevron-right" size={20} color={NU.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.prefRowDark} activeOpacity={0.7}>
                <Feather name="sliders" size={20} color="#FFFFFF" />
                <Text style={styles.prefRowTextDark}>Configurar limites Pix</Text>
                <Feather name="chevron-right" size={20} color={NU.muted} />
              </TouchableOpacity>
            </ScrollView>
          )}

          {pixStep === 'amount' && (
            <View style={styles.pixFlowWrap}>
              <View>
                <Text style={styles.nuBigTitleDark}>Qual é o valor da transferência?</Text>
                <Text style={styles.nuBigSubtitleDark}>
                  Saldo disponível em conta{' '}
                  <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{formatBRL(balance)}</Text>
                </Text>

                <View style={styles.currencyInputRowDark}>
                  <Text style={styles.currencyPrefixDark}>R$</Text>
                  <TextInput
                    style={styles.currencyInputDark}
                    value={pixInputAmount}
                    onChangeText={setPixInputAmount}
                    placeholder="0,00"
                    placeholderTextColor="#555555"
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>

                <View style={styles.quickAmountsRow}>
                  {['0,02', '50', '100', '250'].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={styles.quickAmountChipDark}
                      onPress={() => setPixInputAmount(val)}
                    >
                      <Text style={styles.quickAmountTextDark}>+ R$ {val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.fabNextBtn,
                  (!pixInputAmount || parseFloat(pixInputAmount.replace(',', '.')) <= 0) &&
                    styles.fabNextBtnDisabled,
                ]}
                disabled={!pixInputAmount || parseFloat(pixInputAmount.replace(',', '.')) <= 0}
                onPress={() => setPixStep('recipient')}
              >
                <Feather name="arrow-right" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {pixStep === 'recipient' && (
            <ScrollView contentContainerStyle={styles.fullModalPad}>
              <Text style={styles.nuBigTitleDark}>
                Para quem você quer transferir R$ {pixInputAmount}?
              </Text>
              <Text style={styles.nuBigSubtitleDark}>
                Digite uma chave Pix ou selecione alguém nos contatos.
              </Text>

              <TextInput
                style={styles.underlineInputDark}
                value={pixRecipient}
                onChangeText={setPixRecipient}
                placeholder="Nome, CPF ou chave Pix"
                placeholderTextColor="#777777"
              />

              {pixRecipient.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.confirmPixBtn}
                  onPress={() => handleConfirmPix(pixRecipient)}
                >
                  <Text style={styles.confirmPixBtnText}>Transferir para "{pixRecipient}"</Text>
                </TouchableOpacity>
              )}

              <Text style={[styles.prefHeaderDark, { marginTop: 28 }]}>Contatos frequentes</Text>
              {pixContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactRowDark}
                  activeOpacity={0.7}
                  onPress={() => handleConfirmPix(contact.name)}
                >
                  <View style={styles.contactAvatarCircle}>
                    <Text style={styles.contactInitialsText}>{contact.initials}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactNameDark}>{contact.name}</Text>
                    <Text style={styles.contactBankDark}>{contact.bank}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={NU.muted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {pixStep === 'receipt' && lastReceipt && (
            <ScrollView contentContainerStyle={styles.fullModalPad}>
              <View style={styles.receiptBadge}>
                <Ionicons name="checkmark-circle" size={48} color={NU.green} />
              </View>
              <Text style={styles.nuBigTitleDark}>Transferência realizada</Text>
              <Text style={styles.nuBigSubtitleDark}>{lastReceipt.date}</Text>

              <View style={styles.receiptBoxDark}>
                <View style={styles.receiptRowDark}>
                  <Text style={styles.receiptLabelDark}>Valor</Text>
                  <Text style={styles.receiptValBoldDark}>{formatBRL(lastReceipt.amount)}</Text>
                </View>
                <View style={styles.receiptRowDark}>
                  <Text style={styles.receiptLabelDark}>Destino</Text>
                  <Text style={styles.receiptValDark}>{lastReceipt.recipient}</Text>
                </View>
                <View style={styles.receiptRowDark}>
                  <Text style={styles.receiptLabelDark}>Tipo</Text>
                  <Text style={styles.receiptValDark}>Pix</Text>
                </View>
                <View style={styles.receiptRowDark}>
                  <Text style={styles.receiptLabelDark}>ID da transação</Text>
                  <Text style={styles.receiptIdDark}>{lastReceipt.id}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmPixBtn}
                onPress={() => {
                  setPixStep('menu');
                  setPixModalVisible(false);
                }}
              >
                <Text style={styles.confirmPixBtnText}>Voltar para o início</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL CONTA / EXTRATO ==================== */}
      <Modal
        animationType="slide"
        visible={accountModalVisible}
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalSafeDark}>
          <View style={styles.fullModalTopBar}>
            <TouchableOpacity style={styles.topIconHit} onPress={() => setAccountModalVisible(false)}>
              <Feather name="chevron-left" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topIconHit}>
              <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
              <Text style={styles.subText}>Saldo disponível</Text>
              <MaskedValue
                visible={balanceVisible}
                text={formatBRL(balance)}
                style={styles.accountBigBalanceDark}
                dotSize={10}
              />

              <TouchableOpacity style={styles.accountDetailRowDark} activeOpacity={0.7}>
                <View style={styles.assistantLeft}>
                  <MaterialCommunityIcons name="piggy-bank-outline" size={22} color="#FFFFFF" />
                  <View style={{ marginLeft: 14 }}>
                    <Text style={styles.detailRowSubDark}>Dinheiro guardado nas Caixinhas</Text>
                    <Text style={styles.detailRowValDark}>
                      {balanceVisible ? 'R$ 12.450,00' : '••••'}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={NU.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountDetailRowDark} activeOpacity={0.7}>
                <View style={styles.assistantLeft}>
                  <Feather name="trending-up" size={20} color={NU.green} />
                  <View style={{ marginLeft: 14 }}>
                    <Text style={styles.detailRowSubDark}>Rendimento total da conta</Text>
                    <Text style={[styles.detailRowValDark, { color: NU.green }]}>
                      +R$ 142,87 este mês
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={NU.muted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.sectionDivider, { marginVertical: 16 }]} />

            <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Histórico</Text>

              <View style={[styles.searchBoxDark, { marginBottom: 16 }]}>
                <Feather name="search" size={18} color={NU.muted} />
                <TextInput
                  style={styles.searchInputDark}
                  value={extractSearch}
                  onChangeText={setExtractSearch}
                  placeholder="Buscar movimentação"
                  placeholderTextColor={NU.muted}
                />
              </View>

              {filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <View key={tx.id} style={styles.txRowDark}>
                    <View
                      style={[
                        styles.txIconCircleDark,
                        isPositive && { backgroundColor: NU.greenSoft },
                      ]}
                    >
                      <Feather
                        name={isPositive ? 'arrow-down-left' : 'arrow-up-right'}
                        size={19}
                        color={isPositive ? NU.green : '#FFFFFF'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.txTopLine}>
                        <Text style={styles.txTitleDark}>{tx.title}</Text>
                        <Text style={styles.txDateDark}>{tx.date}</Text>
                      </View>
                      <Text style={styles.txSubDark}>{tx.subtitle}</Text>
                      <Text
                        style={[
                          styles.txAmountDark,
                          isPositive && { color: NU.green },
                        ]}
                      >
                        {balanceVisible ? formatBRL(tx.amount) : '••••'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL CARTÃO DE CRÉDITO ==================== */}
      <Modal
        animationType="slide"
        visible={creditModalVisible}
        onRequestClose={() => setCreditModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalSafeDark}>
          <View style={styles.fullModalTopBar}>
            <TouchableOpacity style={styles.topIconHit} onPress={() => setCreditModalVisible(false)}>
              <Feather name="chevron-left" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.topIconHit}>
                <Feather name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topIconHit}>
                <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 24, paddingTop: 10 }}>
              <Text style={styles.invoiceStatusTag}>FATURA ATUAL</Text>
              <MaskedValue
                visible={balanceVisible}
                text={formatBRL(invoiceTotal)}
                style={[styles.accountBigBalanceDark, { color: NU.blue }]}
                dotSize={10}
              />
              <Text style={styles.limitInfo}>
                Limite disponível {balanceVisible ? formatBRL(availableLimit) : '••••'}
              </Text>
              <Text style={[styles.limitInfo, { marginTop: 2 }]}>
                Fecha em 03 DEZ • Vence em 10 DEZ
              </Text>

              <View style={styles.limitBarTrackDark}>
                <View style={[styles.limitBarUsed, { width: `${invoicePercent}%` }]} />
                <View style={styles.limitBarFreeDark} />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 18 }}
              >
                {[
                  { label: 'Pagar fatura', icon: 'barcode', lib: 'mci' },
                  { label: 'Resumo\nde faturas', icon: 'document-text-outline', lib: 'ion' },
                  { label: 'Ajustar\nlimite', icon: 'sliders', lib: 'feather' },
                  {
                    label: 'Meus\ncartões',
                    icon: 'card-outline',
                    lib: 'ion',
                    action: () => {
                      setCreditModalVisible(false);
                      setCardsModalVisible(true);
                    },
                  },
                ].map((act, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={act.action}
                  >
                    <View style={[styles.actionCircle, { width: 62, height: 62, borderRadius: 31 }]}>
                      {act.lib === 'mci' && (
                        <MaterialCommunityIcons name={act.icon} size={22} color="#FFFFFF" />
                      )}
                      {act.lib === 'ion' && <Ionicons name={act.icon} size={22} color="#FFFFFF" />}
                      {act.lib === 'feather' && <Feather name={act.icon} size={20} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.actionLabel}>{act.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.sectionDivider} />

            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Compras recentes</Text>
              {creditPurchases.map((p) => (
                <View key={p.id} style={styles.txRowDark}>
                  <View style={styles.txIconCircleDark}>
                    <Ionicons name={p.icon} size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.txTopLine}>
                      <Text style={styles.txTitleDark}>{p.merchant}</Text>
                      <Text style={styles.txDateDark}>{p.date}</Text>
                    </View>
                    <Text style={styles.txSubDark}>{p.category}</Text>
                    <Text style={styles.txAmountDark}>
                      {balanceVisible ? formatBRL(p.amount) : '••••'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL MEUS CARTÕES ==================== */}
      <Modal
        animationType="slide"
        visible={cardsModalVisible}
        onRequestClose={() => setCardsModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalSafeDark}>
          <View style={styles.fullModalTopBar}>
            <TouchableOpacity style={styles.topIconHit} onPress={() => setCardsModalVisible(false)}>
              <Feather name="x" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={styles.fullModalPad}>
            <Text style={styles.nuBigTitleDark}>Meus cartões</Text>

            <Text style={styles.cardsGroupTitleDark}>Cartão físico</Text>
            {cards
              .filter((c) => c.type === 'physical')
              .map((card) => (
                <View key={card.id} style={styles.cardListItemDark}>
                  <View style={styles.cardMiniDark}>
                    <MaterialCommunityIcons name="integrated-circuit-chip" size={16} color="#C9A227" />
                    <Text style={styles.cardMiniLogoDark}>nu</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.cardTitleDark}>
                      {card.label} {card.blocked ? '(Bloqueado)' : ''}
                    </Text>
                    <Text style={styles.cardMaskDark}>•••• {card.last4}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.blockBtnDark, card.blocked && styles.blockBtnActive]}
                    onPress={() => toggleBlockCard(card.id)}
                  >
                    <Ionicons
                      name={card.blocked ? 'lock-closed' : 'lock-open-outline'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ))}

            <Text style={[styles.cardsGroupTitleDark, { marginTop: 24 }]}>Cartões virtuais</Text>
            {cards
              .filter((c) => c.type === 'virtual')
              .map((card) => (
                <View key={card.id} style={styles.cardListItemDark}>
                  <View style={styles.cardMiniPurple}>
                    <MaterialCommunityIcons name="integrated-circuit-chip" size={16} color="#E6C256" />
                    <Text style={styles.cardMiniLogoLight}>nu</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.cardTitleDark}>
                      {card.name} {card.blocked ? '(Bloqueado)' : ''}
                    </Text>
                    <Text style={styles.cardMaskDark}>•••• {card.last4}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.blockBtnDark, card.blocked && styles.blockBtnActive]}
                    onPress={() => toggleBlockCard(card.id)}
                  >
                    <Ionicons
                      name={card.blocked ? 'lock-closed' : 'lock-open-outline'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ))}

            <TouchableOpacity style={styles.createCardBtnDark} activeOpacity={0.75} onPress={createVirtualCard}>
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.createCardBtnTextDark}>Criar cartão virtual</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL PERFIL / MENU NUBANK ==================== */}
      <Modal
        animationType="slide"
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <SafeAreaView style={styles.fullModalSafeDark}>
          <View style={styles.profileHeaderDark}>
            <TouchableOpacity style={styles.topIconHit} onPress={() => setProfileModalVisible(false)}>
              <Feather name="x" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.profileIdentityRow}>
              <View style={styles.profileAvatarLarge}>
                <Ionicons name="person-outline" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.profileNameDark}>Victor Hugo</Text>
            </View>

            <Text style={styles.bankDataTextDark}>Agência 0001 • Conta 8472910-5</Text>
            <Text style={styles.bankDataSubDark}>Banco 0260 • Nu Pagamentos S.A. - Instituição de Pagamento</Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.profileMenuItemDark}>
              <View style={styles.assistantLeft}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.prefRowTextNoMarginDark}>Modo Rua</Text>
                  <Text style={styles.planningItemSub}>Limita transferências fora de casa</Text>
                </View>
              </View>
              <Switch
                value={streetMode}
                onValueChange={setStreetMode}
                trackColor={{ false: '#3A3A3C', true: '#7A00C7' }}
                thumbColor={streetMode ? '#FFFFFF' : '#8E8E93'}
              />
            </View>

            {[
              { title: 'Me ajuda', icon: 'help-circle-outline' },
              { title: 'Meus dados', icon: 'person-outline' },
              { title: 'Configurar app', icon: 'settings-outline' },
              { title: 'Segurança', icon: 'lock-closed-outline' },
              { title: 'Configurar chaves Pix', icon: 'key-outline' },
              { title: 'Abrir conta PJ', icon: 'storefront-outline' },
              { title: 'Documentos e informes', icon: 'document-text-outline' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.profileMenuItemDark} activeOpacity={0.7}>
                <View style={styles.assistantLeft}>
                  <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                  <Text style={styles.prefRowTextDark}>{item.title}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={NU.muted} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.logoutBtnDark}
              activeOpacity={0.75}
              onPress={() => setProfileModalVisible(false)}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutBtnTextDark}>Sair do aplicativo</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#7A00C7',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },

  // TELA DE BLOQUEIO / BIOMETRIA
  lockScreen: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContainer: {
    width: '85%',
    alignItems: 'center',
  },
  nuLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#820AD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nuLogoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  lockGreeting: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  lockSub: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 36,
  },
  biometricBtn: {
    backgroundColor: '#820AD1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    marginBottom: 16,
  },
  biometricBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  unlockDirectBtn: {
    paddingVertical: 12,
  },
  unlockDirectText: {
    color: '#C4C4C6',
    fontSize: 14,
  },

  // HEADER ROXO NUBANK 2026
  header: {
    backgroundColor: '#7A00C7',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 22,
  },
  headerCompact: {
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarNotificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    marginLeft: 20,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // FEED ESCURO OLED
  feedSheetDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  accountSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  maskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentContactsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  contactAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactAvatarInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10393B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CARROSSEL DE AÇÕES CIRCULARES
  actionsCarousel: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 78,
  },
  actionCircleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  actionCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgePill: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: '#6E1FA3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
  },

  // BOTÃO MEUS CARTÕES
  myCardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  myCardsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 14,
  },

  // CARROSSEL INFORMATIVOS
  promoCarousel: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  promoCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    width: width * 0.74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoCardHighlight: {
    backgroundColor: '#1F1B44',
  },
  promoCardNormal: {
    backgroundColor: '#1C1C1E',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoBodyText: {
    color: '#C4C4C6',
    fontSize: 13,
    lineHeight: 18,
  },
  promoPrefix: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoIconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F1E5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: '#1A1A1E',
    marginVertical: 4,
  },
  cardSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
    fontWeight: '600',
  },
  subText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  invoiceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  limitInfo: {
    fontSize: 13,
    color: '#8E8E93',
  },
  loanAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 14,
  },
  assistantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  assistantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadgePill: {
    backgroundColor: '#6E1FA3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // CÁPSULA FLUTUANTE INFERIOR
  floatingNavContainer: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  floatingNavCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.94)',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  floatingTabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  floatingTabItemActive: {
    backgroundColor: '#6E1FA3',
  },

  // TELA DE TRANSFERÊNCIA AGENDAMENTO
  transferScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  transferScreenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transferBackBtn: {
    padding: 4,
  },
  transferContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transferTitleHeader: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginTop: 10,
    marginBottom: 18,
  },
  transferAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transferAmountPurple: {
    fontSize: 32,
    fontWeight: '700',
    color: '#820AD1',
    marginRight: 12,
  },
  pencilBtn: {
    padding: 4,
  },
  transferTargetLabel: {
    fontSize: 15,
    color: '#111111',
    marginBottom: 20,
  },
  boldTargetText: {
    fontWeight: '700',
  },
  writeMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  writeMessageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#820AD1',
    marginLeft: 10,
  },
  transferFieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },
  fieldItemLabel: {
    fontSize: 13,
    color: '#6E6E73',
    marginBottom: 4,
  },
  fieldItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  fieldDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },
  fieldLabelMuted: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fieldValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  transferBottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },
  confirmTransferBtn: {
    backgroundColor: '#820AD1',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTransferBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // MODAIS FULLSCREEN DARK
  fullModalSafeDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullModalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  topIconHit: {
    padding: 6,
  },
  fullModalPad: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  nuBigTitleDark: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  nuBigSubtitleDark: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 24,
  },
  pixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pixGridItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 24,
  },
  pixGridCircleDark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pixGridLabelDark: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 17,
  },
  prefHeaderDark: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  prefRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1E',
  },
  prefRowTextDark: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 14,
  },
  prefRowTextNoMarginDark: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // PIX TRANSFER FLOW DARK
  pixFlowWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  currencyInputRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2C2C2E',
    paddingBottom: 10,
    marginTop: 8,
  },
  currencyPrefixDark: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  currencyInputDark: {
    flex: 1,
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    padding: 0,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  quickAmountChipDark: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  quickAmountTextDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fabNextBtn: {
    alignSelf: 'flex-end',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#820AD1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabNextBtnDisabled: {
    backgroundColor: '#2C2C2E',
  },
  underlineInputDark: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#2C2C2E',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  confirmPixBtn: {
    backgroundColor: '#820AD1',
    borderRadius: 26,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  confirmPixBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  contactRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1E',
  },
  contactInitialsText: {
    color: '#00C49F',
    fontWeight: '700',
    fontSize: 14,
  },
  contactNameDark: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactBankDark: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  receiptBadge: {
    marginBottom: 14,
  },
  receiptBoxDark: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
  },
  receiptRowDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  receiptLabelDark: {
    fontSize: 13.5,
    color: '#8E8E93',
  },
  receiptValDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  receiptValBoldDark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiptIdDark: {
    fontSize: 11,
    color: '#8E8E93',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // CONTA / EXTRATO DARK
  accountBigBalanceDark: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  accountDetailRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  detailRowSubDark: {
    fontSize: 13,
    color: '#8E8E93',
  },
  detailRowValDark: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  txRowDark: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1E',
  },
  txIconCircleDark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  txTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTitleDark: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  txDateDark: {
    fontSize: 12,
    color: '#8E8E93',
  },
  txSubDark: {
    fontSize: 13.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  txAmountDark: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },

  // FATURA & CARTÃO
  invoiceStatusTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009EE3',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  limitBarTrackDark: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C49F',
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 16,
  },
  limitBarUsed: {
    backgroundColor: '#009EE3',
    height: '100%',
  },
  limitBarFreeDark: {
    flex: 1,
    backgroundColor: '#00C49F',
  },

  // MEUS CARTÕES DARK
  cardsGroupTitleDark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 12,
  },
  cardListItemDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardMiniDark: {
    width: 52,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#2A2A2E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cardMiniPurple: {
    width: 52,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#820AD1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cardMiniLogoDark: {
    color: '#A1A1AA',
    fontWeight: '900',
    fontSize: 12,
  },
  cardMiniLogoLight: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  cardTitleDark: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardMaskDark: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  blockBtnDark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockBtnActive: {
    backgroundColor: '#E02424',
  },
  createCardBtnDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#261738',
    paddingVertical: 15,
    borderRadius: 26,
    marginTop: 14,
  },
  createCardBtnTextDark: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    marginLeft: 8,
  },

  // PERFIL DARK
  profileHeaderDark: {
    backgroundColor: '#161618',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  profileIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  profileAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#261738',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileNameDark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bankDataTextDark: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bankDataSubDark: {
    fontSize: 12.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  profileMenuItemDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1E',
  },
  logoutBtnDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 26,
  },
  logoutBtnTextDark: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // ABA PLANEJAMENTO & SHOPPING DARK
  tabHeroTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  planningRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  planningRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planningIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planningItemTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planningItemSub: {
    fontSize: 12.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  planningValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caixinhasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  caixinhaCard: {
    width: (width - 56) / 2,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  caixinhaBanner: {
    height: 62,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  caixinhaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 6,
  },
  caixinhaVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caixinhaYield: {
    fontSize: 11.5,
    color: '#00C49F',
    fontWeight: '600',
    marginTop: 4,
  },
  searchBoxDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
  },
  searchPlaceholderDark: {
    marginLeft: 10,
    color: '#8E8E93',
    fontSize: 14,
  },
  searchInputDark: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  shopBannerDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#530082',
    borderRadius: 16,
    padding: 20,
    marginTop: 18,
  },
  shopBannerTag: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  shopBannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  shopBannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
  },
  storesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storeCardDark: {
    width: (width - 56) / 2,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  storeLogoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLogoLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  storeNameDark: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cashbackPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#261738',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cashbackPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#820AD1',
  },
});
