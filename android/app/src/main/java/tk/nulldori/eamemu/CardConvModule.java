package tk.nulldori.eamemu;

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

import tk.nulldori.eamemu.A;

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
