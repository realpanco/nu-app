import React, { useState, useEffect } from 'react';
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
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [cardsModalVisible, setCardsModalVisible] = useState(false);
  const [transferScreenVisible, setTransferScreenVisible] = useState(false);

  // Authenticate on startup with Face ID / Touch ID / Biometrics
  useEffect(() => {
    handleBiometricAuth();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback for web or devices without biometrics configured
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
      } else {
        // User cancelled or failed
      }
    } catch (e) {
      setIsAuthenticated(true);
    }
  };

  // Quick Action Buttons directly matched to user screenshots
  const quickActions = [
    {
      id: '1',
      label: 'Área Pix e\nTransferir',
      icon: 'grid-outline',
      type: 'ion',
      action: () => setPixModalVisible(true),
    },
    {
      id: '2',
      label: 'Pagar',
      icon: 'barcode-outline',
      type: 'ion',
      action: () => {},
    },
    {
      id: '3',
      label: 'Pegar\nemprestado',
      icon: 'hand-coin-outline',
      type: 'mci',
      badge: 'R$ 2.000',
      action: () => {},
    },
    {
      id: '4',
      label: 'Recarga de\ncelular',
      icon: 'phone-portrait-outline',
      type: 'ion',
      action: () => {},
    },
    {
      id: '5',
      label: 'Caixinhas e\nInvestir',
      icon: 'cash-multiple',
      type: 'mci',
      action: () => {},
    },
    {
      id: '6',
      label: 'Cobrar',
      icon: 'cash-outline',
      type: 'ion',
      action: () => {},
    },
  ];

  // Feed Carousel Cards
  const promoCards = [
    {
      id: '1',
      prefix: 'Pix no Crédito: ',
      text: 'faça pagamentos sem usar o saldo da conta.',
      highlight: true,
      hasIcon: true,
    },
    {
      id: '2',
      prefix: 'Facilite seus planos futuros: ',
      text: 'guarde dinheiro nas Caixinhas.',
      highlight: false,
      hasIcon: false,
    },
    {
      id: '3',
      prefix: 'Concorra a prêmios: ',
      text: 'Nubank Vida tem sorteios de R$ 50 mil todo mês.',
      highlight: false,
      hasIcon: false,
    },
  ];

  // If locked, show authentic Nubank lock screen
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
            <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#7A00C7" />

      {/* HEADER NUBANK 2026 - DEEP PURPLE EXACT MATCH */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.8}>
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
                name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
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

        <Text style={styles.greetingText}>Olá, Victor</Text>
      </View>

      {/* SCROLLABLE FEED - DARK PURE OLED BACKGROUND #000000 */}
      <ScrollView 
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* SALDO EM CONTA */}
        <TouchableOpacity 
          style={styles.accountSection} 
          activeOpacity={0.8}
          onPress={() => setTransferScreenVisible(true)}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Saldo em conta</Text>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? 'R$ 3.570,28' : '••••••••'}
          </Text>
        </TouchableOpacity>

        {/* RECENT PIX CONTACT AVATARS */}
        <View style={styles.recentContactsRow}>
          <TouchableOpacity style={styles.contactAvatarCircle} activeOpacity={0.8}>
            <View style={styles.contactAvatarInner}>
              <Ionicons name="swap-horizontal" size={16} color="#00C49F" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactAvatarCircle} activeOpacity={0.8}>
            <View style={styles.contactAvatarInner}>
              <Ionicons name="swap-horizontal" size={16} color="#00C49F" />
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
              onPress={item.action}
              activeOpacity={0.75}
            >
              <View style={styles.actionCircleContainer}>
                <View style={styles.actionCircle}>
                  {item.type === 'ion' && (
                    <Ionicons name={item.icon} size={25} color="#FFFFFF" />
                  )}
                  {item.type === 'mci' && (
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
          onPress={() => setCardsModalVisible(true)}
          activeOpacity={0.8}
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
          {promoCards.map((promo) => (
            <TouchableOpacity 
              key={promo.id} 
              style={[
                styles.promoCard, 
                promo.highlight ? styles.promoCardHighlight : styles.promoCardNormal
              ]}
              activeOpacity={0.85}
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

        {/* DIVIDER ENTRE SEÇÕES */}
        <View style={styles.sectionDivider} />

        {/* PRÓXIMOS 7 DIAS */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.rowAlign}>
              <Text style={styles.sectionTitle}>Próximos 7 dias</Text>
              <Feather name="chevron-right" size={18} color="#6E6E73" style={{ marginLeft: 6 }} />
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
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cartão de crédito</Text>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.subText}>Fatura atual</Text>
          <Text style={styles.invoiceValue}>
            {balanceVisible ? 'R$ 16,44' : '••••••••'}
          </Text>
          <Text style={styles.limitInfo}>
            Limite disponível de {balanceVisible ? 'R$ 983,56' : '••••••••'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        {/* EMPRÉSTIMO */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Empréstimo</Text>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.subText}>Valor disponível de até</Text>
          <Text style={styles.loanAmount}>
            {balanceVisible ? 'R$ 50.000,00' : '••••••••'}
          </Text>
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
      </ScrollView>

      {/* FLOATING PILL BOTTOM NAVIGATION (EXACT 2026 FLOATING CAPSULE) */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNavCapsule}>
          <TouchableOpacity 
            style={[styles.floatingTabItem, activeTab === 'home' && styles.floatingTabItemActive]} 
            onPress={() => setActiveTab('home')}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.floatingTabItem, activeTab === 'money' && styles.floatingTabItemActive]} 
            onPress={() => setActiveTab('money')}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-usd" size={19} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.floatingTabItem, activeTab === 'shopping' && styles.floatingTabItemActive]} 
            onPress={() => setActiveTab('shopping')}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={19} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL ÁREA PIX */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={pixModalVisible} 
        onRequestClose={() => setPixModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={() => setPixModalVisible(false)}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalHeading}>Área Pix</Text>
              <View style={{ width: 24 }} />
            </View>

            <Text style={styles.modalNotice}>
              Envie e receba transferências em tempo real, sem taxas.
            </Text>

            <TouchableOpacity 
              style={styles.modalActionItem} 
              onPress={() => {
                setPixModalVisible(false);
                setTransferScreenVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.modalActionIcon}>
                <Feather name="arrow-up-right" size={22} color="#820AD1" />
              </View>
              <View style={styles.modalActionTexts}>
                <Text style={styles.modalActionTitle}>Transferir</Text>
                <Text style={styles.modalActionSub}>Pague com chave Pix, QR Code ou agência/conta</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555555" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalActionItem} activeOpacity={0.7}>
              <View style={styles.modalActionIcon}>
                <Ionicons name="copy-outline" size={22} color="#820AD1" />
              </View>
              <View style={styles.modalActionTexts}>
                <Text style={styles.modalActionTitle}>Pix Copia e Cola</Text>
                <Text style={styles.modalActionSub}>Cole o código para pagar</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555555" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalActionItem} activeOpacity={0.7}>
              <View style={styles.modalActionIcon}>
                <Ionicons name="qr-code-outline" size={22} color="#820AD1" />
              </View>
              <View style={styles.modalActionTexts}>
                <Text style={styles.modalActionTitle}>Ler QR Code</Text>
                <Text style={styles.modalActionSub}>Aponte a câmera para pagar</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#555555" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TELA DE TRANSFERÊNCIA/AGENDAMENTO (EXATA DO SCREENSHOT MATHEUS BARROS) */}
      <Modal
        animationType="slide"
        visible={transferScreenVisible}
        onRequestClose={() => setTransferScreenVisible(false)}
      >
        <SafeAreaView style={styles.transferScreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          
          <View style={styles.transferScreenHeader}>
            <TouchableOpacity 
              style={styles.transferBackBtn} 
              onPress={() => setTransferScreenVisible(false)}
            >
              <Feather name="chevron-left" size={28} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.transferContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.transferTitleHeader}>Agendando</Text>

            <View style={styles.transferAmountRow}>
              <Text style={styles.transferAmountPurple}>R$ 0,02</Text>
              <TouchableOpacity style={styles.pencilBtn}>
                <Ionicons name="pencil-outline" size={20} color="#820AD1" />
              </TouchableOpacity>
            </View>

            <Text style={styles.transferTargetLabel}>para <Text style={styles.boldTargetText}>MATHEUS BARROS</Text></Text>

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
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>Instituição</Text>
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>Agência</Text>
            </View>

            <View style={styles.fieldDetailRow}>
              <Text style={styles.fieldLabelMuted}>Conta corrente</Text>
            </View>
          </ScrollView>

          {/* BOTÃO FIXO INFERIOR AGENDAR TRANSFERÊNCIA */}
          <View style={styles.transferBottomContainer}>
            <TouchableOpacity 
              style={styles.confirmTransferBtn} 
              onPress={() => {
                Alert.alert("Sucesso", "Transferência agendada com sucesso!");
                setTransferScreenVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmTransferBtnText}>Agendar transferência</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL MEUS CARTÕES */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={cardsModalVisible} 
        onRequestClose={() => setCardsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={() => setCardsModalVisible(false)}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalHeading}>Meus cartões</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.cardRowItem}>
              <View style={styles.cardGraphicPurple}>
                <MaterialCommunityIcons name="integrated-circuit-chip" size={18} color="#D19800" />
                <Text style={styles.cardBrandMini}>nu</Text>
              </View>
              <View style={styles.cardInfoCol}>
                <Text style={styles.cardRowTitle}>Cartão virtual</Text>
                <Text style={styles.cardRowNumber}>•••• 8842</Text>
              </View>
              <Ionicons name="shield-checkmark" size={20} color="#00C49F" />
            </View>

            <View style={styles.cardRowItem}>
              <View style={styles.cardGraphicDark}>
                <MaterialCommunityIcons name="integrated-circuit-chip" size={18} color="#D19800" />
                <Text style={styles.cardBrandMiniDark}>nu</Text>
              </View>
              <View style={styles.cardInfoCol}>
                <Text style={styles.cardRowTitle}>Cartão físico</Text>
                <Text style={styles.cardRowNumber}>•••• 4109</Text>
              </View>
              <Ionicons name="lock-closed-outline" size={20} color="#757575" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7A00C7',
  },
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
  header: {
    backgroundColor: '#7A00C7',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 22,
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
  feedContainer: {
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
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#161618',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalNotice: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#242428',
  },
  modalActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#261738',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalActionTexts: {
    flex: 1,
  },
  modalActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  modalActionSub: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cardRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardGraphicPurple: {
    width: 48,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#820AD1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
  },
  cardGraphicDark: {
    width: 48,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#2A2A2E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
  },
  cardBrandMini: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
  cardBrandMiniDark: {
    color: '#8E8E93',
    fontWeight: '900',
    fontSize: 10,
  },
  cardInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  cardRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardRowNumber: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
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
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },
  fieldLabelMuted: {
    fontSize: 14,
    color: '#8E8E93',
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
});
