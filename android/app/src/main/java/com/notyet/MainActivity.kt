package com.notyet

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "NotYet"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    // 关键：当 Activity 已在运行时（从后台被 AccessibilityService 唤起），
    // 新的 Intent 会走 onNewIntent 而非 onCreate。
    // 必须手动更新 intent，否则 RN 读到的还是旧 intent，SOURCE_PACKAGE 为空。
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }
}
