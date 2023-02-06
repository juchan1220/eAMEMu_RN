package dev.nulldori.eamemu;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class CardConvModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static A converter;

    CardConvModule(ReactApplicationContext context){
        super(context);
        reactContext = context;
        converter = new A();
    }

    @Override
    public String getName(){ return "CardConv"; }

    @ReactMethod
    void convertSID(String sid, Promise promise){
        if(sid.length() != 16 || sid.startsWith("02FE") == false){
            promise.reject("SID_FORMAT_ERROR", "SID must be 16-digit hex string.");
        }

        String cardID = converter.toKonamiID(sid);

        promise.resolve(cardID);
    }
}
