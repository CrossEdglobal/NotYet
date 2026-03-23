package com.notyet

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class NotYetAccessibilityService : AccessibilityService() {

    // Apps to intercept — will be updated from JS via SharedPreferences
    private val defaultTargetPackages = setOf(
        "com.ss.android.ugc.aweme",   // 抖音
        "com.kuaishou.nebula",         // 快手
        "com.tencent.weishi",          // 视频号
        "tv.danmaku.bili",             // B站
        "com.xingin.xhs",              // 小红书
        "com.google.android.youtube",  // YouTube
        "com.zhiliaoapp.musically",    // TikTok
        "com.xixi.livevideo",          // 西瓜视频
    )

    private var lastInterceptedPackage: String? = null
    private var lastInterceptTime: Long = 0
    private val cooldownMs = 30_000L // 30秒冷却，避免重复拦截

    override fun onServiceConnected() {
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 100
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return
        val targetPackages = getTargetPackages()

        if (packageName in targetPackages) {
            val now = System.currentTimeMillis()
            // 冷却时间内同一个App不重复拦截
            if (packageName == lastInterceptedPackage && now - lastInterceptTime < cooldownMs) return

            lastInterceptedPackage = packageName
            lastInterceptTime = now

            // 启动拦截界面
            val intent = Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra("INTERCEPT_MODE", true)
                putExtra("SOURCE_PACKAGE", packageName)
            }
            startActivity(intent)
        }
    }

    private fun getTargetPackages(): Set<String> {
        val prefs = getSharedPreferences("NotYetPrefs", MODE_PRIVATE)
        val saved = prefs.getStringSet("targetPackages", null)
        return saved ?: defaultTargetPackages
    }

    override fun onInterrupt() {}
}
