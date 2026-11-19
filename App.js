import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function App() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [cardsModalVisible, setCardsModalVisible] = useState(false);

  // Quick Action Buttons
  const quickActions = [
    { id: '1', label: 'Área Pix', icon: 'diamond-outline', type: 'ion', action: () => setPixModalVisible(true) },
    { id: '2', label: 'Pagar', icon: 'barcode-outline', type: 'ion' },
    { id: '3', label: 'Transferir', icon: 'arrow-up-right', type: 'feather' },
    { id: '4', label: 'Depositar', icon: 'arrow-down-left', type: 'feather' },
    { id: '5', label: 'Recarga', icon: 'smartphone', type: 'feather' },
    { id: '6', label: 'Cobrar', icon: 'chatbox-ellipses-outline', type: 'ion' },
    { id: '7', label: 'Caixinhas', icon: 'archive-outline', type: 'ion' },
    { id: '8', label: 'Investir', icon: 'trending-up', type: 'feather' },
  ];

  // Informative Carousel Cards
  const promoCards = [
    {
      id: '1',
      title: 'Informe de Rendimentos 2026',
      desc: 'Seu documento oficial para a declaração do IRPF já está disponível para consulta.',
      highlight: 'Acesse agora',
    },
    {
      id: '2',
      title: 'Nu Limite Garantido',
      desc: 'Transforme o dinheiro das suas Caixinhas em limite imediato no cartão de crédito.',
      highlight: 'Conhecer',
    },
    {
      id: '3',
      title: 'Seguro de Celular Nu',
      desc: 'Proteção completa contra furto simples, roubo e danos acidentais.',
      highlight: 'Simular R$ 12/mês',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#820AD1" />

      {/* HEADER NUBANK 2026 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerIconButton} 
              onPress={() => setBalanceVisible(!balanceVisible)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
                size={22} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
              <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="email-newsletter" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.greetingText}>Olá, Victor</Text>
      </View>

      {/* MAIN FEED CONTENT */}
      <ScrollView 
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* SEÇÃO CONTA */}
        <TouchableOpacity style={styles.accountCard} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.subLabel}>Saldo disponível</Text>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? 'R$ 14.852,36' : '••••••••'}
          </Text>
        </TouchableOpacity>

        {/* CAROUSEL AÇÕES RÁPIDAS (PIX, PAGAR, ETC) */}
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
              <View style={styles.actionCircle}>
                {item.type === 'ion' && (
                  <Ionicons name={item.icon} size={24} color="#111111" />
                )}
                {item.type === 'feather' && (
                  <Feather name={item.icon} size={22} color="#111111" />
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
          <Ionicons name="card-outline" size={22} color="#111111" />
          <Text style={styles.myCardsText}>Meus cartões</Text>
        </TouchableOpacity>

        {/* CAROUSEL INFORMATIVOS NUBANK */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoCarousel}
        >
          {promoCards.map((promo) => (
            <TouchableOpacity key={promo.id} style={styles.promoCard} activeOpacity={0.85}>
              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoDesc}>{promo.desc}</Text>
              <Text style={styles.promoHighlight}>{promo.highlight}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* SEÇÃO CARTÃO DE CRÉDITO */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Ionicons name="card-outline" size={22} color="#111111" />
              <Text style={styles.sectionTitleWithIcon}>Cartão de crédito</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.subLabel}>Fatura atual</Text>
          <Text style={styles.invoiceAmount}>
            {balanceVisible ? 'R$ 2.418,90' : '••••••••'}
          </Text>
          <Text style={styles.limitText}>
            Limite disponível: <Text style={styles.boldText}>R$ 7.581,10</Text>
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.primaryPillButton} activeOpacity={0.75}>
              <Text style={styles.primaryPillText}>Pagar fatura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryPillButton} activeOpacity={0.75}>
              <Text style={styles.secondaryPillText}>Parcelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* SEÇÃO EMPRÉSTIMO */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconTitleRow}>
              <MaterialCommunityIcons name="cash-multiple" size={22} color="#111111" />
              <Text style={styles.sectionTitleWithIcon}>Empréstimo</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.subLabel}>Valor disponível de até</Text>
          <Text style={styles.creditAmount}>
            {balanceVisible ? 'R$ 25.000,00' : '••••••••'}
          </Text>
          <Text style={styles.loanDetailText}>
            Dinheiro na conta sem burocracia e com taxas personalizadas.
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* SEÇÃO INVESTIMENTOS */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Feather name="trending-up" size={22} color="#111111" />
              <Text style={styles.sectionTitleWithIcon}>Investimentos & Caixinhas</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.subLabel}>Total acumulado</Text>
          <Text style={styles.investAmount}>
            {balanceVisible ? 'R$ 18.320,00' : '••••••••'}
          </Text>
          <Text style={styles.investDetailText}>
            Seu dinheiro rendendo 100% do CDI com liquidez imediata.
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* SEÇÃO SEGUROS */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#111111" />
              <Text style={styles.sectionTitleWithIcon}>Seguros</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.insuranceDesc}>
            Proteção descomplicada para o seu celular, vida e família a partir de R$ 4/mês.
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* SEÇÃO SHOPPING NU */}
        <TouchableOpacity style={styles.cardSection} activeOpacity={0.85}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Ionicons name="bag-handle-outline" size={22} color="#111111" />
              <Text style={styles.sectionTitleWithIcon}>Shopping do Nu</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6E73" />
          </View>
          <Text style={styles.shoppingDesc}>
            Vantagens exclusivas, cupons e até 15% de cashback nas melhores marcas do Brasil.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM TAB BAR 2026 */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="swap-vertical" 
            size={24} 
            color={activeTab === 'home' ? '#820AD1' : '#8E8E93'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('planning')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="wallet-outline" 
            size={24} 
            color={activeTab === 'planning' ? '#820AD1' : '#8E8E93'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('shopping')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="bag-handle-outline" 
            size={24} 
            color={activeTab === 'shopping' ? '#820AD1' : '#8E8E93'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('shield')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="shield-outline" 
            size={24} 
            color={activeTab === 'shield' ? '#820AD1' : '#8E8E93'} 
          />
        </TouchableOpacity>
      </View>

      {/* MODAL ÁREA PIX */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={pixModalVisible} 
        onRequestClose={() => setPixModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setPixModalVisible(false)}
              >
                <Feather name="x" size={24} color="#111111" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Área Pix</Text>
              <View style={{ width: 24 }} />
            </View>

            <Text style={styles.modalSubtitle}>Envie e receba transferências 24 horas por dia, 7 dias por semana sem nenhuma tarifa.</Text>

            <View style={styles.pixOptionsList}>
              <TouchableOpacity style={styles.pixOptionItem} activeOpacity={0.7}>
                <View style={styles.pixIconCircle}>
                  <Feather name="arrow-up-right" size={22} color="#820AD1" />
                </View>
                <View style={styles.pixOptionTextContainer}>
                  <Text style={styles.pixOptionTitle}>Transferir</Text>
                  <Text style={styles.pixOptionDesc}>Pague usando chave Pix, agência ou conta</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#C4C4C6" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.pixOptionItem} activeOpacity={0.7}>
                <View style={styles.pixIconCircle}>
                  <Ionicons name="copy-outline" size={22} color="#820AD1" />
                </View>
                <View style={styles.pixOptionTextContainer}>
                  <Text style={styles.pixOptionTitle}>Pix Copia e Cola</Text>
                  <Text style={styles.pixOptionDesc}>Cole um código Pix gerado para pagar</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#C4C4C6" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.pixOptionItem} activeOpacity={0.7}>
                <View style={styles.pixIconCircle}>
                  <Ionicons name="qr-code-outline" size={22} color="#820AD1" />
                </View>
                <View style={styles.pixOptionTextContainer}>
                  <Text style={styles.pixOptionTitle}>Ler QR Code</Text>
                  <Text style={styles.pixOptionDesc}>Aponte a câmera para escanear e pagar</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#C4C4C6" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.pixOptionItem} activeOpacity={0.7}>
                <View style={styles.pixIconCircle}>
                  <Ionicons name="key-outline" size={22} color="#820AD1" />
                </View>
                <View style={styles.pixOptionTextContainer}>
                  <Text style={styles.pixOptionTitle}>Registrar ou gerenciar chaves</Text>
                  <Text style={styles.pixOptionDesc}>Cadastre CPF, e-mail ou celular</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#C4C4C6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL MEUS CARTÕES */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={cardsModalVisible} 
        onRequestClose={() => setCardsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setCardsModalVisible(false)}
              >
                <Feather name="x" size={24} color="#111111" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Meus cartões</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.cardItemRow}>
              <View style={styles.cardGraphicPurple}>
                <MaterialCommunityIcons name="integrated-circuit-chip" size={20} color="#D19800" />
                <Text style={styles.cardBrandMini}>nu</Text>
              </View>
              <View style={styles.cardInfoCol}>
                <Text style={styles.cardTypeTitle}>Cartão virtual</Text>
                <Text style={styles.cardNumberMask}>•••• 8842</Text>
              </View>
              <Ionicons name="shield-checkmark" size={20} color="#00875A" />
            </View>

            <View style={styles.cardItemRow}>
              <View style={styles.cardGraphicDark}>
                <MaterialCommunityIcons name="integrated-circuit-chip" size={20} color="#D19800" />
                <Text style={styles.cardBrandMiniDark}>nu</Text>
              </View>
              <View style={styles.cardInfoCol}>
                <Text style={styles.cardTypeTitle}>Cartão físico Ultravioleta</Text>
                <Text style={styles.cardNumberMask}>•••• 4109</Text>
              </View>
              <Ionicons name="lock-closed-outline" size={20} color="#6E6E73" />
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
    backgroundColor: '#820AD1',
  },
  header: {
    backgroundColor: '#820AD1',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginLeft: 20,
    padding: 4,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  feedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  accountCard: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.3,
  },
  subLabel: {
    fontSize: 14,
    color: '#6E6E73',
    marginBottom: 6,
    fontWeight: '400',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
  },
  actionsCarousel: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 76,
  },
  actionCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F0F1F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 16,
  },
  myCardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F1F5',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  myCardsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 14,
  },
  promoCarousel: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  promoCard: {
    width: width * 0.72,
    backgroundColor: '#F0F1F5',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 6,
    justifyContent: 'space-between',
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },
  promoDesc: {
    fontSize: 13,
    color: '#6E6E73',
    lineHeight: 18,
    marginBottom: 12,
  },
  promoHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#820AD1',
  },
  divider: {
    height: 2,
    backgroundColor: '#F5F5F7',
    marginVertical: 4,
  },
  cardSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleWithIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  invoiceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  limitText: {
    fontSize: 13,
    color: '#6E6E73',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#00875A',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  primaryPillButton: {
    backgroundColor: '#820AD1',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    marginRight: 10,
  },
  primaryPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryPillButton: {
    backgroundColor: '#F0F1F5',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  secondaryPillText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '600',
  },
  creditAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  loanDetailText: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
  },
  investAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  investDetailText: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
  },
  insuranceDesc: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
    marginTop: 4,
  },
  shoppingDesc: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
    marginTop: 4,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabItem: {
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 20,
  },
  pixOptionsList: {
    marginTop: 8,
  },
  pixOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  pixIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE6F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pixOptionTextContainer: {
    flex: 1,
  },
  pixOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  pixOptionDesc: {
    fontSize: 13,
    color: '#6E6E73',
  },
  cardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F1F5',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardGraphicPurple: {
    width: 50,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#820AD1',
    justifyContent: 'space-between',
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardGraphicDark: {
    width: 50,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1E1E24',
    justifyContent: 'space-between',
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrandMini: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  cardBrandMiniDark: {
    color: '#A0A0A5',
    fontWeight: '900',
    fontSize: 11,
  },
  cardInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  cardTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  cardNumberMask: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2,
  },
});
