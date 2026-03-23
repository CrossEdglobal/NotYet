import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, Animated, Platform, NativeModules,
  useColorScheme, SafeAreaView, TextInput, Modal, I18nManager,
} from 'react-native';
import { NativeModules as NM } from 'react-native';

const { AccessibilityModule } = NM;
const { width: SW } = Dimensions.get('window');

// ─── LANGUAGE ───
const isZh = () => {
  const loc = Platform.OS === 'android'
    ? require('react-native').NativeModules.I18nManager?.localeIdentifier || 'en'
    : 'zh';
  return loc.startsWith('zh');
};
const ZH = isZh();

// ─── COLORS ───
const C = {
  ink:    '#1A1408',
  cream:  '#F5F0E8',
  sand:   '#EDE7DA',
  muted:  '#5A5040',
  border: '#9A8E7A',
  tan:    '#C9A96E',
  navy:   '#1C2E4A',
  green:  '#5A7A4A',
};

// ─── TYPE ───
const F = {
  serif:  Platform.select({ android: 'serif', ios: 'Georgia' }),
  mono:   Platform.select({ android: 'monospace', ios: 'Courier' }),
  sans:   Platform.select({ android: 'sans-serif-condensed', ios: 'System' }),
};

// ─── STRINGS ───
const S = {
  back:        ZH ? '← 返回'     : '← Back',
  welcome_tag: ZH ? '欢迎使用'   : 'WELCOME',
  welcome_tagline: ZH
    ? '在你拿起手机的那一刻，\n给自己一个小小的停顿。'
    : 'Give yourself a small pause\nthe moment you pick up your phone.',
  welcome_cta: ZH ? '开始设置 →' : 'Get Started →',
  features: ZH ? [
    ['🎯','不是封锁，是暂停','在冲动和行动之间留一点空间'],
    ['🌱','微活动引导','用1-5分钟的小事替代无意识刷屏'],
    ['🔓','你始终有选择权','任何时候都可以继续看视频'],
  ] : [
    ['🎯','Not blocking, just pausing','Space between impulse and action'],
    ['🌱','Micro-activity nudges','Replace mindless scrolling with 1–5 min tasks'],
    ['🔓','You always have a choice','You can always continue — that\'s up to you'],
  ],

  perm_tag:   ZH ? '系统权限'   : 'PERMISSION',
  perm_title: ZH ? '先别NotYet 需要一项\n系统权限' : 'NotYet needs one\nsystem permission',
  perm_body:  ZH
    ? '为了在你打开短视频时介入，先别NotYet 需要获得「无障碍访问」权限。'
    : 'To intervene when you open short-video apps, NotYet needs Accessibility Access.',
  perm_points: ZH ? [
    '不会读取你的内容或隐私数据',
    '只检测特定 App 被打开这一个动作',
    '可随时在系统设置中关闭',
  ] : [
    'Does not read your content or personal data',
    'Only detects when a specific app is opened',
    'Can be turned off anytime in system settings',
  ],
  perm_cta:   ZH ? '前往开启权限' : 'Enable Permission',
  perm_check: ZH ? '已开启，继续 →' : 'Enabled, continue →',

  guide_tag:   ZH ? '开启权限'   : 'ENABLE ACCESS',
  guide_title: ZH ? '按步骤授权\n先别NotYet' : 'Grant NotYet permission\nin system settings',
  guide_steps: ZH ? [
    { icon:'⚙️', title:'打开「设置」',       desc:'在主屏幕找到系统设置图标', note: null },
    { icon:'♿', title:'找到「无障碍」',      desc:'在设置中找到「无障碍」或「辅助功能」，进入辅助功能，进入无障碍。', note:'Huawei → 辅助功能\nXiaomi → 无障碍\nOPPO/vivo → 无障碍' },
    { icon:'📋', title:'进入已安装的应用',    desc:'点击「已下载的应用」或「安装的服务」', note: null },
    { icon:'🪨', title:'开启先别NotYet开关', desc:'找到先别NotYet，将开关拨到「开」，点击系统弹窗中的「允许」', note: null },
  ] : [
    { icon:'⚙️', title:'Open Settings',           desc:'Find the Settings icon on your home screen', note: null },
    { icon:'♿', title:'Find Accessibility',        desc:'Scroll to find Accessibility or Accessibility Features, then enter it.', note:'Samsung → Accessibility\nPixel → Accessibility' },
    { icon:'📋', title:'Installed Apps / Services', desc:"Tap 'Downloaded Apps' or 'Installed Services'", note: null },
    { icon:'🪨', title:'Enable NotYet',             desc:'Find NotYet, toggle ON, tap Allow in the dialog', note: null },
  ],
  guide_prev: ZH ? '← 上一步' : '← Prev',
  guide_next: ZH ? '下一步 →' : 'Next →',
  guide_done: ZH ? '我已开启权限 ✓' : 'Permission enabled ✓',

  pick_tag:      ZH ? '定制微活动'      : 'CUSTOMIZE',
  pick_title:    ZH ? '选出4个适合你的\n微活动' : 'Pick 4 micro-activities\nfor you',
  pick_subtitle: ZH ? '列表里没有合适的？可以自己添加。' : 'Nothing fits? Add your own.',
  pick_add:      ZH ? '+ 自己添加'      : '+ Add custom',
  pick_my_tab:   ZH ? '我的活动'        : 'My Activities',
  pick_empty:    ZH ? '还没有自定义活动\n点上方「+ 自己添加」创建' : "No custom activities yet\nTap '+ Add custom' to create one",
  pick_summary_empty: ZH ? '浏览分类，选出 4 个微活动' : 'Browse categories and pick 4 activities',
  pick_selected: (n:number, max:number, rem:number) => ZH
    ? `已选 ${n}/${max}${rem > 0 ? ` · 还需 ${rem} 个` : ' · 已满'}`
    : `Selected ${n}/${max}${rem > 0 ? ` · ${rem} more` : ' · Full'}`,
  pick_cta_partial: (rem:number) => ZH ? `再选 ${rem} 个` : `Pick ${rem} more`,
  pick_cta_done: ZH ? '确认我的微活动 →' : 'Confirm activities →',
  categories: ZH
    ? ['感官观察','身体活动','创意想象','记忆学习','创作','微整理','社交']
    : ['Sensory','Movement','Creative','Memory','Writing','Tidy','Social'],

  apps_tag:      ZH ? '选择要拦截的应用' : 'APPS TO INTERCEPT',
  apps_title:    ZH ? '守护哪些 App？' : 'Which apps to guard?',
  apps_subtitle: ZH ? '打开这些 App 时，先别NotYet 会介入。' : 'NotYet will intercept when you open these apps.',
  apps_tip:      (n:number) => ZH ? `已选 ${n} 个，建议先从1-2个开始` : `${n} selected — start with 1–2`,
  apps_cta:      ZH ? '完成设置 →' : 'Done →',

  time_tag:      ZH ? '拦截时间段'   : 'ACTIVE HOURS',
  time_title:    ZH ? '什么时候守护你？' : 'When should NotYet guard you?',
  time_subtitle: ZH ? '只在这个时间段内，打开短视频才会被拦截。' : 'NotYet only intercepts during this time window.',
  time_toggle:   ZH ? '启用时间限制'  : 'Enable time limit',
  time_toggle_sub: ZH ? '关闭则全天拦截' : 'Off = intercept all day',
  time_start:    ZH ? '开始' : 'Start',
  time_end:      ZH ? '结束' : 'End',
  time_same:     ZH ? '请选择不同的开始和结束时间' : 'Please select different start and end times',
  time_presets:  ZH
    ? [['工作日保护',9,18],['晚间模式',19,23],['全天',0,24],['深夜防刷',22,2]]
    : [['Work hours',9,18],['Evening',19,23],['All day',0,24],['Late night',22,2]],
  time_cta:      ZH ? '确认时间段 →' : 'Confirm hours →',
  time_fmt:      (h:number) => {
    if (!ZH) return `${h}:00`;
    const s = h < 12 ? '上午' : h < 18 ? '下午' : '晚上';
    const d = h === 0 ? 0 : h > 12 ? h - 12 : h;
    return `${s} ${d}:00`;
  },

  done_tag:  ZH ? '设置完成' : 'ALL SET',
  done_body: ZH ? '下次打开短视频时，\n先别NotYet 会轻轻拦住你。' : 'Next time you open a short-video app,\nNotYet will gently intervene.',
  done_cta:  ZH ? '出发吧 🪨' : "Let's go 🪨",

  intercept_activities: ZH ? '你的微活动' : 'YOUR ACTIVITIES',
  intercept_waiting:    (n:number) => ZH ? `${n}秒后可跳过` : `Skip in ${n}s`,
  intercept_pausing:    ZH ? '先停一下' : 'Just pause',
  intercept_ready:      ZH ? '准备好了' : 'Ready',
  intercept_bypass:     ZH ? '还是直接看视频' : 'Watch anyway',
  doing_tag:            ZH ? '现在去做' : 'DO IT NOW',
  doing_duration:       ZH ? '预计时间' : 'ESTIMATED TIME',
  doing_done:           ZH ? '做完了 ✓' : 'Done ✓',
  doing_skip:           ZH ? '算了，还是看视频' : "Never mind, I'll watch",
  bypass_title:         ZH ? '没关系' : "That's okay",
  bypass_body:          ZH ? '有时候就是需要放松一下，\n这完全合理。享受就好。' : 'Sometimes you just need to unwind.\nThat\'s completely fine. Enjoy.',
  reset:                ZH ? '重新体验 →' : 'Try again →',

  prompts: ZH ? [
    '你现在真的无聊，还是只是习惯了拿起手机？',
    '打开这个 App 之前……你本来想做什么？',
    '此刻，你有几分钟可以给自己。',
    '刷视频很容易，但你还有更有趣的选择。',
    '先停一秒。你现在感觉怎么样？',
  ] : [
    'Are you actually bored, or just reaching for your phone out of habit?',
    'Before you opened this app… what were you going to do?',
    'You have a few minutes. What would you do with them?',
    'Scrolling is easy. But you have more interesting options.',
    'Pause for a second. How are you feeling right now?',
  ],
};

// ─── ACTIVITIES ───
type Activity = { id:string; category:string; icon:string; label:string; desc:string; duration:string; color:string; custom?:boolean };

const ACTIVITIES: Activity[] = ZH ? [
  { id:'s1', category:'感官观察', icon:'🪟', label:'寻找5种颜色',  desc:'看窗外，找出5种不同颜色的物体',      duration:'1分钟', color:'#7A9E82' },
  { id:'s2', category:'感官观察', icon:'👂', label:'分辨3种声音',  desc:'听周围的声音，辨认至少3种来源',       duration:'1分钟', color:'#7A8E9E' },
  { id:'s3', category:'感官观察', icon:'☁️', label:'看云的形状',   desc:'观察天空或云，看它像什么',           duration:'1分钟', color:'#8A9EAE' },
  { id:'s4', category:'感官观察', icon:'🔍', label:'发现新细节',   desc:'在房间里找一个以前没注意的小细节',   duration:'1分钟', color:'#9E9A7A' },
  { id:'s5', category:'感官观察', icon:'🧘', label:'闭眼30秒',    desc:'闭眼30秒，然后说出你听到了什么',     duration:'1分钟', color:'#7A9E9A' },
  { id:'b1', category:'身体活动', icon:'🏋️', label:'10次深蹲',   desc:'慢慢做10-20次深蹲，感受腿部发力',    duration:'2分钟', color:'#9E7A7A' },
  { id:'b2', category:'身体活动', icon:'🤸', label:'拉伸1分钟',   desc:'活动肩、颈或背，感受身体舒展',        duration:'1分钟', color:'#9E8A7A' },
  { id:'b3', category:'身体活动', icon:'🚶', label:'走动2分钟',   desc:'起身，随意走几步，活动一下',          duration:'2分钟', color:'#7A8E9E' },
  { id:'b4', category:'身体活动', icon:'🦩', label:'单脚平衡',    desc:'单脚站立30秒，锻炼平衡感',           duration:'1分钟', color:'#9E7A8A' },
  { id:'b5', category:'身体活动', icon:'🌬️', label:'深呼吸10次', desc:'慢慢呼吸10次，4秒吸，6秒呼',         duration:'2分钟', color:'#7C9E7A' },
  { id:'c1', category:'创意想象', icon:'📖', label:'改写一个结局', desc:'给你最近看的故事想一个新结局',        duration:'3分钟', color:'#8E7A9E' },
  { id:'c2', category:'创意想象', icon:'🦸', label:'设计一个角色', desc:'想象一个新的人物设定，越奇特越好',    duration:'3分钟', color:'#9E7A9A' },
  { id:'c3', category:'创意想象', icon:'✍️', label:'编一个小故事', desc:'用3句话编一个完整的小故事',          duration:'3分钟', color:'#9E9A7A' },
  { id:'c4', category:'创意想象', icon:'💡', label:'想一个新发明', desc:'想象一个新发明，它能解决什么问题',    duration:'3分钟', color:'#7A9E8E' },
  { id:'m1', category:'记忆学习', icon:'🧠', label:'回忆昨天读的', desc:'回忆昨天看到或读到的一件事',         duration:'2分钟', color:'#9E8A7A' },
  { id:'m2', category:'记忆学习', icon:'📚', label:'复述一个知识', desc:'用自己的话说出一个你记得的知识点',   duration:'2分钟', color:'#7A8A9E' },
  { id:'m3', category:'记忆学习', icon:'🔤', label:'想5个英文单词',desc:'回忆或想出5个有趣的英文单词',        duration:'2分钟', color:'#8E9E7A' },
  { id:'m4', category:'记忆学习', icon:'🎵', label:'回忆一段歌词', desc:'试着完整回忆一首歌的某一段歌词',     duration:'2分钟', color:'#9E7A7A' },
  { id:'w1', category:'创作',    icon:'🖊️', label:'写一句日记',  desc:'用一句话记录此刻的状态或想法',        duration:'2分钟', color:'#9E7A8A' },
  { id:'w2', category:'创作',    icon:'❓', label:'写一个问题',   desc:'写下一个想以后深入研究的问题',        duration:'1分钟', color:'#7A9EAE' },
  { id:'w3', category:'创作',    icon:'😊', label:'设计新表情',   desc:'用文字或简单符号设计一个新表情',      duration:'2分钟', color:'#AE9E7A' },
  { id:'w4', category:'创作',    icon:'🎨', label:'画一个涂鸦',   desc:'随手画一个小涂鸦，不限主题',         duration:'3分钟', color:'#7A9E82' },
  { id:'o1', category:'微整理',  icon:'🗂️', label:'整理5件物品', desc:'把桌上随意摆放的5件东西放好',         duration:'2分钟', color:'#9E9A7A' },
  { id:'o2', category:'微整理',  icon:'🖥️', label:'清理桌面文件',desc:'删掉或归档电脑桌面上的旧文件',        duration:'3分钟', color:'#7A8E9E' },
  { id:'o3', category:'微整理',  icon:'📚', label:'把书摆整齐',   desc:'把旁边的书或物品重新摆放整齐',        duration:'1分钟', color:'#9E8A7A' },
  { id:'o4', category:'微整理',  icon:'🧹', label:'擦一块桌面',   desc:'拿纸巾擦干净眼前的一小块桌面',        duration:'1分钟', color:'#8A9E7A' },
  { id:'r1', category:'社交',    icon:'💬', label:'问候一个朋友', desc:'给一个最近没联系的朋友发一句话',      duration:'2分钟', color:'#7A9EAE' },
  { id:'r2', category:'社交',    icon:'❤️', label:'感谢家人',     desc:'给家人发一条感谢或关心的消息',        duration:'2分钟', color:'#9E7A7A' },
  { id:'r3', category:'社交',    icon:'🌟', label:'写一句鼓励',   desc:'给自己或某人写一句鼓励的话',          duration:'1分钟', color:'#AE9A7A' },
] : [
  { id:'s1', category:'Sensory',  icon:'🪟', label:'Find 5 colors',         desc:'Look around and spot 5 different colored objects',       duration:'1 min', color:'#7A9E82' },
  { id:'s2', category:'Sensory',  icon:'👂', label:'Name 3 sounds',         desc:'Listen and identify at least 3 distinct sound sources',  duration:'1 min', color:'#7A8E9E' },
  { id:'s3', category:'Sensory',  icon:'☁️', label:'Watch the clouds',      desc:'Look at the sky and see what shapes you find',           duration:'1 min', color:'#8A9EAE' },
  { id:'s4', category:'Sensory',  icon:'🔍', label:'Spot a new detail',     desc:"Find one thing in the room you've never noticed",        duration:'1 min', color:'#9E9A7A' },
  { id:'s5', category:'Sensory',  icon:'🧘', label:'Eyes closed 30s',       desc:'Close eyes 30 seconds, then list what you heard',       duration:'1 min', color:'#7A9E9A' },
  { id:'b1', category:'Movement', icon:'🏋️', label:'10 squats',            desc:'Do 10–20 slow squats, feel your legs working',           duration:'2 min', color:'#9E7A7A' },
  { id:'b2', category:'Movement', icon:'🤸', label:'Stretch 1 min',         desc:'Roll your shoulders, neck, or back',                    duration:'1 min', color:'#9E8A7A' },
  { id:'b3', category:'Movement', icon:'🚶', label:'Walk 2 min',            desc:'Stand up and take a short walk around',                 duration:'2 min', color:'#7A8E9E' },
  { id:'b4', category:'Movement', icon:'🦩', label:'Balance on one foot',   desc:'Stand on one foot for 30 seconds',                      duration:'1 min', color:'#9E7A8A' },
  { id:'b5', category:'Movement', icon:'🌬️', label:'10 deep breaths',      desc:'Breathe slowly: 4 seconds in, 6 seconds out',           duration:'2 min', color:'#7C9E7A' },
  { id:'c1', category:'Creative', icon:'📖', label:'Rewrite an ending',     desc:'Imagine a new ending for something you recently watched',duration:'3 min', color:'#8E7A9E' },
  { id:'c2', category:'Creative', icon:'🦸', label:'Design a character',    desc:"Invent a new character — the weirder the better",        duration:'3 min', color:'#9E7A9A' },
  { id:'c3', category:'Creative', icon:'✍️', label:'Write a 3-line story',  desc:'Make up a complete story in exactly 3 sentences',       duration:'3 min', color:'#9E9A7A' },
  { id:'c4', category:'Creative', icon:'💡', label:'Invent something',      desc:'Imagine a new invention — what problem does it solve?', duration:'3 min', color:'#7A9E8E' },
  { id:'m1', category:'Memory',   icon:'🧠', label:'Recall yesterday',      desc:'Remember one thing you read or saw yesterday',          duration:'2 min', color:'#9E8A7A' },
  { id:'m2', category:'Memory',   icon:'📚', label:'Explain something',     desc:'Describe a piece of knowledge in your own words',       duration:'2 min', color:'#7A8A9E' },
  { id:'m3', category:'Memory',   icon:'🔤', label:'5 interesting words',   desc:'Recall or think of 5 interesting words',                duration:'2 min', color:'#8E9E7A' },
  { id:'m4', category:'Memory',   icon:'🎵', label:'Recall song lyrics',    desc:'Try to recall a full verse from memory',                duration:'2 min', color:'#9E7A7A' },
  { id:'w1', category:'Writing',  icon:'🖊️', label:'One diary sentence',   desc:'Write one sentence capturing how you feel right now',   duration:'2 min', color:'#9E7A8A' },
  { id:'w2', category:'Writing',  icon:'❓', label:'Write a question',      desc:"Write down something you'd like to research later",     duration:'1 min', color:'#7A9EAE' },
  { id:'w3', category:'Writing',  icon:'😊', label:'Design an emoji',       desc:'Create a new emoji using text or symbols',              duration:'2 min', color:'#AE9E7A' },
  { id:'w4', category:'Writing',  icon:'🎨', label:'Doodle something',      desc:'Draw a quick doodle — any topic at all',                duration:'3 min', color:'#7A9E82' },
  { id:'o1', category:'Tidy',     icon:'🗂️', label:'Tidy 5 things',        desc:'Put away 5 randomly placed items on your desk',         duration:'2 min', color:'#9E9A7A' },
  { id:'o2', category:'Tidy',     icon:'🖥️', label:'Clear desktop files',  desc:'Delete or archive old files cluttering your desktop',   duration:'3 min', color:'#7A8E9E' },
  { id:'o3', category:'Tidy',     icon:'📚', label:'Straighten books',      desc:'Neatly arrange the books or items next to you',         duration:'1 min', color:'#9E8A7A' },
  { id:'o4', category:'Tidy',     icon:'🧹', label:'Wipe a surface',        desc:'Use a tissue to clean a small area of your desk',       duration:'1 min', color:'#8A9E7A' },
  { id:'r1', category:'Social',   icon:'💬', label:'Message a friend',      desc:"Send a quick hello to someone you haven't talked to lately", duration:'2 min', color:'#7A9EAE' },
  { id:'r2', category:'Social',   icon:'❤️', label:'Thank a family member', desc:'Send a message of gratitude or care to someone at home', duration:'2 min', color:'#9E7A7A' },
  { id:'r3', category:'Social',   icon:'🌟', label:'Write encouragement',   desc:'Write an encouraging note — to yourself or someone else', duration:'1 min', color:'#AE9A7A' },
];

const APP_PACKAGES: Record<string,string> = {
  '抖音':   'com.ss.android.ugc.aweme',
  '快手':   'com.kuaishou.nebula',
  '视频号': 'com.tencent.weishi',
  'B站':    'tv.danmaku.bili',
  '小红书': 'com.xingin.xhs',
  'YouTube':'com.google.android.youtube',
  'TikTok': 'com.zhiliaoapp.musically',
  '西瓜视频':'com.xixi.livevideo',
};

// ─── SHARED COMPONENTS ───
function Tag({ label }: { label: string }) {
  return <Text style={st.tag}>{label}</Text>;
}
function Title({ children, style }: any) {
  return <Text style={[st.title, style]}>{children}</Text>;
}
function Body({ children, style }: any) {
  return <Text style={[st.body, style]}>{children}</Text>;
}
function PrimaryBtn({ onPress, disabled, label }: { onPress:()=>void; disabled?:boolean; label:string }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[st.primaryBtn, disabled && st.primaryBtnDisabled]}>
      <Text style={st.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}
function GhostBtn({ onPress, label, style }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[st.ghostBtn, style]}>
      <Text style={st.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}
function BackBtn({ onPress }: { onPress: ()=>void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{top:10,bottom:10,left:10,right:10}}>
      <Text style={st.backBtn}>{S.back}</Text>
    </TouchableOpacity>
  );
}
function Dots({ total, cur }: { total:number; cur:number }) {
  return (
    <View style={st.dots}>
      {Array.from({length:total}).map((_,i) => (
        <View key={i} style={[st.dot, i===cur && st.dotActive]} />
      ))}
    </View>
  );
}
function Toggle({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} activeOpacity={0.8}
      style={[st.toggle, value && st.toggleOn]}>
      <View style={[st.toggleThumb, value && st.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

// ─── STEP: WELCOME ───
function StepWelcome({ onNext }: { onNext:()=>void }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(anim,{toValue:1,duration:500,useNativeDriver:true}).start(); },[]);
  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{opacity:anim}}>
          <Text style={st.logoEmoji}>🪨</Text>
          <Tag label={S.welcome_tag} />
          <Text style={st.brandName}>{ZH ? '先别 NotYet' : 'NotYet.'}</Text>
          <Body style={{marginBottom:28}}>{S.welcome_tagline}</Body>
          <View style={st.featuresBox}>
            {S.features.map(([icon,t,d]) => (
              <View key={t as string} style={st.featureRow}>
                <Text style={st.featureIcon}>{icon}</Text>
                <View style={{flex:1}}>
                  <Text style={st.featureTitle}>{t}</Text>
                  <Text style={st.featureDesc}>{d}</Text>
                </View>
              </View>
            ))}
          </View>
          <PrimaryBtn onPress={onNext} label={S.welcome_cta} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STEP: PERMISSION ───
function StepPermission({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = setInterval(async () => {
      try {
        const ok = await AccessibilityModule.isAccessibilityEnabled();
        setEnabled(ok);
      } catch {}
    }, 1500);
    return () => clearInterval(check);
  }, []);

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={st.stepHeader}>
          <BackBtn onPress={onBack} />
          <Dots total={4} cur={0} />
          <View style={{width:40}} />
        </View>
        <View style={st.interceptDiagram}>
          <Text style={st.diagramApp}>🎵</Text>
          <View style={st.diagramArrow}><Text style={st.diagramLogo}>🪨</Text></View>
          <Text style={st.diagramApp}>🧘</Text>
        </View>
        <Tag label={S.perm_tag} />
        <Title>{S.perm_title}</Title>
        <Body style={{marginBottom:16}}>{S.perm_body}</Body>
        <View style={st.permPoints}>
          {S.perm_points.map((p,i) => (
            <View key={i} style={st.permRow}>
              <Text style={st.permCheck}>✓</Text>
              <Text style={st.permText}>{p}</Text>
            </View>
          ))}
        </View>
        <View style={{flex:1, minHeight:24}} />
        {enabled
          ? <PrimaryBtn onPress={onNext} label={S.perm_check} />
          : <PrimaryBtn onPress={() => AccessibilityModule.openAccessibilitySettings()} label={S.perm_cta} />
        }
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STEP: GUIDE ───
function StepGuide({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [active, setActive] = useState(0);
  const steps = S.guide_steps;
  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={st.stepHeader}>
          <BackBtn onPress={onBack} />
          <Dots total={4} cur={1} />
          <View style={{width:40}} />
        </View>
        <Tag label={S.guide_tag} />
        <Title style={{marginBottom:20}}>{S.guide_title}</Title>
        {steps.map((step,i) => (
          <TouchableOpacity key={i} onPress={() => setActive(i)} activeOpacity={0.8}
            style={[st.guideStep, active===i && st.guideStepActive]}>
            <View style={[st.guideNum, i<active && st.guideNumDone, active===i && st.guideNumCur]}>
              <Text style={st.guideNumText}>{i<active ? '✓' : i+1}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={st.guideTitle}>{step.icon} {step.title}</Text>
              {active===i && <>
                <Text style={st.guideDesc}>{step.desc}</Text>
                {step.note && <View style={st.guideNote}><Text style={st.guideNoteText}>{step.note}</Text></View>}
              </>}
            </View>
          </TouchableOpacity>
        ))}
        <View style={st.guideBtns}>
          {active < steps.length-1 ? <>
            <TouchableOpacity onPress={()=>setActive(a=>Math.max(0,a-1))} disabled={active===0}
              style={[st.guideSecBtn, active===0 && {opacity:0.3}]}>
              <Text style={st.guideSecBtnText}>{S.guide_prev}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setActive(a=>Math.min(steps.length-1,a+1))}
              style={st.guideNextBtn}>
              <Text style={st.guideNextBtnText}>{S.guide_next}</Text>
            </TouchableOpacity>
          </> : <PrimaryBtn onPress={onNext} label={S.guide_done} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STEP: PICK ACTIVITIES ───
const CUSTOM_ICONS = ['⭐','🎯','🌈','🔥','💎','🎪','🌙','🎸','🍵','🧩','🏡','🌸'];
const CUSTOM_COLORS = ['#7C9E7A','#6A9BAF','#9E7A8A','#8E7A9E','#9E8A7A','#7A9E9A','#A89B6E','#9E7A7A'];

function StepPickActivities({ onNext, onBack }: { onNext:(acts:Activity[])=>void; onBack:()=>void }) {
  const [all, setAll] = useState<Activity[]>(ACTIVITIES);
  const [selected, setSelected] = useState(new Set<string>());
  const [cat, setCat] = useState(S.categories[1]);
  const [showModal, setShowModal] = useState(false);
  const MAX = 4;

  const cats = [S.pick_my_tab, ...S.categories];
  const toggle = (id:string) => setSelected(prev => {
    const n = new Set(prev);
    if (n.has(id)) { n.delete(id); return n; }
    if (n.size >= MAX) return prev;
    n.add(id); return n;
  });

  const handleAdd = (act: Activity) => {
    setAll(prev => [act, ...prev]);
    setCat(S.pick_my_tab);
    setSelected(prev => { if (prev.size >= MAX) return prev; return new Set([...prev, act.id]); });
    setShowModal(false);
  };

  const filtered = cat === S.pick_my_tab ? all.filter(a=>a.custom) : all.filter(a=>a.category===cat);
  const selectedItems = all.filter(a=>selected.has(a.id));
  const remaining = MAX - selected.size;
  const customCount = all.filter(a=>a.custom).length;

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <View style={st.stepHeader}>
        <BackBtn onPress={onBack} />
        <Dots total={4} cur={2} />
        <View style={{width:40}} />
      </View>
      <Tag label={S.pick_tag} />
      <Title>{S.pick_title}</Title>
      <Body style={{marginBottom:10}}>{S.pick_subtitle}</Body>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10, maxHeight:36, flexShrink:0}}>
        {cats.map(c => {
          if (c===S.pick_my_tab && customCount===0) return null;
          return (
            <TouchableOpacity key={c} onPress={()=>setCat(c)} activeOpacity={0.8}
              style={[st.catTab, cat===c && st.catTabActive]}>
              <Text style={[st.catTabText, cat===c && st.catTabTextActive]}>
                {c}{c===S.pick_my_tab ? ` ${customCount}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={()=>setShowModal(true)} activeOpacity={0.8} style={st.catTabAdd}>
          <Text style={st.catTabAddText}>{S.pick_add}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Activity list */}
      <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={st.emptyState}>
            <Text style={{fontSize:32, marginBottom:10}}>🌱</Text>
            <Text style={st.emptyText}>{S.pick_empty}</Text>
          </View>
        )}
        {filtered.map(act => {
          const isSel = selected.has(act.id);
          const isFull = selected.size >= MAX && !isSel;
          return (
            <TouchableOpacity key={act.id} onPress={()=>toggle(act.id)} disabled={isFull}
              activeOpacity={0.8} style={[st.actCard, isSel && {backgroundColor:act.color}, isFull && {opacity:0.4}]}>
              <View style={[st.actIcon, isSel && {backgroundColor:'rgba(255,255,255,0.25)'}]}>
                <Text style={{fontSize:20}}>{act.icon}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={[st.actLabel, isSel && {color:'#fff'}]}>{act.label}</Text>
                <Text style={[st.actDesc, isSel && {color:'rgba(255,255,255,0.78)'}]}>{act.desc}</Text>
              </View>
              <View style={{alignItems:'flex-end', gap:4}}>
                <Text style={[st.actDuration, isSel && {color:'rgba(255,255,255,0.65)'}]}>{act.duration}</Text>
                <View style={[st.actCheck, isSel && {backgroundColor:'rgba(255,255,255,0.9)', borderWidth:0}]}>
                  {isSel && <Text style={[st.actCheckMark, {color:act.color}]}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{height:10}} />
      </ScrollView>

      {/* Summary + CTA */}
      <View style={st.pickSummary}>
        {selected.size === 0
          ? <Text style={st.pickSummaryEmpty}>{S.pick_summary_empty}</Text>
          : <>
              <Text style={st.pickSummaryLabel}>{S.pick_selected(selected.size, MAX, remaining)}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedItems.map(a => (
                  <View key={a.id} style={[st.pickChip, {backgroundColor:a.color}]}>
                    <Text style={{fontSize:12}}>{a.icon}</Text>
                    <Text style={st.pickChipText}>{a.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
        }
      </View>
      <PrimaryBtn
        onPress={() => onNext(selectedItems)}
        disabled={selected.size < MAX}
        label={remaining > 0 ? S.pick_cta_partial(remaining) : S.pick_cta_done}
      />

      {/* Custom modal */}
      {showModal && <CustomModal onAdd={handleAdd} onClose={()=>setShowModal(false)} />}
    </SafeAreaView>
  );
}

function CustomModal({ onAdd, onClose }: { onAdd:(a:Activity)=>void; onClose:()=>void }) {
  const [label, setLabel] = useState('');
  const [desc, setDesc]   = useState('');
  const [dur, setDur]     = useState(ZH ? '2分钟' : '2 min');
  const [icon, setIcon]   = useState('⭐');
  const [color, setColor] = useState(CUSTOM_COLORS[0]);
  const [err, setErr]     = useState('');
  const durs = ZH ? ['1分钟','2分钟','3分钟','5分钟'] : ['1 min','2 min','3 min','5 min'];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={st.modalOverlay}>
        <View style={st.modalSheet}>
          <View style={st.modalHandle} />
          <View style={st.modalHeader}>
            <Text style={st.modalTitle}>{ZH ? '自定义微活动' : 'Custom activity'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={st.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={st.inputLabel}>{ZH ? '选一个图标' : 'PICK AN ICON'}</Text>
            <View style={st.iconGrid}>
              {CUSTOM_ICONS.map(ic => (
                <TouchableOpacity key={ic} onPress={()=>setIcon(ic)}
                  style={[st.iconBtn, icon===ic && st.iconBtnActive]}>
                  <Text style={{fontSize:18}}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={st.inputLabel}>{ZH ? '选一个颜色' : 'PICK A COLOR'}</Text>
            <View style={st.colorRow}>
              {CUSTOM_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={()=>setColor(c)}
                  style={[st.colorDot, {backgroundColor:c}, color===c && st.colorDotActive]} />
              ))}
            </View>
            <Text style={st.inputLabel}>{ZH ? '活动名称' : 'ACTIVITY NAME'}</Text>
            <TextInput value={label} onChangeText={t=>{setLabel(t);setErr('');}}
              placeholder={ZH ? '例：做一道数独' : 'e.g. Do a sudoku'}
              maxLength={12} style={st.textInput} />
            <Text style={st.inputLabel}>{ZH ? '怎么做（选填）' : 'HOW TO DO IT (optional)'}</Text>
            <TextInput value={desc} onChangeText={t=>setDesc(t)}
              placeholder={ZH ? '例：拿出数独本，填完一道简单的' : 'e.g. Grab the sudoku book'}
              maxLength={30} style={st.textInput} />
            <Text style={st.inputLabel}>{ZH ? '需要多久' : 'HOW LONG'}</Text>
            <View style={st.durRow}>
              {durs.map(d => (
                <TouchableOpacity key={d} onPress={()=>setDur(d)}
                  style={[st.durBtn, dur===d && st.durBtnActive]}>
                  <Text style={[st.durBtnText, dur===d && st.durBtnTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Preview */}
            <View style={[st.actCard, {backgroundColor:color, marginTop:12}]}>
              <View style={[st.actIcon, {backgroundColor:'rgba(255,255,255,0.25)'}]}>
                <Text style={{fontSize:20}}>{icon}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={[st.actLabel, {color:'#fff'}]}>{label || (ZH ? '活动名称' : 'Activity name')}</Text>
                <Text style={[st.actDesc, {color:'rgba(255,255,255,0.78)'}]}>{desc || (ZH ? '暂无描述' : 'No description')} · {dur}</Text>
              </View>
            </View>
            {err ? <Text style={st.errText}>{err}</Text> : null}
            <TouchableOpacity onPress={()=>{
              if (!label.trim()) { setErr(ZH ? '请给这个活动起个名字' : 'Please add a name'); return; }
              onAdd({id:`custom_${Date.now()}`,category:S.pick_my_tab,icon,label:label.trim(),desc:desc.trim(),duration:dur,color,custom:true});
            }} style={st.modalAddBtn}>
              <Text style={st.primaryBtnText}>{ZH ? '添加这个活动 +' : 'Add this activity +'}</Text>
            </TouchableOpacity>
            <View style={{height:20}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── STEP: SELECT APPS ───
const APPS = [
  {icon:'🎵',name:'抖音'},{icon:'▶️',name:'快手'},
  {icon:'📱',name:'视频号'},{icon:'🎬',name:'B站'},
  {icon:'🎞',name:'小红书'},{icon:'▷',name:'YouTube'},
  {icon:'🎭',name:'TikTok'},{icon:'📺',name:'西瓜视频'},
];
function StepSelectApps({ onNext, onBack }: { onNext:(apps:string[])=>void; onBack:()=>void }) {
  const [sel, setSel] = useState(new Set(['抖音','快手']));
  const toggle = (n:string) => setSel(s => { const x=new Set(s); x.has(n)?x.delete(n):x.add(n); return x; });
  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={st.stepHeader}>
          <BackBtn onPress={onBack} />
          <Dots total={4} cur={2} />
          <View style={{width:40}} />
        </View>
        <Tag label={S.apps_tag} />
        <Title>{S.apps_title}</Title>
        <Body style={{marginBottom:20}}>{S.apps_subtitle}</Body>
        <View style={st.appGrid}>
          {APPS.map(app => {
            const on = sel.has(app.name);
            return (
              <TouchableOpacity key={app.name} onPress={()=>toggle(app.name)} activeOpacity={0.8}
                style={st.appItem}>
                <View style={[st.appIcon, on && st.appIconOn]}>
                  <Text style={{fontSize:26}}>{app.icon}</Text>
                  {on && <View style={st.appCheck}><Text style={{fontSize:9,color:'#fff'}}>✓</Text></View>}
                </View>
                <Text style={[st.appName, on && {color:C.ink, fontWeight:'600'}]}>{app.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={st.tipBox}>
          <Text style={{fontSize:14}}>💡</Text>
          <Text style={st.tipText}>{S.apps_tip(sel.size)}</Text>
        </View>
        <PrimaryBtn onPress={()=>onNext([...sel])} disabled={sel.size===0} label={S.apps_cta} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STEP: TIME RANGE ───
function StepTimeRange({ onNext, onBack }: { onNext:(tr:any)=>void; onBack:()=>void }) {
  const [startH, setStartH] = useState(9);
  const [endH, setEndH]     = useState(22);
  const [enabled, setEnabled] = useState(true);
  const span = endH > startH ? endH - startH : 24 - startH + endH;

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={st.stepHeader}>
          <BackBtn onPress={onBack} />
          <Dots total={4} cur={3} />
          <View style={{width:40}} />
        </View>
        <Tag label={S.time_tag} />
        <Title>{S.time_title}</Title>
        <Body style={{marginBottom:20}}>{S.time_subtitle}</Body>

        {/* Toggle */}
        <View style={st.toggleRow}>
          <View>
            <Text style={st.toggleLabel}>{S.time_toggle}</Text>
            <Text style={st.toggleSub}>{S.time_toggle_sub}</Text>
          </View>
          <Toggle value={enabled} onChange={setEnabled} />
        </View>

        <View style={{opacity: enabled ? 1 : 0.35}}>
          {/* Hour pickers */}
          <View style={st.timePickerRow}>
            <View style={{flex:1}}>
              <Text style={st.timeLabel}>{S.time_start}</Text>
              <ScrollView style={st.hourScroll} showsVerticalScrollIndicator={false} snapToInterval={44}>
                {Array.from({length:24},(_,i)=>i).map(h => (
                  <TouchableOpacity key={h} onPress={()=>enabled && setStartH(h)}
                    style={[st.hourItem, startH===h && st.hourItemActive]}>
                    <Text style={[st.hourText, startH===h && st.hourTextActive]}>{S.time_fmt(h)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={st.timeArrow}>→</Text>
            <View style={{flex:1}}>
              <Text style={st.timeLabel}>{S.time_end}</Text>
              <ScrollView style={st.hourScroll} showsVerticalScrollIndicator={false} snapToInterval={44}>
                {Array.from({length:24},(_,i)=>i).map(h => (
                  <TouchableOpacity key={h} onPress={()=>enabled && setEndH(h)}
                    style={[st.hourItem, endH===h && st.hourItemActive]}>
                    <Text style={[st.hourText, endH===h && st.hourTextActive]}>{S.time_fmt(h)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Summary */}
          <View style={st.timeSummary}>
            {startH === endH
              ? <Text style={st.timeSameText}>{S.time_same}</Text>
              : <Text style={st.timeRangeText}>
                  <Text style={{fontWeight:'700'}}>{S.time_fmt(startH)} — {S.time_fmt(endH)}</Text>
                  {ZH ? `，共 ${span} 小时` : `  ·  ${span}h`}
                </Text>
            }
          </View>

          {/* Presets */}
          <Text style={[st.tag, {marginBottom:8}]}>{ZH ? '快速选择' : 'QUICK SELECT'}</Text>
          <View style={st.presetRow}>
            {(S.time_presets as any[]).map(([label,s,e]) => (
              <TouchableOpacity key={label} onPress={()=>{setStartH(s); setEndH(e);}}
                style={st.presetBtn}>
                <Text style={st.presetText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{minHeight:24}} />
        <PrimaryBtn
          onPress={() => onNext({enabled, startH, endH})}
          disabled={enabled && startH===endH}
          label={S.time_cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STEP: DONE ───
function StepDone({ onFinish }: { onFinish:()=>void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse,{toValue:1.08,duration:1200,useNativeDriver:true}),
      Animated.timing(pulse,{toValue:1,duration:1200,useNativeDriver:true}),
    ])).start();
  },[]);
  return (
    <SafeAreaView style={[st.screen, {backgroundColor:C.ink}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />
      <View style={[st.scrollContent, {flex:1, justifyContent:'center', alignItems:'center'}]}>
        <Animated.Text style={[st.logoEmoji, {transform:[{scale:pulse}], marginBottom:24}]}>🪨</Animated.Text>
        <Tag label={S.done_tag} />
        <Text style={[st.brandName, {color:C.cream}]}>{ZH ? '先别 NotYet' : 'NotYet.'}</Text>
        <Body style={{color:'rgba(245,240,232,0.65)', textAlign:'center', marginBottom:32}}>{S.done_body}</Body>
        <View style={st.statsBox}>
          {(ZH
            ? [['0','次拦截'],['0 min','已节省'],['—','微活动']]
            : [['0','intercepts'],['0 min','saved'],['—','activities']]
          ).map(([v,l]) => (
            <View key={l} style={{alignItems:'center'}}>
              <Text style={st.statVal}>{v}</Text>
              <Text style={st.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={onFinish} activeOpacity={0.85} style={st.doneBtn}>
          <Text style={st.doneBtnText}>{S.done_cta}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── RUNTIME: INTERCEPT ───
function RuntimeIntercept({ myActivities, timeRange, sourcePackage, onReset }:
  { myActivities:Activity[]; timeRange:any; sourcePackage:string; onReset:()=>void }) {
  const [phase, setPhase] = useState<'intercept'|'doing'|'bypass'>('intercept');
  const [countdown, setCountdown] = useState(5);
  const [bypassReady, setBypassReady] = useState(false);
  const [selected, setSelected] = useState<Activity|null>(null);
  const [prompt] = useState(() => S.prompts[Math.floor(Math.random()*S.prompts.length)]);
  const breathe = useRef(new Animated.Value(1)).current;

  // 打开目标 app 然后切到 bypass 页
  const launchAndBypass = async () => {
    if (sourcePackage) {
      try { await AccessibilityModule.launchApp(sourcePackage); } catch {}
    }
    setPhase('bypass');
  };

  const isActive = () => {
    if (!timeRange || !timeRange.enabled) return true;
    const h = new Date().getHours();
    const { startH, endH } = timeRange;
    if (startH === endH) return true;
    if (startH < endH) return h >= startH && h < endH;
    return h >= startH || h < endH;
  };

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(breathe,{toValue:1.1,duration:1500,useNativeDriver:true}),
      Animated.timing(breathe,{toValue:1,duration:1500,useNativeDriver:true}),
    ])).start();
  },[]);

  useEffect(() => {
    if (phase==='intercept' && countdown>0) {
      const t = setTimeout(()=>setCountdown(c=>c-1), 1000);
      return () => clearTimeout(t);
    }
    if (countdown===0) setBypassReady(true);
  },[phase,countdown]);

  const tod = () => {
    const h = new Date().getHours();
    if (h<6) return ZH ? '🌙 深夜' : '🌙 Late night';
    if (h<12) return ZH ? '☀️ 早上' : '☀️ Morning';
    if (h<14) return ZH ? '🌤 午后' : '🌤 Midday';
    if (h<18) return ZH ? '🌞 下午' : '🌞 Afternoon';
    if (h<21) return ZH ? '🌆 傍晚' : '🌆 Evening';
    return ZH ? '🌙 夜里' : '🌙 Night';
  };

  if (!isActive()) {
    const { startH, endH } = timeRange;
    return (
      <SafeAreaView style={st.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
        <View style={[st.scrollContent, {flex:1, justifyContent:'center', alignItems:'center'}]}>
          <Text style={{fontSize:44, marginBottom:18}}>🌙</Text>
          <Tag label={ZH ? '拦截未激活' : 'NOT ACTIVE'} />
          <Title style={{textAlign:'center'}}>{ZH ? '现在自由时间' : 'Free time now'}</Title>
          <Body style={{textAlign:'center', maxWidth:260}}>
            {ZH
              ? `先别NotYet 在 ${startH}:00 — ${endH}:00 之间守护你。\n现在随意，好好享受。`
              : `NotYet guards you between ${startH}:00 — ${endH}:00.\nEnjoy your free time.`}
          </Body>
          <TouchableOpacity onPress={onReset} style={{marginTop:28}}>
            <Text style={st.backBtn}>{S.reset}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase==='intercept') return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <ScrollView contentContainerStyle={[st.scrollContent, {alignItems:'center'}]} showsVerticalScrollIndicator={false}>
        <Text style={st.tag}>{tod()}</Text>
        <Text style={[st.title, {textAlign:'center', marginBottom:20, maxWidth:SW-60}]}>{prompt}</Text>
        <View style={{width:36, height:1, backgroundColor:C.border, marginBottom:24}} />

        <Animated.View style={[st.countdown, {transform:[{scale:breathe}]}]}>
          <View style={st.countdownInner}>
            <Text style={st.countdownText}>{countdown>0 ? countdown : '✓'}</Text>
          </View>
        </Animated.View>
        <Text style={[st.tag, {marginBottom:24}]}>{countdown>0 ? S.intercept_pausing : S.intercept_ready}</Text>

        <Text style={[st.tag, {marginBottom:10}]}>{S.intercept_activities}</Text>
        <View style={st.actGrid}>
          {myActivities.map(act => (
            <TouchableOpacity key={act.id} onPress={()=>{setSelected(act);setPhase('doing');}}
              activeOpacity={0.8} style={st.actGridItem}>
              <Text style={{fontSize:20, marginBottom:4}}>{act.icon}</Text>
              <Text style={st.actGridLabel}>{act.label}</Text>
              <Text style={st.actGridDur}>{act.duration}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={launchAndBypass} disabled={!bypassReady}
          activeOpacity={0.7} style={[st.bypassBtn, !bypassReady && {opacity:0.4}]}>
          <Text style={st.bypassBtnText}>
            {bypassReady ? S.intercept_bypass : S.intercept_waiting(countdown)}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  if (phase==='doing' && selected) return (
    <SafeAreaView style={[st.screen, {backgroundColor:selected.color}]}>
      <StatusBar barStyle="light-content" backgroundColor={selected.color} />
      <View style={[st.scrollContent, {flex:1, justifyContent:'center', alignItems:'center'}]}>
        <Text style={{fontSize:72, marginBottom:20}}>{selected.icon}</Text>
        <Text style={[st.tag, {color:'rgba(255,255,255,0.7)'}]}>{S.doing_tag}</Text>
        <Text style={[st.title, {color:'#fff', textAlign:'center', fontSize:28}]}>{selected.label}</Text>
        <Text style={[st.body, {color:'rgba(255,255,255,0.82)', textAlign:'center', maxWidth:260, marginBottom:28}]}>{selected.desc}</Text>
        <View style={st.durationBox}>
          <Text style={[st.tag, {color:'rgba(255,255,255,0.65)'}]}>{S.doing_duration}</Text>
          <Text style={{fontSize:22, color:'#fff', fontWeight:'600', fontFamily:F.serif}}>{selected.duration}</Text>
        </View>
        <TouchableOpacity onPress={()=>{setPhase('intercept');setCountdown(5);setBypassReady(false);}}
          activeOpacity={0.85} style={[st.primaryBtn, {backgroundColor:'rgba(255,255,255,0.95)', marginTop:32}]}>
          <Text style={[st.primaryBtnText, {color:C.ink}]}>{S.doing_done}</Text>
        </TouchableOpacity>
        <GhostBtn onPress={launchAndBypass} label={S.doing_skip}
          style={{borderColor:'rgba(255,255,255,0.35)', marginTop:10}} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <View style={[st.scrollContent, {flex:1, justifyContent:'center', alignItems:'center'}]}>
        <Text style={{fontSize:44, marginBottom:18}}>👋</Text>
        <Title style={{textAlign:'center'}}>{S.bypass_title}</Title>
        <Body style={{textAlign:'center', maxWidth:250, marginBottom:32}}>{S.bypass_body}</Body>
        <View style={st.statsBox}>
          {(ZH
            ? [['1','次拦截'],['0','微活动'],['—','节省时间']]
            : [['1','intercepts'],['0','activities'],['—','time saved']]
          ).map(([v,l]) => (
            <View key={l} style={{alignItems:'center'}}>
              <Text style={[st.statVal, {color:C.ink}]}>{v}</Text>
              <Text style={[st.statLabel, {color:C.muted}]}>{l}</Text>
            </View>
          ))}
        </View>
        <PrimaryBtn onPress={onReset} label={S.reset} />
      </View>
    </SafeAreaView>
  );
}

// ─── ROOT ───
export default function App() {
  const [step, setStep] = useState(-1); // -1 = loading
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [timeRange, setTimeRange] = useState<any>(null);
  const [sourcePackage, setSourcePackage] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const { interceptMode, sourcePackage: pkg } = await AccessibilityModule.getInterceptMode();
        if (interceptMode) {
          setSourcePackage(pkg || '');
          setStep(8); // jump to intercept
        } else {
          setStep(0);
        }
      } catch {
        setStep(0);
      }
    };
    init();
  }, []);

  if (step === -1) {
    return (
      <SafeAreaView style={[st.screen, {justifyContent:'center', alignItems:'center'}]}>
        <Text style={{fontSize:40}}>🪨</Text>
      </SafeAreaView>
    );
  }

  const next = () => setStep(s=>s+1);
  const back = () => setStep(s=>s-1);

  if (step===0) return <StepWelcome onNext={next} />;
  if (step===1) return <StepPermission onNext={next} onBack={back} />;
  if (step===2) return <StepGuide onNext={next} onBack={back} />;
  if (step===3) return <StepPickActivities onNext={acts=>{setMyActivities(acts);next();}} onBack={back} />;
  if (step===4) return <StepSelectApps onNext={async(apps)=>{
    try {
      const pkgs = apps.map(a=>APP_PACKAGES[a]).filter(Boolean);
      await AccessibilityModule.setTargetPackages(pkgs);
    } catch {}
    next();
  }} onBack={back} />;
  if (step===5) return <StepTimeRange onNext={async(tr)=>{
    setTimeRange(tr);
    try { await AccessibilityModule.setTimeRange(tr.enabled, tr.startH, tr.endH); } catch {}
    next();
  }} onBack={back} />;
  if (step===6) return <StepDone onFinish={next} />;
  return <RuntimeIntercept myActivities={myActivities.length>0 ? myActivities : ACTIVITIES.slice(0,4)} timeRange={timeRange} sourcePackage={sourcePackage} onReset={()=>setStep(0)} />;
}

// ─── STYLES ───
const st = StyleSheet.create({
  screen:           { flex:1, backgroundColor:C.cream },
  scrollContent:    { padding:24, paddingBottom:40 },
  tag:              { fontSize:10, letterSpacing:3, color:C.muted, fontFamily:F.mono, marginBottom:6, textTransform:'uppercase' },
  title:            { fontSize:22, color:C.ink, fontFamily:F.serif, fontWeight:'700', lineHeight:32, marginBottom:8 },
  body:             { fontSize:14, color:'#3A2E1E', lineHeight:22, fontFamily:F.serif },
  backBtn:          { color:C.muted, fontFamily:F.mono, fontSize:12, letterSpacing:1 },
  logoEmoji:        { fontSize:56, marginBottom:16 },
  brandName:        { fontSize:28, fontWeight:'900', color:C.ink, fontFamily:F.serif, marginBottom:8, letterSpacing:1 },
  featuresBox:      { backgroundColor:C.sand, borderRadius:20, padding:18, marginBottom:28 },
  featureRow:       { flexDirection:'row', gap:12, alignItems:'flex-start', marginBottom:14 },
  featureIcon:      { fontSize:18, marginTop:1 },
  featureTitle:     { fontSize:13, fontWeight:'600', color:C.ink, marginBottom:2 },
  featureDesc:      { fontSize:12, color:'#4A3E2E', lineHeight:18 },
  primaryBtn:       { width:'100%', padding:17, borderRadius:20, backgroundColor:C.ink, alignItems:'center', shadowColor:C.ink, shadowOffset:{width:0,height:8}, shadowOpacity:0.18, shadowRadius:24, elevation:6 },
  primaryBtnDisabled:{ backgroundColor:'#C8C0B0', shadowOpacity:0, elevation:0 },
  primaryBtnText:   { color:C.cream, fontSize:15, fontFamily:F.serif, letterSpacing:2 },
  ghostBtn:         { width:'100%', padding:14, borderRadius:16, borderWidth:1, borderColor:C.border, alignItems:'center', marginTop:8 },
  ghostBtnText:     { color:'#8A7E6E', fontSize:13, fontFamily:F.mono, letterSpacing:1 },
  dots:             { flexDirection:'row', gap:5, justifyContent:'center' },
  dot:              { width:6, height:6, borderRadius:3, backgroundColor:C.border },
  dotActive:        { width:18, backgroundColor:C.ink },
  toggle:           { width:46, height:26, borderRadius:13, backgroundColor:C.border, justifyContent:'center', padding:3 },
  toggleOn:         { backgroundColor:C.ink },
  toggleThumb:      { width:20, height:20, borderRadius:10, backgroundColor:C.cream, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.2, shadowRadius:2, elevation:2 },
  toggleThumbOn:    { alignSelf:'flex-end' },
  stepHeader:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  interceptDiagram: { flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:C.sand, borderRadius:20, padding:20, marginBottom:20 },
  diagramApp:       { fontSize:30 },
  diagramArrow:     { paddingHorizontal:12 },
  diagramLogo:      { fontSize:22 },
  permPoints:       { borderLeftWidth:2.5, borderLeftColor:C.border, paddingLeft:14, marginBottom:24 },
  permRow:          { flexDirection:'row', gap:8, marginBottom:9 },
  permCheck:        { color:C.green, flexShrink:0 },
  permText:         { fontSize:13, color:'#3A2E1E', lineHeight:20, flex:1 },
  guideStep:        { flexDirection:'row', gap:12, alignItems:'flex-start', padding:14, borderRadius:16, marginBottom:7, borderWidth:1.5, borderColor:'transparent' },
  guideStepActive:  { backgroundColor:C.sand, borderColor:C.border },
  guideNum:         { width:30, height:30, borderRadius:9, backgroundColor:'#D4C9B4', alignItems:'center', justifyContent:'center' },
  guideNumDone:     { backgroundColor:C.green },
  guideNumCur:      { backgroundColor:C.ink },
  guideNumText:     { color:C.cream, fontSize:12, fontWeight:'700', fontFamily:F.mono },
  guideTitle:       { fontSize:14, fontWeight:'600', color:C.ink },
  guideDesc:        { fontSize:12, color:'#3A2E1E', lineHeight:18, marginTop:4 },
  guideNote:        { backgroundColor:C.cream, borderRadius:9, padding:10, marginTop:8 },
  guideNoteText:    { fontSize:11, color:'#8A7E6E', fontFamily:F.mono, lineHeight:18 },
  guideBtns:        { flexDirection:'row', gap:8, marginTop:8 },
  guideSecBtn:      { flex:1, padding:13, borderRadius:14, borderWidth:1, borderColor:C.border, alignItems:'center' },
  guideSecBtnText:  { color:'#8A7E6E', fontSize:13, fontFamily:F.mono },
  guideNextBtn:     { flex:2, padding:13, borderRadius:14, backgroundColor:C.ink, alignItems:'center' },
  guideNextBtnText: { color:C.cream, fontSize:14, fontFamily:F.serif, letterSpacing:1 },
  catTab:           { paddingHorizontal:11, paddingVertical:6, borderRadius:20, backgroundColor:C.sand, marginRight:6, height:32, justifyContent:'center' },
  catTabActive:     { backgroundColor:C.ink },
  catTabText:       { fontSize:11, color:'#3A2E1E', fontFamily:F.mono },
  catTabTextActive: { color:C.cream },
  catTabAdd:        { paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1.5, borderColor:C.border, borderStyle:'dashed', marginRight:6 },
  catTabAddText:    { fontSize:11, color:C.muted, fontFamily:F.mono },
  emptyState:       { flex:1, alignItems:'center', justifyContent:'center', paddingTop:40 },
  emptyText:        { fontSize:13, color:C.muted, fontFamily:F.mono, textAlign:'center', lineHeight:20 },
  actCard:          { flexDirection:'row', alignItems:'center', gap:12, padding:12, borderRadius:16, backgroundColor:C.sand, marginBottom:8 },
  actIcon:          { width:42, height:42, borderRadius:13, backgroundColor:C.cream, alignItems:'center', justifyContent:'center' },
  actLabel:         { fontSize:14, fontWeight:'600', color:C.ink, marginBottom:2 },
  actDesc:          { fontSize:11, color:'#4A3E2E', lineHeight:16 },
  actDuration:      { fontSize:10, color:C.muted, fontFamily:F.mono },
  actCheck:         { width:20, height:20, borderRadius:10, borderWidth:1.5, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  actCheckMark:     { fontSize:10 },
  pickSummary:      { backgroundColor:C.sand, borderRadius:14, padding:12, marginBottom:10 },
  pickSummaryEmpty: { fontSize:11, color:C.muted, textAlign:'center', fontFamily:F.mono },
  pickSummaryLabel: { fontSize:10, color:C.muted, letterSpacing:2, fontFamily:F.mono, marginBottom:7 },
  pickChip:         { flexDirection:'row', alignItems:'center', gap:5, paddingLeft:6, paddingRight:10, paddingVertical:4, borderRadius:20, marginRight:6 },
  pickChipText:     { fontSize:11, color:'#fff', fontWeight:'600' },
  modalOverlay:     { flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end' },
  modalSheet:       { backgroundColor:C.cream, borderTopLeftRadius:28, borderTopRightRadius:28, padding:24, paddingBottom:40, maxHeight:'90%' },
  modalHandle:      { width:36, height:4, borderRadius:2, backgroundColor:C.border, alignSelf:'center', marginBottom:20 },
  modalHeader:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:18 },
  modalTitle:       { fontSize:18, color:C.ink, fontFamily:F.serif, fontWeight:'700' },
  modalClose:       { fontSize:18, color:C.muted },
  inputLabel:       { fontSize:10, color:C.muted, letterSpacing:3, fontFamily:F.mono, marginBottom:8, textTransform:'uppercase', marginTop:12 },
  iconGrid:         { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:4 },
  iconBtn:          { width:38, height:38, borderRadius:11, backgroundColor:C.sand, alignItems:'center', justifyContent:'center' },
  iconBtnActive:    { backgroundColor:C.ink },
  colorRow:         { flexDirection:'row', gap:8, marginBottom:4 },
  colorDot:         { width:28, height:28, borderRadius:14, borderWidth:3, borderColor:'transparent' },
  colorDotActive:   { borderColor:C.ink },
  textInput:        { padding:12, borderRadius:13, borderWidth:1.5, borderColor:'#D4C9B4', backgroundColor:'#fff', fontSize:14, fontFamily:F.serif, color:C.ink },
  durRow:           { flexDirection:'row', gap:8 },
  durBtn:           { flex:1, padding:10, borderRadius:11, backgroundColor:C.sand, alignItems:'center' },
  durBtnActive:     { backgroundColor:C.ink },
  durBtnText:       { fontSize:12, color:'#7A6E5E', fontFamily:F.mono },
  durBtnTextActive: { color:C.cream },
  errText:          { fontSize:12, color:'#9E7A7A', textAlign:'center', marginBottom:10, fontFamily:F.mono },
  modalAddBtn:      { padding:15, borderRadius:18, backgroundColor:C.ink, alignItems:'center', marginTop:8 },
  appGrid:          { flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:16 },
  appItem:          { width:(SW-48-36)/4, alignItems:'center', gap:6 },
  appIcon:          { width:58, height:58, borderRadius:17, backgroundColor:C.sand, alignItems:'center', justifyContent:'center', position:'relative' },
  appIconOn:        { backgroundColor:C.ink, shadowColor:C.ink, shadowOffset:{width:0,height:4}, shadowOpacity:0.22, shadowRadius:14, elevation:6 },
  appCheck:         { position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:9, backgroundColor:C.green, alignItems:'center', justifyContent:'center' },
  appName:          { fontSize:10, color:'#8A7E6E', fontFamily:F.mono },
  tipBox:           { backgroundColor:C.sand, borderRadius:14, padding:12, marginBottom:14, flexDirection:'row', gap:8, alignItems:'center' },
  tipText:          { fontSize:11, color:'#3A2E1E', lineHeight:17, flex:1 },
  toggleRow:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:C.sand, borderRadius:16, padding:16, marginBottom:16 },
  toggleLabel:      { fontSize:14, fontWeight:'600', color:C.ink },
  toggleSub:        { fontSize:11, color:C.muted, fontFamily:F.mono, marginTop:2 },
  timePickerRow:    { flexDirection:'row', gap:12, alignItems:'center', marginBottom:12 },
  timeLabel:        { fontSize:10, color:C.muted, letterSpacing:2, fontFamily:F.mono, marginBottom:6 },
  timeArrow:        { fontSize:18, color:C.border, paddingTop:24 },
  hourScroll:       { height:132, backgroundColor:C.sand, borderRadius:12 },
  hourItem:         { height:44, justifyContent:'center', alignItems:'center' },
  hourItemActive:   { backgroundColor:C.ink, borderRadius:10, marginHorizontal:4 },
  hourText:         { fontSize:14, color:C.ink, fontFamily:F.serif },
  hourTextActive:   { color:C.cream, fontWeight:'700' },
  timeSummary:      { backgroundColor:C.sand, borderRadius:14, padding:14, marginBottom:16, alignItems:'center' },
  timeSameText:     { fontSize:12, color:C.muted, fontFamily:F.mono },
  timeRangeText:    { fontSize:14, color:'#3A2E1E', fontFamily:F.serif, textAlign:'center', lineHeight:22 },
  presetRow:        { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  presetBtn:        { paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1.5, borderColor:'#D4C9B4' },
  presetText:       { fontSize:11, color:'#3A2E1E', fontFamily:F.mono },
  statsBox:         { flexDirection:'row', justifyContent:'space-around', width:'100%', backgroundColor:'rgba(255,255,255,0.07)', borderRadius:18, padding:18, marginBottom:28 },
  statVal:          { fontSize:20, fontWeight:'700', color:C.cream, marginBottom:3, fontFamily:F.serif },
  statLabel:        { fontSize:10, color:'rgba(245,240,232,0.4)', fontFamily:F.mono, letterSpacing:1 },
  doneBtn:          { width:'100%', padding:17, borderRadius:20, backgroundColor:C.cream, alignItems:'center' },
  doneBtnText:      { color:C.ink, fontSize:15, fontFamily:F.serif, letterSpacing:2, fontWeight:'700' },
  countdown:        { width:76, height:76, borderRadius:38, borderWidth:1.5, borderColor:C.muted, alignItems:'center', justifyContent:'center', marginBottom:8 },
  countdownInner:   { width:54, height:54, borderRadius:27, backgroundColor:'#D4C9B4', alignItems:'center', justifyContent:'center' },
  countdownText:    { fontSize:20, fontFamily:F.mono, color:'#5A4E3C', fontWeight:'700' },
  actGrid:          { flexDirection:'row', flexWrap:'wrap', gap:8, width:'100%', marginBottom:16 },
  actGridItem:      { width:(SW-48-8)/2, backgroundColor:C.sand, borderRadius:14, padding:12, alignItems:'flex-start' },
  actGridLabel:     { fontSize:13, fontWeight:'600', color:C.ink, lineHeight:18 },
  actGridDur:       { fontSize:10, color:C.muted, fontFamily:F.mono, marginTop:2 },
  bypassBtn:        { width:'100%', padding:13, borderRadius:16, borderWidth:1, borderColor:C.muted, alignItems:'center', marginBottom:20 },
  bypassBtnText:    { fontSize:12, color:C.muted, fontFamily:F.mono, letterSpacing:1 },
  durationBox:      { backgroundColor:'rgba(255,255,255,0.18)', borderRadius:18, paddingHorizontal:28, paddingVertical:14, alignItems:'center', marginBottom:8 },
});
