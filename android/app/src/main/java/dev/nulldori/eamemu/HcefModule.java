package dev.nulldori.eamemu;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.nfc.NfcAdapter;
import android.nfc.cardemulation.NfcFCardEmulation;
import android.nfc.tech.NfcA;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.Map;
import java.util.HashMap;

public class HcefModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static ReactApplicationContext reactContext;
    NfcAdapter nfcAdapter = null;
    NfcFCardEmulation nfcFCardEmulation = null;
    ComponentName componentName = null;
    Boolean isHceFEnabled = false;
    Boolean isHceFSupport = false;
    Boolean nowUsing = false;

    HcefModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        reactContext.addLifecycleEventListener(this);

        // HCE-F Feature Check
        PackageManager manager = reactContext.getPackageManager();
        if(!manager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION_NFCF)){
            return ;
        }
        isHceFSupport = true;

        nfcAdapter = NfcAdapter.getDefaultAdapter(getReactApplicationContext());
        if(nfcAdapter != null && nfcAdapter.isEnabled()){
            nfcFCardEmulation = NfcFCardEmulation.getInstance(nfcAdapter);
            componentName = new ComponentName("dev.nulldori.eamemu","dev.nulldori.eamemu.eAMEMuService");
            if(nfcFCardEmulation != null){
                nfcFCardEmulation.registerSystemCodeForService(componentName, "4000");
                isHceFEnabled = true;
            }
        }
    }

    @Override
    public String getName(){
        return "Hcef";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("support", isHceFSupport);
        constants.put("enabled", isHceFEnabled);
        return constants;
    }

    @ReactMethod
    void enableService(String sid, Promise promise){
        if(nfcFCardEmulation == null || componentName == null){
            promise.reject("NULL_ERROR", "nfcFCardEmulation or componentName is null");
            return ;
        }

        if (!nfcFCardEmulation.setNfcid2ForService(componentName, sid)) {
            promise.reject("SET_NFCID2_FAIL", "setNfcid2ForService returned false");
            return ;
        }

        if (!nfcFCardEmulation.enableService(getCurrentActivity(), componentName)) {
            promise.reject("FAIL", "enableService returned false");
        }

        nowUsing = true;
        promise.resolve(true);
    }

    @ReactMethod
    void disableService(Promise promise){
        if(nfcFCardEmulation == null || componentName == null) {
            promise.reject("NULL_ERROR", "nfcFCardEmulation or componentName is null");
        }

        if (!nfcFCardEmulation.disableService(getCurrentActivity())) {
            promise.reject("FAIL", "disableService returned false");
        }

        nowUsing = false;
        promise.resolve(true);
    }

    @Override
    public void onHostResume() {
        if (nfcFCardEmulation != null && componentName != null && nowUsing) {
            Log.d("MainActivity onResume()", "enabled!");
            nfcFCardEmulation.enableService(getCurrentActivity(), componentName);
        }
    }


    @Override
    public void onHostPause(){
        if(nfcFCardEmulation != null && componentName != null && nowUsing){
            Log.d("MainActivity onPause()", "disabled...");
            nfcFCardEmulation.disableService(getCurrentActivity());
        }
    }

    @Override
    public void onHostDestroy(){
    }
}
