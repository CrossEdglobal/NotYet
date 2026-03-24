package com.notyet

import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.*

class AccessibilityModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AccessibilityModule"

    // 检查无障碍服务是否已开启
    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            promise.resolve(isServiceEnabled())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun setTargetPackages(packages: ReadableArray, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("NotYetPrefs", 0)
            val set = mutableSetOf<String>()
            for (i in 0 until packages.size()) {
                set.add(packages.getString(i) ?: continue)
            }
            prefs.edit().putStringSet("targetPackages", set).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun setTimeRange(enabled: Boolean, startH: Int, endH: Int, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("NotYetPrefs", 0)
            prefs.edit()
                .putBoolean("timeRangeEnabled", enabled)
                .putInt("timeRangeStart", startH)
                .putInt("timeRangeEnd", endH)
                .apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun getInterceptMode(promise: Promise) {
        try {
            val act = reactContext.currentActivity
            val interceptMode = act?.intent?.getBooleanExtra("INTERCEPT_MODE", false) ?: false
            val sourcePackage = act?.intent?.getStringExtra("SOURCE_PACKAGE") ?: ""
            // 读取后立刻清除，避免下次正常启动时仍触发拦截
            act?.intent?.removeExtra("INTERCEPT_MODE")
            act?.intent?.removeExtra("SOURCE_PACKAGE")
            val map = Arguments.createMap().apply {
                putBoolean("interceptMode", interceptMode)
                putString("sourcePackage", sourcePackage)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val launchIntent = pm.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(launchIntent)
                promise.resolve(true)
            } else {
                promise.reject("NOT_FOUND", "App not installed: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }

    // 同步暴露系统语言给 JS
    override fun getConstants(): Map<String, Any> {
        val locale = java.util.Locale.getDefault()
        return mapOf("systemLanguage" to locale.language)
    }

    @ReactMethod
    fun getSystemLanguage(promise: Promise) {
        try {
            val locale = java.util.Locale.getDefault()
            promise.resolve(locale.language)
        } catch (e: Exception) {
            promise.resolve("en")
        }
    }

    private fun isServiceEnabled(): Boolean {
        val serviceName = "${reactContext.packageName}/${NotYetAccessibilityService::class.java.canonicalName}"
        val enabledServices = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        val splitter = TextUtils.SimpleStringSplitter(':')
        splitter.setString(enabledServices)
        return splitter.any { it.equals(serviceName, ignoreCase = true) }
    }
}
