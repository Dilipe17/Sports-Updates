/**
 * FloatingChat — a floating action button (FAB) that opens a full-screen
 * AI chat Modal on top of all screens. No separate tab needed.
 *
 * Powered by: ESPN free public API (live context) + AWS Bedrock Claude 3 Haiku (AI reply)
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SPORT_CATEGORIES,
} from '../../../shared/theme.js';
import { sendChatMessage } from '../../../shared/api.js';

const SPORT_FILTERS = [{ id: 'all', label: 'All', icon: '🏅' }, ...SPORT_CATEGORIES];

let _id = 0;
const uid = () => `m${++_id}`;

const WELCOME = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm your AI sports assistant. Ask me about live scores, news or standings — I pull live data from ESPN!",
};

export default function FloatingChat() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [draft, setDraft]       = useState('');
  const [sport, setSport]       = useState('all');
  const [loading, setLoading]   = useState(false);
  const listRef = useRef(null);

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setDraft('');
    setLoading(true);
    scrollToBottom();

    try {
      const { reply } = await sendChatMessage(text, sport);
      setMessages((prev) => [...prev, { id: uid(), role: 'ai', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'ai',
          text: '⚠️ Cannot connect to the AI backend. Deploy the Lambda first — see lambda/chat/DEPLOY.md.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [draft, loading, sport]);

  const renderMessage = useCallback(({ item: m }) => (
    <View style={[styles.msgRow, m.role === 'user' && styles.msgRowUser]}>
      {m.role === 'ai' && <Text style={styles.avatar}>🤖</Text>}
      <View
        style={[
          styles.bubble,
          m.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
          m.isError && styles.bubbleError,
        ]}
      >
        <Text style={styles.bubbleText}>{m.text}</Text>
      </View>
    </View>
  ), []);

  return (
    <>
      {/* ── Full-screen chat modal ──────────────────────────────────── */}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🤖 Sports AI Assistant</Text>
            <TouchableOpacity
              onPress={() => setOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sport chips */}
          <FlatList
            data={SPORT_FILTERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(s) => s.id}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item: s }) => (
              <TouchableOpacity
                style={[styles.chip, sport === s.id && styles.chipActive]}
                onPress={() => setSport(s.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipIcon}>{s.icon}</Text>
                <Text style={[styles.chipLabel, sport === s.id && styles.chipLabelActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Messages + input — keyboard-aware */}
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              contentContainerStyle={styles.messageList}
              renderItem={renderMessage}
              onContentSizeChange={scrollToBottom}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                loading ? (
                  <View style={styles.msgRow}>
                    <Text style={styles.avatar}>🤖</Text>
                    <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                      <ActivityIndicator size="small" color={COLORS.textMuted} />
                    </View>
                  </View>
                ) : null
              }
            />

            {/* Input bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask about scores, news, standings…"
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!loading}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!draft.trim() || loading) && styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!draft.trim() || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Floating action button — sits above the tab bar ────────── */}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>🤖</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  // Header
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color:      COLORS.text,
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  closeBtn: {
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Sport chips
  chipRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    gap:               SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chip: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:    BORDER_RADIUS.full,
    borderWidth:     1,
    borderColor:     COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight:     SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor:     COLORS.accent,
  },
  chipIcon:  { fontSize: FONT_SIZE.md, marginRight: 4 },
  chipLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, fontWeight: FONT_WEIGHT.medium },
  chipLabelActive: { color: COLORS.text, fontWeight: FONT_WEIGHT.bold },

  // Messages
  messageList: { padding: SPACING.md },
  msgRow: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    marginBottom:   SPACING.md,
    justifyContent: 'flex-start',
  },
  msgRowUser: { justifyContent: 'flex-end' },
  avatar: { fontSize: 18, marginRight: SPACING.sm, flexShrink: 0 },
  bubble: {
    maxWidth:    '78%',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
  },
  bubbleUser: {
    backgroundColor:       COLORS.accent,
    borderBottomRightRadius: BORDER_RADIUS.xs,
  },
  bubbleAI: {
    backgroundColor:      COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.xs,
  },
  bubbleError: { borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  bubbleText:  { color: COLORS.text, fontSize: FONT_SIZE.md, lineHeight: 21 },
  typingBubble: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },

  // Input bar
  inputBar: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    gap:             SPACING.sm,
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
    backgroundColor: COLORS.secondary,
  },
  input: {
    flex:            1,
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
    color:           COLORS.text,
    fontSize:        FONT_SIZE.md,
  },
  sendBtn: {
    width:           42,
    height:          42,
    borderRadius:    BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent:  'center',
    alignItems:      'center',
    flexShrink:      0,
  },
  sendBtnDisabled: { backgroundColor: COLORS.surfaceLight },
  sendIcon: {
    color:      COLORS.text,
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },

  // FAB — positioned above tab bar (tab bar ≈ 56-80 px)
  fab: {
    position:        'absolute',
    bottom:          82,
    right:           20,
    width:           52,
    height:          52,
    borderRadius:    BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent:  'center',
    alignItems:      'center',
    elevation:       8,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    8,
    zIndex:          500,
  },
  fabIcon: { fontSize: 22 },
});
