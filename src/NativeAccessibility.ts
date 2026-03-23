import { NativeModules, Platform } from 'react-native';

const { AccessibilityModule } = NativeModules;

export const Accessibility = {
  // 检查无障碍服务是否开启
  isEnabled: (): Promise<boolean> => {
    if (Platform.OS !== 'android') return Promise.resolve(false);
    return AccessibilityModule.isAccessibilityEnabled();
  },

  // 跳转系统无障碍设置
  openSettings: (): void => {
    if (Platform.OS !== 'android') return;
    AccessibilityModule.openAccessibilitySettings();
  },

  // 保存要拦截的 App 列表
  setTargetPackages: (packages: string[]): Promise<boolean> => {
    if (Platform.OS !== 'android') return Promise.resolve(false);
    return AccessibilityModule.setTargetPackages(packages);
  },

  // 保存拦截时间段
  setTimeRange: (enabled: boolean, startH: number, endH: number): Promise<boolean> => {
    if (Platform.OS !== 'android') return Promise.resolve(false);
    return AccessibilityModule.setTimeRange(enabled, startH, endH);
  },

  // 获取当前是否处于拦截模式
  getInterceptMode: (): Promise<{ interceptMode: boolean; sourcePackage: string }> => {
    if (Platform.OS !== 'android') return Promise.resolve({ interceptMode: false, sourcePackage: '' });
    return AccessibilityModule.getInterceptMode();
  },
};

// App 包名映射
export const APP_PACKAGES: Record<string, string> = {
  '抖音':   'com.ss.android.ugc.aweme',
  '快手':   'com.kuaishou.nebula',
  '视频号': 'com.tencent.weishi',
  'B站':    'tv.danmaku.bili',
  '小红书': 'com.xingin.xhs',
  'YouTube':'com.google.android.youtube',
  'TikTok': 'com.zhiliaoapp.musically',
  '西瓜视频':'com.xixi.livevideo',
};
